"use client";

import { Download, Loader2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InstitutionalReportPDF } from "./InstitutionalReportPDF";
import { useEffect, useState } from "react";

interface DownloadReportButtonProps {
  report: any; // The full report object from DB
}

export default function DownloadReportButton({ report }: DownloadReportButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <PDFDownloadLink 
      document={
        <InstitutionalReportPDF 
          reportData={report.report_json}
          symbol={report.symbol}
          recommendation={report.recommendation}
          confidence={report.confidence_score}
          date={new Date(report.generated_at).toLocaleString()}
        />
      } 
      fileName={`${report.symbol}_Institutional_Research_Report.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <button
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
