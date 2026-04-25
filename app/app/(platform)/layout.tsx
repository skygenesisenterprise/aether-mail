import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/platform/Sidebar";
import { Header } from "@/components/platform/Header";
import { MobileBottomNav } from "@/components/platform/MobileBottomNav";
import { useIsMobile } from "@/components/ui/use-mobile";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen w-full">
        <Header className="sticky top-0 z-50 flex-none h-14 border-b hidden md:flex" />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <Sidebar />}
          <SidebarInset className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </SidebarInset>
        </div>
        {isMobile && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  );
}