"""
Automated Submission Evaluator & Rubric Grader.
Grades student theoretical reasoning and coding assignments against 
expert instructor marking rubrics using LLM reasoning.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import json
import re
from typing import Dict, Any, Optional
import ollama

from src.models.prompts import SUBMISSION_EVALUATOR_SYSTEM_PROMPT, SUBMISSION_EVALUATOR_USER_PROMPT
from src.rag.retriever import CourseRetriever


DEFAULT_LLM = "qwen3.5:latest"


class SubmissionEvaluator:
    def __init__(self, model_name: str = DEFAULT_LLM):
        self.model_name = model_name
        self.retriever = CourseRetriever()

    def grade(
        self,
        problem_statement: str,
        marking_scheme: str,
        student_submission: str,
        retrieve_ground_truth: bool = True
    ) -> Dict[str, Any]:
        """
        Evaluate a student submission against the rubric.
        Returns a structured breakdown of score, criteria, and feedback.
        """
        ground_truth_context = ""
        if retrieve_ground_truth:
            # Retrieve relevant exam/slide context
            retrieved = self.retriever.retrieve(problem_statement, top_k=2)
            if retrieved:
                ground_truth_context = "\n### Verified Course Ground Truth:\n" + self.retriever.format_context_for_prompt(retrieved)
                
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
            options={"temperature": 0.1, "top_p": 0.9}
        )
        
        raw_output = response["message"]["content"]
        
        # Parse JSON from model output
        try:
            # Remove any markdown code block fencing if present
            clean_json = re.sub(r"^```(?:json)?\s*", "", raw_output.strip(), flags=re.MULTILINE)
            clean_json = re.sub(r"\s*```$", "", clean_json.strip(), flags=re.MULTILINE)
            parsed = json.loads(clean_json)
        except Exception:
            # Fallback if markdown parsing encounters extra prose
            json_match = re.search(r"(\{.*\})", raw_output, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(1))
                except Exception:
                    parsed = {"raw_evaluation": raw_output}
            else:
                parsed = {"raw_evaluation": raw_output}
                
        return {
            "problem_statement": problem_statement,
            "student_submission": student_submission,
            "evaluation": parsed
        }


if __name__ == "__main__":
    evaluator = SubmissionEvaluator()
    sample_problem = "Explain why we divide by sqrt(d_k) in the Scaled Dot-Product Attention formula."
    sample_rubric = """Total Points: 2.0
Criteria:
1. Explains that dot product variance grows linearly with d_k (1.0 pt)
2. Explains that large magnitudes push softmax into vanishing gradient saturation regions (1.0 pt)"""
    sample_student = "Because without dividing, the dot product values get very high, causing the softmax function to saturate where gradients are near zero."
    
    print("Evaluating sample student submission...")
    res = evaluator.grade(sample_problem, sample_rubric, sample_student)
    print(json.dumps(res["evaluation"], indent=2))
