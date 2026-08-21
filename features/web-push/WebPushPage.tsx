"use client";

import { Bell, Check, Circle, ListChecks, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppBackHeader } from "@/components/app";
import { Modal } from "@/components/Modal";
import { useApp } from "@/components/providers/app-provider";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import { subscribeWebPush, unsubscribeWebPush, type WebPushConfig } from "@/lib/api/web-push";
import { cacheWebPushConfig, getCurrentWebPushSubscription, getOrCreateWebPushSubscription, isWebPushSupported, loadWebPushConfig, requestWebPushPermission, serializeWebPushSubscription } from "@/lib/web-push-client";
import { clearWebPushMessages, deleteWebPushMessage, getWebPushMessages, markAllWebPushMessagesRead, markWebPushMessageRead, type WebPushMessage } from "@/lib/stores/web-push-messages";

export function WebPushPage() {
  const { dictionary } = useApp();
  const copy = dictionary.webPushPage;
  const [config, setConfig] = useState<WebPushConfig | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [messages, setMessages] = useState<WebPushMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<"unsubscribe" | "clear" | "read" | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([loadWebPushConfig(), getCurrentWebPushSubscription().catch(() => null), getWebPushMessages()]).then(([nextConfig, nextSubscription, nextMessages]) => {
      if (!active) return;
      setConfig(nextConfig); setSubscription(nextSubscription); setMessages(nextMessages); setLoading(false);
    });
    navigator.serviceWorker?.ready.then((registration) => registration.active?.postMessage({ type: "lifestep:clear-push-notifications" }));
    return () => { active = false; };
  }, []);

  const enabled = Boolean(config?.subscribed && subscription);
  async function enable() {
    if (!config || saving) return;
    setSaving(true);
    try {
      const permission = await requestWebPushPermission();
      if (permission !== "granted") { showGlobalSnackbar(permission === "unsupported" ? copy.unsupported : copy.browserPermissionBlocked); return; }
      const nextSubscription = await getOrCreateWebPushSubscription(config);
      const payload = nextSubscription && serializeWebPushSubscription(nextSubscription);
      if (!nextSubscription || !payload) { showGlobalSnackbar(copy.failed); return; }
      const response = await subscribeWebPush(payload);
      if (response.code !== 200) { showGlobalSnackbar(response.message || copy.failed); return; }
      const nextConfig = { ...config, subscribed: true };
      cacheWebPushConfig(nextConfig); setConfig(nextConfig); setSubscription(nextSubscription); showGlobalSnackbar(copy.subscribedSuccess);
    } catch { showGlobalSnackbar(copy.failed); } finally { setSaving(false); }
  }
  async function disable() {
    if (!config) return;
    setSaving(true);
    try {
      const response = await unsubscribeWebPush();
      if (response.code !== 200) { showGlobalSnackbar(response.message || copy.failed); return; }
      await subscription?.unsubscribe();
      const nextConfig = { ...config, subscribed: false };
      cacheWebPushConfig(nextConfig); setConfig(nextConfig); setSubscription(null); showGlobalSnackbar(copy.unsubscribed);
    } catch { showGlobalSnackbar(copy.failed); } finally { setSaving(false); }
  }
  async function openMessage(message: WebPushMessage) {
    if (!message.read) setMessages(await markWebPushMessageRead(message.id));
    const url = new URL(message.url || "/app/messages", location.origin);
    location.assign(url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : url.href);
  }
  async function confirmAction() {
    const action = confirm; setConfirm(null);
    if (action === "unsubscribe") await disable();
    if (action === "clear") setMessages(await clearWebPushMessages());
    if (action === "read") setMessages(await markAllWebPushMessagesRead());
  }

  if (loading) return <main className="app-page"><AppBackHeader title={copy.title} eyebrow="LifeStep" /><div className="page-loader"><LoaderCircle /><span>Loading…</span></div></main>;
  if (!isWebPushSupported()) return <main className="app-page"><AppBackHeader title={copy.title} eyebrow="LifeStep" /><div className="empty-state"><Bell /><h2>{copy.unsupported}</h2></div></main>;
  return <main className="app-page sub-page"><AppBackHeader title={copy.title} eyebrow="LifeStep" />
    <article className="web-push-page app-narrow-width">
      <header className="web-push-title"><div><Bell /><span><strong>{copy.title}</strong><small>{enabled ? copy.subscribedSuccess : copy.empty}</small></span></div><button className={`toggle ${enabled ? "on" : ""}`} disabled={saving} aria-label={copy.title} onClick={() => enabled ? setConfirm("unsubscribe") : void enable()}><i /></button></header>
      <div className="web-push-tools"><span>{messages.length ? copy.latestMessagesOnly : copy.empty}</span><div>{messages.some((item) => !item.read) ? <button onClick={() => setConfirm("read")}><ListChecks />{copy.markAllRead}</button> : null}{messages.length ? <button onClick={() => setConfirm("clear")}><Trash2 />{copy.clearAll}</button> : null}</div></div>
      {messages.length ? <div className="web-push-list">{messages.map((message) => <article className={message.read ? "read" : ""} key={message.id} onClick={() => void openMessage(message)}><span>{message.read ? <Check /> : <Circle />}</span><div><small>{relativeTime(message.receivedAt, dictionary.time)}</small><h2>{message.title}</h2><p>{message.body}</p></div><button aria-label={copy.delete} onClick={(event) => { event.stopPropagation(); void deleteWebPushMessage(message.id).then(setMessages); }}><Trash2 /></button></article>)}</div> : <div className="empty-state"><Bell /><h2>{copy.empty}</h2></div>}
    </article>
    {saving ? <div className="web-push-saving"><LoaderCircle className="spin" /></div> : null}
    {confirm ? <ConfirmModal title={confirm === "unsubscribe" ? copy.unsubscribeConfirmTitle : confirm === "clear" ? copy.clearAll : copy.markAllRead} description={confirm === "unsubscribe" ? copy.unsubscribeConfirmDescription : confirm === "clear" ? copy.clearAllDescription : copy.markAllReadDescription} yes={dictionary.confirm.yes} no={dictionary.confirm.no} onYes={() => void confirmAction()} onNo={() => setConfirm(null)} /> : null}
  </main>;
}

function ConfirmModal({ title, description, yes, no, onYes, onNo }: { title: string; description: string; yes: string; no: string; onYes: () => void; onNo: () => void }) {
  return <Modal onClose={onNo} labelledBy="web-push-confirm"><div className="web-push-confirm"><h2 id="web-push-confirm">{title}</h2><p>{description}</p><div><button className="button button-secondary" onClick={onNo}>{no}</button><button className="button" onClick={onYes}>{yes}</button></div></div></Modal>;
}

function relativeTime(value: string, copy: { justNow: string; minuteAgo: string; minutesAgo: string; hourAgo: string; hoursAgo: string; dayAgo: string; daysAgo: string }) {
  const seconds = Math.max(0, (Date.now() - Date.parse(value)) / 1000);
  if (seconds < 60) return copy.justNow;
  const minutes = Math.floor(seconds / 60); if (minutes === 1) return copy.minuteAgo; if (minutes < 60) return copy.minutesAgo.replace("{{value}}", String(minutes));
  const hours = Math.floor(minutes / 60); if (hours === 1) return copy.hourAgo; if (hours < 24) return copy.hoursAgo.replace("{{value}}", String(hours));
  const days = Math.floor(hours / 24); return days === 1 ? copy.dayAgo : copy.daysAgo.replace("{{value}}", String(days));
}
