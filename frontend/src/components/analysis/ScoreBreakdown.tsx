"use client";

import { BarChart3, Fingerprint, ShieldAlert, Activity, HelpCircle } from "lucide-react";

interface ScoreBreakdownProps {
  technical: number;
  fundamental: number;
  risk: number;
  sentiment?: number;
}

function getGrade(score: number, inverse: boolean = false): {
  label: string;
  color: string;
  bg: string;
  ring: string;
  glow: string;
  desc: string;
} {
  const s = inverse ? (100 - score) : score;
  if (s >= 80) return {
    label: "Excellent",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
    ring: "#10b981",
    glow: "shadow-emerald-100",
    desc: "Exceptional signal strength.",
  };
  if (s >= 65) return {
    label: "Strong",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    ring: "#3b82f6",
    glow: "shadow-blue-100",
    desc: "Solid fundamentals/signals.",
  };
  if (s >= 45) return {
    label: "Fair",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    ring: "#f59e0b",
    glow: "shadow-amber-100",
    desc: "Mixed signals — watch closely.",
  };
  if (s >= 25) return {
    label: "Weak",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-100",
    ring: "#f97316",
    glow: "shadow-orange-100",
    desc: "Significant concerns detected.",
  };
  return {
    label: "Poor",
    color: "text-red-600",
    bg: "bg-red-50 border-red-100",
    ring: "#ef4444",
    glow: "shadow-red-100",
    desc: "Major red flags present.",
  };
}

interface ScoreCardProps {
  score: number | undefined | null;
  icon: any;
  title: string;
  shortDesc: string;
  longDesc: string;
  inverse?: boolean;
}

function ScoreCard({ score, icon: Icon, title, shortDesc, longDesc, inverse = false }: ScoreCardProps) {
  const val = score ?? null;
  const safeVal = val ?? 0;
  const grade = val !== null ? getGrade(safeVal, inverse) : null;

  const radius = 30;
  const strokeWidth = 6;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const fillRatio = val !== null ? (inverse ? (100 - safeVal) / 100 : safeVal / 100) : 0;
  const offset = circumference - fillRatio * circumference;

  return (
    <div className={`relative bg-white border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${grade ? `${grade.bg} ${grade.glow}` : "border-slate-200"}`}>
      {/* Top colour strip */}
      {grade && (
        <div className="h-1 w-full" style={{ background: grade.ring }} />
      )}

      <div className="p-5 flex flex-col gap-4">
        {/* Icon + title */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${grade?.bg || "bg-slate-50 border border-slate-100"}`}>
            <Icon className={`w-4 h-4 ${grade?.color || "text-slate-400"}`} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-700 uppercase tracking-wider">{title}</div>
            <div className="text-[10px] text-slate-400 font-medium">{shortDesc}</div>
          </div>
          <div className="ml-auto tooltip-container">
            <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
            <div className="tooltip-box w-52">{longDesc}</div>
          </div>
        </div>

        {/* Circle progress + grade */}
        <div className="flex items-center justify-between">
          {/* SVG ring */}
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
              {/* Track */}
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none"
              />
              {/* Fill */}
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                stroke={grade?.ring || "#e2e8f0"}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={val !== null ? offset : circumference}
                style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
              />
            </svg>
            {/* Score number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-black leading-none ${grade?.color || "text-slate-400"}`}>
                {val !== null ? safeVal : "–"}
              </span>
              {val !== null && (
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">/100</span>
              )}
            </div>
          </div>

          {/* Grade + bar */}
          <div className="flex-1 ml-4 flex flex-col gap-2">
            {grade ? (
              <>
                <span className={`text-sm font-black ${grade.color}`}>{grade.label}</span>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${fillRatio * 100}%`,
                      background: grade.ring,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium leading-snug">{grade.desc}</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">No data</span>
            )}
          </div>
        </div>

        {/* Inverse note for risk */}
        {inverse && val !== null && (
          <div className="text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-2">
            ⚠️ Risk score: lower is safer. Score of {safeVal} means {safeVal < 30 ? "low risk environment" : safeVal < 60 ? "moderate risk" : "high risk — be cautious"}.
          </div>
        )}
      </div>
    </div>
  );
}

export function ScoreBreakdown({ technical, fundamental, risk, sentiment }: ScoreBreakdownProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <ScoreCard
        score={technical}
        icon={BarChart3}
        title="Technical"
        shortDesc="Momentum & trend signals"
        longDesc="Composite of RSI, MACD, Bollinger Bands, SMA crossovers, and volume patterns. Higher = stronger bullish technical setup."
        inverse={false}
      />
      <ScoreCard
        score={fundamental}
        icon={Fingerprint}
        title="Fundamental"
        shortDesc="Financial health & valuation"
        longDesc="Based on P/E ratio, EPS growth rate, Return on Equity (ROE), Debt-to-Equity ratio, and revenue trend. Higher = stronger business fundamentals."
        inverse={false}
      />
      <ScoreCard
        score={sentiment}
        icon={Activity}
        title="Sentiment"
        shortDesc="FinBERT NLP news analysis"
        longDesc="Real-time news sentiment from FinBERT, a finance-tuned NLP model. Higher = positive market sentiment. Score updates with latest headlines."
        inverse={false}
      />
      <ScoreCard
        score={risk}
        icon={ShieldAlert}
        title="Risk"
        shortDesc="Volatility & downside risk"
        longDesc="Based on Beta (market sensitivity), historical volatility, max drawdown, and sector risk factors. LOWER score = SAFER — this scale is inverted."
        inverse={true}
      />
    </div>
  );
}
