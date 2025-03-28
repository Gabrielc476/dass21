"use client";

import { AssessmentForm } from "@/components/assessments/assessment-form";
import { useParams } from "next/navigation";

export default function NewAssessmentPage() {
  const params = useParams();
  return <AssessmentForm patientId={params.id} />;
}
