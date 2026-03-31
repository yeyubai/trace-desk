import type {
  SourceContentQuality,
  SourceDiagnostics,
  SourceDocumentKind,
  SourceFreshnessStatus,
  SourceGovernance,
} from "@/features/knowledge/types/knowledge";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getSourceFreshnessStatus(updatedAt: string): SourceFreshnessStatus {
  const updatedAtMs = Date.parse(updatedAt);

  if (Number.isNaN(updatedAtMs)) {
    return "aging";
  }

  const ageInDays = Math.floor((Date.now() - updatedAtMs) / DAY_IN_MS);

  if (ageInDays >= 30) {
    return "stale";
  }

  if (ageInDays >= 7) {
    return "aging";
  }

  return "fresh";
}

export function formatFreshnessLabel(status: SourceFreshnessStatus) {
  switch (status) {
    case "fresh":
      return "最近更新";
    case "aging":
      return "需要复核";
    case "stale":
      return "内容偏旧";
    default:
      return "待确认";
  }
}

export function formatTrustLevelLabel(level: SourceGovernance["trustLevel"]) {
  switch (level) {
    case "high":
      return "高可信";
    case "medium":
      return "中可信";
    case "low":
      return "低可信";
    default:
      return "待确认";
  }
}

export function formatReviewStatusLabel(status: SourceGovernance["reviewStatus"]) {
  switch (status) {
    case "verified":
      return "已进入问答链路";
    case "needs_review":
      return "建议人工复核";
    case "blocked":
      return "已被门控隔离";
    default:
      return "待处理";
  }
}

function buildOwnerLabel(kind: SourceDocumentKind, sourceUrl?: string) {
  if (kind === "url" && sourceUrl) {
    try {
      return `待认领 · ${new URL(sourceUrl).hostname}`;
    } catch {
      return "待认领 · 网页来源";
    }
  }

  if (kind === "pdf") {
    return "待认领 · PDF 来源";
  }

  return "待认领 · 上传来源";
}

export function inferSourceGovernance(args: {
  kind: SourceDocumentKind;
  contentQuality: SourceContentQuality;
  extractionMode: string;
  retrievalGate: "eligible" | "blocked";
  sourceUrl?: string;
}): SourceGovernance {
  if (args.kind === "pdf" || args.extractionMode === "pdf-unparsed") {
    return {
      ownerLabel: buildOwnerLabel(args.kind, args.sourceUrl),
      trustLevel: "low",
      reviewStatus: "blocked",
      coverageLabel: "已存储但未解析正文",
      reviewSummary: "当前版本会保留 PDF 记录，但不会把它纳入可回答证据。",
    };
  }

  if (args.retrievalGate === "blocked" || args.contentQuality === "empty") {
    return {
      ownerLabel: buildOwnerLabel(args.kind, args.sourceUrl),
      trustLevel: "low",
      reviewStatus: "blocked",
      coverageLabel: "未进入检索链路",
      reviewSummary: "正文不足或抽取失败，当前已被检索门控隔离。",
    };
  }

  if (args.extractionMode === "body-fallback") {
    return {
      ownerLabel: buildOwnerLabel(args.kind, args.sourceUrl),
      trustLevel: "low",
      reviewStatus: "needs_review",
      coverageLabel: "可检索但噪声偏高",
      reviewSummary: "当前回退到了整页 body 抽取，建议人工确认正文质量。",
    };
  }

  if (args.contentQuality === "thin") {
    return {
      ownerLabel: buildOwnerLabel(args.kind, args.sourceUrl),
      trustLevel: "medium",
      reviewStatus: "needs_review",
      coverageLabel: "可检索但覆盖偏薄",
      reviewSummary: "已经进入问答链路，但正文较薄，适合做线索而不是强证据。",
    };
  }

  return {
    ownerLabel: buildOwnerLabel(args.kind, args.sourceUrl),
    trustLevel: "high",
    reviewStatus: "verified",
    coverageLabel: "已进入问答链路",
    reviewSummary: "正文完整度较好，当前可以作为 grounded answer 的主证据候选。",
  };
}

export function getSourceGovernance(args: {
  diagnostics: SourceDiagnostics;
  kind: SourceDocumentKind;
  sourceUrl?: string;
}) {
  return (
    args.diagnostics.governance ??
    inferSourceGovernance({
      kind: args.kind,
      contentQuality: args.diagnostics.contentQuality,
      extractionMode: args.diagnostics.extractionMode,
      retrievalGate: args.diagnostics.retrievalGate,
      sourceUrl: args.sourceUrl,
    })
  );
}
