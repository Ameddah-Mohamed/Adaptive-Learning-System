# SLP3 Chapter 08: RNNs and LSTMs

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 309–334

---

### Page 309

EXERCISES301
(2002) collects early readings. See Croft (1990) or Comrie (1989) for introductions
to linguistic typology.
Exercises
13.1Compute by hand the chrF2,2 score for HYP2 on page 294 (the answer should
round to .62).

---

### Page 310

302CHAPTER14 • RNNS ANDLSTMS
CHAPTER
14
RNNs and LSTMs
Time will explain.
Jane Austen,Persuasion
Language is an inherently temporal phenomenon. Spoken language is a sequence of
acoustic events over time, and we comprehend and produce both spoken and written
language as a sequential input stream. The temporal nature of language is reflected
in the metaphors we use; we talk of theflow of conversations,news feeds, andtwitter
streams, all of which emphasize that language is a sequence that unfolds in time.
This chapter introduces a deep learning architecture, therecurrent neural net-
work (RNN), and RNN variants like LSTMs, that offer a different way of represent-
ing time than feedforward and transformer networks. RNNs have a mechanism that
deals directly with the sequential nature of language, allowing them to handle the
temporal nature of language without the use of arbitrary fixed-sized windows. The
recurrent network offers a new way to represent the prior context, in itsrecurrent
connections, allowing the model’s decision to depend on information from hundreds
of words in the past. We’ll see how to apply the model to the task of language mod-
eling, to text classification tasks like sentiment analysis, and to sequence modeling
tasks like part-of-speech tagging.
14.1 Recurrent Neural Networks
A recurrent neural network (RNN) is any network that contains a cycle within its
network connections, meaning that the value of some unit is directly, or indirectly,
dependent on its own earlier outputs as an input. While powerful, such networks
are difficult to reason about and to train. However, within the general class of recur-
rent networks there are constrained architectures that have proven to be extremely
effective when applied to language. In this section, we consider a class of recurrent
networks referred to asElman Networks(Elman, 1990) orsimple recurrent net-ElmanNetworks
works. These networks are useful in their own right and serve as the basis for more
complex approaches like the Long Short-Term Memory (LSTM) networks discussed
later in this chapter. In this chapter when we use the term RNN we’ll be referring to
these simpler more constrained networks (although you will often see the term RNN
to mean any net with recurrent properties including LSTMs).
Fig. 14.1 illustrates the structure of an RNN. As with ordinary feedforward net-
works, an input vector representing the current input,x t, is multiplied by a weight
matrix and then passed through a non-linear activation function to compute the val-
ues for a layer of hidden units. This hidden layer is then used to calculate a cor-
responding output,y t. In a departure from our earlier window-based approach, se-
quences are processed by presenting one item at a time to the network. We’ll use

---

### Page 311

14.1 • RECURRENTNEURALNETWORKS303
xt ht yt
Figure 14.1Simple recurrent neural network after Elman (1990). The hidden layer in-
cludes a recurrent connection as part of its input. That is, the activation value of the hidden
layer depends on the current input as well as the activation value of the hidden layer from the
previous time step.
subscripts to represent time, thusx t will mean the input vectorxat timet. The key
difference from a feedforward network lies in the recurrent link shown in the figure
with the dashed line. This link augments the input to the computation at the hidden
layer with the value of the hidden layerfrom the preceding point in time.
The hidden layer from the previous time step provides a form of memory, or
context, that encodes earlier processing and informs the decisions to be made at
later points in time. Critically, this approach does not impose a fixed-length limit
on this prior context; the context embodied in the previous hidden layer can include
information extending back to the beginning of the sequence.
Adding this temporal dimension makes RNNs appear to be more complex than
non-recurrent architectures. But in reality, they’re not all that different. Given an
input vector and the values for the hidden layer from the previous time step, we’re
still performing the standard feedforward calculation introduced in Chapter 6. To
see this, consider Fig. 14.2 which clarifies the nature of the recurrence and how it
factors into the computation at the hidden layer. The most significant change lies in
the new set of weights,U, that connect the hidden layer from the previous time step
to the current hidden layer. These weights determine how the network makes use of
past context in calculating the output for the current input. As with the other weights
in the network, these connections are trained via backpropagation.
+
U
V
W
yt
xt
ht
ht-1
Figure 14.2Simple recurrent neural network illustrated as a feedforward network. The
hidden layerh t−1 from the prior time step is multiplied by weight matrixUand then added
to the feedforward component from the current time step.
14.1.1 Inference in RNNs
Forward inference (mapping a sequence of inputs to a sequence of outputs) in an
RNN is nearly identical to what we’ve already seen with feedforward networks. To
compute an outputy t for an inputx t, we need the activation value for the hidden
layerh t. To calculate this, we multiply the inputx t with the weight matrixW, and

---

### Page 312

304CHAPTER14 • RNNS ANDLSTMS
the hidden layer from the previous time steph t−1 with the weight matrixU. We
add these values together and pass them through a suitable activation function,g,
to arrive at the activation value for the current hidden layer,h t. Once we have the
values for the hidden layer, we proceed with the usual computation to generate the
output vector.
ht =g(Uh t−1 +Wx t )(14.1)
yt =f(Vh t )(14.2)
Let’s refer to the input, hidden and output layer dimensions asd in,d h, andd out
respectively. Given this, our three parameter matrices are:W∈R dh×din,U∈R dh×dh,
andV∈R dout ×dh.
We computey t via a softmax computation that gives a probability distribution
over the possible output classes.
yt =softmax(Vh t )(14.3)
The fact that the computation at timetrequires the value of the hidden layer from
timet−1 mandates an incremental inference algorithm that proceeds from the start
of the sequence to the end as illustrated in Fig. 14.3. The sequential nature of simple
recurrent networks can also be seen byunrollingthe network in time as is shown in
Fig. 14.4. In this figure, the various layers of units are copied for each time step to
illustrate that they will have differing values over time. However, the various weight
matrices are shared across time.
functionFORWARDRNN(x,network)returnsoutput sequencey
h0 ←0
fori←1toLENGTH(x)do
hi ←g(Uh i−1 +Wx i)
yi ←f(Vh i)
returny
Figure 14.3Forward inference in a simple recurrent network. The matricesU,VandW
are shared across time, while new values forhandyare calculated with each time step.
14.1.2 Training
As with feedforward networks, we’ll use a training set, a loss function, and back-
propagation to obtain the gradients needed to adjust the weights in these recurrent
networks. As shown in Fig. 14.2, we now have 3 sets of weights to update:W, the
weights from the input layer to the hidden layer,U, the weights from the previous
hidden layer to the current hidden layer, and finallyV, the weights from the hidden
layer to the output layer.
Fig. 14.4 highlights two considerations that we didn’t have to worry about with
backpropagation in feedforward networks. First, to compute the loss function for
the output at timetwe need the hidden layer from timet−1. Second, the hidden
layer at timetinfluences both the output at timetand the hidden layer at timet+1
(and hence the output and loss att+1). It follows from this that to assess the error
accruing toh t, we’ll need to know its influence on both the current outputas well as
the ones that follow.

---

### Page 313

14.1 • RECURRENTNEURALNETWORKS305
U
V
W
U
V
W
U
V
W
x1
x2
x3y1
y2
y3
h1
h3
h2
h0
Figure 14.4A simple recurrent neural network shown unrolled in time. Network layers are recalculated for
each time step, while the weightsU,VandWare shared across all time steps.
Tailoring the backpropagation algorithm to this situation leads to a two-pass al-
gorithm for training the weights in RNNs. In the first pass, we perform forward
inference, computingh t,y t, accumulating the loss at each step in time, saving the
value of the hidden layer at each step for use at the next time step. In the second
pass, we process the sequence in reverse, computing the required gradients as we go,
computing and saving the error term for use in the hidden layer for each step back-
ward in time. This general approach is commonly referred to asbackpropagation
through time(Werbos 1974, Rumelhart et al. 1986, Werbos 1990).
backpropaga-
tion through
time Fortunately, with modern computational frameworks and adequate computing
resources, there is no need for a specialized approach to training RNNs. As illus-
trated in Fig. 14.4, explicitly unrolling a recurrent network into a feedforward com-
putational graph eliminates any explicit recurrences, allowing the network weights
to be trained directly. In such an approach, we provide a template that specifies the
basic structure of the network, including all the necessary parameters for the input,
output, and hidden layers, the weight matrices, as well as the activation and output
functions to be used. Then, when presented with a specific input sequence, we can
generate an unrolled feedforward network specific to that input, and use that graph
to perform forward inference or training via ordinary backpropagation.
For applications that involve much longer input sequences, such as speech recog-
nition, character-level processing, or streaming continuous inputs, unrolling an en-
tire input sequence may not be feasible. In these cases, we can unroll the input into
manageable fixed-length segments and treat each segment as a distinct training item.

---

### Page 314

306CHAPTER14 • RNNS ANDLSTMS
14.2 RNNs as Language Models
Let’s see how to apply RNNs to the language modeling task. Recall from Chapter 3
that language models predict the next word in a sequence given some preceding
context. For example, if the preceding context is“Thanks for all the”and we want
to know how likely the next word is“fish”we would compute:
P(fish|Thanks for all the)
Language models give us the ability to assign such a conditional probability to every
possible next word, giving us a distribution over the entire vocabulary. We can also
assign probabilities to entire sequences by combining these conditional probabilities
with the chain rule:
P(w1:n) =
nY
i=1
P(wi|w<i)
The n-gram language models of Chapter 3 compute the probability of a word given
counts of its occurrence with then−1 prior words. The context is thus of sizen−1.
For the feedforward language models of Chapter 6, the context is the window size.
RNN language models (Mikolov et al., 2010) process the input sequence one
word at a time, attempting to predict the next word from the current word and the
previous hidden state. RNNs thus don’t have the limited context problem that n-gram
models have, or the fixed context that feedforward language models have, since the
hidden state can in principle represent information about all of the preceding words
all the way back to the beginning of the sequence. Fig. 14.5 sketches this difference
between a FFN language model and an RNN language model, showing that the
RNN language model usesh t−1, the hidden state from the previous time step, as a
representation of the past context.
V
W
et
htUht-1
et
ht
et-1et-2
U
W
a) b)^yt
et-1
^yt
ht-2
WW
et-2
U
Figure 14.5Simplified sketch of two LM architectures moving through a text, showing a
schematic context of three tokens: (a) a feedforward neural language model which has a fixed
context input to the weight matrixW, (b) an RNN language model, in which the hidden state
ht−1 summarizes the prior context.
14.2.1 Forward Inference in an RNN language model
Forward inference in a recurrent language model proceeds exactly as described in
Section 14.1.1. The input sequenceX= [x 1;...;x t;...;x N]consists of a series of

---

### Page 315

14.2 • RNNS ASLANGUAGEMODELS307
words each represented as a one-hot vector of size|V| ×1, and the output predic-
tion,ˆ y, is a vector representing a probability distribution over the vocabulary. At
each step, the model uses the word embedding matrixEto retrieve the embedding
for the current word, multiples it by the weight matrixW, and then adds it to the hid-
den layer from the previous step (weighted by weight matrixU) to compute a new
hidden layer. This hidden layer is then used to generate an output layer which is
passed through a softmax layer to generate a probability distribution over the entire
vocabulary. That is, at timet:
et =Ex t (14.4)
ht =g(Uh t−1 +Wet )(14.5)
ˆ yt =softmax(Vh t )(14.6)
When we do language modeling with RNNs (and we’ll see this again in Chapter 7
with transformers), it’s convenient to make the assumption that the embedding di-
mensiond e and the hidden dimensiond h are the same. So we’ll just call both of
these themodel dimensiond. So the embedding matrixEis of shape[d× |V|], and
xt is a one-hot vector of shape[|V| ×1]. The productet is thus of shape[d×1].W
andUare of shape[d×d], soh t is also of shape[d×1].Vis of shape[|V| ×d],
so the result ofVhis a vector of shape[|V| ×1]. This vector can be thought of as
a set of scores over the vocabulary given the evidence provided inh. Passing these
scores through the softmax normalizes the scores into a probability distribution. The
probability that a particular wordkin the vocabulary is the next word is represented
byˆ yt [k], thekth component ofˆ yt:
P(wt+1 =k|w 1, . . . ,wt ) =ˆ yt [k](14.7)
The probability of an entire sequence is just the product of the probabilities of each
item in the sequence, where we’ll useˆ yi[wi]to mean the probability of the true word
wi at time stepi.
P(w1:n) =
nY
i=1
P(wi|w1:i−1)(14.8)
=
nY
i=1
ˆ yi[wi](14.9)
14.2.2 Training an RNN language model
To train an RNN as a language model, we use the sameself-supervision(orself-self-supervision
training) algorithm we saw in Section 7.7: we take a corpus of text as training
material and at each time steptask the model to predict the next word. We call
such a model self-supervised because we don’t have to add any special gold labels
to the data; the natural sequence of words is its own supervision! We simply train
the model to minimize the error in predicting the true next word in the training
sequence, using cross-entropy as the loss function. Recall that the cross-entropy
loss measures the difference between a predicted probability distribution and the
correct distribution.
LCE ( ˆyt ,y t ) =−
X
w∈V
yt [w]log ˆyt [w](14.10)

---

### Page 316

308CHAPTER14 • RNNS ANDLSTMS
Input
Embeddings
Softmax over
Vocabulary
So long and thanks for
long and thanks forNext word all
…
Loss
…
…
RNN
h
y
Vh
<latexit sha1_base64="9tru+5ysH1zS9iUXRg/IsnxmpMA=">AAAB/XicbVDLSsNAFL3xWesr6lKQwSK4sSQi1WXRjcsK9gFNCZPpJB06yYSZiRBCcOOvuBFxo+Av+Av+jUnbTVsPDBzOOcO993gxZ0pb1q+xsrq2vrFZ2apu7+zu7ZsHhx0lEklomwguZM/DinIW0bZmmtNeLCkOPU673viu9LtPVComokedxnQQ4iBiPiNYF5Jrnlw4XATIGWGdpbmbOSHWIxlmXERBnldds2bVrQnQMrFnpAYztFzzxxkKkoQ00oRjpfq2FetBhqVmhNO86iSKxpiMcUCzyfY5OiukIfKFLF6k0USdy+FQqTT0imS5nFr0SvE/r59o/2aQsShONI3IdJCfcKQFKqtAQyYp0TwtCCaSFRsiMsISE10UVp5uLx66TDqXdbtRbzxc1Zq3sxIqcAyncA42XEMT7qEFbSDwAm/wCV/Gs/FqvBsf0+iKMftzBHMwvv8ADJKVcA==</latexit>
log ˆylong
<latexit sha1_base64="tuzkS/BeX/Xmg79qpWZlpeYDhtE=">AAAB/HicbVDLSsNAFL3xWesr6lKEwSK4sSQi1WXRjcsK9gFNCZPJpB06mYSZiRBC3PgrbkTcKPgN/oJ/Y9J209YDA4dzznDvPV7MmdKW9WusrK6tb2xWtqrbO7t7++bBYUdFiSS0TSIeyZ6HFeVM0LZmmtNeLCkOPU673viu9LtPVCoWiUedxnQQ4qFgASNYF5Jrnlw4PBoiZ4R1luZu5oRYj2SYYeHnedU1a1bdmgAtE3tGajBDyzV/HD8iSUiFJhwr1betWA8yLDUjnOZVJ1E0xmSMhzSbLJ+js0LyURDJ4gmNJupcDodKpaFXJMvd1KJXiv95/UQHN4OMiTjRVJDpoCDhSEeobAL5TFKieVoQTCQrNkRkhCUmuuirPN1ePHSZdC7rdqPeeLiqNW9nJVTgGE7hHGy4hibcQwvaQOAF3uATvoxn49V4Nz6m0RVj9ucI5mB8/wEiupTp</latexit>
log ˆyand
<latexit sha1_base64="0zdsmbBovZ+hafWZN7Hvufo85tU=">AAAB/3icbVDLSsNAFJ3UV62vqEs3g0VwY0lEqsuiG5cV7AOaEibTSTN0kgkzN0IIWbjxV9yIuFHwD/wF/8ak7aatBwYO55zh3nu8WHANlvVrVNbWNza3qtu1nd29/QPz8KirZaIo61AppOp7RDPBI9YBDoL1Y8VI6AnW8yZ3pd97YkpzGT1CGrNhSMYR9zklUEiuiS8cIcfYCQhkae5mTkggUGEGAYkmOs9rrlm3GtYUeJXYc1JHc7Rd88cZSZqELAIqiNYD24phmBEFnAqW15xEs5jQCRmzbLp/js8KaYR9qYoXAZ6qCzkSap2GXpEs19PLXin+5w0S8G+GGY/iBFhEZ4P8RGCQuCwDj7hiFERaEEIVLzbENCCKUCgqK0+3lw9dJd3Lht1sNB+u6q3beQlVdIJO0Tmy0TVqoXvURh1E0Qt6Q5/oy3g2Xo1342MWrRjzP8doAcb3H7Aall0=</latexit>
log ˆythanks
<latexit sha1_base64="D3c31Jvxp3QWPr2h4tzQWmeenDs=">AAAB/HicbVDLSsNAFL3xWesr6lKEwSK4sSQi1WXRjcsK9gFNCZPppB06yYSZiRBC3PgrbkTcKPgN/oJ/Y9Jm09YDA4dzznDvPV7EmdKW9WusrK6tb2xWtqrbO7t7++bBYUeJWBLaJoIL2fOwopyFtK2Z5rQXSYoDj9OuN7kr/O4TlYqJ8FEnER0EeBQynxGsc8k1Ty4cLkbIGWOdJpmbOgHWYxmkvpBZVnXNmlW3pkDLxC5JDUq0XPPHGQoSBzTUhGOl+rYV6UGKpWaE06zqxIpGmEzwiKbT5TN0lktDlM/LX6jRVJ3L4UCpJPDyZLGbWvQK8T+vH2v/ZpCyMIo1DclskB9zpAUqmkBDJinRPMkJJpLlGyIyxhITnfdVnG4vHrpMOpd1u1FvPFzVmrdlCRU4hlM4BxuuoQn30II2EHiBN/iEL+PZeDXejY9ZdMUo/xzBHIzvP0CJlP0=</latexit>
log ˆyfor
<latexit sha1_base64="PI3y1fb9LhumoVCQRh2+Y84dRkc=">AAAB/HicbVDLSsNAFL3xWesr6lKEwSK4sSQi1WXRjcsK9gFNCZPppB06yYSZiRBC3PgrbkTcKPgN/oJ/Y9Jm09YDA4dzznDvPV7EmdKW9WusrK6tb2xWtqrbO7t7++bBYUeJWBLaJoIL2fOwopyFtK2Z5rQXSYoDj9OuN7kr/O4TlYqJ8FEnER0EeBQynxGsc8k1Ty4cLkbIGWOdJpmbOgHWYxmkmPMsq7pmzapbU6BlYpekBiVarvnjDAWJAxpqwrFSfduK9CDFUjPCaVZ1YkUjTCZ4RNPp8hk6y6Uh8oXMX6jRVJ3L4UCpJPDyZLGbWvQK8T+vH2v/ZpCyMIo1DclskB9zpAUqmkBDJinRPMkJJpLlGyIyxhITnfdVnG4vHrpMOpd1u1FvPFzVmrdlCRU4hlM4BxuuoQn30II2EHiBN/iEL+PZeDXejY9ZdMUo/xzBHIzvPyumlO8=</latexit>
log ˆyall
e
Figure 14.6Training RNNs as language models.
In the case of language modeling, the correct distributionyt comes from knowing the
next word. This is represented as a one-hot vector corresponding to the vocabulary
where the entry for the actual next word is 1, and all the other entries are 0. Thus,
the cross-entropy loss for language modeling is determined by the probability the
model assigns to the correct next word. So at timetthe CE loss is the negative log
probability the model assigns to the next word in the training sequence.
LCE ( ˆyt ,y t ) =−log ˆyt [wt+1 ](14.11)
Thus at each word positiontof the input, the model takes as input the correct wordwt
together withh t−1, encoding information from the precedingw 1:t−1, and uses them
to compute a probability distribution over possible next words so as to compute the
model’s loss for the next tokenw t+1. Then we move to the next word, we ignore
what the model predicted for the next word and instead use the correct wordw t+1
along with the prior history encoded to estimate the probability of tokenw t+2. This
idea that we always give the model the correct history sequence to predict the next
word (rather than feeding the model its best case from the previous time step) is
calledteacher forcing.teacher forcing
The weights in the network are adjusted to minimize the average CE loss over
the training sequence via gradient descent. Fig. 14.6 illustrates this training regimen.
14.2.3 Weight Tying
Careful readers may have noticed that the input embedding matrixEand the final
layer matrixV, which feeds the output softmax, are quite similar.
The columns ofErepresent the word embeddings for each word in the vocab-
ulary learned during the training process with the goal that words that have similar
meaning and function will have similar embeddings. And, since when we use RNNs
for language modeling we make the assumption that the embedding dimension and
the hidden dimension are the same (= the model dimensiond), the embedding ma-
trixEhas shape[d× |V|]. And the final layer matrixVprovides a way to score
the likelihood of each word in the vocabulary given the evidence present in the final
hidden layer of the network through the calculation ofVh.Vis of shape[|V| ×d].
That is, the rows ofVare shaped like a transpose ofE, meaning thatVprovides a

---

### Page 317

14.3 • RNNS FOR OTHERNLPTASKS309
second setof learned word embeddings.
Instead of having two sets of embedding matrices, language models use a single
embedding matrix, which appears at both the input and softmax layers. That is,
we dispense withVand useEat the start of the computation andE ⊺ (because the
shape ofVis the transpose ofEat the end. Using the same matrix (transposed) in
two places is calledweight tying. 1 The weight-tied equations for an RNN languageweight tying
model then become:
et =Ex t (14.12)
ht =g(Uh t−1 +Wet )(14.13)
ˆ yt =softmax(E ⊺ht )(14.14)
In addition to providing improved model perplexity, this approach significantly re-
duces the number of parameters required for the model.
14.3 RNNs for other NLP tasks
Now that we’ve seen the basic RNN architecture, let’s consider how to apply it to
three types of NLP tasks:sequence classificationtasks like sentiment analysis and
topic classification,sequence labelingtasks like part-of-speech tagging, andtext
generationtasks, including with a new architecture called theencoder-decoder.
14.3.1 Sequence Labeling
In sequence labeling, the network’s task is to assign a label chosen from a small
fixed set of labels to each element of a sequence. One classic sequence labeling
tasks is part-of-speech (POS) tagging (assigning grammatical tags likeNOUNand
VERBto each word in a sentence). We’ll discuss part-of-speech tagging in detail
in Chapter 18, but let’s give a motivating example here. In an RNN approach to
sequence labeling, inputs are word embeddings and the outputs are tag probabilities
generated by a softmax layer over the given tagset, as illustrated in Fig. 14.7.
In this figure, the inputs at each time step are pretrained word embeddings cor-
responding to the input tokens. The RNN block is an abstraction that represents
an unrolled simple recurrent network consisting of an input layer, hidden layer, and
output layer at each time step, as well as the sharedU,VandWweight matrices
that comprise the network. The outputs of the network at each time step represent
the distribution over the POS tagset generated by a softmax layer.
To generate a sequence of tags for a given input, we run forward inference over
the input sequence and select the most likely tag from the softmax at each step. Since
we’re using a softmax layer to generate the probability distribution over the output
tagset at each time step, we will again employ the cross-entropy loss during training.
14.3.2 RNNs for Sequence Classification
Another use of RNNs is to classify entire sequences rather than the tokens within
them. This is the set of tasks commonly calledtext classification, like sentiment
analysis or spam detection, in which we classify a text into two or three classes
(like positive or negative), as well as classification tasks with a large number of
1 We also do this for transformers (Chapter 7) where it’s common to callE ⊺ theunembedding matrix.

---

### Page 318

310CHAPTER14 • RNNS ANDLSTMS
Janet will back the bill
NNDTVBMDNNPArgmax
Embeddings
Words
e
h
Vh
y
RNN
Layer(s)
Softmax over
tags
Figure 14.7Part-of-speech tagging as sequence labeling with a simple RNN. The goal of
part-of-speech (POS) tagging is to assign a grammatical label to each word in a sentence,
drawn from a predefined set of tags. (The tags for this sentence include NNP (proper noun),
MD (modal verb) and others; we’ll give a complete description of the task of part-of-speech
tagging in Chapter 18.) Pre-trained word embeddings serve as inputs and a softmax layer
provides a probability distribution over the part-of-speech tags as output at each time step.
categories, like document-level topic classification, or message routing for customer
service applications.
To apply RNNs in this setting, we pass the text to be classified through the RNN
a word at a time generating a new hidden layer representation at each time step.
We can then take the hidden layer for the last token of the text,h n, to constitute a
compressed representation of the entire sequence. We can pass this representation
hn to a feedforward network that chooses a class via a softmax over the possible
classes. Fig. 14.8 illustrates this approach.
x1
RNN
hn
x2 x3 xn
Softmax
FFN
Figure 14.8Sequence classification using a simple RNN combined with a feedforward net-
work. The final hidden state from the RNN is used as the input to a feedforward network that
performs the classification.
Note that in this approach we don’t need intermediate outputs for the words in
the sequence preceding the last element. Therefore, there are no loss terms associ-
ated with those elements. Instead, the loss function used to train the weights in the
network is based entirely on the final text classification task. The output from the
softmax output from the feedforward classifier together with a cross-entropy loss

---

### Page 319

14.3 • RNNS FOR OTHERNLPTASKS311
drives the training. The error signal from the classification is backpropagated all the
way through the weights in the feedforward classifier through, to its input, and then
through to the three sets of weights in the RNN as described earlier in Section 14.1.2.
The training regimen that uses the loss from a downstream application to adjust the
weights all the way through the network is referred to asend-to-end training.end-to-endtraining
Another option, instead of using just the hidden state of the last tokenh n to
represent the whole sequence, is to use some sort ofpoolingfunction of all thepooling
hidden statesh i for each wordiin the sequence. For example, we can create a
representation that pools all thenhidden states by taking their element-wise mean:
hmean = 1n nXi=1 hi (14.15)
Or we can take the element-wise max; the element-wise max of a set ofnvectors is
a new vector whosekth element is the max of thekth elements of all thenvectors.
The long contexts of RNNs makes it quite difficult to successfully backpropagate
error all the way through the entire input; we’ll talk about this problem, and some
standard solutions, in Section 14.5.
14.3.3 Generation with RNN-Based Language Models
RNN-based language models can also be used to generate text, Text generation,
along with image generation and code generation, constitute a new area of AI that is
often calledgenerative AI. Those of you who have already read Chapter 7 will have
already seen this, but we reintroduce it here for those who are reading in a different
order.
Recall back in Chapter 3 we saw how to generate text from an n-gram language
model by adapting asamplingtechnique suggested at about the same time by Claude
Shannon (Shannon, 1951) and the psychologists George Miller and Jennifer Self-
ridge (Miller and Selfridge, 1950). We first randomly sample a word to begin a
sequence based on its suitability as the start of a sequence. We then continue to
sample wordsconditioned on our previous choicesuntil we reach a pre-determined
length, or an end of sequence token is generated.
Today, this approach of using a language model to incrementally generate words
by repeatedly sampling the next word conditioned on our previous choices is called
autoregressive generationorcausal LM generation. The procedure is basicallyautoregressivegeneration
the same as that described on page 79, but adapted to a neural context:
• Sample a word in the output from the softmax distribution that results from
using the beginning of sentence marker,<s>, as the first input.
• Use the word embedding for that first word as the input to the network at the
next time step, and then sample the next word in the same fashion.
• Continue generating until the end of sentence marker,</s>, is sampled or a
fixed length limit is reached.
Technically anautoregressivemodel is a model that predicts a value at timetbased
on a linear function of the previous values at timest−1,t−2, and so on. Although
language models are not linear (since they have many layers of non-linearities), we
loosely refer to this generation technique asautoregressive generationsince the
word generated at each time step is conditioned on the word selected by the network
from the previous step. Fig. 14.9 illustrates this approach. In this figure, the details
of the RNN’s hidden layers and recurrent connections are hidden within the blue
block.

---

### Page 320

312CHAPTER14 • RNNS ANDLSTMS
This simple architecture underlies state-of-the-art approaches to applications
such as machine translation, summarization, and question answering. The key to
these approaches is to prime the generation component with an appropriate context.
That is, instead of simply using<s>to get things started we can provide a richer
task-appropriate context; for translation the context is the sentence in the source
language; for summarization it’s the long text we want to summarize.
So long
<s>
and
So long and
?Sampled Word
Softmax
Embedding
Input Word
RNN
Figure 14.9Autoregressive generation with an RNN-based neural language model.
14.4 Stacked and Bidirectional RNN architectures
Recurrent networks are quite flexible. By combining the feedforward nature of un-
rolled computational graphs with vectors as common inputs and outputs, complex
networks can be treated as modules that can be combined in creative ways. This
section introduces two of the more common network architectures used in language
processing with RNNs.
14.4.1 Stacked RNNs
In our examples thus far, the inputs to our RNNs have consisted of sequences of
word or character embeddings (vectors) and the outputs have been vectors useful for
predicting words, tags or sequence labels. However, nothing prevents us from using
the entire sequence of outputs from one RNN as an input sequence to another one.
Stacked RNNsconsist of multiple networks where the output of one layer serves asStacked RNNs
the input to a subsequent layer, as shown in Fig. 14.10.
Stacked RNNs generally outperform single-layer networks. One reason for this
success seems to be that the network induces representations at differing levels of
abstraction across layers. Just as the early stages of the human visual system detect
edges that are then used for finding larger regions and shapes, the initial layers of
stacked networks can induce representations that serve as useful abstractions for
further layers—representations that might prove difficult to induce in a single RNN.
The optimal number of stacked RNNs is specific to each application and to each
training set. However, as the number of stacks is increased the training costs rise

---

### Page 321

14.4 • STACKED ANDBIDIRECTIONALRNNARCHITECTURES313
y1 y2 y3 yn
x1 x2 x3 xn
RNN 1
RNN 2
RNN 3
Figure 14.10Stacked recurrent networks. The output of a lower level serves as the input
to higher levels with the output of the last network serving as the final output.
quickly.
14.4.2 Bidirectional RNNs
The RNN uses information from the left (prior) context to make its predictions at
timet. But in many applications we have access to the entire input sequence; in
those cases we would like to use words from the context to the right oft. One way
to do this is to run two separate RNNs, one left-to-right, and one right-to-left, and
concatenate their representations.
In the left-to-right RNNs we’ve discussed so far, the hidden state at a given time
trepresents everything the network knows about the sequence up to that point. The
state is a function of the inputsx 1, ...,xt and represents the context of the network to
the left of the current time.
h ft =RNN forward(x1, . . . ,xt )(14.16)
This new notationh ft simply corresponds to the normal hidden state at timet, repre-
senting everything the network has gleaned from the sequence so far.
To take advantage of context to the right of the current input, we can train an
RNN on areversedinput sequence. With this approach, the hidden state at timet
represents information about the sequence to therightof the current input:
hbt =RNN backward(xt , . . .xn)(14.17)
Here, the hidden stateh bt represents all the information we have discerned about the
sequence fromtto the end of the sequence.
Abidirectional RNN(Schuster and Paliwal, 1997) combines two independentbidirectionalRNN
RNNs, one where the input is processed from the start to the end, and the other from
the end to the start. We then concatenate the two representations computed by the
networks into a single vector that captures both the left and right contexts of an input
at each point in time. Here we use either the semicolon ”;” or the equivalent symbol
⊕to mean vector concatenation:
ht = [h ft ;h bt ]
=h ft ⊕h bt (14.18)

---

### Page 322

314CHAPTER14 • RNNS ANDLSTMS
Fig. 14.11 illustrates such a bidirectional network that concatenates the outputs of
the forward and backward pass. Other simple ways to combine the forward and
backward contexts include element-wise addition or multiplication. The output at
each step in time thus captures information to the left and to the right of the current
input. In sequence labeling applications, these concatenated outputs can serve as the
basis for a local labeling decision.
RNN 2
RNN 1
x1
y2y1 y3 yn
concatenated
outputs
x2 x3 xn
Figure 14.11A bidirectional RNN. Separate models are trained in the forward and back-
ward directions, with the output of each model at each time point concatenated to represent
the bidirectional state at that time point.
Bidirectional RNNs have also proven to be quite effective for sequence classi-
fication. Recall from Fig. 14.8 that for sequence classification we used the final
hidden state of the RNN as the input to a subsequent feedforward classifier. A dif-
ficulty with this approach is that the final state naturally reflects more information
about the end of the sentence than its beginning. Bidirectional RNNs provide a sim-
ple solution to this problem; as shown in Fig. 14.12, we simply combine the final
hidden states from the forward and backward passes (for example by concatenation)
and use that as input for follow-on processing.
14.5 The LSTM
In practice, it is quite difficult to train RNNs for tasks that require a network to make
use of information distant from the current point of processing. Despite having ac-
cess to the entire preceding sequence, the information encoded in hidden states tends
to be fairly local, more relevant to the most recent parts of the input sequence and
recent decisions. Yet distant information is critical to many language applications.
Consider the following example in the context of language modeling.
(14.19) The flights the airline was canceling were full.
Assigning a high probability towasfollowingairlineis straightforward sinceairline
provides a strong local context for the singular agreement. However, assigning an
appropriate probability towereis quite difficult, not only because the pluralflights
is quite distant, but also because the singular nounairlineis closer in the intervening

---

### Page 323

14.5 • THELSTM315
RNN 2
RNN 1
x1 x2 x3 xn
hn→
h1←
hn→
Softmax
FFN
h1←
Figure 14.12A bidirectional RNN for sequence classification. The final hidden units from
the forward and backward passes are combined to represent the entire sequence. This com-
bined representation serves as input to the subsequent classifier.
context. Ideally, a network should be able to retain the distant information about
pluralflightsuntil it is needed, while still processing the intermediate parts of the
sequence correctly.
One reason for the inability of RNNs to carry forward critical information is that
the hidden layers, and, by extension, the weights that determine the values in the hid-
den layer, are being asked to perform two tasks simultaneously: provide information
useful for the current decision, and updating and carrying forward information re-
quired for future decisions.
A second difficulty with training RNNs arises from the need to backpropagate
the error signal back through time. Recall from Section 14.1.2 that the hidden layer
at timetcontributes to the loss at the next time step since it takes part in that calcula-
tion. As a result, during the backward pass of training, the hidden layers are subject
to repeated multiplications, as determined by the length of the sequence. A frequent
result of this process is that the gradients are eventually driven to zero, a situation
called thevanishing gradientsproblem.vanishinggradients
To address these issues, more complex network architectures have been designed
to explicitly manage the task of maintaining relevant context over time, by enabling
the network to learn to forget information that is no longer needed and to remember
information required for decisions still to come.
The most commonly used such extension to RNNs is thelong short-term mem-
ory(LSTM) network (Hochreiter and Schmidhuber, 1997). LSTMs divide the con-long short-termmemory
text management problem into two subproblems: removing information no longer
needed from the context, and adding information likely to be needed for later de-
cision making. The key to solving both problems is to learn how to manage this
context rather than hard-coding a strategy into the architecture. LSTMs accomplish
this by first adding an explicit context layer to the architecture (in addition to the
usual recurrent hidden layer), and through the use of specialized neural units that
make use ofgatesto control the flow of information into and out of the units that

---

### Page 324

316CHAPTER14 • RNNS ANDLSTMS
comprise the network layers. These gates are implemented through the use of addi-
tional weights that operate sequentially on the input, and previous hidden layer, and
previous context layers.
The gates in an LSTM share a common design pattern; each consists of a feed-
forward layer, followed by a sigmoid activation function, followed by a pointwise
multiplication with the layer being gated. The choice of the sigmoid as the activation
function arises from its tendency to push its outputs to either 0 or 1. Combining this
with a pointwise multiplication has an effect similar to that of a binary mask. Values
in the layer being gated that align with values near 1 in the mask are passed through
nearly unchanged; values corresponding to lower values are essentially erased.
The first gate we’ll consider is theforget gate. The purpose of this gate isforget gate
to delete information from the context that is no longer needed. The forget gate
computes a weighted sum of the previous state’s hidden layer and the current in-
put and passes that through a sigmoid. This mask is then multiplied element-wise
by the context vector to remove the information from context that is no longer re-
quired. Element-wise multiplication of two vectors (represented by the operator⊙,
and sometimes called theHadamard product) is the vector of the same dimension
as the two input vectors, where each elementiis the product of elementiin the two
input vectors:
ft =σ(U f ht−1 +W f xt )(14.20)
kt =c t−1 ⊙f t (14.21)
The next task is to compute the actual information we need to extract from the previ-
ous hidden state and current inputs—the same basic computation we’ve been using
for all our recurrent networks.
gt =tanh(U ght−1 +W gxt )(14.22)
Next, we generate the mask for theadd gateto select the information to add to theadd gate
current context.
it =σ(U iht−1 +W ixt )(14.23)
jt =g t ⊙i t (14.24)
Next, we add this to the modified context vector to get our new context vector.
ct =j t +k t (14.25)
The final gate we’ll use is theoutput gatewhich is used to decide what informa-output gate
tion is required for the current hidden state (as opposed to what information needs
to be preserved for future decisions).
ot =σ(U oht−1 +W oxt )(14.26)
ht =o t ⊙tanh(c t )(14.27)
Fig. 14.13 illustrates the complete computation for a single LSTM unit. Given the
appropriate weights for the various gates, an LSTM accepts as input the context
layer, and hidden layer from the previous time step, along with the current input
vector. It then generates updated context and hidden vectors as output.
It is the hidden state,h t, that provides the output for the LSTM at each time step.
This output can be used as the input to subsequent layers in a stacked RNN, or at the
final layer of a networkh t can be used to provide the final output of the LSTM.

---

### Page 325

14.5 • THELSTM317
+
xt
ht-1
ct
ht
ct
ht
ct-1
ht-1
xt
tanh
+ σ
tanh
σ
σ
+++
i
g
f
o
㽋㽋
㽋
LSTM
ct-1
Figure 14.13A single LSTM unit displayed as a computation graph. The inputs to each unit consists of the
current input,x, the previous hidden state,h t−1, and the previous context,c t−1. The outputs are a new hidden
state,h t and an updated context,c t.
h
x xt xtht-1
ht ht
ct-1
ct
ht-1
(b)(a) (c)
⌃
g
z
a
⌃
g
z LSTMUnit
a
Figure 14.14Basic neural units used in feedforward, simple recurrent networks (SRN),
and long short-term memory (LSTM).
14.5.1 Gated Units, Layers and Networks
The neural units used in LSTMs are obviously much more complex than those used
in basic feedforward networks. Fortunately, this complexity is encapsulated within
the basic processing units, allowing us to maintain modularity and to easily experi-
ment with different architectures. To see this, consider Fig. 14.14 which illustrates
the inputs and outputs associated with each kind of unit.
At the far left, (a) is the basic feedforward unit where a single set of weights and
a single activation function determine its output, and when arranged in a layer there
are no connections among the units in the layer. Next, (b) represents the unit in a
simple recurrent network. Now there are two inputs and an additional set of weights
to go with it. However, there is still a single activation function and output.
The increased complexity of the LSTM units is encapsulated within the unit
itself. The only additional external complexity for the LSTM over the basic recurrent
unit (b) is the presence of the additional context vector as an input and output.
This modularity is key to the power and widespread applicability of LSTM units.
LSTM units (or other varieties, like GRUs) can be substituted into any of the network
architectures described in Section 14.4. And, as with simple RNNs, multi-layered

---

### Page 326

318CHAPTER14 • RNNS ANDLSTMS
networks making use of gated units can be unrolled into deep feedforward networks
and trained in the usual fashion with backpropagation. In practice, therefore, LSTMs
rather than RNNs have become the standard unit for any modern system that makes
use of recurrent networks.
14.6 Summary: Common RNN NLP Architectures
We’ve now introduced the RNN, seen advanced components like stacking multiple
layers and using the LSTM version, and seen how the RNN can be applied to various
tasks. Let’s take a moment to summarize the architectures for these applications.
Fig. 14.15 shows the three architectures we’ve discussed so far: sequence la-
beling, sequence classification, and language modeling. In sequence labeling (for
example for part of speech tagging), we train a model to produce a label for each
input word or token. In sequence classification, for example for sentiment analysis,
we ignore the output for each token, and only take the value from the end of the
sequence (and similarly the model’s training signal comes from backpropagation
from that last token). In language modeling, we train the model to predict the next
word at each token step. In the next section we’ll introduce a fourth architecture, the
encoder-decoder.
…
Encoder RNN
Decoder RNN
Context
…
x1x2 xn
y1y2 ym
…
RNN
x1 x2 xn
…y1 y2 yn
…
RNN
x1 x2 xn
y
…
RNN
x1 x2 xt-1
…x2 x3 xt
a) sequence labeling b) sequence classification
c) language modeling d) encoder-decoder
Figure 14.15Four architectures for NLP tasks. In sequence labeling (POS or named entity tagging) we map
each input tokenx i to an output tokeny i. In sequence classification we map the entire input sequence to a single
class. In language modeling we output the next token conditioned on previous tokens. In the encoder model we
have two separate RNN models, one of which maps from an input sequencexto an intermediate representation
we call thecontext, and a second of which maps from the context to an output sequencey.

---

### Page 327

14.7 • THEENCODER-DECODERMODEL WITHRNNS319
14.7 The Encoder-Decoder Model with RNNs
In this section we introduce theencoder-decodermodel, which is used when we are
taking an input sequence and translating it to an output sequence that is of a different
length than the input, and doesn’t align with it in a word-to-word way.
Those of you who already read Chapter 13 will have already seen this model in
the transformer architecture, and its application to machine translation, but we intro-
duce this architecture again here for those who come to the concepts in a different
order and are reading about RNNs before transformers.
Recall that in the sequence labeling task, we have two sequences, but they are
the same length (for example in part-of-speech tagging each token gets an associated
tag), each input is associated with a specific output, and the labeling for that output
takes mostly local information. Thus deciding whether a word is a verb or a noun,
we look mostly at the word and the neighboring words.
By contrast, encoder-decoder models are used especially for tasks like machine
translation, where the input sequence and output sequence can have different lengths
and the mapping between a token in the input and a token in the output can be very
indirect (in some languages the verb appears at the beginning of the sentence; in
other languages at the end). We introduced machine translation in Chapter 13, but
for now we’ll just point out that the mapping for a sentence in English to a sentence
in Tagalog or Yoruba can have very different numbers of words, and the words can
be in a very different order.
Encoder-decodernetworks, sometimes calledsequence-to-sequencenetworks,encoder-decoder
are models capable of generating contextually appropriate, arbitrary length, output
sequences given an input sequence. Encoder-decoder networks have been applied
to a very wide range of applications including summarization, question answering,
and dialogue, but they are particularly popular for machine translation.
The key idea underlying these networks is the use of anencodernetwork that
takes an input sequence and creates a contextualized representation of it, often called
thecontext. This representation is then passed to adecoderwhich generates a task-
specific output sequence. Fig. 14.16 illustrates the architecture.
…
Encoder
Decoder
Context
…
x1 x2 xn
y1 y2 ym
Figure 14.16The encoder-decoder architecture. The context is a function of the hidden
representations of the input, and may be used by the decoder in a variety of ways.
Encoder-decoder networks consist of three conceptual components:
1. Anencoderthat accepts an input sequence,x 1:n, and generates a correspond-
ing sequence of contextualized representations,h 1:n. LSTMs, convolutional
networks, and transformers can all be employed as encoders.
2. Acontext vector,c, which is a function ofh 1:n, and conveys the essence of
the input to the decoder.

---

### Page 328

320CHAPTER14 • RNNS ANDLSTMS
3. Adecoder, which acceptscas input and generates an arbitrary length se-
quence of hidden statesh 1:m, from which a corresponding sequence of output
statesy 1:m, can be obtained. Just as with encoders, decoders can be realized
by any kind of sequence architecture.
In this section we’ll describe an encoder-decoder network based on a pair of
RNNs; we already saw encoder-decoders for MT in Chapter 13. We’ll build up the
equations for encoder-decoder models by starting with the conditional RNN lan-
guage modelp(y), the probability of a sequencey.
Recall that in any language model, we can break down the probability as follows:
p(y) =p(y 1)p(y2|y1)p(y3|y1,y 2). . .p(ym|y1, ...,ym−1)(14.28)
In RNN language modeling, at a particular timet, we pass the prefix oft−1
tokens through the language model, using forward inference to produce a sequence
of hidden states, ending with the hidden state corresponding to the last word of
the prefix. We then use the final hidden state of the prefix as our starting point to
generate the next token.
More formally, ifgis an activation function liketanhor ReLU, a function of
the input at timetand the hidden state at timet−1, and the softmax is over the
set of possible vocabulary items, then at timetthe outputy t and hidden stateh t are
computed as:
ht =g(h t−1 ,x t )(14.29)
ˆ yt =softmax(h t )(14.30)
We only have to make one slight change to turn this language model with au-
toregressive generation into an encoder-decoder model that is a translation model
that can translate from asource textin one language to atarget textin a second:
add asentence separationmarker at the end of the source text, and then simplysentenceseparation
concatenate the target text.
Let’s use<s>for our sentence separator token, and let’s think about translating
an English source text (“the green witch arrived”), to a Spanish sentence (“lleg ´o
la bruja verde” (which can be glossed word-by-word as ‘arrived the witch green’).
We could also illustrate encoder-decoder models with a question-answer pair, or a
text-summarization pair.
Let’s usexto refer to the source text (in this case in English) plus the separator
token<s>, andyto refer to the target texty(in this case in Spanish). Then an
encoder-decoder model computes the probabilityp(y|x)as follows:
p(y|x) =p(y 1|x)p(y2|y1,x)p(y 3|y1,y 2,x). . .p(ym|y1, ...,ym−1,x)(14.31)
Fig. 14.17 shows the setup for a simplified version of the encoder-decoder model
(we’ll see the full model, which requires the new concept ofattention, in the next
section).
Fig. 14.17 shows an English source text (“the green witch arrived”), a sentence
separator token (<s>, and a Spanish target text (“lleg ´o la bruja verde”). To trans-
late a source text, we run it through the network performing forward inference to
generate hidden states until we get to the end of the source. Then we begin autore-
gressive generation, asking for a word in the context of the hidden layer from the
end of the source input as well as the end-of-sentence marker. Subsequent words
are conditioned on the previous hidden state and the embedding for the last word
generated.

---

### Page 329

14.7 • THEENCODER-DECODERMODEL WITHRNNS321
Source Text
Target Text
hn
embedding
layer
hidden
layer(s)
softmax
the green
llegó
witch arrived <s> llegó
la
la
bruja
bruja
verde
verde
</s>
(output of source is ignored)
Separator
Figure 14.17Translating a single sentence (inference time) in the basic RNN version of encoder-decoder ap-
proach to machine translation. Source and target sentences are concatenated with a separator token in between,
and the decoder uses context information from the encoder’s last hidden state.
Let’s formalize and generalize this model a bit in Fig. 14.18. (To help keep
things straight, we’ll use the superscriptseanddwhere needed to distinguish the
hidden states of the encoder and the decoder.) The elements of the network on the
left process the input sequencexand comprise theencoder. While our simplified
figure shows only a single network layer for the encoder, stacked architectures are
the norm, where the output states from the top layer of the stack are taken as the
final representation, and the encoder consists of stacked biLSTMs where the hidden
states from top layers from the forward and backward passes are concatenated to
provide the contextualized representations for each time step.
Encoder
Decoder
hn
hd
1
he3he2he1 hd2 hd3 hd4
embedding
layer
hidden
layer(s)
softmax
x1 x2
y1
hd
m
x3 xn <s> y1
y2
y2
y3
y3
y4
ym-1
</s>
hen = c = hd0
(output is ignored during encoding)
… …
Figure 14.18A more formal version of translating a sentence at inference time in the basic RNN-based
encoder-decoder architecture. The final hidden state of the encoder RNN,h en, serves as the context for the
decoder in its role ash d0 in the decoder RNN, and is also made available to each decoder hidden state.
The entire purpose of the encoder is to generate a contextualized representation
of the input. This representation is embodied in the final hidden state of the encoder,
hen. This representation, also calledcforcontext, is then passed to the decoder.
The simplest version of thedecodernetwork would take this state and use it just
to initialize the first hidden state of the decoder; the first decoder RNN cell would

---

### Page 330

322CHAPTER14 • RNNS ANDLSTMS
usecas its prior hidden stateh d0. The decoder would then autoregressively generate
a sequence of outputs, an element at a time, until an end-of-sequence marker is
generated. Each hidden state is conditioned on the previous hidden state and the
output generated in the previous state.
As Fig. 14.18 shows, we do something more complex: we make the context
vectorcavailable to more than just the first decoder hidden state, to ensure that the
influence of the context vector,c, doesn’t wane as the output sequence is generated.
We do this by addingcas a parameter to the computation of the current hidden state.
using the following equation:
hdt =g(ˆyt−1 ,h dt−1 ,c)(14.32)
Now we’re ready to see the full equations for this version of the decoder in the basic
encoder-decoder model, with context available at each decoding timestep. Recall
thatgis a stand-in for some flavor of RNN and ˆyt−1 is the embedding for the output
sampled from the softmax at the previous step:
c=h en
hd0 =c
hdt =g(ˆy t−1 ,h dt−1 ,c)
ˆ yt =softmax(h dt )(14.33)
Thusˆ yt is a vector of probabilities over the vocabulary, representing the probability
of each word occurring at timet. To generate text, we sample from this distribution
ˆ yt. For example, the greedy choice is simply to choose the most probable word to
generate at each timestep. We discussed other sampling methods in Section 7.6.
14.7.1 Training the Encoder-Decoder Model
Encoder-decoder architectures are trained end-to-end. Each training example is a
tuple of paired strings, a source and a target. Concatenated with a separator token,
these source-target pairs can now serve as training data.
For MT, the training data typically consists of sets of sentences and their transla-
tions. These can be drawn from standard datasets of aligned sentence pairs, as we’ll
discuss in Section 13.2.2. Once we have a training set, the training itself proceeds
as with any RNN-based language model. The network is given the source text and
then starting with the separator token is trained autoregressively to predict the next
word, as shown in Fig. 14.19.
Note the differences between training (Fig. 14.19) and inference (Fig. 14.17)
with respect to the outputs at each time step. The decoder during inference uses its
own estimated output ˆyt as the input for the next time stepxt+1. Thus the decoder will
tend to deviate more and more from the gold target sentence as it keeps generating
more tokens. In training, therefore, it is more common to useteacher forcingin theteacher forcing
decoder. Teacher forcing means that we force the system to use the gold target token
from training as the next inputx t+1, rather than allowing it to rely on the (possibly
erroneous) decoder output ˆyt. This speeds up training.

---

### Page 331

14.8 • ATTENTION323
Encoder
Decoder
embedding
layer
hidden
layer(s)
softmax
the green
llegó
witch arrived <s> llegó
la
la
bruja
bruja
verde
verde
</s> goldanswers
L1 =
-log P(y1)
x1 x2 x3 x4
L2 =
-log P(y2)
L3 =
-log P(y3)
L4 =
-log P(y4)
L5 =
-log P(y5) per-wordloss
y1 y2 y3 y4 y5
Total loss is the average
cross-entropy loss per
target word:
Figure 14.19Training the basic RNN encoder-decoder approach to machine translation. Note that in the
decoder we usually don’t propagate the model’s softmax outputs ˆyt, but useteacher forcingto force each input
to the correct gold value for training. We compute the softmax output distribution over ˆyin the decoder in order
to compute the loss at each token, which can then be averaged to compute a loss for the sentence. This loss is
then propagated through the decoder parameters and the encoder parameters.
14.8 Attention
The simplicity of the encoder-decoder model is its clean separation of the encoder—
which builds a representation of the source text—from the decoder, which uses this
context to generate a target text. In the model as we’ve described it so far, this
context vector ish n, the hidden state of the last (n th) time step of the source text.
This final hidden state is thus acting as abottleneck: it must represent absolutely
everything about the meaning of the source text, since the only thing the decoder
knows about the source text is what’s in this context vector (Fig. 14.20). Information
at the beginning of the sentence, especially for long sentences, may not be equally
well represented in the context vector.
Encoder Decoderbottleneckbottleneck
Figure 14.20Requiring the contextcto be only the encoder’s final hidden state forces all
the information from the entire source sentence to pass through this representational bottle-
neck.
Theattention mechanismis a solution to the bottleneck problem, a way ofattentionmechanism
allowing the decoder to get information fromallthe hidden states of the encoder,
not just the last hidden state.
In the attention mechanism, as in the vanilla encoder-decoder model, the context
vectorcis a single vector that is a function of the hidden states of the encoder. But
instead of being taken from the last hidden state, it’s a weighted average ofallthe

---

### Page 332

324CHAPTER14 • RNNS ANDLSTMS
hidden states of the encoder. And this weighted average is also informed by part of
the decoder state as well, the state of the decoder right before the current tokeni.
That is,c i =f(h e1 . . .hen,h di−1). The weights focus on (‘attend to’) a particular part of
the source text that is relevant for the tokenithat the decoder is currently producing.
Attention thus replaces the static context vector with one that is dynamically derived
from the encoder hidden states, but also informed by and hence different for each
token in decoding.
This context vector,c i, is generated anew with each decoding stepiand takes
all of the encoder hidden states into account in its derivation. We then make this
context available during decoding by conditioning the computation of the current
decoder hidden state on it (along with the prior hidden state and the previous output
generated by the decoder), as we see in this equation (and Fig. 14.21):
hdi =g(ˆy i−1,h di−1,c i)(14.34)
hd1 hd2 hdi
y1 y2 yi
c1 c2 ci
… …
Figure 14.21The attention mechanism allows each hidden state of the decoder to see a
different, dynamic, context, which is a function of all the encoder hidden states.
The first step in computingc i is to compute how much to focus on each encoder
state, howrelevanteach encoder state is to the decoder state captured inh di−1. We
capture relevance by computing— at each stateiduring decoding—ascore(h di−1,h ej)
for each encoder statej.
The simplest such score, calleddot-product attention, implements relevance asdot-productattention
similarity: measuring how similar the decoder hidden state is to an encoder hidden
state, by computing the dot product between them:
score(hdi−1,h ej) =h di−1 ·h ej (14.35)
The score that results from this dot product is a scalar that reflects the degree of
similarity between the two vectors. The vector of these scores across all the encoder
hidden states gives us the relevance of each encoder state to the current step of the
decoder.
To make use of these scores, we’ll normalize them with a softmax to create a
vector of weights,α i j, that tells us the proportional relevance of each encoder hidden
statejto the prior hidden decoder state,h di−1.
αi j =softmax(score(h di−1,h ej))
=
exp(score(hdi−1,h ej)P
k exp(score(hdi−1,h ek)) (14.36)
Finally, given the distribution inα, we can compute a fixed-length context vector for
the current decoder state by taking a weighted average over all the encoder hidden
states.
ci =
X
j
αi j hej (14.37)

---

### Page 333

14.9 • SUMMARY325
With this, we finally have a fixed-length context vector that takes into account
information from the entire encoder state that is dynamically updated to reflect the
needs of the decoder at each step of decoding. Fig. 14.22 illustrates an encoder-
decoder network with attention, focusing on the computation of one context vector
ci.
Encoder
Decoder
hdi-1he3he2he1 hdihiddenlayer(s)
x1 x2
yi-1
x3 xn
yi-2 yi-1
yi
hen
ci
.2.1.3.4attentionweights
ci-1
ci
<latexit sha1_base64="TNdNmv/RIlrhPa6LgQyjjQLqyBA=">AAACAnicdVDLSsNAFJ3UV62vqCtxM1gEVyHpI9Vd0Y3LCvYBTQyT6bSddvJgZiKUUNz4K25cKOLWr3Dn3zhpK6jogQuHc+7l3nv8mFEhTfNDyy0tr6yu5dcLG5tb2zv67l5LRAnHpIkjFvGOjwRhNCRNSSUjnZgTFPiMtP3xRea3bwkXNAqv5SQmboAGIe1TjKSSPP3AEUngjVIHsXiIvJSOpnB4Q7zR1NOLpmGaVbtqQdOwLbtk24qY5Yp9VoOWsjIUwQINT393ehFOAhJKzJAQXcuMpZsiLilmZFpwEkFihMdoQLqKhiggwk1nL0zhsVJ6sB9xVaGEM/X7RIoCISaBrzoDJIfit5eJf3ndRPZP3ZSGcSJJiOeL+gmDMoJZHrBHOcGSTRRBmFN1K8RDxBGWKrWCCuHrU/g/aZUMyzbKV5Vi/XwRRx4cgiNwAixQA3VwCRqgCTC4Aw/gCTxr99qj9qK9zltz2mJmH/yA9vYJSymYCA==</latexit>
X
j
↵ijhej
↵ij
<latexit sha1_base64="y8s4mGdpwrGrBnuSR+p1gJJXYdo=">AAAB/nicdVDJSgNBEO2JW4zbqHjy0hgEL4YeJyQBL0EvHiOYBbIMPT09mTY9C909QhgC/ooXD4p49Tu8+Td2FkFFHxQ83quiqp6bcCYVQh9Gbml5ZXUtv17Y2Nza3jF391oyTgWhTRLzWHRcLClnEW0qpjjtJILi0OW07Y4up377jgrJ4uhGjRPaD/EwYj4jWGnJMQ+Cgedk7NSa9IgXq955MKDOrWMWUQnNAFGpYtfsakUTZNtWGUFrYRXBAg3HfO95MUlDGinCsZRdCyWqn2GhGOF0UuilkiaYjPCQdjWNcEhlP5udP4HHWvGgHwtdkYIz9ftEhkMpx6GrO0OsAvnbm4p/ed1U+bV+xqIkVTQi80V+yqGK4TQL6DFBieJjTTARTN8KSYAFJkonVtAhfH0K/yets5JVKdnX5WL9YhFHHhyCI3ACLFAFdXAFGqAJCMjAA3gCz8a98Wi8GK/z1pyxmNkHP2C8fQICDpWK</latexit>
hdi1·hej
……
…
Figure 14.22A sketch of the encoder-decoder network with attention, focusing on the computation ofc i.
The context valuec i is one of the inputs to the computation ofh di . It is computed by taking the weighted sum
of all the encoder hidden states, each weighted by their dot product with the prior decoder hidden stateh di−1.
It’s also possible to create more sophisticated scoring functions for attention
models. Instead of simple dot product attention, we can get a more powerful function
that computes the relevance of each encoder hidden state to the decoder hidden state
by parameterizing the score with its own set of weights,W s.
score(hdi−1,h ej) =h di−1Wshej (14.38)
The weightsW s, which are then trained during normal end-to-end training, give the
network the ability to learn which aspects of similarity between the decoder and
encoder states are important to the current application. This bilinear model also
allows the encoder and decoder to use different dimensional vectors, whereas the
simple dot-product attention requires that the encoder and decoder hidden states
have the same dimensionality.
14.9 Summary
This chapter has introduced the concepts of recurrent neural networks and how they
can be applied to language problems. Here’s a summary of the main points that we
covered:
• In simple Recurrent Neural Networks sequences are processed one element at
a time, with the output of each neural unit at timetbased both on the current
input attand the hidden layer from timet−1.
• RNNs can be trained with a straightforward extension of the backpropagation
algorithm, known asbackpropagation through time(BPTT).

---

### Page 334

326CHAPTER14 • RNNS ANDLSTMS
• Simple recurrent networks fail on long inputs because of problems likevan-
ishing gradients; instead modern systems use more complex gated architec-
tures such asLSTMsthat explicitly decide what to remember and forget in
their hidden and context layers.
• Common language-based applications for RNNs include:
–Probabilistic language modeling: assigning a probability to a sequence,
or to the next element of a sequence given the preceding words.
–Auto-regressive generation using a trained language model.
–Sequence labeling like part-of-speech tagging, where each element of a
sequence is assigned a label.
–Sequence classification, where an entire text is assigned to a category, as
in spam detection, sentiment analysis or topic classification.
–Encoder-decoder architectures, where an input is mapped to an output
of different length and alignment.
Historical Notes
Influential investigations of RNNs were conducted in the context of the Parallel Dis-
tributed Processing (PDP) group at UC San Diego in the 1980’s. Much of this work
was directed at human cognitive modeling rather than practical NLP applications
(Rumelhart and McClelland 1986c, McClelland and Rumelhart 1986). Models using
recurrence at the hidden layer in a feedforward network (Elman networks) were in-
troduced by Elman (1990). Similar architectures were investigated by Jordan (1986)
with a recurrence from the output layer, and Mathis and Mozer (1995) with the
addition of a recurrent context layer prior to the hidden layer. The possibility of
unrolling a recurrent network into an equivalent feedforward network is discussed
in (Rumelhart and McClelland, 1986c).
In parallel with work in cognitive modeling, RNNs were investigated extensively
in the continuous domain in the signal processing and speech communities (Giles
et al. 1994, Robinson et al. 1996). Schuster and Paliwal (1997) introduced bidirec-
tional RNNs and described results on the TIMIT phoneme transcription task.
While theoretically interesting, the difficulty with training RNNs and manag-
ing context over long sequences impeded progress on practical applications. This
situation changed with the introduction of LSTMs in Hochreiter and Schmidhuber
(1997) and Gers et al. (2000). Impressive performance gains were demonstrated
on tasks at the boundary of signal processing and language processing including
phoneme recognition (Graves and Schmidhuber, 2005), handwriting recognition
(Graves et al., 2007) and most significantly speech recognition (Graves et al., 2013).
Interest in applying neural networks to practical NLP problems surged with the
work of Collobert and Weston (2008) and Collobert et al. (2011). These efforts made
use of learned word embeddings, convolutional networks, and end-to-end training.
They demonstrated near state-of-the-art performance on a number of standard shared
tasks including part-of-speech tagging, chunking, named entity recognition and se-
mantic role labeling without the use of hand-engineered features.
Approaches that married LSTMs with pretrained collections of word-embeddings
based on word2vec (Mikolov et al., 2013a) and GloVe (Pennington et al., 2014)
quickly came to dominate many common tasks: part-of-speech tagging (Ling et al.,