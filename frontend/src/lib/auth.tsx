"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────

export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const initialized = useRef(false);

    // ── Fetch current user on mount ──
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const token = localStorage.getItem("insightx_token");
        if (!token) {
            setIsLoading(false);
            return;
        }

        fetch(`${BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then((data: User) => {
                setUser(data);
            })
            .catch(() => {
                localStorage.removeItem("insightx_token");
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // ── Login ──
    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Login failed" }));
                return { success: false, error: err.detail || "Login failed" };
            }

            const data = await res.json();
            localStorage.setItem("insightx_token", data.token);
            setUser(data.user);
            return { success: true };
        } catch {
            return { success: false, error: "Network error. Please check your connection." };
        }
    }, []);

    // ── Register ──
    const register = useCallback(async (name: string, email: string, password: string) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Registration failed" }));
                if (err.detail && Array.isArray(err.detail)) {
                    const firstErr = err.detail[0];
                    return { success: false, error: firstErr?.msg || "Validation error" };
                }
                return { success: false, error: err.detail || "Registration failed" };
            }

            const data = await res.json();
            localStorage.setItem("insightx_token", data.token);
            setUser(data.user);
            return { success: true };
        } catch {
            return { success: false, error: "Network error. Please check your connection." };
        }
    }, []);

    // ── Logout — clears ALL user-specific localStorage ──
    const logout = useCallback(async () => {
        // Clear user-scoped session key before losing user reference
        if (user?.id) {
            localStorage.removeItem(`insightx_session_${user.id}`);
        }
        try {
            await fetch(`${BASE_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Best-effort
        }
        localStorage.removeItem("insightx_token");
        localStorage.removeItem("insightx_authenticated");
        localStorage.removeItem("insightx_active_session");
        setUser(null);
    }, [user]);

    // ── Memoize context value to prevent unnecessary re-renders ──
    const value = useMemo<AuthContextType>(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    }), [user, isLoading, login, register, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
