"""
Interactive NLP Tutor Agent.
Combines CourseRetriever with local Ollama LLM (qwen3.5:latest or llama3:latest)
to provide grounded, LaTeX-rendered, and course-aligned tutoring.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from typing import Dict, Any, List, Optional
import ollama

from src.rag.retriever import CourseRetriever
from src.models.prompts import TUTOR_SYSTEM_PROMPT, TUTOR_USER_PROMPT


DEFAULT_LLM = "qwen3.5:latest"


class NLPTutorAgent:
    def __init__(self, model_name: str = DEFAULT_LLM, top_k_retrieval: int = 3):
        self.model_name = model_name
        self.top_k = top_k_retrieval
        self.retriever = CourseRetriever()

    def ask(
        self,
        question: str,
        chapter_filter: Optional[int] = None,
        category_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Ask a question to the NLP tutor.
        Retrieves relevant course slides, constructs a grounded prompt, and calls Ollama.
        """
        # Step 1: Retrieve grounded context from ChromaDB
        retrieved_chunks = self.retriever.retrieve(
            query=question,
            top_k=self.top_k,
            chapter=chapter_filter,
            category=category_filter
        )
        
        context_str = self.retriever.format_context_for_prompt(retrieved_chunks)
        
        # Step 2: Format prompt
        user_message = TUTOR_USER_PROMPT.format(
            context=context_str if context_str else "*(No specific slides retrieved, rely on core NLP curriculum)*",
            question=question
        )
        
        # Step 3: Query Ollama LLM
        messages = [
            {"role": "system", "content": TUTOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
        
        response = ollama.chat(
            model=self.model_name,
            messages=messages,
            options={"temperature": 0.2, "top_p": 0.9}
        )
        
        reply_content = response["message"]["content"]
        citations = [c["citation"] for c in retrieved_chunks]
        
        return {
            "question": question,
            "answer": reply_content,
            "citations": citations,
            "retrieved_sources": retrieved_chunks
        }


if __name__ == "__main__":
    tutor = NLPTutorAgent()
    sample_q = "Why do we divide by sqrt(d_k) in the Scaled Dot-Product Attention formula?"
    print(f"Asking Tutor: '{sample_q}'\n")
    res = tutor.ask(sample_q)
    print("--- TUTOR RESPONSE ---")
    print(res["answer"])
    print("\n--- SOURCES CITED ---")
    for cit in res["citations"]:
        print(f" - {cit}")
