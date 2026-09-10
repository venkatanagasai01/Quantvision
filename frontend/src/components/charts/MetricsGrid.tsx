import { Activity, TrendingUp, AlertTriangle, Scale, Target } from "lucide-react";

export function MetricsGrid({ perf, bench }: { perf: any, bench: any }) {
  if (!perf) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-[#0B1120] border border-white/5 p-5 rounded-xl shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><TrendingUp className="w-3 h-3"/> CAGR</div>
        <div className={`text-2xl font-mono font-bold ${perf.CAGR > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {(perf.CAGR * 100).toFixed(2)}<span className="text-sm text-slate-400 ml-1">%</span>
        </div>
      </div>
      
      <div className="bg-[#0B1120] border border-white/5 p-5 rounded-xl shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Scale className="w-3 h-3"/> Sharpe Ratio</div>
        <div className="text-2xl font-mono font-bold text-white">
          {perf.sharpe_ratio?.toFixed(2) || "N/A"}
        </div>
      </div>

      <div className="bg-[#0B1120] border border-white/5 p-5 rounded-xl shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Target className="w-3 h-3"/> Win Rate</div>
        <div className="text-2xl font-mono font-bold text-white">
          {(perf.win_rate * 100).toFixed(1)}<span className="text-sm text-slate-400 ml-1">%</span>
        </div>
      </div>

      <div className="bg-[#0B1120] border border-white/5 p-5 rounded-xl shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3"/> Max Drawdown</div>
        <div className="text-2xl font-mono font-bold text-red-400">
          {(perf.max_drawdown * 100).toFixed(2)}<span className="text-sm text-slate-400 ml-1">%</span>
        </div>
      </div>

      <div className="bg-[#0B1120] border border-white/5 p-5 rounded-xl shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Activity className="w-3 h-3"/> Alpha</div>
        <div className="text-2xl font-mono font-bold text-indigo-400">
          {bench?.alpha ? (bench.alpha * 100).toFixed(2) : "N/A"}<span className="text-sm text-slate-400 ml-1">%</span>
        </div>
      </div>
    </div>
  );
}
