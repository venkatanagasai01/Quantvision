"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import ReportsTable from "@/components/reports/ReportsTable";
import { useGenerateReport } from "@/hooks/useReports";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const generateReport = useGenerateReport();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    try {
      const result = await generateReport.mutateAsync(symbol.trim().toUpperCase());
      setSymbol("");
      // Redirect to the newly generated report
      router.push(`/dashboard/reports/${result.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to generate report");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans h-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Research Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and review institutional-grade stock analysis.</p>
        </div>
        
        {/* Generate Report Form */}
        <form onSubmit={handleGenerate} className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Enter symbol (e.g. NVDA)" 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-500 flex-1 sm:w-48 shadow-sm"
          />
          <button 
            type="submit"
            disabled={generateReport.isPending || !symbol.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {generateReport.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {generateReport.isPending ? "Analyzing..." : "Generate"}
          </button>
        </form>
      </div>

      <ReportsTable />

    </div>
  );
}
