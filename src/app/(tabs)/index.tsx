import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useSyncExternalStore } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  AppCard,
  ErrorState,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
  SectionTitle,
} from "../../components/SpecPulseUI";
import { sessionSnapshot, subscribeSession } from "../../services/auth";
import { readHistory } from "../../services/history";
import { useComparisonStore } from "../../store/comparisonStore";
export default function HomeScreen() {
  const session = useSyncExternalStore(subscribeSession, sessionSnapshot);
  const history = useQuery({ queryKey: ["history"], queryFn: readHistory });
  const { refetch } = history;
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
        <PageTitle
          eyebrow="Ford SpecPulse"
          title={`Olá, ${session?.user.name.split(" ")[0] ?? "Analista"}`}
          subtitle="Especificações claras para comparar versões."
        />
        <SecondaryButton
          label="Meu perfil"
          onPress={() => router.push("/profile")}
        />
        <AppCard>
          <Text style={{ fontSize: 22, fontWeight: "600", color: "#001F54" }}>
            O que deseja analisar?
          </Text>
          <View style={{ gap: 12, marginTop: 24 }}>
            <PrimaryButton
              label="Nova comparação"
              onPress={() => router.push("/compare")}
            />
            <SecondaryButton
              label="Consultar ficha técnica"
              onPress={() => router.push("/vehicles")}
            />
          </View>
        </AppCard>
        <SectionTitle>Análises recentes</SectionTitle>
        {history.error && (
          <ErrorState
            message="Não foi possível ler as análises salvas."
            onRetry={() => {
              void refetch();
            }}
          />
        )}
        {!history.data?.length && !history.error && (
          <Text>Suas comparações salvas aparecerão aqui.</Text>
        )}
        {history.data?.slice(0, 3).map((item) => (
          <AppCard key={item.id}>
            <Text>
              {item.result.fordLabel} × {item.result.competitorLabel}
            </Text>
            <Text style={{ marginVertical: 8 }}>
              {new Date(item.savedAt).toLocaleDateString("pt-BR")}
            </Text>
            <SecondaryButton
              label="Abrir análise"
              onPress={() => {
                useComparisonStore.getState().setCurrentComparison(item.result);
                router.push("/comparison-result");
              }}
            />
          </AppCard>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
