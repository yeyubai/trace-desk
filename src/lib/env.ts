import { z } from "zod";

const envSchema = z.object({
  APP_DATA_MODE: z.enum(["mock", "live"]).default("mock"),
  APP_AI_MODE: z.enum(["mock", "bailian"]).default("mock"),
  AI_FAST_MODEL: z.string().trim().min(1).default("qwen-turbo"),
  AI_QUALITY_MODEL: z.string().trim().min(1).default("qwen-plus"),
  BAILIAN_API_KEY: z.string().trim().optional(),
  BAILIAN_BASE_URL: z
    .string()
    .trim()
    .url()
    .default("https://dashscope.aliyuncs.com/compatible-mode/v1"),
  DATABASE_URL: z.string().trim().optional(),
  REDIS_URL: z.string().trim().optional(),
  OSS_REGION: z.string().trim().default("oss-cn-hangzhou"),
  OSS_BUCKET: z.string().trim().optional(),
  OSS_ACCESS_KEY_ID: z.string().trim().optional(),
  OSS_ACCESS_KEY_SECRET: z.string().trim().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse({
    APP_DATA_MODE: process.env.APP_DATA_MODE,
    APP_AI_MODE: process.env.APP_AI_MODE,
    AI_FAST_MODEL: process.env.AI_FAST_MODEL,
    AI_QUALITY_MODEL: process.env.AI_QUALITY_MODEL,
    BAILIAN_API_KEY: process.env.BAILIAN_API_KEY,
    BAILIAN_BASE_URL: process.env.BAILIAN_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    OSS_REGION: process.env.OSS_REGION,
    OSS_BUCKET: process.env.OSS_BUCKET,
    OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET,
  });

  return cachedEnv;
}
