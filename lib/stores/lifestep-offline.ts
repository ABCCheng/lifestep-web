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

// Publish a language download and reset its progress in one transaction.
// Resolve on transaction completion, since individual requests can succeed before an abort.
export async function commitOfflineRecords(records: Record<string, unknown>, deletedKeys: string[]) {
  const database = await openDatabase();
  if (database) {
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error || new Error("Offline data transaction aborted"));
        transaction.onerror = () => reject(transaction.error || new Error("Offline data transaction failed"));
        const store = transaction.objectStore(STORE_NAME);
        Object.entries(records).forEach(([key, value]) => store.put(value, key));
        deletedKeys.forEach((key) => store.delete(key));
      });
    } finally {
      database.close();
    }
  }
  Object.entries(records).forEach(([key, value]) => memoryRecords.set(key, value));
  deletedKeys.forEach((key) => memoryRecords.delete(key));
}
