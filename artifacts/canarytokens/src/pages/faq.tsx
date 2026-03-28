import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Shield, Network, Globe, Mail, FileText, QrCode, Image as ImageIcon, CreditCard, ExternalLink, Bell, Eye, Lock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ElementType;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Общие вопросы",
    icon: Shield,
    question: "Что такое Alertokens?",
    answer: "Alertokens — это инструмент безопасности для создания токенов-ловушек (honeypots). Вы размещаете скрытые токены в файлах, документах, на серверах или в базах данных. Когда злоумышленник обращается к токену — вы мгновенно получаете уведомление с информацией об IP-адресе, геолокации и браузере.",
  },
  {
    category: "Общие вопросы",
    icon: Eye,
    question: "Как работают токены-ловушки?",
    answer: "Каждый токен — это уникальный URL. При обращении к нему (напрямую, через PDF, QR-код, изображение и т.д.) сервер регистрирует тревогу. Записывается IP-адрес, User-Agent, реферер, параметры запроса, а также геолокация (город, страна, провайдер).",
  },
  {
    category: "Общие вопросы",
    icon: Bell,
    question: "Как я узнаю о срабатывании?",
    answer: "При создании токена вы можете указать email для уведомлений. Когда токен сработает, вам придёт письмо с деталями тревоги. Также все тревоги отображаются на панели управления и на странице конкретного токена в разделе «История тревог».",
  },
  {
    category: "Общие вопросы",
    icon: Lock,
    question: "Это безопасно? Мои данные защищены?",
    answer: "Alertokens не хранит конфиденциальные данные. Токены — это просто URL-адреса, которые вы сами решаете где разместить. Данные о срабатываниях (IP, геолокация) хранятся в базе данных и доступны только вам через панель управления.",
  },
  {
    category: "Типы токенов",
    icon: Network,
    question: "Веб-ловушка — как использовать?",
    answer: "Создайте веб-токен и получите уникальный URL. Разместите его в конфигурационных файлах, README, внутренних документах или в коде. Любой HTTP-запрос к этому URL создаст тревогу. Идеально для обнаружения утечки исходного кода или документации.",
  },
  {
    category: "Типы токенов",
    icon: Globe,
    question: "DNS-токен — что это?",
    answer: "DNS-токен срабатывает при DNS-запросе к определённому домену. Это полезно для обнаружения попыток разведки вашей инфраструктуры. Разместите доменное имя токена в конфигурации серверов или внутренних записях.",
  },
  {
    category: "Типы токенов",
    icon: Mail,
    question: "Email-токен — как работает?",
    answer: "Вы получаете уникальный email-адрес ловушки. Разместите его в списках контактов, в скрытых полях форм или в корпоративной адресной книге. Если кто-то отправит письмо на этот адрес — вы узнаете об этом.",
  },
  {
    category: "Типы токенов",
    icon: FileText,
    question: "PDF-документ — как это работает?",
    answer: "При создании PDF-токена генерируется PDF-файл со встроенным трекером. Когда документ открывают в Adobe Reader (или другом PDF-просмотрщике с поддержкой внешних ссылок), трекер отправляет запрос, и вы получаете тревогу. Скачайте PDF и разместите его в нужном месте.",
  },
  {
    category: "Типы токенов",
    icon: QrCode,
    question: "QR-код — для чего?",
    answer: "QR-токен генерирует QR-код с URL ловушки. Распечатайте его и разместите в физическом пространстве — на сейфе, в серверной комнате, на конфиденциальных документах. Сканирование кода вызовет тревогу.",
  },
  {
    category: "Типы токенов",
    icon: ImageIcon,
    question: "Изображение-ловушка — как встроить?",
    answer: "Загрузите любое изображение при создании токена. Вы получите URL, который отдаёт это изображение. Используйте его как <img src=\"...\"> на сайте, в email-рассылке или в документе. Каждое отображение изображения создаст тревогу.",
  },
  {
    category: "Типы токенов",
    icon: CreditCard,
    question: "Кредитная карта-ловушка — это настоящая карта?",
    answer: "Нет, это полностью фейковые данные карты. Разместите их в базе данных, файлах или хранилище паролей. Если злоумышленник попытается использовать эту карту — транзакция будет отклонена, но вы получите уведомление о попытке.",
  },
  {
    category: "Типы токенов",
    icon: ExternalLink,
    question: "URL-редирект — зачем?",
    answer: "Этот токен перенаправляет посетителя на указанный вами URL, одновременно записывая тревогу. Замените настоящую ссылку на URL ловушки — пользователь попадёт туда, куда нужно, а вы получите данные о визите. Идеально для отслеживания распространения ссылок.",
  },
];

const CATEGORIES = [...new Set(FAQ_ITEMS.map(item => item.category))];

function FaqAccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={cn(
      "rounded-2xl glass-card overflow-hidden transition-all duration-300",
      isOpen ? "shadow-lg shadow-primary/5" : "hover:shadow-md"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left group"
      >
        <div className={cn(
          "p-2 rounded-xl transition-all duration-300 shrink-0",
          isOpen
            ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md shadow-purple-500/20"
            : "bg-secondary/50 text-muted-foreground group-hover:bg-secondary"
        )}>
          <item.icon className="w-4 h-4" />
        </div>
        <span className={cn(
          "font-semibold text-sm md:text-base flex-1 transition-colors duration-300",
          isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {item.question}
        </span>
        <ChevronDown className={cn(
          "w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0",
          isOpen && "rotate-180 text-primary"
        )} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-4 md:pb-5 pl-14 md:pl-16">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  let globalIndex = 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          Частые вопросы
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Всё, что нужно знать о работе с Alertokens — от создания токенов до получения уведомлений.
        </p>
      </motion.div>

      {CATEGORIES.map((category) => {
        const categoryItems = FAQ_ITEMS.filter(item => item.category === category);
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: category === CATEGORIES[0] ? 0.1 : 0.2 }}
          >
            <h2 className="text-lg font-bold tracking-tight mb-4 text-foreground">{category}</h2>
            <div className="space-y-3">
              {categoryItems.map((item) => {
                const idx = globalIndex++;
                return (
                  <FaqAccordionItem
                    key={idx}
                    item={item}
                    isOpen={openItems.has(idx)}
                    onToggle={() => toggleItem(idx)}
                  />
                );
              })}
            </div>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl glass-card p-6 md:p-8 text-center space-y-4"
      >
        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
          <Send className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold">Не нашли ответ?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Свяжитесь с нашей техподдержкой — мы поможем разобраться с любым вопросом.
        </p>
        <a
          href="mailto:info@premiumwebsite.ru"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
        >
          <Mail className="w-4 h-4" />
          info@premiumwebsite.ru
        </a>
      </motion.div>
    </div>
  );
}
