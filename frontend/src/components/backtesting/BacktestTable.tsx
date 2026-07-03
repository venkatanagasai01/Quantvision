import { useDeleteBacktest } from "@/hooks/useBacktests";
import { Trash2, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export function BacktestTable({ backtests, isLoading }: { backtests: any[], isLoading: boolean }) {
  const deleteMutation = useDeleteBacktest();

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500">Loading backtests...</div>;
  }

  if (backtests.length === 0) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center">
        <Activity className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Backtests Found</h3>
        <p className="text-sm text-slate-500 max-w-sm">Run a new simulation to generate performance metrics and historical strategies.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Symbol</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Dates</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Return</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Sharpe</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Status</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {backtests.map((bt) => (
            <tr key={bt.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-900">{bt.symbol}</div>
                <div className="text-xs text-slate-500">vs {bt.benchmark}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-slate-700">{bt.start_date}</div>
                <div className="text-xs text-slate-500">to {bt.end_date}</div>
              </td>
              <td className="px-6 py-4">
                <div className={`font-bold ${bt.total_return > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {bt.total_return > 0 ? '+' : ''}{(bt.total_return || 0).toFixed(2)}%
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-slate-700">
                  {bt.sharpe_ratio ? bt.sharpe_ratio.toFixed(2) : "N/A"}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                  bt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {bt.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteMutation.mutate(bt.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link 
                    href={`/dashboard/backtests/${bt.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
