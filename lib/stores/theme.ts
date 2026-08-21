import { readStorage, writeStorage } from "./storage";

export const APP_THEME_COLORS = { light: "#ffffff", dark: "#171a18" } as const;
export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "LIFESTEP_THEME_MODE";
const THEME_CHANGE_EVENT = "lifestep:theme-change";
let volatileThemeMode: ThemeMode | null = null;

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const value = readStorage(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" || value === "system"
    ? value
    : volatileThemeMode ?? "system";
}

export function saveThemeMode(mode: ThemeMode) {
  volatileThemeMode = mode;
  writeStorage(THEME_STORAGE_KEY, mode);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function subscribeTheme(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleStorage = (event: StorageEvent) => event.key === THEME_STORAGE_KEY && listener();
  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  media.addEventListener("change", listener);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
    media.removeEventListener("change", listener);
  };
}
