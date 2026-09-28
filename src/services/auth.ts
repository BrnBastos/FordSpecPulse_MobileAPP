import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  CanceledError,
  create,
  isAxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEFAULT_API_BASE_URL = "https://ford-spec-pulse-api-r64e.onrender.com/api";

// Allow for the slower startup responses observed on the hosted API.
const API_REQUEST_TIMEOUT_MS = 30_000;

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

export const api = create({
  baseURL: API_BASE_URL,
  timeout: API_REQUEST_TIMEOUT_MS,
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
  _generation?: number;
};

let generation = 0;
const listeners = new Set<() => void>();
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function sessionEpoch() {
  return generation;
}
export function sessionSnapshot() {
  return authSession;
}
function emit() {
  listeners.forEach((listener) => listener());
}
let writes = Promise.resolve();
function writeSession(session: AuthSession | null) {
  const operation = writes
    .catch(() => {})
    .then(async () => {
      if (Platform.OS !== "web") {
        if (session)
          await SecureStore.setItemAsync(
            AUTH_SESSION_KEY,
            JSON.stringify(session),
          );
        else await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
      }
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
    });
  writes = operation;
  return operation;
}
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
  if (
    !data ||
    typeof data.accessToken !== "string" ||
    typeof data.refreshToken !== "string" ||
    typeof data.usuario?.id !== "string" ||
    typeof data.usuario?.email !== "string" ||
    !Number.isFinite(Date.parse(data.expiraEm)) ||
    !Number.isFinite(Date.parse(data.refreshExpiraEm))
  )
    throw new Error("Resposta de autenticação inválida.");
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
    const epoch = generation;
    const secure =
      Platform.OS === "web"
        ? null
        : await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    const legacy = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    const raw = secure ?? legacy;
    let parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      /* Discard corrupt credentials, never guess a session. */
    }
    const valid =
      parsed &&
      typeof parsed.accessToken === "string" &&
      typeof parsed.refreshToken === "string" &&
      typeof parsed.user?.id === "string" &&
      typeof parsed.user?.email === "string";
    if (epoch !== generation) return authSession ?? null;
    authSession = valid
      ? { ...parsed, user: normalizeUser(parsed.user) }
      : null;
    await writeSession(authSession ?? null);
    emit();
  } catch {
    authSession = undefined;
    emit();
    throw new Error("Não foi possível ler a sessão salva. Tente novamente.");
  }

  return authSession;
}

async function persistAuthSession(session: AuthSession) {
  const epoch = generation;
  await writeSession(session);
  if (epoch !== generation) return;
  if (authSession?.user.id !== session.user.id) generation++;
  authSession = session;
  emit();
}

async function clearAuthSession() {
  generation++;
  refreshRequest = null;
  authSession = null;
  emit();
  await writeSession(null);
}

function hasAuthorizationHeader(config: AxiosRequestConfig) {
  const headers = config.headers as MutableHeaders | undefined;
  return !!headers?.Authorization || !!headers?.authorization;
}

function setAuthorizationHeader(
  config: AxiosRequestConfig | InternalAxiosRequestConfig,
  token: string,
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
    const epoch = generation;
    const pending: Promise<string | null> = axios
      .post<AuthResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken: session.refreshToken },
        { timeout: API_REQUEST_TIMEOUT_MS },
      )
      .then(async ({ data }) => {
        if (epoch !== generation) return null;
        const nextSession = sessionFromAuthResponse(data);
        await persistAuthSession(nextSession);
        return epoch === generation ? nextSession.accessToken : null;
      })
      .catch(async (error: unknown) => {
        if (epoch !== generation) return null;
        if (
          isAxiosError(error) &&
          [401, 403, 422].includes(error.response?.status ?? 0)
        ) {
          await clearAuthSession();
          return null;
        }
        throw error;
      })
      .finally(() => {
        if (refreshRequest === pending) refreshRequest = null;
      });
    refreshRequest = pending;
  }

  return refreshRequest;
}

async function getAccessToken(forceRefresh = false) {
  const session = await loadAuthSession();

  if (
    session?.accessToken &&
    !forceRefresh &&
    isStillValid(session.expiresAt)
  ) {
    return session.accessToken;
  }

  if (session?.refreshToken) {
    return refreshAccessToken(session);
  }

  return null;
}

api.interceptors.request.use(async (config) => {
  (config as RetriableRequestConfig)._generation = generation;
  if (!hasAuthorizationHeader(config)) {
    try {
      const token = await getAccessToken();
      if (token) {
        setAuthorizationHeader(config, token);
      }
    } catch (error) {
      if ((config as RetriableRequestConfig)._generation !== generation)
        throw new CanceledError();
      throw error;
    }
  }

  if ((config as RetriableRequestConfig)._generation !== generation)
    throw new CanceledError();
  return config;
});

api.interceptors.response.use(
  (response) => {
    if ((response.config as RetriableRequestConfig)._generation !== generation)
      throw new CanceledError();
    return response;
  },
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // Refresh uses its own client: preserve its errors rather than treating
    // its untagged request as a response from a previous session.
    if (originalRequest?._generation === undefined)
      return Promise.reject(error);
    if (originalRequest && originalRequest._generation !== generation)
      return Promise.reject(new CanceledError());
    if (originalRequest?._retry && error.response?.status === 401)
      await clearAuthSession();
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const token = await getAccessToken(true);

      if (
        token &&
        ["get", "head", "options"].includes(
          originalRequest.method?.toLowerCase() ?? "get",
        )
      ) {
        setAuthorizationHeader(originalRequest, token);
        return api.request(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export async function getStoredAuthSession() {
  return loadAuthSession();
}

export async function login(credentials: AuthCredentials) {
  const epoch = generation;
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/login`,
    credentials,
    { timeout: API_REQUEST_TIMEOUT_MS },
  );
  if (epoch !== generation) throw new CanceledError();
  const session = sessionFromAuthResponse(data);
  await persistAuthSession(session);
  return session;
}

export async function register(input: RegisterInput) {
  const epoch = generation;
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/register`,
    input,
    { timeout: API_REQUEST_TIMEOUT_MS },
  );
  if (epoch !== generation) throw new CanceledError();
  const session = sessionFromAuthResponse(data);
  await persistAuthSession(session);
  return session;
}

export async function logout() {
  const token = authSession?.accessToken;
  await clearAuthSession();
  if (token) {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: API_REQUEST_TIMEOUT_MS,
        },
      );
    } catch {
      /* Local logout remains effective when revocation is unavailable. */
    }
  }
}
