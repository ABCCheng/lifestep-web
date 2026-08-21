import { readJsonStorage, writeJsonStorage } from "./storage";

export const TTS_STORAGE_KEY = "lifestep-tts-settings";
export const TTS_VOICE_OPTIONS = [
  { value: "en-US-AshleyNeural", label: "Ashley", gender: "Female" },
  { value: "en-US-AndrewMultilingualNeural", label: "Andrew", gender: "Male" },
  { value: "en-US-CoraMultilingualNeural", label: "Cora", gender: "Female" },
  { value: "en-US-BrianMultilingualNeural", label: "Brian", gender: "Male" },
  { value: "en-US-SaraNeural", label: "Sara", gender: "Female" },
  { value: "en-US-JasonNeural", label: "Jason", gender: "Male" },
] as const;

export type TTSVoice = (typeof TTS_VOICE_OPTIONS)[number]["value"];
export type VoiceSide = "self" | "partner";
export type VoiceSettings = Record<VoiceSide, TTSVoice>;
const values = TTS_VOICE_OPTIONS.map((voice) => voice.value);

export const DEFAULT_TTS_SETTINGS: VoiceSettings = {
  self: "en-US-AshleyNeural",
  partner: "en-US-AndrewMultilingualNeural",
};

export function getTTSSettings(): VoiceSettings {
  const stored = readJsonStorage<Partial<VoiceSettings>>(TTS_STORAGE_KEY);
  return {
    self: values.includes(stored?.self as TTSVoice) ? stored!.self! : DEFAULT_TTS_SETTINGS.self,
    partner: values.includes(stored?.partner as TTSVoice) ? stored!.partner! : DEFAULT_TTS_SETTINGS.partner,
  };
}

export function saveTTSSettings(settings: VoiceSettings) {
  writeJsonStorage(TTS_STORAGE_KEY, settings);
}
