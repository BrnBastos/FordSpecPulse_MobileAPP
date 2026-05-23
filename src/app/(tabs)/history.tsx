import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import {
    AppCard,
    EmptyState,
    PageTitle,
    ScreenContainer,
    SectionTitle,
} from "../../components/SpecPulseUI";
import { colors, spacing } from "../../constants/specpulseTheme";
import { ComparisonResult } from "../../services/specpulseApi";

export default function HistoryScreen() {
  const [lastComparison, setLastComparison] = useState<ComparisonResult | null>(
    null
  );

  async function loadHistory() {
    const raw = await AsyncStorage.getItem("lastComparison");
    setLastComparison(raw ? JSON.parse(raw) : null);
  }

  async function clearHistory() {
    await AsyncStorage.removeItem("lastComparison");
    setLastComparison(null);
  }

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle
          eyebrow="Histórico"
          title="Análises salvas"
          subtitle="Histórico local simples para demonstrar armazenamento no dispositivo."
        />

        {!lastComparison ? (
          <EmptyState
            title="Nenhuma comparação salva"
            message="Gere uma comparação e toque em salvar para ela aparecer aqui."
          />
        ) : (
          <>
            <SectionTitle>Última comparação</SectionTitle>

            <AppCard>
              <Text style={styles.title}>Comparação #{lastComparison.id}</Text>
              <Text style={styles.summary}>
                {lastComparison.summary.executiveSummary}
              </Text>

              <Text style={styles.confidence}>
                Confiança: {Math.round(lastComparison.summary.confidence * 100)}%
              </Text>

              <Pressable onPress={clearHistory} style={styles.clearButton}>
                <Trash2 color={colors.danger} size={18} />
                <Text style={styles.clearText}>Limpar histórico local</Text>
              </Pressable>
            </AppCard>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  summary: {
    color: colors.graphite,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  confidence: {
    color: colors.fordBlue,
    fontWeight: "900",
    marginTop: spacing.md,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.lg,
  },
  clearText: {
    color: colors.danger,
    fontWeight: "800",
  },
});