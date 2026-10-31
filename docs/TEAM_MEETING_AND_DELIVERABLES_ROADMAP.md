# ENSIA NLP Adaptive Learning System
## Team Strategy, Meeting Agenda & Deliverables Roadmap

**Course:** Natural Language Processing (4th Year AI Engineering)  
**Institution:** National Higher School of Artificial Intelligence (ENSIA)  
**Project:** Project 2 — An Adaptive Learning System for the NLP Course  
**Team Size:** 5 Members  
**Document Version:** 2.0 (Milestone 2 Complete — Core Adaptivity & Platform Hardened)  
**Last Updated:** October 31, 2026  

---

## 1. Executive Summary & Current Status

Over the course of the architectural overhaul sprints (Phases 1 through 4), the project reached a major milestone: transitioning from a standard RAG/chat interface into a **true, secure, and mathematically grounded Adaptive Learning System**:

* **Corpus Processing & Dual-Collection Segregation:** All **15 official lecture slide decks (Chapters 01–19 + Distributed DL)** and **4 official exams/quizzes with ground-truth answer keys** were parsed and converted into slide-by-slide Markdown. Vector storage is segregated into `nlp_course_kb` (885 lecture chunks) and `instructor_eval_kb` (28 exam chunks) using `qwen3-embedding:4b` with cosine similarity thresholding (`min_similarity = 0.50`), completely preventing exam answer leakage.
* **Core Adaptivity & Learner Engine (Deliverable Milestone):** Built a persistent **Bayesian Knowledge Tracing (BKT)** engine in `src/learner/mastery.py` and SQLite WAL persistence in `src/learner/db.py`. Tracks student topic mastery probabilities ($P(L_t)$), slip ($s$), guess ($g$), and transition ($T$) rates across a 12-topic prerequisite graph, generating personalized practice recommendations.
* **Deliverable 2 Completed (Code Autograder & Security Sandbox):** Hardened `src/evaluator/sandbox_runner.py` with static Abstract Syntax Tree (AST) security analysis (blocking dangerous imports and execution exploits), 6.0s timeout enforcement, and deterministic JSON results across 3 curriculum labs:
  1. *Assignment 1:* BPE Tokenizer (`task_01_bpe.py`).
  2. *Assignment 2:* Scaled Dot-Product Attention in PyTorch (`task_02_attention.py`).
  3. *Assignment 3:* Language Model Perplexity (`task_03_perplexity.py`).
* **Deliverable 4 Completed (Production Full-Stack Web Platform):** Deployed a modern, high-performance web platform:
  1. *FastAPI Backend (`http://localhost:8000`):* 14 REST endpoints, SSE streaming, multi-turn conversational memory, learner profile/recommendations, and interactive OpenAPI docs at `/docs`.
  2. *Modern React + TypeScript + Tailwind UI (`http://localhost:3000` / `:8000`):* Features KaTeX math rendering, Perplexity-style slide citation modals, interactive MCQ cards with confetti, rubric scorecards, and an embedded **Monaco Editor** for live PyTorch lab testing.
* **Deliverable 1 & 3 Foundations (Standardized SFT & Benchmark Harness):** Corrected the nucleus sampling ($p=0.92$) calculation bug, standardized datasets into standard Chat (`messages`) and Alpaca formats with train/val splits (`validate_sft_dataset.py`), and established an automated 4-track model benchmarking harness (`src/evaluator/benchmark.py`) with a verified **90.9% baseline score** on `qwen3.5:latest` (`docs/BENCHMARK_REPORT.md`).
* **Test Suite Verification:** 36 automated unit tests passing in $< 5.0$s across `tests/`.

---

## 2. Team Meeting Pitch (3–5 Minute Script)

Use this script during your team synchronization meeting:

> *"Hey everyone! We have made massive engineering progress on our NLP Adaptive Learning System and resolved the fundamental architectural gaps identified in our initial audit.*
>
> *Here is what is currently working live on our local stack:*
> 1. *We have a **Dual-Collection Vector Store** in ChromaDB that segregates student course materials (885 slides) from instructor exam solutions (28 items), with cosine similarity thresholding at 0.50. This means the tutor grounds answers strictly in lectures and abstains from off-syllabus queries without ever leaking exam answer keys.*
> 2. *We built an **Adaptive Learner Engine** backed by SQLite with Write-Ahead Logging and Bayesian Knowledge Tracing. The system actively models each student's mastery across 12 NLP topics, respects prerequisite relationships, and dynamically serves tailored quiz recommendations.*
> 3. *Our **Code Execution Sandbox** is now fully hardened with AST-level static security checks, memory/timeout protection, and deterministic JSON grading for our 3 PyTorch/NLP lab assignments.*
> 4. *Our **Full-Stack Web Platform** (FastAPI + React 18 + Tailwind + Monaco Editor + KaTeX) compiles cleanly with zero errors and supports multi-turn conversational memory, interactive quiz testing, and rubric scoring.*
> 5. *We fixed the nucleus sampling bug in our SFT dataset, converted all data into standard Chat and Alpaca schemas with train/val splits, and established an automated model benchmark harness where Qwen 3.5 scores 90.9%.*
>
> *(Show a quick live demo: run `python3 -m pytest tests/` to show all 36 tests passing in 4.5 seconds, open the React app, ask a question to show grounded slide citations, run an adaptive quiz, and execute a PyTorch lab).*
>
> *Deliverables 2 and 4, the adaptivity engine, and the benchmark harness are fully complete. For our next milestone, our team's clear focus is scaling our standardized SFT dataset to 1,000+ pairs (Deliverable 1) and fine-tuning our LoRA adapter to eliminate remaining math sign slips (Deliverable 3)."*

---

## 3. Detailed Breakdown of the 4 Core Deliverables

---

### Deliverable 1: Scaled & Validated SFT Dataset (1,000+ JSONL Pairs)

#### A. Purpose
To fine-tune an open-source model (e.g., `qwen2.5-coder:7b` or `Llama-3-8B`), moving beyond general conversation to enforce mathematical precision, PyTorch runtime awareness, and strict rubric compliance.

#### B. Repository File Structure
```text
data/sft/
├── nlp_sft_all_chat.jsonl     # Standardized multi-turn Chat format (OpenAI / HuggingFace schema)
├── nlp_sft_all_alpaca.jsonl   # Standardized Alpaca format (instruction, input, output)
├── nlp_sft_train.jsonl        # Stratified training split
├── nlp_sft_val.jsonl          # Stratified validation split
├── math_derivations.jsonl     # Step-by-step LaTeX derivations and proofs
├── code_debugging.jsonl       # Buggy PyTorch snippets -> diagnosis + fix
├── exercise_bank.jsonl        # Calibrated MCQs, calculations, and explanations
└── grading_rubrics.jsonl      # (Question + Rubric + Student Answer -> Grade)
```

#### C. Validation & Formatting Tool
```bash
python3 src/data_processing/validate_sft_dataset.py
```
Validates:
1. Python AST parsing of all code snippets (`check_code_syntax`).
2. Mathematical delimiter balance for single `$` and double `$$` (`check_latex_balance`).
3. Correctness of nucleus sampling cumulative calculations.

---

### Deliverable 2: Automated Coding Assignment Grader & Test Sandbox

#### A. Purpose
Fulfills Section 3 of the project description: *"a submission evaluator that checks both theoretical reasoning and python code correctness"* and *"an automated grading module for coding assignments"*.

#### B. Architecture & Security
* **Static AST Validation:** Inspects code before execution, blocking prohibited imports (`os`, `sys`, `subprocess`, `socket`, `pty`, etc.) and dangerous calls (`eval`, `exec`, `breakpoint`, `__import__`).
* **Subprocess Isolation:** Runs execution with a 6.0-second timeout guard.
* **Deterministic Results:** Emits `StructuredTestResult` JSON payloads, preventing exit code spoofing or false passes.

#### C. Implementation Status & Verification Method
**Status: COMPLETED & OPERATIONAL ✅**
Test execution directly:
```bash
python3 src/evaluator/sandbox_runner.py
# Or via automated test suite:
python3 -m pytest tests/test_sandbox.py -v
```

---

### Deliverable 3: Trained LoRA Fine-Tuning Adapter & Evaluation Benchmark

#### A. Purpose
Adapts an open-weight base model so that its neural weights naturally produce ENSIA-aligned terminology, step-by-step KaTeX math, and rubric-driven evaluations without relying on large prompt contexts.

#### B. Benchmarking Pipeline (`src/evaluator/benchmark.py`)
Evaluates models against 4 rigorous automated tracks:
1. **Mathematical Derivations:** Verifies LaTeX delimiter balance and correct exponential sign ($\exp(H)$ vs $\exp(-H)$).
2. **PyTorch Code Diagnosis:** Detects inner dimension mismatches in attention and recommends Key transpose (`k.transpose(-2, -1)`).
3. **Rubric Grading Concordance:** Verifies Pydantic `EvaluationSchema` compliance and arithmetic consistency.
4. **Retrieval Grounding & Abstention:** Asserts presence of grounded slide citations for in-domain queries and polite abstention without false citations for out-of-domain queries.

**Status:** Benchmarking harness implemented and verified against `qwen3.5:latest` (`docs/BENCHMARK_REPORT.md` — 90.9% Score). Ready to evaluate fine-tuned LoRA checkpoints.

---

### Deliverable 4: Fully Integrated Web Platform & Adaptive Engine

#### A. Purpose
A unified interface bringing together RAG retrieval, Bayesian Knowledge Tracing, automated code execution, and rubric evaluation for students and instructors.

#### B. Component Architecture
```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    React + TypeScript + Vite + Tailwind CSS Frontend                     │
│               (Dev Server: http://localhost:3000 | Production: http://localhost:8000)   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Header: ENSIA NLP Brain Indicator | Active LLM Badge | Indexed Chunks Counter (885)   │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┬────────────────┤
│ 💬 AI Tutor     │ 📝 Quiz Lab     │ ⚖️ Evaluator     │ 💻 PyTorch Lab   │ 🔍 Explorer    │
│ - Multi-Turn Mem│ - Adaptive Topic│ - KPI Scorecard │ - Monaco Editor  │ - Cosine Match%│
│ - Slide Modals  │ - Difficulty BKT│ - Rubric Matrix │ - Pytest Sandbox │ - Slide Reader │
│ - KaTeX Proofs  │ - Confetti Party│ - Feedback Split│ - AI Error Hints │ - Excerpt Tags │
├─────────────────┴─────────────────┴─────────────────┴──────────────────┴────────────────┤
│                                      REST & SSE API                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                         FastAPI Backend Server (http://localhost:8000)                  │
│   /api/tutor/chat   |   /api/quiz/generate   |   /api/learner/profile  |  /api/sandbox  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### C. Implementation Status & Launch Instructions
**Status: COMPLETED & OPERATIONAL ✅**
```bash
./run.sh --dev
```
* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API & Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4. Work Distribution for Team of 5 (Next Sprint)

| Team Member | Functional Role | Primary Deliverable | Core Tasks |
| :--- | :--- | :--- | :--- |
| **Person 1 (Lead)** | **System Integration & Platform Architecture** | Platform Scalability & Knowledge Tracing Integration | • Integrate learner mastery radar chart / progress bar in the frontend UI.<br>• Implement hybrid search (BM25 keyword + dense vector retrieval).<br>• Connect fine-tuned LoRA model checkpoints to the runtime selector. |
| **Person 2** | **SFT Dataset Scaling & Paper Curation** | 1,000+ validated training pairs in `data/sft/` | • Use `validate_sft_dataset.py` to synthesize 300 math derivations, 300 code fixes, 300 quiz questions, and 200 rubric tuples.<br>• Download and index 5 seminal NLP research papers (*Attention Is All You Need*, *BERT*, *LoRA*, etc.) into ChromaDB. |
| **Person 3** | **Practical Code Lab & Assignment Suites** | Expand Coding Assignments & Pytest Suites | • Add 3 additional course lab assignments to `src/evaluator/coding_tasks/` (e.g. RNN forward step, Multi-Head projection, CKY parsing).<br>• Expand unit-test edge cases and calibrate automated diagnostic hints. |
| **Person 4** | **Model Adaptation & Fine-Tuning (LoRA)** | Trained `adapter_model.safetensors` + Ollama package | • Configure LoRA/QLoRA pipeline on `qwen2.5-coder:7b` (using Unsloth or Hugging Face PEFT).<br>• Train model on Person 2's scaled dataset.<br>• Package adapter into an Ollama Modelfile and benchmark via `src/evaluator/benchmark.py`. |
| **Person 5** | **Evaluation, Trustworthiness & Safety** | Benchmark Reporting & Safety Pipelines | • Run `src/evaluator/benchmark.py` on all baseline and fine-tuned checkpoints.<br>• Measure inter-annotator agreement (Cohen's Kappa) between rubric grading and official exam solutions.<br>• Implement rate-limiting and prompt injection guards. |

---

## 5. Next Milestone Checklist

- [x] Segregated ChromaDB collections preventing exam leakage.
- [x] Bayesian Knowledge Tracing & SQLite persistence layer operational.
- [x] Security-hardened code execution sandbox with AST checks and timeout protection.
- [x] Standardized Chat and Alpaca SFT datasets with train/val splits and quality validators.
- [x] Automated model benchmarking harness operational (`docs/BENCHMARK_REPORT.md` — 90.9%).
- [x] 36 automated unit tests passing across all suites.
- [ ] Scale SFT dataset to $\ge 1,000$ validated entries across all 15 course chapters.
- [ ] Train LoRA adapter on `qwen2.5-coder:7b` with smooth convergence loss curves.
- [ ] Evaluate fine-tuned checkpoint on `src/evaluator/benchmark.py` targeting 100% pass rate.
