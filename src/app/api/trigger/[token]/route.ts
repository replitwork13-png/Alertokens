import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tokensTable, alertsTable } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendAlertEmail } from "@/lib/email";
import { TOKEN_TYPE_LABELS } from "@/lib/utils";

const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const [found] = await db.select().from(tokensTable).where(eq(tokensTable.token, token));

    if (!found) {
      return new NextResponse(PIXEL_PNG, {
        headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;
    const referer = req.headers.get("referer") || undefined;
    const queryParams = req.nextUrl.searchParams.toString() || undefined;

    await db.insert(alertsTable).values({
      id: nanoid(),
      tokenId: found.id,
      ipAddress: ip,
      userAgent,
      referer,
      queryParams,
    });

    await db.update(tokensTable)
      .set({
        triggered: true,
        triggerCount: sql`${tokensTable.triggerCount} + 1`,
        lastTriggeredAt: new Date(),
      })
      .where(eq(tokensTable.id, found.id));

    if (found.alertEmail) {
      await sendAlertEmail({
        to: found.alertEmail,
        tokenName: found.name,
        tokenType: TOKEN_TYPE_LABELS[found.type] ?? found.type,
        ipAddress: ip,
        userAgent,
        referer,
        triggeredAt: new Date(),
      });
    }

    if (found.type === "redirect" && found.redirectUrl) {
      return NextResponse.redirect(found.redirectUrl, 302);
    }

    return new NextResponse(PIXEL_PNG, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (e) {
    console.error("Trigger error:", e);
    return new NextResponse(PIXEL_PNG, {
      headers: { "Content-Type": "image/png" },
    });
  }
}
