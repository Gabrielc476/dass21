"use client";

import { NavMenu } from "@/components/dashboard/nav-menu";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [pathname]);

  if (!isAuthChecked) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavMenu />
      <main className="flex-1 container mx-auto p-4 md:p-6">{children}</main>
      <Toaster />
    </div>
  );
}
