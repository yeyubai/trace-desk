#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const datasetPath = path.resolve("specs", "rag-eval", "golden-set.jsonl");
const statePath = path.resolve("specs", "rag-eval", "mock-state.fixture.json");

if (!fs.existsSync(datasetPath) || !fs.existsSync(statePath)) {
  console.error("Missing dataset or mock-state fixture.");
  process.exit(1);
}

const dataset = fs
  .readFileSync(datasetPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
const sources = state.sources;
const chunks = state.sourceChunks;
const sourcesById = new Map(sources.map((source) => [source.id, source]));

function extractQueryTerms(query) {
  const normalized = query.toLowerCase();
  const terms = new Set();
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

function scoreChunk(query, keywords, content) {
  const normalizedQuery = query.toLowerCase();
  const normalizedContent = content.toLowerCase();
  const queryTerms = extractQueryTerms(normalizedQuery);
  let lexicalScore = 0;

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      lexicalScore += 3;
    }
  }

  for (const term of queryTerms) {
    if (term.length >= 2 && normalizedContent.includes(term)) {
      lexicalScore += 1;
    }
  }

  if (normalizedContent.includes(normalizedQuery)) {
    lexicalScore += 2;
  }

  return lexicalScore;
}

function retrieveMatches(query, knowledgeBaseId) {
  const eligibleSources = new Map(
    sources
      .filter(
        (source) =>
          source.knowledgeBaseId === knowledgeBaseId &&
          source.retrievalStatus === "retrievable" &&
          source.diagnostics.retrievalGate === "eligible",
      )
      .map((source) => [source.id, source]),
  );

  return chunks
    .filter((chunk) => chunk.knowledgeBaseId === knowledgeBaseId)
    .flatMap((chunk) => {
      const source = eligibleSources.get(chunk.sourceId);

      if (!source) {
        return [];
      }

      const lexicalScore = scoreChunk(query, chunk.keywords ?? [], chunk.content);

      return lexicalScore > 0
        ? [
            {
              chunkId: chunk.id,
              sourceId: chunk.sourceId,
              score: lexicalScore,
            },
          ]
        : [];
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

function evaluateCase(entry) {
  const matches = retrieveMatches(entry.question, entry.knowledgeBaseId);
  const matchedSources = matches.map((match) => sourcesById.get(match.sourceId)).filter(Boolean);
  let passed = true;
  const reasons = [];

  switch (entry.type) {
    case "hit":
      if (matches.length === 0) {
        passed = false;
        reasons.push("no matches returned");
      } else if (!matchedSources.some((source) => source.title === entry.expectedSourceTitle)) {
        passed = false;
        reasons.push("expected source title missing");
      }
      break;
    case "citation":
      if (!matchedSources.some((source) => source.citationLabel === entry.expectedCitationLabel)) {
        passed = false;
        reasons.push("expected citation label missing");
      }
      break;
    case "miss":
      if (matches.length > 0) {
        passed = false;
        reasons.push("unexpected retrieval hit");
      }
      break;
    case "blocked":
      if (matches.some((match) => match.sourceId === entry.blockedSourceId)) {
        passed = false;
        reasons.push("blocked low-quality source still retrieved");
      }

      if (!sourcesById.get(entry.blockedSourceId)?.diagnostics?.retrievalGateReason) {
        passed = false;
        reasons.push("blocked source missing retrieval gate reason");
      }
      break;
    default:
      passed = false;
      reasons.push(`unknown case type ${entry.type}`);
  }

  return {
    entry,
    matches,
    passed,
    reasons,
  };
}

function logResult(result) {
  const { entry, matches, passed, reasons } = result;
  console.log(`Case ${entry.id}: ${passed ? "PASS" : "FAIL"}`);
  console.log(`  query: ${entry.question}`);
  console.log(
    `  matches: ${matches.map((match) => `${match.sourceId} (${match.score})`).join(", ") || "none"}`,
  );
  if (reasons.length > 0) {
    console.log(`  reasons: ${reasons.join(" ; ")}`);
  }
  console.log();
}

let passCount = 0;

for (const entry of dataset) {
  const result = evaluateCase(entry);
  logResult(result);
  if (result.passed) {
    passCount += 1;
  }
}

console.log(`Summary: ${passCount}/${dataset.length} cases passed`);
process.exit(passCount === dataset.length ? 0 : 1);
