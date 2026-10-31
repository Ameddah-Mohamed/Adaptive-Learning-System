# NLP System Model Benchmark Evaluation
**Evaluation Date:** 2026-10-31 20:21:06  
**Evaluated Model:** `qwen3.5:latest`  
**Overall Benchmark Pass Rate:** **90.9%** (10/11 checks passed)  
**Total Evaluation Time:** 843.7s  

---

## 1. Executive Summary & Verification Matrix

| Evaluation Track | Checks Passed | Total | Latency | Status |
| :--- | :--- | :--- | :--- | :--- |
| Math Derivations | 2 | 3 | 202.17s | ⚠️ PARTIAL |
| Code Diagnosis | 2 | 2 | 224.68s | ✅ PASSED |
| Rubric Grading | 3 | 3 | 121.36s | ✅ PASSED |
| Retrieval And Abstention | 3 | 3 | 295.5s | ✅ PASSED |

---

## 2. Detailed Technical Check Results

### Track: Math Derivations
- [✓] LaTeX formula delimiters present
- [✓] LaTeX delimiters balanced
- [✗] Positive exponential sign for perplexity (exp(H) not exp(-H))

### Track: Code Diagnosis
- [✓] Identifies matrix multiplication dimension mismatch
- [✓] Recommends Key transpose (k.transpose(-2, -1))

### Track: Rubric Grading
- [✓] Outputs valid JSON matching EvaluationSchema
- [✓] Criteria breakdown populated
- [✓] Arithmetic consistency (earned_score == sum of criteria)

### Track: Retrieval And Abstention
- [✓] In-domain question provides grounded slide citations
- [✓] Out-of-domain question does NOT cite false course slides
- [✓] Tutor politely declares out-of-domain scope
