import type { JourneyType } from "@/lib/types";
import { readStorage, writeStorage } from "./storage";

export const JOURNEY_TYPE_STORAGE_KEY = "LIFESTEP_JOURNEY_TYPE";
const JOURNEY_TYPE_CHANGE_EVENT = "lifestep:journey-type-change";

export function getStoredJourneyType(): JourneyType | null {
  const value = readStorage(JOURNEY_TYPE_STORAGE_KEY)?.trim().toUpperCase();
  if (value !== "STUDY" && value !== "WORK" && value !== "FAMILY") return null;
  return value as JourneyType;
}

export function saveJourneyType(value: JourneyType) {
  writeStorage(JOURNEY_TYPE_STORAGE_KEY, value.toUpperCase());
  if (typeof window !== "undefined") window.dispatchEvent(new Event(JOURNEY_TYPE_CHANGE_EVENT));
}

export function subscribeStoredJourneyType(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === JOURNEY_TYPE_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(JOURNEY_TYPE_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(JOURNEY_TYPE_CHANGE_EVENT, listener);
  };
}
