import { getEnv } from "@/lib/env";
import type { RuntimeDependency, RuntimeOverview } from "@/features/runtime/types/runtime";

function buildDependencyStatuses(): RuntimeDependency[] {
  const env = getEnv();

  return [
    {
      id: "runtime-db",
      label: "PostgreSQL / pgvector",
      detail: env.DATABASE_URL
        ? "已提供 DATABASE_URL，可直接运行真实入库与 pgvector 检索。"
        : "缺少 DATABASE_URL，live RAG 无法启动。",
      status: env.DATABASE_URL ? "configured" : "missing",
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
      detail: env.BAILIAN_API_KEY
        ? "已提供百炼 API Key，可用于 embedding 与 grounded answer。"
        : "缺少 BAILIAN_API_KEY，真实生成与 embedding 不可用。",
      status: env.BAILIAN_API_KEY ? "configured" : "missing",
    },
  ];
}

export function getRuntimeOverview(): RuntimeOverview {
  const env = getEnv();
  const dependencies = buildDependencyStatuses();
  const configuredCount = dependencies.filter(
    (dependency) => dependency.status === "configured",
  ).length;
  const missingCount = dependencies.filter(
    (dependency) => dependency.status === "missing",
  ).length;
  const mockCount = dependencies.filter((dependency) => dependency.status === "mock").length;

  return {
    dataMode: env.APP_DATA_MODE,
    aiMode: env.APP_AI_MODE,
    dependencies,
    summary: {
      configuredCount,
      missingCount,
      mockCount,
      ready: missingCount === 0,
      label: missingCount === 0 ? "全部就绪" : `${missingCount} 项待配`,
      detail:
        missingCount === 0
          ? "真实 RAG 运行所需的关键依赖均已就绪。"
          : "当前仍有依赖未配置，系统不会回退到 mock，请先补齐 live 运行条件。",
    },
  };
}
