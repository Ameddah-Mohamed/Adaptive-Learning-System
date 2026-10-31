"""
Adaptive Learner Engine & Knowledge Tracing for NLP Course.
Models student knowledge states per topic, evaluates prerequisite readiness,
computes mastery transitions, and dynamically selects next optimal learning items.
"""

import math
import time
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path

from src.learner.db import LearningDatabase

# Prerequisite Dependency Graph across the 15 course modules
PREREQUISITES: Dict[int, List[int]] = {
    1: [],          # Intro NLP
    2: [1],         # Tokenization & BPE requires Intro
    3: [1, 2],      # Language Modeling requires Tokenization
    4: [1, 3],      # Naive Bayes requires Intro, LM counts
    5: [1, 4],      # Logistic Regression requires Features/Classification
    6: [1, 5],      # Vector Semantics requires Linear Algebra / Regression
    7: [5, 6],      # Neural Networks requires Logistic Regression, Vectors
    8: [7],         # RNNs & LSTMs requires Neural Nets
    9: [6, 7, 8],   # The Transformer requires Vectors, NNs, and RNN sequence limitations
    10: [9],        # LLMs requires Transformer
    11: [9, 10],    # Masked LMs (BERT) requires Transformer, Pretraining
    14: [6, 9],     # QA & RAG requires Vector Embeddings, Transformer
    18: [1, 2],     # CFGs & CKY Parsing requires Text Structure
    19: [18],       # Dependency Parsing requires Constituency / Grammars
    20: [7, 9]      # Distributed Deep Learning requires Deep Nets & Attention
}

# Task ID to Chapter and Topic mapping
CODING_TASK_MAPPING = {
    "task_01_bpe": {
        "chapter": 2,
        "topic": "Byte-Pair Encoding (BPE) & Edit Distance",
        "difficulty": "intermediate"
    },
    "task_02_attention": {
        "chapter": 9,
        "topic": "Self-Attention and Multi-Head Attention",
        "difficulty": "advanced"
    },
    "task_03_perplexity": {
        "chapter": 3,
        "topic": "Language Modeling and Perplexity",
        "difficulty": "beginner"
    }
}

DIFFICULTY_WEIGHTS = {
    "beginner": 0.60,
    "intermediate": 1.00,
    "advanced": 1.40
}


class LearnerEngine:
    def __init__(self, db: Optional[LearningDatabase] = None):
        self.db = db or LearningDatabase()

    def update_from_quiz_attempt(
        self,
        student_id: str,
        chapter: int,
        topic: str,
        difficulty: str,
        is_correct: bool,
        score: float = 1.0,
        max_score: float = 1.0,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Updates topic mastery following an interactive quiz response.
        """
        outcome_ratio = (score / max_score) if max_score > 0 else (1.0 if is_correct else 0.0)
        new_mastery, new_conf = self._compute_mastery_update(
            student_id=student_id,
            chapter=chapter,
            topic=topic,
            difficulty=difficulty,
            outcome_ratio=outcome_ratio,
            is_success=is_correct
        )

        self.db.update_topic_mastery(
            student_id=student_id,
            chapter=chapter,
            topic=topic,
            new_mastery=new_mastery,
            new_confidence=new_conf,
            is_success=is_correct
        )

        self.db.record_learning_event(
            student_id=student_id,
            kind="quiz",
            chapter=chapter,
            topic=topic,
            score=score,
            max_score=max_score,
            passed=is_correct,
            details=details or {"difficulty": difficulty}
        )

        return {
            "chapter": chapter,
            "topic": topic,
            "new_mastery": round(new_mastery, 3),
            "new_confidence": round(new_conf, 3),
            "outcome_ratio": round(outcome_ratio, 2)
        }

    def update_from_code_run(
        self,
        student_id: str,
        task_id: str,
        passed_tests: int,
        total_tests: int,
        is_success: bool
    ) -> Optional[Dict[str, Any]]:
        """
        Updates topic mastery automatically following a code sandbox execution.
        """
        mapping = CODING_TASK_MAPPING.get(task_id)
        if not mapping:
            return None

        chapter = mapping["chapter"]
        topic = mapping["topic"]
        difficulty = mapping["difficulty"]

        outcome_ratio = (passed_tests / total_tests) if total_tests > 0 else (1.0 if is_success else 0.0)
        new_mastery, new_conf = self._compute_mastery_update(
            student_id=student_id,
            chapter=chapter,
            topic=topic,
            difficulty=difficulty,
            outcome_ratio=outcome_ratio,
            is_success=is_success
        )

        self.db.update_topic_mastery(
            student_id=student_id,
            chapter=chapter,
            topic=topic,
            new_mastery=new_mastery,
            new_confidence=new_conf,
            is_success=is_success
        )

        self.db.record_learning_event(
            student_id=student_id,
            kind="code",
            chapter=chapter,
            topic=topic,
            score=float(passed_tests),
            max_score=float(total_tests),
            passed=is_success,
            details={"task_id": task_id, "difficulty": difficulty}
        )

        return {
            "chapter": chapter,
            "topic": topic,
            "task_id": task_id,
            "new_mastery": round(new_mastery, 3),
            "new_confidence": round(new_conf, 3)
        }

    def update_from_grading_result(
        self,
        student_id: str,
        problem_statement: str,
        earned_score: float,
        total_score: float,
        chapter: Optional[int] = None,
        topic: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Records rubric evaluation and updates mastery if chapter is specified.
        """
        outcome_ratio = (earned_score / total_score) if total_score > 0 else 0.0
        passed = outcome_ratio >= 0.60

        if chapter is not None and topic:
            new_mastery, new_conf = self._compute_mastery_update(
                student_id=student_id,
                chapter=chapter,
                topic=topic,
                difficulty="advanced",
                outcome_ratio=outcome_ratio,
                is_success=passed
            )
            self.db.update_topic_mastery(
                student_id=student_id,
                chapter=chapter,
                topic=topic,
                new_mastery=new_mastery,
                new_confidence=new_conf,
                is_success=passed
            )

        self.db.record_learning_event(
            student_id=student_id,
            kind="grade",
            chapter=chapter,
            topic=topic,
            score=earned_score,
            max_score=total_score,
            passed=passed,
            details={"problem": problem_statement[:120]}
        )

        return {
            "score": earned_score,
            "total": total_score,
            "passed": passed
        }

    def _compute_mastery_update(
        self,
        student_id: str,
        chapter: int,
        topic: str,
        difficulty: str,
        outcome_ratio: float,
        is_success: bool
    ) -> Tuple[float, float]:
        """
        Applies Bayesian Knowledge Tracing & Exponential Moving Average update rules:
        - Higher difficulty rewards more on success.
        - Failure on beginner drops more than failure on advanced.
        - Confidence grows asymptotically with repeated attempts.
        """
        row = self.db.get_topic_mastery(student_id, chapter, topic)
        current_mastery = row["mastery_score"] if row else 0.20
        attempts = (row["attempts_count"] + 1) if row else 1

        weight = DIFFICULTY_WEIGHTS.get(difficulty.lower(), 1.0)

        alpha = 0.25  # Learning gain coefficient
        beta = 0.18   # Slip / forgetting decay coefficient

        if outcome_ratio >= 0.60:
            # Positive progress
            delta = alpha * (1.0 - current_mastery) * weight * outcome_ratio
            new_mastery = min(1.0, current_mastery + delta)
        else:
            # Mistake / knowledge gap
            penalty_weight = (1.5 / weight)  # failing beginner penalizes more
            delta = beta * current_mastery * penalty_weight * (1.0 - outcome_ratio)
            new_mastery = max(0.05, current_mastery - delta)

        # Confidence saturates towards 1.0 as attempts increase: C = 1 - e^(-0.35 * N)
        confidence = 1.0 - math.exp(-0.35 * attempts)

        return new_mastery, confidence

    # --- Recommendation & Adaptive Question Selection ---

    def recommend_next_practice(self, student_id: str = "default_student") -> Dict[str, Any]:
        """
        Analyzes the student's mastery profile and prerequisite tree to determine
        the highest-impact next topic and calibrated difficulty.
        """
        all_topics = self.db.get_all_mastery(student_id)
        if not all_topics:
            return {
                "chapter": 1,
                "topic": "Introduction to NLP and Language Structure",
                "recommended_difficulty": "beginner",
                "reason": "Start with foundational concepts of Natural Language Processing."
            }

        now = time.time()
        topic_scores = []
        mastery_by_ch = {t["chapter"]: t["mastery_score"] for t in all_topics}

        for item in all_topics:
            ch = item["chapter"]
            mastery = item["mastery_score"]
            confidence = item["confidence"]
            last_attempt = item["last_attempt_at"]

            # 1. Base Priority: Low mastery needs highest attention
            priority = (1.0 - mastery) * 0.55

            # 2. Staleness / Spaced Repetition Factor
            if last_attempt is not None:
                days_since = (now - last_attempt) / 86400.0
                staleness = min(1.0, days_since / 5.0)  # max after 5 days
            else:
                staleness = 0.80  # Never attempted
            priority += staleness * 0.30

            # 3. Low Confidence Penalty
            priority += (1.0 - confidence) * 0.15

            # 4. Prerequisite Gate Check:
            # If an advanced topic has struggling prerequisites, don't recommend it yet!
            prereqs = PREREQUISITES.get(ch, [])
            unmet_prereqs = [p for p in prereqs if mastery_by_ch.get(p, 0.20) < 0.40]

            if unmet_prereqs:
                # Deprioritize advanced topic until prereqs improve
                priority *= 0.20
                reason = f"Prerequisite chapters ({unmet_prereqs}) need reinforcement first."
            else:
                if mastery < 0.40:
                    reason = f"Knowledge gap detected in {item['short_title']} (Mastery: {int(mastery*100)}%)."
                elif staleness > 0.60:
                    reason = f"Spaced repetition review for {item['short_title']} to prevent forgetting."
                else:
                    reason = f"Continue mastering {item['short_title']} towards advanced proficiency."

            # Calibrate difficulty tier to current mastery
            if mastery < 0.40:
                difficulty = "beginner"
            elif mastery < 0.75:
                difficulty = "intermediate"
            else:
                difficulty = "advanced"

            topic_scores.append({
                "chapter": ch,
                "topic": item["topic"],
                "short_title": item["short_title"],
                "stage": item["stage"],
                "mastery": mastery,
                "priority": priority,
                "difficulty": difficulty,
                "reason": reason
            })

        # Sort descending by calculated learning priority
        topic_scores.sort(key=lambda x: x["priority"], reverse=True)
        top = topic_scores[0]

        return {
            "chapter": top["chapter"],
            "topic": top["topic"],
            "short_title": top["short_title"],
            "stage": top["stage"],
            "current_mastery": round(top["mastery"], 2),
            "recommended_difficulty": top["difficulty"],
            "reason": top["reason"],
            "priority_rankings": [
                {
                    "chapter": t["chapter"],
                    "short_title": t["short_title"],
                    "mastery": round(t["mastery"], 2),
                    "difficulty": t["difficulty"]
                }
                for t in topic_scores[:5]
            ]
        }

    def get_diagnostic_profile(self, student_id: str = "default_student") -> Dict[str, Any]:
        """
        Synthesizes a comprehensive diagnostic scorecard for student analytics.
        """
        all_topics = self.db.get_all_mastery(student_id)
        events = self.db.get_recent_events(student_id, limit=100)

        if not all_topics:
            return {"status": "no_data"}

        total_topics = len(all_topics)
        avg_mastery = sum(t["mastery_score"] for t in all_topics) / total_topics
        proficient_topics = [t for t in all_topics if t["mastery_score"] >= 0.75]
        developing_topics = [t for t in all_topics if 0.40 <= t["mastery_score"] < 0.75]
        struggling_topics = [t for t in all_topics if t["mastery_score"] < 0.40]

        total_quizzes = sum(1 for e in events if e["kind"] == "quiz")
        total_code_runs = sum(1 for e in events if e["kind"] == "code")
        total_grades = sum(1 for e in events if e["kind"] == "grade")

        # Sorted lists of strengths and focus areas
        sorted_by_mastery = sorted(all_topics, key=lambda x: x["mastery_score"], reverse=True)
        strongest = [
            {"chapter": t["chapter"], "title": t["short_title"], "mastery": round(t["mastery_score"] * 100)}
            for t in sorted_by_mastery[:3] if t["mastery_score"] >= 0.40
        ]
        weakest = [
            {"chapter": t["chapter"], "title": t["short_title"], "mastery": round(t["mastery_score"] * 100)}
            for t in sorted(all_topics, key=lambda x: x["mastery_score"])[:3]
        ]

        return {
            "student_id": student_id,
            "overall_mastery_pct": round(avg_mastery * 100, 1),
            "topic_counts": {
                "total": total_topics,
                "proficient": len(proficient_topics),
                "developing": len(developing_topics),
                "struggling": len(struggling_topics)
            },
            "activity_counts": {
                "total_events": len(events),
                "quizzes_taken": total_quizzes,
                "code_runs": total_code_runs,
                "submissions_graded": total_grades
            },
            "top_strengths": strongest,
            "priority_weaknesses": weakest,
            "chapter_breakdown": [
                {
                    "chapter": t["chapter"],
                    "short_title": t["short_title"],
                    "stage": t["stage"],
                    "mastery_score": round(t["mastery_score"], 2),
                    "confidence": round(t["confidence"], 2),
                    "attempts": t["attempts_count"],
                    "success_rate": round((t["success_count"] / t["attempts_count"]), 2) if t["attempts_count"] > 0 else 0.0
                }
                for t in all_topics
            ]
        }
