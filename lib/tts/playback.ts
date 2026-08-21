import type { TTSVoice } from "@/lib/stores/tts";
import { synthesizeEdgeTTS } from "./edge/synthesize";

let active: { audio: HTMLAudioElement; url: string; controller: AbortController } | null = null;

export function stopEdgeTTS() {
  if (!active) return;
  active.controller.abort();
  active.audio.pause();
  active.audio.currentTime = 0;
  URL.revokeObjectURL(active.url);
  active = null;
  window.dispatchEvent(new Event("lifestep-tts-stop"));
}

export async function playEdgeTTS(text: string, voice: TTSVoice) {
  stopEdgeTTS();
  const controller = new AbortController();
  const result = await synthesizeEdgeTTS({ text, voice, rate: "+0%", pitch: "+0Hz", volume: "+0%", signal: controller.signal });
  if (controller.signal.aborted) return;
  const url = URL.createObjectURL(new Blob([result.audio], { type: result.contentType }));
  const audio = new Audio(url);
  active = { audio, url, controller };
  const clean = () => {
    if (active?.audio !== audio) return;
    URL.revokeObjectURL(url);
    active = null;
    window.dispatchEvent(new Event("lifestep-tts-stop"));
  };
  audio.addEventListener("ended", clean, { once: true });
  audio.addEventListener("error", clean, { once: true });
  await audio.play();
}
