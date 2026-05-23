import { useQuery } from "@tanstack/react-query";
import { Activity, Server, ShieldCheck, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
    AppCard,
    Badge,
    LoadingState,
    PageTitle,
    ScreenContainer,
    SectionTitle,
} from "../../components/SpecPulseUI";
import { colors, spacing } from "../../constants/specpulseTheme";
import { getApiStatus, getMe } from "../../services/specpulseApi";

export default function ProfileScreen() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const { data: apiStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ["api-status"],
    queryFn: getApiStatus,
  });

  if (loadingUser || loadingStatus) {
    return (
      <ScreenContainer>
        <LoadingState label="Verificando sessão e API..." />
      </ScreenContainer>
    );
  }

  const isApiMode = apiStatus?.mode === "api";

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle
          eyebrow="Profile"
          title="Perfil e API"
          subtitle="Status da sessão, permissões e integração com a API externa."
        />

        <AppCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <UserRound color={colors.white} size={30} />
          </View>

          <Text style={styles.name}>{user?.name ?? "Usuário demo"}</Text>
          <Text style={styles.email}>{user?.email ?? "demo@ford.internal"}</Text>

          <View style={styles.roles}>
            {(user?.roles ?? ["analyst"]).map((role) => (
              <Badge key={role} label={role} tone="blue" />
            ))}
          </View>
        </AppCard>

        <SectionTitle>Status da integração</SectionTitle>

        <AppCard>
          <View style={styles.statusHeader}>
            <View style={styles.statusIcon}>
              <Server color={isApiMode ? colors.success : colors.warning} size={24} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>
                {isApiMode ? "API conectada" : "Modo demonstração"}
              </Text>

              <Text style={styles.statusText}>
                {isApiMode
                  ? "O app está consumindo dados da API externa."
                  : "A API não respondeu. O app está usando dados mockados compatíveis com o contrato."}
              </Text>
            </View>

            <Badge
              label={isApiMode ? "online" : "mock"}
              tone={isApiMode ? "green" : "yellow"}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Base URL</Text>
            <Text style={styles.infoValue}>{apiStatus?.baseUrl}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Última verificação</Text>
            <Text style={styles.infoValue}>
              {apiStatus?.checkedAt
                ? new Date(apiStatus.checkedAt).toLocaleString()
                : "Não informado"}
            </Text>
          </View>
        </AppCard>

        <SectionTitle>Entrega técnica</SectionTitle>

        <View style={styles.grid}>
          <TechItem icon={<Activity color={colors.fordBlue} size={22} />} title="Expo Router" text="Navegação por tabs e rotas dinâmicas." />
          <TechItem icon={<Server color={colors.fordBlue} size={22} />} title="API REST" text="Consumo assíncrono com Axios e TanStack Query." />
          <TechItem icon={<ShieldCheck color={colors.fordBlue} size={22} />} title="Estado" text="Zustand para seleção da comparação." />
          <TechItem icon={<UserRound color={colors.fordBlue} size={22} />} title="Local data" text="AsyncStorage para histórico local." />
        </View>


        <SectionTitle>Sobre a solução</SectionTitle>

        <AppCard style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Ford SpecPulse Mobile</Text>

        <Text style={styles.aboutText}>
            O app transforma dados técnicos de veículos em uma experiência mobile de
            comparação competitiva. A proposta é ajudar times de produto, pricing e
            estratégia a identificar vantagens, gaps e oportunidades de posicionamento.
        </Text>

        <Text style={styles.aboutText}>
            Nesta versão MVP, o foco está no fluxo principal: explorar veículos,
            selecionar versões, comparar atributos e visualizar um resumo estratégico.
        </Text>
        </AppCard>
        
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
    aboutCard: {
    marginBottom: 40,
    },

    aboutTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.sm,
    },

    aboutText: {
    color: colors.graphite,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
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
  },
  email: {
    color: colors.gray,
    marginTop: 4,
    fontWeight: "600",
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