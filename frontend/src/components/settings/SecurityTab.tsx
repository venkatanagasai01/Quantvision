"use client";

import { useProfile, useExportData } from "@/hooks/useSettings";
import { Download, Trash2, Key, ShieldCheck, Loader2 } from "lucide-react";

export default function SecurityTab() {
  const { data: profile, isLoading } = useProfile();
  const exportData = useExportData();

  const handleExport = async () => {
    try {
      const data = await exportData.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quantan_export_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export data.");
    }
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
      alert("Account deletion initiated. (Mock functionality for now).");
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-xl"></div>;
  }

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Security & Data</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your connected accounts and personal data.</p>
      </div>

      <div className="p-6 max-w-2xl space-y-8">
        
        {/* Auth Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Authentication Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500 mb-1">Provider</div>
              <div className="font-medium text-slate-900 capitalize">{profile?.auth_provider || "Local"}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Last Login</div>
              <div className="font-medium text-slate-900">
                {profile?.last_login ? new Date(profile.last_login).toLocaleString() : "First Session"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Data Export */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Export User Data</h3>
          <p className="text-sm text-slate-500 mb-4">Download a JSON archive of your profile, preferences, and generated reports.</p>
          <button 
            onClick={handleExport}
            disabled={exportData.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            {exportData.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Data Archive
          </button>
        </div>

        <hr className="border-slate-100" />

        {/* Danger Zone */}
        <div>
          <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">Permanently delete your account and wipe all personal data from Quantan AI servers.</p>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}
