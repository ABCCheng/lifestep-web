import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HomePage } from "@/features/home/HomePage";
import { dictionaries, isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.filter((locale) => locale !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: dictionaries[locale].homePage.seoTitle, description: dictionaries[locale].homePage.seoDescription };
}

export default async function LocalizedHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <HomePage locale={locale} />;
}
