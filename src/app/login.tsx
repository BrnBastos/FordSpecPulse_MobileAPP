import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  AppCard,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from "../components/SpecPulseUI";
import { colors, spacing } from "../constants/specpulseTheme";
import { errorMessage } from "../services/errors";
import { login } from "../services/specpulseApi";
import { AutomotiveBanner } from "../components/AutomotiveImages";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(
    null,
  );

  const loginMutation = useMutation({
    mutationFn: () => login({ email: email.trim(), senha: password }),
  });

  const canSubmit =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    !!password &&
    !loginMutation.isPending;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.heroCard}>
          <AutomotiveBanner variant="login" />
          <Text style={styles.heroTitle}>Ford SpecPulse</Text>
        </AppCard>

        <AppCard style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Entrar na conta</Text>
            <Text style={styles.formSubtitle}>
              Consulte fichas técnicas e compare versões.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View
              style={[
                styles.inputRow,
                focusedInput === "email" && styles.inputRowFocused,
              ]}
            >
              <Mail
                color={focusedInput === "email" ? colors.fordBlue : colors.gray}
                size={20}
              />
              <TextInput
                accessibilityLabel="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={() => setFocusedInput(null)}
                onFocus={() => setFocusedInput("email")}
                style={styles.input}
                placeholderTextColor={colors.gray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View
              style={[
                styles.inputRow,
                focusedInput === "password" && styles.inputRowFocused,
              ]}
            >
              <LockKeyhole
                color={
                  focusedInput === "password" ? colors.fordBlue : colors.gray
                }
                size={20}
              />
              <TextInput
                accessibilityLabel="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                secureTextEntry
                onBlur={() => setFocusedInput(null)}
                onFocus={() => setFocusedInput("password")}
                style={styles.input}
                placeholderTextColor={colors.gray}
              />
            </View>
          </View>

          {loginMutation.error ? (
            <Text style={styles.errorText}>
              {errorMessage(loginMutation.error) ===
              "Sua sessão expirou. Entre novamente."
                ? "E-mail ou senha inválidos."
                : errorMessage(loginMutation.error)}
            </Text>
          ) : null}

          {email.length > 0 &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
              <Text style={styles.errorText}>Informe um e-mail válido.</Text>
            )}
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
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.navy,
    overflow: "hidden",
    padding: 0,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "600",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  formCard: {
    padding: spacing.lg,
  },
  formHeader: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: "600",
  },
  formSubtitle: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderColor: "#D9E5F5",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  inputRowFocused: {
    backgroundColor: colors.white,
    borderColor: colors.fordBlue,
  },
  input: {
    color: colors.graphite,
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
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
