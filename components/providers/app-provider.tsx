"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocaleContext } from "./locale-provider";
import { useThemeContext } from "./theme-provider";
import { DEFAULT_TTS_SETTINGS, getTTSSettings, saveTTSSettings, type TTSVoice, type VoiceSettings, type VoiceSide } from "@/lib/stores/tts";

type AppContextValue = ReturnType<typeof useLocaleContext> & {
  theme: ReturnType<typeof useThemeContext>["themeMode"];
  setTheme: ReturnType<typeof useThemeContext>["setThemeMode"];
  voices: VoiceSettings;
  setVoice: (side: VoiceSide, voice: TTSVoice) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleContext();
  const theme = useThemeContext();
  const [voices, setVoices] = useState<VoiceSettings>(() =>
    typeof window === "undefined" ? DEFAULT_TTS_SETTINGS : getTTSSettings()
  );
  const setVoice = (side: VoiceSide, voice: TTSVoice) => {
    setVoices((current) => {
      const next = { ...current, [side]: voice };
      saveTTSSettings(next);
      return next;
    });
  };
  const value = useMemo(() => ({ ...locale, theme: theme.themeMode, setTheme: theme.setThemeMode, voices, setVoice }), [locale, theme.themeMode, theme.setThemeMode, voices]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used within AppProvider");
  return value;
}
