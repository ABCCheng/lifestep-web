"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useDismissibleMenu } from "@/lib/use-dismissible-menu";
import { cn } from "@/lib/utils";
import { appZIndex } from "@/lib/z-index";

const appMenuSurfaceClass = "absolute right-0 top-[calc(100%+0.5rem)] z-80 grid w-[220px] gap-0.5 overflow-hidden rounded-2xl border border-(--menu-border) p-1.5 text-popover-foreground [background:var(--menu-surface)] [box-shadow:var(--menu-shadow)] [backdrop-filter:blur(24px)_saturate(135%)] max-[680px]:w-[216px]";
const appMenuItemClass = "flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))] hover:text-foreground focus-visible:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,#5cc9a7_6%,transparent))] [&_svg]:size-4 [&_svg]:text-primary";

type HomeNavMenuProps = {
  overviewLabel: string;
  faqLabel: string;
  changelogLabel: string;
  discoverMoreLabel: string;
  discoverMoreHref: string;
  launchLabel: string;
  appHref: string;
};

export function HomeNavMenu({ overviewLabel, faqLabel, changelogLabel, discoverMoreLabel, discoverMoreHref, launchLabel, appHref }: HomeNavMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  useDismissibleMenu(open, menuRef, setOpen);

  return (
    <div className="relative xl:hidden" ref={menuRef}>
      <button
        type="button"
        className="grid size-10 cursor-pointer place-items-center rounded-xl border border-border text-foreground"
        aria-label="Navigation menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className={cn(appMenuSurfaceClass, "w-56 max-[680px]:w-56", appZIndex.menu)} role="menu">
          <a className={cn(appMenuItemClass, "whitespace-nowrap")} href="#overview" role="menuitem" onClick={() => setOpen(false)}>{overviewLabel}</a>
          <a className={cn(appMenuItemClass, "whitespace-nowrap")} href="#faq" role="menuitem" onClick={() => setOpen(false)}>{faqLabel}</a>
          <a className={cn(appMenuItemClass, "whitespace-nowrap")} href="#changelog" role="menuitem" onClick={() => setOpen(false)}>{changelogLabel}</a>
          <a className={cn(appMenuItemClass, "whitespace-nowrap")} href={discoverMoreHref} target="_blank" rel="noreferrer" role="menuitem" onClick={() => setOpen(false)}>{discoverMoreLabel}</a>
          <Link className={cn(appMenuItemClass, "whitespace-nowrap font-semibold text-primary")} href={appHref} role="menuitem" onClick={() => setOpen(false)}>{launchLabel}</Link>
        </div>
      ) : null}
    </div>
  );
}
