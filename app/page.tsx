import type { Metadata } from "next";
import { HomePage } from "@/features/home/HomePage";
import { dictionaries } from "@/lib/i18n";

const copy = dictionaries.en.homePage;
export const metadata: Metadata = { title: copy.seoTitle, description: copy.seoDescription };

export default function PublicHomePage() {
  return <HomePage locale="en" redirect />;
}
