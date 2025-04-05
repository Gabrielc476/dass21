"use client";

import { IHS2AssessmentForm } from "@/components/ihs2/ihs2-assessment-form";
import { useParams } from "next/navigation";

export default function NewIHS2AssessmentPage() {
  const params = useParams();
  return <IHS2AssessmentForm patientId={params.id} />;
}
