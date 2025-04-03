"use client";

import { AssessmentResults } from "@/components/assessments/assessment-results";
import { useParams } from "next/navigation";

export default function AssessmentDetailsPage() {
  const params = useParams();
  return (
    <AssessmentResults
      patientId={params.id}
      assessmentId={params.assessmentId}
    />
  );
}
