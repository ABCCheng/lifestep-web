"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, dictionaries, type Dictionary, type Locale } from "@/lib/i18n";
import { getPreferredLocale, savePreferredLocale } from "@/lib/stores/locale";

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; dictionary: Dictionary; copy: Dictionary["app"] };
const LocaleContext = createContext<LocaleContextValue>({ locale: defaultLocale, setLocale: () => undefined, dictionary: dictionaries[defaultLocale], copy: dictionaries[defaultLocale].app });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  useEffect(() => setLocaleState(getPreferredLocale()), []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const setLocale = (next: Locale) => { setLocaleState(next); savePreferredLocale(next); };
  const value = useMemo(() => ({ locale, setLocale, dictionary: dictionaries[locale], copy: dictionaries[locale].app }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
  return useContext(LocaleContext);
}
