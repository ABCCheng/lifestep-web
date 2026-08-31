"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/app-provider";

const appHeaderActionClass = "relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-primary shadow-none outline-none before:absolute before:-inset-2.5 before:content-[''] [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:transition-[transform,opacity] [&_svg]:duration-150 hover:[&_svg]:scale-[1.08] hover:[&_svg]:opacity-80 focus-visible:[&_svg]:scale-[1.08] focus-visible:[&_svg]:opacity-80 aria-expanded:[&_svg]:scale-[1.08] aria-expanded:[&_svg]:opacity-80";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function standalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function AddToHomeScreenButton() {
  const { lifeStep } = useApp();
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
    <button className={appHeaderActionClass} aria-label={lifeStep.common.install} onClick={async () => {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    }}><Download /></button>
  );
}
