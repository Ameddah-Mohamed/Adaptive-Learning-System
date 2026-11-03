# SLP3 Chapter 07: Neural Networks and Neural Language Models

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 158–183

---

### Page 158

150CHAPTER5 • EMBEDDINGS
as a model of meaning for NLP was proposed soon after LSA by Sch ¨utze (1992b).
Sch¨utze applied the low-rank (97-dimensional) embeddings produced by SVD to the
task of word sense disambiguation, analyzed the resulting semantic space, and also
suggested possible techniques like dropping high-order dimensions. See Sch ¨utze
(1997).
A number of alternative matrix models followed on from the early SVD work,
including Probabilistic Latent Semantic Indexing (PLSI) (Hofmann, 1999), Latent
Dirichlet Allocation (LDA) (Blei et al., 2003), and Non-negative Matrix Factoriza-
tion (NMF) (Lee and Seung, 1999).
The LSA community seems to have first used the word “embedding” in Landauer
et al. (1997), in a variant of its mathematical meaning as a mapping from one space
or mathematical structure to another. In LSA, the word embedding seems to have
described the mapping from the space of sparse count vectors to the latent space of
SVD dense vectors. Although the word thus originally meant the mapping from one
space to another, it has metonymically shifted to mean the resulting dense vector in
the latent space, and it is in this sense that we currently use the word.
By the next decade, Bengio et al. (2003) and Bengio et al. (2006) showed that
neural language models could also be used to develop embeddings as part of the task
of word prediction. Collobert and Weston (2007), Collobert and Weston (2008), and
Collobert et al. (2011) then demonstrated that embeddings could be used to represent
word meanings for a number of NLP tasks. Turian et al. (2010) compared the value
of different kinds of embeddings for different NLP tasks. Mikolov et al. (2011)
showed that recurrent neural nets could be used as language models. The idea of
simplifying the hidden layer of these neural net language models to create the skip-
gram (and also CBOW) algorithms was proposed by Mikolov et al. (2013a). The
negative sampling training algorithm was proposed in Mikolov et al. (2013b). There
are numerous surveys of static embeddings and their parameterizations (Bullinaria
and Levy 2007, Bullinaria and Levy 2012, Lapesa and Evert 2014, Kiela and Clark
2014, Levy et al. 2015).
See Manning et al. (2008) and Chapter 11 for a deeper understanding of the role
of vectors in information retrieval, including how to compare queries with docu-
ments, more details on tf-idf, and issues of scaling to very large datasets. See Kim
(2019) for a clear and comprehensive tutorial on word2vec. Cruse (2004) is a useful
introductory linguistic text on lexical semantics.
Exercises
5.1Using the co-occurrence counts in Fig. 5.2, compute cos(cherry, strawberry)
and cos(cherry, digital) using only thepieandresultdimensions. Which pair
is more similar, and does the result match your intuition about the words’
meanings?
5.2Show that cosine similarity is invariant to scaling: for any positive constantc,
cos(cv,w) =cos(v,w). Why is this a desirable property for a word-similarity
metric, given the discussion of frequency and vector length in Section 5.4?
5.3Derive the SGNS gradients in Eq. 5.22-Eq. 5.24 by differentiating the loss in
Eq. 5.21 with respect toc pos,c neg, andw. You may use the fact that dσ(z)dz =
σ(z)(1−σ(z))and that d(cw)dw =c.

---

### Page 159

CHAPTER
6
Neural Networks
“[M]achines of this character can behave in a very complicated manner when
the number of units is large.”
Alan Turing (1948) “Intelligent Machines”, page 6
Neural networks are a fundamental computational tool for language process-
ing, and a very old one. They are called neural because their origins lie in the
McCulloch-Pitts neuron(McCulloch and Pitts, 1943), a simplified model of the
biological neuron as a kind of computing element that could be described in terms
of propositional logic. But the modern use in language processing no longer draws
on these early biological inspirations.
Instead, a modern neural network is a network of small computing units, each
of which takes a vector of input values and produces a single output value. In this
chapter we introduce the neural net applied to classification. The architecture we
introduce is called afeedforward networkbecause the computation proceeds iter-feedforward
atively from one layer of units to the next. The use of modern neural nets is often
calleddeep learning, because modern networks are oftendeep(have many layers).deep learning
Neural networks share much of the same mathematics as logistic regression. But
neural networks are a more powerful classifier than logistic regression, and indeed a
minimal neural network (technically one with a single ‘hidden layer’) can be shown
to learn any function.
Neural net classifiers are different from logistic regression in another way. With
logistic regression, we applied the regression classifier to many different tasks by
developing many rich kinds of feature templates based on domain knowledge. When
working with neural networks, it is more common to avoid most uses of rich hand-
derived features, instead building neural networks that take raw tokens as inputs
and learn to induce features as part of the process of learning to classify. We saw
examples of this kind of representation learning for embeddings in Chapter 5, and
we’ll see lots of examples once we start studying deep transformer networks. Nets
that are very deep are particularly good at representation learning. For that reason
deep neural nets are the right tool for tasks that offer sufficient data to learn features
automatically.
In this chapter we’ll introduce feedforward networks as classifiers, first with
hand-built features, and then using the embeddings that we studied in Chapter 5.
In subsequent chapters we’ll introduce many other kinds of neural models, most
importantly thetransformerandattention(Chapter 7), but alsorecurrent neural
networks(Chapter 14) andconvolutional neural networks(Chapter 16). And in
the next chapter we’ll introduce the paradigm of neural large language models.

---

### Page 160

152CHAPTER6 • NEURALNETWORKS
6.1 Units
The building block of a neural network is a single computational unit. A unit takes
a set of real valued numbers as input, performs some computation on them, and
produces an output.
At its heart, a neural unit is taking a weighted sum of its inputs, with one addi-
tional term in the sum called abias term. Given a set of inputsx 1...xn, a unit hasbias term
a set of corresponding weightsw 1...wn and a biasb, so the weighted sumzcan be
represented as:
z=b+
X
i
wixi (6.1)
Often it’s more convenient to express this weighted sum using vector notation; recall
from linear algebra that avectoris, at heart, just a list or array of numbers. Thusvector
we’ll talk aboutzin terms of a weight vectorw, a scalar biasb, and an input vector
x, and we’ll replace the sum with the convenientdot product:
z=w·x+b(6.2)
As defined in Eq. 6.2,zis just a real valued number.
Finally, instead of usingz, a linear function ofx, as the output, neural units
apply a non-linear functionftoz. We will refer to the output of this function as
theactivationvalue for the unit,a. Since we are just modeling a single unit, theactivation
activation for the node is in fact the final output of the network, which we’ll generally
cally. So the valueyis defined as:
y=a=f(z)
We’ll discuss three popular non-linear functionsfbelow (the sigmoid, the tanh, and
the rectified linear unit or ReLU) but it’s pedagogically convenient to start with the
sigmoidfunction since we saw it in Chapter 4:sigmoid
y=σ(z) = 11+e −z (6.3)
The sigmoid (shown in Fig. 6.1) has a number of advantages; it maps the output
into the range(0,1), which is useful in squashing outliers toward 0 or 1. And it’s
differentiable, which as we saw in Section 4.15 will be handy for learning.
Figure 6.1The sigmoid function takes a real value and maps it to the range(0,1). It is
nearly linear around 0 but outlier values get squashed toward 0 or 1.
Substituting Eq. 6.2 into Eq. 6.3 gives us the output of a neural unit:

---

### Page 161

6.1 • UNITS153
y=σ(w·x+b) = 11+exp(−(w·x+b)) (6.4)
Fig. 6.2 shows a final schematic of a basic neural unit. In this example the unit
takes 3 input valuesx 1,x 2, andx 3, and computes a weighted sum, multiplying each
value by a weight (w1,w 2, andw 3, respectively), adds them to a bias termb, and then
passes the resulting sum through a sigmoid function to result in a number between 0
and 1.
x1
x2
x3
y
w1
w2
w3
∑
b
σ
+1
z a
Figure 6.2A neural unit, taking 3 inputsx 1,x 2, andx 3 (and a biasbthat we represent as a
weight for an input clamped at +1) and producing an output y. We include some convenient
intermediate variables: the output of the summation,z, and the output of the sigmoid,a. In
this case the output of the unityis the same asa, but in deeper networks we’ll reserveyto
mean the final output of the entire network, leavingaas the activation of an individual node.
Let’s walk through an example just to get an intuition. Let’s suppose we have a
unit with the following weight vector and bias:
w= [0.2,0.3,0.9]
b=0.5
What would this unit do with the following input vector:
x= [0.5,0.6,0.1]
The resulting outputywould be:
y=σ(w·x+b) = 11+e −(w·x+b) = 11+e −(.5∗.2+.6∗.3+.1∗.9+.5) = 11+e −0.87 =.70
In practice, the sigmoid is not commonly used as an activation function. A function
that is very similar but almost always better is thetanhfunction shown in Fig. 6.3a;tanh
tanh is a variant of the sigmoid that ranges from -1 to +1:
y=tanh(z) = ez −e −z
ez +e −z (6.5)
The simplest activation function, and perhaps the most commonly used, is the rec-
tified linear unit, also called theReLU, shown in Fig. 6.3b. It’s just the same aszReLU
whenzis positive, and 0 otherwise:
y=ReLU(z)=max(z,0)(6.6)
These activation functions have different properties that make them useful for differ-

---

### Page 162

154CHAPTER6 • NEURALNETWORKS
(a) (b)
Figure 6.3The tanh and ReLU activation functions.
ent language applications or network architectures. For example, the tanh function
has the nice properties of being smoothly differentiable and mapping outlier values
toward the mean. The rectifier function, on the other hand, has nice properties that
result from it being very close to linear. In the sigmoid or tanh functions, very high
values ofzresult in values ofythat aresaturated, i.e., extremely close to 1, and havesaturated
derivatives very close to 0. Zero derivatives cause problems for learning, because as
we’ll see in Section 6.6, we’ll train networks by propagating an error signal back-
wards, multiplying gradients (partial derivatives) from each layer of the network;
gradients that are almost 0 cause the error signal to get smaller and smaller until it is
too small to be used for training, a problem called thevanishing gradientproblem.vanishinggradient
Rectifiers don’t have this problem, since the derivative of ReLU for high values ofz
is 1 rather than very close to 0.
6.2 The XOR problem
Early in the history of neural networks it was realized that the power of neural net-
works, as with the real neurons that inspired them, comes from combining these
units into larger networks.
One of the most clever demonstrations of the need for multi-layer networks was
the proof by Minsky and Papert (1969) that a single neural unit cannot compute
some very simple functions of its input. Consider the task of computing elementary
logical functions of two inputs, like AND, OR, and XOR. As a reminder, here are
the truth tables for those functions:
AND OR XOR
x1 x2 y x1 x2 y x1 x2 y
0 0 0 0 0 0 0 0 0
0 1 0 0 1 1 0 1 1
1 0 0 1 0 1 1 0 1
1 1 1 1 1 1 1 1 0
This example was first shown for theperceptron, which is a very simple neuralperceptron
unit that has a binary output and has a very simple step function as its non-linear
activation function. The outputyof a perceptron is 0 or 1, and is computed as
follows (using the same weightw, inputx, and biasbas in Eq. 6.2):

---

### Page 163

6.2 • THEXORPROBLEM155
y=
 0,ifw·x+b≤0
1,ifw·x+b>0 (6.7)
It’s very easy to build a perceptron that can compute the logical AND and OR
functions of its binary inputs; Fig. 6.4 shows the necessary weights.
x1
x2
+1
-1
1
1
x1
x2
+1
0
1
1
(a) (b)
Figure 6.4The weightswand biasbfor perceptrons for computing logical functions. The
inputs are shown asx1 andx 2 and the bias as a special node with value+1 which is multiplied
with the bias weightb. (a) logical AND, with weightsw 1 =1 andw 2 =1 and bias weight
b=−1. (b) logical OR, with weightsw 1 =1 andw 2 =1 and bias weightb=0. These
weights/biases are just one from an infinite number of possible sets of weights and biases that
would implement the functions.
It turns out, however, that it’s not possible to build a perceptron to compute
logical XOR! (It’s worth spending a moment to give it a try!)
The intuition behind this important result relies on understanding that a percep-
tron is a linear classifier. For a two-dimensional inputx 1 andx 2, the perceptron
equation,w 1x1 +w 2x2 +b=0 is the equation of a line. (We can see this by putting
it in the standard linear format:x 2 = (−w1/w2)x1 + (−b/w2).) This line acts as a
decision boundaryin two-dimensional space in which the output 0 is assigned to alldecisionboundary
inputs lying on one side of the line, and the output 1 to all input points lying on the
other side of the line. If we had more than 2 inputs, the decision boundary becomes
a hyperplane instead of a line, but the idea is the same, separating the space into two
categories.
Fig. 6.5 shows the possible logical inputs (00,01,10, and11) and the line drawn
by one possible set of parameters for an AND and an OR classifier. Notice that there
is simply no way to draw a line that separates the positive cases of XOR (01 and 10)
from the negative cases (00 and 11). We say that XOR is not alinearly separablelinearlyseparable
function. Of course we could draw a boundary with a curve, or some other function,
but not a single line.
6.2.1 The solution: neural networks
While the XOR function cannot be calculated by a single perceptron, it can be cal-
culated by a layered network of perceptron units. Rather than see this with networks
of simple perceptrons, however, let’s see how to compute XOR using two layers of
ReLU-based units following Goodfellow et al. (2016). Fig. 6.6 shows a figure with
the input being processed by two layers of neural units. The middle layer (called
h) has two units, and the output layer (calledy) has one unit. A set of weights and
biases are shown that allows the network to correctly compute the XOR function.
Let’s walk through what happens with the inputx= [0, 0]. If we multiply each
input value by the appropriate weight, sum, and then add the biasb, we get the vector
[0, -1], and we then apply the rectified linear transformation to give the output of the
hlayer as [0, 0]. Now we once again multiply by the weights, sum, and add the

---

### Page 164

156CHAPTER6 • NEURALNETWORKS
0
0 1
1
x1
x2
0
0 1
1
x1
x2
0
0 1
1
x1
x2
a)  x1 AND x2 b)  x1 OR x2 c)  x1 XOR x2
?
Figure 6.5The functions AND, OR, and XOR, represented with inputx 1 on the x-axis and inputx 2 on the
y-axis. Filled circles represent perceptron outputs of 1, and white circles perceptron outputs of 0. There is no
way to draw a line that correctly separates the two categories for XOR. Figure styled after Russell and Norvig
(2002).
x1
x2
h1
h2
y1
+1
1
-1
1
1
1
-2
0
1
+1
0
Figure 6.6XOR solution after Goodfellow et al. (2016). There are three ReLU units, in
two layers; we’ve called themh 1,h 2 (hfor “hidden layer”) andy 1. As before, the numbers
on the arrows represent the weightswfor each unit, and we represent the biasbas a weight
on a unit clamped to +1, with the bias weights/units in gray.
bias (0 in this case) resulting in the value 0. The reader should work through the
computation of the remaining 3 possible input pairs to see that the resultingyvalues
are 1 for the inputs [0, 1] and [1, 0] and 0 for [0, 0] and [1, 1].
It’s also instructive to look at the intermediate results, the outputs of the two
hidden nodesh 1 andh 2. We showed in the previous paragraph that thehvector for
the inputsx= [0, 0] was [0, 0]. Fig. 6.7b shows the values of thehlayer for all
4 inputs. Notice that hidden representations of the two input pointsx= [0, 1] and
x= [1, 0] (the two cases with XOR output = 1) are merged to the single pointh=
[1, 0]. The merger makes it easy to linearly separate the positive and negative cases
of XOR. In other words, we can view the hidden layer of the network as forming a
representation of the input.
In this example we just stipulated the weights in Fig. 6.6. But for real examples
the weights for neural networks are learned automatically using the error backprop-
agation algorithm to be introduced in Section 6.6. That means the hidden layers will
learn to form useful representations. This intuition, that neural networks can auto-
matically learn useful representations of the input, is one of their key advantages,
and one that we will return to again and again in later chapters.

---

### Page 165

6.3 • FEEDFORWARDNEURALNETWORKS157
0
0 1
1
x1
x2
a) The original x space
0
0 1
1
h1
h2
2
b) The new (linearly separable) h space
Figure 6.7The hidden layer forming a new representation of the input. (b) shows the
representation of the hidden layer,h, compared to the original input representationxin (a).
Notice that the input point [0, 1] has been collapsed with the input point [1, 0], making it
possible to linearly separate the positive and negative cases of XOR. After Goodfellow et al.
(2016).
6.3 Feedforward Neural Networks
Let’s now walk through a slightly more formal presentation of the simplest kind of
neural network, thefeedforward network. A feedforward network is a multilayerfeedforwardnetwork
network in which the units are connected with no cycles; the outputs from units in
each layer are passed to units in the next higher layer, and no outputs are passed
back to lower layers. (In Chapter 14 we’ll introduce networks with cycles, called
recurrent neural networks.)
For historical reasons multilayer networks, especially feedforward networks, are
sometimes calledmulti-layer perceptrons(orMLPs); this is a technical misnomer,multi-layerperceptrons
MLP since the units in modern multilayer networks aren’t perceptrons (perceptrons have a
simple step-function as their activation function, but modern networks are made up
of units with many kinds of non-linearities like ReLUs and sigmoids), but at some
point the name stuck.
Simple feedforward networks have three kinds of nodes: input units, hidden
units, and output units.
Fig. 6.8 shows a picture. The input layerxis a vector of simple scalar values just
as we saw in Fig. 6.2.
The core of the neural network is thehidden layerhformed ofhidden unitsh i,hidden layer
each of which is a neural unit as described in Section 6.1, taking a weighted sum of
its inputs and then applying a non-linearity. In the standard architecture, each layer
isfully-connected, meaning that each unit in each layer takes as input the outputsfully-connected
from all the units in the previous layer, and there is a link between every pair of units
from two adjacent layers. Thus each hidden unit sums over all the input units.
Recall that a single hidden unit has as parameters a weight vector and a bias. We
represent the parameters for the entire hidden layer by combining the weight vector
and bias for each unitiinto a single weight matrixWand a single bias vectorbfor
the whole layer (see Fig. 6.8). Each elementW ji of the weight matrixWrepresents
the weight of the connection from theith input unitx i to thejth hidden unith j.
The advantage of using a single matrixWfor the weights of the entire layer is
that now the hidden layer computation for a feedforward network can be done very

---

### Page 166

158CHAPTER6 • NEURALNETWORKS
x1
x2
xn0
…
…
+1 b
…
UW
input layer hidden layer output layer
h1
y1
y2
yn2
h2
h3
hn1
Figure 6.8A simple 2-layer feedforward network, with one hidden layer, one output layer,
and one input layer (the input layer is usually not counted when enumerating layers).
efficiently with simple matrix operations. In fact, the computation only has three
steps: multiplying the weight matrix by the input vectorx, adding the bias vectorb,
and applying the activation functiong(such as the sigmoid, tanh, or ReLU activation
function defined above).
The output of the hidden layer, the vectorh, is thus the following (for this exam-
ple we’ll use the sigmoid functionσas our activation function):
h=σ(Wx+b)(6.8)
Notice that we’re applying theσfunction here to a vector, while in Eq. 6.3 it was
applied to a scalar. We’re thus allowingσ(·), and indeed any activation function
g(·), to apply to a vector element-wise, sog[z 1,z 2,z 3] = [g(z1),g(z 2),g(z 3)].
Let’s introduce some constants to represent the dimensionalities of these vectors
and matrices. We’ll refer to the input layer as layer 0 of the network, and have
n0 represent the number of inputs, soxis a vector of real numbers of dimension
n0, or more formallyx∈R n0, a column vector of dimensionality[n 0 ×1]. Let’s
call the hidden layer layer 1 and the output layer layer 2. The hidden layer has
dimensionalityn 1, soh∈R n1 and alsob∈R n1 (since each hidden unit can take a
different bias value). And the weight matrixWhas dimensionalityW∈R n1×n0, i.e.
[n1 ×n 0].
Take a moment to convince yourself that the matrix multiplication in Eq. 6.8 will
compute the value of eachh j asσ
Pn0
i=1 W jixi +b j

.
As we saw in Section 6.2, the resulting valueh(forhiddenbut also forhypoth-
esis) forms arepresentationof the input. The role of the output layer is to take
this new representationhand compute a final output. This output could be a real-
valued number, but in many cases the goal of the network is to make some sort of
classification decision, and so we will focus on the case of classification.
If we are doing a binary task like sentiment classification, we might have a sin-
gle output node, and its scalar valueyis the probability of positive versus negative
sentiment. If we are doing multinomial classification, such as assigning a part-of-
speech tag, we might have one output node for each potential part-of-speech, whose
output value is the probability of that part-of-speech, and the values of all the output
nodes must sum to one. The output layer is thus a vectorythat gives a probability
distribution across the output nodes.

---

### Page 167

6.3 • FEEDFORWARDNEURALNETWORKS159
Let’s see how this happens. Like the hidden layer, the output layer has a weight
matrix (let’s call itU), but some models don’t include a bias vectorbin the output
layer, so we’ll simplify by eliminating the bias vector in this example. The weight
matrix is multiplied by its input vector (h) to produce the intermediate outputz:
z=Uh
There aren 2 output nodes, soz∈R n2, weight matrixUhas dimensionalityU∈
Rn2×n1, and elementU i j is the weight from unitjin the hidden layer to unitiin the
output layer.
However,zcan’t be the output of the classifier, since it’s a vector of real-valued
numbers, while what we need for classification is a vector of probabilities. There is
a convenient function fornormalizinga vector of real values, by which we meannormalizing
converting it to a vector that encodes a probability distribution (all the numbers lie
between 0 and 1 and sum to 1): thesoftmaxfunction that we saw on page 109softmax
of Chapter 4. More generally for any vectorzof dimensionalityd, the softmax is
defined as:
softmax(zi) = exp(zi)Pd
j=1 exp(z j)
1≤i≤d(6.9)
Thus for example given a vector
z= [0.6,1.1,−1.5,1.2,3.2,−1.1],(6.10)
the softmax function will normalize it to a probability distribution (shown rounded):
softmax(z) = [0.055,0.090,0.0067,0.10,0.74,0.010](6.11)
You may recall that we used softmax to create a probability distribution from a
vector of real-valued numbers (computed from summing weights times features) in
the multinomial version of logistic regression in Chapter 4.
That means we can think of a neural network classifier with one hidden layer
as building a vectorhwhich is a hidden layer representation of the input, and then
running standard multinomial logistic regression on the features that the network
develops inh. By contrast, in Chapter 4 the features were mainly designed by hand
via feature templates. So a neural network is like multinomial logistic regression,
but (a) with many layers, since a deep neural network is like layer after layer of lo-
gistic regression classifiers; (b) with those intermediate layers having many possible
activation functions (tanh, ReLU, sigmoid) instead of just sigmoid (although we’ll
continue to useσfor convenience to mean any activation function); (c) rather than
forming the features by feature templates, the prior layers of the network induce the
feature representations themselves.
Here are the final equations for a feedforward network with a single hidden layer,
which takes an input vectorx, outputs a probability distributiony, and is parameter-
ized by weight matricesWandUand a bias vectorb:
h=σ(Wx+b)
z=Uh
y=softmax(z)(6.12)
And just to remember the shapes of all our variables,x∈R n0,h∈R n1,b∈R n1,
W∈R n1×n0,U∈R n2×n1, and the output vectory∈R n2. We’ll call this network a 2-
layer network (we traditionally don’t count the input layer when numbering layers,
but do count the output layer). So by this terminology logistic regression is a 1-layer
network.

---

### Page 168

160CHAPTER6 • NEURALNETWORKS
6.3.1 More details on feedforward networks
Let’s now set up some notation to make it easier to talk about deeper networks of
depth more than 2. We’ll use superscripts in square brackets to mean layer num-
bers, starting at 0 for the input layer. SoW [1] will mean the weight matrix for the
(first) hidden layer, andb [1] will mean the bias vector for the (first) hidden layer.n j
will mean the number of units at layerj. We’ll useg(·)to stand for the activation
function, which will tend to be ReLU or tanh for intermediate layers and softmax
for output layers. We’ll usea [i] to mean the output from layeri, andz [i] to mean the
combination of previous layer output, weights and biasesW [i]a[i−1] +b [i]. The 0th
layer is for inputs, so we’ll refer to the inputsxmore generally asa [0].
Thus we can re-represent our 2-layer net from Eq. 6.12 as follows:
z[1] =W [1]a[0] +b [1]
a[1] =g [1](z[1])
z[2] =W [2]a[1] +b [2]
a[2] =g [2](z[2])
ˆy=a [2] (6.13)
Note that with this notation, the equations for the computation done at each layer are
the same. The algorithm for computing the forward step in an n-layer feedforward
network, given the input vectora [0] is thus simply:
foriin1,...,n
z[i] =W [i]a[i−1] +b [i]
a[i] =g [i](z[i])
ˆy=a [n]
It’s often useful to have a name for the final set of activations right before the final
softmax. So however many layers we have, we’ll generally call the unnormalized
values in the final vectorz [n], the vector of scores right before the final softmax, the
logits(see Eq. 4.7).logits
The need for non-linear activation functionsOne of the reasons we use non-
linear activation functions for each layer in a neural network is that if we did not, the
resulting network is exactly equivalent to a single-layer network. Let’s see why this
is true. Imagine the first two layers of such a network of purely linear layers:
z[1] =W [1]x+b [1]
z[2] =W [2]z[1] +b [2]
We can rewrite the function that the network is computing as:
z[2] =W [2]z[1] +b [2]
=W [2](W[1]x+b [1]) +b[2]
=W [2]W[1]x+W [2]b[1] +b [2]
=W ′x+b ′ (6.14)
This generalizes to any number of layers. So without non-linear activation functions,
a multilayer network is just a notational variant of a single layer network with a
different set of weights, and we lose all the representational power of multilayer
networks.

---

### Page 169

6.4 • FEEDFORWARD NETWORKS FORNLP: CLASSIFICATION161
Replacing the bias unitIn describing networks, we will sometimes use a slightly
simplified notation that represents exactly the same function without referring to an
explicit bias nodeb. Instead, we add a dummy nodea 0 to each layer whose value
will always be 1. Thus layer 0, the input layer, will have a dummy nodea [0]0 =1,
layer 1 will havea[1]0 =1, and so on. This dummy node still has an associated weight,
and that weight represents the bias valueb. For example instead of an equation like
h=σ(Wx+b)(6.15)
we’ll use:
h=σ(Wx)(6.16)
But now instead of our vectorxhavingn 0 values:x=x 1, . . . ,xn0, it will haven 0 +
1 values, with a new 0th dummy valuex 0 =1:x=x 0, . . . ,xn0. And instead of
computing eachh j as follows:
h j =σ
n0X
i=1
Wji xi +b j
!
,(6.17)
we’ll instead use:
h j =σ
n0X
i=0
Wji xi
!
,(6.18)
where the valueW j0 replaces what had beenb j. Fig. 6.9 shows a visualization.
x1
x2
xn0
…
…
+1 b
…
UW h1 y1
y2
yn2
h2
h3
hn1
x1
x2
xn0
…
…
x0=1
…
UW
h1 y1
y2
yn2
h2
h3
hn1
(a) (b)
Figure 6.9Replacing the bias node (shown in a) withx 0 (b).
We’ll continue showing the bias asbwhen we go over the learning algorithm
in Section 6.6, but going forward in the book, for most figures and some equations
we’ll use this simplified notation without explicit bias terms.
6.4 Feedforward networks for NLP: Classification
Let’s see how to apply feedforward networks to NLP classification tasks. In practice,
simple feedforward networks aren’t the way we do text classification; for real appli-
cations we would use more sophisticated architectures like the BERT transformers

---

### Page 170

162CHAPTER6 • NEURALNETWORKS
of Chapter 9. Nonetheless seeing a feedforward network text classifier will let us
introduce key ideas that will play a role throughout the rest of the book, includ-
ing the ideas of theembedding matrix, representationpooling, andrepresentation
learning.
But before introducing any of these ideas, let’s start with a classifier by making
only minimal change from the sentiment classifiers we saw in Chapter 4. Like them,
we’ll take hand-built features, pass them through a classifier, and produce a class
probability. The only difference is that we’ll use a neural network instead of logistic
regression as the classifier.
6.4.1 Neural net classifiers with hand-built features
Let’s begin with a simple 2-layer sentiment classifier by taking our logistic regres-
sion classifier from Chapter 4, which corresponds to a 1-layer network, and just
adding a hidden layer. The input elementx i can be scalar features like those in
Fig. 4.2, e.g.,x 1 = count(words∈doc),x 2 = count(positive lexicon words∈doc),
x3 = 1 if “no”∈doc, and so on, for a total ofdfeatures. And the output layer
ˆycould have two nodes (one each for positive and negative), or 3 nodes (positive,
negative, neutral), in which case ˆy1 would be the estimated probability of positive
sentiment, ˆy2 the probability of negative and ˆy3 the probability of neutral. The re-
sulting equations would be just what we saw above for a 2-layer network (as always,
we’ll continue to use theσto stand for any non-linearity, whether sigmoid, ReLU
or other).
x= [x 1,x 2, ...,xd](eachx i is a hand-designed feature)
h=σ(Wx+b)
z=Uh
ˆy=softmax(z)(6.19)
Fig. 6.10 shows a sketch of this architecture. As we mentioned earlier, adding this
hidden layer to our logistic regression classifier allows the network to represent the
non-linear interactions between features. This alone might give us a better sentiment
classifier.
UW
[d⨉1]
Hidden layer Output layer
softmax
[dh⨉d][dh⨉1][3⨉dh]
Input words
p(+)
h1
h2
h3
hdh …
y1^
y2^
y3^
x h y
Input layer
d=3 features
[3⨉1]
x1
x2
x3
dessert
was
great
positive lexicon
words = 1
count of “no”
= 0
wordcount
=3
p(-)
p(neut)
Figure 6.10Feedforward network sentiment analysis using traditional hand-built features
of the input text.

---

### Page 171

6.5 • EMBEDDINGS AS THE INPUT TO NEURAL NET CLASSIFIERS163
6.4.2 Vectorizing for parallelizing inference
While Eq. 6.19 shows how to classify a single examplex, in practice we want to
efficiently classify an entire test set ofmexamples. We do this by vectorizing the
process, just as we saw with logistic regression; instead of using for-loops to go
through each example, we’ll use matrix multiplication to do the entire computation
of an entire test set at once. First, we pack all the input feature vectors for each input
xinto a single input matrixX, with each rowia row vector consisting of the features
for input examplex (i) (i.e., the vectorx (i)). If the dimensionality of our input feature
vector isd,Xwill be a matrix of shape[m×d].
Because we are now modeling each input as a row vector rather than a column
vector, we also need to slightly modify Eq. 6.19.Xis of shape[m×d]andWis of
shape[d h ×d], so we’ll reorder how we multiplyXandWand transposeWso they
correctly multiply to yield a matrixHof shape[m×d h]. 1
The bias vectorbfrom Eq. 6.19 of shape[1×d h]will now have to be replicated
into a matrix of shape[m×d h]. We’ll need to similarly reorder the next step and
transposeU. Finally, our output matrix ˆYwill be of shape[m×3](or more gen-
erally[m×d o], whered o is the number of output classes), with each rowiof our
output matrix ˆYconsisting of the output vector ˆy(i). Here are the final equations for
computing the output class distribution for an entire test set:
H=σ(XW ⊺ +b)
Z=HU ⊺
ˆY=softmax(Z)(6.20)
In this book, we’ll sometimes see orderings likeWX+band sometimesXW+b.
That’s why it’s always important to be very aware of the shapes of your weight
matrices participating in any given equation.
6.5 Embeddings as the input to neural net classifiers
While hand-built features are a traditional way to design classifiers, most applica-
tions of neural networks for NLP don’t use hand-built human-engineered features as
inputs. Instead, we draw on deep learning’s ability to learn features from the data by
representing tokens as embeddings. For this section we’ll represent each token by
its static word2vec or GloVe embeddings that we saw how to compute in Chapter 5.
By static embedding, we mean that each token is represented by a fixed vector that
we train once, and then just put into a big dictionary. When we want to refer to that
token, we grab its embedding out of the dictionary.
However when we apply neural models to the task of language modeling (as
we’ll see in Chapter 7) the situation is more complex, and we’ll use a more power-
ful kind of embedding called acontextual embedding. Contextual embeddings are
different for each time a word occurs in a different context. Furthermore, we’ll have
the network learn these embeddings as part of the task of word prediction.
So let’s explore the text classification domain above, but using static embeddings
as features instead of the hand-designed features. Let’s focus on the inference stage,
1 Note that we could have kept the original order of our products if we had instead made our input
matrixXrepresent each input as a column vector instead of a row vector, making it of shape[d×m]. But
representing inputs as row vectors is convenient and common in neural network models.

---

### Page 172

164CHAPTER6 • NEURALNETWORKS
in which we have already learned embeddings for all the input tokens. An embed-
ding is a vector of dimensiondthat represents the input token. The dictionary of
static embeddings in which we store these embeddings is theembedding matrixembeddingmatrix
E. Each row of the embedding matrix represents each token of the vocabularyV
as a (row) vector of dimensionalityd. SinceEhas a row for each of the|V|to-
kens in the vocabulary,Ehas shape[|V| ×d]. This embedding matrixEplays a role
whenever we are using embeddings as input to neural NLP systems, including in the
transformer-based large language models we will introduce over the next chapters.
Given an input token string likedessert was greatwe first convert the tokens
into vocabulary indices (these were created when we first tokenized the input using
BPE or SentencePiece). So the representation ofdessert was greatmight be
w= [3,524,902]. Next we use indexing to select the corresponding rows fromE
(row 3, row 524, row 902).
Another way to think about selecting token embeddings from the embedding
matrix is to represent input tokens as one-hot vectors of shape[1× |V|], i.e., with
one dimension for each word in the vocabulary. Recall that in aone-hot vectorallone-hot vector
the elements are 0 except one, the element whose dimension is the word’s index
in the vocabulary, which has value 1. So if the word “dessert” has index 3 in the
vocabulary,x 3 =1, andx i =0∀i̸=3, as shown here:
[0 0 1 0 0 0 0 ... 0 0 0 0]
1 2 3 4 5 6 7 ... ... |V|
Multiplying by a one-hot vector that has only one non-zero elementxi =1 simply
selects out the relevant row vector for wordi, resulting in the embedding for wordi,
as depicted in Fig. 6.11.
E
|V|
d
1
|V| d
=✕
33
0 0 1 0 0 0 0 … 0 0 0 0 1
Figure 6.11Selecting the embedding vector for wordV 3 by multiplying the embedding
matrixEwith a one-hot vector with a 1 in index 3.
We can extend this idea to represent the entire input token sequence as a matrix
of one-hot vectors, one for each of theNinput positions as shown in Fig. 6.12.
E
|V|
d
d
N
=✕
|V|
N
0 0 0 0 0 0 0 … 0 0 1 0
0 0 1 0 0 0 0 … 0 0 0 0
1 0 0 0 0 0 0 … 0 0 0 0
0 0 0 0 1 0 0 … 0 0 0 0
…
Figure 6.12Selecting the embedding matrix for the input sequence of token idsWby mul-
tiplying a one-hot matrix corresponding toWby the embedding matrixE.
We now need to classify this input ofN[1×d]embeddings, representing a win-
dow ofNtokens, into a single class (like positive or negative).
There are two common ways to pass embeddings to a classifier:concatenation
andpooling. First, we can take this input of shape[N×d]and reshape it bycon-
catenatingall the input vectors into one very long vector of shape[1×dN]. Then

---

### Page 173

6.5 • EMBEDDINGS AS THE INPUT TO NEURAL NET CLASSIFIERS165
we pass this input to our classifier and let it make its decision. This gives us lots of
information, at the cost of using a pretty large network. Second, we canpoolthepool
Nembeddings into a single embedding and then pass that single pooled embedding
to the classifier. Pooling gives us less information than would have been present
in all the original embeddings, but has the advantage of being small and efficient
and is especially useful in tasks for which we don’t care as much about the origi-
nal word order. Let’s give an example of each: pooling for the sentiment task, and
concatenation for the language modeling task.
Pooling input embeddings for sentimentSo let’s begin with seeing how pooling
can work for the sentiment classification task. The intuition of pooling is that for
sentiment, the exact position of the input (is some word likegreatthe first word?
the second word?) is less important than the identity of the word itself.
A pooling function is a way to turn a set of embeddings into a single embedding.
For example, for a text withNinput words/tokensw 1, ...,wN, we want to turn
theNrow embeddingse(w 1), ...,e(wN)(each of dimensionalityd) into a single
embedding also of dimensionalityd.
There are various ways to pool. The simplest ismean-pooling: taking the meanmean-pooling
by summing the embeddings and then dividing byN:
xmean = 1N NXi=1 e(wi)(6.21)
Here are the equations for this classifier assuming mean pooling:
x=mean(e(w 1),e(w 2), . . . ,e(wn))
h=σ(xW+b)
z=hU
ˆy=softmax(z)(6.22)
The architecture is sketched in Fig. 6.13, where we also give the shapes for all the
relevant matrices (note that we’re using row vectors now).
There are many other options for pooling, likemax-pooling, in which case formax-pooling
each dimension we take the element-wise max over all the inputs. The element-wise
max of a set ofNvectors is a new vector whosekth element is the max of thekth
elements of all theNvectors.
Concatenating input embeddings for language modelingFor sentiment analy-
sis we saw how to generate an output vector with probabilities over three classes:
positive, negative, or neutral, given as input a window ofNinput tokens, by first
pooling those token embeddings into a single embedding vector.
Now let’s considerlanguage modeling: predicting upcoming words from prior
words. In this task we are given the same window ofNinput tokens, but our task
now is to predict the next token that should follow the window. We’ll sketch a
simple feedforward neural language model, drawing on an algorithm first introduced
by Bengio et al. (2003). The feedforward language model introduces many of the
important concepts of large language modeling that we will return to in Chapter 7.
Neural language models have many advantages over the n-gram language mod-
els of Chapter 3. Neural language models can handle much longer histories, can
generalize better over contexts of similar words, and are far more accurate at word-
prediction. On the other hand, neural net language models are slower, more com-
plex, need vast amounts of energy to train, and are less interpretable than n-gram
models, so for some smaller tasks an n-gram language model is still the right tool.

---

### Page 174

166CHAPTER6 • NEURALNETWORKS
“dessert” = V3 “was” = V524 “great” = V902
embedding for “dessert”
embedding for “was”
embedding for “great”
U
W
[1⨉d]
Hidden layer
Output layer
[d⨉dh]
[1⨉dh]
[dh⨉3]
Input words
p(+)
h1 h2 h3 hdh…
y1^ y2^ y3^
x
h
y
Input layer
[1⨉3]
pooling+
p(-)p(neut)
embeddings
one-hot vectors
dessert was great
N⨉d
001 00
1 |V|3
00 1 00
1 |V|902
00 1 00
1 |V|524
0
0
E
N⨉|V|
|V|⨉dE E E matrixshared across words
Output probabilities
weights
weights
softmax
pooled embedding
Figure 6.13Feedforward network sentiment analysis using a pooled embedding of the input words. At each
timestep the network computes ad-dimensional embedding for each context word (by multiplying a one-hot
vector by the embedding matrixE), and pools the resultingNembeddings to get a single embedding that
represents the context window as the layerx.
A feedforward neural language model is a feedforward network that takes as
input at timeta representation of some number of previous words (w t−1 ,w t−2, etc.)
and outputs a probability distribution over possible next words. Thus—like the n-
gram LM—the feedforward neural LM approximates the probability of a word given
the entire prior contextP(w t |w1:t−1)by approximating based on theN−1 previous
words:
P(wt |w1, . . . ,wt−1 )≈P(w t |wt−N+1 , . . . ,wt−1 )(6.23)
In the following examples we’ll use a 4-gram example, so we’ll show a neural net to
estimate the probabilityP(w t =i|w t−3 ,w t−2 ,w t−1 ).
Neural language models represent words in this prior context by theirembed-
dings, rather than just by their word identity as used in n-gram language models.
Using embeddings allows neural language models to generalize better to unseen
data. For example, suppose we’ve seen this sentence in training:
I have to make sure that the cat gets fed.
but have never seen the words “gets fed” after the word “dog”. Our test set has the
prefix “I forgot to make sure that the dog gets”. What’s the next word? An n-gram
language model will predict “fed” after “that the cat gets”, but not after “that the dog
gets”. But a neural LM, knowing that “cat” and “dog” have similar embeddings, will

---

### Page 175

6.5 • EMBEDDINGS AS THE INPUT TO NEURAL NET CLASSIFIERS167
be able to generalize from the “cat” context to assign a high enough probability to
“fed” even after seeing “dog”.
h1 h2
y1
h3 hdh…
…
U
W
y34 y|V|
embedding layer e 1⨉Nd
hidden layer h
output layer y
softmax
…
...
wt-1wt-2 wtwt-3
Nd⨉dh
1⨉dh
dh⨉|V|
1⨉|V|
Input layer
one-hot
vectors “for” = V35
001 00
1 |V|35
00 1 00
1 |V|451
00 1 00
1 |V|992
0 0
“all” = V992“the” = V451
E
N⨉|V|
E is shared
across words |V|⨉d
…
p(wt=do|…)p(wt=aardvark|wt-3,wt-2,wt-1) p(wt=zebra|…)p(wt=fish|…)
… y42 y35102^^^ ^ ^
E E
for all the ?thanksand… …
Figure 6.14Forward inference in a feedforward neural language model. At each timestep
tthe network computes ad-dimensional embedding for each of theN=3 context tokens (by
multiplying a one-hot vector by the embedding matrixE), and concatenates the three to get
the embeddinge. This embeddingeis multiplied by weight matrixWand then an activation
function is applied element-wise to produce the hidden layerh, which is then multiplied by
another weight matrixU. A softmax layer predicts at each output nodeithe probability that
the next wordw t will be vocabulary wordVi. We show the context window sizeNas 3 just to
fit on the page, but in practice language modeling requires a much longer context.
This prediction task requires an output vector that expresses|V|probabilities:
one probability value for each possible next token. We might have a vocabulary
between 60,000 and 300,000 tokens, so the output vector for the task of language
modeling is much longer than 3. Another difference for language modeling is that
instead of pooling the embeddings of theNinput tokens to create a single embed-
ding, we concatenate the inputs into one very long input vector. To predict the next
token, it helps to know each of the preceding tokens and what order they were in.
Fig. 6.14 shows the language modeling task, sketched with a very short context
window ofN=3 just to fit on the page. These 3 embedding vectors are concatenated
to producee, the embedding layer. This is multiplied by a weight matrixWto pro-
duce a hidden layer, and another weight matrixUto produce an output layer whose
softmax gives a probability distribution over words. For exampley 42, the value of
output node 42, is the probability of the next wordwt beingV 42, the vocabulary word
with index 42 (which is the word ‘fish’ in our example).
The equations for a simple feedforward neural language model with a window

---

### Page 176

168CHAPTER6 • NEURALNETWORKS
size of 3, given one-hot input vectors for each input context word, are:
e= [Ex t−3;Ex t−2;Ex t−1]
h=σ(We+b)
z=Uh
ˆy=softmax(z)(6.24)
Note that we use semicolons to mean concatenation of vectors, so we form the em-
bedding layereby concatenating the 3 embeddings for the three context vectors.
We’ll return to this idea of using neural networks to do language modeling in
Chapter 7 when we introduce transformer language models.
6.6 Training Neural Nets
A feedforward neural net is an instance of supervised machine learning in which we
know the correct outputyfor each observationx. What the system produces, via
Eq. 6.13, is ˆy, the system’s estimate of the truey. The goal of the training procedure
is to learn parametersW [i] andb [i] for each layerithat make ˆyfor each training
observation as close as possible to the truey.
In general, we do all this by drawing on the methods we introduced in Chapter 4
for logistic regression, so the reader should be comfortable with that chapter before
proceeding. We’ll explore the algorithm on simple generic networks rather than
networks designed for sentiment or language modeling.
First, we’ll need aloss functionthat models the distance between the system
output and the gold output, and it’s common to use the loss function used for logistic
regression, thecross-entropy loss.
Second, to find the parameters that minimize this loss function, we’ll use the
gradient descentoptimization algorithm introduced in Chapter 4.
Third, gradient descent requires knowing thegradientof the loss function, the
vector that contains the partial derivative of the loss function with respect to each
of the parameters. In logistic regression, for each observation we could directly
compute the derivative of the loss function with respect to an individualworb. But
for neural networks, with millions of parameters in many layers, it’s much harder to
see how to compute the partial derivative of some weight in layer 1 when the loss
is attached to some much later layer. How do we partial out the loss over all those
intermediate layers? The answer is the algorithm callederror backpropagationor
backward differentiation.
6.6.1 Loss function
Thecross-entropy lossthat is used in neural networks is the same one we saw forcross-entropyloss
logistic regression. If the neural network is being used as a binary classifier, with
the sigmoid at the final layer, the loss function is the same logistic regression loss
we saw in Eq. 4.19:
LCE (ˆy,y) =−logp(y|x) =−[ylog ˆy+ (1−y)log(1−ˆy)](6.25)
If we are using the network to classify into 3 or more classes, the loss function is
exactly the same as the loss for multinomial regression that we saw in Chapter 4 on

---

### Page 177

6.6 • TRAININGNEURALNETS169
page 112. Let’s briefly summarize the explanation here for convenience. First, when
we have more than 2 classes we’ll need to represent bothyand ˆyas vectors. Let’s
assume we’re doinghard classification, where only one class is the correct one.
The true labelyis then a vector withKelements, each corresponding to a class,
withy c =1 if the correct class isc, with all other elements ofybeing 0. Recall that
a vector like this, with one value equal to 1 and the rest 0, is called aone-hot vector.
And our classifier will produce an estimate vector withKelements ˆy, each element
ˆyk of which represents the estimated probabilityp(y k =1|x).
The loss function for a single examplexis the negative sum of the logs of theK
output classes, each weighted by their probabilityy k:
LCE (ˆy,y) =−
KX
k=1
yk log ˆyk (6.26)
We can simplify this equation further; let’s first rewrite the equation using the func-
tion1{}which evaluates to 1 if the condition in the brackets is true and to 0 oth-
erwise. This makes it more obvious that the terms in the sum in Eq. 6.26 will be 0
except for the term corresponding to the true class for whichy k =1:
LCE (ˆy,y) =−
KX
k=1
1{y k =1}log ˆyk
In other words, the cross-entropy loss is simply the negative log of the output proba-
bility corresponding to the correct class, and we therefore also call this thenegative
log likelihood loss:negative loglikelihood loss
LCE (ˆy,y) =−log ˆyc (wherecis the correct class)(6.27)
Plugging in the softmax formula from Eq. 6.9, and withKthe number of classes:
LCE (ˆy,y) =−log exp(zc)PK
j=1 exp(z j)
(wherecis the correct class)(6.28)
Let’s think about the negative log probability as a loss function. A perfect clas-
sifier would assign the correct classiprobability 1 and all the incorrect classes prob-
ability 0. That means the higherp(ˆy i)(the closer it is to 1), the better the classifier;
p(ˆyi)is, and the lower it is (the closer it is to 0), the worse the classifier. The neg-
ative log of this probability is a beautiful loss metric since it goes from 0 (negative
log of 1, no loss) to infinity (negative log of 0, infinite loss). This loss function also
ensures that as probability of the correct answer is maximized, the probability of all
the incorrect answers is minimized; since they all sum to one, any increase in the
probability of the correct answer is coming at the expense of the incorrect answers.
The numberKof classes of the output vector ˆycan be small or large. Perhaps
our task is 3-way sentiment, and then the classes might be positive, negative, and
neutral. Or if our task is deciding the part of speech of a word (i.e., whether it is a
noun or verb or adjective, etc.), thenKis the set of possible parts of speech in our
tagset (of which there are 17 in the tagset we will define in Chapter 18). And if our
task is language modeling, and our classifier is trying to predict which word is next,
then our set of classes is the set of words, which might be 50,000 or 100,000.

---

### Page 178

170CHAPTER6 • NEURALNETWORKS
6.6.2 Computing the Gradient
How do we compute the gradient of this loss function? Computing the gradient
requires the partial derivative of the loss function with respect to each parameter.
For a network with one weight layer and sigmoid output (which is what logistic
regression is), we could simply use the derivative of the loss that we used for logistic
regression in Eq. 6.29 (and derived in Section 4.15):
∂L CE(ˆy,y)
∂w j
= (ˆy−y)x j
= (σ(w·x+b)−y)x j (6.29)
Or for a network with one weight layer and softmax output (=multinomial logistic
regression), we could use the derivative of the softmax loss from Eq. 4.41, shown
for a particular weightw k and inputx i
∂L CE(ˆy,y)
∂w k,i
=−(y k − ˆyk)xi
=−(y k −p(y k =1|x))x i
=−
yk − exp(w k ·x+b k)PK
j=1 exp(w j ·x+b j)
!
xi (6.30)
But these derivatives only give correct updates for one weight layer: the last one!
For deep networks, computing the gradients for each weight is much more complex,
since we are computing the derivative with respect to weight parameters that appear
all the way back in the very early layers of the network, even though the loss is
computed only at the very end of the network.
The solution to computing this gradient is an algorithm callederror backprop-
agationorbackprop(Rumelhart et al., 1986). While backprop was invented spe-error back-propagation
cially for neural networks, it turns out to be the same as a more general procedure
calledbackward differentiation, which depends on the notion ofcomputation
graphs. Let’s see how that works in the next subsection.
6.6.3 Computation Graphs
A computation graph is a representation of the process of computing a mathematical
expression, in which the computation is broken down into separate operations, each
of which is modeled as a node in a graph.
Consider computing the functionL(a,b,c) =c(a+2b). If we make each of the
component addition and multiplication operations explicit, and add names (dande)
for the intermediate outputs, the resulting series of computations is:
d=2∗b
e=a+d
L=c∗e
We can now represent this as a graph, with nodes for each operation, and di-
rected edges showing the outputs from each operation as the inputs to the next, as
in Fig. 6.15. The simplest use of computation graphs is to compute the value of
the function with some given inputs. In the figure, we’ve assumed the inputsa=3,
b=1,c=−2, and we’ve shown the result of theforward passto compute the re-
sultL(3,1,−2) =−10. In the forward pass of a computation graph, we apply each

---

### Page 179

6.6 • TRAININGNEURALNETS171
operation left to right, passing the outputs of each computation as the input to the
next node.
e=a+d
d = 2b L=ce
a=3
b=1
c=-2
e=5d=2
L=-10
forward pass
a
b
c
Figure 6.15Computation graph for the functionL(a,b,c) =c(a+2b), with values for input
nodesa=3,b=1,c=−2, showing the forward pass computation ofL.
6.6.4 Backward differentiation on computation graphs
The importance of the computation graph comes from thebackward pass, which
is used to compute the derivatives that we’ll need for the weight update. In this
example our goal is to compute the derivative of the output functionLwith respect
to each of the input variables, i.e., ∂L∂a , ∂L∂b , and ∂L∂c . The derivative ∂L∂a tells us how
much a small change inaaffectsL.
Backwards differentiation makes use of thechain rulein calculus, so let’s re-chain rule
mind ourselves of that. Suppose we are computing the derivative of a composite
functionf(x) =u(v(x)). The derivative off(x)is the derivative ofu(x)with respect
tov(x)times the derivative ofv(x)with respect tox:
d f
dx = dudv · dvdx (6.31)
The chain rule extends to more than two functions. If computing the derivative of a
composite functionf(x) =u(v(w(x))), the derivative off(x)is:
d f
dx = dudv · dvdw · dwdx (6.32)
The intuition of backward differentiation is to pass gradients back from the final
node to all the nodes in the graph. Fig. 6.16 shows part of the backward computation
at one nodee. Each node takes an upstream gradient that is passed in from its parent
node to the right, and for each of its inputs computes a local gradient (the gradient
of its output with respect to its input), and uses the chain rule to multiply these two
to compute a downstream gradient to be passed on to the next earlier node.
Let’s now compute the 3 derivatives we need. Since in the computation graph
L=ce, we can directly compute the derivative ∂L∂c :
∂L
∂c =e(6.33)
For the other two, we’ll need to use the chain rule:
∂L
∂a = ∂L∂e ∂e∂a
∂L
∂b = ∂L∂e ∂e∂d ∂d∂b (6.34)

---

### Page 180

172CHAPTER6 • NEURALNETWORKS
ed L
ed
∂L
∂d
∂L
∂e= ∂e∂d ∂L∂e∂e∂d
upstream
gradientdownstream gradient local gradient
Figure 6.16Each node (likeehere) takes an upstream gradient, multiplies it by the local
gradient (the gradient of its output with respect to its input), and uses the chain rule to compute
a downstream gradient to be passed on to a prior node. A node may have multiple local
gradients if it has multiple inputs.
Eq. 6.34 and Eq. 6.33 thus require five intermediate derivatives: ∂L∂e , ∂L∂c , ∂e∂a , ∂e∂d , and
∂d
∂b , which are as follows (making use of the fact that the derivative of a sum is the
sum of the derivatives):
L=ce: ∂L∂e =c, ∂L∂c =e
e=a+d: ∂e∂a =1, ∂e∂d =1
d=2b: ∂d∂b =2
In the backward pass, we compute each of these partials along each edge of the
graph from right to left, using the chain rule just as we did above. Thus we begin by
computing the downstream gradients from nodeL, which are ∂L∂e and ∂L∂c . For nodee,
we then multiply this upstream gradient ∂L∂e by the local gradient (the gradient of the
output with respect to the input), ∂e∂d to get the output we send back to node d: ∂L∂d .
And so on, until we have annotated the graph all the way to all the input variables.
The forward pass conveniently already will have computed the values of the forward
intermediate variables we need (likedande) to compute these derivatives. Fig. 6.17
shows the backward pass.
e=d+a
d = 2b L=ce
a=3
b=1
e=5d=2
L=-10
a
b
c ∂L=5∂c
∂L=-2∂e∂e=1∂d
∂d=2∂b
∂e=1∂a
backward pass
c=-2
∂L=-2∂e
∂L=5∂c
∂L
∂d =-2∂e∂d∂L∂e=
∂L
∂a =-2∂e∂a∂L∂e=
∂L
∂b =-4∂d∂b∂L∂d=
Figure 6.17Computation graph for the functionL(a,b,c) =c(a+2b), showing the backward pass computa-
tion of ∂L∂a , ∂L∂b , and ∂L∂c .

---

### Page 181

6.6 • TRAININGNEURALNETS173
Backward differentiation for a neural network
Of course computation graphs for real neural networks are much more complex.
Fig. 6.18 shows a sample computation graph for a 2-layer neural network withn 0 =
2,n 1 =2, andn 2 =1, assuming binary classification and hence using a sigmoid
output unit for simplicity. The function that the computation graph is computing is:
z[1] =W [1]x+b [1]
a[1] =ReLU(z [1])
z[2] =W [2]a[1] +b [2]
a[2] =σ(z [2])
ˆy=a [2] (6.35)
For the backward pass we’ll also need to compute the lossL. The loss function
for binary sigmoid output from Eq. 6.25 is
LCE (ˆy,y) =−[ylog ˆy+ (1−y)log(1−ˆy)](6.36)
Our output ˆy=a [2], so we can rephrase this as
LCE (a[2],y) =− hyloga [2] + (1−y)log(1−a [2])i (6.37)
z[2] =
+ a[2] = σ
a[1] =
ReLU
z[1] =
+
b[1] *
*
*
*
x1
x2
a[1] =
ReLU
z[1] =
+
b[1]
*
*
w[2]11
w[1]11
w[1]12
w[1]21
w[1]22 b[2]
w[2]12
L (a[2],y)1
2
1
1 1
22
Figure 6.18Sample computation graph for a simple 2-layer neural net (= 1 hidden layer) with two input units
and 2 hidden units. We’ve adjusted the notation a bit to avoid long equations in the nodes by just mentioning
the function that is being computed, and the resulting variable name. Thus the * to the right of nodew [1]11 means
thatw [1]11 is to be multiplied byx 1, and the nodez [1] = +means that the value ofz [1] is computed by summing
the three nodes that feed into it (the two products, and the bias termb [1]i ).
The weights that need updating (those for which we need to know the partial
derivative of the loss function) are shown in teal. In order to do the backward pass,
we’ll need to know the derivatives of all the functions in the graph. We already saw
in Section 4.15 the derivative of the sigmoidσ:
dσ(z)
dz =σ(z)(1−σ(z))(6.38)

---

### Page 182

174CHAPTER6 • NEURALNETWORKS
We’ll also need the derivatives of each of the other activation functions. The
derivative of tanh is:
dtanh(z)
dz =1−tanh 2(z)(6.39)
The derivative of the ReLU is2
dReLU(z)
dz =
 0f or z<0
1f or z≥0 (6.40)
We’ll give the start of the computation, computing the derivative of the loss function
Lwith respect toz, or ∂L∂z (and leaving the rest of the computation as an exercise for
the reader). By the chain rule:
∂L
∂z = ∂L∂a [2] ∂a [2]∂z (6.41)
So let’s first compute ∂L∂a [2] , taking the derivative of Eq. 6.37, repeated here:
LCE (a[2],y) =− hyloga [2] + (1−y)log(1−a [2])i
∂L
∂a [2] =−
y ∂log(a [2])∂a [2]
!
+ (1−y)∂log(1−a [2])∂a [2]
!
=−

y 1a[2]

+ (1−y) 11−a [2] (−1)
=−
 y
a[2] + y−11−a [2]

(6.42)
Next, by the derivative of the sigmoid:
∂a [2]
∂z =a [2](1−a [2])
Finally, we can use the chain rule:
∂L
∂z = ∂L∂a [2] ∂a [2]∂z
=−
 y
a[2] + y−11−a [2]

a[2](1−a [2])
=a [2] −y(6.43)
Continuing the backward computation of the gradients (next by passing the gra-
dients overb [2]1 and the two product nodes, and so on, back to all the teal nodes), is
left as an exercise for the reader.
6.6.5 More details on learning
Optimization in neural networks is a non-convex optimization problem, more com-
plex than for logistic regression, and for that and other reasons there are many best
practices for successful learning.
2 The derivative is actually undefined at the pointz=0, but by convention we treat it as 1.

---

### Page 183

6.7 • SUMMARY175
For logistic regression we can initialize gradient descent with all the weights and
biases having the value 0. In neural networks, by contrast, we need to initialize the
weights with small random numbers. It’s also helpful to normalize the input values
to have 0 mean and unit variance.
Various forms of regularization are used to prevent overfitting. One of the most
important isdropout: randomly dropping some units and their connections fromdropout
the network during training (Hinton et al. 2012, Srivastava et al. 2014). At each
iteration of training (whenever we update parameters, i.e. each mini-batch if we
are using mini-batch gradient descent), we choose a probabilitypand for each unit
we replace its output with zero with probabilityp(and renormalize the rest of the
outputs from that layer). Thus probabilitypis a hyperparameter of the algorithm.
Tuning of suchhyperparametersis also important. The parameters of a neuralhyperparameter
network are the weightsWand biasesb; those are learned by gradient descent.
The hyperparameters are things that are chosen by the algorithm designer; optimal
values are tuned on a devset rather than by gradient descent learning on the training
set. Hyperparameters include the learning rateη, the mini-batch size, the model
architecture (the number of layers, the number of hidden nodes per layer, the choice
of activation functions), how to regularize, and so on. Gradient descent itself also
has many architectural variants such as Adam (Kingma and Ba, 2015).
Finally, most modern neural networks are built using computation graph for-
malisms that make it easy and natural to do gradient computation and parallelization
on vector-based GPUs (Graphic Processing Units). PyTorch (Paszke et al., 2017)
and TensorFlow (Abadi et al., 2015) are two of the most popular. The interested
reader should consult a neural network textbook for further details; some sugges-
tions are at the end of the chapter.
6.7 Summary
• Neural networks are built out ofneural units. Originally inspired by biologi-
cal neurons, neural networks are now an abstract computational device rather
than a biological model.
• Each neural unit multiplies input values by a weight vector, adds a bias, and
then applies a non-linear activation function like sigmoid, tanh, or rectified
linear unit.
• In afully-connected,feedforwardnetwork, each unit in layeriis connected
to each unit in layeri+1, and there are no cycles.
• The power of neural networks comes from the ability of early layers to learn
representations that can be utilized by later layers in the network.
• Neural networks are trained by optimization algorithms likegradient de-
scent.
•Error backpropagation, backward differentiation on acomputation graph,
is used to compute the gradients of the loss function for a network.
•Neural language modelsuse a neural network as a probabilistic classifier, to
compute the probability of the next word given the previousnwords.
• Neural language models can use pretrainedembeddings, or can learn embed-
dings from scratch in the process of language modeling.