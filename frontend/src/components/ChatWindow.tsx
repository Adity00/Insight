"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Sparkles, Loader2, Lightbulb, ChevronRight,
    Mic, Paperclip, ChevronDown, Copy, Edit2, Save, Download,
    Check, BarChart2, TrendingUp, PieChart, Focus,
    Share, LayoutDashboard, ThumbsUp, ThumbsDown, Database,
    Clock, Code2, Server, TerminalSquare, CheckCircle
} from 'lucide-react';
import { api, ChatMessage, TurnRecord } from '@/lib/api';
import { Visualizations } from '@/components/Visualizations';
import toast, { Toaster } from 'react-hot-toast';
import { jsPDF } from 'jspdf';

interface Message extends ChatMessage {
    role: 'user' | 'assistant';
    id: string;
}

const PLACEHOLDERS = [
    "Ask about transaction trends...",
    "Which age group transacts the most?",
    "Show me the peak usage hour.",
    "Compare fraud rates across states.",
    "Type / for advanced commands"
];

const SLASH_COMMANDS = [
    { cmd: '/compare', desc: 'Compare metrics across dimensions' },
    { cmd: '/trend', desc: 'Analyze chronological trends over time' },
    { cmd: '/fraud', desc: 'Deep dive into high-risk transactions' },
    { cmd: '/forecast', desc: 'Predict future transaction volumes' },
    { cmd: '/demographics', desc: 'Break down by age and gender groups' }
];

const MessageActionRow = ({ msg, question }: { msg: Message; question?: string }) => {
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [pinning, setPinning] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = JSON.parse(localStorage.getItem('saved_insights') || '[]');
            if (!saved.find((s: { id: string }) => s.id === msg.id)) {
                saved.push(msg);
                localStorage.setItem('saved_insights', JSON.stringify(saved));
            }
            toast.success('Insight Saved Successfully');
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setTimeout(() => setSaving(false), 2000); // disable for 2s
        }
    };

    const handleDownloadPDF = async () => {
        setDownloading(true);
        toast('PDF Download Started', { icon: '⏳' });
        try {
            // A4 size in points
            const doc = new jsPDF({ format: 'a4', unit: 'pt' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const marginX = 50;
            const marginY = 40;
            const contentWidth = pageWidth - marginX * 2;
            let yPos = marginY;

            // Helper to handle auto page breaks safely
            const checkPageBreak = (neededHeight: number) => {
                if (yPos + neededHeight > pageHeight - marginY - 30) {
                    doc.addPage();
                    yPos = marginY;
                }
            };

            // 1. Cover Header
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 30);
            doc.text("InsightX Analysis Report", pageWidth / 2, yPos, { align: "center" });
            yPos += 20;

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Engine: InsightX Data Analysis Protocol", pageWidth / 2, yPos, { align: "center" });
            yPos += 20;

            // Thin divider line
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(1);
            doc.line(marginX, yPos, pageWidth - marginX, yPos);
            yPos += 35;

            // 2. User Question Section
            const userQ = question || msg.query_intent || "Data Query";
            checkPageBreak(80);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(40, 40, 40);
            doc.text("User Question", marginX, yPos);
            yPos += 15;

            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(60, 60, 60);
            const qLines = doc.splitTextToSize(userQ, contentWidth - 30);
            const boxHeight = (qLines.length * 16) + 24;

            doc.setFillColor(248, 250, 252); // subtle gray-blue
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(marginX, yPos, contentWidth, boxHeight, 6, 6, 'FD');

            yPos += 12 + 8; // padding + half font adjustment
            doc.text(qLines, marginX + 15, yPos);
            yPos += boxHeight - 20 + 35;

            // 3. Section Renderers
            const drawSectionHeader = (title: string) => {
                checkPageBreak(40);
                yPos += 10;
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(30, 30, 30);
                doc.text(title, marginX, yPos);
                yPos += 10;

                doc.setDrawColor(240, 240, 240);
                doc.setLineWidth(1);
                doc.line(marginX, yPos, marginX + Math.min(contentWidth, doc.getTextWidth(title) + 20), yPos);
                yPos += 18;
            };

            const renderMarkdownText = (text: string) => {
                doc.setFontSize(11);
                doc.setTextColor(60, 60, 60);
                const lines = doc.splitTextToSize(text, contentWidth);
                let isBoldState = false;

                lines.forEach((line: string) => {
                    checkPageBreak(25);
                    let currentX = marginX;
                    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                    if (isBullet) {
                        currentX += 15;
                    }

                    if (line.includes(': ') && !line.includes('**') && line.split(':')[0].length < 35) {
                        const parts = line.split(/:(.*)/);
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(30, 30, 30);
                        doc.text(parts[0] + ':', currentX, yPos);
                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(60, 60, 60);
                        if (parts[1]) doc.text(parts[1], currentX + doc.getTextWidth(parts[0] + ': '), yPos);
                    } else {
                        const tokens = line.split(/(\*\*)/g);
                        for (const t of tokens) {
                            if (t === '**') {
                                isBoldState = !isBoldState;
                            } else if (t.length > 0) {
                                doc.setFont("helvetica", isBoldState ? "bold" : "normal");
                                doc.setTextColor(isBoldState ? 30 : 60, isBoldState ? 30 : 60, isBoldState ? 30 : 60);
                                doc.text(t, currentX, yPos);
                                currentX += doc.getTextWidth(t);
                            }
                        }
                    }
                    yPos += 18; // 1.6 line height approx
                });
                yPos += 12; // block spacing
            };

            // 4. Parse & Render Content Blocks
            const rawBlocks = msg.answer.split('\n\n').filter(b => b.trim());

            rawBlocks.forEach((block, index) => {
                block = block.replace(/\n- /g, '\n• '); // standardize bullets

                let title = "";
                if (block.toLowerCase().includes('business implication:') || block.toLowerCase().includes('executive summary:')) {
                    title = "Strategic Business Recommendations";
                    block = block.replace(/Business Implication:/i, '').replace(/Executive Summary:/i, '').trim();
                } else if (index === 0) {
                    title = "Executive Summary";
                } else if (block.includes('•') && (block.includes('%') || block.match(/\d/))) {
                    title = "Key Metrics & Performance Insights";
                } else {
                    title = "Detailed Analysis";
                }

                drawSectionHeader(title);
                renderMarkdownText(block);
            });

            if (msg.proactive_insight) {
                drawSectionHeader("Proactive Strategic Insight");
                renderMarkdownText("• " + msg.proactive_insight.replace('⚠️ Note:', '').replace('📊', '').trim());
            }

            // 5. Add Footers on all pages
            const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
            const datePrinted = new Date().toLocaleDateString();

            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(150, 150, 150);

                doc.setDrawColor(230, 230, 230);
                doc.line(marginX, pageHeight - marginY, pageWidth - marginX, pageHeight - marginY);

                doc.text(`Generated by InsightX Engine  |  ${datePrinted}`, marginX, pageHeight - marginY + 15);
                const pageNum = `Page ${i} of ${pageCount}`;
                doc.text(pageNum, pageWidth - marginX - doc.getTextWidth(pageNum), pageHeight - marginY + 15);
            }

            // 6. Dynamic File Naming
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const safeName = userQ.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .trim()
                .split(/\s+/)
                .slice(0, 10)
                .join('-');

            const filename = `${safeName}-${dateStr}.pdf`;

            doc.save(filename);
            toast.success("PDF Downloaded");
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const handlePin = async () => {
        if (pinned) return;
        setPinning(true);
        try {
            const pinnedList = JSON.parse(localStorage.getItem('pinned_insights') || '[]');
            if (!pinnedList.find((s: { id: string }) => s.id === msg.id)) {
                pinnedList.push(msg);
                localStorage.setItem('pinned_insights', JSON.stringify(pinnedList));
            }
            setPinned(true);
            toast.success('Pinned to Dashboard');
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setPinning(false);
        }
    };

    const handleLink = async () => {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('insight', msg.id);
            await navigator.clipboard.writeText(url.toString());
            toast.success('Link Copied to Clipboard');
        } catch {
            toast.error('Something went wrong. Please try again.');
        }
    };

    const handleFeedback = async (type: 'like' | 'dislike') => {
        const isToggle = feedback === type;
        const newFeedback = isToggle ? null : type;
        setFeedbackLoading(true);
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ insightId: msg.id, type: newFeedback })
            }).catch(() => { }); // Catch separately so UI updates regardless of backend presence

            setFeedback(newFeedback);
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <div className="mt-[32px] flex flex-wrap items-center justify-between border-t border-[var(--border-subtle)] pt-[24px]">
            <div className="flex items-center gap-[12px]">
                <button disabled={saving} onClick={handleSave} aria-label="Save Insight" className="h-[36px] px-[16px] font-[500] rounded-[8px] border border-[var(--border-subtle)] text-[13px] text-[var(--text-secondary)] hover:bg-app-custom hover:text-[var(--text-primary)] transition-all flex items-center gap-[8px] hover:translate-y-[-1px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
                <button disabled={downloading} onClick={handleDownloadPDF} aria-label="Export as PDF" className="h-[36px] px-[16px] font-[500] rounded-[8px] border border-[var(--border-subtle)] text-[13px] text-[var(--text-secondary)] hover:bg-app-custom hover:text-[var(--text-primary)] transition-all flex items-center gap-[8px] hover:translate-y-[-1px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50">
                    {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Result as PDF
                </button>
                <button disabled={pinning || pinned} onClick={handlePin} aria-label="Pin to Dashboard" className={`h-[36px] px-[16px] font-[500] rounded-[8px] border border-[var(--border-subtle)] text-[13px] transition-all flex items-center gap-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 ${pinned ? 'bg-[var(--accent-solid)] text-white border-[var(--accent-solid)] hover:text-white' : 'text-[var(--text-secondary)] hover:bg-app-custom hover:text-[var(--text-primary)] hover:translate-y-[-1px]'}`}>
                    {pinning ? <Loader2 size={14} className="animate-spin" /> : <LayoutDashboard size={14} />} {pinned ? 'Pinned' : 'Pin to Dash'}
                </button>
                <button onClick={handleLink} aria-label="Copy Link" className="h-[36px] px-[16px] font-[500] rounded-[8px] border border-[var(--border-subtle)] text-[13px] text-[var(--text-secondary)] hover:bg-app-custom hover:text-[var(--text-primary)] transition-all flex items-center gap-[8px] hover:translate-y-[-1px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50">
                    <Share size={14} /> Link
                </button>
            </div>
            <div className="flex items-center gap-[4px] text-[var(--text-muted)] group/feedback">
                <button disabled={feedbackLoading} onClick={() => handleFeedback('like')} aria-label="Like" className={`p-2 rounded-[6px] transition-colors ${feedback === 'like' ? 'text-[var(--success-text)] bg-[var(--success-bg)]' : feedback === 'dislike' ? 'opacity-30' : 'hover:bg-app-custom hover:text-[var(--text-primary)]'}`} title="Accurate Response">
                    {feedbackLoading && feedback === 'like' ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
                </button>
                <button disabled={feedbackLoading} onClick={() => handleFeedback('dislike')} aria-label="Dislike" className={`p-2 rounded-[6px] transition-colors ${feedback === 'dislike' ? 'text-[var(--error-text)] bg-red-100' : feedback === 'like' ? 'opacity-30' : 'hover:bg-app-custom hover:text-[var(--text-primary)]'}`} title="Incorrect Context">
                    {feedbackLoading && feedback === 'dislike' ? <Loader2 size={16} className="animate-spin" /> : <ThumbsDown size={16} />}
                </button>
            </div>
        </div>
    );
};

import { DashboardStats } from '@/lib/api';

export const ChatWindow = ({ sessionId, stats }: { sessionId: string, stats: DashboardStats | null }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [insightExpanded, setInsightExpanded] = useState<Record<string, boolean>>({});

    const [contextPanelMsg, setContextPanelMsg] = useState<Message | null>(null);
    const [showSlashCmds, setShowSlashCmds] = useState(false);




    useEffect(() => {
        if (!sessionId) return;

        let cancelled = false;

        setMessages([]);


        api.getSessionMessages(sessionId)
            .then((turns: TurnRecord[]) => {
                if (cancelled) return;
                if (turns.length > 0) {
                    const restored: Message[] = turns.map((t, idx) => ({
                        role: t.role as 'user' | 'assistant',
                        id: `restored-${t.turn_id || idx}`,
                        answer: t.content,
                        sql_used: t.sql_used || undefined,
                        chart: t.chart || undefined,
                        execution_time_ms: t.execution_time_ms || undefined,
                        is_clarification: false,
                    }));
                    setMessages(restored);
                } else {
                    setMessages([]);
                }
            })
            .catch(() => {
                if (!cancelled) setMessages([]);
            });

        return () => { cancelled = true; };
    }, [sessionId]);


    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx(prev => (prev + 1) % PLACEHOLDERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInput(val);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';

        if (val.trim() === '/') {
            setShowSlashCmds(true);
        } else {
            setShowSlashCmds(false);
        }
    };

    const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
        e?.preventDefault();
        const textToSend = overrideText || input;
        if (!textToSend.trim() || loading || !sessionId) return;

        // Capture current session to detect stale updates after a switch
        const currentSessionId = sessionId;

        const userMsg: Message = {
            role: 'user',
            id: Date.now().toString(),
            answer: textToSend,
            is_clarification: false
        };

        setMessages(prev => [...prev, userMsg]);
        setShowSlashCmds(false);
        if (!overrideText) {
            setInput('');
            const textElement = document.getElementById('chat-input') as HTMLTextAreaElement;
            if (textElement) textElement.style.height = 'auto';
        }
        setLoading(true);

        try {
            const response = await api.askQuestion(textToSend, currentSessionId);
            // Abort if user has switched to a different session while waiting
            if (currentSessionId !== sessionId) return;
            const assistantMsg: Message = {
                ...response,
                role: 'assistant',
                id: (Date.now() + 1).toString()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            if (currentSessionId !== sessionId) return;
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                id: (Date.now() + 1).toString(),
                answer: "Sorry, I encountered an error processing your request. Please try again.",
                is_clarification: false,
                error: "Connection Error"
            }]);
        } finally {
            if (currentSessionId === sessionId) setLoading(false);
        }
    };


    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const renderAssistantText = (text: string) => {
        const blocks = text.split('\n\n').filter(Boolean);

        return blocks.map((block, idx) => {
            // Key Metrics or Bullet points
            if (block.includes('\n- ')) {
                const lines = block.split('\n');
                return (
                    <div key={idx} className="mt-[16px] mb-[24px] animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h4 className="text-[14px] font-[600] uppercase tracking-[0.04em] text-[var(--text-muted)] mb-[12px] flex items-center gap-[8px]">
                            <BarChart2 size={16} className="text-[var(--accent-solid)]" /> Key Data Points
                        </h4>
                        <div className="bg-app-custom p-[16px] rounded-[12px] border-l-[4px] border-l-[var(--accent-solid)]">
                            {lines.map((line, i) => {
                                if (line.trim().startsWith('- ')) {
                                    return <li key={i} className="ml-[16px] text-[var(--text-secondary)] text-[14px] leading-[22px] mb-[6px] list-disc">{line.replace('- ', '')}</li>
                                }
                                return <p key={i} className="text-[var(--text-secondary)] text-[14px] leading-[22px] mb-[8px] font-[500]">{line}</p>
                            })}
                        </div>
                    </div>
                )
            }

            // Business Implication / Summary
            if (block.toLowerCase().includes('business implication:') || block.toLowerCase().includes('executive summary:')) {
                const isImplication = block.toLowerCase().includes('business implication:');
                const title = isImplication ? 'Actionable Recommendation' : 'Executive Summary';
                const content = block.replace(/Business Implication:/i, '').replace(/Executive Summary:/i, '').trim();

                return (
                    <div key={idx} className={`mt-[24px] mb-[16px] bg-[var(--bg-surface)] rounded-[16px] border border-[var(--border-subtle)] border-l-[4px] p-[20px] animate-fade-in shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] ${isImplication ? 'border-l-[var(--success-text)]' : 'border-l-[var(--accent-solid)]'}`} style={{ animationDelay: `${idx * 100}ms` }}>
                        <h4 className="text-[14px] font-[600] uppercase tracking-[0.04em] text-[var(--text-muted)] mb-[8px] flex items-center gap-[8px]">
                            {isImplication ? <Lightbulb size={16} className="text-[var(--success-text)]" /> : <TerminalSquare size={16} className="text-[var(--accent-solid)]" />}
                            {title}
                        </h4>
                        <div className="text-[var(--text-secondary)] text-[14px] leading-[22px]">
                            {content}
                        </div>
                    </div>
                );
            }

            // Default paragraph
            return <p key={idx} className="text-[var(--text-primary)] text-[16px] leading-[24px] font-[400] mb-[16px] animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>{block}</p>;
        });
    }

    return (
        <div className="flex-1 flex flex-col w-full relative h-[calc(100vh-60px)] z-0">
            <div className={`mx-auto w-full pt-[64px] pb-[160px] px-[24px] h-full overflow-y-auto scrollbar-hide transition-all duration-300 ${contextPanelMsg ? 'max-w-[100%] pr-[340px]' : 'max-w-[1100px]'}`}>

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center mt-[10vh] animate-fade-in">
                        <h2 className="text-[30px] font-[600] text-[var(--text-primary)] tracking-[-0.02em] mb-[12px] max-w-[600px] leading-[40px]">
                            Turn Your Data Into Decisions
                        </h2>
                        <p className="text-[16px] text-[var(--text-secondary)] max-w-[520px] mb-[40px] leading-[24px]">
                            Explore your UPI transaction data naturally. Ask questions, spot trends, and uncover business insights instantly.
                        </p>

                        {/* V4 Dataset Summary Widget - Optional display if needed, but Hero styling tightened */}

                        <div className="bg-[var(--bg-surface)] rounded-[24px] p-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] w-full max-w-[900px] border border-[var(--border-subtle)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
                                {[
                                    { title: "Highest volume category", sub: "Analyze total transaction amounts", icon: <BarChart2 size={20} /> },
                                    { title: "Fraud risk by state", sub: "Identify high-risk geographical zones", icon: <Focus size={20} /> },
                                    { title: "Peak transaction hours", sub: "Optimize server load & marketing times", icon: <TrendingUp size={20} /> },
                                    { title: "Demographic breakdown", sub: "User age group distribution", icon: <PieChart size={20} /> }
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(undefined, suggestion.title)}
                                        className="bg-app-custom h-[100px] rounded-[14px] p-[20px] text-left hover:translate-y-[-2px] hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-solid)] border border-[var(--border-subtle)] transition-all duration-200 flex flex-col gap-[8px] group"
                                    >
                                        <div className="flex items-center gap-[12px]">
                                            <div className="w-[32px] h-[32px] bg-[var(--bg-elevated)] text-[var(--accent-solid)] rounded-[8px] flex items-center justify-center shrink-0">
                                                {suggestion.icon}
                                            </div>
                                            <h4 className="text-[14px] font-[600] text-[var(--text-primary)] leading-[20px] line-clamp-2">{suggestion.title}</h4>
                                        </div>
                                        <p className="text-[12px] text-[var(--text-muted)] line-clamp-2 pl-[44px] leading-tight">{suggestion.sub}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Minimal dataset snapshot underneath suggestions */}
                        {stats && (
                            <div className="mt-[32px] text-[12px] text-[var(--text-muted)] tracking-[0.04em] uppercase font-[500] flex items-center gap-[16px]">
                                <span>{Number(stats.total_transactions).toLocaleString()} Transactions indexed</span>
                                <div className="w-[4px] h-[4px] rounded-full bg-[var(--border-medium)]"></div>
                                <span>{stats.top_state} is Most Active</span>
                                <div className="w-[4px] h-[4px] rounded-full bg-[var(--border-medium)]"></div>
                                <span className="text-[var(--success-text)] flex items-center gap-[4px]"><CheckCircle /> Data is Fresh</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-[32px] w-full items-center">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full max-w-[800px] group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {/* User Message */}
                            {msg.role === 'user' && (
                                <div className="max-w-[75%] relative animate-fade-in group/bubble">
                                    <div className="bg-accent-primary text-[var(--bg-surface)] rounded-[20px] rounded-tr-[4px] px-[20px] py-[16px] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 hover:translate-y-[-1px]">
                                        <div className="text-[16px] font-[400] leading-[24px] whitespace-pre-wrap">
                                            {msg.answer}
                                        </div>
                                    </div>

                                    {/* Action UI Overlay */}
                                    <div className="absolute -bottom-8 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 flex items-center gap-[8px]">
                                        <span className="text-[12px] text-[var(--text-muted)] font-[500]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <button title="Edit Note" className="p-1.5 hover:bg-[var(--border-subtle)] rounded-[6px] text-[var(--text-muted)] transition-colors"><Edit2 size={12} /></button>
                                        <button title="Copy" onClick={() => copyToClipboard(msg.answer, msg.id)} className="p-1.5 hover:bg-[var(--border-subtle)] rounded-[6px] text-[var(--text-muted)] transition-colors">
                                            {copiedId === msg.id ? <Check size={12} className="text-[var(--success-text)]" /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Assistant Message */}
                            {msg.role === 'assistant' && (
                                <div className="w-full bg-[var(--bg-surface)] rounded-[16px] p-[32px] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] animate-fade-in transition-all duration-200 max-w-[800px]">
                                    <div className="flex items-center gap-[12px] mb-[24px]">
                                        <div className="w-[32px] h-[32px] rounded-[8px] bg-accent-primary flex items-center justify-center shadow-[var(--shadow-sm)]">
                                            <Sparkles size={16} className="text-[var(--bg-surface)]" />
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-[600] text-[var(--text-primary)] leading-[20px]">InsightX Engine</h4>
                                            <div className="text-[12px] text-[var(--text-muted)] flex items-center gap-[8px] leading-[18px]">
                                                Data Analysis Protocol
                                                <span className="flex items-center gap-[2px]" title="High Confidence">
                                                    <div className="w-[6px] h-[6px] rounded-full bg-[var(--success-border)]"></div>
                                                    <div className="w-[6px] h-[6px] rounded-full bg-[var(--success-border)]"></div>
                                                    <div className="w-[6px] h-[6px] rounded-full bg-[var(--success-border)]"></div>
                                                    <div className="w-[6px] h-[6px] rounded-full bg-[var(--success-border)]"></div>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-auto flex items-center gap-[8px]">
                                            {msg.sql_used && (
                                                <button onClick={() => setContextPanelMsg(contextPanelMsg?.id === msg.id ? null : msg)} className={`px-[12px] py-[6px] rounded-[6px] text-[12px] font-[500] tracking-[0.04em] uppercase transition-colors border ${contextPanelMsg?.id === msg.id ? 'bg-[var(--accent-solid)] text-[var(--bg-surface)] border-[var(--accent-solid)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-app-custom'}`}>
                                                    {contextPanelMsg?.id === msg.id ? 'Hide Details' : 'View Stack'}
                                                </button>
                                            )}
                                            <button onClick={() => copyToClipboard(msg.answer, msg.id)} className="p-2 hover:bg-app-custom rounded-[8px] text-[var(--text-muted)] transition-colors">
                                                {copiedId === msg.id ? <Check size={16} className="text-[var(--success-text)]" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-[16px] leading-[24px] text-[var(--text-primary)] space-y-[16px]">
                                        {renderAssistantText(msg.answer)}
                                    </div>

                                    {msg.chart && msg.chart.data && msg.chart.data.length > 0 && (
                                        <div className="my-[32px]">
                                            <Visualizations chartData={msg.chart} />
                                        </div>
                                    )}

                                    {msg.proactive_insight && (
                                        <div className="mt-[32px] bg-[var(--success-bg)] border border-[var(--success-border)] border-l-[4px] border-l-[var(--success-text)] p-[20px] rounded-[12px] flex gap-[16px] animate-fade-in relative group/insight">
                                            <div className="w-[40px] h-[40px] rounded-[8px] bg-[var(--bg-surface)] flex items-center justify-center shadow-[var(--shadow-sm)] shrink-0 border border-[var(--success-border)]">
                                                <Lightbulb size={20} className="text-[var(--success-text)]" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-[12px] font-[600] text-[var(--success-text)] mb-[4px] uppercase tracking-[0.08em]">Proactive Insight</h4>
                                                <p className={`text-[14px] font-[400] text-[var(--success-text)] leading-[22px] opacity-90 transition-all ${insightExpanded[msg.id] ? '' : 'line-clamp-2'}`}>
                                                    {msg.proactive_insight.replace('⚠️ Note:', '').replace('📊', '').trim()}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setInsightExpanded(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                                className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 bg-[var(--bg-surface)] border border-[var(--success-border)] text-[var(--success-text)] px-[12px] py-[4px] rounded-[6px] text-[10px] font-[600] tracking-[0.08em] uppercase hover:bg-[var(--success-bg)] shadow-[var(--shadow-sm)] transition-colors"
                                            >
                                                {insightExpanded[msg.id] ? 'Collapse' : 'Expand'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Insight Action Row */}
                                    <MessageActionRow msg={msg} question={messages.slice(0, messages.indexOf(msg)).reverse().find(m => m.role === 'user')?.answer} />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="w-full max-w-[800px] bg-[var(--bg-surface)] rounded-[16px] p-[32px] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] animate-fade-in flex flex-col gap-[24px]">
                            <div className="flex items-center gap-[12px]">
                                <div className="w-[32px] h-[32px] rounded-[8px] bg-[var(--border-subtle)] animate-pulse flex items-center justify-center">
                                    <Sparkles size={16} className="text-[var(--border-medium)]" />
                                </div>
                                <div className="flex flex-col gap-[8px]">
                                    <div className="h-[14px] w-[120px] bg-[var(--border-subtle)] rounded-[4px] animate-pulse"></div>
                                    <div className="h-[10px] w-[160px] bg-app-custom rounded-[4px] animate-pulse"></div>
                                </div>
                            </div>

                            {/* V4 Loading block precision styling */}
                            <div className="space-y-[12px] mt-[16px]">
                                <div className="h-[12px] bg-app-custom rounded-[4px] w-[95%] animate-pulse"></div>
                                <div className="h-[12px] bg-app-custom rounded-[4px] w-[85%] animate-pulse"></div>
                                <div className="h-[12px] bg-app-custom rounded-[4px] w-[65%] animate-pulse"></div>
                            </div>

                            <div className="flex items-center gap-[6px] mt-[8px] opacity-70">
                                <div className="w-[8px] h-[8px] rounded-full bg-[var(--accent-solid)] animate-pulse-opacity" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-[8px] h-[8px] rounded-full bg-[var(--accent-solid)] animate-pulse-opacity" style={{ animationDelay: "200ms" }}></div>
                                <div className="w-[8px] h-[8px] rounded-full bg-[var(--accent-solid)] animate-pulse-opacity" style={{ animationDelay: "400ms" }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-[64px]" />
                </div>
            </div>

            {/* V4 Floating Input Box Component */}
            <div className={`fixed bottom-0 left-0 right-0 z-30 pointer-events-none transition-all duration-300 ${contextPanelMsg ? 'md:pl-[260px] md:pr-[320px]' : 'md:pl-[260px]'}`}>
                <div className="max-w-[840px] mx-auto w-full p-[16px] pb-[32px] pointer-events-auto flex flex-col items-center">

                    {/* Slash Commands Dropdown */}
                    {showSlashCmds && (
                        <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[14px] shadow-[var(--shadow-lg)] overflow-hidden animate-fade-in flex flex-col mb-[16px]">
                            <div className="px-[16px] py-[12px] bg-app-custom border-b border-[var(--border-subtle)] text-[11px] font-[600] text-[var(--text-muted)] uppercase tracking-[0.08em]">
                                Select Engine Command
                            </div>
                            <div className="p-[8px] flex flex-col gap-[4px] max-h-[220px] overflow-y-auto scrollbar-hide">
                                {SLASH_COMMANDS.map((cmd, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setInput(cmd.cmd + " "); setShowSlashCmds(false); document.getElementById('chat-input')?.focus() }}
                                        className="flex items-center justify-between px-[12px] py-[10px] hover:bg-app-custom rounded-[8px] transition-colors text-left"
                                    >
                                        <span className="text-[14px] font-[600] text-[var(--accent-solid)]">{cmd.cmd}</span>
                                        <span className="text-[13px] font-[500] text-[var(--text-secondary)]">{cmd.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form
                        onSubmit={(e) => handleSend(e)}
                        className="w-full bg-[var(--bg-surface)] rounded-[18px] p-[16px] border border-[var(--border-subtle)] flex flex-col transition-all duration-200 focus-within:border-[var(--accent-solid)] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                    >
                        <textarea
                            id="chat-input"
                            value={input}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder={PLACEHOLDERS[placeholderIdx]}
                            className="w-full bg-transparent resize-none py-[4px] px-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-[16px] font-[400] focus:outline-none disabled:opacity-50 min-h-[32px] max-h-[160px] leading-[24px] transition-all"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />

                        <div className="flex justify-between items-center mt-[12px]">
                            <div className="flex items-center gap-[4px] flex-1 text-[var(--text-muted)]">
                                <button type="button" className="p-[8px] hover:bg-app-custom rounded-[8px] transition-colors flex items-center justify-center">
                                    <Paperclip size={18} />
                                </button>
                                <button type="button" className="py-[6px] px-[10px] hover:bg-app-custom rounded-[8px] transition-colors flex items-center gap-[6px] font-[500] text-[13px] border border-[var(--border-subtle)] ml-[4px]">
                                    <Database size={14} className="text-[var(--text-secondary)]" />
                                    <span className="truncate max-w-[140px] text-[var(--text-secondary)]">UWP Transactions DB</span> <ChevronDown size={14} />
                                </button>
                            </div>

                            <div className="flex items-center gap-[8px]">
                                <button title="Commands" type="button" onClick={() => setShowSlashCmds(!showSlashCmds)} className="p-[8px] hover:bg-app-custom rounded-[8px] transition-colors text-[var(--text-muted)]">
                                    <span className="text-[12px] font-[600] border border-[var(--border-subtle)] px-[8px] py-[2px] rounded-[6px]">/</span>
                                </button>
                                <button type="button" className="p-[8px] hover:bg-app-custom rounded-[8px] transition-colors text-[var(--text-muted)] mx-[4px]">
                                    <Mic size={20} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="w-[44px] h-[44px] rounded-full bg-accent-primary hover:scale-[0.98] disabled:opacity-50 disabled:bg-gray-300 disabled:hover:scale-100 text-[var(--bg-surface)] flex items-center justify-center transition-all duration-[200ms] shadow-sm shrink-0 group/sendbtn"
                                >
                                    <Send size={18} className="translate-x-[1px] group-hover/sendbtn:translate-x-[2px] transition-transform" />
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="flex items-center w-full justify-center mt-[24px] pt-[16px] border-t border-[var(--border-subtle)] text-center tracking-wide">
                        <p className="text-[12px] text-[var(--text-muted)] font-[500] uppercase">InsightX Engine V4.0 • Secure Data Sandbox</p>
                    </div>
                </div>
            </div>

            {/* V4 Right Context Panel Drawer */}
            <div className={`fixed right-0 top-[60px] bottom-0 w-[320px] bg-[var(--bg-sidebar)] border-l border-[var(--border-subtle)] z-20 shadow-[-8px_0_32px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${contextPanelMsg ? 'translate-x-0' : 'translate-x-[100%]'}`}>
                <div className="h-[64px] flex items-center justify-between px-[20px] border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <h3 className="text-[14px] font-[600] text-[var(--text-primary)] flex items-center gap-[8px] leading-[20px]"><Code2 size={16} className="text-[var(--accent-solid)]" /> Stack Execution trace</h3>
                    <button onClick={() => setContextPanelMsg(null)} className="p-[6px] hover:bg-app-custom rounded-[6px] transition-colors text-[var(--text-secondary)]">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-[20px] scrollbar-hide bg-[var(--bg-sidebar)]">
                    {contextPanelMsg && (
                        <div className="flex flex-col gap-[24px] animate-fade-in">

                            {/* Execution Meta */}
                            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-[16px] shadow-[var(--shadow-sm)]">
                                <p className="text-[12px] font-[500] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-[16px]">Execution Profile</p>
                                <div className="flex flex-col gap-[12px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-[500] text-[var(--text-secondary)] flex items-center gap-[8px]"><Clock size={14} /> Latency</span>
                                        <span className="text-[13px] font-[600] text-[var(--text-primary)]">
                                            {contextPanelMsg?.execution_time_ms
                                                ? `~${(contextPanelMsg.execution_time_ms / 1000).toFixed(1)}s`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-[500] text-[var(--text-secondary)] flex items-center gap-[8px]"><Server size={14} /> Compute Tier</span>
                                        <span className="text-[13px] font-[600] text-[var(--text-primary)]">GPT-4 (OpenAI)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] font-[500] text-[var(--text-secondary)] flex items-center gap-[8px]"><CheckCircle size={14} /> Accuracy Confidence</span>
                                        <span className="text-[13px] font-[600] text-[var(--success-border)]">
                                            SQL Validated ✓
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Datasets Block */}
                            <div className="bg-[var(--success-bg)] bg-opacity-30 border border-[var(--success-border)] rounded-[12px] p-[16px]">
                                <p className="text-[12px] font-[600] text-[var(--success-text)] uppercase tracking-[0.08em] mb-[8px]">Verified Origin Sources</p>
                                <p className="text-[14px] font-[600] text-[var(--text-primary)] mb-[4px]">
                                    upi_transactions_2024.db
                                </p>
                                <p className="text-[12px] text-[var(--text-secondary)] leading-[18px]">
                                    250,000 synthetic UPI transactions. SQL verified before execution.
                                </p>
                            </div>

                            {/* SQL Block */}
                            {contextPanelMsg.sql_used && (
                                <div className="flex flex-col gap-[8px]">
                                    <div className="flex items-center justify-between mt-[8px]">
                                        <p className="text-[12px] font-[600] text-[var(--text-muted)] uppercase tracking-[0.08em]">Generated Instruction</p>
                                        <button onClick={() => copyToClipboard(contextPanelMsg.sql_used || '', contextPanelMsg.id + '_sql')} className="text-[12px] font-[600] text-[var(--accent-solid)] hover:underline">Copy SQL</button>
                                    </div>
                                    <div className="bg-[var(--bg-elevated)] text-[var(--text-primary)] p-[16px] rounded-[12px] font-mono text-[13px] overflow-x-auto shadow-inner leading-[20px]">
                                        <pre>{contextPanelMsg.sql_used}</pre>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            <Toaster position="bottom-right" toastOptions={{ duration: 2500 }} />
        </div>
    );
};

