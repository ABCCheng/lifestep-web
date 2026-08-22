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
  return <main className="app-page sub-page"><BackHeader title={title} eyebrow={copy.settings} /><article className="settings-content app-narrow-width">
    <AppSectionTitle icon={icon} title={title} />
    {panel === "theme" ? <div className="option-list">{(["system", "light", "dark"] as const).map((mode) => <button key={mode} className={theme === mode ? "active" : ""} onClick={() => setTheme(mode)}><span>{mode === "system" ? <Monitor /> : mode === "dark" ? <Moon /> : <Sun />}</span><strong>{mode === "system" ? dictionary.setting.theme.followSystem : mode === "light" ? dictionary.setting.theme.lightMode : dictionary.setting.theme.darkMode}</strong>{theme === mode ? <Check /> : null}</button>)}</div> : null}
    {panel === "language" ? <div className="option-list">{locales.map((item: Locale) => <button key={item} className={locale === item ? "active" : ""} onClick={() => changeLocale(item)}><span className="language-code">{item.startsWith("zh") ? "中" : item.slice(0, 2).toUpperCase()}</span><strong>{localeNames[item]}</strong>{locale === item ? <Check /> : null}</button>)}</div> : null}
    {panel === "voice" ? <div className="voice-settings"><VoiceSetting title={dictionary.setting.voice.self.title} subtitle={dictionary.setting.voice.self.subtitle} femaleLabel={dictionary.setting.voice.female} maleLabel={dictionary.setting.voice.male} playLabel={dictionary.newsDetail.playAudio} errorLabel={dictionary.newsDetail.audioFailed} value={voices.self} onChange={(value) => setVoice("self", value)} /><VoiceSetting title={dictionary.setting.voice.partner.title} subtitle={dictionary.setting.voice.partner.subtitle} femaleLabel={dictionary.setting.voice.female} maleLabel={dictionary.setting.voice.male} playLabel={dictionary.newsDetail.playAudio} errorLabel={dictionary.newsDetail.audioFailed} value={voices.partner} onChange={(value) => setVoice("partner", value)} /></div> : null}
  </article></main>;
}

function VoiceSetting({ title, subtitle, femaleLabel, maleLabel, playLabel, errorLabel, value, onChange }: { title: string; subtitle: string; femaleLabel: string; maleLabel: string; playLabel: string; errorLabel: string; value: TTSVoice; onChange: (voice: TTSVoice) => void }) {
  const selectedVoice = TTS_VOICE_OPTIONS.find((voice) => voice.value === value) ?? TTS_VOICE_OPTIONS[0];
  return <section><div><strong>{title}</strong><small>{subtitle}</small></div><div><VoiceSelector value={value} onChange={onChange} ariaLabel={title} femaleLabel={femaleLabel} maleLabel={maleLabel} /><AudioPlayButton text={`Hello, this is ${selectedVoice.label}. Welcome to LifeStep.`} voice={value} label={playLabel} errorLabel={errorLabel} className="ml-0 size-11 shrink-0" /></div></section>;
}

function VoiceSelector({ value, onChange, ariaLabel, femaleLabel, maleLabel }: { value: TTSVoice; onChange: (voice: TTSVoice) => void; ariaLabel: string; femaleLabel: string; maleLabel: string }) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, menuRef, setOpen);
  const genderLabel = (gender: string) => gender === "Female" ? femaleLabel : maleLabel;
  const selected = TTS_VOICE_OPTIONS.find((voice) => voice.value === value) ?? TTS_VOICE_OPTIONS[0];

  return <div className="voice-selector" ref={menuRef}>
    <button type="button" className="voice-select-trigger" aria-label={ariaLabel} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((current) => !current)}><span>{selected.label} · {genderLabel(selected.gender)}</span><ChevronDown className={cn(open && "rotate-180")} aria-hidden="true" /></button>
    {open ? <div className="voice-select-menu" role="listbox" aria-label={ariaLabel}>{TTS_VOICE_OPTIONS.map((voice) => { const active = voice.value === value; return <button type="button" role="option" aria-selected={active} className={cn("voice-select-option", active && "active")} key={voice.value} onClick={() => { onChange(voice.value); setOpen(false); }}><span>{voice.label} · {genderLabel(voice.gender)}</span>{active ? <Check aria-hidden="true" /> : null}</button>; })}</div> : null}
  </div>;
}
