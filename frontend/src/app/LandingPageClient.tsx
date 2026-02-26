"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/lib/auth";

export default function LandingPageClient() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Redirect is happening
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <HowItWorks />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
