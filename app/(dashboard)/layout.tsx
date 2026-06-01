import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Main 3-Column Shell */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left: Sidebar (3 cols on md/lg) */}
          <aside className="col-span-1 md:col-span-4 lg:col-span-3 md:sticky md:top-24">
            <Sidebar />
          </aside>
          
          {/* Center: Content (6 cols on lg, 8 cols on md) */}
          <main className="col-span-1 md:col-span-8 lg:col-span-6 min-h-[500px]">
            {children}
          </main>
          
          {/* Right: Panel (3 cols, hidden on md) */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24">
            <RightPanel />
          </aside>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
