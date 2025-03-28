"use client";

import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    try {
      const token = localStorage.getItem("token");
      if (token) {
        router.replace("/");
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">DASS-21 App</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Avaliação DASS-21
          </p>
        </div>

        {/* Botão destacado para registro */}
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
          <h2 className="font-medium mb-2">Primeiro acesso?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Você precisa criar uma conta para acessar o sistema.
          </p>
          <Button className="w-full" onClick={() => router.push("/register")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Criar uma conta
          </Button>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
