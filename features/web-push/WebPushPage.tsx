"use client";

import { Bell, BrushCleaning, Circle, CircleCheck, ListCheck, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { AppBackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  subscribeWebPush,
  unsubscribeWebPush,
  type WebPushConfig,
  type WebPushSubscriptionPayload,
} from "@/lib/api/web-push";
import {
  clearWebPushMessages,
  deleteWebPushMessage,
  getCachedWebPushMessages,
  getWebPushMessages,
  hasCachedWebPushMessages,
  markAllWebPushMessagesRead,
  markWebPushMessageRead,
  type WebPushMessage,
} from "@/lib/stores/web-push-messages";
import { cn } from "@/lib/utils";
import { appZIndex } from "@/lib/z-index";
import { pageLoaderClass, subPageClass } from "@/components/app/app-ui-styles";
import {
  cacheWebPushConfig,
  decodeWebPushPublicKey,
  getCachedWebPushConfig,
  getCurrentWebPushSubscription,
  getServiceWorkerContainer,
  getWebPushPermission,
  isWebPushSupported,
  loadWebPushConfig,
  requestWebPushPermission,
  serializeWebPushSubscription,
} from "@/lib/web-push-client";

const messageRevealClassName =
  "isolate [backface-visibility:hidden] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300 motion-reduce:animate-none";

export function WebPushPage() {
  const { dictionary } = useApp();
  const copy = dictionary.webPushPage;
  const [config, setConfig] = useState<WebPushConfig | null>(() => getCachedWebPushConfig());
  const [messages, setMessages] = useState<WebPushMessage[]>(() => getCachedWebPushMessages());
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => Boolean(getCachedWebPushConfig()?.subscribed));
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(() => !getCachedWebPushConfig());
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<"unsubscribe" | "clear" | "read" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isWebPushSupported()) {
        setLoading(false);
        return;
      }

      const nextConfig = await loadWebPushConfig();
      if (cancelled) return;

      if (nextConfig) {
        cacheWebPushConfig(nextConfig);
        setConfig(nextConfig);
        setNotificationsEnabled(nextConfig.subscribed);
        setLoading(false);
      }

      try {
        const currentSubscription = await getCurrentWebPushSubscription();
        if (!cancelled) {
          setSubscription(currentSubscription);
          setNotificationsEnabled(Boolean(nextConfig?.subscribed && currentSubscription));
        }
      } catch {
        if (!cancelled) setNotificationsEnabled(false);
      }

      if (!cancelled) setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      const nextMessages = await getWebPushMessages();
      if (!cancelled) setMessages(nextMessages);
    };

    if (!hasCachedWebPushMessages()) void loadMessages();

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== "lifestep:push-message") return;
      void loadMessages();
    };

    const serviceWorker = getServiceWorkerContainer();
    serviceWorker?.addEventListener("message", handleServiceWorkerMessage);
    return () => {
      cancelled = true;
      serviceWorker?.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  useEffect(() => {
    const serviceWorker = getServiceWorkerContainer();
    if (!serviceWorker) return;
    void serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: "lifestep:clear-push-notifications" });
    });
  }, []);

  async function getOrCreateSubscription() {
    const serviceWorker = getServiceWorkerContainer();
    if (!serviceWorker || !isWebPushSupported()) return null;

    const registration = await serviceWorker.ready;
    const existing = subscription ?? await registration.pushManager.getSubscription();
    if (existing) return { subscription: existing, created: false };
    if (!config?.publicKey) return null;

    const created = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeWebPushPublicKey(config.publicKey),
    });
    return { subscription: created, created: true };
  }

  function updateConfig(nextConfig: WebPushConfig) {
    cacheWebPushConfig(nextConfig);
    setConfig(nextConfig);
  }

  async function saveSubscription() {
    if (!config || saving) return false;

    setSaving(true);
    try {
      const permission = await requestWebPushPermission();
      if (permission === "unsupported") {
        showGlobalSnackbar(copy.unsupported);
        return false;
      }
      if (permission !== "granted") {
        showGlobalSnackbar(copy.browserPermissionBlocked);
        return false;
      }

      let result: Awaited<ReturnType<typeof getOrCreateSubscription>>;
      try {
        result = await getOrCreateSubscription();
      } catch {
        showGlobalSnackbar(
          getWebPushPermission() === "granted"
            ? copy.systemPermissionBlocked
            : copy.browserPermissionBlocked
        );
        return false;
      }

      if (!result) {
        showGlobalSnackbar(copy.unsupported);
        return false;
      }

      let payload: WebPushSubscriptionPayload | null;
      try {
        payload = serializeWebPushSubscription(result.subscription);
      } catch {
        showGlobalSnackbar(copy.failed);
        return false;
      }

      if (!payload) {
        showGlobalSnackbar(copy.failed);
        return false;
      }

      const response = await subscribeWebPush(payload);
      if (response.code !== 200) {
        if (result.created) {
          try {
            await result.subscription.unsubscribe();
          } catch {
            // Best-effort cleanup after a failed server request.
          }
        }
        return false;
      }

      setSubscription(result.subscription);
      updateConfig({ ...config, subscribed: true });
      setNotificationsEnabled(true);
      showGlobalSnackbar(copy.subscribedSuccess);
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function handleUnsubscribe() {
    if (!config?.subscribed || saving) return false;

    setSaving(true);
    try {
      let currentSubscription: PushSubscription | null = null;
      try {
        currentSubscription = subscription ?? await getCurrentWebPushSubscription();
      } catch {
        showGlobalSnackbar(copy.failed);
        return false;
      }

      const response = await unsubscribeWebPush();
      if (response.code !== 200) return false;

      try {
        if (currentSubscription) await currentSubscription.unsubscribe();
      } catch {
        showGlobalSnackbar(copy.failed);
        return false;
      }

      setSubscription(null);
      updateConfig({ ...config, subscribed: false });
      setNotificationsEnabled(false);
      showGlobalSnackbar(copy.unsubscribed);
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(nextEnabled: boolean) {
    if (saving || nextEnabled === notificationsEnabled) return;
    if (!nextEnabled) {
      setConfirm("unsubscribe");
      return;
    }

    const previousEnabled = notificationsEnabled;
    setNotificationsEnabled(true);
    const succeeded = await saveSubscription();
    if (!succeeded) setNotificationsEnabled(previousEnabled);
  }

  async function openMessage(message: WebPushMessage) {
    if (!message.read) {
      try {
        setMessages(await markWebPushMessageRead(message.id));
      } catch {
        // Navigation should still work when local message storage is unavailable.
      }
    }

    if (!message.url) return;
    const url = new URL(message.url, location.origin);
    location.assign(url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : url.href);
  }

  async function removeMessage(messageId: string) {
    try {
      setMessages(await deleteWebPushMessage(messageId));
    } catch {
      // Keep the current list when local message storage is unavailable.
    }
  }

  async function confirmAction() {
    const action = confirm;
    setConfirm(null);
    try {
      if (action === "unsubscribe") await handleUnsubscribe();
      if (action === "clear") setMessages(await clearWebPushMessages());
      if (action === "read") setMessages(await markAllWebPushMessagesRead());
    } catch {
      // Keep the current list when local message storage is unavailable.
    }
  }

  function renderMessageActions(compactSwitch = false) {
    return (
      <>
        {messages.length ? (
          <Button type="button" variant="destructive" aria-label={copy.clearAll} onClick={() => setConfirm("clear")}>
            <BrushCleaning />
          </Button>
        ) : null}
        {messages.some((message) => !message.read) ? (
          <Button type="button" variant="destructive" aria-label={copy.markAllRead} onClick={() => setConfirm("read")}>
            <ListCheck />
          </Button>
        ) : null}
        <Switch
          className={compactSwitch
            ? "h-6 w-10 **:data-[slot=switch-thumb]:size-4 **:data-[slot=switch-thumb]:data-[state=checked]:translate-x-5"
            : undefined}
          checked={notificationsEnabled}
          disabled={saving}
          aria-label={copy.title}
          onCheckedChange={(checked) => void handleToggle(checked)}
        />
      </>
    );
  }

  if (loading) {
    return (
      <main className="app-page">
        <AppBackHeader title={copy.title} eyebrow="LifeStep" />
        <div className={pageLoaderClass}><LoaderCircle /><span>Loading…</span></div>
      </main>
    );
  }

  if (!isWebPushSupported()) {
    return (
      <main className="app-page">
        <AppBackHeader title={copy.title} eyebrow="LifeStep" />
        <CenteredMessage>{copy.unsupported}</CenteredMessage>
      </main>
    );
  }

  return (
    <main className={subPageClass}>
      <AppBackHeader
        title={copy.title}
        eyebrow="LifeStep"
        actions={<div className="ml-auto hidden items-center gap-3 max-md:flex">{renderMessageActions(true)}</div>}
      />
      <article className="min-h-[calc(var(--app-viewport-height)-var(--app-safe-tab-bottom))] w-full px-4 pb-4 md:min-h-0 md:mx-auto md:w-[min(100%,40rem)]">
        <header className="relative hidden items-center gap-2.5 py-4 md:flex [&>svg]:size-8 [&>svg]:text-primary">
          <Bell />
          <h1 className="text-2xl font-bold">{copy.title}</h1>
          <div className="ml-auto flex items-center gap-2 [&_svg]:cursor-pointer [&_svg]:text-primary">
            {renderMessageActions()}
          </div>
        </header>

        {messages.length ? (
          <div className="space-y-3 pt-4 md:pt-0">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    messageRevealClassName,
                    "cursor-pointer rounded-xl border bg-card/70 p-3 shadow-sm transition-colors hover:bg-card",
                    !message.read && "border-primary/40 bg-primary/5"
                  )}
                  style={{ animationDelay: `${Math.min(index, 5) * 45}ms`, animationFillMode: "both" }}
                  onClick={() => void openMessage(message)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void openMessage(message);
                    }
                  }}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {message.read ? (
                      <CircleCheck className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-primary" />
                    )}
                    <h2 className={cn("min-w-0 flex-1 truncate", !message.read && "font-semibold")}>{message.title}</h2>
                    <time className="shrink-0 text-xs text-muted-foreground" dateTime={message.receivedAt}>
                      {relativeTime(message.receivedAt, dictionary.time)}
                    </time>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="size-4 cursor-pointer md:size-8"
                      aria-label={copy.delete}
                      onClick={(event) => {
                        event.stopPropagation();
                        void removeMessage(message.id);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{message.body}</p>
                </div>
              ))}
            </div>
            <div className="mb-(--app-safe-tab-bottom) flex min-h-12 w-full items-center justify-center py-2 text-sm leading-5 text-muted-foreground md:mb-0">
              {copy.latestMessagesOnly}
            </div>
          </div>
        ) : (
          <CenteredMessage>{copy.empty}</CenteredMessage>
        )}
      </article>

      {saving ? <div className="fixed inset-0 z-120 grid place-items-center bg-black/20 backdrop-blur-[2px] [&_svg]:size-[38px] [&_svg]:animate-spin [&_svg]:text-white"><LoaderCircle /></div> : null}
      {confirm ? (
        <ConfirmModal
          title={confirm === "unsubscribe" ? copy.unsubscribeConfirmTitle : confirm === "clear" ? copy.clearAll : copy.markAllRead}
          description={confirm === "unsubscribe" ? copy.unsubscribeConfirmDescription : confirm === "clear" ? copy.clearAllDescription : copy.markAllReadDescription}
          yes={dictionary.confirm.yes}
          no={dictionary.confirm.no}
          destructive={confirm !== "read"}
          onYes={() => void confirmAction()}
          onNo={() => setConfirm(null)}
        />
      ) : null}
    </main>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className={cn("fixed inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground", appZIndex.content)}>
      {children}
    </div>
  );
}

function ConfirmModal({ title, description, yes, no, destructive, onYes, onNo }: { title: string; description: string; yes: string; no: string; destructive: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <Modal onClose={onNo} labelledBy="web-push-confirm">
      <div>
        <h2 className="m-0 text-2xl" id="web-push-confirm">{title}</h2>
        <p className="leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-[22px] flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onNo}>{no}</Button>
          <Button type="button" variant={destructive ? "destructive" : "default"} onClick={onYes}>{yes}</Button>
        </div>
      </div>
    </Modal>
  );
}

function relativeTime(value: string, copy: { justNow: string; minuteAgo: string; minutesAgo: string; hourAgo: string; hoursAgo: string; dayAgo: string; daysAgo: string }) {
  const seconds = Math.max(0, (Date.now() - Date.parse(value)) / 1000);
  if (seconds < 60) return copy.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return copy.minuteAgo;
  if (minutes < 60) return copy.minutesAgo.replace("{{value}}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return copy.hourAgo;
  if (hours < 24) return copy.hoursAgo.replace("{{value}}", String(hours));
  const days = Math.floor(hours / 24);
  return days === 1 ? copy.dayAgo : copy.daysAgo.replace("{{value}}", String(days));
}
