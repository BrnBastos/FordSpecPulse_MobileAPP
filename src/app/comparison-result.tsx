import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ArrowLeft, CheckCircle2, TriangleAlert } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AppCard,
  Badge,
  EmptyState,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SectionTitle,
} from "../components/SpecPulseUI";
import { colors, spacing } from "../constants/specpulseTheme";
import { useComparisonStore } from "../store/comparisonStore";

export default function ComparisonResultScreen() {
  const { currentComparison } = useComparisonStore();

  async function saveResult() {
    if (!currentComparison) return;

    await AsyncStorage.setItem(
      "lastComparison",
      JSON.stringify(currentComparison)
    );

    router.push("/history");
  }

  if (!currentComparison) {
    return (
      <ScreenContainer>
        <BackButton />

        <EmptyState
          title="Nenhuma comparação encontrada"
          message="Volte para a tela Comparar e gere uma nova análise."
        />

        <View style={styles.footer}>
          <PrimaryButton
            label="Criar comparação"
            onPress={() => router.push("/compare")}
          />
        </View>
      </ScreenContainer>
    );
  }

  const data = currentComparison;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButton />

        <PageTitle
          eyebrow="Resultado"
          title="Comparação gerada"
          subtitle="Resumo executivo, vantagens, gaps e matriz simplificada de atributos."
        />

        <AppCard style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Confiança da análise</Text>
          <Text style={styles.scoreValue}>
            {Math.round(data.summary.confidence * 100)}%
          </Text>
          <Text style={styles.scoreText}>{data.summary.executiveSummary}</Text>
        </AppCard>

        <SectionTitle>Vantagens Ford</SectionTitle>

        <View style={styles.list}>
          {data.summary.keyAdvantages.map((item) => (
            <AppCard key={item} style={styles.insightCard}>
              <CheckCircle2 color={colors.success} size={22} />
              <Text style={styles.insightText}>{item}</Text>
            </AppCard>
          ))}
        </View>

        <SectionTitle>Gaps e riscos</SectionTitle>

        <View style={styles.list}>
          {data.summary.keyGaps.map((item) => (
            <AppCard key={item} style={styles.insightCard}>
              <TriangleAlert color={colors.warning} size={22} />
              <Text style={styles.insightText}>{item}</Text>
            </AppCard>
          ))}
        </View>

        <SectionTitle>Matriz de atributos</SectionTitle>

        <View style={styles.list}>
          {data.rows.map((row) => (
            <AppCard key={row.attributeId}>
              <View style={styles.rowHeader}>
                <Text style={styles.attributeName}>{row.attributeName}</Text>

                <Badge
                  label={labelForDifference(row.difference)}
                  tone={toneForDifference(row.difference)}
                />
              </View>

              <View style={styles.compareValues}>
                <View style={styles.valueBox}>
                  <Text style={styles.valueLabel}>Ford</Text>
                  <Text style={styles.value}>{row.fordValue}</Text>
                </View>

                <View style={styles.valueBox}>
                  <Text style={styles.valueLabel}>Concorrente</Text>
                  <Text style={styles.value}>{row.competitorValue}</Text>
                </View>
              </View>

              <Text style={styles.confidence}>
                Confiança: {row.confidenceLevel}
              </Text>
            </AppCard>
          ))}
        </View>

        {data.summary.validationWarnings.length ? (
          <>
            <SectionTitle>Alertas de validação</SectionTitle>

            {data.summary.validationWarnings.map((warning) => (
              <AppCard key={warning} style={styles.warningCard}>
                <Text style={styles.warningText}>{warning}</Text>
              </AppCard>
            ))}
          </>
        ) : null}

        <View style={styles.footer}>
          <PrimaryButton label="Salvar comparação local" onPress={saveResult} />
        </View>
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

function labelForDifference(difference: string) {
  if (difference === "advantage") return "Vantagem";
  if (difference === "risk") return "Risco";
  if (difference === "parity") return "Paridade";
  return "Validar";
}

function toneForDifference(difference: string) {
  if (difference === "advantage") return "green";
  if (difference === "risk") return "red";
  if (difference === "parity") return "blue";
  return "yellow";
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
  scoreCard: {
    backgroundColor: colors.navy,
  },
  scoreLabel: {
    color: "#D8E7FF",
    fontWeight: "800",
  },
  scoreValue: {
    color: colors.white,
    fontSize: 44,
    fontWeight: "900",
    marginTop: 4,
  },
  scoreText: {
    color: "#D8E7FF",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  insightCard: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  insightText: {
    color: colors.graphite,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  attributeName: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900",
    flex: 1,
  },
  compareValues: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  valueBox: {
    flex: 1,
    backgroundColor: colors.paleBlue,
    borderRadius: 14,
    padding: spacing.sm,
  },
  valueLabel: {
    color: colors.gray,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  value: {
    color: colors.graphite,
    fontSize: 15,
    fontWeight: "900",
  },
  confidence: {
    color: colors.gray,
    fontSize: 13,
    marginTop: spacing.md,
    textTransform: "capitalize",
  },
  warningCard: {
    backgroundColor: "#FFF7E6",
    borderColor: "#FED7AA",
  },
  warningText: {
    color: "#92400E",
    lineHeight: 20,
    fontWeight: "700",
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});