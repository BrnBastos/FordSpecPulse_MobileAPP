import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const dir = await mkdtemp(join(tmpdir(), "specpulse-tests-"));
try {
  const outfile = join(dir, "tests.cjs");
  await build({
    entryPoints: ["tests/behavior.test.ts"],
    outfile,
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["node:*"],
    plugins: [
      {
        name: "native-test-storage",
        setup(build) {
          build.onResolve(
            {
              filter:
                /^(react-native|expo-secure-store|@react-native-async-storage\/async-storage)$/,
            },
            (args) => ({ path: args.path, namespace: "test-native" }),
          );
          build.onLoad({ filter: /.*/, namespace: "test-native" }, (args) => ({
            contents:
              args.path === "react-native"
                ? 'export const Platform = { OS: "android" };'
                : args.path === "expo-secure-store"
                  ? "export const getItemAsync = key => globalThis.secure.get(key) ?? null; export const setItemAsync = async (key, value) => { globalThis.secure.set(key, value); }; export const deleteItemAsync = async key => { globalThis.secure.delete(key); };"
                  : 'export default { getItem: async key => globalThis.storage.get(key) ?? null, setItem: async (key,value) => { if(globalThis.failStorage) throw new Error("Storage unavailable"); globalThis.storage.set(key,value); }, removeItem: async key => { globalThis.storage.delete(key); } };',
            loader: "js",
          }));
        },
      },
    ],
  });
  process.exitCode =
    spawnSync(process.execPath, ["--test", outfile], { stdio: "inherit" })
      .status ?? 1;
} finally {
  await rm(dir, { recursive: true, force: true });
}
