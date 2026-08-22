import type { ReactNode } from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppProvider } from "@/components/providers/app-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { AppShell } from "@/components/shell/AppShell";
import { isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LifeStepAppLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Suspense fallback={null}>
      <LocaleProvider><AppProvider><AppShell>{children}</AppShell></AppProvider></LocaleProvider>
    </Suspense>
  );
}
