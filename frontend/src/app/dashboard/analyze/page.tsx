"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Search, Sparkles, TrendingUp, HelpCircle,
  Brain, BarChart3, ShieldCheck, Zap, ArrowRight,
  Copy, Check, Clock, BookOpen, AlertTriangle, Target
} from "lucide-react";
import { useStockAnalysis } from "@/hooks/useAnalysis";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { useBacktestSignals, useSentimentData } from "@/hooks/useDataStreams";

import { RecommendationCard } from "@/components/analysis/RecommendationCard";
import { ContributionChart } from "@/components/analysis/ContributionChart";
import { StrengthsCard } from "@/components/analysis/StrengthsCard";
import { RisksCard } from "@/components/analysis/RisksCard";
import { BullBearCard } from "@/components/analysis/BullBearCard";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { TradingChart } from "@/components/charts/TradingChart";
import { IndicatorTabs } from "@/components/charts/IndicatorTabs";
import { RecommendationTimeline } from "@/components/charts/RecommendationTimeline";
import { SentimentTimeline } from "@/components/charts/SentimentTimeline";
import { INDIAN_STOCKS } from "@/constants/stocks";
import { Suspense } from "react";

// ─── Feature preview cards ────────────────────────────────────
const WHAT_YOU_GET = [
  { icon: Brain,       title: "4-Factor AI Score",       desc: "Technical + Fundamental + Sentiment + Risk scored 0–100.", color: "text-indigo-500", bg: "bg-indigo-50 border-indigo-100" },
  { icon: TrendingUp,  title: "Price Chart + Signals",   desc: "Candlestick chart with SMA-50/200 and BUY/SELL markers.", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100" },
  { icon: BarChart3,   title: "RSI, MACD & Volume",      desc: "Technical indicator panels with overbought/oversold zones.", color: "text-violet-500", bg: "bg-violet-50 border-violet-100" },
  { icon: ShieldCheck, title: "Bull / Bear Case",        desc: "Numbered AI-generated reasons for and against investing.", color: "text-amber-500", bg: "bg-amber-50 border-amber-100" },
  { icon: Zap,         title: "FinBERT Sentiment",       desc: "Real-time news sentiment using finance-tuned NLP model.", color: "text-sky-500", bg: "bg-sky-50 border-sky-100" },
  { icon: Sparkles,    title: "AI Investment Thesis",    desc: "Full written AI thesis — Summary, Catalysts, and Risks.", color: "text-pink-500", bg: "bg-pink-50 border-pink-100" },
];

const TRENDING_STOCKS = [
  { symbol: "TCS.NS",      name: "Tata Consultancy" },
  { symbol: "INFY.NS",     name: "Infosys" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "AAPL",        name: "Apple" },
  { symbol: "NVDA",        name: "NVIDIA" },
  { symbol: "TSLA",        name: "Tesla" },
];

const SCORE_TOOLTIPS: Record<string, string> = {
  technical:   "RSI, MACD, Bollinger Bands, SMA crossovers, and volume patterns. Higher = stronger bullish technical setup.",
  fundamental: "P/E ratio, EPS growth, Return on Equity (ROE), Debt-to-Equity, and revenue trend. Higher = stronger financials.",
  sentiment:   "FinBERT NLP score from recent financial news. Positive news = higher score. Real-time market mood.",
  risk:        "Based on Beta, volatility, drawdown, and sector risk. LOWER score = SAFER — this scale is inverted.",
};

// ─── Structured Investment Thesis ────────────────────────────
function InvestmentThesis({ thesis, symbol }: { thesis: string; symbol: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(thesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Try to split into sections (the AI often uses markdown-style sections)
  const sections = (() => {
    // If thesis has explicit markers like "Summary:", "Key Catalysts:", "Risks:"
    const hasSections = /summary|catalyst|risk|conclusion/i.test(thesis);
    if (hasSections && thesis.length > 300) {
      // Split on common section headers
      const lines = thesis.split("\n").filter(l => l.trim());
      const result: { header: string; content: string; icon: any; color: string }[] = [];
      let current: { header: string; lines: string[]; icon: any; color: string } | null = null;

      const sectionMap: Record<string, { icon: any; color: string }> = {
        summary:    { icon: BookOpen, color: "text-indigo-600" },
        catalyst:   { icon: TrendingUp, color: "text-emerald-600" },
        risk:       { icon: AlertTriangle, color: "text-red-500" },
        conclusion: { icon: Target, color: "text-violet-600" },
        outlook:    { icon: Target, color: "text-violet-600" },
      };

      for (const line of lines) {
        const matchKey = Object.keys(sectionMap).find(k => line.toLowerCase().includes(k));
        if (matchKey && line.length < 60) {
          if (current) result.push({ header: current.header, content: current.lines.join(" "), icon: current.icon, color: current.color });
          current = { header: line.replace(/[#:*]/g, "").trim(), lines: [], ...sectionMap[matchKey] };
        } else if (current) {
          current.lines.push(line);
        }
      }
      if (current) result.push({ header: current.header, content: current.lines.join(" "), icon: current.icon, color: current.color });
      if (result.length >= 2) return result;
    }
    return null;
  })();

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 border border-indigo-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-indigo-100 flex items-center justify-between bg-white/60">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">AI Investment Thesis</h3>
            <p className="text-xs text-slate-400 mt-0.5">Full written analysis from the AI model — like a mini analyst report for {symbol}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock className="w-3 h-3" /> Generated now
          </div>
          <button
            onClick={handleCopy}
            title="Copy thesis to clipboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {!thesis || thesis === "No thesis generated." ? (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No investment thesis was generated for this stock.</p>
          </div>
        ) : sections ? (
          // Structured sections
          <div className="flex flex-col gap-6">
            {sections.map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={`flex items-center gap-2 text-sm font-black uppercase tracking-wider ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                  {s.header}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{s.content}</p>
                {i < sections.length - 1 && <div className="border-t border-slate-100 mt-2" />}
              </div>
            ))}
          </div>
        ) : (
          // Plain text — still looks great
          <div className="flex gap-4">
            <div className="w-1 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-full shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{thesis}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main analysis component ──────────────────────────────────
function AnalysisContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "";

  const [searchQuery, setSearchQuery] = useState(initialSymbol);
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const { data: analysisData, isLoading: analysisLoading, isError: analysisError } = useStockAnalysis(activeSymbol, token);
  const { data: historyData, isLoading: historyLoading }   = useHistoricalData(activeSymbol, token);
  const { data: signalsData, isLoading: signalsLoading }   = useBacktestSignals(activeSymbol, token);
  const { data: sentimentData, isLoading: sentimentLoading } = useSentimentData(activeSymbol, token);

  const isAnyLoading = analysisLoading || historyLoading || signalsLoading || sentimentLoading;

  // ── Extract real current price from last candle ─────────────
  const currentPrice = (() => {
    if (!historyData?.candles?.length) return 0;
    const sorted = [...historyData.candles].sort((a, b) => {
      const ta = typeof a.time === "string" ? new Date(a.time).getTime() : a.time;
      const tb = typeof b.time === "string" ? new Date(b.time).getTime() : b.time;
      return tb - ta; // descending — first = most recent
    });
    return sorted[0]?.close ?? 0;
  })();

  // ── Format signals for lightweight-charts markers ───────────
  const chartSignals = signalsData?.map((t: any) => ({
    time: t.date.split("T")[0],
    position: t.action === "BUY" ? "belowBar" : "aboveBar",
    color: t.action === "BUY" ? "#10b981" : "#ef4444",
    shape: t.action === "BUY" ? "arrowUp" : "arrowDown",
    text: t.action,
  })).sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime()) || [];

  const filteredStocks = searchQuery
    ? INDIAN_STOCKS.filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  const handleTagClick = (symbol: string) => {
    setSearchQuery(symbol);
    setActiveSymbol(symbol);
    setShowDropdown(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-8 font-sans pb-10 px-4 xl:px-0">

      {/* ── Header & Search ──────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center mt-4">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Institutional Analysis Terminal</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          Enter any NSE, BSE, or US ticker for deep AI-powered technical, fundamental, and sentiment analysis — in seconds.
        </p>

        {/* Search bar */}
        <div className="mt-7 w-full max-w-2xl relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery) return;
              setActiveSymbol(searchQuery.toUpperCase());
              setShowDropdown(false);
            }}
            className="relative flex items-center shadow-sm z-10"
          >
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value.toUpperCase()); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Enter ANY symbol — e.g. INFY.NS, AAPL, NVDA, RELIANCE.NS..."
              className="w-full pl-12 pr-36 py-4 bg-white border border-slate-200 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase placeholder:normal-case placeholder:text-slate-400 shadow-sm"
            />
            <button
              type="submit"
              disabled={isAnyLoading || !searchQuery}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isAnyLoading
                ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                : <><ArrowRight className="w-4 h-4" /></>
              }
              Analyze
            </button>
          </form>

          {/* Autocomplete */}
          {showDropdown && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto text-left">
              <ul className="py-2">
                {filteredStocks.map((stock) => (
                  <li key={stock.symbol}>
                    <button
                      type="button"
                      onClick={() => handleTagClick(stock.symbol)}
                      className="w-full text-left px-6 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{stock.symbol}</span>
                        <span className="text-sm text-slate-400 ml-3">{stock.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  </li>
                ))}
                {!filteredStocks.find(s => s.symbol.toLowerCase() === searchQuery.toLowerCase()) && (
                  <li>
                    <button
                      type="button"
                      onClick={() => { setActiveSymbol(searchQuery.toUpperCase()); setShowDropdown(false); }}
                      className="w-full text-left px-6 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 text-indigo-700 border-t border-slate-100"
                    >
                      <Search className="w-4 h-4" />
                      Search for <strong className="ml-1">{searchQuery.toUpperCase()}</strong>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Trending stocks */}
        {!activeSymbol && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5" /> Trending — click to analyze instantly
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {TRENDING_STOCKS.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => handleTagClick(s.symbol)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <span>{s.symbol.includes(".NS") ? "🇮🇳" : "🇺🇸"}</span>
                  {s.symbol}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Empty / Onboarding State ─────────────── */}
      {!activeSymbol && !isAnyLoading && (
        <div className="border-t border-slate-200/60 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-lg font-black text-slate-800 mb-1">What you'll get instantly</h2>
            <p className="text-sm text-slate-400">3 seconds to a complete institutional analysis of any stock.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 max-w-2xl mx-auto justify-center">
            {[
              { n: "1", t: "Enter Ticker",  d: "Any NSE, BSE, NASDAQ, or NYSE symbol" },
              { n: "2", t: "AI Analyzes",   d: "4-factor scoring + chart + sentiment"  },
              { n: "3", t: "Get Thesis",    d: "BUY/HOLD/SELL with full explanation"   },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="step-number shrink-0">{step.n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{step.t}</div>
                  <div className="text-xs text-slate-400">{step.d}</div>
                </div>
                {i < 2 && <div className="hidden sm:block text-slate-200 text-lg mx-2 mt-1">→</div>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_YOU_GET.map((f, i) => (
              <div key={i} className={`flex items-start gap-4 p-5 rounded-xl border ${f.bg}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800 mb-0.5">{f.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Error State ─────────────────────────── */}
      {analysisError && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="font-bold text-red-700 mb-1">Analysis failed for "{activeSymbol}"</div>
          <p className="text-sm text-red-500 max-w-md mx-auto">
            Check the ticker format. NSE/BSE stocks need <strong>.NS</strong> suffix (e.g. <code className="bg-red-100 px-1 rounded">INFY.NS</code>).
            US stocks use plain ticker (e.g. <code className="bg-red-100 px-1 rounded">AAPL</code>).
          </p>
        </div>
      )}

      {/* ── Skeleton Loaders ─────────────────────── */}
      {isAnyLoading && (
        <div className="flex flex-col gap-6 mt-4 animate-pulse">
          <div className="h-[160px] bg-slate-200/60 rounded-2xl" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-[140px] bg-slate-200/60 rounded-2xl" />)}
          </div>
          <div className="h-[520px] bg-slate-200/60 rounded-2xl" />
          <div className="h-[280px] bg-slate-200/60 rounded-2xl" />
        </div>
      )}

      {/* ── Analysis Results ─────────────────────── */}
      {analysisData && !isAnyLoading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 border-t border-slate-200/60 pt-8 flex flex-col gap-8">

          {/* 1. Recommendation — with REAL price */}
          <RecommendationCard
            recommendation={analysisData.recommendation}
            confidence={analysisData.confidence_score}
            symbol={analysisData.symbol}
            currentPrice={currentPrice}
          />

          {/* 2. Score Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">4-Factor AI Score Breakdown</h3>
                <p className="text-xs text-slate-400 mt-0.5">Each factor is scored 0–100. Hover the ⓘ icons for explanations.</p>
              </div>
              <div className="flex gap-3 text-xs">
                {Object.entries(SCORE_TOOLTIPS).map(([key, desc]) => (
                  <div key={key} className="tooltip-container">
                    <div className="flex items-center gap-1 cursor-help text-slate-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="capitalize font-semibold">{key}</span>
                    </div>
                    <div className="tooltip-box w-52">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <ScoreBreakdown
              technical={analysisData.technical_score}
              fundamental={analysisData.fundamental_score}
              sentiment={analysisData.sentiment_score}
              risk={analysisData.risk_score}
            />
          </div>

          {/* 3. Price Chart + Signals */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Price Action & AI Signal Overlay</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Candlestick chart with SMA-50 (blue) and SMA-200 (amber) overlays.
                  {chartSignals.length > 0 && ` ${chartSignals.length} AI signal${chartSignals.length > 1 ? "s" : ""} plotted.`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-700">
                <Zap className="w-3 h-3" />
                {currentPrice > 0
                  ? `Live: ${currentPrice > 500 ? "₹" : "$"}${currentPrice.toFixed(2)}`
                  : "Chart Data"
                }
              </div>
            </div>
            <div className="p-4">
              {historyData?.candles?.length ? (
                <TradingChart
                  candles={historyData.candles}
                  sma50={historyData.sma50}
                  sma200={historyData.sma200}
                  signals={chartSignals}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400 text-sm">No chart data available for this symbol.</div>
              )}
            </div>
          </div>

          {/* 4. Technical Indicators */}
          {historyData && (
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Technical Indicator Panels</h3>
                <p className="text-xs text-slate-400 mt-0.5">Switch tabs. Each panel includes interpretation guides so you know what you're looking at.</p>
              </div>
              <IndicatorTabs
                volume={historyData.volume}
                rsi={historyData.rsi}
                macd={historyData.macd}
              />
            </div>
          )}

          {/* 5. Signal & Sentiment Timelines */}
          {((signalsData && signalsData.length > 0) || (sentimentData && sentimentData.length > 0)) && (
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Signal & Sentiment History</h3>
                <p className="text-xs text-slate-400 mt-0.5">Historical AI trade signals and FinBERT news sentiment over time.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {signalsData && signalsData.length > 0 && <RecommendationTimeline trades={signalsData} />}
                {sentimentData && sentimentData.length > 0 && <SentimentTimeline sentimentData={sentimentData} />}
              </div>
            </div>
          )}

          {/* 6. Factor Contribution + Bull/Bear */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ContributionChart data={analysisData} />
            </div>
            <div className="lg:col-span-2">
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Bull vs Bear Case</h3>
                <p className="text-xs text-slate-400 mt-0.5">AI-ranked reasons for and against. #1 item = most influential factor.</p>
              </div>
              <BullBearCard
                bullCase={analysisData.strengths || []}
                bearCase={analysisData.weaknesses || []}
              />
            </div>
          </div>

          {/* 7. Strengths + Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Key Strengths</h3>
                <p className="text-xs text-slate-400 mt-0.5">Positive signals driving the recommendation.</p>
              </div>
              <StrengthsCard strengths={analysisData.strengths || []} />
            </div>
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Risk Factors</h3>
                <p className="text-xs text-slate-400 mt-0.5">Warnings to weigh before investing.</p>
              </div>
              <RisksCard risks={analysisData.risk_factors || []} />
            </div>
          </div>

          {/* 8. Structured Investment Thesis */}
          <InvestmentThesis
            thesis={analysisData.investment_thesis || ""}
            symbol={analysisData.symbol}
          />

        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading analysis terminal...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
