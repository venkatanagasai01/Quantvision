"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import WatchlistAnalytics from "@/components/watchlist/WatchlistAnalytics";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import WatchlistSearch from "@/components/watchlist/WatchlistSearch";

export default function WatchlistPage() {
  const { data, isLoading, isError, isFetching } = useWatchlist();

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto font-sans h-[calc(100vh-80px)]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Institutional Watchlist</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time market data infused with Quantan AI signals.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <WatchlistSearch />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/60 rounded-md shadow-sm h-[42px]">
            <span className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="text-xs font-medium text-slate-600 hidden sm:block">
              {isFetching ? 'Syncing...' : 'Live Polling'}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <WatchlistAnalytics data={data || []} isLoading={isLoading} />

      {/* Main Table */}
      <WatchlistTable data={data || []} isLoading={isLoading} isError={isError} />

    </div>
  );
}
