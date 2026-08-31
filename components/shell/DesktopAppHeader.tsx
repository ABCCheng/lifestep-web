"use client";

import Link from "next/link";
import { FileText, HelpCircle, Info, Languages, MessageSquareText, Palette, Settings, ShieldCheck, Volume2 } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { Brand } from "@/components/Brand";
import { useApp } from "@/components/providers/app-provider";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { WebPushLinkButton } from "@/features/web-push/WebPushLinkButton";
import { homePath, localizePath } from "@/lib/i18n";

const appHeaderClass = "app-top-chrome sticky top-0 z-30 bg-transparent py-[1.35rem] max-md:fixed max-md:inset-x-0 max-md:top-0 max-md:w-full max-md:pb-2 max-md:pt-(--app-safe-header-top)";
const appHeaderInnerClass = "mx-auto flex h-10 w-[min(100%,var(--site-max-width))] items-center justify-between gap-4 px-4 lg:px-6";
const appHeaderActionClass = "relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-primary shadow-none outline-none before:absolute before:-inset-2.5 before:content-[''] [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:transition-[transform,opacity] [&_svg]:duration-150 hover:[&_svg]:scale-[1.08] hover:[&_svg]:opacity-80 focus-visible:[&_svg]:scale-[1.08] focus-visible:[&_svg]:opacity-80 aria-expanded:[&_svg]:scale-[1.08] aria-expanded:[&_svg]:opacity-80";
const appHeaderSpacerClass = "hidden max-md:block max-md:h-[var(--app-header-offset)] max-md:shrink-0";
const appMenuSurfaceClass = "absolute right-0 top-[calc(100%+0.5rem)] z-80 grid w-[220px] gap-0.5 overflow-hidden rounded-2xl border border-(--menu-border) p-1.5 text-popover-foreground [background:var(--menu-surface)] [box-shadow:var(--menu-shadow)] [backdrop-filter:blur(24px)_saturate(135%)] max-[680px]:w-[216px]";
const appMenuItemClass = "flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))] hover:text-foreground focus-visible:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))] [&_svg]:size-4 [&_svg]:text-primary";

export function DesktopAppHeader() {
  const { copy, lifeStep, locale } = useApp();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  useDismissibleMenu(aboutOpen, aboutRef, setAboutOpen);
  useDismissibleMenu(settingsOpen, settingsRef, setSettingsOpen);
  return (
    <>
      <header className={appHeaderClass}>
        <div className={appHeaderInnerClass}>
          <Brand href={homePath("/", locale)} />
          <nav className="flex min-w-max items-center justify-end gap-4 lg:gap-5" aria-label={lifeStep.common.appUtilities}>
            <HeaderMenu containerRef={aboutRef} icon={<HelpCircle />} label={copy.about} open={aboutOpen} onToggle={() => { setAboutOpen(!aboutOpen); setSettingsOpen(false); }}>
              <MenuLink href={`${localizePath("/about", locale)}?panel=app`} icon={<Info />} label={copy.aboutUs} onNavigate={() => setAboutOpen(false)} />
              <MenuLink href={`${localizePath("/about", locale)}?panel=privacy`} icon={<ShieldCheck />} label={copy.privacyPolicy} onNavigate={() => setAboutOpen(false)} />
              <MenuLink href={`${localizePath("/about", locale)}?panel=terms`} icon={<FileText />} label={copy.termsOfUse} onNavigate={() => setAboutOpen(false)} />
              <MenuLink href={`${localizePath("/about", locale)}?panel=feedback`} icon={<MessageSquareText />} label={copy.feedback} onNavigate={() => setAboutOpen(false)} />
            </HeaderMenu>
            <HeaderMenu containerRef={settingsRef} icon={<Settings />} label={copy.settings} open={settingsOpen} onToggle={() => { setSettingsOpen(!settingsOpen); setAboutOpen(false); }}>
              <MenuLink href={`${localizePath("/settings", locale)}?panel=theme`} icon={<Palette />} label={copy.theme} onNavigate={() => setSettingsOpen(false)} />
              <MenuLink href={`${localizePath("/settings", locale)}?panel=language`} icon={<Languages />} label={copy.language} onNavigate={() => setSettingsOpen(false)} />
              <MenuLink href={`${localizePath("/settings", locale)}?panel=voice`} icon={<Volume2 />} label={copy.voice} onNavigate={() => setSettingsOpen(false)} />
            </HeaderMenu>
            <WebPushLinkButton href={localizePath("/messages", locale)} label={copy.messages} />
          </nav>
        </div>
      </header>
      <div className={appHeaderSpacerClass} aria-hidden="true" />
    </>
  );
}

function HeaderMenu({ containerRef, icon, label, open, onToggle, children }: { containerRef: RefObject<HTMLDivElement | null>; icon: React.ReactNode; label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <div className="relative flex h-10 items-center" ref={containerRef}><button type="button" className={appHeaderActionClass} aria-label={label} aria-expanded={open} onClick={onToggle}>{icon}</button>{open ? <div className={appMenuSurfaceClass}>{children}</div> : null}</div>;
}

function MenuLink({ href, icon, label, onNavigate }: { href: string; icon: React.ReactNode; label: string; onNavigate: () => void }) {
  return <Link className={appMenuItemClass} href={href} onClick={onNavigate}>{icon}<span>{label}</span></Link>;
}
