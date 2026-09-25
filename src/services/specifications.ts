import type { SpecValue, TechnicalAttribute } from "./specpulseApi";
export const statusLabel: Record<SpecValue["status"], string> = {
  found: "Confirmado",
  not_available: "Não disponível",
  not_informed: "Não informado",
  conflict: "Conflito",
  pending_validation: "Validação pendente",
};
export function formatValue(value: SpecValue["value"], unit?: string | null) {
  if (value === null || value === undefined) return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return `${value}${unit ? ` ${unit}` : ""}`;
}
export function requestedSpecifications(
  versionId: string,
  attributes: TechnicalAttribute[],
  specs: SpecValue[],
) {
  return attributes.map((attribute) => {
    const value = specs.find(
      (s) => s.attributeId === attribute.id && s.versionId === versionId,
    );
    return {
      ...attribute,
      spec: value ?? {
        versionId,
        attributeId: attribute.id,
        value: null,
        status: "not_informed" as const,
        confidence: 0,
        confidenceLevel: "unknown" as const,
      },
    };
  });
}
