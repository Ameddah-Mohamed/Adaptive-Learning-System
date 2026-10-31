"""
Build Supervised Fine-Tuning (SFT) Datasets for NLP Adaptive Learning System.
Generates:
1. data/sft/exercise_bank.jsonl
2. data/sft/math_derivations.jsonl
3. data/sft/code_debugging.jsonl
4. data/sft/grading_rubrics.jsonl
"""

import json
from pathlib import Path


def create_exercise_bank(output_path: Path):
    exercises = [
        # --- QUIZ & EXAM MCQs ---
        {
            "id": "EX-NORM-01",
            "topic": "Text Preprocessing & Normalization",
            "difficulty": "beginner",
            "type": "mcq",
            "question": "Word normalization often includes processes like:",
            "options": {
                "A": "Lemmatization and stemming",
                "B": "Tokenization and segmentation",
                "C": "Frequency analysis",
                "D": "Part-of-speech tagging"
            },
            "correct_answer": "A",
            "points": 0.5,
            "explanation": "Word normalization is the task of putting words/tokens in a standard format. Key processes include case folding, stemming (stripping affixes), and lemmatization (reducing to dictionary lemma). Tokenization breaks text into tokens rather than normalizing them."
        },
        {
            "id": "EX-NORM-02",
            "topic": "Text Preprocessing & Normalization",
            "difficulty": "beginner",
            "type": "mcq",
            "question": "What distinguishes lemmatization from stemming?",
            "options": {
                "A": "Lemmatization removes suffixes, while stemming does not",
                "B": "Lemmatization returns the base form (lemma) of a word using morphological analysis, while stemming heuristics cut off affixes",
                "C": "Stemming is more computationally expensive than lemmatization",
                "D": "Lemmatization requires no vocabulary, while stemming requires a full dictionary"
            },
            "correct_answer": "B",
            "points": 0.5,
            "explanation": "Stemming uses crude heuristic chopping rules (like Porter stemmer) often resulting in non-words ('oper' for 'operation'). Lemmatization uses morphological analysis and vocabulary lookup to return legitimate dictionary base forms."
        },
        {
            "id": "EX-LM-PERP-01",
            "topic": "Language Modeling & Evaluation",
            "difficulty": "intermediate",
            "type": "calculation",
            "question": "Given a language model that predicts a sequence of words with combined probability P = 0.001, and the sequence consists of N = 5 words, compute the perplexity (PP) of this model.",
            "options": {
                "A": "2",
                "B": "4",
                "C": "8",
                "D": "12"
            },
            "correct_answer": "B",
            "points": 1.0,
            "explanation": "Perplexity is the inverse probability of the word sequence normalized by sequence length N:\n$$PP(W) = P(w_1, w_2, ..., w_N)^{-\\frac{1}{N}}$$\nGiven $P = 0.001 = 10^{-3}$ and $N = 5$:\n$$PP(W) = (10^{-3})^{-\\frac{1}{5}} = 10^{3/5} = 10^{0.6} \\approx 3.981 \\approx 4$$"
        },
        {
            "id": "EX-NB-SMOOTH-01",
            "topic": "Naive Bayes & Smoothing",
            "difficulty": "intermediate",
            "type": "calculation",
            "question": "During training of a Naive Bayes classifier, word $w$ appears 5 times in class $C_{\\text{positive}}$ and 3 times in class $C_{\\text{negative}}$. There are 50 occurrences of other words in $C_{\\text{positive}}$. Assuming Laplace (add-1) smoothing with vocabulary size $|V| = 1000$, calculate $P(w \\mid C_{\\text{positive}})$.",
            "options": {
                "A": "0.005",
                "B": "0.006",
                "C": "0.007",
                "D": "0.008"
            },
            "correct_answer": "B",
            "points": 1.0,
            "explanation": "With Laplace add-1 smoothing:\n$$P(w \\mid C) = \\frac{\\text{count}(w, C) + 1}{\\sum_{w' \\in V} \\text{count}(w', C) + |V|}$$\nTotal word tokens in $C_{\\text{positive}} = 50 + 5 = 55$.\n$$P(w \\mid C_{\\text{positive}}) = \\frac{5 + 1}{55 + 1000} = \\frac{6}{1055} \\approx 0.00568 \\approx 0.006$$"
        },
        {
            "id": "EX-VEC-SIM-01",
            "topic": "Vector Semantics & Cosine Similarity",
            "difficulty": "intermediate",
            "type": "calculation",
            "question": "Given word vectors $g = (1,3)$ for 'girl', $b = (2,1)$ for 'boy', $p = (4,5)$ for 'princess', and $q = (3,6)$ for 'queen', compute cosine similarity to identify which word is closest to 'girl'.",
            "options": {
                "A": "boy",
                "B": "princess",
                "C": "queen",
                "D": "All equidistant"
            },
            "correct_answer": "C",
            "points": 1.0,
            "explanation": "Cosine similarity $\\cos(u, v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|}$.\n$\\|g\\| = \\sqrt{1^2+3^2} = \\sqrt{10}$.\n- $\\cos(g, b) = \\frac{1\\cdot 2 + 3\\cdot 1}{\\sqrt{10}\\sqrt{5}} = \\frac{5}{\\sqrt{50}} \\approx 0.707$\n- $\\cos(g, p) = \\frac{1\\cdot 4 + 3\\cdot 5}{\\sqrt{10}\\sqrt{41}} = \\frac{19}{\\sqrt{410}} \\approx 0.938$\n- $\\cos(g, q) = \\frac{1\\cdot 3 + 3\\cdot 6}{\\sqrt{10}\\sqrt{45}} = \\frac{21}{\\sqrt{450}} \\approx 0.989$\nTherefore, 'queen' is closest with similarity $\\approx 0.99$."
        },
        {
            "id": "EX-TRANS-MHA-01",
            "topic": "Transformer Architecture & Attention",
            "difficulty": "advanced",
            "type": "derivation",
            "question": "In a Transformer with maximum sequence length $L = 20$, embedding dimension $d_{\\text{model}} = 512$, and $h = 8$ attention heads:\n1. What is the head dimension $d_k$?\n2. What are the shapes of $Q, K, V$ per head?\n3. Calculate the total parameter count in the Multi-Head Attention layer (including projection matrix $W_O$, omitting bias).",
            "correct_answer": "1. d_k = 64; 2. (20, 64); 3. 1,048,576 parameters (4 * 512 * 512).",
            "points": 3.0,
            "explanation": "1. Head dimension: $d_k = d_v = \\frac{d_{\\text{model}}}{h} = \\frac{512}{8} = 64$.\n2. Per head, input matrix $X \\in \\mathbb{R}^{20 \\times 512}$ projected by $W_i^Q \\in \\mathbb{R}^{512 \\times 64}$ yields $Q_i \\in \\mathbb{R}^{20 \\times 64}$. Similarly $K_i, V_i \\in \\mathbb{R}^{20 \\times 64}$.\n3. Parameter count:\n- $W^Q, W^K, W^V$: each has dimension $d_{\\text{model}} \\times d_{\\text{model}} = 512 \\times 512 = 262,144$.\n- Output projection $W^O$: dimension $d_{\\text{model}} \\times d_{\\text{model}} = 512 \\times 512 = 262,144$.\n- Total parameters $= 4 \\times (512 \\times 512) = 4 \\times 262,144 = 1,048,576$ parameters."
        },
        {
            "id": "EX-DECODE-STRAT-01",
            "topic": "LLM Decoding Strategies",
            "difficulty": "intermediate",
            "type": "conceptual",
            "question": "For next-token generation with sorted token probabilities: ['catches': 0.45, 'throws': 0.30, 'chases': 0.10, 'bites': 0.03, 'eats': 0.02, 'sleeps': 0.019, 'hates': 0.015, 'takes': 0.001]:\n1. Which token is picked by greedy decoding?\n2. Which tokens are in the candidate set for top-k with k=3?\n3. Which tokens are retained by nucleus (top-p) sampling with p=0.92?",
            "correct_answer": "1. 'catches'\n2. ['catches', 'throws', 'chases']\n3. ['catches', 'throws', 'chases', 'bites', 'eats', 'sleeps', 'hates']",
            "points": 2.5,
            "explanation": "1. Greedy selects $\\arg\\max P(w)$, which is 'catches' (0.45).\n2. Top-k with $k=3$ retains the top 3 highest probability tokens: 'catches' (0.45), 'throws' (0.30), 'chases' (0.10).\n3. Top-p (nucleus) finds the smallest set of tokens whose cumulative probability $\\ge 0.92$:\n- catches (0.45) -> cum = 0.45\n- throws (0.30) -> cum = 0.75\n- chases (0.10) -> cum = 0.85\n- bites (0.03) -> cum = 0.88\n- eats (0.02) -> cum = 0.90\n- sleeps (0.019) -> cum = 0.919 (< 0.92)\n- hates (0.015) -> cum = 0.934 (>= 0.92)\nThus candidates retained: catches, throws, chases, bites, eats, sleeps, hates."
        },
        {
            "id": "EX-PARSE-CKY-01",
            "topic": "Syntax & Constituency Parsing (CKY)",
            "difficulty": "advanced",
            "type": "derivation",
            "question": "Explain the rules and procedure for converting a Context-Free Grammar (CFG) into Chomsky Normal Form (CNF) required for CKY parsing.",
            "correct_answer": "Eliminate epsilon rules, eliminate unit productions (A -> B), replace hybrid rules (A -> a B) with terminal rules, and binarize long rules (A -> B C D into A -> X1 D, X1 -> B C).",
            "points": 3.0,
            "explanation": "Chomsky Normal Form requires all production rules to be either:\n1. $A \\to B C$ (strictly two non-terminals), or\n2. $A \\to a$ (strictly one terminal symbol).\n\nStep-by-step conversion:\n1. Eliminate start symbol from RHS (add $S_0 \\to S$).\n2. Eliminate $\\epsilon$ (null) productions ($A \\to \\epsilon$) by propagating across referencing rules.\n3. Eliminate unit productions ($A \\to B$) by substituting RHS of $B$ directly into $A$.\n4. Replace terminals in mixed rules (e.g., $A \\to a B$ becomes $A \\to T_a B$ with $T_a \\to a$).\n5. Binarize rules with $>2$ non-terminals: $A \\to B C D$ becomes $A \\to X_1 D$ and $X_1 \\to B C$."
        }
    ]
    
    with open(output_path, "w", encoding="utf-8") as f:
        for ex in exercises:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
            
    print(f"Created exercise bank with {len(exercises)} problems in {output_path}")


def create_math_derivations(output_path: Path):
    derivations = [
        {
            "topic": "Self-Attention Mechanism",
            "title": "Mathematical Derivation of Scaled Dot-Product Attention",
            "instruction": "Derive the Scaled Dot-Product Attention equation and explain why the scaling factor 1/sqrt(d_k) is required.",
            "response": """### Scaled Dot-Product Attention Formulation

Given Query matrix $Q \\in \\mathbb{R}^{n \\times d_k}$, Key matrix $K \\in \\mathbb{R}^{m \\times d_k}$, and Value matrix $V \\in \\mathbb{R}^{m \\times d_v}$:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

#### Step-by-Step Breakdown:
1. **Raw Compatibility Score Matrix**:
   $$S = Q K^T \\in \\mathbb{R}^{n \\times m}$$
   For a single query vector $q$ and key vector $k$:
   $$s = q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$$

2. **Variance Scaling ($1/\\sqrt{d_k}$)**:
   Assume $q_i$ and $k_i$ are independent random variables with zero mean and unit variance:
   $$\\mathbb{E}[q_i] = 0, \\quad \\text{Var}(q_i) = 1$$
   $$\\mathbb{E}[k_i] = 0, \\quad \\text{Var}(k_i) = 1$$
   Then the dot product $s = \\sum_{i=1}^{d_k} q_i k_i$ has:
   $$\\mathbb{E}[s] = \\sum_{i=1}^{d_k} \\mathbb{E}[q_i k_i] = 0$$
   $$\\text{Var}(s) = \\sum_{i=1}^{d_k} \\text{Var}(q_i k_i) = \\sum_{i=1}^{d_k} \\text{Var}(q_i)\\text{Var}(k_i) = d_k$$
   Because the variance of $s$ scales linearly with $d_k$, for large dimensions (e.g., $d_k = 64$ or $128$), the magnitude of the scores grows large.
   
   Dividing by $\\sqrt{d_k}$ scales the variance back to 1:
   $$\\text{Var}\\left(\\frac{s}{\\sqrt{d_k}}\\right) = \\frac{\\text{Var}(s)}{d_k} = \\frac{d_k}{d_k} = 1$$

3. **Softmax Stability**:
   Without the $\\sqrt{d_k}$ divisor, large positive logits cause the softmax function to saturate with extreme values (near 0 and 1). In these saturated regions, the softmax gradients $\\frac{\\partial \\text{softmax}(z)_i}{\\partial z_j}$ become infinitesimally small, causing the vanishing gradient problem during backpropagation."""
        },
        {
            "topic": "Language Modeling",
            "title": "Perplexity and Cross-Entropy Relationship",
            "instruction": "Derive the mathematical relationship between the cross-entropy loss H(P, Q) and Perplexity PP(W) in language modeling.",
            "response": """### Relationship Between Cross-Entropy Loss and Perplexity

Let $W = (w_1, w_2, ..., w_N)$ be a sequence of $N$ words. The probability assigned to the sequence by a language model $M$ using the chain rule is:
$$P(W) = \\prod_{i=1}^N P(w_i \\mid w_1, ..., w_{i-1})$$

#### 1. Perplexity Definition
Perplexity is defined as the reciprocal of the sequence probability normalized by sequence length $N$:
$$PP(W) = P(W)^{-\\frac{1}{N}} = \\left( \\prod_{i=1}^N P(w_i \\mid w_1, ..., w_{i-1}) \\right)^{-\\frac{1}{N}}$$

#### 2. Taking the Natural Logarithm
Taking $\\ln$ of both sides:
$$\\ln(PP(W)) = \\ln\\left( P(W)^{-\\frac{1}{N}} \\right) = -\\frac{1}{N} \\ln P(W)$$
$$\\ln(PP(W)) = -\\frac{1}{N} \\sum_{i=1}^N \\ln P(w_i \\mid w_1, ..., w_{i-1})$$

#### 3. Cross-Entropy Loss
In empirical NLP model training, the average cross-entropy loss per token $\\mathcal{L}_{CE}$ is:
$$\\mathcal{L}_{CE} = -\\frac{1}{N} \\sum_{i=1}^N \\log_b P(w_i \\mid w_{<i})$$

When the base of the logarithm is $e$:
$$\\mathcal{L}_{CE} = -\\frac{1}{N} \\sum_{i=1}^N \\ln P(w_i \\mid w_{<i})$$

Comparing the two formulations yields:
$$\\ln(PP(W)) = \\mathcal{L}_{CE} \\implies PP(W) = e^{\\mathcal{L}_{CE}}$$

If base-2 logarithms are used (measuring entropy in bits):
$$PP(W) = 2^{H(W)}$$
**Key Takeaway**: Minimizing cross-entropy loss during training directly minimizes the model's perplexity on test data."""
        },
        {
            "topic": "LLM Decoding",
            "title": "Temperature Scaling Formulation and Softmax Derivative",
            "instruction": "Explain the mathematical formulation of Temperature Scaling on logits and derive the limit behavior as T -> 0 and T -> infinity.",
            "response": """### Temperature Scaling in Softmax

Let $z = (z_1, z_2, ..., z_V)$ be the unnormalized logit scores from the language model head over a vocabulary of size $V$.
The temperature-scaled probability $P_T(y = i)$ is given by:

$$P_T(y = i) = \\frac{\\exp(z_i / T)}{\\sum_{j=1}^V \\exp(z_j / T)}$$

where $T > 0$ is the temperature hyperparameter.

#### Asymptotic Limit Analysis:

1. **Greedy / Argmax Limit ($T \\to 0^+$)**:
   Let $z_{\\max} = \\max_j z_j$, assuming a unique maximum for simplicity.
   $$P_T(y = i) = \\frac{\\exp\\left(\\frac{z_i - z_{\\max}}{T}\\right)}{\\sum_{j=1}^V \\exp\\left(\\frac{z_j - z_{\\max}}{T}\\right)}$$
   - If $z_i = z_{\\max}$, then $\\frac{z_i - z_{\\max}}{T} = 0$, so $\\exp(0) = 1$.
   - If $z_i < z_{\\max}$, then $z_i - z_{\\max} < 0$, so as $T \\to 0^+$, $\\frac{z_i - z_{\\max}}{T} \\to -\\infty$, meaning $\\exp(-\\infty) = 0$.
   
   Therefore:
   $$\\lim_{T \\to 0^+} P_T(y = i) = \\begin{cases} 1 & \\text{if } i = \\arg\\max_j z_j \\\\ 0 & \\text{otherwise} \\end{cases}$$
   Temperature approaching 0 collapses the distribution into a deterministic Kronecker delta (equivalent to Greedy Decoding).

2. **Uniform Distribution Limit ($T \\to \\infty$)**:
   For any logit $z_i$:
   $$\\lim_{T \\to \\infty} \\frac{z_i}{T} = 0 \\implies \\exp(0) = 1$$
   Thus:
   $$\\lim_{T \\to \\infty} P_T(y = i) = \\frac{1}{\\sum_{j=1}^V 1} = \\frac{1}{V}$$
   High temperature flattens the distribution toward completely random, uniform token selection."""
        }
    ]
    
    with open(output_path, "w", encoding="utf-8") as f:
        for d in derivations:
            f.write(json.dumps(d, ensure_ascii=False) + "\n")
            
    print(f"Created math derivations dataset with {len(derivations)} items in {output_path}")


def create_code_debugging(output_path: Path):
    debugging_examples = [
        {
            "id": "DEBUG-ATTN-SHAPE-01",
            "topic": "Self-Attention Implementation",
            "title": "Fixing Dimension Mismatch in PyTorch Scaled Dot-Product Attention",
            "buggy_code": """import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k):
        super().__init__()
        self.d_k = d_k

    def forward(self, q, k, v, mask=None):
        # q: (batch, seq_len, d_k)
        # k: (batch, seq_len, d_k)
        # BUG: Matrix multiplication with wrong transpose dimension
        scores = torch.matmul(q, k) / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
            
        attn_weights = torch.softmax(scores, dim=-1)
        output = torch.matmul(attn_weights, v)
        return output, attn_weights
""",
            "error_type": "RuntimeError: The size of tensor a (seq_len) must match the size of tensor b (d_k) at non-singleton dimension 2",
            "explanation": "In self-attention, we need to compute Q @ K^T. In PyTorch `torch.matmul(q, k)` attempts to multiply `(B, L, D)` by `(B, L, D)`, which fails because dimension 2 (D) does not match dimension 1 (L). The Key matrix must be transposed along its last two dimensions: `k.transpose(-2, -1)`.",
            "fixed_code": """import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k):
        super().__init__()
        self.d_k = d_k

    def forward(self, q, k, v, mask=None):
        # q: (batch, seq_len, d_k)
        # k: (batch, seq_len, d_k)
        # Transpose last two dimensions of k: (batch, d_k, seq_len)
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
            
        attn_weights = torch.softmax(scores, dim=-1)
        output = torch.matmul(attn_weights, v)
        return output, attn_weights
"""
        },
        {
            "id": "DEBUG-LOSS-PAD-01",
            "topic": "Sequence Modeling Training",
            "title": "Ignoring Padding Index in Cross-Entropy Loss",
            "buggy_code": """import torch
import torch.nn as nn

# Model output logits: (batch_size, seq_len, vocab_size)
logits = torch.randn(4, 16, 5000, requires_grad=True)
# Target tokens: (batch_size, seq_len) with pad_token_id = 0
targets = torch.randint(0, 5000, (4, 16))

# BUG: Computing loss over all tokens including padding, and flattening error
criterion = nn.CrossEntropyLoss()
loss = criterion(logits, targets)
""",
            "error_type": "RuntimeError: Expected target size [4, 5000], got [4, 16]",
            "explanation": "PyTorch `nn.CrossEntropyLoss` expects input shaped `(N, C)` or `(N, C, d1, ...)` where class channel C is dimension 1, or flattened `(N * L, C)` with targets `(N * L)`. Additionally, padding tokens (`pad_token_id`) must be ignored using `ignore_index` to prevent the model from learning to predict padding.",
            "fixed_code": """import torch
import torch.nn as nn

logits = torch.randn(4, 16, 5000, requires_grad=True)
targets = torch.randint(0, 5000, (4, 16))

pad_token_id = 0
# Reshape logits to (batch_size * seq_len, vocab_size) and targets to (batch_size * seq_len)
# Set ignore_index to ensure pad tokens contribute zero loss and zero gradient
criterion = nn.CrossEntropyLoss(ignore_index=pad_token_id)
loss = criterion(logits.view(-1, logits.size(-1)), targets.view(-1))
loss.backward()
"""
        },
        {
            "id": "DEBUG-TOPP-CUMSUM-01",
            "topic": "Nucleus (Top-p) Sampling Implementation",
            "title": "Off-by-one Shift in Nucleus Filtering Mask",
            "buggy_code": """import torch

def top_p_sampling(logits, p=0.9):
    probs = torch.softmax(logits, dim=-1)
    sorted_probs, sorted_indices = torch.sort(probs, descending=True, dim=-1)
    
    # BUG: If cumulative sum exceeds p on the first token, mask removes everything
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
    sorted_indices_to_remove = cumulative_probs > p
    
    # Buggy masking
    sorted_probs[sorted_indices_to_remove] = 0.0
    sorted_probs = sorted_probs / sorted_probs.sum()
    next_token = torch.multinomial(sorted_probs, 1)
    return sorted_indices.gather(-1, next_token)
""",
            "error_type": "Logical Bug: Always removes the boundary token that pushed the cumulative sum over p, or zero-out entire distribution if top token > p",
            "explanation": "Standard top-p retains all tokens up to and *including* the token that causes the cumulative probability to exceed p. Therefore, `sorted_indices_to_remove` must be shifted right by 1 index so that the first token that exceeds p is kept.",
            "fixed_code": """import torch

def top_p_sampling(logits, p=0.9):
    probs = torch.softmax(logits, dim=-1)
    sorted_probs, sorted_indices = torch.sort(probs, descending=True, dim=-1)
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
    
    # Shift indices to the right to keep also the first token above threshold
    sorted_indices_to_remove = cumulative_probs > p
    sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
    sorted_indices_to_remove[..., 0] = 0
    
    # Scatter back to original indices
    indices_to_remove = sorted_indices_to_remove.scatter(dim=-1, index=sorted_indices, src=sorted_indices_to_remove)
    filtered_logits = logits.masked_fill(indices_to_remove, float('-inf'))
    
    sample_probs = torch.softmax(filtered_logits, dim=-1)
    next_token = torch.multinomial(sample_probs, 1)
    return next_token
"""
        }
    ]
    
    with open(output_path, "w", encoding="utf-8") as f:
        for ex in debugging_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
            
    print(f"Created code debugging dataset with {len(debugging_examples)} examples in {output_path}")


def create_grading_rubrics(output_path: Path):
    rubric_cases = [
        {
            "id": "GRADE-NB-BIGRAM-01",
            "exercise": "Multinomial Naive Bayes with Bigram LM Sentiment Classification",
            "total_points": 5.0,
            "marking_grid": [
                {
                    "item": "Preprocessing & Special Tokens (<s>, </s>)",
                    "points": 1.0,
                    "criteria": "Correct lowercase, punctuation removal, lemmatization, and insertion of <s> and </s> tokens for each training sentence."
                },
                {
                    "item": "Vocabulary Extraction & Size",
                    "points": 1.0,
                    "criteria": "Correct vocabulary of 10 unique tokens: ['</s>', '<s>', 'act', 'bad', 'good', 'hate', 'like', 'movie', 'play', 'real'] with |V| = 10."
                },
                {
                    "item": "Laplace Smoothing Formula Application",
                    "points": 1.0,
                    "criteria": "P(w_i | w_{i-1}, c) = (count(w_{i-1}, w_i, c) + 1) / (count(w_{i-1}, c) + |V|)."
                },
                {
                    "item": "Test Sentence 1 Prior & Bigram Probability Calculations",
                    "points": 1.0,
                    "criteria": "P(pos) = 0.5, P(neg) = 0.5. Detailed bigram product showing P(pos|s1) ≈ 0.000174 and P(neg|s1) ≈ 0.000027."
                },
                {
                    "item": "Final Classification Decision",
                    "points": 1.0,
                    "criteria": "Correctly concludes Predicted Class = Positive because P(pos|s1) > P(neg|s1)."
                }
            ],
            "sample_submissions": [
                {
                    "student_id": "STUDENT-PERFECT",
                    "text": "For test sentence 1 '<s> like act bad </s>':\nP(pos) = 0.5, P(neg) = 0.5\nPos: P(like|<s>)=3/12, P(act|like)=2/12, P(bad|act)=1/12, P(</s>|bad)=1/10. Product = 0.5 * 0.25 * 0.1667 * 0.0833 * 0.1 = 1.736e-4\nNeg: P(like|<s>)=1/12, P(act|like)=1/10, P(bad|act)=1/11, P(</s>|bad)=1/14. Product = 0.5 * 0.0833 * 0.1 * 0.0909 * 0.0714 = 2.705e-5\nSince 1.736e-4 > 2.705e-5, sentiment is Positive.",
                    "score": 5.0,
                    "feedback": "Flawless solution. Correct smoothing, exact prior probabilities, accurate bigram transition calculations, and justified decision."
                },
                {
                    "student_id": "STUDENT-PARTIAL",
                    "text": "P(pos) is 0.5. I multiplied the words: like, act, bad. P(pos) comes out larger than P(neg), so predicted class is Positive.",
                    "score": 2.0,
                    "feedback": "Correct final prediction (+1.0), but missing explicit Laplace smoothing fractions, omitted <s> and </s> boundary transitions (-2.0), and failed to show intermediate bigram probabilities (-1.0)."
                }
            ]
        },
        {
            "id": "GRADE-MHA-PARAMS-01",
            "exercise": "Transformer Multi-Head Attention Parameter Derivation",
            "total_points": 4.0,
            "marking_grid": [
                {
                    "item": "Projection Matrices Identification",
                    "points": 1.0,
                    "criteria": "Identifies W_Q, W_K, W_V, and output projection W_O."
                },
                {
                    "item": "Dimensions Formulation",
                    "points": 1.5,
                    "criteria": "Each projection matrix has shape (d_model, d_model) = (512, 512)."
                },
                {
                    "item": "Total Calculation & Justification",
                    "points": 1.5,
                    "criteria": "4 * (512 * 512) = 1,048,576 parameters with clear justification."
                }
            ],
            "sample_submissions": [
                {
                    "student_id": "STUDENT-FLAWED",
                    "text": "Total parameters is 3 * 512 * 64 = 98304 because we have 8 heads and 3 matrices.",
                    "score": 0.5,
                    "feedback": "Incorrect dimension calculation. Multi-head projection matrices collectively project across all heads (512 to 512), totaling 4 matrices (W_Q, W_K, W_V, W_O), not 3."
                }
            ]
        }
    ]
    
    with open(output_path, "w", encoding="utf-8") as f:
        for r in rubric_cases:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
            
    print(f"Created grading rubrics dataset with {len(rubric_cases)} cases in {output_path}")


if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    sft_dir = PROJECT_ROOT / "data" / "sft"
    sft_dir.mkdir(parents=True, exist_ok=True)
    
    create_exercise_bank(sft_dir / "exercise_bank.jsonl")
    create_math_derivations(sft_dir / "math_derivations.jsonl")
    create_code_debugging(sft_dir / "code_debugging.jsonl")
    create_grading_rubrics(sft_dir / "grading_rubrics.jsonl")
    print("\nAll 4 SFT datasets generated successfully!")
