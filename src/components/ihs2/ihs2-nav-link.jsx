import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function IHS2NavLink() {
  const pathname = usePathname();
  const isActive = pathname.includes("/dashboard/ihs2");

  return (
    <Link
      href="/dashboard/ihs2"
      className={`group flex items-center gap-2 text-sm font-medium transition-colors ${
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-current">
        <BrainCircuit className="h-4 w-4" />
      </span>
      Análise IHS-2
      {isActive && (
        <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      )}
    </Link>
  );
}
