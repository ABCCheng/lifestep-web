const DB_NAME = "lifestep-offline-v1";
const STORE_NAME = "records";
const memoryRecords = new Map<string, unknown>();

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!canUseIndexedDb()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export async function readOfflineRecord<T>(key: string): Promise<T | null> {
  const database = await openDatabase();
  if (!database) return (memoryRecords.get(key) as T | undefined) ?? null;
  return new Promise((resolve) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => resolve(null);
  });
}

export async function writeOfflineRecord<T>(key: string, value: T) {
  memoryRecords.set(key, value);
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });
}

export async function deleteOfflineRecord(key: string) {
  memoryRecords.delete(key);
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });
}

export const offlineKeys = {
  journey: "journey",
  vocabulary: "vocabulary",
  keyPhrases: "key-phrases",
  scenarioProgress: "scenario-progress",
  vocabularyProgress: "vocabulary-progress",
  sentenceProgress: "sentence-progress",
};
