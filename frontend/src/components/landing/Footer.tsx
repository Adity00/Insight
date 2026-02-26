"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Github } from "lucide-react";

const footerLinks = {
    Product: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Pricing", href: "#" },
    ],
    Company: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
    ],
    Resources: [
        { label: "Documentation", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "Support", href: "#" },
        { label: "Privacy Policy", href: "#" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-300 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                <div className="py-16 lg:py-20 grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">
                                InsightX
                            </span>
                        </Link>
                        <p className="text-[14px] text-slate-400 leading-relaxed mb-6 max-w-[240px]">
                            AI-powered analytics platform that transforms raw data into
                            intelligent, actionable insights.
                        </p>
                        <a
                            href="https://github.com/Adity00/Insight"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
                        >
                            <Github size={15} />
                            View on GitHub
                        </a>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-4">
                                {category}
                            </h4>
                            <ul className="flex flex-col gap-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-[14px] text-slate-400 hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[13px] text-slate-500">
                        © 2026 InsightX. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="#"
                            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Terms
                        </a>
                        <a
                            href="#"
                            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Privacy
                        </a>
                        <a
                            href="#"
                            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
