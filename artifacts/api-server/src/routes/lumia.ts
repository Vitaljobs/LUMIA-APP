import { Router } from "express";
import { dbSelect, dbInsert, dbUpdate, getClient, TABLE_PREFIX } from "../lib/insforge";
import { LUMIA_MIGRATIONS_SQL } from "../lib/migrations";
import { logger } from "../lib/logger";

const router = Router();

// ─── Setup / Migration ─────────────────────────────────────────────────────

// GET /lumia/setup/status — check which tables exist
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

// POST /lumia/setup/migrate — attempt auto-migration via Insforge RPC
router.post("/lumia/setup/migrate", async (_req, res) => {
  try {
    const client = getClient();
    // Attempt to call a raw SQL execution RPC function if available
    const { data, error } = await (client.database as any)
      .from(`rpc/exec_sql`)
      .insert([{ sql: LUMIA_MIGRATIONS_SQL }]);

    if (error) {
      // RPC not available — return the SQL for manual execution
      return res.status(422).json({
        success: false,
        message: "Automatische migratie niet beschikbaar. Voer de SQL handmatig uit in het Insforge dashboard.",
        sql: LUMIA_MIGRATIONS_SQL,
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(422).json({
      success: false,
      message: "Voer de SQL handmatig uit in het Insforge dashboard.",
      sql: LUMIA_MIGRATIONS_SQL,
    });
  }
});

// ─── Meters ────────────────────────────────────────────────────────────────

router.get("/lumia/meters/:userId", async (req, res) => {
  try {
    const rows = await dbSelect("meters", { user_id: req.params.userId });
    if (rows.length === 0) {
      return res.json({ user_id: req.params.userId, project_id: "LUMIA_2026", honor: 50, reflectie: 10, vitality: 50, decay: 5 });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err, "lumia/meters GET");
    res.status(500).json({ error: String(err) });
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
    const rows = await dbInsert("statements", { ...req.body, votes_0: 0, votes_1: 0, votes_2: 0 });
    res.status(201).json(rows[0] ?? req.body);
  } catch (err) {
    logger.error(err, "lumia/statements POST");
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

router.patch("/lumia/notifications/:userId/:notifId/read", async (req, res) => {
  try {
    await dbUpdate("notifications", req.params.notifId, { read: true });
    res.json({ success: true });
  } catch (err) {
    logger.error(err, "lumia/notifications PATCH");
    res.status(500).json({ error: String(err) });
  }
});

// ─── Friends & Messages ───────────────────────────────────────────────────

router.get("/lumia/friends/:userId", async (req, res) => {
  try {
    const rows = await dbSelect("friends", { user_id: req.params.userId });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/friends GET");
    res.status(500).json({ error: String(err) });
  }
});

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
