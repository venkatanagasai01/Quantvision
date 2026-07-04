"use client";

import { useState } from "react";
import { Sparkles, Clock, Briefcase, TrendingUp, TrendingDown, Minus, Zap, HelpCircle } from "lucide-react";
import { PaperTradeModal } from "@/components/trading/PaperTradeModal";

interface RecommendationCardProps {
  recommendation: string;
  confidence: number;
  symbol: string;
  currentPrice?: number;
}

function getSignalMeta(recommendation: string, confidence: number) {
  const rec = recommendation?.toUpperCase() || "HOLD";
  
  if (rec.includes("STRONG BUY") || (rec === "BUY" && confidence >= 80)) {
    return {
      label: "STRONG BUY",
      strengthLabel: "Very High Conviction",
      Icon: TrendingUp,
      gradient: "from-emerald-500/10 via-emerald-50/60 to-white",
      border: "border-emerald-200",
      glow: "shadow-emerald-100",
      textColor: "text-emerald-600",
      barColor: "bg-emerald-500",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      ringColor: "#10b981",
      dot: "bg-emerald-500",
    };
  }
  if (rec === "BUY" || rec.includes("BUY")) {
    return {
      label: "BUY",
      strengthLabel: confidence >= 65 ? "High Conviction" : "Moderate Conviction",
      Icon: TrendingUp,
      gradient: "from-emerald-500/8 via-emerald-50/40 to-white",
      border: "border-emerald-200",
      glow: "shadow-emerald-50",
      textColor: "text-emerald-600",
      barColor: "bg-emerald-500",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      ringColor: "#10b981",
      dot: "bg-emerald-500",
    };
  }
  if (rec.includes("STRONG SELL") || (rec === "SELL" && confidence >= 80)) {
    return {
      label: "STRONG SELL",
      strengthLabel: "Very High Conviction",
      Icon: TrendingDown,
      gradient: "from-red-500/10 via-red-50/60 to-white",
      border: "border-red-200",
      glow: "shadow-red-100",
      textColor: "text-red-600",
      barColor: "bg-red-500",
      badgeBg: "bg-red-100 text-red-800 border-red-200",
      ringColor: "#ef4444",
      dot: "bg-red-500",
    };
  }
  if (rec === "SELL" || rec.includes("SELL")) {
    return {
      label: "SELL",
      strengthLabel: confidence >= 65 ? "High Conviction" : "Moderate Conviction",
      Icon: TrendingDown,
      gradient: "from-red-500/8 via-red-50/40 to-white",
      border: "border-red-200",
      glow: "shadow-red-50",
      textColor: "text-red-600",
      barColor: "bg-red-500",
      badgeBg: "bg-red-100 text-red-800 border-red-200",
      ringColor: "#ef4444",
      dot: "bg-red-500",
    };
  }
  return {
    label: "HOLD",
    strengthLabel: "Neutral Outlook",
    Icon: Minus,
    gradient: "from-amber-500/8 via-amber-50/30 to-white",
    border: "border-amber-200",
    glow: "shadow-amber-50",
    textColor: "text-amber-600",
    barColor: "bg-amber-400",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    ringColor: "#f59e0b",
    dot: "bg-amber-400",
  };
}

function ConfidenceBand({ confidence }: { confidence: number }) {
  const bands = [
    { min: 0,  max: 40, label: "Weak",     color: "bg-red-400"   },
    { min: 40, max: 60, label: "Moderate",  color: "bg-amber-400" },
    { min: 60, max: 80, label: "High",      color: "bg-blue-400"  },
    { min: 80, max: 101,label: "Very High", color: "bg-emerald-500"},
  ];
  const current = bands.find(b => confidence >= b.min && confidence < b.max) || bands[3];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
      current.label === "Very High" ? "bg-emerald-100 text-emerald-700" :
      current.label === "High"      ? "bg-blue-100 text-blue-700" :
      current.label === "Moderate"  ? "bg-amber-100 text-amber-700" :
                                      "bg-red-100 text-red-700"
    }`}>
      {current.label} Confidence
    </span>
  );
}

export function RecommendationCard({ recommendation, confidence, symbol, currentPrice = 0 }: RecommendationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const meta = getSignalMeta(recommendation, confidence);
  const { Icon } = meta;

  const isBullish = meta.label.includes("BUY");
  const isBearish = meta.label.includes("SELL");

  return (
    <>
      <div className={`relative bg-gradient-to-br ${meta.gradient} border ${meta.border} rounded-2xl shadow-lg ${meta.glow} overflow-hidden`}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

            {/* ── Left: Signal ──────────────────────────── */}
            <div className="flex flex-col gap-3">
              {/* Label row */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-lg shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">AI Consensus · {symbol}</span>
                </div>
                <ConfidenceBand confidence={confidence} />
              </div>

              {/* Main signal */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                  isBullish ? "bg-emerald-500" : isBearish ? "bg-red-500" : "bg-amber-400"
                }`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className={`text-4xl lg:text-5xl font-black tracking-tight leading-none ${meta.textColor}`}>
                    {meta.label}
                  </h2>
                  <p className="text-sm text-slate-500 font-semibold mt-1">{meta.strengthLabel}</p>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap mt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Analyzed just now</span>
                </div>
                {currentPrice > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/70 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Zap className="w-3 h-3 text-indigo-500" />
                    Market Price: <span className="font-mono ml-1">
                      {currentPrice > 500 ? `₹${currentPrice.toFixed(2)}` : `$${currentPrice.toFixed(2)}`}
                    </span>
                  </div>
                )}
                {/* Trade button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                    isBullish ? "bg-emerald-600 hover:bg-emerald-700" :
                    isBearish ? "bg-red-600 hover:bg-red-700" :
                    "bg-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Trade this Signal
                </button>
              </div>
            </div>

            {/* ── Right: Confidence Meter ─────────────────── */}
            <div className="w-full lg:w-72 bg-white/70 backdrop-blur-sm border border-slate-200/40 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Signal Strength</span>
                  <div className="tooltip-container">
                    <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
                    <div className="tooltip-box w-52">How confident the AI is in this recommendation. Above 80 = very strong signal. Below 40 = weak / uncertain.</div>
                  </div>
                </div>
                <span className={`text-2xl font-black ${meta.textColor}`}>{confidence}<span className="text-sm font-semibold text-slate-400">/100</span></span>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${meta.barColor}`}
                  style={{ width: `${confidence}%` }}
                />
                {/* 40 / 60 / 80 tick marks */}
                {[40, 60, 80].map(v => (
                  <div key={v} className="absolute top-0 bottom-0 w-px bg-white/60" style={{ left: `${v}%` }} />
                ))}
              </div>

              {/* Scale labels */}
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                <span>Weak</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Very High</span>
              </div>

              {/* Interpretation */}
              <div className={`text-xs font-semibold px-3 py-2 rounded-lg border ${meta.badgeBg}`}>
                {confidence >= 80 && `AI is highly confident in this ${meta.label} call. Strong cross-factor alignment.`}
                {confidence >= 60 && confidence < 80 && `Good signal with reasonable conviction. Most factors point ${isBullish ? "bullish" : isBearish ? "bearish" : "neutral"}.`}
                {confidence >= 40 && confidence < 60 && "Mixed signals detected. Consider waiting for a cleaner setup."}
                {confidence < 40 && "Low conviction signal. High uncertainty — treat with caution."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaperTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        symbol={symbol}
        recommendation={recommendation}
        currentPrice={currentPrice}
      />
    </>
  );
}
