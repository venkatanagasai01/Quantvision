"use client";

import { useState } from "react";
import ProfileTab from "@/components/settings/ProfileTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { User, Settings2, BellRing, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Public Profile", icon: User },
    { id: "preferences", label: "System Preferences", icon: Settings2 },
    { id: "notifications", label: "Notifications", icon: BellRing },
    { id: "security", label: "Security & Data", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto font-sans min-h-[calc(100vh-80px)]">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200/60">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, customize the AI engine, and configure alerts.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security" && <SecurityTab />}
        </div>
        
      </div>
    </div>
  );
}
