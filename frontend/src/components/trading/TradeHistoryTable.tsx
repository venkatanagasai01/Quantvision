"use client";

import { useTrades } from "@/hooks/usePaperTrading";
import { Loader2 } from "lucide-react";

export function TradeHistoryTable() {
  const { data: trades, isLoading, error } = useTrades();

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (error || !trades) {
    return <div className="p-4 text-red-400 font-bold">Failed to load trade history.</div>;
  }

  if (trades.length === 0) {
    return <div className="p-10 text-center text-slate-400 font-medium bg-[#0B1120] rounded-xl border border-dashed border-white/10">No trades executed yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5">
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Shares</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Exec Price</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {trades.map((trade: any) => {
            const date = new Date(trade.executed_at).toLocaleString();
            const isBuy = trade.action === "BUY";
            
            return (
              <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 font-mono text-sm text-slate-400">{date}</td>
                <td className="py-4 px-4 font-bold text-white">{trade.symbol}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.action}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-slate-300 text-right">{trade.shares}</td>
                <td className="py-4 px-4 font-mono text-slate-300 text-right">${trade.execution_price.toFixed(2)}</td>
                <td className="py-4 px-4 font-mono font-bold text-white text-right">${trade.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
