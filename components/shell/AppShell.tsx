"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { markAppSplashReady } from "@/lib/app-splash";
import { rememberAppNavigationPath } from "@/lib/stores/app-session";
import { useApp } from "@/components/providers/app-provider";
import { subscribeWebPush } from "@/lib/api/web-push";
import { markWebPushMessageRead } from "@/lib/stores/web-push-messages";
import { getServiceWorkerContainer, syncCurrentWebPushSubscription } from "@/lib/web-push-client";

function canRegisterServiceWorker() {
  return "serviceWorker" in navigator &&
    (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useApp();

  useEffect(() => {
    if (!canRegisterServiceWorker()) return;
    let active = true;
    void navigator.serviceWorker.register("/sw.js", { scope: "/app/", updateViaCache: "none" }).then(async (registration) => {
      if (!active) return;
      registration.active?.postMessage({ type: "lifestep:push-preferences", languageCode: locale, region: "Toronto" });
      const result = await syncCurrentWebPushSubscription();
      if (result.status === "sync-error") console.warn("[web-push] subscription sync failed");
    }).catch((error) => console.warn("Service worker registration failed", error));

    const serviceWorker = getServiceWorkerContainer();
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "lifestep:push-subscription-change" && event.data.subscription) {
        void subscribeWebPush(event.data.subscription);
      }
      if (event.data?.type === "lifestep:notification-navigation" && typeof event.data.url === "string") {
        const target = new URL(event.data.url, location.origin);
        if (event.data.messageId) void markWebPushMessageRead(event.data.messageId);
        router.push(`${target.pathname}${target.search}${target.hash}`);
      }
    };
    serviceWorker?.addEventListener("message", onMessage);
    return () => { active = false; serviceWorker?.removeEventListener("message", onMessage); };
  }, [locale, router]);

  useEffect(() => {
    const query = searchParams.toString();
    rememberAppNavigationPath(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  useEffect(() => {
    markAppSplashReady("content");
  }, []);

  return <div className="app-shell-root">{children}</div>;
}
