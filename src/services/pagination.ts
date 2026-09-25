import { CanceledError } from "axios";
import { api, sessionEpoch } from "./auth";

const PAGE_SIZE = 25;
const MAX_PAGES = 1000;

type ListResponse<T> = {
  data?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
};

/** Read the complete 1-based API list, rejecting partial or inconsistent pages. */
export async function fetchAllPages<T>(
  path: string,
  getKey: (item: T) => string,
): Promise<T[]> {
  const epoch = sessionEpoch();
  const items: T[] = [];
  const seen = new Set<string>();
  let expectedTotal: number | undefined;
  let pageSize = PAGE_SIZE;

  for (let page = 1; page <= MAX_PAGES; page++) {
    if (epoch !== sessionEpoch()) throw new CanceledError();
    const { data: response } = await api.get<T[] | ListResponse<T>>(path, {
      params: { page, pageSize },
    });
    if (epoch !== sessionEpoch()) throw new CanceledError();

    const list = Array.isArray(response) ? response : response?.data;
    if (!Array.isArray(list)) throw new Error("Resposta inválida do serviço.");
    const metadata = Array.isArray(response) ? undefined : response;
    const paginated =
      metadata && ["page", "pageSize", "total"].some((key) => key in metadata);

    if (paginated) {
      const { page: currentPage, pageSize: size, total } = metadata;
      if (
        currentPage !== page ||
        typeof size !== "number" ||
        !Number.isSafeInteger(size) ||
        size <= 0 ||
        typeof total !== "number" ||
        !Number.isSafeInteger(total) ||
        total < 0
      )
        throw new Error("Paginação inválida do serviço. Tente novamente.");
      if (
        expectedTotal !== undefined &&
        (total !== expectedTotal || size !== pageSize)
      )
        throw new Error("A lista mudou durante a consulta. Tente novamente.");
      expectedTotal = total;
      pageSize = size;
      if (Math.ceil(expectedTotal / pageSize) > MAX_PAGES)
        throw new Error("A lista excede o limite de consulta do aplicativo.");
      const expectedCount = Math.min(
        pageSize,
        expectedTotal - (page - 1) * pageSize,
      );
      if (list.length !== expectedCount)
        throw new Error(
          "O serviço retornou uma lista incompleta. Tente novamente.",
        );
    } else if (page !== 1) {
      // A legacy array or { data } is only a complete response on the first call.
      throw new Error("Paginação inválida do serviço. Tente novamente.");
    }

    for (const item of list) {
      const key = getKey(item);
      if (typeof key !== "string" || !key.trim())
        throw new Error("Resposta inválida do serviço.");
      if (seen.has(key))
        throw new Error("A lista mudou durante a consulta. Tente novamente.");
      seen.add(key);
      items.push(item);
    }
    if (!paginated || items.length === expectedTotal) return items;
  }
  throw new Error("A lista excede o limite de consulta do aplicativo.");
}
