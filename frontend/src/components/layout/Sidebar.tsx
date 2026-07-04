"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  Star,
  History,
  FileText,
  Settings,
  TrendingUp,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      {
        name: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        tooltip: "Portfolio intelligence, market overview, and AI signals",
        exact: true,
      },
      {
        name: "Analyze",
        href: "/dashboard/analyze",
        icon: LineChart,
        tooltip: "Deep AI analysis on any stock ticker",
        exact: false,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        name: "Paper Trading",
        href: "/dashboard/trading",
        icon: Briefcase,
        tooltip: "Simulate trades with ₹10L virtual capital — zero risk",
        exact: false,
      },
      {
        name: "Watchlist",
        href: "/dashboard/watchlist",
        icon: Star,
        tooltip: "Track stocks with live prices and AI signals",
        exact: false,
      },
      {
        name: "Backtests",
        href: "/dashboard/backtests",
        icon: History,
        tooltip: "Run and review historical strategy simulations",
        exact: false,
      },
      {
        name: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
        tooltip: "Generate institutional-grade research reports",
        exact: false,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        tooltip: "Manage your profile, preferences, and notifications",
        exact: false,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm z-30">

      {/* ── Brand Logo ─────────────────────────────── */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-slate-900 leading-none">Quantan</div>
            <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">AI Terminal</div>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-6 overflow-y-auto hide-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3">
              {section.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <div key={item.name} className="tooltip-container w-full">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                        active
                          ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {/* Active indicator bar */}
                      <div className={`w-1 h-5 rounded-full transition-all ${active ? "bg-indigo-500" : "bg-transparent group-hover:bg-slate-200"}`} />
                      <item.icon
                        className={`w-4 h-4 transition-colors ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                        strokeWidth={active ? 2.5 : 1.5}
                      />
                      <span>{item.name}</span>
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </Link>
                    <div className="tooltip-box w-48">{item.tooltip}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── System Status Footer ────────────────────── */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-700">AI Engine Online</div>
            <div className="text-[10px] text-emerald-600">All systems operational</div>
          </div>
        </div>
      </div>
    </div>
  );
}
