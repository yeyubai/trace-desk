import { getEnv } from "@/lib/env";
import { getBailianClient } from "@/services/ai/bailian";

export const EMBEDDING_DIMENSIONS = 1536;

function normalizeVector(values: number[]) {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

  if (!norm) {
    return values;
  }

  return values.map((value) => value / norm);
}

function resizeVector(values: number[]) {
  if (values.length === EMBEDDING_DIMENSIONS) {
    return normalizeVector(values);
  }

  const resized = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) => values[index] ?? 0);
  return normalizeVector(resized);
}

function hashToken(token: string, seed: number) {
  let hash = 2166136261 ^ seed;

  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function tokenizeForEmbedding(text: string) {
  const normalized = text.toLowerCase();
  const tokens = new Set<string>();
  const latinMatches = normalized.match(/[a-z0-9][a-z0-9._/-]{1,31}/g) ?? [];

  for (const token of latinMatches) {
    tokens.add(token);
  }

  const hanMatches = normalized.match(/[\u4e00-\u9fff]{2,}/g) ?? [];

  for (const token of hanMatches) {
    tokens.add(token);

    for (let index = 0; index < token.length - 1; index += 1) {
      tokens.add(token.slice(index, index + 2));
    }

    for (let index = 0; index < token.length - 2; index += 1) {
      tokens.add(token.slice(index, index + 3));
    }
  }

  return [...tokens];
}

function buildLocalEmbedding(text: string) {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = tokenizeForEmbedding(text);

  for (const token of tokens) {
    for (let seed = 0; seed < 4; seed += 1) {
      const hash = hashToken(token, seed + 1);
      const position = hash % EMBEDDING_DIMENSIONS;
      const sign = hash % 2 === 0 ? 1 : -1;
      vector[position] += sign * (1 + seed * 0.2);
    }
  }

  return normalizeVector(vector);
}

async function buildRemoteEmbeddings(texts: string[]) {
  const env = getEnv();

  if (env.APP_AI_MODE !== "bailian" || !env.BAILIAN_API_KEY || !env.AI_EMBEDDING_MODEL) {
    return null;
  }

  try {
    const client = getBailianClient();
    const response = await client.embeddings.create({
      model: env.AI_EMBEDDING_MODEL,
      input: texts,
    });

    return response.data.map((item) => resizeVector(item.embedding));
  } catch {
    return null;
  }
}

export async function buildBatchEmbeddings(texts: string[]) {
  const env = getEnv();

  if (env.APP_AI_MODE === "mock") {
    return texts.map((text) => buildLocalEmbedding(text));
  }

  const remoteEmbeddings = await buildRemoteEmbeddings(texts);

  if (remoteEmbeddings && remoteEmbeddings.length === texts.length) {
    return remoteEmbeddings;
  }

  throw new Error(
    "Failed to build remote embeddings for live RAG. Check BAILIAN_API_KEY, AI_EMBEDDING_MODEL, and embedding endpoint availability.",
  );
}

export async function buildTextEmbedding(text: string) {
  const [embedding] = await buildBatchEmbeddings([text]);
  return embedding;
}

export function cosineSimilarity(left: number[] | null, right: number[] | null) {
  if (!left || !right || left.length === 0 || right.length === 0) {
    return 0;
  }

  const length = Math.min(left.length, right.length);
  let score = 0;

  for (let index = 0; index < length; index += 1) {
    score += left[index] * right[index];
  }

  return score;
}
