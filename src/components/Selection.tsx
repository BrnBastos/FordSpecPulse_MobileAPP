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
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../constants/specpulseTheme";
import {
  PrimaryButton,
  ScreenContainer,
  SectionTitle,
  SecondaryButton,
} from "./SpecPulseUI";
import type { TechnicalAttribute } from "../services/specpulseApi";
import { termKey } from "../services/technicalSheets";
import { BrandLogo } from "./AutomotiveImages";
export const categoryLabel = (value: string) =>
  ({
    engine_transmission: "Motor e transmissão",
    digital_cockpit: "Cockpit digital",
    adas: "Assistência à condução",
    safety: "Segurança",
    comfort: "Conforto",
    connectivity: "Conectividade",
    capacity_use: "Capacidade e uso",
    traction_offroad: "Tração e fora de estrada",
    others: "Outros",
    MOTOR: "Motor e transmissão",
    TRANSMISSAO: "Motor e transmissão",
    SEGURANCA: "Segurança",
    CONFORTO: "Conforto",
    CONECTIVIDADE: "Conectividade",
    TECNOLOGIA: "Tecnologia",
    DIMENSOES: "Dimensões",
    DESEMPENHO: "Desempenho",
    CONSUMO: "Consumo",
    OUTROS: "Outros",
    UTILIDADE: "Utilidade",
    OFFROAD: "Fora de estrada",
    EFICIENCIA: "Eficiência",
    ADAS: "Assistência à condução",
    PAINEL_DIGITAL: "Painel digital",
    ACABAMENTO: "Acabamento",
  })[value] ?? value;
export function Selector({
  label,
  value,
  options,
  onSelect,
  showBrandLogos = false,
}: {
  label: string;
  value?: string | null;
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
  showBrandLogos?: boolean;
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
        style={[
          styles.field,
          showBrandLogos && {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          },
        ]}
      >
        {showBrandLogos && value ? (
          <BrandLogo
            name={options.find((o) => o.id === value)?.label ?? value}
            compact
          />
        ) : null}
        <Text style={[styles.text, showBrandLogos && { flex: 1 }]}>
          {options.find((o) => o.id === value)?.label ?? "Selecionar"}
        </Text>
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaProvider>
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
                    style={[
                      styles.field,
                      showBrandLogos && {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      },
                    ]}
                    onPress={() => {
                      onSelect(o.id);
                      setOpen(false);
                    }}
                  >
                    {showBrandLogos ? (
                      <BrandLogo name={o.label} compact />
                    ) : null}
                    <Text style={[styles.text, showBrandLogos && { flex: 1 }]}>
                      {value === o.id ? "✓ " : ""}
                      {o.label}
                    </Text>
                  </Pressable>
                ))}
              {!options.length && <Text>Nenhuma opção disponível.</Text>}
            </ScrollView>
            <PrimaryButton label="Fechar" onPress={() => setOpen(false)} />
          </ScreenContainer>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}
export function AttributePicker({
  attributes,
  selected,
  toggle,
  requestedAttributes = [],
  onRequestedAttributesChange,
}: {
  attributes: TechnicalAttribute[];
  selected: string[];
  toggle: (id: string) => void;
  requestedAttributes?: string[];
  onRequestedAttributesChange?: (terms: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [showSelected, setShowSelected] = useState(false);
  const matches = (attribute: TechnicalAttribute) =>
    [attribute.canonicalName, ...(attribute.synonyms ?? [])].some((name) =>
      termKey(name).includes(termKey(search)),
    );
  const filtered = attributes.filter(matches);
  const visible = filtered.slice(0, visibleCount);
  const count = selected.length + requestedAttributes.length;
  const chips = [
    ...selected.map((id) => ({
      key: id,
      label: attributes.find((a) => a.id === id)?.canonicalName ?? id,
      freeIndex: null as number | null,
    })),
    ...requestedAttributes.map((label, index) => ({
      key: `free-${index}`,
      label,
      freeIndex: index,
    })),
  ];
  const resetInput = () => {
    setSearch("");
    setEditIndex(null);
    setFeedback("");
    setVisibleCount(6);
  };
  const saveTerm = () => {
    if (!onRequestedAttributesChange) return;
    const term = search.trim().replace(/\s+/g, " ");
    const normalized = termKey(term);
    if (!normalized) return;
    const known = attributes.find((a) =>
      [a.id, a.canonicalName, ...(a.synonyms ?? [])].some(
        (name) => termKey(name) === normalized,
      ),
    );
    const otherTerms = requestedAttributes.filter(
      (_, index) => index !== editIndex,
    );
    if (
      otherTerms.some((name) => termKey(name) === normalized) ||
      (known && selected.includes(known.id))
    ) {
      setFeedback("Este atributo já foi selecionado.");
      return;
    }
    if (count >= 50 && editIndex === null) {
      setFeedback("Selecione até 50 atributos por consulta.");
      return;
    }
    if (known) {
      onRequestedAttributesChange(otherTerms);
      toggle(known.id);
    } else {
      onRequestedAttributesChange(
        editIndex === null
          ? [...requestedAttributes, term]
          : requestedAttributes.map((value, index) =>
              index === editIndex ? term : value,
            ),
      );
    }
    resetInput();
  };
  return (
    <View>
      {!!chips.length && (
        <View style={styles.chips}>
          {(showSelected ? chips : chips.slice(0, 6)).map((chip) => (
            <View key={chip.key} style={styles.chip}>
              {chip.freeIndex === null ? (
                <Text style={styles.chipText}>{chip.label}</Text>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${chip.label}`}
                  style={styles.chipLabel}
                  onPress={() => {
                    setEditIndex(chip.freeIndex);
                    setSearch(chip.label);
                    setFeedback("");
                  }}
                >
                  <Text style={styles.chipText}>{chip.label} · editar</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover ${chip.label}`}
                style={styles.removeChip}
                onPress={() => {
                  if (chip.freeIndex === null) toggle(chip.key);
                  else
                    onRequestedAttributesChange?.(
                      requestedAttributes.filter(
                        (_, index) => index !== chip.freeIndex,
                      ),
                    );
                  resetInput();
                }}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {chips.length > 6 && (
        <Pressable
          accessibilityRole="button"
          style={styles.inlineAction}
          onPress={() => setShowSelected(!showSelected)}
        >
          <Text style={styles.actionText}>
            {showSelected
              ? "Recolher selecionados"
              : `Ver todos os ${chips.length} selecionados`}
          </Text>
        </Pressable>
      )}
      <TextInput
        accessibilityLabel={
          editIndex === null
            ? "Buscar ou adicionar atributo"
            : "Editar atributo"
        }
        placeholder={
          onRequestedAttributesChange
            ? "Buscar ou escrever um atributo"
            : "Buscar atributo"
        }
        value={search}
        maxLength={120}
        returnKeyType={onRequestedAttributesChange ? "done" : "search"}
        onSubmitEditing={saveTerm}
        onChangeText={(text) => {
          setSearch(text);
          setFeedback("");
          setVisibleCount(6);
        }}
        style={styles.field}
      />
      {onRequestedAttributesChange && !!search.trim() && (
        <View style={styles.inputActions}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={
                editIndex === null ? "Adicionar atributo" : "Salvar atributo"
              }
              onPress={saveTerm}
            />
          </View>
          {editIndex !== null && (
            <View style={{ flex: 1 }}>
              <SecondaryButton label="Cancelar" onPress={resetInput} />
            </View>
          )}
        </View>
      )}
      {!!feedback && (
        <Text accessibilityLiveRegion="polite" style={styles.feedback}>
          {feedback}
        </Text>
      )}
      {!!visible.length && <Text style={styles.catalogLabel}>CATÁLOGO</Text>}
      {[...new Set(visible.map((a) => a.category))].sort().map((category) => (
        <View key={category}>
          <Text style={styles.category}>{categoryLabel(category)}</Text>
          {visible
            .filter((a) => a.category === category)
            .map((a) => {
              const checked = selected.includes(a.id);
              const disabled = !checked && count >= 50;
              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked, disabled }}
                  disabled={disabled}
                  onPress={() => {
                    toggle(a.id);
                    setFeedback("");
                  }}
                  key={a.id}
                  style={[
                    styles.attributeRow,
                    checked && styles.attributeSelected,
                    disabled && { opacity: 0.5 },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxSelected,
                    ]}
                  >
                    {checked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.text, { flex: 1 }]}>
                    {a.canonicalName}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      ))}
      {filtered.length > visibleCount && (
        <Pressable
          accessibilityRole="button"
          style={styles.inlineAction}
          onPress={() => setVisibleCount(visibleCount + 8)}
        >
          <Text style={styles.actionText}>
            Mostrar mais atributos ({filtered.length - visibleCount})
          </Text>
        </Pressable>
      )}
      {!filtered.length && (
        <Text style={styles.feedback}>
          Nenhum resultado no catálogo.
          {onRequestedAttributesChange
            ? " Adicione o termo para consultar."
            : ""}
        </Text>
      )}
      {count >= 50 && (
        <Text style={styles.feedback}>
          Limite de 50 atributos selecionados.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.lightBlue,
    maxWidth: "100%",
    paddingLeft: 12,
  },
  chipText: { color: colors.navy, flexShrink: 1, paddingVertical: 8 },
  chipLabel: { flexShrink: 1, minHeight: 48, justifyContent: "center" },
  removeChip: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { fontSize: 22, color: colors.fordBlue },
  inlineAction: {
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 12,
  },
  actionText: { color: colors.fordBlue, fontWeight: "600" },
  feedback: { color: colors.gray, marginVertical: 8, lineHeight: 20 },
  inputActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  catalogLabel: {
    color: colors.gray,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 24,
  },
  category: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  attributeRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  attributeSelected: { backgroundColor: colors.lightBlue },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.fordBlue,
    borderColor: colors.fordBlue,
  },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: "600" },
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
