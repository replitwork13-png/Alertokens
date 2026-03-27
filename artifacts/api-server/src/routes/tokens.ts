import { Router, type IRouter, type Request, type Response } from "express";
import { db, tokensTable, alertsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { CreateTokenBody, ListTokensQueryParams, GetTokenParams, DeleteTokenParams } from "@workspace/api-zod";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.resolve(import.meta.dirname, "../../uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".png";
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router: IRouter = Router();

function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

function buildTriggerUrl(token: string, req: Request): string {
  // Use REPLIT_DOMAINS env var if available (most reliable in Replit environment)
  const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
  if (replitDomain) {
    return `https://${replitDomain}/api/trigger/${token}`;
  }
  // Fallback: reconstruct from request headers
  const host = (req.headers["x-forwarded-host"] as string)?.split(",")[0]?.trim() || req.headers.host || "localhost";
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

router.post("/:tokenId/upload-image", upload.single("image"), async (req: Request, res: Response) => {
  try {
    const tokenId = req.params.tokenId;
    if (!req.file) {
      res.status(400).json({ error: "validation_error", message: "No image file provided" });
      return;
    }

    const token = await db.select().from(tokensTable).where(eq(tokensTable.id, tokenId)).limit(1);
    if (!token.length) {
      fs.unlinkSync(req.file.path);
      res.status(404).json({ error: "not_found", message: "Token not found" });
      return;
    }

    const t = token[0];
    if (t.imagePath) {
      const oldPath = path.join(UPLOADS_DIR, t.imagePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.update(tokensTable)
      .set({ imagePath: req.file.filename, imageMime: req.file.mimetype })
      .where(eq(tokensTable.id, tokenId));

    res.json({ success: true, imagePath: req.file.filename });
  } catch (err) {
    req.log.error({ err }, "Error uploading image");
    res.status(500).json({ error: "internal_error", message: "Failed to upload image" });
  }
});

router.get("/:tokenId/image", async (req: Request, res: Response) => {
  try {
    const tokenId = req.params.tokenId;
    const token = await db.select().from(tokensTable).where(eq(tokensTable.id, tokenId)).limit(1);
    if (!token.length || !token[0].imagePath) {
      res.status(404).json({ error: "not_found", message: "Image not found" });
      return;
    }
    const filePath = path.join(UPLOADS_DIR, token[0].imagePath);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "not_found", message: "Image file missing" });
      return;
    }
    res.set("Content-Type", token[0].imageMime || "image/png");
    res.sendFile(filePath);
  } catch (err) {
    req.log.error({ err }, "Error serving image");
    res.status(500).json({ error: "internal_error", message: "Failed to serve image" });
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
