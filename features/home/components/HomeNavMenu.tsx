"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { cn } from "@/lib/utils";

const menuSurface = "absolute right-0 top-[calc(100%+0.5rem)] z-80 grid w-56 gap-0.5 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-[0_18px_46px_rgba(28,28,30,0.16)] backdrop-blur-xl";
const menuItem = "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-primary/10 hover:text-foreground";

export function HomeNavMenu({ overviewLabel, faqLabel, launchLabel, appHref }: { overviewLabel: string; faqLabel: string; launchLabel: string; appHref: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, ref, setOpen);
  return <div className="relative xl:hidden" ref={ref}><button type="button" className="home-mobile-menu-trigger grid size-10 place-items-center rounded-xl border border-border text-foreground" aria-label="Navigation menu" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}><Menu className="size-5" aria-hidden="true" /></button>{open ? <div className={menuSurface} role="menu"><a className={menuItem} href="#overview" role="menuitem" onClick={() => setOpen(false)}>{overviewLabel}</a><a className={menuItem} href="#faq" role="menuitem" onClick={() => setOpen(false)}>{faqLabel}</a><Link className={cn(menuItem, "home-mobile-launch-link font-semibold text-primary")} href={appHref} role="menuitem" onClick={() => setOpen(false)}>{launchLabel}</Link></div> : null}</div>;
}
