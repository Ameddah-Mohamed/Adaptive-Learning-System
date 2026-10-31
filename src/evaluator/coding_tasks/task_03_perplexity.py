"""
Assignment 3: Language Model Perplexity Calculator
Topic: Language Modeling & Evaluation (Chapter 03)
"""

STARTER_CODE = '''import math

def compute_perplexity(log_probabilities: list[float], N: int) -> float:
    """
    Computes Perplexity (PP) of a sequence of N words given their log probabilities (natural log):
        PP(W) = exp( - (1/N) * sum_{i=1}^N ln P(w_i | w_{<i}) )

    Args:
        log_probabilities: List of natural log probabilities ln P(w_i | context)
        N: Total number of tokens in the evaluated sequence

    Returns:
        float: Calculated perplexity score
    """
    # TODO: Calculate average cross entropy / negative log likelihood
    # TODO: Return exponential of cross entropy
    pass
'''

TEST_SUITE = '''import unittest
import math

class TestPerplexityCalculator(unittest.TestCase):
    def test_uniform_distribution(self):
        # Uniform distribution over vocab of 1000: P = 1/1000 = 0.001 -> ln(P) = ln(0.001)
        # Expected Perplexity should be exactly 1000.0
        vocab_size = 1000
        N = 5
        log_probs = [math.log(1.0 / vocab_size)] * N
        pp = compute_perplexity(log_probs, N)
        self.assertAlmostEqual(pp, float(vocab_size), places=3,
                               msg="Uniform distribution perplexity must equal vocabulary size")

    def test_quiz_1_case(self):
        # Course Quiz 1: P = 0.001 for N = 5 words -> PP = (1/0.001)^(1/5) = 10^(3/5) approx 3.98
        total_p = 0.001
        N = 5
        # Total log prob = ln(0.001)
        log_probs = [math.log(total_p) / N] * N
        pp = compute_perplexity(log_probs, N)
        self.assertAlmostEqual(pp, 3.981, places=2,
                               msg="Course Quiz 1 example calculation should yield ~3.98")

if __name__ == "__main__":
    unittest.main()
'''
