"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { getUnreadWebPushMessageCount, getWebPushMessages, subscribeWebPushMessageChanges } from "@/lib/stores/web-push-messages";

export function WebPushLinkButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const unread = useSyncExternalStore(subscribeWebPushMessageChanges, getUnreadWebPushMessageCount, () => 0);
  useEffect(() => { void getWebPushMessages(); }, []);
  return <Button type="button" size="icon" variant="destructive" className="app-header-action-button relative cursor-pointer text-primary" aria-label={unread ? `${label} (${unread})` : label} onClick={() => router.push(href)}><Bell />{unread ? <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex min-w-4 select-none items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold leading-4 text-white">{unread}</span> : null}</Button>;
}
