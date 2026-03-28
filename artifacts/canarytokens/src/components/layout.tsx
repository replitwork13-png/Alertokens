import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, PlusCircle, Activity, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();

  const navItems = [
    { href: "/", label: "Главная", icon: LayoutDashboard },
    { href: "/create", label: "Новый токен", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen flex w-full flex-col bg-background">

      {/* Top navbar — mobile & desktop */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/40 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Alert<span className="text-primary">okens</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side: status + theme toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Система активна</span>
            </div>
            <button
              onClick={toggle}
              aria-label="Переключить тему"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/60 bg-secondary hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
