# Chapter 09_The Transformer

- **Source File**: `Chapter 09_The Transformer.pdf`
- **Total Pages**: 69

---

## Slide / Page 1

Natural Language Processing
Chapter 9
The Transformer
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

A very approximate timeline
• 1990 Static Word Embeddings
• 2003 Neural Language Model
• 2008 Multi-Task Learning
• 2015 Attention
• 2017 Transformer
• 2018 Contextual Word Embeddings and Pretraining
• 2019 Prompting
2

---

## Slide / Page 3

The Transformer
• It is the standard architecture for building large language
models.
• Transformer-based large language models have completely
changed the field of speech and language processing.
• We will focus for now on left-to-right (sometimes called
causal or autoregressive) language modeling.
• The transformer is a neural network with a specific
structure that includes a mechanism called self-attention or
multi-head attention.
• Attention : a way to build contextual representations of a
token’s meaning by attending to and integrating information
from surrounding tokens, helping the model learn how
tokens relate to each other over large spans.
3

---

## Slide / Page 4

Attention

---

## Slide / Page 5

Landmark paper!
5
Attention : a way to build contextual representations
of a token’s meaning by attending to and integrating
information from surrounding tokens, helping the model
learn how tokens relate to each other over large spans.

---

## Slide / Page 6

Landmark paper…
• Groundbreaking: The introduction of the Transformer was a
breakthrough, as it moved away from earlier approaches like
RNNs and LSTMs, offering superior scalability and performance.
• Pioneering: The Transformer paper pioneered the use of self-
attention and showed how it could replace recurrent structures,
which had been dominant for sequential data tasks.
• Foundational: The Transformer model is the cornerstone of many
of the most powerful language models today, making the paper
foundational to modern NLP research.
• Transformative: It transformed the landscape of NLP and deep
learning, inspiring many subsequent innovations and applications.
• Seminal: "Attention is All You Need" is often considered a
seminal work, meaning it has had a lasting and profound influence
on the field.
6

---

## Slide / Page 7

Instead of starting with the big picture
Stacked
Transformer
Blocks
So long and thanks for
long and thanks forNext token all
…
…
…
U
Input tokens
x1 x2
Language
Modeling
Head
x3 x4 x5
Input
Encoding
E
1+
E
2+
E
3+
E
4+
E
5+
…
… ………
U
U
U
U
…
logits logits logits logits logits
Stacked
Transformer
Blocks
So long and thanks for
long and thanks forNext token all
…
…
…
U
Input tokens
x1 x2
Language
Modeling
Head
x3 x4 x5
Input
Encoding E
1+
E
2+
E
3+
E
4+
E
5+
…
… ………
U U U U
…
logits logits logits logits logits
Let's consider the embeddingsfor an individual word from a particular
layer
7

---

## Slide / Page 8

The Transformer
• A transformer has 3 major components:
 At the center are columns of transformer blocks.
 Each block is a multilayer network
 a multi-head attention layer,
 feedforward network and
 layer normalization
that maps an input vector xi in column i (corresponding
to input token i) to an output vector hi.
 The set of n blocks maps an entire context window of
input vectors (x1, …, xn) to a window of output vectors
(h1, …, hn) of the same length.
 A column might contain from 12 to 96 or more stacked
blocks.
8

---

## Slide / Page 9

The Transformer
• The column of blocks is preceded by the input encoding
component, which processes an input token into a
contextual vector representation, using
 an embedding matrix E and
 a mechanism for encoding token position.
• Each column is followed by a language modeling head,
which
 takes the embedding output by the final transformer
block,
 passes it through an unembedding matrix U and
 a softmax over the vocabulary
to generate a single token for that column.
9

---

## Slide / Page 10

Problem with static embeddings (word2vec)
• They are static!  I.e. the embedding for a word
doesn't reflect how its meaning changes in context.
The chicken didn't cross the road
because it was too tired
• E.g. word chicken: always represented by the
same fixed vector.
• A static vector for the word it might somehow
encode that this is a pronoun used for animals
and inanimate entities.
10

---

## Slide / Page 11

Contextual Embedding
• In context it has a much richer meaning. E.g.:
1.The chicken didn’t cross the road
because it was too tired.
2.The chicken didn’t cross the road
because it was too wide.
11

---

## Slide / Page 12

Contextual Embedding
• In context it has a much richer meaning. E.g.:
1.The chicken didn’t cross the road
because it was too tired.
2.The chicken didn’t cross the road
because it was too wide.
• So if we are to compute the meaning of this
sentence:
 it the meaning of it should be associated with
chicken in the first sentence and
 associated with the road in the second one,
 sensitive to the context.
12

---

## Slide / Page 13

Contextual Embeddings
• Intuition: a representation of meaning of a word should
be different in different contexts!
• Contextual Embedding: each word has a different
vector that expresses different meanings depending on
the surrounding words
• How to compute contextual embeddings?
• Attention
13

---

## Slide / Page 14

Contextual Embeddings
• Given the possible sentences:
1. The chicken didn't cross the road
because it was too tired
2. The chicken didn't cross the road because
it was too wide
• and the input:
The chicken didn't cross the road because it
• At this point we don’t yet know which thing it is going to end up
referring to! chicken or road?
• Other examples:
3. keys to the cabinet are on the table.
(syntactic agreement)
4. I walked along the pond, and noticed one
of the trees along the bank. (word sense
disambiguation)
14

---

## Slide / Page 15

Intuition of Attention
• These examples showcase that the contextual words that help us
compute the meaning of words in context can be quite far away in the
sentence or paragraph.
• Transformers can build contextual representations of word meaning,
contextual embeddings, by integrating the meaning of these helpful
contextual words.
• In a transformer, layer by layer, we build up richer and richer
contextualized representations of the meanings of input tokens.
• At each layer, we compute the representation of a token i by combining
information about i from the previous layer with information about the
neighboring tokens to produce a contextualized representation for each
word at each position.
• Intuition of Attention: Build up the contextual embedding from a
word by selectively integrating information from all the neighboring
words.
• We say that a word "attends to" some neighboring words more than
others. 15

---

## Slide / Page 16

Intuition of attention
•test
16

---

## Slide / Page 17

Attention definition
• A mechanism for helping compute the embedding for
a token by selectively attending to and integrating
information from surrounding tokens (at the previous
layer).
• More formally: a method for doing a weighted sum of
vectors.
17

---

## Slide / Page 18

Attention is left-to-right
attentionattentionSelf-Attention
Layer
attentionattentionattention
a1 a2 a3 a4 a5
x3 x4 x5x1 x2
18

---

## Slide / Page 19

Simplified version of attention
Given a sequence of token embeddings:
x1 x2   x3 x4 x5 x6 x7 xi
Produce: ai a weighted sum of x1 through x7 (and xi)
weighted by their similarity to xi
19
𝛼𝑖𝑗 = 𝑠𝑜𝑓𝑡𝑚𝑎𝑥 𝑠𝑐𝑜𝑟𝑒(𝑥𝑖, 𝑥𝑗) ∀𝑗 ≤ 𝑖
𝑠𝑐𝑜𝑟𝑒(𝑥𝑖, 𝑥𝑗)= 𝑥𝑖. 𝑥𝑗
𝑎𝑖 = ෍
𝑗≤𝑖
𝛼𝑖𝑗𝑥𝑗

---

## Slide / Page 20

An Actual Attention Head: slightly more
complicated
• High-level idea: instead of using vectors (like xi and
x4) directly, we'll represent 3 separate roles each vector
xi plays:
• query: as the current element being compared to the
preceding inputs;
• key: as a preceding input that is being compared to
the current element to determine a similarity;
• value: a value of a preceding element that gets
weighted and summed.
20

---

## Slide / Page 21

Intuition of attention
x1  x2  x3   x4  x5  x6  x7   xi
query
values kv kv kv kv kv kv kv
keys
kv
21

---

## Slide / Page 22

Attention Head: slightly more complicated
• We'll use matrices to project each vector xi into a
representation of its role as query, key, or value :
query: WQ
key: WK
value: WV
22

---

## Slide / Page 23

Attention Head: slightly more complicated
• Given these 3 representation of xi
• To compute  the similarity of current element xi with
some prior element xj, we’ll use dot product between
qi and kj.
• And instead of summing up xj ,  we'll sum up vj
23

---

## Slide / Page 24

Final equations for one attention head
24

---

## Slide / Page 25

Calculating the value of a3
25

---

## Slide / Page 26

Learning the weight matrices WQ, WK, WV
• WQ, WK, and WV are learned during the training process via
backpropagation, just like any other learnable parameter in a
neural network.
• Preliminary key points:
 Transformers (and their attention mechanisms) are trained using
supervised learning
 A loss function (such as cross-entropy loss) is optimised by
adjusting the parameters of the network (including WQ, WK, and
WV).
 The goal of the attention mechanism is to compute a weighted sum
of the values, where the weights are determined by the attention
scores (computed from the queries and keys).
 Backpropagation is used to adjust the weights of WQ, WK, and
WV, based on the gradients computed from the loss function.
26

---

## Slide / Page 27

Learning the weight matrices WQ, WK, WV
1. The Setup:
 At each position in a sequence, we have an embedding vector
for each token (e.g., ei for token i).
 The attention mechanism transforms these embeddings into
Query, Key, and Value vectors for each token, using the
weight matrices WQ, WK, and WV.
2. How the Attention Mechanism Works: The input embeddings
for a sequence (say, e1,e2,...,en​) are transformed into Query,
Key, and Value vectors as follows:
 Query (Q):    Qi=WQ⋅ei
where Qi ​ is the query vector for token i, and WQ is a learnable
weight matrix that transforms the embedding ei ​ into the Query
vector.
27

---

## Slide / Page 28

Learning the weight matrices WQ, WK, WV
 Key (K):       Ki=WK⋅ei
where Ki ​ is the key vector for token i, and WK is a learnable
weight matrix that transforms the embedding ei into the Key
vector.
 Value (V):    Vi=WV⋅ei
where Vi  ​ is the value vector for token i, and WV is a
learnable weight matrix that transforms the embedding ei into
the Value vector.
28

---

## Slide / Page 29

Learning the weight matrices WQ, WK, WV
3. Attention Calculation:   For each Query Qi ​, we compute the
attention scores by measuring the similarity between Qi and the
Keys of all tokens (including its own).
 This is usually done using the dot product (often scaled by the square root
of the dimension of the key vectors):
𝑨𝐭𝐭𝐞𝐧𝐭𝐢𝐨𝐧 𝐒𝐜𝐨𝐫𝐞 𝐢, 𝐣 =
𝑸𝒊 ⋅ 𝑲𝒋
𝒅𝒌
where dk​ is the dimension of the Key vector.
• These scores are then passed through a softmax function giving:
𝑨𝐭𝐭𝐞𝐧𝐭𝐢𝐨𝐧 𝐖𝐞𝐢𝐠𝐡𝐭𝐬 𝐢, 𝐣 = 𝒔𝒐𝒇𝒕𝒎𝒂𝒙(
𝑸𝒊 ⋅ 𝑲𝒋
𝒅𝒌
)
• Finally, the Value vectors are weighted by these attention scores
to compute the output for the Query Qi​:
𝑨𝐭𝐭𝐞𝐧𝐭𝐢𝐨𝐧 𝐖𝐞𝐢𝐠𝐡𝐭𝐬 𝐢 = ෍
𝒋
𝑨𝐭𝐭𝐞𝐧𝐭𝐢𝐨𝐧 𝐖𝐞𝐢𝐠𝐡𝐭𝐬 𝐢, 𝐣 ⋅ 𝑽𝒋
29

---

## Slide / Page 30

4. Training and Backpropagation:
 The goal during training is to minimize a loss function (such as cross-entropy
loss in the case of language modeling or classification).
 Backpropagation is used to compute the gradients of the loss with respect to
the model parameters (including WQ, WK, and WV).
 Gradients: The gradients indicate how to adjust WQ, WK, and WV to reduce
the loss.
• For example, consider the loss with respect to the Query weight matrix
WQ: 𝛛𝐋𝛛𝑾𝑸
• This gradient tells the model how to adjust WQ based on the error between
the predicted output and the target.
 The gradients are then used to update the weights using an optimization
algorithm (typically stochastic gradient descent or one of its variants, such
as Adam). The updates are as : 𝑊𝑄 = 𝑊𝑄 − 𝜂 𝛛𝐋𝛛𝑾𝑸 (η: learning rate)
• The same process happens for WK and WV, with their respective gradients
being computed and used to update them. 30

---

## Slide / Page 31

Actual Attention: slightly more complicated
• Instead of one attention head, we'll have lots of them (h of them)!
• Intuition: each head might be attending to the context for different
purposes
• Different linguistic relationships or patterns in the context
32

---

## Slide / Page 32

Why multi-head attention?
Different purposes: Each attention head might learn to attend
to different types of contextual relationships or dependencies
between tokens. E.g.:
• One attention head might focus on local dependencies,
paying attention to nearby words or tokens.
• Another head might focus on long-range dependencies,
capturing relationships between tokens that are far apart in
the sequence.
• A third head could focus on syntax or semantics, attending
to grammatical or meaning-related patterns in the text.
• Another head might capture word alignment across
different phrases or languages in tasks like translation.
33

---

## Slide / Page 33

Multi-head attention
34

---

## Slide / Page 34

The Transformer Block

---

## Slide / Page 35

Stacked
Transformer
Blocks
So long and thanks for
long and thanks forNext token all
…
…
…
U
Input tokens
x1 x2
Language
Modeling
Head
x3 x4 x5
Input
Encoding
E
1+
E
2+
E
3+
E
4+
E
5+
…
… ………
U
U
U
U
…
logits logits logits logits logits
Reminder: transformer language model
36

---

## Slide / Page 36

Inside the transformer Block
• The self-attention calculation lies at the core of
the transformer block
• Recall that the transformer block includes:
 the self-attention layer,
 a feedforward layer,
 residual connections (not mentioned earlier), and
 normalizing layers (“layer norm”).
37

---

## Slide / Page 37

The residual stream
38
• Here, the processing of an individual token i through the
transformer block is considered as a single stream of d-
dimensional representations for token position i.
• This residual stream starts with the original input vector, and the
various components read their input from the residual stream and
add their output back into the stream.

---

## Slide / Page 38

The residual stream
• The initial vector for token i is passed through a layer
norm and attention layer, and
• The result is added back into the stream, in this case
to the original input vector xi.
• This summed vector is again passed through another
layer norm and a feedforward layer,
• The output of those is added back into the residual,
• This result, referred to as hi, is the output of the
transformer block for token i.
• In earlier descriptions the residual stream was often
described as residual connections.
39

---

## Slide / Page 39

Feedforward Layer
40
• An FFN layer is needed for nonlinearities
• A fully-connected 2-layer network
(1hidden layer).
• Weights: the same for each token position
i, but different from layer to layer.
• Dimensionality dff of the hidden layer of
the FFN commonly made larger than the
model dimensionality d.
• (For example, in the original transformer
model, d = 512 and dff = 2048.)

---

## Slide / Page 40

Layer Norm
• Vector xi is normalized twice in the transformer block.
• Layer norm applies a normalization operation to a single
vector in a hidden layer.
• The normalised vector ො𝑥 has a mean of 0 and standard
deviation of 1.
41Where γ and β are 2 learnable parameter vectors

---

## Slide / Page 41

Putting together a single transformer block
42
• Function computed by a transformer block: broken down with one
equation for each component computation, using t (of shape [1 x d])
to stand for transformer.

---

## Slide / Page 42

A transformer as a stack of blocks
Block 1
Block 2
43
• A Transformer is a stack of these blocks;
• All the vectors are of the same dimensionality d.

---

## Slide / Page 43

Residual Streams & Attention
• Notice that all  parts of the transformer block apply to 1
residual stream (1 token),
• Except attention, which takes information from other
tokens.
• Elhage et al. (2021) show that we can view attention
heads as literally moving information from the residual
stream of a neighboring token into the current stream.
44

---

## Slide / Page 44

Parallelizing Attention Computation

---

## Slide / Page 45

Parrallelizing the Computation
• Recall that the attention computation
performed for each token to compute ai is
independent of the computation for each other
token.
• This is also true for all the computation in the
transformer block, computing hi from the input
xi.
• As such we can easily parallelize the entire
computation, taking advantage of efficient
matrix multiplication routines.
46

---

## Slide / Page 46

Parallelizing computation for a single head
• Indeed, for attention/transformer block we've been
computing a single output at a single time step i in a
single residual stream.
• But, for a single head, we can pack the  N tokens of the
input sequence into a single matrix X of size [N × d].
• Each row of X is the embedding of one token of the
input.
• X can have 1K-32K rows, each of the dimensionality
of the embedding d (the model dimension)
47

---

## Slide / Page 47

QKT
• Now we can do a single matrix multiply to
combine Q and KT . (Result of shape [N x N]
48

---

## Slide / Page 48

Parallelizing attention
• Scale the  scores, take the softmax, and then
multiply the result by V resulting in a matrix of
shape N × d
• An attention vector for each input token
49
• The entire self-attention step for an entire sequence
of N tokens for one head has been reduced to the
above computation.

---

## Slide / Page 49

Masking out the future
• What is this mask function?
• QKT has a score for each query dot every key,
including those that follow the query.
• Guessing the next word is pretty simple if you
already know it!
50

---

## Slide / Page 50

Masking out the future
• Add –∞ to cells in the
upper triangle
• The softmax will turn it to 0
51

---

## Slide / Page 51

Attention is quadratic
52
• Attention is quadratic in the
length of the input.
expensive to compute attention
over very long documents (like
entire novels).
• Nonetheless modern LLMs
manage to use quite long contexts
of thousands or tens of thousands
of tokens.

---

## Slide / Page 52

Schematic of the attention computation
for a single attention head in parallel
53

---

## Slide / Page 53

Parallelizing Multi-head Attention
54
• Thus for each head i
• And for all the heads:

---

## Slide / Page 54

Parallelizing Multi-head Attention
55
• The output of each of the h heads is of shape N x dv
 output of the multi-head layer with h heads consists
of h matrices of shape N x dv.
• To make use of these matrices in further processing,
they are concatenated to produce a single output with
dimensionality N x hdv.
• Finally, another linear projection 𝑊𝑜 ∈ 𝑅ℎ𝑑𝑣 x 𝑑 is
used, that reshapes it to the original output dimension
for each token.
• Multiplying the concatenated N x h dv matrix output
by 𝑊𝑜 ∈ 𝑅ℎ𝑑𝑣 x 𝑑 yields the self-attention output A of
shape [N d].

---

## Slide / Page 55

Parallelizing Multi-head Attention
• i.e.
56
• The notation FFN(T3) means that the same FFN is applied in
parallel to each of the N embedding vectors in the window.

---

## Slide / Page 56

Input and output: Position embeddings
and the Language Model Head

---

## Slide / Page 57

Token and Position Embeddings
• Given N input tokens, the input matrix X (of
shape [N × d]) has an embedding for each word
in the context.
• This embedding is created by adding two
distinct embeddings for each input
• token embedding
• positional embedding
58

---

## Slide / Page 58

Token Embeddings
• Embedding matrix E has shape [|V | × d ].
• One row for each of the |V | tokens in the vocabulary.
• Each word is a row vector of d dimensions
• Given:  string "Thanks for all the"
 1. Tokenize (e.g. with BPE) and convert into vocab indices
w = [5,4000,10532,2224]
 2. Select the corresponding rows from E, each row an
embedding
(row 5, row 4000, row 10532, row 2224).
 Alternatively, use 1-hot encoding, multiplying E by the 1-
hot vectors.
59

---

## Slide / Page 59

Position Embeddings
• There are many methods, but we'll just describe the
simplest: absolute position.
• Goal: learn a position embedding matrix Epos of shape
[1 × N ].
• Start with randomly initialized embeddings, one for each
integer up to some maximum length.
(i.e., just as we have an embedding for token fish, we’ll have
an embedding for position 3 and position 17).
• As with word embeddings, these position embeddings are
learned along with other parameters during training.
60
• To produce an input embedding that captures positional
information, add the word embedding for each input to its
corresponding positional embedding.

---

## Slide / Page 60

Composite embeddings
X = Composite
Embeddings
(word + position)
Transformer Block
Janet
1
will
2
back
3
Janet will back the bill
the
4
bill
5
+
+
+
+
+
Position
Embeddings
Word
Embeddings
61

---

## Slide / Page 61

Alternatives to Position Embeddings
• Potential problem with the simple absolute position embedding
approach:
 there will be plenty of training examples for the initial positions in
our inputs and
 correspondingly fewer at the outer length limits.
  These latter embeddings may be poorly trained and may not
generalize well during testing.
• Alternative approach to absolute positional embeddings:
 Choose a static function that maps integer inputs to real-valued
vectors in a way that captures the inherent relationships among the
positions.
 That is, it captures the fact that position 4 in an input is more closely
related to position 5 than it is to position 17.
 A combination of sine and cosine functions with differing
frequencies was used in the original transformer work.
• Even more complex positional embedding methods exist, such as ones
that represent relative position instead of absolute position. 62

---

## Slide / Page 62

Language modeling head
Layer L
Transformer
Block
Softmax over vocabulary V
Unembedding layer
…
1 x |V|
Logits
Word probabilities
1 x |V|
hL1
w1 w2 wN
hL2 hLN
d x |V|
1 x d
Unembedding
layer = ET
y1 y2 y|V|…
u1 u2 u|V|…
Language Model Head
takes hLN and outputs a
distribution over vocabulary V
63
• Last component of the transformer: Given a context of words,
they assign a probability to each possible next word.
• For transformer language models, the context is the size of the
transformer’s context window, which can be quite large: 2K,
4K, even 32K tokens for very large models.

---

## Slide / Page 63

Language modeling head
Layer L
Transformer
Block
Softmax over vocabulary V
Unembedding layer
…
1 x |V|
Logits
Word probabilities
1 x |V|
hL1
w1 w2 wN
hL2 hLN
d x |V|
1 x d
Unembedding
layer = ET
y1 y2 y|V|…
u1 u2 u|V|…
Language Model Head
takes hLN and outputs a
distribution over vocabulary V
• Job of language modeling head: take output of the final transformer
layer from the last token N and use it to predict the upcoming word
at position N+1.
• Unembedding layer:  linear layer projects from hLN (shape
[1 × d])  to logit vector (score vector).
• Unembedding layer: Tied to ET
• Weight tying, we use the same
weights for two different
matrices
• Unembedding layer maps from
an embedding (shape [1 × d]) to a
1x|V| vector over the vocabulary
64
• In the learning process, E will be optimized to be
good at doing both of these mappings.

---

## Slide / Page 64

Language modeling head
Layer L
Transformer
Block
Softmax over vocabulary V
Unembedding layer
…
1 x |V|
Logits
Word probabilities
1 x |V|
hL1
w1 w2 wN
hL2 hLN
d x |V|
1 x d
Unembedding
layer = ET
y1 y2 y|V|…
u1 u2 u|V|…
Language Model Head
takes hLN and outputs a
distribution over vocabulary V
Logits, the score vector u
One score for each of the |V |
possible words in the vocabulary
V . (Shape 1 × |V |.)
Softmax turns the logits into
probabilities over vocabulary.
Shape 1 × |V |.
16 CHA PTER 9 • THE TRANSFORMER
languagemodelsof Chapter3 computethe probabilityof a word given countsof
its occurrencewith the n − 1 prior words. The context is thusof size n − 1. For
transformerlanguagemodels,the context is the sizeof thetransformer’s context
window, whichcanbequitelarge:2K, 4K, even32K tokensfor verylargemodels.
Thejob of thelanguagemodelingheadis to take the outputof theﬁnal trans-
formerlayerfrom thelasttokenN anduseit to predict theupcomingword at posi-
tion N+ 1. Fig.9.14showshow to accomplishthistask,takingtheoutputof thelast
token at the last layer(the d-dimensionaloutputembeddingof shape[1 ⇥d]) and
producinga probabilitydistribution over words(from whichwe will chooseoneto
generate).
Layer L
Transformer
Block
Softmax over vocabulary V
Unembedding layer
…
1 x |V|
Logits
Word probabilities
1 x |V|
hL1
w1 w2 wN
hL2 hLN
d x |V|
1 x d
Unembedding layer
U = ET
y1 y2 y|V|…
u1 u2 u|V|…
Language Model Head
takes hLN and outputs a
distribution over vocabulary V
Figure9.14 Thelanguagemodelinghead:thecircuit at thetop of a transformerthatmapsfrom theoutput
embeddingfor token N from the last transformerlayer (hLN) to a probability distribution over wordsin the
vocabularyV.
Theﬁrst modulein Fig. 9.14is a linearlayer, whosejob is to projectfrom the
outputhLN, whichrepresentstheoutputtokenembeddingatpositionN from theﬁnal
block L, (henceof shape[1⇥d]) to thelogit vector, or scorevector, thatwill havealogit
singlescorefor eachof the|V| possiblewordsin thevocabularyV. Thelogit vector
u is thusof dimensionality1⇥|V|.
This linearlayercanbelearned,but morecommonlywe tie this matrix to (the
transposeof) the embeddingmatrix E. Recallthat in weight tying, we usetheweight tying
sameweightsfor two differentmatricesin themodel.Thusattheinputstageof the
transformertheembeddingmatrix (of shape[|V| ⇥d]) is usedto mapfrom aone-hot
vectorover thevocabulary (of shape[1⇥|V|]) to anembedding(of shape[1⇥d]).
Andthenin thelanguagemodelhead,ET, thetransposeof theembeddingmatrix(of
shape[d ⇥|V|]) is usedto mapbackfrom anembedding(shape[1⇥d]) to a vector
overthevocabulary(shape[1⇥|V|]). In thelearningprocess,E will beoptimizedto
begoodatdoingbothof thesemappings.Wethereforesometimescall thetranspose
ET theunembeddinglayerbecauseit is performingthisreversemapping.unembedding
A softmaxlayerturnsthelogitsu into theprobabilitiesy overthevocabulary.
u = hLN ET (9.44)
y = softmax(u) (9.45)
We canusetheseprobabilitiesto do thingslike help assigna probabilityto a
giventext. But themostimportantusageto generatetext, whichwedoby sampling
65

---

## Slide / Page 65

The final transformer model
wi
Sample token to
generate at position i+1
feedforward
layer norm
attention
layer norm
U
Input token
Language
Modeling
Head
Input
Encoding
E
i+
…
logits
feedforward
layer norm
attention
layer norm
Layer 1
Layer 2
h1i  =  x2i
x1i
h2i  =  x3i
feedforward
layer norm
attention
layer norm
hLi
hL-1i  =  xLi
y1 y2 y|V|…Token probabilities
u1 u2 u|V|…
softmax
wi+1
Layer L
66

---

## Slide / Page 66

The final transformer model
wi
Sample token to
generate at position i+1
feedforward
layer norm
attention
layer norm
U
Input token
Language
Modeling
Head
Input
Encoding E
i+
…
logits
feedforward
layer norm
attention
layer norm
Layer 1
Layer 2
h1i  =  x2i
x1i
h2i  =  x3i
feedforward
layer norm
attention
layer norm
hLi
hL-1i  =  xLi
y1 y2 y|V|…Token probabilities
u1 u2 u|V|…
softmax
wi+1
Layer L
67

---

## Slide / Page 67

Learning of the Multiple Heads
• After all heads compute their attention results,
these are concatenated and passed through a
linear transformation to produce the final
output.
• The concatenation of the different outputs from
all the heads allows the model to use the diverse
features that each head has learned.
•  even if each head individually doesn't
produce the same result, the final output
benefits from the combination of the distinct
insights provided by each head. 68

---

## Slide / Page 68

Missed point
• How is dk determined?
• In the context of the scaled dot-product attention used in
Transformers, dk is a hyperparameter chosen before
training and is typically fixed.
• Usually chosen to be a smaller value than d, the input
embedding dimension.
 For example, if the embedding size d is 512, a common
choice for dk might be 64 or 128.
• The value of dk controls how much attention each token
can "focus on" relative to other tokens in the sequence.
• dk also affects the complexity of the attention mechanism,
as larger values of dk result in larger matrices and more
computation during attention.
69

---

## Slide / Page 69

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
70
The draft version of the 3rd edition
will be used; it has been updated to
include more recent topics such as
Vector Semantics and Embeddings,
ANNs and Deep Learning for NLP,
Transformers, etc.
This course slides are largely
based on this textbook and its
authors’ slides with light
customisations whenever seen fit.

---

