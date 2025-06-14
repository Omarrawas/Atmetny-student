import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar 
          variant="sidebar" // Standard sidebar that pushes content
          side="right" // Sidebar on the right for RTL
          collapsible="icon" // Collapses to icons
          className="border-l" // Add border to the left of the sidebar in RTL (right edge of screen)
        >
          <AppSidebar />
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader />
          <SidebarInset> {/* This component handles the main content area adjustments */}
            <main className="flex-1 p-4 sm:p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
