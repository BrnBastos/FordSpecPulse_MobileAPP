import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
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

export async function getMe(): Promise<User> {
  try {
    const { data } = await api.get("/users/me");
    return data;
  } catch {
    return mockUser;
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const { data } = await api.get("/vehicles");
    return data.data ?? data;
  } catch {
    return mockVehicles;
  }
}

export async function getVehicleVersions(
  vehicleId: string
): Promise<VehicleVersion[]> {
  try {
    const { data } = await api.get(`/vehicles/${vehicleId}/versions`);
    return data.data ?? data;
  } catch {
    return mockVersions.filter((version) => version.vehicleId === vehicleId);
  }
}

export async function getAttributes(): Promise<TechnicalAttribute[]> {
  try {
    const { data } = await api.get("/attributes/taxonomy");
    return data.data ?? data;
  } catch {
    return mockAttributes;
  }
}

export async function getVersionSpecifications(
  versionId: string
): Promise<SpecValue[]> {
  try {
    const { data } = await api.get(`/versions/${versionId}/specifications`);
    return data.data ?? data;
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
  input?: CreateComparisonInput
): Promise<ComparisonResult> {
  const fallbackInput: CreateComparisonInput = {
    referenceVersionId: "version-ford-ranger-limited-plus-v6-2026",
    competitorVersionIds: ["version-toyota-hilux-gr-sport-2026"],
    attributeIds: mockAttributes.map((item) => item.id),
    customerProfileId: "urban_premium",
  };

  const payload = input ?? fallbackInput;

  try {
    const { data } = await api.post("/comparisons", payload);
    return data;
  } catch {
    const selectedAttributeNames = mockAttributes
      .filter((attribute) => payload.attributeIds.includes(attribute.id))
      .map((attribute) => attribute.canonicalName);

    return {
      id: "comparison-demo-001",
      status: "ready",
      summary: {
        confidence: 0.82,
        executiveSummary:
          "A Ranger Limited+ apresenta vantagem em atributos estratégicos selecionados, especialmente quando os dados indicam presença confirmada e alta confiança. Alguns pontos concorrentes ainda exigem validação.",
        keyAdvantages: [
          "A comparação foi criada usando os atributos selecionados pelo usuário.",
          "A Ford apresenta boa força nos atributos técnicos de maior peso estratégico.",
          "A análise diferencia dados encontrados de dados apenas não informados.",
        ],
        keyGaps: [
          "Alguns atributos concorrentes podem estar como não informados.",
          "Dados com baixa confiança devem ser revisados antes de decisão final.",
        ],
        validationWarnings: [
          "Dados not_informed não devem ser tratados como ausência confirmada.",
          `Atributos analisados: ${selectedAttributeNames.join(", ") || "atributos padrão"}.`,
        ],
      },
      rows: mockAttributes
        .filter((attribute) => payload.attributeIds.includes(attribute.id))
        .map((attribute, index) => ({
          attributeId: attribute.id,
          attributeName: attribute.canonicalName,
          fordValue: index % 2 === 0 ? "Sim" : "600 Nm",
          competitorValue: index % 3 === 0 ? "Não informado" : "Sim",
          difference:
            index % 3 === 0
              ? "unknown"
              : index % 2 === 0
                ? "advantage"
                : "parity",
          confidenceLevel: index % 3 === 0 ? "medium" : "high",
        })),
    };
  }
}

export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  try {
    const { data } = await api.get(`/vehicles/${vehicleId}`);
    return data;
  } catch {
    return mockVehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;
  }
}

export async function getVersionById(
  versionId: string
): Promise<VehicleVersion | null> {
  try {
    const { data } = await api.get(`/versions/${versionId}`);
    return data;
  } catch {
    return mockVersions.find((version) => version.id === versionId) ?? null;
  }
}

export type ApiHealthStatus = {
  mode: "api" | "mock";
  baseUrl: string;
  checkedAt: string;
};

export async function getApiStatus(): Promise<ApiHealthStatus> {
  try {
    await api.get("/users/me");

    return {
      mode: "api",
      baseUrl: API_BASE_URL,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      mode: "mock",
      baseUrl: API_BASE_URL,
      checkedAt: new Date().toISOString(),
    };
  }
}