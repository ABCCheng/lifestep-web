"use client";

import Link from "next/link";
import { FileText, HelpCircle, Info, Languages, MessageSquareText, Palette, Settings, ShieldCheck, Volume2 } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { Brand } from "@/components/Brand";
import { useApp } from "@/components/providers/app-provider";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { WebPushLinkButton } from "@/features/web-push/WebPushLinkButton";
import { homePath, localizePath } from "@/lib/i18n";
import {
  appHeaderActionClass,
  appHeaderClass,
  appHeaderInnerClass,
  appHeaderSpacerClass,
  appMenuItemClass,
  appMenuSurfaceClass,
} from "@/components/shell/app-header-styles";

export function DesktopAppHeader() {
  const { copy, locale } = useApp();
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
          <nav className="flex min-w-max items-center justify-end gap-4 lg:gap-5" aria-label="App utilities">
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
