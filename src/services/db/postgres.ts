import "server-only";
import { Pool } from "pg";
import { getEnv } from "@/lib/env";

let pool: Pool | null = null;

export function getPostgresPool() {
  if (pool) {
    return pool;
  }

  const env = getEnv();

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for PostgreSQL access.");
  }

  pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
  });

  return pool;
}
