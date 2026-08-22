"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, type ReactNode } from "react";
import { defaultLocale, dictionaries, getLocaleFromPathname, hasLocalePrefix, localizePath, stripLocaleFromPathname, type Dictionary, type Locale } from "@/lib/i18n";
import { getPreferredLocale, savePreferredLocale } from "@/lib/stores/locale";

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; dictionary: Dictionary; copy: Dictionary["app"] };
const LocaleContext = createContext<LocaleContextValue>({ locale: defaultLocale, setLocale: () => undefined, dictionary: dictionaries[defaultLocale], copy: dictionaries[defaultLocale].app });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);

  const preferredLocalePath = useCallback(() => {
    if (hasLocalePrefix(pathname)) return null;
    const preferredLocale = getPreferredLocale();
    if (preferredLocale === locale) return null;
    const query = searchParams.toString();
    const path = stripLocaleFromPathname(pathname);
    const nextPath = localizePath(path === "/app" ? "/" : path.replace(/^\/app/, "") || "/", preferredLocale);
    return query ? `${nextPath}?${query}` : nextPath;
  }, [locale, pathname, searchParams]);

  useLayoutEffect(() => {
    const nextPath = preferredLocalePath();
    if (nextPath) window.history.replaceState(null, "", nextPath);
  }, [preferredLocalePath]);

  useEffect(() => {
    document.documentElement.lang = locale;
    savePreferredLocale(locale);
  }, [locale]);

  useEffect(() => {
    const nextPath = preferredLocalePath();
    if (nextPath) router.replace(nextPath);
  }, [preferredLocalePath, router]);

  const setLocale = useCallback((next: Locale) => {
    savePreferredLocale(next);
    const query = searchParams.toString();
    const path = stripLocaleFromPathname(pathname);
    const nextPath = localizePath(path, next);
    router.push(query ? `${nextPath}?${query}` : nextPath);
  }, [pathname, router, searchParams]);
  const value = useMemo(() => ({ locale, setLocale, dictionary: dictionaries[locale], copy: dictionaries[locale].app }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
  return useContext(LocaleContext);
}
