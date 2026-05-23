import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
    ArrowLeft,
    Car,
    ChevronRight,
    Fuel,
    Gauge
} from "lucide-react-native";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
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
    getVehicleById,
    getVehicleVersions,
    VehicleVersion,
} from "../../services/specpulseApi";
import { useComparisonStore } from "../../store/comparisonStore";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicleId = String(id);

  const { setFordVersionId, setCompetitorVersionId } = useComparisonStore();

  const {
    data: vehicle,
    isLoading: loadingVehicle,
  } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId,
  });

  const {
    data: versions,
    isLoading: loadingVersions,
  } = useQuery({
    queryKey: ["vehicle-versions", vehicleId],
    queryFn: () => getVehicleVersions(vehicleId),
    enabled: !!vehicleId,
  });

  const isLoading = loadingVehicle || loadingVersions;
  const isFord = vehicle?.brandName?.toLowerCase() === "ford";

  function useVersionForCompare(version: VehicleVersion) {
    if (isFord) {
      setFordVersionId(version.id);
    } else {
      setCompetitorVersionId(version.id);
    }

    router.push("/compare");
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando detalhes do veículo..." />
      </ScreenContainer>
    );
  }

  if (!vehicle) {
    return (
      <ScreenContainer>
        <BackButton />
        <EmptyState
          title="Veículo não encontrado"
          message="A API não retornou dados para este veículo."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButton />

        <PageTitle
          eyebrow="Vehicle Detail"
          title={`${vehicle.brandName ?? vehicle.brandId} ${vehicle.model}`}
          subtitle="Veja as versões disponíveis e escolha uma para analisar ou usar na comparação."
        />

        <AppCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.iconBox}>
              <Car color={colors.white} size={28} />
            </View>

            <Badge
              label={isFord ? "Veículo Ford" : "Concorrente"}
              tone={isFord ? "blue" : "neutral"}
            />
          </View>

          <Text style={styles.heroTitle}>{vehicle.model}</Text>

          <View style={styles.metaGrid}>
            <MetaItem label="Marca" value={vehicle.brandName ?? vehicle.brandId} />
            <MetaItem label="Mercado" value={vehicle.market} />
            <MetaItem label="Ano" value={String(vehicle.year)} />
            <MetaItem label="Segmento" value={formatSegment(vehicle.segment)} />
          </View>
        </AppCard>

        <SectionTitle>Versões disponíveis</SectionTitle>

        {!versions?.length ? (
          <EmptyState
            title="Nenhuma versão encontrada"
            message="Este veículo ainda não possui versões cadastradas na API."
          />
        ) : (
          <View style={styles.versionList}>
            {versions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                isFord={isFord}
                onOpen={() => router.push(`/version/${version.id}` as never)}
                onUseForCompare={() => useVersionForCompare(version)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function BackButton() {
  return (
    <Pressable onPress={() => router.back()} style={styles.backButton}>
      <ArrowLeft color={colors.fordBlue} size={20} />
      <Text style={styles.backText}>Voltar</Text>
    </Pressable>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function VersionCard({
  version,
  isFord,
  onOpen,
  onUseForCompare,
}: {
  version: VehicleVersion;
  isFord: boolean;
  onOpen: () => void;
  onUseForCompare: () => void;
}) {
  const completeness = Math.round(version.dataCompleteness * 100);

  return (
    <AppCard>
      <Pressable onPress={onOpen}>
        <View style={styles.versionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.versionName}>{version.name}</Text>

            <View style={styles.versionMetaRow}>
              <View style={styles.versionMetaItem}>
                <Fuel color={colors.gray} size={15} />
                <Text style={styles.versionMetaText}>{version.powertrain}</Text>
              </View>

              <View style={styles.versionMetaItem}>
                <Gauge color={colors.gray} size={15} />
                <Text style={styles.versionMetaText}>{version.drivetrain}</Text>
              </View>
            </View>
          </View>

          <ChevronRight color={colors.gray} size={22} />
        </View>

        <View style={styles.badgeRow}>
          <Badge
            label={`${completeness}% completo`}
            tone={completeness >= 90 ? "green" : completeness >= 75 ? "yellow" : "red"}
          />
          <Badge label={formatVersionLevel(version.versionLevel)} tone="neutral" />
        </View>
      </Pressable>

      <View style={styles.cardActions}>
        <PrimaryButton
          label={isFord ? "Usar como Ford" : "Usar como concorrente"}
          onPress={onUseForCompare}
        />
      </View>
    </AppCard>
  );
}

function formatSegment(segment: string) {
  return segment.replaceAll("_", " ");
}

function formatVersionLevel(level: string) {
  if (level === "top") return "Topo";
  if (level === "mid") return "Intermediária";
  if (level === "entry") return "Entrada";
  if (level === "performance") return "Performance";
  return "Versão";
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.fordBlue,
    fontWeight: "800",
  },
  heroCard: {
    backgroundColor: colors.navy,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.fordBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metaItem: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: spacing.sm,
  },
  metaLabel: {
    color: "#BFD5F6",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  metaValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  versionList: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  versionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionName: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  versionMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  versionMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  versionMetaText: {
    color: colors.gray,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cardActions: {
    marginTop: spacing.md,
  },
});