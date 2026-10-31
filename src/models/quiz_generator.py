"""
Quiz & Exam Generator.
Synthesizes curriculum-grounded NLP exercises with customizable difficulty levels
and automated marking schemes using retrieved lecture context and local LLM.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import json
import re
from typing import Dict, Any, Optional
import ollama

from src.models.prompts import QUIZ_GENERATOR_SYSTEM_PROMPT, QUIZ_GENERATOR_USER_PROMPT
from src.rag.retriever import CourseRetriever


DEFAULT_LLM = "qwen3.5:latest"


class QuizGenerator:
    def __init__(self, model_name: str = DEFAULT_LLM):
        self.model_name = model_name
        self.retriever = CourseRetriever()

    def generate_exercise(
        self,
        topic: str,
        difficulty: str = "intermediate",
        question_type: str = "mcq"
    ) -> Dict[str, Any]:
        """
        Generates an NLP exercise grounded in course materials.
        """
        # Step 1: Retrieve context for topic
        retrieved_chunks = self.retriever.retrieve(query=topic, top_k=3)
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
            options={"temperature": 0.3, "top_p": 0.9}
        )
        
        raw_output = response["message"]["content"]
        
        try:
            clean_json = re.sub(r"^```(?:json)?\s*", "", raw_output.strip(), flags=re.MULTILINE)
            clean_json = re.sub(r"\s*```$", "", clean_json.strip(), flags=re.MULTILINE)
            parsed = json.loads(clean_json)
        except Exception:
            json_match = re.search(r"(\{.*\})", raw_output, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(1))
                except Exception:
                    parsed = {"raw_generated": raw_output}
            else:
                parsed = {"raw_generated": raw_output}
                
        return {
            "topic": topic,
            "difficulty": difficulty,
            "question_type": question_type,
            "exercise": parsed,
            "grounding_sources": [c["citation"] for c in retrieved_chunks]
        }


if __name__ == "__main__":
    generator = QuizGenerator()
    print("Generating a sample quiz question on 'Chomsky Normal Form'...")
    res = generator.generate_exercise(topic="Chomsky Normal Form and CKY parsing", difficulty="intermediate", question_type="mcq")
    print(json.dumps(res, indent=2))
