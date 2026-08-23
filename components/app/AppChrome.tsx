"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";
import { useApp } from "@/components/providers/app-provider";
import { homePath, localizePath } from "@/lib/i18n";
import {
  appBackActionClass,
  appBackHeaderInnerClass,
  appHeaderSpacerClass,
  appMobileHeaderClass,
} from "@/components/shell/app-header-styles";

export function AppBackHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) {
  const { locale } = useApp();
  return (
    <>
      <header className={appMobileHeaderClass}>
        <div className={appBackHeaderInnerClass}>
          <button type="button" className={appBackActionClass} aria-label="Back" onClick={() => history.length > 1 ? history.back() : location.assign(localizePath("/", locale))}><ArrowLeft /></button>
          <div className="min-w-0"><span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.64rem] leading-3 font-normal uppercase tracking-[0.09em] text-muted-foreground">{eyebrow}</span><h1 className="mt-0.5 mb-0 text-[1.08rem] leading-[1.2rem] font-bold tracking-[-0.025em]">{title}</h1></div>
          {actions}
          <div className="ml-auto max-md:hidden"><Brand compact href={homePath("/", locale)} /></div>
        </div>
      </header>
      <div className={appHeaderSpacerClass} aria-hidden="true" />
    </>
  );
}

export function AppSectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <header className="mb-4 flex items-center gap-2.5 py-4 max-md:hidden"><span className="grid size-8 shrink-0 place-items-center text-primary [&_svg]:size-8">{icon}</span><h1 className="m-0 text-2xl leading-8 font-bold tracking-[-0.025em]">{title}</h1></header>;
}
