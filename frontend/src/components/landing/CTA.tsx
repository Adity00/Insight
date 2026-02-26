"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section className="py-24 lg:py-32 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative rounded-3xl overflow-hidden"
                >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700" />

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                            backgroundSize: "24px 24px",
                        }}
                    />

                    <div className="relative px-8 py-16 sm:px-16 sm:py-20 lg:py-24 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-[13px] font-semibold tracking-wide mb-6">
                            <Sparkles size={14} />
                            Start Today — It&apos;s Free
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-white mb-5 max-w-3xl mx-auto leading-tight">
                            Ready to Unlock AI-Powered Insights?
                        </h2>

                        <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto leading-relaxed">
                            Join thousands of data analysts using InsightX to make smarter,
                            faster decisions with the power of conversational AI.
                        </p>

                        <Link
                            href="/login"
                            className="group inline-flex items-center gap-2.5 px-8 py-4 text-[16px] font-bold text-indigo-600 bg-white rounded-full shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:shadow-indigo-900/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                        >
                            Start Using InsightX
                            <ArrowRight
                                size={18}
                                className="group-hover:translate-x-0.5 transition-transform duration-200"
                            />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
