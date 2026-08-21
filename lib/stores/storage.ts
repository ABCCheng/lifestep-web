function getStorage(kind: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage(key: string) {
  return getStorage("local")?.getItem(key) ?? null;
}

export function writeStorage(key: string, value: string) {
  getStorage("local")?.setItem(key, value);
}

export function readSessionStorage(key: string) {
  return getStorage("session")?.getItem(key) ?? null;
}

export function writeSessionStorage(key: string, value: string) {
  getStorage("session")?.setItem(key, value);
}

export function readJsonStorage<T>(key: string) {
  const raw = readStorage(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJsonStorage<T>(key: string, value: T) {
  writeStorage(key, JSON.stringify(value));
}
