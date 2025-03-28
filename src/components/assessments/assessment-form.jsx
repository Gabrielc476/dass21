import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  User,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AssessmentForm({ patientId }) {
  const [answers, setAnswers] = useState(Array(21).fill(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [patient, setPatient] = useState(null);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const router = useRouter();

  // Group questions into steps of 5 (the last one will have 6)
  const stepsCount = 5;
  const questionsPerStep = Math.ceil(21 / stepsCount);

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
    {
      value: 0,
      label: "Não se aplicou de maneira alguma",
      description: "O sintoma não foi vivenciado pelo paciente",
    },
    {
      value: 1,
      label: "Aplicou-se em algum grau ou por pouco tempo",
      description: "O sintoma ocorreu de forma leve ou por um período breve",
    },
    {
      value: 2,
      label: "Aplicou-se em um grau considerável ou por uma boa parte do tempo",
      description:
        "O sintoma ocorreu com intensidade moderada ou persistiu por um período significativo",
    },
    {
      value: 3,
      label: "Aplicou-se muito ou na maioria do tempo",
      description: "O sintoma foi intenso ou persistiu na maior parte do tempo",
    },
  ];

  // Color palette for response options
  const optionColors = [
    "border-green-200 bg-green-50 hover:bg-green-100 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-900/30 dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-900/50",
    "border-blue-200 bg-blue-50 hover:bg-blue-100 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-900/30 dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-900/50",
    "border-amber-200 bg-amber-50 hover:bg-amber-100 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-900/30 dark:data-[state=checked]:border-amber-700 dark:data-[state=checked]:bg-amber-900/50",
    "border-red-200 bg-red-50 hover:bg-red-100 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-900/30 dark:data-[state=checked]:border-red-700 dark:data-[state=checked]:bg-red-900/50",
  ];

  // Get patient information
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar informações do paciente");
        }

        const data = await response.json();
        setPatient(data.patient);
      } catch (err) {
        setError("Erro ao carregar dados do paciente: " + err.message);
      } finally {
        setIsPatientLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId, router]);

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dass21/assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patient_id: patientId,
            answers: answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar avaliação");
      }

      toast.success("Avaliação criada", {
        description: "Avaliação DASS-21 criada com sucesso.",
      });

      // Redirect to patient assessments
      router.push(`/dashboard/patients/${patientId}/assessments`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep < stepsCount - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Last step, submit the form
      handleSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Get current questions for the current step
  const getCurrentQuestions = () => {
    const start = currentStep * questionsPerStep;
    const end = Math.min(start + questionsPerStep, questions.length);
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  // Check if all questions in the current step are answered
  const isCurrentStepComplete = () => {
    const currentQuestions = getCurrentQuestions();
    return currentQuestions.every((index) => answers[index] !== undefined);
  };

  // Check if all questions are answered
  const isFormComplete = () => {
    return answers.every((answer) => answer !== undefined);
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    const answeredQuestions = answers.filter(
      (answer) => answer !== undefined
    ).length;
    return (answeredQuestions / questions.length) * 100;
  };

  if (isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
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
            Nova Avaliação DASS-21
          </h1>
          <p className="text-muted-foreground">
            Avaliando:{" "}
            <span className="font-medium text-foreground">{patient?.name}</span>{" "}
            • {patient?.age} anos
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-6 border-none shadow-blue">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progresso</span>
          <span className="font-medium">
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToNextStep();
        }}
      >
        <Card className="border-none shadow-blue overflow-hidden">
          <div className="h-2 bg-primary w-full"></div>
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>
                  Passo {currentStep + 1} de {stepsCount}
                </CardTitle>
                <CardDescription>
                  Preencha o questionário DASS-21 baseado em como o paciente se
                  sentiu na última semana.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {getCurrentQuestions().map((questionIndex) => (
                <div
                  key={questionIndex}
                  className="bg-muted/20 rounded-lg p-5 border border-primary/5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-medium flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0 mt-0.5">
                        {questionIndex + 1}
                      </div>
                      <div>{questions[questionIndex]}</div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">
                            Esta pergunta ajuda a avaliar{" "}
                            {[2, 4, 9, 12, 15, 16, 20].includes(questionIndex)
                              ? "depressão"
                              : [1, 3, 6, 7, 8, 14, 18].includes(questionIndex)
                              ? "ansiedade"
                              : "estresse"}
                            .
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <RadioGroup
                    value={answers[questionIndex].toString()}
                    onValueChange={(value) =>
                      handleAnswerChange(questionIndex, value)
                    }
                    className="space-y-3"
                  >
                    {responseOptions.map((option, idx) => (
                      <div
                        key={option.value}
                        className={`flex items-start space-x-2 rounded-lg border p-3.5 transition-colors ${optionColors[idx]}`}
                      >
                        <RadioGroupItem
                          value={option.value.toString()}
                          id={`q${questionIndex}-o${option.value}`}
                          className="mt-1"
                        />
                        <div className="grid gap-0.5">
                          <Label
                            htmlFor={`q${questionIndex}-o${option.value}`}
                            className="text-base font-medium"
                          >
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 bg-muted/30 border-t border-muted">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className="border-primary/20"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              type={currentStep === stepsCount - 1 ? "submit" : "button"}
              onClick={
                currentStep === stepsCount - 1 ? handleSubmit : goToNextStep
              }
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : currentStep === stepsCount - 1 ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              {currentStep === stepsCount - 1 ? "Finalizar" : "Próximo"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Navigation buttons at the bottom */}
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(`/dashboard/patients/${patientId}/assessments`)
          }
          className="border-primary/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Avaliações
        </Button>
      </div>
    </div>
  );
}
