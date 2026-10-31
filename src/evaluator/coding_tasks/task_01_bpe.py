"""
Assignment 1: Byte-Pair Encoding (BPE) Tokenizer
Topic: Tokenization and Text Normalization (Chapter 02)
"""

STARTER_CODE = '''def learn_bpe_merges(corpus: list[str], num_merges: int) -> list[tuple[str, str]]:
    """
    Learns BPE merge rules from a corpus of words.
    Each word in the corpus should end with the end-of-word symbol '</w>'.
    
    Args:
        corpus: List of space-separated subword character strings (e.g. ['l o w </w>', 'l o w e s t </w>'])
        num_merges: Number of merge operations to perform
        
    Returns:
        List of merge pairs as tuples: [('e', 's'), ('es', 't'), ...]
    """
    merges = []
    # TODO: Implement frequency counting of adjacent pairs and iteratively merge the most frequent pair
    
    return merges

def apply_bpe_tokenize(word: str, merges: list[tuple[str, str]]) -> list[str]:
    """
    Applies learned BPE merge rules to tokenize a single word.
    
    Args:
        word: A single word string (e.g. 'lowest')
        merges: The ordered list of merge rules from learn_bpe_merges
        
    Returns:
        List of resulting subword tokens
    """
    # TODO: Initialize with characters + '</w>', then iteratively merge matching adjacent pairs
    return list(word) + ['</w>']
'''

TEST_SUITE = '''import unittest
from collections import Counter

class TestBPETokenizer(unittest.TestCase):
    def test_learn_merges_basic(self):
        corpus = [
            "n e w e s t </w>",
            "l o w e s t </w>",
            "n e w e s t </w>",
            "e s t i m a t e </w>",
            "y e s </w>"
        ]
        # Most frequent pair is ('e', 's') (freq 5), followed by ('es', 't') (freq 4)
        merges = learn_bpe_merges(corpus, num_merges=2)
        self.assertIsInstance(merges, list, "Must return a list of merge tuples")
        self.assertEqual(len(merges), 2, "Must perform exactly num_merges merges")
        self.assertEqual(merges[0], ('e', 's'), "First merge must be ('e', 's')")
        self.assertEqual(merges[1], ('es', 't'), "Second merge must be ('es', 't')")

    def test_apply_tokenize(self):
        merges = [('e', 's'), ('es', 't')]
        tokens = apply_bpe_tokenize("newest", merges)
        self.assertIn("est", tokens, "Tokens should contain the merged subword 'est'")
        self.assertEqual(tokens[-1], "</w>", "Final token should end with '</w>'")

if __name__ == "__main__":
    unittest.main()
'''
