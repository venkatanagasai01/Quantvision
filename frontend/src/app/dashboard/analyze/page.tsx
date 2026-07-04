"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Search, Sparkles, TrendingUp, History, HelpCircle, Brain, BarChart3, ShieldCheck, Zap, ArrowRight } from "lucide-react";
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

// ─── Feature preview cards shown in empty state ───────────────
const WHAT_YOU_GET = [
  {
    icon: Brain,
    title: "4-Factor AI Score",
    desc: "Technical + Fundamental + Sentiment + Risk scored 0–100.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 border-indigo-100",
  },
  {
    icon: TrendingUp,
    title: "Price Chart + Signals",
    desc: "Candlestick chart with SMA-50, SMA-200 overlays and AI BUY/SELL markers.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-100",
  },
  {
    icon: BarChart3,
    title: "RSI, MACD & Volume",
    desc: "Key indicator panels below the main chart, tab-switchable.",
    color: "text-violet-500",
    bg: "bg-violet-50 border-violet-100",
  },
  {
    icon: ShieldCheck,
    title: "Bull / Bear Case",
    desc: "AI-generated strengths and risk factors with plain-English explanations.",
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-100",
  },
  {
    icon: Zap,
    title: "FinBERT Sentiment",
    desc: "Real-time news sentiment analysis using a finance-tuned NLP model.",
    color: "text-sky-500",
    bg: "bg-sky-50 border-sky-100",
  },
  {
    icon: Sparkles,
    title: "Investment Thesis",
    desc: "A full written AI thesis summarising whether to BUY, HOLD, or SELL.",
    color: "text-pink-500",
    bg: "bg-pink-50 border-pink-100",
  },
];

const TRENDING_STOCKS = [
  { symbol: "TCS.NS",       name: "Tata Consultancy" },
  { symbol: "INFY.NS",      name: "Infosys" },
  { symbol: "RELIANCE.NS",  name: "Reliance Industries" },
  { symbol: "HDFCBANK.NS",  name: "HDFC Bank" },
  { symbol: "AAPL",         name: "Apple" },
  { symbol: "NVDA",         name: "NVIDIA" },
  { symbol: "TSLA",         name: "Tesla" },
];

// ─── Score tooltip map ─────────────────────────────────────────
const SCORE_TOOLTIPS: Record<string, string> = {
  technical:    "Based on RSI, MACD, Bollinger Bands, moving averages, and volume patterns. Higher = stronger technical setup.",
  fundamental:  "Based on P/E ratio, EPS growth, ROE, debt-to-equity, and revenue trends. Higher = stronger fundamentals.",
  sentiment:    "FinBERT NLP score from recent financial news. Positive news = higher score. Real-time market mood.",
  risk:         "Risk score (lower = safer). Based on volatility, Beta, drawdown, and sector risk. A high score means high risk.",
};

function AnalysisContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "";

  const [searchQuery, setSearchQuery] = useState(initialSymbol);
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken;
  const { data: analysisData, isLoading: analysisLoading, isError: analysisError } = useStockAnalysis(activeSymbol, token);
  const { data: historyData, isLoading: historyLoading } = useHistoricalData(activeSymbol, token);
  const { data: signalsData, isLoading: signalsLoading } = useBacktestSignals(activeSymbol, token);
  const { data: sentimentData, isLoading: sentimentLoading } = useSentimentData(activeSymbol, token);

  const isAnyLoading = analysisLoading || historyLoading || signalsLoading || sentimentLoading;

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

      {/* ── Header & Search ──────────────────────────── */}
      <div className="flex flex-col items-center justify-center text-center mt-4">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Institutional Analysis Terminal</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          Enter any NSE, BSE, or US ticker to get deep AI-powered technical, fundamental, and sentiment analysis — all in one place.
        </p>

        {/* ── Search Bar ──────────────────────────────── */}
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
              onChange={(e) => {
                setSearchQuery(e.target.value.toUpperCase());
                setShowDropdown(true);
              }}
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
              {isAnyLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Analyze <ArrowRight className="w-3.5 h-3.5" /></>
              )}
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

        {/* ── Trending Stocks ──────────────────────── */}
        {!activeSymbol && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5" /> Trending — click to analyze
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {TRENDING_STOCKS.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => handleTagClick(s.symbol)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <span className="text-base">{s.symbol.includes(".NS") ? "🇮🇳" : "🇺🇸"}</span>
                  {s.symbol}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── "How it Works" Steps (no symbol yet) ────── */}
      {!activeSymbol && !isAnyLoading && (
        <div className="border-t border-slate-200/60 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-lg font-black text-slate-800 mb-1">What you'll get</h2>
            <p className="text-sm text-slate-400">3 seconds to a complete institutional analysis of any stock.</p>
          </div>

          {/* Steps */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 max-w-2xl mx-auto justify-center">
            {[
              { n: "1", t: "Enter Ticker", d: "Any NSE, BSE, NASDAQ, or NYSE symbol" },
              { n: "2", t: "AI Analyzes",  d: "4-factor scoring + chart + sentiment" },
              { n: "3", t: "Get Thesis",   d: "BUY/HOLD/SELL with full explanation" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="step-number shrink-0">{step.n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{step.t}</div>
                  <div className="text-xs text-slate-400">{step.d}</div>
                </div>
                {i < 2 && <div className="hidden sm:block text-slate-200 text-lg font-light mx-2 mt-1">→</div>}
              </div>
            ))}
          </div>

          {/* Feature Cards */}
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

      {/* ── Error State ──────────────────────────────── */}
      {analysisError && (
        <div className="bg-red-50 text-red-700 p-5 rounded-xl text-center font-medium border border-red-100">
          <div className="text-xl mb-2">⚠️</div>
          <div className="font-bold mb-1">Analysis failed for "{activeSymbol}"</div>
          <p className="text-sm text-red-500">Check the ticker format. NSE stocks need ".NS" suffix (e.g. <strong>INFY.NS</strong>). US stocks use plain ticker (e.g. <strong>AAPL</strong>).</p>
        </div>
      )}

      {/* ── Skeleton Loaders ─────────────────────────── */}
      {isAnyLoading && (
        <div className="flex flex-col gap-6 mt-4 animate-pulse">
          <div className="h-[140px] bg-slate-200/60 rounded-xl w-full" />
          <div className="h-[80px] bg-slate-200/60 rounded-xl w-full" />
          <div className="h-[420px] bg-slate-200/60 rounded-xl w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[200px] bg-slate-200/60 rounded-xl" />
            <div className="h-[200px] bg-slate-200/60 rounded-xl" />
          </div>
        </div>
      )}

      {/* ── Analysis Results ─────────────────────────── */}
      {analysisData && !isAnyLoading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-2 border-t border-slate-200/60 pt-8 flex flex-col gap-8">

          <RecommendationCard
            recommendation={analysisData.recommendation}
            confidence={analysisData.confidence_score}
            symbol={analysisData.symbol}
          />

          {/* Score breakdown with section explanation */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">4-Factor AI Score Breakdown</h3>
                <p className="text-xs text-slate-400 mt-0.5">Each factor is scored 0–100. Hover the info icons for what each score means.</p>
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

          {/* Charts */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-1 px-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Price Action & Overlays</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-orange-400 inline-block" /> SMA-50</span>
                  <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-400 inline-block" /> SMA-200</span>
                  <span className="flex items-center gap-1">🟢 BUY signal</span>
                  <span className="flex items-center gap-1">🔴 SELL signal</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4 px-2">Candlestick chart with moving averages. AI-generated trade signals marked on chart.</p>
              {historyData?.candles ? (
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

            {historyData && (
              <div>
                <div className="mb-2 px-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Technical Indicators</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Switch tabs to view Volume, RSI (momentum), and MACD (trend direction).</p>
                </div>
                <IndicatorTabs
                  volume={historyData.volume}
                  rsi={historyData.rsi}
                  macd={historyData.macd}
                />
              </div>
            )}

            {((signalsData && signalsData.length > 0) || (sentimentData && sentimentData.length > 0)) && (
              <div>
                <div className="mb-2 px-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Signal & Sentiment History</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Timeline of AI trade signals and FinBERT news sentiment over time.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {signalsData && signalsData.length > 0 && (
                    <RecommendationTimeline trades={signalsData} />
                  )}
                  {sentimentData && sentimentData.length > 0 && (
                    <SentimentTimeline sentimentData={sentimentData} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bull/Bear & Contribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Factor Contribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">How much each factor influenced the final AI score.</p>
              </div>
              <ContributionChart data={analysisData} />
            </div>
            <div className="lg:col-span-2">
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Bull vs Bear Case</h3>
                <p className="text-xs text-slate-400 mt-0.5">AI-generated reasons for and against investing in this stock.</p>
              </div>
              <BullBearCard
                bullCase={analysisData.strengths || []}
                bearCase={analysisData.weaknesses || []}
              />
            </div>
          </div>

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
                <p className="text-xs text-slate-400 mt-0.5">Warnings to consider before investing.</p>
              </div>
              <RisksCard risks={analysisData.risk_factors || []} />
            </div>
          </div>

          {/* AI Investment Thesis */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-xl shadow-sm p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">AI Investment Thesis</h3>
                <p className="text-xs text-slate-400 mt-0.5">Full written analysis summarising the AI's reasoning — like a mini analyst report.</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {analysisData.investment_thesis || "No thesis generated for this symbol."}
            </p>
          </div>

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
