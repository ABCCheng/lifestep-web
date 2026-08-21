"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { homePath, localeNames, locales, type Locale } from "@/lib/i18n";
import { savePreferredLocale } from "@/lib/stores/locale";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";

export function HomeLanguageMenu({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, ref, setOpen);
  return <div className="home-control-wrap" ref={ref}>
    <button className="home-round-control home-language-control" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}><Languages /><span>{localeNames[locale]}</span><ChevronDown /></button>
    {open ? <div className="home-control-menu" role="menu">{locales.map((item) => <Link key={item} href={homePath("/", item)} hrefLang={item} role="menuitem" onClick={() => { savePreferredLocale(item); setOpen(false); }}><span>{localeNames[item]}</span>{item === locale ? <Check /> : null}</Link>)}</div> : null}
  </div>;
}
