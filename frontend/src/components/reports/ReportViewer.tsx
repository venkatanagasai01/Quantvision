"use client";

import { CheckCircle2, AlertTriangle, ShieldAlert, TrendingUp, Info } from "lucide-react";

interface ReportViewerProps {
  reportData: any;
}

export default function ReportViewer({ reportData }: ReportViewerProps) {
  if (!reportData) return null;

  const {
    symbol,
    recommendation,
    confidence_score,
    technical_score,
    fundamental_score,
    risk_score,
    strengths,
    weaknesses,
    investment_thesis,
    risk_factors
  } = reportData;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRecColor = (rec: string) => {
    if (rec === "BUY") return "bg-emerald-600 text-white";
    if (rec === "SELL") return "bg-red-600 text-white";
    return "bg-amber-500 text-white";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="report-content">
      {/* Report Header */}
      <div className="px-8 py-10 border-b border-slate-200 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-1">
                Quantan AI Institutional Research
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {symbol}
              </h1>
            </div>
            <div className={`px-6 py-2 rounded-full font-bold tracking-widest uppercase shadow-sm ${getRecColor(recommendation)}`}>
              {recommendation} SIGNAL
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Confidence</div>
              <div className="text-2xl font-bold text-slate-900">{confidence_score}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Technical</div>
              <div className="text-2xl font-bold text-slate-900">{technical_score?.toFixed(1)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fundamental</div>
              <div className="text-2xl font-bold text-slate-900">{fundamental_score?.toFixed(1)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk Profile</div>
              <div className="text-2xl font-bold text-slate-900">{risk_score?.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Left Column (Main Thesis & Factors) */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Investment Thesis */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
              <Info className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Executive Investment Thesis</h2>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
              {investment_thesis}
            </p>
          </section>

          {/* Strengths & Weaknesses (Bull/Bear) */}
          <div className="grid grid-cols-2 gap-6">
            <section className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-900">Bull Case (Strengths)</h3>
              </div>
              <ul className="space-y-3">
                {strengths?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-red-50/50 p-6 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Bear Case (Weaknesses)</h3>
              </div>
              <ul className="space-y-3">
                {weaknesses?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Risk Factors */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
              <ShieldAlert className="w-5 h-5 text-slate-600" />
              <h2 className="text-xl font-bold text-slate-900">Critical Risk Factors</h2>
            </div>
            <ul className="space-y-3">
              {risk_factors?.map((item: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="font-bold text-slate-400">0{idx + 1}</div>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* Right Column (Metrics Breakdown) */}
        <div className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">System Sub-Scores</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">Technical Score</span>
                  <span className="font-bold text-slate-900">{technical_score?.toFixed(1)}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${technical_score}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">Fundamental Score</span>
                  <span className="font-bold text-slate-900">{fundamental_score?.toFixed(1)}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${fundamental_score}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">Risk Score (Safety)</span>
                  <span className="font-bold text-slate-900">{risk_score?.toFixed(1)}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${risk_score}%` }}></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500 leading-relaxed italic">
                  Note: Scores are derived algorithmically using the Quantan AI ensemble engine. A higher risk score implies better safety / lower downside.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-slate-900 px-8 py-4 text-slate-400 text-xs flex justify-between items-center">
        <span>&copy; {new Date().getFullYear()} Quantan AI Institutional. All rights reserved.</span>
        <span>CONFIDENTIAL RESEARCH MATERIAL</span>
      </div>
    </div>
  );
}
