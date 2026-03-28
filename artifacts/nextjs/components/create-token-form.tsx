"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Network, Globe, Mail, FileText, QrCode, Image as ImageIcon, CreditCard, ExternalLink, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TokenType } from "@/lib/schema";

const TOKEN_TYPES = [
  { id: "web" as TokenType, name: "Веб-ловушка", icon: Network, desc: "Срабатывает при открытии URL.", color: "from-blue-500 to-cyan-500" },
  { id: "dns" as TokenType, name: "DNS-токен", icon: Globe, desc: "Срабатывает при DNS-запросе.", color: "from-emerald-500 to-teal-500" },
  { id: "email" as TokenType, name: "Email-адрес", icon: Mail, desc: "Срабатывает при отправке письма.", color: "from-amber-500 to-orange-500" },
  { id: "pdf" as TokenType, name: "PDF-документ", icon: FileText, desc: "Срабатывает при открытии файла.", color: "from-rose-500 to-pink-500" },
  { id: "word" as TokenType, name: "Word-документ", icon: FileText, desc: "Срабатывает при открытии файла.", color: "from-blue-500 to-indigo-500" },
  { id: "qr_code" as TokenType, name: "QR-код", icon: QrCode, desc: "Срабатывает при сканировании.", color: "from-violet-500 to-purple-500" },
  { id: "image" as TokenType, name: "Изображение", icon: ImageIcon, desc: "Встроите токен в изображение.", color: "from-pink-500 to-fuchsia-500" },
  { id: "credit_card" as TokenType, name: "Кредитная карта", icon: CreditCard, desc: "Фейковая карта — ловушка для воров.", color: "from-yellow-500 to-amber-500" },
  { id: "redirect" as TokenType, name: "URL-редирект", icon: ExternalLink, desc: "Записывает переход и перенаправляет.", color: "from-teal-500 to-emerald-500" },
];

export function CreateTokenForm() {
  const router = useRouter();
  const [type, setType] = useState<TokenType>("web");
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !memo) return;
    if (type === "redirect" && !redirectUrl) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, memo, alertEmail: alertEmail || undefined, redirectUrl: type === "redirect" ? redirectUrl : undefined }),
      });
      if (!res.ok) throw new Error("Ошибка создания токена");
      const token = await res.json();
      router.push(`/token/${token.id}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          Создать токен
        </h1>
        <p className="text-[hsl(215,15%,55%)] mt-2 text-sm">Разверните новую ловушку для обнаружения несанкционированного доступа.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-2xl glass-card overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="text-base font-bold">1. Тип токена</h2>
            <p className="text-sm text-[hsl(215,15%,55%)] mt-0.5">Выберите, в каком виде будет ловушка.</p>
          </div>
          <div className="p-5 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TOKEN_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={cn(
                      "cursor-pointer rounded-xl p-3 border transition-all duration-300 relative overflow-hidden",
                      isSelected ? "border-purple-500/50 bg-purple-500/10 shadow-md scale-[1.02]" : "border-white/[0.06] bg-white/[0.02] hover:border-purple-500/30 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className={cn("inline-flex p-1.5 rounded-lg mb-2 transition-all duration-300", isSelected ? `bg-gradient-to-br ${t.color} text-white shadow-sm` : "bg-white/[0.06] text-[hsl(215,15%,55%)]")}>
                      <t.icon className="w-4 h-4" />
                    </div>
                    <h3 className={cn("font-semibold text-sm mb-0.5", isSelected ? "text-white" : "text-[hsl(215,15%,55%)]")}>{t.name}</h3>
                    <p className="text-[11px] text-[hsl(215,15%,45%)] hidden sm:block leading-snug">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {type === "redirect" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl glass-card overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="text-base font-bold">URL для перенаправления</h2>
            </div>
            <div className="p-5 pt-2">
              <input type="url" placeholder="https://www.example.com" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} required className="w-full h-10 px-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="rounded-2xl glass-card overflow-hidden">
          <div className="p-5 pb-3">
            <h2 className="text-base font-bold">2. Данные токена</h2>
            <p className="text-sm text-[hsl(215,15%,55%)] mt-0.5">Укажите название и напоминание — чтобы потом понять, что это и где стоит.</p>
          </div>
          <div className="p-5 pt-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Название <span className="text-red-400">*</span></label>
              <input type="text" placeholder="Например: Бекап БД на сервере" value={name} onChange={(e) => setName(e.target.value)} required className="w-full h-10 px-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Напоминание <span className="text-red-400">*</span></label>
              <textarea placeholder="Где установлен этот токен? Зачем?" value={memo} onChange={(e) => setMemo(e.target.value)} required className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(215,15%,55%)]">Email для уведомлений</label>
              <input type="email" placeholder="your@email.com" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
              <p className="text-xs text-[hsl(215,15%,45%)]">Получите автоматическое письмо при срабатывании токена.</p>
            </div>
          </div>
        </motion.div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => router.push("/")} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[hsl(215,15%,55%)] hover:bg-white/[0.05] hover:text-white transition-all">Отмена</button>
          <button
            type="submit"
            disabled={!name || !memo || isSubmitting || (type === "redirect" && !redirectUrl)}
            className="px-6 py-2.5 rounded-xl font-bold tracking-wide bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Создание...</> : "Создать токен"}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
