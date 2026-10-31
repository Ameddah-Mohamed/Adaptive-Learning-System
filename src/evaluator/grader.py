"""
Automated Submission Evaluator & Rubric Grader with Pydantic Validation.
Grades student theoretical reasoning and coding assignments against
expert instructor marking rubrics using LLM reasoning and segregated exam ground truth.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import json
import re
from typing import Dict, Any, List, Optional
import ollama
from pydantic import BaseModel, Field

from src.models.prompts import SUBMISSION_EVALUATOR_SYSTEM_PROMPT, SUBMISSION_EVALUATOR_USER_PROMPT
from src.rag.retriever import CourseRetriever, EVAL_COLLECTION, LECTURE_COLLECTION

DEFAULT_LLM = "qwen3.5:latest"


class CriterionBreakdown(BaseModel):
    criterion: str
    points_awarded: float = Field(default=0.0)
    max_points: float = Field(default=1.0)
    status: str = Field(default="partial")  # "passed", "partial", "failed"
    comment: str = Field(default="")


class EvaluationSchema(BaseModel):
    earned_score: float = Field(default=0.0)
    total_score: float = Field(default=1.0)
    criteria_breakdown: List[CriterionBreakdown] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    actionable_feedback: str = Field(default="")


class SubmissionEvaluator:
    def __init__(self, model_name: str = DEFAULT_LLM):
        self.model_name = model_name
        # Segregated retriever specifically for instructor evaluations & ground truth
        self.eval_retriever = CourseRetriever(collection_name=EVAL_COLLECTION, default_min_similarity=0.45)
        self.lecture_retriever = CourseRetriever(collection_name=LECTURE_COLLECTION, default_min_similarity=0.50)

    def grade(
        self,
        problem_statement: str,
        marking_scheme: str,
        student_submission: str,
        retrieve_ground_truth: bool = True
    ) -> Dict[str, Any]:
        """
        Evaluates a student submission against the rubric.
        Returns a validated, arithmetic-consistent breakdown of score, criteria, and feedback.
        """
        ground_truth_context = ""
        if retrieve_ground_truth:
            # First check segregated exam ground truth
            retrieved = self.eval_retriever.retrieve(problem_statement, top_k=2)
            if not retrieved:
                # Fallback to lecture slides
                retrieved = self.lecture_retriever.retrieve(problem_statement, top_k=2)

            if retrieved:
                ground_truth_context = "\n### Verified Course Ground Truth:\n" + self.eval_retriever.format_context_for_prompt(retrieved)

        augmented_rubric = f"{marking_scheme}\n{ground_truth_context}"

        user_prompt = SUBMISSION_EVALUATOR_USER_PROMPT.format(
            problem_statement=problem_statement,
            marking_scheme=augmented_rubric,
            student_submission=student_submission
        )

        messages = [
            {"role": "system", "content": SUBMISSION_EVALUATOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        response = ollama.chat(
            model=self.model_name,
            messages=messages,
            format="json",
            options={"temperature": 0.1, "top_p": 0.9}
        )

        raw_output = response["message"]["content"]

        parsed_data = self._parse_and_validate_output(raw_output)

        return {
            "problem_statement": problem_statement,
            "student_submission": student_submission,
            "evaluation": parsed_data
        }

    def _parse_and_validate_output(self, raw_output: str) -> Dict[str, Any]:
        """
        Parses JSON output from LLM, validates against Pydantic schema,
        and enforces arithmetic consistency between criteria points and earned score.
        """
        raw_dict = {}
        try:
            clean_json = re.sub(r"^```(?:json)?\s*", "", raw_output.strip(), flags=re.MULTILINE)
            clean_json = re.sub(r"\s*```$", "", clean_json.strip(), flags=re.MULTILINE)
            raw_dict = json.loads(clean_json)
        except Exception:
            match = re.search(r"(\{.*\})", raw_output, re.DOTALL)
            if match:
                try:
                    raw_dict = json.loads(match.group(1))
                except Exception:
                    pass

        if not raw_dict:
            return {"raw_evaluation": raw_output}

        # Normalize criteria breakdown if present
        criteria_list = []
        raw_criteria = raw_dict.get("criteria_breakdown") or raw_dict.get("breakdown") or []

        sum_awarded = 0.0
        sum_max = 0.0

        for c in raw_criteria:
            if isinstance(c, dict):
                pts = float(c.get("points_awarded", c.get("points", 0.0)))
                max_pts = float(c.get("max_points", c.get("total", 1.0)))
                status = str(c.get("status", "passed" if pts >= max_pts else ("failed" if pts == 0 else "partial"))).lower()

                item = CriterionBreakdown(
                    criterion=str(c.get("criterion", "Evaluation Criterion")),
                    points_awarded=pts,
                    max_points=max_pts,
                    status=status,
                    comment=str(c.get("comment", ""))
                )
                criteria_list.append(item)
                sum_awarded += pts
                sum_max += max_pts

        # Enforce arithmetic consistency: earned_score must match sum of criteria points awarded
        total_score = float(raw_dict.get("total_score", sum_max if sum_max > 0 else 1.0))
        earned_score = sum_awarded if criteria_list else float(raw_dict.get("earned_score", 0.0))

        validated = EvaluationSchema(
            earned_score=round(earned_score, 2),
            total_score=round(total_score, 2),
            criteria_breakdown=criteria_list,
            strengths=raw_dict.get("strengths", []),
            weaknesses=raw_dict.get("weaknesses", []),
            actionable_feedback=str(raw_dict.get("actionable_feedback", raw_dict.get("feedback", "")))
        )

        return validated.model_dump()


if __name__ == "__main__":
    evaluator = SubmissionEvaluator()
    sample_problem = "Explain why add-1 (Laplace) smoothing is required in Naive Bayes and write its formula."
    sample_rubric = """Total Points: 2.0
Criteria:
1. Identifies zero-frequency problem (1.0 pt)
2. States exact Laplace formula with |V| in denominator (1.0 pt)"""
    sample_student = "Laplace smoothing prevents 0 probability for unseen words. Formula: (count(w,c)+1)/(count(c)+|V|)."

    print("Grading sample student submission...")
    res = evaluator.grade(sample_problem, sample_rubric, sample_student)
    print(json.dumps(res, indent=2))
