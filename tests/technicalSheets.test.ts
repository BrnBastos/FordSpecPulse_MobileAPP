import { test } from "node:test";
import assert from "node:assert/strict";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { api, login } from "../src/services/auth";
import {
  createComparison,
  type Vehicle,
  type VehicleVersion,
} from "../src/services/specpulseApi";
import {
  normalizeRequestedTerms,
  normalizeTechnicalSheet,
  appendRequestedRows,
} from "../src/services/technicalSheets";
import { useComparisonStore } from "../src/store/comparisonStore";

Object.assign(globalThis, { secure: new Map(), storage: new Map() });
const vehicle: Vehicle = {
  id: "vehicle-ford",
  brandId: "brand-ford",
  brandName: "Ford",
  model: "Ranger",
  year: 2024,
  market: "BR",
  segment: "pickup",
  updatedAt: "2026-09-25",
};
const version: VehicleVersion = {
  id: "ford",
  vehicleId: vehicle.id,
  name: "Raptor",
  powertrain: "gasoline",
  drivetrain: "4x4",
  versionLevel: "",
  dataCompleteness: 0,
};
const input = {
  vehicle,
  version,
  attributes: ["potência", "controle de descida"],
};
const raw = {
  versaoId: "cb8ef3db-1f47-4508-bc72-d8c68b7d95c0",
  marca: "Ford",
  modelo: "Ranger",
  versao: "Raptor",
  anoModelo: 2024,
  mercado: "BR",
  consultadoEm: "2026-09-25T14:00:00Z",
  itens: [
    {
      termoSolicitado: "potência",
      codigoCanonico: "POWER",
      nomeExibicao: "Potência máxima",
      categoria: "MOTOR",
      valor: "397 cv",
      unidade: "cv",
      status: "PRESENTE",
      fonte: "Fonte do teste",
      dataCaptura: "2026-09-24T12:00:00Z",
    },
  ],
};
const response = (data: unknown, config: InternalAxiosRequestConfig) => ({
  data,
  config,
  status: 200,
  statusText: "OK",
  headers: {},
});
const base = {
  id: "comparison",
  status: "done",
  rows: [],
  summary: {
    confidence: 0,
    executiveSummary: "Server",
    keyAdvantages: ["Not necessarily requested"],
    keyGaps: [],
    validationWarnings: [],
  },
};

test("free terms deduplicate whitespace, case and accents without discarding unknown requests", () => {
  assert.deepEqual(
    normalizeRequestedTerms(["  Potência ", "potencia", "Som   premium"]),
    ["Potência", "Som premium"],
  );
  assert.throws(() => normalizeRequestedTerms([""]));
  assert.throws(() =>
    normalizeRequestedTerms(Array.from({ length: 51 }, (_, i) => `term ${i}`)),
  );
});
test("sheet retains formatted values, sources and omitted requested rows", () => {
  const result = normalizeTechnicalSheet(raw, input);
  assert.equal(result.versionId, "ford");
  assert.equal(result.items[0].value, "397 cv");
  assert.equal(result.items[0].sourceLabel, "Fonte do teste");
  assert.equal(result.items[1].requestedTerm, "controle de descida");
  assert.equal(result.items[1].status, "not_informed");
});
test("sheet response order does not alter requested identity", () => {
  const result = normalizeTechnicalSheet(
    {
      ...raw,
      itens: [
        {
          termoSolicitado: "controle de descida",
          status: "PRESENTE",
          valor: "Não",
        },
        ...raw.itens,
      ],
    },
    input,
  );
  assert.equal(result.items[0].value, "397 cv");
  assert.equal(result.items[1].value, "Não");
});
test("wrong model-year, market, version and UUID are rejected before display", () => {
  for (const patch of [
    { anoModelo: 2026 },
    { mercado: "US" },
    { modelo: "Hilux" },
    { marca: "Toyota" },
    { versao: "Limited" },
  ])
    assert.throws(
      () => normalizeTechnicalSheet({ ...raw, ...patch }, input),
      /corresponde/,
    );
  assert.throws(
    () =>
      normalizeTechnicalSheet(raw, {
        ...input,
        version: { ...version, id: "d281173a-4a8c-414b-88a9-6a383f854785" },
      }),
    /corresponde/,
  );
});
test("unknown and unavailable terms remain explicit without converting absence to false", () => {
  for (const [status, expected] of [
    ["ATRIBUTO_DESCONHECIDO", "unknown_attribute"],
    ["NAO_DISPONIVEL", "not_available"],
    ["NAO_INFORMADO", "not_informed"],
  ]) {
    const sheet = normalizeTechnicalSheet(
      { ...raw, itens: [{ termoSolicitado: "potência", status, valor: null }] },
      input,
    );
    assert.equal(sheet.items[0].status, expected);
    assert.equal(sheet.items[0].value, null);
  }
});
test("malformed, duplicate and unsolicited rows fail explicitly", () => {
  for (const itens of [
    [null],
    [...raw.itens, ...raw.itens],
    [{ termoSolicitado: "not requested", status: "PRESENTE", valor: "0" }],
    [{ termoSolicitado: "potência", status: "PRESENTE", valor: null }],
    [{ termoSolicitado: "potência", status: "made_up", valor: "0" }],
  ])
    assert.throws(() => normalizeTechnicalSheet({ ...raw, itens }, input));
});
test("free comparison keeps two formatted values, equal values and no invented advantages", () => {
  const sheet = normalizeTechnicalSheet(raw, input);
  const selection = {
    referenceVersionId: "ford",
    competitorVersionIds: ["other"],
    attributeIds: [],
    requestedAttributes: input.attributes,
  };
  const result = appendRequestedRows(
    base,
    sheet,
    { ...sheet, versionId: "other" },
    selection,
  );
  assert.equal(result.rows[0].fordValue, "397 cv");
  assert.equal(result.rows[0].competitorValue, "397 cv");
  assert.equal(result.rows[0].difference, "parity");
  assert.equal(result.rows[1].difference, "unknown");
  assert.deepEqual(result.summary.keyAdvantages, []);
  const differentUnit = {
    ...sheet,
    items: sheet.items.map((item) => ({ ...item, unit: "hp" })),
  };
  assert.equal(
    appendRequestedRows(base, sheet, differentUnit, selection).rows[0]
      .difference,
    "unknown",
  );
});

async function signIn() {
  axios.defaults.adapter = async (config) =>
    response(
      {
        accessToken: "test-access",
        refreshToken: "test-refresh",
        expiraEm: new Date(Date.now() + 3600000).toISOString(),
        refreshExpiraEm: new Date(Date.now() + 86400000).toISOString(),
        usuario: {
          id: "test",
          email: "test@example.invalid",
          perfil: "ANALISTA",
        },
      },
      config,
    );
  await login({ email: "test@example.invalid", senha: "test-only" });
}
function setupComparison(denied: boolean) {
  const requests: { path: string; data: unknown }[] = [];
  api.defaults.adapter = async (config) => {
    const path = config.url!;
    if (config.method === "post")
      requests.push({ path, data: JSON.parse(config.data) });
    if (path === "/atributos/taxonomia") return response([], config);
    if (path === "/versoes/ford") return response(version, config);
    if (path === "/versoes/other")
      return response(
        { ...version, id: "other", vehicleId: "vehicle-other", name: "SRX" },
        config,
      );
    if (path === "/veiculos/vehicle-ford") return response(vehicle, config);
    if (path === "/veiculos/vehicle-other")
      return response(
        {
          ...vehicle,
          id: "vehicle-other",
          brandId: "brand-toyota",
          brandName: "Toyota",
          model: "Hilux",
        },
        config,
      );
    if (path === "/comparacoes") {
      if (denied)
        throw new AxiosError("Denied", "ERR_BAD_REQUEST", config, null, {
          ...response({}, config),
          status: 403,
        });
      return response(base, config);
    }
    if (path === "/fichas-tecnicas/consultar") {
      const body = JSON.parse(config.data);
      return response(
        { ...raw, marca: body.marca, modelo: body.modelo, versao: body.versao },
        config,
      );
    }
    throw new Error(`Unexpected request ${path}`);
  };
  return requests;
}
test("free-only comparison still enforces the comparison endpoint's 403 and makes no sheet calls", async () => {
  await signIn();
  const requests = setupComparison(true);
  await assert.rejects(
    createComparison({
      referenceVersionId: "ford",
      competitorVersionIds: ["other"],
      attributeIds: [],
      requestedAttributes: input.attributes,
    }),
    (error: unknown) =>
      axios.isAxiosError(error) && error.response?.status === 403,
  );
  assert.equal(requests.length, 1);
  assert.equal(requests[0].path, "/comparacoes");
});
test("free-only comparison authorizes once and queries both real sheets without invented attribute IDs", async () => {
  await signIn();
  const requests = setupComparison(false);
  const result = await createComparison({
    referenceVersionId: "ford",
    competitorVersionIds: ["other"],
    attributeIds: [],
    requestedAttributes: input.attributes,
  });
  assert.equal(requests.length, 3);
  assert.deepEqual(requests[0].data, {
    referenceVersionId: "ford",
    competitorVersionIds: ["other"],
    attributeIds: [],
  });
  assert.deepEqual(
    (requests[1].data as { atributos: string[] }).atributos,
    input.attributes,
  );
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].fordSpec?.versionId, "ford");
  assert.equal(result.rows[0].competitorSpec?.versionId, "other");
  assert.deepEqual(result.selection?.requestedAttributes, input.attributes);
});
test("detail identity mismatches are rejected before any comparison is submitted", async () => {
  const { getVersionById, getVehicleById } =
    await import("../src/services/specpulseApi");
  api.defaults.adapter = async (config) =>
    response(
      config.url?.startsWith("/versoes")
        ? { ...version, id: "wrong" }
        : { ...vehicle, id: "wrong" },
      config,
    );
  await assert.rejects(getVersionById("ford"), /inválida/);
  await assert.rejects(getVehicleById("vehicle-ford"), /inválida/);
});
test("free-term edits clear old results and reset removes requests between accounts", () => {
  const store = useComparisonStore;
  store.getState().setCurrentComparison(base);
  store.getState().setRequestedAttributes(["banco elétrico"]);
  assert.equal(store.getState().currentComparison, null);
  store.getState().reset();
  assert.deepEqual(store.getState().requestedAttributes, []);
});
