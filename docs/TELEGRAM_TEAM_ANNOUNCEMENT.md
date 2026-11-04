# 📢 Project Status, Architecture & Team Task Assignments

*Copy and paste the text below directly into your Telegram group or share this markdown file with the team.*

---

Hey team, here is a breakdown of what I've set up so far and where everyone comes in:

### 1. Data (Done & Ready)
* **For Fine-Tuning (`data/sft/`):**
  * I created a dataset of **300 verified items** (240 training in `nlp_sft_train.jsonl`, 60 validation in `nlp_sft_val.jsonl`) formatted in both ChatML and Alpaca.
  * It is based on our actual course materials: **the 15 lecture decks, Quiz 1, 2024 Final Exam, and the Jurafsky & Martin textbook**.
  * All mathematical derivations (Attention variance, Word2Vec, etc.) and calculations (Levenshtein, BPE, Laplace smoothing, MHA parameters) were verified with Python arithmetic to ensure 0% hallucinations.
* **For RAG (`data/processed/markdown/`):**
  * I parsed and cleaned all 15 lecture slide decks into structured markdown with slide metadata, plus 12 textbook chapters and landmark AI papers.

### 2. Frontend (Done & Running)
* Full React + TypeScript + Vite UI with Tailwind and KaTeX math rendering.
* Includes all 5 tabs: **AI Course Tutor Chat, Slide Knowledge Explorer, Practice Quiz Generator, PyTorch Code Sandbox, and Exam Rubric Grader**.
* Compiles cleanly with `npm run build` and runs on `http://localhost:3000`.

### 3. Backend (What is done vs. What is left to do)

#### What is already DONE in `backend/`:
* **FastAPI Architecture & Routing:** Complete API setup with CORS, middleware, and Pydantic request/response validation.
* **All REST Endpoints are wired:**
  * `/api/knowledge/search` & `/stats` (Vector search)
  * `/api/tutor/chat` & `/stream` (Tutor chat)
  * `/api/quiz/generate` & `/submit` (Quiz generation)
  * `/api/sandbox/run` (Code runner)
  * `/api/evaluator/grade` (Rubric grading)
  * `/api/learner/mastery` & `/recommend` (Student progress)
* **Zero-Crash Starter Skeletons:** The backend currently returns safe fallback data so the entire app runs end-to-end without errors.

---

### 4. What is MISSING (What you guys need to implement in `src/`):

You don't need to write any FastAPI or React code! You only implement the core algorithms in `src/`:

* **Teammate on RAG (`src/rag/`):**
  * Take `data/processed/markdown/`.
  * Write the chunking logic (`slide_chunker.py`) and index it into ChromaDB.
  * Implement the search/retriever (`retriever.py`) using cosine similarity / hybrid search.
  * *(Once you do this, `/api/knowledge/search` will return real slides in the UI!)*

* **Teammate on Fine-Tuning (`src/models/`):**
  * Take `data/sft/nlp_sft_train.jsonl` and `nlp_sft_val.jsonl`.
  * Write the LoRA fine-tuning script (`train_lora.py`) using Hugging Face PEFT / SFTTrainer.
  * Train the adapter on our course data and compute evaluation loss / perplexity.

* **Teammate on Autograder & Sandbox (`src/evaluator/`):**
  * Write the rubric evaluation prompt logic in `grader.py` using `data/sft/grading_rubrics.jsonl`.
  * Implement the AST safety checker and subprocess runner in `sandbox_runner.py` to run student PyTorch code safely.

* **Teammate on Student Learner & Quiz (`src/learner/`):**
  * Implement the Bayesian Knowledge Tracing (BKT) formulas and topic recommendation graph in `mastery.py`.
  * Wire up quiz generation in `src/models/quiz_generator.py` using `data/sft/exercise_bank.jsonl`.

---

I also put a full detailed guide in `docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md` detailing every file and task. You can clone `main` and start working on your branch right away!
