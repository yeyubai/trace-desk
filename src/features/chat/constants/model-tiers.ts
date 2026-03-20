import type { ModelTier } from "@/features/chat/types/chat";
import { getEnv } from "@/lib/env";

export const MODEL_TIER_LABELS: Record<ModelTier, string> = {
  fast: "Fast",
  quality: "Quality",
};

export function resolveModelName(modelTier: ModelTier) {
  const env = getEnv();

  return modelTier === "fast" ? env.AI_FAST_MODEL : env.AI_QUALITY_MODEL;
}
