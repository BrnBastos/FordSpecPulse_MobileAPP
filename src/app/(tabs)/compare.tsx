import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  ErrorState,
  LoadingState,
  PageTitle,
  PrimaryButton,
  ScreenContainer,
  SectionTitle,
} from "../../components/SpecPulseUI";
import { AttributePicker, Selector } from "../../components/Selection";
import {
  createComparison,
  getAttributes,
  getVehicles,
  getVehicleVersions,
  getVersionById,
  type Vehicle,
} from "../../services/specpulseApi";
import { errorMessage } from "../../services/errors";
import { useComparisonStore } from "../../store/comparisonStore";

export default function CompareScreen() {
  const state = useComparisonStore();
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles });
  const attributes = useQuery({
    queryKey: ["attributes"],
    queryFn: getAttributes,
  });
  const mutation = useMutation({
    mutationFn: createComparison,
    onSuccess: (result) => {
      state.setCurrentComparison(result);
      router.push("/comparison-result");
    },
  });
  if (vehicles.isLoading || attributes.isLoading)
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  if (vehicles.error || attributes.error)
    return (
      <ScreenContainer>
        <ErrorState
          message={errorMessage(vehicles.error ?? attributes.error)}
          onRetry={() => {
            void vehicles.refetch();
            void attributes.refetch();
          }}
        />
      </ScreenContainer>
    );
  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <PageTitle
          title="Nova comparação"
          subtitle="Escolha as versões e os atributos que deseja analisar."
        />
        <SectionTitle>1. Versão Ford</SectionTitle>
        <VehicleSelection
          vehicles={(vehicles.data ?? []).filter(
            (v) => v.brandName?.toLowerCase() === "ford",
          )}
          versionId={state.fordVersionId}
          onSelect={state.setFordVersionId}
        />
        <SectionTitle>2. Versão concorrente</SectionTitle>
        <VehicleSelection
          vehicles={(vehicles.data ?? []).filter(
            (v) => v.brandName?.toLowerCase() !== "ford",
          )}
          versionId={state.competitorVersionId}
          onSelect={state.setCompetitorVersionId}
        />
        <SectionTitle>
          3. Atributos ({state.selectedAttributeIds.length})
        </SectionTitle>
        <AttributePicker
          attributes={attributes.data ?? []}
          selected={state.selectedAttributeIds}
          toggle={state.toggleAttribute}
        />
        {mutation.error && (
          <ErrorState message={errorMessage(mutation.error)} />
        )}
        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={
              mutation.isPending ? "Gerando comparação..." : "Gerar comparação"
            }
            disabled={
              mutation.isPending ||
              !state.fordVersionId ||
              !state.competitorVersionId ||
              !state.selectedAttributeIds.length
            }
            onPress={() => {
              if (
                !mutation.isPending &&
                state.fordVersionId &&
                state.competitorVersionId
              )
                mutation.mutate({
                  referenceVersionId: state.fordVersionId,
                  competitorVersionIds: [state.competitorVersionId],
                  attributeIds: state.selectedAttributeIds,
                });
            }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
function VehicleSelection({
  vehicles,
  versionId,
  onSelect,
}: {
  vehicles: Vehicle[];
  versionId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [pickedBrand, setBrand] = useState<string | null>(null);
  const [pickedModel, setModel] = useState<string | null>(null);
  const selected = useQuery({
    queryKey: ["version", versionId],
    queryFn: () => getVersionById(versionId!),
    enabled: !!versionId,
  });
  const vehicleId = selected.data?.vehicleId ?? pickedModel;
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const brand = vehicle?.brandId ?? pickedBrand;
  const versions = useQuery({
    queryKey: ["versions", vehicleId],
    queryFn: () => getVehicleVersions(vehicleId!),
    enabled: !!vehicle,
  });
  const brands = [
    ...new Map(
      vehicles.map((v) => [
        v.brandId,
        { id: v.brandId, label: v.brandName ?? v.brandId },
      ]),
    ).values(),
  ];
  return (
    <View>
      <Selector
        label="Marca"
        value={brand}
        options={brands}
        onSelect={(id) => {
          onSelect(null);
          setBrand(id);
          setModel(null);
        }}
      />
      <Selector
        label="Modelo, ano e mercado"
        value={vehicleId}
        options={vehicles
          .filter((v) => v.brandId === brand)
          .map((v) => ({
            id: v.id,
            label: `${v.model} • ${v.year} • ${v.market}`,
          }))}
        onSelect={(id) => {
          onSelect(null);
          setModel(id);
        }}
      />
      {versions.isFetching ? (
        <LoadingState label="Buscando versões..." />
      ) : (
        <Selector
          label="Versão"
          value={versionId}
          options={(versions.data ?? []).map((v) => ({
            id: v.id,
            label: v.name,
          }))}
          onSelect={onSelect}
        />
      )}
      {(versions.error || selected.error) && (
        <ErrorState
          message={errorMessage(versions.error ?? selected.error)}
          onRetry={() => {
            void versions.refetch();
            if (versionId) void selected.refetch();
          }}
        />
      )}
      {versionId && vehicle && selected.data && (
        <Text>
          {vehicle.brandName} {vehicle.model} {selected.data.name}
        </Text>
      )}
    </View>
  );
}
