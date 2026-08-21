export const ENV = {
  development: { BASE_URL: "http://127.0.0.1:9001" },
  test: { BASE_URL: "http://127.0.0.1:9001" },
  production: { BASE_URL: "https://io.effortgo.xyz" },
} as const;

export type AppEnv = keyof typeof ENV;

function resolveAppEnv(): AppEnv {
  const explicit = process.env.NEXT_PUBLIC_ENV;
  if (explicit === "development" || explicit === "test" || explicit === "production") {
    return explicit;
  }
  return process.env.NODE_ENV === "development" ? "development" : "production";
}

export const APP_ENV = resolveAppEnv();
export const API_ORIGIN = process.env.API_BASE_URL || ENV[APP_ENV].BASE_URL;
