"use client";

import { PatientForm } from "@/components/patients/patient-form";
import { useParams } from "next/navigation";

export default function EditPatientPage() {
  const params = useParams();
  return <PatientForm patientId={params.id} />;
}
