import { useRoute, useLocation } from "wouter";
import { useGetToken, useListTokenAlerts, useDeleteToken } from "@workspace/api-client-react";
import type { GeoData } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui-components";
import { ShieldCheck, ShieldAlert, Copy, Trash2, ArrowLeft, Clock, MapPin, Monitor, Network, Globe, Building2, CalendarClock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useCopy } from "@/hooks/use-copy";
import { Link } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TOKEN_TYPE_LABELS: Record<string, string> = {
  web: "Веб",
  dns: "DNS",
  email: "Email",
  pdf: "PDF",
  word: "Word",
  qr_code: "QR-код",
  image: "Изображение",
};

function GeoInfoBlock({ geoData }: { geoData: GeoData }) {
  return (
    <div className="mt-3 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
        Геолокация
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
        {geoData.city && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Город</div>
            <div className="font-medium text-foreground">{geoData.city}</div>
          </div>
        )}
        {geoData.regionName && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Регион</div>
            <div className="font-medium text-foreground">{geoData.regionName}</div>
          </div>
        )}
        {geoData.country && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Страна</div>
            <div className="font-medium text-foreground flex items-center gap-1.5">
              {geoData.countryCode && (
                <span className="text-base" title={geoData.country}>
                  {geoData.countryCode}
                </span>
              )}
              {geoData.country}
            </div>
          </div>
        )}
        {geoData.zip && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Индекс</div>
            <div className="font-medium text-foreground">{geoData.zip}</div>
          </div>
        )}
        {geoData.timezone && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Таймзона</div>
            <div className="font-medium text-foreground">{geoData.timezone}</div>
          </div>
        )}
        {geoData.lat !== undefined && geoData.lon !== undefined && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Координаты</div>
            <div className="font-mono text-foreground text-xs">{geoData.lat.toFixed(4)}, {geoData.lon.toFixed(4)}</div>
          </div>
        )}
      </div>

      {(geoData.org || geoData.isp || geoData.as || geoData.asname) && (
        <div className="mt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 mb-2.5">
            ASN / Провайдер
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            {geoData.as && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">ASN</div>
                <div className="font-mono text-foreground text-xs">{geoData.as.split(" ")[0]}</div>
              </div>
            )}
            {(geoData.asname || geoData.org) && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Организация</div>
                <div className="font-medium text-foreground">{geoData.org || geoData.asname}</div>
              </div>
            )}
            {geoData.isp && geoData.isp !== geoData.org && (
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Провайдер</div>
                <div className="font-medium text-foreground">{geoData.isp}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TokenDetails() {
  const [, params] = useRoute("/token/:id");
  const [, setLocation] = useLocation();
  const id = params?.id || "";
  const { copy } = useCopy();

  const { data: token, isLoading, error } = useGetToken(id);
  const { data: alertsData, isLoading: alertsLoading } = useListTokenAlerts(id);

  const deleteMutation = useDeleteToken({
    mutation: {
      onSuccess: () => {
        setLocation("/");
      }
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Загрузка данных…</div>;
  if (error || !token) return <div className="p-8 text-center text-destructive font-mono">ОШИБКА: Токен не найден или доступ запрещён.</div>;

  const fullUrl = token.triggerUrl;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>
        <div className="flex items-center gap-2">
          {!showDeleteConfirm ? (
            <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Удалить токен
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-destructive/10 p-1 rounded-md border border-destructive/20">
              <span className="text-sm text-destructive px-2 font-medium">Уверены?</span>
              <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Отмена</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate({ tokenId: token.id })} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Удаление…" : "Удалить"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <Card className="border-t-4 border-t-primary shadow-xl bg-gradient-to-b from-card to-background relative overflow-hidden">
        {token.triggered && (
          <div className="absolute inset-0 border-4 border-destructive/50 rounded-xl pointer-events-none animate-pulse" />
        )}
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className={`p-4 rounded-xl ${token.triggered ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
              {token.triggered ? <ShieldAlert className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{token.name}</h1>
                <Badge variant={token.triggered ? "destructive" : "default"} className="uppercase tracking-widest text-[10px]">
                  {token.triggered ? "СКОМПРОМЕТИРОВАН" : "ЗАЩИЩЁН"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-base">{token.memo}</p>

              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50 text-sm font-mono text-muted-foreground">
                <div>Тип: <span className="text-foreground">{TOKEN_TYPE_LABELS[token.type] ?? token.type.toUpperCase()}</span></div>
                <div>Создан: <span className="text-foreground">{format(parseISO(token.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}</span></div>
                <div>Срабатываний: <span className={token.triggerCount > 0 ? "text-destructive font-bold" : "text-primary"}>{token.triggerCount}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trigger URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            URL ловушки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/50 p-4 rounded-lg border border-border/50 flex flex-col md:flex-row gap-4 items-center justify-between group">
            <code className="text-primary break-all text-sm w-full md:w-auto selection:bg-primary/30">
              {fullUrl}
            </code>
            <Button variant="secondary" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all" onClick={() => copy(fullUrl, "URL скопирован")}>
              <Copy className="w-4 h-4 mr-2" /> Копировать
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Разместите этот URL там, где вы хотите поймать злоумышленника. Любой доступ к нему немедленно создаст тревогу.
          </p>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 mt-8">
          <Clock className="w-5 h-5 text-primary" />
          История тревог
        </h2>

        {alertsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Card key={i} className="h-24 animate-pulse bg-card/40" />)}
          </div>
        ) : alertsData?.alerts?.length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20 border-dashed">
            <p className="text-muted-foreground font-mono">Несанкционированного доступа не обнаружено.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alertsData?.alerts?.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-destructive shadow-md">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* Time & IP header */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="destructive" className="font-mono text-sm px-2.5 py-1">
                      {format(parseISO(alert.triggeredAt), "HH:mm:ss")}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {format(parseISO(alert.triggeredAt), "d MMMM yyyy", { locale: ru })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Source IP */}
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> IP-адрес источника
                      </div>
                      <div className={cn(
                        "font-mono text-sm px-3 py-1.5 rounded border inline-block",
                        alert.ipAddress
                          ? "bg-destructive/10 border-destructive/20 text-destructive"
                          : "bg-secondary/50 border-border text-muted-foreground"
                      )}>
                        {alert.ipAddress || "Неизвестен"}
                      </div>
                    </div>

                    {/* Referer */}
                    {alert.referer && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Источник запроса
                        </div>
                        <div className="text-sm text-foreground font-mono bg-secondary/30 px-2 py-1 rounded break-all">
                          {alert.referer}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Query Params */}
                  {alert.queryParams && (() => {
                    try {
                      const params = JSON.parse(alert.queryParams);
                      const entries = Object.entries(params);
                      if (entries.length === 0) return null;
                      return (
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Параметры запроса</div>
                          <div className="space-y-1">
                            {entries.map(([k, v]) => (
                              <div key={k} className="flex gap-2 font-mono text-xs">
                                <span className="text-primary">{k}</span>
                                <span className="text-muted-foreground">=</span>
                                <span className="text-foreground">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } catch { return null; }
                  })()}

                  {/* Geo data */}
                  {alert.geoData && <GeoInfoBlock geoData={alert.geoData} />}

                  {/* User Agent */}
                  {alert.userAgent && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> User-Agent
                      </div>
                      <div className="text-xs text-muted-foreground font-mono bg-black/20 p-2 rounded break-all border border-border/30">
                        {alert.userAgent}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
