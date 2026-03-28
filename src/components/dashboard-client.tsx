"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldCheck, Network, Globe, Mail, FileText, QrCode, Image as ImageIcon, CreditCard, ExternalLink, Activity, PlusCircle, Copy, Zap, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn, TOKEN_TYPE_LABELS } from "@/lib/utils";
import type { Token } from "@/lib/schema";

function useCopy() {
  return (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };
}

const TOKEN_ICONS: Record<string, React.ElementType> = {
  web: Network, dns: Globe, email: Mail, pdf: FileText, word: FileText,
  qr_code: QrCode, image: ImageIcon, credit_card: CreditCard, redirect: ExternalLink,
};

interface Props {
  tokens: Token[];
  totalAlerts: number;
  triggeredCount: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function DashboardClient({ tokens, totalAlerts, triggeredCount }: Props) {
  const copy = useCopy();

  const statsCards = [
    { label: "Активных", value: tokens.length, icon: ShieldCheck, gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/20" },
    { label: "Сработало", value: triggeredCount, icon: Zap, gradient: "from-rose-500 to-pink-600", glow: "shadow-rose-500/20" },
    { label: "Записей", value: totalAlerts, icon: TrendingUp, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Панель управления</h1>
          <p className="text-[hsl(215,15%,55%)] mt-1 text-sm">Мониторинг и управление активными токенами-ловушками.</p>
        </div>
        <Link
          href="/create"
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:-translate-y-0.5 hover:scale-[1.02] inline-flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Создать токен
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-3 md:gap-5"
      >
        {statsCards.map((s) => (
          <div key={s.label} className={cn("relative overflow-hidden rounded-2xl glass-card p-4 md:p-5 group transition-all duration-500 hover:scale-[1.02]", `shadow-lg ${s.glow}`)}>
            <div className={cn("absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br opacity-15 group-hover:opacity-25 transition-opacity duration-500 blur-md", s.gradient)} />
            <div className={cn("inline-flex p-2 rounded-xl bg-gradient-to-br text-white mb-3 shadow-md", s.gradient)}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-[hsl(215,15%,55%)] uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl md:text-4xl font-extrabold mt-1 tracking-tight">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2"
        >
          <Network className="w-5 h-5 text-purple-400" />
          Мои токены
        </motion.h2>

        {tokens.length === 0 ? (
          <div className="rounded-2xl glass-card p-10 flex flex-col items-center justify-center text-center border border-dashed border-purple-500/20">
            <ShieldCheck className="w-14 h-14 text-[hsl(215,15%,55%)]/30 mb-4" />
            <h3 className="text-lg font-semibold">Нет активных токенов</h3>
            <p className="text-[hsl(215,15%,55%)] mt-2 max-w-md text-sm">Создайте первый токен-ловушку, чтобы начать отслеживать несанкционированный доступ.</p>
            <Link href="/create" className="mt-5 text-purple-400 hover:underline font-medium text-sm">Создать токен →</Link>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => {
              const Icon = TOKEN_ICONS[token.type] ?? Activity;
              return (
                <motion.div variants={item} key={token.id}>
                  <Link href={`/token/${token.id}`} className="block group">
                    <div className={cn(
                      "rounded-2xl glass-card overflow-hidden transition-all duration-300 cursor-pointer relative",
                      "hover:scale-[1.02] hover:shadow-xl",
                      token.triggered
                        ? "border-rose-500/30 hover:border-rose-500/50 hover:shadow-rose-500/10"
                        : "hover:border-purple-500/40 hover:shadow-purple-500/10"
                    )}>
                      {token.triggered && (
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
                      )}
                      <div className="p-4 pb-3">
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px] uppercase tracking-widest font-semibold">
                            <Icon className="w-3 h-3" />
                            {TOKEN_TYPE_LABELS[token.type] ?? token.type}
                          </span>
                          {token.triggered && (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] uppercase tracking-widest font-bold">СРАБОТАЛ</span>
                          )}
                        </div>
                        <h3 className="font-bold text-base truncate group-hover:text-purple-400 transition-colors duration-300">{token.name}</h3>
                        <p className="text-sm text-[hsl(215,15%,55%)] line-clamp-2 mt-1 h-10">{token.memo || "Без описания."}</p>
                      </div>
                      <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono text-[hsl(215,15%,55%)]">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{token.triggerCount} срабат.</span>
                        <span>{token.lastTriggeredAt ? formatDistanceToNow(new Date(token.lastTriggeredAt), { addSuffix: true, locale: ru }) : "Не срабатывал"}</span>
                      </div>
                      <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.04] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          className="flex items-center gap-1 text-xs text-[hsl(215,15%,55%)] hover:text-purple-400 transition-colors"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); copy(token.token); }}
                        >
                          <Copy className="w-3 h-3" /> Токен
                        </button>
                        <span className="text-xs text-[hsl(215,15%,55%)] flex items-center gap-1">Детали <ExternalLink className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
