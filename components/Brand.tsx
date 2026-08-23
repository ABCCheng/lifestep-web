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
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden bg-transparent"><img className="size-10 object-contain" src="/logo.svg" alt="" width={40} height={40} /></span>
      {!compact ? <span className="brand-label">LifeStep</span> : null}
    </>;

  const className = "inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap text-xl font-bold tracking-[-0.04em] text-primary dark:text-white";

  if (standalone) return <span className={className} aria-label="LifeStep">{content}</span>;

  function preventStandaloneNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(display-mode: standalone)").matches || document.documentElement.classList.contains("app-standalone")) event.preventDefault();
  }

  return <Link href={href} className={className} aria-label="LifeStep home" onClick={preventStandaloneNavigation}>{content}</Link>;
}
