"use client";

import { Fragment, type ReactNode } from "react";
import { useThemeContext } from "@/components/providers/theme-provider";

export function HomeThemeChrome({ children }: { children: ReactNode }) {
  const { isDark } = useThemeContext();
  return <Fragment key={isDark ? "dark" : "light"}>{children}</Fragment>;
}
