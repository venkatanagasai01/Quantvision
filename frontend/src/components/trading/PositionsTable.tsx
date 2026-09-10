"use client";

import { usePositions } from "@/hooks/usePaperTrading";
import { Loader2 } from "lucide-react";

export function PositionsTable() {
  const { data: positions, isLoading, error } = usePositions();

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (error || !positions) {
    return <div className="p-4 text-red-400 font-bold">Failed to load positions.</div>;
  }

  if (positions.length === 0) {
    return <div className="p-10 text-center text-slate-400 font-medium bg-[#0B1120] rounded-xl border border-dashed border-white/10">No open positions yet. Execute a paper trade to build your portfolio.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5">
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Shares</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Avg Cost</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Current Price</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Market Value</th>
            <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Unrealized P&L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {positions.map((pos: any) => {
            const isPositive = pos.unrealized_pnl >= 0;
            return (
              <tr key={pos.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 font-bold text-white">{pos.symbol}</td>
                <td className="py-4 px-4 font-mono text-slate-300 text-right">{pos.shares}</td>
                <td className="py-4 px-4 font-mono text-slate-300 text-right">${pos.average_cost.toFixed(2)}</td>
                <td className="py-4 px-4 font-mono font-bold text-white text-right">${pos.current_price.toFixed(2)}</td>
                <td className="py-4 px-4 font-mono font-bold text-white text-right">${pos.market_value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className={`py-4 px-4 font-mono font-bold text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}${pos.unrealized_pnl.toFixed(2)} <br/>
                  <span className="text-xs opacity-80">{isPositive ? '+' : ''}{pos.unrealized_pnl_pct.toFixed(2)}%</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
