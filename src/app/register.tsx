import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { LockKeyhole, Mail, UserRound } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  AppCard,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from "../components/SpecPulseUI";
import { colors, spacing } from "../constants/specpulseTheme";
import { errorMessage } from "../services/errors";
import { register } from "../services/specpulseApi";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useMutation({
    mutationFn: () =>
      register({
        nome: name.trim(),
        email: email.trim(),
        senha: password,
      }),
  });

  const canSubmit =
    !!name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    !!password &&
    !registerMutation.isPending;

  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle
          eyebrow="Acesso"
          title="Criar cadastro"
          subtitle="Crie sua conta. As ações disponíveis dependem do perfil de acesso."
        />

        <AppCard>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <View style={styles.inputRow}>
              <UserRound color={colors.gray} size={20} />
              <TextInput
                accessibilityLabel="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Ana Estrategista"
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor={colors.gray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Mail color={colors.gray} size={20} />
              <TextInput
                accessibilityLabel="E-mail"
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
                accessibilityLabel="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                secureTextEntry
                style={styles.input}
                placeholderTextColor={colors.gray}
              />
            </View>
          </View>

          {registerMutation.error ? (
            <Text style={styles.errorText}>
              {errorMessage(registerMutation.error)}
            </Text>
          ) : null}

          {email.length > 0 &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
              <Text style={styles.errorText}>Informe um e-mail válido.</Text>
            )}
          <View style={styles.actions}>
            <PrimaryButton
              label={
                registerMutation.isPending ? "Criando cadastro..." : "Cadastrar"
              }
              disabled={!canSubmit}
              onPress={() => registerMutation.mutate()}
            />
            <SecondaryButton
              label="Já tenho conta"
              onPress={() => router.push("/login")}
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
    fontWeight: "600",
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
