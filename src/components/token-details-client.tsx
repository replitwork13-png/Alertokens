"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck, ShieldAlert, Copy, Trash2, ArrowLeft, Clock, Monitor,
  Network, QrCode, Download, ImageIcon, CreditCard, Lock, Calendar,
  User, ExternalLink, PlusCircle, FileText, AlertTriangle, Activity, CalendarClock,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn, TOKEN_TYPE_LABELS } from "@/lib/utils";
import type { Token, Alert, CardData } from "@/lib/schema";
import QRCode from "qrcode";

interface Props {
  token: Token;
  alerts: Alert[];
  triggerUrl: string;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-all text-[hsl(215,15%,55%)] flex items-center gap-1.5 text-xs">
      <Copy className="w-4 h-4" />{label && <span>{copied ? "✓" : label}</span>}
    </button>
  );
}

export function TokenDetailsClient({ token, alerts: initialAlerts, triggerUrl }: Props) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [triggerNotes, setTriggerNotes] = useState("");
  const [triggerIp, setTriggerIp] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const cardData = token.cardData as CardData | null;

  useEffect(() => {
    if (token.type === "qr_code") {
      QRCode.toDataURL(triggerUrl, { width: 300, margin: 2, errorCorrectionLevel: "M" })
        .then(setQrDataUrl).catch(() => {});
    }
  }, [triggerUrl, token.type]);

  const handleDelete = async () => {
    await fetch(`/api/tokens/${token.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const handleRecordTrigger = async () => {
    setIsRecording(true);
    const res = await fetch(`/api/tokens/${token.id}/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: triggerNotes, ipAddress: triggerIp }),
    });
    if (res.ok) {
      const alert = await res.json();
      setAlerts([alert, ...alerts]);
    }
    setTriggerNotes(""); setTriggerIp("");
    setShowTriggerForm(false); setIsRecording(false);
    router.refresh();
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `alertoken-qr-${token.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-[hsl(215,15%,55%)] hover:text-white flex items-center gap-2 transition-all text-sm hover:-translate-x-0.5">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>
        <div className="flex items-center gap-2">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-4 h-4" /> Удалить
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-xl border border-red-500/20">
              <span className="text-sm text-red-400 px-2 font-medium">Уверены?</span>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/[0.05] transition-all">Отмена</button>
              <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white transition-all">Удалить</button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden relative border-t-2 border-t-purple-500/50 shadow-xl">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className={`p-4 rounded-xl ${token.triggered ? "bg-rose-500/20 text-rose-400" : "bg-purple-500/20 text-purple-400"}`}>
              {token.triggered ? <ShieldAlert className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{token.name}</h1>
                <span className={cn("px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold", token.triggered ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30")}>
                  {token.triggered ? "СКОМПРОМЕТИРОВАН" : "ЗАЩИЩЁН"}
                </span>
              </div>
              <p className="text-[hsl(215,15%,55%)] text-base">{token.memo}</p>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/[0.06] text-sm font-mono text-[hsl(215,15%,55%)]">
                <div>Тип: <span className="text-white">{TOKEN_TYPE_LABELS[token.type] ?? token.type}</span></div>
                <div>Создан: <span className="text-white">{format(new Date(token.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}</span></div>
                <div>Срабатываний: <span className={token.triggerCount > 0 ? "text-rose-400 font-bold" : "text-purple-400"}>{token.triggerCount}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="p-5 pb-3 flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold">URL токена-ловушки</h2>
        </div>
        <div className="p-5 pt-2 space-y-3">
          <div className="bg-black/30 p-4 rounded-xl border border-white/[0.06] flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <code className="text-purple-400 break-all text-sm flex-1">{triggerUrl}</code>
            <CopyButton text={triggerUrl} label="Копировать" />
          </div>
          <p className="text-xs text-[hsl(215,15%,45%)]">
            Разместите этот URL в файле, документе или встройте как изображение (тег img) — при каждом обращении вы получите уведомление с IP-адресом и данными устройства.
          </p>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
            <strong>Совет:</strong> Для встройки в HTML: <code className="text-purple-200 bg-black/20 px-1 rounded">&lt;img src="{triggerUrl}" width="1" height="1" /&gt;</code>
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden border border-amber-500/20">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-base">Зафиксировать срабатывание вручную</h3>
              <p className="text-sm text-[hsl(215,15%,55%)] mt-0.5">Обнаружили подозрительную активность? Запишите событие вручную.</p>
            </div>
          </div>
          {showTriggerForm ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[hsl(215,15%,55%)] mb-1 block">IP-адрес (необязательно)</label>
                <input type="text" placeholder="192.168.1.1" value={triggerIp} onChange={(e) => setTriggerIp(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-[hsl(215,15%,55%)] mb-1 block">Заметка</label>
                <textarea placeholder="Что произошло?" value={triggerNotes} onChange={(e) => setTriggerNotes(e.target.value)} className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm placeholder:text-[hsl(215,15%,40%)] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleRecordTrigger} disabled={isRecording} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50">
                  <AlertTriangle className="w-4 h-4" /> Записать
                </button>
                <button onClick={() => setShowTriggerForm(false)} className="px-4 py-2 rounded-xl text-sm hover:bg-white/[0.05] transition-all">Отмена</button>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setShowTriggerForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all">
              <PlusCircle className="w-4 h-4" /> Записать срабатывание
            </button>
          )}
        </div>
      </div>

      {token.type === "credit_card" && cardData && (
        <div className="rounded-2xl glass-card overflow-hidden border border-purple-500/20 shadow-lg">
          <div className="p-5 pb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">Кредитная карта-ловушка</h2>
          </div>
          <div className="p-5 pt-2 flex flex-col items-center gap-5">
            <div className="w-full max-w-sm rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0a3d 0%, #7c3aed 50%, #6d28d9 100%)" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }} />
              <div className="relative z-10 text-left space-y-4">
                <div className="flex justify-between"><div className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Alertoken</div><div className="text-white font-bold text-lg">{cardData.cardBrand}</div></div>
                <div><div className="text-white/70 text-[10px] mb-1">Владелец</div><div className="text-white font-mono text-sm">{cardData.cardName}</div></div>
                <div className="text-white font-mono text-xl tracking-[0.15em]">{cardData.cardNumber}</div>
                <div className="flex justify-between"><div><div className="text-white/70 text-[10px]">Действует до</div><div className="text-white font-mono text-sm">{cardData.cardExpiry}</div></div><div><div className="text-white/70 text-[10px]">Код</div><div className="text-white font-mono text-sm">{cardData.cardCvv}</div></div></div>
              </div>
            </div>
            <div className="w-full max-w-sm space-y-2.5">
              {[
                { icon: User, label: "Имя на карте", value: cardData.cardName },
                { icon: CreditCard, label: "Номер карты", value: cardData.cardNumber },
                { icon: Calendar, label: "Срок действия", value: cardData.cardExpiry },
                { icon: Lock, label: "CVV", value: cardData.cardCvv },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <row.icon className="w-4 h-4 text-[hsl(215,15%,55%)]" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[hsl(215,15%,55%)]">{row.label}</div>
                      <div className="font-mono text-sm">{row.value}</div>
                    </div>
                  </div>
                  <CopyButton text={row.value} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {token.type === "qr_code" && qrDataUrl && (
        <div className="rounded-2xl glass-card overflow-hidden border border-purple-500/20 shadow-lg">
          <div className="p-5 pb-3 flex items-center gap-2"><QrCode className="w-5 h-5 text-purple-400" /><h2 className="text-lg font-bold">QR-код токена</h2></div>
          <div className="p-5 pt-2 flex flex-col items-center gap-4">
            <p className="text-sm text-[hsl(215,15%,55%)]">Распечатайте и разместите в нужном месте. При сканировании — зафиксируется срабатывание.</p>
            <div className="bg-white p-4 rounded-xl inline-block"><img src={qrDataUrl} alt="QR-код" className="w-[200px] h-[200px]" /></div>
            <button onClick={downloadQr} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all">
              <Download className="w-4 h-4" /> Скачать QR-код
            </button>
          </div>
        </div>
      )}

      {token.type === "redirect" && token.redirectUrl && (
        <div className="rounded-2xl glass-card overflow-hidden border border-purple-500/20 shadow-lg">
          <div className="p-5 pb-3 flex items-center gap-2"><ExternalLink className="w-5 h-5 text-purple-400" /><h2 className="text-lg font-bold">URL-редирект</h2></div>
          <div className="p-5 pt-2">
            <div className="bg-black/30 rounded-xl border border-white/[0.06] px-4 py-3 flex items-center justify-between gap-3">
              <code className="text-purple-400 break-all text-sm flex-1">{token.redirectUrl}</code>
              <CopyButton text={token.redirectUrl} />
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2 mt-8">
          <Clock className="w-5 h-5 text-purple-400" />
          История срабатываний
          <span className="text-sm font-normal text-[hsl(215,15%,55%)]">({alerts.length})</span>
        </h2>
        {alerts.length === 0 ? (
          <div className="rounded-2xl glass-card p-8 text-center border border-dashed border-white/[0.06]">
            <p className="text-[hsl(215,15%,55%)] font-mono text-sm">Срабатываний не зафиксировано.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl glass-card p-4 sm:p-5 border-l-4 border-l-rose-500 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">{format(new Date(alert.triggeredAt), "HH:mm:ss")}</span>
                  <span className="text-sm text-[hsl(215,15%,55%)] flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{format(new Date(alert.triggeredAt), "d MMMM yyyy", { locale: ru })}</span>
                </div>
                {alert.ipAddress && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[hsl(215,15%,55%)] mb-1 flex items-center gap-1"><Monitor className="w-3 h-3" /> IP-адрес</div>
                    <div className="font-mono text-sm px-3 py-1.5 rounded border inline-block bg-rose-500/10 border-rose-500/20 text-rose-400">{alert.ipAddress}</div>
                  </div>
                )}
                {alert.userAgent && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[hsl(215,15%,55%)] mb-1">User Agent</div>
                    <p className="text-xs text-[hsl(215,15%,55%)] font-mono bg-white/[0.03] px-3 py-2 rounded-lg border border-white/[0.06]">{alert.userAgent}</p>
                  </div>
                )}
                {alert.referer && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[hsl(215,15%,55%)] mb-1">Откуда</div>
                    <p className="text-sm text-[hsl(215,15%,55%)]">{alert.referer}</p>
                  </div>
                )}
                {alert.notes && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[hsl(215,15%,55%)] mb-1">Заметка</div>
                    <p className="text-sm bg-white/[0.03] px-3 py-2 rounded-lg border border-white/[0.06]">{alert.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
