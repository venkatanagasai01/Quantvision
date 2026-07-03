"use client";

import { useState } from "react";
import { Search, Filter, FileText, ChevronRight, Download } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { useRouter } from "next/navigation";

export default function ReportsTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, BUY, HOLD, SELL

  const { data, isLoading, isError } = useReports(page, 10, filter, search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page on new search
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm flex flex-col h-full">
      {/* Table Header & Controls */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Report Archive</h2>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search symbol..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-indigo-500 w-full sm:w-64 transition-colors"
            />
          </form>

          {/* Filter */}
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-10 py-2 text-sm font-medium border border-slate-200 rounded-md outline-none focus:border-indigo-500 bg-white cursor-pointer"
            >
              <option value="ALL">All Signals</option>
              <option value="BUY">Buy</option>
              <option value="HOLD">Hold</option>
              <option value="SELL">Sell</option>
            </select>
            <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Symbol</th>
              <th className="px-6 py-4">Recommendation</th>
              <th className="px-6 py-4">AI Confidence</th>
              <th className="px-6 py-4">Generated Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-6 w-20 bg-slate-200 rounded-full"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-32 bg-slate-200 rounded"></div></td>
                  <td className="px-6 py-5 flex justify-end"><div className="h-8 w-24 bg-slate-200 rounded-md"></div></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-red-500 text-sm">Failed to load reports.</td>
              </tr>
            ) : data?.items?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm flex flex-col items-center">
                  <FileText className="w-12 h-12 text-slate-200 mb-3" />
                  No reports found matching your criteria.
                </td>
              </tr>
            ) : (
              data?.items?.map((report: any) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{report.symbol}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      report.recommendation === 'BUY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      report.recommendation === 'SELL' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {report.recommendation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${report.confidence_score > 70 ? 'bg-emerald-500' : report.confidence_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${report.confidence_score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{report.confidence_score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {new Date(report.generated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
                    >
                      View Report <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && data?.items?.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total} reports
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={page * 10 >= data.total}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
