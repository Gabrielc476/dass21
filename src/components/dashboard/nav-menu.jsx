import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  UserCircle,
  ClipboardList,
  BarChart2,
  LogOut,
  Menu,
  User,
  Home,
  Brain,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setIsMounted(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    return user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navItems = [
    { name: "Início", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    {
      name: "Pacientes",
      href: "/dashboard/patients",
      icon: <UserCircle className="h-5 w-5" />,
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <div className="flex flex-col gap-6 px-2">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-lg font-bold">DASS-21 App</div>
                  <div className="text-xs text-muted-foreground">
                    Sistema de Avaliação
                  </div>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-current">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-auto">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user?.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da conta
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="mr-8 flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">
              DASS-21 App
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-current">
                  {item.icon}
                </span>
                {item.name}
                {pathname === item.href ||
                pathname.startsWith(`${item.href}/`) ? (
                  <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
                ) : null}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="mr-2"
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center gap-2 h-8 w-full justify-start rounded-md px-2 sm:pr-12 md:w-40"
              >
                <Avatar className="h-7 w-7 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-flex text-sm font-medium">
                  {user?.username?.split(" ")[0]}
                </span>
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 border-none shadow-blue"
            >
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-0.5 leading-none">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
