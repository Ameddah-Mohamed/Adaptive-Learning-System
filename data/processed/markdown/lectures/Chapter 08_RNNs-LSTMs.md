# Chapter 08_RNNs-LSTMs

- **Source File**: `Chapter 08_RNNs-LSTMs.pdf`
- **Total Pages**: 55

---

## Slide / Page 1

Natural Language Processing
Chapter 8
Recurrent Neural Networks (RNNs)
and Long Short Term Memory
Networks (LSTMs)
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

Recurrent Neural Networks (RNNs)

---

## Slide / Page 3

Recurrent Neural Networks
• Language is an inherently temporal phenomenon.
Language is a sequence of events over time.
• This temporal nature is reflected in some language processing
algorithms.
HMM part-of-speech tagging proceeds through the input a word
at a time.
Text classification tasks don’t have this temporal nature. They
assume simultaneous access to all aspects of their input.
• The FF networks also assumed simultaneous access, although
they also had a simple model for time.
FF networks to language modeling look at a fixed-size window of
words, and then sliding this window over the input.
• RNNs and their variants like LSTMs are deep learning
architectures that are an alternative way of representing time.
3

---

## Slide / Page 4

RNNs
• RNNs have a mechanism that deals directly with the
sequential nature of language
• They can handle the temporal nature of language
without the use of arbitrary fixed-sized windows.
• The recurrent network represents the prior context,
in its recurrent connections, allowing the model’s
decision to depend on hundreds of words in the past.
• A recurrent neural network (RNN) is any network
that contains a cycle within its network connections,
– An input value of some unit depends on its own
earlier outputs as an input.
4

---

## Slide / Page 5

Recurrent Neural Networks
• Simple recurrent neural network
• The hidden layer includes a recurrent
connection as part of its input.
– the activation value of the hidden
layer depends on the current input
as well as the activation value of
the hidden layer from the previous
time step.
• The hidden layer from the previous time step provides a form of
memory, or context, that encodes earlier processing, and
decisions can be made at later points in time.
– This approach does not impose a fixed-length limit on this prior
context.
– The context embodied in the previous hidden layer can include
information extending back to the beginning of the sequence.
5

---

## Slide / Page 6

Inference in RNNs
• Forward inference (mapping a sequence of
inputs to a sequence of outputs) in an
RNN is nearly identical to what
we’ve already seen with feedforward
networks.
Simple RNN
illustrated as a FF network
• Once we have the values for the
hidden layer, we proceed with the
usual computation to generate the
output vector.
6

---

## Slide / Page 7

Inference in RNNs
• The matrices U, V and W are shared across time,
while new values for h and y are
calculated with each time step.
7

---

## Slide / Page 8

Inference in RNNs
time
8

---

## Slide / Page 9

time
Training RNNs
• Fortunately, with modern computational
frameworks and adequate computing
resources, there is no need for a specialized
approach to training RNNs.
• Unrolling a recurrent network into a
feedforward computational graph eliminates
any explicit recurrences, allowing the
network weights to be trained directly.
• When presented with a specific input
sequence, we can generate an unrolled FF
network specific to that input, and use
that graph to perform forward inference
or training via ordinary backpropagation.
9

---

## Slide / Page 10

RNNs as Language Models

---

## Slide / Page 11

• Language models predict the next word in a sequence
given some preceding context.
• Language models can assign a conditional probability to
every possible next word.
• They can also assign probabilities to entire sequences
by combining these conditional probabilities with the
chain rule:
RNNs as Language Models
11

---

## Slide / Page 12

RNNs as Language Models
A FF NLM An RNN language model
moving through a text
• The n-gram language models compute the probability of a word given
counts of its occurrence with the n-1 prior words. (Context size is n-1.)
• For the FF LMs, the context size is the window size.
• RNNs thus don’t have the limited context problem, since the hidden
state can represent information about all of the preceding words.
• RNN LMs process the input sequence one word at a time,
attempting to predict the next word from the current word and the
previous hidden state.
12

---

## Slide / Page 13

Forward Inference
• Forward inference is the task, given an input, of running a
forward pass on the network to produce a probability distribution
over possible outputs (next words).
• The input sequence X=[x1,…,xN] consists of a series of words
each represented as a one-hot vector of size |V|1,
• The output prediction, y, is a vector representing a probability
distribution over the vocabulary.
• At each step, the model uses the word embedding matrix E to
retrieve the embedding for the current word, and then combines it
with the hidden layer from the previous step to compute a new
hidden layer.
• This hidden layer is then used to generate an output layer which is
passed through a softmax layer to generate a probability
distribution over the entire vocabulary.
13

---

## Slide / Page 14

• At time t:
• E is embeddings (size: d|V|), xt is one-hot vector (size: |V|1)
for the word wt in the input sequence, et is the embedding (size:
d1) of the word wt.
• ht is the hidden layer output at time t (size: dh1), W is the weight
matrix for the input word (size: dhd), U is the weight matrix for
the context (size: dhdh).
• V is the weight matrix for the output layer (size: |V|dh).
• Vht can be thought of as a set of scores over the vocabulary given
the evidence provided in ht.
• yt : Passing these scores through the softmax normalizes the scores
into a probability distribution over the vocabulary.
Forward Inference
14

---

## Slide / Page 15

• At time t:
• The probability that a particular word k in the vocabulary is
the next word at time t is represented by yt[k], the kth
component of yt :
• The probability of an entire sequence is just the product of the
probabilities of each item in the sequence, where yi[wi] is the
probability of the true word wi at time step i.
Forward Inference
15

---

## Slide / Page 16

Training an RNN LM
• self-supervision: To train an RNN as a language model, we take
a corpus of text as training material and at each time step t ask the
model to predict the next word.
• We train the model to minimize the error in predicting the
true next word in the training sequence, using cross-entropy
as the loss function.
– Recall that the cross-entropy loss measures the difference
between a predicted probability distribution and the correct
distribution.
– The correct distribution yt comes from knowing the next word.
– At time t the CE loss is the negative log probability the model
assigns to the next word in the training sequence.
16

---

## Slide / Page 17

Training an RNN language model
• At each word position t, the model takes the correct sequence of tokens w1:t , and
computes a probability distribution over possible next words to compute the model’s
loss for next token wt+1.
– Then we ignore what the model predicted for the next word and instead use the
correct sequence of tokens w1:t+1 to estimate the probability of token wt+2.
– The idea that the model use the correct history sequence to predict the next word
(rather than feeding the model its best case from the previous time step) is called
teacher forcing.
The weights in the
network are adjusted
to minimize the
average CE loss over
the training
sequence via
gradient descent.
17

---

## Slide / Page 18

RNNs for other NLP tasks

---

## Slide / Page 19

Sequence Labeling
• In sequence labeling, the network’s task is to assign a label chosen from a
small fixed set of labels to each element of a sequence, like part-of-speech
tagging.
• Part-of-speech tagging as sequence labeling with a simple RNN.
– Pre-trained word embeddings serve as inputs and a softmax layer
provides a probability distribution over the part-of-speech tags as output
at each time step.
This RNN represents an
unrolled simple
recurrent network
consisting of an input
layer, hidden layer, and
output layer at each
time step, as well as the
shared U, V and W
weight matrices that
comprise the network.
19

---

## Slide / Page 20

RNNs for Sequence Classification
Text Classification
h1 h2
• RNNs can classify entire sequences rather than the tokens within
them.
– The text to be classified is passed through the RNN a word at a
time generating a new hidden layer at each time step.
– The hidden layer hn for the last token of the text constitutes a
compressed representation of the entire sequence.
– hn is given to a feedforward network that chooses a class
via a softmax function.
Sequence classification using a
simple RNN combined with a
FFN.
20

---

## Slide / Page 21

RNNs for Text Classification
h1 h2
• No need intermediate outputs for the words in the sequence preceding the last
element.
– Therefore, there are no loss terms associated with those elements.
– Instead, the loss function used to train the weights in the network is based
entirely on the final text classification task.
– The output from the softmax output from the feedforward classifier
together with a cross- entropy loss drives the training.
– The error signal from the classification is backpropagated all the way
through the weights in the feedforward classifier through, and then through
to the three sets of weights in the RNN
• Instead of using just last token hn to
represent the whole pooling
sequence, we can use a pooling
function of all hidden states hi.
• A representation that pools all the n hidden
states by taking their element-wise mean:
21

---

## Slide / Page 22

RNNs for Other NLP Tasks
Generation with RNN-Based LMs
• RNN-based language models can also be used to generate text.
– Text generation is of enormous practical importance any task where a system
needs to produce text such as question answering, machine translation, text
summarization.
– Text generation constitutes a new area of AI that is often called generative AI.
– Using a LM to incrementally generate words by repeatedly sampling the
next word conditioned on our previous choices is called autoregressive generation.
22

---

## Slide / Page 23

• Autoregressive generation architecture is applicable to many NLP applications
such as machine translation, summarization, and question answering.
– The key is to prime the generation component with an appropriate context.
– Instead of simply using <s> to get things started, we can provide a richer
task-appropriate context. For translation, the context is the sentence in the
source language; for summarization, it’s the long text we want to summarize.
Generation with RNN-Based LMs
Autoregressive
generation with an
RNN-based NLM
23

---

## Slide / Page 24

Stacked and Bidirectional RNN
architectures

---

## Slide / Page 25

Stacked RNNs
• Recurrent networks are quite flexible.
– The entire sequence of outputs from one RNN as an input sequence to another one.
• Stacked RNNs consist of multiple networks where the output of one layer serves
as the input to a subsequent layer.
Stacked recurrent networks.
• The output of a lower level
serves as the input to higher
levels with the output of the
last network serving as the final
output.
• Stacked RNNs generally
outperform single-layer
networks.
• As the number of stacks is
increased the training costs rise
quickly.
The initial layers of stacked networks can induce representations that serve as useful
abstractions for further layers—representations that might prove difficult to induce
in a single RNN.
25

---

## Slide / Page 26

Bidirectional RNNs
• The RNN uses information from the left context to make its predictions at time t.
• But many NLP applications may require right context in addition to left context.
• A bidirectional RNN combines two independent RNNs, one where the input is
processed from the start to the end, and the other from the end to the start.
– We then concatenate the two representations computed by the networks into a single vector
that captures both the left and right contexts of an input at each point in time.
A bidirectional RNN
• Separate models are trained in
the forward and backward
directions, with the output of
each model at each time point
concatenatedto represent the
bidirectional stateat that time
point.
ℎ𝑡𝑓 = 𝑅𝑁𝑁𝑓𝑜𝑟𝑤𝑎𝑟𝑑(𝑥1, … , 𝑥𝑡)
ℎ𝑡𝑏= 𝑅𝑁𝑁𝑏𝑎𝑐𝑘𝑤𝑎𝑟𝑑(𝑥𝑡, … , 𝑥𝑛)
ℎ𝑡 = [ℎ𝑡𝑓; ℎ𝑡𝑏] # concatenates the outputs of the forward and backward pass;
# Other simple ways to combine them include element-wise addition or multiplication.26

---

## Slide / Page 27

A bidirectional RNN for sequence classification:
• The final hidden units from the forward and backward passes are
combined to represent the entire sequence.
• This combined representation serves as input to the subsequent
classifier.
Bidirectional RNNs
27

---

## Slide / Page 28

LSTM (long short-term memory) Network

---

## Slide / Page 29

LSTM
• Shortcomings of RNNs: distant information
• Distant information is critical to many language applications.
• To train RNNs, it is difficult to make use of information distant from the current point of
processing.
– Alhough RNNs access to the entire preceding sequence, the information encoded in
hidden states tends to be fairly local, more relevant to the most recent parts of the
input.
Example: The flights the airline was canceling were full.
• Assigning a high probability to was following airline is straightforward since airline
provides a strong local context for the singular agreement.
• Assigning an appropriate probability to were is quite difficult because
• the plural flights is quite distant,
• the singular noun airline is closer in the intervening context.
• Ideally, a network should be able to retain the distant information about plural flights
until it is needed, while still processing the intermediate parts of the sequence correctly.
• LSTMs are capable of learning and remembering long-term dependencies between
time steps in a sequence  they are particularly effective for tasks like speech
recognition, language modeling, and time-series forecasting
29

---

## Slide / Page 30

LSTM
Reasons for the inability of RNNs to carry forward critical information
1. The weights in the hidden layer are being asked to perform two tasks
simultaneously:
– provide information useful for the current decision, and
– updating and carrying forward information required for future decisions.
2. Training RNNs needs to backpropagate the error signal back through time.
– The hidden layer at time t contributes to the loss at the next time step since
it takes part in that calculation.
– During the backward pass of training, the hidden layers are
subject to repeated multiplications, as determined by the length of
the sequence.
– A frequent result of this process: the gradients are eventually driven to zero,
a situation called the vanishing gradients problem.
• More complex network architectures are designed to explicitly manage the
task of maintaining relevant context over time,
– by enabling the network to learn to forget information that is no longer
needed and
– to remember information required for decisions still to come.
 LSTM 30

---

## Slide / Page 31

• The long short-term memory (LSTM) networks, extensions of
RNNs, are designed to solve context management problem.
• LSTMs divide the context management problem into two
subproblems:
– removing information no longer needed from the context, and
– adding information likely to be needed for later decision making.
• LSTMs accomplish the context management problem
Adding an explicit context layer to the architecture (in addition to the hidden
layer), and
Using specialized neural units that make use of gates to control the flow of
information into and out of the units that comprise the network layers.
These gates are implemented through the use of additional weights that
operate sequentially on the input, and previous hidden layer, and previous
context layers.
LSTM
31

---

## Slide / Page 32

LSTM
The gates in an LSTM share a common design pattern:
• Each consists of
• a feedforward layer,
• followed by a sigmoid activation function,
• followed by a pointwise multiplication with the layer being
gated.
• The sigmoid activation function is preferred because it pushes its
outputs to 0 or 1.
• A pointwise multiplication of the sigmoid function output and the
layer being gated has an effect similar to that of a binary mask of the
layer.
• Values in the layer being gated that align with values near 1 in the
mask are passed through nearly unchanged; values corresponding to
lower values are essentially erased.
32

---

## Slide / Page 33

LSTM Architecture (see ML course material)
33
Slide from “Fundamentals of Machine Learning for Predictive Data Analytics”, 2nd Edition
John D. Kelleher, Brian Mac Namee, and Aoife D’Arcy, The MIT Press

---

## Slide / Page 34

Slide from “Fundamentals of Machine Learning for Predictive Data Analytics”, 2nd Edition
John D. Kelleher, Brian Mac Namee, and Aoife D’Arcy, The MIT Press
34

---

## Slide / Page 35

Slide from “Fundamentals of Machine Learning for Predictive Data Analytics”, 2nd Edition
John D. Kelleher, Brian Mac Namee, and Aoife D’Arcy, The MIT Press
35

---

## Slide / Page 36

Slide from “Fundamentals of Machine Learning for Predictive Data Analytics”, 2nd Edition
John D. Kelleher, Brian Mac Namee, and Aoife D’Arcy, The MIT Press
36

---

## Slide / Page 37

Slide from “Fundamentals of Machine Learning for Predictive Data Analytics”, 2nd Edition
John D. Kelleher, Brian Mac Namee, and Aoife D’Arcy, The MIT Press
37

---

## Slide / Page 38

Slide from “Fundamentals of Machine Learning for Predictive Data Analytics”, 2nd Edition
John D. Kelleher, Brian Mac Namee, and Aoife D’Arcy, The MIT Press
38

---

## Slide / Page 39

Encoder-Decoder Model with RNNs

---

## Slide / Page 40

Encoder-Decoder Model with RNNs
Four architectures for NLP tasks
In encoder-decoder model we have two
separate RNN models,
• First one maps input sequence to intermediate
representation, called a context; and
• Second one maps from context to output
sequence.
In sequence labeling (POS
tagging) we map each input
token xi to an output token yi.
In sequence classification
we map the entire input
sequence to a single class.
In language modeling we
output next token conditioned
on previous tokens.
40

---

## Slide / Page 41

• The encoder-decoder model (sometimes called sequence-to-
sequence model) takes an input sequence and translates it to an
output sequence that is of a different length than the input.
• Encoder-decoder models: have been applied to a wide range of
applications including summarization, question answering, and
dialogue, but are particularly popular for machine translation
– input and output sequences can have different lengths and
– mapping between a token in the input and a token in the output
can be very indirect.
• Key idea: use of an encoder network that takes an input sequence
and creates a contextualized representation of it, often called the
context.
– This context representation is then passed to a decoder which
generates a task-specific output sequence.
Encoder-Decoder Model with RNNs
41

---

## Slide / Page 42

Encoder-Decoder Model with RNNs
The encoder-decoder architecture
Encoder-decoder networks consist of three conceptual components:
1. An encoder that accepts an input sequence, x1:n, and generates a corresponding
sequence of contextualized representations, h1:n.
• LSTMs and transformers can all be employed as encoders.
2. A context vector c, which is a function of h1:n, and conveys the essence of
the input to the decoder.
3. A decoder, which accepts c as input and generates an arbitrary length
sequence of hidden states h1:m, from which a corresponding sequence of
output states y1:m, can be obtained.
• Just as with encoders, decoders can be realized by any kind of
sequence architecture (RNNs, LSTMs, transformers).
42

---

## Slide / Page 43

• Translating a single sentence in the basic RNN version of encoder-decoder approach
to machine translation.
₋ Source and target sentences are concatenated with a separator token in between, and
₋ The decoder uses context information from the encoder’s last hidden state.
Encoder-Decoder Model with RNNs
43

---

## Slide / Page 44

• A formal version of translating a sentence in the basic RNN-based encoder-decoder
architecture:
𝐧– The final hidden state of the encoder RNN 𝐡 𝐞, serves as the context c for the decoder in
its role as 𝐡𝐝 in the decoder RNN, and𝟎
– The context is also made available to each decoder hidden state.
Encoder-Decoder Model with RNNs
44

---

## Slide / Page 45

𝐧• The purpose of the encoder is to generate a contextualized representation of the input.
• This representation is embodied in the final hidden state of the encoder 𝐡𝐞, also
called c for context, and it is then passed to the decoder.
• The encoder can be a single network layer,
– Stacked architectures (such as stacked biLSTMs) are widely used to represent
encoders.
Encoder-Decoder Model with RNNs
basic RNN-based encoder-decoder architecture
45

---

## Slide / Page 46

• The decoder network takes the context and uses it just to initialize the first hidden state
of the decoder;
– The first decoder RNN cell would use c as its prior hidden state ℎ0𝑑
– The decoder generates a sequence of outputs, an element at a time, until an end-of-
sequence marker is generated.
– Each hidden state is conditioned on the previous hidden state and the output generated in
the previous state.
Encoder-Decoder Model with RNNs
basic RNN-based encoder-decoder architecture
46

---

## Slide / Page 47

• The output vectory at each time step consists of a softmax computation over the
set of possible outputs (the vocabulary).
• The most likely output is computed at each time step by taking the argmax over the
softmax output:
Encoder-Decoder Model with RNNs
Equations for the decoder, with context available at each decoding
timestep.
ŷ
𝑡 = 𝑠𝑜𝑓𝑡𝑚𝑎𝑥(ℎ𝑡𝑑)
47

---

## Slide / Page 48

Training the Encoder-Decoder Model
• Encoder-decoder architectures are trained end-to-end.
• Each training example is a tuple of paired strings, a source and
a target.
• Concatenated with a separator token, these source-target pairs
can now serve as training data.
• For MT, the training data typically consists of sets of sentences
and their translations drawn from standard datasets of aligned
sentence pairs.
• The network is given the source text and then starting with the
separator token is trained autoregressively to predict the next
word.
48

---

## Slide / Page 49

• Training the basic RNN encoder-decoder approach to machine translation.
Note that in the decoder we usually don’t propagate the model’s softmax outputs ŷt , but use teacher
forcing to force each input to the correct gold value for training. (During inference, the decoder uses
its own estimated output ŷt as the input for the next time step xt+1).
– The softmax output distribution is computed over ŷ in the decoder in order to compute the
loss at each token, which can then be averaged to compute a loss for the sentence.
Encoder-Decoder Model with RNNs
basic RNN-based encoder-decoder architecture - Training
49

---

## Slide / Page 50

Encoder-Decoder Model with RNNs –
Attention

---

## Slide / Page 51

• Requiring the context c to be only the encoder’s final hidden
state forces all the information from the entire source sentence to
pass through this representational bottleneck.
• The attention mechanism is a solution to the bottleneck problem,
• The attention mechanism allows the decoder to get information from all
the hidden states of the encoder, not just the last hidden state.
• The context vector c is a single vector that is a function of the hidden
states of the encoder, i.e. 𝑐 = 𝑓(ℎ1𝑒 … ℎ𝑛𝑒 )
Encoder-Decoder Model with RNNs -
Attention
51

---

## Slide / Page 52

• The idea of attention is to create the single fixed-length vector c by taking a
weighted sum of all the encoder hidden states.
• The weights focus on (‘attend to’) a particular part of the source text that is
relevant for the token the decoder is currently producing.
• Attention thus replaces the static context vector with one that is dynamically
derived from the encoder hidden states, different for each token in decoding.
Encoder-Decoder Model with RNNs -
Attention
The attention mechanism allows
each hidden state of the decoder
to see a different, dynamic,
context ci, which is a function of
all the encoder hidden states.
Thus ൯ℎ𝑖𝑑 = 𝑔(ŷ𝑖−1, ℎ𝑖−1𝑑 , 𝑐𝑖
52

---

## Slide / Page 53

First step in computing ci : compute how much to focus on each encoder state, i.e. how
relevant each encoder state is to the decoder state. (Similarity is used.)
– Similarity of jth encoder hidden state 𝒉𝒋𝒆 with (i-1)th decoder hidden state 𝒉𝒊−𝟏𝒅
• Simple score function is dot-product attention implements relevance as similarity:
• To use othese scores, we create a vector of weights αij, that tells us the proportional
relevance of each encoder hidden state j to the prior hidden decoder state, 𝒉𝒊−𝟏𝒅
.
• We can compute a fixed-length context vector for the current decoder state by
taking a weighted average over all the encoder hidden states.
Encoder-Decoder Model with RNNs - Attention
൯𝑠𝑐𝑜𝑟𝑒(ℎ𝑖−1𝑑 , ℎ𝑗𝑒
53

---

## Slide / Page 54

The encoder-decoder network with attention, focusing on the computation of ci:
𝐢– The context value ci is one of the inputs to the computation of 𝐡𝐝
– It is computed by taking the weighted sum of all the encoder hidden states, each weighted
by their dot product with the prior decoder hidden state 𝒉𝒊−𝟏𝒅
Encoder-Decoder Model with RNNs -
Attention
54

---

## Slide / Page 55

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
55
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

