import { Suspense } from "react";
import { LegacyAppRouteRedirect } from "@/components/app/LegacyAppRouteRedirect";

export default function LegacyMessagesPage() {
  return <Suspense fallback={null}><LegacyAppRouteRedirect path="/messages" /></Suspense>;
}
