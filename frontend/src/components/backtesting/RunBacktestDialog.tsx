import { useState } from "react";
import { useRunBacktest } from "@/hooks/useBacktests";
import { X, PlayCircle, AlertTriangle } from "lucide-react";
import { INDIAN_STOCKS } from "@/constants/stocks";

export function RunBacktestDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [benchmark, setBenchmark] = useState("^NSEI");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [capital, setCapital] = useState(10000);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const filteredStocks = symbol 
    ? INDIAN_STOCKS.filter(s => 
        s.symbol.toLowerCase().includes(symbol.toLowerCase()) || 
        s.name.toLowerCase().includes(symbol.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-[#0B1120] rounded-2xl shadow-xl w-full max-w-lg border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Run New Backtest</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {runMutation.isError && (
            <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
              <span>Failed to run backtest. Please check the symbol and dates.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Symbol</label>
              <input 
                required
                type="text" 
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase());
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                spellCheck={false}
                placeholder="e.g. TCS.NS"
                className="w-full px-4 py-2 bg-[#0B1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
              />
              <span className="text-[10px] text-slate-500">Append .NS for Indian stocks</span>

              {/* Autocomplete Dropdown */}
              {showDropdown && filteredStocks.length > 0 && (
                <div className="absolute top-[calc(100%-1rem)] left-0 w-full mt-2 bg-[#0B1120] border border-white/10 shadow-xl rounded-lg z-[100] max-h-48 overflow-y-auto">
                  {filteredStocks.map((stock) => (
                    <div 
                      key={stock.symbol}
                      onClick={() => {
                        setSymbol(stock.symbol);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-indigo-500/10 cursor-pointer flex flex-col group transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="text-sm font-bold text-white group-hover:text-indigo-400">{stock.symbol}</span>
                      <span className="text-xs text-slate-400 truncate">{stock.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Benchmark</label>
              <input 
                required
                type="text" 
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="w-full px-4 py-2 bg-[#0B1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
              <input 
                required
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#0B1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">End Date</label>
              <input 
                required
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#0B1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial Capital ($)</label>
            <input 
              required
              type="number" 
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              min="100"
              className="w-full px-4 py-2 bg-[#0B1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
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
