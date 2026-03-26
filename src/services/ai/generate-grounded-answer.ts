import type { ModelTier } from "@/features/chat/types/chat";
import { getEnv } from "@/lib/env";
import { getBailianClient, resolveBailianModel } from "@/services/ai/bailian";
import {
  buildCitationsFromMatches,
  composeMockAnswer,
} from "@/services/ai/compose-mock-answer";
import type { SearchKnowledgeMatch } from "@/services/retrieval/search-knowledge-base";

function buildFollowups(question: string) {
  return [
    `继续把“${question.slice(0, 12)}”拆成页面模块`,
    "补一份对应的接口或数据结构设计",
  ];
}

function buildGroundingPrompt(args: {
  question: string;
  citations: ReturnType<typeof buildCitationsFromMatches>;
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
    "如果证据不足，直接说明无法依据当前知识库回答。",
    "回答用简洁中文，适合前端工程落地讨论。",
    ...(args.recentMessages && args.recentMessages.length > 0
      ? [
          "",
          "最近对话：",
          ...args.recentMessages.map(
            (message) =>
              `${message.role === "user" ? "用户" : "助手"}：${message.content}`,
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

export type GroundedAnswerResult = {
  answerMarkdown: string;
  citations: ReturnType<typeof buildCitationsFromMatches>;
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

function buildBailianRequest(args: {
  modelTier: ModelTier;
  question: string;
  citations: ReturnType<typeof buildCitationsFromMatches>;
  recentMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}) {
  return {
    model: resolveBailianModel(args.modelTier),
    temperature: 0.2,
    stream: true as const,
    messages: [
      {
        role: "user" as const,
        content: buildGroundingPrompt({
          question: args.question,
          citations: args.citations,
          recentMessages: args.recentMessages,
        }),
      },
    ],
  };
}

export async function* streamGroundedAnswer(args: {
  knowledgeBaseId: string;
  modelTier: ModelTier;
  question: string;
  matches: SearchKnowledgeMatch[];
  recentMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}): AsyncGenerator<GroundedAnswerStreamEvent> {
  const env = getEnv();

  if (args.matches.length === 0 || env.APP_AI_MODE !== "bailian" || !env.BAILIAN_API_KEY) {
    const mockAnswer = composeMockAnswer({
      knowledgeBaseId: args.knowledgeBaseId,
      matches: args.matches,
    });

    for (const chunk of splitIntoChunks(mockAnswer.answerMarkdown)) {
      yield {
        type: "delta",
        chunk,
      };
    }

    yield {
      type: "complete",
      ...mockAnswer,
    };

    return;
  }

  const citations = buildCitationsFromMatches({
    knowledgeBaseId: args.knowledgeBaseId,
    matches: args.matches,
  });
  const followups = buildFollowups(args.question);
  const client = getBailianClient();
  const stream = await client.chat.completions.create(
    buildBailianRequest({
      modelTier: args.modelTier,
      question: args.question,
      citations,
      recentMessages: args.recentMessages,
    }),
  );

  let answerMarkdown = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;

    if (!content) {
      continue;
    }

    answerMarkdown += content;
    yield {
      type: "delta",
      chunk: content,
    };
  }

  yield {
    type: "complete",
    answerMarkdown:
      answerMarkdown.trim() ||
      "我拿到了模型响应，但没有得到有效内容，请稍后重试。",
    citations,
    followups,
  };
}

export async function generateGroundedAnswer(args: {
  knowledgeBaseId: string;
  modelTier: ModelTier;
  question: string;
  matches: SearchKnowledgeMatch[];
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
