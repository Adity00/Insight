"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    MessageSquareText,
    BarChart3,
    FileDown,
    History,
    LayoutDashboard,
    Share2,
} from "lucide-react";

const features = [
    {
        icon: MessageSquareText,
        title: "Intelligent Chat Analysis",
        description:
            "Ask complex questions in natural language and get AI-generated SQL queries with rich contextual answers.",
        gradient: "from-indigo-500 to-blue-500",
        bgGradient: "from-indigo-50 to-blue-50",
    },
    {
        icon: BarChart3,
        title: "Real-Time Data Insights",
        description:
            "Interactive charts and visualizations auto-generated from your data. Area, bar, line, and pie charts at your fingertips.",
        gradient: "from-purple-500 to-pink-500",
        bgGradient: "from-purple-50 to-pink-50",
    },
    {
        icon: FileDown,
        title: "PDF Report Generation",
        description:
            "Export professional, branded PDF reports with analysis summaries, actionable recommendations, and your original query.",
        gradient: "from-emerald-500 to-teal-500",
        bgGradient: "from-emerald-50 to-teal-50",
    },
    {
        icon: History,
        title: "Session-Based Chat History",
        description:
            "Persistent chat sessions with full context memory. Rename, pin, and manage your conversations effortlessly.",
        gradient: "from-amber-500 to-orange-500",
        bgGradient: "from-amber-50 to-orange-50",
    },
    {
        icon: LayoutDashboard,
        title: "Smart Dashboard Overview",
        description:
            "Real-time KPI cards showing total volume, success rates, fraud alerts, and top transacting states at a glance.",
        gradient: "from-rose-500 to-red-500",
        bgGradient: "from-rose-50 to-red-50",
    },
    {
        icon: Share2,
        title: "Export & Share Reports",
        description:
            "Share insights via link, download charts, or pin them to your custom dashboard for team collaboration.",
        gradient: "from-cyan-500 to-blue-500",
        bgGradient: "from-cyan-50 to-blue-50",
    },
];

function FeatureCard({
    feature,
    index,
}: {
    feature: (typeof features)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative"
        >
            <div className="relative bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all duration-300 h-full">
                {/* Subtle gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                    <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bgGradient} border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                        <feature.icon
                            size={22}
                            className={`bg-gradient-to-r ${feature.gradient} bg-clip-text`}
                            style={{
                                color: "transparent",
                                stroke: "url(#icon-gradient)",
                            }}
                        />
                        {/* Fallback text color since SVG gradients are complex */}
                        <feature.icon
                            size={22}
                            className="text-indigo-600 absolute"
                            style={{ opacity: 0.9 }}
                        />
                    </div>

                    <h3 className="text-[17px] font-bold text-slate-900 mb-2 tracking-tight">
                        {feature.title}
                    </h3>
                    <p className="text-[14px] text-slate-500 leading-relaxed">
                        {feature.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default function Features() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="features" className="py-24 lg:py-32 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white -z-10" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[13px] font-semibold tracking-wide mb-5">
                        Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-[-0.03em] text-slate-900 mb-4">
                        Powerful AI Features
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        Everything you need to transform raw data into actionable business
                        intelligence, powered by state-of-the-art AI.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
