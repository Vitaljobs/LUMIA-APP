import { logger } from "./logger";

const PROJECT_ID = "LUMIA_2026";
const TABLE_PREFIX = "lumia_";

function getConfig() {
  const url = process.env.INSFORGE_URL;
  const key = process.env.INSFORGE_API_KEY;
  if (!url || !key) {
    throw new Error("INSFORGE_URL and INSFORGE_API_KEY must be set in environment");
  }
  return { url: url.replace(/\/$/, ""), key };
}

type Row = Record<string, unknown>;

export async function insforgeGet(table: string, filters: Record<string, string> = {}): Promise<Row[]> {
  const { url, key } = getConfig();
  const tableName = `${TABLE_PREFIX}${table}`;
  const endpoint = new URL(`${url}/rest/v1/${tableName}`);

  // Always filter by project_id for strict data isolation
  endpoint.searchParams.set("project_id", `eq.${PROJECT_ID}`);
  Object.entries(filters).forEach(([k, v]) => endpoint.searchParams.set(k, v));

  const res = await fetch(endpoint.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ table, status: res.status, body }, "Insforge GET failed");
    throw new Error(`Insforge GET ${tableName}: ${res.status}`);
  }

  return res.json();
}

export async function insforgePost(table: string, data: Row): Promise<Row[]> {
  const { url, key } = getConfig();
  const tableName = `${TABLE_PREFIX}${table}`;
  const endpoint = `${url}/rest/v1/${tableName}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ ...data, project_id: PROJECT_ID }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ table, status: res.status, body }, "Insforge POST failed");
    throw new Error(`Insforge POST ${tableName}: ${res.status}`);
  }

  return res.json();
}

export async function insforgePatch(table: string, id: string, data: Row): Promise<Row[]> {
  const { url, key } = getConfig();
  const tableName = `${TABLE_PREFIX}${table}`;
  const endpoint = new URL(`${url}/rest/v1/${tableName}`);
  endpoint.searchParams.set("id", `eq.${id}`);
  endpoint.searchParams.set("project_id", `eq.${PROJECT_ID}`);

  const res = await fetch(endpoint.toString(), {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ table, id, status: res.status, body }, "Insforge PATCH failed");
    throw new Error(`Insforge PATCH ${tableName}: ${res.status}`);
  }

  return res.json();
}
