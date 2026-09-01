"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { localizePath } from "@/lib/i18n";
import { getPreferredLocale } from "@/lib/stores/locale";

function isStandaloneApp() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function LegacyAppRouteRedirect({ path }: { path: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const target = localizePath(path, getPreferredLocale());
    const destination = query ? `${target}?${query}` : target;
    if (isStandaloneApp() || !navigator.onLine) window.location.replace(destination);
    else router.replace(destination);
  }, [path, router, searchParams]);

  return null;
}
