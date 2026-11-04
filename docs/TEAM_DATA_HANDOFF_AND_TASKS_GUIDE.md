# ENSIA NLP Adaptive Learning System
# Team Data Hand-off & Module Task Guide

**Curriculum:** 4th Year AI Engineering — Natural Language Processing (NLP)  
**Institution:** National Higher School of Artificial Intelligence (ENSIA)  
**Project:** Project 2 — Adaptive Learning System for the NLP Course  
**Author & Data Lead:** Mohamed (Data & Dataset Deliverable Lead)  
**Audience:** Team Members & Collaborators  
**Document Version:** 1.0  
**Date:** November 4, 2026  

---

## 1. Executive Summary: What Has Been Provided to You

To ensure every team member can focus immediately on implementing their assigned module without getting bogged down in data collection, cleaning, or mathematical verification, **all project data has been curated, verified, and placed on `main`**.

All raw materials have been gathered, converted into clean UTF-8 markdown, and structured into **300 mathematically verified, zero-hallucination instruction pairs**:
* **0% synthetic boilerplate or hallucinated formulas.**
* **100% Python-verified arithmetic** (Laplace smoothing fractions, perplexity values, TF-IDF weights, edit distance tables, MHA parameter counts).
* **100% valid Python AST code** (PyTorch debugging challenges verified with `ast.parse()`).
* **100% balanced LaTeX / KaTeX formulas** for step-by-step mathematical derivations.

Below is your exact module assignment, which data files you should consume, and what you are expected to build.

---

## 2. Module Assignments & Data Hand-off

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TEAM DATA REPOSITORY                              │
│                                                                             │
│  data/raw/ & data/processed/           data/sft/ (300 Verified Pairs)       │
│  - 15 Lecture PDFs                     - 271 Exercise Bank items            │
│  - Jurafsky & Martin SLP3 (646p)       - 11 Math Derivations (Proofs)       │
│  - 4 Landmark Research Papers          - 10 PyTorch Code Debugging modules  │
│  - 4 Exam Answer Keys                  - 8 Official Grading Rubrics         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
 ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
 │ TEAMMATE 1:  │              │ TEAMMATE 2:  │              │ TEAMMATE 3:  │
 │  RAG AGENT   │              │ FINE-TUNING  │              │ AUTOGRADER & │
 │  & RETRIEVAL │              │   PIPELINE   │              │   SANDBOX    │
 └──────────────┘              └──────────────┘              └──────────────┘
```

---

### 👨‍💻 Teammate 1: Retrieval-Augmented Generation (RAG) & Vector Database

#### Your Data Inputs:
* Raw textbooks & papers: `data/raw/textbooks/jurafsky_martin_slp3.pdf`, `data/raw/papers/`
* Raw lectures: `data/raw/lectures/` (15 Chapter slide decks)
* Processed clean Markdown: `data/processed/markdown/` (Textbook, Lectures, Papers, Exams)
* Reference Chunks: `data/processed/chunks/course_chunks.json` & `reference_chunks.json`

#### Your Core Tasks & What to Build:
1. **Semantic Chunking (`src/rag/`):**
   - Review or customize the chunking logic in `src/rag/slide_chunker.py` and `src/rag/reference_chunker.py`.
   - Ensure slide boundaries and chapter metadata (`chapter`, `slide_number`, `source`) are preserved on each chunk.
2. **Vector Indexing (`src/rag/index_knowledge_base.py`):**
   - Index the chunks into ChromaDB (`data/chroma_db/`) using the local embedding model `qwen3-embedding:4b`.
   - Maintain the **3 segregated collections**:
     - `nlp_course_kb` (primary lecture slides)
     - `reference_kb` (deep textbook and landmark papers)
     - `instructor_eval_kb` (exam solutions — strictly protected from student queries)
3. **Retriever Engine (`src/rag/retriever.py`):**
   - Implement `retrieve_hierarchical(query)` to first search course slides, then enrich with textbook reference chunks.
   - Enforce the similarity threshold (`min_similarity = 0.50`) so off-syllabus questions trigger graceful abstention.

---

### 🧠 Teammate 2: LoRA Fine-Tuning Pipeline & Model Benchmark (Deliverable 3)

#### Your Data Inputs:
* Training split: **`data/sft/nlp_sft_train.jsonl`** (240 curriculum pairs — 80%)
* Validation split: **`data/sft/nlp_sft_val.jsonl`** (60 held-out pairs — 20%)
* Standard Formats:
  - ChatML (ShareGPT): `data/sft/nlp_sft_all_chat.jsonl`
  - Alpaca format: `data/sft/nlp_sft_all_alpaca.jsonl`

#### Your Core Tasks & What to Build:
1. **LoRA Fine-Tuning Script (`src/models/train_lora.py`):**
   - Implement the PEFT fine-tuning pipeline using Hugging Face `transformers`, `peft`, and `trl.SFTTrainer`.
   - Base model: `Qwen/Qwen2.5-Coder-7B-Instruct` (or `meta-llama/Llama-3.2-3B-Instruct` / Ollama equivalent).
   - Recommended Hyperparameters:
     - Target modules: `["q_proj", "k_proj", "v_proj", "o_proj"]`
     - LoRA rank $r = 16$, $\alpha = 32$, dropout $= 0.05$
     - Optimizer: `paged_adamw_8bit` (or standard `adamw_torch`)
     - Epochs: 3–5 with cosine learning rate schedule (`lr = 2e-4`).
   - Save the resulting adapter weights to `models/adapters/nlp_tutor_lora/adapter_model.safetensors`.
2. **Benchmark & Evaluation (`src/evaluator/benchmark.py`):**
   - Run the 4-track benchmark comparing the **Base Model** vs. your **Fine-Tuned LoRA Model**.
   - Verify that fine-tuning eliminates mathematical sign errors in attention variance proofs and adheres strictly to ENSIA grading rubric schemas.
   - Update `docs/BENCHMARK_REPORT.md` with the final side-by-side comparison table.

---

### ⚖️ Teammate 3: Automated Evaluator, Rubric Grader & Code Sandbox (Deliverable 2)

#### Your Data Inputs:
* Exam Rubrics: **`data/sft/grading_rubrics.jsonl`** (8 official marking schemes)
* Code Debugging Challenges: **`data/sft/code_debugging.jsonl`** (10 AST-verified PyTorch modules)

#### Your Core Tasks & What to Build:
1. **Rubric Grading Engine (`src/evaluator/grader.py` & `backend/app/api/evaluator.py`):**
   - Ingest the official rubrics from `grading_rubrics.jsonl`.
   - In the grading prompt, force the LLM to award itemized partial credit according to the exact criteria points.
   - Ensure the JSON output schema (`EvaluationResult`) parses successfully and sums sub-scores accurately.
2. **Secure Code Sandbox (`src/evaluator/sandbox_runner.py` & `backend/app/api/sandbox.py`):**
   - Ensure the AST security visitor blocks dangerous modules (`os`, `sys`, `subprocess`, `socket`) and exploits (`eval`, `exec`).
   - Enforce subprocess execution timeout (6.0 seconds).
   - Hook up the 3 curriculum lab assignments (`task_01_bpe.py`, `task_02_attention.py`, `task_03_perplexity.py`) so students can write code in the browser Monaco editor and receive real unit test feedback.

---

### 📝 Teammate 4: Dynamic Quiz Generator & Adaptive Learner Engine

#### Your Data Inputs:
* Exercise Bank: **`data/sft/exercise_bank.jsonl`** (271 verified items across all 15 course topics)
* Learner Database: **`data/learning_state.db`** (SQLite WAL database)

#### Your Core Tasks & What to Build:
1. **Dynamic Quiz Engine (`src/models/quiz_generator.py` & `backend/app/api/quiz.py`):**
   - Allow students to generate quizzes filtered by topic (e.g., Transformers, Naive Bayes, CKY Parsing) and difficulty (beginner, intermediate, advanced).
   - Use `exercise_bank.jsonl` as the ground-truth question bank to guarantee 100% correct answer keys and math.
2. **Bayesian Knowledge Tracing (BKT) (`src/learner/mastery.py`):**
   - Update student topic mastery probabilities ($P(L_t)$) when questions are answered correctly or incorrectly.
   - Respect the 12-topic prerequisite graph to recommend the student's next practice topic.

---

## 3. Data Asset Quick-Reference Table

| File Path | Format | Count | Primary Consumer | Purpose |
| :--- | :---: | :---: | :--- | :--- |
| `data/sft/nlp_sft_train.jsonl` | JSONL | 240 pairs | **Teammate 2 (Fine-Tuning)** | 80% training split for LoRA SFTTrainer. |
| `data/sft/nlp_sft_val.jsonl` | JSONL | 60 pairs | **Teammate 2 (Fine-Tuning)** | 20% held-out split for loss/perplexity validation. |
| `data/sft/exercise_bank.jsonl` | JSONL | 271 items | **Teammate 4 (Quiz Lab)** | Ground-truth question bank with verified math. |
| `data/sft/grading_rubrics.jsonl` | JSONL | 8 rubrics | **Teammate 3 (Autograder)** | Official exam mark schemes with point allocations. |
| `data/sft/code_debugging.jsonl` | JSONL | 10 modules | **Teammate 3 (Code Sandbox)** | PyTorch tensor bug diagnosis and AST-valid fixes. |
| `data/sft/math_derivations.jsonl` | JSONL | 11 proofs | **All / AI Tutor Chat** | Formal mathematical proofs with balanced LaTeX KaTeX. |
| `data/processed/markdown/` | Markdown | 35 files | **Teammate 1 (RAG Engine)** | Clean text of lectures, textbook, papers, and exams. |
| `data/processed/chunks/` | JSON | 1,288 chunks | **Teammate 1 (RAG Engine)** | Pre-computed semantic chunks for vector indexing. |
| `data/chroma_db/` | Vector DB | 1,288 vectors | **All / FastAPI Backend** | 3 segregated Chroma collections indexed with `qwen3-embedding:4b`. |

---

## 4. How to Verify Everything Locally

To verify that your local environment is completely healthy and that all data and tests pass:

```bash
# 1. Run the entire automated test suite
python3 -m pytest tests/ -v

# Expected output: 36 passed in ~6.5 seconds!

# 2. Run the SFT dataset validator
python3 src/data_processing/validate_sft_dataset.py

# Expected output: 300/300 records valid (0 errors, 100% AST pass)
```

If you have any questions about the data schema or need additional topic variations, consult **[`docs/DATA_ARCHITECTURE_AND_USAGE_GUIDE.md`](DATA_ARCHITECTURE_AND_USAGE_GUIDE.md)** or contact Mohamed. Happy coding!
