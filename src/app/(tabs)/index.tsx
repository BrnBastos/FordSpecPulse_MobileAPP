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
import {
  getAttributesFromApi,
  getMeFromApi,
  getVehiclesFromApi,
} from "../../services/specpulseApi";

export default function HomeScreen() {
  const { data: user, isLoading: loadingUser, isError: userError } = useQuery({
    queryKey: ["me", "api-only"],
    queryFn: getMeFromApi,
  });

  const {
    data: vehicles,
    isLoading: loadingVehicles,
    isError: vehiclesError,
  } = useQuery({
    queryKey: ["vehicles", "api-only"],
    queryFn: getVehiclesFromApi,
  });

  const {
    data: attributes,
    isLoading: loadingAttributes,
    isError: attributesError,
  } = useQuery({
    queryKey: ["attributes", "api-only"],
    queryFn: getAttributesFromApi,
  });

  const isLoading = loadingUser || loadingVehicles || loadingAttributes;

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Carregando resumo..." />
      </ScreenContainer>
    );
  }

  const realVehicles = vehicles ?? [];
  const realAttributes = attributes ?? [];
  const fordVehicles = realVehicles.filter(
    (vehicle) => vehicle.brandName?.toLowerCase() === "ford"
  );
  const competitorVehicles = realVehicles.length - fordVehicles.length;
  const hasDataError = userError || vehiclesError || attributesError;
  const metricValue = (value: number) => (hasDataError ? "--" : String(value));
  const firstName = user?.name ? user.name.split(" ")[0] : "Analista";

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle
          eyebrow="Ford SpecPulse Mobile"
          title={`Ola, ${firstName}`}
          subtitle="Compare versoes, identifique gaps competitivos e transforme especificacoes tecnicas em decisoes estrategicas."
        />

        <AppCard style={styles.hero}>
          <Image
            source={require("../../../assets/images/specpulse-hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <Text style={styles.heroTitle}>
            Inteligencia competitiva na palma da mao
          </Text>

          <Text style={styles.heroText}>
            Selecione uma versao Ford, compare com concorrentes e visualize
            vantagens, riscos e confianca dos dados.
          </Text>

          <View style={styles.buttonStack}>
            <PrimaryButton
              label="Criar comparacao"
              onPress={() => router.push("/compare")}
            />
            <SecondaryButton
              label="Explorar veiculos"
              onPress={() => router.push("/vehicles")}
            />
          </View>
        </AppCard>

        <SectionTitle>Resumo rapido</SectionTitle>

        {hasDataError ? (
          <AppCard style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Nao foi possivel carregar o resumo real
            </Text>
            <Text style={styles.errorText}>
              Verifique a sessao e os endpoints de veiculos e atributos.
            </Text>
          </AppCard>
        ) : null}

        <View style={styles.metricsGrid}>
          <Metric
            icon={<Car size={22} color={colors.fordBlue} />}
            value={metricValue(realVehicles.length)}
            label="Veiculos"
          />
          <Metric
            icon={<BarChart3 size={22} color={colors.fordBlue} />}
            value={metricValue(realAttributes.length)}
            label="Atributos"
          />
          <Metric
            icon={<ShieldCheck size={22} color={colors.success} />}
            value={metricValue(fordVehicles.length)}
            label="Ford"
          />
          <Metric
            icon={<ArrowRight size={22} color={colors.warning} />}
            value={metricValue(competitorVehicles)}
            label="Concorrentes"
          />
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
  errorCard: {
    backgroundColor: "#FEECEC",
    borderColor: "#F8C7C7",
    marginBottom: spacing.sm,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "900",
  },
  errorText: {
    color: colors.graphite,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
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
