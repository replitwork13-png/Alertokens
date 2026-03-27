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

interface GeoData {
  status: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  query?: string;
}

async function fetchGeoData(ip: string): Promise<GeoData | null> {
  try {
    const fields = "status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,query";
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`);
    if (!res.ok) return null;
    const data = (await res.json()) as GeoData;
    if (data.status !== "success") return null;
    return data;
  } catch {
    return null;
  }
}

router.get("/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  const referer = (req.query.ref as string) || req.headers.referer || null;
  const userAgent = req.headers["user-agent"] || null;
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    null;

  // Capture any query params passed to the token URL
  const queryParamsObj = { ...req.query };
  delete queryParamsObj.ref;
  const queryParams = Object.keys(queryParamsObj).length > 0
    ? JSON.stringify(queryParamsObj)
    : null;

  const triggeredAt = new Date();

  // Send pixel immediately — don't block on DB or geo lookup
  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.send(PIXEL_PNG);

  // Process in background (after response sent)
  try {
    const found = await db.select().from(tokensTable).where(eq(tokensTable.token, token)).limit(1);

    if (!found.length) return;

    const t = found[0];
    const alertId = crypto.randomUUID();

    // Insert alert immediately with what we have
    await Promise.all([
      db.insert(alertsTable).values({
        id: alertId,
        tokenId: t.id,
        ipAddress,
        userAgent,
        referer,
        geo: null,
        geoData: null,
        queryParams,
      }),
      db.update(tokensTable)
        .set({
          triggered: true,
          triggerCount: t.triggerCount + 1,
          lastTriggeredAt: triggeredAt,
        })
        .where(eq(tokensTable.id, t.id)),
    ]);

    // Fetch geo data asynchronously and update the alert
    if (ipAddress && ipAddress !== "::1" && ipAddress !== "127.0.0.1") {
      const geoData = await fetchGeoData(ipAddress);
      if (geoData) {
        const geoText = [geoData.city, geoData.regionName, geoData.country]
          .filter(Boolean)
          .join(", ");

        await db.update(alertsTable)
          .set({ geoData, geo: geoText || null })
          .where(eq(alertsTable.id, alertId));
      }
    }

    // Send email notification
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
        console.error("Failed to send alert email", err);
      });
    }
  } catch (err) {
    console.error("Error recording token trigger", err);
  }
});

export default router;
