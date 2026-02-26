"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function SignupForm() {
    const { register } = useAuth();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});
    const [generalError, setGeneralError] = useState("");

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!name.trim()) {
            newErrors.name = "Name is required";
        } else if (name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }
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
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearFieldError = (field: keyof typeof errors) => {
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
        if (generalError) setGeneralError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError("");

        if (!validate()) return;
        if (isLoading) return;

        setIsLoading(true);

        try {
            const result = await register(name.trim(), email.trim(), password);
            if (result.success) {
                router.replace("/dashboard");
            } else {
                setGeneralError(result.error || "Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (hasError?: string) =>
        `w-full pl-11 pr-4 py-3 text-[14px] text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder-slate-400 transition-all duration-200 ${hasError
            ? "border-red-300 bg-red-50/30 focus:ring-red-500/20 focus:border-red-400"
            : "border-slate-200 hover:border-slate-300"
        }`;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {generalError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium"
                >
                    {generalError}
                </motion.div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-name" className="text-[13px] font-semibold text-slate-700 tracking-tight">
                    Full Name
                </label>
                <div className="relative">
                    <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                        className={inputClass(errors.name)}
                    />
                </div>
                {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-red-500 font-medium">
                        {errors.name}
                    </motion.p>
                )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-email" className="text-[13px] font-semibold text-slate-700 tracking-tight">
                    Email Address
                </label>
                <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        id="signup-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                        className={inputClass(errors.email)}
                    />
                </div>
                {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-red-500 font-medium">
                        {errors.email}
                    </motion.p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-password" className="text-[13px] font-semibold text-slate-700 tracking-tight">
                    Password
                </label>
                <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                        className={`${inputClass(errors.password)} !pr-12`}
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
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-red-500 font-medium">
                        {errors.password}
                    </motion.p>
                )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="signup-confirm" className="text-[13px] font-semibold text-slate-700 tracking-tight">
                    Confirm Password
                </label>
                <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        id="signup-confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                        className={`${inputClass(errors.confirmPassword)} !pr-12`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Toggle confirm password visibility"
                    >
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] text-red-500 font-medium">
                        {errors.confirmPassword}
                    </motion.p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 mt-1 text-[15px] font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 ${isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99]"
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating account...
                    </>
                ) : (
                    "Create Account"
                )}
            </button>
        </form>
    );
}
