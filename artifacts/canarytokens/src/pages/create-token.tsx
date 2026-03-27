import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateToken } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Button } from "@/components/ui-components";
import { ShieldAlert, Network, Globe, Mail, FileText, QrCode, Image as ImageIcon, Loader2 } from "lucide-react";
import { TokenType } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const TOKEN_TYPES = [
  { id: TokenType.web, name: "Веб-ловушка", icon: Network, desc: "Срабатывает при открытии URL." },
  { id: TokenType.dns, name: "DNS-токен", icon: Globe, desc: "Срабатывает при DNS-запросе." },
  { id: TokenType.email, name: "Email-адрес", icon: Mail, desc: "Срабатывает при отправке письма." },
  { id: TokenType.pdf, name: "PDF-документ", icon: FileText, desc: "Срабатывает при открытии файла." },
  { id: TokenType.word, name: "Word-документ", icon: FileText, desc: "Срабатывает при открытии файла." },
  { id: TokenType.qr_code, name: "QR-код", icon: QrCode, desc: "Срабатывает при сканировании." },
  { id: TokenType.image, name: "Изображение", icon: ImageIcon, desc: "Пиксель 1×1 — невидимая ловушка." },
];

export default function CreateToken() {
  const [, setLocation] = useLocation();
  const [type, setType] = useState<TokenType>(TokenType.web);
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [alertEmail, setAlertEmail] = useState("");

  const createMutation = useCreateToken({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/token/${data.id}`);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !memo) return;
    createMutation.mutate({
      data: { type, name, memo, alertEmail: alertEmail || undefined }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-primary" />
          Создать токен
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Разверните новую ловушку для обнаружения несанкционированного доступа.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle>1. Тип токена</CardTitle>
            <CardDescription>Выберите, в каком виде будет ловушка.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TOKEN_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setType(t.id as TokenType)}
                    className={cn(
                      "cursor-pointer rounded-xl p-3 border-2 transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(34,197,94,0.12)]"
                        : "border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary"
                    )}
                  >
                    <t.icon className={cn("w-5 h-5 mb-2", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <h3 className={cn("font-semibold text-sm mb-0.5", isSelected ? "text-foreground" : "text-muted-foreground")}>{t.name}</h3>
                    <p className="text-[11px] text-muted-foreground leading-snug hidden sm:block">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>2. Данные токена</CardTitle>
            <CardDescription>Укажите название и напоминание — чтобы потом понять, что это и где стоит.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Название <span className="text-destructive">*</span></label>
              <Input
                placeholder="Например: Бекап БД на сервере"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Напоминание <span className="text-destructive">*</span></label>
              <Textarea
                placeholder="Где установлен этот токен? Зачем?"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email для уведомлений <span className="text-xs">(необязательно)</span></label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Письмо придёт мгновенно когда токен сработает.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setLocation("/")}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!name || !memo || createMutation.isPending}
            className="font-bold tracking-wide"
          >
            {createMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Создание…</>
            ) : (
              "Создать токен"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
