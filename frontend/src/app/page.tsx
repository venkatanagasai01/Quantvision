"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TrendingUp, Brain, BarChart3, ShieldCheck, ArrowRight, Activity, Target, ShieldAlert
} from "lucide-react";

const TYPING_PHRASES = [
  "Institutional Analysis.",
  "Quantitative Backtesting.",
  "Paper Trading Portfolio.",
  "Real-Time Sentiment.",
];

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing effect
  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 70);
    } else if (!isDeleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPING_PHRASES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIndex]);

  return (
    <div className="min-h-screen bg-[#080B12] text-white font-sans selection:bg-indigo-500/30">

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080B12]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">QuantVision</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-bold bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-lg transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              The all-in-one terminal
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Level up your trading with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                {displayed}
                <span className="animate-pulse text-indigo-400">|</span>
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              Stop guessing. QuantVision aggregates deep technical indicators, fundamental ratios, and real-time FinBERT sentiment into one actionable thesis.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2"
              >
                Start Trading <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mini CSS UI Preview - Dashboard */}
          <div className="relative w-full h-[400px] rounded-2xl border border-white/10 bg-[#0B0F19] shadow-2xl p-6 overflow-hidden hidden md:block group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            
            {/* Mock Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="w-24 h-4 rounded bg-slate-800 animate-pulse" />
                  <div className="w-16 h-3 rounded bg-slate-800 animate-pulse" />
                </div>
              </div>
              <div className="w-20 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                BUY
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-32 border-b border-slate-800 pb-2">
                {[40, 60, 45, 80, 55, 90, 75, 100, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Mock Data Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-slate-800/50 border border-slate-700/50" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature: 4-Factor AI Model ──────────────────────── */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          
          {/* CSS UI Preview - Score Ring */}
          <div className="order-2 md:order-1 flex justify-center">
            <div className="relative w-72 h-72 rounded-full bg-[#0B0F19] border border-white/10 shadow-2xl flex items-center justify-center flex-col shadow-emerald-500/10 group">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="144" cy="144" r="130" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                <circle cx="144" cy="144" r="130" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="816" strokeDashoffset="200" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000 group-hover:strokeDashoffset-[100]" />
              </svg>
              <span className="text-5xl font-black text-white">85</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 uppercase tracking-widest">Bullish</span>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold mb-3 text-sm tracking-widest uppercase">
              <Brain className="w-4 h-4" /> The Brain
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">4-Factor Intelligence.</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              We don't just look at a price chart. Our proprietary model analyzes four distinct pillars for every stock on the market:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">Technical Momentum</strong>
                  <span className="text-sm text-slate-500">RSI, MACD, and Bollinger Bands analyzed across timeframes.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">Fundamental Ratios</strong>
                  <span className="text-sm text-slate-500">P/E, ROE, and Debt-to-Equity scored against sector medians.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">FinBERT Sentiment</strong>
                  <span className="text-sm text-slate-500">Real-time NLP scanning of news articles and market chatter.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Feature Grid (The "Matter") ─────────────────────── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to win.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Professional tools that institutional traders pay thousands for, simplified into a single beautiful dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Paper Trading",
                desc: "Simulate trades with ₹10,00,000 in virtual capital. Execute orders with zero risk and build your track record.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10 border-indigo-500/20"
              },
              {
                icon: BarChart3,
                title: "Quantitative Backtesting",
                desc: "Test strategies on historical data. Measure your CAGR, Max Drawdown, and Sharpe Ratio instantly.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20"
              },
              {
                icon: Target,
                title: "Research Reports",
                desc: "Generate beautiful, PDF-ready institutional research reports with a single click.",
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20"
              }
            ].map((f, i) => (
              <div key={i} className="bg-[#0B0F19] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 text-center px-6">
        <h2 className="text-4xl font-bold mb-6">Ready to trade smarter?</h2>
        <Link
          href="/register"
          className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-full hover:bg-slate-200 transition-colors"
        >
          Create Free Account
        </Link>
        <p className="mt-4 text-sm text-slate-500">No credit card required. Start analyzing instantly.</p>
      </section>

    </div>
  );
}
