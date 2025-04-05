"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart2,
  FileText,
  Upload,
  Download,
  PieChart,
  LineChart,
  Table2,
  Calculator,
  Database,
  Filter,
  Share2,
  CheckSquare,
  AlertCircle,
  Users,
  Info,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Import helpers for data visualization
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

export default function IHS2AnalysisPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("import");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [factorScores, setFactorScores] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState("descriptive");
  const [selectedVisualization, setSelectedVisualization] = useState("bar");
  const [selectedFactor, setSelectedFactor] = useState("all");
  const [comparisonGroup, setComparisonGroup] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [normativeData, setNormativeData] = useState(null);
  const [correlationMatrix, setCorrelationMatrix] = useState([]);

  // Sample normative data for IHS-2 (would be replaced with actual data)
  const sampleNormativeData = {
    general: {
      mean: 92.65,
      sd: 13.97,
      percentiles: {
        5: 68.5,
        25: 83.0,
        50: 92.0,
        75: 102.0,
        95: 116.0,
      },
    },
    factors: {
      F1: { mean: 21.3, sd: 4.8 },
      F2: { mean: 19.7, sd: 5.2 },
      F3: { mean: 17.5, sd: 4.5 },
      F4: { mean: 19.2, sd: 4.9 },
      F5: { mean: 14.9, sd: 3.8 },
    },
  };

  // Mock IHS-2 factors
  const ihs2Factors = [
    {
      id: "F1",
      name: "Assertividade de enfrentamento",
      description:
        "Habilidade de lidar com situações interpessoais que demandam afirmação, defesa de direitos e autoestima",
      items: [1, 5, 7, 11, 12, 14, 15, 16, 20, 21],
    },
    {
      id: "F2",
      name: "Autoafirmação na expressão de sentimento positivo",
      description:
        "Habilidade de expressar sentimentos positivos, de afeto, de agrado",
      items: [3, 6, 8, 10, 28, 30, 35],
    },
    {
      id: "F3",
      name: "Conversação e desenvoltura social",
      description:
        "Habilidade de lidar com situações sociais neutras e de aproximação",
      items: [13, 17, 19, 22, 24, 26, 36, 37],
    },
    {
      id: "F4",
      name: "Autoexposição a desconhecidos e situações novas",
      description: "Habilidade de abordar pessoas desconhecidas",
      items: [9, 14, 23, 26, 29],
    },
    {
      id: "F5",
      name: "Autocontrole da agressividade",
      description:
        "Habilidade de reagir a estimulações aversivas com controle da raiva e agressividade",
      items: [18, 31, 38],
    },
  ];

  // Generate mock data for demo purposes
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      generateMockData();
    }
  }, []);

  const generateMockData = () => {
    // Mock participant data
    const mockParticipants = [];
    for (let i = 1; i <= 30; i++) {
      const participant = {
        id: i,
        gender: Math.random() > 0.5 ? "M" : "F",
        age: Math.floor(Math.random() * 40) + 18,
        group: Math.random() > 0.5 ? "Clinical" : "Control",
      };

      // Generate 38 random item scores (IHS-2 has 38 items)
      for (let j = 1; j <= 38; j++) {
        participant[`item${j}`] = Math.floor(Math.random() * 5);
      }

      // Calculate factor scores based on the items
      participant.F1 = calculateMockFactorScore(
        participant,
        ihs2Factors[0].items
      );
      participant.F2 = calculateMockFactorScore(
        participant,
        ihs2Factors[1].items
      );
      participant.F3 = calculateMockFactorScore(
        participant,
        ihs2Factors[2].items
      );
      participant.F4 = calculateMockFactorScore(
        participant,
        ihs2Factors[3].items
      );
      participant.F5 = calculateMockFactorScore(
        participant,
        ihs2Factors[4].items
      );

      // Calculate total score
      participant.total =
        participant.F1 +
        participant.F2 +
        participant.F3 +
        participant.F4 +
        participant.F5;

      mockParticipants.push(participant);
    }

    setData(mockParticipants);
    setFileUploaded(true);
    setFileName("mock_ihs2_data.csv");
    calculateDescriptiveStatistics(mockParticipants);
    generateCorrelationMatrix(mockParticipants);
    setNormativeData(sampleNormativeData);
  };

  const calculateMockFactorScore = (participant, items) => {
    return items.reduce((sum, item) => sum + participant[`item${item}`], 0);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    // Read CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Parse CSV using a simple approach (for a real app, use a CSV parsing library)
        const text = event.target.result;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const parsedData = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = lines[i].split(",").map((v) => v.trim());
          const row = {};

          headers.forEach((header, index) => {
            row[header] = values[index];

            // Convert numeric strings to numbers
            if (!isNaN(row[header])) {
              row[header] = parseFloat(row[header]);
            }
          });

          parsedData.push(row);
        }

        setData(parsedData);
        setFileUploaded(true);
        calculateDescriptiveStatistics(parsedData);
        generateCorrelationMatrix(parsedData);
        toast.success("Arquivo importado com sucesso", {
          description: `${parsedData.length} registros carregados`,
        });
      } catch (err) {
        setError("Erro ao processar o arquivo: " + err.message);
        toast.error("Erro ao processar o arquivo", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Erro ao ler o arquivo");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const calculateDescriptiveStatistics = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return;

    // Function to calculate basic statistics
    const calculateStats = (values) => {
      const numericValues = values.filter(
        (v) => !isNaN(v) && v !== null && v !== undefined
      );
      if (numericValues.length === 0) return { count: 0 };

      numericValues.sort((a, b) => a - b);

      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / numericValues.length;

      const squaredDiffs = numericValues.map((value) =>
        Math.pow(value - mean, 2)
      );
      const variance =
        squaredDiffs.reduce((a, b) => a + b, 0) / numericValues.length;
      const sd = Math.sqrt(variance);

      const median =
        numericValues.length % 2 === 0
          ? (numericValues[numericValues.length / 2 - 1] +
              numericValues[numericValues.length / 2]) /
            2
          : numericValues[Math.floor(numericValues.length / 2)];

      // Calculate percentiles
      const p25 = numericValues[Math.floor(numericValues.length * 0.25)];
      const p75 = numericValues[Math.floor(numericValues.length * 0.75)];
      const p5 = numericValues[Math.floor(numericValues.length * 0.05)];
      const p95 = numericValues[Math.floor(numericValues.length * 0.95)];

      const min = numericValues[0];
      const max = numericValues[numericValues.length - 1];

      return {
        count: numericValues.length,
        mean: mean,
        median: median,
        sd: sd,
        variance: variance,
        min: min,
        max: max,
        range: max - min,
        percentiles: {
          5: p5,
          25: p25,
          50: median,
          75: p75,
          95: p95,
        },
      };
    };

    // Calculate statistics for each factor and total score
    const stats = {
      total: calculateStats(dataArray.map((d) => d.total)),
      F1: calculateStats(dataArray.map((d) => d.F1)),
      F2: calculateStats(dataArray.map((d) => d.F2)),
      F3: calculateStats(dataArray.map((d) => d.F3)),
      F4: calculateStats(dataArray.map((d) => d.F4)),
      F5: calculateStats(dataArray.map((d) => d.F5)),
    };

    // Calculate for individual items
    for (let i = 1; i <= 38; i++) {
      const itemKey = `item${i}`;
      stats[itemKey] = calculateStats(dataArray.map((d) => d[itemKey]));
    }

    // Calculate statistics by groups if they exist
    const groups = [...new Set(dataArray.map((d) => d.group).filter(Boolean))];

    if (groups.length > 0) {
      stats.byGroup = {};

      groups.forEach((group) => {
        const groupData = dataArray.filter((d) => d.group === group);
        stats.byGroup[group] = {
          total: calculateStats(groupData.map((d) => d.total)),
          F1: calculateStats(groupData.map((d) => d.F1)),
          F2: calculateStats(groupData.map((d) => d.F2)),
          F3: calculateStats(groupData.map((d) => d.F3)),
          F4: calculateStats(groupData.map((d) => d.F4)),
          F5: calculateStats(groupData.map((d) => d.F5)),
        };
      });
    }

    // Calculate statistics by gender
    const genders = [
      ...new Set(dataArray.map((d) => d.gender).filter(Boolean)),
    ];

    if (genders.length > 0) {
      stats.byGender = {};

      genders.forEach((gender) => {
        const genderData = dataArray.filter((d) => d.gender === gender);
        stats.byGender[gender] = {
          total: calculateStats(genderData.map((d) => d.total)),
          F1: calculateStats(genderData.map((d) => d.F1)),
          F2: calculateStats(genderData.map((d) => d.F2)),
          F3: calculateStats(genderData.map((d) => d.F3)),
          F4: calculateStats(genderData.map((d) => d.F4)),
          F5: calculateStats(genderData.map((d) => d.F5)),
        };
      });
    }

    setStatistics(stats);
  };

  const generateCorrelationMatrix = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return;

    const factors = ["F1", "F2", "F3", "F4", "F5", "total"];
    const matrix = [];

    // Function to calculate Pearson correlation coefficient
    const calculateCorrelation = (x, y) => {
      const n = x.length;
      if (n === 0) return 0;

      // Calculate mean of x and y
      const xMean = x.reduce((sum, val) => sum + val, 0) / n;
      const yMean = y.reduce((sum, val) => sum + val, 0) / n;

      // Calculate numerator and denominators
      let numerator = 0;
      let xDenominator = 0;
      let yDenominator = 0;

      for (let i = 0; i < n; i++) {
        const xDiff = x[i] - xMean;
        const yDiff = y[i] - yMean;
        numerator += xDiff * yDiff;
        xDenominator += xDiff * xDiff;
        yDenominator += yDiff * yDiff;
      }

      // Calculate correlation coefficient
      if (xDenominator === 0 || yDenominator === 0) return 0;
      return numerator / Math.sqrt(xDenominator * yDenominator);
    };

    // Create correlation matrix
    for (const factor1 of factors) {
      const row = { factor: factor1 };

      for (const factor2 of factors) {
        const x = dataArray.map((d) => d[factor1]).filter((v) => !isNaN(v));
        const y = dataArray.map((d) => d[factor2]).filter((v) => !isNaN(v));
        row[factor2] = calculateCorrelation(x, y);
      }

      matrix.push(row);
    }

    setCorrelationMatrix(matrix);
  };

  const runTTest = () => {
    if (!data || data.length === 0 || !comparisonGroup) return;

    setAnalysisRunning(true);

    setTimeout(() => {
      try {
        // Get groups to compare
        const groups = [
          ...new Set(data.map((d) => d[comparisonGroup]).filter(Boolean)),
        ];

        if (groups.length < 2) {
          throw new Error(
            `Não há grupos suficientes na variável ${comparisonGroup} para comparação`
          );
        }

        // Perform t-test (simplified version)
        const results = {};
        const factor = selectedFactor === "all" ? "total" : selectedFactor;

        // Get data for each group
        const groupData = {};
        groups.forEach((group) => {
          groupData[group] = data
            .filter((d) => d[comparisonGroup] === group)
            .map((d) => d[factor])
            .filter((v) => !isNaN(v));
        });

        // Calculate group means and standard deviations
        const groupStats = {};
        groups.forEach((group) => {
          const values = groupData[group];
          const mean =
            values.reduce((sum, val) => sum + val, 0) / values.length;
          const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
          const variance =
            squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

          groupStats[group] = {
            n: values.length,
            mean: mean,
            variance: variance,
            sd: Math.sqrt(variance),
          };
        });

        // Calculate t-value (for simplicity, assuming equal variances)
        // This is a simplified t-test implementation
        const g1 = groupStats[groups[0]];
        const g2 = groupStats[groups[1]];

        const pooledVariance =
          ((g1.n - 1) * g1.variance + (g2.n - 1) * g2.variance) /
          (g1.n + g2.n - 2);
        const standardError = Math.sqrt(pooledVariance * (1 / g1.n + 1 / g2.n));
        const tValue = Math.abs(g1.mean - g2.mean) / standardError;

        // Simplified p-value calculation (for demo purposes)
        // In a real app, you would use a proper t-distribution function
        const df = g1.n + g2.n - 2;
        // This is a very rough approximation of p-value
        let pValue;
        if (tValue > 2.576) pValue = 0.01;
        else if (tValue > 1.96) pValue = 0.05;
        else if (tValue > 1.645) pValue = 0.1;
        else pValue = 0.2;

        // Determine if significant
        const significant = pValue <= 0.05;

        // Calculate effect size (Cohen's d)
        const cohensD = Math.abs(g1.mean - g2.mean) / Math.sqrt(pooledVariance);

        // Determine effect size magnitude
        let effectSizeMagnitude;
        if (cohensD < 0.2) effectSizeMagnitude = "Insignificante";
        else if (cohensD < 0.5) effectSizeMagnitude = "Pequeno";
        else if (cohensD < 0.8) effectSizeMagnitude = "Médio";
        else effectSizeMagnitude = "Grande";

        results[factor] = {
          factor: factor === "total" ? "Escore Total" : `Fator ${factor}`,
          groups: groups,
          groupStats: groupStats,
          tValue: tValue,
          df: df,
          pValue: pValue,
          significant: significant,
          cohensD: cohensD,
          effectSizeMagnitude: effectSizeMagnitude,
        };

        setTestResults(results);

        toast.success("Análise concluída", {
          description: "Resultados do teste-t disponíveis",
        });
      } catch (err) {
        setError(err.message);
        toast.error("Erro na análise", {
          description: err.message,
        });
      } finally {
        setAnalysisRunning(false);
      }
    }, 1000); // Simulate processing time
  };

  const runANOVA = () => {
    setAnalysisRunning(true);

    setTimeout(() => {
      toast.success("Análise ANOVA concluída", {
        description: "Resultados disponíveis na aba de Resultados",
      });
      setAnalysisRunning(false);

      // This would be where we'd implement an actual ANOVA test
      // For demo purposes, we'll just set a mock result
      setTestResults({
        anova: {
          type: "One-way ANOVA",
          factor:
            selectedFactor === "all"
              ? "Escore Total"
              : `Fator ${selectedFactor}`,
          groupVariable: comparisonGroup,
          fValue: 4.28,
          dfBetween: 2,
          dfWithin: 27,
          pValue: 0.024,
          significant: true,
          etaSquared: 0.241,
          effectSizeMagnitude: "Médio",
        },
      });
    }, 1500);
  };

  const renderVisualization = () => {
    if (!data || data.length === 0) return null;

    const factor = selectedFactor === "all" ? "total" : selectedFactor;
    const factorName =
      selectedFactor === "all" ? "Escore Total" : `Fator ${selectedFactor}`;

    switch (selectedVisualization) {
      case "bar":
        // Prepare data for bar chart based on groups if available
        let barData = [];

        if (comparisonGroup && statistics.byGroup) {
          const groups = Object.keys(statistics.byGroup);
          barData = groups.map((group) => ({
            group: group,
            [factorName]: statistics.byGroup[group][factor].mean,
          }));
        } else if (statistics.byGender) {
          const genders = Object.keys(statistics.byGender);
          barData = genders.map((gender) => ({
            group: gender === "M" ? "Masculino" : "Feminino",
            [factorName]: statistics.byGender[gender][factor].mean,
          }));
        } else {
          // If no groups, just show factor scores
          barData = ihs2Factors.map((f) => ({
            group: f.name,
            score: statistics[f.id]?.mean || 0,
          }));
        }

        return (
          <div className="h-96 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="group"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value) => [value.toFixed(2), "Média"]} />
                <Legend />
                <Bar
                  dataKey={factorName}
                  name="Média"
                  fill="#8884d8"
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case "pie":
        // For pie chart, we'll use factor distribution
        const total = ihs2Factors.reduce(
          (sum, f) => sum + (statistics[f.id]?.mean || 0),
          0
        );
        const pieData = ihs2Factors.map((f) => ({
          name: f.name,
          value: statistics[f.id]?.mean || 0,
          percentage: (((statistics[f.id]?.mean || 0) / total) * 100).toFixed(
            1
          ),
        }));

        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

        return (
          <div className="h-96 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toFixed(2), "Média"]} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        );

      case "line":
        // For line chart, we'll show factor scores across items
        const factorItems =
          selectedFactor !== "all"
            ? ihs2Factors.find((f) => f.id === selectedFactor)?.items || []
            : [];

        const lineData = factorItems.map((item) => {
          const itemKey = `item${item}`;
          return {
            item: `Item ${item}`,
            score: statistics[itemKey]?.mean || 0,
          };
        });

        return (
          <div className="h-96 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart
                data={lineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="item" />
                <YAxis domain={[0, 4]} />
                <Tooltip formatter={(value) => [value.toFixed(2), "Média"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Média do Item"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        );

      case "scatter":
        // For scatter plot, we'll show relationship between two factors
        const scatterData = data.map((d, i) => {
          const x = selectedFactor === "all" ? d.F1 : d[selectedFactor];
          const y = d.F2; // Compare with F2 by default
          return { x, y, id: i, name: `Participante ${i + 1}` };
        });

        return (
          <div className="h-96 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={
                    selectedFactor === "all"
                      ? "Fator F1"
                      : `Fator ${selectedFactor}`
                  }
                />
                <YAxis type="number" dataKey="y" name="Fator F2" />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value) => [value.toFixed(2), ""]}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow-md">
                          <p>{`${data.name}`}</p>
                          <p>{`${
                            selectedFactor === "all" ? "F1" : selectedFactor
                          }: ${data.x.toFixed(2)}`}</p>
                          <p>{`F2: ${data.y.toFixed(2)}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Scatter
                  name="Participantes"
                  data={scatterData}
                  fill="#8884d8"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with title */}
      <div className="bg-gradient-blue text-white p-6 rounded-xl shadow-blue-lg">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Análise Estatística do IHS-2
        </h1>
        <p className="opacity-90">
          Ferramenta de análise estatística para o Inventário de Habilidades
          Sociais (IHS-2)
        </p>
      </div>

      {/* Main content */}
      <Card className="border-none shadow-blue">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Análise de Dados do IHS-2</CardTitle>
              <CardDescription>
                Importe dados, conduza análises estatísticas e visualize
                resultados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-5 md:w-[600px]">
              <TabsTrigger value="import">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Importar</span>
              </TabsTrigger>
              <TabsTrigger value="descriptive">
                <Table2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Descritiva</span>
              </TabsTrigger>
              <TabsTrigger value="inferential">
                <Calculator className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Inferencial</span>
              </TabsTrigger>
              <TabsTrigger value="visualization">
                <BarChart2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Visualização</span>
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </TabsTrigger>
            </TabsList>

            {/* Import Data Tab */}
            <TabsContent
              value="import"
              className="space-y-4 p-4 border rounded-md"
            >
              <div className="flex flex-col gap-4">
                <div className="bg-muted/20 p-5 rounded-lg border border-primary/10">
                  <h3 className="flex items-center font-medium mb-2">
                    <Database className="h-5 w-5 mr-2 text-primary" />
                    Importar Dados IHS-2
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione um arquivo CSV com dados do IHS-2. O arquivo deve
                    conter cabeçalhos e incluir colunas para os 38 itens do
                    inventário, além de informações demográficas.
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center w-full border-2 border-dashed border-primary/20 rounded-md h-20 bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="flex flex-col items-center">
                            <Upload className="h-6 w-6 mb-1 text-primary" />
                            <span className="text-sm font-medium">
                              Clique para selecionar um arquivo
                            </span>
                          </div>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isLoading}
                        />
                      </Label>
                    </div>
                    <div className="w-48">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={generateMockData}
                        disabled={isLoading}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Dados de Exemplo
                      </Button>
                    </div>
                  </div>

                  {isLoading && (
                    <div className="mt-4 flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processando arquivo...</span>
                    </div>
                  )}

                  {fileName && (
                    <div className="mt-4 p-3 bg-muted/20 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5 text-primary" />
                          <span className="font-medium">{fileName}</span>
                        </div>
                        {fileUploaded && (
                          <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {data.length} registros
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {fileUploaded && (
                  <div className="bg-muted/20 p-5 rounded-lg border border-primary/10">
                    <h3 className="flex items-center font-medium mb-3">
                      <Table2 className="h-5 w-5 mr-2 text-primary" />
                      Visualização dos Dados
                    </h3>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(data[0])
                              .slice(0, 10)
                              .map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                              ))}
                            <TableHead>...</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.slice(0, 5).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {Object.keys(data[0])
                                .slice(0, 10)
                                .map((cell, cellIndex) => (
                                  <TableCell key={cellIndex}>
                                    {row[cell] !== undefined
                                      ? row[cell].toString()
                                      : ""}
                                  </TableCell>
                                ))}
                              <TableCell>...</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      Exibindo 5 de {data.length} registros. Use as outras abas
                      para análise completa.
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => setActiveTab("descriptive")}>
                        Continuar para Análise
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Descriptive Statistics Tab */}
            <TabsContent
              value="descriptive"
              className="space-y-4 p-4 border rounded-md"
            >
              {!fileUploaded ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Dados não encontrados
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Importe dados primeiro para visualizar estatísticas
                    descritivas.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("import")}
                  >
                    Ir para Importação de Dados
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3">
                      <div className="bg-muted/20 p-4 rounded-lg border border-primary/10 h-full">
                        <h3 className="flex items-center font-medium mb-3">
                          <Info className="h-5 w-5 mr-2 text-primary" />
                          Informações Gerais
                        </h3>

                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">
                              Total de participantes:
                            </span>
                            <span className="ml-2 font-medium">
                              {data.length}
                            </span>
                          </div>

                          {statistics.byGender && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Distribuição por gênero:
                              </span>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {Object.entries(statistics.byGender).map(
                                  ([gender, stats]) => (
                                    <div
                                      key={gender}
                                      className="bg-muted/30 p-2 rounded-md text-center"
                                    >
                                      <div className="text-xs text-muted-foreground">
                                        {gender === "M"
                                          ? "Masculino"
                                          : "Feminino"}
                                      </div>
                                      <div className="font-medium">
                                        {stats.total.count}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {statistics.byGroup && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Distribuição por grupo:
                              </span>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {Object.entries(statistics.byGroup).map(
                                  ([group, stats]) => (
                                    <div
                                      key={group}
                                      className="bg-muted/30 p-2 rounded-md text-center"
                                    >
                                      <div className="text-xs text-muted-foreground">
                                        {group}
                                      </div>
                                      <div className="font-medium">
                                        {stats.total.count}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <Separator />

                          <div>
                            <span className="text-sm font-medium">
                              Selecione o fator:
                            </span>
                            <Select
                              value={selectedFactor}
                              onValueChange={setSelectedFactor}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione um fator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  Escore Total
                                </SelectItem>
                                {ihs2Factors.map((factor) => (
                                  <SelectItem key={factor.id} value={factor.id}>
                                    {factor.id}: {factor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedFactor !== "all" && (
                            <div className="bg-primary/5 p-3 rounded-md">
                              <div className="text-sm font-medium mb-1">
                                {
                                  ihs2Factors.find(
                                    (f) => f.id === selectedFactor
                                  )?.name
                                }
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {
                                  ihs2Factors.find(
                                    (f) => f.id === selectedFactor
                                  )?.description
                                }
                              </div>
                              <div className="text-xs text-primary mt-1">
                                Itens:{" "}
                                {ihs2Factors
                                  .find((f) => f.id === selectedFactor)
                                  ?.items.join(", ")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-2/3">
                      <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                        <h3 className="flex items-center font-medium mb-3">
                          <Calculator className="h-5 w-5 mr-2 text-primary" />
                          Estatísticas Descritivas
                        </h3>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[150px]">
                                  Estatística
                                </TableHead>

                                {selectedFactor === "all" ? (
                                  // Show all factors when "all" is selected
                                  ihs2Factors.map((factor) => (
                                    <TableHead key={factor.id}>
                                      {factor.id}
                                    </TableHead>
                                  ))
                                ) : (
                                  // Show specific factor details when one is selected
                                  <>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Normativo</TableHead>
                                    <TableHead>Percentil</TableHead>
                                  </>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedFactor === "all" ? (
                                // Table for all factors
                                <>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Média
                                    </TableCell>
                                    {ihs2Factors.map((factor) => (
                                      <TableCell key={factor.id}>
                                        {statistics[factor.id]?.mean.toFixed(
                                          2
                                        ) || "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Desvio Padrão
                                    </TableCell>
                                    {ihs2Factors.map((factor) => (
                                      <TableCell key={factor.id}>
                                        {statistics[factor.id]?.sd.toFixed(2) ||
                                          "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Mínimo
                                    </TableCell>
                                    {ihs2Factors.map((factor) => (
                                      <TableCell key={factor.id}>
                                        {statistics[factor.id]?.min || "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Máximo
                                    </TableCell>
                                    {ihs2Factors.map((factor) => (
                                      <TableCell key={factor.id}>
                                        {statistics[factor.id]?.max || "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Mediana
                                    </TableCell>
                                    {ihs2Factors.map((factor) => (
                                      <TableCell key={factor.id}>
                                        {statistics[factor.id]?.median || "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </>
                              ) : (
                                // Table for a specific factor
                                <>
                                  {["mean", "median", "sd", "min", "max"].map(
                                    (stat) => {
                                      const statLabels = {
                                        mean: "Média",
                                        median: "Mediana",
                                        sd: "Desvio Padrão",
                                        min: "Mínimo",
                                        max: "Máximo",
                                      };

                                      const factorStat =
                                        statistics[selectedFactor]?.[stat];
                                      const normativeStat =
                                        stat === "median"
                                          ? normativeData?.factors[
                                              selectedFactor
                                            ]?.mean
                                          : normativeData?.factors[
                                              selectedFactor
                                            ]?.[stat];

                                      // Calculate percentile (simplified)
                                      let percentile = "";
                                      if (
                                        stat === "mean" &&
                                        factorStat &&
                                        normativeStat
                                      ) {
                                        const normSD =
                                          normativeData?.factors[selectedFactor]
                                            ?.sd || 1;
                                        const zScore =
                                          (factorStat - normativeStat) / normSD;

                                        // Simplified percentile calculation
                                        if (zScore < -1.96) percentile = "< 5%";
                                        else if (zScore < -1.28)
                                          percentile = "10%";
                                        else if (zScore < -0.67)
                                          percentile = "25%";
                                        else if (zScore < 0) percentile = "40%";
                                        else if (zScore < 0.67)
                                          percentile = "60%";
                                        else if (zScore < 1.28)
                                          percentile = "75%";
                                        else if (zScore < 1.96)
                                          percentile = "90%";
                                        else percentile = "> 95%";
                                      }

                                      return (
                                        <TableRow key={stat}>
                                          <TableCell className="font-medium">
                                            {statLabels[stat]}
                                          </TableCell>
                                          <TableCell>
                                            {factorStat
                                              ? typeof factorStat === "number"
                                                ? factorStat.toFixed(2)
                                                : factorStat
                                              : "-"}
                                          </TableCell>
                                          <TableCell>
                                            {normativeStat
                                              ? typeof normativeStat ===
                                                "number"
                                                ? normativeStat.toFixed(2)
                                                : normativeStat
                                              : "-"}
                                          </TableCell>
                                          <TableCell>{percentile}</TableCell>
                                        </TableRow>
                                      );
                                    }
                                  )}
                                </>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        {selectedFactor !== "all" && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">
                              Percentis
                            </h4>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {[5, 25, 50, 75, 95].map((p) => (
                                      <TableHead key={p}>{p}%</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    {[5, 25, 50, 75, 95].map((p) => (
                                      <TableCell key={p}>
                                        {statistics[
                                          selectedFactor
                                        ]?.percentiles[p]?.toFixed(2) || "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Distribution chart for selected factor */}
                      {selectedFactor !== "all" && (
                        <div className="bg-muted/20 p-4 rounded-lg border border-primary/10 mt-4">
                          <h3 className="flex items-center font-medium mb-3">
                            <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                            Distribuição dos Escores
                          </h3>

                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  {
                                    category: "< 25%",
                                    value: data.filter(
                                      (d) =>
                                        d[selectedFactor] <
                                        (statistics[selectedFactor]
                                          ?.percentiles[25] || 0)
                                    ).length,
                                  },
                                  {
                                    category: "25-50%",
                                    value: data.filter(
                                      (d) =>
                                        d[selectedFactor] >=
                                          (statistics[selectedFactor]
                                            ?.percentiles[25] || 0) &&
                                        d[selectedFactor] <
                                          (statistics[selectedFactor]
                                            ?.percentiles[50] || 0)
                                    ).length,
                                  },
                                  {
                                    category: "50-75%",
                                    value: data.filter(
                                      (d) =>
                                        d[selectedFactor] >=
                                          (statistics[selectedFactor]
                                            ?.percentiles[50] || 0) &&
                                        d[selectedFactor] <
                                          (statistics[selectedFactor]
                                            ?.percentiles[75] || 0)
                                    ).length,
                                  },
                                  {
                                    category: "> 75%",
                                    value: data.filter(
                                      (d) =>
                                        d[selectedFactor] >=
                                        (statistics[selectedFactor]
                                          ?.percentiles[75] || 0)
                                    ).length,
                                  },
                                ]}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                  formatter={(value) => [
                                    value,
                                    "Participantes",
                                  ]}
                                />
                                <Bar
                                  dataKey="value"
                                  name="Participantes"
                                  fill="#8884d8"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Correlation matrix */}
                  <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                    <h3 className="flex items-center font-medium mb-3">
                      <Share2 className="h-5 w-5 mr-2 text-primary" />
                      Correlações entre Fatores
                    </h3>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fator</TableHead>
                            {ihs2Factors.map((factor) => (
                              <TableHead key={factor.id}>{factor.id}</TableHead>
                            ))}
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {correlationMatrix.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {row.factor}
                              </TableCell>
                              {ihs2Factors.map((factor) => (
                                <TableCell
                                  key={factor.id}
                                  className={
                                    row.factor === factor.id
                                      ? "bg-muted/30"
                                      : Math.abs(row[factor.id]) > 0.7
                                      ? "bg-green-100"
                                      : Math.abs(row[factor.id]) > 0.4
                                      ? "bg-blue-50"
                                      : ""
                                  }
                                >
                                  {row[factor.id].toFixed(2)}
                                </TableCell>
                              ))}
                              <TableCell
                                className={
                                  Math.abs(row.total) > 0.7
                                    ? "bg-green-100"
                                    : ""
                                }
                              >
                                {row.total.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      * Valores em azul claro indicam correlações moderadas (r
                      maior que 0.4) e em verde claro indicam correlações fortes
                      (r maior que 0.7)
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Inferential Statistics Tab */}
            <TabsContent
              value="inferential"
              className="space-y-4 p-4 border rounded-md"
            >
              {!fileUploaded ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Dados não encontrados
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Importe dados primeiro para realizar análises inferenciais.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("import")}
                  >
                    Ir para Importação de Dados
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Analysis options */}
                  <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                    <h3 className="flex items-center font-medium mb-3">
                      <Calculator className="h-5 w-5 mr-2 text-primary" />
                      Configuração da Análise
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Tipo de Análise
                          </Label>
                          <RadioGroup
                            value={selectedAnalysis}
                            onValueChange={setSelectedAnalysis}
                            className="mt-2 space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="descriptive"
                                id="analysis-desc"
                              />
                              <Label htmlFor="analysis-desc">
                                Estatística Descritiva
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="ttest"
                                id="analysis-ttest"
                              />
                              <Label htmlFor="analysis-ttest">
                                Teste-t (comparação de grupos)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="anova"
                                id="analysis-anova"
                              />
                              <Label htmlFor="analysis-anova">
                                ANOVA (análise de variância)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Fator a Analisar
                          </Label>
                          <Select
                            value={selectedFactor}
                            onValueChange={setSelectedFactor}
                            className="mt-2"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um fator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Escore Total</SelectItem>
                              {ihs2Factors.map((factor) => (
                                <SelectItem key={factor.id} value={factor.id}>
                                  {factor.id}: {factor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(selectedAnalysis === "ttest" ||
                          selectedAnalysis === "anova") && (
                          <div>
                            <Label className="text-sm font-medium">
                              Variável para Comparação
                            </Label>
                            <Select
                              value={comparisonGroup}
                              onValueChange={setComparisonGroup}
                              className="mt-2"
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma variável" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gender">Gênero</SelectItem>
                                <SelectItem value="group">Grupo</SelectItem>
                                {/* Add more demographic variables as appropriate */}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="mt-8 flex justify-end gap-4">
                          <Button
                            variant="outline"
                            onClick={() => setTestResults(null)}
                          >
                            Limpar Resultados
                          </Button>
                          <Button
                            onClick={() => {
                              if (selectedAnalysis === "ttest") runTTest();
                              else if (selectedAnalysis === "anova") runANOVA();
                              else runTTest(); // Default to t-test
                            }}
                            disabled={
                              analysisRunning ||
                              (selectedAnalysis !== "descriptive" &&
                                !comparisonGroup)
                            }
                          >
                            {analysisRunning ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analisando...
                              </>
                            ) : (
                              <>
                                <Calculator className="mr-2 h-4 w-4" />
                                Executar Análise
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis results */}
                  {testResults && (
                    <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                      <h3 className="flex items-center font-medium mb-3">
                        <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                        Resultados da Análise
                      </h3>

                      {testResults.anova ? (
                        // ANOVA results
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="font-medium">
                              {testResults.anova.type}
                            </div>
                            <div className="text-sm mt-1">
                              {testResults.anova.factor} por{" "}
                              {testResults.anova.groupVariable}
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Fonte</TableHead>
                                  <TableHead>GL</TableHead>
                                  <TableHead>F</TableHead>
                                  <TableHead>p-valor</TableHead>
                                  <TableHead>Significativo</TableHead>
                                  <TableHead>Eta²</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    Entre grupos
                                  </TableCell>
                                  <TableCell>
                                    {testResults.anova.dfBetween}
                                  </TableCell>
                                  <TableCell>
                                    {testResults.anova.fValue.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    {testResults.anova.pValue.toFixed(3)}
                                  </TableCell>
                                  <TableCell>
                                    {testResults.anova.significant ? (
                                      <span className="text-green-600">
                                        Sim (p &lt; 0.05)
                                      </span>
                                    ) : (
                                      <span className="text-red-600">
                                        Não (p &gt; 0.05)
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {testResults.anova.etaSquared.toFixed(3)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    Dentro dos grupos
                                  </TableCell>
                                  <TableCell>
                                    {testResults.anova.dfWithin}
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          <div className="p-3 bg-muted rounded-md">
                            <div className="font-medium">Interpretação</div>
                            <div className="text-sm mt-1">
                              {testResults.anova.significant ? (
                                <>
                                  Foram encontradas diferenças estatisticamente
                                  significativas entre os grupos (F(
                                  {testResults.anova.dfBetween},{" "}
                                  {testResults.anova.dfWithin}) ={" "}
                                  {testResults.anova.fValue.toFixed(2)}, p ={" "}
                                  {testResults.anova.pValue.toFixed(3)}). O
                                  tamanho do efeito é{" "}
                                  {testResults.anova.effectSizeMagnitude.toLowerCase()}{" "}
                                  (η² ={" "}
                                  {testResults.anova.etaSquared.toFixed(3)}).
                                </>
                              ) : (
                                <>
                                  Não foram encontradas diferenças
                                  estatisticamente significativas entre os
                                  grupos (F({testResults.anova.dfBetween},{" "}
                                  {testResults.anova.dfWithin}) ={" "}
                                  {testResults.anova.fValue.toFixed(2)}, p ={" "}
                                  {testResults.anova.pValue.toFixed(3)}).
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // t-test results
                        <div className="space-y-4">
                          {Object.keys(testResults).map((factor) => {
                            const result = testResults[factor];
                            return (
                              <div key={factor}>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <div className="font-medium">
                                    Teste-t para {result.factor}
                                  </div>
                                  <div className="text-sm mt-1">
                                    Comparando grupos:{" "}
                                    {result.groups.join(" vs ")}
                                  </div>
                                </div>

                                <div className="overflow-x-auto mt-3">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Grupo</TableHead>
                                        <TableHead>N</TableHead>
                                        <TableHead>Média</TableHead>
                                        <TableHead>Desvio Padrão</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {result.groups.map((group) => (
                                        <TableRow key={group}>
                                          <TableCell className="font-medium">
                                            {group}
                                          </TableCell>
                                          <TableCell>
                                            {result.groupStats[group].n}
                                          </TableCell>
                                          <TableCell>
                                            {result.groupStats[
                                              group
                                            ].mean.toFixed(2)}
                                          </TableCell>
                                          <TableCell>
                                            {result.groupStats[
                                              group
                                            ].sd.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                <div className="overflow-x-auto mt-3">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Valor t</TableHead>
                                        <TableHead>GL</TableHead>
                                        <TableHead>p-valor</TableHead>
                                        <TableHead>Significativo</TableHead>
                                        <TableHead>d de Cohen</TableHead>
                                        <TableHead>Tamanho do Efeito</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>
                                          {result.tValue.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{result.df}</TableCell>
                                        <TableCell>
                                          {result.pValue.toFixed(3)}
                                        </TableCell>
                                        <TableCell>
                                          {result.significant ? (
                                            <span className="text-green-600">
                                              Sim (p &lt; 0.05)
                                            </span>
                                          ) : (
                                            <span className="text-red-600">
                                              Não (p &gt; 0.05)
                                            </span>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {result.cohensD.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                          {result.effectSizeMagnitude}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>

                                <div className="p-3 bg-muted rounded-md mt-3">
                                  <div className="font-medium">
                                    Interpretação
                                  </div>
                                  <div className="text-sm mt-1">
                                    {result.significant ? (
                                      <>
                                        Foi encontrada uma diferença
                                        estatisticamente significativa nas
                                        pontuações de{" "}
                                        {result.factor.toLowerCase()} entre os
                                        grupos {result.groups.join(" e ")}
                                        (t({result.df}) ={" "}
                                        {result.tValue.toFixed(2)}, p ={" "}
                                        {result.pValue.toFixed(3)}). O grupo{" "}
                                        {result.groups[0]} (M ={" "}
                                        {result.groupStats[
                                          result.groups[0]
                                        ].mean.toFixed(2)}
                                        , DP ={" "}
                                        {result.groupStats[
                                          result.groups[0]
                                        ].sd.toFixed(2)}
                                        )
                                        {result.groupStats[result.groups[0]]
                                          .mean >
                                        result.groupStats[result.groups[1]].mean
                                          ? " obteve pontuações mais altas que "
                                          : " obteve pontuações mais baixas que "}
                                        o grupo {result.groups[1]} (M ={" "}
                                        {result.groupStats[
                                          result.groups[1]
                                        ].mean.toFixed(2)}
                                        , DP ={" "}
                                        {result.groupStats[
                                          result.groups[1]
                                        ].sd.toFixed(2)}
                                        ). O tamanho do efeito é{" "}
                                        {result.effectSizeMagnitude.toLowerCase()}{" "}
                                        (d = {result.cohensD.toFixed(2)}).
                                      </>
                                    ) : (
                                      <>
                                        Não foi encontrada uma diferença
                                        estatisticamente significativa nas
                                        pontuações de{" "}
                                        {result.factor.toLowerCase()} entre os
                                        grupos {result.groups.join(" e ")}
                                        (t({result.df}) ={" "}
                                        {result.tValue.toFixed(2)}, p ={" "}
                                        {result.pValue.toFixed(3)}).
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Visualization Tab */}
            <TabsContent
              value="visualization"
              className="space-y-4 p-4 border rounded-md"
            >
              {!fileUploaded ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Dados não encontrados
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Importe dados primeiro para criar visualizações.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("import")}
                  >
                    Ir para Importação de Dados
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3">
                      <div className="bg-muted/20 p-4 rounded-lg border border-primary/10 h-full">
                        <h3 className="flex items-center font-medium mb-3">
                          <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                          Opções de Visualização
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Tipo de Gráfico
                            </Label>
                            <RadioGroup
                              value={selectedVisualization}
                              onValueChange={setSelectedVisualization}
                              className="mt-2 space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="bar" id="viz-bar" />
                                <Label
                                  htmlFor="viz-bar"
                                  className="flex items-center gap-2"
                                >
                                  <BarChart2 className="h-4 w-4" />
                                  Gráfico de Barras
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pie" id="viz-pie" />
                                <Label
                                  htmlFor="viz-pie"
                                  className="flex items-center gap-2"
                                >
                                  <PieChart className="h-4 w-4" />
                                  Gráfico de Pizza
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="line" id="viz-line" />
                                <Label
                                  htmlFor="viz-line"
                                  className="flex items-center gap-2"
                                >
                                  <LineChart className="h-4 w-4" />
                                  Gráfico de Linha
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="scatter"
                                  id="viz-scatter"
                                />
                                <Label
                                  htmlFor="viz-scatter"
                                  className="flex items-center gap-2"
                                >
                                  <Share2 className="h-4 w-4" />
                                  Gráfico de Dispersão
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">
                              Dados a Visualizar
                            </Label>
                            <Select
                              value={selectedFactor}
                              onValueChange={setSelectedFactor}
                              className="mt-2"
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um fator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  Escore Total
                                </SelectItem>
                                {ihs2Factors.map((factor) => (
                                  <SelectItem key={factor.id} value={factor.id}>
                                    {factor.id}: {factor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {(selectedVisualization === "bar" ||
                            selectedVisualization === "line") && (
                            <div>
                              <Label className="text-sm font-medium">
                                Agrupar por (opcional)
                              </Label>
                              <Select
                                value={comparisonGroup}
                                onValueChange={setComparisonGroup}
                                className="mt-2"
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sem agrupamento" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">
                                    Sem agrupamento
                                  </SelectItem>
                                  <SelectItem value="gender">Gênero</SelectItem>
                                  <SelectItem value="group">Grupo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {selectedFactor !== "all" && (
                            <div className="bg-primary/5 p-3 rounded-md">
                              <div className="text-sm font-medium mb-1">
                                {
                                  ihs2Factors.find(
                                    (f) => f.id === selectedFactor
                                  )?.name
                                }
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {
                                  ihs2Factors.find(
                                    (f) => f.id === selectedFactor
                                  )?.description
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-2/3">
                      <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                        <h3 className="flex items-center font-medium mb-3">
                          <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                          Visualização de Dados
                        </h3>

                        {renderVisualization()}

                        <div className="flex justify-end mt-4">
                          <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar Gráfico
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Help section */}
                  <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                    <h3 className="flex items-center font-medium mb-3">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                      Dicas para Visualização
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="font-medium flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-primary" />
                          Gráfico de Barras
                        </div>
                        <div className="text-sm mt-1">
                          Ideal para comparar valores entre diferentes grupos ou
                          categorias. Use quando quiser destacar diferenças
                          entre grupos (ex: gênero, grupos clínicos).
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md">
                        <div className="font-medium flex items-center gap-2">
                          <PieChart className="h-4 w-4 text-primary" />
                          Gráfico de Pizza
                        </div>
                        <div className="text-sm mt-1">
                          Útil para mostrar proporções ou percentuais de um
                          todo. Bom para visualizar a contribuição de cada fator
                          para a pontuação total.
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md">
                        <div className="font-medium flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-primary" />
                          Gráfico de Linha
                        </div>
                        <div className="text-sm mt-1">
                          Melhor para visualizar tendências em itens de um mesmo
                          fator. Permite identificar padrões nos itens que
                          compõem um determinado fator.
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md">
                        <div className="font-medium flex items-center gap-2">
                          <Share2 className="h-4 w-4 text-primary" />
                          Gráfico de Dispersão
                        </div>
                        <div className="text-sm mt-1">
                          Ideal para analisar correlações entre dois fatores.
                          Cada ponto representa um participante, permitindo
                          visualizar a relação entre variáveis.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Export Tab */}
            <TabsContent
              value="export"
              className="space-y-4 p-4 border rounded-md"
            >
              {!fileUploaded ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Dados não encontrados
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Importe dados primeiro para exportar resultados.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("import")}
                  >
                    Ir para Importação de Dados
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Dados Transformados</h3>
                          <p className="text-sm text-muted-foreground">
                            Exportar dados com cálculos adicionais
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm">
                          Exporta os dados originais com pontuações de fatores e
                          percentis calculados.
                        </p>

                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            Inclui:
                          </div>
                          <ul className="text-xs space-y-1">
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              Dados originais
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              Escores de fatores
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              Classificações por percentil
                            </li>
                          </ul>
                        </div>

                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar CSV
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Table2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Relatório Estatístico</h3>
                          <p className="text-sm text-muted-foreground">
                            Tabelas e estatísticas descritivas
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm">
                          Gera um relatório com todas as estatísticas calculadas
                          nas análises.
                        </p>

                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            Inclui:
                          </div>
                          <ul className="text-xs space-y-1">
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              Estatísticas descritivas
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              Resultados de testes estatísticos
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              Tabelas de frequência
                            </li>
                          </ul>
                        </div>

                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar PDF
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Visualizações</h3>
                          <p className="text-sm text-muted-foreground">
                            Gráficos e figuras
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm">
                          Exporta os gráficos e visualizações gerados nas
                          análises.
                        </p>

                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            Formatos disponíveis:
                          </div>
                          <ul className="text-xs space-y-1">
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              PNG (alta resolução)
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              SVG (vetorial)
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-primary" />
                              PDF (múltiplos gráficos)
                            </li>
                          </ul>
                        </div>

                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar Gráficos
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Report preview */}
                  <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
                    <h3 className="flex items-center font-medium mb-3">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Prévia do Relatório
                    </h3>

                    <div className="bg-white border rounded-md p-5 max-h-96 overflow-y-auto">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-1">
                          Relatório de Análise do IHS-2
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Gerado em {new Date().toLocaleDateString()} às{" "}
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold border-b pb-1 mb-3">
                            1. Informações Gerais
                          </h4>
                          <p>
                            Este relatório apresenta a análise de dados do
                            Inventário de Habilidades Sociais (IHS-2) de{" "}
                            {data.length} participantes.
                          </p>

                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="p-3 bg-muted/20 rounded-md">
                              <div className="text-sm font-medium">
                                Participantes
                              </div>
                              <div className="text-2xl font-bold">
                                {data.length}
                              </div>
                            </div>

                            {statistics.byGender && (
                              <div className="p-3 bg-muted/20 rounded-md">
                                <div className="text-sm font-medium">
                                  Distribuição por Gênero
                                </div>
                                <div className="flex gap-4 mt-1">
                                  {Object.entries(statistics.byGender).map(
                                    ([gender, stats]) => (
                                      <div key={gender}>
                                        <span className="font-medium">
                                          {gender === "M"
                                            ? "Masculino"
                                            : "Feminino"}
                                          :
                                        </span>{" "}
                                        <span>{stats.total.count}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold border-b pb-1 mb-3">
                            2. Estatísticas Descritivas
                          </h4>

                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                              <thead>
                                <tr className="bg-muted/20">
                                  <th className="border px-4 py-2">Fator</th>
                                  <th className="border px-4 py-2">Média</th>
                                  <th className="border px-4 py-2">
                                    Desvio Padrão
                                  </th>
                                  <th className="border px-4 py-2">Mínimo</th>
                                  <th className="border px-4 py-2">Máximo</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ihs2Factors.map((factor) => (
                                  <tr key={factor.id}>
                                    <td className="border px-4 py-2 font-medium">
                                      {factor.id}: {factor.name}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {statistics[factor.id]?.mean.toFixed(2) ||
                                        "-"}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {statistics[factor.id]?.sd.toFixed(2) ||
                                        "-"}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {statistics[factor.id]?.min || "-"}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {statistics[factor.id]?.max || "-"}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-muted/10">
                                  <td className="border px-4 py-2 font-medium">
                                    Escore Total
                                  </td>
                                  <td className="border px-4 py-2">
                                    {statistics.total?.mean.toFixed(2) || "-"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {statistics.total?.sd.toFixed(2) || "-"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {statistics.total?.min || "-"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {statistics.total?.max || "-"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {testResults && (
                          <div>
                            <h4 className="text-lg font-semibold border-b pb-1 mb-3">
                              3. Resultados de Análises Inferenciais
                            </h4>

                            {testResults.anova ? (
                              <div className="space-y-3">
                                <p>
                                  <span className="font-medium">
                                    Tipo de Análise:
                                  </span>{" "}
                                  {testResults.anova.type}
                                </p>
                                <p>
                                  <span className="font-medium">Variável:</span>{" "}
                                  {testResults.anova.factor} por{" "}
                                  {testResults.anova.groupVariable}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Resultados:
                                  </span>{" "}
                                  F({testResults.anova.dfBetween},{" "}
                                  {testResults.anova.dfWithin}) ={" "}
                                  {testResults.anova.fValue.toFixed(2)}, p ={" "}
                                  {testResults.anova.pValue.toFixed(3)}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Interpretação:
                                  </span>{" "}
                                  {testResults.anova.significant
                                    ? `Diferenças significativas foram encontradas (p < 0.05). Tamanho do efeito: ${testResults.anova.effectSizeMagnitude.toLowerCase()} (η² = ${testResults.anova.etaSquared.toFixed(
                                        3
                                      )}).`
                                    : "Não foram encontradas diferenças significativas (p > 0.05)."}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {Object.keys(testResults).map((factor) => {
                                  const result = testResults[factor];
                                  return (
                                    <div
                                      key={factor}
                                      className="p-3 bg-muted/10 rounded-md"
                                    >
                                      <p className="font-medium">
                                        Teste-t para {result.factor}
                                      </p>
                                      <p>
                                        Comparando grupos:{" "}
                                        {result.groups.join(" vs ")}
                                      </p>
                                      <p>
                                        t({result.df}) ={" "}
                                        {result.tValue.toFixed(2)}, p ={" "}
                                        {result.pValue.toFixed(3)}
                                      </p>
                                      <p>
                                        {result.significant
                                          ? `Diferença significativa (p < 0.05). Tamanho do efeito: ${result.effectSizeMagnitude.toLowerCase()} (d = ${result.cohensD.toFixed(
                                              2
                                            )}).`
                                          : "Diferença não significativa (p > 0.05)."}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <h4 className="text-lg font-semibold border-b pb-1 mb-3">
                            4. Conclusões
                          </h4>
                          <p>
                            A análise dos dados do IHS-2 revela que a pontuação
                            média total da amostra é{" "}
                            {statistics.total?.mean.toFixed(2) || "-"} (DP ={" "}
                            {statistics.total?.sd.toFixed(2) || "-"}).
                            {statistics.total?.mean &&
                              normativeData?.general?.mean &&
                              (statistics.total.mean >
                              normativeData.general.mean
                                ? " Este valor está acima da média normativa, sugerindo um bom repertório de habilidades sociais na amostra avaliada."
                                : " Este valor está abaixo da média normativa, sugerindo possíveis déficits no repertório de habilidades sociais da amostra avaliada.")}
                          </p>

                          <p className="mt-2">
                            Entre os fatores avaliados,{" "}
                            {(() => {
                              if (!statistics || !ihs2Factors)
                                return "não foi possível determinar o fator predominante.";

                              const factorMeans = ihs2Factors.map((f) => ({
                                id: f.id,
                                name: f.name,
                                mean: statistics[f.id]?.mean || 0,
                              }));

                              const highestMean = Math.max(
                                ...factorMeans.map((f) => f.mean)
                              );
                              const highestFactor = factorMeans.find(
                                (f) => f.mean === highestMean
                              );

                              return highestFactor
                                ? `o fator ${highestFactor.id} (${
                                    highestFactor.name
                                  }) apresentou a maior pontuação média (${highestFactor.mean.toFixed(
                                    2
                                  )}), indicando maior facilidade nesta área.`
                                : "não foi possível determinar o fator predominante.";
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Gerar Relatório Completo
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
