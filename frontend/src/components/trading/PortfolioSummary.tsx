"use client";

import { usePortfolio } from "@/hooks/usePaperTrading";
import { DollarSign, PieChart, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

export function PortfolioSummary() {
  const { data: portfolio, isLoading, error } = usePortfolio();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="bg-red-50 text-red-600 rounded-2xl p-6 border border-red-100 font-bold">
        Failed to load portfolio summary.
      </div>
    );
  }

  const isPositive = portfolio.unrealized_pnl >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5">
          <PieChart className="w-32 h-32 -mr-8 -mt-8" />
        </div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Value</h3>
        <div className="text-3xl font-black font-mono text-slate-900">${portfolio?.total_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5">
          <DollarSign className="w-32 h-32 -mr-8 -mt-8" />
        </div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Cash Balance</h3>
        <div className="text-3xl font-black font-mono text-slate-900">${portfolio?.cash_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total P&L</h3>
        <div className="flex items-end gap-3">
          <div className={`text-3xl font-black font-mono ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}${portfolio?.unrealized_pnl?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
          </div>
          <div className={`flex items-center text-sm font-bold pb-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {portfolio?.unrealized_pnl_pct?.toFixed(2) ?? "0.00"}%
          </div>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-2xl shadow-sm border border-indigo-700 p-6 text-white relative overflow-hidden">
         <div className="absolute right-0 top-0 opacity-10">
          <TrendingUp className="w-32 h-32 -mr-8 -mt-8" />
        </div>
        <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2">Initial Capital</h3>
        <div className="text-3xl font-black font-mono">${portfolio?.initial_capital?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}</div>
      </div>
    </div>
  );
}
