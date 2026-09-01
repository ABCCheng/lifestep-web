import type { ApiResponse, JourneyData, JourneyStageProgress, JourneyType, LifeScenario, LifeStage, ScenarioDetail, ScenarioVocabularyInfo } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function responseMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("message" in payload)) return "";
  const message = payload.message;
  return typeof message === "string" ? message.trim() : "";
}

export function getApiErrorMessage(
  error: unknown,
  networkMessages: { requestFailed?: string; networkErrorUser?: string; networkErrorServer?: string },
) {
  const fallback = networkMessages.requestFailed || "Request failed";
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof ApiError && error.status >= 500) return networkMessages.networkErrorServer || fallback;
  if (error instanceof ApiError && error.status > 0) return networkMessages.networkErrorUser || fallback;
  if (error instanceof TypeError) return networkMessages.networkErrorUser || fallback;
  return fallback;
}

let deviceReady: Promise<void> | null = null;
const OFFLINE_API_CACHE_NAME = "lifestep-api-v1";

function language() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("LIFESTEP_LOCALE") || document.documentElement.lang || "en";
}

function baseUrl() {
  // Browser requests stay same-origin so Next.js can proxy /api without
  // requiring browser-side CORS.
  if (typeof window !== "undefined") return "";
  const configured = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();
  return configured ? configured.replace(/\/$/, "") : "";
}

function headers(json = false) {
  const value: Record<string, string> = {
    "X-App-Name": "lifestep",
    "X-Device-Name": typeof navigator === "undefined" ? "LifeStep Web" : navigator.userAgent || "LifeStep Web",
    "X-Language": language(),
  };
  if (json) value["Content-Type"] = "application/json";
  return value;
}

function apiCacheKey(path: string, body: unknown) {
  const input = `${language()}:${path}:${JSON.stringify(body)}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return new Request(`${typeof window === "undefined" ? "https://lifestep.invalid" : window.location.origin}/__lifestep-api-cache__/${(hash >>> 0).toString(16)}`);
}

async function readCachedApi<T>(path: string, body: unknown): Promise<T | undefined> {
  if (typeof window === "undefined" || !("caches" in window)) return undefined;
  try {
    const response = await (await caches.open(OFFLINE_API_CACHE_NAME)).match(apiCacheKey(path, body));
    if (!response) return undefined;
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

async function writeCachedApi(path: string, body: unknown, data: unknown) {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    await (await caches.open(OFFLINE_API_CACHE_NAME)).put(
      apiCacheKey(path, body),
      new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } }),
    );
  } catch {
    // Offline caching is an enhancement; private browsing can disable Cache Storage.
  }
}

export async function ensureDeviceReady(force = false) {
  if (force) deviceReady = null;
  if (deviceReady) return deviceReady;
  deviceReady = (async () => {
    const response = await fetch(`${baseUrl()}/api/user/activate-device`, { method: "POST", credentials: "include", headers: headers() });
    const payload = (await response.json().catch(() => null)) as ApiResponse<void> | null;
    if (!response.ok || payload?.code !== 200) throw new ApiError(responseMessage(payload), response.status);
  })().catch((error) => {
    deviceReady = null;
    throw error;
  });
  return deviceReady;
}

async function post<T>(path: string, body: unknown, retry = true, cacheable = false): Promise<T> {
  try {
    await ensureDeviceReady();
    const response = await fetch(`${baseUrl()}${path}`, { method: "POST", credentials: "include", headers: headers(true), body: JSON.stringify(body) });
    if (response.headers.get("X-Device-Required") === "1" && retry) {
      await ensureDeviceReady(true);
      return post<T>(path, body, false, cacheable);
    }
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    if (!response.ok || payload?.code !== 200) throw new ApiError(responseMessage(payload), response.status);
    if (cacheable) void writeCachedApi(path, body, payload.data);
    return payload.data;
  } catch (error) {
    if (cacheable) {
      const cached = await readCachedApi<T>(path, body);
      if (cached !== undefined) return cached;
    }
    throw error;
  }
}

export async function getApiResponse<T>(path: string, params?: Record<string, string>) {
  await ensureDeviceReady();
  const url = new URL(`${baseUrl()}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url.toString(), { credentials: "include", headers: headers() });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !payload || payload.code !== 200) throw new ApiError(responseMessage(payload), response.status);
  return payload;
}

export async function postApiResponse<T>(path: string, body: unknown) {
  await ensureDeviceReady();
  const response = await fetch(`${baseUrl()}${path}`, { method: "POST", credentials: "include", headers: headers(true), body: JSON.stringify(body) });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !payload || payload.code !== 200) throw new ApiError(responseMessage(payload), response.status);
  return payload;
}

export const lifeStepApi = {
  journeyData: async (journeyType: JourneyType) => (await getApiResponse<JourneyData>("/api/lifestep/journey-data", { journeyType })).data,
  vocabulary: async () => (await getApiResponse<ScenarioVocabularyInfo[]>("/api/lifestep/vocabulary")).data,
  keyPhrases: async () => (await getApiResponse<string[]>("/api/lifestep/key-phrases")).data,
  journeyProgress: (journeyType: JourneyType) => post<JourneyStageProgress[]>("/api/lifestep/journey-stage-progress", { journeyType }, true, true),
  scenarios: (journeyType: JourneyType, lifeStage: LifeStage) => post<LifeScenario[]>("/api/lifestep/life-scenario/list", { journeyType, lifeStage }, true, true),
  scenarioDetail: (scenarioId: number) => post<ScenarioDetail>("/api/lifestep/life-scenario/detail", { scenarioId }, true, true),
  startScenario: (scenarioId: number) => post<void>("/api/lifestep/life-scenario/start", { scenarioId }),
  completeScenario: (scenarioId: number) => post<void>("/api/lifestep/life-scenario/complete", { scenarioId }),
};
