import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

const DEFAULT_API_BASE_URL =
  "https://ford-spec-pulse-api-production.up.railway.app/api";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const AUTH_SESSION_KEY = "specpulse.authSession.v1";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type ApiAuthUser = {
  id: string;
  nome?: string;
  name?: string;
  email: string;
  perfil?: string;
  roles?: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
  user: User;
};

export type AuthCredentials = {
  email: string;
  senha: string;
};

export type RegisterInput = AuthCredentials & {
  nome: string;
};

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
};

export type ComparisonResult = {
  id: string;
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
    fordValue: string;
    competitorValue: string;
    difference: "advantage" | "risk" | "parity" | "unknown";
    confidenceLevel: "high" | "medium" | "low" | "unknown";
  }[];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
});

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiraEm: string;
  refreshExpiraEm: string;
  usuario: ApiAuthUser;
};

type MutableHeaders = Record<string, string> & {
  set?: (name: string, value: string) => void;
};

type RetriableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

let authSession: AuthSession | null | undefined;
let refreshRequest: Promise<string | null> | null = null;

function normalizeUser(user: ApiAuthUser | User): User {
  const apiUser = user as ApiAuthUser;

  return {
    id: user.id,
    name: apiUser.name ?? apiUser.nome ?? user.email,
    email: user.email,
    roles:
      apiUser.roles ??
      (apiUser.perfil ? [apiUser.perfil.toLowerCase()] : ["read_only"]),
  };
}

function sessionFromAuthResponse(data: AuthResponse): AuthSession {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiraEm,
    refreshExpiresAt: data.refreshExpiraEm,
    user: normalizeUser(data.usuario),
  };
}

function isStillValid(date: string | undefined, safetyWindowMs = 30000) {
  if (!date) return false;
  return new Date(date).getTime() - safetyWindowMs > Date.now();
}

async function loadAuthSession() {
  if (authSession !== undefined) {
    return authSession;
  }

  try {
    const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    authSession = raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    authSession = null;
  }

  return authSession;
}

async function persistAuthSession(session: AuthSession) {
  authSession = session;
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

async function clearAuthSession() {
  authSession = null;
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}

function hasAuthorizationHeader(config: AxiosRequestConfig) {
  const headers = config.headers as MutableHeaders | undefined;
  return !!headers?.Authorization || !!headers?.authorization;
}

function setAuthorizationHeader(
  config: AxiosRequestConfig | InternalAxiosRequestConfig,
  token: string
) {
  const headers = (config.headers ?? {}) as MutableHeaders;
  const value = `Bearer ${token}`;

  if (typeof headers.set === "function") {
    headers.set("Authorization", value);
  } else {
    headers.Authorization = value;
  }

  config.headers = headers as InternalAxiosRequestConfig["headers"];
}

async function refreshAccessToken(session: AuthSession) {
  if (!isStillValid(session.refreshExpiresAt, 0)) {
    await clearAuthSession();
    return null;
  }

  if (!refreshRequest) {
    refreshRequest = axios
      .post<AuthResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken: session.refreshToken },
        { timeout: 6000 }
      )
      .then(async ({ data }) => {
        const nextSession = sessionFromAuthResponse(data);
        await persistAuthSession(nextSession);
        return nextSession.accessToken;
      })
      .catch(async () => {
        await clearAuthSession();
        return null;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

async function getAccessToken(forceRefresh = false) {
  const session = await loadAuthSession();

  if (session?.accessToken && !forceRefresh && isStillValid(session.expiresAt)) {
    return session.accessToken;
  }

  if (session?.refreshToken) {
    return refreshAccessToken(session);
  }

  return null;
}

api.interceptors.request.use(async (config) => {
  if (!hasAuthorizationHeader(config)) {
    const token = await getAccessToken();

    if (token) {
      setAuthorizationHeader(config, token);
    }
  }

  return config;
});

api.interceptors.response.use(undefined, async (error) => {
  const originalRequest = error.config as RetriableRequestConfig | undefined;

  if (
    error.response?.status === 401 &&
    originalRequest &&
    !originalRequest._retry
  ) {
    originalRequest._retry = true;

    const token = await getAccessToken(true);

    if (token) {
      setAuthorizationHeader(originalRequest, token);
      return api.request(originalRequest);
    }
  }

  return Promise.reject(error);
});

export async function getStoredAuthSession() {
  return loadAuthSession();
}

export async function login(credentials: AuthCredentials) {
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/login`,
    credentials,
    { timeout: 6000 }
  );
  const session = sessionFromAuthResponse(data);
  await persistAuthSession(session);
  return session;
}

export async function register(input: RegisterInput) {
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/register`,
    input,
    { timeout: 6000 }
  );
  const session = sessionFromAuthResponse(data);
  await persistAuthSession(session);
  return session;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // Local logout should still clear stale credentials when the API is unavailable.
  } finally {
    await clearAuthSession();
  }
}

const mockUser: User = {
  id: "user-bruno",
  name: "Bruno Bastos",
  email: "bruno@ford.internal",
  roles: ["analyst"],
};

const mockVehicles: Vehicle[] = [
  {
    id: "vehicle-ford-ranger-2026",
    brandId: "brand-ford",
    brandName: "Ford",
    model: "Ranger",
    segment: "midsize_pickup",
    market: "BR",
    year: 2026,
    updatedAt: "2026-05-15T12:00:00.000Z",
  },
  {
    id: "vehicle-toyota-hilux-2026",
    brandId: "brand-toyota",
    brandName: "Toyota",
    model: "Hilux",
    segment: "midsize_pickup",
    market: "BR",
    year: 2026,
    updatedAt: "2026-05-16T12:00:00.000Z",
  },
  {
    id: "vehicle-chevrolet-s10-2026",
    brandId: "brand-chevrolet",
    brandName: "Chevrolet",
    model: "S10",
    segment: "midsize_pickup",
    market: "BR",
    year: 2026,
    updatedAt: "2026-05-18T12:00:00.000Z",
  },
];

const mockVersions: VehicleVersion[] = [
  {
    id: "version-ford-ranger-limited-plus-v6-2026",
    vehicleId: "vehicle-ford-ranger-2026",
    name: "Limited+ 3.0L V6",
    powertrain: "diesel",
    drivetrain: "4x4",
    versionLevel: "top",
    dataCompleteness: 0.92,
  },
  {
    id: "version-ford-ranger-xlt-v6-2026",
    vehicleId: "vehicle-ford-ranger-2026",
    name: "XLT 3.0L V6",
    powertrain: "diesel",
    drivetrain: "4x4",
    versionLevel: "mid",
    dataCompleteness: 0.86,
  },
  {
    id: "version-toyota-hilux-gr-sport-2026",
    vehicleId: "vehicle-toyota-hilux-2026",
    name: "GR-Sport",
    powertrain: "diesel",
    drivetrain: "4x4",
    versionLevel: "top",
    dataCompleteness: 0.81,
  },
  {
    id: "version-chevrolet-s10-high-country-2026",
    vehicleId: "vehicle-chevrolet-s10-2026",
    name: "High Country",
    powertrain: "diesel",
    drivetrain: "4x4",
    versionLevel: "top",
    dataCompleteness: 0.84,
  },
];

const mockAttributes: TechnicalAttribute[] = [
  {
    id: "attr_torque_nm",
    canonicalName: "Torque",
    category: "engine_transmission",
    strategicWeight: 0.9,
  },
  {
    id: "attr_camera_360",
    canonicalName: "Câmera 360",
    category: "digital_cockpit",
    strategicWeight: 0.82,
  },
  {
    id: "attr_adaptive_cruise_control",
    canonicalName: "ACC Stop & Go",
    category: "adas",
    strategicWeight: 0.86,
  },
  {
    id: "attr_blis",
    canonicalName: "BLIS",
    category: "safety",
    strategicWeight: 0.8,
  },
  {
    id: "attr_multimedia_screen",
    canonicalName: "Tela multimídia",
    category: "digital_cockpit",
    strategicWeight: 0.66,
  },
];

const mockSpecs: SpecValue[] = [
  {
    versionId: "version-ford-ranger-limited-plus-v6-2026",
    attributeId: "attr_torque_nm",
    attributeName: "Torque",
    value: 600,
    unit: "Nm",
    status: "found",
    confidence: 0.96,
    confidenceLevel: "high",
    sourceLabel: "Catálogo Ford",
  },
  {
    versionId: "version-ford-ranger-limited-plus-v6-2026",
    attributeId: "attr_camera_360",
    attributeName: "Câmera 360",
    value: true,
    status: "found",
    confidence: 0.92,
    confidenceLevel: "high",
    sourceLabel: "Catálogo Ford",
  },
  {
    versionId: "version-ford-ranger-limited-plus-v6-2026",
    attributeId: "attr_adaptive_cruise_control",
    attributeName: "ACC Stop & Go",
    value: true,
    status: "found",
    confidence: 0.89,
    confidenceLevel: "high",
    sourceLabel: "Ficha técnica",
  },
  {
    versionId: "version-ford-ranger-limited-plus-v6-2026",
    attributeId: "attr_blis",
    attributeName: "BLIS",
    value: true,
    status: "found",
    confidence: 0.9,
    confidenceLevel: "high",
    sourceLabel: "Ficha técnica",
  },
];

function unwrapData<T>(data: T[] | { data?: T[] }) {
  return Array.isArray(data) ? data : data.data ?? [];
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
  return {
    ...vehicle,
    brandName: vehicle.brandName ?? brandNameFromBrandId(vehicle.brandId),
  };
}

function normalizeConfidenceLevel(
  confidenceLevel: SpecValue["confidenceLevel"] | string | undefined
): SpecValue["confidenceLevel"] {
  if (confidenceLevel === "high" || confidenceLevel === "ALTA") return "high";
  if (confidenceLevel === "medium" || confidenceLevel === "MEDIA") return "medium";
  if (confidenceLevel === "low" || confidenceLevel === "BAIXA") return "low";
  return "unknown";
}

function normalizeSpecStatus(
  status: SpecValue["status"] | string | undefined
): SpecValue["status"] {
  if (status === "found" || status === "CONFIRMADO") return "found";
  if (status === "not_available") return "not_available";
  if (status === "not_informed" || status === "NAO_INFORMADO") return "not_informed";
  if (status === "conflict" || status === "CONFLITO") return "conflict";
  return "pending_validation";
}

function normalizeSpec(spec: SpecValue): SpecValue {
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
    value?: string | number | boolean | null;
    formattedValue?: string;
    unit?: string | null;
    difference?: string;
    confidence?: number;
    confidenceLevel?: string;
  }[];
};

type ApiComparisonResult = Omit<ComparisonResult, "rows"> & {
  rows: ApiComparisonRow[];
};

function formatCellValue(value: unknown, unit?: string | null) {
  if (value === null || value === undefined) return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return unit ? `${String(value)} ${unit}` : String(value);
}

function normalizeDifference(
  difference: ComparisonResult["rows"][number]["difference"] | string | undefined
): ComparisonResult["rows"][number]["difference"] {
  const normalized = difference?.toLowerCase();

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

function normalizeComparisonResult(result: ApiComparisonResult): ComparisonResult {
  return {
    ...result,
    rows: result.rows.map((row: ApiComparisonRow) => {
      const fordCell = row.cells?.[0];
      const competitorCell = row.cells?.[1];

      return {
        attributeId: row.attributeId ?? row.canonicalName ?? "attribute",
        attributeName:
          row.attributeName ?? row.canonicalName ?? row.attributeId ?? "Atributo",
        fordValue:
          row.fordValue ??
          fordCell?.formattedValue ??
          formatCellValue(fordCell?.value, fordCell?.unit),
        competitorValue:
          row.competitorValue ??
          competitorCell?.formattedValue ??
          formatCellValue(competitorCell?.value, competitorCell?.unit),
        difference: normalizeDifference(
          row.difference ?? competitorCell?.difference ?? fordCell?.difference
        ),
        confidenceLevel: normalizeConfidenceLevel(
          row.confidenceLevel ?? fordCell?.confidenceLevel ?? competitorCell?.confidenceLevel
        ),
      };
    }),
  };
}

async function fetchMeFromApi(): Promise<User> {
  const { data } = await api.get("/usuarios/me");
  return normalizeUser(data);
}

async function fetchVehiclesFromApi(): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[] | { data?: Vehicle[] }>("/veiculos");
  return unwrapData(data).map(normalizeVehicle);
}

async function fetchAttributesFromApi(): Promise<TechnicalAttribute[]> {
  const { data } = await api.get<
    TechnicalAttribute[] | { data?: TechnicalAttribute[] }
  >("/atributos/taxonomia");
  return unwrapData(data);
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

export async function getMe(): Promise<User> {
  try {
    return await fetchMeFromApi();
  } catch {
    return mockUser;
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    return await fetchVehiclesFromApi();
  } catch {
    return mockVehicles;
  }
}

export async function getVehicleVersions(
  vehicleId: string
): Promise<VehicleVersion[]> {
  try {
    const { data } = await api.get<VehicleVersion[] | { data?: VehicleVersion[] }>(
      `/veiculos/${vehicleId}/versoes`
    );
    return unwrapData(data);
  } catch {
    return mockVersions.filter((version) => version.vehicleId === vehicleId);
  }
}

export async function getAttributes(): Promise<TechnicalAttribute[]> {
  try {
    return await fetchAttributesFromApi();
  } catch {
    return mockAttributes;
  }
}

export async function getVersionSpecifications(
  versionId: string
): Promise<SpecValue[]> {
  try {
    const { data } = await api.get<SpecValue[] | { data?: SpecValue[] }>(
      `/versoes/${versionId}/especificacoes`
    );
    return unwrapData(data).map(normalizeSpec);
  } catch {
    return mockSpecs.filter((spec) => spec.versionId === versionId);
  }
}

export type CreateComparisonInput = {
  referenceVersionId: string;
  competitorVersionIds: string[];
  attributeIds: string[];
  customerProfileId?: string;
};

export async function createComparison(
  input: CreateComparisonInput
): Promise<ComparisonResult> {
  const { data } = await api.post<ApiComparisonResult>("/comparacoes", input);
  return normalizeComparisonResult(data);
}

export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  try {
    const { data } = await api.get<Vehicle>(`/veiculos/${vehicleId}`);
    return normalizeVehicle(data);
  } catch {
    return mockVehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;
  }
}

export async function getVersionById(
  versionId: string
): Promise<VehicleVersion | null> {
  try {
    const { data } = await api.get(`/versoes/${versionId}`);
    return data;
  } catch {
    return mockVersions.find((version) => version.id === versionId) ?? null;
  }
}

export type ApiHealthStatus = {
  mode: "api" | "mock";
  baseUrl: string;
  checkedAt: string;
  auth: "authenticated" | "missing" | "failed";
};

export async function getApiStatus(): Promise<ApiHealthStatus> {
  try {
    await fetchMeFromApi();

    return {
      mode: "api",
      baseUrl: API_BASE_URL,
      checkedAt: new Date().toISOString(),
      auth: "authenticated",
    };
  } catch {
    const session = await loadAuthSession();

    return {
      mode: "mock",
      baseUrl: API_BASE_URL,
      checkedAt: new Date().toISOString(),
      auth: session ? "failed" : "missing",
    };
  }
}
