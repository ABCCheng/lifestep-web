"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { homePath, localeNames, locales, type Locale } from "@/lib/i18n";
import { savePreferredLocale } from "@/lib/stores/locale";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { cn } from "@/lib/utils";

const menuSurface = "absolute right-0 top-[calc(100%+0.5rem)] z-80 grid w-48 gap-0.5 overflow-hidden rounded-2xl border border-(--menu-border) p-1.5 text-popover-foreground [background:var(--menu-surface)] [box-shadow:var(--menu-shadow)] [backdrop-filter:blur(24px)_saturate(135%)]";
const menuItem = "flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))] hover:text-foreground focus-visible:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))] [&_svg]:size-4 [&_svg]:text-primary";

export function HomeLanguageMenu({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, ref, setOpen);
  return <div className="relative" ref={ref}>
    <button type="button" className="inline-flex size-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-transparent px-0 text-xs font-bold text-foreground transition hover:border-primary/40 hover:text-primary aria-expanded:border-primary/40 aria-expanded:text-primary sm:w-auto sm:px-3" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}><Languages className="size-4" aria-hidden="true" /><span className="hidden sm:inline">{localeNames[locale]}</span><ChevronDown className="hidden size-3.5 sm:block" aria-hidden="true" /></button>
    {open ? <div className={menuSurface} role="menu">{locales.map((item) => <Link className={cn(menuItem, item === locale && "text-primary")} key={item} href={homePath("/", item)} hrefLang={item} role="menuitem" onClick={() => { savePreferredLocale(item); setOpen(false); }}><span>{localeNames[item]}</span>{item === locale ? <Check aria-hidden="true" /> : null}</Link>)}</div> : null}
  </div>;
}
