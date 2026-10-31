"""
Quiz & Exam Generator with Pydantic Schema Validation.
Synthesizes curriculum-grounded NLP exercises with customizable difficulty levels
and automated marking schemes using retrieved lecture context and local LLM.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import json
import re
from typing import Dict, Any, List, Optional
import ollama
from pydantic import BaseModel, Field

from src.models.prompts import QUIZ_GENERATOR_SYSTEM_PROMPT, QUIZ_GENERATOR_USER_PROMPT
from src.rag.retriever import CourseRetriever, LECTURE_COLLECTION

DEFAULT_LLM = "qwen3.5:latest"


class QuizExerciseSchema(BaseModel):
    topic: str = Field(default="NLP Topic")
    difficulty: str = Field(default="intermediate")
    question: str = Field(default="Problem statement")
    options: Optional[Dict[str, str]] = None
    solution: str = Field(default="")
    marking_rubric: Optional[List[Dict[str, Any]]] = None
    total_points: float = Field(default=1.0)
    explanation: str = Field(default="")


class QuizGenerator:
    def __init__(self, model_name: str = DEFAULT_LLM):
        self.model_name = model_name
        self.retriever = CourseRetriever(collection_name=LECTURE_COLLECTION, default_min_similarity=0.48)

    def generate_exercise(
        self,
        topic: str,
        difficulty: str = "intermediate",
        question_type: str = "mcq",
        chapter: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generates an NLP exercise grounded in course materials with Pydantic validation.
        """
        # Step 1: Retrieve context from segregated lecture collection
        retrieved_chunks = self.retriever.retrieve(
            query=topic,
            top_k=3,
            chapter=chapter
        )
        context_str = self.retriever.format_context_for_prompt(retrieved_chunks)

        # Step 2: Format prompt
        user_message = QUIZ_GENERATOR_USER_PROMPT.format(
            topic=topic,
            difficulty=difficulty,
            question_type=question_type,
            context=context_str if context_str else "Core NLP curriculum"
        )

        messages = [
            {"role": "system", "content": QUIZ_GENERATOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]

        response = ollama.chat(
            model=self.model_name,
            messages=messages,
            format="json",
            options={"temperature": 0.25, "top_p": 0.9}
        )

        raw_output = response["message"]["content"]
        validated_exercise = self._validate_exercise(raw_output, topic, difficulty)

        return {
            "topic": topic,
            "chapter": chapter,
            "difficulty": difficulty,
            "question_type": question_type,
            "exercise": validated_exercise,
            "grounding_sources": [c["citation"] for c in retrieved_chunks]
        }

    def _validate_exercise(self, raw_output: str, topic: str, difficulty: str) -> Dict[str, Any]:
        parsed = {}
        try:
            clean_json = re.sub(r"^```(?:json)?\s*", "", raw_output.strip(), flags=re.MULTILINE)
            clean_json = re.sub(r"\s*```$", "", clean_json.strip(), flags=re.MULTILINE)
            parsed = json.loads(clean_json)
        except Exception:
            match = re.search(r"(\{.*\})", raw_output, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group(1))
                except Exception:
                    pass

        # Ensure minimal required fields
        if not isinstance(parsed, dict) or not parsed:
            return {
                "topic": topic,
                "difficulty": difficulty,
                "question": raw_output[:300],
                "options": None,
                "solution": "See course slides for solution.",
                "total_points": 1.0,
                "explanation": raw_output
            }

        # Validate with Pydantic schema
        schema = QuizExerciseSchema(
            topic=str(parsed.get("topic", topic)),
            difficulty=str(parsed.get("difficulty", difficulty)),
            question=str(parsed.get("question", "Problem Statement")),
            options=parsed.get("options") if isinstance(parsed.get("options"), dict) else None,
            solution=str(parsed.get("solution", "")),
            marking_rubric=parsed.get("marking_rubric") if isinstance(parsed.get("marking_rubric"), list) else None,
            total_points=float(parsed.get("total_points", 1.0)),
            explanation=str(parsed.get("explanation", ""))
        )

        return schema.model_dump()


if __name__ == "__main__":
    generator = QuizGenerator()
    print("Testing quiz generator with Pydantic schema validation...")
    res = generator.generate_exercise(topic="Chomsky Normal Form and CKY parsing", difficulty="intermediate", question_type="mcq")
    print(json.dumps(res, indent=2))
