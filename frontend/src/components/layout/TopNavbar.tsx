"use client";

import { Bell, LogOut, ChevronDown } from "lucide-react";
import { StockSearch } from "@/components/ui/StockSearch";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function TopNavbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <StockSearch />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-8 ml-4">
        
        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-gray-900 transition-colors">
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute 1 top-0 right-0 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-gray-900">{session?.user?.name || "Analyst"}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Institutional</div>
            </div>
            <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center font-semibold text-xs text-gray-600">
              {session?.user?.name?.[0]?.toUpperCase() || "Q"}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
