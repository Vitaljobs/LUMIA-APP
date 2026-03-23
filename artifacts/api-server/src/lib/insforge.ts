import { createClient } from "@insforge/sdk";
import { logger } from "./logger";

export const PROJECT_ID = "LUMIA_2026";
export const TABLE_PREFIX = "lumia_";

export function getClient() {
  const rawUrl = process.env.INSFORGE_URL;
  const anonKey = process.env.INSFORGE_API_KEY;

  if (!rawUrl || !anonKey) {
    throw new Error("INSFORGE_URL and INSFORGE_API_KEY environment variables must be set");
  }

  // Strip trailing slashes to prevent double-slash in SDK-generated URLs
  const baseUrl = rawUrl.replace(/\/+$/, "");

  return createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
  });
}

function table(name: string) {
  return `${TABLE_PREFIX}${name}`;
}

export type Row = Record<string, unknown>;

// ─── Generic helpers ────────────────────────────────────────────────────────

export async function dbSelect(
  tableName: string,
  filters: Record<string, unknown> = {},
  options: { order?: string; limit?: number } = {}
): Promise<Row[]> {
  const client = getClient();
  let query = client.database
    .from(table(tableName))
    .select("*")
    .eq("project_id", PROJECT_ID);

  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val as string);
  }

  const { data, error } = await (query as any);

  if (error) {
    logger.error({ table: tableName, error }, "Insforge SELECT failed");
    throw new Error(`Insforge SELECT ${tableName}: ${error.message ?? JSON.stringify(error)}`);
  }

  let rows: Row[] = (data as Row[]) ?? [];

  if (options.order) {
    const [col, dir] = options.order.split(".");
    rows = rows.sort((a, b) => {
      const av = a[col] as string;
      const bv = b[col] as string;
      return dir === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
    });
  }
  if (options.limit) {
    rows = rows.slice(0, options.limit);
  }

  return rows;
}

export async function dbInsert(tableName: string, row: Row): Promise<Row[]> {
  const client = getClient();
  const { data, error } = await client.database
    .from(table(tableName))
    .insert([{ ...row, project_id: PROJECT_ID }]);

  if (error) {
    logger.error({ table: tableName, error }, "Insforge INSERT failed");
    throw new Error(`Insforge INSERT ${tableName}: ${error.message ?? JSON.stringify(error)}`);
  }

  return (data as Row[]) ?? [];
}

export async function dbUpdate(
  tableName: string,
  id: string,
  updates: Row
): Promise<Row[]> {
  const client = getClient();
  const { data, error } = await client.database
    .from(table(tableName))
    .update(updates)
    .eq("id", id)
    .eq("project_id", PROJECT_ID);

  if (error) {
    logger.error({ table: tableName, id, error }, "Insforge UPDATE failed");
    throw new Error(`Insforge UPDATE ${tableName}: ${error.message ?? JSON.stringify(error)}`);
  }

  return (data as Row[]) ?? [];
}
