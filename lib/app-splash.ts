const splashElementId = "app-splash";
const splashStartedAtDataKey = "appSplashStartedAt";
const splashMinimumMs = 2500;
const splashFadeMs = 260;
let splashDismissTimer = 0;

type AppSplashReadyPart = "viewport" | "content";

const requiredSplashReadyParts: AppSplashReadyPart[] = ["viewport", "content"];
const splashReadyParts = new Set<AppSplashReadyPart>();

export function markAppSplashReady(part: AppSplashReadyPart) {
  if (typeof document === "undefined") return;

  splashReadyParts.add(part);
  if (requiredSplashReadyParts.every((requiredPart) => splashReadyParts.has(requiredPart))) {
    document.documentElement.dataset.appSplashReady = "true";
    dismissAppSplash();
  }
}

export function dismissAppSplash() {
  if (typeof document === "undefined") return;

  const splash = document.getElementById(splashElementId);
  if (!splash || splash.dataset.exiting === "true" || splashDismissTimer) return;

  const root = document.documentElement;
  if (
    root.dataset.skipAppSplash === "true" ||
    root.dataset.showAppSplash !== "true"
  ) {
    splash.remove();
    return;
  }
  if (root.dataset.appSplashReady !== "true") return;

  const startedAt = Number(root.dataset[splashStartedAtDataKey]);
  const elapsed = Number.isFinite(startedAt) ? Date.now() - startedAt : 0;
  const remaining = Math.max(0, splashMinimumMs - elapsed);

  splashDismissTimer = window.setTimeout(() => {
    splashDismissTimer = 0;
    const currentSplash = document.getElementById(splashElementId);
    if (!currentSplash) return;

    currentSplash.dataset.exiting = "true";
    window.setTimeout(() => currentSplash.remove(), splashFadeMs);
  }, remaining);
}
