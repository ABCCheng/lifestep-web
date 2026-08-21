import { getWebPushConfig, subscribeWebPush, type WebPushConfig, type WebPushSubscriptionPayload } from "@/lib/api/web-push";

let cachedConfig: WebPushConfig | null = null;
let cachedAt = 0;
let request: Promise<WebPushConfig | null> | null = null;

export function getServiceWorkerContainer() {
  if (typeof navigator === "undefined") return null;
  try { return navigator.serviceWorker ?? null; } catch { return null; }
}
export function isWebPushSupported() { return typeof window !== "undefined" && getServiceWorkerContainer() !== null && "PushManager" in window && "Notification" in window; }
export function getWebPushPermission(): NotificationPermission | "unsupported" { return typeof window === "undefined" || !("Notification" in window) ? "unsupported" : Notification.permission; }
export async function requestWebPushPermission() { const current = getWebPushPermission(); return current === "default" ? Notification.requestPermission().catch(() => "denied" as const) : current; }
export function getCachedWebPushConfig() { return cachedConfig; }
export function cacheWebPushConfig(config: WebPushConfig) { cachedConfig = config; cachedAt = Date.now(); }
export function loadWebPushConfig(force = false) {
  if (!force && cachedConfig && Date.now() - cachedAt < 300000) return Promise.resolve(cachedConfig);
  if (request) return request;
  request = getWebPushConfig().then((response) => { if (response.code !== 200 || !response.data) return null; cacheWebPushConfig(response.data); return response.data; }).catch(() => null).finally(() => { request = null; });
  return request;
}
export function decodeWebPushPublicKey(value: string) { const padding = "=".repeat((4 - value.length % 4) % 4); const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(raw, (char) => char.charCodeAt(0)); }
export function serializeWebPushSubscription(subscription: PushSubscription): WebPushSubscriptionPayload | null { const json = subscription.toJSON(); return json.endpoint && json.keys?.p256dh && json.keys.auth ? { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } } : null; }
export async function getCurrentWebPushSubscription() { const sw = getServiceWorkerContainer(); if (!sw || !isWebPushSupported()) return null; return (await sw.ready).pushManager.getSubscription(); }
export async function getOrCreateWebPushSubscription(config: WebPushConfig) { const sw = getServiceWorkerContainer(); if (!sw || !config.publicKey) return null; const registration = await sw.ready; return await registration.pushManager.getSubscription() ?? registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeWebPushPublicKey(config.publicKey) }); }
export async function syncCurrentWebPushSubscription(config?: WebPushConfig) {
  if (!isWebPushSupported()) return { status: "unsupported" } as const;
  try { const current = config ?? await loadWebPushConfig(); if (!current?.subscribed) return { status: "server-not-subscribed" } as const; const subscription = await getOrCreateWebPushSubscription(current); const payload = subscription && serializeWebPushSubscription(subscription); if (!payload) return { status: "no-local-subscription" } as const; const response = await subscribeWebPush(payload); return { status: response.code === 200 ? "synced" : "subscribe-failed" } as const; } catch { return { status: "sync-error" } as const; }
}
