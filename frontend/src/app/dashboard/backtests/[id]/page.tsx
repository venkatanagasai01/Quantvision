"use client";

import { use } from "react";
import { useBacktestReport } from "@/hooks/useBacktests";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { MetricsGrid } from "@/components/charts/MetricsGrid";
import { ArrowLeft, Clock, DollarSign, Activity } from "lucide-react";
import Link from "next/link";

export default function BacktestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = parseInt(resolvedParams.id, 10);
  
  const { data: report, isLoading, isError } = useBacktestReport(id);

  if (isLoading) {
    return <div className="max-w-[1400px] mx-auto p-10 text-center text-slate-500 animate-pulse">Generating performance report...</div>;
  }

  if (isError || !report) {
    return <div className="max-w-[1400px] mx-auto p-10 text-center text-red-500 font-bold">Failed to load backtest report.</div>;
  }

  const { performance_metrics, benchmark_comparison, trade_history, chart_data } = report;

  // We mock the equity curve using the trade_history array if chart_data.equity_curve is empty
  // (Because we optimized backend persistence to not save the raw 10MB pandas dataframe)
  let simulatedEquityCurve = chart_data.equity_curve;
  if (!simulatedEquityCurve || simulatedEquityCurve.length === 0) {
    simulatedEquityCurve = trade_history.map((t: any) => ({
      date: t.date,
      portfolio_value: t.cash_after_trade + (t.shares * t.price)
    }));
    // Make sure we have a start node
    if (simulatedEquityCurve.length > 0) {
      simulatedEquityCurve.unshift({ date: report.start_date, portfolio_value: report.initial_capital });
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 font-sans pb-10">
      
      {/* Header */}
      <div>
        <Link href="/dashboard/backtests" className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              {report.symbol} <span className="text-slate-300">|</span> <span className="text-xl font-medium text-slate-500">Performance Report</span>
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {report.start_date} to {report.end_date}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Initial: ${report.initial_capital.toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Benchmark: {benchmark_comparison?.benchmark_symbol}</span>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Return</div>
            <div className={`text-xl font-bold ${report.total_return > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {report.total_return > 0 ? '+' : ''}{report.total_return.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid perf={performance_metrics} bench={benchmark_comparison} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Equity Curve</h2>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Strategy</span>
              </div>
            </div>
            <EquityCurveChart data={simulatedEquityCurve} />
          </div>
        </div>

        {/* Trade Ledger Summary */}
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[400px]">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Trade Ledger</h2>
            <span className="text-xs font-bold text-slate-500">{trade_history.length} Trades</span>
          </div>
          <div className="overflow-y-auto divide-y divide-slate-100">
            {trade_history.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">No trades executed.</div>
            )}
            {trade_history.map((trade: any, idx: number) => (
              <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-sm">
                <div>
                  <div className={`font-bold ${trade.action === 'BUY' ? 'text-emerald-600' : 'text-red-600'}`}>{trade.action}</div>
                  <div className="text-xs text-slate-500">{trade.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{trade.shares} shares</div>
                  <div className="text-xs text-slate-500">@ ${trade.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
