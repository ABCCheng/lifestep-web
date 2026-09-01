export type AppEnv = "development" | "test" | "production";

function resolveBuildConfig(name: string, value: string | undefined, fallback = "") {
  const resolved = value?.trim() ?? "";
  if (resolved) return resolved.replace(/\/+$/, "");
  if (process.env.NEXT_PUBLIC_ENV === "production") {
    throw new Error(`${name} must be configured for a production build.`);
  }
  return fallback;
}

function resolveAppEnv(): AppEnv {
  const explicit = process.env.NEXT_PUBLIC_ENV;
  if (explicit === "development" || explicit === "test" || explicit === "production") {
    return explicit;
  }
  return process.env.NODE_ENV === "development" ? "development" : "production";
}

export const APP_ENV = resolveAppEnv();
export const API_ORIGIN = resolveBuildConfig(
  "NEXT_PUBLIC_API_ORIGIN",
  process.env.NEXT_PUBLIC_API_ORIGIN,
  "http://127.0.0.1:9001",
);
