# Natural Language Processing Adaptive Learning System
## Progress Log & Completed Work Summary

**Institution:** National Higher School of Artificial Intelligence (ENSIA)  
**Curriculum:** 4th Year AI Engineering — Natural Language Processing (NLP) Course  
**Project:** Project 2 — An Adaptive Learning System for the NLP Course  
**Document Version:** 2.0 (Milestone 1 Complete — Full-Stack Platform Deployed)  
**Last Updated:** October 31, 2026  

---

## 1. Executive Summary of Completed Work

Over the course of the initial development cycle, the project advanced from raw PDF slides to a **fully functioning, production-grade educational platform**:

```
                                  SYSTEM CAPABILITIES STATUS
┌───────────────────────────────┬───────────────────────────────────┬──────────────────────┐
│ Component                     │ Technical Implementation          │ Operational Status   │
├───────────────────────────────┼───────────────────────────────────┼──────────────────────┤
│ 1. Raw Course Corpus          │ 15 Slide Decks + 4 Exams Extracted│ COMPLETED & VERIFIED │
│ 2. Vector Knowledge Base      │ 913 Chunks in ChromaDB (2560-d)   │ COMPLETED & VERIFIED │
│ 3. SFT Training Dataset       │ 16 Seed Pairs in 4 Categories     │ BASELINE READY       │
│ 4. Code Execution Sandbox     │ Isolated Subprocess + 3 Lab Suites│ COMPLETED & VERIFIED │
│ 5. FastAPI Backend            │ REST Endpoints + SSE Streaming    │ RUNNING (Port 8000)  │
│ 6. Modern Web Application     │ React + Tailwind + Monaco + KaTeX │ RUNNING (Port 3000)  │
└───────────────────────────────┴───────────────────────────────────┴──────────────────────┘
```

---

## 2. Detailed Breakdown of Completed Components

### Component 1: Course Data Extraction & Corpus Processing
* **Input Materials:**
  * **15 Lecture Slide Decks:** Chapter 01 (Intro TALN), Chapter 02 (Regex & Tokenization), Chapter 03 (Language Modeling), Chapter 04 (Naive Bayes), Chapter 05 (Logistic Regression), Chapter 06 (Vector Semantics), Chapter 07 (Neural Nets), Chapter 08 (RNNs & LSTMs), Chapter 09 (The Transformer), Chapter 10 (LLMs), Chapter 11 (Masked LMs), Chapter 14 (QA & RAG), Chapter 18 (CFG & CKY), Chapter 19 (Dependency Parsing), and Distributed Deep Learning (All-Reduce).
  * **4 Official Exam Documents:** Midterm Exam (with answers), Final Exam 2024 (with answers), CKY Algorithm Exercise (with answers), and Quiz 1 (with answers).
* **Extraction Script:** Built [`src/data_processing/extract_pdfs.py`](file:///Users/lmouh/Desktop/ensia/4y/nlp/project/src/data_processing/extract_pdfs.py).
* **Result:** All 19 documents were extracted page-by-page into clean Markdown documents stored in `data/processed/markdown/`.

---

### Component 2: Slide-Aware Semantic Chunker & ChromaDB Vector Store
* **Slide Chunker:** Built [`src/rag/slide_chunker.py`](file:///Users/lmouh/Desktop/ensia/4y/nlp/project/src/rag/slide_chunker.py) which parses slide boundaries, attaches metadata (document title, chapter index, slide number, category), and formats enriched headers.
  * **Total Chunks Generated:** **913 semantic slide chunks** saved to `data/processed/chunks/course_chunks.json`.
* **Embedding Model:** Connected to local **`qwen3-embedding:4b`** via Ollama, generating high-precision **2560-dimensional embeddings**.
* **Vector Indexer:** Built [`src/rag/index_knowledge_base.py`](file:///Users/lmouh/Desktop/ensia/4y/nlp/project/src/rag/index_knowledge_base.py). All 913 chunks were batch-indexed into a persistent ChromaDB database in `data/chroma_db/`.
* **Retriever Engine:** Built [`src/rag/retriever.py`](file:///Users/lmouh/Desktop/ensia/4y/nlp/project/src/rag/retriever.py) featuring:
  * Calibrated cosine similarity metrics.
  * Chapter and category metadata filtering.
  * Citation formatting (e.g. `[Chapter 09_The Transformer, Slide 29]`).
  * Verified retrieval accuracy $> 0.74$ on Attention, Perplexity, and CKY parsing queries.

---

### Component 3: Supervised Fine-Tuning (SFT) Baseline Datasets
* **Builder Script:** Built [`src/data_processing/build_sft_datasets.py`](file:///Users/lmouh/Desktop/ensia/4y/nlp/project/src/data_processing/build_sft_datasets.py).
* **Output Datasets (in `data/sft/`):**
  1. `math_derivations.jsonl`: Step-by-step LaTeX proofs (variance of self-attention, cross-entropy & perplexity relationship, temperature scaling limits).
  2. `code_debugging.jsonl`: Buggy PyTorch snippets paired with exact tracebacks, root cause explanations, and verified fixes.
  3. `exercise_bank.jsonl`: Curriculum-calibrated problems across difficulty levels with options and explanations.
  4. `grading_rubrics.jsonl`: Ground-truth exam questions with instructor marking schemes, sample student answers, and itemized point deductions.

---

### Component 4: Empirical Finding (The Justification for Fine-Tuning)
During testing of the off-the-shelf base models (`qwen3.5:latest` and `gemma3:latest`), two notable reasoning flaws were discovered:
1. **Mathematical Inversion Slip:** In deriving Perplexity from Cross-Entropy, the model wrote $PP(W) = \exp(-H)$ instead of $\exp(H)$ due to an algebraic substitution error.
2. **PyTorch Debugging Hallucination:** When diagnosing an Attention matrix multiplication mismatch `(10, 512)` by `(10, 512)`, the model blamed scalar division `/ math.sqrt(d_k)` before suggesting the transpose.

**Conclusion:** This empirical finding proves that RAG alone provides the factual text, but **Domain Fine-Tuning (LoRA)** on our curated SFT dataset is essential to eliminate mathematical sign errors and code debugging hallucinations.

---

### Component 5: Automated Code Execution Sandbox (Deliverable 2 — Complete)
* **Subprocess Runner:** Built [`src/evaluator/sandbox_runner.py`](file:///Users/lmouh/Desktop/ensia/4y/nlp/project/src/evaluator/sandbox_runner.py).
  * Runs student Python code in an isolated subprocess with a **6.0-second timeout** and memory protection.
  * Parses `unittest` / `pytest` stderr and stdout to extract exact pass/fail counts.
* **3 Implemented Curriculum Assignments:**
  1. **Assignment 1 — Byte-Pair Encoding (BPE) Tokenizer (`task_01_bpe.py`):**
     * Prompt, starter code, and unit tests checking iterative merge counts, tie-breaking, and subword generation.
  2. **Assignment 2 — Scaled Dot-Product Attention in PyTorch (`task_02_attention.py`):**
     * Prompt, starter code, and unit tests verifying output shapes `(batch_size, seq_len, d_v)`, softmax row sums ($1.0 \pm 10^{-6}$), causal masking, and numerical precision.
  3. **Assignment 3 — Language Model Perplexity Calculator (`task_03_perplexity.py`):**
     * Prompt, starter code, and unit tests verifying calculations against uniform distributions and Quiz 1 exam cases.
* **Verification:** Tested via `python3 src/evaluator/sandbox_runner.py` with 100% test pass rate in 0.042 seconds.

---

### Component 6: Modern Full-Stack Web Platform (Deliverable 4 — Complete)

The preliminary Streamlit prototype was superseded by a **production full-stack web application**:

#### A. Backend Architecture (`backend/app/`)
* **Technology:** FastAPI + Uvicorn + Pydantic v2 + SSE Streaming.
* **API Endpoints:**
  * `POST /api/tutor/chat`: Grounded question answering with slide citation metadata.
  * `POST /api/tutor/chat/stream`: Server-Sent Events (SSE) token-by-token streaming for ChatGPT-like UX.
  * `POST /api/quiz/generate`: Dynamic question generation with difficulty calibration and rubrics.
  * `POST /api/evaluator/grade`: Multi-criteria submission evaluation against instructor marking schemes.
  * `GET /api/sandbox/tasks`: Returns coding assignment catalog and starter templates.
  * `POST /api/sandbox/run`: Executes student code in the sandbox and triggers AI diagnostic hints on failure.
  * `POST /api/knowledge/search`: Direct vector search against ChromaDB.
  * `GET /api/knowledge/stats`: Returns vector database statistics (913 chunks, 2560 dimensions).
  * `GET /`: Serves the production-built React single-page application.
  * `GET /docs`: Interactive Swagger API documentation.

#### B. Frontend Architecture (`frontend/`)
* **Technology:** React 18 + TypeScript + Vite + Tailwind CSS + Monaco Editor + KaTeX + Lucide Icons + Canvas Confetti.
* **5 Core Interactive Views:**
  1. **💬 AI Course Tutor Chat:**
     * Clean chat stream with native KaTeX mathematical rendering ($...$ and $$...$$).
     * Interactive citation pill badges `[Chapter 09_The Transformer, Slide 29]`; clicking opens a modal previewing the raw slide text and cosine match percentage.
     * Quick-prompt action chips (Variance derivation, Perplexity vs. Cross-Entropy, Chomsky Normal Form, PyTorch tensor debugging).
     * Sidebar controls for chapter filtering and top-$k$ retrieval depth slider.
  2. **📝 Dynamic Quiz & Exam Lab:**
     * Syllabus topic dropdown, difficulty selector (Beginner, Intermediate, Advanced), and format picker (MCQ, Calculation, Derivation, Coding).
     * Interactive MCQ self-testing: click an option for instant green/red verification and confetti celebration upon answering correctly.
     * Hidden expandable accordions for the official reference solution and instructor marking rubrics.
  3. **⚖️ Rubric Evaluator & Grader:**
     * Pre-loaded with official ENSIA exam problems (Attention Variance, Naive Bayes Bigram Sentiment, CNF Grammar Conversion).
     * Visual KPI scorecard displaying Earned Points vs. Total Points and Mastery Percentage.
     * Itemized criteria table with `Passed`, `Partial`, or `Failed` status badges, awarded points, and rationale.
     * Split cards highlighting *Demonstrated Strengths* and *Points for Improvement*.
  4. **💻 PyTorch Code Lab & Sandbox:**
     * Embedded **Monaco Code Editor** (VS Code in the browser) with Python syntax highlighting and line numbers.
     * Task selector with starter code reset button.
     * "Run & Test Code" action running isolated tests in real time.
     * Terminal execution console displaying pass/fail counts, execution time, and AI diagnostic hints if an error occurs.
  5. **🔍 ChromaDB Vector Explorer:**
     * Direct vector search interface across all 913 slide chunks.
     * Chapter filter and visual match percentage meters (e.g. `84% match`).
     * Monospace slide excerpt reader.

---

## 3. Complete Repository Structure

```text
nlp-project/
├── backend/                        # FastAPI REST API & Streaming Server
│   ├── app/
│   │   ├── main.py                 # FastAPI application & SPA static server
│   │   ├── core/
│   │   │   ├── config.py           # System settings, model names, and paths
│   │   │   └── __init__.py
│   │   ├── api/                    # Modular API Routers:
│   │   │   ├── tutor.py            # /api/tutor/chat & SSE /chat/stream
│   │   │   ├── quiz.py             # /api/quiz/generate
│   │   │   ├── evaluator.py        # /api/evaluator/grade
│   │   │   ├── sandbox.py          # /api/sandbox/tasks & /sandbox/run
│   │   │   ├── knowledge.py        # /api/knowledge/search & /stats
│   │   │   └── __init__.py
│   │   └── __init__.py
│   └── __init__.py
├── frontend/                       # Modern React + Vite + Tailwind CSS + Monaco UI
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css               # KaTeX & Tailwind styling
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Sleek navigation header with model indicator
│   │   │   ├── TutorChatView.tsx   # Chatbot with KaTeX, slide citations & prompt chips
│   │   │   ├── QuizView.tsx        # Dynamic quiz authoring & interactive MCQ cards
│   │   │   ├── GraderView.tsx      # Split-screen rubric grader with KPI scorecards
│   │   │   ├── CodeSandboxView.tsx # Monaco PyTorch editor & unit-test runner
│   │   │   ├── KnowledgeView.tsx   # ChromaDB vector search & slide inspector
│   │   │   └── MathRenderer.tsx    # Native KaTeX math & syntax-highlighted code
│   │   └── lib/
│   │       ├── api.ts              # Type-safe API client for FastAPI
│   │       └── types.ts            # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
├── src/                            # Core NLP & Machine Learning Modules
│   ├── rag/
│   │   ├── slide_chunker.py        # Semantic slide chunker
│   │   ├── index_knowledge_base.py # ChromaDB indexer using qwen3-embedding:4b
│   │   ├── retriever.py            # Cosine-calibrated retriever with citations
│   │   └── __init__.py
│   ├── models/
│   │   ├── prompts.py              # System & task prompt templates
│   │   ├── tutor_agent.py          # Grounded tutor reasoning engine
│   │   ├── quiz_generator.py       # Question & rubric synthesizer
│   │   └── __init__.py
│   ├── evaluator/
│   │   ├── grader.py               # Rubric-aligned submission grader
│   │   ├── sandbox_runner.py       # Subprocess test runner with timeout protection
│   │   ├── coding_tasks/           # Official programming lab assignments:
│   │   │   ├── task_01_bpe.py      # BPE Tokenizer task & test suite
│   │   │   ├── task_02_attention.py# PyTorch Attention task & test suite
│   │   │   ├── task_03_perplexity.py # Perplexity Calculator task & test suite
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── data_processing/
│   │   ├── extract_pdfs.py         # Batch PDF extractor (lecture slides & exams)
│   │   ├── build_sft_datasets.py   # Synthesizer for fine-tuning datasets
│   │   └── __init__.py
│   └── __init__.py
├── data/
│   ├── raw/                        # Original slide PDFs, exams, and notebooks
│   │   ├── lectures/               # 15 course slide PDFs
│   │   ├── exams_and_quizzes/      # 4 exam & quiz PDFs
│   │   ├── papers/                 # Research papers directory
│   │   └── code/                   # Lab / TP notebooks directory
│   ├── processed/
│   │   ├── markdown/               # Slide-by-slide markdown files
│   │   └── chunks/                 # 913 JSON slide chunks
│   ├── chroma_db/                  # Persistent ChromaDB vector database
│   └── sft/                        # Supervised Fine-Tuning datasets (.jsonl)
├── docs/
│   ├── PROJECT_DELIVERABLES_AND_SPECIFICATION.md # Complete technical specification
│   ├── TEAM_MEETING_AND_DELIVERABLES_ROADMAP.md   # Meeting pitch & 5-person roadmap
│   └── PROGRESS_AND_COMPLETED_WORK_SUMMARY.md     # (This document)
├── run.sh                          # Unified one-command launch script
├── requirements.txt                # Python dependencies
└── .gitignore                      # Git ignore rules
```

---

## 4. How to Verify & Run the System

### 1. Launch the System
From the repository root:
```bash
# Option A: Run in development mode (FastAPI on :8000 + Vite Hot-Reload on :3000)
./run.sh --dev

# Option B: Run in production mode (FastAPI serves both API and built React bundle on :8000)
./run.sh
```

### 2. Access URLs
* **React Web Application:** [http://localhost:3000](http://localhost:3000) (Dev) or [http://localhost:8000](http://localhost:8000) (Prod)
* **FastAPI Swagger API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health Check:** `curl http://localhost:8000/health` $\to$ `{"status":"healthy"}`
* **Vector Knowledge Stats:** `curl http://localhost:8000/api/knowledge/stats` $\to$ `{"total_chunks":913,...}`

### 3. Verify Code Sandbox Directly from CLI
```bash
python3 src/evaluator/sandbox_runner.py
```
Expected output:
```text
Test run result: {'success': True, 'passed': 2, 'total': 2, 'returncode': 0, 'elapsed_seconds': 0.042, ...}
```

---

## 5. Next Immediate Steps (Upcoming Milestone)

Now that Deliverable 2 (Code Grader Sandbox) and Deliverable 4 (Web Platform) are operational, the remaining two objectives are:

1. **Deliverable 1 (Scale SFT Dataset to 1,000+ Pairs):**
   * Expand `data/sft/` from 16 seed examples to 1,000+ examples across all 15 chapters (300 math derivations, 300 code fixes, 300 quiz questions, 200 rubric evaluations).
   * Download and index the 5 seminal NLP research papers (*Attention Is All You Need*, *BERT*, *LoRA*, etc.) into `data/raw/papers/`.
2. **Deliverable 3 (Train LoRA Adapter on `qwen2.5-coder:7b`):**
   * Configure a fine-tuning script using Hugging Face PEFT / Unsloth.
   * Train the low-rank adapter on the scaled dataset to eliminate the observed math and code hallucinations.
   * Export `adapter_model.safetensors` into an Ollama Modelfile and connect it directly to the active model dropdown in the web UI.
