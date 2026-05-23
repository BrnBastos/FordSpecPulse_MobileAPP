import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  AppCard,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton
} from "../components/SpecPulseUI";
import { colors, spacing } from "../constants/specpulseTheme";
import { login } from "../services/specpulseApi";

export default function LoginScreen() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("bruno@ford.internal");
  const [password, setPassword] = useState("");

  const refreshApiQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    await queryClient.invalidateQueries({ queryKey: ["api-status"] });
    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    await queryClient.invalidateQueries({ queryKey: ["versions"] });
    await queryClient.invalidateQueries({ queryKey: ["version"] });
    await queryClient.invalidateQueries({
      queryKey: ["version-specifications"],
    });
    await queryClient.invalidateQueries({ queryKey: ["attributes"] });
  };

  const loginMutation = useMutation({
    mutationFn: () => login({ email: email.trim(), senha: password }),
    onSuccess: async () => {
      await refreshApiQueries();
      router.replace("/");
    },
  });

  const canSubmit = !!email.trim() && !!password && !loginMutation.isPending;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppCard>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Mail color={colors.gray} size={20} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ana@ford.internal"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                placeholderTextColor={colors.gray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputRow}>
              <LockKeyhole color={colors.gray} size={20} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Senha@Forte123"
                secureTextEntry
                style={styles.input}
                placeholderTextColor={colors.gray}
              />
            </View>
          </View>

          {loginMutation.error ? (
            <Text style={styles.errorText}>
              Nao foi possivel entrar. Confira email, senha e API.
            </Text>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton
              label={loginMutation.isPending ? "Entrando..." : "Entrar"}
              disabled={!canSubmit}
              onPress={() => loginMutation.mutate()}
            />
            <SecondaryButton
              label="Criar cadastro"
              onPress={() => router.push("/register")}
            />
          </View>
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  inputRow: {
    alignItems: "center",
    borderColor: "#E7ECF3",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  input: {
    color: colors.graphite,
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 44,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
});
