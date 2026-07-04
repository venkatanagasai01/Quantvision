"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white/30 selection:text-white">

      {/* ── Top Nav ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/70 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg tracking-tight">QuantVision</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-medium bg-white text-black hover:bg-slate-200 px-5 py-2.5 rounded-full transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative pt-40 pb-20 sm:pt-48 sm:pb-32 flex flex-col items-center justify-center text-center px-6">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-slate-400 text-xs font-medium mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          QuantVision Terminal v2.0 is live
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[110px] font-medium tracking-tighter mb-8 animate-fade-up delay-100 leading-[0.95] max-w-5xl">
          Trade with <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            unfair intelligence.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-fade-up delay-200 leading-relaxed font-normal">
          Institutional-grade AI analysis, backtesting, and paper trading. <br className="hidden sm:block" /> Beautifully designed for the modern retail trader.
        </p>

        <div className="flex items-center gap-4 animate-fade-up delay-300">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-white text-black font-medium px-8 py-4 rounded-full text-lg transition-transform hover:scale-105"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Massive Hero Image ────────────────────────────── */}
      <section className="relative px-6 pb-40 flex justify-center animate-fade-up delay-500">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-black z-10 pointer-events-none opacity-40" />
        <div className="relative max-w-[1400px] w-full rounded-2xl md:rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)]">
          <img 
            src="/assets/hero-dashboard.png" 
            alt="QuantVision Terminal" 
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* ── Feature 1: Analysis ───────────────────────────── */}
      <section className="py-32 px-6 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight mb-6 max-w-4xl leading-tight">
            An AI analyst that never sleeps.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mb-16">
            We process millions of data points across technicals, fundamentals, and real-time news to give you a single, actionable confidence score.
          </p>

          <div className="relative w-full max-w-5xl rounded-2xl md:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group">
             {/* Subtle colored glow behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/20 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img 
              src="/assets/analysis-feature.png" 
              alt="AI Score Analysis" 
              className="relative z-10 w-full h-auto object-cover"
            />
          </div>

        </div>
      </section>

      {/* ── Feature 2: Paper Trading ───────────────────────── */}
      <section className="py-32 px-6 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight mb-6 max-w-4xl leading-tight">
            Test your edge. <br/> Zero risk.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mb-16">
            Start with virtual capital. Execute trades using live market prices. Track your true performance before putting real money on the line.
          </p>

          <div className="relative w-full max-w-5xl rounded-2xl md:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group">
             {/* Subtle colored glow behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/20 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img 
              src="/assets/paper-trading.png" 
              alt="Paper Trading" 
              className="relative z-10 w-full h-auto object-cover"
            />
          </div>

        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section className="py-40 px-6 border-t border-white/5 relative flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl sm:text-7xl font-medium tracking-tight mb-8">
          Ready to begin?
        </h2>
        <Link
          href="/register"
          className="flex items-center gap-2 bg-white text-black font-medium px-10 py-5 rounded-full text-xl transition-transform hover:scale-105"
        >
          Create Free Account <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-12 text-center bg-black">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-black" strokeWidth={3} />
          </div>
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} QuantVision. Designed for the obsessed.</p>
        </div>
      </footer>
    </div>
  );
}
