import { Suspense } from "react";
import { LegacyAppRouteRedirect } from "@/components/app/LegacyAppRouteRedirect";

export default function LegacyStagePage() {
  return <Suspense fallback={null}><LegacyAppRouteRedirect path="/stage" /></Suspense>;
}
