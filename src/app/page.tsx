import { db } from "@/lib/db";
import { tokensTable, alertsTable } from "@/lib/schema";
import { desc, count } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    if (!db) throw new Error("Database not configured");

    const [tokens, [{ value: totalAlerts }]] = await Promise.all([
      db.select().from(tokensTable).orderBy(desc(tokensTable.createdAt)),
      db.select({ value: count() }).from(alertsTable),
    ]);

    const triggeredCount = tokens.filter((t) => t.triggered).length;

    return (
      <DashboardClient
        tokens={tokens}
        totalAlerts={Number(totalAlerts)}
        triggeredCount={triggeredCount}
      />
    );
  } catch (e) {
    console.error("Dashboard error:", e);
    return (
      <DashboardClient
        tokens={[]}
        totalAlerts={0}
        triggeredCount={0}
      />
    );
  }
}
