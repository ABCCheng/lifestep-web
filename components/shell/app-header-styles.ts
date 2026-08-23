export const appHeaderClass =
  "app-top-chrome sticky top-0 z-30 bg-transparent py-[1.35rem] max-md:fixed max-md:inset-x-0 max-md:top-0 max-md:w-full max-md:pb-2 max-md:pt-(--app-safe-header-top)";

export const appMobileHeaderClass = `${appHeaderClass} app-mobile-chrome`;

export const appHeaderInnerClass =
  "mx-auto flex h-10 w-[min(100%,var(--site-max-width))] items-center justify-between gap-4 px-4 lg:px-6";

export const appBackHeaderInnerClass = `${appHeaderInnerClass} justify-start gap-1.5`;

export const appHeaderActionClass =
  "relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-primary shadow-none outline-none before:absolute before:-inset-2.5 before:content-[''] [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:transition-[transform,opacity] [&_svg]:duration-150 hover:[&_svg]:scale-[1.08] hover:[&_svg]:opacity-80 focus-visible:[&_svg]:scale-[1.08] focus-visible:[&_svg]:opacity-80 aria-expanded:[&_svg]:scale-[1.08] aria-expanded:[&_svg]:opacity-80";

export const appBackActionClass = `${appHeaderActionClass} [&_svg]:!size-6`;

export const appHeaderSpacerClass =
  "hidden max-md:block max-md:h-[calc(var(--app-safe-header-top)+48px)] max-md:shrink-0";

export const appMenuSurfaceClass =
  "absolute right-0 top-[calc(100%+0.5rem)] z-80 grid w-[220px] gap-0.5 overflow-hidden rounded-2xl border border-(--menu-border) p-1.5 text-popover-foreground [background:var(--menu-surface)] [box-shadow:var(--menu-shadow)] [backdrop-filter:blur(24px)_saturate(135%)] max-[680px]:w-[216px]";

export const appMenuItemClass =
  "flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-primary/10 hover:text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary";
