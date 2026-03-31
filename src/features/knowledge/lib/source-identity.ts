import type { SourceDocumentSummary } from "@/features/knowledge/types/knowledge";

type SourceIdentityInput = Pick<
  SourceDocumentSummary,
  "kind" | "title" | "url" | "duplicateOf"
>;

function normalizeUrlIdentity(url: string) {
  try {
    const parsed = new URL(url);
    const pathname =
      parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, "") : parsed.pathname;
    const search = parsed.searchParams.toString();

    return `url:${parsed.hostname.toLowerCase()}${pathname.toLowerCase()}${
      search ? `?${search}` : ""
    }`;
  } catch {
    return `url:${url.trim().toLowerCase()}`;
  }
}

export function normalizeSourceIdentity(source: SourceIdentityInput) {
  if (source.url) {
    return normalizeUrlIdentity(source.url);
  }

  return `file:${source.kind}:${source.title.trim().toLowerCase()}`;
}

export function resolveCanonicalSourceId(source: SourceIdentityInput & { id: string }) {
  return source.duplicateOf?.sourceId ?? source.id;
}
