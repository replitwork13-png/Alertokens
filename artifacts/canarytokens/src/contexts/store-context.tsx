import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type TokenType =
  | "web"
  | "dns"
  | "email"
  | "pdf"
  | "word"
  | "qr_code"
  | "image"
  | "credit_card"
  | "redirect";

export interface CardData {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardBrand: string;
}

export interface Token {
  id: string;
  type: TokenType;
  name: string;
  memo: string;
  alertEmail?: string;
  token: string;
  triggerUrl: string;
  triggered: boolean;
  triggerCount: number;
  createdAt: string;
  lastTriggeredAt?: string;
  redirectUrl?: string;
  cardData?: CardData;
  imageData?: string;
}

export interface Alert {
  id: string;
  tokenId: string;
  triggeredAt: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

interface StoreContextValue {
  tokens: Token[];
  alerts: Alert[];
  createToken: (data: {
    type: TokenType;
    name: string;
    memo: string;
    alertEmail?: string;
    redirectUrl?: string;
    imageData?: string;
  }) => Token;
  deleteToken: (id: string) => void;
  recordTrigger: (tokenId: string, data?: { ipAddress?: string; userAgent?: string; notes?: string }) => void;
  getToken: (id: string) => Token | undefined;
  getAlerts: (tokenId: string) => Alert[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

const TOKENS_KEY = "alertokens_tokens";
const ALERTS_KEY = "alertokens_alerts";

function generateCardData(): CardData {
  const brands = ["VISA", "Mastercard", "Amex"];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const prefixes: Record<string, string> = { VISA: "4", Mastercard: "5", Amex: "3" };
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

function generateToken(type: TokenType, id: string): { token: string; triggerUrl: string } {
  const tokenId = `${type.slice(0, 3)}-${id.slice(0, 8)}`;
  const triggerUrl = `${window.location.href.split("#")[0]}#/token/${id}`;
  return { token: tokenId, triggerUrl };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<Token[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(TOKENS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ALERTS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const createToken = useCallback((data: {
    type: TokenType;
    name: string;
    memo: string;
    alertEmail?: string;
    redirectUrl?: string;
    imageData?: string;
  }): Token => {
    const id = globalThis.crypto.randomUUID();
    const { token, triggerUrl } = generateToken(data.type, id);
    const cardData = data.type === "credit_card" ? generateCardData() : undefined;
    const newToken: Token = {
      id,
      type: data.type,
      name: data.name,
      memo: data.memo,
      alertEmail: data.alertEmail,
      token,
      triggerUrl,
      triggered: false,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
      redirectUrl: data.redirectUrl,
      cardData,
      imageData: data.imageData,
    };
    setTokens(prev => [newToken, ...prev]);
    return newToken;
  }, []);

  const deleteToken = useCallback((id: string) => {
    setTokens(prev => prev.filter(t => t.id !== id));
    setAlerts(prev => prev.filter(a => a.tokenId !== id));
  }, []);

  const recordTrigger = useCallback((tokenId: string, data?: {
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
  }) => {
    const now = new Date().toISOString();
    const alert: Alert = {
      id: globalThis.crypto.randomUUID(),
      tokenId,
      triggeredAt: now,
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
      notes: data?.notes,
    };
    setAlerts(prev => [alert, ...prev]);
    setTokens(prev => prev.map(t =>
      t.id === tokenId
        ? { ...t, triggered: true, triggerCount: t.triggerCount + 1, lastTriggeredAt: now }
        : t
    ));
  }, []);

  const getToken = useCallback((id: string) => tokens.find(t => t.id === id), [tokens]);
  const getAlerts = useCallback((tokenId: string) => alerts.filter(a => a.tokenId === tokenId), [alerts]);

  return (
    <StoreContext.Provider value={{ tokens, alerts, createToken, deleteToken, recordTrigger, getToken, getAlerts }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
