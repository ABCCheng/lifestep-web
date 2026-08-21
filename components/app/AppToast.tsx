import type { ComponentPropsWithoutRef } from "react";

export function AppToastViewport(props: ComponentPropsWithoutRef<"div">) {
  const { className, ...rest } = props;
  return <div className={`app-toast-viewport ${className || ""}`} {...rest} />;
}

export function AppToast(props: ComponentPropsWithoutRef<"div">) {
  const { className, ...rest } = props;
  return <div role="status" className={`app-toast ${className || ""}`} {...rest} />;
}
