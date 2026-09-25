import { useEffect, useState, useSyncExternalStore } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import {
  ErrorState,
  LoadingState,
  ScreenContainer,
} from "../components/SpecPulseUI";
import {
  getStoredAuthSession,
  sessionSnapshot,
  subscribeSession,
} from "../services/auth";
import { useComparisonStore } from "../store/comparisonStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
let previousUser: string | undefined;
subscribeSession(() => {
  const user = sessionSnapshot()?.user.id;
  if (user !== previousUser) {
    void queryClient.cancelQueries();
    queryClient.clear();
    useComparisonStore.getState().reset();
    previousUser = user;
  }
});
export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="dark" />
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
function RootNavigator() {
  const session = useSyncExternalStore(
    subscribeSession,
    sessionSnapshot,
    () => undefined,
  );
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    void getStoredAuthSession().catch(() => setError(true));
  };
  useEffect(() => {
    void getStoredAuthSession().catch(() => setError(true));
  }, []);
  if (error)
    return (
      <ScreenContainer>
        <ErrorState
          message="Não foi possível ler a sessão salva."
          onRetry={load}
        />
      </ScreenContainer>
    );
  if (session === undefined)
    return (
      <ScreenContainer>
        <LoadingState label="Verificando sessão..." />
      </ScreenContainer>
    );
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="vehicle/[id]" />
        <Stack.Screen name="version/[id]" />
        <Stack.Screen name="comparison-result" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}
