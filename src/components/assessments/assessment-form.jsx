import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function AssessmentForm({ patientId }) {
  const [answers, setAnswers] = useState(Array(21).fill(0));
  const [isLoading, setIsLoading] = useState(false);
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
    { value: 0, label: "Não se aplicou de maneira alguma" },
    { value: 1, label: "Aplicou-se em algum grau, ou por pouco tempo" },
    {
      value: 2,
      label:
        "Aplicou-se em um grau considerável, ou por uma boa parte do tempo",
    },
    { value: 3, label: "Aplicou-se muito, ou na maioria do tempo" },
  ];

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/dashboard/patients/${patientId}/assessments`)
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl ml-2">
            Nova Avaliação DASS-21
          </CardTitle>
        </div>
        <CardDescription>
          Preencha o questionário DASS-21 baseado em como o paciente se sentiu
          na última semana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-8">
            {questions.map((question, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-medium">
                    {index + 1}. {question}
                  </div>
                  <div className="text-sm bg-muted px-2 py-1 rounded">
                    Valor: {answers[index]}
                  </div>
                </div>

                <RadioGroup
                  value={answers[index]}
                  onValueChange={(value) =>
                    handleAnswerChange(index, parseInt(value))
                  }
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {responseOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 bg-muted/30 p-2 rounded"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`q${index}-o${option.value}`}
                      />
                      <Label
                        htmlFor={`q${index}-o${option.value}`}
                        className="text-sm"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/patients/${patientId}/assessments`)
              }
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Avaliação"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
