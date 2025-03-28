"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se o usuário está autenticado
    const token = localStorage.getItem("token");
    if (token) {
      // Se estiver autenticado, mantém na raiz (que mostrará o dashboard)
      console.log("Usuário autenticado, redirecionando para dashboard");
      router.push("/dashboard");
      setIsLoading(false);
    } else {
      // Se não estiver autenticado, redireciona para welcome
      console.log("Redirecionando para welcome (não autenticado)");
      router.push("/welcome");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Este retorno nunca será visto - o layout (dashboard) determinará o conteúdo
  return null;
}
