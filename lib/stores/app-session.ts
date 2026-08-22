import { readSessionStorage, writeSessionStorage } from "./storage";

const NAVIGATION_STACK_KEY = "LIFESTEP_APP_NAVIGATION_STACK";
export const APP_SPLASH_SESSION_KEY = "LIFESTEP_PWA_SPLASH_SHOWN";

function readStack() {
  const raw = readSessionStorage(NAVIGATION_STACK_KEY);
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function rememberAppNavigationPath(path: string) {
  const stack = readStack();
  if (stack.at(-1) === path) return;
  writeSessionStorage(NAVIGATION_STACK_KEY, JSON.stringify([...stack, path].slice(-50)));
}

export function getPreviousAppNavigationPath() {
  return readStack().at(-2) ?? null;
}

export function replaceCurrentAppNavigationPath(path: string) {
  const stack = readStack();
  if (!stack.length) {
    writeSessionStorage(NAVIGATION_STACK_KEY, JSON.stringify([path]));
    return;
  }
  stack[stack.length - 1] = path;
  writeSessionStorage(NAVIGATION_STACK_KEY, JSON.stringify(stack));
}
