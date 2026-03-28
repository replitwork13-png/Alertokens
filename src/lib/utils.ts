import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CardData } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateCardData(): CardData {
  const brands = ["VISA", "Mastercard", "Amex"] as const;
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const prefixes = { VISA: "4", Mastercard: "5", Amex: "3" };
  const prefix = prefixes[brand];
  const numDigits = brand === "Amex" ? 15 : 16;
  let num = prefix;
  for (let i = 1; i < numDigits; i++) num += Math.floor(Math.random() * 10);
  const formatted =
    brand === "Amex"
      ? `${num.slice(0, 4)} ${num.slice(4, 10)} ${num.slice(10)}`
      : `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12)}`;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const year = String(new Date().getFullYear() + 2 + Math.floor(Math.random() * 3)).slice(-2);
  const cvv = String(Math.floor(Math.random() * (brand === "Amex" ? 9000 : 900)) + (brand === "Amex" ? 1000 : 100));
  const firstNames = ["Ivan", "Anna", "Dmitry", "Maria", "Alex"];
  const lastNames = ["PETROV", "SMIRNOV", "IVANOV", "KOZLOV", "SOKOLOV"];
  const cardName = `${firstNames[Math.floor(Math.random() * firstNames.length)].toUpperCase()} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  return { cardName, cardNumber: formatted, cardExpiry: `${month}/${year}`, cardCvv: cvv, cardBrand: brand };
}

export const TOKEN_TYPE_LABELS: Record<string, string> = {
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
