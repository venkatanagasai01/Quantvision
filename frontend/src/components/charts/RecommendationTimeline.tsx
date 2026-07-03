"use client";

import { format, parseISO } from "date-fns";

export function RecommendationTimeline({ trades }: { trades: any[] }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-[300px]">
        <p className="text-sm font-medium text-slate-500">No historical backtest signals found for this asset.</p>
        <p className="text-xs text-slate-400 mt-2">Run a backtest to generate signal history.</p>
      </div>
    );
  }

  // Sort trades descending by date
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-6 h-[300px] flex flex-col">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Recommendation History</h3>
      <div className="overflow-y-auto flex-1 pr-4 custom-scrollbar">
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
          {sortedTrades.map((trade, i) => {
            const isBuy = trade.action === "BUY";
            return (
              <div key={i} className="relative pl-6">
                <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 border-2 border-white ${isBuy ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${isBuy ? 'text-emerald-600' : 'text-red-600'}`}>
                      {trade.action} SIGNAL
                    </span>
                    <p className="text-sm text-slate-600 mt-0.5">Executed at ${trade.price?.toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {format(parseISO(trade.date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
