import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

import { AiFloatingButton } from "@/components/ai/AiFloatingButton";
import { ChatOperador } from "@/components/chat/ChatOperador";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300 ml-0 pb-24 md:pb-0",
          collapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        {children}
      </main>
      <AiFloatingButton />
      <ChatOperador />
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </SidebarProvider>
  );
}
