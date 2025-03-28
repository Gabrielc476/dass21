"use client";

import { AssessmentList } from "@/components/assessments/assessment-list";
import { useParams } from "next/navigation";

export default function PatientAssessmentsPage() {
  const params = useParams();
  return <AssessmentList patientId={params.id} />;
}
