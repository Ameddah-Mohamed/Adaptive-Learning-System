# Chapter 06_Vector Semantics and Embeddings

- **Source File**: `Chapter 06_Vector Semantics and Embeddings.pdf`
- **Total Pages**: 103

---

## Slide / Page 1

Natural Language Processing
Chapter 6
Vector Semantics & Embeddings
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

Word Meaning

---

## Slide / Page 3

What do words mean?
• N-gram or text classification methods we've seen
so far
 Words are just strings (or indices wi in a vocabulary
list)
 That's not very satisfactory!
• Introductory logic classes:
 The meaning of "dog" is DOG;  cat is CAT
∀x DOG(x) ⟶ MAMMAL(x)
• Old linguistics joke by Barbara Partee in 1967:
 Q: What's the meaning of life?
 A: LIFE
• That seems hardly better!
3

---

## Slide / Page 4

Desiderata
• What should a theory of word meaning do
for us?
• Let's look at some desiderata
• From lexical semantics, the linguistic
study of word meaning
4

---

## Slide / Page 5

mouse (N)
1. any of numerous small rodents...
2. a hand-operated device that controls a
cursor...
Lemmas and senses
sense
lemma
• A lemma is the base or canonical form of a word, from
which all its inflected forms are derived.
• A sense or “concept” is the meaning component of a
word
• Lemmas can be polysemous (have multiple senses)
5

---

## Slide / Page 6

Relations between senses: Synonymy
• Synonyms have the same meaning in some
or all contexts.
 filbert / hazelnut
 couch / sofa
 big / large
 automobile / car
 vomit / throw up
 water / H20
6

---

## Slide / Page 7

Relations between senses: Synonymy
• There are probably no examples of perfect
synonymy.
 Even if many aspects of meaning are
identical
 Still may differ based on politeness, slang,
genre, etc.
7
water/H20
"H20" in a surfing guide?
big/large
my big sister != my large sister

---

## Slide / Page 8

The Linguistic Principle of Contrast
Difference in form  difference in meaning
8
One of the fundamental tenets of semantics
is called the principle of contrast:

---

## Slide / Page 9

Abbé Gabriel Girard 1718
[I do not believe that
there is a synonymous
word in any language]
"
"
Thanks to Mark Aronoff!
9

---

## Slide / Page 10

Relation: Similarity
• Words with similar meanings.  Not synonyms,
but sharing some element of meaning
car, bicycle
cow, horse
10
• Knowing how similar two words are can help in
computing how similar the meaning of two
phrases or sentences are.

---

## Slide / Page 11

Ask humans how similar 2 words are
word1 word2 similarity
vanish disappear 9.8
behave obey 7.3
belief impression 5.95
muscle bone 3.65
modest flexible 0.98
hole agreement 0.3
SimLex-999 dataset (Hill et al., 2015): Rating of the
similarity relation on a scale from 0 to 10
11

---

## Slide / Page 12

Relation: Word relatedness
• Also called "word association“ in psychology
• Words can be related in any way, perhaps via
a semantic frame or field
coffee, tea:    similar
coffee, cup:   related, not similar
12

---

## Slide / Page 13

Semantic field
• Words that
 cover a particular semantic domain
 bear structured relations with each other.
hospitals
surgeon, scalpel, nurse, anaesthetic, hospital
restaurants
waiter, menu, plate, food, menu, chef
houses
door, roof, kitchen, family, bed
13

---

## Slide / Page 14

Relation: Antonymy
• Senses that are opposites with respect to only one
feature of meaning
• Otherwise, they are very similar!
dark/light  short/long fast/slow rise/fall
hot/cold up/down in/out
• More formally: antonyms can
 define a binary opposition or be at opposite ends of a
scale
 long/short, fast/slow
 Be reversives:
 rise/fall, up/down
14

---

## Slide / Page 15

Relation: Superordinate/ subordinate
• One sense is a subordinate of another if the first
sense is more specific, denoting a subclass of the
other
 car is a subordinate of vehicle
 mango is a subordinate of fruit
• Conversely superordinate
 vehicle is a superordinate of car
 fruit is a superordinate of mango
Superordinate vehicle fruit furniture
Subordinate car mango chair

---

## Slide / Page 16

Superordinate        Basic Subordinate
chair office chair
piano chair
rocking chair
furniture lamp torchiere
desk lamp
table end table
coffee table

---

## Slide / Page 17

Cluster of Interactional Properties
• Basic level things are “human-sized”
• Consider chairs
 We know how to interact with a chair (sit)
 Not so clear for superordinate categories
like furniture
“Imagine a furniture without thinking of
a bed/table/chair/specific basic-level
category”

---

## Slide / Page 18

The basic level
• Distinctive actions
• Learned earliest in childhood
• Names are shortest
• Names are most frequent

---

## Slide / Page 19

Connotation (sentiment)
• Words have affective meanings
• Positive connotations (happy)
• Negative connotations (sad)
• Connotations can be subtle:
• Positive connotation: copy, replica, reproduction
• Negative connotation: fake, knockoff, forgery
• Evaluation (sentiment!)
• Positive evaluation (great, love)
• Negative evaluation (terrible, hate)
19

---

## Slide / Page 20

Connotation
• Words seem to vary along 3 affective dimensions:
 valence: the pleasantness of the stimulus
 arousal: the intensity of emotion provoked by the
stimulus
 dominance: the degree of control exerted by the
stimulus
Osgood et al. (1957)
Word Score Word Score
Valence love 1.000 toxic 0.008
happy 1.000 nightmare 0.005
Arousal elated 0.960 mellow 0.069
frenzy 0.965 napping 0.046
Dominance powerful 0.991 weak 0.045
leadership 0.983 empty 0.081
Values from NRC VAD Lexicon  (Mohammad 2018) 20

---

## Slide / Page 21

So far
• Concepts or word senses
 Have a complex many-to-many association with
words (homonymy, multiple senses)
• Have relations with each other
 Synonymy
 Antonymy
 Similarity
 Relatedness
 Superordinate/subordinate, basic level
 Connotation
21

---

## Slide / Page 22

Vector Semantics

---

## Slide / Page 23

Computational models of word meaning
• Can we build a theory of how to represent
word meaning, that accounts for at least some
of the desiderata?
• We will introduce vector semantics
 The standard model in language processing!
 Handles many of our goals!
23

---

## Slide / Page 24

Ludwig Wittgenstein
• "The meaning of a word is
its use in the language“
• He emphasized the idea that
the meaning of words is not
something intrinsic or fixed,
but is determined by how
they are used within specific
social and linguistic contexts
24

---

## Slide / Page 25

Let's define words by their usages
• One way to define "usage": words are defined
by their environments (the words around
them)
• Zellig Harris (1954): If A and B have almost
identical environments we say that they are
synonyms.
25

---

## Slide / Page 26

Meaning of recent English borrowing ongchoi?
•Suppose you see these sentences:
•Ong choi is delicious sautéed with garlic.
•Ong choi is superb over rice
•Ong choi leaves with salty sauces
• And you've also seen these:
• …spinach sautéed with garlic over rice
• Chard stems and leaves are delicious
• Collard greens and other salty leafy greens
• Conclusion:
 Ongchoi is a leafy green like spinach, chard, or collard
greens
 We could conclude this based on words like "leaves" and
"delicious" and "sauteed"
26

---

## Slide / Page 27

Ongchoi: Ipomoea aquatica "Water
Spinach"
Yamaguchi, Wikimedia Commons, public domain
空心菜
kangkong
rau muống
…
27

---

## Slide / Page 28

Idea 1: Defining meaning by
linguistic distribution
• Let us define the meaning of a word by its
distribution in language use, meaning its
neighboring words or grammatical
environments.
28

---

## Slide / Page 29

Idea 2: Meaning as a point in space
(Osgood et al. 1957)
• 3 affective dimensions for a word
 valence: pleasantness
 arousal: intensity of emotion
 dominance: the degree of control exerted

• Hence the connotation of a word is a vector in 3-space
Word Score Word Score
Valence love 1.000 toxic 0.008
happy 1.000 nightmare 0.005
Arousal elated 0.960 mellow 0.069
frenzy 0.965 napping 0.046
Dominance powerful 0.991 weak 0.045
leadership 0.983 empty 0.081
NRC VAD Lexicon
(Mohammad
2018)
29

---

## Slide / Page 30

Idea 1: Defining meaning by linguistic
distribution
Idea 2: Meaning as a point in
multidimensional space
30

---

## Slide / Page 31

Defining meaning as a point in space based on
distribution
• Each word = a vector   (not just "good" or "w45")
• Similar words are "nearby in semantic space"
• We build this space automatically by seeing which words
are nearby in text (unsupervised learning).
• The original 60-dimensional embeddings were trained for
sentiment analysis. 31

---

## Slide / Page 32

Word meaning as a vector
• Called an "embedding" because it is embedded
into a space (derived from its mathematical
sense as a mapping from one space or
structure to another)
• Standard way to represent meaning in NLP
• Every modern NLP algorithm uses embeddings
as the representation of word meaning
• Fine-grained model of meaning for similarity
32

---

## Slide / Page 33

Intuition: why vectors?
• Consider sentiment analysis:
 With words,  a feature is a word identity
 Feature 5: 'The previous word was "terrible"'
 Requires exact same word to be in the training
and test sets
 With embeddings:
 Feature is a word vector
 'The previous word was vector [35,22,17…]
 Now in the test set we might see a similar vector
[34,21,14]
 We can generalize to similar but unseen words!!!
33

---

## Slide / Page 34

We'll discuss 2 kinds of embeddings
• tf-idf
 Information Retrieval workhorse!
 A common baseline model
 Sparse vector representation
 Words are represented by (a simple function of) the counts
of nearby words
• Word2vec
 Dense vectors
 Representation is created by training a classifier to predict
whether a word is likely to appear nearby
 Later we'll discuss extensions called  contextual
embeddings
34

---

## Slide / Page 35

Computing with meaning
representations
35
From now on: we will be computing with
meaning representations instead of string
representations

---

## Slide / Page 36

Words and Vectors

---

## Slide / Page 37

Term-document matrix
• In term-document matrix, each document is
represented by a vector of words (columns below)
37
• Vector or distributional models of meaning are
generally based on a co-occurrence matrix, a way of
representing how often words co-occur.
The term-document matrix for four words in four Shakespeare plays

---

## Slide / Page 38

Vector Spaces
• Document vector representation in the example:
 As You Like It:    represented as [1,114,36,20]
 Julius Caesar:   represented as [7,62,1,2]
• A vector space is a collection of vectors, and is
characterized by its dimension.
• Here document vectors are of dimension 4.
• In real term-document matrices, the document
vectors would have dimensionality |V|, the
vocabulary size.
• We can think of the vector for a document as a
point in |V|-dimensional space.
38

---

## Slide / Page 39

Document Similarity
• Term-document matrices originally defined as
a means of finding similar documents for the
task of document information retrieval.
• Two documents that are similar will tend to
have similar words, and
• If two documents have similar words their
column vectors will tend to be similar.
39

---

## Slide / Page 40

Visualizing document vectors
40
Document vectors for the four Shakespeare play
documents, showing just two of the dimensions

---

## Slide / Page 41

Vectors are the basis of information
retrieval
• Vectors are similar for the two comedies
• But comedies are different than the other two plays
• Comedies have more fools and wit and fewer
battles.
41

---

## Slide / Page 42

Idea for word meaning: Words can be
vectors too!!!
• battle is "the kind of word that occurs in Julius
Caesar and Henry V"
• fool is "the kind of word that occurs  in comedies,
especially Twelfth Night"
42

---

## Slide / Page 43

More common: word-word matrix
(or "term-context matrix")
• Two words are similar in meaning if their context vectors
are similar.
• So have a co-occurrence matrix.

---

## Slide / Page 44

word-word matrix
(or "term-context matrix")
• This matrix is of dimensionality |V|x|V|
• Each cell records the number of times the row
(target) word and the column (context) word co-
occur in some context in some training corpus.
• The context could be the document.
• Most common to use smaller contexts, generally a
window around the word (e.g. 4 words to the left
and 4 words to the right).
44

---

## Slide / Page 45

Spatial Visualisation of Word Vectors
45
Spatial visualization of word vectors for digital and information,
showing just 2 of the dimensions (corresponding to data and computer)

---

## Slide / Page 46

Cosine for computing word
similarity

---

## Slide / Page 47

Computing word similarity: Dot
product and cosine
• The dot product between two vectors is a
scalar:
• The dot product tends to be high when
the two vectors have large values in the
same dimensions
• Dot product can thus be a useful similarity
metric between vectors
47

---

## Slide / Page 48

Problem with raw dot-product
• Dot product favors long vectors
• Dot product is higher if a vector is longer (i.e.
has higher values in any dimension)
• Vector length:
• Frequent words (of, the, you) have long vectors
(since they occur many times with other words).
• So dot product overly favors frequent words
48

---

## Slide / Page 49

Alternative: cosine for computing
word similarity
Based on the definition of the dot product between
two vectors a and b
49

---

## Slide / Page 50

Cosine as a similarity metric
• -1: vectors point in opposite
directions
• +1:  vectors point in same
directions
• 0: vectors are orthogonal
50
• But since raw frequency values are non-negative,
the cosine for term-term matrix vectors ranges
from 0 to 1.

---

## Slide / Page 51

Cosine examples
pie data computer
cherry 442 8 2
digital 5 1683 1670
information 5 3982 3325
51
cos(
v,
w) =
v ·
w
v
w =
v
v ·
w
w =
viwii=1
N
å
vi2i=1Nå wi2i=1Nå
cos(cherry,information) =
cos(digital,information) =

---

## Slide / Page 52

Visualizing cosines (angles)
52

---

## Slide / Page 53

TF-IDF

---

## Slide / Page 54

Raw frequency is a bad representation
• The co-occurrence matrices we have seen
represent each cell by word frequencies.
• Frequency is clearly useful; if sugar appears a
lot near apricot, that's useful information.
• But overly frequent words like the, it, or they
are not very informative about the context
• It's a paradox!
• How can we balance these two conflicting
constraints?
54

---

## Slide / Page 55

Two common solutions for word
weighting
• tf-idf (usually used when the dimensions are
documents):   the tf-idf value for word t in document d:
• PMI (Pointwise mutual information; usually used when
the dimensions are words):
PMI 𝑤1, 𝑤2 = 𝑙𝑜𝑔 𝑝(𝑤1,𝑤2)𝑝 𝑤1 𝑝(𝑤2)
Words like "the" or "it" have very low idf
See if words like "good" appear more often with
"great" than we would expect by chance
55

---

## Slide / Page 56

Term frequency (tf) in the tf-idf
algorithm
• We could imagine using raw count:
tft,d = count(t, d)
• But instead of using raw count, we usually
squash it a bit using the log function:
56

---

## Slide / Page 57

Document frequency (df)
• dft is the number of documents t occurs in.
• (Note that this is not collection frequency:
total count across all documents)
• "Romeo" is very distinctive for one
Shakespeare play:
57

---

## Slide / Page 58

Inverse document frequency (idf)
N is the total number of
documents in the
collection (N=37 here)
• Log is used because of
the large number of
documents in many
collections.
58

---

## Slide / Page 59

What is a document?
• A document could be a play or a Wikipedia
article
• For the purposes of tf-idf, documents can be
anything; often each paragraph is called a
document!
59

---

## Slide / Page 60

Final tf-idf weighted value for a word
• Raw counts:
• tf-idf:
60

---

## Slide / Page 61

Discussion of tf-idf example
• The idf weighting has eliminated the
importance of the ubiquitous word good
and
• The idf weighting has vastly reduced the
impact of the almost-ubiquitous word fool.
• As a consequence, tf-idf(t,d) favors words
(terms) that are distinctive of a document (d).
61

---

## Slide / Page 62

Summary on tf-idf and PPMI
• Vector semantics model so far:
 a target word represented as a vector with dimensions
corresponding to
 the documents in a large collection (the term-document
matrix) or to
 the counts of words in some neighboring window (the term-
term matrix).
 The values in each dimension are counts, weighted by
 tf-idf (for term-document matrices) or
 PPMI (for term-term matrices), and the
62

---

## Slide / Page 63

Vector Semqntics
• Vectors are sparse (since most values are
zero).
• The model computes the similarity between
two words x and y by taking the cosine of
their tf-idf or PPMI vectors;
• High cosine means high similarity
63

---

## Slide / Page 64

Document Vector
• The tf-idf model of meaning is often used for
document functions, e.g. deciding if two
documents are similar.
• A document is represented by taking the
vectors of all the words in the document, and
computing the centroid of all those vectors.
• Given k word vectors w1, w2, …, wk, the
centroid document vector d is:
64
𝑑 = 𝑤1 + 𝑤2 + ⋯ + 𝑤𝑘
𝑘

---

## Slide / Page 65

Document similarity and applications
• Given two documents, we can compute their document
vectors d1 and d2, and estimate the similarity between
the two documents by cos(d1,d2).
• Useful for various applications: information retrieval,
plagiarism detection, news recommender systems,
digital humanities tasks (e.g. comparing different
versions of a text to see which are similar to each
other).
• PPMI or tf-idf can be used for finding word
paraphrases, tracking changes in word meaning, etc.
• Example; Finding 10 most similar words to some word?
65

---

## Slide / Page 66

Word2vec

---

## Slide / Page 67

Sparse versus dense vectors
• tf-idf (or PMI) vectors are
 long (length |V|= 20,000 to 50,000)
 sparse (most elements are zero)
• Alternatively: learn vectors which are
 short (length 50-1000)
 dense (most elements are non-zero)
67

---

## Slide / Page 68

Sparse versus dense vectors
• Why dense vectors?
 Short vectors may be easier to use as features in
machine learning (fewer weights to tune)
 Dense vectors may generalize better
 Dense vectors may do better at capturing
synonymy:
 In a sparse vector representation, dimensions for car
and automobile (synonyms) are distinct and
unrelated
• a word with car as a neighbor and a word with
automobile as a neighbor should be similar, but aren't
 In practice, dense vectors work better 68

---

## Slide / Page 69

Common methods for getting short
dense vectors
• “Neural Language Model”-inspired models
 Word2vec (Skip-gram, CBOW), GloVe
• Singular Value Decomposition (SVD)
• These are Static embeddings approaches: i.e. they
learn one fixed embedding for any vocabulary
word.
• Alternative to these "static embeddings":
Contextual (or dynamic) Embeddings (ELMo, BERT)
• Compute distinct embeddings for a word sense
based on the context 69

---

## Slide / Page 70

Simple static embeddings you can
download!
• Word2vec (Mikolov et al)
https://code.google.com/archive/p/word2
vec/
• GloVe (Pennington, Socher, Manning)
http://nlp.stanford.edu/projects/glove/
70

---

## Slide / Page 71

Word2vec
• Popular embedding method
• Very fast to train
• Code available on the web
• Idea: predict rather than count
• Word2vec provides various options. We'll
do:
Skip-gram with negative sampling (SGNS)
71

---

## Slide / Page 72

Word2vec
• Instead of counting how often each word w occurs
near "apricot"
 Train a classifier on a binary prediction task:
 Is w likely to show up near "apricot"?
• We don’t actually care about this task
 But we'll take the learned classifier weights as
the word embeddings
• The big idea is  self-supervision:
 A word c that occurs near apricot in the corpus acts
as the gold "correct answer" for supervised learning
 No need for human labels
(Bengio et al. (2003); Collobert et al. (2011) )
72

---

## Slide / Page 73

Approach: predict if candidate word
c is a "neighbor"
1. Treat the target word t and a neighboring
context word c as positive examples.
2. Randomly sample other words in the lexicon
to get negative examples
3. Use logistic regression to train a classifier to
distinguish those two cases
4. Use the learned weights as the embeddings
73

---

## Slide / Page 74

Skip-Gram Training Data
• Assume a +/- 2 word window, given the training
sentence:
…lemon, a [tablespoon of  apricot  jam,   a]  pinch…
c1       c2 c3      c4[target]
74

---

## Slide / Page 75

Skip-Gram Classifier
…lemon, a [tablespoon of  apricot  jam,   a]  pinch…
c1    c2 [target] c3   c4
•Goal: train a classifier such that, given a candidate
(word, context) pair, e.g.
(apricot, jam)
(apricot, aardvark)
…
assigns each pair a probability:    P(+|w, c)
P(−|w, c) = 1 − P(+|w, c)
75

---

## Slide / Page 76

Dot product to compute Similarity
• Intuition of the Skip-gram model:
 base this probability on embedding similarity; i.e.
 a word is likely to occur near the target if its embedding
vector is similar to the target embedding.
• Recall that: two vectors are similar if they have a high
dot product
 Cosine is just a normalized dot product
• So:
 Similarity(w, c) ≈ w ∙ c
• Note: We’ll need to normalize to get a probability
 (cosine isn't a probability either)
76

---

## Slide / Page 77

Turning dot products into probabilities
• Sim(w,c) ≈ w ∙ c
• To turn this into a probability, the sigmoid
function is used:
77

---

## Slide / Page 78

How the Skip-Gram classifier
computes P(+|w, c)
• This is for one context word; but we have lots
of context words.
• We'll assume independence and just multiply
them:
78

---

## Slide / Page 79

Skip-gram classifier: summary
• A probabilistic classifier, given
• a test target word w
• its context window of L words c1:L
• It estimates the probability that w occurs in
this window based on similarity of w
(embeddings) to c1:L (embeddings).
• To compute this, we just need embeddings for
all the words.
79

---

## Slide / Page 80

Needed embeddings:
a set for w & a set for c
80d is the dimension of each word embedding

---

## Slide / Page 81

Word2vec: Learning the
Embeddings

---

## Slide / Page 82

Skip-Gram Training data
• Assuming a +/- 2 word window,
…lemon, a [tablespoon of  apricot  jam,   a ]  pinch…
c1      c2 [target] c3    c4
82
• In Skip-gram: for each
positive example we'll
take k negative
examples, sampling by
frequency.
• Suppose k = 2

---

## Slide / Page 83

Skip-Gram Training data
83
…lemon, a [tablespoon of  apricot  jam,   a ]  pinch…
c1          c2  [target] c3    c4

---

## Slide / Page 84

Word2vec: how to learn vectors
• Given the set of +ve and -ve training instances,
and an initial set of embedding vectors
• The goal of learning is to adjust those word
vectors such that we:
 Maximize the similarity of the target word,
context word pairs (w , cpos) drawn from the
positive data
 Minimize the similarity of the (w , cneg) pairs
drawn from the negative data.
84

---

## Slide / Page 85

Loss function for one w with
cpos , cneg1, ... , cnegk
• Maximize the similarity of the target with the actual
context words, and minimize the similarity of the target
with the k negative sampled non-neighbor words.
• The following loss function L is to be minimized
85

---

## Slide / Page 86

Learning the classifier
• How to learn it?
 Use stochastic gradient descent!
• The word weights will be adjusted so as to
make
 the positive pairs more likely and
 the negative pairs less likely,
over the entire training set.
86

---

## Slide / Page 87

Intuition of one step of gradient descent
87

---

## Slide / Page 88

Reminder: gradient descent
• At each step
• Direction: move in the reverse direction from
the gradient of the loss function
• Magnitude: move by the value of this gradient
𝑑
𝑑𝑤 𝐿(𝑓 𝑥; 𝑤 , 𝑦) weighted by a learning rate η
(higher learning rate means move w faster)
10 CHA PTER 5 • L OGI STIC REGRESSION
exa mple ):
wt+ 1 = wt − h ddwL( f (x; w), y) (5.14)
Nowlet’s exte ndtheintuition from a functionof ones ca la rva ria blew to ma ny
va ria ble s ,be ca us ewedon’t jus twa ntto move le ftor right, we wa ntto know whe re
in theN-dime ns iona ls pa ce(of theN pa ra me te rstha tma ke up q) we s houldmove.
The gradie ntis jus ts ucha ve ctor;it expre s s e sthe dire ctiona lcompone ntsof the
s ha rpe s ts lopea longe a chof thos eN dime ns ions .If we’rejus tima giningtwo we ight
dime ns ions(s ay for onewe ightw a ndonebia sb), thegra die ntmightbeave ctorwith
two orthogona lcompone nts ,e a chof which te llsushow muchthegrounds lope sin
thew dime ns iona ndin theb dime ns ion.Fig. 5.4 s hows a vis ua liza tionof theva lue
of a 2-dime ns iona lgra die ntve ctorta kenat there dpoint.
Cost(w,b)
w b
Figure 5.4 Vis ua liza tionof thegra die ntve ctorat there dpointin two dime ns ionsw a ndb,
s howing thegra die ntasa re da rrow in thex-y pla ne .
In ana ctua llogis ticregre s s ion,thepa ra me te rve ctorw is muchlonge rtha n1 or
2, s incethe input fe a tureve ctorx ca nbe quite long, a ndwe ne e da we ightwi for
e a chxi. For e a chdime ns ion/va ria blewi in w (plusthebia sb), thegra die ntwill have
a compone nttha tte llsus the s lopewith re s pe ctto tha tva ria ble .Es s e ntia llywe’re
a s king:“How muchwoulda sma llcha ngein tha tva ria blewi inﬂuencethetota llos s
functionL?”
In e a chdime ns ionwi, we expre s sthes lopeasa pa rtia lde riva tive ∂∂ wi of thelos sfunction.Thegra die ntis the ndeﬁnedasa ve ctorof the s epa rtia ls .We’ll re pre s e ntˆy
as f (x;q) to ma ke thede pe nde nceon q moreobvious :
—qL( f (x; q),y)) =
2
66664
∂
∂ w1 L( f (x; q),y)∂
∂ w2 L( f (x; q),y)...
∂
∂ wn L( f (x; q),y)
3
77775 (5.15)
Theﬁnal e qua tionfor upda tingq ba s e don thegra die ntis thus
qt+ 1 = qt − h—L( f (x; q),y) (5.16)
88

---

## Slide / Page 89

The derivatives of the loss function
89
To get the gradient, we need to take the derivative:

---

## Slide / Page 90

Stochastic Gradient Descent
• Initial State: Initialize the parameters (weights) of
the model. The matrices W and C represent these
parameters in the context of Word2Vec.
 W: The word vectors for each word when it's the target
word.
 C: The word vectors for each word when it's a context
word.
• Learning from Data: As one goes through the
training corpus, the Skip-gram model learns which
word pairs (target, context) co-occur frequently and
adjusts the embeddings in W and C to reflect the
relationships between words.
90

---

## Slide / Page 91

Update equation in SGD
91
• The update equations going from time step t to t +1
in stochastic gradient descent are thus:

---

## Slide / Page 92

Two sets of embeddings
• Skip-gram with negative sampling (SGNS) learns two
sets of embeddings
 Target embeddings matrix W
 Context embeddings matrix C
• It is common to just add them up, representing
word i as the vector  wi + ci
• Alternatively, one can throw away the C matrix and
just represent each word i by the vector wi.
• The context window size L affects the performance
of skip-gram embeddings; experiments often tune
the parameter L on a devset.
92

---

## Slide / Page 93

Summary: How to learn word2vec
(skip-gram) embeddings
• Start with V random d-dimensional vectors as initial
embeddings
• Train a classifier based on embedding similarity
 Take a corpus and take pairs of words that co-occur as
positive examples
 Take as negative examples pairs of words that don't co-
occur
 Train the classifier to distinguish these by slowly
adjusting all the embeddings to improve the classifier
performance
 Throw away the classifier code and keep the
embeddings. 93

---

## Slide / Page 94

Properties of Embeddings

---

## Slide / Page 95

Window size and neighbors
•Small windows (C= +/- 2) : nearest words are
syntactically similar words in the same taxonomy
Hogwarts nearest neighbors are other fictional
schools
Sunnydale, Evernight, Blandings
•Large windows (C= +/- 5) :  nearest words are
related words in the same semantic field
 Hogwarts nearest neighbors are Harry Potter
world:
Dumbledore, half-blood,  Malfoy
95

---

## Slide / Page 96

Analogical relations
• The classic parallelogram model of analogical
reasoning (Rumelhart and Abrahamson 1973)
• To solve: "apple is to tree as grape is to  __?___"
• Add tree – apple  to grape to get vine
96

---

## Slide / Page 97

Analogical relations via parallelogram
• The parallelogram method can solve analogies
with both sparse and dense embeddings (Turney
and Littman 2005; Mikolov et al. 2013b)
king – man + woman is close to  queen
Paris–France+Italy is close to   Rome
• For a problem a:a*::b:b*, the parallelogram
method is:
97

---

## Slide / Page 98

Structure in GloVE Embedding space
98king – man + woman is close to  queen

---

## Slide / Page 99

Caveats with the parallelogram method
• It only seems to work for frequent words,
small distances and certain relations (relating
countries to capitals, or Parts-of-Speech), but
not others. (Linzen 2016; Gladkova et al. 2016;
Ethayarajh et al. 2019a)
• Understanding analogy is an open area of
research (Peterson et al. 2020)
99

---

## Slide / Page 100

Train embeddings on different decades of historical text to see
meanings shift.
~30 million books, 1850-1990, Google Books data
Embeddings as a window onto
historical semantics
William L. Hamilton, Jure Leskovec, and Dan Jurafsky. 2016. Diachronic Word
Embeddings Reveal Statistical Laws of Semantic Change. Proceedings of ACL. 100

---

## Slide / Page 101

Embeddings reflect cultural bias!
• Ask “Paris : France :: Tokyo : x”
 x = Japan
• Ask “father : doctor :: mother : x”
 x = nurse
• Ask “man : computer programmer :: woman : x”
 x = homemaker
Bolukbasi, Tolga, Kai-Wei Chang, James Y. Zou, Venkatesh Saligrama, and Adam T. Kalai. "Man is to computer
programmer as woman is to homemaker? debiasing word embeddings." In NeurIPS, pp. 4349-4357. 2016.
• Algorithms that use embeddings as part of e.g.,
hiring searches for programmers, might lead to
bias in hiring 101

---

## Slide / Page 102

Historical embedding as a tool to study
cultural biases
• Compute a gender or ethnic bias for each adjective:
e.g., how much closer the adjective is to "woman"
synonyms than "man" synonyms, or names of particular
ethnicities.
• Embeddings for competence adjective (smart, wise,
brilliant, resourceful, thoughtful, logical) are biased
toward men, a bias slowly decreasing 1960-1990
• Embeddings for dehumanizing adjectives (barbaric,
monstrous, bizarre)  were biased toward Asians in the
1930s, bias decreasing over the 20th century.
• These match the results of old surveys done in the 1930s
Garg, N., Schiebinger, L., Jurafsky, D., and Zou, J. (2018). Word embeddings quantify 100 years of gender
and ethnic stereotypes. Proceedings of the National Academy of Sciences 115(16), E3635–E3644.
102

---

## Slide / Page 103

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
10
3
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

