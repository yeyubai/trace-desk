import type { ModelTier } from "@/features/chat/types/chat";
import { getEnv } from "@/lib/env";
import { getBailianClient, resolveBailianModel } from "@/services/ai/bailian";
import {
  buildRefusalAnswer,
  buildCitationsFromMatches,
  composeMockAnswer,
} from "@/services/ai/compose-mock-answer";
import type {
  RetrievalDiagnostics,
  SearchKnowledgeMatch,
} from "@/services/retrieval/search-knowledge-base";

function buildFollowups(question: string) {
  return [
    `继续把“${question.slice(0, 12)}”拆成页面模块`,
    "补一份对应的接口或数据结构设计",
  ];
}

function buildGroundingPrompt(args: {
  question: string;
  citations: Awaited<ReturnType<typeof buildCitationsFromMatches>>;
  recentMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}) {
  const evidenceText = args.citations
    .map(
      (citation, index) =>
        `${index + 1}. ${citation.sourceTitle} ${citation.citationLabel}\n摘录：${citation.excerpt}`,
    )
    .join("\n\n");

  return [
    "你是团队知识工作台中的问答助手。",
    "只能依据给定证据回答，不要编造不存在的来源或事实。",
    "如果证据不足，直接说明无法根据当前知识库回答。",
    "输出要求：",
    "1. 只输出简洁中文 Markdown。",
    "2. 第一行是非常保守的一句话结论。",
    "3. 后面最多输出 4 条项目符号，每条只写一条可以直接从证据推出的事实。",
    "4. 不要补充证据里没有出现的新数字、新结论或新术语。",
    ...(args.recentMessages && args.recentMessages.length > 0
      ? [
          "",
          "最近对话：",
          ...args.recentMessages.map(
            (message) => `${message.role === "user" ? "用户" : "助手"}：${message.content}`,
          ),
        ]
      : []),
    "",
    "可用证据：",
    evidenceText,
    "",
    `用户问题：${args.question}`,
  ].join("\n");
}

function splitIntoChunks(value: string) {
  const segments = value.split(/(\s+)/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const segment of segments) {
    if ((current + segment).length > 28) {
      chunks.push(current);
      current = segment;
      continue;
    }

    current += segment;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [value];
}

function extractSupportTerms(value: string) {
  const normalized = value.toLowerCase();
  const terms = new Set<string>();
  const latinMatches = normalized.match(/[a-z0-9]{2,}/g) ?? [];

  for (const item of latinMatches) {
    terms.add(item);
  }

  const hanMatches = normalized.match(/[\u4e00-\u9fff]{2,}/g) ?? [];

  for (const item of hanMatches) {
    terms.add(item);

    for (let index = 0; index < item.length - 1; index += 1) {
      terms.add(item.slice(index, index + 2));
    }
  }

  return [...terms];
}

function scoreClaimSupport(claim: string, matches: SearchKnowledgeMatch[]) {
  const claimTerms = extractSupportTerms(claim);

  return matches.reduce((bestScore, match) => {
    const evidence = match.content.toLowerCase();
    let overlap = 0;

    for (const term of claimTerms) {
      if (term.length >= 2 && evidence.includes(term)) {
        overlap += 1;
      }
    }

    if (evidence.includes(claim.toLowerCase())) {
      overlap += 3;
    }

    return Math.max(bestScore, overlap);
  }, 0);
}

function validateAnswerMarkdown(answerMarkdown: string, matches: SearchKnowledgeMatch[]) {
  const lines = answerMarkdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bulletLines = lines.filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));
  const supportedBullets = bulletLines.filter((line) => scoreClaimSupport(line, matches) >= 2).slice(0, 4);

  if (supportedBullets.length === 0) {
    return null;
  }

  return [
    "根据当前命中的证据，可以确认：",
    "",
    ...supportedBullets,
  ].join("\n");
}

async function requestModelAnswer(args: {
  modelTier: ModelTier;
  question: string;
  citations: Awaited<ReturnType<typeof buildCitationsFromMatches>>;
  recentMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}) {
  const client = getBailianClient();
  const response = await client.chat.completions.create({
    model: resolveBailianModel(args.modelTier),
    temperature: 0.1,
    stream: false,
    messages: [
      {
        role: "user",
        content: buildGroundingPrompt({
          question: args.question,
          citations: args.citations,
          recentMessages: args.recentMessages,
        }),
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export type GroundedAnswerResult = {
  answerMarkdown: string;
  citations: Awaited<ReturnType<typeof buildCitationsFromMatches>>;
  followups: string[];
};

export type GroundedAnswerStreamEvent =
  | {
      type: "delta";
      chunk: string;
    }
  | ({
      type: "complete";
    } & GroundedAnswerResult);

async function resolveGroundedAnswer(args: {
  knowledgeBaseId: string;
  modelTier: ModelTier;
  question: string;
  matches: SearchKnowledgeMatch[];
  diagnostics?: RetrievalDiagnostics;
  recentMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}): Promise<GroundedAnswerResult> {
  const env = getEnv();
  const citations = await buildCitationsFromMatches({
    knowledgeBaseId: args.knowledgeBaseId,
    matches: args.matches,
  });

  if (args.matches.length === 0 || citations.length === 0) {
    return buildRefusalAnswer(args.diagnostics);
  }

  if (env.APP_AI_MODE === "mock") {
    return composeMockAnswer({
      knowledgeBaseId: args.knowledgeBaseId,
      matches: args.matches,
      diagnostics: args.diagnostics,
    });
  }

  if (!env.BAILIAN_API_KEY) {
    throw new Error(
      "BAILIAN_API_KEY is required for live grounded answer. Do not rely on mock mode for the real RAG path.",
    );
  }

  const modelAnswer = await requestModelAnswer({
    modelTier: args.modelTier,
    question: args.question,
    citations,
    recentMessages: args.recentMessages,
  });
  const validatedAnswer = validateAnswerMarkdown(modelAnswer, args.matches);

  if (!validatedAnswer) {
    return buildRefusalAnswer({
      query: args.diagnostics?.query ?? args.question,
      eligibleSourceCount: args.diagnostics?.eligibleSourceCount ?? 0,
      totalChunkCount: args.diagnostics?.totalChunkCount ?? 0,
      matchedChunkCount: args.diagnostics?.matchedChunkCount ?? 0,
      skippedSourceCount: args.diagnostics?.skippedSourceCount ?? 0,
      thinSourceCount: args.diagnostics?.thinSourceCount ?? 0,
      notes: [
        ...(args.diagnostics?.notes ?? []),
        "模型生成结果未通过证据校验，系统已自动回退为拒答。",
      ],
    });
  }

  return {
    answerMarkdown: validatedAnswer,
    citations,
    followups: buildFollowups(args.question),
  };
}

export async function* streamGroundedAnswer(args: {
  knowledgeBaseId: string;
  modelTier: ModelTier;
  question: string;
  matches: SearchKnowledgeMatch[];
  diagnostics?: RetrievalDiagnostics;
  recentMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}): AsyncGenerator<GroundedAnswerStreamEvent> {
  const result = await resolveGroundedAnswer(args);

  for (const chunk of splitIntoChunks(result.answerMarkdown)) {
    yield {
      type: "delta",
      chunk,
    };
  }

  yield {
    type: "complete",
    ...result,
  };
}

export async function generateGroundedAnswer(args: {
  knowledgeBaseId: string;
  modelTier: ModelTier;
  question: string;
  matches: SearchKnowledgeMatch[];
  diagnostics?: RetrievalDiagnostics;
  recentMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}) {
  let finalResult: GroundedAnswerResult | null = null;

  for await (const event of streamGroundedAnswer(args)) {
    if (event.type === "complete") {
      finalResult = {
        answerMarkdown: event.answerMarkdown,
        citations: event.citations,
        followups: event.followups,
      };
    }
  }

  if (!finalResult) {
    throw new Error("未能生成有效回答");
  }

  return finalResult;
}
