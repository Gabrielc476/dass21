// src/components/assessments/historical-trends-chart.jsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp } from "lucide-react";

export function HistoricalTrendsChart({ patientId }) {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssessments();
  }, [patientId]);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
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

      // Sort assessments by date
      const sortedAssessments = data.assessments.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Format the data for the chart
      const chartData = sortedAssessments.map((assessment) => ({
        date: new Date(assessment.date).toLocaleDateString("pt-BR"),
        depression: assessment.depression.score,
        anxiety: assessment.anxiety.score,
        stress: assessment.stress.score,
        depressionLevel: assessment.depression.level,
        anxietyLevel: assessment.anxiety.level,
        stressLevel: assessment.stress.level,
      }));

      setAssessments(chartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (assessments.length < 2) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <CardTitle>Histórico de Pontuações DASS-21</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-muted-foreground">
              São necessárias pelo menos 2 avaliações para visualizar o
              histórico de progressão.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Reference lines for severity thresholds
  const depressionThresholds = [
    { value: 9, label: "Normal/Leve", stroke: "#4ade80" },
    { value: 13, label: "Leve/Moderado", stroke: "#60a5fa" },
    { value: 20, label: "Moderado/Severo", stroke: "#f97316" },
    { value: 27, label: "Severo/Extremo", stroke: "#ef4444" },
  ];

  const anxietyThresholds = [
    { value: 7, label: "Normal/Leve", stroke: "#4ade80" },
    { value: 9, label: "Leve/Moderado", stroke: "#60a5fa" },
    { value: 14, label: "Moderado/Severo", stroke: "#f97316" },
    { value: 19, label: "Severo/Extremo", stroke: "#ef4444" },
  ];

  const stressThresholds = [
    { value: 14, label: "Normal/Leve", stroke: "#4ade80" },
    { value: 18, label: "Leve/Moderado", stroke: "#60a5fa" },
    { value: 25, label: "Moderado/Severo", stroke: "#f97316" },
    { value: 33, label: "Severo/Extremo", stroke: "#ef4444" },
  ];

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
                <div className="font-medium">
                  {entry.value} ({payload[0].payload[`${entry.dataKey}Level`]})
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <CardTitle>Histórico de Pontuações DASS-21</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={assessments}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                domain={[0, 42]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Pontuação",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Depression reference lines */}
              {depressionThresholds.map((threshold, index) => (
                <ReferenceLine
                  key={`depression-${index}`}
                  y={threshold.value}
                  stroke={threshold.stroke}
                  strokeDasharray="3 3"
                  label={{
                    value: threshold.label,
                    position: "left",
                    fill: threshold.stroke,
                    fontSize: 10,
                  }}
                />
              ))}

              <Line
                type="monotone"
                dataKey="depression"
                name="Depressão"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                name="Ansiedade"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="stress"
                name="Estresse"
                stroke="#ffc658"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          * Linhas horizontais representam os limiares de severidade para
          depressão
        </div>
      </CardContent>
    </Card>
  );
}
