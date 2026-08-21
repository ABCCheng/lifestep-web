const fallbackSiteUrl = "https://lifestep.effortgo.xyz";

export const SITE_NAME = "LifeStep";

function normalizeSiteUrl(value: string | undefined) {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed) return fallbackSiteUrl;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
);
