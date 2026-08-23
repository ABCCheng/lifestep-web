"use client";

import { Check, ChevronDown, Languages, Monitor, Moon, Palette, Sun, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { AudioPlayButton } from "@/components/audio/AudioPlayButton";
import { AppBackHeader as BackHeader, AppSectionTitle } from "@/components/app";
import { useApp } from "@/components/providers/app-provider";
import { localeNames, locales, localizePath, stripLocaleFromPathname, type Locale } from "@/lib/i18n";
import { savePreferredLocale } from "@/lib/stores/locale";
import { getPreviousAppNavigationPath, replaceCurrentAppNavigationPath } from "@/lib/stores/app-session";
import { TTS_VOICE_OPTIONS, type TTSVoice } from "@/lib/stores/tts";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { cn } from "@/lib/utils";

const optionButtonClass =
  "grid min-h-16 w-full cursor-pointer grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-3.5 py-[9px] text-left [&>span:first-child]:grid [&>span:first-child]:size-10 [&>span:first-child]:place-items-center [&>span:first-child]:rounded-[11px] [&>span:first-child]:bg-[var(--warm)] [&>span:first-child]:text-primary [&>svg]:text-primary";

const voiceMenuClass =
  "absolute inset-x-0 top-[calc(100%+4px)] z-80 grid max-h-[min(280px,45dvh)] gap-0.5 overflow-y-auto rounded-2xl border border-(--menu-border) p-1.5 text-popover-foreground [background:var(--menu-surface)] [box-shadow:var(--menu-shadow)] [backdrop-filter:blur(24px)_saturate(135%)]";

const themeOptionStateClass = {
  system: "[[data-theme-mode=system]_&]:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] [[data-theme-mode=system]_&]:text-primary",
  light: "[[data-theme-mode=light]_&]:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] [[data-theme-mode=light]_&]:text-primary",
  dark: "[[data-theme-mode=dark]_&]:border-[color-mix(in_srgb,var(--primary)_40%,transparent)] [[data-theme-mode=dark]_&]:text-primary",
} as const;

const themeCheckStateClass = {
  system: "[[data-theme-mode=system]_&]:block",
  light: "[[data-theme-mode=light]_&]:block",
  dark: "[[data-theme-mode=dark]_&]:block",
} as const;

export default function SettingsPage() { return <Suspense fallback={null}><SettingsContent /></Suspense>; }

function SettingsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const panel = params.get("panel") || "theme";
  const { locale, dictionary, copy, theme, setTheme, voices, setVoice } = useApp();
  const title = panel === "language" ? dictionary.setting.language.title : panel === "voice" ? dictionary.setting.voice.title : dictionary.setting.theme.title;
  const icon = panel === "language" ? <Languages /> : panel === "voice" ? <Volume2 /> : <Palette />;
  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    savePreferredLocale(nextLocale);
    const previous = getPreviousAppNavigationPath() || localizePath("/", locale);
    const [previousPath, query = ""] = previous.split("?", 2);
    const targetPath = localizePath(stripLocaleFromPathname(previousPath), nextLocale);
    const target = query ? `${targetPath}?${query}` : targetPath;
    replaceCurrentAppNavigationPath(target);
    router.replace(target);
  }
  return <main className="app-page pb-10"><BackHeader title={title} eyebrow={copy.settings} /><article className="app-narrow-width py-[42px] max-md:py-7">
    <AppSectionTitle icon={icon} title={title} />
    {panel === "theme" ? <div className="grid gap-[9px]">{(["system", "light", "dark"] as const).map((mode) => <button key={mode} aria-pressed={theme === mode} className={cn(optionButtonClass, themeOptionStateClass[mode])} onClick={() => setTheme(mode)}><span>{mode === "system" ? <Monitor /> : mode === "dark" ? <Moon /> : <Sun />}</span><strong>{mode === "system" ? dictionary.setting.theme.followSystem : mode === "light" ? dictionary.setting.theme.lightMode : dictionary.setting.theme.darkMode}</strong><Check className={cn("hidden", themeCheckStateClass[mode])} /></button>)}</div> : null}
    {panel === "language" ? <div className="grid gap-[9px]">{locales.map((item: Locale) => { const active = locale === item; return <button key={item} className={cn(optionButtonClass, active && "border-[color-mix(in_srgb,var(--primary)_40%,transparent)] text-primary")} onClick={() => changeLocale(item)}><span className="text-xs font-extrabold text-primary">{item.startsWith("zh") ? "中" : item.slice(0, 2).toUpperCase()}</span><strong>{localeNames[item]}</strong>{active ? <Check /> : null}</button>; })}</div> : null}
    {panel === "voice" ? <div className="grid gap-3.5"><VoiceSetting title={dictionary.setting.voice.self.title} subtitle={dictionary.setting.voice.self.subtitle} femaleLabel={dictionary.setting.voice.female} maleLabel={dictionary.setting.voice.male} playLabel={dictionary.newsDetail.playAudio} errorLabel={dictionary.newsDetail.audioFailed} value={voices.self} onChange={(value) => setVoice("self", value)} /><VoiceSetting title={dictionary.setting.voice.partner.title} subtitle={dictionary.setting.voice.partner.subtitle} femaleLabel={dictionary.setting.voice.female} maleLabel={dictionary.setting.voice.male} playLabel={dictionary.newsDetail.playAudio} errorLabel={dictionary.newsDetail.audioFailed} value={voices.partner} onChange={(value) => setVoice("partner", value)} /></div> : null}
  </article></main>;
}

function VoiceSetting({ title, subtitle, femaleLabel, maleLabel, playLabel, errorLabel, value, onChange }: { title: string; subtitle: string; femaleLabel: string; maleLabel: string; playLabel: string; errorLabel: string; value: TTSVoice; onChange: (voice: TTSVoice) => void }) {
  const selectedVoice = TTS_VOICE_OPTIONS.find((voice) => voice.value === value) ?? TTS_VOICE_OPTIONS[0];
  return <section className="rounded-2xl border border-border bg-card p-[19px]"><div className="mb-3.5 grid gap-1"><strong>{title}</strong><small className="text-muted-foreground">{subtitle}</small></div><div className="flex gap-2"><VoiceSelector value={value} onChange={onChange} ariaLabel={title} femaleLabel={femaleLabel} maleLabel={maleLabel} /><AudioPlayButton text={`Hello, this is ${selectedVoice.label}. Welcome to LifeStep.`} voice={value} label={playLabel} errorLabel={errorLabel} className="ml-0 size-11 shrink-0" /></div></section>;
}

function VoiceSelector({ value, onChange, ariaLabel, femaleLabel, maleLabel }: { value: TTSVoice; onChange: (voice: TTSVoice) => void; ariaLabel: string; femaleLabel: string; maleLabel: string }) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, menuRef, setOpen);
  const genderLabel = (gender: string) => gender === "Female" ? femaleLabel : maleLabel;
  const selected = TTS_VOICE_OPTIONS.find((voice) => voice.value === value) ?? TTS_VOICE_OPTIONS[0];

  return <div className="relative min-w-0 flex-1" ref={menuRef}>
    <button type="button" className="flex min-h-11 w-full items-center justify-between gap-2.5 rounded-[var(--radius)] border border-border/60 bg-card/70 px-3 text-left text-foreground transition-colors hover:border-primary/40 aria-expanded:border-primary/40" aria-label={ariaLabel} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((current) => !current)}><span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{selected.label} · {genderLabel(selected.gender)}</span><ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" /></button>
    {open ? <div className={voiceMenuClass} role="listbox" aria-label={ariaLabel}>{TTS_VOICE_OPTIONS.map((voice) => { const active = voice.value === value; return <button type="button" role="option" aria-selected={active} className={cn("flex min-h-11 w-full items-center justify-between gap-2.5 rounded-xl bg-transparent px-3.5 py-2.5 text-left text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground focus-visible:bg-primary/10 focus-visible:text-foreground [&_svg]:size-4 [&_svg]:text-primary", active && "bg-primary/10 text-foreground")} key={voice.value} onClick={() => { onChange(voice.value); setOpen(false); }}><span>{voice.label} · {genderLabel(voice.gender)}</span>{active ? <Check aria-hidden="true" /> : null}</button>; })}</div> : null}
  </div>;
}
