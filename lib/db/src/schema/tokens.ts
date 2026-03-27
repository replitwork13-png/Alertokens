import { pgTable, text, boolean, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tokenTypeEnum = pgEnum("token_type", [
  "web",
  "dns",
  "email",
  "pdf",
  "word",
  "qr_code",
  "image",
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
  triggered: boolean("triggered").notNull().default(false),
  triggerCount: integer("trigger_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastTriggeredAt: timestamp("last_triggered_at"),
});

export const insertTokenSchema = createInsertSchema(tokensTable).omit({
  triggered: true,
  triggerCount: true,
  createdAt: true,
  lastTriggeredAt: true,
});

export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokensTable.$inferSelect;
