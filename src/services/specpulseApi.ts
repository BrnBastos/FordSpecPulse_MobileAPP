import {
  normalizeSpec,
  normalizeComparisonResult,
  type ApiComparisonResult,
} from "./adapters";
import type { User } from "./auth";
import { api, sessionEpoch } from "./auth";
import { fetchAllPages } from "./pagination";
import {
  appendRequestedRows,
  normalizeRequestedTerms,
  queryTechnicalSheet,
} from "./technicalSheets";
export {
  API_BASE_URL,
  getStoredAuthSession,
  login,
  register,
  logout,
} from "./auth";
export type { User, AuthSession } from "./auth";
export type Vehicle = {
  id: string;
  brandId: string;
  brandName?: string;
  model: string;
  segment: string;
  market: string;
  year: number;
  updatedAt: string;
};

export type VehicleVersion = {
  id: string;
  vehicleId: string;
  name: string;
  powertrain: string;
  drivetrain: string;
  versionLevel: string;
  dataCompleteness: number;
};

export type TechnicalAttribute = {
  id: string;
  canonicalName: string;
  category: string;
  strategicWeight: number;
  synonyms?: string[];
};

export type SpecValue = {
  versionId: string;
  attributeId: string;
  attributeName?: string;
  value: string | number | boolean | null;
  unit?: string | null;
  status:
    | "found"
    | "not_available"
    | "not_informed"
    | "conflict"
    | "unknown_attribute"
    | "pending_validation";
  confidence: number;
  confidenceLevel: "high" | "medium" | "low" | "unknown";
  sourceLabel?: string;
  sourceUrl?: string;
  collectedAt?: string;
  notes?: string;
};

export type ComparisonResult = {
  id: string;
  createdAt?: string;
  fordLabel?: string;
  competitorLabel?: string;
  selection?: CreateComparisonInput;
  status: string;
  summary: {
    confidence: number;
    executiveSummary: string;
    keyAdvantages: string[];
    keyGaps: string[];
    validationWarnings: string[];
  };
  rows: {
    attributeId: string;
    attributeName: string;
    category?: string;
    fordSpec?: SpecValue;
    competitorSpec?: SpecValue;
    fordValue: string;
    competitorValue: string;
    difference: "advantage" | "risk" | "parity" | "unknown";
    confidenceLevel: "high" | "medium" | "low" | "unknown";
  }[];
};

function brandNameFromBrandId(brandId: string) {
  const brands: Record<string, string> = {
    "brand-chevrolet": "Chevrolet",
    "brand-ford": "Ford",
    "brand-toyota": "Toyota",
    "brand-volkswagen": "Volkswagen",
  };

  return brands[brandId] ?? brandId.replace(/^brand-/, "");
}

function normalizeVehicle(vehicle: Vehicle): Vehicle {
  if (
    !vehicle ||
    typeof vehicle.id !== "string" ||
    typeof vehicle.model !== "string" ||
    typeof vehicle.brandId !== "string"
  )
    throw new Error("Resposta inválida do serviço.");
  return {
    ...vehicle,
    brandName: vehicle.brandName ?? brandNameFromBrandId(vehicle.brandId),
  };
}

async function fetchMeFromApi(): Promise<User> {
  const { data } = await api.get("/usuarios/me");
  if (!data || typeof data.id !== "string" || typeof data.email !== "string")
    throw new Error("Resposta inválida do serviço.");
  return {
    id: data.id,
    name: data.nome ?? data.name ?? data.email,
    email: data.email,
    roles: data.roles ?? [data.perfil ?? "read_only"],
  };
}

async function fetchVehiclesFromApi(): Promise<Vehicle[]> {
  const vehicles = await fetchAllPages<Vehicle>(
    "/veiculos",
    (item) => item?.id,
  );
  return vehicles.map(normalizeVehicle);
}

async function fetchAttributesFromApi(): Promise<TechnicalAttribute[]> {
  const attributes = await fetchAllPages<TechnicalAttribute>(
    "/atributos/taxonomia",
    (item) => item?.id,
  );
  return attributes.map((attribute) => {
    if (
      !attribute ||
      typeof attribute.id !== "string" ||
      typeof attribute.canonicalName !== "string"
    )
      throw new Error("Resposta inválida do serviço.");
    return { ...attribute, category: attribute.category ?? "others" };
  });
}

export async function getMeFromApi(): Promise<User> {
  return fetchMeFromApi();
}

export async function getVehiclesFromApi(): Promise<Vehicle[]> {
  return fetchVehiclesFromApi();
}

export async function getAttributesFromApi(): Promise<TechnicalAttribute[]> {
  return fetchAttributesFromApi();
}

export const getMe = getMeFromApi;
export const getVehicles = getVehiclesFromApi;
export const getAttributes = getAttributesFromApi;
export async function getVehicleVersions(
  vehicleId: string,
): Promise<VehicleVersion[]> {
  const versions = await fetchAllPages<VehicleVersion>(
    `/veiculos/${encodeURIComponent(vehicleId)}/versoes`,
    (item) => item?.id,
  );
  return versions.map((version) => {
    if (
      !version ||
      typeof version.id !== "string" ||
      typeof version.name !== "string" ||
      version.vehicleId !== vehicleId
    )
      throw new Error("Resposta inválida do serviço.");
    return version;
  });
}
export async function getVersionSpecifications(
  versionId: string,
): Promise<SpecValue[]> {
  const specifications = await fetchAllPages<SpecValue>(
    `/versoes/${encodeURIComponent(versionId)}/especificacoes`,
    (item) => item?.attributeId,
  );
  return specifications.map((spec) => {
    if (spec.versionId !== versionId)
      throw new Error("Especificação inválida do serviço.");
    return normalizeSpec(spec);
  });
}
export type CreateComparisonInput = {
  referenceVersionId: string;
  competitorVersionIds: string[];
  attributeIds: string[];
  requestedAttributes?: string[];
  customerProfileId?: string;
};
export async function createComparison(
  input: CreateComparisonInput,
): Promise<ComparisonResult> {
  const epoch = sessionEpoch();
  const requestedAttributes = normalizeRequestedTerms(
    input.requestedAttributes ?? [],
  );
  if (
    !input.referenceVersionId ||
    input.competitorVersionIds.length !== 1 ||
    !input.competitorVersionIds[0] ||
    !(input.attributeIds.length || requestedAttributes.length)
  )
    throw new Error("Selecione duas versões e ao menos um atributo.");
  const [ford, competitor, attributes] = await Promise.all([
    getVersionById(input.referenceVersionId),
    getVersionById(input.competitorVersionIds[0]),
    getAttributes(),
  ]);
  const [fv, cv] = await Promise.all([
    getVehicleById(ford.vehicleId),
    getVehicleById(competitor.vehicleId),
  ]);
  if (
    fv.brandName?.toLowerCase() !== "ford" ||
    cv.brandName?.toLowerCase() === "ford" ||
    ford.id === competitor.id ||
    input.competitorVersionIds.length !== 1 ||
    input.attributeIds.some((id) => !attributes.some((a) => a.id === id))
  ) {
    throw new Error("Selecione versões e atributos válidos para a comparação.");
  }
  const attributeIds = [...new Set(input.attributeIds)];
  if (attributeIds.length + requestedAttributes.length > 50)
    throw new Error("Selecione até 50 atributos por consulta.");
  const selection = { ...input, attributeIds, requestedAttributes };
  if (epoch !== sessionEpoch()) throw new Error("A sessão foi alterada.");
  // Always use the comparison endpoint: its permission checks apply even
  // when every requested term is outside the taxonomy. Never send invented IDs.
  const { data } = await api.post<ApiComparisonResult>("/comparacoes", {
    referenceVersionId: input.referenceVersionId,
    competitorVersionIds: input.competitorVersionIds,
    attributeIds,
    ...(input.customerProfileId
      ? { customerProfileId: input.customerProfileId }
      : {}),
  });
  if (epoch !== sessionEpoch()) throw new Error("A sessão foi alterada.");
  let result = normalizeComparisonResult(data, selection, attributes);
  if (requestedAttributes.length) {
    const [fordSheet, competitorSheet] = await Promise.all([
      queryTechnicalSheet({
        vehicle: fv,
        version: ford,
        attributes: requestedAttributes,
      }),
      queryTechnicalSheet({
        vehicle: cv,
        version: competitor,
        attributes: requestedAttributes,
      }),
    ]);
    if (epoch !== sessionEpoch()) throw new Error("A sessão foi alterada.");
    result = appendRequestedRows(result, fordSheet, competitorSheet, selection);
  }
  return {
    ...result,
    createdAt: new Date().toISOString(),
    selection,
    fordLabel: `${fv.brandName} ${fv.model} ${ford.name} • ${fv.year} • ${fv.market}`,
    competitorLabel: `${cv.brandName} ${cv.model} ${competitor.name} • ${cv.year} • ${cv.market}`,
  };
}
export async function getVehicleById(id: string): Promise<Vehicle> {
  const { data } = await api.get(`/veiculos/${encodeURIComponent(id)}`);
  if (!data || data.id !== id || typeof data.model !== "string")
    throw new Error("Resposta inválida do serviço.");
  return normalizeVehicle(data);
}
export async function getVersionById(id: string): Promise<VehicleVersion> {
  const { data } = await api.get(`/versoes/${encodeURIComponent(id)}`);
  if (
    !data ||
    data.id !== id ||
    typeof data.vehicleId !== "string" ||
    typeof data.name !== "string"
  )
    throw new Error("Resposta inválida do serviço.");
  return data;
}
