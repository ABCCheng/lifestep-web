"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { localizePath } from "@/lib/i18n";
import { getPreferredLocale } from "@/lib/stores/locale";

export function LegacyAppRouteRedirect({ path }: { path: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const target = localizePath(path, getPreferredLocale());
    router.replace(query ? `${target}?${query}` : target);
  }, [path, router, searchParams]);

  return null;
}
