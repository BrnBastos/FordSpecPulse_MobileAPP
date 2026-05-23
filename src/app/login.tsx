import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AppCard,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from "../components/SpecPulseUI";
import { colors, spacing } from "../constants/specpulseTheme";
import { login } from "../services/specpulseApi";

export default function LoginScreen() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("bruno@ford.internal");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(
    null
  );

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.heroCard}>
          <Image
            source={require("../../assets/images/specpulse-hero.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroOverlay}>
            <View style={styles.badge}>
              <ShieldCheck color={colors.white} size={16} />
              <Text style={styles.badgeText}>Acesso seguro</Text>
            </View>

            <Text style={styles.heroTitle}>Ford SpecPulse</Text>
            <Text style={styles.heroText}>
              Inteligencia de especificacoes para comparar versoes com mais
              clareza.
            </Text>
          </View>
        </AppCard>

        <AppCard style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Entrar na conta</Text>
            <Text style={styles.formSubtitle}>
              Continue de onde parou e acesse os dados sincronizados da API.
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
                value={email}
                onChangeText={setEmail}
                placeholder="ana@ford.internal"
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
                value={password}
                onChangeText={setPassword}
                placeholder="Senha@Forte123"
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
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.navy,
    minHeight: 260,
    overflow: "hidden",
    padding: 0,
  },
  heroImage: {
    bottom: 0,
    left: 0,
    opacity: 0.9,
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroOverlay: {
    backgroundColor: "rgba(0, 31, 84, 0.54)",
    flex: 1,
    justifyContent: "flex-end",
    minHeight: 260,
    padding: spacing.lg,
  },
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
  },
  heroText: {
    color: "#DCEBFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 6,
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
    fontWeight: "900",
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
    fontWeight: "900",
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
