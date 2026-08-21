"use client";

import { Check, Languages, Moon, Palette, Sun, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AudioPlayButton } from "@/components/audio/AudioPlayButton";
import { AppBackHeader as BackHeader } from "@/components/app";
import { useApp } from "@/components/providers/app-provider";
import { localeNames, locales, type Locale } from "@/lib/i18n";
import { TTS_VOICE_OPTIONS, type TTSVoice } from "@/lib/stores/tts";

export default function SettingsPage() { return <Suspense fallback={null}><SettingsContent /></Suspense>; }

function SettingsContent() {
  const params = useSearchParams();
  const panel = params.get("panel") || "theme";
  const { locale, setLocale, theme, setTheme, voices, setVoice } = useApp();
  const title = panel === "language" ? "Language" : panel === "voice" ? "Voice" : "Theme";
  return <main className="app-page sub-page"><BackHeader title={title} eyebrow="Settings" /><article className="settings-content app-narrow-width">
    {panel === "theme" ? <><header className="settings-title"><Palette /><div><h2>Choose your theme</h2><p>LifeStep follows your system by default.</p></div></header><div className="option-list">{(["system", "light", "dark"] as const).map((mode) => <button key={mode} className={theme === mode ? "active" : ""} onClick={() => setTheme(mode)}><span>{mode === "dark" ? <Moon /> : <Sun />}</span><strong>{mode === "system" ? "Follow system" : `${mode[0].toUpperCase()}${mode.slice(1)} mode`}</strong>{theme === mode ? <Check /> : null}</button>)}</div></> : null}
    {panel === "language" ? <><header className="settings-title"><Languages /><div><h2>Interface language</h2><p>Learning content stays bilingual.</p></div></header><div className="option-list">{locales.map((item: Locale) => <button key={item} className={locale === item ? "active" : ""} onClick={() => setLocale(item)}><span className="language-code">{item.startsWith("zh") ? "中" : item.slice(0, 2).toUpperCase()}</span><strong>{localeNames[item]}</strong>{locale === item ? <Check /> : null}</button>)}</div></> : null}
    {panel === "voice" ? <><header className="settings-title"><Volume2 /><div><h2>Conversation voices</h2><p>Choose a clear voice for each side of the dialogue.</p></div></header><div className="voice-settings"><VoiceSetting title="Your voice" subtitle="Plays the lines on the right" value={voices.self} onChange={(value) => setVoice("self", value)} /><VoiceSetting title="Conversation partner" subtitle="Plays the lines on the left" value={voices.partner} onChange={(value) => setVoice("partner", value)} /></div></> : null}
  </article></main>;
}

function VoiceSetting({ title, subtitle, value, onChange }: { title: string; subtitle: string; value: TTSVoice; onChange: (voice: TTSVoice) => void }) {
  return <section><div><strong>{title}</strong><small>{subtitle}</small></div><div><select value={value} onChange={(event) => onChange(event.target.value as TTSVoice)}>{TTS_VOICE_OPTIONS.map((voice) => <option value={voice.value} key={voice.value}>{voice.label} · {voice.gender}</option>)}</select><AudioPlayButton text={`Hello, this is ${TTS_VOICE_OPTIONS.find((voice) => voice.value === value)?.label}. Welcome to LifeStep.`} voice={value} label={`Preview ${title}`} /></div></section>;
}
