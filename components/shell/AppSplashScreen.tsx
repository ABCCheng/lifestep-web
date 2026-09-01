"use client";

import { useEffect, useState } from "react";

import { dismissAppSplash, subscribeAppSplashDismiss } from "@/lib/app-splash";
import { cn } from "@/lib/utils";
import { appZIndex } from "@/lib/z-index";

export function AppSplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAppSplashDismiss(() => setVisible(false));
    const root = document.documentElement;
    const shouldShowSplash = root.dataset.showAppSplash === "true";
    let firstFrame = 0;
    let secondFrame = 0;

    if (root.dataset.appSplashDismissed === "true") {
      setVisible(false);
      return unsubscribe;
    }

    if (!shouldShowSplash) {
      dismissAppSplash();
      return unsubscribe;
    }

    // Start the handoff clock after the splash has had a chance to paint.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        root.dataset.appSplashStartedAt = String(Date.now());
        dismissAppSplash();
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      unsubscribe();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="app-splash"
      role="status"
      aria-label="LifeStep"
      className={cn("app-splash-screen fixed inset-0 flex-col items-center justify-center", appZIndex.splash)}
    >
      <div className="app-splash-screen-content flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="app-splash-logo block h-24 w-24 md:h-28 md:w-28"
        />
        <p className="text-2xl font-bold text-[#d3001c]">Step into real life</p>
      </div>
    </div>
  );
}
