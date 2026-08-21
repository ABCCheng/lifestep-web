"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";

export function HomeNavMenu({ overviewLabel, faqLabel, launchLabel }: { overviewLabel: string; faqLabel: string; launchLabel: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, ref, setOpen);
  return <div className="home-control-wrap home-nav-menu-wrap" ref={ref}><button className="home-round-control" aria-label="Navigation menu" aria-expanded={open} onClick={() => setOpen(!open)}><Menu /></button>{open ? <div className="home-control-menu" role="menu"><a href="#how" onClick={() => setOpen(false)}>{overviewLabel}</a><a href="#faq" onClick={() => setOpen(false)}>{faqLabel}</a><Link href="/app" onClick={() => setOpen(false)}>{launchLabel}</Link></div> : null}</div>;
}
