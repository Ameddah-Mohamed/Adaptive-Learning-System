# Natural Language Processing Adaptive Learning System
## Progress Log & Completed Work Summary

**Institution:** National Higher School of Artificial Intelligence (ENSIA)  
**Curriculum:** 4th Year AI Engineering — Natural Language Processing (NLP) Course  
**Project:** Project 2 — An Adaptive Learning System for the NLP Course  
**Document Version:** 3.0 (Milestone 2 Complete — Production Adaptive Learning Engine Deployed)  
**Last Updated:** October 31, 2026  

---

## 1. Executive Summary of Completed Work

Over the course of the architectural hardening and implementation sprints (Phases 1 through 4), the project evolved from an initial prototype into a **production-grade, mathematically grounded, and security-hardened Adaptive Learning Platform**:

```
                                      SYSTEM CAPABILITIES STATUS
┌─────────────────────────────────┬────────────────────────────────────────┬──────────────────────┐
│ Component                       │ Technical Implementation               │ Operational Status   │
├─────────────────────────────────┼────────────────────────────────────────┼──────────────────────┤
│ 1. Raw Course Corpus            │ 15 Slide Decks + 4 Exams + LaTeX Clean │ COMPLETED & VERIFIED │
│ 2. Dual Vector Knowledge Base   │ Segregated Collections in ChromaDB     │ COMPLETED & VERIFIED │
│    - Student Course KB          │ 885 Lecture Chunks (nlp_course_kb)     │ Min Similarity = 0.50│
│    - Instructor Eval KB         │ 28 Exam Solutions (instructor_eval_kb) │ Zero Exam Leakage    │
│ 3. Learner & Mastery Engine     │ Bayesian Knowledge Tracing (BKT)       │ COMPLETED & VERIFIED │
│    - Skill Mastery Model        │ P(L_t) updates with slip/guess weights │ Prerequisite Tree (12)│
│    - SQLite Persistence Layer   │ WAL Mode: students, attempts, history  │ Persistent Memory    │
│ 4. Code Execution Sandbox       │ Subprocess + AST Static Analysis Guard │ COMPLETED & VERIFIED │
│    - Security Isolation         │ Blocks dangerous imports, eval, fork   │ 6.0s Subprocess Kill │
│    - 3 Curriculum Labs          │ BPE Tokenizer, Attention, Perplexity   │ 100% Pass Determinism│
│ 5. SFT Dataset & Benchmark      │ Chat & Alpaca Schemas + Train/Val Split│ COMPLETED & VERIFIED │
│    - Quality Assurance          │ AST syntax check + LaTeX delimiter bal │ Top-p Math Fix       │
│    - Benchmark Harness          │ 4-Track Automated Evaluation Harness   │ 90.9% Score (Qwen3.5)│
│ 6. FastAPI Backend              │ 14 REST Endpoints + SSE Streaming      │ RUNNING (Port 8000)  │
│ 7. Modern Web Application       │ React 18 + Tailwind + Monaco + KaTeX   │ BUILT (0 Errors, 1.4s│
│ 8. Automated Test Suite         │ 36 Comprehensive PyTest Unit Tests     │ 36 / 36 PASSED (4.5s)│
└─────────────────────────────────┴────────────────────────────────────────┴──────────────────────┘
```

---

## 2. Detailed Breakdown of Architectural Implementations

### Phase 1: Security Hardening, Execution Isolation & Autograder Fixes
* **AST Security Guard (`src/evaluator/sandbox_runner.py`):**
  * Built an Abstract Syntax Tree (AST) static analysis visitor that blocks dangerous modules (`os`, `sys`, `subprocess`, `socket`, `shutil`, `pty`, `pathlib`, etc.) and built-in execution exploits (`eval`, `exec`, `__import__`, `compile`, `breakpoint`).
  * Enforced structured JSON output (`StructuredTestResult`) eliminating exit-code tampering (`sys.exit(0)`) or stderr parsing ambiguities.
* **Autograder Calibration:**
  * **Assignment 1 (`task_01_bpe.py`):** Calibrated the unit test corpus (`test low lowest newer wider`) to ensure deterministic BPE merge orders without arbitrary frequency tie-breaking failures.
  * **Assignment 2 (`task_02_attention.py`):** Fixed PyTorch execution environment by installing PyTorch 2.15.0 with Apple Silicon MPS acceleration.
  * **Assignment 3 (`task_03_perplexity.py`):** Verified perplexity scoring against both uniform test distributions and official Quiz 1 problem sets.
* **Model Discovery Endpoint:** Added `GET /v1/models` in `backend/app/main.py` bound to `127.0.0.1` to provide standards-compliant local model introspection.

---

### Phase 2: Bayesian Knowledge Tracing & Adaptive Learner Engine
To move beyond a static RAG chatbot into a true **Adaptive Learning System**, a dynamic learner model was engineered:
* **SQLite Persistence Layer (`src/learner/db.py`):**
  * Configured SQLite database with Write-Ahead Logging (WAL) and foreign keys enabled.
  * Schema manages: `students`, `topics` (pre-seeded with 12 NLP course topics), `concept_attempts`, `student_mastery`, and `chat_history`.
* **Bayesian Knowledge Tracing (BKT) (`src/learner/mastery.py`):**
  * Tracks probability of skill mastery $P(L_t)$ per syllabus topic:
    $$P(L_t \mid \text{correct}) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$
    $$P(L_t \mid \text{incorrect}) = \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$
    $$P(L_t) \leftarrow P(L_t) + (1 - P(L_t)) \cdot P(T)$$
  * Implemented difficulty-weighted learning updates ($\Delta_{\text{diff}}$) and decay penalties for chronic failure.
  * Constructed a **Directed Acyclic Prerequisite Graph** covering 12 core topics (e.g., *Regex/BPE* $\to$ *N-Gram LM* $\to$ *Neural LM* $\to$ *Attention* $\to$ *Transformers* $\to$ *LLMs*).
  * Generates prioritized practice recommendations targeting weak topics where prerequisite mastery exceeds $0.60$.
* **Integrated Learner APIs:**
  * `GET /api/learner/profile`: Returns student overall mastery, topic breakdowns, and recent attempts.
  * `GET /api/learner/recommendations`: Returns personalized topic recommendations based on prerequisite readiness.
  * `POST /api/learner/events`: Logs learning events and updates mastery dynamically.
  * `GET /api/tutor/history`: Provides persistent multi-turn conversational context for the AI tutor.
  * `POST /api/quiz/submit`: Automatically evaluates quiz answers and updates the student's mastery vector.

---

### Phase 3: RAG Segregation, Relevance Thresholding & LaTeX Cleansing
* **Collection Segregation in ChromaDB (`src/rag/retriever.py`):**
  * Split vector storage into two strictly isolated ChromaDB collections:
    1. **`nlp_course_kb` (885 chunks):** Accessible by student-facing services (`NLPTutorAgent`, `/api/knowledge/search`).
    2. **`instructor_eval_kb` (28 chunks):** Contains official exam questions and instructor answer keys. Restricted exclusively to `SubmissionEvaluator` during rubric grading.
  * Completely eliminated exam answer key leakage to students during open chat queries.
* **Cosine Relevance Thresholding & Out-of-Domain Abstention:**
  * Switched ChromaDB distance metric space to `cosine` and calibrated a strict similarity threshold: `min_similarity = 0.50`.
  * Out-of-domain queries (e.g., general geography or unrelated subjects) yield zero chunks and trigger polite pedagogical abstention without hallucinating fake course slide citations.
* **Curriculum LaTeX Cleansing:**
  * Repaired OCR-garbled mathematical formulas in extracted course Markdown files:
    * `Chapter 09_The Transformer.md` (Slide 29): Replaced broken characters with formatted KaTeX LaTeX:
      $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$
    * `Chapter 03_Language Modeling.md` (Slides 36–37): Repaired exponential notation for Perplexity:
      $$\text{PPL}(W) = \exp\left(-\frac{1}{N} \sum_{i=1}^N \ln P(w_i \mid w_1, \dots, w_{i-1})\right) = \exp(\text{CE})$$
* **Pydantic Schema Validation:**
  * Implemented `EvaluationSchema` and `CriterionBreakdown` in `src/evaluator/grader.py`. Enforces JSON output validity and mathematical consistency (earned score strictly matches the sum of criteria points awarded).
  * Implemented `GeneratedQuizSchema` in `src/models/quiz_generator.py` ensuring type-safe quiz generation.

---

### Phase 4: SFT Dataset Standardization & Model Benchmarking
* **Nucleus Sampling Factual Fix:**
  * Fixed mathematical calculation in `data/sft/exercise_bank.jsonl` and `src/data_processing/build_sft_datasets.py` for top-$p$ nucleus sampling ($p = 0.92$). The cumulative probability sum reaches $\ge 0.92$ only after adding `sleeps` ($0.919$) and `hates` ($0.934$), correctly retaining all 7 candidate tokens.
* **SFT Quality Assurance & Format Standardization (`src/data_processing/validate_sft_dataset.py`):**
  * Validates code snippets via Python AST parsing.
  * Validates LaTeX delimiter balance (`$$` and `$`).
  * Compiles seed items into standard **Chat format** (`messages: [{"role": "system|user|assistant", "content": ...}]`) and **Alpaca format** (`instruction`, `input`, `output`).
  * Generates stratified train/val splits: `nlp_sft_train.jsonl` (12 items) and `nlp_sft_val.jsonl` (4 items).
* **Automated Model Evaluation Benchmark (`src/evaluator/benchmark.py`):**
  * Built an automated benchmarking harness evaluating local LLMs across 4 core competencies:
    1. Mathematical Derivations & LaTeX Delimiter Balancing
    2. PyTorch Code Bug Diagnosis (Inner dimension mismatch & Key transpose)
    3. Rubric Grading Schema Compliance & Arithmetic Concordance
    4. Retrieval Grounding & Out-of-Domain Abstention
  * Executed benchmark on `qwen3.5:latest` and published [`docs/BENCHMARK_REPORT.md`](file:///Users/lmouh/Desktop/ensia/4y/nlp/project/docs/BENCHMARK_REPORT.md) (**90.9% Pass Rate**, 10/11 checks passed).

---

## 3. Current Complete Repository Structure

```text
nlp-project/
├── backend/                        # FastAPI REST API & Streaming Server
│   ├── app/
│   │   ├── main.py                 # FastAPI application, CORS, health & /v1/models
│   │   ├── core/
│   │   │   ├── config.py           # System settings, paths, and model configurations
│   │   │   └── __init__.py
│   │   ├── api/                    # Modular API Routers:
│   │   │   ├── tutor.py            # /api/tutor/chat, /chat/stream, /history
│   │   │   ├── quiz.py             # /api/quiz/generate, /api/quiz/submit
│   │   │   ├── learner.py          # /api/learner/profile, /recommendations, /events
│   │   │   ├── evaluator.py        # /api/evaluator/grade
│   │   │   ├── sandbox.py          # /api/sandbox/tasks, /sandbox/run
│   │   │   ├── knowledge.py        # /api/knowledge/search, /stats
│   │   │   └── __init__.py
│   │   └── __init__.py
│   └── __init__.py
├── frontend/                       # Modern React + Vite + Tailwind CSS + Monaco UI
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css               # KaTeX & Tailwind styling
│   │   ├── components/             # Reusable UI views and components
│   │   └── lib/                    # API client and TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
├── src/                            # Core NLP, RAG, Learner & Evaluator Modules
│   ├── learner/                    # Adaptive Learning Engine
│   │   ├── db.py                   # SQLite persistence layer (WAL mode)
│   │   ├── mastery.py              # Bayesian Knowledge Tracing & Prerequisite Graph
│   │   └── __init__.py
│   ├── rag/                        # Knowledge Retrieval Pipeline
│   │   ├── slide_chunker.py        # Slide boundary parser
│   │   ├── index_knowledge_base.py # ChromaDB segregated collection indexer
│   │   ├── retriever.py            # Cosine-calibrated retriever with thresholding
│   │   └── __init__.py
│   ├── models/                     # LLM Agents & Prompt Templates
│   │   ├── prompts.py              # Grounded system and task prompt engineering
│   │   ├── tutor_agent.py          # Conversational tutor reasoning engine
│   │   ├── quiz_generator.py       # Pydantic-validated question generator
│   │   └── __init__.py
│   ├── evaluator/                  # Code Execution & Evaluation Framework
│   │   ├── grader.py               # Pydantic-validated rubric grading engine
│   │   ├── sandbox_runner.py       # Subprocess runner with AST static security
│   │   ├── benchmark.py            # Automated 4-track model benchmarking harness
│   │   ├── coding_tasks/           # Official programming lab assignments:
│   │   │   ├── task_01_bpe.py      # BPE Tokenizer task & test suite
│   │   │   ├── task_02_attention.py# PyTorch Attention task & test suite
│   │   │   ├── task_03_perplexity.py # Perplexity Calculator task & test suite
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── data_processing/            # Corpus Ingestion & SFT Pipelines
│   │   ├── extract_pdfs.py         # Batch PDF extractor (slides & exams)
│   │   ├── build_sft_datasets.py   # Synthesizer for fine-tuning datasets
│   │   ├── validate_sft_dataset.py # SFT validator, AST/LaTeX checks, train/val split
│   │   └── __init__.py
│   └── __init__.py
├── data/
│   ├── raw/                        # Original slide PDFs and exams
│   ├── processed/                  # Slide-by-slide markdown and JSON chunks
│   ├── chroma_db/                  # Persistent ChromaDB (nlp_course_kb + instructor_eval_kb)
│   ├── learner.db                  # Persistent SQLite database for student mastery
│   └── sft/                        # SFT datasets (Raw, Chat, Alpaca, Train, Val)
├── docs/
│   ├── PROJECT_DELIVERABLES_AND_SPECIFICATION.md # Complete technical specification
│   ├── TEAM_MEETING_AND_DELIVERABLES_ROADMAP.md   # Strategic roadmap & team roles
│   ├── PROGRESS_AND_COMPLETED_WORK_SUMMARY.md     # (This document)
│   ├── BENCHMARK_REPORT.md                       # Empirical model evaluation report
│   └── COMPREHENSIVE_PROJECT_AUDIT.md             # Initial project audit
├── tests/                          # Automated PyTest Test Suite (36/36 passing)
│   ├── test_api.py                 # FastAPI endpoints & security testing
│   ├── test_learner.py             # Knowledge tracing, DB & recommendation tests
│   ├── test_rag_and_schemas.py     # Segregation, thresholding & Pydantic validation
│   ├── test_sandbox.py             # Sandbox isolation, AST security & task tests
│   └── test_sft_and_benchmark.py   # SFT dataset validation & benchmark logic
├── run.sh                          # Unified launch script
├── requirements.txt                # Python dependencies
└── .gitignore                      # Git ignore rules
```

---

## 4. How to Verify & Test the System

### 1. Run the Automated Test Suite (36 Tests)
```bash
python3 -m pytest tests/ -v
```
*Expected Result:* **36 passed** in $< 5.0$ seconds.

### 2. Verify SFT Dataset Validation & Train/Val Splits
```bash
python3 src/data_processing/validate_sft_dataset.py
```
*Expected Result:* 16/16 records validated (AST code valid, LaTeX delimiters balanced), generating `nlp_sft_train.jsonl` (12) and `nlp_sft_val.jsonl` (4).

### 3. Run the Automated Model Evaluation Benchmark
```bash
python3 src/evaluator/benchmark.py
```
*Expected Result:* 4-track evaluation executed against local Ollama, updating `docs/BENCHMARK_REPORT.md`.

### 4. Build and Verify Frontend
```bash
cd frontend && npm run build
```
*Expected Result:* `✓ built in ~1.4s` with 0 TypeScript or bundling errors.

### 5. Launch the Platform
```bash
# Option A: Development mode (FastAPI on :8000 + Vite on :3000)
./run.sh --dev

# Option B: Production mode (FastAPI serves both API and React bundle on :8000)
./run.sh
```

---

## 5. Next Steps (Milestone 3 Roadmap)

With Deliverable 2 (Code Grader Sandbox), Deliverable 4 (Web Platform), and the Core Adaptivity / Learner Engine fully operational:

1. **Scale SFT Dataset to 1,000+ Pairs (Deliverable 1):**
   * Use the standardized format in `src/data_processing/validate_sft_dataset.py` to scale synthetic instruction pairs across all 15 syllabus chapters.
2. **Execute LoRA Fine-Tuning (Deliverable 3):**
   * Fine-tune `qwen2.5-coder:7b` with Hugging Face PEFT/Unsloth on `data/sft/nlp_sft_train.jsonl`.
   * Evaluate the fine-tuned adapter against the validation split using `src/evaluator/benchmark.py` to verify elimination of mathematical and diagnostic hallucinations.
