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
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

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
        return "text-green-600";
      case "Leve":
        return "text-blue-600";
      case "Moderado":
        return "text-yellow-600";
      case "Severo":
        return "text-orange-600";
      case "Extremamente Severo":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Helper function to get bg color by level
  const getLevelBgColor = (level) => {
    switch (level) {
      case "Normal":
        return "bg-green-600";
      case "Leve":
        return "bg-blue-600";
      case "Moderado":
        return "bg-yellow-600";
      case "Severo":
        return "bg-orange-600";
      case "Extremamente Severo":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Avaliação não encontrada</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(`/dashboard/patients/${patientId}/assessments`)
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">
          Resultado da Avaliação DASS-21
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <UserCircle className="mr-2 h-5 w-5" />
              Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-semibold">{patient?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Idade: {patient?.age || "-"} | Gênero:{" "}
                  {patient?.gender || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Data da avaliação
                </p>
                <p className="font-medium">{formatDate(assessment.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método</p>
                <p className="font-medium">
                  {assessment.ocr_processed
                    ? "Processamento OCR"
                    : "Preenchimento manual"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BarChart2 className="mr-2 h-5 w-5" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Depressão</p>
                  <p
                    className={`font-semibold ${getLevelColor(
                      assessment.depression.level
                    )}`}
                  >
                    {assessment.depression.level}
                  </p>
                </div>
                <Progress
                  value={(assessment.depression.score / 42) * 100}
                  className="h-2 mt-1"
                  indicatorClassName={getLevelBgColor(
                    assessment.depression.level
                  )}
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Ansiedade</p>
                  <p
                    className={`font-semibold ${getLevelColor(
                      assessment.anxiety.level
                    )}`}
                  >
                    {assessment.anxiety.level}
                  </p>
                </div>
                <Progress
                  value={(assessment.anxiety.score / 42) * 100}
                  className="h-2 mt-1"
                  indicatorClassName={getLevelBgColor(assessment.anxiety.level)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Estresse</p>
                  <p
                    className={`font-semibold ${getLevelColor(
                      assessment.stress.level
                    )}`}
                  >
                    {assessment.stress.level}
                  </p>
                </div>
                <Progress
                  value={(assessment.stress.score / 42) * 100}
                  className="h-2 mt-1"
                  indicatorClassName={getLevelBgColor(assessment.stress.level)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed scores */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento da Avaliação</CardTitle>
          <CardDescription>
            Todas as respostas do questionário DASS-21
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Depressão (Score: {assessment.depression.score})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <p className="text-sm">
                    Perguntas relacionadas à depressão no DASS-21: 3, 5, 10, 13,
                    16, 17, 21
                  </p>
                  <div className="space-y-2">
                    {[2, 4, 9, 12, 15, 16, 20].map((questionIndex) => (
                      <div
                        key={questionIndex}
                        className="py-2 border-b last:border-0"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {questions[questionIndex]}
                          </div>
                          <div className="text-sm font-semibold">
                            {assessment.answers[questionIndex]}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {responseOptions[assessment.answers[questionIndex]]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Ansiedade (Score: {assessment.anxiety.score})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <p className="text-sm">
                    Perguntas relacionadas à ansiedade no DASS-21: 2, 4, 7, 8,
                    9, 15, 19
                  </p>
                  <div className="space-y-2">
                    {[1, 3, 6, 7, 8, 14, 18].map((questionIndex) => (
                      <div
                        key={questionIndex}
                        className="py-2 border-b last:border-0"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {questions[questionIndex]}
                          </div>
                          <div className="text-sm font-semibold">
                            {assessment.answers[questionIndex]}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {responseOptions[assessment.answers[questionIndex]]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Estresse (Score: {assessment.stress.score})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <p className="text-sm">
                    Perguntas relacionadas ao estresse no DASS-21: 1, 6, 11, 12,
                    14, 18, 20
                  </p>
                  <div className="space-y-2">
                    {[0, 5, 10, 11, 13, 17, 19].map((questionIndex) => (
                      <div
                        key={questionIndex}
                        className="py-2 border-b last:border-0"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {questions[questionIndex]}
                          </div>
                          <div className="text-sm font-semibold">
                            {assessment.answers[questionIndex]}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {responseOptions[assessment.answers[questionIndex]]}
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
    </div>
  );
}
