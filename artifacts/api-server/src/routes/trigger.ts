import { Router, type IRouter, type Request, type Response } from "express";
import { db, tokensTable, alertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendTokenAlertEmail } from "../lib/email";

const router: IRouter = Router();

const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

router.get("/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  const referer = (req.query.ref as string) || req.headers.referer || null;
  const userAgent = req.headers["user-agent"] || null;
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    null;

  const triggeredAt = new Date();

  try {
    const found = await db.select().from(tokensTable).where(eq(tokensTable.token, token)).limit(1);

    if (found.length) {
      const t = found[0];
      const alertId = crypto.randomUUID();

      await Promise.all([
        db.insert(alertsTable).values({
          id: alertId,
          tokenId: t.id,
          ipAddress,
          userAgent,
          referer,
          geo: null,
        }),
        db.update(tokensTable)
          .set({
            triggered: true,
            triggerCount: t.triggerCount + 1,
            lastTriggeredAt: triggeredAt,
          })
          .where(eq(tokensTable.id, t.id)),
      ]);

      if (t.alertEmail) {
        sendTokenAlertEmail({
          toEmail: t.alertEmail,
          tokenName: t.name,
          tokenType: t.type,
          ipAddress,
          userAgent,
          referer: referer as string | null,
          triggeredAt,
        }).catch((err) => {
          req.log.error({ err }, "Failed to send alert email");
        });
      }
    }
  } catch (err) {
    req.log.error({ err }, "Error recording token trigger");
  }

  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.send(PIXEL_PNG);
});

export default router;
