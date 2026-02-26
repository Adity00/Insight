import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
    title: "Login – InsightX",
    description:
        "Sign in to access your AI-powered analytics dashboard. Analyze, chat, and export professional reports instantly.",
};

export default function LoginPage() {
    return <LoginPageClient />;
}
