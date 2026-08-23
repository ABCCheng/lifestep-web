"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { cn } from "@/lib/utils";

const menuSurface = "absolute right-0 top-[calc(100%+0.5rem)] z-80 grid w-56 gap-0.5 overflow-hidden rounded-2xl border border-(--menu-border) p-1.5 text-popover-foreground [background:var(--menu-surface)] [box-shadow:var(--menu-shadow)] [backdrop-filter:blur(24px)_saturate(135%)]";
const menuItem = "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))] hover:text-foreground focus-visible:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))]";

export function HomeNavMenu({ overviewLabel, faqLabel, launchLabel, appHref }: { overviewLabel: string; faqLabel: string; launchLabel: string; appHref: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, ref, setOpen);
  return <div className="relative xl:hidden" ref={ref}><button type="button" className="grid size-10 place-items-center rounded-xl border border-border bg-transparent text-foreground transition hover:border-primary/45 hover:bg-card/70 hover:text-primary aria-expanded:border-primary/45 aria-expanded:bg-card/70 aria-expanded:text-primary" aria-label="Navigation menu" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}><Menu className="size-5" aria-hidden="true" /></button>{open ? <div className={menuSurface} role="menu"><a className={menuItem} href="#overview" role="menuitem" onClick={() => setOpen(false)}>{overviewLabel}</a><a className={menuItem} href="#faq" role="menuitem" onClick={() => setOpen(false)}>{faqLabel}</a><Link className={cn(menuItem, "font-semibold text-primary")} href={appHref} role="menuitem" onClick={() => setOpen(false)}>{launchLabel}</Link></div> : null}</div>;
}
