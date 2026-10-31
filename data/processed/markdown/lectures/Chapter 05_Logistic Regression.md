# Chapter 05_Logistic Regression

- **Source File**: `Chapter 05_Logistic Regression.pdf`
- **Total Pages**: 78

---

## Slide / Page 1

Natural Language Processing
Chapter 5
Logistic Regression
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

Background: Generative and
Discriminative Classifiers

---

## Slide / Page 3

Logistic Regression
• Important analytic tool in natural and
social sciences
• Baseline supervised machine learning tool
for classification
• Is also the foundation of neural networks
• LR can be used to classify an observation
into one of two classes or into one of
many classes (multinomial LR).
3

---

## Slide / Page 4

Generative and Discriminative
Classifiers
• Naïve Bayes is a generative
classifier
• by contrast:
• Logistic regression is a
discriminative classifier
4

---

## Slide / Page 5

Generative and Discriminative
Classifiers
Suppose we're distinguishing cat from dog images
imagenet imagenet
5

---

## Slide / Page 6

Generative Classifier
• Build a model of what's in a cat
image
• Knows about whiskers, ears, eyes
• Assigns a probability to any
image:
• how cat-y is this image?
• Also build a model for dog images
Now given a new image:
Run both models and see which one fits better
6

---

## Slide / Page 7

Discriminative Classifier
Just try to distinguish dogs from cats
Oh look, all dog images (happen to) have collars!
Let's ignore everything else
7

---

## Slide / Page 8

Finding the correct class c from a document d
in Generative vs Discriminative Classifiers
• Naive Bayes
• Logistic Regression
8
P(c|d)
posterior

---

## Slide / Page 9

Components of a probabilistic machine
learning classifier
1. A feature representation of the input.
For each input observation x(i), a vector of features [x1, x2, ... , xn].
Feature i for input x(j) is xi, more completely  xi(j), or sometimes fi  (x).
2. A classification function that computes ො𝑦, the estimated
class, via p(y|x), like the sigmoid or softmax functions.
3. An objective function for learning, like cross-entropy
loss.
4. An algorithm for optimizing the objective function:
stochastic gradient descent.
Given m input/output pairs (x(i),y(i)):
9

---

## Slide / Page 10

The two phases of Logistic Regression
• Training: we learn weights w and b using
stochastic gradient descent and cross-entropy
loss.
• Test: Given a test example x, we compute
p(y|x) using learned weights w and b, and
return whichever label (y = 1 or y = 0) has
higher probability.
10

---

## Slide / Page 11

Classification in Logistic Regression

---

## Slide / Page 12

Classification Reminder
• Positive/negative
sentiment
• Spam/not spam
• Authorship attribution
(Hamilton or
Madison?)
Alexander Hamilton
12

---

## Slide / Page 13

Text Classification: definition
• Input:
 a document x
 a fixed set of classes  C = {c1, c2,…, cJ}
• Output: a predicted class y  C
13
^

---

## Slide / Page 14

Binary Classification in Logistic Regression
• Goal of binary LR: train a classifier that can make
a binary decision about the class of a new input
observation
• Given a series of input/output pairs: (x(i), y(i))
• For each observation x(i)
 We represent x(i) by a feature vector [x1, x2,…, xn]
 We compute an output: a predicted class ෢𝑦 𝑖  {0,1}
14

---

## Slide / Page 15

• We want to know the probability P(y = 1|x)
that this observation is a member of the
class.
 E.g.  “positive sentiment” versus “negative
sentiment”;
 the features represent counts of words in a
document;
 P(y = 1|x): probability that the document has
positive sentiment;
 P(y = 0|x): probability that the document has
negative sentiment.
15
Binary Classification in Logistic Regression

---

## Slide / Page 16

Features in logistic regression
• For feature xi, weight wi tells us how important
xi is.
• xi ="review contains ‘awesome’":    wi =  +10
• xj ="review contains ‘abysmal’":    wj = -10
• xk =“review contains ‘mediocre’":  wk = -2
16

---

## Slide / Page 17

Logistic Regression for one observation
• Input observation: vector  x = [x1, x2,…, xn]
• Weights: one per feature: W = [w1, w2,…, wn]
 Sometimes the weights are called  θ = [θ1, θ2,…, θn]
• Output: a predicted class y  {0,1}^
(For multinomial logistic regression: y  {0, 1, 2, 3, 4})
• The output is considered as a linear function of
the output
17

---

## Slide / Page 18

Problem
• Inclusion of the weights and the bias. (Note the
dot product on the RHS)
• But, z isn't a probability, it's just a number!
• We need to decide: if this sum is high, we say y=1;
if low, then y=0
• Solution: use a function of z that goes from 0 to 1
5.1 • CLASSIFICATION: THE SIGMOID 3
sentiment”versus“negativesentiment”,thefeaturesrepresentcountsof wordsin a
document,P(y = 1|x) is the probability thatthedocumenthaspositive sentiment,
andP(y = 0|x) is theprobabilitythatthedocumenthasnegativesentiment.
Logisticregressionsolvesthis taskby learning,from a trainingset,a vectorof
weightsandabiasterm. Eachweightwi isarealnumber, andisassociatedwith one
of theinput featuresxi. Theweightwi representshow importantthatinput feature
is to theclassiﬁcationdecision,andcanbepositive (providing evidencethatthein-
stancebeingclassiﬁedbelongsin thepositiveclass)or negative(providingevidence
that the instancebeingclassiﬁedbelongsin the negative class). Thuswe might
expectin a sentimenttaskthe word awe s om eto have a high positive weight,and
abys m alto haveaverynegativeweight.Thebiasterm, alsocalledtheintercept, isbiasterm
intercept anotherrealnumberthat’saddedto theweightedinputs.
To make a decisionon a testinstance—afterwe’ve learnedthe weightsin
training—theclassiﬁerﬁrstmultiplieseachxi byitsweightwi, sumsuptheweighted
features,andaddsthe biasterm b. The resultingsinglenumberz expressesthe
weightedsumof theevidencefor theclass.
z =
nX
i= 1
wixi
!
+ b (5.2)
In therestof thebookwe’ll representsuchsumsusingthedot productnotationfromdot product
linearalgebra.Thedotproductof two vectorsa andb, writtenasa·b is thesumof
theproductsof thecorrespondingelementsof eachvector. Thusthefollowing is an
equivalentformationto Eq.5.2:
z = w·x+ b (5.3)
But notethat nothingin Eq. 5.3 forcesz to be a legal probability, that is, to lie
between0 and1. In fact,sinceweightsarereal-valued,theoutputmight even be
negative; zrangesfrom −• to• .
Figure5.1 Thesigmoidfunctiony= 11+ e− z takesarealvalueandmapsit totherange[0,1].
It is nearlylineararound0 but outliervaluesgetsquashedtoward0 or 1.
To createa probability, we’ll passz throughthe sigmoid function, s (z). Thesigmoid
sigmoidfunction(namedbecauseit lookslike ans) is alsocalledthelogistic func-
tion, andgiveslogisticregressionits name.Thesigmoidhasthefollowingequation,logisticfunction
shown graphicallyin Fig.5.1:
y = s (z)= 11+ e− z = 11+ exp(− z) (5.4)
(For therestof thebook,we’ll usethenotationexp(x) to meanex.) Thesigmoid
hasanumberof advantages;it takesareal-valuednumberandmapsit intotherange
𝑧 = ෍
𝑖=1
𝑛
𝑤𝑖𝑥𝑖 + 𝑏 𝑧 = 𝒘. 𝒙 + 𝑏so
18

---

## Slide / Page 19

The very useful sigmoid or logistic function
19
5.1 • CLASSIFICATION: THE SIGMOID 3
is “positivesentiment”versus“negativesentiment”,the featuresrepresentcounts
of wordsin a document,and P(y = 1|x) is the probability that the documenthas
positive sentiment,while and P(y = 0|x) is the probability that the documenthas
negativesentiment.
Logistic regressionsolvesthis taskby learning,from a trainingset,a vectorof
weightsandabiasterm. Eachweightwi is arealnumber, andis associatedwith one
of theinputfeaturesxi. Theweightwi representshow importantthatinputfeatureis
to theclassiﬁcationdecision,andcanbepositive (meaningthefeatureis associated
with the class)or negative (meaningthe featureis not associatedwith the class).
Thuswe mightexpectin asentimenttasktheword awe s om eto haveahigh positive
weight,andabys m alto have a very negative weight. Thebias term, alsocalledthebias term
intercept, is anotherrealnumberthat’saddedto theweightedinputs.intercept
To make a decisionon a testinstance—afterwe’ve learnedthe weights in
training—theclassiﬁerﬁrstmultiplieseachxi byits weightwi, sumsuptheweighted
features,and addsthe bias term b. The resultingsingle numberz expressesthe
weightedsumof theevidencefor theclass.
z =
nX
i= 1
wixi
!
+ b (5.2)
In therestof thebookwe’ll representsuchsumsusingthedot product notationfromdot product
linearalgebra.Thedot productof two vectorsa andb, written asa·b is thesumof
theproductsof thecorrespondingelementsof eachvector. Thusthefollowing is an
equivalentformationto Eq.5.2:
z = w·x+ b (5.3)
But note that nothing in Eq. 5.3 forces z to be a legal probability, that is, to lie
between0 and1. In fact, sinceweightsarereal-valued,the outputmight even be
negative; z rangesfrom −• to• .
Figure 5.1 Thesigmoidfunctiony= 11+ e− z takesarealvalueandmapsit to therange[0,1].
Becauseit is nearlylineararound0 but hasa sharpslopetowardtheends,it tendsto squash
outlier valuestoward0 or 1.
To createa probability, we’ll passz throughthe sigmoid function, s (z). Thesigmoid
sigmoidfunction(namedbecauseit lookslike ans) is alsocalledthelogistic func-
tion, andgiveslogisticregressionits name.Thesigmoidhasthefollowing equation,logisticfunction
shown graphicallyin Fig. 5.1:
y = s (z)= 11+ e− z (5.4)
5.1 • CLASSIFICATION: THE SIGMOID 3
is “positivesentiment”versus“negativesentiment”,the featuresrepresentcounts
of wordsin a document,and P(y = 1|x) is the probability that the documenthas
positive sentiment,while and P(y = 0|x) is the probability that the documenthas
negative sentiment.
Logistic regressionsolvesthis taskby learning,from a trainingset,a vectorof
weightsandabiasterm. Eachweightwi isarealnumber, andis associatedwith one
of theinputfeaturesxi. Theweightwi representshow importantthatinputfeatureis
to theclassiﬁcationdecision,andcanbepositive (meaningthefeatureis associated
with the class)or negative (meaningthe featureis not associatedwith the class).
Thuswemightexpectin asentimenttasktheword awe s om eto haveahighpositive
weight,andabys m alto have averynegative weight.Thebias term, alsocalledthebiasterm
intercept, is anotherrealnumberthat’saddedto theweightedinputs.intercept
To make a decisionon a testinstance—afterwe’ve learnedthe weightsin
training—theclassiﬁerﬁrstmultiplieseachxi byitsweightwi, sumsuptheweighted
features,and addsthe bias term b. The resultingsingle numberz expressesthe
weightedsumof theevidencefor theclass.
z =
nX
i= 1
wixi
!
+ b (5.2)
In therestof thebookwe’ll representsuchsumsusingthedot productnotationfromdot product
linearalgebra.Thedotproductof two vectorsa andb, writtenasa·b is thesumof
theproductsof thecorrespondingelementsof eachvector. Thusthefollowing is an
equivalentformationto Eq.5.2:
z = w·x+ b (5.3)
But note that nothingin Eq. 5.3 forcesz to be a legal probability, that is, to lie
between0 and1. In fact,sinceweightsarereal-valued,the outputmight even be
negative; zrangesfrom −• to• .
Figure5.1 Thesigmoidfunctiony= 11+ e− z takesarealvalueandmapsit to therange[0,1].
Becauseit is nearlylineararound0 but hasa sharpslopetowardtheends,it tendsto squash
outliervaluestoward0 or 1.
To createa probability, we’ll passz throughthe sigmoid function, s (z). Thesigmoid
sigmoidfunction(namedbecauseit lookslike ans) is alsocalledthelogistic func-
tion, andgiveslogisticregressionits name.Thesigmoidhasthefollowing equation,logisticfunction
shown graphicallyin Fig. 5.1:
y = s (z)= 11+ e− z (5.4)

---

## Slide / Page 20

Turning a probability into a classifier
0.5 here is called the decision boundary
22

---

## Slide / Page 21

The probabilistic classifier
5.1 • CLASSIFICATION: THE SIGMOID 3
is “positivesentiment”versus“negativesentiment”,the featuresrepresentcounts
of wordsin a document,and P(y = 1|x) is the probability that the documenthas
positive sentiment,while and P(y = 0|x) is the probability that the documenthas
negativesentiment.
Logistic regressionsolvesthis taskby learning,from a trainingset,a vectorof
weightsandabiasterm. Eachweightwi is arealnumber, andis associatedwith one
of theinputfeaturesxi. Theweightwi representshow importantthatinputfeatureis
to theclassiﬁcationdecision,andcanbepositive (meaningthefeatureis associated
with the class)or negative (meaningthe featureis not associatedwith the class).
Thuswe mightexpectin asentimenttasktheword awe s om eto haveahigh positive
weight,andabys m alto have a very negative weight. Thebias term, alsocalledthebias term
intercept, is anotherrealnumberthat’saddedto theweightedinputs.intercept
To make a decisionon a testinstance—afterwe’ve learnedthe weights in
training—theclassiﬁerﬁrstmultiplieseachxi byits weightwi, sumsuptheweighted
features,and addsthe bias term b. The resultingsingle numberz expressesthe
weightedsumof theevidencefor theclass.
z =
nX
i= 1
wixi
!
+ b (5.2)
In therestof thebookwe’ll representsuchsumsusingthedot product notationfromdot product
linearalgebra.Thedot productof two vectorsa andb, written asa·b is thesumof
theproductsof thecorrespondingelementsof eachvector. Thusthefollowing is an
equivalentformationto Eq.5.2:
z = w·x+ b (5.3)
But note that nothing in Eq. 5.3 forces z to be a legal probability, that is, to lie
between0 and1. In fact, sinceweightsarereal-valued,the outputmight even be
negative; z rangesfrom −• to• .
Figure 5.1 Thesigmoidfunctiony= 11+ e− z takesarealvalueandmapsit to therange[0,1].
Becauseit is nearlylineararound0 but hasa sharpslopetowardtheends,it tendsto squash
outlier valuestoward0 or 1.
To createa probability, we’ll passz throughthe sigmoid function, s (z). Thesigmoid
sigmoidfunction(namedbecauseit lookslike ans) is alsocalledthelogistic func-
tion, andgiveslogisticregressionits name.Thesigmoidhasthefollowing equation,logisticfunction
shown graphicallyin Fig. 5.1:
y = s (z)= 11+ e− z (5.4)
wx + b
P(y=1)
23

---

## Slide / Page 22

Turning a probability into a classifier
if w∙x+b > 0
if w∙x+b ≤ 0
24

---

## Slide / Page 23

Logistic Regression: A Sentiment
Classification Example

---

## Slide / Page 24

Sentiment Example
•It's hokey . There are virtually no surprises
, and the writing is second-rate .  So why was
it so enjoyable ? For one thing , the cast is
great . Another nice touch is the music . I
was overcome with the urge to get off the
couch and start dancing . It sucked me in ,
and it'll do the same to you .
26
• Consider a binary sentiment classification on
movie review texts
• We would like to know whether to assign the
sentiment class + or - to a review document doc.
Fig. 5.2

---

## Slide / Page 25

Sentiment Example
• We decided to represent each input
observation (i.e. review) by the 6 features x1
… x6 of the input shown in the following table.
27

---

## Slide / Page 26

28
5.1 • CLASSIFICATION: THE SIGMOID 5
It's hokey . There are virtually no surprises , and the writing is second-rate .
So why was it so enjoyable  ? For one thing , the cast is
great . Another nice touch is the music . I was overcome with the urge to get off
the couch and start dancing .  It sucked me in , and it'll do the same to you  .
x1=3 x6=4.19
x3=1
x4=3x5=0
x2=2
Figure5.2 A samplemini testdocumentshowing theextractedfeaturesin thevectorx.
Giventhese6 featuresandtheinput review x, P(+ |x) andP(− |x) canbecom-
putedusingEq.5.5:
p(+ |x)= P(Y = 1|x)= s (w·x+ b)
= s ([2.5, − 5.0, − 1.2,0.5,2.0,0.7] ·[3,2,1,3,0,4.19]+ 0.1)
= s (.833)
= 0.70 (5.6)
p(− |x)= P(Y = 0|x)= 1− s (w·x+ b)
= 0.30
Logistic regressionis commonlyappliedto all sortsof NLP tasks,andany property
of theinputcanbeafeature.Considerthetaskof period disambiguation: deciding
if a periodis the endof a sentenceor part of a word, by classifyingeachperiod
into oneof two classesEOS(end-of-sentence)andnot-EOS.We might usefeatures
like x1 below expressingthat the currentword is lower caseandthe classis EOS
(perhapswith a positive weight), or that the currentword is in our abbreviations
dictionary(“Prof.”) andtheclassis EOS(perhapswith anegativeweight).A feature
canalsoexpressa quitecomplex combinationof properties.For examplea period
following anuppercaseword is likely to beanEOS,but if theworditself is S t.and
thepreviousword is capitalized,thentheperiodis likely partof a shorteningof the
word s treet.
x1 =
⇢
1 if “Cas e(wi)= Lower”
0 otherwise
x2 =
⇢
1 if “ wi 2 AcronymDict”
0 otherwise
x3 =
⇢
1 if “ wi = St.& Cas e(wi− 1)= Cap”
0 otherwise
Designing features: Featuresare generallydesignedby examining the training
setwith aneye to linguistic intuitionsandthelinguistic literatureon thedomain.A
carefulerror analysison the training setor devsetof an early versionof a system
oftenprovidesinsightsinto features.
For sometasksit is especially helpful to build complex featuresthatarecombi-
nationsof moreprimitivefeatures.Wesaw suchafeaturefor perioddisambiguation
above, wherea periodon theword S t.waslesslikely to betheendof thesentence
if thepreviousword wascapitalized.For logistic regressionandnaive Bayesthese
combinationfeaturesor feature interactions have to bedesignedby hand.featureinteractions

---

## Slide / Page 27

Classifying sentiment for input x
29
Suppose we have learned w =
and b = 0.1

---

## Slide / Page 28

Classifying sentiment for input x
5.1 • CLASSIFICATION: THE SIGMOID 5
It's hokey . There are virtually no surprises , and the writing is second-rate .
So why was it so enjoyable  ? For one thing , the cast is
great . Another nice touch is the music . I was overcome with the urge to get off
the couch and start dancing .  It sucked me in , and it'll do the same to you  .
x1=3 x6=4.19
x3=1
x4=3x5=0
x2=2
Figure5.2 A samplemini testdocumentshowing theextractedfeaturesin thevectorx.
Giventhese6 featuresandtheinput review x, P(+ |x) andP(− |x) canbecom-
putedusingEq.5.5:
p(+ |x)= P(Y = 1|x)= s (w·x+ b)
= s ([2.5, − 5.0, − 1.2,0.5,2.0,0.7] ·[3,2,1,3,0,4.19]+ 0.1)
= s (.833)
= 0.70 (5.6)
p(− |x)= P(Y = 0|x)= 1− s (w·x+ b)
= 0.30
Logistic regressionis commonlyappliedto all sortsof NLP tasks,andany property
of theinputcanbeafeature.Considerthetaskof period disambiguation: deciding
if a periodis the endof a sentenceor part of a word, by classifyingeachperiod
into oneof two classesEOS(end-of-sentence)andnot-EOS.We might usefeatures
like x1 below expressingthat the currentword is lower caseandthe classis EOS
(perhapswith a positive weight), or that the currentword is in our abbreviations
dictionary(“Prof.”) andtheclassis EOS(perhapswith anegativeweight).A feature
canalsoexpressa quitecomplex combinationof properties.For examplea period
following anuppercaseword is likely to beanEOS,but if theworditself is S t.and
thepreviousword is capitalized,thentheperiodis likely partof a shorteningof the
word s treet.
x1 =
⇢
1 if “Cas e(wi)= Lower”
0 otherwise
x2 =
⇢
1 if “ wi 2 AcronymDict”
0 otherwise
x3 =
⇢
1 if “ wi = St.& Cas e(wi− 1)= Cap”
0 otherwise
Designing features: Featuresare generallydesignedby examining the training
setwith aneye to linguistic intuitionsandthelinguistic literatureon thedomain.A
carefulerror analysison the training setor devsetof an early versionof a system
oftenprovidesinsightsinto features.
For sometasksit is especially helpful to build complex featuresthatarecombi-
nationsof moreprimitivefeatures.Wesaw suchafeaturefor perioddisambiguation
above, wherea periodon theword S t.waslesslikely to betheendof thesentence
if thepreviousword wascapitalized.For logistic regressionandnaive Bayesthese
combinationfeaturesor featureinteractions haveto bedesignedby hand.featureinteractions
30
5.1 • CLASSIFICATION: THE SIGMOID 5
It's hokey . There are virtually no surprises , and the writing is second-rate .
So why was it so enjoyable  ? For one thing , the cast is
great . Another nice touch is the music . I was overcome with the urge to get off
the couch and start dancing .  It sucked me in , and it'll do the same to you  .
x1=3 x6=4.19
x3=1
x4=3x5=0
x2=2
Figure5.2 A samplemini testdocumentshowing theextractedfeaturesin thevectorx.
Giventhese6 featuresandtheinput review x, P(+ |x) andP(− |x) canbecom-
putedusingEq.5.5:
p(+ |x)= P(Y = 1|x)= s (w·x+ b)
= s ([2.5, − 5.0, − 1.2,0.5,2.0,0.7] ·[3,2,1,3,0,4.19]+ 0.1)
= s (.833)
= 0.70 (5.6)
p(− |x)= P(Y = 0|x)= 1− s (w·x+ b)
= 0.30
Logistic regressionis commonlyappliedto all sortsof NLP tasks,andany property
of theinputcanbeafeature.Considerthetaskof period disambiguation: deciding
if a periodis the endof a sentenceor part of a word, by classifyingeachperiod
into oneof two classesEOS(end-of-sentence)andnot-EOS.We might usefeatures
like x1 below expressingthat the currentword is lower caseandthe classis EOS
(perhapswith a positive weight), or that the currentword is in our abbreviations
dictionary(“Prof.”) andtheclassis EOS(perhapswith anegativeweight).A feature
canalsoexpressa quitecomplex combinationof properties.For examplea period
following anuppercaseword is likely to beanEOS,but if theworditself is S t.and
thepreviousword is capitalized,thentheperiodis likely partof a shorteningof the
word s treet.
x1 =
⇢
1 if “Cas e(wi)= Lower”
0 otherwise
x2 =
⇢
1 if “ wi 2 AcronymDict”
0 otherwise
x3 =
⇢
1 if “ wi = St.& Cas e(wi− 1)= Cap”
0 otherwise
Designing features: Featuresare generallydesignedby examining the training
setwith aneye to linguistic intuitionsandthelinguistic literatureon thedomain.A
carefulerror analysison the training setor devsetof an early versionof a system
oftenprovidesinsightsinto features.
For sometasksit is especially helpful to build complex featuresthatarecombi-
nationsof moreprimitivefeatures.Wesaw suchafeaturefor perioddisambiguation
above, wherea periodon theword S t.waslesslikely to betheendof thesentence
if thepreviousword wascapitalized.For logistic regressionandnaive Bayesthese
combinationfeaturesor featureinteractions haveto bedesignedby hand.featureinteractions
Results rounded here to 2 decimal places.

---

## Slide / Page 29

Building features for LR for any
classification task: e.g. period disambiguation
31
This ends in a period.
The house at 465 Main St. is new.
End of sentence
Not end of sentence
𝑥1 = ቊ1 𝑖𝑓 "𝐶𝑎𝑠𝑒(𝑤𝑖) = 𝐿𝑜𝑤𝑒𝑟"0 𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
𝑥2 = ቊ1 𝑖𝑓 "𝑤𝑖 ∈ 𝐴𝑐𝑟𝑜𝑛𝑦𝑚𝐷𝑖𝑐𝑡"0 𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
𝑥3 = ቊ1 𝑖𝑓 "𝑤𝑖 = 𝑆𝑡. 𝑎𝑛𝑑 𝐶𝑎𝑠𝑒(𝑤𝑖−1) = 𝐶𝑎𝑝"0 𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
perhaps with a +ve weight
perhaps with a -ve weight

---

## Slide / Page 30

Learning in Logistic Regression

---

## Slide / Page 31

How to get the W’s?
• Supervised classification: we know the
correct label y (either 0 or 1) for each x.
• What the system produces is an estimate, ො𝑦
• We want to set w and b to minimize the
distance between our estimate ො𝑦(i) and the
true y (i).
• We need a distance estimator: a loss
function or a cost function
• We need an optimization algorithm to
update w and b to minimize the loss.
33

---

## Slide / Page 32

Learning Components
• A loss function:
cross-entropy loss
• An optimization algorithm:
stochastic gradient descent
34

---

## Slide / Page 33

Cross-Entropy Loss

---

## Slide / Page 34

The distance between ො𝑦 and y
• We want to know how far is the classifier output
(the predicted probability of the positive class, i.e.
y=1):
ො𝑦 = σ(w∙x+b)
from the true output (the actual label, 0 or 1):
y
• We'll call this difference:
L( ො𝑦 ,y) = how much ො𝑦 differs from the true y
• We choose the parameters w, b that maximize
the log probability of the true y labels in the
training data given the observations x
36

---

## Slide / Page 35

Deriving cross-entropy loss for
a single observation x
• Now take the log of both sides (mathematically handy)
• Whatever values maximize log p(y|x) will also maximize
p(y|x)
• if y=1, this simplifies to ො𝑦; if y=0, this simplifies to 1- ො𝑦
Goal: Maximize the probability of the correct
label p(y |x) in the case of a binary classification
Maximize:
So maximize:
37

---

## Slide / Page 36

Deriving cross-entropy loss for a single
observation x
• Now flip sign to turn this into a loss function:
something to minimize
• Cross-entropy
• Or, plugging in the definition of ො𝑦:
Maximize:
Minimize:
38

---

## Slide / Page 37

Application to the sentiment example
• We want the loss to be:
• smaller if the model estimate is close to correct
• bigger if the model is confused
• Let us first suppose the true label of this is y=1
(positive)
It's hokey . There are virtually no surprises
, and the writing is second-rate . So why was
it so enjoyable ? For one thing , the cast is
great . Another nice touch is the music . I
was overcome with the urge to get off the
couch and start dancing . It sucked me in ,
and it'll do the same to you .
39

---

## Slide / Page 38

Application to the sentiment example?
• True value is y=1.  How well is our model
doing?
• So the loss is:
5.1 • CLASSIFICATION: THE SIGMOID 5
It's hokey . There are virtually no surprises , and the writing is second-rate .
So why was it so enjoyable  ? For one thing , the cast is
great . Another nice touch is the music . I was overcome with the urge to get off
the couch and start dancing .  It sucked me in , and it'll do the same to you  .
x1=3 x6=4.19
x3=1
x4=3x5=0
x2=2
Figure5.2 A samplemini testdocumentshowing theextractedfeaturesin thevectorx.
Giventhese6 featuresandtheinput review x, P(+ |x) andP(− |x) canbecom-
putedusingEq.5.5:
p(+ |x)= P(Y = 1|x)= s (w·x+ b)
= s ([2.5, − 5.0, − 1.2,0.5,2.0,0.7] ·[3,2,1,3,0,4.19]+ 0.1)
= s (.833)
= 0.70 (5.6)
p(− |x)= P(Y = 0|x)= 1− s (w·x+ b)
= 0.30
Logistic regressionis commonlyappliedto all sortsof NLP tasks,andany property
of theinputcanbeafeature.Considerthetaskof period disambiguation: deciding
if a periodis the endof a sentenceor part of a word, by classifyingeachperiod
into oneof two classesEOS(end-of-sentence)andnot-EOS.We might usefeatures
like x1 below expressingthat the currentword is lower caseandthe classis EOS
(perhapswith a positive weight), or that the currentword is in our abbreviations
dictionary(“Prof.”) andtheclassis EOS(perhapswith anegativeweight).A feature
canalsoexpressa quitecomplex combinationof properties.For examplea period
following anuppercaseword is likely to beanEOS,but if theworditself is S t.and
thepreviousword is capitalized,thentheperiodis likely partof a shorteningof the
word s treet.
x1 =
⇢
1 if “Cas e(wi)= Lower”
0 otherwise
x2 =
⇢
1 if “ wi 2 AcronymDict”
0 otherwise
x3 =
⇢
1 if “ wi = St.& Cas e(wi− 1)= Cap”
0 otherwise
Designing features: Featuresare generallydesignedby examining the training
setwith aneye to linguistic intuitionsandthelinguistic literatureon thedomain.A
carefulerror analysison the training setor devsetof an early versionof a system
oftenprovidesinsightsinto features.
For sometasksit is especially helpful to build complex featuresthatarecombi-
nationsof moreprimitivefeatures.Wesaw suchafeaturefor perioddisambiguation
above, wherea periodon theword S t.waslesslikely to betheendof thesentence
if thepreviousword wascapitalized.For logistic regressionandnaive Bayesthese
combinationfeaturesor featureinteractions haveto bedesignedby hand.featureinteractions
40

---

## Slide / Page 39

Application to the sentiment example?
• Suppose the true value instead  was y = 0.
• So the loss is:
5.1 • CLASSIFICATION: THE SIGMOID 5
It's hokey . There are virtually no surprises , and the writing is second-rate .
So why was it so enjoyable  ? For one thing , the cast is
great . Another nice touch is the music . I was overcome with the urge to get off
the couch and start dancing .  It sucked me in , and it'll do the same to you  .
x1=3 x6=4.19
x3=1
x4=3x5=0
x2=2
Figure5.2 A samplemini testdocumentshowing theextractedfeaturesin thevectorx.
Giventhese6 featuresandtheinput review x, P(+ |x) andP(− |x) canbecom-
putedusingEq.5.5:
p(+ |x)= P(Y = 1|x)= s (w·x+ b)
= s ([2.5, − 5.0, − 1.2,0.5,2.0,0.7] ·[3,2,1,3,0,4.19]+ 0.1)
= s (.833)
= 0.70 (5.6)
p(− |x)= P(Y = 0|x)= 1− s (w·x+ b)
= 0.30
Logistic regressionis commonlyappliedto all sortsof NLP tasks,andany property
of theinputcanbeafeature.Considerthetaskof period disambiguation: deciding
if a periodis the endof a sentenceor part of a word, by classifyingeachperiod
into oneof two classesEOS(end-of-sentence)andnot-EOS.We might usefeatures
like x1 below expressingthat the currentword is lower caseandthe classis EOS
(perhapswith a positive weight), or that the currentword is in our abbreviations
dictionary(“Prof.”) andtheclassis EOS(perhapswith anegativeweight).A feature
canalsoexpressa quitecomplex combinationof properties.For examplea period
following anuppercaseword is likely to beanEOS,but if theworditself is S t.and
thepreviousword is capitalized,thentheperiodis likely partof a shorteningof the
word s treet.
x1 =
⇢
1 if “Cas e(wi)= Lower”
0 otherwise
x2 =
⇢
1 if “ wi 2 AcronymDict”
0 otherwise
x3 =
⇢
1 if “ wi = St.& Cas e(wi− 1)= Cap”
0 otherwise
Designing features: Featuresare generallydesignedby examining the training
setwith aneye to linguistic intuitionsandthelinguistic literatureon thedomain.A
carefulerror analysison the training setor devsetof an early versionof a system
oftenprovidesinsightsinto features.
For sometasksit is especially helpful to build complex featuresthatarecombi-
nationsof moreprimitivefeatures.Wesaw suchafeaturefor perioddisambiguation
above, wherea periodon theword S t.waslesslikely to betheendof thesentence
if thepreviousword wascapitalized.For logistic regressionandnaive Bayesthese
combinationfeaturesor featureinteractions haveto bedesignedby hand.featureinteractions
41

---

## Slide / Page 40

Application to the sentiment example?
• The loss when the model was right (if true y=1)
• Is lower than the loss when model was wrong (if
true y=0):
• Sure enough, the loss was bigger when the
model was wrong!
42

---

## Slide / Page 41

Stochastic Gradient Descent

---

## Slide / Page 42

Our goal: minimize the loss
• Let's make explicit that the loss function
in parameterized by weights  𝛳=(w,b)
• We want the weights that minimize the
loss, averaged over all examples:
44

---

## Slide / Page 43

Intuition of gradient descent
• How do I get to the bottom of this
river canyon?
x
Look around me
360∘
Find the direction
of steepest slope
Go that way
45

---

## Slide / Page 44

Our goal: minimize the loss
• For logistic regression, the loss function
is convex
• A convex function has just one
minimum
• Gradient descent starting from any
point is guaranteed to find the minimum
• (The Loss for multi-layer neural networks is
non-convex)
46

---

## Slide / Page 45

Visualization for a single scalar w
Q: Given current w, should we make it bigger or smaller?
A: Move w in the reverse direction from the slope of the
function
So we'll move positive
(making w bigger)
47where w1 is the initial value of w

---

## Slide / Page 46

Gradients
• The gradient of a function of many
variables is a vector pointing in the
direction of the greatest increase in a
function.
• Gradient Descent: Find the gradient of
the loss function at the current point and
move in the opposite direction.
48

---

## Slide / Page 47

Amount of move in that direction ?
• The value of the gradient (slope in our
example)
𝑑
𝑑𝑤 𝑓(𝑥; 𝑤) weighted by a
learning rate η
• Higher learning rate means move w faster
10 CHA PTER 5 • LOGISTIC REGRESSION
learningratetimesthegradient(or theslope,in oursingle-variableexample):
wt+ 1 = wt − h ddw f (x; w) (5.14)
Nowlet’s extendtheintuition from a functionof onescalarvariablew to many
variables,becausewedon’t justwantto move left or right, wewantto know where
in theN-dimensionalspace(of theN parametersthatmake up q) weshouldmove.
Thegradient is just sucha vector;it expressesthedirectionalcomponentsof the
sharpestslopealongeachof thoseN dimensions.If we’rejustimaginingtwo weight
dimensions(sayfor oneweightwandonebiasb), thegradientmightbeavectorwith
two orthogonalcomponents,eachof whichtellsushow muchthegroundslopesin
thew dimensionandin theb dimension.Fig. 5.4showsavisualizationof thevalue
of a2-dimensionalgradientvectortakenattheredpoint.
Cost(w,b)
w b
Figure5.4 Visualizationof thegradientvectorattheredpointin two dimensionsw andb,
showing thegradientasaredarrow in thex-y plane.
In anactuallogisticregression,theparametervectorw is muchlongerthan1 or
2, sincetheinput featurevectorx canbequitelong, andwe needa weightwi for
eachxi. For eachdimension/variablewi in w (plusthebiasb), thegradientwill have
a componentthattells ustheslopewith respectto thatvariable.Essentiallywe’re
asking:“How muchwouldasmall changein thatvariablewi inﬂuencethetotalloss
functionL?”
In eachdimensionwi, weexpresstheslopeasapartialderivative ∂∂ wi of thelossfunction.Thegradientis thendeﬁnedasavectorof thesepartials.We’ll representˆy
as f (x; q) to makethedependenceon q moreobvious:
—qL( f (x; q), y)) =
2
66664
∂
∂ w1 L( f(x;q), y)∂
∂ w2 L( f(x;q), y)...
∂
∂ wn L( f(x;q), y)
3
77775 (5.15)
Theﬁnal equationfor updatingq basedonthegradientis thus
qt+ 1 = qt − h—L( f (x;q), y) (5.16)
49

---

## Slide / Page 48

Case of N dimensions
• We want to know where in the N-
dimensional space (of the N parameters
that make up θ ) we should move.
• The gradient is just such a vector; it
expresses the directional components of
the sharpest slope along each of the N
dimensions.
50

---

## Slide / Page 49

Visualizing 2 dimensions, w and b
• Visualizing
the gradient
vector at the
red point
• It has two
dimensions
shown in the
x-y plane
10 CHA PTER 5 • LOGISTIC REGRESSION
learningratetimesthegradient(or theslope,in our single-variableexample):
wt+ 1 = wt − h ddw f (x; w) (5.14)
Nowlet’s extendtheintuition from a functionof onescalarvariablew to many
variables,becausewedon’t just wantto move left or right, we wantto know where
in theN-dimensionalspace(of the N parametersthatmake up q) we shouldmove.
The gradient is just sucha vector; it expressesthe directionalcomponentsof the
sharpestslopealongeachof thoseN dimensions.If we’rejustimaginingtwo weight
dimensions(sayfor oneweightw andonebiasb), thegradientmightbeavectorwith
two orthogonalcomponents,eachof which tells ushow muchthegroundslopesin
thew dimensionandin theb dimension.Fig. 5.4shows a visualizationof thevalue
of a 2-dimensionalgradientvectortakenat theredpoint.
Cost(w,b)
w b
Figure 5.4 Visualizationof thegradientvectorat theredpoint in two dimensionsw andb,
showing thegradientasa redarrow in thex-y plane.
In anactuallogistic regression,theparametervectorw is muchlongerthan1 or
2, sincethe input featurevector x canbe quite long, andwe needa weight wi for
eachxi. For eachdimension/variablewi in w (plusthebiasb), thegradientwill have
a componentthat tells us the slopewith respectto that variable. Essentiallywe’re
asking:“How muchwouldasmall changein thatvariablewi inﬂuencethetotal loss
function L?”
In eachdimensionwi, weexpresstheslopeasa partialderivative ∂∂ wi of thelossfunction.Thegradientis thendeﬁnedasavectorof thesepartials.We’ll representˆy
as f (x; q) to make thedependenceon q moreobvious:
—q L( f (x; q), y)) =
2
66664
∂
∂ w1 L( f (x; q), y)∂
∂ w2 L( f (x; q), y)...
∂
∂ wn L( f (x; q), y)
3
77775 (5.15)
Theﬁnal equationfor updatingq basedon thegradientis thus
qt+ 1 = qt − h—L( f (x; q), y) (5.16)
51

---

## Slide / Page 50

Real gradients
• Are much longer; lots and lots of weights
• For each dimension wi the gradient
component i tells us the slope with respect
to that variable.
 “How much would a small change in wi
influence the total loss function L?”
 We express the slope as a partial derivative of
the loss with respect to wi
• The gradient is then defined as a vector of
these partial derivatives.
52

---

## Slide / Page 51

The gradient
We’ll represent ො𝑦 as f (x; θ ) to make the dependence on θ more
obvious:
The final equation for updating θ based on the gradient is thus
53
𝛻𝐿 𝑓 𝑥; 𝜃 , 𝑦 =
𝜕
𝜕𝑤1
𝐿 𝑓 𝑥; 𝜃 , 𝑦
𝜕
𝜕𝑤2
𝐿 𝑓 𝑥; 𝜃 , 𝑦
.
.
.
𝜕
𝜕𝑤𝑛
𝐿 𝑓 𝑥; 𝜃 , 𝑦
𝜕
𝜕𝑏 𝐿 𝑓 𝑥; 𝜃 , 𝑦
)𝜃𝑡+1 = 𝜃𝑡 − 𝜂𝛻L(f x; 𝜃 , 𝑦

---

## Slide / Page 52

Partial derivatives for logistic regression
The loss function
The elegant derivative of this function:
54

---

## Slide / Page 53

Algorithm for Stochastic Gradient
Descent
55

---

## Slide / Page 54

Hyperparameters
• The learning rate η is a hyperparameter
 too high: the learner will take big steps and
overshoot
 too low: the learner will take too long
• More on hyperparameters in Chapter 7
• Instead of being learned by algorithm
from supervision (like regular parameters),
they are chosen by the algorithm designer
(or grid search).
56

---

## Slide / Page 55

Stochastic Gradient Descent: An example
and more details

---

## Slide / Page 56

Working through an example
• One step of gradient descent
• A mini-sentiment example, where the true y=1
(positive)
• Two features:
x1 = 3    (count of positive lexicon words)
x2 = 2    (count of negative lexicon words)
Assume 3 parameters (2 weights and 1 bias) in Θ0
are set to zero: w1 = w2 = b  = 0
And learning rate    η = 0.1
58

---

## Slide / Page 57

Example of gradient descent
• Step to update θ:
where
• Gradient vector has 3 dimensions:
w1 = w2 = b  = 0;
x1 = 3;   x2 = 2
59
𝜃𝑡+1 = 𝜃𝑡 − 𝜂𝛻L(f(𝑥(𝑖); θ), 𝑦(𝑖))

---

## Slide / Page 58

Example of gradient descent
η = 0.1;
• Now that we have a gradient, we compute the
new parameter vector θ1 by moving θ0 in the
opposite direction from the gradient:
• Note that enough negative examples would eventually make w2 negative
60
𝜃𝑡+1 = 𝜃𝑡 − 𝜂𝛻L(f(𝑥(𝑖); θ), 𝑦(𝑖))

---

## Slide / Page 59

Mini-batch training
• Stochastic gradient descent chooses a single
random example at a time.
• That can result in choppy movements
• More common to compute gradient over batches of
training instances.
• Batch training: entire dataset
• Mini-batch training: m examples at a time (512,
or 1024)
• Mini-batches can easily be vectorized
• Size of the minibatch based on the computational
resources.
 Can process all the examples in one mini-batch in
parallel and then accumulate the loss
- not possible with individual or batch training.
61

---

## Slide / Page 60

Regularization

---

## Slide / Page 61

Overfitting
• A model that perfectly matches the training
data has a problem.
• It will also overfit to the data, modeling
noise
 A random word that perfectly predicts y (it
happens to only occur in one class) will get a very
high weight.
 Failing to generalize to a test set without this
word.
• A good model should be able to generalize
well to the unseen (test) data
• A model that overfits will have poor
generalization
63

---

## Slide / Page 62

Overfitting
This movie drew me in, and
it'll do the same to you.
64
X1 = "this"
X2 = "movie
X3 = "hated"
I can't tell you how much
I hated this movie. It
sucked. X5 = "the same to you"X7 = "tell you how much"
X4 = "drew me in"
+
-
Useful or harmless features
4-gram features that just
"memorize" training set and
might cause problems

---

## Slide / Page 63

Overfitting
• A 4-gram model on tiny data will just memorize the data
 100% accuracy on the training set
• But it will be surprised by the novel 4-grams in the test
data
 Low accuracy on the test set
• Models that are too powerful can overfit the data
 Fitting the details of the training data so exactly that
the model doesn't generalize well to the test set
 How to avoid overfitting?
• Regularization in logistic regression
• Dropout in neural networks
65

---

## Slide / Page 64

Regularization
• A solution for overfitting
• Add a regularization term R (θ) to the loss
function (now written as maximizing
logprob rather than minimizing loss)
• Idea: choose an R (θ) that penalizes large
weights
 Fitting the data well with lots of big weights
not as good as fitting the data a little less
well, with small weights
66

---

## Slide / Page 65

L2 Regularization (= Ridge Regression)
• The sum of the squares of the weights
• The name is because this is the (square of
the)  L2 norm ||θ||2, = Euclidean distance
of θ to the origin.
• L2 regularized objective function (where α is
a hyperparameter):
67

---

## Slide / Page 66

L1 Regularization (= Lasso Regression)
• The sum of the (absolute value of the)
weights
• Named after the L1 norm ||W||1, = sum of the
absolute values of the weights, = Manhattan
distance
• L1 regularized objective function:
68

---

## Slide / Page 67

L1 vs L2 Regularization
• Both are commonly used in language processing.
• L2 regularization: easier to optimize because of its
simple derivative (the derivative of 𝜃2 is just 2𝜃)
• L1 regularization: more complex (the derivative of
|𝜃| is non-continuous at zero).
• L2 prefers weight vectors with many small weights
• L1 prefers sparse solutions with some larger
weights but many more weights set to zero.
 L1 regularization leads to much sparser weight
vectors, i.e. far fewer features.
69

---

## Slide / Page 68

Multinomial Logistic Regression

---

## Slide / Page 69

Multinomial Logistic Regression
• Often we need more than 2 classes
 Positive/negative/neutral
 Parts of speech (noun, verb, adjective, adverb,
preposition, etc.)
 Classify emergency SMSs into different actionable
classes
• If >2 classes we use multinomial logistic regression
= Softmax regression
= Multinomial logit (in economics, etc.)
• So "logistic regression" will just mean binary (2 output
classes)
71

---

## Slide / Page 70

Multinomial Logistic Regression
• Multinomial LR generalizes to K terms.
• y and y are represented as vectors.
• True label y is a vector with K elements, each
corresponding to a class, with yc = 1 if the
correct class is c; all other elements of y being 0.
• Our classifier will produce an estimate vector
with K elements y, each element yk of which
represents the estimated probability p(yk = 1| x).
72
• Recall the expression of the loss for binary LR:
^
^ ^

---

## Slide / Page 71

Multinomial Logistic Regression
73
The cross-entropy loss is simply the log of the output
probability corresponding to the correct class (hence the
name negative log likelihood loss).

---

## Slide / Page 72

Multinomial Logistic Regression
• The gradient for a single example turns out to
be very similar to the gradient for binary LR:
74

---

## Slide / Page 73

The softmax function
• The probability of everything must still sum to 1
P(positive|doc) + P(negative|doc) +
P(neutral|doc) = 1
• Need a generalization of the sigmoid called the
softmax
 Takes a vector z = [z1, z2, ..., zk] of k arbitrary values
 Outputs a probability distribution
 each value in the range [0,1]
 all the values summing to 1
75

---

## Slide / Page 74

The softmax function
Turns a vector z = [z1, z2, ... , zk] of k arbitrary values into
probabilities
76

---

## Slide / Page 75

The softmax function
• Turns  a vector z = [z1,z2,...,zk] of k arbitrary
values into probabilities
77

---

## Slide / Page 76

Softmax in multinomial logistic regression
78
• Input is still the dot product between weight
vector w and input vector x
• But now we’ll need separate weight vectors
for each of the K classes.

---

## Slide / Page 77

Features in binary versus multinomial
logistic regression
• Binary: positive weight  y=1
negative weight  y=0
• Multinominal: separate weights for each
class:
79
w5 = 3.0

---

## Slide / Page 78

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
80
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

