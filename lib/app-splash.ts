const SPLASH_ID = "app-splash";
const REQUIRED_PARTS = ["viewport", "content"] as const;
const readyParts = new Set<(typeof REQUIRED_PARTS)[number]>();

export function markAppSplashReady(part: (typeof REQUIRED_PARTS)[number]) {
  if (typeof document === "undefined") return;
  readyParts.add(part);
  if (REQUIRED_PARTS.every((item) => readyParts.has(item))) dismissAppSplash();
}

export function dismissAppSplash() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const splash = document.getElementById(SPLASH_ID);
  if (!splash || root.dataset.showAppSplash !== "true" || splash.dataset.exiting === "true") {
    if (splash && root.dataset.showAppSplash !== "true") splash.remove();
    return;
  }
  if (!REQUIRED_PARTS.every((item) => readyParts.has(item))) return;
  splash.dataset.exiting = "true";
  window.setTimeout(() => splash.remove(), 280);
}
