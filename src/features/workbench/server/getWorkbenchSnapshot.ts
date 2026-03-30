import { formatCompactNumber } from "@/lib/formatters";
import { getRuntimeOverview } from "@/features/runtime/server/get-runtime-overview";
import { parseWorkbenchSnapshot } from "@/features/workbench/schemas/workbench-snapshot";
import {
  getKnowledgeBaseOverview,
  listResponseFeedback,
  listChatSessions,
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
  const positive = feedbackEntries.filter(
    (entry) => entry.rating === "thumbs_up",
  ).length;
  const negative = feedbackEntries.filter(
    (entry) => entry.rating === "thumbs_down",
  ).length;
  const assistantMessageCount = sessions.reduce(
    (count, session) =>
      count + session.messages.filter((message) => message.role === "assistant").length,
    0,
  );

  return parseWorkbenchSnapshot({
    knowledgeBase,
    activeSessionId: sessions[0]?.id ?? "",
    sessions,
    sources,
    signals: [
      {
        id: "signal-sources",
        label: "来源情况",
        value: `${knowledgeBase.sourceCount}`,
        detail: `${formatCompactNumber(knowledgeBase.chunkCount)} 个分块已就绪`,
      },
      {
        id: "signal-protocol",
        label: "回答规则",
        value: "有依据",
        detail: knowledgeBase.retrievalReadiness,
      },
      {
        id: "signal-sessions",
        label: "会话记录",
        value: `${sessions.length}`,
        detail: "保留多轮会话与反馈入口",
      },
    ],
    suggestedPrompts: [
      "把导入页拆成几个状态区域？",
      "首版引用卡片要展示哪些字段？",
      "如何表达未命中时的明确拒答？",
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
