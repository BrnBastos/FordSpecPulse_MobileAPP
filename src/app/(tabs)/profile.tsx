import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Server, ShieldCheck, UserRound } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AppCard,
  Badge,
  LoadingState,
  PageTitle,
  ScreenContainer,
  SectionTitle,
} from "../../components/SpecPulseUI";
import { colors, spacing } from "../../constants/specpulseTheme";
import {
  getApiStatus,
  getMeFromApi,
  getStoredAuthSession,
  logout,
} from "../../services/specpulseApi";

export default function ProfileScreen() {
  const queryClient = useQueryClient();

  const refreshApiQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    await queryClient.invalidateQueries({ queryKey: ["api-status"] });
    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    await queryClient.invalidateQueries({ queryKey: ["versions"] });
    await queryClient.invalidateQueries({ queryKey: ["version"] });
    await queryClient.invalidateQueries({ queryKey: ["version-specifications"] });
    await queryClient.invalidateQueries({ queryKey: ["attributes"] });
  };

  const { data: apiStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ["api-status"],
    queryFn: getApiStatus,
  });

  const { data: authSession } = useQuery({
    queryKey: ["auth-session"],
    queryFn: getStoredAuthSession,
  });

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["me", "api-only"],
    queryFn: getMeFromApi,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: refreshApiQueries,
  });

  if (loadingStatus || loadingUser) {
    return (
      <ScreenContainer>
        <LoadingState label="Verificando sessao..." />
      </ScreenContainer>
    );
  }

  const displayUser = user ?? authSession?.user;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle
          eyebrow="Profile"
          title="Perfil e API"
          subtitle="Status da sessao, permissoes e integracao com a API externa."
        />

        <AppCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <UserRound color={colors.white} size={30} />
          </View>

          <Text style={styles.name}>{displayUser?.name ?? "Usuario"}</Text>
          <Text style={styles.email}>
            {displayUser?.email ?? "Sessao autenticada"}
          </Text>

          <View style={styles.roles}>
            {(displayUser?.roles ?? []).map((role) => (
              <Badge key={role} label={role} tone="blue" />
            ))}
          </View>
        </AppCard>

        <SectionTitle>Status da integracao</SectionTitle>

        <AppCard>
          <View style={styles.statusHeader}>
            <View style={styles.statusIcon}>
              <Server color={colors.success} size={24} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>API conectada</Text>
              <Text style={styles.statusText}>
                O app esta consumindo dados da API externa com Bearer token.
              </Text>
            </View>

            <Badge label="online" tone="green" />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Base URL</Text>
            <Text style={styles.infoValue}>{apiStatus?.baseUrl}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Auth</Text>
            <Text style={styles.infoValue}>token valido</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Ultima verificacao</Text>
            <Text style={styles.infoValue}>
              {apiStatus?.checkedAt
                ? new Date(apiStatus.checkedAt).toLocaleString()
                : "Nao informado"}
            </Text>
          </View>
        </AppCard>

        <SectionTitle>Sessao</SectionTitle>

        <AppCard>
          <Text style={styles.authTitle}>Sessao autenticada</Text>
          <Text style={styles.authText}>
            As proximas chamadas usam Authorization: Bearer token.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Usuario autenticado</Text>
            <Text style={styles.infoValue}>
              {authSession?.user.email ?? displayUser?.email ?? "Sessao ativa"}
            </Text>
          </View>

          <Pressable
            onPress={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>
              {logoutMutation.isPending ? "Saindo..." : "Sair da sessao"}
            </Text>
          </Pressable>
        </AppCard>

        <SectionTitle>Entrega tecnica</SectionTitle>

        <View style={styles.grid}>
          <TechItem
            icon={<Activity color={colors.fordBlue} size={22} />}
            title="Expo Router"
            text="Rotas protegidas por sessao autenticada."
          />
          <TechItem
            icon={<Server color={colors.fordBlue} size={22} />}
            title="API REST"
            text="Consumo assincrono com Axios e TanStack Query."
          />
          <TechItem
            icon={<ShieldCheck color={colors.fordBlue} size={22} />}
            title="Auth"
            text="Login, cadastro e refresh token com AsyncStorage."
          />
          <TechItem
            icon={<UserRound color={colors.fordBlue} size={22} />}
            title="Perfil"
            text="Dados do usuario autenticado via API."
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function TechItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <AppCard style={styles.techCard}>
      {icon}
      <Text style={styles.techTitle}>{title}</Text>
      <Text style={styles.techText}>{text}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  authTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  authText: {
    color: colors.gray,
    lineHeight: 20,
    marginTop: 6,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#FEECEC",
    borderRadius: 14,
    marginTop: spacing.md,
    paddingVertical: 14,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: "900",
  },
  profileCard: {
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.fordBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  name: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  email: {
    color: colors.gray,
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  roles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  statusText: {
    color: colors.gray,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  infoBox: {
    marginTop: spacing.md,
    backgroundColor: colors.paleBlue,
    borderRadius: 14,
    padding: spacing.md,
  },
  infoLabel: {
    color: colors.gray,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoValue: {
    color: colors.graphite,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingBottom: 40,
  },
  techCard: {
    width: "48%",
    minHeight: 145,
  },
  techTitle: {
    color: colors.navy,
    fontWeight: "900",
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  techText: {
    color: colors.gray,
    fontSize: 13,
    lineHeight: 18,
  },
});
