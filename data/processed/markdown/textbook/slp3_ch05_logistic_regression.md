# SLP3 Chapter 05: Logistic Regression and Sentiment Classification

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 99–133

---

### Page 99

EXERCISES91
3.9Run your n-gram program on two different small corpora of your choice (you
might use email text or newsgroups). Now compare the statistics of the two
corpora. What are the differences in the most common unigrams between the
two? How about interesting differences in bigrams?
3.10Add an option to your program to generate random sentences.
3.11Add an option to your program to compute the perplexity of a test set.
3.12You are given a training set of 100 numbers that consists of 91 zeros and 1
each of the other digits 1-9. Now we see the following test set: 0 0 0 0 0 3 0 0
0 0. What is the unigram perplexity?

---

### Page 100

92CHAPTER4 • LOGISTICREGRESSION
CHAPTER
4
Logistic Regression and Text
Classification
En sus remotas p´aginas est´a escrito que los animales se dividen en:
a. pertenecientes al Emperador h. incluidos en esta clasificaci ´on
b. embalsamados i. que se agitan como locos
c. amaestrados j. innumerables
d. lechones k. dibujados con un pincel fin ´ısimo de pelo de camello
e. sirenas l. etc ´etera
f. fabulosos m. que acaban de romper el jarr ´on
g. perros sueltos n. que de lejos parecen moscas
Borges (1964)
Classificationlies at the heart of language processing and intelligence. Recog-
nizing a letter, a word, or a face, sorting mail, assigning grades to homeworks; these
are all examples of assigning a category to an input. The challenges of classification
were famously highlighted by the fabulist Jorge Luis Borges (1964), who imagined
an ancient mythical encyclopedia that classified animals into:
(a) those that belong to the Emperor, (b) embalmed ones, (c) those that
are trained, (d) suckling pigs, (e) mermaids, (f) fabulous ones, (g) stray
dogs, (h) those that are included in this classification, (i) those that
tremble as if they were mad, (j) innumerable ones, (k) those drawn with
a very fine camel’s hair brush, (l) others, (m) those that have just broken
a flower vase, (n) those that resemble flies from a distance.
Luckily, the classes we use for language processing are easier to define than
those of Borges. In this chapter we introduce thelogistic regressionalgorithm for
classification. For our running example, we’ll applytext categorization, the tasktextcategorization
of assigning a label or category to a text or document. We’ll introducesentiment
analysis, the task of classifyingsentiment, the positive or negative orientation thatsentimentanalysis
a writer expresses toward some object. A review of a movie, book, or product ex-
presses the author’s sentiment toward the product, while an editorial or political text
expresses sentiment toward an action or candidate. Extracting sentiment is relevant
for fields from marketing to politics. Other text classification tasks are equally im-
portant. Inspam detectionwe assign an email to one of the two classesspamorspam detection
not-spam.Language idis the task of determining what language a text is writtenlanguage id
in, whileauthorship attributionis the task of determining a text’s author, relevantauthorshipattribution
to both humanistic and forensic analysis.
But what makes classification so important is thatlanguage modelingcan also
be viewed as classification: each word can be thought of as a class, and so we can
think ofpredicting the next wordas classifying the context-so-far into a class for
each next word! This intuition underlies large language models.
The algorithm for classification we introduce in this chapter, logistic regression,
is equally important. First, logistic regression has a close relationship with neural
networks. As we will see in Chapter 6, a neural network can be viewed as a series of

---

### Page 101

4.1 • MACHINE LEARNING AND CLASSIFICATION93
logistic regression classifiers stacked on top of each other. Second, logistic regres-
sion introduces ideas that are fundamental to language models, like thesigmoidandsigmoid
softmaxfunctions, thelogit, and the keygradient descentalgorithm for learning.softmax
logit Finally, logistic regression is also one of the most important analytic tools in the
social and natural sciences.
Finally, we’ll be thinking about thefeatureswe need for classification. For
sentiment analysis words likeawesomeandlove, orawfulandridiculouslyare very
informative features for a classifier to make use of, as we can see from these sample
extracts from movie/restaurant reviews:
+...awesome caramel sauce and sweet toasty almonds. I love this place!
−...awful pizza and ridiculously overpriced...
4.1 Machine learning and classification
The goal of classification is to take a single input (we call each input anobserva-
tion), extract some usefulfeaturesor properties of the input, and therebyclassifyobservation
the observation into one of a set of discrete classes. We’ll call the inputx, and say
that the output comes from a fixed set of output classesY={y 1,y 2, ...,yM}. Our
goal is to return a predicted class from Y . Sometimes you’ll see the output classes
referred to as the setCinstead ofY.
For sentiment analysis, the inputxmight be a review, or some other text. And
the output setYmight be the set:
{positive,negative}
or the set
{0,1}
For language id, the input might be a text that we need to know what language it was
written in, and the output setYis the set of languages, i.e.,
Y={Abkhaz,Ainu,Albanian,Amharic, ...Zulu,Zu ˜ni}
There are many ways to do classification. One method is to use rules handwritten
by humans. For example, we might have a rule like:
If the word ‘‘love’’ appears in x,andit’snotprecededbythe
word ‘‘don’t", classify as positive
Handwritten rules can be components of modern NLP systems, such as the hand-
written lists of positive and negative words that can be used in sentiment analysis,
as we’ll see below. But rules can be fragile, as situations or data change over time,
and for many tasks there are complex interactions between different features (like
the example of negation with “don’t” in the rule above), so it can be quite hard for
humans to come up with rules that are successful over many situations.
Another method that we will introduce later is to ask a large language model by
prompting the model to give a label to some text. Prompting can be powerful, but
again has weaknesses: language models often hallucinate, and may not be able to
explain why they chose the class they did.
For these reasons the most common way to do classification is to usesuper-
vised machine learning. Supervised machine learning is a paradigm in which, in
supervised
machine
learning
addition to the input and the set of output classes, we have alabeled training set

---

### Page 102

94CHAPTER4 • LOGISTICREGRESSION
and alearning algorithm. We talked about training sets in Chapter 3 as a locus for
computing n-gram statistics. But in supervised machine learning the training set is
labeled, meaning that it contains a set of input observations, each observation asso-
ciated with the correct output (a ‘supervision signal’). We can generally refer to a
training set ofminput/output pairs, where each inputxis a text, in the case of text
classification, and each is hand-labeled with an associated class (the correct label).
training set:{(x (1),y (1)),(x (2),y (2)), . . . ,(x(m),y (m))}(4.1)
We’ll use superscripts in parentheses to refer to individual observations or instances
in the training set. So for sentiment classification, a training set might be a set of
sentences or other texts, each with their correct sentiment label.
Our goal is to learn from this training set a classifier that is capable of mapping
from anewinputxto its correct classy∈Y. It does this by learning to find features
in these training sentences (perhaps words like “awesome” or “awful”).Proba-
bilistic classifierslike logistic regression are classifiers that in addition to giving an
answer (the class this observation is in), also give theprobabilityof the observation
being in the class. This distribution over the classes can be useful information for
downstream decisions; avoiding making discrete decisions early on can be useful
when combining systems. Probabilistic classifiers like logistic regression have four
components:
1. Afeature representationof the input. For each input observationx (i), this
will be a vector of features[x 1,x 2, ...,xn]. We will generally refer to feature
ifor inputx (j) asx (j)i , sometimes simplified asx i, but we will also see the
notationf i,f i(x), or, for multiclass classification,f i(c,x).
2. A classification function that computes the estimated class, by computing the
probabilityP(y=y i|x)for each output classy i. We will introduce thesigmoid
andsoftmaxtools for classification.
3. Anobjective functionthat we want to optimize for learning, usually involv-
ing minimizing a loss function corresponding to error on training examples.
We will introduce thecross-entropy loss function.
4. An algorithm for optimizing the objective function. We introduce thestochas-
tic gradient descentalgorithm.
At the highest level, logistic regression, and really any probabilistic machine
learning classifier, has two phases
training:We train the system (in the case of logistic regression that means train-
ing the weightswandb, introduced below) using stochastic gradient descent
and the cross-entropy loss.
test:Given a test examplexwe compute the probabilityP(y=y i|x)for each
output classy i. Then, given this vector of probabilities, we return the higher
probability labely=1 ory=0.
Logistic regression can be used to classify an observation into one of two classes
(like ‘positive sentiment’ and ‘negative sentiment’), or into one of many classes.
Because the mathematics for the two-class case is simpler, we’ll first describe this
special case of logistic regression in the next few sections, beginning with thesig-
moidfunction, and then turn tomultinomial logistic regressionfor more than two
classes and the use of thesoftmaxfunction in Section 4.7.

---

### Page 103

4.2 • THE SIGMOID FUNCTION95
4.2 The sigmoid function
The goal of binary logistic regression is to train a classifier that can make a binary
decision about the class of a new input observation. Here we introduce thesigmoid
classifier that will help us make this decision.
Consider a single input observationx, which we will represent by a vector of
features[x 1,x 2, ...,xn]. (We’ll show sample features in the next subsection.) The
classifier outputycan be 1 (meaning the observation is a member of the class) or
0 (the observation is not a member of the class). We want to know the probability
P(y=1|x)that this observation is a member of the class. So perhaps the decision
is “positive sentiment” versus “negative sentiment”, the features represent counts of
words in a document,P(y=1|x)is the probability that the document has positive
sentiment, andP(y=0|x)is the probability that the document has negative senti-
ment.
Logistic regression solves this task by learning, from a training set, a vector of
weightsand abias term. Each weightw i is a real number, and is associated with one
of the input featuresx i. The weightw i represents how important that input feature
is to the classification decision, and can be positive (providing evidence that the in-
stance being classified belongs in the positive class) or negative (providing evidence
that the instance being classified belongs in the negative class). Thus we might
expect in a sentiment task the wordawesometo have a high positive weight, and
abysmalto have a very negative weight. Thebias term, also called theintercept, isbias term
intercept another real number that’s added to the weighted inputs.
To make a decision on a test instance—after we’ve learned the weights in training—
the classifier first multiplies eachx i by its weightw i, sums up the weighted features,
and adds the bias termb. The resulting single numberzexpresses the weighted sum
of the evidence for the class.
z=
nX
i=1
wixi
!
+b(4.2)
In the rest of the book we’ll represent such sums using thedot productnotationdot product
from linear algebra. The dot product of two vectorsaandb, written asa·b, is the
sum of the products of the corresponding elements of each vector. (Notice that we
represent vectors using the boldface notationb). Thus the following is an equivalent
formation to Eq. 4.2:
z=w·x+b(4.3)
But note that nothing in Eq. 4.3 forceszto be a legal probability, that is, to lie
between 0 and 1. In fact, since weights are real-valued, the output might even be
negative;zranges from−∞to∞.
To create a probability, we’ll passzthrough thesigmoidfunction,σ(z). Thesigmoid
sigmoid function (named because it looks like ans) is also called thelogistic func-
tion, and gives logistic regression its name. The sigmoid has the following equation,logisticfunction
shown graphically in Fig. 4.1:
σ(z) = 11+e −z = 11+exp(−z) (4.4)
(For the rest of the book, we’ll use the notation exp(x)to meane x.) The sigmoid
has a number of advantages; it takes a real-valued number and maps it into the range

---

### Page 104

96CHAPTER4 • LOGISTICREGRESSION
Figure 4.1The sigmoid functionσ(z) = 11+e−z takes a real value and maps it to the range
(0,1). It is nearly linear around 0 but outlier values get squashed toward 0 or 1.
(0,1), which is just what we want for a probability. Because it is nearly linear around
0 but flattens toward the ends, it tends to squash outlier values toward 0 or 1. And
it’s differentiable, which as we’ll see in Section 4.15 will be handy for learning.
We’re almost there. If we apply the sigmoid to the sum of the weighted features,
we get a number between 0 and 1. To make it a probability, we just need to make
sure that the two cases,P(y=1)andP(y=0), sum to 1. We can do this as follows:
P(y=1) =σ(w·x+b)
= 11+exp(−(w·x+b))
P(y=0) =1−σ(w·x+b)
=1− 11+exp(−(w·x+b))
= exp(−(w·x+b))1+exp(−(w·x+b)) (4.5)
The sigmoid function has the property
1−σ(x) =σ(−x)(4.6)
so we could also have expressedP(y=0)asσ(−(w·x+b)).
Finally, two terminological points. First, the input to the sigmoid function, the
scorez=w·x+bfrom Eq. 4.3, is often called thelogit. This is because the logitlogit
function is the inverse of the sigmoid. The logit function is the log of the odds ratio
p
1−p :
logit(p) =σ−1(p) =ln p1−p (4.7)
Using the termlogitforzis a way of reminding us that by using the sigmoid to turn
z(which ranges from−∞to∞) into a probability, we are implicitly interpretingzas
not just any real-valued number, but as specifically a log odds.
Second, for binary classification it will be convenient to refer to the output of
the sigmoid functionσ(w·x+b)which is computingP(y=1), as ˆy. We pronounce
this symbol asy hat. We thus use ˆyto mean “the probability of the input observa-y hat
ˆy tion having the positive class”. When we introduce multinomial or softmax logistic
regression in Section 4.7, we will introduce an extension of ˆythat will be a vector
of probabilities over all the output classes, but for binary classification we just keep
one scalar probability, knowing that we can always compute the missing probability
P(y=0)as 1−P(y=1).

---

### Page 105

4.3 • CLASSIFICATION WITHLOGISTICREGRESSION97
4.3 Classification with Logistic Regression
The sigmoid function from the prior section thus gives us a way to take an instance
xand compute the probabilityP(y=1|x).
How do we make a decision about which class to apply to a test instancex? For
a givenx, we say yes if the probabilityP(y=1|x)is more than .5, and no otherwise.
We call .5 thedecision boundary:decisionboundary
decision(x) =
 1 ifP(y=1|x)>0.5
0 otherwise
Let’s have some examples of applying logistic regression as a classifier for language
tasks.
4.3.1 Sentiment Classification
Suppose we are doing binary sentiment classification on movie review text, and
we would like to know whether to assign the sentiment class+or−to a review
documentdoc. We’ll represent each input observation by the 6 featuresx 1 . . .x6 of
the input shown in the following table; Fig. 4.2 shows features in a sample mini test
document.
Var Definition Value in Fig. 4.2
x1 count(positive lexicon words∈doc)3
x2 count(negative lexicon words∈doc)2
x3

1 if “no”∈doc
0 otherwise 1
x4 count(1st and 2nd pronouns∈doc)3
x5
 1 if “!”∈doc
0 otherwise 0
x6 ln(word+punctuation count of doc)ln(66) =4.19
It's hokey . There are virtually no surprises , and the writing is second-rate .
So why was it so enjoyable  ? For one thing , the cast is
great . Another nice touch is the music . I was overcome with the urge to get off
the couch and start dancing .  It sucked me in , and it'll do the same to you  .
x1=3 x6=4.19
x3=1
x4=3x5=0
x2=2
Figure 4.2A sample mini test document showing the extracted features in the vectorx.
Let’s assume for the moment that we’ve already learned a real-valued weight for
each of these features, and that the 6 weights corresponding to the 6 features are
[2.5,−5.0,−1.2,0.5,2.0,0.7], whileb= 0.1. (We’ll discuss in the next section how
the weights are learned.) The weightw 1, for example, indicates how important the
number of positive lexicon words (great,nice,enjoyable, etc.) is to a positive senti-
ment decision, whilew 2 tells us the importance of negative lexicon words. Note that

---

### Page 106

98CHAPTER4 • LOGISTICREGRESSION
w1 =2.5 is positive, whilew 2 =−5.0, meaning that negative words are negatively
associated with a positive sentiment decision, and are about twice as important as
positive words.
Given these 6 features and the input reviewx,P(+|x)andP(−|x)can be com-
puted using Eq. 4.5:
P(+|x) =P(y=1|x) =σ(w·x+b)
=σ([2.5,−5.0,−1.2,0.5,2.0,0.7]·[3,2,1,3,0,4.19] +0.1)
=σ(.833)
=0.70(4.8)
P(−|x) =P(y=0|x) =1−σ(w·x+b)
=0.30
4.3.2 Other classification tasks and features
Logistic regression is applied to all sorts of NLP tasks, and any property of the input
can be a feature. Consider the task ofperiod disambiguation: deciding if a periodperioddisambiguation
is the end of a sentence or part of a word, by classifying each period into one of two
classes, EOS (end-of-sentence) and not-EOS. We might use features likex 1 below
expressing that the current word is lower case, perhaps with a positive weight. Or a
feature expressing that the current word is in our abbreviations dictionary (“Prof.”),
perhaps with a negative weight. A feature can also express a combination of proper-
ties. For example a period following a full upper case word is likely to be an EOS,
but if the word itself isSt.and the previous word is capitalized then the period is
likely part of a shortening of the wordstreetfollowing a street name.
x1 =

1 if “Case(w i) =Lower”
0 otherwise
x2 =
 1 if “w i ∈AcronymDict”
0 otherwise
x3 =
 1 if “w i =St. &Case(w i−1) =Upper”
0 otherwise
Designing versus learning features:In classic models, features are designed by
hand by examining the training set with an eye to linguistic intuitions and literature,
supplemented by insights from error analysis on the training set of an early version
of a system. We can also considerfeature interactions, complex features that arefeatureinteractions
combinations of more primitive features. We saw such a feature for period disam-
biguation above, where a period on the wordSt.was less likely to be the end of the
sentence if the previous word was capitalized. Features can be created automatically
viafeature templates, abstract specifications of features. For example a bigramfeaturetemplates
template for period disambiguation might create a feature for every pair of words
that occurs before a period in the training set. Thus the feature space is sparse, since
we only have to create a feature if that n-gram exists in that position in the training
set. The feature is generally created as a hash from the string descriptions. A user
description of a feature as, “bigram(American breakfast)” is hashed into a unique
integerithat becomes the feature numberf i.
It should be clear from the prior paragraph that designing features by hand re-
quires extensive human effort. For this reason, recent NLP systems avoid hand-
designed features and instead focus onrepresentation learning: ways to learn fea-

---

### Page 107

4.3 • CLASSIFICATION WITHLOGISTICREGRESSION99
tures automatically in an unsupervised way from the input. We’ll introduce methods
for representation learning in Chapter 5 and Chapter 6.
Scaling input features:When different input features have extremely different
ranges of values, it’s common to rescale them so they have comparable ranges. We
standardizeinput values by centering them to result in a zero mean and a standardstandardize
deviation of one (this transformation is sometimes called thez-score). That is, ifz-score
µi is the mean of the values of featurex i across themobservations in the input
dataset, andσ i is the standard deviation of the values of featuresx i across the input
dataset (note it’s not the sigmoid), we can replace each featurexi by a new featurex ′i
computed as follows:
µi = 1m mXj=1 x(j)i σi = vuut 1m mXj=1 x(j)i −µ i2
x′i = xi −µ iσi (4.9)
Alternatively, we cannormalizethe input features values to lie between 0 and 1:normalize
x′i = xi −min(x i)max(xi)−min(x i) (4.10)
Having input data with comparable range is useful when comparing values across
features. Data scaling is especially important in large neural networks, since it helps
speed up gradient descent.
Another very common type of scaling for natural language data is to take logs,
for example when inputs are word counts, or bigram counts, or anything else that
follows a Zipfian distribution.
4.3.3 Processing many examples at once
We’ve shown the equations for logistic regression for a single example. But in prac-
tice we’ll of course want to process an entire test set with many examples. Let’s
suppose we have a test set consisting ofmtest examples each of which we’d like
to classify. We’ll continue to use the notation from page 94, in which a superscript
value in parentheses refers to the example index in some set of data (either for train-
ing or for test). So in this case each test examplex (i) has a feature vectorx (i),
1≤i≤m. (As usual, we’ll represent vectors and matrices in bold.)
One way to compute ˆy(i) (which is how we refer toP(y (i) =1), i.e., the prob-
ability that the output for inputx (i) has the value 1), is just to have a for-loop and
compute each test example one at a time:
foreachx (i) in input[x (1),x (2), ...,x(m)]
ˆy(i) =P(y (i) =1) =σ(w·x (i) +b)(4.11)
For the first 3 test examples, then, we would be separately computing the pre-
dicted output probability as follows:
ˆy(1) =P(y (1) =1|x (1)) =σ(w·x (1) +b)
ˆy(2) =P(y (2) =1|x (2)) =σ(w·x (2) +b)
ˆy(3) =P(y (3) =1|x (3)) =σ(w·x (3) +b)

---

### Page 108

100CHAPTER4 • LOGISTICREGRESSION
But it turns out that we can slightly modify our original equation Eq. 4.5 to do
this much more efficiently. We’ll use matrix arithmetic to assign a class to all the
examples with one matrix operation!
First, we’ll pack all the input feature vectors for each inputxinto a single input
matrixX, where each rowiis a row vector consisting of the feature vector for in-
put examplex (i) (i.e., the vectorx (i)). Assuming each example hasffeatures and
weights,Xwill therefore be a matrix of shape[m×f], as follows:
X=

 x(1)1 x(1)2 . . .x(1)fx(2)1 x(2)2 . . .x(2)fx(3)1 x(3)2 . . .x(3)f
. . .

 (4.12)
Now if we introducebas a vector of lengthmwhich consists of the scalar bias
termbrepeatedmtimes,b= [b,b, ...,b], andˆ y= [ˆy(1),ˆy(2)...,ˆy(m)]as the vector of
outputs (one scalar ˆy(i) =P(y (i) =1)for each inputx (i) and its feature vectorx (i)),
and represent the weight vectorwas a column vector, we can compute all the outputs
with a single matrix multiplication and one addition:
ˆy=σ(Xw+b)(4.13)
We apply theσfunction here to a vector element-wise, soσ[z 1,z 2,z 3] = [σ(z1),σ(z 2),σ(z 3)].
You should convince yourself that Eq. 4.13 computes the same thing as our for-loop
in Eq. 4.11. For example ˆy(1), the first entry of the output vectorˆ y, will correctly be:
ˆy(1) =σ [x(1)1 ,x (1)2 , ...,x(1)f ]·[w 1,w 2, ...,wf ] +b (4.14)
Note that we had to reorderXandwfrom the order they appeared in Eq. 4.5 to
make the multiplications come out properly. Here is Eq. 4.13 again with the shapes
shown:
ˆy=σ(X w+b)
(m×1) (m×f) (f×1) (m×1)(4.15)
Modern compilers and compute hardware can compute this matrix operation very
efficiently, making the computation much faster, which becomes important when
training or testing on very large datasets.
Note by the way that we could have keptXandwin the original order (as
ˆy=σ(wX+b)) if we had chosen to defineXdifferently as a matrix of column
vectors, one vector for each input example, instead of row vectors, and then it would
have shape[f×m]. But we conventionally represent inputs as rows.
4.4 Learning in Logistic Regression
How are the parameters of the model, the weightswand biasb, learned? Binary
logistic regression is an instance of supervised classification in which we know the
correct labely(either 0 or 1) for each observationx. What the system produces via
Eq. 4.5 is ˆy, the system’s probability ofybeing 1, which we can think of an estimate
of the truey(which is either 1 or 0). We want to learn parameters (meaningwandb)

---

### Page 109

4.5 • THE CROSS-ENTROPY LOSS FUNCTION101
that make the probability value ˆyfor each training observation as close as possible
to the truey. That is, ifyis 1, then we want the system’s estimate ˆy=P(y=1)to
be high, i.e. as close to 1 as possible. Ifyis in fact 0, then we want the system’s
estimate ˆy=P(y=1)to be low, i.e. as close to 0 as possible.
This requires two components that we foreshadowed in the introduction to the
chapter. The first is a metric for how close ˆy(the system’s estimate of the probability
that the observation is in the positive class) is to the true gold labely. Rather than
measure similarity, we usually talk about the opposite of this: thedistancebetween
the system output and the gold output, and we call this distance thelossfunction orloss
thecost function. In the next section we’ll introduce the loss function that is com-
monly used for logistic regression and also for neural networks, thecross-entropy
loss.
The second thing we need is an optimization algorithm for iteratively updating
the weights so as to minimize this loss function. The standard algorithm for this is
gradient descent; we’ll introduce thestochastic gradient descentalgorithm in the
following section.
We’ll describe these algorithms for the simpler case of binary logistic regres-
sion in the next two sections, and then turn to multinomial logistic regression in
Section 4.8.
4.5 The cross-entropy loss function
We need a loss function that expresses, for an observationx, how close the classifier
output ( ˆy=σ(w·x+b)) is to the correct output (y, which is 0 or 1). Recall that
ˆyexpresses the probability that the classifier assigns to observationxbeing in the
positive class 1. So both ˆyandyexpress probabilities, butyis always 0 or 1 while ˆy
can also lie in between. We’ll call this measure of loss or distance:
L(ˆy,y) =How much ˆydiffers from the truey(4.16)
We do this via a loss function that prefers the correct class labels of the train-
ing examples to bemore likely. This is calledconditional maximum likelihood
estimation: we choose the parametersw,bthatmaximize the log probability of
the trueylabels in the training datagiven the observationsx. The resulting loss
function is thenegative log likelihood loss, generally called thecross-entropy loss.cross-entropyloss
Let’s derive this loss function, applied to a single observationx. We’d like to
learn weights that maximize the probability of the correct labelp(y|x). Since there
are only two discrete outcomes (1 or 0), this is a Bernoulli distribution, and we can
express the probabilityp(y|x)that our classifier produces for one observation as the
following (keeping in mind that ify=1, Eq. 4.17 simplifies to ˆy; ify=0, Eq. 4.17
simplifies to 1−ˆy):
p(y|x) =ˆy y (1−ˆy)1−y (4.17)
Now we take the log of both sides. This will turn out to be handy mathematically,
and doesn’t hurt us; whatever values maximize a probability will also maximize the
log of the probability:
logp(y|x) =log

ˆyy (1−ˆy)1−y
=ylog ˆy+ (1−y)log(1−ˆy)(4.18)

---

### Page 110

102CHAPTER4 • LOGISTICREGRESSION
Eq. 4.18 describes a log likelihood that should be maximized. In order to turn this
into a loss function (something that we need to minimize), we’ll just flip the sign on
Eq. 4.18. The result is the cross-entropy lossL CE:
LCE(ˆy,y) =−logp(y|x) =−[ylog ˆy+ (1−y)log(1−ˆy)](4.19)
Finally, we can plug in the definition of ˆy=σ(w·x+b):
LCE(ˆy,y) =−[ylogσ(w·x+b) + (1−y)log(1−σ(w·x+b))](4.20)
Let’s see if this loss function does the right thing for our example from Fig. 4.2. We
want the loss to be smaller if the model’s estimate is close to correct, and bigger if
the model is confused. So first let’s suppose the correct gold label for the sentiment
example in Fig. 4.2 is positive, i.e.,y=1. In this case our model is doing well, since
from Eq. 4.8 it indeed gave the example a higher probability of being positive (.70)
than negative (.30). If we plugσ(w·x+b) =.70 andy=1 into Eq. 4.20, the right
side of the equation drops out, leading to the following loss (we’ll use log to mean
natural log when the base is not specified):
LCE(ˆy,y) =−[ylogσ(w·x+b) + (1−y)log(1−σ(w·x+b))]
=−[logσ(w·x+b)]
=−log(.70)
=.36
By contrast, let’s pretend instead that the example in Fig. 4.2 was actually negative,
i.e.,y=0 (perhaps the reviewer went on to say “But bottom line, the movie is
terrible! I beg you not to see it!”). In this case our model is confused and we’d want
the loss to be higher. Now if we plugy=0 and 1−σ(w·x+b) =.30 from Eq. 4.8
into Eq. 4.20, the left side of the equation drops out:
LCE(ˆy,y) =−[ylogσ(w·x+b)+(1−y)log(1−σ(w·x+b))]
=−[log(1−σ(w·x+b))]
=−log(.30)
=1.2
Sure enough, the loss for predicting the correct label (.36) is less than the loss for
predicting the incorrect label (1.2).
Why does minimizing this negative log probability do what we want? A perfect
classifier would assign probability 1 to the correct outcome (y=1 ory=0) and
probability 0 to the incorrect outcome. That means ifyequals 1, the higher ˆyis (the
closer it is to 1), the better the classifier; the lower ˆyis (the closer it is to 0), the
worse the classifier. Ifyequals 0, instead, the higher 1−ˆyis (closer to 1), the better
the classifier. The negative log of ˆy(if the trueyequals 1) or 1−ˆy(if the truey
equals 0) is a convenient loss metric since it goes from 0 (negative log of 1, no loss)
to infinity (negative log of 0, infinite loss). This loss function also ensures that as
the probability of the correct answer is maximized, the probability of the incorrect
answer is minimized; since the two sum to one, any increase in the probability of the
correct answer is coming at the expense of the incorrect answer. It’s called the cross-
entropy loss, because Eq. 4.19 is also the formula for thecross-entropybetween the
true probability distributionyand our estimated distribution ˆy.
Now we know what we want to minimize; in the next section, we’ll see how to
find the minimum.

---

### Page 111

4.6 • GRADIENTDESCENT103
4.6 Gradient Descent
Our goal with gradient descent is to find the optimal weights: minimize the loss
function we’ve defined for the model. In Eq. 4.21 below, we’ll explicitly represent
the fact that the cross-entropy loss functionL CE is parameterized by the weights. In
machine learning in general we refer to the parameters being learned asθ; in the
case of logistic regressionθ={w,b}. So we’ll represent ˆy (i) asf(x (i);θ)to make
the dependence onθmore obvious. The goal is to find the set of weights which
minimizes the loss function, averaged over all examples:
ˆθ=argmin
θ
1
m
mX
i=1
LCE(f(x (i);θ),y (i))(4.21)
How shall we find the minimum of this (or any) loss function? Gradient descent is
a method that finds a minimum of a function by figuring out in which direction (in
the space of the parametersθ) the function’s slope is rising the most steeply, and
moving in the opposite direction. The intuition is that if you are hiking in a canyon
and trying to descend most quickly down to the river at the bottom, you might look
around yourself in all directions, find the direction where the ground is sloping the
steepest, and walk downhill in that direction.
For logistic regression, this loss function is convenientlyconvex. A convex func-convex
tion has at most one minimum; there are no local minima to get stuck in, so gradient
descent starting from any point is guaranteed to find the minimum. (By contrast,
the loss for multi-layer neural networks is non-convex, and gradient descent may
get stuck in local minima for neural network training and never find the global opti-
mum.)
Although the algorithm (and the concept of gradient) are designed for direction
vectors, let’s first consider a visualization of the case where the parameter of our
system is just a single scalarw, shown in Fig. 4.3.
Given a random initialization ofwat some valuew 1, and assuming the loss
functionLhappened to have the shape in Fig. 4.3, we need the algorithm to tell us
whether at the next iteration we should move left (makingw 2 smaller thanw 1) or
right (makingw 2 bigger thanw 1) to reach the minimum.
The gradient descent algorithm answers this question by finding thegradientgradient
of the loss function at the current point and moving in the opposite direction. The
gradient of a function of many variables is a vector pointing in the direction of the
greatest increase in a function. The gradient is a multi-variable generalization of the
slope, so for a function of one variable like the one in Fig. 4.3, we can informally
think of the gradient as the slope. The dotted line in Fig. 4.3 shows the slope of this
hypothetical loss function at pointw=w 1. You can see that the slope of this dotted
line is negative. Thus to find the minimum, gradient descent tells us to go in the
opposite direction: movingwin a positive direction.
The magnitude of the amount to move in gradient descent is the value of the
slope ddw L(f(x;w),y)weighted by alearning rateη. A higher (faster) learninglearning rate
rate means that we should movewmore on each step. The change we make in our
parameter is the learning rate times the gradient (or the slope, in our single-variable
example):
wt+1 =w t −η ddw L(f(x;w),y)(4.22)
Now let’s extend the intuition from a function of one scalar variablewto many

---

### Page 112

104CHAPTER4 • LOGISTICREGRESSION
w
Loss
0
w1 wmin
slope of loss at w1
is negative
(goal)
one step
of gradient
descent
Figure 4.3The first step in iteratively finding the minimum of this loss function, by moving
win the reverse direction from the slope of the function. Since the slope is negative, we need
to movewin a positive direction, to the right. Here superscripts are used for learning steps,
sow 1 means the initial value ofw(which is 0),w 2 the value at the second step, and so on.
variables, because we don’t just want to move left or right, we want to know where
in the N-dimensional space (of theNparameters that make upθ) we should move.
Thegradientis just such a vector; it expresses the directional components of the
sharpest slope along each of thoseNdimensions. If we’re just imagining two weight
dimensions (say for one weightwand one biasb), the gradient might be a vector with
two orthogonal components, each of which tells us how much the ground slopes in
thewdimension and in thebdimension. Fig. 4.4 shows a visualization of the value
of a 2-dimensional gradient vector taken at the red point.
In an actual logistic regression, the parameter vectorwis much longer than 1 or
2, since the input feature vectorxcan be quite long, and we need a weightw i for
eachx i. For each dimension/variablew i inw(plus the biasb), the gradient will have
a component that tells us the slope with respect to that variable. In each dimension
wi, we express the slope as a partial derivative ∂∂w i of the loss function. Essentiallywe’re asking: “How much would a small change in that variablew i influence the
total loss functionL?”
Formally, then, the gradient of a multi-variable functionfis a vector in which
Cost(w,b)
w b
Figure 4.4Visualization of the gradient vector at the red point in two dimensionswand
b, showing a red arrow in the x-y plane pointing in the direction we will go to look for the
minimum: the opposite direction of the gradient (recall that the gradient points in the direction
of increase not decrease).

---

### Page 113

4.6 • GRADIENTDESCENT105
each component expresses the partial derivative offwith respect to one of the vari-
ables. We’ll use the inverted Greek delta symbol∇to refer to the gradient, and
represent ˆyasf(x;θ)to make the dependence onθmore obvious:
∇L(f(x;θ),y) =


∂
∂w 1 L(f(x;θ),y)∂
∂w 2 L(f(x;θ),y)...
∂
∂w n L(f(x;θ),y)∂
∂b L(f(x;θ),y)

 (4.23)
The final equation for updatingθbased on the gradient is thus
θ t+1 =θ t −η∇L(f(x;θ),y)(4.24)
4.6.1 The Gradient for Logistic Regression
In order to updateθ, we need a definition for the gradient∇L(f(x;θ),y). Recall that
for logistic regression, the cross-entropy loss function is:
LCE(ˆy,y) =−[ylogσ(w·x+b) + (1−y)log(1−σ(w·x+b))](4.25)
It turns out that the derivative of this function for one observation vectorxis Eq. 4.26
(the interested reader can see Section 4.15 for the derivation of this equation):
∂L CE(ˆy,y)
∂w j
= [σ(w·x+b)−y]x j
= (ˆy−y)xj (4.26)
You’ll also sometimes see this equation in the equivalent form:
∂L CE(ˆy,y)
∂w j
=−(y−ˆy)x j (4.27)
Note in these equations that the gradient with respect to a single weightw j rep-
resents a very intuitive value: the difference between the trueyand our estimated
ˆy=σ(w·x+b)for that observation, multiplied by the corresponding input value
x j.
By the way, we’ll also need a term for the partial derivative with respect tob.
That turns out to be:
∂L CE(ˆy,y)
∂b =σ(w·x+b)−y
=ˆy−y(4.28)
4.6.2 The Stochastic Gradient Descent Algorithm
Stochastic gradient descent is an online algorithm that minimizes the loss function
by computing its gradient after each training example, and nudgingθin the right
direction (the opposite direction of the gradient). (An “online algorithm” is one that
processes its input example by example, rather than waiting until it sees the entire
input.) Stochastic gradient descent is calledstochasticbecause it chooses a single
random example at a time; in Section 4.6.4 we’ll discuss other versions of gradient
descent that batch many examples at once. Fig. 4.5 shows the algorithm.

---

### Page 114

106CHAPTER4 • LOGISTICREGRESSION
functionSTOCHASTICGRADIENTDESCENT(L(),f(),x,y)returnsθ
# where: L is the loss function
# f is a function parameterized byθ
# x is the set of training inputsx (1),x (2), ...,x(m)
# y is the set of training outputs (labels)y (1),y (2), ...,y(m)
θ←0 # (or small random values)
repeattil done # see caption
For each training tuple(x (i),y (i))(in random order)
1. Optional (for reporting): # How are we doing on this tuple?
Compute ˆy(i) =f(x (i);θ)# What is our estimated output ˆy?
Compute the lossL(ˆy(i),y (i))# How far off is ˆy (i) from the true outputy (i)?
2.g←∇ θ L(f(x (i);θ),y (i))# How should we moveθto maximize loss?
3.θ←θ−ηg# Go the other way instead
returnθ
Figure 4.5The stochastic gradient descent algorithm. Step 1 (computing the loss) is used
mainly to report how well we are doing on the current tuple; we don’t need to compute the
loss in order to compute the gradient. The algorithm can terminate when it converges (when
the gradient norm<ϵ), or when progress halts (for example when the loss starts going up on
a held-out set). Weights are initialized to 0 for logistic regression, but to small random values
for neural networks, as we’ll see in Chapter 6.
The learning rateηis ahyperparameterthat must be adjusted. If it’s too high,hyperparameter
the learner will take steps that are too large, overshooting the minimum of the loss
function. If it’s too low, the learner will take steps that are too small, and take too
long to get to the minimum. It is common to start with a higher learning rate and then
slowly decrease it, so that it is a function of the iterationkof training; the notation
ηk can be used to mean the value of the learning rate at iterationk.
We’ll discuss hyperparameters in more detail in Chapter 6, but in short, they are
a special kind of parameter for any machine learning model. Unlike regular param-
eters of a model (weights likewandb), which are learned by the algorithm from
the training set, hyperparameters are special parameters chosen by the algorithm
designer that affect how the algorithm works.
4.6.3 Working Through an Example
Let’s walk through a single step of the gradient descent algorithm. We’ll use a
simplified version of the example in Fig. 4.2 as it sees a single observationx, whose
correct value isy=1 (this is a positive review), and with a feature vectorx= [x 1,x 2]
consisting of these two features:
x1 =3 (count of positive lexicon words)
x2 =2 (count of negative lexicon words)
Let’s assume the initial weights and bias inθ0 are all set to 0, and the initial learning
rateηis 0.1:
w1 =w 2 =b=0
η=0.1

---

### Page 115

4.6 • GRADIENTDESCENT107
The single update step requires that we compute the gradient, multiplied by the
learning rate
θ t+1 =θ t −η∇ θ L(f(x (i);θ),y (i))
In our mini example there are three parameters, so the gradient vector has 3 dimen-
sions, forw 1,w 2, andb. We can compute the first gradient as follows:
∇w,bL=


∂L CE(ˆy,y)
∂w 1
∂L CE(ˆy,y)
∂w 2
∂L CE(ˆy,y)
∂b

 =


(σ(w·x+b)−y)x 1
(σ(w·x+b)−y)x 2
σ(w·x+b)−y

 =


(σ(0)−1)x 1
(σ(0)−1)x 2
σ(0)−1

 =


−0.5x1
−0.5x2
−0.5

 =


−1.5
−1.0
−0.5


Now that we have a gradient, we compute the new parameter vectorθ 1 by moving
θ 0 in the opposite direction from the gradient:
θ 1 =


w1
w2
b

 −η


−1.5
−1.0
−0.5

 =


.15
.1
.05


So after one step of gradient descent, the weights have shifted to be:w 1 =.15,
w2 =.1, andb=.05.
Note that this observationxhappened to be a positive example. We would expect
that after seeing more negative examples with high counts of negative words, that
the weightw 2 would shift to have a negative value.
4.6.4 Mini-batch training
Stochastic gradient descent is called stochastic because it chooses a single random
example at a time, moving the weights so as to improve performance on that single
example. That can result in very choppy movements, so it’s common to compute the
gradient over batches of training instances rather than a single instance.
For example inbatch trainingwe compute the gradient over the entire dataset.batch training
By seeing so many examples, batch training offers a superb estimate of which di-
rection to move the weights, at the cost of spending a lot of time processing every
single example in the training set to compute this perfect direction.
A compromise ismini-batchtraining: we train on a group ofmexamples (per-mini-batch
haps 512, or 1024) that is less than the whole dataset. (Ifmis the size of the dataset,
then we are doingbatchgradient descent; ifm=1, we are back to doing stochas-
tic gradient descent.) Mini-batch training also has the advantage of computational
efficiency. The mini-batches can easily be vectorized, choosing the size of the mini-
batch based on the computational resources. This allows us to process all the exam-
ples in one mini-batch in parallel and then accumulate the loss, something that’s not
possible with individual training.
We just need to define mini-batch versions of the cross-entropy loss function
we defined in Section 4.5 and the gradient in Section 4.6.1. Let’s extend the cross-
entropy loss for one example from Eq. 4.19 to mini-batches of sizem. We’ll continue
to use the notation thatx (i) andy (i) mean theith training features and training label,

---

### Page 116

108CHAPTER4 • LOGISTICREGRESSION
respectively. We make the assumption that the training examples are independent:
logp(training labels) =log
mY
i=1
p(y(i)|x(i))
=
mX
i=1
logp(y (i)|x(i))
=−
mX
i=1
LCE(ˆy(i),y (i))(4.29)
Now the cost function for the mini-batch ofmexamples is the average loss for each
example:
Cost(ˆy,y) = 1m mXi=1 LCE(ˆy(i),y (i))
=− 1m mXi=1 y(i) logσ(w·x (i) +b) + (1−y(i))log 1−σ(w·x (i) +b)  (4.30)
The mini-batch gradient is the average of the individual gradients from Eq. 4.26:
∂Cost(ˆy,y)
∂w j
= 1m mXi=1 hσ(w·x (i) +b)−y (i)ix(i)j (4.31)
Instead of using the sum notation, we can more efficiently compute the gradient
in its matrix form, following the vectorization we saw on page 100, where we have
a matrixXof size[m×f]representing theminputs in the batch, and a vectoryof
size[m×1]representing the correct outputs:
∂Cost(ˆy,y)
∂w = 1m (ˆy−y) ⊺ X
= 1m (σ(Xw+b)−y) ⊺ X(4.32)
4.7 Multinomial logistic regression
Sometimes we need more than two classes. Perhaps we might want to do 3-way
sentiment classification (positive, negative, or neutral). Or we could be assigning
some of the labels we will introduce in Chapter 18, like the part of speech of a word
(choosing from 10, 30, or even 50 different parts of speech), or the named entity
type of a phrase (choosing from tags like person, location, organization). Or, for
large language models, we’ll be predicting the next word out of the|V|possible
words in the vocabulary, so it’s|V|-way classification.
In such cases we usemultinomial logistic regression, also calledsoftmax re-
multinomial
logistic
regression
gression(in older NLP literature you will sometimes see the namemaxent classi-
fier). In multinomial logistic regression we want to label each observation with a
classkfrom a set ofKclasses, under the stipulation that only one of these classes is
the correct one (sometimes calledhard classification; an observation can not be in

---

### Page 117

4.7 • MULTINOMIAL LOGISTIC REGRESSION109
multiple classes). Let’s use the following representation: the outputyfor each input
xwill be a vector of lengthK. If classcis the correct class, we’ll sety c =1, and
set all the other elements ofyto be 0, i.e.,y c =1 andy j =0∀j̸=c. A vector like
thisy, with one value=1 and the rest 0, is called aone-hot vector. The job of the
classifier is to produce an estimate vectorˆ y. For each classk, the value ˆyk will be
the classifier’s estimate of the probabilityP(y k =1|x).
4.7.1 Softmax
The multinomial logistic classifier uses a generalization of the sigmoid, called the
softmaxfunction, to computep(y k =1|x). The softmax function takes a vectorsoftmax
z= [z1,z 2, ...,zK]ofKarbitrary values and maps them to a probability distribution,
with each value in the range [0,1], and all the values summing to 1. Like the sigmoid,
it is an exponential function.
For a vectorzof dimensionalityK, the softmax is defined as:
softmax(zi) = exp(z i)PK
j=1 exp(z j)
1≤i≤K(4.33)
The softmax of an input vectorz= [z 1,z 2, ...,zK]is thus a vector itself:
softmax(z) =
"
exp(z 1)PK
i=1 exp(z i)
, exp(z 2)PK
i=1 exp(z i)
, ..., exp(z K)PK
i=1 exp(z i)
#
(4.34)
The denominator PKi=1 exp(z i)is used to normalize all the values into probabilities.
Thus for example given a vector:
z= [0.6,1.1,−1.5,1.2,3.2,−1.1]
the resulting (rounded) softmax(z) is
[0.05,0.09,0.01,0.1,0.74,0.01]
Like the sigmoid, the softmax has the property of squashing values toward 0 or 1.
Thus if one of the inputs is larger than the others, it will tend to push its probability
toward 1, and suppress the probabilities of the smaller inputs.
Finally, note that, just as for the sigmoid, we refer toz, the vector of scores that
is the input to the softmax, aslogits(see Eq. 4.7).
4.7.2 Applying softmax in logistic regression
When we apply softmax for logistic regression, the input will (just as for the sig-
moid) be the dot product between a weight vectorwand an input vectorx(plus a
bias). But now we’ll need separate weight vectorsw k and biasb k for each of theK
classes. The probability of each of our output classes ˆyk can thus be computed as:
P(yk =1|x) = exp(w k ·x+b k)KX
j=1
exp(w j ·x+b j)
(4.35)
The form of Eq. 4.35 makes it seem that we would compute each output sep-
arately. Instead, it’s more common to set up the equation for more efficient com-
putation by modern vector processing hardware. We’ll do this by representing the

---

### Page 118

110CHAPTER4 • LOGISTICREGRESSION
set ofKweight vectors as a weight matrixWand a bias vectorb. Each rowkof
Wcorresponds to the vector of weightsw k.Wthus has shape[K×f], forKthe
number of output classes andfthe number of input features. The bias vectorbhas
one value for each of theKoutput classes. If we represent the weights in this way,
we can compute ˆy, the vector of output probabilities for each of theKclasses, by a
single elegant equation:
ˆy=softmax(Wx+b)(4.36)
If you work out the matrix arithmetic, you can see that the estimated score of
the first output class ˆy1 (before we take the softmax) will correctly turn out to be
w1 ·x+b 1.
One helpful interpretation of the weight matrixWis to see each roww k as a
prototypeof classk. The weight vectorw k that is learned represents the class asprototype
a kind of template. Since two vectors that are more similar to each other have a
higher dot product with each other, the dot product acts as a similarity function.
Logistic regression is thus learning a prototype representation for each class, such
that incoming vectors are assigned the classkthey are most similar to from theK
classes (Doumbouya et al., 2025).
Fig. 4.6 shows the difference between binary and multinomial logistic regression
by illustrating the weight vector versus weight matrix in the computation of the
output class probabilities.
4.7.3 Features in Multinomial Logistic Regression
Features in multinomial logistic regression act like features in binary logistic regres-
sion, with the difference mentioned above that we’ll need separate weight vectors
and biases for each of theKclasses. Recall our binary exclamation point featurex 5
from page 97:
x5 =
 1 if “!”∈doc
0 otherwise
In binary classification a positive weightw 5 on a feature influences the classifier
towardy=1 (positive sentiment) and a negative weight influences it towardy=0
(negative sentiment) with the absolute value indicating how important the feature
is. For multinomial logistic regression, by contrast, with separate weights for each
class, a feature can be evidence for or against each individual class.
In 3-way multiclass sentiment classification, for example, we must assign each
document one of the 3 classes+,−, or 0 (neutral). Now a feature related to excla-
mation marks might have a negative weight for 0 documents, and a positive weight
for+or−documents:
Feature Definitionw 5,+ w5,− w5,0
f5(x)
 1 if “!”∈doc
0 otherwise 3.5 3.1−5.3
Because these feature weights are dependent both on the input text and the output
class, we sometimes make this dependence explicit and represent the features them-
selves asf(x,y): a function of both the input and the class. Using such a notation
f5(x)above could be represented as three featuresf 5(x,+),f 5(x,−), andf 5(x,0),
each of which has a single weight. We’ll use this kind of notation in our description
of the CRF in Chapter 18.

---

### Page 119

4.8 • LEARNING INMULTINOMIALLOGISTICREGRESSION111
Binary Logistic Regression
w
[f ⨉1]
Output
sigmoid
[1⨉f]
Input words
p(+) = 1- p(-)
…
y^
x
y
Input feature
vector
[scalar]
positive lexicon
words = 1
count of
“no” = 0
wordcount
=3
x1 x2 x3 xf
dessert   was    great
Weight vector
Multinomial Logistic Regression
W
[f⨉1]
Output
softmax
[K⨉f]
Input words
p(+)
…
y1^ y2^ y3^
x
y
Input feature
vector
[K⨉1]
positive lexicon
words = 1
count of
“no” = 0
wordcount
=3
x1 x2 x3 xf
dessert   was    great
p(-) p(neut)
Weight
matrix
These f red weights
are a row of W
corresponding
to weight vector w3,
(= weights for class 3,
= a prototype of class 3)
Figure 4.6Binary versus multinomial logistic regression. Binary logistic regression uses a
single weight vectorw, and has a scalar output ˆy. In multinomial logistic regression we have
Kseparate weight vectors corresponding to theKclasses, all packed into a single weight
matrixW, and a vector output ˆy. We omit the biases from both figures for clarity.
4.8 Learning in Multinomial Logistic Regression
The loss function for multinomial logistic regression generalizes the loss function
for binary logistic regression from 2 toKclasses. Recall that the cross-entropy loss
for binary logistic regression (repeated from Eq. 4.19) is:
LCE(ˆy,y) =−logp(y|x) =−[ylog ˆy+ (1−y)log(1−ˆy)](4.37)
The loss function for multinomial logistic regression generalizes the two terms in
Eq. 4.37 (one that is non-zero wheny=1 and one that is non-zero wheny=0) to
Kterms. As we mentioned above, for multinomial regression we’ll represent bothy
and ˆyas vectors. The true labelyis a vector withKelements, each corresponding
to a class, withy c =1 if the correct class isc, with all other elements ofybeing 0.
And our classifier will produce an estimate vector withKelements ˆy, each element
ˆyk of which represents the estimated probabilityp(y k =1|x).

---

### Page 120

112CHAPTER4 • LOGISTICREGRESSION
The loss function for a single examplex, generalizing from binary logistic re-
gression, is the sum of the logs of theKoutput classes, each weighted by the indi-
cator functiony k (Eq. 4.38). This turns out to be just the negative log probability of
the correct classc(Eq. 4.39):
LCE(ˆy,y) =−
KX
k=1
yk log ˆyk (4.38)
=−log ˆy c,(wherecis the correct class)(4.39)
=−log ˆp(y c =1|x)(wherecis the correct class)
=−log exp(w c ·x+b c)PK
j=1 exp(w j ·x+b j)
(cis the correct class)(4.40)
How did we get from Eq. 4.38 to Eq. 4.39? Because only one class (let’s call itc) is
the correct one, the vectorytakes the value 1 only for this value ofk, i.e., hasy c =1
andy j =0∀j̸=c. That means the terms in the sum in Eq. 4.38 will all be 0 except
for the term corresponding to the true classc. Hence the cross-entropy loss is simply
the negative log of the output probability corresponding to the correct class, and we
therefore also call Eq. 4.39 thenegative log likelihood loss.negative loglikelihood loss
Of course for gradient descent we don’t need the loss, we need its gradient. The
gradient for a single example turns out to be very similar to the gradient for binary
logistic regression,(ˆy−y)x, that we saw in Eq. 4.26. Let’s consider one piece of the
gradient, the derivative for a single weight. For each classk, the weight of theith
element of inputxisw k,i. What is the partial derivative of the loss with respect to
wk,i? This derivative turns out to be just the difference between the true value for the
classk(which is either 1 or 0) and the probability the classifier outputs for classk,
weighted by the value of the inputx i corresponding to theith element of the weight
vector for classk:
∂L CE
∂w k,i
=−(y k −ˆyk)xi
=−(y k −p(y k =1|x))x i
=−
yk − exp(w k ·x+b k)PK
j=1 exp(w j ·x+b j)
!
xi (4.41)
4.9 Evaluation: Precision, Recall, F-measure
To introduce the methods for evaluating text classification, let’s first consider some
simple binarydetectiontasks. For example, in spam detection, our goal is to label
every text as being in the spam category (“positive”) or not in the spam category
(“negative”). For each item (email document) we therefore need to know whether
our system called it spam or not. We also need to know whether the email is actually
spam or not, i.e. the human-defined labels for each document that we are trying to
match. We will refer to these human labels as thegold labels.gold labels
Or imagine you’re the CEO of theDelicious Pie Companyand you need to know
what people are saying about your pies on social media, so you build a system that
detects tweets concerning Delicious Pie. Here the positive class is tweets about
Delicious Pie and the negative class is all other tweets.

---

### Page 121

4.9 • EVALUATION: PRECISION, RECALL, F-MEASURE113
In both cases, we need a metric for knowing how well our spam detector (or
pie-tweet-detector) is doing. To evaluate any system for detecting things, we start
by building aconfusion matrixlike the one shown in Fig. 4.7. A confusion matrixconfusionmatrix
is a table for visualizing how an algorithm performs with respect to the human gold
labels, using two dimensions (system output and gold labels), and each cell labeling
a set of possible outcomes. In the spam detection case, for example, true positives
are documents that are indeed spam (indicated by human-created gold labels) that
our system correctly said were spam. False negatives are documents that are indeed
spam but our system incorrectly labeled as non-spam.
To the bottom right of the table is the equation foraccuracy, which asks what
percentage of all the observations (for the spam or pie examples that means all emails
or tweets) our system labeled correctly. Although accuracy might seem a natural
metric, we generally don’t use it for text classification tasks. That’s because accuracy
doesn’t work well when the classes are unbalanced (as indeed they are with spam,
which is a large majority of email, or with tweets, which are mainly not about pie).
true positive
false negative
false positive
true negative
gold positivegold negative
system
positive
system
negative
gold standard labels
system
output
labels
recall = tptp+fn
precision = tptp+fp
accuracy = tp+tntp+fp+tn+fn
Figure 4.7A confusion matrix for visualizing how well a binary classification system per-
forms against gold standard labels.
To make this more explicit, imagine that we looked at a million tweets, and
let’s say that only 100 of them are discussing their love (or hatred) for our pie,
while the other 999,900 are tweets about something completely unrelated. Imagine a
simple classifier that stupidly classified every tweet as “not about pie”. This classifier
would have 999,900 true negatives and only 100 false negatives for an accuracy of
999,900/1,000,000 or 99.99%! What an amazing accuracy level! Surely we should
be happy with this classifier? But of course this fabulous ‘no pie’ classifier would
be completely useless, since it wouldn’t find a single one of the customer comments
we are looking for. In other words, accuracy is not a good metric when the goal is
to discover something that is rare, or at least not completely balanced in frequency,
which is a very common situation in the world.
That’s why instead of accuracy we generally turn to two other metrics shown in
Fig. 4.7:precisionandrecall.Precisionmeasures the percentage of the items thatprecision
the system detected (i.e., the system labeled as positive) that are in fact positive (i.e.,
are positive according to the human gold labels). Precision is defined as
Precision= true positivestrue positives + false positives
Recallmeasures the percentage of items actually present in the input that wererecall
correctly identified by the system. Recall is defined as

---

### Page 122

114CHAPTER4 • LOGISTICREGRESSION
Recall= true positivestrue positives + false negatives
Precision and recall will help solve the problem with the useless “nothing is
pie” classifier. This classifier, despite having a fabulous accuracy of 99.99%, has
a terrible recall of 0 (since there are no true positives, and 100 false negatives, the
recall is 0/100). You should convince yourself that the precision at finding relevant
tweets is equally problematic. Thus precision and recall, unlike accuracy, emphasize
true positives: finding the things that we are supposed to be looking for.
There are many ways to define a single metric that incorporates aspects of both
precision and recall. The simplest of these combinations is theF-measure(vanF-measure
Rijsbergen, 1975), defined as:
Fβ = (β 2 +1)PRβ 2P+R
Theβparameter differentially weights the importance of recall and precision,
based perhaps on the needs of an application. Values ofβ>1 favor recall, while
values ofβ<1 favor precision. Whenβ=1, precision and recall are equally bal-
anced; this is the most frequently used metric, and is called Fβ=1 or just F1:F1
F1 = 2PRP+R (4.42)
F-measure comes from a weighted harmonic mean of precision and recall. The
harmonic mean of a set of numbers is the reciprocal of the arithmetic mean of recip-
rocals:
HarmonicMean(a1,a 2,a 3,a 4, ...,an) = n1
a1 + 1a2 + 1a3 +...+ 1an (4.43)
and hence F-measure is
F= 1α 1P + (1−α)1R or withβ 2 = 1−αα  F= (β 2 +1)PRβ 2P+R (4.44)
Harmonic mean is used because the harmonic mean of two values is closer to the
minimum of the two values than the arithmetic mean is. Thus it weighs the lower of
the two numbers more heavily, which is more conservative in this situation.
4.9.1 Evaluating with more than two classes
The simple example we gave above in defining precision and recall involved text
classification with only two classes. But as we saw in Section 4.7, lots of NLP
classification tasks have more than two classes. Even for sentiment analysis we often
have 3 classes (positive, negative, neutral) and many more classes are common in
tasks like text classification or emotion detection, and so on.
To deal with more than two classes we’ll need to slightly modify our definitions
of precision and recall. Consider the sample confusion matrix for a hypothetical 3-
wayone-ofemail categorization decision (urgent, normal, spam) shown in Fig. 4.8.
The matrix shows, for example, that the system mistakenly labeled one spam docu-
ment as urgent, and we have shown how to compute a distinct precision and recall
value for each class. In order to derive a single metric that tells us how well the

---

### Page 123

4.10 • TEST SETS ANDCROSS-VALIDATION115
8
5
10
60
urgentnormal
gold labels
system
output
recallu =
8
8+5+3
precisionu= 88+10+11
50
30200
spam
urgent
normal
spam 3
recalln = recalls =
precisionn= 605+60+50
precisions= 2003+30+200
60
10+60+30
200
1+50+200
Figure 4.8Confusion matrix for a three-class categorization task, showing for each pair of
classes(c 1,c 2), how many documents fromc 1 were (in)correctly assigned toc 2.
system is doing, we can combine these values in two ways. Inmacroaveraging,macroaveraging
we compute the performance for each class, and then average over classes. Inmi-
croaveraging, we collect the decisions for all classes into a single confusion matrix,microaveraging
and then compute precision and recall from that table. Fig. 4.9 shows the confusion
matrix for each class separately, and shows the computation of microaveraged and
macroaveraged precision.1
8
8
11
340
true
urgent
true
not
system
urgent
system
not
60
40
55
212
true
normal
true
not
system
normal
system
not
200
51
33
83
true
spam
true
not
system
spam
system
not
268
99
99
635
true
yes
true
no
system
yes
system
no
precision =8+118= .42 precision =200+33200= .86precision =60+5560= .52 microaverageprecision 268+99268 = .73=
macroaverage
precision 3
.42+.52+.86= .60=
PooledClass 3: SpamClass 2: NormalClass 1: Urgent
Figure 4.9Separate confusion matrices for the 3 classes from the previous figure, showing the pooled confu-
sion matrix and the microaveraged and macroaveraged precision.
As the figure shows, a microaverage is dominated by the more frequent class (in
this case spam), since the counts are pooled. The macroaverage better reflects the
statistics of the smaller classes, and so is more appropriate when performance on all
the classes is equally important.
4.10 Test sets and Cross-validation
The training and testing procedure for text classification follows what we saw with
language modeling (Section 3.2): we use the training set to train the model, then use
thedevelopment test set(also called adevset) to perhaps tune some parameters,developmenttest set
devset
1 Note that the microaverage precision is always equal to the microaverage recall.

---

### Page 124

116CHAPTER4 • LOGISTICREGRESSION
and in general decide what the best model is. Once we come up with what we think
is the best model, we run it on the (hitherto unseen) test set to report its performance.
While the use of a devset avoids overfitting the test set, having a fixed train-
ing set, devset, and test set creates another problem: in order to save lots of data
for training, the test set (or devset) might not be large enough to be representative.
Wouldn’t it be better if we could somehow use all our data for training and still use
all our data for test? We can do this bycross-validation.cross-validation
In cross-validation, we choose a numberk, and partition our data intokdisjoint
subsets calledfolds. Now we choose one of thosekfolds as a test set, train ourfolds
classifier on the remainingk−1 folds, and then compute the error rate on the test
set. Then we repeat with another fold as the test set, again training on the otherk−1
folds. We do this sampling processktimes and average the test set error rate from
thesekruns to get an average error rate. If we choosek=10, we would train 10
different models (each on 90% of our data), test the model 10 times, and average
these 10 values. This is called10-fold cross-validation.10-foldcross-validation
The only problem with cross-validation is that because all the data is used for
testing, we need the whole corpus to be blind; we can’t examine any of the data
to suggest possible features and in general see what’s going on, because we’d be
peeking at the test set, and such cheating would cause us to overestimate the perfor-
mance of our system. However, looking at the corpus to understand what’s going
on is important in designing NLP systems! What to do? For this reason, it is com-
mon to create a fixed training set and test set, then do 10-fold cross-validation inside
the training set, but compute error rate the normal way in the test set, as shown in
Fig. 4.10.
Training Iterations
1
3
4
5
2
6
7
8
9
10
Dev
Dev
Dev
Dev
Dev
Dev
Dev
Dev
Dev
Dev
Training
Training
Training
Training
Training
Training
Training
Training
Training
Training
Training Test Set
Testing
Figure 4.1010-fold cross-validation
4.11 Statistical Significance Testing
In building systems we often need to compare the performance of two systems. How
can we know if the new system we just built is better than our old one? Or better
than some other system described in the literature? This is the domain of statistical
hypothesis testing, and in this section we introduce tests for statistical significance
for NLP classifiers, drawing especially on the work of Dror et al. (2020) and Berg-
Kirkpatrick et al. (2012).

---

### Page 125

4.11 • STATISTICALSIGNIFICANCETESTING117
Suppose we’re comparing the performance of classifiersAandBon a metricM
such as F 1, or accuracy. Perhaps we want to know if our new sentiment classifier
Agets a higher F 1 score than our previous sentiment classifierBon a particular test
setx. Let’s callM(A,x)the score that systemAgets on test setx, andδ(x)the
performance difference betweenAandBonx:
δ(x) =M(A,x)−M(B,x)(4.45)
We would like to know ifδ(x)>0, meaning that our new classifierAhas a higher
F1 than our old classifierBonx.δ(x)is called theeffect size; a biggerδmeans thateffect size
Aseems to be way better thanB; a smallδmeansAseems to be only a little better.
Why don’t we just check ifδ(x)is positive? Suppose we do, and we find that
the F1 score ofAis higher thanB’s by .04. Can we be certain thatAis better? We
cannot! That’s becauseAmight just be accidentally better thanBon this particularx.
We need something more: we want to know ifA’s superiority overBis likely to hold
again if we checked another test setx ′, or under some other set of circumstances.
In the paradigm of statistical hypothesis testing, we test this by formalizing two
hypotheses.
H0 :δ(x)≤0
H1 :δ(x)>0(4.46)
The hypothesisH 0, called thenull hypothesis, supposes thatδ(x)is actually nega-null hypothesis
tive or zero, meaning thatAis not better thanB. We would like to know if we can
confidently rule out this hypothesis, and instead supportH 1, thatAis better.
We do this by creating a random variableXranging over all test sets. Now we
ask how likely is it, if the null hypothesisH 0 was correct, that among these test sets
we would encounter the value ofδ(x)that we found, if we repeated the experiment
a great many times. We formalize this likelihood as thep-value: the probability,p-value
assuming the null hypothesisH 0 is true, of seeing theδ(x)that we saw or one even
greater
P(δ(X)≥δ(x)|H 0 is true)(4.47)
So in our example, this p-value is the probability that we would seeδ(x)assuming
Aisnotbetter thanB. Ifδ(x)is huge (let’s sayAhas a very respectable F 1 of .9
andBhas a terrible F 1 of only .2 onx), we might be surprised, since that would be
extremely unlikely to occur ifH 0 were in fact true, and so the p-value would be low
(unlikely to have such a largeδifAis in fact not better thanB). But ifδ(x)is very
small, it might be less surprising to us even ifH 0 were true andAis not really better
thanB, and so the p-value would be higher.
A very small p-value means that the difference we observed is very unlikely
under the null hypothesis, and we can reject the null hypothesis. What counts as very
small? It is common to use values like .05 or .01 as the thresholds. A value of .01
means that if the p-value (the probability of observing theδwe saw assumingH 0 is
true) is less than .01, we reject the null hypothesis and assume thatAis indeed better
thanB. We say that a result (e.g., “Ais better thanB”) isstatistically significantifstatisticallysignificant
theδwe saw has a probability that is below the threshold and we therefore reject
this null hypothesis.
How do we compute this probability we need for the p-value? In NLP we gen-
erally don’t use simple parametric tests like t-tests or ANOV As that you might be
familiar with. Parametric tests make assumptions about the distributions of the test

---

### Page 126

118CHAPTER4 • LOGISTICREGRESSION
statistic (such as normality) that don’t generally hold in our cases. So in NLP we
usually use non-parametric tests based on sampling: we artificially create many ver-
sions of the experimental setup. For example, if we had lots of different test setsx ′
we could just measure all theδ(x ′)for all thex ′. That gives us a distribution. Now
we set a threshold (like .01) and if we see in this distribution that 99% or more of
those deltas are smaller than the delta we observed, i.e., that p-value(x)—the proba-
bility of seeing aδ(x)as big as the one we saw—is less than .01, then we can reject
the null hypothesis and agree thatδ(x)was a sufficiently surprising difference and
Ais really a better algorithm thanB.
There are two common non-parametric tests used in NLP:approximate ran-
domization(Noreen, 1989) and thebootstrap test. We will describe bootstrapapproximaterandomization
below, showing the paired version of the test, which again is most common in NLP.
Pairedtests are those in which we compare two sets of observations that are aligned:paired
each observation in one set can be paired with an observation in another. This hap-
pens naturally when we are comparing the performance of two systems on the same
test set; we can pair the performance of systemAon an individual observationx i
with the performance of systemBon the samex i.
4.11.1 The Paired Bootstrap Test
Thebootstrap test(Efron and Tibshirani, 1993) can apply to any metric; from pre-bootstrap test
cision, recall, or F1 to the BLEU metric used in machine translation. The word
bootstrappingrefers to repeatedly drawing large numbers of samples with replace-bootstrapping
ment (calledbootstrap samples) from an original set. The intuition of the bootstrap
test is that we can create many virtual test sets from an observed test set by repeat-
edly sampling from it. The method only makes the assumption that the sample is
representative of the population.
Consider a tiny text classification example with a test setxof 10 documents. The
first row of Fig. 4.11 shows the results of two classifiers (A and B) on this test set.
Each document is labeled by one of the four possibilities (A and B both right, both
wrong, A right and B wrong, A wrong and B right). A slash through a letter ( B)
means that that classifier got the answer wrong. On the first document both A and
B get the correct class (AB), while on the second document A got it right but B got
it wrong (A B). If we assume for simplicity that our metric is accuracy, A has an
accuracy of .70 and B of .50, soδ(x)is .20.
Now we create a large numberb(perhaps 105) of virtual test setsx(i), each of size
n=10. Fig. 4.11 shows a couple of examples. To create each virtual test setx (i), we
repeatedly (n=10 times) select a cell from rowxwith replacement. For example, to
create the first cell of the first virtual test setx (1), if we happened to randomly select
the second cell of thexrow, we would copy the value A B into our new cell, and
move on to create the second cell ofx (1), each time sampling (randomly choosing)
from the originalxwith replacement.
Now that we have thebtest sets, providing a sampling distribution, we can do
statistics on how oftenAhas an accidental advantage. There are various ways to
compute this advantage; here we follow the version laid out in Berg-Kirkpatrick
et al. (2012). AssumingH 0 (Aisn’t better thanB), we would expect thatδ(X),
estimated over many test sets, would be zero or negative; a much higher value would
be surprising, sinceH0 specifically assumesAisn’t better thanB. To measure exactly
how surprising our observedδ(x)is, we would in other circumstances compute the
p-value by counting over many test sets how oftenδ(x (i))exceeds the expected zero

---

### Page 127

4.12 • AVOIDINGHARMS INCLASSIFICATION119
1 2 3 4 5 6 7 8 9 10 A% B% δ()
x AB AB AB AB AB AB AB AB AB AB .70 .50 .20
x(1) AB AB AB AB AB AB AB AB AB AB .60 .60 .00
x(2) AB AB AB AB AB AB AB AB AB AB .60 .70 -.10
...
x(b)
Figure 4.11The paired bootstrap test: Examples ofbpseudo test setsx (i) being created
from an initial true test setx. Each pseudo test set is created by samplingn=10 times with
replacement; thus an individual sample is a single cell, a document with its gold label and
the correct or incorrect performance of classifiers A and B. Of course real test sets don’t have
only 10 examples, andbneeds to be large as well.
value byδ(x)or more:
p-value(x) =1b bXi=1 1 δ(x (i))−δ(x)≥0 
(We use the notation1(x)to mean “1 ifxis true, and 0 otherwise”.) However,
although it’s generally true that the expected value ofδ(X)over many test sets,
(again assumingAisn’t better thanB) is 0, thisisn’ttrue for the bootstrapped test
sets we created. That’s because we didn’t draw these samples from a distribution
with 0 mean; we happened to create them from the original test setx, which happens
to be biased (by .20) in favor ofA. So to measure how surprising is our observed
δ(x), we actually compute the p-value by counting over many test sets how often
δ(x (i))exceeds the expected value ofδ(x)byδ(x)or more:
p-value(x) = 1b bXi=1 1 δ(x (i))−δ(x)≥δ(x) 
= 1b bXi=1 1 δ(x (i))≥2δ(x)  (4.48)
So if for example we have 10,000 test setsx (i) and a threshold of .01, and in only 47
of the test sets do we find that A is accidentally betterδ(x (i))≥2δ(x), the resulting
p-value of .0047 is smaller than .01, indicating that the delta we found,δ(x)is indeed
sufficiently surprising and unlikely to have happened by accident, and we can reject
the null hypothesis and concludeAis better thanB.
The full algorithm for the bootstrap is shown in Fig. 4.12. It is given a test set
x, a number of samplesb, and counts the percentage of thebbootstrap test sets in
whichδ(x (i))>2δ(x). This percentage then acts as a one-sided empirical p-value.
4.12 Avoiding Harms in Classification
It is important to avoid harms that may result from classifiers. One class of harms
isrepresentational harms(Crawford 2017, Blodgett et al. 2020), harms causedrepresentationalharms
by a system that demeans a social group, for example by perpetuating negative
stereotypes about them. For example Kiritchenko and Mohammad (2018) exam-
ined the performance of 200 sentiment analysis systems on pairs of sentences that

---

### Page 128

120CHAPTER4 • LOGISTICREGRESSION
functionBOOTSTRAP(test setx,num of samplesb)returnsp-value(x)
Calculateδ(x)# how much better does algorithm A do than B onx
s= 0
fori= 1tobdo
forj= 1tondo# Draw a bootstrap samplex (i) of size n
Select a member ofxat random and add it tox (i)
Calculateδ(x (i))# how much better does algorithm A do than B onx (i)
s←s+ 1ifδ(x (i))≥2δ(x)
p-value(x)≈ sb # on what % of the b samples did algorithm A beat expectations?
returnp-value(x) # if very few did, our observedδis probably not accidental
Figure 4.12A version of the paired bootstrap algorithm after Berg-Kirkpatrick et al.
(2012).
were identical except for containing either a common African American first name
(likeShaniqua) or a common European American first name (likeStephanie), cho-
sen from the Caliskan et al. (2017) study discussed in Chapter 5. They found that
most systems assigned lower sentiment and more negative emotion to sentences
with African American names, reflecting and perpetuating stereotypes that associate
African Americans with negative emotions (Popp et al., 2003).
In other tasks classifiers may lead to both representational harms and other
harms, such as silencing. For example the important text classification task oftox-
icity detectionis the task of detecting hate speech, abuse, harassment, or othertoxicitydetection
kinds of toxic language. While the goal of such classifiers is to help reduce soci-
etal harm, toxicity classifiers can themselves cause harms. For example, researchers
have shown that some widely used toxicity classifiers incorrectly flag as being toxic
sentences that are non-toxic but simply mention identities like women (Park et al.,
2018), blind people (Hutchinson et al., 2020) or gay people (Dixon et al., 2018;
Dias Oliva et al., 2021), or simply use linguistic features characteristic of varieties
like African American Vernacular English (Sap et al. 2019, Davidson et al. 2019).
Such false positive errors could lead to the silencing of discourse by or about these
groups.
These model problems can be caused by biases or other problems in the training
data; in general, machine learning systems replicate and even amplify the biases
in their training data. But these problems can also be caused by the labels (for
example due to biases in the human labelers), by the resources used (like lexicons,
or model components like pretrained embeddings), or even by model architecture
(like what the model is trained to optimize). While the mitigation of these biases
(for example by carefully considering the training data sources) is an important area
of research, we currently don’t have general solutions. For this reason it’s important,
when introducing any NLP model, to study these kinds of factors and make them
clear. One way to do this is by releasing amodel card(Mitchell et al., 2019) formodel card
each version of a model. A model card documents a machine learning model with
information like:
• training algorithms and parameters
• training data sources, motivation, and preprocessing
• evaluation data sources, motivation, and preprocessing
• intended use and users
• model performance across different demographic or other groups and envi-

---

### Page 129

4.13 • INTERPRETING MODELS121
ronmental situations
4.13 Interpreting models
Often we want to know more than just the correct classification of an observation.
We want to know why the classifier made the decision it did. That is, we want our
decision to beinterpretable. Interpretability can be hard to define strictly, but theinterpretable
core idea is that as humans we should know why our algorithms reach the conclu-
sions they do. Because the features to logistic regression are often human-designed,
one way to understand a classifier’s decision is to understand the role each feature
plays in the decision. Logistic regression can be combined with statistical tests (the
likelihood ratio test, or the Wald test); investigating whether a particular feature is
significant by one of these tests, or inspecting its magnitude (how large is the weight
wassociated with the feature?) can help us interpret why the classifier made the
decision it makes. This is enormously important for building transparent models.
Furthermore, in addition to its use as a classifier, logistic regression in NLP and
many other fields is widely used as an analytic tool for testing hypotheses about the
effect of various explanatory variables (features). In text classification, perhaps we
want to know if logically negative words (no, not, never) are more likely to be asso-
ciated with negative sentiment, or if negative reviews of movies are more likely to
discuss the cinematography. However, in doing so it’s necessary to control for po-
tential confounds: other factors that might influence sentiment (the movie genre, the
year it was made, perhaps the length of the review in words). Or we might be study-
ing the relationship between NLP-extracted linguistic features and non-linguistic
outcomes (hospital readmissions, political outcomes, or product sales), but need to
control for confounds (the age of the patient, the county of voting, the brand of the
product). In such cases, logistic regression allows us to test whether some feature is
associated with some outcome above and beyond the effect of other features.
4.14 Advanced: Regularization
Numquam ponenda est pluralitas sine necessitate
‘Plurality should never be proposed unless needed’
William of Occam
There is a problem with learning weights that make the model perfectly match the
training data. If a feature is perfectly predictive of the outcome because it happens
to only occur in one class, it will be assigned a very high weight. The weights for
features will attempt to perfectly fit details of the training set, in fact too perfectly,
modeling noisy factors that just accidentally correlate with the class. This problem is
calledoverfitting. A good model should be able togeneralizewell from the trainingoverfitting
generalize data to the unseen test set, but a model that overfits will have poor generalization.
To avoid overfitting, a newregularizationtermR(θ)is added to the loss func-regularization
tion in Eq. 4.21, resulting in the following loss for a batch ofmexamples (slightly

---

### Page 130

122CHAPTER4 • LOGISTICREGRESSION
rewritten from Eq. 4.21 to be maximizing log probability rather than minimizing
loss, and removing the 1m term which doesn’t affect the argmax):
ˆθ=argmax
θ
mX
i=1
logP(y (i)|x(i))−αR(θ)(4.49)
The new regularization termR(θ)is used to penalize large weights. Thus a setting of
the weights that matches the training data perfectly— but uses many weights with
high values to do so—will be penalized more than a setting that matches the data
a little less well, but does so using smaller weights. The higher the regularization
strength parameterα, the lower the model’s weights will be, reducing its reliance on
the training data. Note that regularization is not normally applied to the bias term,
which acts as a kind of threshold that helps deal with uncentered data and class
priors.
There are two common ways to compute this regularization termR(θ).L2 reg-
ularizationis a quadratic function of the weight values named because it uses theL2regularization
(square of the) L2 norm of the weight values. The L2 norm,||θ|| 2, is the same as
theEuclidean distanceof the vectorθfrom the origin. Ifθconsists ofnweights,
then:
R(θ) =||θ|| 22 =
nX
j=1
θ 2j (4.50)
The L2 regularized loss function becomes:
ˆθ=argmax
θ
" mX
i=1
logP(y (i)|x(i);θ)
#
−α
nX
j=1
θ 2j (4.51)
L1 regularizationis a linear function of the weight values, named after the L1 normL1regularization
||W||1, the sum of the absolute values of the weights, orManhattan distance(the
Manhattan distance is the distance you’d have to walk between two points in a city
with a street grid like New York):
R(θ) =||θ|| 1 =
nX
i=1
|θi|(4.52)
The L1 regularized loss function becomes:
ˆθ=argmax
θ
" mX
i=1
logP(y (i)|x(i);θ)
#
−α
nX
j=1
|θ j|(4.53)
These kinds of regularization come from statistics, where L1 regularization is called
lasso regression(Tibshirani, 1996) and L2 regularization is calledridge regression,lasso
ridge and both are commonly used in language processing. L2 regularization is easier to
optimize because of its simple derivative (the derivative ofθ 2 is just 2θ), while
L1 regularization is more complex (the derivative of|θ|is non-continuous at zero).
But while L2 prefers weight vectors with many small weights, L1 prefers sparse
solutions with some larger weights but many more weights set to zero. Thus L1 reg-
ularization leads to much sparser weight vectors, that is, far fewer features. Again,
for both these types of regularization we generally ignore the bias term and only
consider the other weights.

---

### Page 131

4.15 • ADVANCED: DERIVING THEGRADIENTEQUATION123
Both L1 and L2 regularization have Bayesian interpretations as constraints on
the prior of how weights should look. L1 regularization can be viewed as a Laplace
prior on the weights. L2 regularization corresponds to assuming that weights are
distributed according to a Gaussian distribution with meanµ=0. In a Gaussian
or normal distribution, the further away a value is from the mean, the lower its
probability (scaled by the varianceσ). By using a Gaussian prior on the weights, we
are saying that weights prefer to have the value 0. A Gaussian for a weightθ j is
1q
2πσ 2j
exp
− (θ j −µ j)2
2σ 2j
!
(4.54)
If we multiply each weight by a Gaussian prior on the weight, we are thus maximiz-
ing the following constraint:
ˆθ=argmax
θ
mY
i=1
P(y(i)|x(i))×
nY
j=1
1q
2πσ 2j
exp
− (θ j −µ j)2
2σ 2j
!
(4.55)
which in log space, withµ=0, and assuming 2σ 2 =1, corresponds to
ˆθ=argmax
θ
mX
i=1
logP(y (i)|x(i))−α
nX
j=1
θ 2j (4.56)
which is in the same form as Eq. 4.51.
4.15 Advanced: Deriving the Gradient Equation
In this section we give the derivation of the gradient of the cross-entropy loss func-
tionL CE for logistic regression. Let’s start with some quick calculus refreshers.
First, the derivative of ln(x):
d
dx ln(x) =1x (4.57)
Second, the (very elegant) derivative of the sigmoid:
dσ(z)
dz =σ(z)(1−σ(z))(4.58)
Finally, thechain ruleof derivatives. Suppose we are computing the derivativechain rule
of a composite functionf(x) =u(v(x)). The derivative off(x)is the derivative of
u(x)with respect tov(x)times the derivative ofv(x)with respect tox:
d f
dx = dudv · dvdx (4.59)
First, we want to know the derivative of the loss function with respect to a single
weightw j (we’ll need to compute it for each weight, and for the bias):

---

### Page 132

124CHAPTER4 • LOGISTICREGRESSION
∂L CE
∂w j
= ∂∂w j −[ylogσ(w·x+b) + (1−y)log(1−σ(w·x+b))]
=−
 ∂
∂w j
ylogσ(w·x+b) + ∂∂w j (1−y)log[1−σ(w·x+b)] 
(4.60)
Next, using the chain rule, and relying on the derivative of log:
∂L CE
∂w j
=− yσ(w·x+b) ∂∂w j σ(w·x+b)− 1−y1−σ(w·x+b) ∂∂w j [1−σ(w·x+b)]
(4.61)
Rearranging terms:
∂L CE
∂w j
=−
 y
σ(w·x+b) − 1−y1−σ(w·x+b)  ∂∂w j σ(w·x+b)
And now plugging in the derivative of the sigmoid, and using the chain rule one
more time, we end up with Eq. 4.62:
∂L CE
∂w j
=−
 y−σ(w·x+b)
σ(w·x+b)[1−σ(w·x+b)]

σ(w·x+b)[1−σ(w·x+b)] ∂(w·x+b)∂w j
=−
 y−σ(w·x+b)
σ(w·x+b)[1−σ(w·x+b)]

σ(w·x+b)[1−σ(w·x+b)]x j
=−[y−σ(w·x+b)]x j
= [σ(w·x+b)−y]x j (4.62)
4.16 Summary
This chapter introduced thelogistic regressionmodel ofclassification.
• Logistic regression is a supervised machine learning classifier that extracts
real-valued features from the input, multiplies each by a weight, sums them,
and passes the sum through asigmoidfunction to generate a probability. A
threshold is used to make a decision.
• Logistic regression can be used with two classes (e.g., positive and negative
sentiment) or with multiple classes (multinomial logistic regression, for ex-
ample for n-ary text classification, part-of-speech labeling, etc.).
• Multinomial logistic regression uses thesoftmaxfunction to compute proba-
bilities.
• The weights (vectorwand biasb) are learned from a labeled training set via a
loss function, such as thecross-entropy loss, that must be minimized.
• Minimizing this loss function is aconvex optimizationproblem, and iterative
algorithms likegradient descentare used to find the optimal weights.
•Regularizationis used to avoid overfitting.
• Logistic regression is also one of the most useful analytic tools, because of its
ability to transparently study the importance of individual features.

---

### Page 133

HISTORICALNOTES125
Historical Notes
Logistic regression was developed in the field of statistics, where it was used for
the analysis of binary data by the 1960s, and was particularly common in medicine
(Cox, 1969). Starting in the late 1970s it became widely used in linguistics as one
of the formal foundations of the study of linguistic variation (Sankoff and Labov,
1979).
Nonetheless, logistic regression didn’t become common in natural language pro-
cessing until the 1990s, when it seems to have appeared simultaneously from two
directions. The first source was the neighboring fields of information retrieval and
speech processing, both of which had made use of regression, and both of which
lent many other statistical techniques to NLP. Indeed a very early use of logistic
regression for document routing was one of the first NLP applications to use (LSI)
embeddings as word representations (Sch¨utze et al., 1995).
At the same time in the early 1990s logistic regression was developed and ap-
plied to NLP at IBM Research under the namemaximum entropymodeling ormaximumentropy
maxent(Berger et al., 1996), seemingly independent of the statistical literature. Un-
der that name it was applied to language modeling (Rosenfeld, 1996), part-of-speech
tagging (Ratnaparkhi, 1996), parsing (Ratnaparkhi, 1997), coreference resolution
(Kehler, 1997b), and text classification (Nigam et al., 1999).
There are a variety of sources covering the many kinds of text classification
tasks. For sentiment analysis see Pang and Lee (2008), and Liu and Zhang (2012).
Stamatatos (2009) surveys authorship attribution algorithms. On language identifi-
cation see Jauhiainen et al. (2019); Jaech et al. (2016) is an important early neural
system. The task of newswire indexing was often used as a test case for text classi-
fication algorithms, based on the Reuters-21578 collection of newswire articles.
See Manning et al. (2008) and Aggarwal and Zhai (2012) on text classification;
classification in general is covered in machine learning textbooks (Hastie et al. 2001,
Witten and Frank 2005, Bishop 2006, Murphy 2012).
Non-parametric methods for computing statistical significance were used first in
NLP in the MUC competition (Chinchor et al., 1993), and even earlier in speech
recognition (Gillick and Cox 1989, Bisani and Ney 2004). Our description of the
bootstrap draws on the description in Berg-Kirkpatrick et al. (2012). Recent work
has focused on issues including multiple test sets and multiple metrics (Søgaard et al.
2014, Dror et al. 2017).
Feature selection is a method of removing features that are unlikely to generalize
well. Features are generally ranked by how informative they are about the classifica-
tion decision. A very common metric,information gain, tells us how many bits ofinformationgain
information the presence of the word gives us for guessing the class. Other feature
selection metrics includeχ 2, pointwise mutual information, and GINI index; see
Yang and Pedersen (1997) for a comparison and Guyon and Elisseeff (2003) for an
introduction to feature selection.
Exercises
4.1Why must the microaverage precision always be equal to the microaverage
recall?
4.2A spam classifier is run on 1,000 emails, of which 40 are spam. It labels 30
emails as spam, 24 of which really are. Compute accuracy, precision, recall,