import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { alertsTable, tokensTable } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alerts = await db
      .select()
      .from(alertsTable)
      .where(eq(alertsTable.tokenId, id))
      .orderBy(desc(alertsTable.triggeredAt));
    return NextResponse.json(alerts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { notes, ipAddress } = body;

    const [alert] = await db.insert(alertsTable).values({
      id: nanoid(),
      tokenId: id,
      notes: notes || null,
      ipAddress: ipAddress || null,
    }).returning();

    await db.update(tokensTable)
      .set({
        triggered: true,
        triggerCount: sql`${tokensTable.triggerCount} + 1`,
        lastTriggeredAt: new Date(),
      })
      .where(eq(tokensTable.id, id));

    return NextResponse.json(alert, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to record alert" }, { status: 500 });
  }
}
