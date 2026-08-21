"use client";

import { useEffect } from "react";
import Image from "next/image";
import { dismissAppSplash } from "@/lib/app-splash";

export function AppSplashScreen() {
  useEffect(() => dismissAppSplash(), []);
  return (
    <div id="app-splash" role="status" aria-label="LifeStep is opening" className="app-splash-screen">
      <div className="app-splash-screen-content">
        <Image src="/logo.svg" alt="" width={112} height={112} priority />
        <p>Step into real life</p>
        <span>Real conversations for your new life in Canada</span>
      </div>
    </div>
  );
}
