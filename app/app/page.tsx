"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { localizePath } from "@/lib/i18n";
import { getPreferredLocale } from "@/lib/stores/locale";

function isStandaloneApp() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export default function AppEntryPage() {
  const router = useRouter();
  useEffect(() => {
    const target = localizePath("/", getPreferredLocale());
    if (!navigator.onLine || isStandaloneApp()) {
      window.location.replace(target);
      return;
    }
    router.replace(target);
  }, [router]);
  return null;
}
