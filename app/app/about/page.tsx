import { Suspense } from "react";
import { LegacyAppRouteRedirect } from "@/components/app/LegacyAppRouteRedirect";

export default function LegacyAboutPage() {
  return <Suspense fallback={null}><LegacyAppRouteRedirect path="/about" /></Suspense>;
}
