import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  UserCircle,
  ClipboardList,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  User,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

export function NavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logout realizado", {
      description: "Você foi desconectado com sucesso.",
    });

    // Redirect to login
    router.push("/login");
  };

  const navItems = [
    { name: "Início", href: "/", icon: <Home className="mr-2 h-5 w-5" /> },
    {
      name: "Pacientes",
      href: "/patients",
      icon: <UserCircle className="mr-2 h-5 w-5" />,
    },
  ];

  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-950 border-b">
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col gap-6 pt-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">DASS-21 App</h2>
                <p className="text-sm text-muted-foreground">
                  Sistema de Avaliação
                </p>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium 
                      ${
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="ml-4 lg:ml-0 text-xl font-bold">
          DASS-21 App
        </Link>

        <nav className="hidden lg:flex ml-10 space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium 
                ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <div className="hidden md:flex items-center mr-4 text-sm">
            <User className="mr-2 h-4 w-4" />
            <span>{user.username}</span>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Sair</span>
        </Button>
      </div>
    </div>
  );
}
