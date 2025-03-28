"use client";

import { NavMenu } from "@/components/dashboard/nav-menu";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we should use dark mode based on localStorage preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Auth check - token exists:", !!token);

        if (!token) {
          console.log("Redirecting to welcome (no token)");
          window.location.href = "/welcome";
          return;
        }

        setIsAuthenticated(true);
        console.log("User authenticated successfully");
      } catch (error) {
        console.error("Auth check error:", error);
        window.location.href = "/welcome";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  // While checking authentication, show a loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't show anything (the redirection has already been initiated)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, show the dashboard layout
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <NavMenu />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto">
          DASS-21 App &copy; {new Date().getFullYear()} - Sistema de Avaliação
          de Depressão, Ansiedade e Estresse
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}
