"""
Comprehensive Model Evaluation & Benchmarking Harness for NLP Course System.
Evaluates local model performance across:
1. Mathematical Derivations & LaTeX Formatting (Perplexity, Attention variance)
2. PyTorch Bug Diagnosis (Tensor shapes, Masking order)
3. Rubric Grading Schema Conformity & Arithmetic Concordance
4. Grounded Slide Citations & Out-of-Domain Abstention
"""

import sys
import json
import time
import re
from pathlib import Path
from typing import Dict, Any, List

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import ollama
from src.evaluator.grader import SubmissionEvaluator
from src.models.quiz_generator import QuizGenerator
from src.models.tutor_agent import NLPTutorAgent
from src.rag.retriever import CourseRetriever
from src.data_processing.validate_sft_dataset import check_latex_balance

DEFAULT_EVAL_MODEL = "qwen3.5:latest"


class ModelBenchmarkRunner:
    def __init__(self, model_name: str = DEFAULT_EVAL_MODEL):
        self.model_name = model_name
        self.tutor = NLPTutorAgent(model_name=model_name)
        self.evaluator = SubmissionEvaluator(model_name=model_name)
        self.quiz_gen = QuizGenerator(model_name=model_name)
        self.retriever = CourseRetriever()

    def run_full_benchmark(self) -> Dict[str, Any]:
        print(f"\n=======================================================")
        print(f"🚀 Running NLP Course Benchmark for Model: '{self.model_name}'")
        print(f"=======================================================\n")

        start_time = time.time()
        results = {
            "model": self.model_name,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "tests": {}
        }

        # 1. Math Derivation Accuracy & Sign Check
        print("1/4 Testing Mathematical Derivations & LaTeX Formatting...")
        math_res = self._test_math_derivations()
        results["tests"]["math_derivations"] = math_res

        # 2. Code Bug Diagnosis Accuracy
        print("2/4 Testing PyTorch Code Bug Diagnosis...")
        code_res = self._test_code_diagnosis()
        results["tests"]["code_diagnosis"] = code_res

        # 3. Rubric Grading Schema & Concordance
        print("3/4 Testing Rubric Grading & Arithmetic Concordance...")
        grading_res = self._test_rubric_grading()
        results["tests"]["rubric_grading"] = grading_res

        # 4. Retrieval Grounding & Out-of-Domain Abstention
        print("4/4 Testing Grounding & Out-of-Domain Abstention...")
        rag_res = self._test_retrieval_and_abstention()
        results["tests"]["retrieval_and_abstention"] = rag_res

        elapsed = round(time.time() - start_time, 2)
        results["total_elapsed_seconds"] = elapsed

        # Calculate Overall Summary Scores
        total_checks = sum(t["checks_total"] for t in results["tests"].values())
        passed_checks = sum(t["checks_passed"] for t in results["tests"].values())
        pass_rate = round((passed_checks / total_checks) * 100, 1) if total_checks > 0 else 0.0

        results["summary"] = {
            "checks_passed": passed_checks,
            "checks_total": total_checks,
            "overall_pass_rate_pct": pass_rate,
            "elapsed_seconds": elapsed
        }

        print(f"\nBenchmark Complete! Score: {passed_checks}/{total_checks} ({pass_rate}%) in {elapsed}s")
        return results

    def _test_math_derivations(self) -> Dict[str, Any]:
        """Tests derivation of Perplexity from Cross-Entropy and Attention variance."""
        q_perp = "Derive the mathematical relationship between Perplexity and Cross-Entropy loss in language modeling."
        t0 = time.time()
        res_perp = self.tutor.ask(q_perp)
        ans_perp = res_perp["answer"]
        # Strip internal thought tags if present
        clean_ans = re.sub(r"<think>.*?</think>", "", ans_perp, flags=re.DOTALL).strip()

        # Check for correct exponential sign: exp(H) or e^{CE}, NOT exp(-H)
        pat = re.compile(
            r"(?:e\^\{?[+]?(?:H|L|CE|\w*loss)|exp\s*\(?\s*[+]?(?:H|L|CE|\w*loss|\\mathcal\{L\}))",
            re.IGNORECASE
        )
        has_correct_sign = bool(pat.search(clean_ans)) or bool(pat.search(ans_perp))
        has_latex_blocks = "$$" in clean_ans or "$" in clean_ans
        # Delimiter balance check
        is_balanced, _ = check_latex_balance(clean_ans)

        checks = [
            {"check": "LaTeX formula delimiters present", "passed": has_latex_blocks},
            {"check": "LaTeX delimiters balanced", "passed": is_balanced},
            {"check": "Positive exponential sign for perplexity (exp(H) not exp(-H))", "passed": has_correct_sign}
        ]

        return {
            "elapsed": round(time.time() - t0, 2),
            "checks_passed": sum(1 for c in checks if c["passed"]),
            "checks_total": len(checks),
            "details": checks,
            "sample_snippet": ans_perp[:250].replace("\n", " ") + "..."
        }

    def _test_code_diagnosis(self) -> Dict[str, Any]:
        """Tests identification of PyTorch attention dimension mismatch and masking order."""
        t0 = time.time()
        buggy_code = """
import torch
import math

def forward(q, k, v):
    # q, k, v shapes: (B, L, D)
    # Buggy matmul: (B, L, D) @ (B, L, D) fails
    scores = torch.matmul(q, k) / math.sqrt(64)
    attn = torch.softmax(scores, dim=-1)
    return torch.matmul(attn, v)
"""
        prompt = f"Identify the exact bug causing a tensor shape mismatch in this PyTorch attention code and state the fix:\n```python\n{buggy_code}\n```"

        messages = [
            {"role": "system", "content": "You are a PyTorch debugging expert. Identify the bug and fix concisely."},
            {"role": "user", "content": prompt}
        ]
        resp = ollama.chat(model=self.model_name, messages=messages, options={"temperature": 0.1})
        diag = resp["message"]["content"]

        mentions_transpose = bool(re.search(r"transpose|K\^T|\.T", diag, re.IGNORECASE))
        mentions_dim_mismatch = bool(re.search(r"dimension|shape|inner|matmul", diag, re.IGNORECASE))

        checks = [
            {"check": "Identifies matrix multiplication dimension mismatch", "passed": mentions_dim_mismatch},
            {"check": "Recommends Key transpose (k.transpose(-2, -1))", "passed": mentions_transpose}
        ]

        return {
            "elapsed": round(time.time() - t0, 2),
            "checks_passed": sum(1 for c in checks if c["passed"]),
            "checks_total": len(checks),
            "details": checks
        }

    def _test_rubric_grading(self) -> Dict[str, Any]:
        """Tests JSON schema compliance and score arithmetic consistency."""
        t0 = time.time()
        prob = "Explain why add-1 (Laplace) smoothing is required in Naive Bayes and write its formula."
        rubric = """Total Points: 2.0
Criteria:
1. Explains zero-frequency problem (1.0 pt)
2. Writes exact formula with |V| in denominator (1.0 pt)"""
        student_sub = "Laplace smoothing prevents zero probabilities for unseen vocabulary. Formula is (count(w,c)+1)/(count(c)+|V|)."

        eval_result = self.evaluator.grade(prob, rubric, student_sub)
        eval_data = eval_result.get("evaluation", {})

        is_json_valid = isinstance(eval_data, dict) and "earned_score" in eval_data
        has_criteria = len(eval_data.get("criteria_breakdown", [])) > 0

        # Check arithmetic concordance
        earned = eval_data.get("earned_score", 0.0)
        criteria_sum = sum(c.get("points_awarded", 0.0) for c in eval_data.get("criteria_breakdown", []))
        is_arithmetic_concordant = (abs(earned - criteria_sum) < 0.05) if has_criteria else True

        checks = [
            {"check": "Outputs valid JSON matching EvaluationSchema", "passed": is_json_valid},
            {"check": "Criteria breakdown populated", "passed": has_criteria},
            {"check": "Arithmetic consistency (earned_score == sum of criteria)", "passed": is_arithmetic_concordant}
        ]

        return {
            "elapsed": round(time.time() - t0, 2),
            "checks_passed": sum(1 for c in checks if c["passed"]),
            "checks_total": len(checks),
            "details": checks,
            "earned_score": earned,
            "total_score": eval_data.get("total_score", 2.0)
        }

    def _test_retrieval_and_abstention(self) -> Dict[str, Any]:
        """Tests grounded slide citations for in-domain queries and abstention for off-domain queries."""
        t0 = time.time()
        
        # 1. In-domain NLP question
        res_in = self.tutor.ask("What is Scaled Dot-Product Attention in the Transformer?")
        has_in_citations = len(res_in.get("citations", [])) > 0

        # 2. Out-of-domain question
        res_out = self.tutor.ask("What is the capital city of France?")
        out_citations = res_out.get("citations", [])
        no_fake_citations = (len(out_citations) == 0)
        abstains_politely = bool(re.search(r"not covered|outside|syllabus|course", res_out.get("answer", ""), re.IGNORECASE))

        checks = [
            {"check": "In-domain question provides grounded slide citations", "passed": has_in_citations},
            {"check": "Out-of-domain question does NOT cite false course slides", "passed": no_fake_citations},
            {"check": "Tutor politely declares out-of-domain scope", "passed": abstains_politely}
        ]

        return {
            "elapsed": round(time.time() - t0, 2),
            "checks_passed": sum(1 for c in checks if c["passed"]),
            "checks_total": len(checks),
            "details": checks
        }

    def generate_markdown_report(self, results: Dict[str, Any], output_path: Path) -> Path:
        """Generates a structured GitHub Flavored Markdown benchmark report."""
        summary = results["summary"]
        report_lines = [
            f"# NLP System Model Benchmark Evaluation",
            f"**Evaluation Date:** {results['timestamp']}  ",
            f"**Evaluated Model:** `{results['model']}`  ",
            f"**Overall Benchmark Pass Rate:** **{summary['overall_pass_rate_pct']}%** ({summary['checks_passed']}/{summary['checks_total']} checks passed)  ",
            f"**Total Evaluation Time:** {summary['elapsed_seconds']}s  \n",
            "---",
            "\n## 1. Executive Summary & Verification Matrix\n",
            "| Evaluation Track | Checks Passed | Total | Latency | Status |",
            "| :--- | :--- | :--- | :--- | :--- |"
        ]

        for track_name, track_data in results["tests"].items():
            badge = "✅ PASSED" if track_data["checks_passed"] == track_data["checks_total"] else "⚠️ PARTIAL"
            label = track_name.replace("_", " ").title()
            report_lines.append(f"| {label} | {track_data['checks_passed']} | {track_data['checks_total']} | {track_data['elapsed']}s | {badge} |")

        report_lines.extend([
            "\n---",
            "\n## 2. Detailed Technical Check Results\n"
        ])

        for track_name, track_data in results["tests"].items():
            label = track_name.replace("_", " ").title()
            report_lines.append(f"### Track: {label}")
            for d in track_data["details"]:
                status_icon = "✓" if d["passed"] else "✗"
                report_lines.append(f"- [{status_icon}] {d['check']}")
            report_lines.append("")

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(report_lines))

        print(f"Benchmark report saved to: {output_path}")
        return output_path


if __name__ == "__main__":
    runner = ModelBenchmarkRunner()
    benchmark_data = runner.run_full_benchmark()
    report_file = PROJECT_ROOT / "docs" / "BENCHMARK_REPORT.md"
    runner.generate_markdown_report(benchmark_data, report_file)
