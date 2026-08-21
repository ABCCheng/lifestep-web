"use client";

import { useEffect, type RefObject } from "react";

export function useDismissibleMenu<T extends HTMLElement>(
  open: boolean,
  containerRef: RefObject<T | null>,
  setOpen: (open: boolean) => void,
) {
  useEffect(() => {
    if (!open) return;
    const pointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", pointerDown);
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("keydown", keyDown);
    };
  }, [containerRef, open, setOpen]);
}
