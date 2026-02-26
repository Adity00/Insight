"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Upload, MessageSquareText, Lightbulb } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Upload,
        title: "Upload or Connect Your Data",
        description:
            "Import your CSV datasets or connect directly to your data sources. InsightX handles the rest with automatic schema detection and indexing.",
        gradient: "from-indigo-500 to-blue-500",
    },
    {
        number: "02",
        icon: MessageSquareText,
        title: "Ask Questions in Natural Language",
        description:
            'Simply type your questions like "Show me fraud trends in Mumbai last week" and our AI translates them into precise SQL queries.',
        gradient: "from-purple-500 to-pink-500",
    },
    {
        number: "03",
        icon: Lightbulb,
        title: "Get AI-Generated Insights & Reports",
        description:
            "Instantly receive rich contextual answers with interactive charts, executive summaries, and exportable PDF reports.",
        gradient: "from-amber-500 to-orange-500",
    },
];

export default function HowItWorks() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section id="how-it-works" className="py-24 lg:py-32 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/30 -z-10" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-2xl mx-auto mb-20"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[13px] font-semibold tracking-wide mb-5">
                        How It Works
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-[-0.03em] text-slate-900 mb-4">
                        Three Simple Steps
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        From raw data to intelligent decisions in minutes, not hours.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden lg:block absolute top-[48px] left-[16.5%] right-[16.5%] h-[2px]">
                        <div className="w-full h-full bg-gradient-to-r from-indigo-200 via-purple-200 to-amber-200 rounded-full opacity-70" />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                duration: 0.5,
                                delay: 0.2 + index * 0.15,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            {/* Step indicator */}
                            <div className="relative mb-8 pt-2">
                                <div
                                    className={`w-[80px] h-[80px] rounded-[1.5rem] bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl group-hover:-translate-y-1 transition-all duration-300 relative z-10`}
                                >
                                    <step.icon size={32} className="text-white" />
                                </div>
                                <div
                                    className={`absolute -top-1 -right-3 w-9 h-9 rounded-full bg-white shadow-md border-2 border-slate-50 flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <span className="text-[13px] font-extrabold text-slate-900">
                                        {step.number}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-[20px] font-bold text-slate-900 mb-3 tracking-tight">
                                {step.title}
                            </h3>
                            <p className="text-[15px] text-slate-600 leading-relaxed max-w-[320px] mx-auto">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
