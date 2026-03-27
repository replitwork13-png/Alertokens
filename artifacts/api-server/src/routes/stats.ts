import { Router, type IRouter, type Request, type Response } from "express";
import { db, tokensTable, alertsTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const [totalTokensResult, triggeredTokensResult, totalAlertsResult, recentAlerts] = await Promise.all([
      db.select({ value: count() }).from(tokensTable),
      db.select({ value: count() }).from(tokensTable).where(eq(tokensTable.triggered, true)),
      db.select({ value: count() }).from(alertsTable),
      db.select().from(alertsTable).orderBy(desc(alertsTable.triggeredAt)).limit(10),
    ]);

    res.json({
      totalTokens: Number(totalTokensResult[0].value),
      triggeredTokens: Number(triggeredTokensResult[0].value),
      totalAlerts: Number(totalAlertsResult[0].value),
      recentAlerts: recentAlerts.map((a) => ({
        id: a.id,
        tokenId: a.tokenId,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        referer: a.referer,
        geo: a.geo,
        triggeredAt: a.triggeredAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting stats");
    res.status(500).json({ error: "internal_error", message: "Failed to get stats" });
  }
});

export default router;
