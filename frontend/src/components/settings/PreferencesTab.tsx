"use client";

import { useState, useEffect } from "react";
import { usePreferences, useUpdatePreferences } from "@/hooks/useSettings";
import { Loader2 } from "lucide-react";

export default function PreferencesTab() {
  const { data: preferences, isLoading } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  const [formData, setFormData] = useState({
    theme: "system",
    risk_profile: "Moderate",
    benchmark: "S&P 500",
    notifications: {}
  });

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        theme: preferences.theme,
        risk_profile: preferences.risk_profile,
        benchmark: preferences.benchmark,
        notifications: preferences.notifications || {}
      });
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    try {
      await updatePrefs.mutateAsync(formData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to update preferences: " + err.message);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-xl"></div>;
  }

  return (
    <div className="bg-[#0B1120] border border-white/5 rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-white/5 bg-white/5">
        <h2 className="text-lg font-semibold text-white tracking-tight">System Preferences</h2>
        <p className="text-sm text-slate-400 mt-1">Configure how Quantan AI behaves and looks.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 max-w-2xl space-y-8">
        
        {/* Theme */}
        <div>
          <label className="block text-sm font-semibold text-white mb-4">UI Theme</label>
          <div className="grid grid-cols-3 gap-4">
            {["light", "dark", "system"].map((t) => (
              <label 
                key={t}
                className={`flex items-center justify-center py-3 px-4 rounded-xl border-2 cursor-pointer transition-all ${formData.theme === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold' : 'border-white/10 hover:border-white/20 text-slate-400 font-medium'}`}
              >
                <input 
                  type="radio" 
                  name="theme" 
                  value={t} 
                  className="hidden"
                  checked={formData.theme === t}
                  onChange={() => setFormData({ ...formData, theme: t })}
                />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Risk Profile */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1">Risk Profile</label>
          <p className="text-sm text-slate-400 mb-4">Dictates how aggressive the AI Recommendation Engine scores volatility.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["Conservative", "Moderate", "Aggressive"].map((r) => (
              <label 
                key={r}
                className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.risk_profile === r ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20'}`}
              >
                <input 
                  type="radio" 
                  name="risk_profile" 
                  value={r} 
                  className="hidden"
                  checked={formData.risk_profile === r}
                  onChange={() => setFormData({ ...formData, risk_profile: r })}
                />
                <span className={`font-bold mb-1 ${formData.risk_profile === r ? 'text-indigo-400' : 'text-white'}`}>{r}</span>
                <span className="text-xs text-slate-400">
                  {r === "Conservative" ? "Prioritize capital preservation." : r === "Moderate" ? "Balance risk and reward." : "Maximize potential alpha."}
                </span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Benchmark */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Default Market Benchmark</label>
          <select 
            value={formData.benchmark}
            onChange={(e) => setFormData({ ...formData, benchmark: e.target.value })}
            className="w-full sm:w-64 px-4 py-2.5 text-sm bg-[#0B1120] border border-white/10 rounded-lg outline-none focus:border-indigo-500 font-medium text-white"
          >
            <option value="S&P 500">S&P 500</option>
            <option value="NASDAQ">NASDAQ Composite</option>
            <option value="NIFTY 50">NIFTY 50</option>
            <option value="SENSEX">BSE SENSEX</option>
          </select>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="text-sm font-medium text-emerald-400">
            {isSuccess && "Preferences saved successfully."}
          </div>
          <button 
            type="submit"
            disabled={updatePrefs.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm"
          >
            {updatePrefs.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
