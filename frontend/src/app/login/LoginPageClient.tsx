"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    BarChart3,
    Brain,
    Shield,
    Sparkles,
    ArrowLeft,
} from "lucide-react";
import LoginCard from "@/components/auth/LoginCard";
import { useAuth } from "@/lib/auth";

const features = [
    { icon: BarChart3, text: "Real-time analytics dashboards" },
    { icon: Brain, text: "AI-powered data insights" },
    { icon: Shield, text: "Enterprise-grade security" },
];

export default function LoginPageClient() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    // Don't render content if authenticated (waiting for redirect)
    if (isLoading || isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Left Panel — Motivational */}
            <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700" />

                {/* Decorative elements */}
                <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="relative flex flex-col justify-between p-12 lg:p-16 w-full">
                    {/* Top — Back */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-white/70 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>

                    {/* Center — Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 flex flex-col justify-center"
                    >
                        <div className="mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-[13px] font-semibold tracking-wide mb-6">
                                <Sparkles size={14} />
                                Trusted by 10,000+ analysts
                            </div>
                            <h2 className="text-3xl lg:text-[40px] font-extrabold text-white tracking-[-0.03em] leading-tight mb-4">
                                Make Smarter Decisions,{" "}
                                <span className="text-indigo-200">Faster</span>
                            </h2>
                            <p className="text-[16px] text-indigo-100/80 leading-relaxed max-w-md">
                                Unlock the full potential of your data with AI-powered analytics.
                                Ask questions in plain English and get instant visualizations.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {features.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                        <item.icon size={17} className="text-white" />
                                    </div>
                                    <span className="text-[14px] text-white/85 font-medium">
                                        {item.text}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom — Testimonial */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
                    >
                        <p className="text-[14px] text-white/80 leading-relaxed italic mb-4">
                            &quot;InsightX has completely transformed how we analyze our transaction data.
                            What used to take hours now takes seconds.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[13px] font-bold">
                                SK
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-white">
                                    Sarah Kapoor
                                </p>
                                <p className="text-[12px] text-indigo-200/70">
                                    Head of Analytics, FinTech Corp
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel — Login/Signup Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 to-white min-h-screen lg:min-h-0">
                {/* Mobile back button */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                </div>

                <LoginCard />
            </div>
        </div>
    );
}
