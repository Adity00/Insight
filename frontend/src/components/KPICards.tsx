"use client";

import React from 'react';
import { DashboardStats } from '@/lib/api';

interface KPICardsProps {
    stats: DashboardStats | null;
}

export const KPICards = ({ stats }: KPICardsProps) => {
    if (!stats) return (
        <div className="animate-pulse flex flex-col gap-[24px] max-w-[720px]">
            <div className="h-[72px] bg-[var(--bg-elevated)] rounded-[12px] border border-[var(--border-subtle)]"></div>
            <div className="h-[72px] bg-[var(--bg-elevated)] rounded-[12px] border border-[var(--border-subtle)]"></div>
            <div className="h-[72px] bg-[var(--bg-elevated)] rounded-[12px] border border-[var(--border-subtle)]"></div>
        </div>
    );

    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val));
    };

    const formatCompact = (val: number | string) => {
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(Number(val));
    };

    const CardRow = ({ items }: { items: { label: string, value: string | React.ReactNode }[] }) => (
        <div className="max-w-[720px] h-[72px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] shadow-[var(--shadow-sm)] flex items-center px-[24px] py-[16px] transition-all duration-200 hover:shadow-[var(--shadow-md)]">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[12px] font-[500] uppercase text-[var(--text-muted)] tracking-[0.08em] mb-[4px]">{item.label}</span>
                        <span className="text-[20px] font-[600] text-[var(--text-primary)] leading-none">{item.value}</span>
                    </div>
                    {index < items.length - 1 && (
                        <div className="w-[1px] h-[40px] bg-[var(--border-subtle)] mx-[24px]"></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-[24px] animate-fade-in w-full pb-[40px]">
            <CardRow items={[
                { label: "Total Transactions", value: formatCompact(stats.total_transactions) },
                { label: "Success Rate", value: <span className="text-[var(--success-text)]">{stats.success_rate.toFixed(1)}%</span> },
                { label: "Avg Transaction", value: formatCurrency(stats.avg_amount_inr) }
            ]} />

            <CardRow items={[
                { label: "Top Transacting State", value: stats.top_state || "Unknown" },
                { label: "Fraud Alert Rate", value: <span className="text-[var(--error-text)]">{stats.fraud_flag_rate.toFixed(2)}%</span> },
                { label: "Peak Activity Hour", value: `${stats.peak_hour}:00` }
            ]} />

            <CardRow items={[
                { label: "Top Payment Method", value: stats.top_transaction_type.toUpperCase() },
                {
                    label: "Mobile Usage", value: (() => {
                        const dist = stats.device_distribution || {};
                        const total = Object.values(dist).reduce((a, b) => a + b, 0);
                        const android = dist["Android"] || 0;
                        const ios = dist["iOS"] || 0;
                        return total > 0 ? `${(((android + ios) / total) * 100).toFixed(0)}%` : "N/A";
                    })()
                },
                { label: "System Status", value: <span className="text-[var(--success-text)] flex items-center gap-[4px]"><div className="w-[6px] h-[6px] rounded-full bg-[var(--success-border)] animate-pulse"></div> Healthy</span> }
            ]} />
        </div>
    );
};
