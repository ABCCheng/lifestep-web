"use client";

import { LoaderCircle, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import type { TTSVoice } from "@/lib/stores/tts";
import { playEdgeTTS, stopEdgeTTS } from "@/lib/tts/playback";

export function AudioPlayButton({ text, voice, label = "Play audio", errorLabel = "Couldn't play audio", className = "" }: { text: string; voice: TTSVoice; label?: string; errorLabel?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  useEffect(() => {
    const stopped = () => setState("idle");
    window.addEventListener("lifestep-tts-stop", stopped);
    return () => window.removeEventListener("lifestep-tts-stop", stopped);
  }, []);
  async function toggle() {
    if (state !== "idle") { stopEdgeTTS(); setState("idle"); return; }
    setState("loading");
    try { await playEdgeTTS(text, voice); setState("playing"); }
    catch (error) { if ((error as DOMException)?.name !== "AbortError") showGlobalSnackbar(errorLabel); setState("idle"); }
  }
  return <button type="button" className={`icon-button ${className}`} aria-label={label} onClick={() => void toggle()}>{state === "loading" ? <LoaderCircle className="spin" /> : state === "playing" ? <Square /> : <Volume2 />}</button>;
}
