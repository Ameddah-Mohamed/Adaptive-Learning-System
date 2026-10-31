# Chapter 03_Language Modeling

- **Source File**: `Chapter 03_Language Modeling.pdf`
- **Total Pages**: 75

---

## Slide / Page 1

Natural Language Processing
Chapter 3
Language Modeling
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

Introduction to N-grams
Language
Modeling

---

## Slide / Page 3

Probabilistic Language Models
• Today’s goal: assign a probability to a
sentence (or to the next word(s))
 Spell Correction
 The office is about fifteen minuets from my house
P(about fifteen minutes from) > P(about fifteen
minuets from)
 Speech Recognition
 P(I saw a van) >> P(eyes awe of an)
 Augmentative and alternative communication
 People physically unable to speak or sign: can use eye
gaze or other movements to select words from a menu.
 + Summarization, question-answering, etc., etc.
Why?
3

---

## Slide / Page 4

Probabilistic Language Modeling
• Goal: compute the probability of a sentence or
sequence of words:
P(W) = P(w1,w2,w3,w4,w5…wn)
• Related task: probability of an upcoming word:
P(w5|w1,w2,w3,w4)
• A model that computes either of these:
P(W)  or  P(wn|w1,w2…wn-1)  is called a language
model.
… Better: the grammar
But language model or LM `
• In this chapter, we cover the simplest way to build a
LM: Using N-grams! 4

---

## Slide / Page 5

How to compute P(W)
• How to compute this joint probability:
P(its, water, is, so, transparent, that)
• Intuition: let’s rely on the Chain Rule of
Probability
5

---

## Slide / Page 6

Reminder: The Chain Rule
• Recall the definition of conditional probabilities
p(B|A) = P(A,B)/P(A)
Rewriting it as:   P(A,B) = P(A)P(B|A)
• More variables:
P(A,B,C,D) = P(A)P(B|A)P(C|A,B)P(D|A,B,C)
• The Chain Rule in General
P(x1,x2,x3,…,xn) =
P(x1)P(x2|x1)P(x3|x1,x2)…P(xn|x1,…,x`)
6

---

## Slide / Page 7

Chain Rule
• Chaine rule applied to compute joint probability
of words in a sentence:
P(its water is so transparent) =
P(its) × P(water|its) × P(is|its water)
× P(so|its water is)
× P(transparent|its water is so)
 
i
iin wwwwPwwwP )...|()...( 12121
7

---

## Slide / Page 8

How to estimate these
probabilities
• Could we just count and divide?
• No!  Too many possible sentences!
• Language is creative!
• We’ll never see enough data for estimating
these  Risk of having probabilities = 0!
nt that) transpareso is water its(
)ent that th transpareso is water its(
)nt that transpareso is water its|the(
Count
Count
P 
8

---

## Slide / Page 9

• Markov assumption: the probability of a
word depends only on the previous word.
• Markov models: the class of probabilistic
models that assume we can predict the
probability of some future unit without
looking too far into the past.
9
Markov Assumption
Andrei Markov

---

## Slide / Page 10

Markov Assumption
• Simplifying assumption
(using bigrams):
• Or maybe (using trigrams):
• Etc. with N-grams!
)nt that transpareso is water its|the(P
)nt that transpareso is water its|the(P
Andrei Markov
10
)that|the(P
͌
)t thattransparen|the(P
͌

---

## Slide / Page 11

Markov Assumption
• In other words, we approximate each
component in the product
 
i
ikiin wwwPwwwP )...|()...( 121
)...|()...|( 1121   ikiiii wwwPwwwwP
11

---

## Slide / Page 12

Simplest case: Unigram model
o fifth, an, of, futures, the, an,
incorporated, a, a, the, inflation,
most, dollars, quarter, in, is, mass
o thrift, did, eighty, said, hard, 'm,
july, bullish
o that, or, limited, the
Some automatically generated sentences from
a unigram model

i
in wPwwwP )()...( 21
12

---

## Slide / Page 13

A condition rests
on the previous word:
Bigram model
o texaco, rose, one, in, this, issue, is,
pursuing, growth, in, a, boiler, house,
said, mr., gurria, mexico, 's, motion,
control, proposal, without, permission,
from, five, hundred, fifty, five, yen
o outside, new, car, parking, lot, of,
the, agreement, reached
o this, would, be, a, record, november
)|()...|( 1121   iiii wwPwwwwP
13
Some automatically generated sentences from a
unigram model:

---

## Slide / Page 14

N-gram models
• We can extend to trigrams, 4-grams, 5-grams
• In general this is an insufficient model of
language
because language has long-distance
dependencies, e.g.:
“The computer which I had just put into the
machine room on the fifth floor crashed.”
• But we can often get away with N-gram
models
14

---

## Slide / Page 15

Estimating N-gram Probabilities
Language Modeling

---

## Slide / Page 16

Estimating bigram
probabilities
• The Maximum Likelihood Estimate
)(
),()|(
1
1
1


 
i
ii
ii wcount
wwcountwwP
)(
),()|(
1
1
1


 
i
ii
ii wc
wwcwwP
16

---

## Slide / Page 17

Example
<s> I am Sam </s>
<s> Sam I am </s>
<s> I do not like green eggs and lham </s>
)(
),()|(
1
1
1


 
i
ii
ii wc
wwcwwP
17

---

## Slide / Page 18

More examples:
Berkeley Restaurant Project
sentences
• can you tell me about any good cantonese
restaurants close by
• mid priced thai food is what i’m looking for
• tell me about chez panisse
• can you give me a listing of the kinds of food that
are available
• i’m looking for a good place to eat breakfast
• when is caffe venezia open during the day
18

---

## Slide / Page 19

Raw bigram counts
• Out of 9222 sentences…
19

---

## Slide / Page 20

Raw bigram probabilities
• Normalize by unigrams:
• Result:
20

---

## Slide / Page 21

Bigram estimates of sentence
probabilities
P(<s> I want english food </s>) =
P(I|<s>)
× P(want|I)
× P(english|want)
× P(food|english)
× P(</s>|food)
=  .000031
21

---

## Slide / Page 22

What kinds of knowledge?
• P(english|want)  = .0011
• P(chinese|want) =  .0065
• P(to|want) = .66
• P(eat | to) = .28
• P(food | to) = 0
• P(want | spend) = 0
• P (i | <s>) = .25
22
World knowledge
Syntax
Discourse

---

## Slide / Page 23

Practical Issues
• Multiplying (small) probabilities may lead
to 0 (even division by 0)!
• Do everything in log space
Mainly to avoid underflow
(also adding is faster than multiplying)
43214321 loglogloglog)***log( pppppppp 
23

---

## Slide / Page 24

Language Modeling Toolkits
• Efficient language model toolkits like KenLM
use sorted arrays and use merge sorts to
efficiently build the proba. tables in a minimal
number of passes through a large corpus.
• KenLM
 https://kheafield.com/code/kenlm/
• Another LM Toolkit: SRILM
 http://www.speech.sri.com/projects/srilm/
24

---

## Slide / Page 25

Google N-Gram Release,
August 2006
…
25

---

## Slide / Page 26

Google N-Gram Release
• serve as the incoming 92
• serve as the incubator 99
• serve as the independent 794
• serve as the index 223
• serve as the indication 72
• serve as the indicator 120
• serve as the indicators 45
• serve as the indispensable 111
• serve as the indispensible 40
• serve as the individual 234
http://googleresearch.blogspot.com/2006/08/all-our-n-gram-are-belong-to-you.html
26

---

## Slide / Page 27

Evaluation and Perplexity
Language Modeling

---

## Slide / Page 28

How to evaluate N-gram
models
• One way to evaluate a model, embed it in an
application and measure how much the
application improves: Extrinsic Evaluation.
• Extrinsic (in-vivo) Evaluation: To compare
models A and B
1. Put each model in a real task
• Machine Translation, speech recognition, etc.
2. Run the task, get a score for A and for B
• How many words translated correctly
• How many words transcribed correctly
• …
3. Compare accuracy for A and B
28

---

## Slide / Page 29

Intrinsic (in-vitro) evaluation
• Extrinsic evaluation not always possible
• Expensive, time-consuming
• Intrinsic evaluation metric: one that measures
the quality of a model independent of any
application.
• Perplexity: standard intrinsic metric for
measuring LM performance:
• Directly measures LM performance at predicting
words.
• Doesn't necessarily correspond with real application
performance
• Gives us a single general metric for LMs
• Useful for large language models (LLMs) as well as
n-grams
29

---

## Slide / Page 30

Training sets and test sets
• We train parameters of our model on a
training set.
• We test the model’s performance on data
we haven’t seen.
 A test set i.e. unseen dataset; different from
training set.
 Intuition: we want to measure generalization
to unseen data.
• An evaluation metric (like perplexity) tells
us how well our model does on the test set.
30

---

## Slide / Page 31

Choosing training and test
sets
• If we're building an LM for a specific task
• The test set should reflect the task language
we want to use the model for.
• If we're building a general-purpose model
• We'll need lots of different kinds of training
data.
• We don't want the training set or the test set
to be just from one domain or author or
language.
31

---

## Slide / Page 32

Training on the test set
• We can’t allow test sentences into the
training set.
• Or else the LM will assign that sentence an
artificially high probability when we see it in
the test set.
• And hence assign the whole test set a falsely
high probability.
• Making the LM look better than it really is.
• This is called “Training on the test set”
• Bad science!
32

---

## Slide / Page 33

Dev sets
•If we test on the test set many times we
might implicitly tune to its characteristics
•Noticing which changes make the model better.
•So we run on the test set only once, or a few
times.
•That means we need a third dataset:
•A development test set or, devset (also
called: Validation set).
•We test our LM on the devset until the very end
•And then test our LM on the test set once
33

---

## Slide / Page 34

Intuition of Perplexity:
Predicting Upcoming Words
The Shannon Game: How well
can we predict the next
word?
o Once upon a ____
o That is a picture of a  ____
o For breakfast I ate my usual
____
Unigrams are terrible at this
game (Why?)
time 0.9
dream 0.03
midnight 0.02
…
and 1e-100
Picture credit: Historiska bildsamlingen
https://creativecommons.org/licenses/by/2.0/
Claude Shannon
A good LM is one that assigns a higher probability to
the next word that actually occurs
34

---

## Slide / Page 35

Intuition of perplexity
• We said: a good LM is one that assigns a
higher probability to the next word that
actually occurs.
• Generalizing this to all the words:
• The best LM assigns high probability to (i.e. best
predicts) the entire test set.
• When comparing two LMs, A and B
• We compute PA(test set) and PB(test set)
• The better LM will give a higher probability to
(=be less surprised by) the test set than the
other LM.
35

---

## Slide / Page 36

• Use perplexity instead of raw probability
• Probability depends on the size of the test set
• Probability gets smaller the longer the text
• Better to have a metric that is per-word,
normalized by length.  we could compare
across texts of different lengths.
• Perplexity is the inverse probability of the test set,
normalized by the number of words
Intuition of perplexity
N
N
NN
wwwP
wwwPWPP
)...(
1
)...()(
21
1
21



36

---

## Slide / Page 37

• Perplexity is one of the most important metrics in NLP,
used for evaluating large language models as well as n-
gram models.
• Perplexity is the inverse probability of the test set,
normalized by the number of words (or tokens).
• Probability range is  [0,1], perplexity range is [1,∞]
• The higher the probability of the word sequence,
the lower the perplexity. Minimizing perplexity
amounts to maximizing the test set probability
Intuition of perplexity
N
N
NN
wwwP
wwwPWPP
)...(
1
)...()(
21
1
21



37

---

## Slide / Page 38

Intuition of perplexity: N-grams
N
N
NN
wwwP
wwwPWPP
)...(
1
)...()(
21
1
21



Bigrams:
Chain rule:
38

---

## Slide / Page 39

Intuition of perplexity:
Weighted average branching factor
• Perplexity is also the weighted average branching factor of a
language.
• Branching factor: number of possible next words that can follow any
word
Example: Deterministic language L = {red, blue, green}
Branching factor = 3 (any word can be followed by red, blue, green)
Now assume LM A where each word follows any other word with equal
probability ⅓
Given a test set T = "red red red red blue"
PerplexityA(T) = PA(red red red red blue)= ((⅓)5)-1/5 = (⅓)-1 = 3
• But now suppose red was very likely in training set, such that for LM B:
 P(red) = .8   p(green) = .1  p(blue) = .1
• We would expect the probability to be higher, and hence the perplexity to
be smaller:
PerplexityB(T) = PB(red red red red blue)-1/5 = (.8 * .8 * .8 * .8 * .1) -1/5
=.04096 -1/5  =.527-1 = 1.89 39

---

## Slide / Page 40

Lower perplexity  better
language model
• Given a text W, different language models
will have different perplexities.
• Training set 38 million words, test set 1.5
million words, of WSJ
N-gram
Order
Unigram Bigram Trigram
Perplexity 962 170 109
40

---

## Slide / Page 41

Sampling and Generalization
Language Modeling

---

## Slide / Page 42

• Sampling from a language: important way to
visualize what kind of knowledge it embodies.
• Sampling from a distribution: choose random
points according to their likelihood.
• Sampling from a LM: generate sentence words
according to their likelihoods as defined by the
LM.
• So we are more likely to generate sentences
that the model thinks have a high probability
and less likely to generate sentences that the
model thinks have a low probability.
42

---

## Slide / Page 43

The Shannon (1948)
Visualization Method
• Some sentences generated by Claude Shannon
in 1948 from a unigram and a bigram model.
• Unigram:
•
REPRESENTING AND SPEEDILY IS AN GOOD APT OR
COME CAN DIFFERENT NATURAL HERE HE THE A IN
CAME THE TO OF TO EXPERT GRAY COME TO
FURNISHES THE LINE MESSAGE HAD BE THESE.
• Bigram:
THE HEAD AND IN FRONTAL ATTACK ON AN ENGLISH
WRITER THAT THE CHARACTER OF THIS POINT IS
THEREFORE ANOTHER METHOD FOR THE LETTERS THAT
THE TIME OF WHO EVER TOLD THE PROBLEM FOR AN
UNEXPECTED.
Claude Shannon
43

---

## Slide / Page 44

How Shannon sampled those
words in 1948
"Open a book at random and select
a letter at random on the page.
This letter is recorded. The book is
then opened to another page and
one reads until this letter is
encountered. The succeeding letter
is then recorded. Turning to
another page this second letter is
searched for and the succeeding
letter recorded, etc."
44

---

## Slide / Page 45

Sampling a word from a distribution
45
Imagine all the words of the English language covering the
number line between 0 and 1, each word covering an interval
proportional to its frequency.
• Choose a random value between 0 and 1,
• Find that point on the (cumulative) probability line, and
• Print the word whose interval includes this chosen value.
• Continue choosing random numbers and generating words
until the sentence-final token </s> is randomly generated.

---

## Slide / Page 46

Visualizing Bigrams the Shannon Way
• Choose a random bigram (<s>, w) according to its (bigram)
probability p(w|<s>)
• Now choose a random bigram (w, x) according to its
probability p(x|w)
• And so on until we choose </s>
• Then string the words together
<s> I
I want
want to
to eat
eat Chinese
Chinese food
food </s>
I want to eat Chinese food
46

---

## Slide / Page 47

Other sampling methods
• Other sampling methods are used for neural
LMs.
• Many of them avoid generating words from
the very unlikely tail of the distribution
• Will be discussed when we get to neural LM
decoding (See in Chapter 10: Sampling for
LLM Generation):
 Temperature sampling
 Top-k sampling
 Top-p sampling
47

---

## Slide / Page 48

Approximating Shakespeare
48

---

## Slide / Page 49

Shakespeare as corpus
• N = 884,647 tokens, V = 29,066
• Shakespeare produced 300,000 bigram types
out of V2= 844 million possible bigrams.
 So 99.96% of the possible bigrams were never
seen (have zero entries in the table)
 This is the biggest problem in language
modeling; we’ll come back to this “Sparsity”
issue.
 That sparsity is even worse for 4-grams,
explaining why our sampling generated actual
Shakespeare.
49

---

## Slide / Page 50

The Wall Street Journal is
not Shakespeare
50

---

## Slide / Page 51

Can you guess the author?
These 3-gram sentences are sampled from an LM
trained on who (WSJ, Shakespeare, or Jane Austen)?
1) They also point to ninety nine point six
billion dollars from two hundred four oh six
three percent of the rates of interest
stores as Mexico and gram Brazil on market
conditions
2) This shall forbid it should be branded,
if renown made it empty.
3) “You are uniformly charming!” cried he,
with a smile of associating and now and then
I bowed and they perceived a chaise and four
to wish for.
51

---

## Slide / Page 52

Choosing training data
• If task-specific, use a training corpus that
has a similar genre to your task.
• If legal or medical, need lots of special-purpose
documents
• Make sure to cover different kinds of dialects
and speaker/authors.
• Example: African-American Vernacular English
(AAVE)
• One of many varieties that can be used by African
Americans and others
• Can include the auxiliary verb finna that marks
immediate future tense:
"My phone finna die"
52

---

## Slide / Page 53

The Perils of Overfitting
• Problem with using maximum likelihood
estimates for probabilities: any finite training
corpus will be missing some perfectly
acceptable English word sequences.
• N-grams only work well for word prediction if the test
corpus looks like the training corpus
• But even when we try to pick a good training
corpus, the test set will surprise us!
• We need to train robust models that generalize!
• One kind of generalization: Zeros
• Things that don’t ever occur in the training set
• But occur in the test set
53

---

## Slide / Page 54

Zeros
• Training set:
… ate lunch
… ate dinner
… ate a
… ate the
P(“breakfast” | ate) = 0
• Test set
… ate lunch
… ate breakfast
54

---

## Slide / Page 55

Zero probability bigrams
• Bigrams with zero probability
 Will hurt our performance for texts where those
words appear!
 And mean that we will assign 0 probability to
the test set!
• And hence we cannot compute perplexity
(can’t divide by 0)!
• Standard way to deal with “zero probability
n-grams” that should really have some non-
zero probability is called smoothing
55

---

## Slide / Page 56

Smoothing: Add-one (Laplace) smoothing
Language Modeling

---

## Slide / Page 57

The intuition of smoothing
• When we have sparse
statistics:
• Steal probability mass to
generalize better
P(w | denied the)
3 allegations
2 reports
1 claims
1 request
7 total
P(w | denied the)
2.5 allegations
1.5 reports
0.5 claims
0.5 request
2 other
7 total
allegations
reports
claims
attack
request
man
outcome…
allegations
attack
man
outcome…
allegations
reports
claims
request
57

---

## Slide / Page 58

Add-one estimation
• Also called Laplace smoothing
• Pretend we saw each word one more time
than we did
• Just add one to all the counts!
• MLE estimate:
• Add-1 estimate:
)(
),()|(
1
1
1


 
i
ii
iiMLE wc
wwcwwP
Vwc
wwcwwP
i
ii
iiAdd 



 )(
1),()|(
1
1
11
58

---

## Slide / Page 59

Maximum Likelihood Estimates
• The maximum likelihood estimate
 of some parameter of a model M from a training set T
 maximizes the likelihood of the training set T given the
model M
• Suppose the word “bagel” occurs 400 times in a
corpus of a million words
• What is the probability that a random word from
some other text will be “bagel”?
• MLE estimate is 400/1,000,000 = .0004
• This may be a bad estimate for some other corpus
 But it is the estimate that makes it most likely that
“bagel” will occur 400 times in a million word corpus.
59

---

## Slide / Page 60

Berkeley Restaurant Corpus:
Laplace smoothed bigram counts
60

---

## Slide / Page 61

Laplace-smoothed bigrams
61

---

## Slide / Page 62

Reconstituted counts
62

---

## Slide / Page 63

Compare with raw bigram counts
63

---

## Slide / Page 64

Impact of Add-1 Smoothing
• Add-one smoothing has made a very big change
to the counts.
 E.g. C(want to) changed from 608 to 238!
• Can also be seen in probability space:
P(to|want) decreases from 0.66 in the
unsmoothed case to 0.26 in the smoothed case.
• In terms of discount d (ratio between new and
old counts): discount for the bigram “want to” is
0.39 (238/608), discount for “to spend” 0.63
(133/211), while discount for “Chinese food” is
0.987 (82/83)!
64

---

## Slide / Page 65

Add-1 estimation is a blunt
instrument
• So add-1 isn’t used for N-grams:
 We’ll see better methods
• But add-1 is used to smooth other NLP
models
 For text classification
 In domains where the number of zeros isn’t
so huge.
65

---

## Slide / Page 66

Interpolation, Backoff, and Web-Scale LMs
Language Modeling

---

## Slide / Page 67

Backoff and Interpolation
• Sometimes it helps to use less context
 Condition on less context for contexts you
haven’t learned much about
• Backoff (use of n-gram hierarchy):
 Use trigram if you have good evidence,
 Otherwise bigram, otherwise unigram
• Interpolation:
 Mix unigram, bigram, trigram
 Weighting and combining the n-grams
• Interpolation works better
67

---

## Slide / Page 68

Linear Interpolation
• Simple interpolation
• Lambdas conditional on context:
68

---

## Slide / Page 69

How to set the lambdas?
• Use a held-out corpus
• Choose λs to maximize the probability of held-out data:
 Fix the N-gram probabilities (on the training data)
 Then search for λs that give largest probability to
held-out set:
log 𝑃(𝑤1𝑤2 … 𝑤𝑛|𝑀 𝜆1𝜆2 … 𝜆𝑘 = σ𝑖 log 𝑃𝑀 𝜆1𝜆2…𝜆𝑘 (𝑤𝑖|𝑤𝑖−1)
• Various ways to find the optimal set of λs (e.g. EM
algorithm, an iterative learning algorithm)
Training Data
Held-Out
Data
Test
Data
69

---

## Slide / Page 70

EM Algorithm
• With n-gram models, the typical approach involves the following:
1. With the Training Set: Compute N-gram Models (Model building): You
compute the unigram, bigram, and trigram probabilities based on the training set.
This involves counting the occurrences of each n-gram and calculating the
corresponding probabilities.
2. With the Held-out Set: EM Steps: EM algorithm applied to this set to optimize
the parameters (mixture weights) for the model.
 Initialize Parameters: Set initial mixture weights for combining the models.
 E-step: Using the held-out set, calculate the expected contributions from each
n-gram model to the observed data.
 M-step: Update the mixture weights based on these expected contributions.
 Iterate: Repeat the E-step and M-step until convergence, using the held-out
set for evaluation.
• With a held-out Set:
 Avoid Overfitting.
 Model performance evaluation after each iteration of the EM algorithm,
ensuring that the adjustments made lead to improved performance on unseen
data.
70

---

## Slide / Page 71

The EM Algorithm
Model Overview
• Unigram: Probability of w3 based solely on its
frequency in the corpus, P(w3).
• Bigram: Probability of w3 given w2, P(w3​∣w2).
• Trigram: Probability of w3 given w1 and w2,
P(w3​∣w1,w2).
• overall probability of w3 can be expressed as:
P(w3∣w1,w2)=λ1 P(w3) +  λ2 P(w3​∣w2) +  λ3 P(w3​∣w1,w2)
where λ1,λ2,λ3 are the weights (mixture coefficients)
that determine the contribution of each model.
Step 1: Initialize Parameters
• Initial Weights: Set initial values for λ1,λ2,λ3. As
equal or based on some heuristic (e.g., prior
knowledge about the importance of the n-grams)
λ1+λ2+λ3=1.
• Model Parameters: Also initialize the counts needed
for unigram, bigram, and trigram probabilities from
the training corpus. 71

---

## Slide / Page 72

The EM Algorithm (cont.)
• Step 2: E-Step (Expectation Step)
Calculate the expected counts for each word
based on the current estimates of λ1, λ2, and
λ3.
Expected Counts for Trigram: For a
trigram(w1,w2,w3):
E[C(w3∣w1,w2)] = λ3 P(w3∣w1,w2)⋅count(w1,w2)
Expected Counts for Bigram: For a bigram
(w2,w3): E[C(w3∣w2)] = λ2 P(w3∣w2)⋅count(w2)
Expected Counts for Unigram: For a unigram
w3:
E[C(w3)] = λ1 P(w3)⋅N
(where N is the total number of words)
72

---

## Slide / Page 73

The EM Algorithm (cont.)
• Step 3: M-Step (Maximization Step)
Update the mixing weights based on the expected
counts calculated in the E-step.
Calculate Total Counts: For each w3:
TotalCount(w3) = E[C(w3)]+E[C(w3∣w2)]+E[C(w3∣w1,w2)]
Update the λ Values: The new mixing weights are
calculated as:
λ1′ = ∑w3 E[C(w3)] / ∑w3Total Count(w3)
λ2′ = ∑w3 E[C(w3∣w2)] / ∑w3 Total Count(w3)
λ3′=∑w3E[C(w3∣w1,w2)]∑w3Total Count(w3)
Normalization: Ensure that λ1′+λ2′+λ3′= 1
Step 4: Iterate: Repeat the E-step and M-step
until convergence (i.e., until the changes in
λ1, λ2, and λ3 are negligible).
73

---

## Slide / Page 74

Unknown words: Open versus
closed vocabulary tasks
• If we know all the words in advance
 Vocabulary V is fixed
 Closed vocabulary task
• Often we don’t know this
 Out Of Vocabulary = OOV words
 Open vocabulary task
• Instead: create an unknown word token <UNK>
 Training of <UNK> probabilities
 Create a fixed lexicon L of size V
 At text normalization phase, any training word not in L changed
to  <UNK>
 Now we train its probabilities like a normal word
 At decoding time
 If text input: Use UNK probabilities for any word not in training
74

---

## Slide / Page 75

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
75
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

