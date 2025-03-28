import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Brain, AtSign, Lock, ArrowRight, UserPlus } from "lucide-react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Tentando login com:", { username });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      console.log("Status da resposta:", response.status);

      const data = await response.json();
      console.log("Resposta recebida:", data.message);

      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      // Verificação adicional para garantir que o token existe
      if (!data.token) {
        throw new Error("Token não fornecido pelo servidor");
      }

      // Store the token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login bem-sucedido, redirecionando...");

      toast.success("Login realizado com sucesso", {
        description: "Bem-vindo de volta!",
      });

      // Redirect to dashboard - usando replace para forçar uma nova navegação
      router.push("/dashboard");
    } catch (err) {
      console.error("Erro completo:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">DASS-21 App</h1>
        <p className="text-muted-foreground mt-2">
          Sistema de Avaliação DASS-21
        </p>
      </div>

      <Card className="border-none shadow-blue overflow-hidden">
        <div className="h-2 bg-primary w-full"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Entre com seu usuário e senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-none shadow-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Usuário ou Email
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                  placeholder="Seu nome de usuário ou email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push("/forgot-password")}
                >
                  Esqueceu a senha?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                "Entrando..."
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-muted/30 py-6">
          <div className="text-center text-sm text-muted-foreground">
            Não possui uma conta?
          </div>
          <Button
            variant="outline"
            className="w-full border-primary/20 text-primary hover:bg-primary/5"
            onClick={() => router.push("/register")}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Criar uma conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
