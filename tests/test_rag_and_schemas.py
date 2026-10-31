"""
Unit and Integration Tests for Phase 3: RAG Hardening, Segregated Collections & Schemas.
"""

import pytest
from src.rag.retriever import CourseRetriever, LECTURE_COLLECTION, EVAL_COLLECTION
from src.evaluator.grader import SubmissionEvaluator, EvaluationSchema, CriterionBreakdown
from src.models.quiz_generator import QuizGenerator, QuizExerciseSchema


@pytest.fixture
def lecture_retriever():
    return CourseRetriever(collection_name=LECTURE_COLLECTION, default_min_similarity=0.50)


@pytest.fixture
def eval_retriever():
    return CourseRetriever(collection_name=EVAL_COLLECTION, default_min_similarity=0.45)


def test_collection_segregation(lecture_retriever, eval_retriever):
    # Student lecture collection must have ONLY lecture slides
    lecture_count = lecture_retriever.collection.count()
    assert lecture_count == 885

    # Check categories in lecture collection
    sample_metas = lecture_retriever.collection.get(limit=100, include=["metadatas"])["metadatas"]
    assert all(m.get("category") == "lectures" for m in sample_metas)

    # Exam ground truth collection must have 28 exam items
    eval_count = eval_retriever.collection.count()
    assert eval_count == 28


def test_retriever_in_domain_matching(lecture_retriever):
    results = lecture_retriever.retrieve(
        "Scaled Dot-Product Attention formula and variance scaling",
        top_k=2
    )
    assert len(results) >= 1
    top_result = results[0]
    assert top_result["similarity_score"] >= 0.60
    assert "Chapter 09" in top_result["document"] or "Transformer" in top_result["document"]


def test_retriever_out_of_domain_abstention(lecture_retriever):
    # Completely off-domain queries should be filtered out by threshold
    off_domain_queries = [
        "What is the capital city of France?",
        "Recipe for chocolate chip cookies with butter",
        "Who won the 2022 FIFA World Cup in Qatar?"
    ]
    for q in off_domain_queries:
        res = lecture_retriever.retrieve(q, top_k=3, min_similarity=0.55)
        assert len(res) == 0, f"Expected 0 results for off-domain query '{q}', got {len(res)}"
        assert lecture_retriever.is_in_domain(q, threshold=0.55) is False


def test_latex_formula_slide_content(lecture_retriever):
    # Search for attention slide
    res = lecture_retriever.retrieve("Attention Score i j softmax Q K d_k", top_k=2)
    assert len(res) >= 1
    # Check that our cleaned markdown contains proper LaTeX
    combined_text = " ".join(r["text"] for r in res)
    assert "sqrt" in combined_text or "\\frac" in combined_text or "softmax" in combined_text


def test_evaluator_pydantic_validation_and_arithmetic_consistency():
    evaluator = SubmissionEvaluator()

    # Simulate inconsistent LLM output where criteria sum to 1.5 but earned_score says 1.0
    inconsistent_llm_json = """
    {
        "earned_score": 1.0,
        "total_score": 2.0,
        "criteria_breakdown": [
            {
                "criterion": "Identifies zero-frequency problem",
                "points_awarded": 1.0,
                "max_points": 1.0,
                "status": "passed",
                "comment": "Accurately identified zero joint probability."
            },
            {
                "criterion": "Laplace formula with |V|",
                "points_awarded": 0.5,
                "max_points": 1.0,
                "status": "partial",
                "comment": "Missing |V| in denominator."
            }
        ],
        "strengths": ["Clear explanation"],
        "weaknesses": ["Formula incomplete"],
        "actionable_feedback": "Ensure you include +|V| in the denominator."
    }
    """

    validated = evaluator._parse_and_validate_output(inconsistent_llm_json)
    # The parser must enforce arithmetic consistency: 1.0 + 0.5 = 1.5!
    assert validated["earned_score"] == 1.5
    assert validated["total_score"] == 2.0
    assert len(validated["criteria_breakdown"]) == 2
    assert validated["criteria_breakdown"][0]["status"] == "passed"
    assert validated["criteria_breakdown"][1]["status"] == "partial"


def test_quiz_generator_pydantic_validation():
    generator = QuizGenerator()

    # Test malformed / incomplete raw output handling
    raw_snippet = """```json
    {
        "question": "What is the purpose of positional encoding in the Transformer?",
        "options": {
            "A": "To inject token order information into permutation-invariant self-attention",
            "B": "To reduce matrix multiplication dimension",
            "C": "To compute softmax probabilities",
            "D": "To normalize hidden representations"
        },
        "solution": "A",
        "total_points": 1.0,
        "explanation": "Self-attention contains no recurrent or convolutional recurrence, so position encodings are added."
    }
    ```"""

    validated = generator._validate_exercise(raw_snippet, "Transformers", "intermediate")
    assert validated["topic"] == "Transformers"
    assert validated["difficulty"] == "intermediate"
    assert validated["solution"] == "A"
    assert "A" in validated["options"]
    assert validated["total_points"] == 1.0
