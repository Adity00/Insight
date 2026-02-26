"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Brain,
    BarChart3,
    FileDown,
    Search,
    MessageSquareText,
    ArrowRight,
    ChevronDown,
} from "lucide-react";

const bulletPoints = [
    { icon: Brain, text: "AI-powered smart analytics" },
    { icon: BarChart3, text: "Real-time conversational dashboard" },
    { icon: FileDown, text: "Export professional PDF reports" },
    { icon: Search, text: "Context-aware data analysis" },
    { icon: MessageSquareText, text: "Clean, intelligent chat interface" },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
    const scrollToFeatures = () => {
        const el = document.getElementById("features");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden pt-[72px]">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-slate-50 to-indigo-50/40" />
                <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -right-32 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-50/30 to-transparent rounded-full" />
            </div>

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }}
            />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-xl"
                    >
                        <motion.div variants={itemVariants}>
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[13px] font-semibold tracking-wide mb-6">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                AI-Powered Analytics Platform
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.03em] leading-[1.08] text-slate-900 mb-6"
                        >
                            Transform Data Into{" "}
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                Intelligent Insights
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg"
                        >
                            InsightX is an AI-powered analytics assistant that helps you
                            analyze, visualize, and extract deep insights from your data in
                            seconds.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col gap-3 mb-10">
                            {bulletPoints.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/60 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors duration-300">
                                        <item.icon size={15} className="text-indigo-600" />
                                    </div>
                                    <span className="text-[15px] text-slate-600 font-medium">
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <Link
                                href="/login"
                                className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                Get Started
                                <ArrowRight
                                    size={16}
                                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                            </Link>
                            <button
                                onClick={scrollToFeatures}
                                className="group inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:border-indigo-200 hover:text-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                View Demo
                                <ChevronDown
                                    size={16}
                                    className="group-hover:translate-y-0.5 transition-transform duration-200"
                                />
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Right Illustration */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 40 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative hidden lg:flex items-center justify-center"
                    >
                        {/* Floating background shape */}
                        <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-100/60 via-purple-100/40 to-pink-100/30 blur-xl -z-10" />

                        {/* Illustration */}
                        <motion.div
                            animate={{ y: [-8, 8, -8] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                        >
                            <Image
                                src="/hero-illustration.png"
                                alt="InsightX AI Analytics Dashboard"
                                width={520}
                                height={520}
                                className="drop-shadow-2xl"
                                priority
                            />
                        </motion.div>

                        {/* Floating badge 1 */}
                        <motion.div
                            animate={{ y: [-6, 6, -6] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 px-4 py-3 flex items-center gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <BarChart3 size={17} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[12px] text-slate-400 font-medium">Success Rate</p>
                                <p className="text-[16px] font-bold text-slate-900">95.0%</p>
                            </div>
                        </motion.div>

                        {/* Floating badge 2 */}
                        <motion.div
                            animate={{ y: [6, -6, 6] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -right-2 bottom-1/4 bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 px-4 py-3 flex items-center gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Brain size={17} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[12px] text-slate-400 font-medium">AI Queries</p>
                                <p className="text-[16px] font-bold text-slate-900">250K+</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
