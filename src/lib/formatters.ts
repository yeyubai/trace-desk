import type {
  SourceDocumentKind,
  SourceRetrievalStatus,
  SourceDocumentStatus,
} from "@/features/knowledge/types/knowledge";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTimestamp(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 60) {
    if (diffMinutes >= 0) {
      return `${diffMinutes || 1} 分钟后`;
    }

    return `${Math.abs(diffMinutes) || 1} 分钟前`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    if (diffHours >= 0) {
      return `${diffHours} 小时后`;
    }

    return `${Math.abs(diffHours)} 小时前`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays >= 0) {
    return `${diffDays} 天后`;
  }

  return `${Math.abs(diffDays)} 天前`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatSourceKindLabel(kind: SourceDocumentKind) {
  switch (kind) {
    case "markdown":
      return "Markdown";
    case "pdf":
      return "PDF";
    case "txt":
      return "TXT";
    case "url":
      return "网页";
    default:
      return kind;
  }
}

export function formatSourceStatusLabel(status: SourceDocumentStatus) {
  switch (status) {
    case "available":
      return "已导入";
    case "indexing":
      return "处理中";
    case "failed":
      return "导入失败";
    default:
      return status;
  }
}

export function formatSourceRetrievalStatusLabel(status: SourceRetrievalStatus) {
  switch (status) {
    case "retrievable":
      return "可检索";
    case "stored_only":
      return "仅存储";
    case "unavailable":
      return "暂不可检索";
    default:
      return status;
  }
}
