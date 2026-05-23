import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AppCard,
  Badge,
  EmptyState,
  LoadingState,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SectionTitle,
} from "../../components/SpecPulseUI";
import { colors, spacing } from "../../constants/specpulseTheme";
import {
  createComparison,
  getAttributes,
  getVehicles,
  getVehicleVersions,
  TechnicalAttribute,
  VehicleVersion,
} from "../../services/specpulseApi";
import { useComparisonStore } from "../../store/comparisonStore";

export default function CompareScreen() {
  const {
    fordVersionId,
    competitorVersionId,
    selectedAttributeIds,
    setFordVersionId,
    setCompetitorVersionId,
    toggleAttribute,
    setCurrentComparison,
} = useComparisonStore();

  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const fordVehicle = vehicles?.find((item) => item.brandName === "Ford");
  const competitorVehicle = vehicles?.find((item) => item.brandName !== "Ford");

  const { data: fordVersions } = useQuery({
    queryKey: ["versions", fordVehicle?.id],
    queryFn: () => getVehicleVersions(fordVehicle!.id),
    enabled: !!fordVehicle?.id,
  });

  const { data: competitorVersions } = useQuery({
    queryKey: ["versions", competitorVehicle?.id],
    queryFn: () => getVehicleVersions(competitorVehicle!.id),
    enabled: !!competitorVehicle?.id,
  });

  const { data: attributes, isLoading: loadingAttributes } = useQuery({
    queryKey: ["attributes"],
    queryFn: getAttributes,
  });

  const mutation = useMutation({
    mutationFn: createComparison,
    onSuccess: (comparison) => {
      setCurrentComparison(comparison);
      router.push("/comparison-result");
    },
  });

  const canCompare =
    !!fordVersionId && !!competitorVersionId && selectedAttributeIds.length > 0;

  if (loadingVehicles || loadingAttributes) {
    return (
      <ScreenContainer>
        <LoadingState label="Preparando comparação..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle
          eyebrow="Compare Builder"
          title="Nova comparação"
          subtitle="Escolha uma versão Ford, um concorrente e os atributos que serão analisados."
        />
        <AppCard style={styles.imageCard}>
            <Image
                source={require("../../../assets/images/comparison-illustration.png")}
                style={styles.compareImage}
                resizeMode="contain"
            />
            <Text style={styles.imageCardTitle}>Monte uma comparação estratégica</Text>
            <Text style={styles.imageCardText}>
                Escolha a versão Ford, selecione um concorrente e defina os atributos que importam para a análise.
            </Text>
        </AppCard>

        <SectionTitle>1. Versão Ford</SectionTitle>
        <VersionPicker
          versions={fordVersions ?? []}
          selectedId={fordVersionId}
          onSelect={setFordVersionId}
        />

        <SectionTitle>2. Concorrente</SectionTitle>
        <VersionPicker
          versions={competitorVersions ?? []}
          selectedId={competitorVersionId}
          onSelect={setCompetitorVersionId}
        />

        <SectionTitle>3. Atributos técnicos</SectionTitle>
        {attributes?.length ? (
          <View style={styles.attributeGrid}>
            {attributes.map((attribute) => (
              <AttributeChip
                key={attribute.id}
                attribute={attribute}
                active={selectedAttributeIds.includes(attribute.id)}
                onPress={() => toggleAttribute(attribute.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="Nenhum atributo disponível"
            message="A API ainda não retornou a taxonomia de atributos."
          />
        )}

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo da seleção</Text>
          <Text style={styles.summaryText}>
            Ford: {fordVersionId ? "selecionado" : "pendente"}
          </Text>
          <Text style={styles.summaryText}>
            Concorrente: {competitorVersionId ? "selecionado" : "pendente"}
          </Text>
          <Text style={styles.summaryText}>
            Atributos: {selectedAttributeIds.length}
          </Text>
        </AppCard>

        <View style={styles.footer}>
          <PrimaryButton
            label={mutation.isPending ? "Gerando análise..." : "Gerar comparação"}
            disabled={!canCompare || mutation.isPending}
            onPress={() =>
              mutation.mutate({
                referenceVersionId: fordVersionId!,
                competitorVersionIds: [competitorVersionId!],
                attributeIds: selectedAttributeIds,
                customerProfileId: "urban_premium",
              })
            }
          />

          {!canCompare ? (
            <Text style={styles.validationText}>
              Selecione uma versão Ford, uma concorrente e pelo menos um atributo.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function VersionPicker({
  versions,
  selectedId,
  onSelect,
}: {
  versions: VehicleVersion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!versions.length) {
    return (
      <EmptyState
        title="Sem versões"
        message="Nenhuma versão foi encontrada para este veículo."
      />
    );
  }

  return (
    <View style={styles.list}>
      {versions.map((version) => {
        const active = selectedId === version.id;

        return (
          <Pressable key={version.id} onPress={() => onSelect(version.id)}>
            <AppCard style={[styles.versionCard, active && styles.activeCard]}>
              <View style={styles.versionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.versionName}>{version.name}</Text>
                  <Text style={styles.versionMeta}>
                    {version.powertrain} • {version.drivetrain} • {version.versionLevel}
                  </Text>
                </View>

                {active ? <CheckCircle2 color={colors.fordBlue} size={24} /> : null}
              </View>

              <Badge
                label={`${Math.round(version.dataCompleteness * 100)}% completo`}
                tone={version.dataCompleteness > 0.9 ? "green" : "yellow"}
              />
            </AppCard>
          </Pressable>
        );
      })}
    </View>
  );
}

function AttributeChip({
  attribute,
  active,
  onPress,
}: {
  attribute: TechnicalAttribute;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.attributeChip, active && styles.attributeChipActive]}
    >
      <Text style={[styles.attributeText, active && styles.attributeTextActive]}>
        {attribute.canonicalName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    imageCard: {
  marginBottom: spacing.md,
},

compareImage: {
  width: "100%",
  height: 250,
  marginBottom: spacing.sm,
},

imageCardTitle: {
  color: colors.navy,
  fontSize: 17,
  fontWeight: "900",
},

imageCardText: {
  color: colors.gray,
  fontSize: 14,
  lineHeight: 20,
  marginTop: 6,
},
  list: {
    gap: spacing.sm,
  },
  versionCard: {
    borderColor: "#E7ECF3",
  },
  activeCard: {
    borderColor: colors.fordBlue,
    backgroundColor: colors.lightBlue,
  },
  versionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  versionName: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  versionMeta: {
    color: colors.gray,
    fontSize: 13,
    marginTop: 4,
    textTransform: "capitalize",
  },
  attributeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  attributeChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E7ECF3",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  attributeChipActive: {
    backgroundColor: colors.fordBlue,
    borderColor: colors.fordBlue,
  },
  attributeText: {
    color: colors.graphite,
    fontWeight: "800",
  },
  attributeTextActive: {
    color: colors.white,
  },
  summaryCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.paleBlue,
  },
  summaryTitle: {
    color: colors.navy,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
  },
  summaryText: {
    color: colors.graphite,
    fontWeight: "700",
    marginTop: 4,
  },
  footer: {
    marginTop: spacing.lg,
    paddingBottom: 40,
  },
  validationText: {
    color: colors.gray,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});