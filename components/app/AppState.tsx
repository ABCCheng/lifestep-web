import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { pageLoaderClass } from "./app-ui-styles";

export function AppLoadingState({ label = "Loading…" }: { label?: ReactNode }) {
  return <div className={pageLoaderClass} role="status"><LoaderCircle /><span>{label}</span></div>;
}

export function AppEmptyState({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return <div className="px-5 py-20 text-center text-muted-foreground [&_h2]:text-foreground"><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>;
}
