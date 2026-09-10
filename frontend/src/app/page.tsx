"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  TrendingUp, Brain, BarChart3, ShieldCheck, ArrowRight, Activity, Target, Zap, ChevronRight
} from "lucide-react";

const TYPING_PHRASES = [
  "Institutional Precision.",
  "4-Factor AI Models.",
  "Real-Time Sentiment.",
  "Deep Quantitative Data.",
];

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);

  // Typing effect
  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 50);
    } else if (!isDeleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length - 1)), 30);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPING_PHRASES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIndex]);

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/70 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">QuantVision</span>
          </div>
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-sm font-bold bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="text-sm font-bold bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Ultimate Hero Section ───────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Grid & Noise */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] pointer-events-none" />
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none -translate-x-1/3 translate-y-1/3" />
        
        {/* Floating Ticker Chips (Background) */}
        <div className="absolute top-[20%] left-[5%] p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce shadow-2xl hidden xl:block" style={{ animationDuration: '4s' }}>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">NVDA</div>
          <div className="text-emerald-400 font-black text-sm">+4.25%</div>
        </div>
        <div className="absolute bottom-[20%] left-[45%] p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce shadow-2xl hidden xl:block" style={{ animationDuration: '5s', animationDelay: '1s' }}>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">HDFCBANK</div>
          <div className="text-red-400 font-black text-sm">-0.82%</div>
        </div>
        <div className="absolute top-[10%] right-[40%] p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 animate-bounce shadow-2xl hidden xl:block" style={{ animationDuration: '6s', animationDelay: '2s' }}>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">TSLA</div>
          <div className="text-emerald-400 font-black text-sm">+1.15%</div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text Matter */}
          <div className="text-left relative z-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-8 hover:bg-emerald-500/20 transition-colors cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              The Next-Gen AI Stock Screener is live <ChevronRight className="w-3 h-3 ml-1" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight mb-6 leading-[1.05] drop-shadow-2xl">
              Analyze stocks with <br />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-xl opacity-30"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                  {displayed}
                  <span className="animate-pulse text-emerald-400 font-light">|</span>
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-lg leading-relaxed font-medium">
              Stop guessing. QuantVision aggregates deep technical indicators, fundamental ratios, and real-time news sentiment into one actionable AI score, giving you a definitive edge in the market.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="relative overflow-hidden group bg-white text-black hover:bg-slate-200 font-bold px-8 py-4 rounded-xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">Go to Dashboard <ArrowRight className="w-5 h-5" /></span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="relative overflow-hidden group bg-white text-black hover:bg-slate-200 font-bold px-8 py-4 rounded-xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                  >
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10 flex items-center gap-2">Start Analyzing <ArrowRight className="w-5 h-5" /></span>
                  </Link>
                  <Link
                    href="/login"
                    className="bg-[#0B0F19] hover:bg-[#111827] text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 shadow-xl"
                  >
                    View Live Demo
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Custom AI Analysis CSS Mockup */}
          <div className="relative w-full perspective-[2000px] group hidden lg:block ml-4 xl:ml-8">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {/* Floating Glass Card */}
            <div className={`relative z-10 transform ${mounted ? 'rotate-y-[-12deg] rotate-x-[8deg] translate-y-0 opacity-100' : 'rotate-y-[-20deg] rotate-x-[15deg] translate-y-20 opacity-0'} group-hover:rotate-y-[-5deg] group-hover:rotate-x-[2deg] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
              
              {/* Main Analysis Card */}
              <div className="w-full bg-[#080C16]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_100px_rgba(16,185,129,0.2)] relative overflow-hidden ring-1 ring-white/5">
                
                {/* Decorative Grid inside Card */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

                {/* Top Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <TrendingUp className="text-emerald-400 w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tight">RELIANCE</h3>
                      <p className="text-sm text-slate-400 font-medium tracking-wide">NSE • Equity</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">₹2,945.50</div>
                    <div className="text-emerald-400 text-sm font-bold flex items-center gap-1 justify-end mt-1">
                      <TrendingUp className="w-4 h-4" /> +2.45%
                    </div>
                  </div>
                </div>

                {/* Score Section */}
                <div className="flex items-center gap-10 mb-10 relative z-10">
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="none" />
                      <circle 
                        cx="72" cy="72" r="64" 
                        stroke="url(#emeraldGradient)" 
                        strokeWidth="10" fill="none" 
                        strokeDasharray="402" 
                        strokeDashoffset={mounted ? 48.2 : 402} 
                        strokeLinecap="round" 
                        className="drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-[2000ms] ease-out" 
                      />
                      <defs>
                        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="text-center">
                      <span className="text-5xl font-black text-white drop-shadow-md">88</span>
                      <span className="block text-[11px] text-emerald-400 font-black uppercase tracking-widest mt-1 bg-emerald-500/10 py-1 px-2 rounded-full border border-emerald-500/20">Strong Buy</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div>
                      <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-wider">
                        <span className="text-slate-400">Technical Momentum</span>
                        <span className="text-emerald-400">Bullish</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-2 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 delay-300 ease-out" style={{ width: mounted ? '85%' : '0%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-wider">
                        <span className="text-slate-400">FinBERT Sentiment</span>
                        <span className="text-emerald-400">Positive</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-2 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 delay-500 ease-out" style={{ width: mounted ? '92%' : '0%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-wider">
                        <span className="text-slate-400">Fundamental Value</span>
                        <span className="text-amber-400">Neutral</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all duration-1000 delay-700 ease-out" style={{ width: mounted ? '60%' : '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-5 border-t border-white/5 pt-8 relative z-10">
                  <div className="bg-[#0B1120] p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group/stat shadow-inner">
                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/stat:text-slate-300 transition-colors">RSI (14)</div>
                    <div className="text-emerald-400 font-black text-2xl">68.5</div>
                  </div>
                  <div className="bg-[#0B1120] p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group/stat shadow-inner">
                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/stat:text-slate-300 transition-colors">MACD</div>
                    <div className="text-emerald-400 font-black text-2xl">Bullish</div>
                  </div>
                  <div className="bg-[#0B1120] p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group/stat shadow-inner">
                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/stat:text-slate-300 transition-colors">Risk/Reward</div>
                    <div className="text-white font-black text-2xl">1 : 3.2</div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 */}
              <div className={`absolute -right-10 -top-10 bg-[#0B0F19]/95 backdrop-blur-2xl border border-emerald-500/30 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 animate-bounce transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ animationDuration: '4s' }}>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-inner">
                  <Brain className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">AI Confidence</div>
                  <div className="text-white font-black text-xl">94.2%</div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Mobile Image Version (No heavy 3D) */}
          <div className="lg:hidden mt-8 relative">
            <div className="rounded-3xl border border-emerald-500/20 bg-[#080C16] p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
              <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="text-emerald-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl tracking-tight">RELIANCE</h3>
                  <p className="text-xs text-slate-400 font-medium">NSE • Equity</p>
                </div>
              </div>
              <div className="flex items-center justify-between relative z-10">
                 <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">AI Score</div>
                 <div className="text-emerald-400 font-black text-3xl">88/100</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Feature 1: The AI Model (Image Left, Text Right) ── */}
      <section className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Image Box */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-2xl bg-[#0B0F19] p-2 border border-white/10">
                <Image 
                  src="/assets/analysis-feature.png" 
                  width={1200} 
                  height={900} 
                  alt="4-Factor Analysis" 
                  className="rounded-xl w-full h-auto"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-400 font-bold mb-4 text-sm tracking-widest uppercase">
                <Brain className="w-4 h-4" /> The Brain
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                4-Factor <br/> Intelligence.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                We don't just look at a price chart. Our proprietary model analyzes four distinct pillars for every stock on the market, giving you a definitive edge over retail traders.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: "Technical Momentum", desc: "RSI, MACD, and Bollinger Bands analyzed across timeframes." },
                  { title: "Fundamental Ratios", desc: "P/E, ROE, and Debt-to-Equity scored against sector medians." },
                  { title: "FinBERT Sentiment", desc: "Real-time NLP scanning of news articles and market chatter." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <strong className="text-white text-lg block mb-1">{item.title}</strong>
                      <span className="text-slate-400 leading-relaxed">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 2: Paper Trading (Text Left, Image Right) ── */}
      <section className="py-24 md:py-32 relative bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Content */}
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 text-indigo-400 font-bold mb-4 text-sm tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4" /> Risk-Free
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Simulate your <br/> success.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Test your strategies in real-time market conditions without risking a single rupee. Every account comes pre-loaded with ₹10,00,000 in virtual capital.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#0B0F19] p-5 rounded-xl border border-white/5">
                  <div className="text-2xl font-black text-white mb-1">Live Data</div>
                  <div className="text-sm text-slate-400">Millisecond accurate execution</div>
                </div>
                <div className="bg-[#0B0F19] p-5 rounded-xl border border-white/5">
                  <div className="text-2xl font-black text-white mb-1">Full Tracking</div>
                  <div className="text-sm text-slate-400">P&L, Win Rate, and Drawdown</div>
                </div>
              </div>

              <Link href="/register" className="inline-flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                Start your paper portfolio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Image Box */}
            <div className="order-1 md:order-2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-2xl bg-[#0B0F19] p-2 border border-white/10">
                <Image 
                  src="/assets/paper-trading.png" 
                  width={1200} 
                  height={900} 
                  alt="Paper Trading Portfolio" 
                  className="rounded-xl w-full h-auto"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for execution.</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A streamlined workflow designed to take you from initial idea to confident execution in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />

            {[
              {
                step: "01",
                title: "Discover",
                desc: "Scan the market and instantly get our 4-factor AI score on any asset."
              },
              {
                step: "02",
                title: "Validate",
                desc: "Backtest your ideas against historical data to ensure quantitative edge."
              },
              {
                step: "03",
                title: "Execute",
                desc: "Paper trade or follow real-time sentiment alerts on your customized watchlist."
              }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center p-8 bg-[#0B0F19] rounded-3xl border border-white/5 shadow-2xl transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-2xl mb-6 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                  {s.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#0B0F19]/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to win.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Paper Trading",
                desc: "Simulate trades with ₹10,00,000 in virtual capital. Execute orders with zero risk.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10 border-indigo-500/20"
              },
              {
                icon: Activity,
                title: "Smart Watchlists",
                desc: "Track your favorite assets with real-time AI scoring and sentiment alerts directly on your dashboard.",
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20"
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
              <div key={i} className="bg-[#030712] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110 ${f.bg}`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-32 text-center px-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">Ready to trade smarter?</h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-black font-bold text-lg px-10 py-5 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-slate-400">No credit card required. Start analyzing instantly.</p>
        </div>
      </section>

    </div>
  );
}
