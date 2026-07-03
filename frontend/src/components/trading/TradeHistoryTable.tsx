"use client";

import { useTrades } from "@/hooks/usePaperTrading";
import { Loader2 } from "lucide-react";

export function TradeHistoryTable() {
  const { data: trades, isLoading, error } = useTrades();

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;
  }

  if (error || !trades) {
    return <div className="p-4 text-red-600 font-bold">Failed to load trade history.</div>;
  }

  if (trades.length === 0) {
    return <div className="p-10 text-center text-slate-500 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-300">No trades executed yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Asset</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Shares</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Exec Price</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Total Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {trades.map((trade: any) => {
            const date = new Date(trade.executed_at).toLocaleString();
            const isBuy = trade.action === "BUY";
            
            return (
              <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 font-mono text-sm text-slate-500">{date}</td>
                <td className="py-4 px-4 font-bold text-slate-900">{trade.symbol}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isBuy ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trade.action}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-slate-700 text-right">{trade.shares}</td>
                <td className="py-4 px-4 font-mono text-slate-700 text-right">${trade.execution_price.toFixed(2)}</td>
                <td className="py-4 px-4 font-mono font-bold text-slate-900 text-right">${trade.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
