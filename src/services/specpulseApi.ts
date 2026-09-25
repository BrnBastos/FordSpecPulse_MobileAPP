import {
  normalizeSpec,
  normalizeComparisonResult,
  type ApiComparisonResult,
} from "./adapters";
import type { User } from "./auth";
import { api, sessionEpoch } from "./auth";
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

function unwrapData<T>(data: T[] | { data?: T[] }) {
  const list = Array.isArray(data) ? data : data?.data;
  if (!Array.isArray(list)) throw new Error("Resposta inválida do serviço.");
  return list;
}

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
  const { data } = await api.get<Vehicle[] | { data?: Vehicle[] }>("/veiculos");
  return unwrapData(data).map(normalizeVehicle);
}

async function fetchAttributesFromApi(): Promise<TechnicalAttribute[]> {
  const { data } = await api.get<
    TechnicalAttribute[] | { data?: TechnicalAttribute[] }
  >("/atributos/taxonomia");
  return unwrapData(data).map((attribute) => {
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
  const { data } = await api.get(
    `/veiculos/${encodeURIComponent(vehicleId)}/versoes`,
  );
  return unwrapData<VehicleVersion>(data).map((version) => {
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
  const { data } = await api.get(
    `/versoes/${encodeURIComponent(versionId)}/especificacoes`,
  );
  return unwrapData<SpecValue>(data).map(normalizeSpec);
}
export type CreateComparisonInput = {
  referenceVersionId: string;
  competitorVersionIds: string[];
  attributeIds: string[];
  customerProfileId?: string;
};
export async function createComparison(
  input: CreateComparisonInput,
): Promise<ComparisonResult> {
  const epoch = sessionEpoch();
  if (
    !input.referenceVersionId ||
    input.competitorVersionIds.length !== 1 ||
    !input.competitorVersionIds[0] ||
    !input.attributeIds.length
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
    !input.attributeIds.length ||
    input.attributeIds.some((id) => !attributes.some((a) => a.id === id))
  ) {
    throw new Error("Selecione versões e atributos válidos para a comparação.");
  }
  if (epoch !== sessionEpoch()) throw new Error("A sessão foi alterada.");
  const { data } = await api.post<ApiComparisonResult>("/comparacoes", input);
  if (epoch !== sessionEpoch()) throw new Error("A sessão foi alterada.");
  const result = normalizeComparisonResult(data, input, attributes);
  return {
    ...result,
    createdAt: new Date().toISOString(),
    selection: input,
    fordLabel: `${fv.brandName} ${fv.model} ${ford.name} • ${fv.year} • ${fv.market}`,
    competitorLabel: `${cv.brandName} ${cv.model} ${competitor.name} • ${cv.year} • ${cv.market}`,
  };
}
export async function getVehicleById(id: string): Promise<Vehicle> {
  const { data } = await api.get(`/veiculos/${encodeURIComponent(id)}`);
  if (!data || typeof data.id !== "string" || typeof data.model !== "string")
    throw new Error("Resposta inválida do serviço.");
  return normalizeVehicle(data);
}
export async function getVersionById(id: string): Promise<VehicleVersion> {
  const { data } = await api.get(`/versoes/${encodeURIComponent(id)}`);
  if (
    !data ||
    typeof data.id !== "string" ||
    typeof data.vehicleId !== "string" ||
    typeof data.name !== "string"
  )
    throw new Error("Resposta inválida do serviço.");
  return data;
}
