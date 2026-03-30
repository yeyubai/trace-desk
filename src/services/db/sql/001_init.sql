CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  retrieval_readiness TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_document (
  id UUID PRIMARY KEY,
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('pdf', 'markdown', 'txt', 'url')),
  status TEXT NOT NULL CHECK (status IN ('available', 'indexing', 'failed')),
  retrieval_status TEXT NOT NULL CHECK (retrieval_status IN ('retrievable', 'stored_only', 'unavailable')) DEFAULT 'unavailable',
  retrieval_detail TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  source_url TEXT,
  object_key TEXT,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  citation_label TEXT NOT NULL,
  diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
  duplicate_of_source_id UUID REFERENCES source_document(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_chunk (
  id UUID PRIMARY KEY,
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES source_document(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_chunk_knowledge_base_id
  ON source_chunk (knowledge_base_id);

CREATE INDEX IF NOT EXISTS idx_source_chunk_embedding_cosine
  ON source_chunk USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_source_chunk_keywords_gin
  ON source_chunk USING GIN (keywords);

CREATE TABLE IF NOT EXISTS chat_session (
  id UUID PRIMARY KEY,
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model_tier TEXT NOT NULL CHECK (model_tier IN ('fast', 'quality')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_message (
  id UUID PRIMARY KEY,
  chat_session_id UUID NOT NULL REFERENCES chat_session(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  parts JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_citation (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_message(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES source_document(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES source_chunk(id) ON DELETE SET NULL,
  citation_label TEXT NOT NULL,
  excerpt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS response_feedback (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_message(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('thumbs_up', 'thumbs_down')),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
