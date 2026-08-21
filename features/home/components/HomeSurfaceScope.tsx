"use client";

import { useLayoutEffect } from "react";

export function HomeSurfaceScope() {
  useLayoutEffect(() => {
    document.documentElement.classList.add("home-surface");
    return () => document.documentElement.classList.remove("home-surface");
  }, []);
  return null;
}
