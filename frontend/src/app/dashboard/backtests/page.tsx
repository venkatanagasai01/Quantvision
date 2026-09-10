"use client";

import { useState } from "react";
import { Plus, Search, Info, HelpCircle, BarChart3, TrendingUp, Target } from "lucide-react";
import { useBacktests } from "@/hooks/useBacktests";
import { BacktestTable } from "@/components/backtesting/BacktestTable";
import { RunBacktestDialog } from "@/components/backtesting/RunBacktestDialog";

export default function BacktestsIndexPage() {
  const [page, setPage] = useState(1);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useBacktests(page, 20, activeSymbol);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSymbol(searchSymbol.toUpperCase());
    setPage(1);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 font-sans pb-10">

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Quantitative Backtests
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Simulate trading strategies on <strong className="text-slate-300">years of historical data</strong>. See exactly how your strategy would have performed — before risking any capital.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Run New Backtest
        </button>
      </div>

      {/* ── What Is Backtesting Banner ───────────────── */}
      <div className="info-banner flex items-start gap-4 bg-[#0B1120] border border-white/5 rounded-2xl p-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div className="font-bold text-indigo-300 text-sm mb-1">What is a Backtest?</div>
          <p className="text-sm text-indigo-400 leading-relaxed">
            A backtest replays a trading strategy on <strong>past market data</strong> to measure how it would have performed.
            You pick a stock and time range — the AI simulates BUY/SELL signals and calculates your theoretical returns.
            Key metrics to look for:
          </p>
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { label: "Total Return",    desc: "% gain or loss on initial capital",         color: "text-indigo-400" },
              { label: "Sharpe Ratio",    desc: ">1 = good risk-adjusted return",            color: "text-emerald-400" },
              { label: "Max Drawdown",    desc: "Worst peak-to-trough % loss",               color: "text-red-400" },
              { label: "Win Rate",        desc: "% of trades that were profitable",          color: "text-slate-300" },
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="tooltip-container">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-300 cursor-help mt-0.5" />
                  <div className="tooltip-box w-44">{m.desc}</div>
                </div>
                <div>
                  <div className={`text-xs font-black ${m.color}`}>{m.label}</div>
                  <div className="text-[10px] text-indigo-500">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Table Card ──────────────────────────── */}
      <div className="bg-[#0B1120] border border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[520px]">

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <form onSubmit={handleSearch} className="relative w-full max-w-xs flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Filter by symbol..."
              className="w-full pl-9 pr-4 py-2 bg-[#0B1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </form>
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {data?.total || 0} Total Runs
            </div>
            <div className="tooltip-container">
              <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
              <div className="tooltip-box w-52">Click "Run New Backtest" to simulate a strategy. Each run generates a full performance report.</div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!isLoading && !data?.items.length && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">No backtests yet</h3>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              Click <strong className="text-slate-300">Run New Backtest</strong> above to simulate your first trading strategy.
              Pick a stock symbol, select a date range, and the AI will calculate performance metrics.
            </p>
            <div className="flex flex-col items-start gap-3 bg-white/5 rounded-xl p-5 border border-white/10 text-left max-w-xs">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Quick Start</div>
              {[
                { n: "1", t: 'Click "Run New Backtest"' },
                { n: "2", t: "Enter a ticker (e.g. TCS.NS)" },
                { n: "3", t: "Pick start & end dates" },
                { n: "4", t: "Hit Run and see your results" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="step-number bg-white/10 text-slate-400 border border-white/10 rounded-md w-6 h-6 flex items-center justify-center text-xs font-bold">{s.n}</div>
                  <span className="text-slate-300 font-medium">{s.t}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Run First Backtest
            </button>
          </div>
        )}

        {/* Table */}
        {(isLoading || data?.items.length > 0) && (
          <div className="flex-1">
            <BacktestTable backtests={data?.items || []} isLoading={isLoading} />
          </div>
        )}

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/5">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-1.5 bg-[#0B1120] border border-white/10 rounded-lg text-sm font-bold text-slate-300 disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm font-semibold text-slate-400">Page {page} of {Math.ceil(data.total / 20)}</span>
            <button
              disabled={data.items.length < 20}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-1.5 bg-[#0B1120] border border-white/10 rounded-lg text-sm font-bold text-slate-300 disabled:opacity-50 hover:bg-white/10 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <RunBacktestDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
