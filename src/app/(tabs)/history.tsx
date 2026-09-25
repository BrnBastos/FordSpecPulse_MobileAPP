import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import {
  AppCard,
  EmptyState,
  ErrorState,
  LoadingState,
  PageTitle,
  ScreenContainer,
  SecondaryButton,
} from "../../components/SpecPulseUI";
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
    <ScreenContainer>
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
          <>
            <EmptyState
              title="Nenhuma análise salva"
              message="Gere uma comparação e salve o resultado para consultar depois."
            />
            <SecondaryButton
              label="Nova comparação"
              onPress={() => router.push("/compare")}
            />
          </>
        )}
        {query.data?.map((item) => (
          <AppCard key={item.id}>
            <Text style={{ fontSize: 17, fontWeight: "600" }}>
              {item.result.fordLabel} × {item.result.competitorLabel}
            </Text>
            <Text style={{ marginVertical: 12 }}>
              Snapshot salvo em {new Date(item.savedAt).toLocaleString("pt-BR")}
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
