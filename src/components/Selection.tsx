import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../constants/specpulseTheme";
import { PrimaryButton, ScreenContainer, SectionTitle } from "./SpecPulseUI";
import type { TechnicalAttribute } from "../services/specpulseApi";
export const categoryLabel = (value: string) =>
  ({
    engine_transmission: "Motor e transmissão",
    digital_cockpit: "Cockpit digital",
    adas: "Assistência à condução",
    safety: "Segurança",
    comfort: "Conforto",
    connectivity: "Conectividade",
    others: "Outros",
  })[value] ?? value;
export function Selector({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value?: string | null;
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => {
          setSearch("");
          setOpen(true);
        }}
        style={styles.field}
      >
        <Text style={styles.text}>
          {options.find((o) => o.id === value)?.label ?? "Selecionar"}
        </Text>
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <ScreenContainer>
          <SectionTitle>{label}</SectionTitle>
          <TextInput
            accessibilityLabel="Buscar opção"
            placeholder="Buscar"
            value={search}
            onChangeText={setSearch}
            style={styles.field}
          />
          <ScrollView keyboardShouldPersistTaps="handled">
            {options
              .filter((o) =>
                o.label
                  .toLocaleLowerCase("pt-BR")
                  .includes(search.toLocaleLowerCase("pt-BR")),
              )
              .map((o) => (
                <Pressable
                  key={o.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: value === o.id }}
                  style={styles.field}
                  onPress={() => {
                    onSelect(o.id);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.text}>
                    {value === o.id ? "✓ " : ""}
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            {!options.length && <Text>Nenhuma opção disponível.</Text>}
          </ScrollView>
          <PrimaryButton label="Fechar" onPress={() => setOpen(false)} />
        </ScreenContainer>
      </Modal>
    </View>
  );
}
export function AttributePicker({
  attributes,
  selected,
  toggle,
}: {
  attributes: TechnicalAttribute[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = attributes.filter((a) =>
    a.canonicalName
      .toLocaleLowerCase("pt-BR")
      .includes(search.toLocaleLowerCase("pt-BR")),
  );
  return (
    <View>
      <TextInput
        accessibilityLabel="Buscar atributos"
        placeholder="Buscar equipamento ou atributo"
        value={search}
        onChangeText={setSearch}
        style={styles.field}
      />
      {[...new Set(filtered.map((a) => a.category))].sort().map((category) => (
        <View key={category}>
          <SectionTitle>{categoryLabel(category)}</SectionTitle>
          {filtered
            .filter((a) => a.category === category)
            .map((a) => (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected.includes(a.id) }}
                onPress={() => toggle(a.id)}
                key={a.id}
                style={styles.field}
              >
                <Text style={styles.text}>
                  {selected.includes(a.id) ? "☑" : "□"} {a.canonicalName}
                </Text>
              </Pressable>
            ))}
        </View>
      ))}
      {!filtered.length && (
        <Text style={styles.text}>
          Nenhum atributo encontrado. A pesquisa de atributos fora do catálogo
          ainda depende de suporte do serviço.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderColor: "#D5DDE7",
    borderRadius: 12,
    padding: 14,
    minHeight: 48,
    marginVertical: 4,
    backgroundColor: colors.white,
    color: colors.graphite,
  },
  label: { color: colors.navy, fontWeight: "600", marginBottom: 4 },
  text: { color: colors.graphite, fontSize: 16 },
});

export function segmentLabel(segment: string) {
  return (
    (
      {
        midsize_pickup: "Picape média",
        pickup: "Picape",
        suv: "SUV",
        sedan: "Sedã",
        hatchback: "Hatch",
        compact: "Compacto",
      } as Record<string, string>
    )[segment] ?? "Veículo"
  );
}
export function powertrainLabel(value: string) {
  return (
    (
      {
        diesel: "Diesel",
        gasoline: "Gasolina",
        petrol: "Gasolina",
        hybrid: "Híbrido",
        electric: "Elétrico",
        flex: "Flex",
      } as Record<string, string>
    )[value.toLowerCase()] ?? value
  );
}
