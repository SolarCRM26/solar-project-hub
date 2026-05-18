import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { Outlet } from 'react-router-dom';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

const DashboardLayout = () => {
  useRealtimeSync();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/90 select-none bg-muted/50 border border-border/60 px-3.5 py-1.5 rounded-full mr-5 shadow-sm">
              Solar Project Intelligence Platform
            </span>
            <NotificationBell />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
