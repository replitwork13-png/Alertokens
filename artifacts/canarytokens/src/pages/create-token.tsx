import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useStore, TokenType } from "@/contexts/store-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Button } from "@/components/ui-components";
import { ShieldAlert, Network, Globe, Mail, FileText, QrCode, Image as ImageIcon, Loader2, Upload, X, CreditCard, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TOKEN_TYPES: { id: TokenType; name: string; icon: React.ElementType; desc: string; color: string }[] = [
  { id: "web", name: "Веб-ловушка", icon: Network, desc: "Срабатывает при открытии URL.", color: "from-blue-500 to-cyan-500" },
  { id: "dns", name: "DNS-токен", icon: Globe, desc: "Срабатывает при DNS-запросе.", color: "from-emerald-500 to-teal-500" },
  { id: "email", name: "Email-адрес", icon: Mail, desc: "Срабатывает при отправке письма.", color: "from-amber-500 to-orange-500" },
  { id: "pdf", name: "PDF-документ", icon: FileText, desc: "Срабатывает при открытии файла.", color: "from-rose-500 to-pink-500" },
  { id: "word", name: "Word-документ", icon: FileText, desc: "Срабатывает при открытии файла.", color: "from-blue-500 to-indigo-500" },
  { id: "qr_code", name: "QR-код", icon: QrCode, desc: "Срабатывает при сканировании.", color: "from-violet-500 to-purple-500" },
  { id: "image", name: "Изображение", icon: ImageIcon, desc: "Встроите своё изображение с трекером.", color: "from-pink-500 to-fuchsia-500" },
  { id: "credit_card", name: "Кредитная карта", icon: CreditCard, desc: "Фейковая карта — ловушка для воров.", color: "from-yellow-500 to-amber-500" },
  { id: "redirect", name: "URL-редирект", icon: ExternalLink, desc: "Записывает переход и перенаправляет.", color: "from-teal-500 to-emerald-500" },
];

export default function CreateToken() {
  const [, setLocation] = useLocation();
  const { createToken } = useStore();
  const [type, setType] = useState<TokenType>("web");
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageData(result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !memo) return;
    if (type === "image" && !imageFile) return;
    if (type === "redirect" && !redirectUrl) return;
    setIsSubmitting(true);
    const token = createToken({
      type,
      name,
      memo,
      alertEmail: alertEmail || undefined,
      redirectUrl: type === "redirect" ? redirectUrl : undefined,
      imageData: imageData || undefined,
    });
    setIsSubmitting(false);
    setLocation(`/token/${token.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          Создать токен
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">Разверните новую ловушку для обнаружения несанкционированного доступа.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Type */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl glass-card overflow-hidden"
        >
          <div className="p-5 pb-3">
            <h2 className="text-base font-bold">1. Тип токена</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Выберите, в каком виде будет ловушка.</p>
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
                      "cursor-pointer rounded-xl p-3 border transition-all duration-300 relative overflow-hidden group",
                      isSelected
                        ? "border-primary/50 bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]"
                        : "border-border/40 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40 hover:scale-[1.01]"
                    )}
                  >
                    {isSelected && (
                      <div className={cn("absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br opacity-20 blur-md", t.color)} />
                    )}
                    <div className={cn(
                      "inline-flex p-1.5 rounded-lg mb-2 transition-all duration-300",
                      isSelected ? `bg-gradient-to-br ${t.color} text-white shadow-sm` : "bg-muted text-muted-foreground"
                    )}>
                      <t.icon className="w-4 h-4" />
                    </div>
                    <h3 className={cn("font-semibold text-sm mb-0.5 transition-colors", isSelected ? "text-foreground" : "text-muted-foreground")}>{t.name}</h3>
                    <p className="text-[11px] text-muted-foreground leading-snug hidden sm:block">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Image upload */}
        {type === "image" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl glass-card overflow-hidden"
          >
            <div className="p-5 pb-3">
              <h2 className="text-base font-bold">Загрузите изображение</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Изображение будет сохранено локально и показано в деталях токена.</p>
            </div>
            <div className="p-5 pt-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {imagePreview ? (
                <div className="relative rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col items-center gap-3">
                  <img src={imagePreview} alt="Превью" className="max-h-48 max-w-full rounded-lg object-contain" />
                  <p className="text-sm text-muted-foreground truncate max-w-full">{imageFile?.name}</p>
                  <button type="button" onClick={removeFile} className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/20 hover:bg-destructive/40 text-destructive transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 hover:bg-primary/5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Нажмите, чтобы выбрать файл</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP — до 5 МБ</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Redirect URL */}
        {type === "redirect" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl glass-card overflow-hidden"
          >
            <div className="p-5 pb-3">
              <h2 className="text-base font-bold">URL для перенаправления</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Пользователь попадёт сюда после перехода по ловушке.</p>
            </div>
            <div className="p-5 pt-2">
              <Input type="url" placeholder="https://www.example.com" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} required />
            </div>
          </motion.div>
        )}

        {/* Step 2: Data */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl glass-card overflow-hidden"
        >
          <div className="p-5 pb-3">
            <h2 className="text-base font-bold">2. Данные токена</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Укажите название и напоминание — чтобы потом понять, что это и где стоит.</p>
          </div>
          <div className="p-5 pt-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Название <span className="text-destructive">*</span></label>
              <Input placeholder="Например: Бекап БД на сервере" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Напоминание <span className="text-destructive">*</span></label>
              <Textarea placeholder="Где установлен этот токен? Зачем?" value={memo} onChange={(e) => setMemo(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email для уведомлений <span className="text-xs">(для заметки)</span></label>
              <Input type="email" placeholder="your@email.com" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} />
              <p className="text-xs text-muted-foreground">Сохраняется как заметка — реальные письма не отправляются в статической версии.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-3 pt-2"
        >
          <Button type="button" variant="ghost" onClick={() => setLocation("/")} className="rounded-xl">
            Отмена
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!name || !memo || isSubmitting || (type === "image" && !imageFile) || (type === "redirect" && !redirectUrl)}
            className="font-bold tracking-wide rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 border-0"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Создание...</> : "Создать токен"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
