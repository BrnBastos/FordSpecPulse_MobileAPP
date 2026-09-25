import { test } from "node:test";
import assert from "node:assert/strict";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { normalizeComparisonResult } from "../src/services/adapters";
import {
  formatValue,
  requestedSpecifications,
} from "../src/services/specifications";
import { useComparisonStore } from "../src/store/comparisonStore";
import { api, login, logout, getStoredAuthSession } from "../src/services/auth";
import {
  saveAnalysis,
  readHistory,
  deleteAnalysis,
  parseHistory,
} from "../src/services/history";
import type {
  ComparisonResult,
  TechnicalAttribute,
} from "../src/services/specpulseApi";
Object.assign(globalThis, {
  secure: new Map(),
  storage: new Map(),
  failStorage: false,
});
const input = {
  referenceVersionId: "ford",
  competitorVersionIds: ["other"],
  attributeIds: ["torque", "camera"],
};
const summary = {
  confidence: 1,
  executiveSummary: "Teste",
  keyAdvantages: [],
  keyGaps: [],
  validationWarnings: [],
};
const base = { id: "one", status: "done", summary };
const result: ComparisonResult = { ...base, rows: [] };
const attribute: TechnicalAttribute = {
  id: "camera",
  canonicalName: "Câmera",
  category: "safety",
  strategicWeight: 1,
};
function authResponse(id = "a", expired = false) {
  return {
    accessToken: `access-${id}`,
    refreshToken: `refresh-${id}`,
    expiraEm: new Date(Date.now() + (expired ? -60000 : 3600000)).toISOString(),
    refreshExpiraEm: new Date(Date.now() + 86400000).toISOString(),
    usuario: { id, nome: id, email: `${id}@test.invalid`, perfil: "ANALISTA" },
  };
}
function response(data: unknown, config: InternalAxiosRequestConfig) {
  return { data, status: 200, statusText: "OK", headers: {}, config };
}
async function signIn(id = "a", expired = false) {
  axios.defaults.adapter = async (config) =>
    response(authResponse(id, expired), config);
  await login({ email: `${id}@test.invalid`, senha: "test-only" });
}
test("legacy tokens migrate to secure storage and plaintext is removed", async () => {
  const globals = globalThis as unknown as {
    storage: Map<string, string>;
    secure: Map<string, string>;
  };
  const data = authResponse();
  globals.storage.set(
    "specpulse.authSession.v1",
    JSON.stringify({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiraEm,
      refreshExpiresAt: data.refreshExpiraEm,
      user: { id: "a", name: "A", email: "a@test.invalid", roles: ["analyst"] },
    }),
  );
  assert.equal((await getStoredAuthSession())?.user.id, "a");
  assert.equal(globals.storage.has("specpulse.authSession.v1"), false);
  assert.equal(globals.secure.has("specpulse.authSession.v1"), true);
});
test("values preserve zero, false, missing and units", () => {
  assert.equal(formatValue(0, "Nm"), "0 Nm");
  assert.equal(formatValue(false), "Não");
  assert.equal(formatValue(null), "Não informado");
});
test("individual queries retain missing requested attributes", () => {
  const rows = requestedSpecifications("ford", [attribute], []);
  assert.equal(rows[0].spec.status, "not_informed");
  assert.equal(rows[0].category, "safety");
});
test("comparison cells are matched by version identity despite reversed order", () => {
  const output = normalizeComparisonResult(
    {
      ...base,
      rows: [
        {
          attributeId: "torque",
          cells: [
            { versionId: "other", value: 400, unit: "Nm" },
            { versionId: "ford", value: 0, unit: "Nm" },
          ],
        },
      ],
    },
    input,
  );
  assert.equal(output.rows[0].fordValue, "0 Nm");
  assert.equal(output.rows[0].competitorValue, "400 Nm");
  assert.equal(output.rows[1].fordValue, "Não informado");
});
test("unidentified cells fail rather than silently swapping vehicles", () => {
  assert.throws(
    () =>
      normalizeComparisonResult(
        { ...base, rows: [{ attributeId: "torque", cells: [{ value: 600 }] }] },
        input,
      ),
    /identificar/,
  );
});
test("incompatible units cannot claim an advantage", () => {
  const output = normalizeComparisonResult(
    {
      ...base,
      rows: [
        {
          attributeId: "torque",
          difference: "advantage",
          cells: [
            { versionId: "ford", value: 600, unit: "Nm" },
            { versionId: "other", value: 400, unit: "lb-ft" },
          ],
        },
      ],
    },
    input,
  );
  assert.equal(output.rows[0].difference, "unknown");
});
test("conflict status survives normalization", () => {
  const output = normalizeComparisonResult(
    {
      ...base,
      rows: [
        {
          attributeId: "torque",
          cells: [{ versionId: "ford", value: 600, status: "CONFLITO" }],
        },
      ],
    },
    input,
  );
  assert.equal(output.rows[0].fordSpec?.status, "conflict");
});
test("selection changes invalidate stale results and preserve unrelated input", () => {
  const store = useComparisonStore;
  store.getState().setFordVersionId("ford");
  store.getState().setCompetitorVersionId("other");
  store.getState().toggleAttribute("camera");
  store.getState().setCurrentComparison(result);
  store.getState().setFordVersionId(null);
  assert.equal(store.getState().currentComparison, null);
  assert.equal(store.getState().competitorVersionId, "other");
  assert.deepEqual(store.getState().selectedAttributeIds, ["camera"]);
});
test("corrupt or cross-account history is rejected", () => {
  assert.throws(() => parseHistory("{", "a"));
  assert.throws(() =>
    parseHistory(JSON.stringify({ schema: 1, userId: "b", items: [] }), "a"),
  );
});
test("history deduplicates, reopens, deletes individually and isolates accounts", async () => {
  await signIn("a");
  await saveAnalysis(result);
  await saveAnalysis(result);
  await saveAnalysis({ ...result, id: "two" });
  assert.equal((await readHistory()).length, 2);
  assert.deepEqual((await readHistory())[1].result, result);
  await deleteAnalysis("one");
  assert.equal((await readHistory())[0].id, "two");
  await logout();
  await signIn("b");
  assert.deepEqual(await readHistory(), []);
});
test("refresh timeout preserves the session", async () => {
  await signIn("a", true);
  axios.defaults.adapter = async () => {
    throw new AxiosError("timeout", "ECONNABORTED");
  };
  await assert.rejects(api.get("/test"));
  assert.equal((await getStoredAuthSession())?.user.id, "a");
});
test("concurrent expired requests share one refresh", async () => {
  await signIn("a", true);
  let calls = 0;
  axios.defaults.adapter = async (config) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return response(authResponse(), config);
  };
  api.defaults.adapter = async (config) => response({}, config);
  await Promise.all([api.get("/one"), api.get("/two")]);
  assert.equal(calls, 1);
});
test("invalid refresh clears session", async () => {
  await signIn("a", true);
  axios.defaults.adapter = async (config) => {
    throw new AxiosError("invalid", "ERR_BAD_REQUEST", config, null, {
      ...response({}, config),
      status: 401,
    });
  };
  await api.get("/test").catch(() => {});
  assert.equal(await getStoredAuthSession(), null);
});
test("logout prevents a late refresh from restoring the session", async () => {
  await signIn("a", true);
  let resolveRefresh: (() => void) | undefined;
  axios.defaults.adapter = (config) =>
    config.url?.endsWith("/auth/refresh")
      ? new Promise((resolve) => {
          resolveRefresh = () => resolve(response(authResponse(), config));
        })
      : Promise.resolve(response({}, config));
  const pending = api.get("/test").catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 5));
  await logout();
  resolveRefresh?.();
  await pending;
  assert.equal(await getStoredAuthSession(), null);
});

test("storage failure is surfaced without claiming a saved analysis", async () => {
  await signIn("storage-error");
  Object.assign(globalThis, { failStorage: true });
  try {
    await assert.rejects(saveAnalysis(result), /Storage unavailable/);
  } finally {
    Object.assign(globalThis, { failStorage: false });
  }
  assert.deepEqual(await readHistory(), []);
});
test("a denied POST is not automatically submitted again", async () => {
  await signIn();
  let posts = 0;
  api.defaults.adapter = async (config) => {
    posts++;
    throw new AxiosError("denied", "ERR_BAD_REQUEST", config, null, {
      ...response({}, config),
      status: 401,
    });
  };
  await assert.rejects(api.post("/comparacoes", input));
  assert.equal(posts, 1);
});
test("late private responses from a logged-out account are discarded", async () => {
  await signIn("a");
  let finish: (() => void) | undefined;
  api.defaults.adapter = (config) =>
    new Promise((resolve) => {
      finish = () => resolve(response({ private: "account-a" }, config));
    });
  const pending = api.get("/private");
  const rejected = assert.rejects(pending);
  await new Promise((resolve) => setTimeout(resolve, 5));
  await logout();
  await signIn("b");
  finish?.();
  await rejected;
  assert.equal((await getStoredAuthSession())?.user.id, "b");
});
test("malformed partial responses fail explicitly", () => {
  assert.throws(
    () => normalizeComparisonResult({ ...base, rows: [null] } as never, input),
    /inválidas/,
  );
  assert.throws(() => parseHistory("null", "a"));
});

test("invalid brand placement is rejected before submitting a comparison", async () => {
  const { createComparison } = await import("../src/services/specpulseApi");
  await signIn();
  let posts = 0;
  api.defaults.adapter = async (config) => {
    if (config.method === "post") posts++;
    if (config.url === "/atributos/taxonomia")
      return response([attribute], config);
    if (config.url?.startsWith("/versoes/"))
      return response(
        {
          id: config.url.endsWith("ford") ? "ford" : "other",
          vehicleId: "toyota",
          name: "Versão",
        },
        config,
      );
    return response(
      {
        id: "toyota",
        brandId: "brand-toyota",
        brandName: "Toyota",
        model: "Hilux",
        year: 2026,
        market: "BR",
      },
      config,
    );
  };
  await assert.rejects(
    createComparison({ ...input, attributeIds: ["camera"] }),
    /válidos/,
  );
  assert.equal(posts, 0);
});

test("switching accounts directly also rejects prior private responses", async () => {
  await signIn("direct-a");
  let finish: (() => void) | undefined;
  api.defaults.adapter = (config) =>
    new Promise((resolve) => {
      finish = () => resolve(response({ private: "a" }, config));
    });
  const request = api.get("/private");
  const rejected = assert.rejects(request);
  await new Promise((resolve) => setTimeout(resolve, 5));
  await signIn("direct-b");
  finish?.();
  await rejected;
  assert.equal((await getStoredAuthSession())?.user.id, "direct-b");
});
