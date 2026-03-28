import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tokensTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [token] = await db.select().from(tokensTable).where(eq(tokensTable.id, id));
    if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(token);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(tokensTable).where(eq(tokensTable.id, id));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete token" }, { status: 500 });
  }
}
