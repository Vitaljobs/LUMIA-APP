import { Router } from "express";
import { insforgeGet, insforgePost, insforgePatch } from "../lib/insforge";
import { logger } from "../lib/logger";

const router = Router();

// GET /lumia/meters/:userId
router.get("/lumia/meters/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await insforgeGet("meters", { user_id: `eq.${userId}` });
    if (rows.length === 0) {
      return res.json({ user_id: userId, project_id: "LUMIA_2026", honor: 50, reflectie: 10, vitality: 50, decay: 5 });
    }
    res.json(rows[0]);
  } catch (err) {
    logger.error(err, "lumia/meters GET failed");
    res.status(500).json({ error: String(err) });
  }
});

// GET /lumia/statements
router.get("/lumia/statements", async (_req, res) => {
  try {
    const rows = await insforgeGet("statements", { order: "created_at.desc" });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/statements GET failed");
    res.status(500).json({ error: String(err) });
  }
});

// POST /lumia/statements
router.post("/lumia/statements", async (req, res) => {
  try {
    const rows = await insforgePost("statements", req.body);
    res.status(201).json(rows[0] ?? req.body);
  } catch (err) {
    logger.error(err, "lumia/statements POST failed");
    res.status(500).json({ error: String(err) });
  }
});

// POST /lumia/statements/:id/vote
router.post("/lumia/statements/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, option_index, trust_weight } = req.body;
    const rows = await insforgePost("statement_votes", {
      statement_id: id,
      user_id,
      option_index,
      trust_weight,
    });
    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error(err, "lumia/vote POST failed");
    res.status(500).json({ error: String(err) });
  }
});

// GET /lumia/xp-log/:userId
router.get("/lumia/xp-log/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await insforgeGet("xp_log", {
      user_id: `eq.${userId}`,
      order: "created_at.desc",
      limit: "50",
    });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/xp-log GET failed");
    res.status(500).json({ error: String(err) });
  }
});

// POST /lumia/xp-log/:userId
router.post("/lumia/xp-log/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await insforgePost("xp_log", { ...req.body, user_id: userId });
    res.status(201).json(rows[0] ?? {});
  } catch (err) {
    logger.error(err, "lumia/xp-log POST failed");
    res.status(500).json({ error: String(err) });
  }
});

// GET /lumia/notifications/:userId
router.get("/lumia/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await insforgeGet("notifications", {
      user_id: `eq.${userId}`,
      order: "created_at.desc",
    });
    res.json(rows);
  } catch (err) {
    logger.error(err, "lumia/notifications GET failed");
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /lumia/notifications/:userId/:notifId/read
router.patch("/lumia/notifications/:userId/:notifId/read", async (req, res) => {
  try {
    const { notifId } = req.params;
    await insforgePatch("notifications", notifId, { read: true });
    res.json({ success: true });
  } catch (err) {
    logger.error(err, "lumia/notifications PATCH failed");
    res.status(500).json({ error: String(err) });
  }
});

export default router;
