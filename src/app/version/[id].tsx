import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
import { useComparisonStore } from "../../store/comparisonStore";
export default function VersionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selection, setSelection] = useState<string[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
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
  const selected = selection ?? attributes.data?.map((a) => a.id) ?? [];
  const rows = requestedSpecifications(
    id,
    (attributes.data ?? []).filter((a) => selected.includes(a.id)),
    specs.data ?? [],
  );
  const ford = vehicle.data?.brandName?.toLowerCase() === "ford";
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SecondaryButton label="Voltar" onPress={() => router.back()} />
        <PageTitle
          eyebrow="Ficha técnica"
          title={version.data?.name ?? "Versão"}
          subtitle={`${vehicle.data?.brandName} ${vehicle.data?.model} • ${vehicle.data?.year} • ${vehicle.data?.market}`}
        />
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
        <SectionTitle>Atributos da consulta</SectionTitle>
        <SecondaryButton
          label={
            editing
              ? "Ver ficha selecionada"
              : `Escolher atributos (${selected.length})`
          }
          onPress={() => setEditing(!editing)}
        />
        {editing ? (
          <AttributePicker
            attributes={attributes.data ?? []}
            selected={selected}
            toggle={(key) =>
              setSelection(
                selected.includes(key)
                  ? selected.filter((i) => i !== key)
                  : [...selected, key],
              )
            }
          />
        ) : (
          <>
            <Text style={{ marginVertical: 16 }}>
              “Não informado” não confirma ausência. Dados com conflito ou
              validação pendente precisam de conferência.
            </Text>
            {!rows.length && (
              <Text>Selecione ao menos um atributo para consultar.</Text>
            )}
            {[...new Set(rows.map((r) => r.category))]
              .sort()
              .map((category) => (
                <View key={category}>
                  <SectionTitle>{categoryLabel(category)}</SectionTitle>
                  {rows
                    .filter((r) => r.category === category)
                    .map(({ id: key, canonicalName, spec }) => (
                      <View
                        key={key}
                        style={{
                          borderBottomWidth: 1,
                          borderColor: "#D5DDE7",
                          paddingVertical: 12,
                        }}
                      >
                        <Text style={{ fontWeight: "600", fontSize: 16 }}>
                          {canonicalName}
                        </Text>
                        <Text style={{ fontSize: 17, marginTop: 4 }}>
                          {formatValue(spec.value, spec.unit)}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{
                            expanded: expanded.includes(key),
                          }}
                          style={{ minHeight: 48, justifyContent: "center" }}
                          onPress={() =>
                            setExpanded(
                              expanded.includes(key)
                                ? expanded.filter((i) => i !== key)
                                : [...expanded, key],
                            )
                          }
                        >
                          <Text>{statusLabel[spec.status]} • Ver fonte</Text>
                        </Pressable>
                        {expanded.includes(key) && (
                          <Text>
                            Fonte: {spec.sourceLabel ?? "não informada"}
                            {"\n"}
                            {spec.sourceUrl}
                            {"\n"}Data de coleta:{" "}
                            {spec.collectedAt ?? "não informada"}
                            {"\n"}
                            {spec.notes}
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
