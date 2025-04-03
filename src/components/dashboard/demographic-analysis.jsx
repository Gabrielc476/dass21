// src/components/dashboard/demographic-analysis.jsx
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Users,
  BookOpen,
  Briefcase,
  DollarSign,
} from "lucide-react";

export function DemographicAnalysis() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      // Fetch patients
      const patientsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!patientsResponse.ok) {
        throw new Error("Erro ao carregar pacientes");
      }

      const patientsData = await patientsResponse.json();
      const patients = patientsData.patients || [];

      // For each patient, fetch their latest assessment
      const patientPromises = patients.map(async (patient) => {
        const assessmentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dass21/patient/${patient.id}/assessments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!assessmentResponse.ok) return null;

        const assessmentData = await assessmentResponse.json();
        const assessments = assessmentData.assessments || [];

        // Get latest assessment
        if (assessments.length === 0) return null;
        const latestAssessment = assessments.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )[0];

        return {
          ...patient,
          depression: latestAssessment.depression.score,
          anxiety: latestAssessment.anxiety.score,
          stress: latestAssessment.stress.score,
        };
      });

      const patientResults = await Promise.all(patientPromises);
      const validResults = patientResults.filter(Boolean);

      setData(validResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Process data for each demographic dimension
  const processDataByProfession = () => {
    const professionGroups = {};

    data.forEach((patient) => {
      if (!patient.profession) return;

      if (!professionGroups[patient.profession]) {
        professionGroups[patient.profession] = {
          profession: patient.profession,
          depressionSum: 0,
          anxietySum: 0,
          stressSum: 0,
          count: 0,
        };
      }

      professionGroups[patient.profession].depressionSum += patient.depression;
      professionGroups[patient.profession].anxietySum += patient.anxiety;
      professionGroups[patient.profession].stressSum += patient.stress;
      professionGroups[patient.profession].count += 1;
    });

    return Object.values(professionGroups)
      .map((group) => ({
        profession: group.profession,
        depression: group.depressionSum / group.count,
        anxiety: group.anxietySum / group.count,
        stress: group.stressSum / group.count,
        count: group.count,
      }))
      .filter((group) => group.count >= 1) // Require at least 1 person per group
      .sort((a, b) => b.depression - a.depression); // Sort by depression score
  };

  const processDataByCourse = () => {
    const courseGroups = {};

    data.forEach((patient) => {
      if (!patient.course) return;

      if (!courseGroups[patient.course]) {
        courseGroups[patient.course] = {
          course: patient.course,
          depressionSum: 0,
          anxietySum: 0,
          stressSum: 0,
          count: 0,
        };
      }

      courseGroups[patient.course].depressionSum += patient.depression;
      courseGroups[patient.course].anxietySum += patient.anxiety;
      courseGroups[patient.course].stressSum += patient.stress;
      courseGroups[patient.course].count += 1;
    });

    return Object.values(courseGroups)
      .map((group) => ({
        course: group.course,
        depression: group.depressionSum / group.count,
        anxiety: group.anxietySum / group.count,
        stress: group.stressSum / group.count,
        count: group.count,
      }))
      .filter((group) => group.count >= 1)
      .sort((a, b) => b.depression - a.depression);
  };

  const processDataByIncomeRange = () => {
    const incomeRanges = [
      { range: "0-1000", min: 0, max: 1000, label: "R$0-1000" },
      { range: "1001-2000", min: 1001, max: 2000, label: "R$1001-2000" },
      { range: "2001-3000", min: 2001, max: 3000, label: "R$2001-3000" },
      { range: "3001-5000", min: 3001, max: 5000, label: "R$3001-5000" },
      { range: "5001+", min: 5001, max: Infinity, label: "R$5001+" },
    ];

    const incomeGroups = {};

    incomeRanges.forEach((range) => {
      incomeGroups[range.range] = {
        incomeRange: range.label,
        depressionSum: 0,
        anxietySum: 0,
        stressSum: 0,
        count: 0,
      };
    });

    data.forEach((patient) => {
      if (patient.income === null || patient.income === undefined) return;

      const income = parseFloat(patient.income);
      const range = incomeRanges.find(
        (r) => income >= r.min && income <= r.max
      );

      if (range) {
        incomeGroups[range.range].depressionSum += patient.depression;
        incomeGroups[range.range].anxietySum += patient.anxiety;
        incomeGroups[range.range].stressSum += patient.stress;
        incomeGroups[range.range].count += 1;
      }
    });

    return Object.values(incomeGroups)
      .map((group) => ({
        incomeRange: group.incomeRange,
        depression: group.count > 0 ? group.depressionSum / group.count : 0,
        anxiety: group.count > 0 ? group.anxietySum / group.count : 0,
        stress: group.count > 0 ? group.stressSum / group.count : 0,
        count: group.count,
      }))
      .filter((group) => group.count > 0);
  };

  // Format data for different chart types
  const professionData = processDataByProfession();
  const courseData = processDataByCourse();
  const incomeData = processDataByIncomeRange();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <div className="grid gap-2">
            {payload.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span>{entry.name}:</span>
                </div>
                <div className="font-medium">{entry.value.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Demográfica</CardTitle>
          <CardDescription>
            Pontuações DASS-21 por características demográficas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-muted-foreground">
              Não há dados suficientes para análise. Adicione mais pacientes com
              informações demográficas e avaliações.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-blue">
      <CardHeader>
        <CardTitle>Análise Demográfica</CardTitle>
        <CardDescription>
          Pontuações DASS-21 médias por características demográficas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profession">
          <TabsList>
            <TabsTrigger value="profession">
              <Briefcase className="h-4 w-4 mr-2" />
              Profissão
            </TabsTrigger>
            <TabsTrigger value="course">
              <BookOpen className="h-4 w-4 mr-2" />
              Curso
            </TabsTrigger>
            <TabsTrigger value="income">
              <DollarSign className="h-4 w-4 mr-2" />
              Renda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profession" className="mt-4">
            {professionData.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={professionData.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 42]} />
                    <YAxis
                      dataKey="profession"
                      type="category"
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="depression"
                      name="Depressão"
                      fill="#8884d8"
                      barSize={20}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="anxiety"
                      name="Ansiedade"
                      fill="#82ca9d"
                      barSize={20}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="stress"
                      name="Estresse"
                      fill="#ffc658"
                      barSize={20}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-6">
                Não há dados suficientes para profissões.
              </p>
            )}
          </TabsContent>

          <TabsContent value="course" className="mt-4">
            {courseData.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseData.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 42]} />
                    <YAxis
                      dataKey="course"
                      type="category"
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="depression"
                      name="Depressão"
                      fill="#8884d8"
                      barSize={20}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="anxiety"
                      name="Ansiedade"
                      fill="#82ca9d"
                      barSize={20}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="stress"
                      name="Estresse"
                      fill="#ffc658"
                      barSize={20}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-6">
                Não há dados suficientes para cursos.
              </p>
            )}
          </TabsContent>

          <TabsContent value="income" className="mt-4">
            {incomeData.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="incomeRange" />
                    <YAxis domain={[0, 42]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="depression"
                      name="Depressão"
                      fill="#8884d8"
                      barSize={30}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="anxiety"
                      name="Ansiedade"
                      fill="#82ca9d"
                      barSize={30}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="stress"
                      name="Estresse"
                      fill="#ffc658"
                      barSize={30}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-6">
                Não há dados suficientes para faixas de renda.
              </p>
            )}
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-4">
          * Os gráficos mostram as pontuações médias de cada subescala DASS-21
          por grupo demográfico. Apenas grupos com dados suficientes são
          exibidos.
        </p>
      </CardContent>
    </Card>
  );
}
