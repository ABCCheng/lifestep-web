"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function standalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function AddToHomeScreenButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(true);
  useEffect(() => {
    setInstalled(standalone());
    const beforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); };
    const appInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", appInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", appInstalled);
    };
  }, []);
  if (installed || !prompt) return null;
  return (
    <button className="icon-button install-button" aria-label="Install LifeStep" onClick={async () => {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    }}><Download /></button>
  );
}
