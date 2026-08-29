"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { markAppSplashReady } from "@/lib/app-splash";
import { rememberAppNavigationPath } from "@/lib/stores/app-session";
import { useApp } from "@/components/providers/app-provider";
import { stripLocaleFromPathname } from "@/lib/i18n";
import { subscribeWebPush } from "@/lib/api/web-push";
import { markWebPushMessageRead } from "@/lib/stores/web-push-messages";
import { getServiceWorkerContainer, syncCurrentWebPushSubscription } from "@/lib/web-push-client";

function canRegisterServiceWorker() {
  return "serviceWorker" in navigator &&
    (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1");
}

function isStandaloneApp() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

async function removeLegacyAppScopedServiceWorkers() {
  if (typeof navigator.serviceWorker.getRegistrations !== "function") return;

  const legacyScope = `${location.origin}/app/`;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => registration.scope === legacyScope)
      .map((registration) => registration.unregister()),
  );
}

const pwaEdgeGestureClass = "app-pwa-top-route";
const pwaEdgeGestureWidth = 24;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useApp();
  const isJourneyRoot = stripLocaleFromPathname(pathname) === "/";

  useEffect(() => {
    if (!canRegisterServiceWorker()) return;
    let active = true;
    void removeLegacyAppScopedServiceWorkers()
      .catch(() => undefined)
      .then(() => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }))
      .then(async () => {
        if (!active) return;
        const readyRegistration = await navigator.serviceWorker.ready;
        readyRegistration.active?.postMessage({ type: "lifestep:precache-app-shell", locale });
        readyRegistration.active?.postMessage({ type: "lifestep:push-preferences", languageCode: locale, region: "Toronto" });
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
        const destination = `${target.pathname}${target.search}${target.hash}`;
        if (!navigator.onLine || isStandaloneApp()) window.location.assign(destination);
        else router.push(destination);
      }
    };
    serviceWorker?.addEventListener("message", onMessage);
    return () => { active = false; serviceWorker?.removeEventListener("message", onMessage); };
  }, [locale, router]);

  useEffect(() => {
    const navigateOffline = (event: MouseEvent) => {
      if ((!isStandaloneApp() && navigator.onLine) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || (url.pathname !== "/app" && !url.pathname.startsWith("/app/"))) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", navigateOffline, true);
    return () => document.removeEventListener("click", navigateOffline, true);
  }, []);

  useEffect(() => {
    const query = searchParams.toString();
    rememberAppNavigationPath(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isJourneyRoot || !isStandaloneApp()) return;

    document.documentElement.classList.add(pwaEdgeGestureClass);

    const preventPwaEdgeNavigation = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const touchX = event.touches[0]?.clientX;
      if (touchX === undefined) return;

      const startedAtNavigationEdge =
        touchX <= pwaEdgeGestureWidth || touchX >= window.innerWidth - pwaEdgeGestureWidth;
      if (startedAtNavigationEdge && event.cancelable) event.preventDefault();
    };

    document.addEventListener("touchstart", preventPwaEdgeNavigation, { passive: false });
    return () => {
      document.documentElement.classList.remove(pwaEdgeGestureClass);
      document.removeEventListener("touchstart", preventPwaEdgeNavigation);
    };
  }, [isJourneyRoot]);

  useEffect(() => {
    const content = document.querySelector<HTMLElement>(".app-content-inner");
    if (!content) return;

    let firstFrame = 0;
    let secondFrame = 0;

    const hasVisibleLoadingOverlay = () => Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="app-loading-overlay"]')
    ).some((overlay) => {
      const style = window.getComputedStyle(overlay);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    const hasMountedPage = () => content.children.length > 0;

    const cancelReadyFrames = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };

    const checkContentReady = () => {
      cancelReadyFrames();
      if (!hasMountedPage() || hasVisibleLoadingOverlay()) return;

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (hasMountedPage() && !hasVisibleLoadingOverlay()) {
            markAppSplashReady("content");
          }
        });
      });
    };

    const observer = new MutationObserver(checkContentReady);
    observer.observe(content, { childList: true, subtree: true });
    checkContentReady();

    return () => {
      observer.disconnect();
      cancelReadyFrames();
    };
  }, []);

  return <div className="app-shell-root app-root">
    <div className="app-content">
      <div className="app-content-inner">{children}</div>
    </div>
  </div>;
}
