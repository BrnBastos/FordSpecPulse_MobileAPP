import { categoryLabel } from "../components/Selection";
import { statusLabel } from "../services/specifications";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { saveAnalysis } from "../services/history";
import { errorMessage } from "../services/errors";
import { router } from "expo-router";
import { ArrowLeft, CheckCircle2, TriangleAlert } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AppCard,
  Badge,
  EmptyState,
  ErrorState,
  SecondaryButton,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SectionTitle,
} from "../components/SpecPulseUI";
import { colors, spacing } from "../constants/specpulseTheme";
import { useComparisonStore } from "../store/comparisonStore";

export default function ComparisonResultScreen() {
  const { currentComparison } = useComparisonStore();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const save = useMutation({
    mutationFn: saveAnalysis,
    onSuccess: () => router.push("/history"),
  });

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
          subtitle={`${data.fordLabel ?? "Ford"} × ${data.competitorLabel ?? "Concorrente"}`}
        />

        <AppCard style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Resumo da análise</Text>
          <Text style={styles.scoreText}>{data.summary.executiveSummary}</Text>
        </AppCard>

        <Text style={{ marginTop: 12 }}>
          Consultado em{" "}
          {data.createdAt
            ? new Date(data.createdAt).toLocaleString("pt-BR")
            : "data não informada"}
          . Resultado salvo sem atualização automática.
        </Text>
        {!!data.summary.keyAdvantages.length && (
          <SectionTitle>Vantagens apontadas pelo serviço</SectionTitle>
        )}

        <View style={styles.list}>
          {data.summary.keyAdvantages.map((item) => (
            <AppCard key={item} style={styles.insightCard}>
              <CheckCircle2 color={colors.success} size={22} />
              <Text style={styles.insightText}>{item}</Text>
            </AppCard>
          ))}
        </View>

        {!!data.summary.keyGaps.length && (
          <SectionTitle>Pontos de atenção</SectionTitle>
        )}

        <View style={styles.list}>
          {data.summary.keyGaps.map((item) => (
            <AppCard key={item} style={styles.insightCard}>
              <TriangleAlert color={colors.warning} size={22} />
              <Text style={styles.insightText}>{item}</Text>
            </AppCard>
          ))}
        </View>

        <SectionTitle>Matriz de atributos</SectionTitle>

        <SecondaryButton
          label={
            differencesOnly
              ? "Mostrar todos os atributos"
              : "Somente diferenças"
          }
          onPress={() => setDifferencesOnly(!differencesOnly)}
        />
        <View style={styles.list}>
          {data.rows
            .filter((row) => !differencesOnly || row.difference !== "parity")
            .map((row) => (
              <AppCard key={row.attributeId}>
                <Text style={{ marginBottom: 8 }}>
                  {categoryLabel(row.category ?? "others")}
                </Text>
                <View style={styles.rowHeader}>
                  <Text style={styles.attributeName}>{row.attributeName}</Text>

                  <Badge
                    label={labelForDifference(row.difference)}
                    tone={toneForDifference(row.difference)}
                  />
                </View>

                <View style={styles.compareValues}>
                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>
                      {data.fordLabel ?? "Ford"}
                    </Text>
                    <Text style={styles.value}>{row.fordValue}</Text>
                    <Text>
                      {row.fordSpec
                        ? statusLabel[row.fordSpec.status]
                        : "Estado não informado"}
                    </Text>
                  </View>

                  <View style={styles.valueBox}>
                    <Text style={styles.valueLabel}>
                      {data.competitorLabel ?? "Concorrente"}
                    </Text>
                    <Text style={styles.value}>{row.competitorValue}</Text>
                    <Text>
                      {row.competitorSpec
                        ? statusLabel[row.competitorSpec.status]
                        : "Estado não informado"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    expanded: expanded.includes(row.attributeId),
                  }}
                  style={{ minHeight: 48, justifyContent: "center" }}
                  onPress={() =>
                    setExpanded(
                      expanded.includes(row.attributeId)
                        ? expanded.filter((id) => id !== row.attributeId)
                        : [...expanded, row.attributeId],
                    )
                  }
                >
                  <Text>Fontes e observações</Text>
                </Pressable>
                {expanded.includes(row.attributeId) && (
                  <Text>
                    Ford: {row.fordSpec?.sourceLabel ?? "fonte não informada"}
                    {"\n"}
                    {row.fordSpec?.sourceUrl}
                    {"\n"}Coleta: {row.fordSpec?.collectedAt ?? "não informada"}
                    {"\n"}
                    {row.fordSpec?.notes}
                    {"\n"}Concorrente:{" "}
                    {row.competitorSpec?.sourceLabel ?? "fonte não informada"}
                    {"\n"}
                    {row.competitorSpec?.sourceUrl}
                    {"\n"}Coleta:{" "}
                    {row.competitorSpec?.collectedAt ?? "não informada"}
                    {"\n"}
                    {row.competitorSpec?.notes}
                  </Text>
                )}
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
          {save.error && <ErrorState message={errorMessage(save.error)} />}
          <PrimaryButton
            label={save.isPending ? "Salvando..." : "Salvar análise"}
            disabled={save.isPending}
            onPress={() => save.mutate(data)}
          />
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
    fontWeight: "600",
  },
  scoreCard: {
    backgroundColor: colors.navy,
  },
  scoreLabel: {
    color: "#D8E7FF",
    fontWeight: "600",
  },
  scoreValue: {
    color: colors.white,
    fontSize: 44,
    fontWeight: "600",
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
    fontWeight: "600",
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
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    color: colors.graphite,
    fontSize: 15,
    fontWeight: "600",
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
