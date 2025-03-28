"use client";

import { NavMenu } from "@/components/dashboard/nav-menu";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("Usuário não autenticado, redirecionando para welcome");
          window.location.href = "/welcome";
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        window.location.href = "/welcome";
      } finally {
        setIsLoading(false);
      }
    };

    // Pequeno delay para garantir que o localStorage está disponível
    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Enquanto verifica a autenticação, mostra uma tela vazia ou loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, não mostra nada (o redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null;
  }

  // Se estiver autenticado, mostra o layout do dashboard
  return (
    <div className="min-h-screen flex flex-col">
      <NavMenu />
      <main className="flex-1 container mx-auto p-4 md:p-6">{children}</main>
      <Toaster />
    </div>
  );
}
