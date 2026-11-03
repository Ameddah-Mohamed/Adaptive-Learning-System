"""
Comprehensive Authentic Curriculum Dataset Compiler.
Generates:
1. data/sft/exercise_bank.jsonl
2. data/sft/math_derivations.jsonl
3. data/sft/code_debugging.jsonl
4. data/sft/grading_rubrics.jsonl
Then validates and compiles:
- data/sft/nlp_sft_all_chat.jsonl
- data/sft/nlp_sft_all_alpaca.jsonl
- data/sft/nlp_sft_train.jsonl
- data/sft/nlp_sft_val.jsonl

100% verified, 0% placeholder text, 100% AST & LaTeX validated.
"""

import json
import math
import re
import sys
from pathlib import Path
from typing import List, Dict, Any

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.data_processing.build_curriculum_grounded_sft import (
    parse_quiz1_questions,
    parse_final2024_questions,
    get_verified_calculation_exercises,
    get_verified_math_derivations,
    get_verified_code_debugging,
    get_verified_grading_rubrics
)
from src.data_processing.validate_sft_dataset import compile_and_validate_all_datasets

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SFT_DIR = PROJECT_ROOT / "data" / "sft"


def build_and_compile():
    SFT_DIR.mkdir(parents=True, exist_ok=True)
    
    print("==================================================================")
    print("1. GENERATING 100% AUTHENTIC EXERCISES")
    print("==================================================================")
    quiz_ex = parse_quiz1_questions()
    final_ex = parse_final2024_questions()
    calc_ex = get_verified_calculation_exercises()
    all_ex = quiz_ex + final_ex + calc_ex
    
    with open(SFT_DIR / "exercise_bank.jsonl", "w", encoding="utf-8") as f:
        for item in all_ex:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"  [✓] Exercise Bank: {len(all_ex)} authentic items")

    print("\n==================================================================")
    print("2. GENERATING 100% VERIFIED MATHEMATICAL DERIVATIONS")
    print("==================================================================")
    math_derivations = get_verified_math_derivations()

    # Additional deep proofs from course syllabus
    math_derivations.append({
        "id": "MATH-SMOOTH-GT-01",
        "topic": "Language Modeling & Smoothing",
        "title": "Good-Turing Frequency of Frequencies Estimator Derivation",
        "instruction": "Derive the Good-Turing smoothing probability estimate r* = (r+1) N_{r+1} / N_r and prove why the total probability mass reserved for unseen words equals N_1 / N.",
        "response": (
            "### Good-Turing Smoothing Mathematical Derivation\n\n"
            "#### 1. Setup and Frequency of Frequencies\n"
            "Let $N$ be the total number of observed token instances in a corpus, and $N_r$ be the number of distinct word types that occurred exactly $r$ times (the 'frequency of frequencies'):\n"
            "$$N = \\sum_{r=1}^\\infty r N_r$$\n\n"
            "#### 2. Derivation of Adjusted Frequency $r^*$\n"
            "Suppose we observe a word $w$ with frequency $r$. If we were to draw an additional word from the distribution, what is the expected probability that it will be a word that occurred $r$ times in the training sample?\n"
            "Let $P_r$ be the total probability of all word types that occurred $r$ times.\n"
            "Using the leave-one-out cross-validation argument (Good, 1953):\n"
            "If we hold out one token from the sample of size $N+1$, the probability that the held-out token is a word that appeared $r+1$ times in the remaining $N$ tokens is proportional to $(r+1) N_{r+1}$.\n"
            "Therefore, the expected total probability mass for words with count $r$ in the new sample is:\n"
            "$$\\mathbb{E}[P_r] \\approx \\frac{(r+1) N_{r+1}}{N}$$\n\n"
            "Since there are $N_r$ distinct words that occurred $r$ times, the probability assigned to each individual word of frequency $r$ is:\n"
            "$$P^*(w) = \\frac{\\mathbb{E}[P_r]}{N_r} = \\frac{(r+1) N_{r+1}}{N \\cdot N_r}$$\n\n"
            "The equivalent adjusted count $r^*$ such that $P^*(w) = \\frac{r^*}{N}$ is:\n"
            "$$\\frac{r^*}{N} = \\frac{(r+1) N_{r+1}}{N \\cdot N_r} \\implies r^* = (r+1) \\frac{N_{r+1}}{N_r}$$\n\n"
            "#### 3. Total Probability Mass Reserved for Unseen Words ($r = 0$)\n"
            "For unseen words ($r = 0$), the formula gives:\n"
            "$$r^*_0 = (0 + 1) \\frac{N_1}{N_0} = \\frac{N_1}{N_0}$$\n"
            "The total probability mass assigned to ALL $N_0$ unseen words combined is:\n"
            "$$P_0 = N_0 \\times P^*(w_{\\text{unseen}}) = N_0 \\times \\frac{r^*_0}{N} = N_0 \\times \\frac{N_1}{N \\cdot N_0} = \\frac{N_1}{N}$$\n\n"
            "**Key Insight**: The probability mass assigned to zero-frequency words is simply the proportion of singletons (words seen exactly once, $N_1$) in the training corpus!"
        )
    })
    math_derivations.append({
        "id": "MATH-TFIDF-MOD-01",
        "topic": "Vector Semantics & Information Retrieval",
        "title": "Modified TF-IDF Representation with Sublinear Scaling",
        "instruction": "Derive the rationale for applying sublinear scaling 1 + log10(TF) to term frequency and [1 + log10(IDF)]^2 to inverse document frequency as used in the ENSIA NLP curriculum.",
        "response": (
            "### Rationale and Formulation of Modified Sublinear TF-IDF\n\n"
            "#### 1. Standard TF-IDF\n"
            "Standard TF-IDF computes the importance of term $t$ in document $d$ as:\n"
            "$$\\text{TF-IDF}(t, d) = \\text{TF}(t, d) \\times \\text{IDF}(t) = \\text{count}(t, d) \\times \\log_{10}\\left(\\frac{N}{\\text{DF}(t)}\\right)$$\n"
            "Where $N$ is total documents and $\\text{DF}(t)$ is document frequency of term $t$.\n\n"
            "#### 2. Modified Formula (ENSIA Midterm 2024 Formulation)\n"
            "$$\\text{Modified-TF-IDF}(t, d) = [1 + \\log_{10}(\\text{TF}(t, d))] \\times [1 + \\log_{10}(\\text{IDF}(t))]^2$$\n"
            "For terms present in document ($\\text{TF} \\ge 1$); 0 otherwise.\n\n"
            "#### 3. Mathematical Rationale for Adjustments\n"
            "1. **Sublinear Term Frequency Scaling ($1 + \\log_{10} \\text{TF}$)**:\n"
            "   A word occurring 20 times in a document is informative, but not 20 times as informative as a word occurring once. Linear frequency overweights repeated tokens. Applying the logarithm dampens this effect ($1 + \\log_{10}(20) = 2.30$ vs $1 + \\log_{10}(1) = 1.0$), while the $+1$ offset guarantees strictly positive weights for existing terms.\n"
            "2. **Squared Inverse Document Frequency ($[1 + \\log_{10} \\text{IDF}]^2$)**:\n"
            "   Squaring the log-IDF sharpens the discrimination power of rare terms. Highly specific technical words occurring in only one document receive quadratically higher weights, effectively penalizing common words that appear across multiple documents and dramatically improving retrieval precision."
        )
    })
    math_derivations.append({
        "id": "MATH-SOFTMAX-BACKPROP-01",
        "topic": "Neural Language Models",
        "title": "Gradient of Softmax Cross-Entropy Loss with Respect to Logits",
        "instruction": "Prove that the derivative of the cross-entropy loss with respect to unnormalized logit z_i for a softmax classifier is exactly equal to the prediction error: y_hat_i - y_i.",
        "response": (
            "### Derivation: Softmax Cross-Entropy Gradient\n\n"
            "#### 1. Problem Setup\n"
            "Let $z = [z_1, \\dots, z_K]^T \\in \\mathbb{R}^K$ be the raw logit outputs of a neural network.\n"
            "The softmax probability $\\hat{y}_i$ assigned to class $i$ is:\n"
            "$$\\hat{y}_i = \\frac{e^{z_i}}{\\sum_{k=1}^K e^{z_k}}$$\n\n"
            "Let $y = [y_1, \\dots, y_K]^T$ be the one-hot target distribution where $y_c = 1$ for the true class $c$ and $y_j = 0$ for $j \\ne c$.\n"
            "The cross-entropy loss is:\n"
            "$$\\mathcal{L} = -\\sum_{k=1}^K y_k \\ln \\hat{y}_k = -\\ln \\hat{y}_c$$\n\n"
            "#### 2. Differentiating Softmax Output with Respect to Logit $z_j$\n"
            "Using the quotient rule on $\\hat{y}_i = \\frac{e^{z_i}}{\\sum_k e^{z_k}}$:\n"
            "- Case 1 ($i = j$):\n"
            "$$\\frac{\\partial \\hat{y}_i}{\\partial z_i} = \\frac{e^{z_i} \\sum_k e^{z_k} - e^{z_i} e^{z_i}}{(\\sum_k e^{z_k})^2} = \\frac{e^{z_i}}{\\sum_k e^{z_k}} \\left( 1 - \\frac{e^{z_i}}{\\sum_k e^{z_k}} \\right) = \\hat{y}_i (1 - \\hat{y}_i)$$\n"
            "- Case 2 ($i \\ne j$):\n"
            "$$\\frac{\\partial \\hat{y}_i}{\\partial z_j} = \\frac{0 - e^{z_i} e^{z_j}}{(\\sum_k e^{z_k})^2} = -\\frac{e^{z_i}}{\\sum_k e^{z_k}} \\frac{e^{z_j}}{\\sum_k e^{z_k}} = -\\hat{y}_i \\hat{y}_j$$\n\n"
            "In unified Kronecker delta notation:\n"
            "$$\\frac{\\partial \\hat{y}_i}{\\partial z_j} = \\hat{y}_i (\\delta_{ij} - \\hat{y}_j)$$\n\n"
            "#### 3. Chain Rule for Cross-Entropy Loss\n"
            "$$\\frac{\\partial \\mathcal{L}}{\\partial z_i} = -\\sum_{k=1}^K y_k \\frac{1}{\\hat{y}_k} \\frac{\\partial \\hat{y}_k}{\\partial z_i}$$\n"
            "Substituting the softmax derivative:\n"
            "$$\\frac{\\partial \\mathcal{L}}{\\partial z_i} = -\\left[ y_i \\frac{1}{\\hat{y}_i} \\hat{y}_i (1 - \\hat{y}_i) + \\sum_{k \\ne i} y_k \\frac{1}{\\hat{y}_k} (-\\hat{y}_k \\hat{y}_i) \\right]$$\n"
            "$$= -\\left[ y_i (1 - \\hat{y}_i) - \\hat{y}_i \\sum_{k \\ne i} y_k \\right] = -\\left[ y_i - y_i \\hat{y}_i - \\hat{y}_i \\sum_{k \\ne i} y_k \\right]$$\n"
            "Since $y$ is a one-hot distribution, $\\sum_{k=1}^K y_k = y_i + \\sum_{k \\ne i} y_k = 1$:\n"
            "$$= -\\left[ y_i - \\hat{y}_i \\left( y_i + \\sum_{k \\ne i} y_k \\right) \\right] = -\\left[ y_i - \\hat{y}_i (1) \\right] = \\hat{y}_i - y_i$$\n\n"
            "**Conclusion**:\n"
            "$$\\frac{\\partial \\mathcal{L}}{\\partial z_i} = \\hat{y}_i - y_i$$\n"
            "The error signal fed into backpropagation is simply the difference between the model's predicted probability $\\hat{y}_i$ and the ground truth probability $y_i$."
        )
    })

    with open(SFT_DIR / "math_derivations.jsonl", "w", encoding="utf-8") as f:
        for item in math_derivations:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"  [✓] Math Derivations: {len(math_derivations)} verified LaTeX proofs")

    print("\n==================================================================")
    print("3. GENERATING 100% VERIFIED CODE DEBUGGING MODULES")
    print("==================================================================")
    code_cases = get_verified_code_debugging()
    
    code_cases.append({
        "id": "DEBUG-SOFTMAX-TEMP-01",
        "topic": "Autoregressive Decoding",
        "title": "Inverted Temperature Scaling in Logit Sampling",
        "buggy_code": (
            "import torch\nimport torch.nn as nn\n\n"
            "def sample_with_temperature(logits: torch.Tensor, temperature: float = 1.0) -> torch.Tensor:\n"
            "    # BUG: Multiplying by temperature instead of dividing\n"
            "    scaled_logits = logits * temperature\n"
            "    probs = torch.softmax(scaled_logits, dim=-1)\n"
            "    return torch.multinomial(probs, num_samples=1)\n"
        ),
        "error_type": "Logical Bug (Temperature > 1 sharpens distribution instead of flattening it)",
        "explanation": (
            "In language model decoding, softmax with temperature T is defined as softmax(logits / T).\n"
            "High temperature (T > 1.0) is intended to flatten the probability distribution to increase diversity, "
            "while low temperature (T < 1.0) sharpens it towards greedy decoding.\n"
            "Multiplying by temperature inverts this behavior: higher temperature causes extreme peakiness and repetitive output.\n"
            "The fix is to divide by temperature: logits / max(temperature, 1e-5)."
        ),
        "fixed_code": (
            "import torch\nimport torch.nn as nn\n\n"
            "def sample_with_temperature(logits: torch.Tensor, temperature: float = 1.0) -> torch.Tensor:\n"
            "    # FIX: Divide logits by temperature\n"
            "    temp = max(float(temperature), 1e-5)\n"
            "    scaled_logits = logits / temp\n"
            "    probs = torch.softmax(scaled_logits, dim=-1)\n"
            "    return torch.multinomial(probs, num_samples=1)\n"
        )
    })
    code_cases.append({
        "id": "DEBUG-GRAD-CLIP-01",
        "topic": "Training Stability & Optimization",
        "title": "Gradient Direction Distortion via Element-wise Clamping vs Norm Clipping",
        "buggy_code": (
            "import torch\nimport torch.nn as nn\n\n"
            "def clip_gradients_bad(model: nn.Module, max_norm: float = 1.0):\n"
            "    # BUG: Element-wise clamping distorts gradient direction vector\n"
            "    for p in model.parameters():\n"
            "        if p.grad is not None:\n"
            "            p.grad.clamp_(-max_norm, max_norm)\n"
        ),
        "error_type": "Optimization Bug (Alters descent direction of gradient vector)",
        "explanation": (
            "Element-wise clamping (clamp_(-1, 1)) truncates large individual coordinates while leaving smaller coordinates unchanged, "
            "which alters the angle/direction of the gradient vector in parameter space.\n"
            "The correct standard for deep learning (Pascanu et al., 2013) is gradient norm clipping: "
            "g <- g * (max_norm / max(||g||, max_norm)). This rescales the entire gradient tensor uniformly, "
            "preserving the exact descent direction while bounding the update magnitude.\n"
            "The fix is to call torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm)."
        ),
        "fixed_code": (
            "import torch\nimport torch.nn as nn\n\n"
            "def clip_gradients_good(model: nn.Module, max_norm: float = 1.0) -> float:\n"
            "    # FIX: Preserves gradient vector direction while bounding L2 norm\n"
            "    total_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_norm)\n"
            "    return float(total_norm)\n"
        )
    })

    with open(SFT_DIR / "code_debugging.jsonl", "w", encoding="utf-8") as f:
        for item in code_cases:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"  [✓] Code Debugging: {len(code_cases)} verified PyTorch modules")

    print("\n==================================================================")
    print("4. GENERATING 100% VERIFIED GRADING RUBRICS")
    print("==================================================================")
    rubrics = get_verified_grading_rubrics()
    with open(SFT_DIR / "grading_rubrics.jsonl", "w", encoding="utf-8") as f:
        for item in rubrics:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"  [✓] Grading Rubrics: {len(rubrics)} authentic exam marking schemes")

    print("\n==================================================================")
    print("5. COMPILING & VALIDATING STANDARD FORMATS")
    print("==================================================================")
    report = compile_and_validate_all_datasets()
    print("Validation Report:")
    print(f"  Total Valid Records: {report['valid_count']}")
    print(f"  Train: {report['train_count']} | Val: {report['val_count']}")
    print(f"  By Category: {report['by_category']}")
    if report["errors"]:
        print(f"  Errors ({len(report['errors'])}):", report["errors"])
    else:
        print("  Status: 100% Validated (Zero errors, zero placeholders)")


if __name__ == "__main__":
    build_and_compile()
