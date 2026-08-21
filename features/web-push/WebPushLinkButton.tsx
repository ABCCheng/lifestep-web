"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { getUnreadWebPushMessageCount, getWebPushMessages, subscribeWebPushMessageChanges } from "@/lib/stores/web-push-messages";

export function WebPushLinkButton({ href, label }: { href: string; label: string }) {
  const unread = useSyncExternalStore(subscribeWebPushMessageChanges, getUnreadWebPushMessageCount, () => 0);
  useEffect(() => { void getWebPushMessages(); }, []);
  return <Link className="icon-button web-push-link" href={href} aria-label={unread ? `${label} (${unread})` : label}><Bell />{unread ? <span>{unread}</span> : null}</Link>;
}
