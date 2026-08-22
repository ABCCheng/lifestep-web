import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import pa from "@/messages/pa.json";
import ru from "@/messages/ru.json";
import vi from "@/messages/vi.json";
import zhHans from "@/messages/zh-Hans.json";
import zhHant from "@/messages/zh-Hant.json";
import { lifeStepAppCopy, lifeStepHome, type LifeStepAppCopy, type LifeStepHomeContent } from "@/messages/lifestep";

const localeDefinitions = [
  { code: "en", name: "English", dictionary: en },
  { code: "fr", name: "Français", dictionary: fr },
  { code: "zh-Hans", name: "简体中文", dictionary: zhHans },
  { code: "zh-Hant", name: "繁体中文", dictionary: zhHant },
  { code: "pa", name: "ਪੰਜਾਬੀ", dictionary: pa },
  { code: "es", name: "Español", dictionary: es },
  { code: "ja", name: "日本語", dictionary: ja },
  { code: "ko", name: "한국어", dictionary: ko },
  { code: "ru", name: "Русский", dictionary: ru },
  { code: "vi", name: "Tiếng Việt", dictionary: vi },
] as const;

export type Locale = (typeof localeDefinitions)[number]["code"];
export type Dictionary = typeof en & { homePage: LifeStepHomeContent; app: LifeStepAppCopy };
export const defaultLocale: Locale = "en";
export const locales = localeDefinitions.map(({ code }) => code) as Locale[];
export const localeNames = Object.fromEntries(localeDefinitions.map(({ code, name }) => [code, name])) as Record<Locale, string>;
export const dictionaries = Object.fromEntries(localeDefinitions.map(({ code, dictionary }) => [code, {
  ...dictionary,
  homePage: lifeStepHome[code],
  app: lifeStepAppCopy[code],
}])) as Record<Locale, Dictionary>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  return value && isLocale(value) ? value : null;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  return normalizeLocale(segments[0]) ?? (segments[0] === "app" ? normalizeLocale(segments[1]) : null) ?? defaultLocale;
}

export function hasLocalePrefix(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return Boolean(normalizeLocale(segments[0]) || (segments[0] === "app" && normalizeLocale(segments[1])));
}

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const localeIndex = normalizeLocale(segments[0]) ? 0 : segments[0] === "app" && normalizeLocale(segments[1]) ? 1 : -1;
  if (localeIndex >= 0) {
    const path = `/${segments.slice(localeIndex + 1).join("/")}`;
    return path === "/" ? "/" : path.replace(/\/$/, "");
  }
  return pathname === "" ? "/" : pathname;
}

export function localizePath(path: string, locale: Locale) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? `/app/${locale}` : `/app/${locale}${normalizedPath}`;
}

export function homePath(path: string, locale: Locale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale && normalized === "/") return "/";
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
