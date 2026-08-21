const CACHE_PREFIX = "lifestep-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}v3`;
const PUSH_PREFERENCES_CACHE_NAME = `${CACHE_PREFIX}push-preferences-v1`;
const PUSH_PREFERENCES_URL = "/__lifestep-push-preferences__";
const PUSH_MESSAGES_CACHE_NAME = `${CACHE_PREFIX}push-messages-v1`;
const PUSH_MESSAGES_URL = "/__lifestep-push-messages__";
const MAX_PUSH_MESSAGES = 20;
const DEFAULT_PUSH_PREFERENCES = { languageCode: "en", region: "Toronto" };
const SUPPORTED_LANGUAGES = ["en", "fr", "zh-Hans", "zh-Hant", "pa", "es", "ja", "ko", "ru", "vi"];
const SUPPORTED_REGIONS = ["Toronto", "Vancouver", "Montreal", "Calgary", "Winnipeg", "Saskatoon", "Halifax"];
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== CACHE_NAME &&
                key !== PUSH_PREFERENCES_CACHE_NAME &&
                key !== PUSH_MESSAGES_CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "lifestep:clear-push-notifications") {
    event.waitUntil(clearPushNotifications());
    return;
  }

  if (event.data?.type === "lifestep:update-app-badge") {
    event.waitUntil(updateAppBadge());
    return;
  }

  if (event.data?.type !== "lifestep:push-preferences") return;

  const languageCode = SUPPORTED_LANGUAGES.includes(event.data.languageCode)
    ? event.data.languageCode
    : DEFAULT_PUSH_PREFERENCES.languageCode;
  const region = SUPPORTED_REGIONS.includes(event.data.region)
    ? event.data.region
    : DEFAULT_PUSH_PREFERENCES.region;
  event.waitUntil(writePushPreferences({ languageCode, region }));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  event.waitUntil(showLifeStepNotification(payload));
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(handlePushSubscriptionChange(event));
});

async function handlePushSubscriptionChange(event) {
  let subscription = event.newSubscription || null;

  if (!subscription) {
    try {
      const options = event.oldSubscription?.options || await getPushSubscriptionOptions();
      if (options) {
        subscription = await self.registration.pushManager.subscribe(options);
      }
    } catch (error) {
      console.warn("Push subscription recreation failed", error);
    }
  }

  const payload = subscription ? serializeWebPushSubscription(subscription) : null;
  const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clientList.forEach((client) => {
    client.postMessage({
      type: "lifestep:push-subscription-change",
      subscription: payload,
    });
  });
}

async function getPushSubscriptionOptions() {
  const preferences = await readPushPreferences();
  const deviceName = navigator.userAgent?.trim() || "LifeStep Web";
  const response = await fetch("/api/web-push/config?appName=lifestep", {
    cache: "no-store",
    headers: {
      "X-App-Name": "lifestep",
      "X-Device-Name": deviceName,
      "X-Language": preferences.languageCode,
      "X-Region": preferences.region,
    },
  });
  if (!response.ok) return null;

  const payload = await response.json();
  const publicKey = payload?.code === 200 ? payload?.data?.publicKey : null;
  if (typeof publicKey !== "string" || !publicKey) return null;

  return {
    userVisibleOnly: true,
    applicationServerKey: decodeWebPushPublicKey(publicKey),
  };
}

function decodeWebPushPublicKey(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

function serializeWebPushSubscription(subscription) {
  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!endpoint || !p256dh || !auth) return null;

  return {
    endpoint,
    keys: { p256dh, auth },
  };
}

async function writePushPreferences(preferences) {
  const cache = await caches.open(PUSH_PREFERENCES_CACHE_NAME);
  const url = new URL(PUSH_PREFERENCES_URL, self.location.origin).href;
  await cache.put(
    url,
    new Response(JSON.stringify(preferences), {
      headers: { "Content-Type": "application/json" },
    })
  );
}

async function readPushPreferences() {
  try {
    const cache = await caches.open(PUSH_PREFERENCES_CACHE_NAME);
    const url = new URL(PUSH_PREFERENCES_URL, self.location.origin).href;
    const response = await cache.match(url);
    if (!response) return DEFAULT_PUSH_PREFERENCES;

    const preferences = await response.json();
    return {
      languageCode: SUPPORTED_LANGUAGES.includes(preferences.languageCode)
        ? preferences.languageCode
        : DEFAULT_PUSH_PREFERENCES.languageCode,
      region: SUPPORTED_REGIONS.includes(preferences.region)
        ? preferences.region
        : DEFAULT_PUSH_PREFERENCES.region,
    };
  } catch {
    return DEFAULT_PUSH_PREFERENCES;
  }
}

async function readStoredPushMessages() {
  try {
    const cache = await caches.open(PUSH_MESSAGES_CACHE_NAME);
    const url = new URL(PUSH_MESSAGES_URL, self.location.origin).href;
    const response = await cache.match(url);
    if (!response) return [];

    const messages = await response.json();
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

async function writeStoredPushMessages(messages) {
  const cache = await caches.open(PUSH_MESSAGES_CACHE_NAME);
  const url = new URL(PUSH_MESSAGES_URL, self.location.origin).href;
  await cache.put(
    url,
    new Response(JSON.stringify(messages.slice(0, MAX_PUSH_MESSAGES)), {
      headers: { "Content-Type": "application/json" },
    })
  );
}

async function updateAppBadge() {
  if (typeof navigator === "undefined" || typeof navigator.setAppBadge !== "function") return;

  try {
    const messages = await readStoredPushMessages();
    const unreadCount = messages.filter((message) => !message?.read).length;
    if (unreadCount > 0) {
      await navigator.setAppBadge(unreadCount);
    } else if (typeof navigator.clearAppBadge === "function") {
      await navigator.clearAppBadge();
    }
  } catch {
    // App badges are optional and unsupported on some browsers/platforms.
  }
}

async function storeNewsPushMessage(message) {
  const messages = await readStoredPushMessages();
  const nextMessages = [
    message,
    ...messages.filter((item) => item?.id !== message.id),
  ].slice(0, MAX_PUSH_MESSAGES);
  await writeStoredPushMessages(nextMessages);
  await updateAppBadge();

  const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clientList.forEach((client) => {
    client.postMessage({ type: "lifestep:push-message" });
  });
}

async function markStoredPushMessageRead(id) {
  if (!id) return;

  const messages = await readStoredPushMessages();
  await writeStoredPushMessages(messages.map((message) => (
    message?.id === id ? { ...message, read: true } : message
  )));
  await updateAppBadge();
}

async function clearPushNotifications() {
  const notifications = await self.registration.getNotifications();
  notifications.forEach((notification) => notification.close());
}

async function showLifeStepNotification(payload) {
  const data = payload?.data && typeof payload.data === "object" ? payload.data : {};
  const preferences = await readPushPreferences();
  const titles = data.titles && typeof data.titles === "object" ? data.titles : {};
  const localizedTitle = [titles[preferences.languageCode], titles.en, ...Object.values(titles)].find((value) => typeof value === "string" && value.trim())?.trim();
  const title = [payload?.title, data.title, localizedTitle, "LifeStep"].find((value) => typeof value === "string" && value.trim())?.trim();
  const body = [payload?.body, data.body, data.message, localizedTitle, "Your next step is ready."].find((value) => typeof value === "string" && value.trim())?.trim();
  const referenceId = String(data.scenarioId ?? data.lifeScenarioId ?? data.newsId ?? data.id ?? "");
  const url = typeof data.url === "string" && data.url ? data.url : "/app/messages";
  const messageId = typeof payload.tag === "string" && payload.tag
    ? payload.tag
    : `${referenceId || "lifestep"}:${Date.now()}`;

  try {
    await storeNewsPushMessage({
      id: messageId,
      referenceId,
      title,
      body,
      receivedAt: new Date().toISOString(),
      read: false,
      url,
    });
  } catch (error) {
    console.warn("Push message persistence failed", error);
  }

  await self.registration.showNotification(title, {
    body,
    icon: "/logo-192.png",
    badge: "/logo-192.png",
    tag: payload.tag,
    data: { ...data, url, messageId },
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetUrl = new URL(notificationData.url || "/app/messages", self.location.origin).href;
  event.waitUntil((async () => {
    await markStoredPushMessageRead(notificationData.messageId);
    const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const matchingClient = clientList.find((client) => client.url === targetUrl);
    const existingClient = matchingClient || clientList.find((client) => {
      try {
        return new URL(client.url).origin === self.location.origin;
      } catch {
        return false;
      }
    });

    if (existingClient) {
      try {
        if (existingClient.url !== targetUrl) {
          existingClient.postMessage({
            type: "lifestep:notification-navigation",
            url: targetUrl,
            messageId: notificationData.messageId,
          });
        }
        if ("focus" in existingClient) return existingClient.focus();
      } catch {
        // Fall through to opening a new app window when the existing one is unavailable.
      }
    }

    return self.clients.openWindow(targetUrl);
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return;
  if (url.searchParams.has("_rsc") || request.headers.has("RSC") || request.headers.has("Next-Router-State-Tree")) return;

  // Never cache or fall back to a page document. A cached Next.js document can
  // reference build assets that no longer exist after a deployment.
  if (request.mode === "navigate") return;

  if (!["image", "font", "manifest"].includes(request.destination)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
