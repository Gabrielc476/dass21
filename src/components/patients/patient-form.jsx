// src/components/patients/patient-form.jsx
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  Save,
  User,
  UserPlus,
  Calendar,
  Users,
  Loader2,
  DollarSign,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

export function PatientForm({ patientId }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  // New state variables for the new fields
  const [income, setIncome] = useState("");
  const [course, setCourse] = useState("");
  const [profession, setProfession] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const isEditing = !!patientId;

  useEffect(() => {
    if (isEditing) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    setIsFetching(true);
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
        throw new Error("Erro ao carregar paciente");
      }

      const data = await response.json();
      setName(data.patient.name);
      setAge(data.patient.age ? data.patient.age.toString() : "");
      setGender(data.patient.gender || "");
      // Set the new fields
      setIncome(data.patient.income ? data.patient.income.toString() : "");
      setCourse(data.patient.course || "");
      setProfession(data.patient.profession || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
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

      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/patients`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          age: age ? parseInt(age) : null,
          gender,
          income: income ? parseFloat(income) : null,
          course,
          profession,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao salvar paciente");
      }

      toast.success(isEditing ? "Paciente atualizado" : "Paciente adicionado", {
        description: data.message,
      });

      // Redirect back to patients list
      router.push("/dashboard/patients");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing && isFetching) {
    return (
      <Card className="w-full max-w-lg mx-auto border-none shadow-blue">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <CardTitle className="text-2xl">Carregando...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-primary/20"
          onClick={() => router.push(`/dashboard/patients`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editar Paciente" : "Novo Paciente"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Atualize as informações do paciente"
              : "Preencha os dados do novo paciente"}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-blue overflow-hidden">
        <div className="h-2 bg-primary w-full"></div>
        <CardHeader className="bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {isEditing ? (
                <User className="h-5 w-5 text-primary" />
              ) : (
                <UserPlus className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle>Dados do Paciente</CardTitle>
              <CardDescription>
                Informe os dados básicos do paciente para cadastro
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} id="patient-form" className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-none shadow-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome Completo *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                  placeholder="Nome completo do paciente"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Idade
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                    placeholder="Idade em anos"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gênero
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger
                      id="gender"
                      className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                    >
                      <SelectValue placeholder="Selecionar gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="prefiro_nao_dizer">
                        Prefiro não dizer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {/* New fields */}
            <div className="space-y-2">
              <Label htmlFor="income" className="text-sm font-medium">
                Renda
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="income"
                  type="number"
                  min="0"
                  step="0.01"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                  placeholder="Renda mensal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course" className="text-sm font-medium">
                  Curso
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="course"
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                    placeholder="Curso ou nível educacional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession" className="text-sm font-medium">
                  Profissão
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="profession"
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                    placeholder="Profissão ou ocupação"
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between p-6 bg-muted/30 border-t border-muted">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/dashboard/patients")}
            className="border-primary/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit" form="patient-form" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Paciente
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
