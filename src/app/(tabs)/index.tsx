import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowRight, BarChart3, Car, ShieldCheck } from "lucide-react-native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import {
    AppCard,
    LoadingState,
    PageTitle,
    PrimaryButton,
    ScreenContainer,
    SecondaryButton,
    SectionTitle,
} from "../../components/SpecPulseUI";
import { colors, spacing } from "../../constants/specpulseTheme";
import { getMe } from "../../services/specpulseApi";

export default function HomeScreen() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando experiência SpecPulse..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle
          eyebrow="Ford SpecPulse Mobile"
          title={`Olá, ${user?.name?.split(" ")[0] ?? "Analista"}`}
          subtitle="Compare versões, identifique gaps competitivos e transforme especificações técnicas em decisões estratégicas."
        />

        <AppCard style={styles.hero}>
            <Image
                source={require("../../../assets/images/specpulse-hero.png")}
                style={styles.heroImage}
                resizeMode="contain"
            />

            <Text style={styles.heroTitle}>
                Inteligência competitiva na palma da mão
            </Text>

            <Text style={styles.heroText}>
                Selecione uma versão Ford, compare com concorrentes e visualize vantagens,
                riscos e confiança dos dados.
            </Text>

            <View style={styles.buttonStack}>
                <PrimaryButton
                label="Criar comparação"
                onPress={() => router.push("/compare")}
                />
                <SecondaryButton
                label="Explorar veículos"
                onPress={() => router.push("/vehicles")}
                />
            </View>
        </AppCard>

        <SectionTitle>Resumo rápido</SectionTitle>

        <View style={styles.metricsGrid}>
          <Metric icon={<Car size={22} color={colors.fordBlue} />} value="3" label="Veículos" />
          <Metric icon={<BarChart3 size={22} color={colors.fordBlue} />} value="5" label="Atributos" />
          <Metric icon={<ShieldCheck size={22} color={colors.success} />} value="82%" label="Confiança" />
          <Metric icon={<ArrowRight size={22} color={colors.warning} />} value="2" label="Gaps" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <AppCard style={styles.metricCard}>
      {icon}
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
    heroImage: {
  width: "100%",
  height: 180,
  marginBottom: spacing.md,
},
  hero: {
    backgroundColor: colors.navy,
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.fordBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },
  heroText: {
    color: "#D8E7FF",
    fontSize: 15,
    lineHeight: 22,
  },
  buttonStack: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingBottom: 40,
  },
  metricCard: {
    width: "48%",
    minHeight: 120,
  },
  metricValue: {
    color: colors.navy,
    fontSize: 26,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  metricLabel: {
    color: colors.gray,
    fontWeight: "700",
    marginTop: 4,
  },
});