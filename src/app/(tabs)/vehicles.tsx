import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    AppCard,
    Badge,
    EmptyState,
    LoadingState,
    PageTitle,
    ScreenContainer,
} from "../../components/SpecPulseUI";
import { colors, spacing } from "../../constants/specpulseTheme";
import { getVehicles, Vehicle } from "../../services/specpulseApi";

export default function VehiclesScreen() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ford" | "competitors">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const vehicles = useMemo(() => {
    const list = data ?? [];

    return list.filter((vehicle) => {
      const matchesSearch =
        vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.brandName?.toLowerCase().includes(search.toLowerCase());

      const isFord = vehicle.brandName?.toLowerCase() === "ford";

      const matchesFilter =
        filter === "all" ||
        (filter === "ford" && isFord) ||
        (filter === "competitors" && !isFord);

      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Buscando veículos..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle
          eyebrow="Vehicle Explorer"
          title="Veículos"
          subtitle="Explore modelos Ford e concorrentes disponíveis para comparação competitiva."
        />

        <View style={styles.searchBox}>
          <Search color={colors.gray} size={20} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por marca ou modelo"
            placeholderTextColor={colors.gray}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filters}>
          <FilterChip label="Todos" active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterChip label="Ford" active={filter === "ford"} onPress={() => setFilter("ford")} />
          <FilterChip
            label="Concorrentes"
            active={filter === "competitors"}
            onPress={() => setFilter("competitors")}
          />
        </View>

        {vehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo encontrado"
            message="Tente mudar a busca ou o filtro selecionado."
          />
        ) : (
          <View style={styles.list}>
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const isFord = vehicle.brandName?.toLowerCase() === "ford";

  return (
    <Pressable onPress={() => router.push(`/vehicle/${vehicle.id}` as never)}>
      <AppCard>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.brand}>{vehicle.brandName ?? vehicle.brandId}</Text>
            <Text style={styles.model}>{vehicle.model}</Text>
          </View>
          <Badge label={isFord ? "Ford" : "Concorrente"} tone={isFord ? "blue" : "neutral"} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{vehicle.segment}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{vehicle.market}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{vehicle.year}</Text>
        </View>

        <Text style={styles.updated}>Toque para ver versões disponíveis</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7ECF3",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.graphite,
    fontSize: 15,
  },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },
  filterChipActive: {
    backgroundColor: colors.fordBlue,
    borderColor: colors.fordBlue,
  },
  filterText: {
    color: colors.gray,
    fontWeight: "800",
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 40,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  brand: {
    color: colors.gray,
    fontWeight: "800",
    fontSize: 13,
  },
  model: {
    color: colors.navy,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.md,
  },
  meta: {
    color: colors.graphite,
    fontWeight: "700",
  },
  dot: {
    color: colors.gray,
  },
  updated: {
    color: colors.gray,
    marginTop: spacing.md,
    fontSize: 13,
  },
});