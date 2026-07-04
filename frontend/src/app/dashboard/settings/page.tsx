"use client";

import { useState } from "react";
import ProfileTab from "@/components/settings/ProfileTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { User, Settings2, BellRing, ShieldCheck, HelpCircle } from "lucide-react";

const TABS = [
  {
    id: "profile",
    label: "Public Profile",
    icon: User,
    desc: "Your name, avatar, and public-facing info.",
    tooltip: "Edit your display name and profile details visible to the system.",
  },
  {
    id: "preferences",
    label: "System Preferences",
    icon: Settings2,
    desc: "AI model settings and display options.",
    tooltip: "Customise the AI engine behaviour — risk tolerance, default strategy, and display themes.",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: BellRing,
    desc: "Email and in-app alert preferences.",
    tooltip: "Configure when to get notified — price alerts, strategy signals, and system events.",
  },
  {
    id: "security",
    label: "Security & Data",
    icon: ShieldCheck,
    desc: "Password, API keys, and data export.",
    tooltip: "Change your password, manage API keys, and export or delete your data.",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto font-sans pb-10">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="pb-4 border-b border-slate-200/60">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account, customise the AI engine, configure alerts, and control data privacy.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Navigation ───────────────────── */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            {TABS.map((tab) => (
              <div key={tab.id} className="tooltip-container w-full">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-start gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`} />
                  <div>
                    <div className="font-bold whitespace-nowrap">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal hidden md:block mt-0.5">{tab.desc}</div>
                  </div>
                </button>
                <div className="tooltip-box w-52">{tab.tooltip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Content ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          {activeTabData && (
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{activeTabData.label}</h2>
                <div className="tooltip-container">
                  <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                  <div className="tooltip-box w-52">{activeTabData.tooltip}</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{activeTabData.desc}</p>
            </div>
          )}

          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security" && <SecurityTab />}
        </div>

      </div>
    </div>
  );
}
