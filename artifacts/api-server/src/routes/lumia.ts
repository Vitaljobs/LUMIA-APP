import { Router } from "express";
import { dbSelect, dbInsert, dbUpdate, getClient, TABLE_PREFIX, PROJECT_ID } from "../lib/insforge";
import { LUMIA_MIGRATIONS_SQL } from "../lib/migrations";
import { logger } from "../lib/logger";

const router = Router();

// ─── Setup / Migration ─────────────────────────────────────────────────────

router.get("/lumia/setup/status", async (_req, res) => {
  const tables = [
    "meters", "xp_log", "statements", "statement_votes",
    "friends", "friend_requests", "messages", "notifications",
  ];
  const status: Record<string, boolean> = {};

  for (const t of tables) {
    try {
      await dbSelect(t, {});
      status[t] = true;
    } catch {
      status[t] = false;
    }
  }

  const allReady = Object.values(status).every(Boolean);
  res.json({ ready: allReady, tables: status, sql: allReady ? undefined : LUMIA_MIGRATIONS_SQL });
});

// ─── Meters ────────────────────────────────────────────────────────────────

router.get("/lumia/meters/:userId", async (req, res) => {
  try {
    const rows = await dbSelect("meters", { user_id: req.params.userId });
    if (rows.length === 0) {
      return res.json({ user_id: req.params.userId, project_id: PROJECT_ID, honor: 76, reflectie: 13, vitality: 91, decay: 3 });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err, "lumia/meters GET");
    res.status(500).json({ error: String(err) });
  }
});

// Upsert meters
router.post("/lumia/meters/:userId/upsert", async (req, res) => {
  try {
    const client = getClient();
    const { data, error } = await client.database
      .from(`${TABLE_PREFIX}meters`)
      .upsert([{ ...req.body, user_id: req.params.userId, project_id: PROJECT_ID }]);
    if (error) throw error;
    res.json(data?.[0] ?? req.body);
  } catch (err) {
    // Fallback: try insert
    try {
      const rows = await dbInsert("meters", { ...req.body, user_id: req.params.userId });
      res.json(rows[0] ?? {});
    } catch (e2) {
      res.status(500).json({ error: String(e2) });
    }
  }
});

// ─── Statements ────────────────────────────────────────────────────────────

router.get("/lumia/statements", async (_req, res) => {
  try {
    const rows = await dbSelect("statements", {}, { order: "created_at.desc" });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/statements GET");
    res.status(500).json({ error: String(err) });
  }
});

router.post("/lumia/statements", async (req, res) => {
  try {
    const body = req.body;
    const rows = await dbInsert("statements", {
      ...body,
      votes_0: body.votes_0 ?? 0,
      votes_1: body.votes_1 ?? 0,
      votes_2: body.votes_2 ?? 0,
    });
    res.status(201).json(rows[0] ?? req.body);
  } catch (err) {
    logger.error(err, "lumia/statements POST");
    res.status(500).json({ error: String(err) });
  }
});

router.patch("/lumia/statements/:id", async (req, res) => {
  try {
    await dbUpdate("statements", req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    logger.error(err, "lumia/statements PATCH");
    res.status(500).json({ error: String(err) });
  }
});

router.post("/lumia/statements/:id/vote", async (req, res) => {
  try {
    await dbInsert("statement_votes", { statement_id: req.params.id, ...req.body });
    res.json({ success: true });
  } catch (err) {
    logger.error(err, "lumia/vote POST");
    res.status(500).json({ error: String(err) });
  }
});

// ─── XP Log ───────────────────────────────────────────────────────────────

router.get("/lumia/xp-log/:userId", async (req, res) => {
  try {
    const rows = await dbSelect("xp_log", { user_id: req.params.userId }, { order: "created_at.desc", limit: 50 });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/xp-log GET");
    res.status(500).json({ error: String(err) });
  }
});

router.post("/lumia/xp-log/:userId", async (req, res) => {
  try {
    const rows = await dbInsert("xp_log", { ...req.body, user_id: req.params.userId });
    res.status(201).json(rows[0] ?? {});
  } catch (err) {
    logger.error(err, "lumia/xp-log POST");
    res.status(500).json({ error: String(err) });
  }
});

// ─── Notifications ────────────────────────────────────────────────────────

router.get("/lumia/notifications/:userId", async (req, res) => {
  try {
    const rows = await dbSelect("notifications", { user_id: req.params.userId }, { order: "created_at.desc" });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/notifications GET");
    res.status(500).json({ error: String(err) });
  }
});

router.post("/lumia/notifications/:userId", async (req, res) => {
  try {
    const rows = await dbInsert("notifications", { ...req.body, user_id: req.params.userId, read: false });
    res.status(201).json(rows[0] ?? {});
  } catch (err) {
    logger.error(err, "lumia/notifications POST");
    res.status(500).json({ error: String(err) });
  }
});

router.patch("/lumia/notifications/:userId/:notifId/read", async (req, res) => {
  try {
    await dbUpdate("notifications", req.params.notifId, { read: true });
    res.json({ success: true });
  } catch (err) {
    logger.error(err, "lumia/notifications PATCH");
    res.status(500).json({ error: String(err) });
  }
});

// ─── Friends ──────────────────────────────────────────────────────────────

router.get("/lumia/friends/:userId", async (req, res) => {
  try {
    const rows = await dbSelect("friends", { user_id: req.params.userId });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/friends GET");
    res.status(500).json({ error: String(err) });
  }
});

router.post("/lumia/friends/:userId", async (req, res) => {
  try {
    const rows = await dbInsert("friends", { ...req.body, user_id: req.params.userId });
    res.status(201).json(rows[0] ?? {});
  } catch (err) {
    logger.error(err, "lumia/friends POST");
    res.status(500).json({ error: String(err) });
  }
});

// ─── Messages ─────────────────────────────────────────────────────────────

router.get("/lumia/messages/:chatId", async (req, res) => {
  try {
    const rows = await dbSelect("messages", { chat_id: req.params.chatId }, { order: "created_at.asc" });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/messages GET");
    res.status(500).json({ error: String(err) });
  }
});

router.post("/lumia/messages", async (req, res) => {
  try {
    const rows = await dbInsert("messages", req.body);
    res.status(201).json(rows[0] ?? {});
  } catch (err) {
    logger.error(err, "lumia/messages POST");
    res.status(500).json({ error: String(err) });
  }
});

export default router;
