import type { Locale } from "@/lib/i18n";
import { normalizeLocale } from "@/lib/i18n";
import { readStorage, writeStorage } from "./storage";

export const LOCALE_STORAGE_KEY = "LIFESTEP_LOCALE";

export function getPreferredLocale(): Locale {
  const value = readStorage(LOCALE_STORAGE_KEY);
  return normalizeLocale(value) ?? "en";
}

export function savePreferredLocale(locale: Locale) {
  writeStorage(LOCALE_STORAGE_KEY, locale);
}
