import Link from "next/link";
import { 
  LayoutDashboard, 
  LineChart, 
  List, 
  FileText, 
  Settings,
  Briefcase,
  Star,
  History
} from "lucide-react";

export function Sidebar() {
  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analyze", href: "/dashboard/analyze", icon: LineChart },
    { name: "Paper Trading", href: "/dashboard/trading", icon: Briefcase },
    { name: "Watchlist", href: "/dashboard/watchlist", icon: Star },
    { name: "Backtests", href: "/dashboard/backtests", icon: History },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <div className="font-semibold text-lg tracking-tight text-gray-900 flex items-center gap-3">
          <div className="w-2 h-6 bg-blue-700 rounded-sm"></div>
          Quantan
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-8 px-4 flex flex-col gap-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Menu</div>
        
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50/50 transition-all"
          >
            <item.icon className="w-4 h-4" strokeWidth={1.5} />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User Status Bottom */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="text-xs font-medium text-gray-500">System Connected</span>
        </div>
      </div>
    </div>
  );
}
