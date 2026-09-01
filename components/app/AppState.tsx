"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/components/providers/app-provider";

const pageLoaderClass = "flex min-h-60 items-center justify-center gap-2.5 text-muted-foreground [&_svg]:animate-spin";

export function AppLoadingState({ label }: { label?: ReactNode }) {
  const { copy } = useApp();
  return <div className={pageLoaderClass} role="status"><LoaderCircle /><span>{label ?? copy.loading}</span></div>;
}

export function AppEmptyState({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return <div className="px-5 py-20 text-center text-muted-foreground [&_h2]:text-foreground"><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>;
}
