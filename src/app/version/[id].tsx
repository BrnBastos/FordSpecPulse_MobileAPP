import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
    ArrowLeft,
    CheckCircle2,
    CircleHelp,
    ShieldAlert,
    TriangleAlert,
    XCircle
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
    getVersionById,
    getVersionSpecifications,
    SpecValue,
} from "../../services/specpulseApi";
import { useComparisonStore } from "../../store/comparisonStore";

export default function VersionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const versionId = String(id);

  const { setFordVersionId, setCompetitorVersionId } = useComparisonStore();

  const {
    data: version,
    isLoading: loadingVersion,
  } = useQuery({
    queryKey: ["version", versionId],
    queryFn: () => getVersionById(versionId),
    enabled: !!versionId,
  });

  const {
    data: specs,
    isLoading: loadingSpecs,
  } = useQuery({
    queryKey: ["version-specifications", versionId],
    queryFn: () => getVersionSpecifications(versionId),
    enabled: !!versionId,
  });

  const isLoading = loadingVersion || loadingSpecs;

  const groupedSpecs = groupSpecsByCategory(specs ?? []);

  const averageConfidence = specs?.length
    ? Math.round(
        (specs.reduce((sum, item) => sum + item.confidence, 0) / specs.length) *
          100
      )
    : 0;

  const completeness = version
    ? Math.round(version.dataCompleteness * 100)
    : 0;

  function useAsFord() {
    setFordVersionId(versionId);
    router.push("/compare");
  }

  function useAsCompetitor() {
    setCompetitorVersionId(versionId);
    router.push("/compare");
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando ficha técnica..." />
      </ScreenContainer>
    );
  }

  if (!version) {
    return (
      <ScreenContainer>
        <BackButton />
        <EmptyState
          title="Versão não encontrada"
          message="A API não retornou dados para esta versão."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButton />

        <PageTitle
          eyebrow="Version Detail"
          title={version.name}
          subtitle="Ficha técnica normalizada com status, confiança e fonte dos dados."
        />

        <AppCard style={styles.heroCard}>
          <Text style={styles.heroSmall}>Versão analisada</Text>
          <Text style={styles.heroTitle}>{version.name}</Text>

          <View style={styles.heroMetaRow}>
            <Badge label={version.powertrain} tone="blue" />
            <Badge label={version.drivetrain} tone="neutral" />
            <Badge label={formatVersionLevel(version.versionLevel)} tone="neutral" />
          </View>

          <View style={styles.scoreRow}>
            <ScoreBox label="Completude" value={`${completeness}%`} />
            <ScoreBox label="Confiança média" value={`${averageConfidence}%`} />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <PrimaryButton label="Usar como Ford" onPress={useAsFord} />
          <Pressable onPress={useAsCompetitor} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Usar como concorrente</Text>
          </Pressable>
        </View>

        <SectionTitle>Status dos dados</SectionTitle>

        <AppCard>
          <View style={styles.legendGrid}>
            <LegendItem color={colors.success} label="Encontrado" />
            <LegendItem color={colors.gray} label="Não disponível" />
            <LegendItem color={colors.warning} label="Não informado" />
            <LegendItem color={colors.danger} label="Conflito" />
          </View>

          <Text style={styles.noteText}>
            Importante: “não informado” não significa ausência confirmada. Significa
            que a fonte ainda não comprova presença nem ausência.
          </Text>
        </AppCard>

        <SectionTitle>Especificações</SectionTitle>

        {!specs?.length ? (
          <EmptyState
            title="Sem especificações"
            message="Esta versão ainda não possui atributos técnicos retornados pela API."
          />
        ) : (
          Object.entries(groupedSpecs).map(([category, items]) => (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{formatCategory(category)}</Text>

              <View style={styles.specList}>
                {items.map((spec) => (
                  <SpecCard
                    key={`${spec.versionId}-${spec.attributeId}`}
                    spec={spec}
                  />
                ))}
              </View>
            </View>
          ))
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

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function SpecCard({ spec }: { spec: SpecValue }) {
  const status = getStatusInfo(spec.status);

  return (
    <AppCard>
      <View style={styles.specHeader}>
        <View style={styles.statusIconBox}>{status.icon}</View>

        <View style={{ flex: 1 }}>
          <Text style={styles.specName}>
            {spec.attributeName ?? spec.attributeId}
          </Text>
          <Text style={styles.specSource}>
            {spec.sourceLabel ?? "Fonte não informada"}
          </Text>
        </View>

        <Badge label={status.label} tone={status.tone} />
      </View>

      <View style={styles.specValueBox}>
        <Text style={styles.valueLabel}>Valor normalizado</Text>
        <Text style={styles.valueText}>{formatSpecValue(spec)}</Text>
      </View>

      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceText}>
          Confiança: {Math.round(spec.confidence * 100)}%
        </Text>

        <Badge
          label={spec.confidenceLevel}
          tone={spec.confidenceLevel === "high" ? "green" : "yellow"}
        />
      </View>
    </AppCard>
  );
}

function getStatusInfo(status: SpecValue["status"]) {
  if (status === "found") {
    return {
      label: "Encontrado",
      tone: "green" as const,
      icon: <CheckCircle2 color={colors.success} size={22} />,
    };
  }

  if (status === "not_available") {
    return {
      label: "Não disponível",
      tone: "neutral" as const,
      icon: <XCircle color={colors.gray} size={22} />,
    };
  }

  if (status === "not_informed") {
    return {
      label: "Não informado",
      tone: "yellow" as const,
      icon: <CircleHelp color={colors.warning} size={22} />,
    };
  }

  if (status === "conflict") {
    return {
      label: "Conflito",
      tone: "red" as const,
      icon: <ShieldAlert color={colors.danger} size={22} />,
    };
  }

  return {
    label: "Validação pendente",
    tone: "blue" as const,
    icon: <TriangleAlert color={colors.fordBlue} size={22} />,
  };
}

function groupSpecsByCategory(specs: SpecValue[]) {
  return specs.reduce<Record<string, SpecValue[]>>((acc, spec) => {
    const category = inferCategory(spec.attributeId);

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(spec);
    return acc;
  }, {});
}

function inferCategory(attributeId: string) {
  if (attributeId.includes("torque")) return "engine_transmission";
  if (attributeId.includes("camera")) return "digital_cockpit";
  if (attributeId.includes("cruise")) return "adas";
  if (attributeId.includes("blis")) return "safety";
  return "others";
}

function formatCategory(category: string) {
  const labels: Record<string, string> = {
    engine_transmission: "Motor e transmissão",
    digital_cockpit: "Cockpit digital",
    adas: "ADAS",
    safety: "Segurança",
    connectivity: "Conectividade",
    comfort: "Conforto",
    others: "Outros",
  };

  return labels[category] ?? category;
}

function formatVersionLevel(level: string) {
  if (level === "top") return "Topo";
  if (level === "mid") return "Intermediária";
  if (level === "entry") return "Entrada";
  if (level === "performance") return "Performance";
  return "Versão";
}

function formatSpecValue(spec: SpecValue) {
  if (spec.value === null || spec.value === undefined) return "Não informado";
  if (typeof spec.value === "boolean") return spec.value ? "Sim" : "Não";
  return `${spec.value}${spec.unit ? ` ${spec.unit}` : ""}`;
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
  heroSmall: {
    color: "#BFD5F6",
    fontWeight: "800",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  scoreRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: spacing.md,
  },
  scoreLabel: {
    color: "#BFD5F6",
    fontSize: 12,
    fontWeight: "800",
  },
  scoreValue: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryAction: {
    backgroundColor: colors.lightBlue,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryActionText: {
    color: colors.fordBlue,
    fontWeight: "900",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  legendItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    color: colors.graphite,
    fontWeight: "700",
    fontSize: 13,
  },
  noteText: {
    color: colors.gray,
    lineHeight: 20,
    marginTop: spacing.md,
    fontSize: 13,
  },
  categoryBlock: {
    marginBottom: spacing.md,
  },
  categoryTitle: {
    color: colors.fordBlue,
    fontWeight: "900",
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  specList: {
    gap: spacing.sm,
  },
  specHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  specName: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "900",
  },
  specSource: {
    color: colors.gray,
    fontSize: 12,
    marginTop: 3,
  },
  specValueBox: {
    backgroundColor: colors.paleBlue,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  valueLabel: {
    color: colors.gray,
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 4,
  },
  valueText: {
    color: colors.graphite,
    fontSize: 18,
    fontWeight: "900",
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  confidenceText: {
    color: colors.gray,
    fontWeight: "700",
  },
});