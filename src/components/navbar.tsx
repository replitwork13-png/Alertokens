"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, PlusCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Главная", icon: LayoutDashboard },
    { href: "/create", label: "Новый токен", icon: PlusCircle },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-[hsl(250,30%,7%)]/60 backdrop-blur-xl" />
      <div className="relative flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative p-1.5 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-105">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Alert<span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">okens</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-[hsl(215,15%,55%)] hover:bg-white/[0.05] hover:text-[hsl(220,20%,92%)]"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[hsl(215,15%,55%)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span>Активно</span>
          </div>
        </div>
      </div>
    </header>
  );
}
