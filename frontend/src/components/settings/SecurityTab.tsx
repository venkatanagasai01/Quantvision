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
    return <div className="animate-pulse h-64 bg-white/5 rounded-xl"></div>;
  }

  return (
    <div className="bg-[#0B1120] border border-white/5 rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-white/5 bg-white/5">
        <h2 className="text-lg font-semibold text-white tracking-tight">Security & Data</h2>
        <p className="text-sm text-slate-400 mt-1">Manage your connected accounts and personal data.</p>
      </div>

      <div className="p-6 max-w-2xl space-y-8">
        
        {/* Auth Status */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Authentication Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Provider</div>
              <div className="font-medium text-white capitalize">{profile?.auth_provider || "Local"}</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Last Login</div>
              <div className="font-medium text-white">
                {profile?.last_login ? new Date(profile.last_login).toLocaleString() : "First Session"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Data Export */}
        <div>
          <h3 className="font-semibold text-white mb-2">Export User Data</h3>
          <p className="text-sm text-slate-400 mb-4">Download a JSON archive of your profile, preferences, and generated reports.</p>
          <button 
            onClick={handleExport}
            disabled={exportData.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors shadow-sm"
          >
            {exportData.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Data Archive
          </button>
        </div>

        <hr className="border-white/5" />

        {/* Danger Zone */}
        <div>
          <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-400 mb-4">Permanently delete your account and wipe all personal data from Quantan AI servers.</p>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}
