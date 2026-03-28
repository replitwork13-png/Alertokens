import { useRoute, useLocation } from "wouter";
import { useStore } from "@/contexts/store-context";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui-components";
import {
  ShieldCheck, ShieldAlert, Copy, Trash2, ArrowLeft, Clock, MapPin,
  Monitor, Network, Globe, Building2, CalendarClock, QrCode, Download,
  Image as ImageIcon, CreditCard, Lock, Calendar, User, ExternalLink,
  X, HelpCircle, PlusCircle, FileText, AlertTriangle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useCopy } from "@/hooks/use-copy";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import QRCode from "qrcode";
import { motion } from "framer-motion";

const TOKEN_TYPE_LABELS: Record<string, string> = {
  web: "Веб",
  dns: "DNS",
  email: "Email",
  pdf: "PDF",
  word: "Word",
  qr_code: "QR-код",
  image: "Изображение",
  credit_card: "Кредитная карта",
  redirect: "URL-редирект",
};

export default function TokenDetails() {
  const [, params] = useRoute("/token/:id");
  const [, setLocation] = useLocation();
  const id = params?.id || "";
  const { getToken, deleteToken, recordTrigger, getAlerts } = useStore();
  const { copy } = useCopy();

  const token = getToken(id);
  const alertsList = getAlerts(id);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [triggerNotes, setTriggerNotes] = useState("");
  const [triggerIp, setTriggerIp] = useState("");

  useEffect(() => {
    if (token?.triggerUrl) {
      QRCode.toDataURL(token.triggerUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
    }
  }, [token?.triggerUrl]);

  if (!token) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-mono">ОШИБКА: Токен не найден.</p>
        <Link href="/" className="mt-4 text-primary hover:underline text-sm block">← На главную</Link>
      </div>
    );
  }

  const isQrType = token.type === "qr_code";
  const isImageType = token.type === "image";
  const isCreditCard = token.type === "credit_card";
  const isRedirect = token.type === "redirect";
  const cardData = token.cardData;

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `alertoken-qr-${token.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const handleRecordTrigger = () => {
    recordTrigger(token.id, {
      ipAddress: triggerIp || undefined,
      notes: triggerNotes || undefined,
    });
    setTriggerNotes("");
    setTriggerIp("");
    setShowTriggerForm(false);
  };

  const handleDelete = () => {
    deleteToken(token.id);
    setLocation("/");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Nav row */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-all duration-300 text-sm hover:-translate-x-0.5">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>
        <div className="flex items-center gap-2">
          {!showDeleteConfirm ? (
            <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive rounded-xl" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Удалить токен
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-destructive/10 p-1 rounded-xl border border-destructive/20">
              <span className="text-sm text-destructive px-2 font-medium">Уверены?</span>
              <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="rounded-lg">Отмена</Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} className="rounded-lg">Удалить</Button>
            </div>
          )}
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-2xl glass-card overflow-hidden relative border-t-2 border-t-primary shadow-xl">
        {token.triggered && (
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
        )}
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className={`p-4 rounded-xl ${token.triggered ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-500' : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-primary'}`}>
              {token.triggered ? <ShieldAlert className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{token.name}</h1>
                <Badge variant={token.triggered ? "destructive" : "default"} className="uppercase tracking-widest text-[10px]">
                  {token.triggered ? "СКОМПРОМЕТИРОВАН" : "ЗАЩИЩЁН"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-base">{token.memo}</p>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50 text-sm font-mono text-muted-foreground">
                <div>Тип: <span className="text-foreground">{TOKEN_TYPE_LABELS[token.type] ?? token.type}</span></div>
                <div>Создан: <span className="text-foreground">{format(parseISO(token.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}</span></div>
                <div>Срабатываний: <span className={token.triggerCount > 0 ? "text-destructive font-bold" : "text-primary"}>{token.triggerCount}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Trigger URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Идентификатор токена
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/30 p-4 rounded-xl border border-border/50 flex flex-col md:flex-row gap-4 items-center justify-between group">
            <code className="text-primary break-all text-sm w-full md:w-auto selection:bg-primary/30">{token.token}</code>
            <Button variant="secondary" className="shrink-0" onClick={() => copy(token.token, "Токен скопирован")}>
              <Copy className="w-4 h-4 mr-2" /> Копировать
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Используйте этот идентификатор для отслеживания где размещён токен. В статической версии приложения автоматическая фиксация срабатывания недоступна — используйте кнопку «Записать срабатывание» ниже, когда обнаружите подозрительную активность.
          </p>
        </CardContent>
      </Card>

      {/* Manual trigger recording */}
      <Card className="border-amber-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Зафиксировать срабатывание вручную</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Обнаружили, что токен был использован? Запишите событие с подробностями.</p>
            </div>
          </div>
          {showTriggerForm ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">IP-адрес (необязательно)</label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={triggerIp}
                  onChange={e => setTriggerIp(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-input bg-background/30 backdrop-blur-sm px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Заметка</label>
                <textarea
                  placeholder="Что именно произошло? Откуда узнали?"
                  value={triggerNotes}
                  onChange={e => setTriggerNotes(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background/30 backdrop-blur-sm px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRecordTrigger} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 hover:from-rose-600 hover:to-pink-600">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Записать срабатывание
                </Button>
                <Button variant="ghost" onClick={() => setShowTriggerForm(false)}>Отмена</Button>
              </div>
            </motion.div>
          ) : (
            <Button
              onClick={() => setShowTriggerForm(true)}
              variant="outline"
              className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Записать срабатывание
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Credit Card */}
      {isCreditCard && cardData && (
        <Card className="border-primary/30 shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-5">
            <div className="bg-primary/20 p-3 rounded-full">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Кредитная карта-ловушка</h3>
              <p className="text-muted-foreground text-sm mt-1">Разместите эти данные там, где хотите поймать злоумышленника.</p>
            </div>
            <div className="w-full max-w-sm rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0a3d 0%, #7c3aed 50%, #6d28d9 100%)" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }} />
              <div className="relative z-10 text-left space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Alertoken</div>
                  <div className="text-white font-bold text-lg tracking-wider">{cardData.cardBrand}</div>
                </div>
                <div className="pt-2">
                  <div className="text-white/70 text-[10px] mb-1">Владелец</div>
                  <div className="text-white font-mono text-sm tracking-wide">{cardData.cardName}</div>
                </div>
                <div className="text-white font-mono text-xl tracking-[0.15em] pt-1">{cardData.cardNumber}</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-white/70 text-[10px]">Действует до</div>
                    <div className="text-white font-mono text-sm">{cardData.cardExpiry}</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-[10px]">Код</div>
                    <div className="text-white font-mono text-sm">{cardData.cardCvv}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full max-w-sm space-y-2.5">
              {[
                { icon: User, label: "Имя на карте", value: cardData.cardName },
                { icon: CreditCard, label: "Номер карты", value: cardData.cardNumber },
                { icon: Calendar, label: "Срок действия", value: cardData.cardExpiry },
                { icon: Lock, label: "CVV", value: cardData.cardCvv },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between bg-secondary/40 rounded-xl px-4 py-3 border border-border/40">
                  <div className="flex items-center gap-3 text-left">
                    <row.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{row.label}</div>
                      <div className="font-mono text-foreground text-sm">{row.value}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 hover:bg-primary/20 hover:text-primary" onClick={() => copy(row.value, `${row.label} скопирован`)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview */}
      {isImageType && token.imageData && (
        <Card className="border-primary/30 shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Изображение-ловушка</h3>
              <p className="text-muted-foreground text-sm mt-1">Изображение сохранено локально. Разместите его и отслеживайте вручную.</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-border/50 max-w-full">
              <img src={token.imageData} alt="Изображение-ловушка" className="max-h-64 max-w-full rounded-lg object-contain" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Redirect info */}
      {isRedirect && token.redirectUrl && (
        <Card className="border-primary/30 shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <ExternalLink className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">URL-редирект</h3>
              <p className="text-muted-foreground text-sm mt-1">При переходе пользователь будет перенаправлен на этот адрес.</p>
            </div>
            <div className="w-full max-w-sm">
              <div className="bg-black/30 rounded-xl border border-border/50 px-4 py-3 flex items-center justify-between gap-3">
                <code className="text-primary break-all text-sm flex-1">{token.redirectUrl}</code>
                <Button variant="ghost" size="sm" onClick={() => copy(token.redirectUrl!, "URL скопирован")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code */}
      {qrDataUrl && isQrType && (
        <Card className="border-primary/30 shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">QR-код токен</h3>
              <p className="text-muted-foreground text-sm mt-1">Распечатайте и разместите в нужном месте.</p>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block">
              <img src={qrDataUrl} alt="QR-код" className="w-[200px] h-[200px]" />
            </div>
            <Button onClick={downloadQr} className="gap-2">
              <Download className="w-4 h-4" /> Скачать QR-код
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alerts history */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 mt-8">
          <Clock className="w-5 h-5 text-primary" />
          История срабатываний
        </h2>

        {alertsList.length === 0 ? (
          <div className="rounded-2xl glass-card p-8 text-center border-dashed border border-border/50">
            <p className="text-muted-foreground font-mono text-sm">Срабатываний не зафиксировано.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertsList.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-destructive shadow-md">
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="destructive" className="font-mono text-sm px-2.5 py-1">
                      {format(parseISO(alert.triggeredAt), "HH:mm:ss")}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {format(parseISO(alert.triggeredAt), "d MMMM yyyy", { locale: ru })}
                    </span>
                  </div>
                  {alert.ipAddress && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> IP-адрес
                      </div>
                      <div className="font-mono text-sm px-3 py-1.5 rounded border inline-block bg-destructive/10 border-destructive/20 text-destructive">
                        {alert.ipAddress}
                      </div>
                    </div>
                  )}
                  {alert.notes && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Заметка</div>
                      <p className="text-sm text-foreground bg-secondary/30 px-3 py-2 rounded-lg border border-border/30">{alert.notes}</p>
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
