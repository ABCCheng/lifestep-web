"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";
import { useApp } from "@/components/providers/app-provider";
import { homePath, localizePath } from "@/lib/i18n";

const appHeaderClass = "app-top-chrome sticky top-0 z-30 bg-transparent py-[1.35rem] max-md:fixed max-md:inset-x-0 max-md:top-0 max-md:w-full max-md:pb-2 max-md:pt-(--app-safe-header-top)";
const appMobileHeaderClass = `${appHeaderClass} app-mobile-chrome`;
const appHeaderInnerClass = "mx-auto flex h-10 w-[min(100%,var(--site-max-width))] items-center justify-between gap-4 px-4 lg:px-6";
const appBackHeaderInnerClass = `${appHeaderInnerClass} justify-start gap-1.5`;
const appHeaderActionClass = "relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-primary shadow-none outline-none before:absolute before:-inset-2.5 before:content-[''] [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:transition-[transform,opacity] [&_svg]:duration-150 hover:[&_svg]:scale-[1.08] hover:[&_svg]:opacity-80 focus-visible:[&_svg]:scale-[1.08] focus-visible:[&_svg]:opacity-80 aria-expanded:[&_svg]:scale-[1.08] aria-expanded:[&_svg]:opacity-80";
const appBackActionClass = `${appHeaderActionClass} [&_svg]:!size-6`;
const appHeaderSpacerClass = "hidden max-md:block max-md:h-[var(--app-header-offset)] max-md:shrink-0";

export function AppBackHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) {
  const { locale, lifeStep } = useApp();
  return (
    <>
      <header className={appMobileHeaderClass}>
        <div className={appBackHeaderInnerClass}>
          <button type="button" className={appBackActionClass} aria-label={lifeStep.common.back} onClick={() => history.length > 1 ? history.back() : location.assign(localizePath("/", locale))}><ArrowLeft /></button>
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
