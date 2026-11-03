# SLP3 Chapter 09: Transformers and Pretraining (Self-Attention)

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 184–215

---

### Page 184

176CHAPTER6 • NEURALNETWORKS
Historical Notes
The origins of neural networks lie in the 1940sMcCulloch-Pitts neuron(McCul-
loch and Pitts, 1943), a simplified model of the biological neuron as a kind of com-
puting element that could be described in terms of propositional logic. By the late
1950s and early 1960s, a number of labs (including Frank Rosenblatt at Cornell and
Bernard Widrow at Stanford) developed research into neural networks; this phase
saw the development of the perceptron (Rosenblatt, 1958), and the transformation
of the threshold into a bias, a notation we still use (Widrow and Hoff, 1960).
The field of neural networks declined after it was shown that a single perceptron
unit was unable to model functions as simple as XOR (Minsky and Papert, 1969).
While some small amount of work continued during the next two decades, a major
revival for the field didn’t come until the 1980s, when practical tools for building
deeper networks like error backpropagation became widespread (Rumelhart et al.,
1986). During the 1980s a wide variety of neural network and related architec-
tures were developed, particularly for applications in psychology and cognitive sci-
ence (Rumelhart and McClelland 1986b, McClelland and Elman 1986, Rumelhart
and McClelland 1986a, Elman 1990), for which the termconnectionistorparal-connectionist
lel distributed processingwas often used (Feldman and Ballard 1982, Smolensky
1988). Many of the principles and techniques developed in this period are foun-
dational to modern work, including the ideas of distributed representations (Hinton,
1986), recurrent networks (Elman, 1990), and the use of tensors for compositionality
(Smolensky, 1990).
By the 1990s larger neural networks began to be applied to many practical lan-
guage processing tasks as well, like handwriting recognition (LeCun et al. 1989) and
speech recognition (Morgan and Bourlard 1990). By the early 2000s, improvements
in computer hardware and advances in optimization and training techniques made it
possible to train even larger and deeper networks, leading to the modern termdeep
learning(Hinton et al. 2006, Bengio et al. 2007). We cover more related history in
Chapter 14 and Chapter 16.
There are a number of excellent books on neural networks, including Goodfellow
et al. (2016) and Nielsen (2015).

---

### Page 185

CHAPTER
7
Transformers and Pretraining
“The true art of memory is the art of attention ”
Samuel Johnson,Idler #74, September 1759
In this chapter we introduce thetransformer, the standard architecture for build-
ing large language models, and how to pretrain them and how to use them to generate
text. We’ll introduce transformers for left-to-right (sometimes calledcausalor au-
toregressive or decoder) language modeling, in which we are given a sequence of
input tokens and predict output tokens one by one by conditioning on the prior con-
text; we’ll introduce other architectures like the encoder architecture in Chapter 9.
Layer Norm
+
Layer Norm
MultiHead
Attention
Feedforward
Softmax
Positional
Unembedding
Embedding
+
residual
stream
L times
output probabilities (over tokens)
+
input token
Layer Norm
+
Layer Norm
MultiHead
Attention
Feedforward
residual
stream +
Figure 7.1A transformer decoder for language modeling, showing theresidual streamfor
processing an input token. A single token is embedded and passed forward in the network,
with the feedforward and attention components adding information. The multihead attention
layer takes inputs (not shown in detail) from the neighboring token streams. This is thus one
column of an autoregressive transformer language model, taking an input token and outputting
a distribution over next tokens.
Fig. 7.1 sketches the transformer architecture following a single token as it
passes up through the layers of the network. Each token is first converted to an
embedding from theembedding matrixE. Recall from Chapter 6 in Section 6.5
thatEis a linear layer that maps a token id to a vectorembeddingrepresenting that
token. Each token in the vocabulary has an initial embedding representation inE.
Transformers also have a special mechanism for encoding the position/index of the
token in the input string, which is simply added to the embedding. The resulting

---

### Page 186

178CHAPTER7 • TRANSFORMERS ANDPRETRAINING
embedding represents both the word and its position, and is then passed through a
set ofLtransformer blocks.
It’s common to think of each of these transformer blocks as part of astreamin
which the input embedding is directly passed up to the output, while simultaneously
being enriched by the application of various processing modules: themulti-head
attentionlayer, feedforward networks and the layer normalization. The value of the
stream at any layer for any input token is a vector that is the sum of the original
embedding for that token and all the outputs from all the previous layers and blocks.
The core intuition of the transformer, and the component that distinguishes it
from the feedforward layers we saw in Chapter 6, is this multi-head attention layer,
also called aself-attentionlayer. Attention can be thought of as a way to build
contextual representations of a token’s meaning byattending toand integrating
information from surrounding tokens, helping the model learn how tokens relate to
each other over large spans. It can also be thought of as a way to move information
from one residual stream to another, augmenting the stream at one token position
with information from another token position.
After theLtransformer blocks we take the output embedding that is produced
by the final transformer block, pass it through a linearunembedding matrixU
and then a softmax over the vocabulary to generate a distribution over possible next
tokens. These last two components (the unembedding matrix and the softmax) are
sometimes called thelanguage modeling head. In the rest of this chapter we’ll
introduce attention and the rest of these modules in more detail.
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
Figure 7.2The architecture of a (left-to-right) transformer, showing how each input token
gets encoded, passed through a set of stacked transformer blocks, and then a language model
head that predicts the next token. The embeddings at each token position in the residual
stream are passed up the stack, and the arrows in the figure shows how information from the
hidden representations of preceding tokens are also incorporated.
Fig. 7.2 shows the transformer architecture applied to a context window with the
wordsSo long and thanks for, showing at each token position what is the most
likely token to be generated. In this full figure, the stack ofLblocks overntokens
maps an entirecontext windowof input vectors(x 1, ...,xn)to a window of output
vectors(h 1, ...,hn)of the same length. A column might contain fromL=12 to
L=96 or more stacked blocks. The arrows in the figure show how information from
the hidden representations of preceding tokens is incorporated into the transformer

---

### Page 187

7.1 • ATTENTION179
block.
Transformer-based language models are complex, and so the details will unfold
over this chapter and the next few chapters, in addition to the high-level overview
in Chapter 1. This chapter will introduce multi-head attention, the rest of the trans-
former block, the input encoding and language modeling head components of the
transformer, the concepts of decoding and sampling to generate output text, and the
details of pretraining. Chapter 8 introduces post-training:fine-tuningandinstruction-
tuninglanguage models to perform NLP tasks, andaligningthe model with human
preferences. Chapter 9 introducesmasked language modelingand theBERTfam-
ily of bidirectional transformer encoder models. Chapter 13 will introduce machine
translation with theencoder-decoderarchitecture. And we’ll see application of the
transformer to speech recognition, as well as further use of the encoder-decoder ar-
chitecture, in Chapter 16.
7.1 Attention
Recall from Chapter 5 that forword2vecand other static embeddings, the repre-
sentation of a word’s meaning is always the same vector irrespective of the context:
the wordchicken, for example, is always represented by the same fixed vector. So
a static vector for the worditmight somehow encode that this is a pronoun used
for animals and inanimate entities. But in contextithas a much richer meaning.
Consideritin one of these two sentences:
(7.1) Thechickendidn’t cross the road becauseitwas too tired.
(7.2) The chicken didn’t cross theroadbecauseitwas too wide.
In (7.1)itis the chicken (i.e., the reader knows that the chicken was tired), while
in (7.2)itis the road (and the reader knows that the road was wide). 1 That is, if
we are to compute the meaning of this sentence, we’ll need the meaning ofitto be
associated withthe chickenin the first sentence and associated withthe roadin
the second one, sensitive to the context.
Furthermore, consider reading left to right like a causal language model, pro-
cessing the sentence up to the wordit:
(7.3) Thechickendidn’t cross theroadbecauseit
At this point we don’t yet know which thingitis going to end up referring to! So a
representation ofitat this point might have aspects of bothchickenandroadas
the reader is trying to guess what happens next.
This fact that words have rich linguistic relationships with other words that may
be far away pervades language. Consider two more examples:
(7.4) Thekeysto the cabinetareon the table.
(7.5) I walked along thepond, and noticed one of the trees along thebank.
In (7.4), the phraseThe keysis the subject of the sentence, and in English and many
languages, must agree in grammatical number with the verbare; in this case both are
plural. In English we can’t use a singular verb likeiswith a plural subject likekeys
(we’ll discuss agreement more in Chapter 19). In (7.5), we know thatbankrefers
1 We say that in the first exampleitcoreferswith the chicken, and in the seconditcorefers with the
road; we’ll return to this in Chapter 24.

---

### Page 188

180CHAPTER7 • TRANSFORMERS ANDPRETRAINING
to the side of a pond or river and not a financial institution because of the context,
including words likepond. (We’ll discuss word senses more in Chapter 9.)
The point of all these examples is that these contextual words that help us com-
pute the meaning of words in context can be quite far away in the sentence or para-
graph. Transformers can build contextual representations of word meaning,contex-
tual embeddings, by integrating the meaning of these helpful contextual words. In acontextualembeddings
transformer, layer by layer, we build up richer and richer contextualized representa-
tions of the meanings of input tokens. At each layer, we compute the representation
of a tokeniby combining information aboutifrom the previous layer with infor-
mation about the neighboring tokens to produce a contextualized representation for
each word at each position.
Attentionis the mechanism in the transformer that weighs and combines the
representations from appropriate other tokens in the context from layerkto build
the representation for tokens in layerk+1.
The
chicken
didn’t
cross
the
road
because
it
was
too
tired
The
chicken
didn’t
cross
the
road
because
it
was
too
tired
Layer k+1
Layer k
self-attention distribution
columns corresponding to input tokens
Figure 7.3The self-attention weight distributionαthat is part of the computation of the
representation for the worditat layerk+1. In computing the representation forit, we attend
differently to the various words at layerk, with darker shades indicating higher self-attention
values. Note that the transformer is attending highly to the columns corresponding to the
tokenschickenandroad, a sensible result, since at the point whereitoccurs, it could plausibly
corefer with the chicken or the road, and hence we’d like the representation foritto draw on
the representation for these earlier words. Figure adapted from Uszkoreit (2017).
Fig. 7.3 shows a schematic example simplified from a transformer (Uszkoreit,
2017). The figure describes the situation when the current token isitand we need
to compute a contextual representation for this token at layerk+1 of the transformer,
drawing on the representations (from layerk) of every prior token. The figure uses
color to represent the attention distribution over the contextual words: the tokens
chickenandroadboth have a high attention weight, meaning that as we are com-
puting the representation forit, we will draw most heavily on the representation for
chickenandroad. This will be useful in building the final representation forit,
sinceitwill end up coreferring with eitherchickenorroad.
Let’s now turn to how this attention distribution is represented and computed.
7.1.1 Attention more formally
As we’ve said, the attention computation is a way to compute a vector representation
for a token at a particular layer of a transformer, by selectively attending to and
integrating information from prior tokens at the previous layer. Attention takes an

---

### Page 189

7.1 • ATTENTION181
input representationx i corresponding to the input token at positioni, and a context
window of prior inputsx 1..xi−1, and produces an outputa i.
In causal, left-to-right language models, the context is any of the prior words.
That is, when processingx i, the model has access tox i as well as the representations
of all the prior tokens in the context window (context windows consist of thousands
of tokens) but no tokens afteri. (By contrast, in Chapter 9 we’ll generalize attention
so it can also look ahead to future words.)
Fig. 7.4 illustrates this flow of information in an entire causal self-attention layer,
in which this same attention computation happens in parallel at each token position
i. Thus a self-attention layer maps input sequences(x 1, ...,xn)to output sequences
of the same length(a 1, ...,an).
attentionattentionSelf-Attention
Layer
attentionattentionattention
a1 a2 a3 a4 a5
x3 x4 x5x1 x2
Figure 7.4Information flow in causal self-attention. When processing each inputx i, the
model attends to all the inputs up to, and includingx i.
Simplified version of attentionAt its heart, attention is really just a weighted
sum of context vectors, with a lot of complications added to how the weights are
computed and what gets summed. For pedagogical purposes let’s first describe a
simplified intuition of attention, in which the attention outputa i at token positioni
is simply the weighted sum of all the representationsx j, for allj≤i; we’ll useα i j
to mean how muchx j should contribute toa i:
Simplified version:a i =
X
j≤i
αi jx j (7.6)
Eachα i j is a scalar used for weighing the value of inputx j when summing up
the inputs to computea i. How shall we compute thisαweighting? In attention we
weight each prior embedding proportionally to howsimilarit is to the current token
i. So the output of attention is a sum of the embeddings of prior tokens weighted
by their similarity with the current token embedding. We compute similarity scores
viadot product, which maps two vectors into a scalar value ranging from−∞to
∞. The larger the score, the more similar the vectors that are being compared. We’ll
normalize these scores with a softmax to create the vector of weightsα i j,j≤i.
Simplified Version:score(x i,x j) =x i ·x j (7.7)
αi j =softmax(score(x i,x j))∀j≤i(7.8)
Thus in Fig. 7.4 we computea 3 by computing three scores:x 3 ·x 1,x 3 ·x 2 andx 3 ·x 3,
normalizing them by a softmax, and using the resulting probabilities as weights
indicating each of their proportional relevance to the current position 3. Of course,
the softmax weight will likely be highest forx i, sincex i is very similar to itself,
resulting in a high dot product. But other context words may also be similar toi, and
the softmax will also assign some weight to those words. Then we use these weights
as theαvalues in Eq. 7.6 to compute the weighted sum that is oura 3.
The simplified attention in equations 7.6 – 7.8 demonstrates the attention-based
approach to computinga i: compare thex i to prior vectors, normalize those scores

---

### Page 190

182CHAPTER7 • TRANSFORMERS ANDPRETRAINING
into a probability distribution used to weight the sum of the prior vectors. But now
we’re ready to remove the simplifications.
A single attention head using query, key, and value matricesNow that we’ve
seen a simple intuition of attention, let’s introduce the actualattention head, theattention head
version of attention that’s used in transformers. (The wordheadis often used inhead
transformers to refer to specific structured layers). The attention head allows us to
distinctly represent three different roles that each input embedding plays during the
course of the attention process:
• Asthe current elementbeing compared to the preceding inputs. We’ll refer to
this role as aquery.query
• In its role asa preceding inputthat is being compared to the current element
to determine a similarity weight. We’ll refer to this role as akey.key
• And finally, as avalueof a preceding element that gets weighted and summedvalue
up to compute the output for the current element.
To capture these three different roles, transformers introduce weight matrices
WQ,W K, andW V. These weights will project each input vectorx i into a represen-
tation of its role as a query, key, or value:
qi =x iWQ;k i =x iWK;v i =x iWV (7.9)
Given these projections, when we are computing the similarity of the current ele-
mentx i with some prior elementx j, we’ll use the dot product between the current
element’squeryvectorq i and the preceding element’skeyvectork j. Furthermore,
the result of a dot product can be an arbitrarily large (positive or negative) value, and
exponentiating large values can lead to numerical issues and loss of gradients during
training. To avoid this, we scale the dot product by a factor related to the size of the
embeddings, via dividing by the square root of the dimensionality of the query and
key vectors (dk). We thus replace the simplified Eq. 7.7 with Eq. 7.11. The ensuing
softmax calculation resulting inα i j remains the same, but the output calculation for
headi is now based on a weighted sum over the value vectorsv(Eq. 7.13).
Here’s a final set of equations for computing self-attention for a single self-
attention output vectora i from a single input vectorx i. This version of attention
computesa i by summing thevaluesof the prior elements, each weighted by the
similarity of itskeyto thequeryfrom the current element:
qi =x iWQ;k j =x jWK;v j =x jWV (7.10)
score(xi,x j) = qi ·k j√dk (7.11)
αi j =softmax(score(x i,x j))∀j≤i(7.12)
headi =
X
j≤i
αi jv j (7.13)
ai =head iWO (7.14)
We illustrate this in Fig. 7.5 for the case of calculating the value of the third output
a3 in a sequence.
Note that we’ve also introduced one more matrix,W O, which is left-multiplied
by the attention head. This is necessary to reshape the output of the head. The input
to attentionx i and the output from attentiona i both have the same dimensionality
[1×d]. We often calldthemodel dimensionality, and indeed as we’ll discuss in

---

### Page 191

7.1 • ATTENTION183
6. Sum the weighted
value vectors
4. Turn into 𝛼i,j weights via softmax
a3
1. Generate
key, query, value
vectors
2. Compare x3’s query with
the keys for x1, x2, and x3
8. Output of self-attention
×
×
x1
k q v
WK WQ WV
5. Weigh each value vector
÷
√dk3. Divide scalar score by √dk ÷√dk ÷√dk
𝛼3,1 𝛼3,2 𝛼3,3
x2
k q v
WK WQ WV
x3
k q v
WK WQ WV
WO
[1 × d]
[1 × d]
[dv × d]
[1 × dv]
[1 × dv][1 × dv][1 × dv]
[1 × dv] [1 × dv] [1 x dv]
7. Reshape to [1 x d]
[1 × d] [1 × d]
Figure 7.5Calculating the value ofa 3, the third element of a sequence using causal (left-
to-right) self-attention.
Section 7.2 the outputh i of each transformer block, as well as the intermediate vec-
tors inside the transformer block also have the same dimensionality[1×d]. Having
everything be the same dimensionality makes the transformer very modular.
So let’s talk shapes. How do we get from[1×d]at the input to[1×d]at the
output? Let’s look at all the internal shapes. We’ll have a dimensiond k for the
query and key vectors. The query vector and the key vector are both dimensionality
[1×d k], so we can take their dot productq i ·k j to produce a scalar. We’ll have a
separate dimensiond v for the value vectors. The transform matrixW Q has shape
[d×d k],W K is[d×d k], andW V is[d×d v]. So the output ofhead i in equation
Eq. 7.13 is of shape[1×d v]. To get the desired output shape[1×d]we’ll need to
reshape the head output, and soW O is of shape[d v ×d]. In the original transformer
work (Vaswani et al., 2017),dwas 512,d k andd v were both 64.
Multi-head AttentionEquations 7.11-7.13 describe a singleattention head. But
actually, transformers use multiple attention heads. The intuition is that each head
might be attending to the context for different purposes: heads might be special-
ized to represent different linguistic relationships between context elements and the
current token, or to look for particular kinds of patterns in the context.
So inmulti-head attentionwe haveAseparate attention heads that reside inmulti-headattention
parallel layers at the same depth in a model, each with its own set of parameters that
allows the head to model different aspects of the relationships among inputs. Thus
each headiin a self-attention layer has its own set of query, key, and value matrices:
WQi,W Ki, andW Vi. These are used to project the inputs into separate query, key,
and value embeddings for each head.
When using multiple heads the model dimensiondis still used for the input
and output, the query and key embeddings have dimensionalityd k, and the value
embeddings are of dimensionalityd v (again, in the original transformer paperd k =

---

### Page 192

184CHAPTER7 • TRANSFORMERS ANDPRETRAINING
dv =64,A=8, andd=512). Thus for each headi, we have weight layersW Qi of
shape[d×d k],W Ki of shape[d×d k], andW Vi of shape[d×d v].
Below are the equations for attention augmented with multiple heads; Fig. 7.6
shows an intuition.
qci =x iWQc;k cj =x jWKc;v cj =x jWVc;∀c1≤c≤A(7.15)
scorec(xi,x j) = qci ·k cj√dk (7.16)
αci j =softmax(score c(xi,x j))∀j≤i(7.17)
headci = X
j≤i
αci jvcj (7.18)
ai = (head1 ⊕head 2...⊕head A)WO (7.19)
MultiHeadAttention(xi,[x 1,· · ·,xi−1]) =a i (7.20)
Note in Eq. 7.20 that MultiHeadAttention is a function of the current inputx i, as
well as all the other inputs. For the causal or left-to-right attention that we use in
this chapter, the other inputs are only to the left, but we’ll also see a version of
attention in Chapter 9 where attention is a function of the tokens to the right as well.
We’ll return to this idea about causal inputs in Eq. 7.35 when we introduce the idea
of masking the right context.
The output of each of theAheads is of shape[1×d v], and so the output of the
multi-head layer withAheads consists ofAvectors of shape[1×d v]. These are
concatenated to produce a single output with dimensionality[1×Ad v]. Then we
use yet another linear projectionW O ∈R Adv×d to reshape it, resulting in the multi-
head attention vectora i with the correct output shape[1×d]at each inputi. The
dimensionalityd v of the heads is set so thatd v =d/A, which means that multihead
attention costs about the same in parameters as having a single head.
7.2 Transformer Blocks
The self-attention calculation lies at the core of what’s called a transformer block,
which, in addition to the self-attention layer, includes three other kinds of layers: (1)
a feedforward layer, (2) residual connections, and (3) normalizing layers (colloqui-
ally called “layer norm”).
Fig. 7.7 illustrates a transformer block, sketching a common way of thinking
about the block that is called theresidual stream(Elhage et al., 2021). In the resid-residual stream
ual stream viewpoint, we consider the processing of an individual tokenithrough
the transformer block as a single stream ofd-dimensional representations for token
positioni. This residual stream starts with the original input vector, and the various
components read their input from the residual stream and add their output back into
the stream.
The input at the bottom of the stream is an embedding for a token, which has
dimensionalityd. This initial embedding gets passed up (byresidual connections),
and is progressively added to by the other components of the transformer: theat-
tention layerthat we have seen, and thefeedforward layerthat we will introduce.
Before the attention and feedforward layer is a computation called thelayer norm.
Thus the initial vector is passed through a layer norm and attention layer, and
the result is added back into the stream, in this case to the original input vector

---

### Page 193

7.2 • TRANSFORMERBLOCKS185
xi-1 xixi-2xi-3
WK1
Head 1
WV1WQ1 WK2
Head 2
WV2WQ2 WK4
Head 4
WV4WQ4
ai
WO
[1 x dv ]
[1 x d]
[1 x d]
[1 x Adv ]
Project to ﬁnal representation
Concatenate Outputs
Each head
attends diﬀerently
to context
…
[1 x dv ]
WK3
Head 3
WV3WQ3 WK4
[1 x dv ] [1 x dv ]
[Adv x d]
usually dv=d/A, hence [d x d]
here A=4
Figure 7.6The multi-head attention computation for inputx i, producing outputa i. A multi-head attention
layer hasAheads, each with its own query, key, and value weight matrices. In this figure, we showA=4, a
smaller value than is usually used, just to fit on the page. The outputs from each of the heads are of shape[1×dv]
and are concatenated and then projected into a different space by theW O matrix. Usually the dimensionality
dv of the heads is set so thatd v =d/A, with the result thatW O is a square matrix of shape[Ad v ×d]=[d×d].
The result is projected tod, producing an output of the same size as the input.
xi
hi-1
xi-1
hi
…
Layer Norm
+
Layer Norm
MultiHead
Attention
Feedforward
+
xi-2
hi-2
Figure 7.7The architecture of a transformer block showing theresidual stream, showing
how most information flows up through the residual stream, and only the attention module
is sensitive to information from other streams at prior token positions. In this figure and
throughout the chapter, we use theprenormversion of the architecture, in which the layer
norms happen before the attention and feedforward layers rather than after.
xi. And then this summed vector is again passed through another layer norm and a
feedforward layer, and the output of those is added back into the residual, and we’ll
useh i to refer to the resulting output of the transformer block for tokeni.
We’ve already seen the attention layer, so let’s now introduce the feedforward

---

### Page 194

186CHAPTER7 • TRANSFORMERS ANDPRETRAINING
and layer norm computations in the context of processing a single inputx i at token
positioni.
7.2.1 Feedforward layer
The feedforward layer is a fully-connected 2-layer network, i.e., one hidden layer,
two weight matrices (Chapter 6).
The feedforward layer is position-wise, meaning that it operates on each token
positioniindependently. This makes a contrast with the attention network, whose
job is to mix information from different token positions. The feedforward weights
are shared across positions, meaning that the same parameters are applied to every
token position, but are different from layer to layer.
It is common to make the dimensionalityd ff of the hidden layer of the feed-
forward network be 4 times larger than the model dimensionalityd. (For example
in the original transformer model,d=512 andd ff =2048.) This means the feed-
forward networks have most of the parameters of the transformers, and these feed-
forward network parameters seem to encode most of the factual knowledge in the
transformer. (Geva et al., 2021; Meng et al., 2022).
Most LLMs now actually usegated feedforward layers, by employing an acti-
gated
feedforward
layers
vation function called SwiGLU (Shazeer, 2020) that works better than simpler func-
tions like ReLU. SwiGLU is in the family of Gated Linear Unit (GLU) functions
(Dauphin et al., 2017), which do a component-wise product (⊗) of two linear trans-
formations of the input. The idea is that one of the functions is a value, and the
other is a gate that specifies how much of that value goes through. SwiGLU uses the
Swish function (Ramachandran et al., 2017) as the gate:
Swishβ (x) =xσ(βx)(7.21)
The SwiGLU feedforward equation is then:
FFNSwiGLU(x,W 1,W 2,W 3,b 1,b 2,b 3,β) =
Swishβ (xW1 +b 1)⊗(xW 2 +b 2)

W3 +b 3 (7.22)
Because gated activation functions have extra parameters for the gating, the dimen-
sionalityd ff of gated models is usually set to be slightly less than the normal 4d.
7.2.2 Layer Norm
At two stages in the transformer block wenormalizethe vector (Ba et al., 2016).
This process, calledlayer norm(short for layer normalization), is one of manylayer norm
forms of normalization that can be used to improve training performance in deep
neural networks by keeping the values of a hidden layer in a range that facilitates
gradient-based training.
Layer norm is a variation of thez-scorefrom statistics, applied to a single vec-
tor in a hidden layer. That is, the term layer norm is a bit confusing; layer norm
isnotapplied to an entire transformer layer, but just to the embedding vector of a
single token. Thus the input to layer norm is a single vector of dimensionalityd
and the output is that vector normalized, again of dimensionalityd. The first step in
layer normalization is to calculate the mean,µ, and standard deviation,σ, over the
elements of the vector to be normalized. Given an embedding vectorxof dimen-

---

### Page 195

7.2 • TRANSFORMERBLOCKS187
sionalityd, these values are calculated as follows.
µ= 1d dXj=1 x[j](7.23)
σ=
vuut 1
d
dX
j=1
(x[j]−µ) 2 (7.24)
Given these values, the vector components are normalized by subtracting the mean
from each and dividing by the standard deviation. The result of this computation is
a new vector with zero mean and a standard deviation of one.
ˆ x=(x−µ)σ (7.25)
Finally, in the standard implementation of layer normalization, two learnable param-
eters,γandβ, representing gain and offset values, are introduced.
LayerNorm(x) =γ (x−µ)σ +β(7.26)
In practice, many modern networks use a simpler norm, calledRMSNorm(ZhangRMSNorm
and Sennrich, 2019), which rescales the vectors by dividing by the root-mean-square
statistic, but skips the mean-centering step.
7.2.3 Putting it all together
The function computed by a transformer block can be expressed by breaking it down
with one equation for each component computation, usingt(of shape[1×d]) to
stand for transformer and superscripts to demarcate each computation inside the
block:
t1i =LayerNorm(x i)(7.27)
t2i =MultiHeadAttention(t 1i , t11,· · ·,t1i−1)(7.28)
t3i =t 2i +x i (7.29)
t4i =LayerNorm(t 3i )(7.30)
t5i =FFN(t 4i )(7.31)
hi =t 5i +t 3i (7.32)
Notice that the only component that takes as input information from other tokens
(other residual streams) is multi-head attention, which (as we see from Eq. 7.28)
looks at all the neighboring tokens in the context. The output from attention, how-
ever, is then added into this token’s embedding stream. In fact, Elhage et al. (2021)
show that we can view attention heads as literally moving information from the
residual stream of a neighboring token into the current stream. The high-dimensional
embedding space at each position thus contains information about the current to-
ken and about neighboring tokens, albeit in different subspaces of the vector space.
Fig. 7.8 shows a visualization of this movement. We therefore call the attention func-
tion thetoken-mixingcomponent of the architecture, because it mixes informationtoken-mixing
from neighboring token streams into the current stream.
Crucially, the input and output dimensions of transformer blocks are matched so
they can be stacked. Each token vectorxi at the input to the block has dimensionality

---

### Page 196

188CHAPTER7 • TRANSFORMERS ANDPRETRAINING
Token A
residual
stream
Token B
residual
stream
Figure 7.8An attention head can move information from token A’s residual stream into
token B’s residual stream.
d, and the outputh i also has dimensionalityd. Transformers for large language
models stack many of these blocks, from 12 layers (used for the T5 or GPT-3-small
language models) to 96 layers (used for GPT-3 175B), to even more for more recent
models. We’ll come back to this issue of stacking in a bit.
Equation 7.27 and following are just the equation for a single transformer block,
but the residual stream metaphor goes through all the transformer layers, from the
first transformer blocks to the 12th, in a 12-layer transformer. At the earlier trans-
former blocks, the residual stream is representing the current token. At the highest
transformer blocks, the residual stream is usually representing the following token,
since at the very end it’s being trained to predict the next token.
Once we stack many blocks, there is one more requirement: at the very end of
the last (highest) transformer block, there is a single extra layer norm that is run on
the lasth i of each token stream (just below the language model head layer that we
will define soon). 2
7.3 Parallelizing computation using a single matrixX
This description of multi-head attention and the rest of the transformer block has
been from the perspective of computing a single output at a single time stepiin
a single residual stream. But as we pointed out earlier, the attention computation
performed for each token to computea i is independent of the computation for each
other token, and that’s also true for all the computation in the transformer block
computingh i from the inputx i. That means we can easily parallelize the entire
computation, taking advantage of efficient matrix multiplication routines.
We do this by packing the input embeddings for theNtokens of the input se-
quence into a single matrixXof size[N×d]. Each row ofXis the embedding
of one token of the input. Transformers for large language models can have an
input lengthNof hundreds of thousands of tokens, and millions of tokens can be
achieved with long-context mechanisms that we don’t discuss here. So for vanilla
transformers, we can think ofXhaving hundreds of thousands of rows, each of the
dimensionality of the embeddingd(the model dimension).
2 This is the most common transformer architecture, theprenormarchitecture. The original definition
of the transformer in Vaswani et al. (2017) used an alternative architecture, thepostnormtransformer,
in which the layer norm happensafterthe attention and FFN layers; having the layer norm beforehand
works better, but does require this one extra layer at the end.

---

### Page 197

7.3 • PARALLELIZING COMPUTATION USING A SINGLE MATRIXX189
Parallelizing attentionLet’s first see this for a single attention head and then turn
to multiple heads, and then add in the rest of the components in the transformer
block. For one head we multiplyXby the query, key, and value matricesW Q of
shape[d×d k],W K of shape[d×d k], andW V of shape[d×d v], to produce matrices
Qof shape[N×d k],Kof shape[N×d k], andVof shape[N×d v], containing all the
key, query, and value vectors:
Q=XW Q;K=XW K;V=XW V (7.33)
Given these matrices we can compute all the requisite query-key comparisons simul-
taneously by multiplyingQandK ⊺ in a single matrix multiplication. The product is
of shapeN×N, visualized in Fig. 7.9.
q1•k1
q2•k1q2•k2
q4•k1q4•k2q4•k3q4•k4
q3•k1q3•k2q3•k3
N
N
q1•k2q1•k3q1•k4
q2•k3q2•k4
q3•k4
Figure 7.9TheN×NQK ⊺ matrix showing how it computes allq i ·k j comparisons in a
single matrix multiple.
Once we have thisQK ⊺ matrix, we can very efficiently scale these scores, take
the softmax, and then multiply the result byVresulting in a matrix of shapeN×d:
a vector embedding representation for each token in the input. We’ve reduced the
entire self-attention step for an entire sequence ofNtokens for one head to the
following computation:
head=softmax

mask
 QK⊺
√dk

V(7.34)
A=head W O (7.35)
Masking out the futureYou may have noticed that we introduced a mask function
in Eq. 7.34 above. This is because the self-attention computation as we’ve described
it has a problem: the calculation ofQK ⊺ results in a score for each query value to
every key value,including those that follow the query. This is inappropriate in the
setting of language modeling: guessing the next word is pretty simple if you already
know it! To fix this, the elements in the upper-triangular portion of the matrix are set
to−∞, which the softmax will turn to zero, thus eliminating any knowledge of words
that follow in the sequence. This is done in practice by adding a mask matrixMin
whichM i j =−∞∀j>i(i.e. for the upper-triangular portion) andM i j =0 otherwise.
Fig. 7.10 shows the resulting maskedQK ⊺ matrix. As we’ll see in Section 7.7, the
use of the mask is what lets every position in the window serve as a training example,
making the transformer very efficient to train. And we’ll see in Chapter 9 how to
adjust the mask to make use of words in the future for tasks that need it.
Fig. 7.11 shows a schematic of all the computations for a single attention head
parallelized in matrix form.
Fig. 7.9 and Fig. 7.10 also make it clear that attention is quadratic in the length
of the input, since at each layer we need to compute dot products between each pair

---

### Page 198

190CHAPTER7 • TRANSFORMERS ANDPRETRAINING
q1•k1
q2•k1q2•k2
q4•k1q4•k2q4•k3q4•k4
q3•k1q3•k2q3•k3
N
N
−∞−∞
−∞−∞
−∞
−∞
Figure 7.10TheN×NQK ⊺ matrix showing theq i ·k j values, with the upper-triangle
portion of the comparisons matrix zeroed out (set to−∞, which the softmax will turn to
zero).
q1
q2
q3
q4
k1
k2
k3
k4
Q KT QKT
v1
v2
v3
v4
V
q2•k2
q4•k2q4•k3q4•k4
q3•k2q3•k3
−∞−∞
−∞−∞
−∞
−∞q1•k1
q2•k1q2•k2
q4•k1q4•k2q4•k3q4•k4
q3•k1q3•k2q3•k3
q1•k2
q2•k3
q1•k3
q3•k4
q2•k4
q1•k4x =
QKT masked
mask =
q1•k1
q2•k1
q4•k1
q3•k1
q1•k1q1•k1
=x
a1
a2
a3
a4
A
Query
Token 1
Query
Token 2
Query
Token 3
Query
Token 4
Q
Input
Token 1
Input
Token 2
Input
Token 3
Input
Token 4
X
x
WQ
=
Value
Token 1
Value
Token 2
Value
Token 3
Value
Token 4
V
x
WV
=
Input
Token 1
Input
Token 2
Input
Token 3
Input
Token 4
X
Key
Token 1
Key
Token 2
Key
Token 3
Key
Token 4
K
x
WK
=
Input
Token 1
Input
Token 2
Input
Token 3
Input
Token 4
X
N x dk
dk x N
N x N N x N N x dv N x dv
d x dk d x dk d x dvN x d N x dk N x d N x dk N x d N x dv
Figure 7.11Schematic of the attention computation for a single attention head in parallel. The first row shows
the computation of theQ,K, andVmatrices. The second row shows the computation ofQK T, the masking
(the softmax computation and the normalizing by dimensionality are not shown) and then the weighted sum of
the value vectors to get the final attention vectors.
of tokens in the input. This makes it expensive to compute attention over very long
documents (like entire novels). Nonetheless modern large language models manage
to use quite long contexts of thousands or tens of thousands of tokens.
Parallelizing multi-head attentionIn multi-head attention, as with self-attention,
the input and output have the model dimensiond, the key and query embeddings
have dimensionalityd k, and the value embeddings are of dimensionalityd v (again,
in the original transformer paperd k =d v =64,A=8, andd=512). Thus for
each headc, we have weight layersW Qc of shape[d×d k],W Kc of shape[d×d k],
andW Vc of shape[d×d v], and these get multiplied by the inputs packed intoXto
produceQof shape[N×d k],Kof shape[N×d k], andVof shape[N×d v]. The
output of each of theAheads is of shape[N×d v], and so the output of the multi-
head layer withAheads consists ofAmatrices of shape[N×d v]. To make use
of these matrices in further processing, they are concatenated to produce a single
output with dimensionality[N×Ad v]. Finally, we use a final linear projectionW O
of shape[Ad v ×d], that reshapes it to the original output dimension for each token.

---

### Page 199

7.4 • THE INPUT:EMBEDDINGS FOR TOKEN AND POSITION191
Multiplying the concatenated[N×Ad v]matrix output byW O of shape[Ad v ×d]
yields the self-attention outputAof shape [N×d].
Qi =XW Qi ;K i =XW Ki ;V i =XW Vi (7.36)
headi =SelfAttention(Q i,K i,V i) =softmax

mask
 QiKi⊺
√dk

Vi (7.37)
MultiHeadAttention(X) = (head1 ⊕head 2...⊕head A)WO (7.38)
Putting it all together with the parallel input matrixXThe function computed
in parallel by an entire layer ofNtransformer blocks—each block over one of theN
input tokens—can be expressed as:
O=X+MultiHeadAttention(LayerNorm(X))(7.39)
H=O+FFN(LayerNorm(O))(7.40)
Note that in Eq. 7.39 we are usingXto mean the input to the layer, wherever it
comes from. For the first layer, as we will see in the next section, that input is the
initial word + positional embedding vectors that we have been describing byX. But
for subsequent layersk, the input is the output from the previous layerH k−1. We
can also break down the computation performed in a transformer layer, showing one
equation for each component computation. We’ll useT(of shape[N×d]) to stand
for transformer and superscripts to demarcate each computation inside the block,
and again useXto mean the input to the block from the previous layer or the initial
embedding:
T1 =LayerNorm(X)(7.41)
T2 =MultiHeadAttention(T 1)(7.42)
T3 =T 2 +X(7.43)
T4 =LayerNorm(T 3)(7.44)
T5 =FFN(T 4)(7.45)
H=T 5 +T 3 (7.46)
Here when we use a notation like FFN(T 3)we mean that the same FFN is applied
in parallel to each of theNembedding vectors in the window. Similarly, each of the
Ntokens is normed in parallel in the LayerNorm. Crucially, the input and output
dimensions of transformer blocks are matched so they can be stacked. Since each
tokenx i at the input to the block is represented by an embedding of dimensionality
[1×d], that means the inputXand outputHare both of shape[N×d].
7.4 The input: embeddings for token and position
Let’s talk about where the inputXcomes from. Given a sequence ofNtokens (Nis
the context length in tokens), the matrixXof shape[N×d]has anembeddingforembedding
each word in the context. The transformer does this by separately computing two
embeddings: an input token embedding, and an input positional embedding.
A token embedding, introduced in Chapter 6, is a vector of dimensiondthat will
be our initial representation for the input token. (As we pass vectors up through the
transformer layers in the residual stream, this embedding representation will change

---

### Page 200

192CHAPTER7 • TRANSFORMERS ANDPRETRAINING
and grow, incorporating context and playing a different role depending on the kind
of language model we are building.) The set of initial embeddings are stored in the
embedding matrixE, which has a row for each of the|V|tokens in the vocabulary.
(Reminder thatVhere means the vocabulary of tokens, thisVis not related to the
value vector.) Thus each word is a row vector ofddimensions, andEhas shape
[|V| ×d].
Given an input token string likeThanks for all thewe first convert the tokens
into vocabulary indices (these were created when we first tokenized the input using
BPE or SentencePiece). So the representation ofthanks for all themight bew=
[5,4000,10532,2224]. Next we use indexing to select the corresponding rows from
E, (row 5, row 4000, row 10532, row 2224).
Another way to think about selecting token embeddings from the embedding
matrix is to represent tokens as one-hot vectors of shape[1× |V|], i.e., with one
dimension for each word in the vocabulary. Recall that in aone-hot vectorall theone-hot vector
elements are 0 except one, the element whose dimension is the word’s index in the
vocabulary, which has value 1. So if the word “thanks” has index 5 in the vocabulary,
x5 =1, andx i =0∀i̸=5, as shown here:
[0 0 0 0 1 0 0 ... 0 0 0 0]
1 2 3 4 5 6 7 ... ... |V|
Multiplying by a one-hot vector that has only one non-zero elementxi =1 simply
selects out the relevant row vector for wordi, resulting in the embedding for wordi,
as depicted in Fig. 7.12.
E
|V|
d
1
|V| d
=✕
55
0 0 0 0 1 0 0 … 0 0 0 0 1
Figure 7.12Selecting the embedding vector for wordV 5 by multiplying the embedding
matrixEwith a one-hot vector with a 1 in index 5.
We can extend this idea to represent the entire token sequence as a matrix of one-
hot vectors, one for each of theNpositions in the transformer’s context window, as
shown in Fig. 7.13.
E
|V|
d
d
N
=✕
|V|
N
0 0 0 0 0 0 0 … 0 0 1 0
0 0 0 0 1 0 0 … 0 0 0 0
1 0 0 0 0 0 0 … 0 0 0 0
0 0 0 0 1 0 0 … 0 0 0 0
…
Figure 7.13Selecting the embedding matrix for the input sequence of token idsWby mul-
tiplying a one-hot matrix corresponding toWby the embedding matrixE.
These token embeddings are not position-dependent. To represent the position
of each token in the sequence, we combine these token embeddings withpositional
embeddingsspecific to each position in an input sequence.positionalembeddings
Where do we get these positional embeddings? The simplest method, called
absolute position, is to start with randomly initialized embeddings correspondingabsoluteposition

---

### Page 201

7.5 • THELANGUAGEMODELINGHEAD193
to each possible input position up to some maximum length. For example, just as
we have an embedding for the wordfish, we’ll have an embedding for the position 3.
As with word embeddings, these positional embeddings are learned along with other
parameters during training. We can store them in a matrixE pos of shape[N×d].
To produce an input embedding that captures positional information, we just add
the word embedding for each input to its corresponding positional embedding. The
individual token and position embeddings are both of size[1×d], so their sum is also
[1×d]. This new embedding serves as the input for further processing. Fig. 7.14
shows the idea.
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
Figure 7.14A simple way to model position: add an embedding of the absolute position to
the token embedding to produce a new embedding of the same dimensionality.
The final representation of the input, the matrixX, is an[N×d]matrix in which
each rowiis the representation of theith token in the input, computed by adding
E[id(i)]—the embedding of the id of the token that occurred at positioni—, to
Epos[i], the positional embedding of positioni.
A potential problem with the simple position embedding approach is that there
will be plenty of training examples for the initial positions in our inputs and corre-
spondingly fewer at the outer length limits. These latter embeddings may be poorly
trained and may not generalize well during testing. An alternative is to choose a
static function that maps integer inputs to real-valued vectors in a way that better
handles sequences of arbitrary length. A combination of sine and cosine functions
with differing frequencies was used in the original transformer work. Sinusoidal po-
sition embeddings may also help in capturing the inherent relationships among the
positions, like the fact that position 4 in an input is more closely related to position
5 than it is to position 17.
A more complex style of positional embedding methods extend this idea of cap-
turing relationships even further to directly representrelative positioninstead ofrelativeposition
absolute position, often implemented in the attention mechanism at each layer rather
than being added once at the initial input. The most popular such positional embed-
ding mechanism is theRotary Position Embedding(RoPE) (Su et al., 2024).RoPE
7.5 The Language Modeling Head
The last component of the transformer we must introduce is thelanguage modeling
head. Here we are using the wordheadto mean the additional neural circuitry welanguagemodeling head
head add on top of the basic transformer architecture when we apply pretrained trans-

---

### Page 202

194CHAPTER7 • TRANSFORMERS ANDPRETRAINING
former models to various tasks. The language modeling head is the circuitry we
need to do language modeling.
Recall that language models, from the simple n-gram models of Chapter 3 through
the feedforward models of Chapter 6, are word predictors. Given a context of words,
they assign a probability to each possible next word. For example, if the preceding
context is“Thanks for all the”and we want to know how likely the next word is
“fish”we would compute:
P(fish|Thanks for all the)
Language models give us the ability to assign such a conditional probability to every
possible next word, giving us a distribution over the entire vocabulary. The n-gram
language models of Chapter 3 compute the probability of a word given counts of
its occurrence with then−1 prior words. The context is thus of sizen−1. For
transformer language models, the context is the size of the transformer’s context
window, which as we mentioned above can range from hundreds of thousands of
tokens to millions.
Layer L
Transformer
Block
Softmax over vocab V
Unembedding
…
[1 x |V|]
Logits
Word probabilities
[1 x |V|]
hL1
w1 w2 wN
hL2 hLN
[d x |V|]
[1 x d]
Unembedding layer
U = ET
y1 y2 y|V|…
u1 u2 u|V|…
Language Model Head
takes hLN and outputs a
distribution over vocabulary V
Softmax
Figure 7.15The language modeling head: the circuit at the top of a transformer that maps
from the output embedding for tokenNfrom the last transformer layer (h LN) to a probability
distribution over words in the vocabularyV.
The job of the language modeling head is to take the output of the final trans-
former layer at each tokeniand use it to predict the upcoming word at positioni+1.
For inference, we just run the head on the very last tokenNand use it to predict the
upcoming word at positionN+1. 3 Fig. 7.15 shows how to accomplish this task,
taking the output of the last token at the last layer (thed-dimensional output em-
bedding of shape[1×d]) and producing a probability distribution over words (from
which we will choose one to generate).
The first module in Fig. 7.15 is a linear layer, whose job is to project from the
outputh LN, which represents the output token embedding at positionNfrom the final
blockL, (hence of shape[1×d]) to thelogitvector, or score vector, that will have alogit
single score for each of the|V|possible words in the vocabularyV. The logit vector
uis thus of dimensionality[1× |V|].
This linear layer can be learned, but it is also very common to tie this matrix to
(the transpose of) the embedding matrixE. Recall that inweight tying, we use theweight tying
same weights for two different matrices in the model. Thus at the input stage of the
3 While for training, the language modeling head predicts a word at every token position, not just the
last one.

---

### Page 203

7.5 • THELANGUAGEMODELINGHEAD195
transformer the embedding matrix (of shape[|V| ×d]) is used to map from a one-hot
vector over the vocabulary (of shape[1× |V|]) to an embedding (of shape[1×d]).
And then in the language model head,ET, the transpose of the embedding matrix (of
shape[d× |V|]) is used to map back from an embedding (shape[1×d]) to a vector
over the vocabulary (shape [1×|V|]). In the learning process,Ewill be optimized to
be good at doing both of these mappings. We therefore sometimes call the transpose
ET theunembeddinglayer because it is performing this reverse mapping.unembedding
A softmax layer turns the logitsuinto the probabilitiesyover the vocabulary.
u=h LN ET (7.47)
y=softmax(u)(7.48)
We can use these probabilities to do things like help assign a probability to a
given text. But the most important usage is to generate text, which we’ll see how
to do in the next section by repeatedlysamplingan entryy k from the probability
vectory, and generating the word with indexk.
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
EncodingE
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
y1y2 y|V|…Token probabilities
u1 u2 u|V|…
softmax
wi+1
Layer L
extra layer norm
Figure 7.16A transformer language model (decoder-only), stacking transformer blocks
and mapping from an input tokenw i to a predicted next tokenw i+1.
Fig. 7.16 shows the total stacked architecture for one tokeni. Note that the input
to each transformer layerx ℓi is the same as the output from the preceding layerh ℓ−1i .
A terminological note before we conclude: You will sometimes see a trans-
former used for this kind of unidirectional causal language model called adecoder-

---

### Page 204

196CHAPTER7 • TRANSFORMERS ANDPRETRAINING
only model. This is because this model constitutes roughly half of theencoder-decoder-onlymodel
decoder modelfor transformers that we’ll see how to apply to machine translation
in Chapter 13. (Confusingly, the original introduction of the transformer had an
encoder-decoder architecture, and it was only later that the standard paradigm for
causal language model was defined by using only the decoder part of this original
architecture).
7.6 Decoding
The task of choosing a token to generate based on the model’s probabilities is called
decoding. As we mentioned above, decoding from a language model in a left-to-decoding
right manner (or right-to-left for languages like Arabic in which we read from right
to left), and thus repeatedly choosing the next token conditioned on our previous
choices is calledcausalorautoregressive generation. 4causal
autoregressive
generation We’re decoding from the probability vectory, of shape[1× |V|], which assigns a
probability to each token in the vocabulary. Fig. 7.17 shows an example in which the
softmax is computed for pedagogical purposes on a simplified vocabulary of only 4
words. Let’s use this example to investigate different methods ofsamplingwords to
generate.
1.2
0.9
all
the
your
that-0.5
logits
.44
.33
all
the
your
that
.15
.08
probabilitiessoftmax
Transformer (or other decoder)
long and thanks forSo ?
0.1
u y
Figure 7.17Using the softmax to create a probability vectoryfrom the logit vectoru.
7.6.1 Greedy decoding
The simplest way to generate tokens is to always generate the most likely token
given the context, which is calledgreedy decoding. Agreedy algorithmis onegreedydecoding
that makes a choice that is locally optimal, whether or not it will turn out to have
been the best choice with hindsight. Thus in greedy decoding, at each time step in
generation, we turn the logits into a probability distribution over tokens and then we
choose as the outputw t the token in the vocabulary that has the highest probability
(the argmax):
ˆwt =argmax w∈V P(w|w<t)(7.49)
4 Technically anautoregressivemodel predicts a value at timetbased on a linear function of the values
at timest−1,t−2, and so on. Although language models are not linear (since, as we will see, they have
many layers of non-linearities), we loosely refer to this generation technique as autoregressive since the
token generated at each time step is conditioned on the token selected by the network from the previous
step. As we’ll see, alternatives like the masked language models of Chapter 9 are non-causal because
they can predict tokens based on both past and future tokens.

---

### Page 205

7.6 • DECODING197
Fig. 7.18 shows that in our example, the model chooses to generateall.
1.2
0.9
all
the
your
that
0.1
-0.5
logits
.44
.33
all
the
your
that
.15
.08
probabilitiessoftmax
Transformer (or other decoder)
long and thanks forSo ?
u y
Figure 7.18Greedy decoding: choose the highest probability word.
In practice, however, we don’t use greedy decoding with large language models.
A major problem with greedy decoding is that because the tokens it chooses are
(by definition) extremely predictable, the resulting text is generic and often quite
repetitive. Indeed, greedy decoding is so predictable that it is deterministic; if the
context is identical, and the probabilistic model is the same, greedy decoding will
always result in generating exactly the same string.
We’ll see in Chapter 13 that an extension to greedy decoding calledbeam search
works well in tasks like machine translation, which are very constrained in that we
are always generating a text in one language conditioned on a very specific text in
another language.
In most other tasks, however, people prefer text which has been generated by
sampling methodsthat introduce a bit more diversity into the generations.
7.6.2 Random sampling
Thus the most common method for decoding in large language models involvessam-
pling. Recall from Chapter 3 thatsamplingfrom a distribution means to choose ran-sampling
dom points according to their likelihood. Thus sampling from a language model—
which represents a distribution over following tokens—means to choose the next
token to generate according to its probability assigned by the model. Thus we are
more likely to generate tokens that the model thinks have a high probability and less
likely to generate tokens that the model thinks have a low probability.
That is, we randomly select a token to generate according to its probability in
context as defined by the model, generate it, and iterate. We could think of this as
rolling a die and choosing a token according to the resulting probability, as we saw in
Chapter 3. Such a model is of course more likely to generate the highest probability
token, just like the greedy algorithm, but it could also generate any token, just with
smaller chances. But in general we are more likely to generate tokens that the model
thinks have a high probability in the context and less likely to generate tokens that
the model thinks have a low probability.
Sampling from language models was first suggested very early on by Shannon
(1948) and Miller and Selfridge (1950), and we saw back in Chapter 3 on page 79
how to generate text from a unigram language model by repeatedly randomly sam-
pling tokens according to their probability until we either reach a pre-determined
length or select the end-of-sentence token.
To generate text from a large language model we’ll just generalize this model
a bit: at each step we’ll sample tokens according to their probabilityconditioned

---

### Page 206

198CHAPTER7 • TRANSFORMERS ANDPRETRAINING
on our previous choices, and we’ll use the large language model as the probability
model that tells us this probability.
The algorithm is calledrandom sampling, orrandom multinomial samplingrandomsampling
(because we are sampling from a multinomial distribution across words). We can
formalize random sampling as follows: we are generating a sequence of tokens
{w1,w 2, . . . ,wN}until we hit the end-of-sequence token, usingx∼p(x)to mean
‘choosexby sampling from the distributionp(x)’:
i←1
wi ∼p(w)
whilew i != EOS
i←i + 1
wi ∼p(w i|w<i)
Transformer (or other decoder)
long and thanks forSo ?
1.2
0.9
all
the
your
that
…
0.1
-0.5
logits
.44
.33
all
the
your
that
…
.15
.08
probabilitiessoftmax sample a word
the
u y
Figure 7.19Random multinomial sampling: we randomly chose a word according to its
probability.
Alas, it turns out random sampling doesn’t work well either. The problem is that
even though random sampling is mostly going to generate sensible, high-probable
tokens, there are many odd, low-probability tokens in the tail of the distribution.
Even though each one is low-probability, the sum of these rare tokens constitutes
a non-trivial portion of the distribution. As a result, these tokens get chosen often
enough to result in weird sentences being generated.
In other words, greedy decoding is too boring, and random sampling is too ran-
dom. We need something that doesn’t greedily choose the top choice every time, but
doesn’t stray down too far into the very low-probability events.
There are three standard sampling methods that modify random sampling to ad-
dress these issues.Temperaturesampling,top-k, andtop-p.
7.6.3 Temperature sampling
The next three methods we introduce enable trading off two important factors in
generation:qualityanddiversity. Methods that emphasize the most probable words
tend to produce generations that are rated by people as more accurate, more coherent,
and more factual, but also more boring and more repetitive. Methods that give a bit
more weight to the middle-probability words tend to be more creative and more
diverse, but less factual and more likely to be incoherent or otherwise low-quality.
The idea oftemperature samplingis to reshape the probability distribution totemperaturesampling
increase the probability of the high probability tokens and decrease the probability of
the low probability tokens. The result is that we are less likely to generate very low-
probability tokens, and more likely to generate tokens that are higher probability.
We implement this intuition by simply dividing the logit by a temperature param-
eterτbefore passing it through the softmax. In low-temperature sampling,τ∈(0,1].

---

### Page 207

7.6 • DECODING199
Thus instead of computing the probability distribution over the vocabulary di-
rectly from the logit as in the following (repeated from Eq. 7.48):
y=softmax(u)(7.50)
we instead first divide the logits byτ, computing the probability vectoryas
y=softmax(u/τ)(7.51)
That is, normally we convert from logits to softmax as shown in Fig. 7.20(a).
But when we use a temperature parameter we first scale the logit as in Fig. 7.20(b).
a
b
c
d
logits probabilities
…
softmax
<latexit sha1_base64="lLjYsJ0298yNwV4fBI/WsQilXNU=">AAACUHicdZFLSwMxFIXv1Pf4qrp0M1iEuikzIupSdONSwT6wU0omvVODmQfJHbEM8xPduPN3uHGhaPoQ1NoLIYfz3UuSkyCVQpPrvlilufmFxaXlFXt1bX1js7y13dBJpjjWeSIT1QqYRilirJMgia1UIYsCic3g/mLImw+otEjiGxqk2IlYPxah4IyM1S33/VAxnvuEj5TjY1pU2UGR3xa+b0+RYCbhM0lvQrrliltzR+VMC28iKjCpq2752e8lPIswJi6Z1m3PTamTM0WCSyxsP9OYMn7P+tg2MmYR6k4+CqRw9o3Tc8JEmRWTM3J/TuQs0noQBaYzYnSn/7Kh+R9rZxSednIRpxlhzMcHhZl0KHGG6To9oZCTHBjBuBLmrg6/YyYTMn9gmxC8v0+eFo3DmndcO74+qpydT+JYhl3Ygyp4cAJncAlXUAcOT/AK7/BhPVtv1mfJGrd+77ADv6pkfwHMyrcq</latexit>
exp(a)
Z
exp(b)
Z
exp(c)
Z
exp(d)
Z
…
where
<latexit sha1_base64="slkKS32ZjetCo4TC0WjiNWsXOvk=">AAACMHicbVBLSwMxEM7Wd31VPXoJFqEiLLsi1YtQ9KBHBWuL3VKy6bQNzT5IZqVl6U/y4k/Ri4IiXv0VprWH2joQ+B4zTObzYyk0Os6blZmbX1hcWl7Jrq6tb2zmtrbvdJQoDmUeyUhVfaZBihDKKFBCNVbAAl9Cxe9eDP3KAygtovAW+zHUA9YORUtwhkZq5C7v6Rn1EHqYQi8eFNiB5x1OcH+K8yneHHLbthu5vGM7o6KzwB2DPBnXdSP37DUjngQQIpdM65rrxFhPmULBJQyyXqIhZrzL2lAzMGQB6Ho6OnhA943SpK1ImRciHamTEykLtO4HvukMGHb0tDcU//NqCbZO66kI4wQh5L+LWomkGNFherQpFHCUfQMYV8L8lfIOU4yjyThrQnCnT54Fd0e2W7SLN8f50vk4jmWyS/ZIgbjkhJTIFbkmZcLJI3kh7+TDerJerU/r67c1Y41ndsifsr5/AMbSqM8=</latexit>
Z=e x p (a)
+exp(b)
+exp(c)
+exp(d)
+...
u y
a
b
c
d
logits probabilities
…
softmax
with
temperature
…
where
<latexit sha1_base64="T7dRSbxSPkmDhGf7oKNV2kNrMwI=">AAACZHicfZFLS8NAFIUn8dFaX6nFlSDBIuimJiLVZdGNywr2gU0pk+mNDp08mLmRlpA/6c6lG3+H08eiWumFgcP57uXOnPETwRU6zqdhbmxubReKO6Xdvf2DQ6t81FZxKhm0WCxi2fWpAsEjaCFHAd1EAg19AR1/9DDlnXeQisfRM04S6If0NeIBZxS1NbAyL5CUZR7CGDMYJ/kFvfKQppd59pJ7XmkF++sxW4+Hy3hgVZ2aMyt7VbgLUSWLag6sD28YszSECJmgSvVcJ8F+RiVyJiAveamChLIRfYWelhENQfWzWUi5fa6doR3EUp8I7Zm7PJHRUKlJ6OvOkOKb+sum5n+sl2Jw1894lKQIEZsvClJhY2xPE7eHXAJDMdGCMsn1XW32RnUwqP+lpENw/z55VbSva269Vn+6qTbuF3EUyQk5IxfEJbekQR5Jk7QII19GwbCMsvFt7pkV83jeahqLmQr5VebpD24juks=</latexit>
exp(a/⌧)
Z
exp(b/⌧)
Z
exp(c/⌧)
Z
exp(d/⌧)
Z
<latexit sha1_base64="lcYQ3ehha04wqOdeev6WbvHrfSk=">AAACRHicbZBLSwMxFIUzvq2vUZdugkVQhHFGpLoRRDcuFWwtdkrJpLc2NPMguSMtQ3+cG3+AO3+BGxeKuBXTWqS2PRA4fOdekpwgkUKj675YU9Mzs3PzC4u5peWV1TV7faOk41RxKPJYxqocMA1SRFBEgRLKiQIWBhJug9ZFL799AKVFHN1gJ4FqyO4j0RCcoUE1u3JHT6mP0MYM2kl3lx34yNI9398fgsEkyCfB+h90HKdm513H7YuOG29g8mSgq5r97NdjnoYQIZdM64rnJljNmELBJXRzfqohYbzF7qFibMRC0NWsX0KX7hhSp41YmRMh7dPhjYyFWnfCwEyGDJt6NOvBSVklxcZJNRNRkiJE/PeiRiopxrTXKK0LBRxlxxjGlTBvpbzJFONoes+ZErzRL4+b0qHjFZzC9VH+7HxQxwLZIttkl3jkmJyRS3JFioSTR/JK3smH9WS9WZ/W1+/olDXY2ST/ZH3/ACFjsOs=</latexit>
Z=e x p (a/⌧)
+exp(b/⌧)
+exp(c/⌧)
+exp(d/⌧)
+...
u y
(a) (b)
Figure 7.20(a): Normal softmax without temperature scaling (b) Adding temperature scaling to the softmax
by first dividing by the temperature parameterτ.
Why does dividing byτincrease the high probability elements and decrease the
low probability elements in the vector over vocabulary items? Whenτis 1, we are
doing normal softmax, and so whenτis close to 1 the distribution doesn’t change
much. But for smallerτ, dividing byτ<1 results in larger scores being passed to
the softmax function.
Recall that one of the useful properties of a softmax is that it tends to push high
values toward 1 and low values toward 0. Thus when larger numbers are passed to
a softmax the result is a distribution with increased probabilities of the most high-
probability tokens and decreased probabilities of the low probability tokens, making
the distribution more greedy. And asτapproaches 0, dividing byτmeans the prob-
ability of the most likely word approaches 1, resulting in greedy decoding.
The intuition for temperature sampling comes from thermodynamics, where a
system at a high temperature is very flexible and can explore many possible states,
while a system at a lower temperature is likely to explore a subset of lower energy
(better) states. In low-temperature sampling, we smoothly increase the probability
of the most probable tokens and decrease the probability of the rare tokens.
Fig. 7.21 shows a schematic example again simplified to have a vocabulary with
only 4 tokens (all,the,your,that), and showing how different temperature values
influence the probabilities computed from the initial logits.τ=1 is the normal
softmax, and we can see how settingτ=0.5 increases the probability of the top
candidate from .44 to .59. Settingτ=0.1 increases the probability of the top candi-
date to .95, getting us close to greedy decoding.
We can also see in Fig. 7.21 some other options for situations where we may want
toflattenthe word probability distribution instead of making it greedy. Temperature
sampling can help with this situation too, in this casehigh-temperaturesampling,
in which case we useτ>1.

---

### Page 208

200CHAPTER7 • TRANSFORMERS ANDPRETRAINING
1.2
0.9
0.1
-0.5
logits
.44
.33
.15
.08
𝜏=1
all
the
your
that
normal softmax
.59
.32
.07
.02
𝜏=0.5
.95
.05
0
0
𝜏=0.1
.27
.26
.24
.23
𝜏=10
.25
.25
.25
.25
𝜏=100
close to greedy
softmax output with temperature 𝜏
close to uniform
low temperature
sampling
(towards greedy)
high temperature
sampling
(towards uniform)
Figure 7.21Temperature sampling: different values ofτchange the resulting probabilities
from the initial logits (simplified example with just 4 tokens in the vocabulary).
7.6.4 Top-k and top-p sampling
Top-k samplingis a simple generalization of greedy decoding. Instead of choosingtop-k sampling
the single most probable word to generate, we first truncate the distribution to the
topkmost likely words, renormalize to produce a legitimate probability distribution,
and then randomly sample from within thesekwords according to their renormalized
probabilities. More formally:
1. Choose in advance a number of wordsk
2. For each word in the vocabularyV, use the language model to compute the
likelihood of this word given the contextp(w t |w<t)
3. Sort the words by their likelihood, and throw away any word that is not one of
the topkmost probable words.
4. Renormalize the scores of thekwords to be a legitimate probability distribu-
tion.
5. Randomly sample a word from within these remainingkmost-probable words
according to its probability.
Whenk=1, top-ksampling is identical to greedy decoding. Settingkto a larger
number than 1 leads us to sometimes select a word which is not necessarily the most
probable, but is still probable enough, and whose choice results in generating more
diverse but still high-enough-quality text.
One problem with top-ksampling is thatkis fixed, but the shape of the probabil-
ity distribution over words differs in different contexts. If we setk=10, sometimes
the top 10 words will be very likely and include most of the probability mass, but
other times the probability distribution will be flatter and the top 10 words will only
include a small part of the probability mass.
An alternative, calledtop-p samplingornucleus sampling(Holtzman et al.,top-p sampling
2020), is to keep not the topkwords, but the topppercent of the probability mass.
The goal is the same; to truncate the distribution to remove the very unlikely words.
But by measuring probability rather than the number of words, the hope is that the
measure will be more robust in very different contexts, dynamically increasing and
decreasing the pool of word candidates.

---

### Page 209

7.7 • PRETRAININGTRANSFORMERLLMS201
Given a distributionP(wt |w<t), we sort the distribution from most probable, and
then the top-pvocabularyV (p) is the smallest set of words such that
X
w∈V(p)
P(w|w<t)≥p.(7.52)
Perhaps surprisingly, it is common to combine both top-kand top-psampling,
using top-kfirst as a kind of a hard filter to eliminate garbage, and then using top-p
to adapt to the model’s confidence level.
7.7 Pretraining Transformer LLMs
In pretraining, as we discussed in Chapter 1, we tokenize a large corpus of text as
training material, usually by augmenting large crawls of the web with other high
quality data. Then at each tokentwe ask the model to predict the next token, and
train the parameters of the model (the embedding, feedforward, attention, and other
weight matrices) via error backpropagation with gradient descent. We call such
a model self-supervised because we don’t have to add any special gold labels to
the data; the natural sequence of words is its own supervision! We simply train the
model to minimize the error in predicting the true next word in the training sequence.
The loss function we minimize and pass back through the network is the cross-
entropy loss function we’ve now seen twice, in Chapter 4 and Chapter 6. Recall that
the cross-entropy loss measures the difference between a predicted probability dis-
tribution and the correct distribution. The probability distribution is over the token
vocabulary, making the loss be:
LCE (ˆyt ,y t ) =−
X
w∈V
yt [w]log ˆyt [w](7.53)
In the case of language modeling, the correct distributionyt comes from knowing the
next word. This is represented as a one-hot vector corresponding to the vocabulary
where the entry for the actual next word is 1, and all the other entries are 0. Thus,
the cross-entropy loss for language modeling is determined by the probability the
model assigns to the correct next token (all other tokens get multiplied by zero by
the first term in Eq. 7.53).
So without loss of generality we can say that at timetthe cross-entropy loss in
Eq. 7.53 can be simplified as the negative log probability the model assigns to the
next word in the training sequence,−logp(w t+1 ), or more formally, usingˆyto mean
the vector of estimated token probabilities from the language model:
LCE (ˆyt ,y t ) =−log ˆyt [wt+1 ](7.54)
Thus at each word positiontof the input, the model takes as input the correct se-
quence of tokensw 1:t, and uses them to compute a probability distribution over
possible next tokens so as to compute the model’s loss for the next tokenwt+1. Then
we move to the next word, we ignore what the model predicted for the next word
and instead use the correct sequence of tokensw1:t+1 to get the model to estimate the
probability of tokenw t+2. This idea that we always give the model the correct his-
tory sequence to predict the next word (rather than feeding the model its best guess
from the previous time step) is calledteacher forcing.teacher forcing

---

### Page 210

202CHAPTER7 • TRANSFORMERS ANDPRETRAINING
Fig. 7.22 illustrates the general training approach. At each step, given all the
preceding tokens, the final transformer layer produces an output distribution over
the entire vocabulary. During training, the probability assigned to the correct word
is used to calculate the cross-entropy loss for each item in the sequence. The loss
for each batch is the average cross-entropy loss over the entire sequence of negative
log probabilities, or more formally:
LCE (batch of length T) = 1T TXt=1 −log ˆyt [wt+1 ](7.55)
The weights in the network are then adjusted to minimize this average cross-entropy
loss over the batch via gradient descent (Fig. 4.5), using error backpropagation on
the computation graph to compute the gradient. Training adjusts all the weights of
the network, including the embedding matrixEthat contains the embeddings for
each word. Thus embeddings will be learned that are most successful at predicting
upcoming words.
long and thanks forTrue next token all
CE Loss
per token
…
So long and thanks for …
…
Input tokens
…−log ylong−log yand−log ythanks−log yfor −log yall
LLM
ŷback
prop
ŷback
prop
ŷback
prop
ŷback
prop
ŷback
prop
Figure 7.22Pretraining an LLM. At each token position, the model passes up ˆy, its proba-
bility estimate over possible next words. The negative log of the model’s probability estimate
for the correct token is used as the loss, which is backpropagated through the model to train
all the weights, including the embeddings. Losses are averaged over all the tokens in a batch.
One of the strengths of the transformer is that training can be done in parallel,
making it practical to pretrain on trillions of tokens. Parallelism is possible because
we know in advance the desired output (w t+1), and the causal mask prevents each
position from attending to its own target, allowing the output for each token to be
computed separately. This means that all N positions in the context window can be
scored at once against their true next tokens, giving N training examples from one
pass through the network.
Large models are generally trained by filling the full context window (of hun-
dreds of thousands of tokens) with text. If documents are shorter than this, multiple
documents are packed into the window with a special end-of-text token between
them. The batch size for gradient descent is usually quite large (the largest GPT-3
model uses a batch size of 3.2 million tokens).
7.7.1 Evaluating Large Language Models: Perplexity
As we first saw in Chapter 3, one way to evaluate language models is to measure
how well they predict unseen text. A better language model is better at predicting

---

### Page 211

7.7 • PRETRAININGTRANSFORMERLLMS203
upcoming words, and so it will be less surprised by (i.e., assign a higher probability
to) each word when it occurs in the test set. So we can compute the probability of a
text by multiplying the conditional probabilities for each token in the text, and use
that as a metric:
likelihood(w1:T ) =
TY
i=1
P(wi|w<i)(7.56)
However, the probability of a test set depends on its length, and gets smaller the
longer it is. (The higherTis, the more probabilities we multiply, and since proba-
bilities are each less than 1 the product will get smaller and smaller). So it’s useful
to have a metric that is per-token, normalized by length, so we can compare across
texts of different lengths.
We have a length-normalized metric already, introduced in Chapter 3:perplex-
ity. Recall that the perplexity of a model on an unseen test set is the inverse proba-perplexity
bility that the model assigns to the test set normalized by the test set length in tokens.
For a test set ofTtokensw 1:T , the perplexity is
Perplexity(w1:T ) =P(w 1:T )− 1T
=
TY
t=1
P(wt |w<t)−1
! 1T
(7.57)
But Eq. 7.57 for perplexity should look familiar from the previous section. It’s
almost the same as the mean cross-entropy loss function that we used to train,
Eq. 7.55. We’ve repeated that equation here, changing the notation a bit to useP
instead of ˆyt:
LCE (batch of length T) = 1T TXt=1 −logP(w t |w<t)(7.58)
In fact, the perplexity of a text is simply the exponent of the mean cross-entropy loss
for the text. We leave showing this as an exercise for the reader. (Note that because
log here means natural log, mean cross-entropy loss is innats(the units of entropynats
when we use ln as opposed to log2).)
Note that because of the inverse in Eq. 7.57 (and the fact that it’s equivalent to
aloss), the higher the probability of the word sequence, the lower the perplexity.
Thusthe lower the perplexity of a model on the data, the better the model.
Minimizing perplexity is equivalent to maximizing the test set probability according
to the language model.
One caveat: because perplexity depends on the number of tokensnin a text, it
is very sensitive to differences in the tokenization algorithm. That means that it’s
hard to exactly compare perplexities produced by two language models if they have
very different tokenizers. For this reason perplexity is best used when comparing
language models that use the same tokenizer.
Perplexity measures one kind of accuracy: accuracy at predicting words. In
Chapter 1 we also introduced MMLU and other datasets for measuring accuracy
at question answering tasks. In future chapters we’ll introduce more task-specific
evaluations for measuring LLM accuracy at other tasks: for machine translation in
Chapter 13, information retrieval in Chapter 11, and speech recognition in Chap-
ter 16.

---

### Page 212

204CHAPTER7 • TRANSFORMERS ANDPRETRAINING
7.8 Current models and some numbers
Current transformer language models use a number of advanced settings. Some of
these we’ve mentioned above, like rotary position embeddings (RoPE), RMSNorm,
and gated feedforward layers with SwiGLU activation (Shazeer, 2020). These are
mainly ways to make models better, more accurate.
Others advances that we haven’t discussed at all focus on efficiency, ways to
make models faster or use less memory. Just to give a flavor of these, here we give
a short introduction to one such advance, theKV cache.
Recall from Fig. 7.11 and in Eq. 7.34 (repeated below) that the attention vector
can be very efficiently computed in parallel fortraining, via two matrix multiplica-
tions:
head=softmax
 QK⊺
√dk

V(7.59)
Unfortunately we can’t do quite the same efficient attention computation inin-
ferenceas in training. That’s because at inference time, we iteratively generate the
next tokens one at a time. For a new token that we have just generated, call itx i,
we need to compute its query, key, and values by multiplying byWQ,W K, andW V
respectively. But it would be a waste of computation time to recompute the key and
value vectors for all thepriortokensx <i; at prior steps we already computed these
key and value vectors!
TheKV cacheis a technique to avoid this waste of time. Instead of recomputingKV cache
these, whenever we compute the key and value vectors we store them in memory in a
cache, and then we can just grab them from the cache when we need them. Fig. 7.23
modifies Fig. 7.11 to show the computation that takes place for a single new token,
showing which values we can take from the KV cache rather than recompute.
q4
k1
k2
k4
Q
KT
QKT
v1
v2
v3
v4
V
q4•k1q4•k2q4•k3q4•k4
x = =x
a4
A
1 x dk
dk x N
1 x N N x dv 1 x dv
k3
Figure 7.23Parts of the attention computation (extracted from Fig. 7.11) showing, in black,
the vectors that can be stored in the cache rather than recomputed when computing the atten-
tion score for the 4th token.
There are many other such efficiency-focused innovations, including Mixture-
of-Experts models, Grouped-Query Attention (GQA), and quantization. We hope to
get to these in a future version of V olume II.
To give a basic idea of the range of architectural parameters, Fig. 7.24 shows
some architectural parameters for a small selection of current and older LLMs. Be-
cause makers of frontier proprietary models like GPT-5, Claude, and Gemini don’t
disclose any of this information, we only list open models. Note that because some
of these models use modern architectures like GQA and SwiGLU (which have dif-
ferentAand don’t exactly setd f f to be 4 timesd), these parameters numbers should
be taken as rough approximations just to get ideas of scale.

---

### Page 213

7.9 • SUMMARY205
Model YearL d A d ff |V|Context Params
GPT-2 XL 2019 48 1600 25 6400 50K 1K 1.5B
GPT-3 2020 96 12288 96 49152 50K 2K 175B
Qwen3-0.6B 2025 28 1024 16 3072 152K 32K 0.6B
Qwen3-32B 2025 64 5120 64 25600 152K 128K 32B
Llama 3.1 8B 2024 32 4096 32 14336 128K 128K 8B
Llama 3.1 405B 2024 126 16384 128 53248 128K 128K 405B
Figure 7.24Configurations of some transformer language models.Lis the number of lay-
ers,dthe model dimension,Athe number of attention heads,d ff the feedforward dimension,
and|V|the vocabulary size.
7.9 Summary
This chapter has introduced the transformer and its components for language mod-
eling, and the pretraining and decoding processes. Here’s a summary of the main
points that we covered:
• Transformers are networks based on the idea ofattention.
• Amulti-head attentioncomputation takes an input vectorx i and maps it to
an outputa i by adding in vectors from prior tokens, weighted by how relevant
they are for the processing of the current word.
• Atransformer blockconsists of aresidual streamin which the input from
the prior layer is passed up to the next layer, with the output of different com-
ponents added to it. These components include amulti-head attention layer
followed by afeedforward layer, each preceded bylayer normalizations.
Transformer blocks are stacked to make deeper and more powerful networks.
• The input to a transformer is computed by adding an embedding (computed
with anembedding matrix) to apositional encodingthat represents the se-
quential position of the token in the window.
• Language models can be built out of stacks of transformer blocks, with a
language model headat the top, which applies anunembeddingmatrix to
the outputHof the top layer to generate thelogits, which are then passed
through a softmax to generate word probabilities.
• Transformer-based language models have a wide context window (hundreds
of thousands to millions of tokens) allowing them to draw on enormous amounts
of context to predict upcoming words.
• The choice of which word to generate in transformer LLMs is done bysam-
plingfrom the distribution of possible next words.
• A common sampling approach istemperaturesampling, which lies in be-
tween two extremes, those ofgreedy decodingin which we always generate
the most probable word, and at the other endrandom sampling, in which we
generate a random word according to its probability.
• Temperature sampling increases the probabilities of the high-probability words,
decreases the probability of the low-probability words, and then samples from
this new distribution.
• Large language models are pretrained via cross-entropy loss to predict words
on datasets of trillions of tokens generally scraped from the web.
• Language model predictive accuracy can be evaluated byperplexity, which
turns out to be the exponent of the cross-entropy loss.

---

### Page 214

206CHAPTER7 • TRANSFORMERS ANDPRETRAINING
Historical Notes
As we discussed in Chapter 3, the earliest language models were the n-gram lan-
guage models developed (roughly simultaneously and independently) by Fred Je-
linek and colleagues at the IBM Thomas J. Watson Research Center, and James
Baker at CMU. It was Jelinek and the IBM team who first coined the termlanguage
modelto mean a model of the way any kind of linguistic property (grammar, se-
mantics, discourse, speaker characteristics), influenced word sequence probabilities
(Jelinek et al., 1975). They contrasted the language model with theacoustic model
which captured acoustic/phonetic characteristics of phone sequences.
N-gram language models were very widely used over the next 40 years, across
a wide variety of NLP tasks like speech recognition and machine translation, often
as one of multiple components of the model. The contexts for these n-gram models
grew longer, with 5-gram models used quite commonly by very efficient LM toolkits
(Stolcke, 2002; Heafield, 2011).
The roots of the neural large language model lie in multiple places. One was
the application in the 1990s, again in Jelinek’s group at IBM Research, ofdiscrim-
inative classifiersto language models. Roni Rosenfeld in his dissertation (Rosen-
feld, 1994) first applied logistic regression (under the namemaximum entropyor
maxentmodels) to language modeling in that IBM lab, and published a more fully
formed version in Rosenfeld (1996). His model integrated various sorts of infor-
mation in a logistic regression predictor, including n-gram information along with
other features from the context, including distant n-grams and pairs of associated
words calledtrigger pairs. Rosenfeld’s model prefigured modern language models
by being a statistical word predictor trained in a self-supervised manner simply by
learning to predict upcoming words in a corpus.
Another was the first use of pretrained embeddings to model word meaning in
the LSA/LSI models (Deerwester et al., 1988). Recall from the history section of
Chapter 5 that in LSA (latent semantic analysis) a term-document matrix was trained
on a corpus and then singular value decomposition was applied and the first 300
dimensions were used as a vector embedding to represent words. It was Landauer
et al. (1997) who first used the word “embedding”. In addition to their development
of the idea of pretraining and of embeddings, the LSA community also developed
ways to combine LSA embeddings with n-grams in an integrated language model
(Bellegarda, 1997; Coccaro and Jurafsky, 1998).
In a very influential series of papers developing the idea ofneural language
models, (Bengio et al. 2000; Bengio et al. 2003; Bengio et al. 2006), Yoshua Ben-
gio and colleagues drew on the central ideas of both these lines of self-supervised
language modeling work (the discriminatively trained word predictor, and the pre-
trained embeddings). Like the maxent models of Rosenfeld, Bengio’s model used
the next word in running text as its supervision signal. Like the LSA models, Ben-
gio’s model learned an embedding, but unlike the LSA models did it as part of the
process of language modeling. The Bengio et al. (2003) model was a neural lan-
guage model: a neural network that learned to predict the next word from prior
words, and did so via learning embeddings as part of the prediction process.
The neural language model was extended in various ways over the years, perhaps
most importantly in the form of the RNN language model of Mikolov et al. (2010)
and Mikolov et al. (2011). The RNN language model was perhaps the first neural
model that was accurate enough to surpass the performance of a traditional 5-gram

---

### Page 215

EXERCISES207
language model.
Soon afterwards, Mikolov et al. (2013a) and Mikolov et al. (2013b) proposed to
simplify the hidden layer of these neural net language models to create pretrained
word2vec word embeddings.
The static embedding models like LSA and word2vec instantiated a particular
model of pretraining: a representation was trained on a pretraining dataset, and then
the representations could be used in further tasks. Dai and Le (2015) and Peters
et al. (2018) reframed this idea by proposing models that were pretrained using a
language model objective, and then the identical model could be either frozen and
directly applied for language modeling or further fine-tuned still using a language
model objective. For example ELMo used a biLSTM self-supervised on a large
pretrained dataset using a language model objective, then fine-tuned on a domain-
specific dataset, and then froze the weights and added task-specific heads. The
ELMo work was particularly influential and its appearance was perhaps the mo-
ment when it became clear to the community that language models could be used as
a general solution for NLP problems.
Transformers were first applied as encoder-decoders (Vaswani et al., 2017) and
then to masked language modeling (Devlin et al., 2019) (as we’ll see in Chapter 13
and Chapter 9). Radford et al. (2019) then showed that the transformer-based au-
toregressive language model GPT-2 could perform zero-shot on many NLP tasks
like summarization and question answering.
The technology used for language models can also be applied to other domains
and tasks, like vision, speech, and genetics. The termfoundation modelis some-foundationmodel
times used as a more general term for this use of large language model technology
across domains and areas, when the elements we are computing over are not nec-
essarily words. Bommasani et al. (2021) is a broad survey that sketches the op-
portunities and risks of foundation models, with special attention to large language
models.
The transformer (Vaswani et al., 2017) was developed drawing on two lines of
prior research:self-attentionandmemory networks.
Encoder-decoder attention, the idea of using a soft weighting over the encodings
of input words to inform a generative decoder (see Chapter 13) was developed by
Graves (2013) in the context of handwriting generation, and Bahdanau et al. (2015)
for MT. This idea was extended to self-attention by dropping the need for separate
encoding and decoding sequences and instead seeing attention as a way of weighting
the tokens in collecting information passed from lower layers to higher layers (Ling
et al., 2015; Cheng et al., 2016; Liu et al., 2016).
Other aspects of the transformer, including the terminology of key, query, and
value, came frommemory networks, a mechanism for adding an external read-
write memory to networks, by using an embedding of a query to match keys rep-
resenting content in an associative memory (Sukhbaatar et al., 2015; Weston et al.,
2015; Graves et al., 2014).
[More transformer history is TBD in the next draft.]
Exercises
7.1A transformer hasLlayers, model dimensiond,Aattention heads withd k =
dv =d/A, and feedforward dimensiond f f=4d.