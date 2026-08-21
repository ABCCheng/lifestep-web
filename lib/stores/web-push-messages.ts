import { getServiceWorkerContainer } from "@/lib/web-push-client";

export const WEB_PUSH_MESSAGES_CACHE_NAME = "lifestep-pwa-push-messages-v1";
export const WEB_PUSH_MESSAGES_URL = "/__lifestep-push-messages__";
const listeners = new Set<() => void>();
let cached: WebPushMessage[] = [];
let loaded = false;

export type WebPushMessage = { id: string; referenceId: string; title: string; body: string; receivedAt: string; read: boolean; url: string };
const canCache = () => typeof window !== "undefined" && "caches" in window;
const messageUrl = () => new URL(WEB_PUSH_MESSAGES_URL, location.origin).href;
function normalize(value: unknown): WebPushMessage | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<WebPushMessage> & { newsId?: string };
  if (typeof item.id !== "string" || typeof item.title !== "string" || typeof item.body !== "string" || typeof item.receivedAt !== "string" || typeof item.url !== "string") return null;
  return { id: item.id, referenceId: item.referenceId ?? item.newsId ?? "", title: item.title, body: item.body, receivedAt: item.receivedAt, read: item.read === true, url: item.url };
}
async function read() { if (!canCache()) return []; try { const response = await (await caches.open(WEB_PUSH_MESSAGES_CACHE_NAME)).match(messageUrl()); const payload = response ? await response.json() : []; return Array.isArray(payload) ? payload.map(normalize).filter((item): item is WebPushMessage => Boolean(item)) : []; } catch { return []; } }
async function write(messages: WebPushMessage[]) { const next = messages.slice(0, 20); if (canCache()) await (await caches.open(WEB_PUSH_MESSAGES_CACHE_NAME)).put(messageUrl(), new Response(JSON.stringify(next), { headers: { "Content-Type": "application/json" } })); cached = next; loaded = true; listeners.forEach((listener) => listener()); void updateBadge(); return next; }
async function updateBadge() { try { const registration = await getServiceWorkerContainer()?.ready; registration?.active?.postMessage({ type: "lifestep:update-app-badge" }); } catch {} }
export async function getWebPushMessages() { cached = await read(); loaded = true; listeners.forEach((listener) => listener()); void updateBadge(); return cached; }
export function getCachedWebPushMessages() { return cached; }
export function hasCachedWebPushMessages() { return loaded; }
export function getUnreadWebPushMessageCount() { return cached.filter((item) => !item.read).length; }
export function subscribeWebPushMessageChanges(listener: () => void) { listeners.add(listener); const sw = getServiceWorkerContainer(); const onMessage = (event: MessageEvent) => { if (event.data?.type === "lifestep:push-message") void getWebPushMessages(); }; sw?.addEventListener("message", onMessage); return () => { listeners.delete(listener); sw?.removeEventListener("message", onMessage); }; }
export async function markWebPushMessageRead(id: string) { return write((await read()).map((item) => item.id === id ? { ...item, read: true } : item)); }
export async function deleteWebPushMessage(id: string) { return write((await read()).filter((item) => item.id !== id)); }
export async function markAllWebPushMessagesRead() { return write((await read()).map((item) => ({ ...item, read: true }))); }
export async function clearWebPushMessages() { return write([]); }
