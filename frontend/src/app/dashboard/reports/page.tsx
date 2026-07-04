"use client";

import { useState } from "react";
import { Loader2, Plus, FileText, Brain, BarChart3, TrendingUp, ShieldCheck, Info, HelpCircle } from "lucide-react";
import ReportsTable from "@/components/reports/ReportsTable";
import { useGenerateReport } from "@/hooks/useReports";
import { useRouter } from "next/navigation";

const REPORT_INCLUDES = [
  { icon: Brain,       title: "AI Recommendation",    desc: "BUY / HOLD / SELL with confidence score" },
  { icon: BarChart3,   title: "Score Breakdown",       desc: "Technical, Fundamental, Sentiment, Risk" },
  { icon: TrendingUp,  title: "Price Chart",           desc: "Candlestick chart with SMA overlays" },
  { icon: FileText,    title: "Investment Thesis",     desc: "Full written AI analysis" },
  { icon: ShieldCheck, title: "Risk Factors",          desc: "Key risks and bull/bear case" },
];

export default function ReportsPage() {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const generateReport = useGenerateReport();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    try {
      const result = await generateReport.mutateAsync(symbol.trim().toUpperCase());
      setSymbol("");
      router.push(`/dashboard/reports/${result.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to generate report. Check the ticker and try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans pb-10">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Research Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate one-click, institutional-grade stock analysis reports. Each report is a permanent, shareable deep-dive.
          </p>
        </div>

        {/* Generate Form */}
        <form onSubmit={handleGenerate} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <input
              id="report-symbol"
              type="text"
              placeholder="e.g. NVDA or INFY.NS"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-sm bg-white uppercase placeholder:normal-case placeholder:text-slate-400 transition-all"
            />
          </div>
          <button
            id="generate-report-btn"
            type="submit"
            disabled={generateReport.isPending || !symbol.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {generateReport.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Plus className="w-4 h-4" /> Generate</>
            )}
          </button>
        </form>
      </div>

      {/* ── What's Inside a Report ───────────────────── */}
      <div className="info-banner">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-bold text-indigo-900 text-sm mb-0.5">What's inside each report?</div>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Enter any stock ticker and click Generate. Our AI runs a full analysis and creates a permanent, detailed report that includes:
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {REPORT_INCLUDES.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/60 border border-indigo-100 px-3 py-2 rounded-lg">
              <item.icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-indigo-900">{item.title}</div>
                <div className="text-[10px] text-indigo-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reports Table ────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">All Generated Reports</h2>
          <div className="tooltip-container">
            <HelpCircle className="w-3 h-3 text-slate-300 cursor-help" />
            <div className="tooltip-box w-56">Click any report to open the full detailed analysis. Reports are stored permanently.</div>
          </div>
        </div>
        <ReportsTable />
      </div>

    </div>
  );
}
