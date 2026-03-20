import "server-only";
import OpenAI from "openai";
import type { ModelTier } from "@/features/chat/types/chat";
import { resolveModelName } from "@/features/chat/constants/model-tiers";
import { getEnv } from "@/lib/env";

let client: OpenAI | null = null;

export function getBailianClient() {
  if (client) {
    return client;
  }

  const env = getEnv();

  if (!env.BAILIAN_API_KEY) {
    throw new Error("BAILIAN_API_KEY is required for Bailian access.");
  }

  client = new OpenAI({
    apiKey: env.BAILIAN_API_KEY,
    baseURL: env.BAILIAN_BASE_URL,
  });

  return client;
}

export function resolveBailianModel(modelTier: ModelTier) {
  return resolveModelName(modelTier);
}
