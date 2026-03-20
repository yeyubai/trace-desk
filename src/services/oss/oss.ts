import "server-only";
import OSS from "ali-oss";
import { getEnv } from "@/lib/env";

let ossClient: OSS | null = null;

export function getOssClient() {
  if (ossClient) {
    return ossClient;
  }

  const env = getEnv();

  if (!env.OSS_BUCKET || !env.OSS_ACCESS_KEY_ID || !env.OSS_ACCESS_KEY_SECRET) {
    throw new Error("OSS configuration is incomplete.");
  }

  ossClient = new OSS({
    region: env.OSS_REGION,
    bucket: env.OSS_BUCKET,
    accessKeyId: env.OSS_ACCESS_KEY_ID,
    accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
  });

  return ossClient;
}
