const PROJECT_ID = "LUMIA_2026";
const BASE_URL = process.env.EXPO_PUBLIC_INSFORGE_URL ?? "";
const API_KEY = process.env.EXPO_PUBLIC_INSFORGE_API_KEY ?? "";

const TABLE_PREFIX = "lumia_";

type InsforgeRow = Record<string, unknown>;

async function insforgeRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  table: string,
  body?: InsforgeRow,
  params?: Record<string, string>
): Promise<InsforgeRow[]> {
  if (!BASE_URL || !API_KEY) {
    throw new Error("Insforge credentials niet geconfigureerd (EXPO_PUBLIC_INSFORGE_URL / EXPO_PUBLIC_INSFORGE_API_KEY)");
  }

  const tableName = `${TABLE_PREFIX}${table}`;
  const url = new URL(`${BASE_URL}/rest/v1/${tableName}`);

  // Always filter by project_id for data isolation
  url.searchParams.set("project_id", `eq.${PROJECT_ID}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      "apikey": API_KEY,
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: body ? JSON.stringify({ ...body, project_id: PROJECT_ID }) : undefined,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Insforge ${method} ${tableName}: ${response.status} — ${err}`);
  }

  return response.json();
}

export const InsforgeService = {
  projectId: PROJECT_ID,

  // Meters
  async getMeters(userId: string) {
    return insforgeRequest("GET", "meters", undefined, { user_id: `eq.${userId}` });
  },
  async upsertMeters(userId: string, meters: Record<string, number>) {
    return insforgeRequest("POST", "meters", { user_id: userId, ...meters });
  },

  // XP Log
  async getXPLog(userId: string) {
    return insforgeRequest("GET", "xp_log", undefined, {
      user_id: `eq.${userId}`,
      order: "created_at.desc",
      limit: "50",
    });
  },
  async addXPEntry(entry: InsforgeRow) {
    return insforgeRequest("POST", "xp_log", entry);
  },

  // Statements
  async getStatements() {
    return insforgeRequest("GET", "statements", undefined, { order: "created_at.desc" });
  },
  async createStatement(statement: InsforgeRow) {
    return insforgeRequest("POST", "statements", statement);
  },
  async voteStatement(statementId: string, userId: string, optionIndex: number) {
    return insforgeRequest("POST", "statement_votes", {
      statement_id: statementId,
      user_id: userId,
      option_index: optionIndex,
    });
  },

  // Friends
  async getFriends(userId: string) {
    return insforgeRequest("GET", "friends", undefined, { user_id: `eq.${userId}` });
  },
  async getFriendRequests(userId: string) {
    return insforgeRequest("GET", "friend_requests", undefined, { to_user_id: `eq.${userId}`, status: "eq.pending" });
  },
  async acceptFriendRequest(requestId: string) {
    return insforgeRequest("PATCH", "friend_requests", { status: "accepted", request_id: requestId });
  },

  // Messages
  async getMessages(chatId: string) {
    return insforgeRequest("GET", "messages", undefined, {
      chat_id: `eq.${chatId}`,
      order: "created_at.asc",
    });
  },
  async sendMessage(message: InsforgeRow) {
    return insforgeRequest("POST", "messages", message);
  },

  // Notifications
  async getNotifications(userId: string) {
    return insforgeRequest("GET", "notifications", undefined, {
      user_id: `eq.${userId}`,
      order: "created_at.desc",
    });
  },
  async markNotificationRead(notifId: string) {
    return insforgeRequest("PATCH", "notifications", { read: true, id: notifId });
  },
};
