"""
SFT Dataset Validator, Compiler & Schema Standardizer.
Converts raw domain-specific records from:
- math_derivations.jsonl
- code_debugging.jsonl
- exercise_bank.jsonl
- grading_rubrics.jsonl
into industry-standard Chat/Alpaca formats with train/val splits and strict validation.
"""

import json
import re
import ast
import random
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SFT_DIR = PROJECT_ROOT / "data" / "sft"


def check_latex_balance(text: str) -> Tuple[bool, str]:
    """Checks whether single and double dollar sign math delimiters are balanced."""
    # Check double dollar $$ balance
    double_dollars = len(re.findall(r"\$\$", text))
    if double_dollars % 2 != 0:
        return False, f"Unbalanced display math delimiters '$$' (count: {double_dollars})"

    # Remove all balanced $$ blocks to isolate single $ delimiters
    cleaned = re.sub(r"\$\$.*?\$\$", "", text, flags=re.DOTALL)
    single_dollars = len(re.findall(r"(?<!\\)\$", cleaned))
    if single_dollars % 2 != 0:
        return False, f"Unbalanced inline math delimiters '$' (count: {single_dollars})"

    return True, "OK"


def check_code_syntax(code_str: str) -> Tuple[bool, str]:
    """Validates that a python code snippet parses without syntax errors."""
    try:
        ast.parse(code_str)
        return True, "OK"
    except SyntaxError as e:
        return False, f"SyntaxError in code: {e.msg} at line {e.lineno}"


def format_to_chat(category: str, raw_item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts a heterogeneous raw record into the standard Chat format:
    {"id": str, "category": str, "topic": str, "messages": [{"role": "system|user|assistant", "content": str}]}
    """
    item_id = raw_item.get("id", f"{category[:4].upper()}-{random.randint(100, 999)}")
    topic = raw_item.get("topic", "NLP Curriculum")

    system_prompt = "You are the Specialized AI Tutor for the ENSIA Natural Language Processing course. You provide rigorous mathematical derivations, explain code debugging with PyTorch tensor shapes, and grade submissions against marking rubrics."

    if category == "math_derivations":
        user_prompt = f"Problem Topic: {topic}\n\n{raw_item.get('instruction', raw_item.get('title', ''))}"
        assistant_reply = raw_item.get("response", "")

    elif category == "code_debugging":
        buggy = raw_item.get("buggy_code", "")
        err = raw_item.get("error_type", "")
        user_prompt = f"Topic: {topic}\n\nPlease diagnose and fix the following buggy implementation:\n\n```python\n{buggy}\n```\n\nRuntime Traceback:\n```\n{err}\n```"
        assistant_reply = f"### Diagnosis & Root Cause\n{raw_item.get('explanation', '')}\n\n### Corrected Implementation\n```python\n{raw_item.get('fixed_code', '')}\n```"

    elif category == "exercise_bank":
        q = raw_item.get("question", "")
        opts = raw_item.get("options")
        opts_str = ""
        if opts and isinstance(opts, dict):
            opts_str = "\n" + "\n".join(f"{k}. {v}" for k, v in opts.items())

        user_prompt = f"Topic: {topic} ({raw_item.get('difficulty', 'intermediate')})\n\n{q}{opts_str}"
        ans = raw_item.get("correct_answer", "")
        expl = raw_item.get("explanation", "")
        assistant_reply = f"**Correct Answer:** {ans}\n\n**Step-by-Step Explanation:**\n{expl}"

    elif category == "grading_rubrics":
        exercise = raw_item.get("exercise", "")
        rubric_grid = raw_item.get("marking_grid", [])
        grid_str = "\n".join(f"- {item.get('item', 'Criterion')}: {item.get('criteria', '')} ({item.get('points', 0)} pts)" for item in rubric_grid)

        # For rubrics with sample submissions, format a representative evaluation
        samples = raw_item.get("sample_submissions", [])
        sample_sub = samples[0] if samples else {"text": "Sample answer", "score": 1.0, "feedback": "Good"}

        user_prompt = f"Exercise: {exercise}\nTotal Points: {raw_item.get('total_points', 5.0)}\n\nMarking Grid:\n{grid_str}\n\nStudent Submission:\n{sample_sub.get('text', '')}"
        assistant_reply = f"**Awarded Score:** {sample_sub.get('score', 0)} / {raw_item.get('total_points', 5.0)}\n\n**Feedback:**\n{sample_sub.get('feedback', '')}"

    else:
        user_prompt = str(raw_item)
        assistant_reply = ""

    return {
        "id": item_id,
        "category": category,
        "topic": topic,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
            {"role": "assistant", "content": assistant_reply}
        ]
    }


def compile_and_validate_all_datasets(sft_dir: Path = SFT_DIR) -> Dict[str, Any]:
    """
    Validates all files in data/sft and compiles standard chat & train/val splits.
    """
    categories = ["math_derivations", "code_debugging", "exercise_bank", "grading_rubrics"]
    all_chat_records = []
    all_alpaca_records = []
    validation_report = {"valid_count": 0, "errors": [], "by_category": {}}

    for cat in categories:
        file_path = sft_dir / f"{cat}.jsonl"
        if not file_path.exists():
            continue

        cat_count = 0
        with open(file_path, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, start=1):
                line = line.strip()
                if not line:
                    continue

                try:
                    data = json.loads(line)
                except Exception as e:
                    validation_report["errors"].append(f"[{cat}:{line_no}] Invalid JSON: {e}")
                    continue

                # Check code snippets if present
                if "fixed_code" in data:
                    ok, msg = check_code_syntax(data["fixed_code"])
                    if not ok:
                        validation_report["errors"].append(f"[{cat}:{line_no}] Code error: {msg}")

                # Convert to standard Chat format
                chat_entry = format_to_chat(cat, data)

                # Check LaTeX balance on assistant reply
                asst_msg = chat_entry["messages"][-1]["content"]
                ok_latex, msg_latex = check_latex_balance(asst_msg)
                if not ok_latex:
                    validation_report["errors"].append(f"[{cat}:{line_no}] LaTeX error: {msg_latex}")

                all_chat_records.append(chat_entry)

                # Also create Alpaca format record
                all_alpaca_records.append({
                    "instruction": chat_entry["messages"][1]["content"],
                    "input": "",
                    "output": chat_entry["messages"][2]["content"],
                    "category": cat,
                    "topic": chat_entry["topic"]
                })

                cat_count += 1

        validation_report["by_category"][cat] = cat_count

    validation_report["valid_count"] = len(all_chat_records)

    # 1. Write compiled Chat format
    chat_file = sft_dir / "nlp_sft_all_chat.jsonl"
    with open(chat_file, "w", encoding="utf-8") as f:
        for r in all_chat_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    # 2. Write compiled Alpaca format
    alpaca_file = sft_dir / "nlp_sft_all_alpaca.jsonl"
    with open(alpaca_file, "w", encoding="utf-8") as f:
        for r in all_alpaca_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    # 3. Create reproducible Train (80%) and Val (20%) splits
    random.seed(42)
    shuffled = list(all_chat_records)
    random.shuffle(shuffled)
    split_idx = max(1, int(len(shuffled) * 0.80))
    train_split = shuffled[:split_idx]
    val_split = shuffled[split_idx:]

    train_file = sft_dir / "nlp_sft_train.jsonl"
    with open(train_file, "w", encoding="utf-8") as f:
        for r in train_split:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    val_file = sft_dir / "nlp_sft_val.jsonl"
    with open(val_file, "w", encoding="utf-8") as f:
        for r in val_split:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    validation_report["train_count"] = len(train_split)
    validation_report["val_count"] = len(val_split)
    validation_report["output_files"] = [
        str(chat_file.relative_to(PROJECT_ROOT)),
        str(alpaca_file.relative_to(PROJECT_ROOT)),
        str(train_file.relative_to(PROJECT_ROOT)),
        str(val_file.relative_to(PROJECT_ROOT))
    ]

    return validation_report


if __name__ == "__main__":
    print("Compiling and validating all SFT datasets...")
    report = compile_and_validate_all_datasets()
    print("\nValidation Summary:")
    print(f"Total Valid Records: {report['valid_count']}")
    print(f"Train Split: {report['train_count']} | Val Split: {report['val_count']}")
    print("Counts by Category:", report["by_category"])
    if report["errors"]:
        print(f"Warnings / Errors ({len(report['errors'])}):")
        for err in report["errors"]:
            print(f" - {err}")
    else:
        print("All records 100% validated (No JSON, LaTeX, or Code errors found).")
