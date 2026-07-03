"use client";

import { useReport } from "@/hooks/useReports";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ReportViewer from "@/components/reports/ReportViewer";
import DownloadReportButton from "@/components/reports/DownloadReportButton";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const reportId = parseInt(params.id, 10);
  const { data: report, isLoading, isError } = useReport(reportId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
        <p>Loading research report...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-500">
        <p>Report not found or failed to load.</p>
        <Link href="/dashboard/reports" className="mt-4 text-indigo-600 hover:underline">
          Return to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Link 
          href="/dashboard/reports" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Generated: {new Date(report.generated_at).toLocaleString()}
          </div>
          <DownloadReportButton report={report} />
        </div>
      </div>

      {/* Actual Report Content rendered by the Viewer component */}
      <ReportViewer reportData={report.report_json} />
      
    </div>
  );
}
