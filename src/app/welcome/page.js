"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, LogIn, Brain, BarChart2, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Verificar se já está autenticado
    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log(token);
        // Se já tiver token, vai direto para o dashboard
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Bem-vindo ao DASS-21 App
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sistema para avaliação de Depressão, Ansiedade e Estresse através da
            escala DASS-21.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Brain className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Avaliação DASS-21</CardTitle>
              <CardDescription>
                Utilize a escala validada para avaliar sintomas de depressão,
                ansiedade e estresse.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <UserCircle className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Gestão de Pacientes</CardTitle>
              <CardDescription>
                Acompanhe seus pacientes e seus históricos de avaliações.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <BarChart2 className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Análise de Resultados</CardTitle>
              <CardDescription>
                Visualize e acompanhe a evolução dos pacientes ao longo do
                tempo.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Caixa mais destacada para primeiro acesso */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-8">
          <div className="text-center max-w-lg mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Primeiro acesso ao sistema
            </h2>
            <p className="text-muted-foreground">
              Para utilizar o sistema, você precisa criar uma conta ou fazer
              login caso já tenha uma.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white py-6"
                onClick={() => router.push("/register")}
              >
                <UserPlus className="mr-3 h-5 w-5" />
                <span className="text-base">Criar uma conta</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="py-6"
                onClick={() => router.push("/login")}
              >
                <LogIn className="mr-3 h-5 w-5" />
                <span className="text-base">Fazer login</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
