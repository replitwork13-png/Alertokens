import { pgTable, text, boolean, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const tokenTypeEnum = pgEnum("token_type", [
  "web",
  "dns",
  "email",
  "pdf",
  "word",
  "qr_code",
  "image",
  "credit_card",
  "redirect",
]);

export const tokensTable = pgTable("tokens", {
  id: text("id").primaryKey(),
  type: tokenTypeEnum("type").notNull(),
  name: text("name").notNull(),
  memo: text("memo").notNull().default(""),
  token: text("token").notNull().unique(),
  alertEmail: text("alert_email"),
  imagePath: text("image_path"),
  imageMime: text("image_mime"),
  cardData: jsonb("card_data"),
  redirectUrl: text("redirect_url"),
  triggered: boolean("triggered").notNull().default(false),
  triggerCount: integer("trigger_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastTriggeredAt: timestamp("last_triggered_at"),
});

export const alertsTable = pgTable("alerts", {
  id: text("id").primaryKey(),
  tokenId: text("token_id")
    .notNull()
    .references(() => tokensTable.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  geo: text("geo"),
  geoData: jsonb("geo_data"),
  queryParams: text("query_params"),
  notes: text("notes"),
  triggeredAt: timestamp("triggered_at").notNull().defaultNow(),
});

export type Token = typeof tokensTable.$inferSelect;
export type Alert = typeof alertsTable.$inferSelect;
export type TokenType = Token["type"];

export interface CardData {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardBrand: string;
}
