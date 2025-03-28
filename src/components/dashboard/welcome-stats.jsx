import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, FileText, BarChart2, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getCurrentTime()}, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao sistema de avaliação DASS-21. Veja abaixo o resumo das
          suas atividades.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pacientes
            </CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.patients}</div>
                <p className="text-xs text-muted-foreground">
                  Pacientes cadastrados no sistema
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Avaliações
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.assessments}</div>
                <p className="text-xs text-muted-foreground">
                  Avaliações DASS-21 realizadas
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avaliações Recentes
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.recentAssessments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avaliações nos últimos 30 dias
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o DASS-21</CardTitle>
              <CardDescription>
                O DASS-21 é uma escala de auto-relato que avalia sintomas de
                depressão, ansiedade e estresse.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A Escala de Depressão, Ansiedade e Estresse (DASS-21) é composta
                por 21 itens, divididos igualmente em três subescalas. Os
                resultados são calculados pela soma dos escores dos itens de
                cada uma das três subescalas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-3 rounded">
                  <h3 className="font-medium flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    Depressão
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perguntas 3, 5, 10, 13, 16, 17, 21
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <h3 className="font-medium flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                    Ansiedade
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perguntas 2, 4, 7, 8, 9, 15, 19
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <h3 className="font-medium flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    Estresse
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perguntas 1, 6, 11, 12, 14, 18, 20
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Úteis</CardTitle>
              <CardDescription>
                Links e materiais de referência sobre o DASS-21 e saúde mental.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <a
                    href="https://www2.psy.unsw.edu.au/groups/dass/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Site oficial do DASS
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.scielo.br/j/jbpsiq/a/X7gQZ9fZPXGRhvZRZHJLxWF/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Validação brasileira do DASS-21
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.cfp.org.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Conselho Federal de Psicologia
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
