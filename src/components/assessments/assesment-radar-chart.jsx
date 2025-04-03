// src/components/assessments/assessment-radar-chart.jsx
import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain } from "lucide-react";

export function AssessmentRadarChart({ assessment, className }) {
  if (!assessment) return null;

  // Helper function to get color based on score
  const getScoreColor = (score, category) => {
    let thresholds;

    if (category === "depression") {
      thresholds = [9, 13, 20, 27];
    } else if (category === "anxiety") {
      thresholds = [7, 9, 14, 19];
    } else {
      // stress
      thresholds = [14, 18, 25, 33];
    }

    if (score <= thresholds[0]) return "#22c55e"; // Normal - Green
    if (score <= thresholds[1]) return "#3b82f6"; // Mild - Blue
    if (score <= thresholds[2]) return "#f97316"; // Moderate - Orange
    if (score <= thresholds[3]) return "#ef4444"; // Severe - Red
    return "#7f1d1d"; // Extremely Severe - Dark Red
  };

  // Create data for the radar chart
  const radarData = [
    {
      subject: "Depressão",
      score: assessment.depression.score,
      fullMark: 42,
      color: getScoreColor(assessment.depression.score, "depression"),
      level: assessment.depression.level,
    },
    {
      subject: "Ansiedade",
      score: assessment.anxiety.score,
      fullMark: 42,
      color: getScoreColor(assessment.anxiety.score, "anxiety"),
      level: assessment.anxiety.level,
    },
    {
      subject: "Estresse",
      score: assessment.stress.score,
      fullMark: 42,
      color: getScoreColor(assessment.stress.score, "stress"),
      level: assessment.stress.level,
    },
  ];

  // Calculate average score
  const averageScore = (
    (assessment.depression.score +
      assessment.anxiety.score +
      assessment.stress.score) /
    3
  ).toFixed(1);

  // Custom tooltip for the radar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-md shadow-lg p-3">
          <p className="font-medium">{data.subject}</p>
          <p className="text-sm">
            Pontuação: <span className="font-medium">{data.score}</span>
          </p>
          <p className="text-sm">
            Nível: <span className="font-medium">{data.level}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle>Perfil DASS-21</CardTitle>
            <CardDescription>
              Visualização em radar das subescalas
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-col items-center text-right">
          <span className="text-sm text-muted-foreground">Média</span>
          <span className="text-2xl font-bold">{averageScore}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 42]}
                tick={{ fill: "#9ca3af", fontSize: 10 }}
              />
              <Radar
                name="Pontuação"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {radarData.map((item) => (
            <div key={item.subject} className="text-center">
              <div className="text-xs text-muted-foreground">
                {item.subject}
              </div>
              <div className="text-lg font-bold" style={{ color: item.color }}>
                {item.score}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: item.color }}
              >
                {item.level}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
