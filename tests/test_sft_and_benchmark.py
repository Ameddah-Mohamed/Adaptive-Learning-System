"""
Unit and Integration Tests for Phase 4: SFT Dataset Standardization and Benchmark Suite.
"""

import json
import pytest
from pathlib import Path
from src.data_processing.validate_sft_dataset import (
    check_latex_balance,
    check_code_syntax,
    compile_and_validate_all_datasets
)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SFT_DIR = PROJECT_ROOT / "data" / "sft"


def test_latex_delimiter_checker():
    # Balanced examples
    assert check_latex_balance("Formula: $x + y = z$")[0] is True
    assert check_latex_balance("Display: $$Attention(Q,K,V) = \\text{softmax}(QK^T/\\sqrt{d_k})V$$")[0] is True
    assert check_latex_balance("Text without math")[0] is True

    # Unbalanced examples
    assert check_latex_balance("Broken formula: $x + y = z")[0] is False
    assert check_latex_balance("Missing closing: $$x^2 + y^2")[0] is False


def test_code_syntax_checker():
    good_code = "import torch\nx = torch.randn(2, 4)\ny = x.transpose(-2, -1)"
    bad_code = "def broken_func(:\n    return None"
    assert check_code_syntax(good_code)[0] is True
    assert check_code_syntax(bad_code)[0] is False


def test_sft_compilation_and_splits():
    report = compile_and_validate_all_datasets(SFT_DIR)
    assert report["valid_count"] == 300
    assert report["train_count"] == 240
    assert report["val_count"] == 60
    assert len(report["errors"]) == 0

    # Verify generated files exist
    train_file = SFT_DIR / "nlp_sft_train.jsonl"
    val_file = SFT_DIR / "nlp_sft_val.jsonl"
    chat_file = SFT_DIR / "nlp_sft_all_chat.jsonl"

    assert train_file.exists()
    assert val_file.exists()
    assert chat_file.exists()


def test_chat_format_structure():
    train_file = SFT_DIR / "nlp_sft_train.jsonl"
    with open(train_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    assert len(lines) == 240
    for line in lines:
        data = json.loads(line)
        assert "id" in data
        assert "category" in data
        assert "messages" in data
        assert isinstance(data["messages"], list)
        assert len(data["messages"]) == 3
        roles = [m["role"] for m in data["messages"]]
        assert roles == ["system", "user", "assistant"]
        assert len(data["messages"][1]["content"]) > 0
        assert len(data["messages"][2]["content"]) > 0


def test_authentic_exam_exercise_consistency():
    ex_file = SFT_DIR / "exercise_bank.jsonl"
    found_laplace = False
    found_ppl = False
    with open(ex_file, "r", encoding="utf-8") as f:
        for line in f:
            data = json.loads(line)
            if data.get("id") == "EX-QUIZ1-Q09":
                found_laplace = True
                assert data["correct_answer"] == "B"
                assert "Laplace smoothing" in data["question"]
            elif data.get("id") == "EX-QUIZ1-Q08":
                found_ppl = True
                assert data["correct_answer"] == "C"
                assert "perplexity" in data["question"]

    assert found_laplace is True, "EX-QUIZ1-Q09 not found in exercise_bank.jsonl"
    assert found_ppl is True, "EX-QUIZ1-Q08 not found in exercise_bank.jsonl"
