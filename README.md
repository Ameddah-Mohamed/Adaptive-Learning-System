# ENSIA NLP Adaptive Learning System

An adaptive learning platform designed for the 4th Year Natural Language Processing (NLP) curriculum at the National Higher School of Artificial Intelligence (ENSIA).

The system integrates Retrieval-Augmented Generation (RAG), Bayesian Knowledge Tracing (BKT), Supervised Fine-Tuning (SFT/LoRA), and an AST-secured Python code sandbox to provide interactive tutoring, adaptive quizzing, and automated evaluation using local open-weight models.

---

## Core System Modules

1. **Course Tutor Chat:**
   - Grounded retrieval over 15 lecture slide decks, Jurafsky & Martin (Speech and Language Processing, 3rd ed.), and reference papers.
   - Grounded citations with slide and section references.
   - LaTeX/KaTeX mathematical formula rendering.

2. **Adaptive Quiz Generator:**
   - Topic-based question generation across 15 syllabus chapters.
   - Calibrated across difficulty tiers (Beginner, Intermediate, Advanced).
   - Instant feedback and detailed solutions.

3. **Rubric Evaluator:**
   - Automated grading of open-ended student submissions against official instructor marking schemes.
   - Granular criteria scoring with itemized point breakdowns.

4. **PyTorch Code Sandbox:**
   - Web-based Monaco editor running in an isolated execution environment.
   - Static AST security validation blocking unauthorized system calls and network imports.
   - Automated test runner providing immediate diagnostic feedback.

5. **Knowledge Base Explorer:**
   - Direct query interface across vector collections (`nlp_course_kb`, `reference_kb`, `instructor_eval_kb`).
   - Chapter filtering and cosine similarity score inspection.

---

## Repository Structure

```text
.
├── backend/                        # FastAPI application & API endpoints
│   ├── app/
│   │   ├── main.py                 # Application entry point and router configuration
│   │   ├── core/
│   │   │   └── config.py           # Environment variables, model definitions, and paths
│   │   └── api/
│   │       ├── tutor.py            # /api/tutor/chat and streaming endpoints
│   │       ├── quiz.py             # /api/quiz/generate and submission endpoints
│   │       ├── evaluator.py        # /api/evaluator/grade rubric endpoint
│   │       ├── sandbox.py          # /api/sandbox/tasks and code execution
│   │       ├── knowledge.py        # /api/knowledge/search and stats endpoints
│   │       └── learner.py          # /api/learner/mastery and recommendation endpoints
├── frontend/                       # React 18, TypeScript, Tailwind CSS, Monaco editor
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/             # UI views for tutor, quiz, evaluator, sandbox, and explorer
│   │   └── lib/                    # API client and TypeScript definitions
│   └── package.json
├── src/                            # Core algorithmic engine and data pipeline
│   ├── rag/                        # Chunking, indexing, and ChromaDB retrieval
│   ├── models/                     # LoRA training scripts, prompt templates, and quiz generator
│   ├── evaluator/                  # Rubric grading logic, AST security validator, sandbox runner
│   ├── learner/                    # Bayesian Knowledge Tracing (BKT) and SQLite state storage
│   └── data_processing/            # PDF extraction and SFT dataset generation scripts
├── data/
│   ├── raw/                        # Raw lecture slides, textbooks, exams, and papers
│   ├── processed/                  # Sanitized markdown and pre-computed chunk files
│   ├── sft/                        # 300 verified SFT dataset items (train, val, ChatML, Alpaca)
│   ├── chroma_db/                  # Persistent ChromaDB vector database
│   └── learning_state.db           # SQLite database for student progress tracking
├── docs/                           # Technical documentation and team guides
├── tests/                          # Automated test suite
├── requirements.txt                # Python dependencies
└── run.sh                          # Unified execution script
```

---

## Model Setup

The platform uses local models via Ollama for runtime inference and Hugging Face for fine-tuning.

### 1. Ollama Runtime Models

Download the required models before launching:

```bash
# Vector embedding model for ChromaDB and RAG
ollama pull qwen3-embedding:4b

# Primary reasoning model for tutor chat, quiz, and evaluation
ollama pull qwen3.5:latest
```

*Note: For systems with 8 GB RAM, `qwen2.5:3b` and `nomic-embed-text` can be used as lightweight alternatives.*

### 2. Fine-Tuning Base Model

For local LoRA fine-tuning (`src/models/train_lora.py`):
- **Base model:** `Qwen/Qwen2.5-3B-Instruct`
- Downloaded automatically via the Hugging Face `transformers` library during training execution.

---

## Installation & Setup

### Prerequisites
- Python 3.10 or higher
- Node.js v18 or higher with npm
- Ollama running locally

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## Running the Application

### Production Mode (Single Process)
Builds the frontend and serves both API and static assets from the FastAPI server:
```bash
./run.sh
```
- Web Application: [http://localhost:8000](http://localhost:8000)
- API Documentation (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

### Development Mode (Hot-Reloading)
Runs the FastAPI backend and Vite development server concurrently:
```bash
./run.sh --dev
```
- Frontend Dev Server: [http://localhost:3000](http://localhost:3000)
- Backend API Server: [http://localhost:8000](http://localhost:8000)

---

## Testing

Run the automated test suite:
```bash
python -m pytest tests/ -q
```

Validate the SFT dataset integrity:
```bash
python src/data_processing/validate_sft_dataset.py
```

---

## Documentation

- **Team Task & Data Guide:** [docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md](docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md)
- **Data Architecture & Usage Guide:** [docs/DATA_ARCHITECTURE_AND_USAGE_GUIDE.md](docs/DATA_ARCHITECTURE_AND_USAGE_GUIDE.md)
- **Technical Specification & Deliverables:** [docs/PROJECT_DELIVERABLES_AND_SPECIFICATION.md](docs/PROJECT_DELIVERABLES_AND_SPECIFICATION.md)
