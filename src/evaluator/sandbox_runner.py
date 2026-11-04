"""
Code Sandbox Runner Module (Teammate 3 Task: Deliverable 2 - Code Execution & AST Security).

TODO for Teammate 3:
1. Implement an AST visitor (ast.NodeVisitor) that checks submitted code for unsafe operations:
   - Block dangerous imports: os, sys, subprocess, socket, shutil, pty, pathlib.
   - Block execution builtins: eval, exec, __import__, compile.
2. Run code against task unit tests in an isolated subprocess with timeout (6.0s).
3. Return structured test results.

Refer to: docs/TEAM_DATA_HANDOFF_AND_TASKS_GUIDE.md
"""

import ast
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

TASKS = {
    "task_01_bpe": {
        "title": "Assignment 1: Byte-Pair Encoding (BPE) Tokenizer",
        "chapter": 2,
        "timeout": 6.0
    },
    "task_02_attention": {
        "title": "Assignment 2: Scaled Dot-Product Attention in PyTorch",
        "chapter": 9,
        "timeout": 6.0
    },
    "task_03_perplexity": {
        "title": "Assignment 3: Language Model Perplexity",
        "chapter": 3,
        "timeout": 6.0
    }
}

DANGEROUS_MODULES = {"os", "sys", "subprocess", "socket", "shutil", "pty", "pathlib"}


class SecurityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.violations = []

    def visit_Import(self, node):
        for alias in node.names:
            base_mod = alias.name.split(".")[0]
            if base_mod in DANGEROUS_MODULES:
                self.violations.append(f"Security violation: Direct import of prohibited module '{base_mod}' is not allowed.")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            base_mod = node.module.split(".")[0]
            if base_mod in DANGEROUS_MODULES:
                self.violations.append(f"Security violation: Import from prohibited module '{base_mod}' is not allowed.")
        self.generic_visit(node)


def validate_code_safety(code: str) -> tuple[bool, Optional[str]]:
    """AST static security check function for code safety."""
    try:
        tree = ast.parse(code)
        visitor = SecurityVisitor()
        visitor.visit(tree)
        if visitor.violations:
            return False, visitor.violations[0]
        return True, None
    except SyntaxError as e:
        return False, f"Syntax error: {e}"


class CodeSandboxRunner:
    """Starter skeleton for Code Sandbox Runner with AST security guard."""

    def __init__(self, timeout_seconds: float = 6.0):
        self.timeout_seconds = timeout_seconds
        logger.info("CodeSandboxRunner initialized in STARTER mode. (Teammate 3 Task)")

    def run_submission(self, task_name: str, code: str) -> Dict[str, Any]:
        """
        TODO (Teammate 3):
        1. Parse code with ast.parse() and verify security rules.
        2. Execute the test suite for task_name in a subprocess.
        3. Enforce self.timeout_seconds.
        4. Return structured JSON results.
        """
        try:
            tree = ast.parse(code)
            visitor = SecurityVisitor()
            visitor.visit(tree)
            if visitor.violations:
                return {
                    "task": task_name,
                    "success": False,
                    "has_error": True,
                    "passed": 0,
                    "total": 1,
                    "output": "\n".join(visitor.violations),
                    "error_type": "SecurityViolation"
                }
        except SyntaxError as e:
            return {
                "task": task_name,
                "success": False,
                "has_error": True,
                "passed": 0,
                "total": 1,
                "output": f"SyntaxError: {e}",
                "error_type": "SyntaxError"
            }

        logger.warning(f"CodeSandboxRunner.run_submission('{task_name}') called in starter mode.")
        exp_tests = TASKS.get(task_name, {}).get("expected_tests", 2)
        return {
            "task": task_name,
            "success": True,
            "has_error": False,
            "passed": exp_tests,
            "total": exp_tests,
            "output": f"Code executed (Starter mode). Teammate 3 should hook up full pytest harness for {task_name}.",
            "errors": None
        }
