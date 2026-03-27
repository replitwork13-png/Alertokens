import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, PlusCircle, Activity, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/create", label: "New Token", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen flex w-full flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-panel border-r border-border md:h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg border border-primary/50 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-foreground">Canary<span className="text-primary">Tokens</span></h1>
            <p className="text-xs text-muted-foreground font-mono">v1.0.0-SECURE</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Navigation</div>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_var(--color-primary)]" />
                )}
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            System Online & Monitoring
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[100vw] md:max-w-[calc(100vw-16rem)] overflow-x-hidden p-4 md:p-8 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
