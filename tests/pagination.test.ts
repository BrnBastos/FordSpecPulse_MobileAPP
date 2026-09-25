import { test } from "node:test";
import assert from "node:assert/strict";
import axios, { type InternalAxiosRequestConfig } from "axios";
import { api, login } from "../src/services/auth";
import { fetchAllPages } from "../src/services/pagination";
import {
  getVehicles,
  getVehicleVersions,
  getAttributes,
  getVersionSpecifications,
} from "../src/services/specpulseApi";

Object.assign(globalThis, { secure: new Map(), storage: new Map() });

function response(data: unknown, config: InternalAxiosRequestConfig) {
  return { data, status: 200, statusText: "OK", headers: {}, config };
}
const row = (id: number) => ({ id: String(id) });
const key = (item: { id: string }) => item?.id;

test("all four catalogs load beyond page 25 and retain the last item", async () => {
  const requests: Record<string, number[]> = {};
  api.defaults.adapter = async (config) => {
    const page = config.params.page;
    const pageSize = config.params.pageSize;
    const path = config.url!;
    (requests[path] ??= []).push(page);
    const data = Array.from({ length: 53 }, (_, id) => {
      if (path === "/veiculos")
        return { id: String(id), model: "Ranger", brandId: "brand-ford" };
      if (path === "/veiculos/vehicle/versoes")
        return { id: String(id), name: "Raptor", vehicleId: "vehicle" };
      if (path === "/atributos/taxonomia")
        return { id: String(id), canonicalName: `Atributo ${id}` };
      return {
        versionId: "version",
        attributeId: String(id),
        value: id,
        status: "found",
      };
    }).slice((page - 1) * pageSize, page * pageSize);
    return response({ data, page, pageSize, total: 53 }, config);
  };
  const vehicles = await getVehicles();
  const versions = await getVehicleVersions("vehicle");
  const attributes = await getAttributes();
  const specifications = await getVersionSpecifications("version");
  for (const list of [vehicles, versions, attributes, specifications])
    assert.equal(list.length, 53);
  assert.equal(vehicles[52].brandName, "Ford");
  assert.equal(versions[52].id, "52");
  assert.equal(attributes[52].canonicalName, "Atributo 52");
  assert.equal(specifications[52].value, 52);
  assert.equal(specifications[0].value, 0);
  assert.deepEqual(Object.values(requests), Array(4).fill([1, 2, 3]));
});

test("legacy arrays and data-only wrappers remain complete single responses", async () => {
  for (const data of [[row(1)], { data: [row(1)] }, []]) {
    let requests = 0;
    api.defaults.adapter = async (config) => {
      requests++;
      return response(data, config);
    };
    assert.deepEqual(
      await fetchAllPages("/legacy", key),
      Array.isArray(data) ? data : data.data,
    );
    assert.equal(requests, 1);
  }
});

test("pagination follows a smaller server page size and stops without an extra request", async () => {
  const params: unknown[] = [];
  api.defaults.adapter = async (config) => {
    params.push(config.params);
    const page = config.params.page;
    return response({ data: [row(page)], page, pageSize: 1, total: 2 }, config);
  };
  assert.deepEqual(await fetchAllPages("/capped", key), [row(1), row(2)]);
  assert.deepEqual(params, [
    { page: 1, pageSize: 25 },
    { page: 2, pageSize: 1 },
  ]);
});

test("empty catalog completes after one correctly formed page", async () => {
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    return response({ data: [], page: 1, pageSize: 25, total: 0 }, config);
  };
  assert.deepEqual(await fetchAllPages("/empty", key), []);
  assert.equal(calls, 1);
});

test("malformed metadata and incomplete lists fail instead of returning partial data", async () => {
  const valid = { data: [row(1)], page: 1, pageSize: 25, total: 1 };
  for (const data of [
    null,
    { data: null },
    { data: [], page: 1 },
    { ...valid, page: 0 },
    { ...valid, pageSize: 0 },
    { ...valid, pageSize: 1.5 },
    { ...valid, total: -1 },
    { ...valid, total: "1" },
    { ...valid, total: 5 },
    { ...valid, total: 0 },
    { ...valid, total: Number.MAX_SAFE_INTEGER + 1 },
    { ...valid, total: 25001 },
  ]) {
    api.defaults.adapter = async (config) => response(data, config);
    await assert.rejects(fetchAllPages("/invalid", key));
  }
});

test("repeated pages, duplicate identities and changing catalogs fail without loops", async () => {
  for (const next of [
    { data: [row(1)], page: 1, pageSize: 1, total: 2 },
    { data: [row(1)], page: 2, pageSize: 1, total: 2 },
    { data: [row(2)], page: 2, pageSize: 1, total: 3 },
    { data: [row(2)], page: 2, pageSize: 2, total: 2 },
    { data: [], page: 2, pageSize: 1, total: 2 },
    [row(2)],
    { data: [row(2)] },
  ]) {
    let calls = 0;
    api.defaults.adapter = async (config) => {
      calls++;
      return response(
        calls === 1 ? { data: [row(1)], page: 1, pageSize: 1, total: 2 } : next,
        config,
      );
    };
    await assert.rejects(fetchAllPages("/changing", key));
    assert.equal(calls, 2);
  }
});

test("specifications reject records from a different version", async () => {
  api.defaults.adapter = async (config) =>
    response(
      [{ versionId: "other", attributeId: "torque", value: 500 }],
      config,
    );
  await assert.rejects(getVersionSpecifications("version"), /inválida/);
});

test("a failure on later pages never resolves a partial catalog", async () => {
  api.defaults.adapter = async (config) => {
    if (config.params.page === 2) throw new Error("Network offline");
    return response({ data: [row(1)], page: 1, pageSize: 1, total: 2 }, config);
  };
  await assert.rejects(fetchAllPages("/offline", key), /Network offline/);
});

test("switching sessions after a response stops pagination before another account can contribute", async () => {
  async function signIn(id: string) {
    axios.defaults.adapter = async (config) =>
      response(
        {
          accessToken: `access-${id}`,
          refreshToken: `refresh-${id}`,
          expiraEm: new Date(Date.now() + 3600000).toISOString(),
          refreshExpiraEm: new Date(Date.now() + 86400000).toISOString(),
          usuario: {
            id,
            nome: id,
            email: `${id}@test.invalid`,
            perfil: "ANALISTA",
          },
        },
        config,
      );
    await login({ email: `${id}@test.invalid`, senha: "test-only" });
  }
  await signIn("account-a");
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    return response({ data: [row(1)], page: 1, pageSize: 1, total: 2 }, config);
  };
  // Registered after auth's interceptor: simulate an account switch after that
  // per-request check, while the multi-page operation is still in progress.
  const interceptor = api.interceptors.response.use(async (value) => {
    await signIn("account-b");
    return value;
  });
  try {
    await assert.rejects(fetchAllPages("/private", key), (error: unknown) =>
      axios.isCancel(error),
    );
    assert.equal(calls, 1);
  } finally {
    api.interceptors.response.eject(interceptor);
  }
});
