import type { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
  title: "InsightX – AI Powered Data Intelligence Platform",
  description:
    "Transform raw data into powerful insights using AI. Analyze, chat, and export professional reports instantly.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
