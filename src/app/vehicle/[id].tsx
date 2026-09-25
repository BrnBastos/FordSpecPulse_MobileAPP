import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight, Fuel, Gauge } from "lucide-react-native";
import {
  Image,
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
  ErrorState,
  LoadingState,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SectionTitle,
} from "../../components/SpecPulseUI";
import { segmentLabel, powertrainLabel } from "../../components/Selection";
import { colors, spacing } from "../../constants/specpulseTheme";
import {
  getVehicleById,
  getVehicleVersions,
  VehicleVersion,
} from "../../services/specpulseApi";
import { errorMessage } from "../../services/errors";
import { useComparisonStore } from "../../store/comparisonStore";
import { BrandLogo } from "../../components/AutomotiveImages";
import { getVehiclePhoto } from "../../constants/automotiveAssets";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicleId = String(id);

  const { setFordVersionId, setCompetitorVersionId } = useComparisonStore();

  const {
    data: vehicle,
    isLoading: loadingVehicle,
    error: vehicleError,
    refetch: refetchVehicle,
  } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId,
  });

  const {
    data: versions,
    isLoading: loadingVersions,
    error: versionsError,
    refetch: refetchVersions,
  } = useQuery({
    queryKey: ["versions", vehicleId],
    queryFn: () => getVehicleVersions(vehicleId),
    enabled: !!vehicleId,
  });

  const isLoading = loadingVehicle || loadingVersions;
  const isFord = vehicle?.brandName?.toLowerCase() === "ford";

  function selectVersionForCompare(version: VehicleVersion) {
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

  if (vehicleError || versionsError)
    return (
      <ScreenContainer>
        <BackButton />
        <ErrorState
          message={errorMessage(vehicleError ?? versionsError)}
          onRetry={() => {
            void refetchVehicle();
            void refetchVersions();
          }}
        />
      </ScreenContainer>
    );

  if (!vehicle) {
    return (
      <ScreenContainer>
        <BackButton />
        <EmptyState
          title="Veículo não encontrado"
          message="Não há dados para este veículo."
        />
      </ScreenContainer>
    );
  }

  const photo = getVehiclePhoto(vehicle);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButton />

        <PageTitle
          eyebrow="Veículo"
          title={`${vehicle.brandName ?? vehicle.brandId} ${vehicle.model}`}
          subtitle={`${vehicle.year} • ${vehicle.market} • ${segmentLabel(vehicle.segment)}`}
        />

        <AppCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <BrandLogo name={vehicle.brandName ?? vehicle.brandId} />

            <Badge
              label={isFord ? "Veículo Ford" : "Concorrente"}
              tone={isFord ? "blue" : "neutral"}
            />
          </View>

          {photo ? (
            <>
              <View
                style={[
                  styles.vehiclePhoto,
                  {
                    aspectRatio: photo.aspectRatio,
                    maxWidth: 240 * photo.aspectRatio,
                  },
                ]}
              >
                <Image
                  source={photo.source}
                  resizeMode="contain"
                  style={{ width: "100%", height: "100%" }}
                  accessibilityLabel={`Ford ${vehicle.model}, imagem ilustrativa`}
                />
              </View>
              <Text style={styles.photoCredit}>
                {photo.credit} · Imagem ilustrativa
              </Text>
            </>
          ) : (
            <Text style={styles.heroTitle}>{vehicle.model}</Text>
          )}
        </AppCard>

        <SectionTitle>Versões disponíveis</SectionTitle>

        {!versions?.length ? (
          <EmptyState
            title="Nenhuma versão encontrada"
            message="Este veículo ainda não possui versões cadastradas."
          />
        ) : (
          <View style={styles.versionList}>
            {versions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                isFord={isFord}
                onOpen={() =>
                  router.push({
                    pathname: "/version/[id]",
                    params: { id: version.id },
                  })
                }
                onUseForCompare={() => selectVersionForCompare(version)}
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
  return (
    <AppCard>
      <Pressable onPress={onOpen}>
        <View style={styles.versionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.versionName}>{version.name}</Text>

            <View style={styles.versionMetaRow}>
              <View style={styles.versionMetaItem}>
                <Fuel color={colors.gray} size={15} />
                <Text style={styles.versionMetaText}>
                  {powertrainLabel(version.powertrain ?? "Não informado")}
                </Text>
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
            label={formatVersionLevel(version.versionLevel)}
            tone="neutral"
          />
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
    fontWeight: "600",
  },
  heroCard: {
    backgroundColor: colors.navy,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehiclePhoto: {
    width: "100%",
    maxHeight: 240,
    alignSelf: "center",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  photoCredit: { color: "#BFD5F6", fontSize: 11, marginTop: 8 },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "600",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
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
    fontWeight: "600",
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
