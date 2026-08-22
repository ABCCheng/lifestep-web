"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

export function Brand({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const update = () => setStandalone(media.matches || document.documentElement.classList.contains("app-standalone"));
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const content = <>
      <span className="brand-logo"><img src="/logo.svg" alt="" width={40} height={40} /></span>
      {!compact ? <span className="brand-label">LifeStep</span> : null}
    </>;

  if (standalone) return <span className="brand home-header-brand" aria-label="LifeStep">{content}</span>;

  function preventStandaloneNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(display-mode: standalone)").matches || document.documentElement.classList.contains("app-standalone")) event.preventDefault();
  }

  return <Link href={href} className="brand home-header-brand" aria-label="LifeStep home" onClick={preventStandaloneNavigation}>{content}</Link>;
}
