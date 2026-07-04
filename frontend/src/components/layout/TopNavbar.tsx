"use client";

import { Bell, LogOut, ChevronDown, HelpCircle, User } from "lucide-react";
import { StockSearch } from "@/components/ui/StockSearch";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function TopNavbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "Q";
  const userName = session?.user?.name || "Analyst";
  const userEmail = session?.user?.email || "";

  return (
    <header className="h-20 bg-white/90 backdrop-blur-lg border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">

      {/* Search */}
      <div className="flex-1 max-w-lg">
        <StockSearch />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6 ml-4">

        {/* Help */}
        <div className="tooltip-container">
          <button className="relative text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-50">
            <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="tooltip-box w-48">
            Hover any metric or section header inside the app for contextual explanations.
          </div>
        </div>

        {/* Notifications */}
        <div className="tooltip-container">
          <button className="relative text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-50">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
          </button>
          <div className="tooltip-box w-44">View system alerts and AI notifications.</div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-100" />

        {/* User Profile */}
        <div className="relative">
          <button
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-all"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-xs text-white shadow-sm">
              {userInitial}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-none">{userName}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Terminal User</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm text-white">
                      {userInitial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                      <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <a
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </a>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
