import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tokensTable } from "./tokens";

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
  triggeredAt: timestamp("triggered_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({
  triggeredAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
