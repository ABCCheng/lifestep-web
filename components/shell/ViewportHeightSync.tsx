"use client";

import { useEffect } from "react";
import { markAppSplashReady } from "@/lib/app-splash";

function applyViewportHeight() {
  if (Number.isFinite(window.innerHeight) && window.innerHeight > 0) {
    document.documentElement.style.setProperty("--app-viewport-height", `${window.innerHeight}px`);
  }
}

export function ViewportHeightSync() {
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(applyViewportHeight);
    };
    sync();
    const readyTimer = window.setTimeout(() => markAppSplashReady("viewport"), 350);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(readyTimer);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);
  return null;
}
