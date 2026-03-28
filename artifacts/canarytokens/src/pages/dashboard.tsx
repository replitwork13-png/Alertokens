import { useListTokens, useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui-components";
import { AlertTriangle, ShieldCheck, Copy, ExternalLink, Activity, Network, FileText, Mail, QrCode, Image as ImageIcon, Globe, PlusCircle } from "lucide-react";
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
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: tokensData, isLoading: tokensLoading } = useListTokens({ page: 1, limit: 100 });
  const { copy } = useCopy();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Панель управления</h1>
          <p className="text-muted-foreground mt-1 text-sm">Мониторинг и управление активными токенами-ловушками.</p>
        </div>
        <Link
          href="/create"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Создать токен
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <Card className="relative overflow-hidden border-primary/20">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ShieldCheck className="w-12 h-12 md:w-16 md:h-16" />
          </div>
          <CardHeader className="pb-1 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Активных</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {statsLoading ? "…" : stats?.totalTokens ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-destructive/20">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-destructive">
            <AlertTriangle className="w-12 h-12 md:w-16 md:h-16" />
          </div>
          <CardHeader className="pb-1 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Сработало</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-3xl md:text-4xl font-bold text-destructive">
              {statsLoading ? "…" : stats?.triggeredTokens ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity className="w-12 h-12 md:w-16 md:h-16" />
          </div>
          <CardHeader className="pb-1 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Тревог</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {statsLoading ? "…" : stats?.totalAlerts ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token List */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-3 flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Мои токены
        </h2>

        {tokensLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-36 bg-card/40" />
            ))}
          </div>
        ) : tokensData?.tokens?.length === 0 ? (
          <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2">
            <ShieldCheck className="w-14 h-14 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">Нет активных токенов</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              Создайте первый токен-ловушку, чтобы начать отслеживать несанкционированный доступ.
            </p>
            <Link href="/create" className="mt-5 text-primary hover:underline font-medium text-sm">
              Создать токен →
            </Link>
          </Card>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {tokensData?.tokens?.map((token) => (
              <motion.div variants={item} key={token.id}>
                <Link href={`/token/${token.id}`} className="block">
                  <Card className={cn(
                    "hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden",
                    token.triggered ? "border-destructive/40 bg-destructive/5" : "border-border/50"
                  )}>
                    {token.triggered && (
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-destructive" />
                    )}
                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <Badge variant="outline" className="uppercase text-[10px] tracking-widest gap-1 border-primary/30 text-primary">
                            {getTokenIcon(token.type)}
                            {TOKEN_TYPE_LABELS[token.type] ?? token.type}
                          </Badge>
                          {token.triggered && (
                            <Badge variant="destructive" className="animate-pulse text-[10px]">
                              СРАБОТАЛ
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="truncate group-hover:text-primary transition-colors text-base">
                          {token.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                        {token.memo || "Без описания."}
                      </p>
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
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
                    </CardContent>
                    <div className="px-4 py-2.5 bg-secondary/50 border-t border-border/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
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
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
