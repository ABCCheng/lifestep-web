"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers/app-provider";
import { homePath, localizePath } from "@/lib/i18n";

export function AppBackHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) {
  const { locale } = useApp();
  return (
    <>
      <header className="back-header app-top-chrome app-mobile-chrome">
        <div className="app-header-inner app-back-header-inner">
          <Button type="button" size="icon" variant="destructive" className="app-header-action-button app-back-button" aria-label="Back" onClick={() => history.length > 1 ? history.back() : location.assign(localizePath("/", locale))}><ArrowLeft /></Button>
          <div className="app-back-title"><span>{eyebrow}</span><h1>{title}</h1></div>
          {actions}
          <Brand compact href={homePath("/", locale)} />
        </div>
      </header>
      <div className="app-mobile-header-spacer" aria-hidden="true" />
    </>
  );
}

export function AppSectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <header className="app-section-title"><span>{icon}</span><h1>{title}</h1></header>;
}
