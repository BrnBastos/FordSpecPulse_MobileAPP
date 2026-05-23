import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingState, ScreenContainer } from "../components/SpecPulseUI";
import { getApiStatus } from "../services/specpulseApi";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { data: apiStatus, isLoading } = useQuery({
    queryKey: ["api-status"],
    queryFn: getApiStatus,
    retry: false,
  });

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Verificando sessao..." />
      </ScreenContainer>
    );
  }

  const isAuthenticated =
    apiStatus?.mode === "api" && apiStatus.auth === "authenticated";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="vehicle/[id]" />
        <Stack.Screen name="version/[id]" />
        <Stack.Screen name="comparison-result" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}
