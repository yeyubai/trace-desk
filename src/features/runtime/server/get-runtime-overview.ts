import { getEnv } from "@/lib/env";
import type { RuntimeDependency, RuntimeOverview } from "@/features/runtime/types/runtime";

function buildDependencyStatuses(): RuntimeDependency[] {
  const env = getEnv();

  return [
    {
      id: "runtime-db",
      label: "PostgreSQL / pgvector",
      detail:
        env.APP_DATA_MODE === "mock"
          ? "当前走 mock 数据层，已保留真实数据库接入口。"
          : env.DATABASE_URL
            ? "已提供 DATABASE_URL，可继续接 Repository 与迁移脚本。"
            : "缺少 DATABASE_URL，真实数据模式无法启用。",
      status:
        env.APP_DATA_MODE === "mock"
          ? "mock"
          : env.DATABASE_URL
            ? "configured"
            : "missing",
    },
    {
      id: "runtime-redis",
      label: "Redis",
      detail: env.REDIS_URL ? "Redis URL 已配置，可继续补缓存与异步任务。" : "尚未配置 REDIS_URL。",
      status: env.REDIS_URL ? "configured" : "missing",
    },
    {
      id: "runtime-oss",
      label: "OSS",
      detail:
        env.OSS_BUCKET && env.OSS_ACCESS_KEY_ID && env.OSS_ACCESS_KEY_SECRET
          ? "OSS Bucket 与访问密钥已配置。"
          : "OSS 配置尚不完整。",
      status:
        env.OSS_BUCKET && env.OSS_ACCESS_KEY_ID && env.OSS_ACCESS_KEY_SECRET
          ? "configured"
          : "missing",
    },
    {
      id: "runtime-ai",
      label: "阿里云百炼",
      detail:
        env.APP_AI_MODE === "mock"
          ? "当前走 mock 回答编排，可随时切到百炼兼容接口。"
          : env.BAILIAN_API_KEY
            ? "已提供百炼 API Key，支持按模型档位映射。"
            : "缺少 BAILIAN_API_KEY。",
      status:
        env.APP_AI_MODE === "mock"
          ? "mock"
          : env.BAILIAN_API_KEY
            ? "configured"
            : "missing",
    },
  ];
}

export function getRuntimeOverview(): RuntimeOverview {
  const env = getEnv();

  return {
    dataMode: env.APP_DATA_MODE,
    aiMode: env.APP_AI_MODE,
    dependencies: buildDependencyStatuses(),
  };
}
