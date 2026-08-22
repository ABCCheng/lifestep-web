import { Suspense } from "react";
import { LegacyAppRouteRedirect } from "@/components/app/LegacyAppRouteRedirect";

export default function LegacySettingsPage() {
  return <Suspense fallback={null}><LegacyAppRouteRedirect path="/settings" /></Suspense>;
}
