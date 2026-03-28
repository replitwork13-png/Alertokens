"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Shield, Zap, Mail } from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "Общие вопросы",
    icon: Shield,
    questions: [
      { q: "Что такое Alertokens?", a: "Alertokens — система токенов-ловушек (canary tokens) для обнаружения несанкционированного доступа. Вы размещаете специальный URL в документе, файле или на странице, и получаете уведомление, когда кто-то его открывает." },
      { q: "Как работает обнаружение?", a: "Каждый токен имеет уникальный URL вида /api/trigger/TOKEN. Когда кто-то обращается к этому URL (открывает файл, переходит по ссылке, сканирует QR), сервер фиксирует запрос: IP-адрес, браузер, время. Вы получаете email-уведомление мгновенно." },
      { q: "Безопасны ли мои данные?", a: "Все данные хранятся в вашей собственной базе данных PostgreSQL. Никакие данные не передаются третьим лицам. Токены не содержат личной информации." },
      { q: "Сколько токенов можно создать?", a: "Количество токенов не ограничено. Создавайте столько, сколько нужно для ваших задач." },
    ],
  },
  {
    category: "Типы токенов",
    icon: Zap,
    questions: [
      { q: "Веб-ловушка — как использовать?", a: "Разместите URL токена как ссылку или встройте в HTML через тег <img>. При каждом открытии страницы или загрузке изображения вы получите уведомление." },
      { q: "Что такое QR-код токен?", a: "Распечатайте QR-код и разместите его физически. При сканировании смартфоном вы получите уведомление с информацией об устройстве." },
      { q: "Как работает токен кредитной карты?", a: "Генерируются реалистичные данные фейковой карты. Разместите их в системе (например, как сохранённый платёжный метод). Если злоумышленник попытается использовать карту, вы это зафиксируете." },
      { q: "Что такое URL-редирект?", a: "Пользователь переходит по URL токена и автоматически перенаправляется на указанный вами адрес. При этом фиксируется вся информация о переходе." },
      { q: "Как встроить токен в документ?", a: "Для Word/PDF: используйте URL токена как ссылку на изображение внутри документа. При открытии файла документ автоматически загрузит изображение, что зафиксирует срабатывание." },
    ],
  },
  {
    category: "Уведомления",
    icon: Mail,
    questions: [
      { q: "Как настроить email-уведомления?", a: "При создании токена укажите ваш email в поле «Email для уведомлений». При каждом срабатывании вы получите письмо с деталями: IP, браузер, время." },
      { q: "Что если уведомление не пришло?", a: "Проверьте папку «Спам». Также убедитесь, что email указан правильно при создании токена. Срабатывание всегда фиксируется в базе данных — проверьте историю в деталях токена." },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Часто задаваемые вопросы</h1>
        </div>
        <p className="text-[hsl(215,15%,55%)] text-sm mt-2">Всё, что нужно знать для эффективного использования системы токенов-ловушек.</p>
      </motion.div>

      {FAQ_ITEMS.map((section, si) => (
        <motion.div
          key={section.category}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: si * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <section.icon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold">{section.category}</h2>
          </div>
          <div className="space-y-2">
            {section.questions.map((item, qi) => {
              const key = `${si}-${qi}`;
              const isOpen = !!openItems[key];
              return (
                <div key={key} className="rounded-xl glass-card overflow-hidden border border-white/[0.06] hover:border-purple-500/20 transition-colors duration-300">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between p-4 text-left gap-4 group"
                  >
                    <span className="font-semibold text-sm group-hover:text-purple-400 transition-colors">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-[hsl(215,15%,55%)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-sm text-[hsl(215,15%,55%)] leading-relaxed border-t border-white/[0.04] pt-3">{item.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      <div className="rounded-2xl glass-card p-6 text-center border border-purple-500/20 shadow-lg">
        <div className="inline-flex p-3 rounded-full bg-purple-500/20 text-purple-400 mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-2">Остались вопросы?</h3>
        <p className="text-[hsl(215,15%,55%)] text-sm mb-4">Свяжитесь с нами по email — ответим в течение 24 часов.</p>
        <a href="mailto:info@premiumwebsite.ru" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all">
          info@premiumwebsite.ru
        </a>
      </div>
    </div>
  );
}
