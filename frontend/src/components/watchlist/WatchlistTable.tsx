"use client";

import { useWatchlistMutations } from "@/hooks/useWatchlist";
import { Trash2, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import Link from "next/link";

interface WatchlistTableProps {
  data: any[];
  isLoading: boolean;
  isError: boolean;
}

export default function WatchlistTable({ data, isLoading, isError }: WatchlistTableProps) {
  const { removeSymbol } = useWatchlistMutations();

  const getSentimentBadge = (score: number) => {
    if (score === 0) return <span className="text-slate-400">N/A</span>;
    if (score > 0.5) return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider">Bullish</span>;
    if (score < -0.5) return <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded uppercase tracking-wider">Bearish</span>;
    return <span className="px-2 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold rounded uppercase tracking-wider">Neutral</span>;
  };

  const getRecBadge = (rec: string) => {
    if (rec === "N/A" || !rec) return <span className="text-slate-400">N/A</span>;
    if (rec === "BUY") return <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest">BUY</span>;
    if (rec === "SELL") return <span className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-widest">SELL</span>;
    return <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-widest">HOLD</span>;
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">Symbol</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4">Recommendation</th>
              <th className="px-6 py-4">AI Confidence</th>
              <th className="px-6 py-4">News Sentiment</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-200 rounded ml-auto"></div></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-500 text-sm font-medium">Failed to load watchlist data.</td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500 text-sm flex flex-col items-center">
                  <Layers className="w-12 h-12 text-slate-200 mb-4" />
                  Your watchlist is empty.<br />Add symbols using the search bar above.
                </td>
              </tr>
            ) : (
              data?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Symbol & Name */}
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/analyze?symbol=${item.symbol}`} className="block">
                      <div className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">{item.symbol}</div>
                      <div className="text-[11px] text-slate-500">{item.company_name}</div>
                    </Link>
                  </td>
                  
                  {/* Price & Change */}
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-900">${item.price.toFixed(2)}</div>
                    <div className={`text-[11px] font-bold flex items-center justify-end mt-0.5 ${item.change_pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.change_pct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(item.change_pct).toFixed(2)}%
                    </div>
                  </td>
                  
                  {/* Recommendation */}
                  <td className="px-6 py-4">
                    {getRecBadge(item.recommendation)}
                  </td>
                  
                  {/* Confidence */}
                  <td className="px-6 py-4">
                    {item.confidence_score === 0 ? (
                      <span className="text-slate-400 text-sm">N/A</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.confidence_score > 70 ? 'bg-emerald-500' : item.confidence_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${item.confidence_score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{item.confidence_score}%</span>
                      </div>
                    )}
                  </td>

                  {/* Sentiment */}
                  <td className="px-6 py-4">
                    {getSentimentBadge(item.sentiment_score)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeSymbol.mutate(item.symbol)}
                      disabled={removeSymbol.isPending}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
