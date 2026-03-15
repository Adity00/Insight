"use client";

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, BarChart2, MessageSquare, Shield,
  Zap, Database, Brain, TrendingUp, ChevronRight, Globe,
  Lock, Layers, Activity
} from 'lucide-react';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

/* ─── Animated Section Wrapper ─── */
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating Particle Background ─── */
function ParticleGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 300 + i * 80,
            height: 300 + i * 80,
            left: `${10 + i * 15}%`,
            top: `${5 + i * 12}%`,
            background: `radial-gradient(circle, ${
              i % 2 === 0
                ? 'rgba(99,102,241,0.06)'
                : 'rgba(6,182,212,0.05)'
            } 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Nav ─── */
function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/5"
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between h-[72px] px-6 md:px-10">
        <div className="flex items-center gap-3">
          <img src="/paytm-logo.png" alt="Paytm" className="h-[14px] w-auto" />
          <span className="text-[26px] font-[800] tracking-[-0.04em]" style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 35%, #06b6d4 70%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>InsightX</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[14px] text-zinc-400 font-[500]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#metrics" className="hover:text-white transition-colors">Metrics</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[14px] font-[600] rounded-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
          >
            Launch Dashboard
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[72px]">
      <ParticleGrid />

      {/* Gradient orbs */}
      <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-[900px] mx-auto px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[13px] text-zinc-300 font-[500] mb-8 backdrop-blur-sm"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          Powered by GPT-4 &bull; 250K+ UPI Transactions Analyzed
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-[48px] md:text-[72px] font-[800] leading-[1.05] tracking-[-0.04em] mb-6"
        >
          <span className="text-white">AI-Powered </span>
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 30%, #06b6d4 70%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            UPI Analytics
          </span>
          <br />
          <span className="text-white">in Plain English</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-[18px] md:text-[20px] text-zinc-400 max-w-[640px] mx-auto leading-[1.7] font-[400] mb-10"
        >
          Ask questions about transaction volumes, failure rates, fraud patterns, and merchant insights.
          InsightX converts your questions into real-time SQL queries and delivers visual analytics instantly.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 20px 40px rgba(99,102,241,0.3)' }}
              whileTap={{ scale: 0.97 }}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white text-[16px] font-[700] rounded-xl shadow-2xl shadow-indigo-500/25 flex items-center gap-3 transition-all"
            >
              Start Analyzing
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <a href="#how-it-works">
            <motion.button
              whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 text-[16px] font-[600] rounded-xl backdrop-blur-sm hover:bg-white/8 transition-all flex items-center gap-2"
            >
              See How It Works
              <ChevronRight size={16} />
            </motion.button>
          </a>
        </motion.div>

        {/* Mock terminal / query preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-16 mx-auto max-w-[700px] rounded-2xl bg-[#111113]/80 border border-white/8 shadow-2xl shadow-black/40 backdrop-blur-md overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-[12px] text-zinc-500 font-mono">InsightX Engine v4.0</span>
          </div>
          <div className="p-6 font-mono text-[14px]">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-indigo-400 font-[700]">You</span>
              <span className="text-zinc-300">Which state has the highest fraud flag rate?</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-[700]">AI</span>
              <div className="text-zinc-400">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                >
                  Maharashtra leads with a 0.21% fraud flag rate across 37,427 transactions
                  — 15% above the national average of 0.19%.
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Features Grid ─── */
function FeaturesSection() {
  const features = [
    {
      icon: <MessageSquare size={24} />,
      title: 'Natural Language Queries',
      desc: 'Ask questions in plain English. No SQL knowledge needed — InsightX generates precise DuckDB queries automatically.',
      gradient: 'from-indigo-500/20 to-indigo-500/5'
    },
    {
      icon: <BarChart2 size={24} />,
      title: 'Real-Time Visualizations',
      desc: 'Every query produces interactive bar charts, line graphs, and data tables. Switch between views instantly.',
      gradient: 'from-cyan-500/20 to-cyan-500/5'
    },
    {
      icon: <Brain size={24} />,
      title: 'Compound Question Handling',
      desc: 'Ask multiple questions at once. InsightX decomposes them, runs each query, and synthesizes a unified answer.',
      gradient: 'from-purple-500/20 to-purple-500/5'
    },
    {
      icon: <Shield size={24} />,
      title: 'Fraud Pattern Detection',
      desc: 'Identify fraud-flagged transactions across states, banks, devices, and time periods with precision analytics.',
      gradient: 'from-rose-500/20 to-rose-500/5'
    },
    {
      icon: <Zap size={24} />,
      title: 'Conversational Memory',
      desc: 'Multi-turn context tracking. Say "compare that with HDFC" and InsightX resolves pronouns from conversation history.',
      gradient: 'from-amber-500/20 to-amber-500/5'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Statistical Enrichment',
      desc: 'Z-score analysis, trend detection, and anomaly flagging computed automatically on every query result.',
      gradient: 'from-emerald-500/20 to-emerald-500/5'
    },
  ];

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.05)_0%,transparent_50%)]" />
      <div className="max-w-[1200px] mx-auto relative">
        <AnimatedSection className="text-center mb-16">
          <span className="text-[13px] font-[600] text-indigo-400 uppercase tracking-[0.15em] mb-4 block">Capabilities</span>
          <h2 className="text-[40px] md:text-[52px] font-[800] text-white tracking-[-0.03em] leading-[1.1] mb-5">
            Built for <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">serious analytics</span>
          </h2>
          <p className="text-[18px] text-zinc-400 max-w-[560px] mx-auto leading-[1.7]">
            Everything a PM needs to extract insights from 250,000 UPI transactions — powered by GPT-4 and DuckDB.
          </p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.12)' }}
              className="group p-7 rounded-2xl bg-[#111113]/60 border border-white/6 backdrop-blur-sm hover:bg-[#151518]/80 transition-all duration-300 cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="text-[17px] font-[700] text-white mb-2.5 tracking-[-0.01em]">{f.title}</h3>
              <p className="text-[14px] text-zinc-400 leading-[1.7]">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Ask a Question',
      desc: 'Type your analytics question in plain English — "Which bank has the highest failure rate?" or even multiple questions at once.',
      icon: <MessageSquare size={28} />
    },
    {
      step: '02',
      title: 'AI Generates SQL',
      desc: 'GPT-4 converts your question into a precise DuckDB SQL query, respecting schema constraints, NULL handling, and rate calculations.',
      icon: <Database size={28} />
    },
    {
      step: '03',
      title: 'Query Execution',
      desc: 'The validated SQL runs against 250,000 real UPI transactions in DuckDB. Results are enriched with z-scores and trend analysis.',
      icon: <Zap size={28} />
    },
    {
      step: '04',
      title: 'Visual Insights',
      desc: 'InsightX narrates findings like a McKinsey analyst — with charts, benchmarks, anomaly flags, and actionable recommendations.',
      icon: <TrendingUp size={28} />
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.04)_0%,transparent_50%)]" />
      <div className="max-w-[1100px] mx-auto relative">
        <AnimatedSection className="text-center mb-20">
          <span className="text-[13px] font-[600] text-cyan-400 uppercase tracking-[0.15em] mb-4 block">How It Works</span>
          <h2 className="text-[40px] md:text-[52px] font-[800] text-white tracking-[-0.03em] leading-[1.1] mb-5">
            From question to <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">insight in seconds</span>
          </h2>
        </AnimatedSection>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[43px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 via-cyan-500/20 to-transparent hidden md:block" />

          <div className="flex flex-col gap-12">
            {steps.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="flex items-start gap-8 group">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative w-[86px] h-[86px] rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#111113] border border-white/8 flex items-center justify-center text-indigo-400 shrink-0 shadow-xl shadow-black/20 group-hover:border-indigo-500/30 transition-colors"
                  >
                    {s.icon}
                    <span className="absolute -top-2 -right-2 text-[11px] font-[800] bg-gradient-to-r from-indigo-500 to-cyan-500 text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-lg">{s.step}</span>
                  </motion.div>
                  <div className="pt-2">
                    <h3 className="text-[20px] font-[700] text-white mb-2 tracking-[-0.01em]">{s.title}</h3>
                    <p className="text-[15px] text-zinc-400 leading-[1.8] max-w-[520px]">{s.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Metrics / Stats ─── */
function MetricsSection() {
  const metrics = [
    { value: '250K+', label: 'UPI Transactions', icon: <Activity size={20} /> },
    { value: '8', label: 'Banking Partners', icon: <Database size={20} /> },
    { value: '29', label: 'Indian States', icon: <Globe size={20} /> },
    { value: '50+', label: 'Query Types', icon: <Brain size={20} /> },
  ];

  return (
    <section id="metrics" className="relative py-28 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent" />
      <div className="max-w-[1100px] mx-auto relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ y: -4, borderColor: 'rgba(99,102,241,0.2)' }}
              className="relative text-center p-8 rounded-2xl bg-[#111113]/60 border border-white/6 backdrop-blur-sm overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-indigo-400 mb-3 flex justify-center">{m.icon}</div>
                <div className="text-[40px] md:text-[48px] font-[800] text-white tracking-[-0.04em] leading-none mb-2">{m.value}</div>
                <div className="text-[14px] text-zinc-400 font-[500]">{m.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Security & Trust ─── */
function SecuritySection() {
  const items = [
    { icon: <Lock size={20} />, title: 'Read-Only SQL', desc: 'Only SELECT statements allowed. No data mutation ever.' },
    { icon: <Shield size={20} />, title: 'SQL Validation', desc: 'Every query is validated and sanitized before execution.' },
    { icon: <Layers size={20} />, title: 'Secure Sandbox', desc: 'DuckDB in-memory engine. Data never leaves the server.' },
    { icon: <Globe size={20} />, title: 'Privacy First', desc: 'No user data stored. Session-based ephemeral memory only.' },
  ];

  return (
    <section id="security" className="relative py-28 px-6">
      <div className="max-w-[1000px] mx-auto">
        <AnimatedSection className="text-center mb-14">
          <span className="text-[13px] font-[600] text-emerald-400 uppercase tracking-[0.15em] mb-4 block">Trust & Security</span>
          <h2 className="text-[36px] md:text-[44px] font-[800] text-white tracking-[-0.03em] leading-[1.1]">
            Enterprise-grade security, <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">by design</span>
          </h2>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 gap-5"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="flex items-start gap-5 p-6 rounded-xl bg-[#111113]/40 border border-white/5 hover:border-emerald-500/15 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">{item.icon}</div>
              <div>
                <h4 className="text-[15px] font-[700] text-white mb-1">{item.title}</h4>
                <p className="text-[14px] text-zinc-400 leading-[1.6]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
      <AnimatedSection className="max-w-[700px] mx-auto text-center relative">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-12 md:p-16 rounded-3xl bg-gradient-to-b from-[#141420] to-[#0e0e12] border border-white/8 shadow-2xl shadow-indigo-500/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
          <div className="relative">
            <Sparkles className="mx-auto text-indigo-400 mb-5" size={36} />
            <h2 className="text-[32px] md:text-[40px] font-[800] text-white leading-[1.15] tracking-[-0.03em] mb-4">
              Ready to uncover insights?
            </h2>
            <p className="text-[16px] text-zinc-400 mb-8 leading-[1.7] max-w-[440px] mx-auto">
              Start querying 250,000 UPI transactions with conversational AI. No setup required.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(99,102,241,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="group px-10 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white text-[16px] font-[700] rounded-xl shadow-2xl shadow-indigo-500/30 flex items-center gap-3 mx-auto transition-all"
              >
                Launch Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </AnimatedSection>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/paytm-logo.png" alt="Paytm" className="h-[14px] w-auto opacity-60" />
          <span className="text-[14px] text-zinc-500 font-[500]">InsightX &bull; Techfest IIT Bombay 2025-26</span>
        </div>
        <div className="text-[13px] text-zinc-600">
          Built with Next.js, FastAPI, DuckDB & GPT-4
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
