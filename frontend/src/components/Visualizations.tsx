"use client";

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-[16px] rounded-[12px] shadow-[var(--shadow-md)] z-50">
                <p className="text-[var(--text-muted)] text-[11px] font-[600] uppercase tracking-[0.08em] mb-[8px]">{label}</p>
                <p className="text-[var(--text-primary)] font-[600] text-[16px] leading-[1.2]">
                    {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export const Visualizations = ({ chartData }: { chartData: any }) => {
    if (!chartData || !chartData.data) return null;

    const { type, data, x_key, y_key } = chartData;

    // Derive charts colors from CSS vars conceptually
    const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[16px] p-[24px] shadow-[var(--shadow-sm)] h-[400px] w-full group transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] flex flex-col mt-[16px]">
            <div className="flex items-center justify-between mb-[24px]">
                <h3 className="text-[16px] font-[600] text-[var(--text-primary)] tracking-[0em]">Data Visualization</h3>
                <div className="flex items-center gap-[8px] bg-[var(--bg-app)] px-[12px] py-[6px] rounded-[6px] border border-[var(--border-subtle)]">
                    <div className="w-[6px] h-[6px] rounded-full bg-[var(--accent-solid)] animate-pulse"></div>
                    <span className="text-[11px] font-[600] text-[var(--text-secondary)] uppercase tracking-[0.08em]">{type} view</span>
                </div>
            </div>

            <div className="flex-1 w-full font-sans min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'bar' ? (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                            <XAxis dataKey={x_key} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => val.toLocaleString()} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-primary)', opacity: 0.5 }} />
                            <Bar dataKey={y_key} fill="var(--accent-solid)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                        </BarChart>
                    ) : type === 'line' ? (
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                            <XAxis dataKey={x_key} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => val.toLocaleString()} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-medium)', strokeWidth: 1 }} />
                            <Line type="monotone" dataKey={y_key} stroke="var(--accent-solid)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-elevated)', strokeWidth: 2, stroke: 'var(--accent-solid)' }} activeDot={{ r: 6, fill: 'var(--accent-solid)', stroke: 'white' }} />
                        </LineChart>
                    ) : type === 'pie' ? (
                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey={y_key}
                                nameKey={x_key}
                                stroke="none"
                            >
                                {data.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }} />
                        </PieChart>
                    ) : (
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                            <XAxis dataKey={x_key} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => val.toLocaleString()} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey={y_key} stroke="var(--accent-solid)" strokeWidth={3} fillOpacity={1} fill="url(#colorAccent)" />
                            <defs>
                                <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-solid)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--accent-solid)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
