import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppProvider } from "@/components/providers/app-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { AppShell } from "@/components/shell/AppShell";

export default function LifeStepAppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LocaleProvider><AppProvider><AppShell>{children}</AppShell></AppProvider></LocaleProvider>
    </Suspense>
  );
}
