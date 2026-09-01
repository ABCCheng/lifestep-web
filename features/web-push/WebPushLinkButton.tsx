"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { getUnreadWebPushMessageCount, getWebPushMessages, subscribeWebPushMessageChanges } from "@/lib/stores/web-push-messages";

const appHeaderActionClass = "relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-primary shadow-none outline-none before:absolute before:-inset-2.5 before:content-[''] [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:transition-[transform,opacity] [&_svg]:duration-150 hover:[&_svg]:scale-[1.08] hover:[&_svg]:opacity-80 focus-visible:[&_svg]:scale-[1.08] focus-visible:[&_svg]:opacity-80 aria-expanded:[&_svg]:scale-[1.08] aria-expanded:[&_svg]:opacity-80";

export function WebPushLinkButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const unread = useSyncExternalStore(subscribeWebPushMessageChanges, getUnreadWebPushMessageCount, () => 0);
  useEffect(() => { void getWebPushMessages(); }, []);
  function navigate() { router.push(href); }
  return <button type="button" className={appHeaderActionClass} aria-label={unread ? `${label} (${unread})` : label} onClick={navigate}><Bell />{unread ? <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex min-w-4 select-none items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-bold leading-4 text-white">{unread}</span> : null}</button>;
}
