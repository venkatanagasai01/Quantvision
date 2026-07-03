"use client";

import { useState, useEffect } from "react";
import { usePreferences, useUpdatePreferences } from "@/hooks/useSettings";
import { Loader2, BellRing, BrainCircuit, Activity, LineChart } from "lucide-react";

export default function NotificationsTab() {
  const { data: preferences, isLoading } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  const [formData, setFormData] = useState({
    theme: "system",
    risk_profile: "Moderate",
    benchmark: "S&P 500",
    notifications: {
      recommendation: true,
      sentiment: true,
      volatility: false,
      backtest: true
    }
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

  const toggleNotification = (key: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !(prev.notifications as any)[key]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    try {
      await updatePrefs.mutateAsync(formData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to update notifications: " + err.message);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-xl"></div>;
  }

  const alerts = [
    { id: "recommendation", title: "Recommendation Alerts", desc: "Get notified when a stock in your watchlist changes signal (e.g. HOLD to BUY).", icon: BrainCircuit },
    { id: "sentiment", title: "Sentiment Anomalies", desc: "Receive alerts for extreme news sentiment clustering via FinBERT.", icon: BellRing },
    { id: "volatility", title: "Volatility Warnings", desc: "Get notified of sudden price drops or unusual volume.", icon: Activity },
    { id: "backtest", title: "Backtest Completions", desc: "Receive an alert when a long-running portfolio simulation finishes.", icon: LineChart },
  ];

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Notification Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Control which alerts appear on your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 max-w-2xl">
        <div className="space-y-6">
          {alerts.map((alert) => {
            const isEnabled = (formData.notifications as any)[alert.id];
            return (
              <div key={alert.id} className="flex items-start justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg ${isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    <alert.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{alert.title}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{alert.desc}</div>
                  </div>
                </div>
                
                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleNotification(alert.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm font-medium text-emerald-600">
            {isSuccess && "Notifications saved successfully."}
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
