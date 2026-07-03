"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useBacktests } from "@/hooks/useBacktests";
import { BacktestTable } from "@/components/backtesting/BacktestTable";
import { RunBacktestDialog } from "@/components/backtesting/RunBacktestDialog";

export default function BacktestsIndexPage() {
  const [page, setPage] = useState(1);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useBacktests(page, 20, activeSymbol);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSymbol(searchSymbol.toUpperCase());
    setPage(1);
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 font-sans">
      
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quantitative Backtests</h1>
          <p className="text-sm text-slate-500 mt-1">Manage historical simulations and performance reports.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Run New Backtest
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <form onSubmit={handleSearch} className="relative w-full max-w-xs flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Filter by symbol..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </form>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {data?.total || 0} Total Runs
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1">
          <BacktestTable backtests={data?.items || []} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-500">Page {page}</span>
            <button 
              disabled={data.items.length < 20}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <RunBacktestDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
