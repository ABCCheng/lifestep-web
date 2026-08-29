"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { appHeaderActionClass } from "@/components/shell/app-header-styles";
import { getUnreadWebPushMessageCount, getWebPushMessages, subscribeWebPushMessageChanges } from "@/lib/stores/web-push-messages";

export function WebPushLinkButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const unread = useSyncExternalStore(subscribeWebPushMessageChanges, getUnreadWebPushMessageCount, () => 0);
  useEffect(() => { void getWebPushMessages(); }, []);
  function navigate() {
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    const standalone = window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
    if (!navigator.onLine || standalone) window.location.assign(href);
    else router.push(href);
  }
  return <button type="button" className={appHeaderActionClass} aria-label={unread ? `${label} (${unread})` : label} onClick={navigate}><Bell />{unread ? <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex min-w-4 select-none items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold leading-4 text-white">{unread}</span> : null}</button>;
}
