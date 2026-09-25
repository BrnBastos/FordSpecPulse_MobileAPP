import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AttributePicker, categoryLabel } from "../../components/Selection";
import {
  ErrorState,
  LoadingState,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
  SectionTitle,
} from "../../components/SpecPulseUI";
import { colors } from "../../constants/specpulseTheme";
import {
  getAttributes,
  getVehicleById,
  getVersionById,
  getVersionSpecifications,
} from "../../services/specpulseApi";
import { errorMessage } from "../../services/errors";
import {
  formatValue,
  requestedSpecifications,
  statusLabel,
} from "../../services/specifications";
import {
  queryTechnicalSheet,
  type TechnicalSheet,
} from "../../services/technicalSheets";
import { useComparisonStore } from "../../store/comparisonStore";

type DisplayRow = {
  key: string;
  name: string;
  category: string;
  value: string;
  status: keyof typeof statusLabel | "unknown_attribute";
  sourceLabel?: string;
  sourceUrl?: string;
  collectedAt?: string;
  notes?: string;
};

export default function VersionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VersionDetail key={id} id={id} />;
}

function VersionDetail({ id }: { id: string }) {
  const [selection, setSelection] = useState<string[] | null>(null);
  const [requestedAttributes, setRequestedAttributes] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [sheet, setSheet] = useState<TechnicalSheet | null>(null);
  const [customized, setCustomized] = useState(false);
  const revision = useRef(0);
  const version = useQuery({
    queryKey: ["version", id],
    queryFn: () => getVersionById(id),
  });
  const vehicle = useQuery({
    queryKey: ["vehicle", version.data?.vehicleId],
    queryFn: () => getVehicleById(version.data!.vehicleId),
    enabled: !!version.data,
  });
  const attributes = useQuery({
    queryKey: ["attributes"],
    queryFn: getAttributes,
  });
  const specs = useQuery({
    queryKey: ["version-specifications", id],
    queryFn: () => getVersionSpecifications(id),
  });
  const querySheet = useMutation({
    mutationFn: (
      input: Parameters<typeof queryTechnicalSheet>[0] & { revision: number },
    ) => queryTechnicalSheet(input),
    onSuccess: (result, input) => {
      if (input.revision !== revision.current) return;
      setSheet(result);
      setCustomized(true);
      setEditing(false);
      setExpanded([]);
    },
  });
  useEffect(
    () => () => {
      revision.current += 1;
    },
    [],
  );
  const invalidateSheet = () => {
    revision.current += 1;
    querySheet.reset();
    setCustomized(true);
    setSheet(null);
    setExpanded([]);
  };
  const queries = [version, vehicle, attributes, specs];
  const error = queries.find((q) => q.error)?.error;
  if (error)
    return (
      <ScreenContainer>
        <SecondaryButton label="Voltar" onPress={() => router.back()} />
        <ErrorState
          message={errorMessage(error)}
          onRetry={() =>
            queries.forEach((q) => {
              void q.refetch();
            })
          }
        />
      </ScreenContainer>
    );
  if (queries.some((q) => q.isLoading))
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  const selected =
    selection ?? attributes.data?.slice(0, 50).map((a) => a.id) ?? [];
  const selectedTerms = [
    ...(attributes.data ?? [])
      .filter((a) => selected.includes(a.id))
      .map((a) => a.canonicalName),
    ...requestedAttributes,
  ];
  const rows: DisplayRow[] = sheet
    ? sheet.items.map((item, index) => ({
        key: `${item.canonicalCode ?? item.requestedTerm}-${index}`,
        name: item.name,
        category: item.category,
        value: item.value ?? "Não informado",
        status: item.status,
        sourceLabel: item.sourceLabel,
        collectedAt: item.collectedAt,
      }))
    : customized
      ? []
      : requestedSpecifications(
          id,
          attributes.data ?? [],
          specs.data ?? [],
        ).map(({ id: key, canonicalName, category, spec }) => ({
          key,
          name: canonicalName,
          category,
          value: formatValue(spec.value, spec.unit),
          status: spec.status,
          sourceLabel: spec.sourceLabel,
          sourceUrl: spec.sourceUrl,
          collectedAt: spec.collectedAt,
          notes: spec.notes,
        }));
  const ford = vehicle.data?.brandName?.toLowerCase() === "ford";
  const submit = () => {
    if (
      !vehicle.data ||
      !version.data ||
      querySheet.isPending ||
      !selectedTerms.length
    )
      return;
    querySheet.mutate({
      vehicle: vehicle.data,
      version: version.data,
      attributes: selectedTerms,
      revision: revision.current,
    });
  };
  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <SecondaryButton label="Voltar" onPress={() => router.back()} />
        <PageTitle
          eyebrow="Ficha técnica"
          title={version.data?.name ?? "Versão"}
          subtitle={`${vehicle.data?.brandName} ${vehicle.data?.model} • ${vehicle.data?.year} • ${vehicle.data?.market}`}
        />
        {!editing && (
          <PrimaryButton
            label={ford ? "Usar como Ford" : "Usar como concorrente"}
            disabled={!vehicle.data}
            onPress={() => {
              const store = useComparisonStore.getState();
              if (ford) store.setFordVersionId(id);
              else store.setCompetitorVersionId(id);
              router.push("/compare");
            }}
          />
        )}
        <SectionTitle>Atributos da consulta</SectionTitle>
        <SecondaryButton
          label={editing ? "Fechar seleção" : "Escolher atributos"}
          onPress={() => setEditing(!editing)}
        />
        {editing && (
          <View style={{ marginTop: 16 }}>
            <View style={styles.selectionHeader}>
              <Text style={[styles.supporting, { flex: 1 }]}>
                {selected.length + requestedAttributes.length} de 50
                selecionados
              </Text>
              {!!(selected.length + requestedAttributes.length) && (
                <Pressable
                  accessibilityRole="button"
                  style={styles.sourceButton}
                  onPress={() => {
                    invalidateSheet();
                    setSelection([]);
                    setRequestedAttributes([]);
                  }}
                >
                  <Text style={styles.sourceLabel}>Limpar seleção</Text>
                </Pressable>
              )}
            </View>
            <AttributePicker
              attributes={attributes.data ?? []}
              selected={selected}
              requestedAttributes={requestedAttributes}
              onRequestedAttributesChange={(terms) => {
                invalidateSheet();
                setRequestedAttributes(terms);
              }}
              toggle={(key) => {
                invalidateSheet();
                setSelection(
                  selected.includes(key)
                    ? selected.filter((i) => i !== key)
                    : [...selected, key],
                );
              }}
            />
          </View>
        )}
        {(editing || (customized && !sheet)) && (
          <View style={{ marginTop: 24 }}>
            <PrimaryButton
              label={
                querySheet.isPending
                  ? "Consultando ficha..."
                  : "Consultar ficha"
              }
              disabled={
                querySheet.isPending ||
                !selectedTerms.length ||
                selectedTerms.length > 50
              }
              onPress={submit}
            />
          </View>
        )}
        {querySheet.error && (
          <ErrorState message={errorMessage(querySheet.error)} />
        )}
        {!editing && (
          <>
            {!rows.length && !querySheet.isPending && (
              <Text style={styles.supporting}>
                Escolha os atributos e consulte a ficha.
              </Text>
            )}
            {!!rows.length && (
              <Text style={styles.supporting}>
                Dados ausentes não confirmam ausência do equipamento.
              </Text>
            )}
            {[...new Set(rows.map((r) => r.category))]
              .sort()
              .map((category) => (
                <View key={category}>
                  <SectionTitle>{categoryLabel(category)}</SectionTitle>
                  {rows
                    .filter((r) => r.category === category)
                    .map((row) => (
                      <View key={row.key} style={styles.specRow}>
                        <Text style={styles.specName}>{row.name}</Text>
                        <Text style={styles.specValue}>{row.value}</Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${expanded.includes(row.key) ? "Ocultar" : "Ver"} fonte de ${row.name}`}
                          accessibilityState={{
                            expanded: expanded.includes(row.key),
                          }}
                          style={styles.sourceButton}
                          onPress={() =>
                            setExpanded(
                              expanded.includes(row.key)
                                ? expanded.filter((i) => i !== row.key)
                                : [...expanded, row.key],
                            )
                          }
                        >
                          <Text style={styles.sourceLabel}>
                            {row.status === "unknown_attribute"
                              ? "Atributo não reconhecido"
                              : statusLabel[row.status]}{" "}
                            ·{" "}
                            {expanded.includes(row.key)
                              ? "Ocultar fonte"
                              : "Ver fonte"}
                          </Text>
                        </Pressable>
                        {expanded.includes(row.key) && (
                          <Text style={styles.provenance}>
                            Fonte: {row.sourceLabel ?? "não informada"}
                            {row.sourceUrl ? `\n${row.sourceUrl}` : ""}
                            {"\n"}Coleta: {row.collectedAt ?? "não informada"}
                            {row.notes ? `\n${row.notes}` : ""}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  selectionHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  supporting: { color: colors.gray, lineHeight: 20, marginVertical: 16 },
  specRow: {
    borderBottomWidth: 1,
    borderColor: "#D5DDE7",
    paddingVertical: 12,
  },
  specName: { fontWeight: "600", fontSize: 16, color: colors.navy },
  specValue: { fontSize: 17, marginTop: 4, color: colors.graphite },
  sourceButton: { minHeight: 48, justifyContent: "center" },
  sourceLabel: { color: colors.fordBlue, lineHeight: 20 },
  provenance: { color: colors.gray, lineHeight: 21, paddingBottom: 8 },
});
