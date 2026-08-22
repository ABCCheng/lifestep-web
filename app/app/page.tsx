"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { localizePath } from "@/lib/i18n";
import { getPreferredLocale } from "@/lib/stores/locale";

export default function AppEntryPage() {
  const router = useRouter();
  useEffect(() => { router.replace(localizePath("/", getPreferredLocale())); }, [router]);
  return null;
}
