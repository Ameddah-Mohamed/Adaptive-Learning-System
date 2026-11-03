# ENSIA NLP Adaptive Learning & Tutoring Platform

An advanced adaptive learning system explicitly tailored for the **4th Year Natural Language Processing (NLP)** curriculum at the **National Higher School of Artificial Intelligence (ENSIA)**.

The platform functions as an autonomous technical tutor, curriculum-calibrated examiner, and automated code/theory evaluator powered by local open-weight models (`qwen3-embedding:4b`, `qwen3.5:latest`, `qwen2.5-coder:7b`).

---

## 🌟 Key Platform Features

1. **💬 AI Course Tutor Chat:**
   - Grounded in 15 official lecture slide decks (Chapters 01–19), Jurafsky & Martin (SLP3), and landmark research papers (Attention, BERT, LoRA, Word2Vec).
   - Interactive slide & textbook citations `[Chapter 09_The Transformer, Slide 29]` with live inspector previews.
   - Native LaTeX / KaTeX rendering for formal derivations ($\text{Attention}(Q,K,V)$).

2. **📝 Dynamic Quiz & Exam Lab:**
   - On-demand generation across topics (Transformers, Language Modeling, Naive Bayes, CKY Parsing).
   - Calibrated across 3 difficulty tiers (Beginner, Intermediate, Advanced) and 4 formats (MCQ, Calculation, Derivation, Coding).
   - Interactive self-testing with instant correctness feedback, confetti celebration, and expandable instructor solutions/rubrics.

3. **⚖️ Rubric Evaluator & Grader:**
   - Pre-loaded with official ENSIA midterm and final exam questions.
   - Automated assessment against instructor marking schemes with granular points breakdown.
   - Visual KPI scorecard, criterion-by-criterion status (`Passed`, `Partial`, `Failed`), and personalized improvement tips.

4. **💻 PyTorch Code Lab & Sandbox:**
   - Built-in **Monaco Editor** (VS Code in the browser) with Python syntax highlighting and line numbers.
   - Subprocess execution harness running automated `pytest` test suites in isolated sandbox environments.
   - Real-time test output and automated AI diagnostic feedback identifying tensor shape mismatches and masking bugs.

5. **🔍 ChromaDB Vector Knowledge Explorer:**
   - Direct search interface across 1,288 semantic chunks (3 segregated collections: `nlp_course_kb`, `reference_kb`, `instructor_eval_kb`).
   - Filter by chapter, inspect cosine relevance percentages, and read raw slide & textbook excerpts.

---

## 📁 Repository Structure

```text
nlp-project/
├── backend/                        # FastAPI REST API & Streaming Server
│   ├── app/
│   │   ├── main.py                 # FastAPI application & SPA static server
│   │   ├── core/
│   │   │   └── config.py           # System settings, model names, and paths
│   │   └── api/
│   │       ├── tutor.py            # /api/tutor/chat & SSE /chat/stream
│   │       ├── quiz.py             # /api/quiz/generate
│   │       ├── evaluator.py        # /api/evaluator/grade
│   │       ├── sandbox.py          # /api/sandbox/tasks & /sandbox/run
│   │       └── knowledge.py        # /api/knowledge/search & /stats
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
│   └── tailwind.config.js
├── src/                            # Core NLP & Machine Learning Modules
│   ├── rag/
│   │   ├── slide_chunker.py        # Semantic slide parser & chunker
│   │   ├── index_knowledge_base.py # ChromaDB indexer using qwen3-embedding:4b
│   │   └── retriever.py            # Cosine-calibrated retriever with citations
│   ├── models/
│   │   ├── prompts.py              # System & task prompt templates
│   │   ├── tutor_agent.py          # Grounded tutor reasoning engine
│   │   └── quiz_generator.py       # Question & rubric synthesizer
│   ├── evaluator/
│   │   ├── grader.py               # Rubric-aligned submission grader
│   │   ├── sandbox_runner.py       # Subprocess test runner with timeout protection
│   │   └── coding_tasks/           # Official programming lab assignments
│   │       ├── task_01_bpe.py      # BPE Tokenizer task & test suite
│   │       ├── task_02_attention.py# PyTorch Attention task & test suite
│   │       └── task_03_perplexity.py # Perplexity Calculator task & test suite
│   └── data_processing/
│       ├── extract_pdfs.py         # Batch PDF extractor (lecture slides & exams)
│       └── build_sft_datasets.py   # Synthesizer for fine-tuning datasets
├── data/
│   ├── raw/                        # Official slide PDFs, SLP3 textbook, research papers, exams
│   ├── processed/
│   │   ├── markdown/               # Sanitized slide, textbook, paper, and exam markdown
│   │   └── chunks/                 # 1,288 indexed chunks (course_chunks & reference_chunks)
│   ├── chroma_db/                  # Persistent ChromaDB vector database (3 collections)
│   ├── sft/                        # Supervised Fine-Tuning datasets (.jsonl, ChatML & Alpaca)
│   └── learning_state.db           # SQLite database for Bayesian Knowledge Tracing
├── docs/
│   ├── DATA_ARCHITECTURE_AND_USAGE_GUIDE.md     # Complete data & pipeline guide for team
│   ├── PROJECT_DELIVERABLES_AND_SPECIFICATION.md # Comprehensive technical specifications
│   ├── PROGRESS_AND_COMPLETED_WORK_SUMMARY.md    # Completed work & architectural audit
│   └── TEAM_MEETING_AND_DELIVERABLES_ROADMAP.md   # Meeting pitch & 5-person roadmap
├── run.sh                          # Unified one-command launch script
├── requirements.txt                # Python dependencies
└── .gitignore                      # Git ignore rules
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have:
* Python 3.10+ (with Anaconda or standard venv)
* Node.js v18+ and npm
* [Ollama](https://ollama.ai) installed and running locally with:
  ```bash
  ollama pull qwen3-embedding:4b
  ollama pull qwen3.5:latest
  # Recommended for code & math:
  ollama pull qwen2.5-coder:7b
  ```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Launch the Platform (One Command)
Run the root launcher:
```bash
./run.sh
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser. The unified backend serves both the FastAPI API endpoints and the built modern React UI.

### 4. Frontend Development Mode (Hot-Reloading)
If you are developing or modifying the React UI:
```bash
./run.sh --dev
```
* **Frontend Dev Server:** [http://localhost:3000](http://localhost:3000) (instant HMR updates)
* **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 👥 Team Collaboration Reference

For full project requirements, architectural specs, and data guides, refer to:
* **[`docs/DATA_ARCHITECTURE_AND_USAGE_GUIDE.md`](docs/DATA_ARCHITECTURE_AND_USAGE_GUIDE.md)** — **(Must Read)** Complete data pipeline, usage breakdown, and data inventory
* **[`docs/PROJECT_DELIVERABLES_AND_SPECIFICATION.md`](docs/PROJECT_DELIVERABLES_AND_SPECIFICATION.md)** — Comprehensive technical specifications
* **[`docs/TEAM_MEETING_AND_DELIVERABLES_ROADMAP.md`](docs/TEAM_MEETING_AND_DELIVERABLES_ROADMAP.md)** — Team meeting pitch & 5-person roadmap
