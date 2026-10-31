# ENSIA NLP Adaptive Learning System
## Team Strategy, Meeting Agenda & Deliverables Roadmap

**Course:** Natural Language Processing (4th Year AI Engineering)  
**Institution:** National Higher School of Artificial Intelligence (ENSIA)  
**Project:** Project 2 — An Adaptive Learning System for the NLP Course  
**Team Size:** 5 Members  
**Document Version:** 1.0 (Milestone 1 to Milestone 2 Transition)  
****
---

## 1. Executive Summary & Current Status

In the initial milestone of data curation, system design, and platform engineering, the core architecture has been fully established:

* **Corpus Processing:** All **15 official lecture slide decks (Chapters 01–19 + Distributed DL)** and **4 official exams/quizzes with ground-truth answer keys** were parsed and converted into slide-by-slide Markdown.
* **Vector Knowledge Base:** A slide-aware chunker created **913 semantic chunks** indexed into a persistent **ChromaDB** vector database utilizing **`qwen3-embedding:4b`** with calibrated cosine similarity retrieval.
* **Deliverable 2 Completed (Code Autograder & Sandbox):** Engineered `src/evaluator/sandbox_runner.py` with isolated subprocess execution, memory/timeout protection, and 3 curriculum assignment suites:
  1. *Assignment 1:* BPE Tokenizer (`task_01_bpe.py`).
  2. *Assignment 2:* Scaled Dot-Product Attention in PyTorch (`task_02_attention.py`).
  3. *Assignment 3:* Language Model Perplexity (`task_03_perplexity.py`).
* **Deliverable 4 Completed (Production Full-Stack Web Platform):** Deployed a modern, high-performance web platform replacing preliminary prototypes:
  1. *FastAPI Backend (`http://localhost:8000`):* REST endpoints and SSE token-by-token streaming, with interactive OpenAPI docs at `/docs`.
  2. *Modern React + TypeScript + Tailwind UI (`http://localhost:3000`):* Featuring KaTeX math rendering, Perplexity-style slide citation modals, interactive MCQ cards with confetti, circular scorecards, and an embedded **Monaco Editor** (VS Code in the browser) for live PyTorch testing.
* **Empirical Finding (The Justification for Fine-Tuning):** Testing revealed that while RAG retrieves correct course facts, general off-the-shelf models still produce mathematical sign slips (e.g. algebraic substitution errors in Perplexity derivations) and code debugging hallucinations (e.g. blaming scalar division for tensor dimension mismatches). This provides empirical proof for **Phase 3 (Domain Adaptation & Fine-Tuning)** as mandated by the course specification.

---

## 2. Team Meeting Pitch (3–5 Minute Script)

Use this script during your team synchronization meeting:

> *"Hey everyone! To make sure we hit all milestone requirements, I set up our core project architecture and built a production-grade full-stack platform.*
>
> *Here is what is currently working live on our local stack:*
> 1. *I extracted all **15 lecture slide decks** and **4 official ENSIA exams/quizzes with full answer keys**.*
> 2. *I segmented the syllabus into **913 slide chunks** and indexed them into a local **ChromaDB** vector store using `qwen3-embedding:4b`.*
> 3. *I implemented the core reasoning engines: an **NLP Tutor** with slide citation modals, an **automated Quiz Generator**, and an **exam Rubric Grader**.*
> 4. *I built the **Automated Code Sandbox** with 3 complete coding assignments (BPE Tokenizer, PyTorch Attention, Perplexity) that runs unit tests in isolated subprocesses.*
> 5. *I built and launched a modern **React + Vite + Tailwind + Monaco Editor** web application on `localhost:3000` powered by a **FastAPI** streaming backend on `localhost:8000`.*
>
> *(Show a quick 1-minute live demo: ask a question in the tutor to show KaTeX math and slide citation modals, run a quiz, and click 'Run & Test Code' in the Monaco editor to show the unit tests passing).*
>
> *Now, having tested this with our course slides, I noticed a critical finding: while RAG gives the model the right facts, general models still make subtle mathematical sign errors and code debugging hallucinations. This provides the exact empirical justification for **Deliverable 3 (LoRA Fine-Tuning)**.*
>
> *Deliverables 2 and 4 are already built and working. That means for the upcoming week, our team's main focus is scaling our SFT dataset to 1,000+ pairs (Deliverable 1) and fine-tuning the model adapter (Deliverable 3)."*

---

## 3. Detailed Breakdown of the 4 Core Deliverables

The following sections define the tangible technical outputs required for the upcoming week.

---

### Deliverable 1: Scaled & Validated SFT Dataset (1,000+ JSONL Pairs)

#### A. Purpose
To fine-tune an open-source model (e.g., `qwen2.5-coder:7b` or `Llama-3-8B`), moving beyond general conversation to enforce mathematical precision, PyTorch runtime awareness, and strict rubric compliance.

#### B. Repository File Structure
```text
data/sft/
├── math_derivations.jsonl   # 300+ step-by-step LaTeX derivations and proofs
├── code_debugging.jsonl     # 300+ buggy PyTorch snippets -> diagnosis + fix
├── exercise_bank.jsonl      # 300+ MCQs, calculations, and explanations
└── grading_rubrics.jsonl    # 200+ (Question + Rubric + Student Answer -> Grade)
```

#### C. Concrete JSONL Sample (`data/sft/code_debugging.jsonl`)
```json
{
  "id": "DEBUG-ATTN-SHAPE-01",
  "instruction": "Diagnose and fix the RuntimeError in this PyTorch Scaled Dot-Product Attention implementation.",
  "buggy_code": "scores = torch.matmul(q, k) / math.sqrt(d_k)",
  "error_type": "RuntimeError: The size of tensor a (seq_len) must match the size of tensor b (d_k) at non-singleton dimension 2",
  "explanation": "In matrix multiplication Q @ K^T, inner dimensions must align. With q shaped (B, L, d_k) and k shaped (B, L, d_k), direct multiplication fails. Transpose k across its last two dimensions.",
  "fixed_code": "scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)",
  "verified_executable": true
}
```

#### D. Verification Method
Execute in terminal:
```bash
python3 -c "
import json, glob
total = sum(len(open(f).readlines()) for f in glob.glob('data/sft/*.jsonl'))
print(f'Total Validated SFT Samples: {total}')
assert total >= 1000, 'Dataset volume insufficient!'
"
```

---

### Deliverable 2: Automated Coding Assignment Grader & Test Sandbox

#### A. Purpose
Fulfills Section 3 of the project description: *"a submission evaluator that checks both theoretical reasoning and python code correctness"* and *"an automated grading module for coding assignments"*.

#### B. Repository File Structure (Implemented)
```text
src/evaluator/
├── sandbox_runner.py               # Subprocess test runner with timeout & memory protection
└── coding_tasks/
    ├── task_01_bpe.py              # BPE Tokenizer assignment & test suite
    ├── task_02_attention.py        # PyTorch self-attention assignment & test suite
    └── task_03_perplexity.py       # Perplexity calculator assignment & test suite
```

#### C. Concrete Output Example (Terminal / Web UI Output)
```text
======================= CODE EXECUTION REPORT =======================
Assignment: Scaled Dot-Product Attention Implementation (PyTorch)
Total Tests: 4 | Passed: 3 | Failed: 1

[PASSED] test_output_tensor_shape: Returns expected (batch_size, seq_len, d_v)
[PASSED] test_attention_weights_sum_to_one: Softmax rows sum to 1.0 ± 1e-6
[FAILED] test_causal_masking: Future tokens attend to forbidden positions!
         --> Error: Expected score at [0, 0, 1] to be -inf, got -0.1245.
[PASSED] test_numerical_values_against_reference: Matched ground truth.

EARNED SCORE: 7.5 / 10.0 points
AI FEEDBACK: Your matrix multiplication and softmax normalization are correct. 
However, you forgot to apply the boolean mask to scores.masked_fill(mask == 0, -1e9) 
prior to the softmax step.
======================================================================
```

#### D. Implementation Status & Verification Method
**Status: COMPLETED & OPERATIONAL ✅**
Test execution directly:
```bash
python3 src/evaluator/sandbox_runner.py
```
Or via the interactive Monaco Editor in the Code Lab tab at `http://localhost:3000`.

---

### Deliverable 3: Trained LoRA Fine-Tuning Adapter

#### A. Purpose
Adapts an open-weight base model so that its neural weights naturally produce ENSIA-aligned terminology, step-by-step KaTeX math, and rubric-driven evaluations without relying exclusively on large prompt contexts.

#### B. Repository File Structure
```text
models/fine_tuned_nlp_tutor/
├── adapter_model.safetensors   # Trained Low-Rank Adaptation weights (~50-100 MB)
├── adapter_config.json         # LoRA hyperparameters (r=16, lora_alpha=32)
├── training_loss_curve.png     # Convergence plot (loss decrease across epochs)
└── Modelfile                   # Ollama integration manifest
```

#### C. Verification Benchmark
Compare the pre-trained base model vs. the LoRA fine-tuned model on a fixed test set of 20 ENSIA exam questions:
* **Metric 1: Mathematical Accuracy:** Sign error reduction (targeting 0% algebraic inversion errors).
* **Metric 2: Code Bug Diagnosis:** Correct identification of tensor shape and broadcasting errors.
* **Metric 3: JSON Conformity:** 100% compliance with rubric output schemas.

---

### Deliverable 4: Fully Integrated Web Platform

#### A. Purpose
A unified interface bringing together RAG retrieval, the fine-tuned model, automated code execution, and rubric evaluation for students and instructors.

#### B. Component Architecture (Implemented)
```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    React + TypeScript + Vite + Tailwind CSS Frontend                     │
│               (Dev Server: http://localhost:3000 | Production: http://localhost:8000)   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Header: ENSIA NLP Brain Indicator | Active LLM Badge | Indexed Chunks Counter (913)   │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┬────────────────┤
│ 💬 AI Tutor     │ 📝 Quiz Lab     │ ⚖️ Evaluator     │ 💻 PyTorch Lab   │ 🔍 Explorer    │
│ - SSE Streaming │ - 3 Difficulties│ - KPI Scorecard │ - Monaco Editor  │ - Cosine Match %│
│ - Slide Modals  │ - Interactive MC│ - Rubric Matrix │ - Pytest Sandbox │ - Slide Reader │
│ - KaTeX Proofs  │ - Confetti Party│ - Feedback Split│ - AI Error Hints │ - Excerpt Tags │
├─────────────────┴─────────────────┴─────────────────┴──────────────────┴────────────────┤
│                                      REST & SSE API                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                         FastAPI Backend Server (http://localhost:8000)                  │
│   /api/tutor/chat   |   /api/quiz/generate   |   /api/evaluator/grade  |  /api/sandbox  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### C. Implementation Status & Launch Instructions
**Status: COMPLETED & OPERATIONAL ✅**
Launch both services with a single command:
```bash
./run.sh --dev
```
* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API & Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4. Work Distribution for Team of 5 (Next Week)

| Team Member | Functional Role | Primary Deliverable | Core Tasks |
| :--- | :--- | :--- | :--- |
| **Person 1 (Lead)** | **System Integration & Platform Architecture** | Unified Full-Stack Platform & Hybrid Retriever | • Maintain FastAPI backend and React frontend.<br>• Add hybrid search (BM25 keyword + dense vector retrieval).<br>• Connect newly fine-tuned models to the UI. |
| **Person 2** | **SFT Dataset Scaling & Paper Curation** | 1,000+ validated training pairs in `data/sft/` | • Run synthetic generation across all 15 course chapters.<br>• Scale to 300 math derivations, 300 code fixes, 200 rubric tuples.<br>• Download and index 5 seminal ArXiv NLP research papers into ChromaDB. |
| **Person 3** | **Practical Code Lab & Assignment Suites** | Expand Coding Assignments & Pytest Suites | • Add 3 additional course lab assignments to `src/evaluator/coding_tasks/` (e.g. RNN forward step, Transformer Multi-Head projection, CKY parsing).<br>• Expand unit-test edge cases.<br>• Calibrate automated error hints. |
| **Person 4** | **Model Adaptation & Fine-Tuning (LoRA)** | Trained `adapter_model.safetensors` + Ollama package | • Configure LoRA/QLoRA pipeline on `qwen2.5-coder:7b` (using Unsloth or HF PEFT).<br>• Train model on Person 2's scaled dataset.<br>• Package the fine-tuned adapter into Ollama for local execution. |
| **Person 5** | **Evaluation, Trustworthiness & Safety** | Evaluation benchmark report & Safety pipelines | • Measure grading consistency vs. human exam answer keys.<br>• Implement input sanitization and anti-plagiarism heuristics.<br>• Compute quantitative metrics (BLEU, ROUGE, Grading Kappa). |
| **Person 5** | **Evaluation, Trustworthiness & Safety** | Evaluation benchmark report & Safety pipelines | • Measure grading consistency vs. human exam answer keys.<br>• Implement input sanitization and anti-plagiarism heuristics.<br>• Compute quantitative metrics (BLEU, ROUGE, Grading Kappa). |

---

## 5. Next Milestone Checklist

- [ ] All 4 JSONL files in `data/sft/` have $\ge 250$ valid entries each ($\ge 1,000$ total).
- [ ] At least 3 practical coding assignments run in the sandbox with passing/failing test feedback.
- [ ] Model training loss curve shows smooth convergence without catastrophic forgetting.
- [ ] Streamlit UI displays live code grading, grounded slide citations, and KaTeX math rendering.
- [ ] Grading consistency evaluation proves alignment with official ENSIA exam marking grids.
