import type { ApiResponse, JourneyStageProgress, JourneyType, LifeScenario, LifeStage, ScenarioDetail } from "./types";

let deviceReady: Promise<void> | null = null;

function language() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("LIFESTEP_LOCALE") || document.documentElement.lang || "en";
}

function baseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return typeof window === "undefined" ? "" : window.location.origin;
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

export async function ensureDeviceReady(force = false) {
  if (force) deviceReady = null;
  if (deviceReady) return deviceReady;
  deviceReady = (async () => {
    const response = await fetch(`${baseUrl()}/api/user/activate-device`, { method: "POST", credentials: "include", headers: headers() });
    const payload = (await response.json().catch(() => null)) as ApiResponse<void> | null;
    if (!response.ok || payload?.code !== 200) throw new Error(payload?.message || "Device activation failed");
  })().catch((error) => {
    deviceReady = null;
    throw error;
  });
  return deviceReady;
}

async function post<T>(path: string, body: unknown, retry = true): Promise<T> {
  await ensureDeviceReady();
  const response = await fetch(`${baseUrl()}${path}`, { method: "POST", credentials: "include", headers: headers(true), body: JSON.stringify(body) });
  if (response.headers.get("X-Device-Required") === "1" && retry) {
    await ensureDeviceReady(true);
    return post<T>(path, body, false);
  }
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || payload?.code !== 200) throw new Error(payload?.message || "Request failed");
  return payload.data;
}

export async function getApiResponse<T>(path: string, params?: Record<string, string>) {
  await ensureDeviceReady();
  const url = new URL(`${baseUrl()}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url.toString(), { credentials: "include", headers: headers() });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !payload) throw new Error(payload?.message || "Request failed");
  return payload;
}

export async function postApiResponse<T>(path: string, body: unknown) {
  await ensureDeviceReady();
  const response = await fetch(`${baseUrl()}${path}`, { method: "POST", credentials: "include", headers: headers(true), body: JSON.stringify(body) });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !payload) throw new Error(payload?.message || "Request failed");
  return payload;
}

export const lifeStepApi = {
  journeyProgress: (journeyType: JourneyType) => post<JourneyStageProgress[]>("/api/lifestep/journey-stage-progress", { journeyType }),
  scenarios: (journeyType: JourneyType, lifeStage: LifeStage) => post<LifeScenario[]>("/api/lifestep/life-scenario/list", { journeyType, lifeStage }),
  scenarioDetail: (scenarioId: number) => post<ScenarioDetail>("/api/lifestep/life-scenario/detail", { scenarioId }),
  startScenario: (scenarioId: number) => post<void>("/api/lifestep/life-scenario/start", { scenarioId }),
  completeScenario: (scenarioId: number) => post<void>("/api/lifestep/life-scenario/complete", { scenarioId }),
};
