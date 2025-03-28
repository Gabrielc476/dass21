import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  UserCircle,
  BarChart2,
  Calendar,
  ClipboardCheck,
  Brain,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function AssessmentResults({ patientId, assessmentId }) {
  const [assessment, setAssessment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // DASS-21 Questions
  const questions = [
    "Achei difícil me acalmar",
    "Senti minha boca seca",
    "Não consegui vivenciar nenhum sentimento positivo",
    "Tive dificuldade em respirar em alguns momentos (ex. respiração ofegante, falta de ar, sem ter feito nenhum esforço físico)",
    "Achei difícil ter iniciativa para fazer as coisas",
    "Tive a tendência de reagir de forma exagerada às situações",
    "Senti tremores (ex. nas mãos)",
    "Senti que estava sempre nervoso",
    "Preocupei-me com situações em que eu pudesse entrar em pânico e parecesse ridículo(a)",
    "Senti que não tinha nada a desejar",
    "Senti-me agitado",
    "Achei difícil relaxar",
    "Senti-me depressivo(a) e sem ânimo",
    "Fui intolerante com as coisas que me impediam de continuar o que eu estava fazendo",
    "Senti que ia entrar em pânico",
    "Não consegui me entusiasmar com nada",
    "Senti que não tinha muito valor como pessoa",
    "Senti que estava um pouco emotivo/sensível demais",
    "Sabia que meu coração estava alterado mesmo não tendo feito nenhum esforço físico (ex. aumento da frequência cardíaca, disritmia)",
    "Senti medo sem motivo",
    "Senti que a vida não tinha sentido",
  ];

  // Response options
  const responseOptions = [
    "Não se aplicou de maneira alguma",
    "Aplicou-se em algum grau, ou por pouco tempo",
    "Aplicou-se em um grau considerável, ou por uma boa parte do tempo",
    "Aplicou-se muito, ou na maioria do tempo",
  ];

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // First, get the assessment
      const assessmentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dass21/assessment/${assessmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!assessmentResponse.ok) {
        throw new Error("Erro ao carregar avaliação");
      }

      const assessmentData = await assessmentResponse.json();
      setAssessment(assessmentData.assessment);

      // Then, get the patient
      const patientResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!patientResponse.ok) {
        throw new Error("Erro ao carregar paciente");
      }

      const patientData = await patientResponse.json();
      setPatient(patientData.patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Helper function to get color by level
  const getLevelColor = (level) => {
    switch (level) {
      case "Normal":
        return "text-green-600 dark:text-green-400";
      case "Leve":
        return "text-blue-600 dark:text-blue-400";
      case "Moderado":
        return "text-yellow-600 dark:text-yellow-400";
      case "Severo":
        return "text-orange-600 dark:text-orange-400";
      case "Extremamente Severo":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // Helper function to get bg color by level
  const getLevelBgColor = (level) => {
    switch (level) {
      case "Normal":
        return "bg-green-600 dark:bg-green-500";
      case "Leve":
        return "bg-blue-600 dark:bg-blue-500";
      case "Moderado":
        return "bg-yellow-600 dark:bg-yellow-500";
      case "Severo":
        return "bg-orange-600 dark:bg-orange-500";
      case "Extremamente Severo":
        return "bg-red-600 dark:bg-red-500";
      default:
        return "bg-gray-600 dark:bg-gray-500";
    }
  };

  // Helper function to get badge by level
  const getLevelBadge = (level) => {
    switch (level) {
      case "Normal":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "Leve":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "Moderado":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "Severo":
        return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
      case "Extremamente Severo":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <Alert variant="destructive" className="border-none shadow-blue">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Avaliação não encontrada</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-primary/20"
          onClick={() =>
            router.push(`/dashboard/patients/${patientId}/assessments`)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Resultado da Avaliação DASS-21
          </h1>
          <p className="text-muted-foreground">
            Detalhes e pontuações da avaliação de {patient?.name}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-none shadow-blue">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary card with visual representation */}
      <Card className="overflow-hidden border-none shadow-blue">
        <div className="bg-gradient-blue text-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Resumo da Avaliação</h2>
              <p className="text-sm opacity-90">
                {formatDate(assessment.date)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Depressão</span>
                <Badge className={getLevelBadge(assessment.depression.level)}>
                  {assessment.depression.level}
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                {assessment.depression.score}
              </div>
              <Progress
                value={(assessment.depression.score / 42) * 100}
                className="h-1.5 mt-2 bg-white/20"
              />
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Ansiedade</span>
                <Badge className={getLevelBadge(assessment.anxiety.level)}>
                  {assessment.anxiety.level}
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                {assessment.anxiety.score}
              </div>
              <Progress
                value={(assessment.anxiety.score / 42) * 100}
                className="h-1.5 mt-2 bg-white/20"
              />
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Estresse</span>
                <Badge className={getLevelBadge(assessment.stress.level)}>
                  {assessment.stress.level}
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                {assessment.stress.score}
              </div>
              <Progress
                value={(assessment.stress.score / 42) * 100}
                className="h-1.5 mt-2 bg-white/20"
              />
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient information */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Paciente</h3>
                <p className="text-lg font-semibold mt-1">{patient?.name}</p>
                <div className="text-sm text-muted-foreground mt-1">
                  {patient?.age && `${patient.age} anos`}
                  {patient?.age && patient?.gender && " • "}
                  {patient?.gender}
                </div>
              </div>
            </div>

            {/* Assessment information */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <h3 className="font-medium">Data da Avaliação</h3>
                <p className="text-lg font-semibold mt-1">
                  {formatDate(assessment.date)}
                </p>
                <div className="text-sm text-muted-foreground mt-1">
                  {assessment.ocr_processed
                    ? "Processamento OCR"
                    : "Preenchimento manual"}
                </div>
              </div>
            </div>

            {/* Method information */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0">
                <ClipboardCheck className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <h3 className="font-medium">Resultado Geral</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/10"
                  >
                    Depressão: {assessment.depression.level}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-chart-2/5 border-chart-2/10"
                  >
                    Ansiedade: {assessment.anxiety.level}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-chart-3/5 border-chart-3/10"
                  >
                    Estresse: {assessment.stress.level}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed scores */}
      <Card className="border-none shadow-blue">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Detalhamento da Avaliação</CardTitle>
              <CardDescription>
                Todas as respostas do questionário DASS-21
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="item-1"
              className="border-b border-primary/10"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {assessment.depression.score}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Depressão</div>
                    <div
                      className={`text-sm ${getLevelColor(
                        assessment.depression.level
                      )}`}
                    >
                      {assessment.depression.level}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    Perguntas relacionadas à depressão no DASS-21: 3, 5, 10, 13,
                    16, 17, 21
                  </div>
                  <div className="space-y-0">
                    {[2, 4, 9, 12, 15, 16, 20].map((questionIndex) => (
                      <div
                        key={questionIndex}
                        className="py-3 px-4 border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {assessment.answers[questionIndex]}
                            </div>
                            <div>
                              <div className="font-medium">
                                {questions[questionIndex]}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {
                                  responseOptions[
                                    assessment.answers[questionIndex]
                                  ]
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-2"
              className="border-b border-chart-2/10"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-chart-2">
                      {assessment.anxiety.score}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Ansiedade</div>
                    <div
                      className={`text-sm ${getLevelColor(
                        assessment.anxiety.level
                      )}`}
                    >
                      {assessment.anxiety.level}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    Perguntas relacionadas à ansiedade no DASS-21: 2, 4, 7, 8,
                    9, 15, 19
                  </div>
                  <div className="space-y-0">
                    {[1, 3, 6, 7, 8, 14, 18].map((questionIndex) => (
                      <div
                        key={questionIndex}
                        className="py-3 px-4 border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-chart-2/5 border border-chart-2/10 flex items-center justify-center text-sm font-medium text-chart-2">
                              {assessment.answers[questionIndex]}
                            </div>
                            <div>
                              <div className="font-medium">
                                {questions[questionIndex]}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {
                                  responseOptions[
                                    assessment.answers[questionIndex]
                                  ]
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-3"
              className="border-b border-chart-3/10"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-chart-3">
                      {assessment.stress.score}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Estresse</div>
                    <div
                      className={`text-sm ${getLevelColor(
                        assessment.stress.level
                      )}`}
                    >
                      {assessment.stress.level}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    Perguntas relacionadas ao estresse no DASS-21: 1, 6, 11, 12,
                    14, 18, 20
                  </div>
                  <div className="space-y-0">
                    {[0, 5, 10, 11, 13, 17, 19].map((questionIndex) => (
                      <div
                        key={questionIndex}
                        className="py-3 px-4 border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-chart-3/5 border border-chart-3/10 flex items-center justify-center text-sm font-medium text-chart-3">
                              {assessment.answers[questionIndex]}
                            </div>
                            <div>
                              <div className="font-medium">
                                {questions[questionIndex]}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {
                                  responseOptions[
                                    assessment.answers[questionIndex]
                                  ]
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          className="border-primary/20"
          onClick={() =>
            router.push(`/dashboard/patients/${patientId}/assessments`)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Avaliações
        </Button>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Exportar Resultados
        </Button>
      </div>
    </div>
  );
}
