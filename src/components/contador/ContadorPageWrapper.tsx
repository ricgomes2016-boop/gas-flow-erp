import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ContadorLayout } from "@/components/contador/ContadorLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { ChatContador } from "@/components/contador/ChatContador";

interface ContadorPageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function ContadorPageWrapper({ children, title, subtitle }: ContadorPageWrapperProps) {
  const { roles } = useAuth();
  const isContador = roles.includes("contador");

  if (isContador) {
    return (
      <ContadorLayout>
        <ChatContador />
        {children}
      </ContadorLayout>
    );
  }

  return (
    <MainLayout>
      {title && <Header title={title} subtitle={subtitle || ""} />}
      <ChatContador />
      {children}
    </MainLayout>
  );
}
