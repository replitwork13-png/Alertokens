import { useStore } from "@/contexts/store-context";
import { Badge, Button } from "@/components/ui-components";
import { AlertTriangle, ShieldCheck, Copy, ExternalLink, Activity, Network, FileText, Mail, QrCode, Image as ImageIcon, Globe, PlusCircle, CreditCard, Zap, TrendingUp } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "wouter";
import { useCopy } from "@/hooks/use-copy";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const getTokenIcon = (type: string) => {
  switch (type) {
    case 'web': return <Network className="w-4 h-4" />;
    case 'dns': return <Globe className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    case 'pdf':
    case 'word': return <FileText className="w-4 h-4" />;
    case 'qr_code': return <QrCode className="w-4 h-4" />;
    case 'image': return <ImageIcon className="w-4 h-4" />;
    case 'credit_card': return <CreditCard className="w-4 h-4" />;
    case 'redirect': return <ExternalLink className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const TOKEN_TYPE_LABELS: Record<string, string> = {
  web: "Веб",
  dns: "DNS",
  email: "Email",
  pdf: "PDF",
  word: "Word",
  qr_code: "QR-код",
  image: "Изображение",
  credit_card: "Карта",
  redirect: "Редирект",
};

export default function Dashboard() {
  const { tokens, alerts } = useStore();
  const { copy } = useCopy();

  const totalTokens = tokens.length;
  const triggeredTokens = tokens.filter(t => t.triggered).length;
  const totalAlerts = alerts.length;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    }
  };

  const statsCards = [
    { label: "Активных", value: totalTokens, icon: ShieldCheck, gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/20" },
    { label: "Сработало", value: triggeredTokens, icon: Zap, gradient: "from-rose-500 to-pink-600", glow: "shadow-rose-500/20" },
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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Панель управления</h1>
          <p className="text-muted-foreground mt-1 text-sm">Мониторинг и управление активными токенами-ловушками.</p>
        </div>
        <Link
          href="/create"
          className="relative group bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:-translate-y-0.5 hover:scale-[1.02] inline-flex items-center gap-2 text-sm whitespace-nowrap"
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
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
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
          <Network className="w-5 h-5 text-primary" />
          Мои токены
        </motion.h2>

        {tokens.length === 0 ? (
          <div className="rounded-2xl glass-card p-10 flex flex-col items-center justify-center text-center border border-dashed border-primary/20">
            <ShieldCheck className="w-14 h-14 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">Нет активных токенов</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              Создайте первый токен-ловушку, чтобы начать отслеживать несанкционированный доступ.
            </p>
            <Link href="/create" className="mt-5 text-primary hover:underline font-medium text-sm">
              Создать токен →
            </Link>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {tokens.map((token) => (
              <motion.div variants={item} key={token.id}>
                <Link href={`/token/${token.id}`} className="block group">
                  <div className={cn(
                    "rounded-2xl glass-card overflow-hidden transition-all duration-300 cursor-pointer relative",
                    "hover:scale-[1.02] hover:shadow-xl",
                    token.triggered
                      ? "border-rose-500/30 hover:border-rose-500/50 hover:shadow-rose-500/10"
                      : "hover:border-primary/40 hover:shadow-primary/10"
                  )}>
                    {token.triggered && (
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 animate-gradient-shift" />
                    )}
                    <div className="p-4 pb-3">
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-widest gap-1 border-primary/30 text-primary bg-primary/10">
                          {getTokenIcon(token.type)}
                          {TOKEN_TYPE_LABELS[token.type] ?? token.type}
                        </Badge>
                        {token.triggered && (
                          <Badge className="text-[10px] bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-sm">
                            СРАБОТАЛ
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors duration-300">
                        {token.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 h-10">
                        {token.memo || "Без описания."}
                      </p>
                    </div>
                    <div className="px-4 py-2.5 border-t border-border/40 flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {token.triggerCount} срабат.
                      </span>
                      <span>
                        {token.lastTriggeredAt
                          ? formatDistanceToNow(parseISO(token.lastTriggeredAt), { addSuffix: true, locale: ru })
                          : "Не срабатывал"}
                      </span>
                    </div>
                    <div className="px-4 py-2.5 bg-secondary/30 border-t border-border/30 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          copy(token.triggerUrl, "URL скопирован");
                        }}
                      >
                        <Copy className="w-3 h-3" /> Копировать URL
                      </Button>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Детали <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
