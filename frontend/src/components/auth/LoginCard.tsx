"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

type AuthMode = "login" | "signup";

export default function LoginCard() {
    const [mode, setMode] = useState<AuthMode>("login");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
        >
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        InsightX
                    </span>
                </div>

                {/* Header */}
                <div className="mb-7">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-[-0.02em] mb-1.5">
                                {mode === "login" ? "Welcome Back" : "Create Account"}
                            </h1>
                            <p className="text-[14px] text-slate-500">
                                {mode === "login"
                                    ? "Sign in to continue analyzing your data."
                                    : "Start your free InsightX analytics journey."}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Form */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mode === "login" ? <LoginForm /> : <SignupForm />}
                    </motion.div>
                </AnimatePresence>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-[1px] bg-slate-200" />
                    <span className="text-[12px] text-slate-400 font-medium select-none">
                        {mode === "login" ? "New to InsightX?" : "Already have an account?"}
                    </span>
                    <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                {/* Toggle */}
                <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="w-full py-3 text-[14px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 transition-all duration-200 active:scale-[0.99]"
                >
                    {mode === "login" ? "Create a free account" : "Sign in instead"}
                </button>
            </div>
        </motion.div>
    );
}
