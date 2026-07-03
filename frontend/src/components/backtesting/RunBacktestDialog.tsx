import { useState } from "react";
import { useRunBacktest } from "@/hooks/useBacktests";
import { X, PlayCircle, AlertTriangle } from "lucide-react";

export function RunBacktestDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [benchmark, setBenchmark] = useState("^NSEI");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [capital, setCapital] = useState(10000);

  const runMutation = useRunBacktest();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runMutation.mutate(
      { symbol: symbol.toUpperCase(), benchmark, start_date: startDate, end_date: endDate, initial_capital: capital },
      {
        onSuccess: () => {
          onClose(); // Close modal on success
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Run New Backtest</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {runMutation.isError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
              <AlertTriangle className="w-4 h-4" />
              <span>Failed to run backtest. Please check the symbol and dates.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Symbol</label>
              <input 
                required
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. TCS.NS"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Benchmark</label>
              <input 
                required
                type="text" 
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
              <input 
                required
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
              <input 
                required
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Capital ($)</label>
            <input 
              required
              type="number" 
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              min="100"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={runMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {runMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <><PlayCircle className="w-4 h-4" /> Run Simulation</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
