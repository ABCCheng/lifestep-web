"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/components/providers/theme-provider";

export function HomeThemeToggle({ label }: { label: string }) {
  const { isDark, setThemeMode } = useThemeContext();
  return <button className="home-round-control home-theme-control" aria-label={`${label}: ${isDark ? "light" : "dark"}`} onClick={() => setThemeMode(isDark ? "light" : "dark")}>{isDark ? <Sun /> : <Moon />}</button>;
}
