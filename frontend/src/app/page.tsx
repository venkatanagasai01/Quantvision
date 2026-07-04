"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TrendingUp, Brain, BarChart3, ShieldCheck, Zap, ArrowRight, Activity, Target, LineChart
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "FinBERT sentiment fusion, SHAP explainability, and multi-factor scoring on every stock in real-time.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: BarChart3,
    title: "Quantitative Backtesting",
    description: "Simulate trading strategies on years of historical data. Measure Sharpe, CAGR, Max Drawdown, and more.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Paper Trading Terminal",
    description: "Practice with ₹10,00,000 virtual capital. Execute real-market-simulated orders with zero risk.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Activity,
    title: "Live Watchlists",
    description: "Track your universe of stocks with real-time quotes, AI signals, and instant alerts.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: Target,
    title: "Research Reports",
    description: "One-click institutional-grade PDF reports with full fundamental, technical, and sentiment analysis.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: LineChart,
    title: "Portfolio Intelligence",
    description: "Cross-strategy performance dashboards with equity curves, alpha tracking, and drawdown analysis.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
];

const STATS = [
  { value: "50+", label: "Indian & US Stocks" },
  { value: "12+", label: "Technical Indicators" },
  { value: "4-Factor", label: "AI Scoring Model" },
  { value: "Real-Time", label: "Sentiment Analysis" },
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

function TickerItem({ sym, chg, up }: { sym: string; chg: string; up: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 mx-6 text-sm">
      <span className="font-bold text-white">{sym}</span>
      <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${up ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
        {chg}
      </span>
    </span>
  );
}

const TYPING_PHRASES = [
  "equity research analyst",
  "backtesting engine",
  "AI trading terminal",
  "portfolio advisor",
];

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="min-h-screen bg-[#080c14] text-white font-sans overflow-x-hidden">

      {/* ── Top Nav ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080c14]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Quantan</span>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full ml-1">AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition-colors flex items-center gap-2">
              Get Access <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Ticker Tape ──────────────────────────────── */}
      <div className="fixed top-16 left-0 right-0 z-40 h-9 flex items-center bg-slate-900/90 border-b border-white/5 overflow-hidden">
        <div className="ticker-track gap-0">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <TickerItem key={i} {...item} />
          ))}
        </div>
      </div>

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 hero-grid">
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-8 animate-fade-up">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Institutional-Grade AI Research Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-fade-up delay-100 leading-[1.05]">
            Your AI-powered{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">
              {displayed}
              <span className="animate-pulse">|</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-up delay-200 leading-relaxed">
            Quantan aggregates deep technical indicators, fundamental ratios, and real-time FinBERT NLP
            sentiment into one actionable trading thesis — for every stock, instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-indigo-500/25 animate-pulse-glow"
            >
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-base transition-all hover:bg-white/5"
            >
              Sign In to Terminal
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up delay-400">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight mb-3">How Quantan Works</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm">Three steps from ticker to trade-ready thesis.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01", title: "Search Any Stock", icon: "🔍",
                desc: "Enter any NSE, BSE, or US ticker. We support 1000+ symbols including INFY.NS, AAPL, NVDA.",
              },
              {
                step: "02", title: "AI Analyzes Everything", icon: "⚡",
                desc: "Our 4-factor model scores Technical (RSI, MACD, BB), Fundamental (P/E, ROE), Sentiment (FinBERT), and Risk.",
              },
              {
                step: "03", title: "Get Your Thesis", icon: "📋",
                desc: "Receive a BUY / SELL / HOLD recommendation with confidence score, bull/bear case, and full explainability.",
              },
            ].map((s, i) => (
              <div key={i} className="relative glass-card rounded-2xl p-7 text-center group hover:border-indigo-500/30 transition-all">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Step {s.step}</div>
                <div className="text-lg font-bold mb-3">{s.title}</div>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black tracking-tight mb-3">Everything in One Terminal</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">Professional tools that institutional traders pay thousands for — now in your browser.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform cursor-default ${f.bg}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────── */}
      <section className="py-24 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-5xl mb-6 animate-float">🚀</div>
          <h2 className="text-4xl font-black tracking-tight mb-4">Ready to trade smarter?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join traders using Quantan's AI to make data-driven decisions every day.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-2xl hover:shadow-indigo-500/30"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-slate-500">No credit card required. Start analyzing instantly.</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <span>Quantan AI Intelligence Terminal — Built for serious traders.</span>
        </div>
      </footer>
    </div>
  );
}
