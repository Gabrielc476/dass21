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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  MapPin,
  GraduationCap,
  Clock,
  Heart,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";

export function PatientForm({ patientId }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [genderOther, setGenderOther] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [ethnicityOther, setEthnicityOther] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [cityState, setCityState] = useState("");
  const [income, setIncome] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [educationInstitution, setEducationInstitution] = useState("");
  const [course, setCourse] = useState("");
  const [period, setPeriod] = useState("");
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
      setGenderOther(data.patient.gender_other || "");
      setEthnicity(data.patient.ethnicity || "");
      setEthnicityOther(data.patient.ethnicity_other || "");
      setMaritalStatus(data.patient.marital_status || "");
      setCityState(data.patient.city_state || "");
      setIncome(data.patient.income ? data.patient.income.toString() : "");
      setIncomeRange(data.patient.income_range || "");
      setEducationInstitution(data.patient.education_institution || "");
      setCourse(data.patient.course || "");
      setPeriod(data.patient.period ? data.patient.period.toString() : "");
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
          gender_other: gender === "outro" ? genderOther : null,
          ethnicity,
          ethnicity_other: ethnicity === "outro" ? ethnicityOther : null,
          marital_status: maritalStatus,
          city_state: cityState,
          income: income ? parseFloat(income) : null,
          income_range: incomeRange,
          education_institution: educationInstitution,
          course,
          period: period ? parseInt(period) : null,
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
    <div className="max-w-3xl mx-auto">
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
                Informe os dados do questionário sociodemográfico
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

            {/* Seção 1: Identidade de Gênero e Idade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  1. Identidade de Gênero
                </Label>
                <div className="relative pl-10">
                  <Users className="absolute left-0 top-0 h-5 w-5 text-muted-foreground" />
                  <RadioGroup
                    value={gender}
                    onValueChange={setGender}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="gender-male" />
                      <Label htmlFor="gender-male">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feminino" id="gender-female" />
                      <Label htmlFor="gender-female">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outro" id="gender-other" />
                      <Label htmlFor="gender-other">Outro</Label>
                    </div>
                  </RadioGroup>

                  {gender === "outro" && (
                    <div className="mt-2">
                      <Input
                        value={genderOther}
                        onChange={(e) => setGenderOther(e.target.value)}
                        className="border-primary/20 focus-visible:ring-primary/30 h-10"
                        placeholder="Especifique"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  2. Idade
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
            </div>

            {/* Seção 2: Etnia */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">3. Etnia</Label>
              <div className="relative pl-10">
                <PieChart className="absolute left-0 top-0 h-5 w-5 text-muted-foreground" />
                <RadioGroup
                  value={ethnicity}
                  onValueChange={setEthnicity}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pardo" id="ethnicity-pardo" />
                    <Label htmlFor="ethnicity-pardo">Pardo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="branco" id="ethnicity-white" />
                    <Label htmlFor="ethnicity-white">Branco</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preto" id="ethnicity-black" />
                    <Label htmlFor="ethnicity-black">Preto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amarelo" id="ethnicity-yellow" />
                    <Label htmlFor="ethnicity-yellow">Amarelo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="outro" id="ethnicity-other" />
                    <Label htmlFor="ethnicity-other">Outro</Label>
                  </div>
                </RadioGroup>

                {ethnicity === "outro" && (
                  <div className="mt-2">
                    <Input
                      value={ethnicityOther}
                      onChange={(e) => setEthnicityOther(e.target.value)}
                      className="border-primary/20 focus-visible:ring-primary/30 h-10"
                      placeholder="Especifique"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Seção 3: Estado Civil e Cidade/Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maritalStatus" className="text-sm font-medium">
                  4. Estado Civil
                </Label>
                <div className="relative">
                  <Heart className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="maritalStatus"
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                    placeholder="Estado civil"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cityState" className="text-sm font-medium">
                  5. Cidade/Estado
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="cityState"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                    placeholder="Cidade/Estado"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Renda Mensal */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">6. Renda Mensal</Label>
              <div className="relative pl-10">
                <DollarSign className="absolute left-0 top-0 h-5 w-5 text-muted-foreground" />
                <RadioGroup
                  value={incomeRange}
                  onValueChange={setIncomeRange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ate_1_salario" id="income-1" />
                    <Label htmlFor="income-1">Até 1 salário mínimo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="entre_2_e_4_salarios"
                      id="income-2-4"
                    />
                    <Label htmlFor="income-2-4">
                      Entre 2 e 4 salários mínimos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="entre_5_e_8_salarios"
                      id="income-5-8"
                    />
                    <Label htmlFor="income-5-8">
                      Entre 5 e 8 salários mínimos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="mais_de_8_salarios"
                      id="income-8-plus"
                    />
                    <Label htmlFor="income-8-plus">
                      Mais de 8 salários mínimos
                    </Label>
                  </div>
                </RadioGroup>

                <div className="mt-4">
                  <Label htmlFor="income" className="text-sm font-medium">
                    Valor Específico (opcional)
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    min="0"
                    step="0.01"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="mt-2 border-primary/20 focus-visible:ring-primary/30 h-10"
                    placeholder="Valor em reais"
                  />
                </div>
              </div>
            </div>

            {/* Seção 5: Instituição de Ensino, Curso e Período */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="educationInstitution"
                    className="text-sm font-medium"
                  >
                    7. Instituição de Ensino
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="educationInstitution"
                      value={educationInstitution}
                      onChange={(e) => setEducationInstitution(e.target.value)}
                      className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                      placeholder="Nome da instituição"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm font-medium">
                    8. Curso de Graduação
                  </Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                      placeholder="Nome do curso"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="period" className="text-sm font-medium">
                    9. Período
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="period"
                      type="number"
                      min="1"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                      placeholder="Período atual"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-sm font-medium">
                    Profissão (se aplicável)
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="pl-10 border-primary/20 focus-visible:ring-primary/30 h-10"
                      placeholder="Profissão ou ocupação"
                    />
                  </div>
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
