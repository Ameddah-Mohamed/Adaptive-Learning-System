# NLP  final exam -ex on CKY Algorithm - 22Jan2024

- **Source File**: `NLP  final exam -ex on CKY Algorithm - 22Jan2024.pdf`
- **Total Pages**: 2

---

## Slide / Page 1

Page 1 of 2
The National Higher School of Artificial Intelligence
Natural Language Processing
Final Exam   22/1/2025
Duration: 2 hours
Exercise:      ?? points
Consider the following Context-Free Grammar of a minute subset of French:
S -> NP VP  | S PP
NP -> Det N | Det N PP | N
VP -> V NP | V NP PP | V PP
PP -> P NP
Det -> "le" | "la" | "un" | "une"
N -> "chat" | "chien" | "fille" | "garçon" | "maison" | "parc"
V -> "voit" | "aime" | "regarde"
P -> "dans" | "avec"
1. Convert the Grammar into Chomsky Normal Form (CNF) explaining the different steps and what they
produce. Respect all the conventions.
Eliminate Null Productions:
There are no null productions in this grammar.
Convert Unit Productions:
There is only one unit production; it is NP -> N and it will be replaced as follows:
NP -> "chat",
NP -> "chien", etc.
Convert rules whose right -hand side consists of  more than 2  Symbols:
We need to introduce new non-terminal symbols for each of the following rules:
NP -> Det N PP
VP -> V NP PP
The conversion of these rules produces:
NP -> X1 PP
X1 -> Det N
VP -> X2 PP
X2 -> V NP
The CNF version of the grammar is now:
S -> NP VP
S -> S PP
NP -> Det N
NP -> X1 PP
X1 -> Det N
VP -> V NP
VP -> V PP
VP -> X2 PP
X2 -> V NP

---

## Slide / Page 2

Page 2 of 2
PP -> P NP
NP -> "chat" | "chien" | "fille" | "garçon" | "maison" | "parc"
N -> "chat" | "chien" | "fille" | "garçon" | "maison" | "parc"
V -> "voit" | "aime" | "regarde"
P -> "dans" | "avec"
Det -> "le" | "la" | "un" | "une"
2. In the below table:
a. Give the complete result of the CKY analysis of the sentence  "le chat voit un chien
dans le parc". Use the same conventions that we have seen in the lectures and, in case
there are different parse trees for the whole sentence, use as many versions of S at cell [0,n] as
needed (i.e. S1, S2, S3, etc.).
b. Using different colours for each parse tree (NOT using any colour red, pink, or close to them),
indicate the parse tree starting from the S symbol at position [0,8]. Do not colour the same arc
with different colours.
Le chat voit un chien dans le park
Det NP, X1 - - S - - S1, S2
N, NP - - - - - S
V - X2, VP - - VP, X2
Det NP, X1 - - NP
N, NP - - -
P - PP
Det NP, X1
N, NP
3. Let n be the number of words in a sentence. What are the following complexities of the CKY algorithm,
giving a brief explanation for each:
a. Worst-case time complexity.
The time complexity of the CKY algorithm is O(n³), where n is the number of words
in the sentence.
To fill in the table any cell for a span of length k, we look at all possible ways of
combining pairs of smaller spans  (sub-spans) and there are n – k + 1  ways for this .
Since there are n2 cells, the worst-case time complexity of the CKY algorithm is O(n³).
b. Space complexity.
Since there are n2  cells in the table for a sentence of n words, even with a maximum of
2 pointers that get added to any produced non -terminal in the table cells, the space
complexity of the CKY algorithm is O(n2).
However, for an ambiguous grammar , the space complexity can grow  significantly.
Each span in the CKY table can contain multiple non-terminal symbols, and the number
of entries can grow exponentially with the number of derivations.

---

