"use client";

// Esse é o componente da rota raiz "/"
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirecionamos o usuário diretamente para /welcome
  // Isso é mais confiável do que tentar fazer verificações de autenticação aqui

  // Usando o hook useEffect para garantir que isso só aconteça no cliente
  useEffect(() => {
    // Redirecionamos para a página de boas-vindas
    window.location.href = "/welcome";
  }, []);

  // Enquanto o redirecionamento acontece, não mostramos nada
  return null;
}
