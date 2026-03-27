import { Router, type IRouter, type Request, type Response } from "express";
import { db, tokensTable, alertsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { CreateTokenBody, ListTokensQueryParams, GetTokenParams, DeleteTokenParams } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

function buildTriggerUrl(token: string, req: Request): string {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}/api/trigger/${token}`;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const parsed = ListTokensQueryParams.safeParse(req.query);
    const page = parsed.success ? (parsed.data.page ?? 1) : 1;
    const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
    const offset = (page - 1) * limit;

    const [tokens, [{ value: total }]] = await Promise.all([
      db.select().from(tokensTable).orderBy(desc(tokensTable.createdAt)).limit(limit).offset(offset),
      db.select({ value: count() }).from(tokensTable),
    ]);

    const tokenList = tokens.map((t) => ({
      id: t.id,
      type: t.type,
      name: t.name,
      memo: t.memo,
      token: t.token,
      triggerUrl: buildTriggerUrl(t.token, req),
      alertEmail: t.alertEmail,
      triggered: t.triggered,
      triggerCount: t.triggerCount,
      createdAt: t.createdAt.toISOString(),
      lastTriggeredAt: t.lastTriggeredAt ? t.lastTriggeredAt.toISOString() : null,
    }));

    res.json({ tokens: tokenList, total: Number(total), page, limit });
  } catch (err) {
    req.log.error({ err }, "Error listing tokens");
    res.status(500).json({ error: "internal_error", message: "Failed to list tokens" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = CreateTokenBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body" });
      return;
    }

    const { type, name, memo, alertEmail } = parsed.data;
    const id = generateId();
    const token = generateToken();

    const [created] = await db
      .insert(tokensTable)
      .values({ id, type, name, memo, token, alertEmail: alertEmail ?? null })
      .returning();

    res.status(201).json({
      id: created.id,
      type: created.type,
      name: created.name,
      memo: created.memo,
      token: created.token,
      triggerUrl: buildTriggerUrl(created.token, req),
      alertEmail: created.alertEmail,
      triggered: created.triggered,
      triggerCount: created.triggerCount,
      createdAt: created.createdAt.toISOString(),
      lastTriggeredAt: null,
    });
  } catch (err) {
    req.log.error({ err }, "Error creating token");
    res.status(500).json({ error: "internal_error", message: "Failed to create token" });
  }
});

router.get("/:tokenId", async (req: Request, res: Response) => {
  try {
    const parsed = GetTokenParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid token ID" });
      return;
    }

    const token = await db.select().from(tokensTable).where(eq(tokensTable.id, parsed.data.tokenId)).limit(1);
    if (!token.length) {
      res.status(404).json({ error: "not_found", message: "Token not found" });
      return;
    }

    const t = token[0];
    res.json({
      id: t.id,
      type: t.type,
      name: t.name,
      memo: t.memo,
      token: t.token,
      triggerUrl: buildTriggerUrl(t.token, req),
      alertEmail: t.alertEmail,
      triggered: t.triggered,
      triggerCount: t.triggerCount,
      createdAt: t.createdAt.toISOString(),
      lastTriggeredAt: t.lastTriggeredAt ? t.lastTriggeredAt.toISOString() : null,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting token");
    res.status(500).json({ error: "internal_error", message: "Failed to get token" });
  }
});

router.delete("/:tokenId", async (req: Request, res: Response) => {
  try {
    const parsed = DeleteTokenParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid token ID" });
      return;
    }

    const deleted = await db.delete(tokensTable).where(eq(tokensTable.id, parsed.data.tokenId)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: "not_found", message: "Token not found" });
      return;
    }

    res.json({ success: true, message: "Token deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting token");
    res.status(500).json({ error: "internal_error", message: "Failed to delete token" });
  }
});

export default router;
