"use client";

import { useEffect } from "react";

import { dismissAppSplash } from "@/lib/app-splash";
import { cn } from "@/lib/utils";
import { appZIndex } from "@/lib/z-index";

export function AppSplashScreen() {
  useEffect(() => {
    dismissAppSplash();
  }, []);

  return (
    <div
      id="app-splash"
      role="status"
      aria-label="LifeStep"
      className={cn("app-splash-screen fixed inset-0 flex-col items-center justify-center", appZIndex.splash)}
    >
      <div className="app-splash-screen-content flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="app-splash-logo block h-24 w-24 bg-[#d3001c] md:h-28 md:w-28"
          style={{
            WebkitMask: "url('/logo.svg') center / contain no-repeat",
            mask: "url('/logo.svg') center / contain no-repeat",
          }}
        />
        <p className="text-2xl font-bold text-[#d3001c]">Step into real life</p>
      </div>
    </div>
  );
}
