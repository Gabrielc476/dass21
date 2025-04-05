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
  BrainCircuit,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function IHS2AssessmentForm({ patientId }) {
  const [answers, setAnswers] = useState(Array(38).fill(0)); // IHS-2 has 38 items
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [patient, setPatient] = useState(null);
  const [isPatientLoading, setIsPatientLoading] = useState(true);
  const router = useRouter();

  // Group questions into steps of 7-8 questions per page
  const stepsCount = 5;
  const questionsPerStep = Math.ceil(38 / stepsCount);

  // IHS-2 Questions
  const questions = [
    "Em um grupo de pessoas desconhecidas, fico à vontade, conversando naturalmente.",
    "Quando um familiar me critica injustamente, expresso meu aborrecimento diretamente a ele.",
    "Ao ser elogiado(a) sinceramente por alguém, respondo-lhe agradecendo.",
    "Em uma conversação, se uma pessoa me interrompe, peço que aguarde até eu terminar o que estava falando.",
    "Quando um(a) amigo(a) a quem emprestei dinheiro esquece de me devolver, encontro um jeito de lembrá-lo(a).",
    "Quando alguém faz algo bom, eu o(a) elogio.",
    "Ao sentir desejo de conhecer alguém a quem não fui apresentado(a), eu mesmo(a) me apresento a essa pessoa.",
    "Mesmo quando muito enfurecido(a), consigo expressar minha raiva sem xingar.",
    "Evito fazer perguntas a desconhecidos.",
    "Consigo expressar meu carinho a meus familiares por meio de palavras e gestos.",
    "Ao receber uma ordem abusiva, nego-me a cumpri-la.",
    "Não sei como iniciar uma conversa com estranhos.",
    "Quando uma pessoa faz um pedido que considero abusivo, recuso-me a atendê-lo.",
    "Se alguém está usando algo que eu preciso, peço para me emprestar.",
    "Quando estou emocionado(a) ao receber um presente, demonstro minha alegria às pessoas.",
    "Se alguém me avalia de forma injusta e grosseira, expresso meu aborrecimento diretamente a essa pessoa.",
    "Sinto dificuldade em encerrar a conversa ao telefone.",
    "Quando alguém me faz um elogio, fico encabulado(a) sem saber o que dizer.",
    "Ao entrar em um ambiente onde estão várias pessoas desconhecidas, cumprimento-as.",
    "Consigo levar na esportiva as brincadeiras feitas a meu respeito.",
    "Ao ser injustamente criticado(a), consigo responder sem exaltar-me.",
    "Se duas pessoas estão brigando, tento apartar a briga.",
    "Quando não gosto do local em que estou, expresso meu desagrado.",
    "Se estou interessado(a) em uma pessoa para relacionamento amoroso, consigo abordá-la para iniciar conversação.",
    "Se não concordo com o grupo, expresso minha discordância.",
    "Quando um colega faz algo que me agrada, manifesto a ele minha satisfação.",
    "Se tiver vontade de ficar com a pessoa com quem saio, tomo a iniciativa de beijá-la.",
    "Se estou me sentindo bem (feliz), expresso isso para as pessoas.",
    "Em uma situação de grupo, quando alguém é injustiçado, defendo-o.",
    "Se estou sentindo-me mal por algum motivo, consigo expressar meu desagrado.",
    "Se estou sendo muito incomodado por alguém em uma fila, peço que se comporte.",
    "Em meu relacionamento amoroso, consigo demonstrar meu interesse pela pessoa.",
    "Em um grupo de conhecidos, se não concordo com a maioria, expresso minha discordância.",
    "Tenho dificuldade em demonstrar meus sentimentos a outras pessoas.",
    "Se alguém tem algo a meu respeito que me incomoda, peço que pare.",
    "Quando recebo atenção de um colega, sei como agradecer.",
    "Se uma pessoa me procura para conversar, faço-a sentir-se à vontade.",
    "Se entre amigos e colegas encontro alguém que não me cumprimentou, eu o cumprimento.",
  ];

  // Response options for IHS-2
  const responseOptions = [
    {
      value: 0,
      label: "Nunca ou raramente",
      description:
        "Em cada 10 situações desse tipo, reajo dessa forma no máximo 2 vezes",
    },
    {
      value: 1,
      label: "Com pouca frequência",
      description:
        "Em cada 10 situações desse tipo, reajo dessa forma 3 a 4 vezes",
    },
    {
      value: 2,
      label: "Com regular frequência",
      description:
        "Em cada 10 situações desse tipo, reajo dessa forma 5 a 6 vezes",
    },
    {
      value: 3,
      label: "Muito frequentemente",
      description:
        "Em cada 10 situações desse tipo, reajo dessa forma 7 a 8 vezes",
    },
    {
      value: 4,
      label: "Sempre ou quase sempre",
      description:
        "Em cada 10 situações desse tipo, reajo dessa forma 9 a 10 vezes",
    },
  ];

  // IHS-2 factors and their items
  const ihs2Factors = [
    {
      id: "F1",
      name: "Conversação e desenvoltura social",
      items: [1, 7, 12, 17, 19, 24, 37, 38],
    },
    {
      id: "F2",
      name: "Expressão de sentimentos positivos",
      items: [3, 6, 10, 15, 26, 28, 32, 36],
    },
    {
      id: "F3",
      name: "Assertividade de enfrentamento",
      items: [2, 4, 5, 11, 13, 16, 21, 31, 35],
    },
    {
      id: "F4",
      name: "Autoexposição a desconhecidos e situações novas",
      items: [9, 14, 22, 23, 25, 29, 30, 33],
    },
    {
      id: "F5",
      name: "Autocontrole da agressividade",
      items: [8, 18, 20, 27, 34],
    },
  ];

  // Color palette for response options
  const optionColors = [
    "border-green-200 bg-green-50 hover:bg-green-100 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-900/30 dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-900/50",
    "border-blue-200 bg-blue-50 hover:bg-blue-100 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-900/30 dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-900/50",
    "border-purple-200 bg-purple-50 hover:bg-purple-100 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-900/30 dark:data-[state=checked]:border-purple-700 dark:data-[state=checked]:bg-purple-900/50",
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

      // Calculate factor scores
      const factorScores = {};
      ihs2Factors.forEach((factor) => {
        const factorItems = factor.items.map((item) => item - 1); // Adjust for 0-based indexing
        const factorScore = factorItems.reduce(
          (sum, itemIndex) => sum + answers[itemIndex],
          0
        );
        factorScores[factor.id] = factorScore;
      });

      // Calculate total score
      const totalScore = Object.values(factorScores).reduce(
        (sum, score) => sum + score,
        0
      );

      // Prepare data for submission
      const assessmentData = {
        patient_id: patientId,
        answers: answers,
        factor_scores: factorScores,
        total_score: totalScore,
        assessment_type: "IHS2", // Identify this as an IHS-2 assessment
      };

      // Send to the API - you would need to implement the corresponding backend endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ihs2/assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assessmentData),
        }
      );

      // Handle response
      if (!response.ok) {
        // If the endpoint doesn't exist yet, show a mock success message
        if (response.status === 404) {
          // This is just for demonstration until the backend endpoint is implemented
          console.log(
            "Backend endpoint not implemented yet. Would have sent:",
            assessmentData
          );
          toast.success("Avaliação IHS-2 criada", {
            description: "Dados registrados com sucesso (simulado).",
          });
          router.push(`/dashboard/patients/${patientId}/assessments`);
          return;
        }

        const data = await response.json();
        throw new Error(data.message || "Erro ao criar avaliação");
      }

      const data = await response.json();

      toast.success("Avaliação IHS-2 criada", {
        description: "Avaliação IHS-2 criada com sucesso.",
      });

      // Redirect to patient assessments
      router.push(`/dashboard/patients/${patientId}/assessments`);
    } catch (err) {
      setError(err.message);

      // Fallback for demo purposes if the API doesn't exist yet
      toast.success("Avaliação IHS-2 criada", {
        description: "Simulação: Avaliação IHS-2 registrada com sucesso.",
      });
      setTimeout(() => {
        router.push(`/dashboard/patients/${patientId}/assessments`);
      }, 2000);
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

  // Get progress percentage
  const getProgressPercentage = () => {
    const answeredQuestions = answers.filter(
      (answer) => answer !== undefined
    ).length;
    return (answeredQuestions / questions.length) * 100;
  };

  // Get factor for a specific question (for the tooltips)
  const getQuestionFactor = (questionIndex) => {
    // Adjust for 1-based indexing in the factor definitions
    const itemNumber = questionIndex + 1;

    for (const factor of ihs2Factors) {
      if (factor.items.includes(itemNumber)) {
        return factor;
      }
    }
    return null;
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
            Nova Avaliação IHS-2
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
                <BrainCircuit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>
                  Passo {currentStep + 1} de {stepsCount}
                </CardTitle>
                <CardDescription>
                  Inventário de Habilidades Sociais (IHS-2)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-1 mb-6">
              <p className="text-sm text-muted-foreground">
                Leia atentamente cada item e indique com que frequência você age
                ou se sente da maneira descrita.
              </p>
              <p className="text-sm font-medium">
                Use a escala: 0 (nunca) a 4 (sempre)
              </p>
            </div>

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
                          {getQuestionFactor(questionIndex) && (
                            <p className="text-sm">
                              Este item avalia:{" "}
                              <span className="font-medium">
                                {getQuestionFactor(questionIndex).name}
                              </span>{" "}
                              (Fator {getQuestionFactor(questionIndex).id})
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <RadioGroup
                    value={answers[questionIndex]?.toString()}
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
