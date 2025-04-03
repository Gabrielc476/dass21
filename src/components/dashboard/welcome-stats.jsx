// src/components/dashboard/welcome-stats.jsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCircle,
  FileText,
  BarChart2,
  Activity,
  TrendingUp,
  Brain,
  Info,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { DemographicAnalysis } from "./demographic-analysis";

export function WelcomeStats() {
  const [stats, setStats] = useState({
    patients: 0,
    assessments: 0,
    recentAssessments: 0,
  });
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obter informações do usuário
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.username);
    }

    // Buscar estatísticas da API
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      // Formato correto para o header de autorização
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 1. Buscar estatísticas de pacientes
      const patientsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patients`,
        {
          method: "GET",
          headers: headers,
        }
      );

      // 2. Buscar estatísticas de avaliações
      const assessmentsPromise = fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dass21/assessment/stats`,
        {
          method: "GET",
          headers: headers,
        }
      ).catch((err) => {
        console.warn("Endpoint de estatísticas não disponível:", err);
        return { ok: false };
      });

      // Processamos a resposta dos pacientes
      if (!patientsResponse.ok) {
        console.error(
          "Erro na resposta de pacientes:",
          patientsResponse.status
        );
        throw new Error("Erro ao buscar estatísticas de pacientes");
      }

      const patientsData = await patientsResponse.json();

      // Tentamos processar a resposta de avaliações
      const assessmentsResponse = await assessmentsPromise;
      let assessmentsData = { total: 0, recent: 0 };

      if (assessmentsResponse.ok) {
        assessmentsData = await assessmentsResponse.json();
      } else {
        console.warn("Usando valores padrão para estatísticas de avaliações");
      }

      // Atualizamos o estado com os dados obtidos
      setStats({
        patients: patientsData.patients?.length || 0,
        assessments: assessmentsData.total || 0,
        recentAssessments: assessmentsData.recent || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);

      // Notificar o usuário sobre o erro
      toast.error("Erro ao carregar estatísticas", {
        description: "Verifique sua conexão e tente novamente mais tarde.",
      });

      // Definir valores vazios para estatísticas
      setStats({
        patients: 0,
        assessments: 0,
        recentAssessments: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Bom dia";
    if (hours < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header with Gradient */}
      <div className="bg-gradient-blue text-white p-6 rounded-xl shadow-blue-lg">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {getCurrentTime()},{" "}
          <span className="font-extrabold">{userName}!</span>
        </h1>
        <p className="opacity-90">
          Bem-vindo ao sistema de avaliação DASS-21. Veja abaixo o resumo das
          suas atividades.
        </p>
      </div>

      {/* Stats Cards with modern design */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-none shadow-blue transition-all duration-200 hover:shadow-blue-lg">
          <div className="h-2 bg-primary w-full"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Total de Pacientes
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">
                  {stats.patients}
                </div>
                <Progress
                  value={Math.min(stats.patients * 5, 100)}
                  className="h-1.5 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Pacientes cadastrados no sistema
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-blue transition-all duration-200 hover:shadow-blue-lg">
          <div className="h-2 bg-chart-2 w-full"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Total de Avaliações
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-chart-2">
                  {stats.assessments}
                </div>
                <Progress
                  value={Math.min(stats.assessments * 2, 100)}
                  className="h-1.5 mt-2"
                  indicatorClassName="bg-chart-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Avaliações DASS-21 realizadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-blue transition-all duration-200 hover:shadow-blue-lg">
          <div className="h-2 bg-chart-3 w-full"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Avaliações Recentes
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-chart-3">
                  {stats.recentAssessments}
                </div>
                <Progress
                  value={Math.min(stats.recentAssessments * 3, 100)}
                  className="h-1.5 mt-2"
                  indicatorClassName="bg-chart-3"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Avaliações nos últimos 30 dias
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Demographic Analysis Component */}
      <DemographicAnalysis />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="rounded-md data-[state=active]:shadow-blue"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="rounded-md data-[state=active]:shadow-blue"
          >
            <Info className="mr-2 h-4 w-4" />
            Recursos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-none shadow-blue overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Sobre o DASS-21</CardTitle>
                  <CardDescription>
                    A escala de auto-relato que avalia sintomas de depressão,
                    ansiedade e estresse
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="text-muted-foreground">
                A Escala de Depressão, Ansiedade e Estresse (DASS-21) é composta
                por 21 itens, divididos igualmente em três subescalas. Os
                resultados são calculados pela soma dos escores dos itens de
                cada uma das três subescalas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-5 rounded-lg border border-primary/5 shadow-sm">
                  <h3 className="font-medium flex items-center text-primary">
                    <span className="w-3 h-3 rounded-full bg-chart-1 mr-2"></span>
                    Depressão
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    Perguntas 3, 5, 10, 13, 16, 17, 21
                  </p>
                </div>
                <div className="bg-muted/30 p-5 rounded-lg border border-primary/5 shadow-sm">
                  <h3 className="font-medium flex items-center text-chart-2">
                    <span className="w-3 h-3 rounded-full bg-chart-2 mr-2"></span>
                    Ansiedade
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    Perguntas 2, 4, 7, 8, 9, 15, 19
                  </p>
                </div>
                <div className="bg-muted/30 p-5 rounded-lg border border-primary/5 shadow-sm">
                  <h3 className="font-medium flex items-center text-chart-3">
                    <span className="w-3 h-3 rounded-full bg-chart-3 mr-2"></span>
                    Estresse
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    Perguntas 1, 6, 11, 12, 14, 18, 20
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card className="border-none shadow-blue">
            <CardHeader className="bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Recursos Úteis</CardTitle>
                  <CardDescription>
                    Links e materiais de referência sobre o DASS-21 e saúde
                    mental
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-muted/20 p-4 rounded-lg border border-primary/5">
                  <h3 className="font-medium text-primary mb-2">
                    Documentação Oficial
                  </h3>
                  <a
                    href="https://www2.psy.unsw.edu.au/groups/dass/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-2 text-sm"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span>
                    Site oficial do DASS
                  </a>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg border border-primary/5">
                  <h3 className="font-medium text-chart-2 mb-2">
                    Publicações Científicas
                  </h3>
                  <a
                    href="https://www.scielo.br/j/jbpsiq/a/X7gQZ9fZPXGRhvZRZHJLxWF/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-2 text-sm"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-chart-2 mr-1"></span>
                    Validação brasileira do DASS-21
                  </a>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg border border-primary/5">
                  <h3 className="font-medium text-chart-3 mb-2">
                    Recursos Profissionais
                  </h3>
                  <a
                    href="https://www.cfp.org.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-2 text-sm"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-chart-3 mr-1"></span>
                    Conselho Federal de Psicologia
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
