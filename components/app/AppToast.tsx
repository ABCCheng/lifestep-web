import type { ComponentPropsWithoutRef } from "react";

export function AppToastViewport(props: ComponentPropsWithoutRef<"div">) {
  const { className, ...rest } = props;
  return <div className={`pointer-events-none fixed bottom-(--app-safe-tab-bottom) left-1/2 z-150 w-[min(90%,440px)] -translate-x-1/2 translate-y-4 opacity-0 transition duration-200 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 ${className || ""}`} {...rest} />;
}

export function AppToast(props: ComponentPropsWithoutRef<"div">) {
  const { className, ...rest } = props;
  return <div role="status" className={`rounded-xl bg-foreground px-4 py-3 text-center text-background shadow-[var(--shadow)] ${className || ""}`} {...rest} />;
}
