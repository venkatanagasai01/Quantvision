"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useWatchlistMutations } from "@/hooks/useWatchlist";

export default function WatchlistSearch() {
  const [symbol, setSymbol] = useState("");
  const { addSymbol } = useWatchlistMutations();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    try {
      await addSymbol.mutateAsync(symbol.trim().toUpperCase());
      setSymbol("");
    } catch (error: any) {
      alert(error.message || "Failed to add symbol");
    }
  };

  return (
    <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-200/60 rounded-xl shadow-sm">
      <input 
        type="text" 
        placeholder="Search to add (e.g. AAPL, NVDA)" 
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full sm:w-80 px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
      />
      <button 
        type="submit"
        disabled={addSymbol.isPending || !symbol.trim()}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors"
      >
        {addSymbol.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Add to Watchlist
      </button>
    </form>
  );
}
