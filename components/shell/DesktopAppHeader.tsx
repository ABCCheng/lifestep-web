"use client";

import Link from "next/link";
import { FileText, HelpCircle, Info, Languages, MessageSquareText, Palette, Settings, ShieldCheck, Volume2 } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { Brand } from "@/components/Brand";
import { useApp } from "@/components/providers/app-provider";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { WebPushLinkButton } from "@/features/web-push/WebPushLinkButton";

export function DesktopAppHeader() {
  const { copy } = useApp();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  useDismissibleMenu(aboutOpen, aboutRef, setAboutOpen);
  useDismissibleMenu(settingsOpen, settingsRef, setSettingsOpen);
  return (
    <header className="journey-header desktop-app-header">
      <Brand href="/" />
      <nav className="app-actions" aria-label="App utilities">
        <HeaderMenu containerRef={aboutRef} icon={<HelpCircle />} label={copy.about} open={aboutOpen} onToggle={() => { setAboutOpen(!aboutOpen); setSettingsOpen(false); }}>
          <MenuLink href="/app/about?panel=app" icon={<Info />} label="About LifeStep" />
          <MenuLink href="/app/about?panel=privacy" icon={<ShieldCheck />} label="Privacy" />
          <MenuLink href="/app/about?panel=terms" icon={<FileText />} label="Terms" />
          <MenuLink href="/app/about?panel=feedback" icon={<MessageSquareText />} label="Feedback" />
        </HeaderMenu>
        <HeaderMenu containerRef={settingsRef} icon={<Settings />} label={copy.settings} open={settingsOpen} onToggle={() => { setSettingsOpen(!settingsOpen); setAboutOpen(false); }}>
          <MenuLink href="/app/settings?panel=theme" icon={<Palette />} label="Theme" />
          <MenuLink href="/app/settings?panel=language" icon={<Languages />} label="Language" />
          <MenuLink href="/app/settings?panel=voice" icon={<Volume2 />} label="Voice" />
        </HeaderMenu>
        <WebPushLinkButton href="/app/messages" label={copy.messages} />
      </nav>
    </header>
  );
}

function HeaderMenu({ containerRef, icon, label, open, onToggle, children }: { containerRef: RefObject<HTMLDivElement | null>; icon: React.ReactNode; label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <div className="menu-wrap" ref={containerRef}><button className="icon-button" aria-label={label} aria-expanded={open} onClick={onToggle}>{icon}</button>{open ? <div className="app-menu">{children}</div> : null}</div>;
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return <Link href={href}>{icon}<span>{label}</span></Link>;
}
