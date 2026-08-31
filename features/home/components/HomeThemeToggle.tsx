"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/components/providers/theme-provider";

export function HomeThemeToggle({ label }: { label: string }) {
  const { isDark, setThemeMode } = useThemeContext();
  return <button type="button" className="inline-flex size-10 min-w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-transparent p-0 text-foreground transition hover:border-primary/40 hover:text-primary" aria-label={label} onClick={() => setThemeMode(isDark ? "light" : "dark")}><Moon className="size-4 dark:hidden" aria-hidden="true" /><Sun className="hidden size-4 dark:block" aria-hidden="true" /></button>;
}
