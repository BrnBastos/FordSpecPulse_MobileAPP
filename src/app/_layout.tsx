import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="vehicle/[id]" />
          <Stack.Screen name="version/[id]" />
          <Stack.Screen name="comparison-result" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}