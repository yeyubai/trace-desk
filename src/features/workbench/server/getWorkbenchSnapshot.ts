import { formatCompactNumber } from "@/lib/formatters";
import { getRuntimeOverview } from "@/features/runtime/server/get-runtime-overview";
import { parseWorkbenchSnapshot } from "@/features/workbench/schemas/workbench-snapshot";
import {
  getKnowledgeBaseOverview,
  listChatSessions,
  listResponseFeedback,
  listSourceDocumentsByKnowledgeBaseId,
} from "@/services/db/workbench-store";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

export async function getWorkbenchSnapshot(): Promise<WorkbenchSnapshot> {
  const knowledgeBase = await getKnowledgeBaseOverview();
  const sessions = await listChatSessions(knowledgeBase.id);
  const sources = await listSourceDocumentsByKnowledgeBaseId(knowledgeBase.id);
  const feedbackEntries = await listResponseFeedback();
  const feedbackByMessage = Object.fromEntries(
    feedbackEntries.map((entry) => [
      entry.messageId,
      {
        rating: entry.rating,
        note: entry.note,
        updatedAt: entry.updatedAt,
      },
    ]),
  );
  const positive = feedbackEntries.filter((entry) => entry.rating === "thumbs_up").length;
  const negative = feedbackEntries.filter((entry) => entry.rating === "thumbs_down").length;
  const assistantMessageCount = sessions.reduce(
    (count, session) =>
      count + session.messages.filter((message) => message.role === "assistant").length,
    0,
  );
  const userQuestionCount = sessions.reduce(
    (count, session) =>
      count + session.messages.filter((message) => message.role === "user").length,
    0,
  );
  const knowledgeGapCount = sessions.reduce((count, session) => {
    return (
      count +
      session.messages.reduce((sessionCount, message) => {
        return (
          sessionCount +
          message.parts.filter((part) => part.type === "knowledge_gap").length
        );
      }, 0)
    );
  }, 0);
  const activeSources = Math.max(sources.filter((source) => !source.duplicateOf).length, 1);
  const retrievableSources = sources.filter(
    (source) => source.retrievalStatus === "retrievable" && !source.duplicateOf,
  ).length;
  const sessionsWithQuestion = sessions.filter((session) =>
    session.messages.some((message) => message.role === "user"),
  ).length;
  const firstQuestionRate = Math.min(
    Math.round((userQuestionCount / activeSources) * 100),
    100,
  );
  const acceptedAnswerRate =
    feedbackEntries.length > 0 ? Math.round((positive / feedbackEntries.length) * 100) : 0;
  const gapCaptureRate =
    assistantMessageCount > 0 ? Math.round((knowledgeGapCount / assistantMessageCount) * 100) : 0;

  return parseWorkbenchSnapshot({
    knowledgeBase,
    activeSessionId: sessions[0]?.id ?? "",
    sessions,
    sources,
    signals: [
      {
        id: "signal-sources",
        label: "知识覆盖",
        value: `${sources.filter((source) => !source.duplicateOf).length}`,
        detail: `${formatCompactNumber(knowledgeBase.chunkCount)} 个分块支撑团队答疑`,
      },
      {
        id: "signal-activation",
        label: "首问转化",
        value: `${firstQuestionRate}%`,
        detail: "导入后是否真的进入提问与标准回复生成",
      },
      {
        id: "signal-adoption",
        label: "采纳反馈",
        value: `${acceptedAnswerRate}%`,
        detail: "用户反馈里有多少回答被认为有帮助",
      },
      {
        id: "signal-gaps",
        label: "缺口沉淀",
        value: `${gapCaptureRate}%`,
        detail: `${knowledgeGapCount} 条待补知识缺口已被显式记录`,
      },
    ],
    businessMetrics: [
      {
        id: "metric-first-question",
        label: "导入后首问率",
        value: `${firstQuestionRate}%`,
        target: ">= 70%",
        detail: "衡量来源导入后是否真的被拿来发起第一轮团队答疑。",
      },
      {
        id: "metric-accepted-answer",
        label: "回答采纳率",
        value: `${acceptedAnswerRate}%`,
        target: ">= 60%",
        detail: "衡量带引用的回答有多少被用户反馈为有帮助。",
      },
      {
        id: "metric-gap-capture",
        label: "缺口沉淀率",
        value: `${gapCaptureRate}%`,
        target: ">= 80%",
        detail: "衡量未命中是否被显式沉淀成后续可处理的知识缺口。",
      },
    ],
    funnel: [
      {
        id: "funnel-imported",
        label: "已导入来源",
        count: activeSources,
        detail: "当前进入业务工作流的有效来源数。",
      },
      {
        id: "funnel-retrievable",
        label: "可答疑来源",
        count: retrievableSources,
        detail: "已通过质量门控、可直接支撑团队答疑的来源。",
      },
      {
        id: "funnel-activated",
        label: "已发起会话",
        count: sessionsWithQuestion,
        detail: "至少出现过一轮真实问题的会话数。",
      },
      {
        id: "funnel-reused",
        label: "待补/复用动作",
        count: knowledgeGapCount + positive,
        detail: "已被沉淀为知识缺口或被明确采纳的结果总数。",
      },
    ],
    suggestedPrompts: [
      "请基于当前知识库生成一条可直接复用的团队标准回复草稿。",
      "团队成员最可能会问这个知识库里的什么问题？请直接回答并附引用。",
      "如果当前资料还不足以回答，请明确指出缺了什么知识。",
    ],
    runtime: getRuntimeOverview(),
    feedbackSummary: {
      total: feedbackEntries.length,
      positive,
      negative,
      reviewedMessages: feedbackEntries.length,
      pendingMessages: Math.max(assistantMessageCount - feedbackEntries.length, 0),
    },
    feedbackByMessage,
  });
}
