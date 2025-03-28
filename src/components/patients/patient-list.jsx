import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
import {
  AlertCircle,
  Search,
  UserPlus,
  Edit,
  Trash2,
  ClipboardList,
  Calendar,
  User,
  Filter,
} from "lucide-react";

export function PatientList() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [viewType, setViewType] = useState("grid"); // grid or list
  const router = useRouter();

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/patients`;
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Erro na resposta:", response.status);
        throw new Error(`Erro ao carregar pacientes: ${response.statusText}`);
      }

      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error("Erro completo:", err);
      setError(err.message);
      toast.error("Erro ao carregar pacientes", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!patientToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover paciente");
      }

      // Remove patient from the list
      setPatients(patients.filter((p) => p.id !== patientToDelete.id));
      toast.success("Paciente removido com sucesso");
    } catch (err) {
      setError(err.message);
      toast.error("Erro ao remover paciente", {
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
      setPatientToDelete(null);
    }
  };

  const confirmDelete = (patient) => {
    setPatientToDelete(patient);
  };

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to get a deterministic color based on patient id
  const getAvatarColor = (id) => {
    const colors = [
      "bg-primary/10 text-primary",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
    ];
    return colors[id % colors.length];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-blue text-white p-6 rounded-xl shadow-blue-lg">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-sm opacity-90">
            Gerencie seus pacientes e avaliações
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/patients/new")}
          className="bg-white text-primary hover:bg-white/90"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Search and filter section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes por nome..."
            className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewType === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewType("grid")}
            className="h-10 w-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
          </Button>
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewType("list")}
            className="h-10 w-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {patients.length === 0 ? (
        <Card className="border-none shadow-blue">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              Nenhum paciente encontrado
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              Comece adicionando um novo paciente ao sistema para gerenciar suas
              avaliações DASS-21.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/dashboard/patients/new")}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Paciente
            </Button>
          </CardContent>
        </Card>
      ) : viewType === "grid" ? (
        // Grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="overflow-hidden border-none shadow-blue transition-all duration-200 hover:shadow-blue-lg hover:translate-y-[-2px]"
            >
              <div className="h-2 bg-primary w-full"></div>
              <CardHeader className="relative pb-0 pt-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold ${getAvatarColor(
                      patient.id
                    )}`}
                  >
                    {getInitials(patient.name)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {patient.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patient.gender && (
                        <Badge variant="outline" className="px-2 py-0 text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {patient.gender}
                        </Badge>
                      )}
                      {patient.age && (
                        <Badge variant="outline" className="px-2 py-0 text-xs">
                          {patient.age} anos
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Cadastrado em {formatDate(patient.created_at)}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() =>
                      router.push(
                        `/dashboard/patients/${patient.id}/assessments`
                      )
                    }
                  >
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Avaliações
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground border-muted"
                    onClick={() =>
                      router.push(`/dashboard/patients/${patient.id}`)
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/20 hover:bg-destructive/5"
                    onClick={() => confirmDelete(patient)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List view
        <Card className="border-none shadow-blue overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">
                    Idade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">
                    Gênero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider">
                    Data de cadastro
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/20">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(
                            patient.id
                          )}`}
                        >
                          {getInitials(patient.name)}
                        </div>
                        <div className="font-medium">{patient.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.age || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.gender || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(patient.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-primary"
                          onClick={() =>
                            router.push(
                              `/dashboard/patients/${patient.id}/assessments`
                            )
                          }
                        >
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            router.push(`/dashboard/patients/${patient.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => confirmDelete(patient)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AlertDialog
        open={!!patientToDelete}
        onOpenChange={() => setPatientToDelete(null)}
      >
        <AlertDialogContent className="border-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente{" "}
              <span className="font-semibold">{patientToDelete?.name}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-primary/20"
            >
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
