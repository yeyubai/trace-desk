import "server-only";
import { createClient } from "redis";
import { getEnv } from "@/lib/env";

let clientPromise: ReturnType<typeof createClient> | null = null;

export function getRedisClient() {
  if (clientPromise) {
    return clientPromise;
  }

  const env = getEnv();

  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is required for Redis access.");
  }

  clientPromise = createClient({
    url: env.REDIS_URL,
  });

  return clientPromise;
}
