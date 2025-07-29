'use client';
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        {!isMobile && (
          <Sidebar variant="sidebar" collapsible="icon">
            <AppSidebar />
          </Sidebar>
        )}
        <SidebarInset>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
