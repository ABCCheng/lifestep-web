import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

export function AppLoadingState({ label = "Loading…" }: { label?: ReactNode }) {
  return <div className="page-loader" role="status"><LoaderCircle /><span>{label}</span></div>;
}

export function AppEmptyState({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return <div className="empty-state"><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>;
}
