import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, PlusCircle, HelpCircle, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();

  const navItems = [
    { href: "/", label: "Главная", icon: LayoutDashboard },
    { href: "/create", label: "Новый токен", icon: PlusCircle },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex w-full flex-col relative overflow-hidden">

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-500/8 blur-[100px] animate-orb" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-500/6 blur-[100px] animate-orb" style={{ animationDelay: "-4s" }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-violet-500/8 dark:bg-violet-500/5 blur-[100px] animate-orb" style={{ animationDelay: "-8s" }} />
      </div>

      <header className="sticky top-0 z-30 border-b border-border/40">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />
        <div className="relative flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative p-1.5 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              Alert<span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">okens</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-primary/15 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span>Активно</span>
            </div>
            <button
              onClick={toggle}
              aria-label="Переключить тему"
              className="w-8 h-8 flex items-center justify-center rounded-xl glass-card hover:bg-secondary/60 transition-all duration-300 text-muted-foreground hover:text-foreground hover:scale-105"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-x-hidden p-4 md:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
