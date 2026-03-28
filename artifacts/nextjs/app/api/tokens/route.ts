import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tokensTable } from "@/lib/schema";
import { generateCardData } from "@/lib/utils";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const tokens = await db.select().from(tokensTable).orderBy(desc(tokensTable.createdAt));
    return NextResponse.json(tokens);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, memo, alertEmail, redirectUrl } = body;

    if (!type || !name || !memo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = nanoid();
    const token = `${type.slice(0, 3)}-${nanoid(8)}`;
    const cardData = type === "credit_card" ? generateCardData() : null;

    const [created] = await db.insert(tokensTable).values({
      id,
      type,
      name,
      memo,
      alertEmail: alertEmail || null,
      token,
      redirectUrl: redirectUrl || null,
      cardData,
      triggered: false,
      triggerCount: 0,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
