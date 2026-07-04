"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  TrendingUp, Brain, BarChart3, ShieldCheck, Zap, ArrowRight, Activity, Target, LineChart, ChevronRight
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────
const STATS = [
  { value: "5,000+", label: "Active Traders" },
  { value: "$10M+", label: "Virtual Capital Traded" },
  { value: "4-Factor", label: "AI Scoring Model" },
  { value: "Real-Time", label: "Market Data" },
];

const TICKER_ITEMS = [
  { sym: "TCS.NS", chg: "+2.14%", up: true },
  { sym: "INFY.NS", chg: "+1.87%", up: true },
  { sym: "RELIANCE.NS", chg: "-0.43%", up: false },
  { sym: "HDFCBANK.NS", chg: "+0.91%", up: true },
  { sym: "NIFTY 50", chg: "+0.56%", up: true },
  { sym: "SENSEX", chg: "+0.48%", up: true },
  { sym: "AAPL", chg: "+1.22%", up: true },
  { sym: "NVDA", chg: "+3.54%", up: true },
  { sym: "TSLA", chg: "-1.09%", up: false },
  { sym: "S&P 500", chg: "+0.78%", up: true },
];

const TYPING_PHRASES = [
  "equity research analyst",
  "backtesting engine",
  "AI trading terminal",
  "portfolio advisor",
];

// ─── Components ───────────────────────────────────────────────────────
function TickerItem({ sym, chg, up }: { sym: string; chg: string; up: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 mx-6 text-sm">
      <span className="font-bold text-slate-200">{sym}</span>
      <span className={`font-semibold text-[11px] px-2 py-0.5 rounded-md ${up ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
        {chg}
      </span>
    </span>
  );
}

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
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPING_PHRASES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIndex]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">

      {/* ── Top Nav ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:shadow-[0_0_25px_rgba(79,70,229,0.7)] transition-all">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">QuantVision</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-bold bg-white text-[#0B0F19] hover:bg-slate-200 px-5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Ticker Tape ──────────────────────────────────────── */}
      <div className="fixed top-16 left-0 right-0 z-40 h-10 flex items-center bg-[#0B0F19]/95 border-b border-white/5 overflow-hidden backdrop-blur-md">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>

      {/* ── 1. Hero Section ──────────────────────────────────── */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-8 animate-fade-up backdrop-blur-sm">
            <SparklesIcon className="w-3.5 h-3.5" />
            The Next Generation of Retail Trading
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 animate-fade-up delay-100 leading-[1.1]">
            Your AI-powered <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              {displayed}
              <span className="animate-pulse text-indigo-400 ml-1">|</span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-up delay-200 leading-relaxed font-medium">
            Stop guessing. QuantVision aggregates deep technical indicators, fundamental ratios, and real-time FinBERT NLP sentiment into one actionable trading thesis.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up delay-300 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex justify-center items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.4)]"
            >
              Start Trading for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Massive Hero Image Preview */}
          <div className="mt-20 w-full animate-fade-up delay-500 perspective-1000">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] transform-gpu rotate-x-12 scale-95 hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent z-10 opacity-60 group-hover:opacity-0 transition-opacity duration-700" />
              <img 
                src="/assets/hero-dashboard.png" 
                alt="QuantVision Trading Dashboard" 
                className="w-full h-auto rounded-2xl object-cover border border-white/5"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2">{s.value}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Feature: Institutional Analysis ───────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img 
              src="/assets/analysis-feature.png" 
              alt="AI Analysis Feature" 
              className="relative w-full rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4 text-white">Institutional-Grade <br/>AI Analysis</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              We process millions of data points across technical indicators, financial statements, and real-time news articles. Our proprietary 4-factor AI model distills this into a single, easy-to-understand confidence score.
            </p>
            <ul className="space-y-4">
              {[
                "FinBERT real-time news sentiment tracking",
                "Technical momentum & volatility scoring",
                "Automated Bull & Bear case generation",
                "Structured written investment thesis"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. Feature: Paper Trading ───────────────────────── */}
      <section className="py-32 relative overflow-hidden bg-white/[0.01] border-y border-white/5">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4 text-white">Zero-Risk <br/>Paper Trading</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Test your strategies before risking real capital. Start with $100,000 in virtual funds and execute trades using live market prices. Track your P&L, analyze your performance, and refine your edge.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors group">
              Start trading virtual capital <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img 
              src="/assets/paper-trading.png" 
              alt="Paper Trading Portfolio" 
              className="relative w-full rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── 4. Grid Features ─────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">Everything you need to win</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">Professional tools that institutional traders pay thousands for — now accessible right in your browser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: "Quantitative Backtesting", desc: "Simulate trading strategies on years of historical data. Measure Sharpe, CAGR, and Drawdowns.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { icon: Activity, title: "Live Watchlists", desc: "Track your universe of stocks with real-time quotes, AI signals, and instant alerts.", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
              { icon: Target, title: "Research Reports", desc: "One-click institutional-grade PDF reports with full fundamental and technical analysis.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${f.bg}`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="w-20 h-20 mx-auto bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.3)]">
            <TrendingUp className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">Ready to trade smarter?</h2>
          <p className="text-slate-300 mb-10 text-xl font-medium">
            Join thousands of traders using QuantVision's AI to find the edge in the markets.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-white text-[#0B0F19] hover:bg-slate-200 font-bold px-10 py-5 rounded-xl text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-indigo-200/60 font-medium">No credit card required. Start analyzing instantly.</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#0B0F19] py-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            QuantVision
          </div>
          <p>© {new Date().getFullYear()} QuantVision AI Intelligence Terminal. Built for serious traders.</p>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
