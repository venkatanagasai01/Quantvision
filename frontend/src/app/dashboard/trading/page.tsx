"use client";

import { useState } from "react";
import { PortfolioSummary } from "@/components/trading/PortfolioSummary";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { OrdersTable } from "@/components/trading/OrdersTable";
import { TradeHistoryTable } from "@/components/trading/TradeHistoryTable";
import { Briefcase, Activity, Clock, ListOrdered, Info, X, HelpCircle, TrendingUp } from "lucide-react";

export default function PaperTradingPage() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-10 font-sans">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            Paper Trading Terminal
          </h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xl">
            Simulate real market trades with <strong className="text-slate-700">₹10,00,000 virtual capital</strong>. Practice strategies, track P&L, and build confidence — with zero financial risk.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-semibold text-xs">Simulated Trading Active</span>
          </div>
        </div>
      </div>

      {/* ── Info Banner ──────────────────────────────── */}
      {showBanner && (
        <div className="info-banner flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-bold text-indigo-900 text-sm mb-1">How Paper Trading Works</div>
              <p className="text-sm text-indigo-700 leading-relaxed">
                Paper trading uses <strong>real market prices</strong> but <strong>fake virtual money</strong>. You start with ₹10,00,000 (₹10 Lakh).
                Go to <strong>Analyze</strong> any stock, then place a BUY or SELL order — it gets recorded here instantly.
                Track your Open Positions, watch your P&L, and review your Trade History to learn what works.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                {[
                  { label: "Starting Capital", value: "₹10,00,000", color: "text-indigo-700" },
                  { label: "Risk",             value: "Zero",        color: "text-emerald-700" },
                  { label: "Prices",           value: "Real Market", color: "text-slate-700" },
                  { label: "Orders",           value: "Instant Fill",color: "text-slate-700" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-base font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-indigo-500 font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-indigo-300 hover:text-indigo-600 transition-colors p-1 shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Portfolio Summary ────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Portfolio Summary</h2>
          <div className="tooltip-container">
            <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
            <div className="tooltip-box w-56">
              Summary of your virtual portfolio. Net P&L is unrealised (open positions) + realised (closed trades).
            </div>
          </div>
        </div>
        <PortfolioSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left Column ──────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Open Positions */}
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Open Positions
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Stocks you currently own in your virtual portfolio.</p>
                </div>
                <div className="tooltip-container">
                  <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                  <div className="tooltip-box w-60">
                    Open positions are trades you've BUY'd but not yet SELL'd. P&L updates with live market price. Green = profitable, Red = loss.
                  </div>
                </div>
              </div>
            </div>
            <PositionsTable />
          </section>

          {/* Trade History */}
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Trade History
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">All completed (closed) trades with final P&L.</p>
                </div>
                <div className="tooltip-container">
                  <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                  <div className="tooltip-box w-56">
                    Closed trades. Realised P&L = difference between your buy price and sell price × quantity.
                  </div>
                </div>
              </div>
            </div>
            <TradeHistoryTable />
          </section>
        </div>

        {/* ── Right Column ─────────────────────────── */}
        <div className="flex flex-col gap-8">

          {/* Quick Guide */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">How to Place a Trade</h3>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { n: "1", t: "Find a Stock", d: "Go to Analyze, search any ticker, and run the AI analysis." },
                { n: "2", t: "Get the Signal", d: "Check the BUY / HOLD / SELL recommendation + confidence score." },
                { n: "3", t: "Place Order",   d: "Use the order form on the Analyze page to BUY or SELL." },
                { n: "4", t: "Track Here",    d: "Your position appears in Open Positions. Monitor your P&L live." },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="step-number shrink-0">{s.n}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{s.t}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders */}
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-slate-600" />
                    Recent Orders
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Orders submitted (filled / pending).</p>
                </div>
                <div className="tooltip-container">
                  <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                  <div className="tooltip-box w-52">
                    Paper orders fill instantly at the last known market price. No slippage simulation in this version.
                  </div>
                </div>
              </div>
            </div>
            <OrdersTable />
          </section>
        </div>
      </div>
    </div>
  );
}
