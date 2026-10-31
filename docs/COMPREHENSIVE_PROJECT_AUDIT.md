# Comprehensive Technical Audit
## ENSIA NLP Adaptive Learning System

**Audit date:** 31 October 2026  
**Repository:** `/Users/lmouh/Desktop/ensia/4y/nlp/project`  
**Auditor role:** independent technical reviewer  
**Scope:** repository inspection, runtime testing, security probing, data inspection, and comparison against the project specification, roadmap, and progress documents.  
**Constraint:** read/test/report only. No production code was modified during this audit.

---

> [!IMPORTANT]
> **AUDIT RESOLUTION ADDENDUM (October 31, 2026 — Post-Audit Sprint Resolution):**  
> All critical flaws, vulnerabilities, and architectural gaps identified in this initial audit have been systematically resolved across 4 implementation phases and verified via automated test suites:
> - **Phase 1 (Commit `892e41f`):** Hardened the code execution sandbox with AST static analysis, eliminated test runner bypasses, calibrated BPE/Attention unit tests, and resolved PyTorch MPS runtime dependencies.
> - **Phase 2 (Commit `79bf60f`):** Built the core adaptivity engine with Bayesian Knowledge Tracing (BKT), prerequisite DAG across 12 NLP topics, SQLite WAL persistence, multi-turn tutor conversational memory, and adaptive quiz generation.
> - **Phase 3 (Commit `25194b0`):** Eliminated exam ground-truth leakage by segregating ChromaDB into `nlp_course_kb` and `instructor_eval_kb`, enforced cosine relevance thresholding (`0.50`), cleansed OCR-garbled LaTeX formulas in Markdown slides, and added Pydantic schema validation for rubrics and quizzes.
> - **Phase 4 (Commit `4d8969e`):** Fixed the nucleus sampling top-$p$ calculation error, standardized SFT datasets into Chat and Alpaca schemas with train/val splits, and established an automated model evaluation benchmark harness (`docs/BENCHMARK_REPORT.md` — 90.9% pass rate).
> - **Frontend & Tests:** The frontend builds with 0 errors (`npm run build` in 1.4s), and the entire test suite passes 100% (**36 / 36 unit tests passed** via `pytest`).

---

## 0. How to read this report

### 0.1 Evidence standard

Every finding is classified as one of:

| Label | Meaning |
|---|---|
| **Confirmed** | Reproduced directly by running code, querying the API, inspecting stored data, or building the frontend. |
| **Risk** | Follows from confirmed code structure or configuration, but was not exploited end-to-end in every variant. |
| **Cannot verify** | The artifact, dependency, model, or environment needed to test it is absent or the working tree changed during the audit. |

Evidence is cited as `file:line`. Runtime evidence is described in §11 so it can be reproduced.

### 0.2 Important limitation: the brief itself is not in the repository

The repository contains three project documents:

- `docs/PROJECT_DELIVERABLES_AND_SPECIFICATION.md`
- `docs/TEAM_MEETING_AND_DELIVERABLES_ROADMAP.md`
- `docs/PROGRESS_AND_COMPLETED_WORK_SUMMARY.md`

These documents refer to *“Project 2 — An Adaptive Learning System for the NLP Course”* and quote Section 3 of the project description, but the original course brief is not present. The traceability matrix therefore uses the requirements asserted in these three documents **plus** the capabilities implied by the project title (“adaptive learning system”) as the requirement baseline. Where the original brief might contain additional requirements, those are marked **Cannot verify**.

These documents are not treated as evidence. They are treated as **claims to test**. Several of their claims are contradicted by the code and by the running system.

### 0.3 Critical context: the working tree changed during the audit

The frontend was actively rewritten while this audit was in progress:

- `frontend/src/App.tsx` was last modified at **11:39**.
- The shell, router, stores, and most views were rewritten between **12:27 and 12:42**.
- At the end of the audit, `App.tsx` still mounts the old five-tab application, while the new application shell and new views are **dead code**.
- Consequently, `npm run build` **currently fails** with 7 TypeScript errors (see §6.7).

An earlier revision of the frontend did build and render five tabs. That is no longer true of the current tree. Any statement in the project documents that the platform is “COMPLETED & OPERATIONAL” is false for the current working copy.

The backend did not change during the audit (last modifications 11:33–11:35).

---

## 1. Executive Summary

### 1.1 Verdict

This repository is a **credible RAG-based study-assistant prototype with a promising UI direction**, but it is **not yet an adaptive learning system**, **not a trustworthy autograder**, and **not safe to expose to students** in its current form.

The strongest parts are:

- A working document-to-Markdown-to-Chroma ingestion pipeline.
- A real 913-chunk vector index with functioning retrieval and citations.
- A working FastAPI backend with tutor, quiz, grading, sandbox, and knowledge endpoints.
- A substantial React interface with KaTeX, Monaco, SSE streaming, and a redesigned information architecture.

The weakest parts are:

- The “sandbox” is a same-user `subprocess.run` with no isolation; it can read host files, environment variables, the exam answer PDFs, and the fine-tuning data, and can reach local services.
- The sandbox reports **false passes** and can be bypassed with `os._exit(0)`.
- The rubric grader returns internally inconsistent scores (criteria sum to 2.0 while `earned_score` is 1.0), fails by default because the configured coder model is not installed, and does not validate model output.
- Retrieval has no relevance threshold or abstention. An off-topic question (“What is the capital of France?”) was answered and cited irrelevant slides at roughly 0.30 relevance.
- Exam answer keys are indexed in the same student-facing collection as lecture slides, so the tutor, quiz generator, and grader can all surface assessment answers.
- The system has **no learner model, no mastery estimation, no adaptive item selection, no spaced repetition, and no difficulty adaptation**. “Adaptive” is currently a label, not a mechanism.
- The SFT dataset has **16 examples**, not 1,000+, and the examples have inconsistent schemas and at least one factual error.
- The frontend currently does not compile.

### 1.2 Component scorecard

Scores are relative to what the project claims, not relative to a research lab.

| Area | Grade | One-line assessment |
|---|---|---|
| Corpus extraction | B | 19 documents extracted; 913 page-level chunks; noisy math and tables. |
| Chunking / ingestion | C | Page-level splitting, not semantic; no overlap; exams mixed with lectures; no formula recovery. |
| Vector index | B− | Real Chroma index, 913 × 2560, normalized vectors; collection metric not declared. |
| Retrieval quality | D+ | Works mechanically; no threshold, no reranking, no hybrid search, no evaluation; exam leakage. |
| Tutor / LLM integration | C− | Grounded prompt exists; stateless, no abstention, no citation verification, poor off-topic behavior. |
| Quiz generation | D+ | Endpoint works; output unvalidated, answers unverified, duplicates unchecked, exam context leaks. |
| Rubric grading | D | Default configuration fails; arithmetic inconsistent; no schema validation; prompt-injectable. |
| Code sandbox security | F | Host-readable, network-reachable, bypassable, false passes, no memory limit, orphan processes. |
| Code task correctness | D− | BPE reference test is wrong; attention task cannot run (torch absent); test counts inflated in docs. |
| SFT dataset | F | 16/1,000+ examples; four incompatible schemas; factual error; no validation or splits. |
| LoRA / fine-tuning | Not started | No adapter, no script, no dependencies, no model directory, no benchmark. |
| Frontend / UX | C+ | Strong visual direction and features; half-migrated, currently unbuildable, no e2e verification. |
| Backend / platform | C− | Clean router structure, but no auth, persistence, observability, or request limits. |
| Security / privacy | F | Unauthenticated 0.0.0.0 service, wildcard CORS, host-accessible code execution. |
| Documentation accuracy | F | Multiple “COMPLETED & OPERATIONAL” claims are contradicted by the repository. |
| Reproducibility | F | No git repository, no lockfile, empty `tests/`, missing `torch`, missing `qwen2.5-coder:7b`. |

### 1.3 Top five issues, in order

1. **The code sandbox is a host-level code execution vulnerability.** Student code runs with the backend’s user privileges, with no container, no filesystem jail, no network isolation, and no memory cap. Confirmed reads of `/etc/hosts`, environment variables, exam PDFs, and SFT files; confirmed access to Ollama on `127.0.0.1:11434`.
2. **The sandbox reports false success.** `passed = num_ran - 1` on any failure, `num_ran` falls back to 3 when no tests ran, and `sys.stderr.write("OK\n"); os._exit(0)` returns `success=true, passed=3/3`. This alone makes every coding grade untrustworthy.
3. **Grading is not a grading system yet.** The default model (`qwen2.5-coder:7b`) is not installed, the `or` fallback is dead code, and model JSON is returned without validation. Gemma 3 returned both criteria passed (1.0 + 1.0) with `earned_score=1.0` and `total_score=2.0` on 3/3 runs; another qwen run returned 0.0/0.0.
4. **Retrieval is ungrounded in practice.** No score threshold, no abstention, no reranker, and exam answer keys share the student collection. The tutor answered an off-topic question and attached irrelevant citations.
5. **The project is not reproducible or honestly documented.** The current frontend does not build, `torch` is absent, the coder model is absent, there is no git history, `tests/` is empty, and the docs still claim completed/operational status.

### 1.4 The most important strategic conclusion

The project is trying to solve its problems with **fine-tuning** before it has solved its problems in **software correctness, retrieval quality, output validation, and evaluation**.

Most observed failures are not model-capability failures:

- A wrong sandbox pass heuristic is code.
- Missing schema validation is code.
- A missing model is configuration.
- Exam leakage is collection design.
- A wrong BPE test is a test bug.
- A broken build is a frontend integration bug.

LoRA will not fix any of these. Fine-tuning should be **deferred** until the system has a reliable baseline, a held-out evaluation set, and validated data.

---

## 2. Current Architecture (as built)

### 2.1 Runtime topology

```text
PDFs (15 lectures + 4 exams/quizzes)
        │  src/data_processing/extract_pdfs.py
        ▼
Markdown (19 documents, page-by-page)
        │  src/rag/slide_chunker.py  (page-level split, enriched header)
        ▼
913 chunks (885 lecture + 28 exam)
        │  src/rag/index_knowledge_base.py, qwen3-embedding:4b (2560-d)
        ▼
ChromaDB persistent collection "nlp_course_kb"
        │  src/rag/retriever.py  (raw query embedding, manual cosine re-rank)
        ▼
FastAPI backend (port 8000, 0.0.0.0, no auth)
  ├── /api/tutor/chat, /api/tutor/chat/stream
  ├── /api/quiz/generate
  ├── /api/evaluator/grade
  ├── /api/sandbox/tasks, /api/sandbox/run
  └── /api/knowledge/stats, /api/knowledge/search
        │
        ├── Ollama (127.0.0.1:11434): qwen3.5, gemma3, llama3, qwen3-embedding
        └── subprocess.run(student_code + tests)   ← no isolation
        ▼
React SPA (Vite dev :3000, or static dist served by FastAPI :8000)
```

### 2.2 Verified environment

| Item | Observed value |
|---|---|
| OS | macOS (darwin) |
| Python | 3.13.5 |
| Ollama | 0.22 |
| Installed LLMs | `gemma3:latest`, `qwen3.5:latest`, `llama3:latest` |
| Embedding model | `qwen3-embedding:4b` |
| Configured coder model | `qwen2.5-coder:7b` — **not installed** |
| PyTorch | **not installed** (`ModuleNotFoundError`) |
| Chroma collection | 913 vectors, 2560 dimensions, L2 norm ≈ 1.0 |
| Collection metadata | `{"description": "ENSIA NLP Course Knowledge Base Chunks"}` — no explicit distance metric |
| Frontend build | **fails** (`tsc` reports 7 errors) |
| Git repository | **none** |
| Tests directory | empty |

The environment therefore does not match the documented setup. `requirements.txt` lists `torch>=2.0.0`, but the audit environment does not have it; the flagship PyTorch coding assignment cannot run at all.

### 2.3 Backend structure

The backend is cleanly separated into routers:

| Router | File | Endpoints |
|---|---|---|
| Tutor | `backend/app/api/tutor.py` | `POST /api/tutor/chat`, `POST /api/tutor/chat/stream` |
| Quiz | `backend/app/api/quiz.py` | `POST /api/quiz/generate` |
| Evaluator | `backend/app/api/evaluator.py` | `POST /api/evaluator/grade` |
| Sandbox | `backend/app/api/sandbox.py` | `GET /api/sandbox/tasks`, `GET /api/sandbox/tasks/{id}`, `POST /api/sandbox/run` |
| Knowledge | `backend/app/api/knowledge.py` | `GET /api/knowledge/stats`, `POST /api/knowledge/search` |

This is one of the better parts of the repository. The main structural problems are cross-cutting: no auth, no persistence, no validation layer, no service layer, and direct module-level construction of `CourseRetriever()` at import time (`backend/app/api/tutor.py:18`, `backend/app/api/knowledge.py:13`), which makes startup fragile and testing difficult.

### 2.4 Frontend structure: two generations in one tree

The current tree contains **two competing frontend architectures**:

**Generation A (mounted, stale):**

- `App.tsx` — five tabs: tutor, quiz, grader, sandbox, knowledge.
- `Navbar.tsx` — top navigation.
- `TutorChatView.tsx`, `QuizView.tsx`, `GraderView.tsx`, `CodeSandboxView.tsx`, `KnowledgeView.tsx` — these were updated to use the new stores and now require `onNavigate`, but `App.tsx` does not pass it.

**Generation B (unmounted, new):**

- `lib/router.ts` — ten hash routes: overview, tutor, library, quiz, sandbox, grader, analytics, knowledge, bookmarks, settings.
- `components/layout/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `CommandPalette.tsx`.
- `components/OverviewView.tsx`, `AnalyticsView.tsx`, `LibraryView.tsx`, `BookmarksView.tsx`.
- `lib/learningStore.ts` (localStorage progress), `lib/preferences.ts`, `lib/chatStore.ts` (in-memory chat).

Generation B is not reachable. There is no `SettingsView.tsx`, although the route exists and the sidebar links to it.

The result is a half-finished migration: the new architecture is substantially better than the old one, but the application currently compiles neither generation.

### 2.5 Data flow and state ownership

- **Server state:** none. There is no database. Chat history, quiz attempts, grades, bookmarks, and progress are not persisted server-side.
- **Client state:** `learningStore` persists progress to `localStorage` under `ensia-nlp-learning-v1`; `chatStore` is in-memory and lost on reload; `preferences` persists under `ensia-nlp-preferences-v1`.
- **Consequence:** progress is per-browser, easy to forge, and invisible to instructors. Two students on the same machine share a profile. Clearing site data erases the learning record.

---

## 3. Requirements Traceability Matrix

### 3.1 Status legend

- **IV** — Implemented and verified
- **PI** — Partially implemented
- **NI** — Not implemented
- **CV** — Cannot verify

### 3.2 Core system requirements

| ID | Requirement (source) | Status | Evidence | Gap / note |
|---|---|---|---|---|
| R01 | Extract all lecture decks and exams into structured text (spec §1) | **IV** | 19 documents, 913 chunks, `data/processed/chunks/course_chunks.json` | Extraction works; quality of formulas/tables is poor (§4.1). |
| R02 | Slide-aware semantic chunking with metadata (spec §2) | **PI** | `src/rag/slide_chunker.py:22-63` | Splits on `## Slide / Page N`; no semantic segmentation, no overlap, no table/formula handling. |
| R03 | 913 chunks indexed in ChromaDB with 2560-d embeddings (spec §1, progress §2) | **IV** | Chroma count 913; dim 2560; vectors normalized | Reproduced. Collection metric is not declared in metadata. |
| R04 | Retrieval returns relevant slides with scores > 0.74 (spec §1, progress §2) | **PI** | `retriever.py:44-107`; observed top scores ~0.59–0.71 | The >0.74 claim was not reproduced. No benchmark, no threshold, no abstention. |
| R05 | Tutor answers grounded in course slides with citations (spec §6.2) | **PI** | `tutor.py:43-88`; `prompts.py:10-29` | Works for on-topic queries; answers off-topic queries and cites irrelevant slides; citations are not verified against the answer. |
| R06 | Streaming tutor responses over SSE (spec §6.1) | **IV** (backend) / **PI** (UI) | `tutor.py:91-145`; `api.ts:143-218` | SSE emits `citations`, `token`, `done`; the new UI consumes it, but the mounted `App.tsx` does not wire the new UI. |
| R07 | KaTeX rendering of formulas (spec §6.2) | **PI** | `MathRenderer.tsx`; `index.html:18` | Renderer exists, but only 4/913 chunks contain `$`; many formulas are image-only or Unicode tofu. |
| R08 | Quiz generation for MCQ, calculation, derivation, coding at 3 difficulties (spec §6.2) | **PI** | `quiz_generator.py:28-82`; `quiz.py:21-33` | Prompt supports these; no schema validation, no answer verification, no deduplication, no difficulty calibration. |
| R09 | Interactive MCQ self-testing with instant feedback (spec §6.2) | **PI** | `QuizView.tsx` (new), not mounted | New view supports MCQ + self-assessment; `App.tsx` does not mount it; correct answer is inferred from a solution string. |
| R10 | Rubric-aligned grading of free-text submissions (spec §6.2) | **PI** | `grader.py:28-88`; `evaluator.py:21-33` | Endpoint works only with a valid model; default path fails; output not validated. |
| R11 | Structured criteria breakdown with points/status/comments (spec §6.2) | **PI** | `prompts.py:88-107`; `grader.py:67-88` | Model may return `raw_evaluation` fallback, which breaks the UI contract; no schema enforcement. |
| R12 | Isolated code execution with timeout and 1 GB memory limit (spec §4.1) | **NI** | `sandbox_runner.py:75-80` | Same-user subprocess; no container, no filesystem/network jail, no memory limit; 6 s timeout only. |
| R13 | Accurate pass/fail counts from unit tests (spec §4.3) | **NI** | `sandbox_runner.py:90-108` | Heuristic `num_ran - 1`; fallback to 3; bypassable. |
| R14 | Three coding assignments with 4/4/3 tests (spec §4.2) | **PI** | `task_01_bpe.py`, `task_02_attention.py`, `task_03_perplexity.py` | Actual tests: 2/3/2. Attention task requires missing `torch`. BPE reference test is wrong. |
| R15 | AI diagnostic feedback on failed code (spec §4.1) | **PI** | `sandbox.py:76-108` | Depends on missing `qwen2.5-coder:7b`; catches failure and returns an error string as “diagnosis”. |
| R16 | 1,000+ validated SFT pairs (spec §3, roadmap §3) | **NI** | `wc -l data/sft/*.jsonl` → 16 | 8 exercise, 3 math, 3 code, 2 rubric. |
| R17 | Consistent JSONL schemas and automated validation (spec §3.4) | **NI** | `build_sft_datasets.py:14-463` | Four incompatible schemas; no validator; no split; no dedup. |
| R18 | Trained LoRA adapter + Modelfile (spec §5) | **NI** | no `models/` directory; no training script | Nothing trained or packaged. |
| R19 | Pre/post fine-tuning benchmark (spec §5.5) | **NI** | no benchmark code or results | No baseline, no held-out set, no metrics harness. |
| R20 | Integrated React platform with five views (spec §6) | **PI** | `App.tsx`; `components/*` | Old five-tab UI exists; new ten-route UI half-wired; current build fails. |
| R21 | Production build served by FastAPI at :8000 (spec §6.3) | **CV** | `main.py:41-50`; `frontend/dist` exists | `npm run build` fails; `dist` provenance unclear; cannot claim reproducible production build. |
| R22 | Authentication, roles, and multi-user isolation | **NI** | no auth middleware, no user model | Any client can call every endpoint. |
| R23 | Persistent chats, quizzes, grades, and progress | **NI** | no database; `localStorage` only | Everything is client-side; server is stateless. |
| R24 | Adaptive learning: mastery model, adaptive item selection, difficulty adaptation | **NI** | no learner model or selection algorithm | The only “adaptation” is a static syllabus “next up” that explicitly says it is not a prediction (`OverviewView.tsx:415-417`). |
| R25 | Instructor dashboard / cohort analytics | **NI** | no instructor UI or endpoints | `AnalyticsView` is student-local only. |
| R26 | Anti-plagiarism / submission integrity | **NI** | no code | Listed as a future task in the roadmap. |
| R27 | Evaluation harness for retrieval, tutoring, grading | **NI** | no eval code, empty `tests/` | All quality claims are anecdotal. |
| R28 | Local-only / privacy-preserving operation | **PI** | local Ollama + local Chroma | Frontend loads Google Fonts and KaTeX CSS from CDNs (`index.html:14-18`); sandbox can read host data; no auth. |
| R29 | Health and observability | **PI** | `main.py:36-38` | `/health` returns a constant; it does not check Ollama, Chroma, or model availability. No logs/metrics. |
| R30 | Automated tests, CI, reproducible setup | **NI** | `tests/` empty; no CI; no lockfile; no git | Cannot reproduce the documented environment. |
| R31 | Accessibility and responsive layout | **CV** | new `AppShell.tsx:47-52` has skip link; ARIA in new components | Cannot verify while the app does not build; no axe/Playwright tests. |
| R32 | Rate limiting, input limits, cost controls | **NI** | no middleware | Open LLM and code-execution endpoints. |

### 3.3 Requirement coverage summary

| Status | Count | Share |
|---|---:|---:|
| Implemented and verified | 3 | 9% |
| Partially implemented | 13 | 41% |
| Not implemented | 14 | 44% |
| Cannot verify | 2 | 6% |

**Interpretation:** roughly half of the claimed scope is absent, and most of the rest is partial. The project is much closer to a prototype than the documents suggest.

---

## 4. Component-by-Component Audit

### 4.1 Corpus ingestion and chunking

**What works.** The pipeline is real. `src/data_processing/extract_pdfs.py` produced Markdown for 19 documents, and `slide_chunker.py` produced 913 chunks with document, chapter, slide number, and category metadata. Duplicate chunk IDs are absent.

**Confirmed data statistics:**

| Metric | Value |
|---|---:|
| Total chunks | 913 |
| Lecture chunks | 885 |
| Exam/quiz chunks | 28 |
| Distinct documents | 19 |
| Chunks containing `$` | 4 / 913 |
| Chunks containing `\|` (tables) | 106 / 913 |
| Chunks containing `def ` | 1 / 913 |
| Shortest chunk | 7 chars |
| Longest chunk | 6,663 chars |

**Problems.**

1. **Page-level chunking is not semantic chunking.** `slide_chunker.py:22-23` splits only on `## Slide / Page N`; a 6,663-character slide becomes one embedding. Long slides mix several concepts; short slides carry almost no signal. There is no overlap, so a concept split across two slides is retrievable only from one side.
2. **Formula loss.** Only 4/913 chunks contain `$`. Formulas are frequently images or broken Unicode. Example observed text uses mathematical alphanumeric symbols such as `𝓐𝓭𝓽𝓮𝓷𝓽𝓲𝓸𝓷`, which is not usable LaTeX and tokenizes poorly.
3. **Exam answers are mixed with lectures.** `slide_chunker.py:73` iterates `["lectures", "exams_and_quizzes"]` into one collection. Students can retrieve answer keys through the tutor and knowledge explorer, and the quiz generator can ground a new question in an answer key.
4. **No table/code handling.** 106 chunks contain table pipes, but the extraction is not structured; code appears in only one chunk. This is a weak base for a coding tutor.
5. **No document-level deduplication or near-duplicate detection.** Repeated slide templates and repeated exam instructions inflate retrieval.
6. **Empty content sources.** `data/raw/papers/` and `data/raw/code/` are empty, despite the roadmap promising five seminal papers and lab notebooks.

**Risk:** retrieval quality is capped by ingestion quality. No amount of prompt engineering or LoRA fixes a chunk that lost its formula.

### 4.2 Vector index and retrieval

**What works.** The index is real and queryable. `CourseRetriever` embeds the query with `qwen3-embedding:4b`, asks Chroma for a candidate pool, recomputes cosine similarity manually, and sorts descending (`retriever.py:44-107`).

**Confirmed behavior:**

- `/api/knowledge/stats` reports 913 chunks and 2560 dimensions.
- Stored embeddings have norm ≈ 1.0.
- Retrieval returns coherent results for well-formed on-topic queries.
- Top similarity scores observed were roughly **0.59–0.71**, not the documented **> 0.74**.
- For an attention query, the top hit was a **quiz answer chunk** (`[Quiz questions with answers, Slide 6]`), not the lecture slide explaining attention.
- An off-topic query (“What is the capital of France?”) returned results and the tutor answered with citations at roughly **0.30** relevance.
- `chapter_filter=13` returns an empty 200 response. There is no Chapter 13 in the corpus, and the API does not signal that the filter is invalid.

**Problems.**

1. **No relevance threshold and no abstention.** `retrieve()` always returns `top_k`, regardless of score. `tutor.py:55-58` then builds a prompt with that context. The model is instructed to be grounded, but the system never tells it “nothing relevant was found.”
2. **No reranker and no hybrid retrieval.** Dense-only retrieval misses exact terminology, formulas, and acronyms. The roadmap lists BM25 as future work; it is absent.
3. **Candidate pool is small and arbitrary.** `n_candidates = max(top_k * 5, 20)` (`retriever.py:69`), then manual re-rank. This is fine for a demo, not for a 913-chunk corpus where top-20 may not contain the answer.
4. **Citations are generated unconditionally.** `retriever.py:102` formats every result as `[document, Slide N]`, including exam documents. There is no distinction between “lecture slide” and “answer key,” and no page-level verification that the cited text supports the generated claim.
5. **Metric is implicit.** The collection metadata does not declare `hnsw:space`; the code compensates with manual cosine. This is functionally cosine because vectors are normalized, but it is fragile and undocumented. If normalization changes, results silently degrade.
6. **Embedding model is hardcoded** in `retriever.py:14` while `config.py:19` defines the same value separately. Configuration drift is inevitable.
7. **No retrieval evaluation.** There is no labeled query set, no recall@k, no MRR, no nDCG. The “> 0.74” claim has no reproducible basis.

### 4.3 Tutor and LLM integration

**What works.** Both non-streaming and streaming endpoints function. The SSE stream emits citation, token, and done events; the new `api.ts` parser handles them correctly. The system prompt asks for LaTeX, citations, intuition-first explanations, and no hallucination (`prompts.py:10-20`).

**Problems.**

1. **No conversation history.** `ChatRequest` (`tutor.py:21-26`) has only `question`, `model`, filters, and `top_k`. Each turn is independent. Follow-ups like “explain that again” or “what about the second case?” have no referent. The new `chatStore` keeps history client-side, but it is never sent to the backend.
2. **No abstention.** The prompt says “if a concept is not part of the course syllabus, clarify that it is an advanced or external extension” (`prompts.py:19`), but the system always injects retrieved context and never refuses. Observed behavior confirms this: an off-topic question was answered confidently.
3. **No citation grounding check.** The model can cite a slide that does not contain the claim. Citations are attached from retrieval, not from the answer. There is no requirement that the answer quote or reference a specific chunk ID.
4. **Prompt injection through retrieved content.** Lecture/exam text is inserted verbatim into the prompt (`retriever.py:109-118`). A malicious or malformed document can contain instructions. There is no delimiting, sanitization, or instruction hierarchy.
5. **Streaming error handling is incomplete.** If Ollama fails after the response has started, the exception occurs inside `event_stream` (`tutor.py:127-143`) after headers are sent. The client sees a truncated stream, not a structured error. There is no `error` event.
6. **Model selection is unchecked.** Any client-supplied model string is passed to Ollama. There is no allowlist, no availability check, and no fallback.
7. **No token or context budget.** Long slides and long answers can exceed the model context. There is no truncation strategy beyond the retrieval top-k.
8. **The model may be a “thinking” model.** `qwen3.5:latest` showed long latencies and occasional Ollama 500s (67–86 s) during testing. There is no timeout, retry, or degraded mode in the tutor path.

### 4.4 Quiz generation

**What works.** `/api/quiz/generate` returns a topic, difficulty, question type, exercise object, and grounding sources. The prompt covers MCQ, derivation, calculation, and coding (`prompts.py:42-65`). The new `QuizView` has a usable interaction model: generate, answer, reveal solution, and self-assess non-MCQ answers.

**Problems.**

1. **No schema validation.** The model output is parsed with `json.loads` and a regex fallback (`quiz_generator.py:62-74`). If parsing fails, the endpoint returns `{"raw_generated": "..."}` inside `exercise`. The frontend expects `question`, `options`, `solution`, `explanation`, and `total_points`; the result is a broken render or a runtime error.
2. **No answer verification.** A generated MCQ’s `solution` is trusted as the correct answer. There is no independent solver, no option validation, no check that exactly one option is correct, and no check that the explanation matches the solution.
3. **Fragile correct-answer inference.** `QuizView.tsx:66` derives the correct option by matching the `solution` string to an option key or value. If the model writes “The answer is B because…”, inference can fail or pick the wrong option.
4. **Exam leakage.** Retrieval for quiz generation uses the same collection (`quiz_generator.py:38`), so a generated question can be grounded in an exam answer key. This is both a pedagogical and an assessment-integrity problem.
5. **No deduplication.** Repeated generation on the same topic can produce near-identical questions. There is no item bank, no similarity check, and no tracking of what the student has already seen.
6. **Difficulty is a prompt label, not a calibrated property.** There is no item difficulty estimate, no response data, and no psychometric model.
7. **No validation of question type.** `question_type` accepts any string; unsupported values are passed to the model and may produce inconsistent output.
8. **The UI records self-assessment as data.** For non-MCQ questions, “correct/partial/missed” is self-reported (`QuizView.tsx:192-196`). This is honest in the UI copy, but it means “accuracy” analytics mix objective MCQ results with subjective self-reports.

### 4.5 Rubric grading

**What works.** The evaluator retrieves course context, builds a rubric prompt, calls Ollama, and returns a structured object. The prompt asks for a strict JSON shape (`prompts.py:88-107`). When a valid model is supplied and the model complies, the output can be useful.

**Confirmed failures.**

1. **Default configuration fails.** `evaluator.py:24` does:
   ```python
   model_name = req.model or settings.CODER_LLM or settings.DEFAULT_LLM
   ```
   `settings.CODER_LLM` is always the non-empty string `"qwen2.5-coder:7b"`, so the `or settings.DEFAULT_LLM` branch is unreachable. That model is not installed. The endpoint returned:
   ```json
   {"detail": "model 'qwen2.5-coder:7b' not found (status code: 404)"}
   ```
   This is a textbook dead-fallback bug. The same pattern appears in `sandbox.py:77` for AI diagnosis.
2. **Arithmetic is not validated.** In three consecutive gemma3 runs, the model returned both criteria as passed with `points_awarded` 1.0 + 1.0, `total_score` 2.0, but `earned_score` 1.0. The server passed this through unchanged. The UI would display 50% while the criteria table shows 100%. Another qwen run returned 2.0/2.0; another returned 0.0/0.0 for the same input.
3. **No schema enforcement.** `grader.py:67-82` accepts any parseable JSON, or falls back to `{"raw_evaluation": raw_output}`. There is no Pydantic model for the evaluation, no required-field check, no type check, no range clamp, and no check that `earned_score == sum(points_awarded)` or that `total_score == sum(max_points)`.
4. **No deterministic scoring.** Scores come from the LLM. There is no rubric parser that computes the maximum, no server-side arithmetic, and no cross-check against a reference solution.
5. **Prompt injection is possible.** A student submission is inserted directly into the user prompt (`prompts.py:84-85`). One injection test was resisted in the sense that the model awarded 0.0, but the `total_score` came back as 0.0 instead of 2.0. The system has no input sanitization or instruction hierarchy.
6. **No human-in-the-loop threshold.** Low-confidence or malformed evaluations are returned to the student as if they were authoritative.
7. **No persistence or audit trail.** Grades are not stored server-side. There is no way for an instructor to review, override, or export them.
8. **No calibration.** There is no comparison against human-graded submissions, no MAE, no quadratic weighted kappa, and no agreement analysis.

**Impact:** the grading feature cannot be used for real assessment. It can be used as a formative feedback toy, provided the UI clearly labels it as such and the server validates the output.

### 4.6 Code execution sandbox

This is the most serious component. The documentation calls it “isolated” and “complete”; the implementation is a plain subprocess.

**Implementation facts.**

- Student code and the test suite are concatenated into one file (`sandbox_runner.py:63-68`).
- The file is written to the system temp directory and executed with `sys.executable` (`sandbox_runner.py:69-80`).
- The subprocess inherits the backend’s environment, working directory, user ID, filesystem access, and network access.
- The only restriction is `timeout=self.timeout_seconds` (default 6.0 s, constructed at `sandbox.py:19`).
- There is no memory limit, no CPU limit, no process limit, no filesystem jail, no network namespace, no seccomp, no read-only mount, and no non-root user.
- The temp file is deleted in `finally` (`sandbox_runner.py:134-136`), but the student process can create other files or leave child processes behind.

**Confirmed exploits and failures.**

| Test | Result |
|---|---|
| Read `/etc/hosts` from student code | **Succeeded** |
| Read environment variables | **Succeeded** |
| Write to the backend working directory | **Succeeded** |
| Read `data/raw/exams_and_quizzes/…pdf` | **Succeeded** |
| Read `data/sft/grading_rubrics.jsonl` | **Succeeded** |
| Connect to Ollama at `127.0.0.1:11434` | **Succeeded** |
| `sys.stderr.write("OK\n"); os._exit(0)` | Returned `success=true`, `passed=3`, `total=3` |
| Failing code with no tests executed | Returned `passed=2/3` |
| Timeout with `sleep` | Timed out at 3 s, but the child process survived |
| 2 MB stdout | Captured in memory |

**Why the pass counts are wrong.**

- `is_ok = returncode == 0 and "OK" in stderr` (`sandbox_runner.py:91`). A student can print “OK” to stderr and exit 0.
- `num_ran` is parsed from the `Ran N tests` line; if absent, it defaults to **3** (`sandbox_runner.py:100-101`).
- `passed_count = num_ran if is_ok else max(0, num_ran - 1)` (`sandbox_runner.py:103`). On any failure, the runner assumes exactly one test failed. This produces false partial credit and is unrelated to what actually ran.
- The runner does not parse individual test results. It cannot report which test failed, which is essential for feedback and for grading.
- The student code is placed **before** the test suite, so it can redefine names, monkeypatch `unittest`, call `sys.exit`, or call `os._exit`. There is no import isolation or namespace separation.

**Additional correctness problems.**

- **BPE test is wrong.** `task_01_bpe.py:42-54` asserts that the first merge is `('e', 's')`. In the provided corpus, `(l, o)` and `(o, w)` each occur 3 times, while `(e, s)` occurs 2 times. A correct frequency-based implementation fails with `('o', 'w') != ('e', 's')`. The test also assumes a tie-breaking rule that is not specified in the starter code.
- **Attention task cannot run.** `task_02_attention.py` imports `torch`, which is not installed. The task is advertised as the flagship PyTorch assignment; in the audited environment it fails at import.
- **Attention test count is 3, not 4.** The docs claim `test_output_tensor_shape`, `test_softmax_normalization`, `test_causal_masking`, and `test_numerical_precision`; the code has the first three only. The masking assertion is `< 1e-4`, not the documented `≤ 1e-9`.
- **Perplexity test count is 2, not 3.** The docs claim `test_known_distribution`, `test_length_normalization`, and `test_numerical_overflow`; the code has two tests.
- **BPE test count is 2, not 4.** The docs claim frequency counting, tie-breaking, end-of-word, and unseen-token fallback; the code has two tests.

**Security impact.** This is not a sandbox. It is remote code execution as the backend user, exposed through an unauthenticated HTTP endpoint. An attacker can read secrets, modify the repository, persist a process, or pivot to other local services. The fact that it is “local” does not mitigate this: `run.sh` binds to `0.0.0.0:8000` and CORS allows `*`.

### 4.7 Frontend and UX

**What works (in the new, unmounted generation).**

- A coherent design system: CSS variables, `surface-card`, focus rings, dark theme, responsive layouts.
- A ten-route information architecture with sidebar, topbar, command palette, and keyboard shortcut (`Cmd/Ctrl+K`).
- Streaming tutor with citations and fallback to non-streaming.
- Quiz view with MCQ feedback, solution reveal, and self-assessment.
- Library view with curriculum stages, search, module detail modal, bookmarks.
- Analytics view with local activity, mastery by topic, code progress, evaluation history, sample-data toggle, and JSON export.
- Bookmarks view and a localStorage-backed learning store.
- Accessibility positives: skip link (`AppShell.tsx:47-52`), `aria-current`, `aria-label`, focus styles, reduced-motion CSS.

**Confirmed problems.**

1. **The application does not build.** Current `npm run build` errors:
   - `App.tsx(41)`: `onNavigate` missing for `TutorChatView`
   - `App.tsx(51)`: `onNavigate` missing for `QuizView`
   - `App.tsx(55)`: `onNavigate` missing for `GraderView`
   - `App.tsx(59)`: `onNavigate` missing for `CodeSandboxView`
   - `App.tsx(63)`: `totalChunks` does not exist on `KnowledgeViewProps`
   - `OverviewView.tsx(87, 92)`: `score` does not exist on the inferred mastery entry type

   The last two are independent of the migration and are genuine type bugs in the new code.
2. **The new shell is unreachable.** `main.tsx` renders `App`, and `App.tsx` never imports `AppShell`, `useRoute`, `OverviewView`, `LibraryView`, `AnalyticsView`, or `BookmarksView`.
3. **`SettingsView` does not exist.** The sidebar links to `settings` (`Sidebar.tsx:307`), and the tutor’s model notice links to `settings` (`TutorChatView.tsx:340`). There is no component to render that route.
4. **Chat history is in-memory only.** `chatStore.ts:4-35` stores messages in a module variable. A reload loses the session. The backend receives no history anyway.
5. **Progress is client-side and forgeable.** `learningStore` writes to `localStorage`; a student can edit attempts, grades, and bookmarks. This is acceptable for a prototype, not for assessment.
6. **Analytics can mix sample data and real data.** `AnalyticsView` has a sample-data toggle (`AnalyticsView.tsx:127-129`). The banner is clear, but the export includes only real `learning` data while the charts can show sample values. This is a UX footgun in a system that claims “evidence, not guesswork.”
7. **No error boundaries.** A malformed quiz or grading response can crash a view.
8. **External CDN dependency.** `index.html:14-18` loads Google Fonts and KaTeX CSS from CDNs. This contradicts the “100% local / zero data egress” claim in the spec and breaks offline use.
9. **No end-to-end verification.** There are no Playwright/Cypress tests. The old tree was manually exercised earlier; the current tree cannot be exercised at all.

**What is good.** The new design is a significant improvement over the old five-tab layout. It introduces overview, library, analytics, bookmarks, command palette, and local progress. If wired correctly, it would materially improve the product. The problem is integration, not design ambition.

### 4.8 Backend platform, security, and operations

**Confirmed problems.**

1. **No authentication or authorization.** Every endpoint is public. There is no user model, no session, no API key, no role check. Any client can grade, run code, and query the knowledge base.
2. **Network exposure.** `run.sh:30-31` starts Uvicorn with `--host 0.0.0.0 --port 8000`. Combined with the sandbox, this is a remote code execution surface on the local network.
3. **Invalid CORS configuration.** `config.py:28-36` includes `"*"` in `allow_origins` while `main.py:24` sets `allow_credentials=True`. Browsers reject wildcard origin with credentials; the effective behavior is inconsistent across clients. If the wildcard is honored, it compounds the exposure.
4. **Catch-all masks API 404s.** `main.py:45-50` registers `GET /{full_path:path}` after the API routers. An unknown `GET /api/...` returns `index.html` with HTTP 200 instead of a JSON 404. Clients see an HTML body and fail with a JSON parse error, which is hard to diagnose. It also makes API probing look successful.
5. **Health check is meaningless.** `/health` returns `{"status":"healthy"}` without checking Ollama, Chroma, model availability, or disk (`main.py:36-38`). The system can be “healthy” while grading is broken and torch is missing.
6. **No request size or rate limits.** A client can submit arbitrarily large code or prompts, run many LLM calls, and exhaust local resources.
7. **No structured logging, tracing, or metrics.** Failures such as the backend exiting during long LLM requests leave no crash log or supervisor record.
8. **No persistence.** No database, no migrations, no audit log, no submission history.
9. **No process supervision.** `run.sh` starts Uvicorn in the background with `reload` only in `__main__`, not in the launcher. If the backend dies, the script waits on a dead PID and the frontend remains up.
10. **No environment validation at startup.** The app does not check that `qwen3-embedding:4b`, the configured LLM, or the Chroma collection exist. Failures surface at request time.
11. **Configuration duplication.** `config.py:17-19` and `retriever.py:14` duplicate model names; `knowledge.py:30-31` hardcodes 2560 dimensions and a metric string. These will drift.
12. **No git repository.** There is no history, no branching, no review, and no way to attribute the mid-audit rewrite. `git status` returns “not a git repository.”

### 4.9 SFT data and ML assets

**Confirmed state.**

| File | Lines | Schema keys | Intended volume in spec |
|---|---:|---|---:|
| `exercise_bank.jsonl` | 8 | `id, topic, difficulty, type, question, options, correct_answer, points, explanation` | 300 |
| `math_derivations.jsonl` | 3 | `topic, title, instruction, response` | 300 |
| `code_debugging.jsonl` | 3 | `id, topic, title, buggy_code, error_type, explanation, fixed_code` | 300 |
| `grading_rubrics.jsonl` | 2 | `id, exercise, total_points, marking_grid, sample_submissions` | 200 |
| **Total** | **16** | — | **1,000+** |

**Problems.**

1. **Volume is 1.6% of the target.** 16 examples cannot support LoRA training on a 7B model without memorization.
2. **Schemas are inconsistent.** `exercise_bank` uses `correct_answer`; the spec’s example uses `correct_option` (`PROJECT_DELIVERABLES_AND_SPECIFICATION.md:188`). `math_derivations` has no `id`, `subtopic`, or `prerequisites` despite the spec schema. `grading_rubrics` has `sample_submissions` rather than the documented top-level `student_submission` + `evaluation_result` pair. There is no unified instruction/response chat format, which is what an SFT trainer actually consumes.
3. **At least one factual error.** `EX-DECODE-STRAT-01` (`build_sft_datasets.py:108-115`) states that top-p with p=0.92 retains only catches/throws/chases/bites/eats, while the explanation correctly computes cumulative 0.934 after adding `sleeps` and `hates`. The `correct_answer` field contradicts the explanation. Training on this would teach the wrong behavior.
4. **No validation.** The spec promises JSON well-formedness, LaTeX balance, and executable verification (`spec §3.4`). No validator exists. The `fixed_code` snippets were not executed in this environment; torch is absent.
5. **No train/validation/test split.** No split files, no seed, no leakage checks.
6. **No deduplication or contamination checks.** Exam questions and answer keys are in the corpus and in the SFT data; a held-out benchmark drawn from the same exams would be contaminated.
7. **No licensing or provenance metadata.** The source slides and exams are course materials; redistribution and training rights are not documented.
8. **The “empirical justification” is anecdotal.** The progress document cites two observations (a perplexity sign slip and a PyTorch diagnosis error) as proof that fine-tuning is essential. There is no controlled comparison, no sample size, no baseline, and no inter-annotator agreement. Two failures justify *investigating* fine-tuning; they do not justify skipping evaluation.

---

## 5. Critical Issues

Severity definitions:

- **P0 / Critical:** unsafe, incorrect, or blocks any credible use. Fix before anything else.
- **P1 / High:** materially undermines correctness or the core value proposition.
- **P2 / Medium:** quality, maintainability, or UX issue with a workaround.
- **P3 / Low:** polish, documentation, or future work.

### P0 — Critical

| ID | Issue | Evidence | Impact | Required fix |
|---|---|---|---|---|
| **C1** | Sandbox is host-level RCE | `sandbox_runner.py:75-80`; confirmed reads of `/etc/hosts`, env, CWD, exam PDFs, SFT data; Ollama reachable | Full compromise of the host account and local services; exam/answer exfiltration | Replace with container isolation (Docker/gVisor/Firecracker), non-root, no network, read-only FS, tmpfs, seccomp, cgroups; or disable the endpoint until then. |
| **C2** | Sandbox reports false passes | `sandbox_runner.py:91-103`; `os._exit(0)` → 3/3; failing run → 2/3 | Every coding grade is untrustworthy; students can “pass” without implementing anything | Structured test runner (`pytest --json-report` or explicit per-test harness); parse individual results; exit code alone must not imply success; sandbox the test process separately from student code. |
| **C3** | Grading default fails and scores are inconsistent | `evaluator.py:24`; missing `qwen2.5-coder:7b`; gemma 1.0/2.0 with criteria 1.0+1.0; qwen 0.0/0.0 | The grading feature is unusable or misleading out of the box | Fix model selection (`req.model or DEFAULT_LLM`, validate availability); validate schema; compute totals server-side; clamp and cross-check; add a confidence/abstain path. |
| **C4** | Retrieval has no relevance gate and leaks answer keys | `retriever.py:44-107`; off-topic query answered at ~0.30; top attention hit was a quiz answer; `slide_chunker.py:73` | Hallucinated grounding; assessment leakage; student can retrieve answers | Separate lecture and assessment collections; add score threshold + abstention; add reranker/hybrid; build a labeled eval set; restrict exam chunks to instructor/grader roles. |
| **C5** | Frontend does not build; new UI unreachable | `npm run build` → 7 TS errors; `App.tsx` stale; no `SettingsView` | No reproducible UI; cannot demo or deploy current tree | Finish the migration: wire `AppShell`/router, pass props, fix `OverviewView` typing, add `SettingsView` or remove the route, delete dead old components. |
| **C6** | Documentation claims are false for the current tree | “COMPLETED & OPERATIONAL” at spec:57,59; progress:24-26; sandbox “memory protection” at progress:77 | Misleads supervisors, teammates, and users; hides risk | Rewrite status docs with verified evidence; mark sandbox/grading/LoRA as not production-ready; remove unverifiable claims. |

### P1 — High

| ID | Issue | Evidence | Impact |
|---|---|---|---|
| **C7** | BPE test is wrong; test counts are inflated | `task_01_bpe.py:42-54`; actual 2/3/2 tests vs documented 4/4/3 | Correct student code fails; grading is unfair and confusing. |
| **C8** | Attention task cannot run | `task_02_attention.py:34`; `torch` absent | The flagship coding assignment is non-functional. |
| **C9** | Quiz output is unvalidated | `quiz_generator.py:62-82`; no schema/answer checks | Broken renders, wrong answer keys, duplicated questions. |
| **C10** | SFT data is 16 examples with inconsistent schemas and a factual error | `wc -l`; `build_sft_datasets.py:108-115` | Fine-tuning would memorize and amplify errors. |
| **C11** | No auth, wildcard CORS, 0.0.0.0 binding | `config.py:28-36`; `main.py:21-27`; `run.sh:30-31` | Anyone on the network can run code, grade, and query. |
| **C12** | No conversation history and no persistence | `tutor.py:21-26`; no DB; `chatStore.ts:4-35` | Tutor cannot follow up; progress is lost or forgeable. |
| **C13** | No adaptive learning mechanism | no learner model; `OverviewView.tsx:415-417` explicitly disclaims prediction | The project’s central claim is unmet. |
| **C14** | No evaluation harness or tests | `tests/` empty; no CI | Quality claims are unverifiable; regressions are invisible. |
| **C15** | Catch-all returns HTML 200 for unknown API routes | `main.py:45-50` | Clients misdiagnose 404s; API surface is ambiguous. |
| **C16** | `/health` is a constant | `main.py:36-38` | Orchestrators and users cannot detect a broken model/index. |

### P2 — Medium

- No request size/rate limits; a single client can exhaust Ollama or disk.
- No structured logging, metrics, or crash supervisor; the backend exited during long requests without a trace.
- No error event in SSE; stream failures look like normal completion.
- No citation verification or quote spans; citations can be irrelevant.
- No content deduplication or near-duplicate detection.
- No table/code extraction; math is largely lost.
- No accessibility/e2e tests; new shell cannot be verified.
- No offline assets; CDN fonts and KaTeX undermine the local-only claim.
- No `SettingsView` despite route/sidebar entries.
- No model allowlist; arbitrary model strings reach Ollama.
- No instructor override or grade audit trail.
- No anti-plagiarism or submission integrity checks.

### P3 — Low

- Duplicate “Person 5” row in the roadmap (`TEAM_MEETING_AND_DELIVERABLES_ROADMAP.md:206-207`).
- Streamlit/mermaid inconsistency: spec says Streamlit at `localhost:8501` while the platform is React (`spec:80`).
- `ActiveTab` is a deprecated alias of `Route` (`types.ts:13-14`); dead compatibility shim.
- `DEFAULT_LLM` duplicated in `grader.py:20`, `quiz_generator.py:20`, `tutor_agent.py:18`, and `config.py:17`.
- `knowledge.py:30-31` hardcodes dimension/metric instead of reading the collection.
- No `pyproject.toml`, lockfile, Dockerfile, or `.env.example`.
- No contributor setup instructions that match the actual environment.

---

## 6. Missing Features

This section separates **claimed but missing** from **missing relative to the “adaptive learning system” concept**.

### 6.1 Claimed in the documents but absent

| Claim | Reality |
|---|---|
| 1,000+ SFT pairs | 16. |
| LoRA adapter + Modelfile | No `models/`, no training script, no adapter. |
| Pre/post benchmark | No benchmark. |
| 4/4/3 coding tests | 2/3/2. |
| 1 GB memory limit | No memory limit. |
| Isolated sandbox | Same-user subprocess. |
| 100% local / zero egress | CDN fonts and KaTeX CSS. |
| Production deployment | `npm run build` fails. |
| Five core views | Old five views exist but are stale; new ten-route UI is half-wired. |
| Hybrid BM25 + dense retrieval | Not implemented. |
| 5 research papers indexed | `data/raw/papers/` is empty. |
| Anti-plagiarism and sanitization | Not implemented. |
| Grading consistency benchmark | Not implemented. |
| “Adaptive” platform | No learner model or adaptation algorithm. |

### 6.2 Missing for a genuine adaptive learning system

1. **Learner model.** No knowledge tracing (BKT, DKT, IRT), no mastery estimates per concept, no confidence, no forgetting curve.
2. **Concept graph.** The curriculum is a flat list of chapters. There are no prerequisite edges, no concept-level mapping from chunks/questions to skills, and no diagnostic routing.
3. **Adaptive item selection.** Quiz difficulty is chosen by the student, not by the system. There is no next-item policy, no spaced repetition scheduler, no mastery-based progression.
4. **Feedback loop.** Attempts are stored locally but never used to change what the student sees next.
5. **Instructor workflow.** No course authoring, no assignment creation, no deadline management, no submission inbox, no grade override, no cohort analytics, no export.
6. **Identity and persistence.** No accounts, roles, sections, or server-side history.
7. **Assessment integrity.** No exam mode, no time limits, no question randomization beyond generation, no proctoring, no plagiarism detection.
8. **Content coverage.** The corpus covers 14 chapters (1–11, 14, 18, 19) plus an appendix; chapters 12, 13, 15, 16, and 17 are absent. The docs say “15 decks,” but the curriculum is not complete.
9. **Multimodal content.** Slides are text-only; diagrams, attention heatmaps, and parse trees are lost.
10. **Evaluation.** No gold sets, no human grading study, no retrieval benchmark, no tutoring quality rubric, no safety red-team.
11. **Accessibility and internationalization.** No verified WCAG pass, no keyboard-only e2e, no French/Arabic localization despite ENSIA context.
12. **Operations.** No auth, rate limits, observability, backups, migrations, or deployment manifests.

### 6.3 Missing for trustworthy autograding

- Deterministic rubric parsing and server-side score computation.
- Schema validation and repair/retry.
- Model self-consistency or dual grading.
- Human review queue for low-confidence or high-stakes submissions.
- Per-criterion evidence quotes from the student answer.
- Plagiarism and AI-generated-answer detection.
- Grade audit trail and appeal workflow.
- Calibration against human graders (MAE, QWK, Bland–Altman).
- Adversarial testing (prompt injection, empty answers, copied rubrics, Unicode tricks).

---

## 7. Recommended Improvements

Recommendations are ordered by dependency, not by novelty. Do not start at the bottom.

### 7.1 P0 engineering fixes (before any demo)

**Sandbox**

- Replace `subprocess.run` with a containerized runner:
  - Docker with `--network none`, `--read-only`, `--tmpfs /tmp`, `--memory 512m`, `--cpus 0.5`, `--pids-limit 64`, `--user 65534:65534`, `--cap-drop ALL`, `--security-opt no-new-privileges`.
  - Or gVisor/Firecracker if available.
- Mount only a per-submission temp directory; never mount the repository.
- Run each test in a fresh process or use a structured runner; do not concatenate student code and tests in one namespace.
- Parse per-test results (`pytest-json-report`, `unittest` result object, or a custom JSON protocol).
- Add a pre-execution AST check for dangerous imports/calls (`os`, `subprocess`, `socket`, `ctypes`, `open` outside the sandbox, `sys.exit`, `os._exit`). Treat it as defense in depth, not as the primary control.
- Kill the entire process group on timeout; verify no orphan survives.
- Cap stdout/stderr and truncate with an explicit marker.
- If containerization is not possible this week, **disable `/api/sandbox/run`** and label the coding lab “coming soon.” A disabled feature is better than an RCE.

**Grading**

- Fix `evaluator.py:24` to `req.model or settings.DEFAULT_LLM` and validate the model against an allowlist/`ollama list`.
- Define Pydantic models for `EvaluationResult`, `RubricCriterion`, and the request. Reject unknown/missing fields.
- Compute `total_score` from the rubric, `earned_score` from `sum(points_awarded)`, and clamp each criterion to `[0, max_points]`. Never trust the model’s arithmetic.
- Require `status` to be consistent with points (`passed` ⇔ full, `partial` ⇔ 0 < points < max, `failed` ⇔ 0).
- Add a retry with a repair prompt on invalid JSON; after N failures, return a structured error, not `raw_evaluation`.
- Add a “not gradable” path when the submission is empty, off-topic, or contains prompt-injection markers.
- Log the raw model output and the validated result for audit.
- Do not present automated grades as authoritative without a human-review disclaimer.

**Retrieval**

- Split collections: `nlp_lectures` and `nlp_assessments`. Route tutor/quiz to lectures by default; allow assessments only for instructor/grader flows.
- Add a relevance threshold (calibrate on a labeled set; start around 0.45–0.50 for cosine on this embedding model, but measure).
- If the best score is below threshold, return “I could not find this in the course materials” and no citations.
- Add a reranker (cross-encoder or LLM-based listwise) over the top 20–50 candidates.
- Add BM25/hybrid retrieval for exact terms and formulas.
- Return chunk IDs and quote spans; require the tutor to cite chunk IDs, then verify each cited ID appears in the retrieved set.
- Add query rewriting for follow-ups once history exists.

**Frontend**

- Complete the migration in one branch:
  - Replace `App.tsx` with a component that uses `useRoute`, `AppShell`, and a route switch.
  - Pass `onNavigate`, `knowledgeStats`, `backendStatus`, and chapter handlers to each view.
  - Fix `OverviewView` mastery typing: declare the map value as `{ attempts: number; correct: number; score: number }` and initialize `score: 0`.
  - Add `SettingsView` or remove the route and links.
  - Delete `Navbar.tsx` and any old components that are no longer reachable.
- Add an error boundary per route.
- Add a build check to CI.

**Documentation**

- Replace status claims with a verified status table. Link each claim to a test or artifact.
- Add a “Known limitations” section that names the sandbox, grading, and retrieval risks.
- Add a reproducible setup section: Python version, `ollama pull` commands, `pip install -r requirements.txt`, `npm ci`, `npm run build`, and expected outputs.
- Remove the duplicate Person 5 row and the Streamlit/React inconsistency.

### 7.2 P1 correctness and quality

**Ingestion**

- Chunk by semantic section (heading-aware), with 10–20% overlap.
- Preserve tables as Markdown/CSV and formulas as LaTeX. If the PDF extraction loses formulas, add an OCR/math pipeline or manually curate the highest-value slides.
- Store `chunk_id`, `document_id`, `page`, `section`, `concept_tags`, `content_type` (`text`, `formula`, `table`, `code`, `exam`), and `is_answer_key`.
- Deduplicate near-identical chunks (MinHash/SimHash).
- Add a data-quality report: chunk length distribution, formula coverage, table coverage, duplicate rate, language.

**Tutor**

- Add `messages: [{role, content}]` to `ChatRequest` and send the last N turns.
- Add an explicit abstention instruction and a structured “insufficient context” response.
- Add a citation verifier: for each claim/citation pair, check lexical/embedding overlap between the answer span and the cited chunk; flag unsupported citations.
- Add an `error` SSE event and a server-side timeout/retry around Ollama.
- Add prompt-injection defenses: delimit retrieved context, instruct the model to treat it as data, strip control tokens, and cap length.
- Add model allowlisting and a startup availability check.

**Quiz**

- Validate with Pydantic/JSON Schema; retry on invalid output.
- For MCQ, require exactly four options and exactly one correct key; verify by independent solving (LLM + rule-based checks) or by a human-reviewed item bank.
- For calculation questions, verify the numeric answer with a solver (SymPy) where possible.
- Deduplicate against recent items and the item bank.
- Separate difficulty calibration from the prompt label; track item statistics once real attempts exist.
- Never ground quiz generation in exam answer keys.

**SFT / ML**

- Do not scale the current generator blindly. Fix schemas first, then generate.
- Build a validator that checks JSON, required fields, LaTeX balance, answer correctness (execute code, solve math), and duplicate/contamination.
- Create train/validation/test splits at the document/topic level, not the row level.
- Add a human review sample (at least 10–20%) and inter-annotator agreement.
- Keep a “gold” set of 100–200 examples that is never trained on.

**Platform**

- Add authentication (even a simple instructor/student split) and server-side persistence (SQLite/Postgres).
- Add request size limits, rate limits, and per-user quotas.
- Add structured logging and a `/health/ready` endpoint that checks Ollama, Chroma, and model availability.
- Add a `Dockerfile` and `docker-compose.yml` with the backend, frontend build, and Ollama.
- Add CI: lint, typecheck, unit tests, build, and a smoke test.

### 7.3 P2 product and pedagogy

- Implement a concept graph and mastery model. Start simple: per-topic Elo/BKT with a forgetting factor.
- Use mastery to select the next item and difficulty; add spaced repetition (SM-2 or FSRS).
- Add an instructor dashboard: cohort mastery, flagged submissions, grade override, export.
- Add assignment/submission workflows with deadlines and attempts.
- Add richer feedback: hint ladders, worked examples, error taxonomy.
- Add accessibility and localization.
- Add offline assets (self-host fonts/KaTeX).
- Add a content authoring workflow for instructors.

### 7.4 P3 research and differentiation

- Hybrid retrieval + reranking + citation verification as a measurable contribution.
- A small, high-quality domain adapter, evaluated against strong RAG baselines.
- Item response theory for quiz calibration.
- Learning analytics with privacy-preserving aggregation.
- Multimodal slide understanding (diagrams, attention maps).

---

## 8. ML and Fine-Tuning Strategy

### 8.1 Is 16 examples enough to fine-tune?

**No.** Sixteen examples are enough to verify that a training script runs, not enough to adapt a 7B model.

For LoRA on a 7B model:

- 16 examples will be memorized. Training loss will approach zero; held-out performance will not improve.
- The model may learn the *format* of the 16 examples (e.g., “output JSON with these keys”) but not the underlying math, code, or grading policy.
- With 16 examples, any train/validation split is statistically meaningless. There is no way to detect overfitting or catastrophic forgetting.
- The data has inconsistent schemas, so the adapter would learn inconsistent output formats.

**Verdict:** do not train on the current dataset. Use it as a schema prototype and a seed for a real data pipeline.

### 8.2 Does the proposed 1,000+ / LoRA plan make sense?

**Partially, but the order is wrong and the framing is too optimistic.**

What is reasonable:

- 1,000–5,000 high-quality, task-diverse examples is a plausible range for **style/format adaptation**: consistent JSON, LaTeX conventions, rubric tone, step-by-step structure.
- LoRA is the right parameter-efficient method for a 7B model on consumer hardware.
- The proposed hyperparameters (`r=16`, `alpha=32`, dropout 0.05, target attention + MLP projections, lr 2e-4, 3 epochs, bf16) are in a normal range.
- A pre/post comparison is the right evaluation shape.

What is wrong or premature:

1. **The baseline is missing.** You cannot claim fine-tuning is necessary until you have a measured RAG + prompt + validation baseline. Most current failures are engineering bugs, not model failures.
2. **The data is not verified.** 1,000 generated examples of the current quality would be worse than 16 curated ones. Every code fix must execute; every math answer must be checked; every rubric score must be recomputed.
3. **The base model choice is questionable.** `qwen2.5-coder:7b` is a code model. It may be good for debugging, but it is not obviously the best base for math derivations and rubric grading. Consider:
   - a general instruct model (e.g., Qwen2.5-7B-Instruct) for tutoring/grading;
   - a coder model for code diagnosis;
   - or one general adapter plus a separate code adapter.
4. **Ollama adapter support must be verified.** Not every architecture/adapter combination is supported by `ADAPTER` in a Modelfile. Test the export path before promising it.
5. **The evaluation targets are unrealistic.** “0% algebraic inversion errors,” “≥90% bug diagnosis,” and “MAE ≤ 0.5 on a 10-point scale” are not meaningful without a defined test set, annotator protocol, confidence intervals, and baseline. A 20-question benchmark is too small to support those claims.
6. **The data may be contaminated.** Exams and answer keys are in the retrieval corpus. If the benchmark uses the same exams, fine-tuning and RAG will look better than they are.
7. **Fine-tuning cannot fix retrieval.** If the right chunk is not retrieved, the adapter cannot ground the answer. Fix retrieval first.
8. **Fine-tuning cannot fix grading arithmetic.** The server must compute scores, not the model.

### 8.3 Recommended ML sequence

**Phase 0 — Baseline and evaluation (must come first)**

- Build a 100–200 item gold set across:
  - retrieval (query → relevant chunk IDs),
  - tutoring (question → grounded answer + citations),
  - quiz (topic/difficulty → valid, correct item),
  - grading (submission + rubric → human score + criterion labels),
  - code diagnosis (buggy code → root cause).
- Measure the current system: recall@k, citation precision, JSON validity, grading MAE/QWK, diagnosis accuracy, refusal rate, latency.
- Freeze the baseline. Do not change prompts and data at the same time.

**Phase 1 — Fix the software**

- Sandbox, grading validation, retrieval threshold/separation, quiz schema, frontend build, auth/persistence.
- Re-measure. Many “model” failures should disappear.

**Phase 2 — Data engineering**

- Define one canonical SFT schema:
  ```json
  {"id": "...", "task": "math|code|quiz|rubric", "messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}], "metadata": {"topic": "...", "difficulty": "...", "source": "...", "verified": true}}
  ```
- Generate candidates with a strong teacher model, then verify:
  - code: execute in the sandbox against hidden tests;
  - math: SymPy/numeric checks and unit consistency;
  - quiz: independent solve + option validation;
  - rubric: deterministic score computation + human spot check.
- Deduplicate and decontaminate against the gold set.
- Target 1,000–3,000 examples, balanced across tasks and chapters; 70/15/15 split by topic/document.

**Phase 3 — LoRA experiment**

- Train only if Phase 0 shows a residual capability gap that prompting/RAG cannot close.
- Use a reproducible trainer (HF PEFT/TRL or Unsloth), fixed seed, bf16, gradient checkpointing, and logged hyperparameters.
- Run ablations: base, base+RAG, base+RAG+adapter, adapter-only.
- Evaluate on the gold set with confidence intervals; report per-task results, not one aggregate.
- Check catastrophic forgetting on a small general-NLP set.

**Phase 4 — Productization**

- Package the adapter, version it, and record the evaluation report.
- Add a model registry and a fallback to the base model.
- Do not claim “0% errors.” Report measured error rates with sample sizes.

### 8.4 What fine-tuning can and cannot deliver

| Goal | Fine-tuning likely helps? | Better first step |
|---|---|---|
| Consistent JSON output | Yes, moderately | Schema validation + retry/repair |
| LaTeX style and step-by-step structure | Yes | Prompt + few-shot examples |
| Course-specific facts | **No** (use RAG) | Better retrieval and citations |
| Rubric arithmetic | **No** | Server-side computation |
| Code diagnosis | Maybe | Better error capture + coder model |
| Refusal/abstention | Maybe | Explicit policy + threshold |
| Retrieval quality | **No** | Hybrid search + reranker |
| Adaptive sequencing | **No** | Learner model |

---

## 9. Testing and Evaluation Plan

### 9.1 Test pyramid

| Layer | What to test | Tooling | Current state |
|---|---|---|---|
| Unit | Chunker, retriever math, graders, sandbox result parsing, stores | pytest, Vitest | None |
| Integration | API endpoints with a fake Ollama/Chroma | pytest + httpx + respx | None |
| Contract | JSON schemas for quiz/grading/SFT | Pydantic/JSON Schema | None |
| End-to-end | Tutor → citation → quiz → grade → code run | Playwright | None |
| Security | Sandbox escape, prompt injection, auth bypass, rate limits | pytest + container tests | Ad hoc probes only |
| Performance | Retrieval latency, LLM latency, concurrent runs | Locust/k6 | None |
| Data quality | Chunk stats, formula coverage, duplicates, leakage | Python scripts | None |
| Model quality | Retrieval, grounding, grading agreement | Gold sets + metrics | None |

### 9.2 Retrieval evaluation

Build a labeled set of 50–100 queries:

- 40 on-topic queries with 1–3 known relevant chunk IDs.
- 10 ambiguous queries.
- 10 off-topic queries that should trigger abstention.
- 5 exam-answer queries that should be blocked for students.

Metrics:

- Recall@1/3/5, MRR, nDCG@5.
- Citation precision (fraction of cited chunks that are relevant).
- Citation recall (fraction of relevant chunks cited).
- Abstention accuracy on off-topic queries.
- Answer-key leakage rate (should be 0 for student flows).
- Latency p50/p95.

Acceptance targets (initial, to be calibrated):

- Recall@5 ≥ 0.85 on on-topic queries.
- Citation precision ≥ 0.90.
- Answer-key leakage = 0.
- Off-topic abstention ≥ 0.90.
- p95 retrieval latency < 300 ms excluding LLM.

### 9.3 Tutor evaluation

For 50 questions:

- **Groundedness:** every factual claim is supported by a cited chunk (human or LLM-judge with human audit).
- **Citation correctness:** the cited chunk actually contains the claim.
- **Math correctness:** SymPy/numeric verification where applicable.
- **Refusal:** off-topic and out-of-syllabus questions are declined or clearly labeled as external.
- **Follow-up coherence:** multi-turn conversations resolve pronouns and references.
- **Safety:** prompt injection in retrieved text and user input does not change the system policy.
- **Latency:** p95 < 15 s for a 200-token answer on the target hardware.

### 9.4 Quiz evaluation

- JSON validity rate (target 100% after validation/retry).
- Answer correctness rate on a 100-item sample (independent solve; target ≥ 95% for MCQ, ≥ 90% for calculations).
- Option validity: exactly four options, one correct, no duplicate options.
- Duplicate rate across 100 generations (target < 5%).
- Difficulty calibration: after 200+ real attempts, check whether “advanced” items are harder than “beginner” items (item difficulty + discrimination).
- Leakage: no generated item may copy an exam answer verbatim.

### 9.5 Grading evaluation

Create 50 human-graded submissions across 5 rubrics, with 2 independent graders:

- **Arithmetic consistency:** `earned_score == sum(points_awarded)`, `total_score == sum(max_points)`, every criterion within range — target 100%.
- **Agreement:** MAE and quadratic weighted kappa vs. human scores. Target MAE ≤ 0.5 on a 5-point rubric after calibration; report CIs.
- **Criterion agreement:** per-criterion F1 for passed/partial/failed.
- **Robustness:** empty answer, copied rubric, prompt injection, Unicode obfuscation, off-topic answer, contradictory answer. Each must produce a safe, structured result.
- **Consistency:** same submission graded 5 times at temperature 0.1; score variance should be 0 or near 0. If not, use self-consistency or deterministic rubric checks.
- **Audit:** every grade stores model, prompt version, raw output, validated output, and timestamp.

### 9.6 Sandbox evaluation

- **Escape suite:** filesystem read/write outside the sandbox, network access, environment access, process spawning, fork bomb, memory bomb, CPU spin, orphan child, `os._exit`, `sys.exit`, monkeypatching, import hooks.
- **Correctness suite:** known-correct and known-incorrect solutions for each task; verify exact pass/fail counts and per-test names.
- **Bypass suite:** print “OK” to stderr, exit 0 early, redefine `unittest`, skip tests, modify the test file, catch `SystemExit`.
- **Resource suite:** 1 MB / 10 MB / 100 MB output; 1 s / 5 s / 30 s runtime; 100 MB / 1 GB memory; 10 / 100 processes.
- **Acceptance:** zero escapes, zero false passes, zero orphan processes, timeout enforced, memory capped, output truncated with a marker.

### 9.7 Frontend evaluation

- `npm ci && npm run build` passes in CI.
- Playwright flows: load overview, ask tutor, receive streamed answer with citations, generate quiz, answer MCQ, open grader, submit, run code, search knowledge, bookmark, reload and verify persisted progress.
- Accessibility: axe-core with zero critical violations; keyboard-only navigation; screen-reader labels.
- Responsive: 360 px, 768 px, 1280 px, 1440 px.
- Error states: backend offline, malformed JSON, stream interruption, empty results.
- No console errors.

### 9.8 CI and release gates

A pull request should not merge unless:

1. Backend lint/typecheck passes.
2. Unit + integration tests pass.
3. Frontend typecheck + build passes.
4. Contract tests for quiz/grading/SFT pass.
5. Sandbox escape suite passes (once implemented).
6. Retrieval regression suite does not drop below thresholds.
7. No secrets, no large binaries, no generated artifacts committed.

### 9.9 What can be tested now vs. later

**Now:**

- Retrieval on a manually labeled small set.
- Tutor grounding on 20 questions.
- Grading arithmetic and schema on 10 submissions.
- Sandbox escape suite (already partially done).
- Frontend build.

**Later (after fixes):**

- Large-scale grading agreement.
- Adaptive sequencing efficacy (requires a learner model and real students).
- LoRA ablation.
- Load and soak tests.

---

## 10. Prioritized Roadmap (P0–P3)

### P0 — Stop the bleeding (1–2 weeks)

**Goal:** make the system safe, honest, and demonstrable.

| # | Work | Acceptance criteria | Effort |
|---|---|---|---|
| P0.1 | Disable or containerize the sandbox | No host FS/network/env access; no false passes; orphan processes killed | 3–5 days |
| P0.2 | Fix grading model selection + validation | Default endpoint works with an installed model; arithmetic always consistent; invalid JSON returns a structured error | 2–3 days |
| P0.3 | Separate assessment chunks; add relevance threshold + abstention | Student flows never retrieve answer keys; off-topic queries refuse; threshold documented | 2–3 days |
| P0.4 | Complete frontend migration and fix build | `npm ci && npm run build` passes; all routes render; no dead old components | 3–4 days |
| P0.5 | Rewrite status docs | Every “complete” claim has a reproducible check; known limitations listed | 1 day |
| P0.6 | Pin the environment | `ollama pull` script, lockfile, README that matches reality; `torch` and coder model either installed or explicitly optional | 1 day |

**Exit criteria:** a student cannot execute host code, grades are arithmetically consistent, the UI builds, and the docs do not lie.

### P1 — Make it correct (2–4 weeks)

**Goal:** trustworthy core flows and a measurable baseline.

| # | Work | Acceptance criteria | Effort |
|---|---|---|---|
| P1.1 | Structured sandbox test runner | Per-test pass/fail; exact counts; timeout/memory/output caps; escape suite green | 1 week |
| P1.2 | Quiz schema + answer verification | 100% JSON validity; independent answer check; no duplicates; no exam leakage | 1 week |
| P1.3 | Retrieval evaluation + hybrid/rerank | Labeled set; recall@5 ≥ 0.85; citation precision ≥ 0.90; p95 < 300 ms | 1–2 weeks |
| P1.4 | Tutor history + citation verification + abstention | Multi-turn works; unsupported citations flagged; off-topic refusal ≥ 0.90 | 1 week |
| P1.5 | Auth + persistence | Student/instructor roles; server-side attempts/grades; audit log | 2 weeks |
| P1.6 | Tests + CI | Unit/integration/e2e; build gate; no regressions | 1–2 weeks |
| P1.7 | Ingestion v2 | Semantic chunks, overlap, formula/table preservation, dedup, quality report | 1–2 weeks |

**Exit criteria:** a measured baseline exists; the main flows are correct; regressions are caught automatically.

### P2 — Make it adaptive (4–8 weeks)

**Goal:** earn the project title.

| # | Work | Acceptance criteria | Effort |
|---|---|---|---|
| P2.1 | Concept graph + mastery model | Per-concept mastery with uncertainty; prerequisite edges | 2 weeks |
| P2.2 | Adaptive item selection + spaced repetition | Next-item policy uses mastery; difficulty adapts; review schedule | 2 weeks |
| P2.3 | Instructor dashboard | Cohort mastery, flagged submissions, override, export | 2 weeks |
| P2.4 | Assignment/submission workflow | Deadlines, attempts, feedback, plagiarism checks | 2 weeks |
| P2.5 | Student-facing analytics v2 | Server-backed, tamper-resistant, explains recommendations | 1 week |

**Exit criteria:** the system changes what it shows based on measured performance, and an instructor can run a course section with it.

### P3 — Research and scale (8+ weeks)

**Goal:** differentiation and robustness.

| # | Work | Acceptance criteria | Effort |
|---|---|---|---|
| P3.1 | Scale and verify SFT data | 1,000–3,000 verified examples; splits; contamination checks; human review | 3–4 weeks |
| P3.2 | LoRA experiment | Only if baseline gap justifies; full ablation; held-out eval; no regression | 2–3 weeks |
| P3.3 | Multimodal ingestion | Diagrams, attention maps, parse trees; formula OCR | 2–4 weeks |
| P3.4 | Research papers + code corpus | 5 papers indexed; code examples linked to chapters | 1–2 weeks |
| P3.5 | Deployment hardening | Docker Compose, backups, monitoring, rate limits, SSO | 2–3 weeks |

**Exit criteria:** a reproducible, evaluated, deployable system with a credible claim of improvement over the baseline.

### 10.1 Recommended immediate sequence

1. **Today:** disable `/api/sandbox/run` or bind the backend to `127.0.0.1` and add a warning. Do not expose the current sandbox.
2. **This week:** fix grading model selection and server-side score arithmetic; separate exam chunks; add a retrieval threshold.
3. **Next week:** finish the frontend migration and make the build green; rewrite the status docs.
4. **Then:** build the evaluation harness before touching SFT or LoRA.

---

## 11. Evidence Log and Reproduction

### 11.1 Commands used

```bash
# Environment
python3 --version
ollama list
python3 -c "import torch"          # ModuleNotFoundError
npm run build                      # 7 TS errors

# Data
wc -l data/sft/*.jsonl             # 3 + 8 + 2 + 3 = 16
python3 - <<'PY'
import json
c = json.load(open('data/processed/chunks/course_chunks.json'))
print(len(c))                      # 913
PY

# Chroma
python3 - <<'PY'
import chromadb, numpy as np
c = chromadb.PersistentClient(path='data/chroma_db').get_collection('nlp_course_kb')
print(c.count())                   # 913
r = c.get(limit=1, include=['embeddings'])
print(np.array(r['embeddings'][0]).shape)  # (2560,)
PY
```

### 11.2 Runtime probes

```bash
curl -s http://127.0.0.1:8000/health
curl -s http://127.0.0.1:8000/api/knowledge/stats
curl -s -X POST http://127.0.0.1:8000/api/knowledge/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"scaled dot product attention","top_k":3}'
curl -s -X POST http://127.0.0.1:8000/api/tutor/chat \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is the capital of France?","top_k":3}'
curl -s -X POST http://127.0.0.1:8000/api/evaluator/grade \
  -H 'Content-Type: application/json' \
  -d '{"problem_statement":"...","marking_scheme":"...","student_submission":"..."}'
```

### 11.3 Observed results (summary)

| Probe | Observation |
|---|---|
| `/health` | `{"status":"healthy"}` even when models were missing |
| `/api/knowledge/stats` | 913 chunks, 2560-d |
| Retrieval (attention) | Top score ~0.59–0.71; top hit was a quiz answer chunk |
| Off-topic query | Answered; citations at ~0.30 |
| Grading default | `model 'qwen2.5-coder:7b' not found (404)` |
| Grading consistency | gemma 1.0/2.0 with criteria 1.0+1.0 (3/3); qwen 2.0/2.0; qwen 0.0/0.0 |
| Prompt injection | Resisted in one run, but `total_score` returned 0.0 instead of 2.0 |
| Sandbox FS | `/etc/hosts`, env, CWD, exam PDF, SFT JSONL readable |
| Sandbox network | Ollama at `127.0.0.1:11434` reachable |
| Sandbox bypass | `os._exit(0)` with “OK” → 3/3 success |
| Sandbox false partial | Failing run → 2/3 even with 0 tests executed |
| Sandbox timeout | 3 s timeout worked; child `sleep 20` survived |
| Sandbox output | 2 MB stdout captured |
| BPE | Correct implementation failed: `('o','w') != ('e','s')` |
| Attention | `ModuleNotFoundError: torch` |
| Frontend build | 7 TypeScript errors |

### 11.4 What could not be verified

- The original course brief (not in the repository).
- The claimed > 0.74 retrieval accuracy on a representative benchmark (no benchmark exists).
- The 1 GB memory limit (not implemented).
- LoRA training, adapter export, and the pre/post benchmark (not implemented).
- The “4/4/3” test suites (the code has 2/3/2).
- End-to-end behavior of the new frontend (does not build).
- Long-run stability under concurrent load (backend exited during long qwen requests; no supervisor or crash log).
- Whether the `frontend/dist` artifact currently served matches the source (provenance unclear; build fails).

### 11.5 Limitations of this audit

- The frontend changed during the audit; findings describe the tree as of the timestamp above.
- LLM behavior is stochastic. The grading inconsistency was reproduced multiple times, but exact rates would require a larger sample.
- Sandbox probes were run in a controlled local environment; they demonstrate capability, not every possible exploit.
- No production data, student records, or instructor grading were available, so agreement metrics could not be computed.
- The audit did not modify production code; it did add this report.

---

## 12. Final Assessment

### 12.1 What the project has genuinely achieved

- A working local RAG pipeline over real course material.
- A functioning FastAPI backend with a clean router structure.
- A functional tutor, quiz, grader, sandbox, and knowledge explorer.
- A substantial, well-designed React frontend with streaming, KaTeX, Monaco, and a modern information architecture.
- A credible seed for a larger SFT dataset.
- A clear product vision: tutor + practice + grading + code lab in one place.

This is more than a toy. It is a strong prototype.

### 12.2 What it is not

- It is not an adaptive learning system. There is no learner model, no mastery estimation, no adaptive sequencing, and no spaced repetition.
- It is not a trustworthy autograder. The sandbox is unsafe and reports false passes; the rubric grader is inconsistent and unvalidated.
- It is not production-ready. No auth, no persistence, no tests, no CI, no reproducible environment.
- It is not honestly documented. The “COMPLETED & OPERATIONAL” claims do not survive contact with the repository.
- It is not ready for fine-tuning. The data is too small and inconsistent, and the baseline is unmeasured.

### 12.3 The one-sentence verdict

**A promising RAG study-assistant prototype with a strong UI direction, undermined by an unsafe sandbox, unvalidated grading, ungrounded retrieval, a half-finished frontend migration, and a documentation set that describes a system that does not yet exist.**

### 12.4 What to do first

1. Make the sandbox safe or disable it.
2. Make grading arithmetically correct and schema-validated.
3. Separate exam content and add retrieval abstention.
4. Finish the frontend migration and make the build green.
5. Replace status claims with verified evidence.
6. Build the evaluation harness.
7. Only then scale the data and consider LoRA.

---

*End of report.*
