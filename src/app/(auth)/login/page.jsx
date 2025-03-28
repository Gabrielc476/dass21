"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">DASS-21 App</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Avaliação DASS-21
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
