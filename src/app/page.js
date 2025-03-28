"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { WelcomeStats } from "@/components/dashboard/welcome-stats";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    try {
      const token = localStorage.getItem("token");

      // Sempre verificar se o token existe
      if (!token) {
        // Se não autenticado, redirecionar para o login
        router.push("/login");
      } else {
        // Se autenticado, apenas exibir o dashboard
        setIsLoading(false);
      }
    } catch (error) {
      // Erro ao acessar localStorage (ex: SSR)
      console.error("Erro ao verificar autenticação:", error);
      // Não fazemos nada no SSR, vamos esperar o lado do cliente
    }
  }, [pathname]);

  // Se não está mais carregando, mostra o dashboard
  if (!isLoading) {
    return <WelcomeStats />;
  }

  // Exibir um skeleton loading enquanto decide o redirecionamento
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-4 w-48 mx-auto" />
      <div className="space-y-2 mt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
