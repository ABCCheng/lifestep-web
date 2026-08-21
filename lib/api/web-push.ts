import { getApiResponse, postApiResponse } from "@/lib/api";

const PREFIX = "/api/web-push";
const APP_NAME = "lifestep";
export interface WebPushConfig { publicKey: string | null; subscribed: boolean }
export interface WebPushSubscriptionPayload { endpoint: string; keys: { p256dh: string; auth: string } }

export function getWebPushConfig() { return getApiResponse<WebPushConfig>(`${PREFIX}/config`, { appName: APP_NAME }); }
export function subscribeWebPush(payload: WebPushSubscriptionPayload) { return postApiResponse<void>(`${PREFIX}/subscribe`, { appName: APP_NAME, ...payload }); }
export function unsubscribeWebPush() { return postApiResponse<void>(`${PREFIX}/unsubscribe`, { appName: APP_NAME }); }
