# RAG Evaluation

Minimal regression harness for trace-desk's retrieval + citation flow.

## Files
- `golden-set.jsonl`: one JSONL entry per evaluation case. Each case drives a specific scenario and declares the expected signal for hit/miss/citation/low-quality.
- `scripts/rag-eval.mjs`: a Node script that reads the golden set, checks hit/miss/citation/blocked-source behavior against `mock-state.fixture.json`, and emits a pass/fail verdict per case.

## Running

```bash
npm run eval:rag
```

The script exits with `0` when all cases pass, `1` otherwise.
