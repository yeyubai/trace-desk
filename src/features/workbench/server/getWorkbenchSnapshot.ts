import { formatCompactNumber } from "@/lib/formatters";
import { getRuntimeOverview } from "@/features/runtime/server/get-runtime-overview";
import {
  getKnowledgeBaseOverview,
  listChatSessions,
  listSourceDocumentsByKnowledgeBaseId,
} from "@/services/db/mock-workbench-store";
import type { WorkbenchSnapshot } from "@/features/workbench/types/workbench";

export function getWorkbenchSnapshot(): WorkbenchSnapshot {
  const knowledgeBase = getKnowledgeBaseOverview();
  const sessions = listChatSessions();
  const sources = listSourceDocumentsByKnowledgeBaseId(knowledgeBase.id);

  return {
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
  };
}
