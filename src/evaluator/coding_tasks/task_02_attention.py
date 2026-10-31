"""
Assignment 2: Scaled Dot-Product Attention Implementation
Topic: The Transformer Architecture (Chapter 09)
"""

STARTER_CODE = '''import torch
import torch.nn as nn
import math

def scaled_dot_product_attention(q: torch.Tensor, k: torch.Tensor, v: torch.Tensor, mask: torch.Tensor = None):
    """
    Computes Scaled Dot-Product Attention:
        Attention(Q, K, V) = softmax( (Q @ K^T) / sqrt(d_k) ) @ V

    Args:
        q: Query tensor of shape (batch_size, seq_len, d_k)
        k: Key tensor of shape (batch_size, seq_len, d_k)
        v: Value tensor of shape (batch_size, seq_len, d_v)
        mask: Optional mask tensor of shape (batch_size, seq_len, seq_len)
              where 0 indicates positions to mask out with -inf before softmax.

    Returns:
        output: Tensor of shape (batch_size, seq_len, d_v)
        attn_weights: Tensor of shape (batch_size, seq_len, seq_len)
    """
    # TODO: Calculate scores = (q @ k.transpose(-2, -1)) / sqrt(d_k)
    # TODO: Apply mask if provided: scores = scores.masked_fill(mask == 0, -1e9)
    # TODO: Calculate softmax attention weights along dim=-1
    # TODO: Multiply attention weights by value tensor v
    pass
'''

TEST_SUITE = '''import unittest
import torch
import math

class TestScaledDotProductAttention(unittest.TestCase):
    def setUp(self):
        self.batch_size = 2
        self.seq_len = 4
        self.d_k = 16
        self.d_v = 16
        torch.manual_seed(42)
        self.q = torch.randn(self.batch_size, self.seq_len, self.d_k)
        self.k = torch.randn(self.batch_size, self.seq_len, self.d_k)
        self.v = torch.randn(self.batch_size, self.seq_len, self.d_v)

    def test_output_shapes(self):
        output, weights = scaled_dot_product_attention(self.q, self.k, self.v)
        self.assertEqual(output.shape, (self.batch_size, self.seq_len, self.d_v), 
                         f"Expected output shape {(self.batch_size, self.seq_len, self.d_v)}, got {output.shape}")
        self.assertEqual(weights.shape, (self.batch_size, self.seq_len, self.seq_len),
                         f"Expected weights shape {(self.batch_size, self.seq_len, self.seq_len)}, got {weights.shape}")

    def test_softmax_normalization(self):
        _, weights = scaled_dot_product_attention(self.q, self.k, self.v)
        # Sum along the last dimension must equal 1.0 for each position
        row_sums = weights.sum(dim=-1)
        expected_sums = torch.ones_like(row_sums)
        self.assertTrue(torch.allclose(row_sums, expected_sums, atol=1e-5),
                        "Attention weights must sum to 1.0 along the key dimension (dim=-1)")

    def test_masking(self):
        # Create a causal lower triangular mask
        mask = torch.tril(torch.ones(self.batch_size, self.seq_len, self.seq_len))
        output, weights = scaled_dot_product_attention(self.q, self.k, self.v, mask=mask)
        # Position [0, 0, 1] is masked out (upper triangle), so weight must be ~0
        masked_val = weights[0, 0, 1].item()
        self.assertLess(masked_val, 1e-4, 
                        f"Masked position [0, 0, 1] should have ~0 attention weight, got {masked_val}")

if __name__ == "__main__":
    unittest.main()
'''
