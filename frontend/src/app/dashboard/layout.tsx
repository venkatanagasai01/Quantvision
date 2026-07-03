import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Area Wrapper (offset by sidebar width) */}
      <div className="pl-64 flex flex-col min-h-screen">
        
        {/* Top Navigation */}
        <TopNavbar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-10">
          {children}
        </main>
        
      </div>
    </div>
  );
}
