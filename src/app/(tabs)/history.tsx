import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AppCard,
  ErrorState,
  LoadingState,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from "../../components/SpecPulseUI";
import { colors, spacing } from "../../constants/specpulseTheme";
import {
  clearHistory,
  deleteAnalysis,
  readHistory,
} from "../../services/history";
import { errorMessage } from "../../services/errors";
import { useComparisonStore } from "../../store/comparisonStore";
export default function HistoryScreen() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["history"], queryFn: readHistory });
  useFocusEffect(
    useCallback(() => {
      void client.invalidateQueries({ queryKey: ["history"] });
    }, [client]),
  );
  const mutation = useMutation({
    mutationFn: (id: string | null) =>
      id ? deleteAnalysis(id) : clearHistory(),
    onSuccess: () => client.invalidateQueries({ queryKey: ["history"] }),
  });
  return (
    <ScreenContainer bottomSafeArea={false}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
        <PageTitle
          title="Análises salvas"
          subtitle="Resultados guardados nesta conta e neste dispositivo."
        />
        {query.isLoading && <LoadingState />}
        {(query.error || mutation.error) && (
          <ErrorState
            message={errorMessage(query.error ?? mutation.error)}
            onRetry={() => {
              void query.refetch();
            }}
          />
        )}
        {!query.isLoading && !query.error && !query.data?.length && (
          <AppCard style={styles.emptyCard}>
            <Image
              source={require("../../../assets/images/history-empty-generated-v1.jpg")}
              style={styles.emptyImage}
              resizeMode="contain"
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={styles.emptyTitle}>Sua primeira comparação</Text>
            <Text style={styles.emptyDescription}>
              Compare versões e salve o resultado aqui.
            </Text>
            <PrimaryButton
              label="Comparar versões"
              onPress={() => router.push("/compare")}
            />
          </AppCard>
        )}
        {query.data?.map((item) => (
          <AppCard key={item.id}>
            <Text style={{ fontSize: 17, fontWeight: "600" }}>
              {item.result.fordLabel} × {item.result.competitorLabel}
            </Text>
            <Text style={{ marginVertical: 12 }}>
              Salva em {new Date(item.savedAt).toLocaleString("pt-BR")}
            </Text>
            <Text>{item.result.summary.executiveSummary}</Text>
            <View style={{ gap: 8, marginTop: 12 }}>
              <SecondaryButton
                label="Abrir análise"
                onPress={() => {
                  useComparisonStore
                    .getState()
                    .setCurrentComparison(item.result);
                  router.push("/comparison-result");
                }}
              />
              <SecondaryButton
                label="Excluir análise"
                onPress={() => {
                  if (!mutation.isPending) mutation.mutate(item.id);
                }}
              />
            </View>
          </AppCard>
        ))}
        {!!(query.data?.length || query.error) && (
          <SecondaryButton
            label="Limpar histórico desta conta"
            onPress={() =>
              Alert.alert(
                "Limpar histórico?",
                "As análises salvas nesta conta serão excluídas deste dispositivo.",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => mutation.mutate(null),
                  },
                ],
              )
            }
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    gap: spacing.md,
  },
  emptyImage: {
    alignSelf: "center",
    width: 180,
    height: 120,
  },
  emptyTitle: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.gray,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
