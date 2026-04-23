import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/platform/Sidebar";
import { Header } from "@/components/platform/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen w-full">
        <Header className="sticky top-0 z-50 flex-none h-14 border-b" />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <SidebarInset className="flex-1 overflow-auto">
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}