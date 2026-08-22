"use client";

import { LoaderCircle, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { showGlobalSnackbar } from "@/components/providers/snackbar-provider";
import { Button } from "@/components/ui/button";
import type { TTSVoice } from "@/lib/stores/tts";
import { playEdgeTTS, stopEdgeTTS } from "@/lib/tts/playback";
import { cn } from "@/lib/utils";

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
  return <Button type="button" variant="destructive" size="icon" className={cn("ml-1 inline-flex size-7 align-baseline text-primary", className)} aria-label={label} onClick={() => void toggle()}>{state === "loading" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : state === "playing" ? <Square className="size-4 fill-current" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}<span className="sr-only">{label}</span></Button>;
}
