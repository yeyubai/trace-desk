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
    "",
    "可用证据：",
    evidenceText,
    "",
    `用户问题：${args.question}`,
  ].join("\n");
}

export async function generateGroundedAnswer(args: {
  knowledgeBaseId: string;
  modelTier: ModelTier;
  question: string;
  matches: SearchKnowledgeMatch[];
}) {
  const env = getEnv();

  if (args.matches.length === 0 || env.APP_AI_MODE !== "bailian" || !env.BAILIAN_API_KEY) {
    return composeMockAnswer({
      knowledgeBaseId: args.knowledgeBaseId,
      matches: args.matches,
    });
  }

  const citations = buildCitationsFromMatches({
    knowledgeBaseId: args.knowledgeBaseId,
    matches: args.matches,
  });

  const client = getBailianClient();
  const completion = await client.chat.completions.create({
    model: resolveBailianModel(args.modelTier),
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: buildGroundingPrompt({
          question: args.question,
          citations,
        }),
      },
    ],
  });

  const answerMarkdown =
    completion.choices[0]?.message?.content?.trim() ||
    "我拿到了模型响应，但没有得到有效内容，请稍后重试。";

  return {
    answerMarkdown,
    citations,
    followups: buildFollowups(args.question),
  };
}
