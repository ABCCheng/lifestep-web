"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { APP_THEME_COLORS, getStoredThemeMode, saveThemeMode, subscribeTheme, type ThemeMode } from "@/lib/stores/theme";

type ThemeContextValue = { themeMode: ThemeMode; setThemeMode: (mode: ThemeMode) => void; isDark: boolean };
const ThemeContext = createContext<ThemeContextValue>({ themeMode: "system", setThemeMode: () => undefined, isDark: false });

function systemIsDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  const color = isDark ? APP_THEME_COLORS.dark : APP_THEME_COLORS.light;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  root.style.setProperty("--app-safe-top-color", color);
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", color));
}

function snapshot() {
  const mode = getStoredThemeMode();
  const dark = mode === "system" ? systemIsDark() : mode === "dark";
  return `${mode}:${dark ? "1" : "0"}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useSyncExternalStore(subscribeTheme, snapshot, () => "system:0");
  const [storedMode, darkValue] = value.split(":");
  const themeMode: ThemeMode = storedMode === "light" || storedMode === "dark" ? storedMode : "system";
  const isDark = darkValue === "1";
  useEffect(() => applyTheme(isDark), [isDark]);
  const setThemeMode = useCallback((mode: ThemeMode) => {
    applyTheme(mode === "system" ? systemIsDark() : mode === "dark");
    saveThemeMode(mode);
  }, []);
  const context = useMemo(() => ({ themeMode, setThemeMode, isDark }), [themeMode, setThemeMode, isDark]);
  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
