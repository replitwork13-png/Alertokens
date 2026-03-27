import { Router, type IRouter, type Request, type Response } from "express";
import { db, alertsTable, tokensTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { ListTokenAlertsParams, ListTokenAlertsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router({ mergeParams: true });

router.get("/", async (req: Request, res: Response) => {
  try {
    const paramsParsed = ListTokenAlertsParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid token ID" });
      return;
    }

    const queryParsed = ListTokenAlertsQueryParams.safeParse(req.query);
    const page = queryParsed.success ? (queryParsed.data.page ?? 1) : 1;
    const limit = queryParsed.success ? (queryParsed.data.limit ?? 50) : 50;
    const offset = (page - 1) * limit;

    const tokenId = paramsParsed.data.tokenId;

    const [alerts, [{ value: total }]] = await Promise.all([
      db.select().from(alertsTable)
        .where(eq(alertsTable.tokenId, tokenId))
        .orderBy(desc(alertsTable.triggeredAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(alertsTable).where(eq(alertsTable.tokenId, tokenId)),
    ]);

    const alertList = alerts.map((a) => ({
      id: a.id,
      tokenId: a.tokenId,
      ipAddress: a.ipAddress,
      userAgent: a.userAgent,
      referer: a.referer,
      geo: a.geo,
      geoData: a.geoData ?? null,
      queryParams: a.queryParams ?? null,
      triggeredAt: a.triggeredAt.toISOString(),
    }));

    res.json({ alerts: alertList, total: Number(total), page, limit });
  } catch (err) {
    req.log.error({ err }, "Error listing alerts");
    res.status(500).json({ error: "internal_error", message: "Failed to list alerts" });
  }
});

export default router;
