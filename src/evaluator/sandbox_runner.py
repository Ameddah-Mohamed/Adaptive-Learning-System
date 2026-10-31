"""
Automated Code Execution Sandbox with Security & Deterministic Grading.
Executes student Python / PyTorch code safely in an isolated subprocess with timeout
and resource protection, parses unit test results deterministically, and pairs
runtime errors with LLM pedagogical diagnostics.
"""

import sys
import os
import ast
import json
import re
import tempfile
import subprocess
import time
from pathlib import Path
from typing import Dict, Any, Optional

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.evaluator.coding_tasks.task_01_bpe import TEST_SUITE as BPE_TEST_SUITE
from src.evaluator.coding_tasks.task_02_attention import TEST_SUITE as ATTN_TEST_SUITE
from src.evaluator.coding_tasks.task_03_perplexity import TEST_SUITE as PERP_TEST_SUITE

TASKS = {
    "task_01_bpe": {
        "title": "Assignment 1: Byte-Pair Encoding (BPE) Tokenizer",
        "chapter": 2,
        "test_suite": BPE_TEST_SUITE,
        "expected_tests": 2
    },
    "task_02_attention": {
        "title": "Assignment 2: Scaled Dot-Product Attention (PyTorch)",
        "chapter": 9,
        "test_suite": ATTN_TEST_SUITE,
        "expected_tests": 3
    },
    "task_03_perplexity": {
        "title": "Assignment 3: Language Model Perplexity Calculator",
        "chapter": 3,
        "test_suite": PERP_TEST_SUITE,
        "expected_tests": 2
    }
}

FORBIDDEN_MODULES = {
    "os", "sys", "subprocess", "shutil", "socket", "pathlib", "pty",
    "commands", "urllib", "requests", "http", "multiprocessing", "threading",
    "ctypes", "builtins", "importlib", "signal", "inspect", "platform",
    "pickle", "webbrowser", "posix", "nt"
}

FORBIDDEN_CALLS = {
    "eval", "exec", "__import__", "open", "compile", "globals", "locals", "input"
}

FORBIDDEN_ATTRS = {
    "__subclasses__", "__globals__", "__code__", "__builtins__"
}


def validate_code_safety(code: str) -> Optional[str]:
    """
    Statically analyzes student code using Python AST to detect dangerous
    modules, calls, or filesystem/process tampering before execution.
    Returns an error message if a security violation is found, else None.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"SyntaxError: {e.msg} (line {e.lineno})"

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                mod = alias.name.split(".")[0]
                if mod in FORBIDDEN_MODULES:
                    return f"Security restriction: Importing '{mod}' is not permitted."
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                mod = node.module.split(".")[0]
                if mod in FORBIDDEN_MODULES:
                    return f"Security restriction: Importing from '{mod}' is not permitted."
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
                return f"Security restriction: Function '{node.func.id}()' is not permitted."
        elif isinstance(node, ast.Attribute):
            if node.attr in FORBIDDEN_ATTRS:
                return f"Security restriction: Accessing attribute '{node.attr}' is not permitted."

    return None


HARNESS_TEMPLATE = """# --- ISOLATED TEST HARNESS ---
import sys
import unittest
import json
import traceback

# --- STUDENT SUBMISSION ---
{student_code}

# --- UNIT TEST SUITE ---
{test_code}

class StructuredTestResult(unittest.TestResult):
    def __init__(self):
        super().__init__()
        self.records = []

    def addSuccess(self, test):
        super().addSuccess(test)
        self.records.append({{"name": test._testMethodName, "status": "PASSED", "message": ""}})

    def addFailure(self, test, err):
        super().addFailure(test, err)
        exctype, value, tb = err
        self.records.append({{"name": test._testMethodName, "status": "FAILED", "message": f"{{exctype.__name__}}: {{value}}"}})

    def addError(self, test, err):
        super().addError(test, err)
        exctype, value, tb = err
        self.records.append({{"name": test._testMethodName, "status": "ERROR", "message": f"{{exctype.__name__}}: {{value}}"}})

if __name__ == "__main__":
    suite = unittest.defaultTestLoader.loadTestsFromModule(sys.modules[__name__])
    result = StructuredTestResult()
    suite.run(result)
    
    passed_count = len([r for r in result.records if r["status"] == "PASSED"])
    total_count = len(result.records)
    payload = {{
        "success": result.wasSuccessful(),
        "passed": passed_count,
        "total": total_count,
        "details": result.records
    }}
    print("\\n__SANDBOX_RESULT_JSON__" + json.dumps(payload))
"""


class CodeSandboxRunner:
    def __init__(self, timeout_seconds: float = 5.0):
        self.timeout_seconds = timeout_seconds

    def run_submission(self, task_id: str, student_code: str) -> Dict[str, Any]:
        """
        Executes student code against task unit tests with safety checks
        and deterministic grading.
        """
        task_info = TASKS.get(task_id)
        if not task_info:
            return {
                "success": False,
                "passed": 0,
                "total": 0,
                "returncode": 1,
                "elapsed_seconds": 0.0,
                "output": f"Task '{task_id}' not found.",
                "has_error": True,
                "error": f"Task '{task_id}' not found."
            }

        expected_total = task_info.get("expected_tests", 3)

        # 1. AST Safety Pre-check
        safety_error = validate_code_safety(student_code)
        if safety_error:
            return {
                "success": False,
                "passed": 0,
                "total": expected_total,
                "returncode": 1,
                "elapsed_seconds": 0.0,
                "output": f"Security Violation: {safety_error}\nCode execution aborted.",
                "has_error": True,
                "error": safety_error
            }

        # 2. Prepare test code (strip __main__ block if present in test_suite to let harness manage it)
        raw_test_suite = task_info["test_suite"]
        test_suite_cleaned = re.sub(
            r'if\s+__name__\s*==\s*["\']__main__["\']\s*:[\s\S]*$',
            '',
            raw_test_suite
        )

        harness_script = HARNESS_TEMPLATE.format(
            student_code=student_code,
            test_code=test_suite_cleaned
        )

        # 3. Isolated subprocess execution
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = os.path.join(temp_dir, "submission.py")
            with open(temp_path, "w", encoding="utf-8") as f:
                f.write(harness_script)

            safe_env = {
                "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
                "PYTHONPATH": "",
                "LC_ALL": "en_US.UTF-8",
                "LANG": "en_US.UTF-8"
            }

            start_time = time.time()
            try:
                res = subprocess.run(
                    [sys.executable, temp_path],
                    capture_output=True,
                    text=True,
                    cwd=temp_dir,
                    env=safe_env,
                    timeout=self.timeout_seconds
                )
                elapsed = round(time.time() - start_time, 3)
                stdout = res.stdout
                stderr = res.stderr
                returncode = res.returncode

                # 4. Parse Structured JSON Result
                json_match = re.search(r"__SANDBOX_RESULT_JSON__(.*)$", stdout, re.MULTILINE)
                if json_match:
                    try:
                        result_data = json.loads(json_match.group(1).strip())
                        is_success = bool(result_data.get("success", False)) and (returncode == 0)
                        passed_count = int(result_data.get("passed", 0))
                        total_count = int(result_data.get("total", expected_total))
                        details = result_data.get("details", [])

                        # Build formatted execution report
                        report_lines = [
                            "======================= CODE EXECUTION REPORT =======================",
                            f"Assignment: {task_info['title']}",
                            f"Total Tests: {total_count} | Passed: {passed_count} | Failed: {total_count - passed_count}",
                            ""
                        ]
                        for item in details:
                            badge = f"[{item['status']}]"
                            msg = f": {item['message']}" if item.get("message") else ""
                            report_lines.append(f"{badge} {item['name']}{msg}")

                        report_lines.append("======================================================================")

                        # User prints prior to result
                        user_prints = stdout[:json_match.start()].strip()
                        if user_prints:
                            report_lines.append("\n[Standard Output]:")
                            report_lines.append(user_prints)

                        formatted_output = "\n".join(report_lines)

                        return {
                            "success": is_success,
                            "passed": passed_count,
                            "total": total_count,
                            "returncode": returncode,
                            "elapsed_seconds": elapsed,
                            "output": formatted_output,
                            "has_error": not is_success
                        }
                    except Exception as parse_ex:
                        pass

                # If JSON marker not found (script error / crash / exit before test run)
                combined_err = (stdout + "\n" + stderr).strip()
                return {
                    "success": False,
                    "passed": 0,
                    "total": expected_total,
                    "returncode": returncode if returncode != 0 else 1,
                    "elapsed_seconds": elapsed,
                    "output": f"Runtime / Compilation Error:\n{combined_err}",
                    "has_error": True
                }

            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "passed": 0,
                    "total": expected_total,
                    "returncode": -1,
                    "elapsed_seconds": self.timeout_seconds,
                    "output": f"Execution timed out after {self.timeout_seconds}s. Watch out for infinite loops or blocking calls!",
                    "has_error": True
                }
            except Exception as e:
                return {
                    "success": False,
                    "passed": 0,
                    "total": expected_total,
                    "returncode": -1,
                    "elapsed_seconds": 0.0,
                    "output": f"System sandbox error: {str(e)}",
                    "has_error": True
                }


if __name__ == "__main__":
    runner = CodeSandboxRunner()
    print("Testing BPE reference...")
    bpe_code = '''
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
'''
    res = runner.run_submission("task_01_bpe", bpe_code)
    print("BPE Result:\n", res["output"])
    print("Passed:", res["passed"], "/", res["total"])
