"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppToast, AppToastViewport } from "@/components/app";

let showHandler: ((message: string) => void) | null = null;
export function showGlobalSnackbar(message: string) { showHandler?.(message); }

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let timer = 0;
    showHandler = (next) => {
      setMessage(next);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(""), 1800);
    };
    return () => { showHandler = null; window.clearTimeout(timer); };
  }, []);
  return <>{children}<AppToastViewport data-visible={Boolean(message)}>{message ? <AppToast>{message}</AppToast> : null}</AppToastViewport></>;
}
