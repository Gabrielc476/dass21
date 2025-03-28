import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  FilePlus,
  Upload,
  Eye,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AssessmentList({ patientId }) {
  const [assessments, setAssessments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAssessments();
  }, [patientId]);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dass21/patient/${patientId}/assessments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar avaliações");
      }

      const data = await response.json();
      setAssessments(data.assessments || []);
      setPatient(data.patient);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!assessmentToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dass21/assessment/${assessmentToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover avaliação");
      }

      // Remove assessment from the list
      setAssessments(assessments.filter((a) => a.id !== assessmentToDelete.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setAssessmentToDelete(null);
    }
  };

  const confirmDelete = (assessment) => {
    setAssessmentToDelete(assessment);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Helper function to get color by level
  const getLevelColor = (level) => {
    switch (level) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "Leve":
        return "bg-blue-100 text-blue-800";
      case "Moderado":
        return "bg-yellow-100 text-yellow-800";
      case "Severo":
        return "bg-orange-100 text-orange-800";
      case "Extremamente Severo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/patients")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">
          Avaliações de {patient?.name}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Idade: {patient?.age || "-"} | Gênero: {patient?.gender || "-"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/patients/${patientId}/upload`)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button
            onClick={() => router.push(`/patients/${patientId}/new-assessment`)}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <FilePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Nenhuma avaliação encontrada
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comece adicionando uma nova avaliação DASS-21 para este paciente.
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/patients/${patientId}/upload`)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button
              onClick={() =>
                router.push(`/patients/${patientId}/new-assessment`)
              }
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Avaliação de {formatDate(assessment.date)}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        router.push(
                          `/patients/${patientId}/assessments/${assessment.id}`
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => confirmDelete(assessment)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 rounded bg-muted/30">
                    <span className="text-sm font-medium mb-1">Depressão</span>
                    <span className="text-xl font-bold">
                      {assessment.depression.score}
                    </span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 mt-1 ${getLevelColor(
                        assessment.depression.level
                      )}`}
                    >
                      {assessment.depression.level}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded bg-muted/30">
                    <span className="text-sm font-medium mb-1">Ansiedade</span>
                    <span className="text-xl font-bold">
                      {assessment.anxiety.score}
                    </span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 mt-1 ${getLevelColor(
                        assessment.anxiety.level
                      )}`}
                    >
                      {assessment.anxiety.level}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded bg-muted/30">
                    <span className="text-sm font-medium mb-1">Estresse</span>
                    <span className="text-xl font-bold">
                      {assessment.stress.score}
                    </span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 mt-1 ${getLevelColor(
                        assessment.stress.level
                      )}`}
                    >
                      {assessment.stress.level}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!assessmentToDelete}
        onOpenChange={() => setAssessmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
