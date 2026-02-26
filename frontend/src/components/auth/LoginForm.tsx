"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [generalError, setGeneralError] = useState("");

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError("");

        if (!validate()) return;
        if (isLoading) return;

        setIsLoading(true);

        try {
            const result = await login(email.trim(), password);
            if (result.success) {
                router.replace("/dashboard");
            } else {
                setGeneralError(result.error || "Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* General error */}
            {generalError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium"
                >
                    {generalError}
                </motion.div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="login-email"
                    className="text-[13px] font-semibold text-slate-700 tracking-tight"
                >
                    Email Address
                </label>
                <div className="relative">
                    <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        id="login-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                            if (generalError) setGeneralError("");
                        }}
                        className={`w-full pl-11 pr-4 py-3 text-[14px] text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder-slate-400 transition-all duration-200 ${errors.email
                            ? "border-red-300 bg-red-50/30 focus:ring-red-500/20 focus:border-red-400"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                    />
                </div>
                {errors.email && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[12px] text-red-500 font-medium"
                    >
                        {errors.email}
                    </motion.p>
                )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="login-password"
                    className="text-[13px] font-semibold text-slate-700 tracking-tight"
                >
                    Password
                </label>
                <div className="relative">
                    <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password)
                                setErrors((prev) => ({ ...prev, password: undefined }));
                            if (generalError) setGeneralError("");
                        }}
                        className={`w-full pl-11 pr-12 py-3 text-[14px] text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder-slate-400 transition-all duration-200 ${errors.password
                            ? "border-red-300 bg-red-50/30 focus:ring-red-500/20 focus:border-red-400"
                            : "border-slate-200 hover:border-slate-300"
                            }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
                {errors.password && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[12px] text-red-500 font-medium"
                    >
                        {errors.password}
                    </motion.p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 ${isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99]"
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}
