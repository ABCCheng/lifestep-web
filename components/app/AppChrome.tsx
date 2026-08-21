"use client";

import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/Brand";

export function AppBackHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <header className="back-header app-mobile-chrome">
      <button className="icon-button" aria-label="Back" onClick={() => history.length > 1 ? history.back() : location.assign("/app")}><ArrowLeft /></button>
      <div><span>{eyebrow}</span><h1>{title}</h1></div>
      <Brand compact href="/" />
    </header>
  );
}
