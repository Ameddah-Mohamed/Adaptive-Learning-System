"""
Unit tests for the CodeSandboxRunner and autograder tasks.
"""

import pytest
from src.evaluator.sandbox_runner import CodeSandboxRunner, validate_code_safety


@pytest.fixture
def runner():
    return CodeSandboxRunner(timeout_seconds=5.0)


def test_ast_security_validator():
    # Dangerous imports
    assert validate_code_safety("import os") is not None
    assert validate_code_safety("from subprocess import run") is not None
    assert validate_code_safety("import sys") is not None
    assert validate_code_safety("import socket") is not None
    
    # Dangerous calls
    assert validate_code_safety("open('file.txt', 'w')") is not None
    assert validate_code_safety("eval('1+1')") is not None
    assert validate_code_safety("exec('x = 1')") is not None
    
    # Safe code
    assert validate_code_safety("import math\ndef f(x): return math.sqrt(x)") is None
    assert validate_code_safety("import torch\nx = torch.tensor([1, 2])") is None


def test_sandbox_security_rejection(runner):
    res = runner.run_submission("task_01_bpe", "import os\nos.system('echo hi')")
    assert res["success"] is False
    assert res["passed"] == 0
    assert "Security" in res["output"]


def test_sandbox_exit_bypass_prevented(runner):
    code = "import sys\nsys.stderr.write('OK\\n')\nsys.exit(0)"
    res = runner.run_submission("task_01_bpe", code)
    assert res["success"] is False
    assert res["passed"] == 0


def test_task_01_bpe_correct(runner):
    bpe_code = """
from collections import Counter

def learn_bpe_merges(corpus: list[str], num_merges: int) -> list[tuple[str, str]]:
    words = [w.split() for w in corpus]
    merges = []
    for _ in range(num_merges):
        pairs = Counter()
        for word in words:
            for i in range(len(word) - 1):
                pairs[(word[i], word[i+1])] += 1
        if not pairs:
            break
        best_pair = max(pairs, key=lambda p: pairs[p])
        merges.append(best_pair)
        p0, p1 = best_pair
        merged = p0 + p1
        new_words = []
        for word in words:
            new_word = []
            i = 0
            while i < len(word):
                if i < len(word) - 1 and word[i] == p0 and word[i+1] == p1:
                    new_word.append(merged)
                    i += 2
                else:
                    new_word.append(word[i])
                    i += 1
            new_words.append(new_word)
        words = new_words
    return merges

def apply_bpe_tokenize(word: str, merges: list[tuple[str, str]]) -> list[str]:
    tokens = list(word) + ['</w>']
    for p0, p1 in merges:
        merged = p0 + p1
        new_tokens = []
        i = 0
        while i < len(tokens):
            if i < len(tokens) - 1 and tokens[i] == p0 and tokens[i+1] == p1:
                new_tokens.append(merged)
                i += 2
            else:
                new_tokens.append(tokens[i])
                i += 1
        tokens = new_tokens
    return tokens
"""
    res = runner.run_submission("task_01_bpe", bpe_code)
    assert res["success"] is True
    assert res["passed"] == 2
    assert res["total"] == 2


def test_task_01_bpe_incorrect(runner):
    bad_code = """
def learn_bpe_merges(corpus, num_merges):
    return []
def apply_bpe_tokenize(word, merges):
    return []
"""
    res = runner.run_submission("task_01_bpe", bad_code)
    assert res["success"] is False
    assert res["passed"] == 0
    assert res["total"] == 2


def test_task_02_attention_correct(runner):
    attn_code = """
import torch
import math

def scaled_dot_product_attention(q, k, v, mask=None):
    d_k = q.size(-1)
    scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attn = torch.softmax(scores, dim=-1)
    return torch.matmul(attn, v), attn
"""
    res = runner.run_submission("task_02_attention", attn_code)
    assert res["success"] is True
    assert res["passed"] == 3
    assert res["total"] == 3


def test_task_03_perplexity_correct(runner):
    perp_code = """
import math

def compute_perplexity(log_probabilities: list[float], N: int) -> float:
    cross_entropy = - (1.0 / N) * sum(log_probabilities)
    return math.exp(cross_entropy)
"""
    res = runner.run_submission("task_03_perplexity", perp_code)
    assert res["success"] is True
    assert res["passed"] == 2
    assert res["total"] == 2


def test_task_03_perplexity_incorrect(runner):
    bad_code = """
def compute_perplexity(log_probabilities, N):
    return -999.0
"""
    res = runner.run_submission("task_03_perplexity", bad_code)
    assert res["success"] is False
    assert res["passed"] == 0
    assert res["total"] == 2


def test_timeout_protection(runner):
    infinite_loop = """
def compute_perplexity(log_probabilities, N):
    while True:
        pass
"""
    # Use shorter timeout for fast test
    fast_runner = CodeSandboxRunner(timeout_seconds=1.5)
    res = fast_runner.run_submission("task_03_perplexity", infinite_loop)
    assert res["success"] is False
    assert res["passed"] == 0
    assert "timed out" in res["output"].lower()
