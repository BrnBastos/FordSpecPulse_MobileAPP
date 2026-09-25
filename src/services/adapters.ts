import type {
  ComparisonResult,
  CreateComparisonInput,
  SpecValue,
  TechnicalAttribute,
} from "./specpulseApi";
function normalizeConfidenceLevel(
  confidenceLevel: SpecValue["confidenceLevel"] | string | undefined,
): SpecValue["confidenceLevel"] {
  if (confidenceLevel === "high" || confidenceLevel === "ALTA") return "high";
  if (confidenceLevel === "medium" || confidenceLevel === "MEDIA")
    return "medium";
  if (confidenceLevel === "low" || confidenceLevel === "BAIXA") return "low";
  return "unknown";
}

function normalizeSpecStatus(
  status: SpecValue["status"] | string | undefined,
): SpecValue["status"] {
  if (status === "found" || status === "CONFIRMADO") return "found";
  if (status === "not_available") return "not_available";
  if (status === "not_informed" || status === "NAO_INFORMADO")
    return "not_informed";
  if (status === "conflict" || status === "CONFLITO") return "conflict";
  return "pending_validation";
}

export function normalizeSpec(spec: SpecValue): SpecValue {
  if (
    !spec ||
    typeof spec.attributeId !== "string" ||
    typeof spec.versionId !== "string" ||
    (spec.value != null &&
      !["string", "number", "boolean"].includes(typeof spec.value))
  )
    throw new Error("Especificação inválida do serviço.");
  return {
    ...spec,
    status: normalizeSpecStatus(spec.status),
    confidenceLevel: normalizeConfidenceLevel(spec.confidenceLevel),
  };
}

type ApiComparisonRow = {
  attributeId?: string;
  attributeName?: string;
  canonicalName?: string;
  fordValue?: string;
  competitorValue?: string;
  difference?: ComparisonResult["rows"][number]["difference"];
  confidenceLevel?: ComparisonResult["rows"][number]["confidenceLevel"];
  cells?: {
    versionId?: string;
    status?: string;
    sourceLabel?: string;
    sourceUrl?: string;
    collectedAt?: string;
    notes?: string;
    value?: string | number | boolean | null;
    formattedValue?: string;
    unit?: string | null;
    difference?: string;
    confidence?: number;
    confidenceLevel?: string;
  }[];
};

export type ApiComparisonResult = Omit<ComparisonResult, "rows"> & {
  rows: ApiComparisonRow[];
};

function formatCellValue(value: unknown, unit?: string | null) {
  if (value === null || value === undefined) return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return unit ? `${String(value)} ${unit}` : String(value);
}

function normalizeDifference(
  difference:
    ComparisonResult["rows"][number]["difference"] | string | undefined,
): ComparisonResult["rows"][number]["difference"] {
  const normalized =
    typeof difference === "string" ? difference.toLowerCase() : undefined;

  if (normalized === "advantage" || normalized === "vantagem") {
    return "advantage";
  }

  if (normalized === "risk" || normalized === "risco") {
    return "risk";
  }

  if (normalized === "parity" || normalized === "paridade") {
    return "parity";
  }

  return "unknown";
}

export function normalizeComparisonResult(
  result: ApiComparisonResult,
  input: CreateComparisonInput,
  attributes: TechnicalAttribute[] = [],
): ComparisonResult {
  if (!result || typeof result.id !== "string" || !Array.isArray(result.rows))
    throw new Error("Resposta inválida do serviço.");
  if (
    result.rows.some(
      (row) =>
        !row ||
        typeof row.attributeId !== "string" ||
        (row.cells !== undefined &&
          (!Array.isArray(row.cells) ||
            row.cells.some(
              (cell) =>
                !cell ||
                typeof cell.versionId !== "string" ||
                (cell.value != null &&
                  !["string", "number", "boolean"].includes(typeof cell.value)),
            ))),
    )
  )
    throw new Error(
      "O serviço retornou linhas inválidas ou valores sem identificar as versões.",
    );
  return {
    ...result,
    summary: {
      ...result.summary,
      executiveSummary:
        typeof result.summary?.executiveSummary === "string"
          ? result.summary.executiveSummary
          : "Resumo não fornecido.",
      keyAdvantages: strings(result.summary?.keyAdvantages),
      keyGaps: strings(result.summary?.keyGaps),
      validationWarnings: strings(result.summary?.validationWarnings),
    },
    rows: [...new Set(input.attributeIds)].map((attributeId) => {
      const row = result.rows.find((r) => r.attributeId === attributeId) ?? {
        attributeId,
      };
      const attribute = attributes.find((a) => a.id === attributeId);
      const fordCell = row.cells?.find(
        (cell) => cell.versionId === input.referenceVersionId,
      );
      const competitorCell = row.cells?.find(
        (cell) => cell.versionId === input.competitorVersionIds[0],
      );

      if (row.cells?.some((cell) => !cell.versionId))
        throw new Error(
          "O serviço retornou valores sem identificar as versões. Não foi possível conferir a comparação.",
        );
      const cellSpec = (
        cell: NonNullable<ApiComparisonRow["cells"]>[number] | undefined,
        versionId: string,
      ): SpecValue | undefined =>
        cell
          ? {
              ...cell,
              value: cell.value ?? null,
              versionId,
              attributeId,
              status: normalizeSpecStatus(cell.status),
              confidence: 0,
              confidenceLevel: "unknown",
            }
          : undefined;
      const incompatible =
        !!fordCell && !!competitorCell && fordCell.unit !== competitorCell.unit;
      return {
        category: attribute?.category ?? "others",
        fordSpec: cellSpec(fordCell, input.referenceVersionId),
        competitorSpec: cellSpec(competitorCell, input.competitorVersionIds[0]),
        attributeId: row.attributeId ?? row.canonicalName ?? "attribute",
        attributeName:
          attribute?.canonicalName ??
          row.attributeName ??
          row.canonicalName ??
          row.attributeId ??
          "Atributo",
        fordValue:
          row.fordValue ??
          fordCell?.formattedValue ??
          formatCellValue(fordCell?.value, fordCell?.unit),
        competitorValue:
          row.competitorValue ??
          competitorCell?.formattedValue ??
          formatCellValue(competitorCell?.value, competitorCell?.unit),
        difference:
          incompatible ||
          (fordCell?.status != null &&
            normalizeSpecStatus(fordCell.status) !== "found") ||
          (competitorCell?.status != null &&
            normalizeSpecStatus(competitorCell.status) !== "found") ||
          (!fordCell && row.fordValue == null) ||
          (!competitorCell && row.competitorValue == null)
            ? "unknown"
            : normalizeDifference(
                row.difference ??
                  competitorCell?.difference ??
                  fordCell?.difference,
              ),
        confidenceLevel: normalizeConfidenceLevel(
          row.confidenceLevel ??
            fordCell?.confidenceLevel ??
            competitorCell?.confidenceLevel,
        ),
      };
    }),
  };
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
