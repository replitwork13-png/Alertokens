import { db } from "@/lib/db";
import { tokensTable, alertsTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TokenDetailsClient } from "@/components/token-details-client";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!db) notFound();

  const [token] = await db.select().from(tokensTable).where(eq(tokensTable.id, id));
  if (!token) notFound();

  const hdrs = await headers();
  const host = hdrs.get("host") || "localhost";
  const proto = hdrs.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  const baseUrl = `${proto}://${host}`;

  const alertsList = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.tokenId, id))
    .orderBy(desc(alertsTable.triggeredAt));

  const triggerUrl = `${baseUrl}/api/trigger/${token.token}`;

  return <TokenDetailsClient token={token} alerts={alertsList} triggerUrl={triggerUrl} />;
}
