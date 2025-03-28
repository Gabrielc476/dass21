"use client";

import { AssessmentUpload } from "@/components/assessments/assessment-upload";
import { useParams } from "next/navigation";

export default function UploadAssessmentPage() {
  const params = useParams();
  return <AssessmentUpload patientId={params.id} />;
}
