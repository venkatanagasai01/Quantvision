"use client";

import { useState } from "react";
import { Search, Sparkles, TrendingUp, History } from "lucide-react";
import { useStockAnalysis } from "@/hooks/useAnalysis";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { useBacktestSignals, useSentimentData } from "@/hooks/useDataStreams";

import { RecommendationCard } from "@/components/analysis/RecommendationCard";
import { ContributionChart } from "@/components/analysis/ContributionChart";
import { StrengthsCard } from "@/components/analysis/StrengthsCard";
import { RisksCard } from "@/components/analysis/RisksCard";
import { BullBearCard } from "@/components/analysis/BullBearCard";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";

// Institutional Charts
import { TradingChart } from "@/components/charts/TradingChart";
import { IndicatorTabs } from "@/components/charts/IndicatorTabs";
import { RecommendationTimeline } from "@/components/charts/RecommendationTimeline";
import { SentimentTimeline } from "@/components/charts/SentimentTimeline";
import { INDIAN_STOCKS } from "@/constants/stocks";

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("");

  const { data: analysisData, isLoading: analysisLoading, isError: analysisError } = useStockAnalysis(activeSymbol);
  const { data: historyData, isLoading: historyLoading } = useHistoricalData(activeSymbol);
  const { data: signalsData, isLoading: signalsLoading } = useBacktestSignals(activeSymbol);
  const { data: sentimentData, isLoading: sentimentLoading } = useSentimentData(activeSymbol);

  const trendingStocks = ["TCS.NS", "INFY.NS", "RELIANCE.NS", "HDFCBANK.NS"];
  const recentSearches = ["AAPL", "NVDA", "TSLA"];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setActiveSymbol(searchQuery.toUpperCase());
  };

  const handleTagClick = (symbol: string) => {
    setSearchQuery(symbol);
    setActiveSymbol(symbol);
  };

  const isAnyLoading = analysisLoading || historyLoading || signalsLoading || sentimentLoading;

  // Format signals for lightweight charts
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
      ).slice(0, 10) // Limit to 10 suggestions to keep UI clean
    : [];

  const [showDropdown, setShowDropdown] = useState(false);

  // We place the form and dropdown logic here
  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-10 font-sans pb-10 px-4 xl:px-0">
      
      {/* Header & Search Section */}
      <div className="flex flex-col items-center justify-center text-center mt-6">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-6">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Institutional Trading Terminal</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm">
          Enter a ticker to aggregate deep technicals, fundamentals, and real-time FinBERT sentiment into an actionable trading thesis.
        </p>

        {/* Search Bar */}
        <div className="mt-8 w-full max-w-2xl relative">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!searchQuery) return;
            setActiveSymbol(searchQuery.toUpperCase());
            setShowDropdown(false);
          }} className="relative flex items-center shadow-sm z-10">
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
              placeholder="Enter ANY symbol (e.g. AAPL, INFY.NS)..." 
              className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200/60 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
            />
            <button 
              type="submit" 
              disabled={isAnyLoading || !searchQuery}
              className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isAnyLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Analyze"
              )}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-2 text-left">
              <ul className="py-2">
                {filteredStocks.map((stock) => (
                  <li key={stock.symbol}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(stock.symbol);
                        setActiveSymbol(stock.symbol);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-6 py-3 hover:bg-slate-50 transition-colors flex flex-col group"
                    >
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{stock.symbol}</span>
                      <span className="text-sm text-slate-500">{stock.name}</span>
                    </button>
                  </li>
                ))}
                
                {/* Always allow searching the exact typed ticker */}
                {filteredStocks.length === 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSymbol(searchQuery.toUpperCase());
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-6 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 text-indigo-700"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search for <strong>{searchQuery.toUpperCase()}</strong></span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {analysisError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100 animate-in fade-in">
          Failed to load analysis for {activeSymbol}. Please check if the ticker is correct.
        </div>
      )}

      {/* Feature 9: Skeleton Loaders */}
      {isAnyLoading && (
        <div className="flex flex-col gap-6 mt-4 animate-pulse">
          <div className="h-[200px] bg-slate-200/60 rounded-xl w-full"></div>
          <div className="h-[400px] bg-slate-200/60 rounded-xl w-full"></div>
          <div className="h-[300px] bg-slate-200/60 rounded-xl w-full"></div>
        </div>
      )}

      {/* Analysis Results (Live Data) */}
      {analysisData && !isAnyLoading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4 border-t border-slate-200/60 pt-10 flex flex-col gap-8">
          
          <RecommendationCard 
            recommendation={analysisData.recommendation} 
            confidence={analysisData.confidence_score} 
            symbol={analysisData.symbol} 
          />

          <ScoreBreakdown 
            technical={analysisData.technical_score}
            fundamental={analysisData.fundamental_score}
            sentiment={analysisData.sentiment_score}
            risk={analysisData.risk_score}
          />

          {/* Institutional Layout Charts */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 px-2">Price Action & Overlays</h3>
              {historyData?.candles ? (
                <TradingChart 
                  candles={historyData.candles} 
                  sma50={historyData.sma50} 
                  sma200={historyData.sma200}
                  signals={chartSignals}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400">No chart data available</div>
              )}
            </div>

            {historyData && (
              <IndicatorTabs 
                volume={historyData.volume}
                rsi={historyData.rsi}
                macd={historyData.macd}
              />
            )}

            {/* Only show timelines when data is available */}
            {((signalsData && signalsData.length > 0) || (sentimentData && sentimentData.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {signalsData && signalsData.length > 0 && (
                  <RecommendationTimeline trades={signalsData} />
                )}
                {sentimentData && sentimentData.length > 0 && (
                  <SentimentTimeline sentimentData={sentimentData} />
                )}
              </div>
            )}
          </div>

          {/* Explainability Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            <div className="lg:col-span-1">
              <ContributionChart data={analysisData} />
            </div>
            <div className="lg:col-span-2">
              <BullBearCard 
                bullCase={analysisData.strengths || []} 
                bearCase={analysisData.weaknesses || []} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <StrengthsCard strengths={analysisData.strengths || []} />
            <RisksCard risks={analysisData.risk_factors || []} />
          </div>

          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-8 mt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">AI Investment Thesis</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {analysisData.investment_thesis || "No thesis generated."}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
