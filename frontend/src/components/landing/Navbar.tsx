"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const scrollTo = (id: string) => {
        setMobileOpen(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    const handleLogout = async () => {
        setShowUserMenu(false);
        await logout();
        router.replace("/");
    };

    const userInitials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const navLinks = [
        { label: "Features", id: "features" },
        { label: "How It Works", id: "how-it-works" },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(99,102,241,0.06)]"
                    : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-[72px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            InsightX
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollTo(link.id)}
                                className="px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/60 transition-all duration-200"
                            >
                                {link.label}
                            </button>
                        ))}

                        {isAuthenticated ? (
                            /* Authenticated: Avatar + Dropdown */
                            <div className="relative ml-2" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-bold shadow-md shadow-indigo-500/20">
                                        {userInitials}
                                    </div>
                                    <span className="text-[14px] font-medium text-slate-700 max-w-[120px] truncate">
                                        {user?.name}
                                    </span>
                                    <ChevronDown size={14} className="text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-[48px] w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 py-1.5 z-50 origin-top-right"
                                        >
                                            <div className="px-4 py-2.5 border-b border-slate-100">
                                                <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.name}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Link
                                                    href="/dashboard"
                                                    className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <LayoutDashboard size={14} className="text-slate-400" />
                                                    Dashboard
                                                </Link>
                                            </div>
                                            <div className="border-t border-slate-100 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <LogOut size={14} />
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* Unauthenticated: Login + Get Started */
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/60 transition-all duration-200"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/login"
                                    className="ml-2 px-5 py-2.5 text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-700 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => scrollTo(link.id)}
                                    className="text-left px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"
                                >
                                    {link.label}
                                </button>
                            ))}

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            setMobileOpen(false);
                                            await handleLogout();
                                        }}
                                        className="text-left px-4 py-3 text-[15px] font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-3 text-[15px] font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="mt-2 px-5 py-3 text-center text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25 transition-all"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
