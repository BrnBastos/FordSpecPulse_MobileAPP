import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ComparisonResult } from "./specpulseApi";
import { getStoredAuthSession } from "./auth";
export type SavedAnalysis = {
  id: string;
  savedAt: string;
  result: ComparisonResult;
};
export function parseHistory(
  raw: string | null,
  userId: string,
): SavedAnalysis[] {
  if (!raw) return [];
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      "O histórico salvo está corrompido. Você pode limpar os dados desta conta.",
    );
  }
  if (
    !data ||
    data.schema !== 1 ||
    data.userId !== userId ||
    !Array.isArray(data.items) ||
    data.items.some(
      (item: SavedAnalysis) =>
        !item ||
        typeof item.id !== "string" ||
        typeof item.savedAt !== "string" ||
        !item.result ||
        item.result.id !== item.id ||
        !Array.isArray(item.result.rows) ||
        !item.result.summary ||
        !Array.isArray(item.result.summary.keyAdvantages) ||
        !Array.isArray(item.result.summary.keyGaps) ||
        !Array.isArray(item.result.summary.validationWarnings),
    )
  )
    throw new Error(
      "O formato do histórico não é compatível. Você pode limpar os dados desta conta.",
    );
  return data.items;
}
const key = (id: string) => `specpulse.history.v1.${encodeURIComponent(id)}`;
async function owner() {
  const session = await getStoredAuthSession();
  if (!session) throw new Error("Entre para acessar seu histórico.");
  return session.user.id;
}
export async function readHistory() {
  const userId = await owner();
  const items = parseHistory(await AsyncStorage.getItem(key(userId)), userId);
  if ((await owner()) !== userId) throw new Error("A conta foi alterada.");
  return items;
}
let queue: Promise<unknown> = Promise.resolve();
function mutateHistory(
  change: (items: SavedAnalysis[]) => SavedAnalysis[],
  clear = false,
) {
  const requestedOwner = owner();
  const task = queue
    .catch(() => {})
    .then(async () => {
      const userId = await requestedOwner;
      if ((await owner()) !== userId) throw new Error("A conta foi alterada.");
      const items = clear
        ? []
        : parseHistory(await AsyncStorage.getItem(key(userId)), userId);
      if ((await owner()) !== userId) throw new Error("A conta foi alterada.");
      await AsyncStorage.setItem(
        key(userId),
        JSON.stringify({ schema: 1, userId, items: change(items) }),
      );
    });
  queue = task;
  return task;
}
export const saveAnalysis = (result: ComparisonResult) =>
  mutateHistory((items) => [
    { id: result.id, savedAt: new Date().toISOString(), result },
    ...items.filter((i) => i.id !== result.id),
  ]);
export const deleteAnalysis = (id: string) =>
  mutateHistory((items) => items.filter((i) => i.id !== id));
export const clearHistory = () => mutateHistory(() => [], true);
