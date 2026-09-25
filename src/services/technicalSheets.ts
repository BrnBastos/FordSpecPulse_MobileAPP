import { api, sessionEpoch } from "./auth";
import type {
  ComparisonResult,
  CreateComparisonInput,
  SpecValue,
  Vehicle,
  VehicleVersion,
} from "./specpulseApi";

export type TechnicalSheetItem = {
  requestedTerm: string;
  canonicalCode: string | null;
  name: string;
  category: string;
  value: string | null;
  unit?: string;
  status: SpecValue["status"];
  sourceLabel?: string;
  collectedAt?: string;
};
export type TechnicalSheet = {
  versionId: string;
  queriedAt: string;
  items: TechnicalSheetItem[];
};
export type TechnicalSheetInput = {
  vehicle: Vehicle;
  version: VehicleVersion;
  attributes: string[];
};

export const termKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");

export function normalizeRequestedTerms(terms: string[]): string[] {
  if (
    !Array.isArray(terms) ||
    terms.some((term) => typeof term !== "string" || !term.trim())
  )
    throw new Error("Informe o nome de cada atributo.");
  const seen = new Set<string>();
  const normalized = terms
    .map((term) => term.trim().replace(/\s+/g, " "))
    .filter((term) => {
      const key = termKey(term);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  if (normalized.length > 50)
    throw new Error("Selecione até 50 atributos por consulta.");
  return normalized;
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const optionalText = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;
const statusMap: Record<string, SpecValue["status"]> = {
  PRESENTE: "found",
  NAO_INFORMADO: "not_informed",
  // This endpoint defines NAO_DISPONIVEL as no stored specification, not
  // proof that the equipment is absent from the vehicle.
  NAO_DISPONIVEL: "not_available",
  ATRIBUTO_DESCONHECIDO: "unknown_attribute",
};
export function normalizeTechnicalSheet(
  data: unknown,
  input: TechnicalSheetInput,
): TechnicalSheet {
  if (
    !record(data) ||
    typeof data.versaoId !== "string" ||
    !data.versaoId ||
    typeof data.consultadoEm !== "string" ||
    !Number.isFinite(Date.parse(data.consultadoEm)) ||
    !Array.isArray(data.itens)
  )
    throw new Error("A ficha retornada pelo serviço é inválida.");
  const identity = [
    [data.marca, input.vehicle.brandName],
    [data.modelo, input.vehicle.model],
    [data.versao, input.version.name],
    [data.mercado, input.vehicle.market],
  ];
  const uuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
  if (
    input.version.vehicleId !== input.vehicle.id ||
    identity.some(
      ([actual, expected]) =>
        typeof actual !== "string" ||
        typeof expected !== "string" ||
        termKey(actual) !== termKey(expected),
    ) ||
    data.anoModelo !== input.vehicle.year ||
    (uuid.test(input.version.id) && data.versaoId !== input.version.id)
  ) {
    throw new Error(
      "A ficha não corresponde à versão, ano ou mercado selecionado.",
    );
  }
  // Catalog IDs may be slugs while this endpoint exposes database UUIDs.
  // Require the complete catalog identity above instead of silently accepting
  // a name-only match to a different model-year.
  const requested = normalizeRequestedTerms(input.attributes);
  const rows = new Map<string, Record<string, unknown>>();
  for (const row of data.itens) {
    if (!record(row) || typeof row.termoSolicitado !== "string")
      throw new Error("A ficha contém atributos inválidos.");
    const key = termKey(row.termoSolicitado);
    if (rows.has(key) || !requested.some((term) => termKey(term) === key))
      throw new Error(
        "A ficha contém atributos duplicados ou não solicitados.",
      );
    rows.set(key, row);
  }
  const items = requested.map((requestedTerm): TechnicalSheetItem => {
    const row = rows.get(termKey(requestedTerm));
    if (!row)
      return {
        requestedTerm,
        canonicalCode: null,
        name: requestedTerm,
        category: "others",
        value: null,
        status: "not_informed",
      };
    const status =
      typeof row.status === "string" ? statusMap[row.status] : undefined;
    if (
      !status ||
      (row.valor != null && typeof row.valor !== "string") ||
      (status === "found" &&
        (typeof row.valor !== "string" || !row.valor.trim()))
    )
      throw new Error("A ficha contém um valor ou estado inválido.");
    return {
      requestedTerm,
      canonicalCode: optionalText(row.codigoCanonico) ?? null,
      name: optionalText(row.nomeExibicao) ?? requestedTerm,
      category: optionalText(row.categoria) ?? "others",
      value: status === "found" ? (row.valor as string) : null,
      unit: optionalText(row.unidade),
      status,
      sourceLabel: optionalText(row.fonte),
      collectedAt: optionalText(row.dataCaptura),
    };
  });
  return { versionId: input.version.id, queriedAt: data.consultadoEm, items };
}

export async function queryTechnicalSheet(
  input: TechnicalSheetInput,
): Promise<TechnicalSheet> {
  const epoch = sessionEpoch();
  const attributes = normalizeRequestedTerms(input.attributes);
  if (!attributes.length) throw new Error("Selecione ao menos um atributo.");
  if (!input.vehicle.brandName || input.version.vehicleId !== input.vehicle.id)
    throw new Error("Selecione uma versão válida.");
  const { data } = await api.post("/fichas-tecnicas/consultar", {
    marca: input.vehicle.brandName,
    modelo: input.vehicle.model,
    versao: input.version.name,
    atributos: attributes,
  });
  if (epoch !== sessionEpoch()) throw new Error("A sessão foi alterada.");
  return normalizeTechnicalSheet(data, { ...input, attributes });
}

export function appendRequestedRows(
  result: ComparisonResult,
  ford: TechnicalSheet,
  competitor: TechnicalSheet,
  input: CreateComparisonInput,
): ComparisonResult {
  const requested = normalizeRequestedTerms(input.requestedAttributes ?? []);
  const rows = requested.map((term) => {
    const left = ford.items.find(
      (item) => termKey(item.requestedTerm) === termKey(term),
    );
    const right = competitor.items.find(
      (item) => termKey(item.requestedTerm) === termKey(term),
    );
    if (!left || !right)
      throw new Error("Não foi possível conferir os atributos solicitados.");
    // Local row identity only; never sent as a backend attribute ID.
    const attributeId = `requested:${termKey(term)}`;
    const spec = (item: TechnicalSheetItem, versionId: string): SpecValue => ({
      versionId,
      attributeId,
      attributeName: item.name,
      value: item.value,
      status: item.status,
      confidence: 0,
      confidenceLevel: "unknown",
      sourceLabel: item.sourceLabel,
      collectedAt: item.collectedAt,
      notes:
        item.status === "not_available"
          ? "Não há especificação cadastrada para esta versão."
          : undefined,
    });
    const sameAttribute =
      left.canonicalCode !== null && left.canonicalCode === right.canonicalCode;
    const equal =
      sameAttribute &&
      left.status === "found" &&
      right.status === "found" &&
      left.unit === right.unit &&
      left.value === right.value;
    return {
      attributeId,
      attributeName: sameAttribute ? left.name : term,
      category: sameAttribute ? left.category : "others",
      fordValue: left.value ?? "Não informado",
      competitorValue: right.value ?? "Não informado",
      fordSpec: spec(left, input.referenceVersionId),
      competitorSpec: spec(right, input.competitorVersionIds[0]),
      difference: equal ? ("parity" as const) : ("unknown" as const),
      confidenceLevel: "unknown" as const,
    };
  });
  return {
    ...result,
    rows: [...result.rows, ...rows],
    summary: {
      ...result.summary,
      executiveSummary: `${result.rows.length + rows.length} atributos consultados nas duas versões.`,
      // The server's default summary can include attributes outside this
      // request when attributeIds is empty; do not present those conclusions.
      keyAdvantages: [],
      keyGaps: [],
      validationWarnings: [],
    },
  };
}
