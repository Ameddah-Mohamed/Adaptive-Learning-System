# SLP3 Chapter 06: Vector Semantics and Embeddings (Word2Vec, Skip-Gram)

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 134–157

---

### Page 134

126CHAPTER4 • LOGISTICREGRESSION
and F1. Then compute the accuracy of a classifier that labels everything as
not-spam. Which metric is most useful and why?
4.3Redo the gradient-descent step of Section 4.6.3 with a negative training ex-
ample (y=0, letx= [2,5], same initial weights andη=0.1. Report the new
w1,w 2,b, and verify thatw 2 has moved in the direction the text predicts at the
end of the section.

---

### Page 135

CHAPTER
5
Embeddings
荃者所以在鱼，得鱼而忘荃Nets are for fish;
Once you get the fish, you can forget the net.
言者所以在意，得意而忘言Words are for meaning;
Once you get the meaning, you can forget the words
庄子(Zhuangzi), Chapter 26
The asphalt that Los Angeles is famous for occurs mainly on its freeways. But
in the middle of the city is another patch of asphalt, the La Brea tar pits, and this
asphalt preserves millions of fossil bones from the last of the Ice Ages of the Pleis-
tocene Epoch. One of these fossils is theSmilodon, or saber-toothed tiger, instantly
recognizable by its long canines. Five million years ago or so, a completely different
saber-tooth tiger calledThylacosmiluslived
in Argentina and other parts of South Amer-
ica. Thylacosmilus was a marsupial whereas
Smilodon was a placental mammal, but Thy-
lacosmilus had the same long upper canines
and, like Smilodon, had a protective bone
flange on the lower jaw. The similarity of
these two mammals is one of many examples
of parallel or convergent evolution, in which particular contexts or environments
lead to the evolution of very similar structures in different species (Gould, 1980).
The role of context is also important in the similarity of a less biological kind
of organism: the word. Words that occur insimilar contextstend to havesimilar
meanings. This link between similarity in how words are distributed and similarity
in what they mean is called thedistributional hypothesis. The hypothesis wasdistributionalhypothesis
first formulated in the 1950s by linguists like Joos (1950), Harris (1954), and Firth
(1957), who noticed that words which are synonyms (likeoculistandeye-doctor)
tended to occur in the same environment (e.g., near words likeeyeorexamined)
with the amount of meaning difference between two words “corresponding roughly
to the amount of difference in their environments” (Harris, 1954, p. 157).
In this chapter we introduceembeddings, vector representations of the meaningembeddings
of words that are learned directly from word distributions in texts. Embeddings lie
at the heart of large language models and other modern applications. Thestatic em-
beddingswe introduce here underlie the more powerful dynamic orcontextualized
embeddingslikeBERTthat we will see in Chapter 7 and Chapter 9.
The linguistic field that studies embeddings and their meanings is calledvector
semantics. Embeddings are also the first example in this book ofrepresentationvectorsemantics
learning, automatically learning useful representations of the input text. Findingrepresentationlearning
suchself-supervisedways to learn representations of language, instead of creat-
ing representations by hand viafeature engineering, is an important principle of
modern NLP (Bengio et al., 2013).

---

### Page 136

128CHAPTER5 • EMBEDDINGS
5.1 Lexical Semantics
Let’s begin by introducing some basic principles of word meaning. How should
we represent the meaning of a word? In the n-gram models of Chapter 3, and in
classical NLP applications, our only representation of a word is as a string of letters,
or an index in a vocabulary list. This representation is not that different from a
tradition in philosophy, perhaps you’ve seen it in introductory logic classes, in which
the meaning of words is represented by just spelling the word with small capital
letters; representing the meaning of “dog” asDOG, and “cat” asCAT, or by using an
apostrophe (DOG’).
Representing the meaning of a word by capitalizing it is a pretty unsatisfactory
model. You might have seen a version of a joke due originally to semanticist Barbara
Partee (Carlson, 1977):
Q: What’s the meaning of life?
A:LIFE’
Surely we can do better than this! After all, we’ll want a model of word meaning
to do all sorts of things for us. It should tell us that some words have similar mean-
ings (catis similar todog), others are antonyms (coldis the opposite ofhot), some
have positive connotations (happy) while others have negative connotations (sad). It
should represent the fact that the meanings ofbuy,sell, andpayoffer differing per-
spectives on the same underlying purchasing event. (If I buy something from you,
you’ve probably sold it to me, and I likely paid you.) More generally, a model of
word meaning should allow us to draw inferences to address meaning-related tasks
like question-answering or dialogue.
In this section we summarize some of these desiderata, drawing on results in the
linguistic study of word meaning, which is calledlexical semantics; we’ll return tolexicalsemantics
and expand on this list in Appendix I and Chapter 22.
Lemmas and SensesLet’s start by looking at how one word (we’ll choosemouse)
might be defined in a dictionary (simplified from the online dictionary WordNet):
mouse (N)
1. any of numerous small rodents...
2. a hand-operated device that controls a cursor...
Here the formmouseis thelemma, also called thecitation form. The formlemma
citation form mousewould also be the lemma for the wordmice; dictionaries don’t have separate
definitions for inflected forms likemice. Similarlysingis the lemma forsing,sang,
sung. In many languages the infinitive form is used as the lemma for the verb, so
Spanishdormir“to sleep” is the lemma forduermes“you sleep”. The specific forms
sungorcarpetsorsingorduermesare calledwordforms.wordform
As the example above shows, each lemma can have multiple meanings; the
lemmamousecan refer to the rodent or the cursor control device. We call each
of these aspects of the meaning ofmouseaword sense. The fact that lemmas can
bepolysemous(have multiple senses) can make interpretation difficult (is some-
one who searches for “mouse info” looking for a pet or a widget?). Chapter 9 and
Appendix I will discuss the problem of polysemy, and introduceword sense dis-
ambiguation, the task of determining which sense of a word is being used in a
particular context.
SynonymyOne important component of word meaning is the relationship be-
tween word senses. For example when one word has a sense whose meaning is

---

### Page 137

5.1 • LEXICALSEMANTICS129
identical to a sense of another word, or nearly identical, we say the two senses of
those two words aresynonyms. Synonyms include such pairs assynonym
couch/sofa vomit/throw up filbert/hazelnut car/automobile
A more formal definition of synonymy (between words rather than senses) is that
two words are synonymous if they are substitutable for one another in any sentence
without changing thetruth conditionsof the sentence, the situations in which the
sentence would be true.
While substitutions between some pairs of words likecar/automobileorwa-
ter/H 2Oare truth preserving, the words are still not identical in meaning. Indeed,
probably no two words are absolutely identical in meaning. One of the fundamental
tenets of semantics, called theprinciple of contrast(Girard 1718, Br´eal 1897, Clarkprinciple ofcontrast
1987), states that a difference in linguistic form is always associated with some dif-
ference in meaning. For example, the wordH 2Ois used in scientific contexts and
would be inappropriate in a hiking guide—waterwould be more appropriate— and
this genre difference is part of the meaning of the word. In practice, the wordsyn-
onymis therefore used to describe a relationship of approximate or rough synonymy.
Word SimilarityWhile words don’t have many synonyms, most words do have
lots ofsimilarwords.Catis not a synonym ofdog, butcatsanddogsare certainly
similar words. In moving from synonymy to similarity, it will be useful to shift from
talking about relations between word senses (like synonymy) to relations between
words (like similarity). Dealing with words avoids having to commit to a particular
representation of word senses, which will turn out to simplify our task.
The notion of wordsimilarityis very useful in larger semantic tasks. Knowingsimilarity
how similar two words are can help in computing how similar the meaning of two
phrases or sentences are, a very important component of tasks like question answer-
ing, paraphrasing, and summarization. One way of getting values for word similarity
is to ask humans to judge how similar one word is to another. A number of datasets
have resulted from such experiments. For example the SimLex-999 dataset (Hill
et al., 2015) gives values on a scale from 0 to 10, like the examples below, which
range from near-synonyms (vanish,disappear) to pairs that scarcely seem to have
anything in common (hole,agreement):
vanish disappear 9.8
belief impression 5.95
muscle bone 3.65
modest flexible 0.98
hole agreement 0.3
Word RelatednessThe meaning of two words can be related in ways other than
similarity. One such class of connections is called wordrelatedness(Budanitskyrelatedness
and Hirst, 2006), also traditionally called wordassociationin psychology.association
Consider the meanings of the wordscoffeeandcup. Coffee is not similar to cup;
they share practically no features (coffee is a plant or a beverage, while a cup is a
manufactured object with a particular shape). But coffee and cup are clearly related;
they are associated by co-participating in an everyday event (the event of drinking
coffee out of a cup). Similarlyscalpelandsurgeonare not similar but are related
eventively (a surgeon tends to make use of a scalpel).
One common kind of relatedness between words is if they belong to the same
semantic field. A semantic field is a set of words which cover a particular semanticsemantic field
domain and bear structured relations with each other. For example, words might be

---

### Page 138

130CHAPTER5 • EMBEDDINGS
related by being in the semantic field of hospitals (surgeon,scalpel,nurse,anes-
thetic,hospital), restaurants (waiter,menu,plate,food,chef), or houses (door,roof,
kitchen,family,bed). Semantic fields are also related to a formalism calledtopic
models, likeLatent Dirichlet Allocation,LDA, which apply unsupervised learn-topic models
ing on large sets of texts to induce sets of associated words from text. Semantic
fields and topic models are very useful tools for discovering topical structure in doc-
uments.
In Appendix I we’ll introduce more relations between senses likehypernymyor
IS-A,antonymy(opposites) andmeronymy(part-whole relations).
ConnotationFinally, words haveaffective meaningsorconnotations. The wordconnotations
connotationhas different meanings in different fields, but here we use it to mean
the aspects of a word’s meaning that are related to a writer or reader’s emotions,
sentiment, opinions, or evaluations. For example some words have positive conno-
tations (wonderful) while others have negative connotations (dreary). Even words
whose meanings are similar in other ways can vary in connotation; consider the dif-
ference in connotations betweenfake,knockoff,forgery, on the one hand, andcopy,
replica,reproductionon the other, orinnocent(positive connotation) andnaive(neg-
ative connotation). Some words describe positive evaluation (great,love) and oth-
ers negative evaluation (terrible,hate). Positive or negative evaluation language is
calledsentiment, and word sentiment plays a role in important tasks like sentimentsentiment
analysis, stance detection, and applications of NLP to the language of politics and
consumer reviews.
Early work on affective meaning (Osgood et al., 1957) found that words varied
along three important dimensions of affective meaning:
valence:the pleasantness of the stimulus
arousal:the intensity of emotion provoked by the stimulus
dominance:the degree of control exerted by the stimulus
Thus words likehappyorsatisfiedare high on valence, whileunhappyoran-
noyedare low on valence.Excitedis high on arousal, whilecalmis low on arousal.
Controllingis high on dominance, whileawedorinfluencedare low on dominance.
Each word is thus represented by three numbers, corresponding to its value on each
of the three dimensions:
Valence Arousal Dominance
courageous 8.0 5.5 7.4
music 7.7 5.6 6.5
heartbreak 2.5 5.7 3.6
cub 6.7 4.0 4.2
Osgood et al. (1957) noticed that in using these 3 numbers to represent the
meaning of a word, the model was representing each word as a point in a three-
dimensional space, a vector whose three dimensions corresponded to the word’s
rating on the three scales. This revolutionary idea that word meaning could be rep-
resented as a point in space (e.g., that part of the meaning ofheartbreakcan be
represented as the point[2.5,5.7,3.6]) was the first expression of the vector seman-
tics models that we introduce next.

---

### Page 139

5.2 • VECTORSEMANTICS: THEINTUITION131
5.2 Vector Semantics: The Intuition
Vector semanticsis the standard way to represent word meaning in NLP, helpingvectorsemantics
us model many of the aspects of word meaning we saw in the previous section. The
roots of the model lie in the 1950s when two big ideas converged: Osgood’s 1957
idea mentioned above to use a point in three-dimensional space to represent the
connotation of a word, and the proposal by linguists like Joos (1950), Harris (1954),
and Firth (1957) to define the meaning of a word by itsdistributionin language
use, meaning its neighboring words or grammatical environments. Their idea was
that two words that occur in very similar distributions (whose neighboring words are
similar) have similar meanings.
For example, suppose you didn’t know the meaning of the wordongchoi(a re-
cent borrowing from Cantonese) but you see it in the following contexts:
(5.1) Ongchoi is delicious sauteed with garlic.
(5.2) Ongchoi is superb over rice.
(5.3) ...ongchoi leaves with salty sauces...
And suppose that you had seen many of these context words in other contexts:
(5.4) ...spinach sauteed with garlic over rice...
(5.5) ...chard stems and leaves are delicious...
(5.6) ...collard greens and other salty leafy greens
The fact thatongchoioccurs with words likericeandgarlicanddeliciousand
salty, as do words likespinach,chard, andcollard greensmight suggest that ongchoi
is a leafy green similar to these other leafy greens. 1 We can implement the same
intuition computationally by just counting words in the context ofongchoi.
Figure 5.1A two-dimensional (t-SNE) visualization of 200-dimensional word2vec em-
beddings for some words close to the wordsweet, showing that words with similar mean-
ings are nearby in space. Visualization created using the TensorBoard Embedding Projector
https://projector.tensorflow.org/.
The idea of vector semantics is to represent a word as a point in a multidimen-
sional semantic space that is derived (in different ways we’ll see) from the distri-
butions of word neighbors. Vectors for representing words are calledembeddings.embeddings
1 It’s in factIpomoea aquatica, a relative of morning glory sometimes calledwater spinachin English.

---

### Page 140

132CHAPTER5 • EMBEDDINGS
The word “embedding” derives historically from its mathematical sense as a map-
ping from one space or structure to another, although the meaning has shifted; see
the end of the chapter.
Fig. 5.1 shows a visualization of embeddings learned by the word2vec algorithm,
showing the location of selected words (neighbors of “sweet”) projected down from
200-dimensional space into a 2-dimensional space. Note that the nearest neighbors
ofsweetare semantically related words likehoney,candy,juice,chocolate. This
idea that similar words are neighbors in high-dimensional space offers enormous
power to language models and other NLP applications. For example the sentiment
classifiers of Chapter 4 depend on the same words appearing in the training and test
sets. But by representing words as embeddings, a classifier can assign sentiment
as long as it sees some words withsimilar meanings. And as we’ll see, vector
semantic models like the ones showed in Fig. 5.1 can be learned automatically from
text without supervision.
In this chapter we’ll begin with a simple pedagogical model of embeddings in
which the meaning of a word is defined by a vector with the counts of nearby words.
We introduce this model as a helpful way to understand the concept of vectors and
what it means for a vector to be a representation of word meaning, but more sophis-
ticated variants like thetf-idf modelwe will introduce in Chapter 11 are important
methods you should understand. We will see that this method results in very long
vectors that aresparse, i.e. mostly zeros (since most words simply never occur in the
context of others). We’ll then introduce theword2vecmodel family for constructing
short,densevectors that have even more useful semantic properties.
We’ll also introduce thecosine, the standard way to use embeddings to com-
putesemantic similarity, between two words, two sentences, or two documents, an
important tool in practical applications.
5.3 Simple count-based embeddings
“The most important attributes of a vector in 3-space are{Location, Location, Location}”
Randall Munroe, the hover fromhttps://xkcd.com/2358/
Let’s now introduce the first way to compute word vector embeddings. This sim-
plest vector model of meaning is based on theco-occurrence matrix, a way of rep-
resenting how often words co-occur. We’ll define a particular kind of co-occurrence
matrix, theword-context matrix, in which each row in the matrix represents a wordword-contextmatrix
in the vocabulary and each column represents how often each other word in the vo-
cabulary appears nearby. This matrix is thus of dimensionality|V| × |V|and each
cell records the number of times the row (target) word and the column (context)
word co-occur nearby in some training corpus.
What do we mean by ‘nearby’? We could implement various methods, but let’s
start with a very simple one: a context window around the word, let’s say of 4
words to the left and 4 words to the right. If we do that, each cell will represent
the number of times (in some training corpus) the column word occurs in such a
±4-word window around the row word.
Let’s see how this works for 4 words:cherry,strawberry,digital, andinforma-
tion. For each word we took a single instance from a corpus, and we show the±4
word window from that instance:

---

### Page 141

5.3 • SIMPLE COUNT-BASED EMBEDDINGS133
is traditionally followed bycherrypie, a traditional dessert
often mixed, such asstrawberryrhubarb pie. Apple pie
computer peripherals and personaldigitalassistants. These devices usually
a computer. This includesinformationavailable on the internet
If we then take every occurrence of each word in a large corpus and count the
context words around it, we get a word-context co-occurrence matrix. The full word-
context co-occurrence matrix is very large, because for each word in the vocabulary
(of size|V|) we have to count how often it occurs with every other word in the vo-
cabulary, hence dimensionality|V| × |V|. Let’s therefore instead sketch the process
on a smaller scale. Imagine that we are going to look at only the 4 words, and only
consider the following 3 context words:a,computer, andpie. Furthermore let’s
assume we only count occurrences in the mini-corpus above.
So before looking at Fig. 5.2, compute by hand the counts for these 3 context
words for the four wordscherry,strawberry,digital, andinformation.
a computer pie
cherry1 0 1
strawberry0 0 2
digital0 1 0
information1 1 0
Figure 5.2Co-occurrence vectors for four words with counts from the 4 windows above,
showing just 3 of the potential context word dimensions. The vector forcherryis outlined in
red. Note that a real vector would have vastly more dimensions and thus be even sparser.
Hopefully your count matches what is shown in Fig. 5.2, so that each cell repre-
sents the number of times a particular word (defined by the row) occurs in a partic-
ular context (defined by the word column).
Each row, then, is a vector representing a word. To review some basic linear
algebra, avectoris, at heart, just a list or array of numbers. Socherryis representedvector
as the list [1,0,1] (the firstrow vectorin Fig. 5.2) andinformationis represented as
the list [1,1,0] (the fourth row vector).
Avector spaceis a collection of vectors, and is characterized by itsdimension.vector space
dimension Vectors in a 3-dimensional vector space have an element for each dimension of the
space. We will loosely refer to a vector in a 3-dimensional space as a 3-dimensional
vector, with one element along each dimension. In the example in Fig. 5.2, we’ve
chosen to make the word vectors of dimension 3, just so they fit on the page; in
real word-word matrices, the vectors would have dimensionality|V|, the vocabulary
size.
The ordering of the numbers in a vector space indicates the different dimensions
on which words vary. The third dimension for all these vectors corresponds to the
number of timespieoccurs in the context. The second dimension for all of them cor-
responds to the number of times the wordcomputeroccurs. Notice that the vectors
forinformationanddigitalhave the same value (1) for this “computer” dimension.
In reality, we don’t compute word vectors on a single context window. Instead,
we compute them over an entire corpus. Let’s see what some real counts look like.
Let’s look at some vectors computed in this way. Fig. 5.3 shows a subset of the
word-word co-occurrence matrix for these four words, where, again because it’s
impossible to visualize all|V|possible context words on the page of this textbook,
we show a subset of 6 of the dimensions, with counts computed from the Wikipedia
corpus (Davies, 2015).
Note in Fig. 5.3 that the two wordscherryandstrawberryare more similar to

---

### Page 142

134CHAPTER5 • EMBEDDINGS
aardvark...computer data result pie sugar...
cherry0 ... 2 8 9 442 25 ...
strawberry0 ... 0 0 1 60 19 ...
digital0 ... 1670 1683 85 5 4 ...
information0 ... 3325 3982 378 5 13 ...
Figure 5.3Co-occurrence vectors for four words in the Wikipedia corpus, showing six of
the dimensions (hand-picked for pedagogical purposes). The vector fordigitalis outlined in
red. Note that a real vector would have vastly more dimensions and thus be much sparser, i.e.
would have zero values in most dimensions.
each other (bothpieandsugartend to occur in their window) than they are to other
words likedigital; conversely,digitalandinformationare more similar to each other
than, say, tostrawberry.
We can think of the vector for a word as a point in|V|-dimensional space; thus
the words in Fig. 5.3 are points in 6-dimensional space. Fig. 5.4 shows a spatial
visualization in 2 dimensions.
1000200030004000
1000
2000
digital
[1683,1670]
computer
data
information
[3982,3325] 3000
4000
Figure 5.4A spatial visualization of word vectors fordigitalandinformation, showing just
two of the dimensions, corresponding to the wordsdataandcomputer.
Note that|V|, the dimensionality of the vector, is generally the size of the vo-
cabulary, often between 10,000 and 50,000 words (using the most frequent words
in the training corpus; keeping words after about the most frequent 50,000 or so is
generally not helpful). Since most of these numbers are zero these aresparsevector
representations; there are efficient algorithms for storing and computing with sparse
matrices.
It’s also possible to apply various kinds of weighting functions to the counts
in these cells. The most popular such weighting is tf-idf, which we’ll introduce in
Chapter 11, but there have historically been a wide variety of other weightings.
Now that we have some intuitions, let’s move on to examine the details of com-
puting word similarity.
5.4 Cosine for Measuring Similarity
To measure similarity between two target wordsvandw, we need a metric that
takes two vectors (of the same dimensionality, either both with words as dimensions,
hence of length|V|, or both with documents as dimensions, of length|D|) and gives
a measure of their similarity. By far the most common similarity metric is thecosine
of the angle between the vectors.

---

### Page 143

5.4 • COSINE FORMEASURINGSIMILARITY135
The cosine—like most measures for vector similarity used in NLP—is based on
thedot productoperator from linear algebra, also called theinner product:dot product
inner product
dot product(v,w) =v·w=
NX
i=1
viwi =v 1w1 +v 2w2 +...+v NwN (5.7)
The dot product acts as a similarity metric because it will tend to be high just when
the two vectors have large values in the same dimensions. Alternatively, vectors that
have zeros in different dimensions—orthogonal vectors—will have a dot product of
0, representing their strong dissimilarity.
This raw dot product, however, has a problem as a similarity metric: it favors
longvectors. Thevector lengthis defined asvector length
|v|=
vuut NX
i=1
v2i (5.8)
The dot product is higher if a vector is longer, with higher values in each dimension.
More frequent words have longer vectors, since they tend to co-occur with more
words and have higher co-occurrence values with each of them. The raw dot product
thus will be higher for frequent words. But this is a problem; we’d like a similarity
metric that tells us how similar two words are regardless of their frequency.
We modify the dot product to normalize for the vector length by dividing the
dot product by the lengths of each of the two vectors. Thisnormalized dot product
turns out to be the same as the cosine of the angle between the two vectors, following
from the definition of the dot product between two vectorsaandb:
a·b=|a||b|cosθ
a·b
|a||b| =cosθ(5.9)
Thecosinesimilarity metric between two vectorsvandwthus can be computed as:cosine
cosine(v,w) = v·w|v||w| =
NX
i=1
viwi
vuut NX
i=1
v2i
vuut NX
i=1
w2i
(5.10)
For some applications we pre-normalize each vector, by dividing it by its length,
creating aunit vectorof length 1. Thus we could compute a unit vector fromabyunit vector
dividing it by|a|. For unit vectors, the dot product is the same as the cosine.
The cosine value ranges from 1 for vectors pointing in the same direction, through
0 for orthogonal vectors, to -1 for vectors pointing in opposite directions. But since
raw frequency values are non-negative, the cosine for these vectors ranges from 0–1.
Let’s see how the cosine computes which of the wordscherryordigitalis closer
in meaning toinformation, just using raw counts from the following shortened table:
pie data computer
cherry442 8 2
digital5 1683 1670
information5 3982 3325

---

### Page 144

136CHAPTER5 • EMBEDDINGS
cos(cherry,information) = 442∗5+8∗3982+2∗3325√
4422 +8 2 +2 2√52 +3982 2 +3325 2 =.018
cos(digital,information) = 5∗5+1683∗3982+1670∗3325√
52 +1683 2 +1670 2√52 +3982 2 +3325 2 =.996
The model decides thatinformationis way closer todigitalthan it is tocherry, a
result that seems sensible. Fig. 5.5 shows a visualization.
500 1000 1500 2000 2500 3000
500
digital
cherry
information
Dimension 1: ‘pie’
Dimension 2: ‘computer’
Figure 5.5A (rough) graphical demonstration of cosine similarity, showing vectors for
three words (cherry,digital, andinformation) in the two dimensional space defined by counts
of the wordscomputerandpienearby. The figure doesn’t show the cosine, but it highlights the
angles; note that the angle betweendigitalandinformationis smaller than the angle between
cherryandinformation. When two vectors are more similar, the cosine is larger but the angle
is smaller; the cosine has its maximum (1) when the angle between two vectors is smallest
(0◦); the cosine of all other angles is less than 1.
Cosine similarity can be used to estimate word similarity, for tasks like finding
word paraphrases, tracking changes in word meaning, or automatically discovering
meanings of words in different corpora. For example, we can find the 10 most
similar words to any target wordwby computing the cosines betweenwand each of
the|V| −1 other words, sorting, and looking at the top 10.
5.5 Word2vec
In the previous sections we saw how to represent a word as a sparse, long vector with
dimensions corresponding to words in the vocabulary. We now introduce a more
powerful word representation:embeddings, short dense vectors. Unlike the vectors
we’ve seen so far, embeddings areshort, with number of dimensionsdranging from
50-1000, rather than the much larger vocabulary size|V|. Theseddimensions don’t
have a clear interpretation. And the vectors aredense: instead of vector entries
being sparse, mostly-zero counts or functions of counts, the values will be real-
valued numbers that can be negative.
It turns out that dense vectors work better in every NLP task than sparse vectors.
While we don’t completely understand all the reasons for this, we have some intu-
itions. Representing words as 300-dimensional dense vectors requires our classifiers
to learn far fewer weights than if we represented words as 50,000-dimensional vec-
tors, and the smaller parameter space possibly helps with generalization and avoid-
ing overfitting. Dense vectors may also do a better job of capturing synonymy. For
example, in a sparse vector representation, dimensions for synonyms likecarand

---

### Page 145

5.5 • WORD2VEC137
automobileare distinct and unrelated; sparse vectors may thus fail to capture the
similarity between a word withcaras a neighbor and a word withautomobileas a
neighbor.
In this section we introduce one method for computing embeddings:skip-gramskip-gram
with negative sampling, sometimes calledSGNS. The skip-gram algorithm is oneSGNS
of two algorithms in a software package calledword2vec, and so sometimes theword2vec
algorithm is loosely referred to as word2vec (Mikolov et al. 2013a, Mikolov et al.
2013b). The word2vec methods are fast, efficient to train, and easily available on-
line with code and pretrained embeddings. Word2vec embeddings arestatic em-
beddings, meaning that the method learns one fixed embedding for each word in thestaticembeddings
vocabulary. In Chapter 9 we’ll introduce methods for learning dynamiccontextual
embeddingslike the popular family ofBERTrepresentations, in which the vector
for each word is different in different contexts.
The intuition of word2vec is that instead of counting how often each context
wordcoccurs near, say,apricot, we’ll instead train a classifier on a binary prediction
task: “Is wordclikely to show up nearapricot?” We don’t actually care about
this prediction task; instead we’ll take the learned classifierweightsas the word
embeddings.
The revolutionary intuition here is that we can just use running text as implicitly
supervised training data for such a classifier; a wordcthat occurs near the target
wordapricotacts as gold ‘correct answer’ to the question “Is wordclikely to show
up nearapricot?” This method, often calledself-supervision, avoids the need forself-supervision
any sort of hand-labeled supervision signal. This idea was first proposed in the task
of neural language modeling, when Bengio et al. (2003) and Collobert et al. (2011)
showed that a neural language model (a neural network that learned to predict the
next word from prior words) could just use the next word in running text as its
supervision signal, and could be used to learn an embedding representation for each
word as part of doing this prediction task.
We’ll see how to do neural networks in the next chapter, but word2vec is a
much simpler model than the neural network language model, in two ways. First,
word2vec simplifies the task (making it binary classification instead of word pre-
diction). Second, word2vec simplifies the architecture (training a logistic regression
classifier instead of a multi-layer neural network with hidden layers that demand
more sophisticated training algorithms). The intuition of skip-gram is:
1. Treat the target word and a neighboring context word as positive examples.
2. Randomly sample other words in the lexicon to get negative samples.
3. Use logistic regression to train a classifier to distinguish those two cases.
4. Use the learned weights as the embeddings.
5.5.1 The classifier
Let’s start by thinking about the classification task, and then turn to how to train.
Imagine a sentence like the following, with a target wordapricot, and assume we’re
using a window of±2 context words:
... lemon, a [tablespoon of apricot jam, a] pinch ...
c1 c2 w c3 c4
Our goal is to train a classifier such that, given a tuple(w,c)of a target word
wpaired with a candidate context wordc(for example (apricot,jam), or perhaps

---

### Page 146

138CHAPTER5 • EMBEDDINGS
(apricot,aardvark)) it will return the probability thatcis a real context word (true
forjam, false foraardvark):
P(+|w,c)(5.11)
The probability that wordcis not a real context word forwis just 1 minus
Eq. 5.11:
P(−|w,c) =1−P(+|w,c)(5.12)
How does the classifier compute the probabilityP? The intuition of the skip-
gram model is to base this probability on embedding similarity: a word is likely to
occur near the target if its embedding vector is similar to the target embedding. To
compute similarity between these dense embeddings, we rely on the intuition that
two vectors are similar if they have a highdot product(after all, cosine is just a
normalized dot product). In other words:
Similarity(w,c)≈c·w(5.13)
The dot productc·wis not a probability, it’s just a number ranging from−∞to∞
(since the elements in word2vec embeddings can be negative, the dot product can be
negative). To turn the dot product into a probability, we’ll use thelogisticorsigmoid
functionσ(x), the fundamental core of logistic regression:
σ(x) = 11+exp(−x) (5.14)
We model the probability that wordcis a real context word for target wordwas:
P(+|w,c) =σ(c·w) = 11+exp(−c·w) (5.15)
The sigmoid function returns a number between 0 and 1, but to make it a probability
we’ll also need the total probability of the two possible events (cis a context word,
andcisn’t a context word) to sum to 1. We thus estimate the probability that wordc
is not a real context word forwas:
P(−|w,c) =1−P(+|w,c)
=σ(−c·w) = 11+exp(c·w) (5.16)
Equation 5.15 gives us the probability for one word, but there are many context
words in the window. Skip-gram makes the simplifying assumption that all context
words are independent, allowing us to just multiply their probabilities:
P(+|w,c1:L) =
LY
i=1
σ(c i ·w)(5.17)
logP(+|w,c 1:L) =
LX
i=1
logσ(c i ·w)(5.18)
In summary, skip-gram trains a probabilistic classifier that, given a test target word
wand its context window ofLwordsc 1:L, assigns a probability based on how similar
this context window is to the target word. The probability is based on applying the

---

### Page 147

5.5 • WORD2VEC139
1
W
C
aardvark
zebra
zebra
aardvark
apricot
apricot
|V|
|V|+1
2|V|
𝜽 =
target words
context & noise
words
…
…
1..d
…
…
Figure 5.6The embeddings learned by the skipgram model. The algorithm stores two em-
beddings for each word, the target embedding (sometimes called the input embedding) and
the context embedding (sometimes called the output embedding). The parameterθthat the al-
gorithm learns is thus a matrix of 2|V|vectors, each of dimensiond, formed by concatenating
two matrices, the target embeddingsWand the context+noise embeddingsC.
logistic (sigmoid) function to the dot product of the embeddings of the target word
with each context word. To compute this probability, we just need embeddings for
each target word and context word in the vocabulary.
Fig. 5.6 shows the intuition of the parameters we’ll need. Skip-gram actually
stores two embeddings for each word, one for the word as a target, and one for the
word considered as context. Thus the parameters we need to learn are two matrices
WandC, each containing an embedding for every one of the|V|words in the
vocabularyV. 2 Let’s now turn to learning these embeddings (which is the real goal
of training this classifier in the first place).
5.5.2 Learning skip-gram embeddings
The learning algorithm for skip-gram embeddings takes as input a corpus of text,
and a chosen vocabulary size N. It begins by assigning a random embedding vector
for each of the N vocabulary words, and then proceeds to iteratively shift the em-
bedding of each wordwto be more like the embeddings of words that occur nearby
in texts, and less like the embeddings of words that don’t occur nearby. Let’s start
by considering a single piece of training data:
... lemon, a [tablespoon of apricot jam, a] pinch ...
c1 c2 w c3 c4
This example has a target wordw(apricot), and 4 context words in theL=±2
window, resulting in 4 positive training instances (on the left below):
positive examples +
w c pos
apricot tablespoon
apricot of
apricot jam
apricot a
negative examples -
w c neg w c neg
apricot aardvark apricot seven
apricot my apricot forever
apricot where apricot dear
apricot coaxial apricot if
2 In principle the target matrix and the context matrix could use different vocabularies, but we’ll simplify
by assuming one shared vocabularyV.

---

### Page 148

140CHAPTER5 • EMBEDDINGS
For training a binary classifier we also need negative examples. In fact skip-
gram with negative sampling (SGNS) uses more negative examples than positive
examples (with the ratio between them set by a parameterk). So for each of these
(w,cpos)training instances we’ll createknegative samples, each consisting of the
targetwplus a ‘noise word’c neg. A noise word is a random word from the lexicon,
constrained not to be the target wordw. The table right above shows the setting
wherek=2, so we’ll have 2 negative examples in the negative training set−for
each positive examplew,c pos.
The noise words are chosen according to their weighted unigram probability
pα (w), whereαis a weight. If we were sampling according to unweighted proba-
bilityP(w), it would mean that with unigram probabilityP(“the”)we would choose
the wordtheas a noise word, with unigram probabilityP(“aardvark”)we would
chooseaardvark, and so on. But in practice it is common to setα=0.75, i.e. use
the weightingP 3
4
(w):
Pα (w) = count(w)αP
w′ count(w′)α (5.19)
Settingα=.75 gives better performance because it gives rare noise words slightly
higher probability: for rare words,P α (w)>P(w). To illustrate this intuition, it
might help to work out the probabilities for an example withα=.75 and two events,
P(a) =0.99 andP(b) =0.01:
Pα (a) = .99.75.99.75 +.01 .75 =0.97
Pα (b) = .01.75.99.75 +.01 .75 =0.03(5.20)
Thus usingα=.75 increases the probability of the rare eventbfrom 0.01 to 0.03.
Given the set of positive and negative training instances, and an initial set of
embeddings, the goal of the learning algorithm is to adjust those embeddings to
• Maximize the similarity of the target word, context word pairs(w,c pos)drawn
from the positive examples
• Minimize the similarity of the(w,c neg)pairs from the negative examples.
If we consider one word/context pair(w,cpos)with itsknoise wordsc neg1...cnegk,
we can express these two goals as the following loss functionLto be minimized
(hence the−); here the first term expresses that we want the classifier to assign the
real context wordc pos a high probability of being a neighbor, and the second term
expresses that we want to assign each of the noise wordsc negi a high probability of
being a non-neighbor, all multiplied because we assume independence:
L(w,cpos,c neg*) =−log
"
P(+|w,cpos)
kY
i=1
P(−|w,cnegi)
#
=−
"
logP(+|w,c pos) +
kX
i=1
logP(−|w,c negi)
#
=−
"
logP(+|w,c pos) +
kX
i=1
log
1−P(+|w,c negi)

#
=−
"
logσ(c pos ·w) +
kX
i=1
logσ(−c negi ·w)
#
(5.21)

---

### Page 149

5.5 • WORD2VEC141
That is, we want to maximize the dot product of the word with the actual context
words, and minimize the dot products of the word with theknegative sampled non-
neighbor words.
We minimize this loss function using stochastic gradient descent. Fig. 5.7 shows
the intuition of one step of learning.
W
C
move apricot and jam closer,
increasing cpos z w
aardvark
move apricot and matrix apart
decreasing cneg1 z w
“…apricot jam…”
w
zebra
zebra
aardvark
jam
apricot
cpos
matrix
T olstoy move apricot and T olstoy apart
decreasing cneg2 z w
!
cneg1
cneg2
k=2
Figure 5.7Intuition of one step of gradient descent. The skip-gram model tries to shift em-
beddings so the target embeddings (here forapricot) are closer to (have a higher dot product
with) context embeddings for nearby words (herejam) and further from (lower dot product
with) context embeddings for noise words that don’t occur nearby (hereTolstoyandmatrix).
To get the gradient, we need to take the derivative of Eq. 5.21 with respect to
the different embeddings. It turns out the derivatives are the following (we leave the
proof as an exercise at the end of the chapter):
∂L
∂c pos
= [σ(c pos ·w)−1]w(5.22)
∂L
∂c negi
= [σ(c negi ·w)]w(5.23)
∂L
∂w = [σ(c pos ·w)−1]c pos +
kX
i=1
[σ(c negi ·w)]c negi (5.24)
The update equations going from time stepttot+1 in stochastic gradient descent
are thus:
ct+1pos =c tpos −η[σ(c tpos ·w t )−1]w t (5.25)
ct+1negi =c tnegi −η[σ(c tnegi ·w t )]wt (5.26)
wt+1 =w t −η
"
[σ(ctpos ·w t )−1]c tpos +
kX
i=1
[σ(ctnegi ·w t )]ctnegi
#
(5.27)
Just as in logistic regression, then, the learning algorithm starts with randomly ini-
tializedWandCmatrices, and then walks through the training corpus using gradient
descent to moveWandCso as to minimize the loss in Eq. 5.21 by making the up-
dates in (Eq. 5.25)-(Eq. 5.27).

---

### Page 150

142CHAPTER5 • EMBEDDINGS
Recall that the skip-gram model learnstwoseparate embeddings for each wordi:
thetarget embeddingw i and thecontext embeddingc i, stored in two matrices, thetargetembeddingcontext
embedding target matrixWand thecontext matrixC. It’s common to just add them together,
representing wordiwith the vectorw i +c i. Alternatively we can throw away theC
matrix and just represent each wordiby the vectorw i.
As with the simple count-based methods like tf-idf, the context window size
affects the performance of skip-gram embeddings, and experiments often tune the
context window size parameter on a devset.
5.5.3 Other kinds of static embeddings
There are many kinds of static embeddings. An extension of word2vec,fasttextfasttext
(Bojanowski et al., 2017), addresses a problem with word2vec as we have presented
it so far: it has no good way to deal withunknown words—words that appear in
a test corpus but were unseen in the training corpus. A related problem is word
sparsity, such as in languages with rich morphology, where some of the many forms
for each noun and verb may only occur rarely. Fasttext deals with these problems
by using subword models, representing each word as itself plus a bag of constituent
n-grams, with special boundary symbols<and>added to each word. For example,
withn=3 the wordwherewould be represented by the sequence<where>plus the
character n-grams:
<wh, whe, her, ere, re>
Then a skipgram embedding is learned for each constituent n-gram, and the word
whereis represented by the sum of all of the embeddings of its constituent n-grams.
Unknown words can then be represented only by the sum of the constituent n-grams.
A fasttext open-source library, including pretrained embeddings for 157 languages,
is available athttps://fasttext.cc.
Another very widely used static embedding model is GloVe (Pennington et al.,
2014), short for Global Vectors, because the model is based on capturing global
corpus statistics. GloVe is based on ratios of probabilities from the word-word co-
occurrence matrix.
It turns out that dense embeddings like word2vec actually have an elegant math-
ematical relationship with count-based embeddings, in which word2vec can be seen
as implicitly optimizing a function of a count matrix with a particular (PPMI) weight-
ing (Levy and Goldberg, 2014c).
5.6 Visualizing Embeddings
“I see well in many dimensions as long as the dimensions are around two.”
The late economist Martin Shubik
Visualizing embeddings is an important goal in helping understand, apply, and
improve these models of word meaning. But how can we visualize a (for example)
100-dimensional vector?
Rohde, Gonnerman, Plaut Modeling Word Meaning Using Lexical Co-Occurrence
HEAD
HANDFACE
DOG
AMERICA
CAT
EYE
EUROPE
FOOT
CHINA
FRANCE
CHICAGO
ARM
FINGER
NOSE
LEG
RUSSIA
MOUSE
AFRICA
ATLANTA
EAR
SHOULDER
ASIA
COW
BULL
PUPPY LION
HAWAII
MONTREAL
TOKYO
TOE
MOSCOW
TOOTH
NASHVILLE
BRAZIL
WRIST
KITTEN
ANKLE
TURTLE
OYSTER
Figure 8: Multidimensional scaling for three noun classes.
WRIST
ANKLE
SHOULDER
ARM
LEG
HAND
FOOT
HEAD
NOSE
FINGER
TOE
FACE
EAR
EYE
TOOTH
DOG
CAT
PUPPY
KITTEN
COW
MOUSE
TURTLE
OYSTER
LION
BULL
CHICAGO
ATLANTA
MONTREAL
NASHVILLE
TOKYO
CHINA
RUSSIA
AFRICA
ASIA
EUROPE
AMERICA
BRAZIL
MOSCOW
FRANCE
HAWAII
Figure 9: Hierarchical clustering for three noun classes using distances based on vector correlations.
20
The simplest way to visualize the meaning of a word
wembedded in a space is to list the most similar words to
wby sorting the vectors for all words in the vocabulary by
their cosine with the vector forw. For example the 7 closest
words tofrogusing a particular set of embeddings computed

---

### Page 151

5.7 • SEMANTIC PROPERTIES OF EMBEDDINGS143
with the GloVe algorithm are:frogs,toad,litoria,lepto-
dactylidae,rana,lizard, andeleutherodactylus(Pennington
et al., 2014).
Yet another visualization method is to use a clustering
algorithm to show a hierarchical representation of which
words are similar to others in the embedding space. The
figure on the left uses hierarchical clustering of some em-
bedding vectors for nouns as a visualization method (Rohde
et al., 2006).
Probably the most common visualization method, how-
ever, is to project the 100 dimensions of a word down into 2
dimensions. Fig. 5.1 showed one such visualization, as does
Fig. 5.10, using a projection method called t-SNE (van der
Maaten and Hinton, 2008).
5.7 Semantic properties of embeddings
In this section we briefly summarize some of the semantic properties of embeddings
that have been studied.
Different types of similarity or association:One parameter of vector semantic
models is the size of the context window used to collect counts. This is generally
between 1 and 10 words on each side of the target word (for a total context of 2-20
words).
The choice depends on the goals of the representation. Shorter context windows
tend to lead to representations that are a bit more syntactic, since the information is
coming from immediately nearby words. When the vectors are computed from short
context windows, the most similar words to a target wordwtend to be semantically
similar words with the same parts of speech. When vectors are computed from long
context windows, the highest cosine words to a target wordwtend to be words that
are topically related but not similar.
For example Levy and Goldberg (2014a) showed that using skip-gram with a
window of±2, the most similar words to the wordHogwarts(from theHarry Potter
series) were names of other fictional schools:Sunnydale(fromBuffy the Vampire
Slayer) orEvernight(from a vampire series). With a window of±5, the most similar
words toHogwartswere other words topically related to theHarry Potterseries:
Dumbledore,Malfoy, andhalf-blood.
It’s also often useful to distinguish two kinds of similarity or association between
words (Sch ¨utze and Pedersen, 1993). Two words havefirst-order co-occurrencefirst-orderco-occurrence
(sometimes calledsyntagmatic association) if they are typically nearby each other.
Thuswroteis a first-order associate ofbookorpoem. Two words havesecond-order
co-occurrence(sometimes calledparadigmatic association) if they have similarsecond-orderco-occurrence
neighbors. Thuswroteis a second-order associate of words likesaidorremarked.
Analogy/Relational Similarity:Another semantic property of embeddings is their
ability to capture relational meanings. In an important early vector space model of
cognition, Rumelhart and Abrahamson (1973) proposed theparallelogram modelparallelogrammodel
for solving simple analogy problems of the forma is to b as a* is to what?. In such
problems, a system is given a problem likeapple:tree::grape:?, i.e.,apple is to tree
as grape is to , and must fill in the wordvine. In the parallelogram model, il-

---

### Page 152

144CHAPTER5 • EMBEDDINGS
lustrated in Fig. 5.8, the vector from the wordappleto the wordtree(= #   »tree− #       »apple)
is added to the vector forgrape( #        »grape); the nearest word to that point is returned.
tree
apple
grape
vine
Figure 5.8The parallelogram model for analogy problems (Rumelhart and Abrahamson,
1973): the location of #     »vine can be found by subtracting #       »apple from #   »tree and adding #       »grape.
In early work with sparse embeddings, scholars showed that sparse vector mod-
els of meaning could solve such analogy problems (Turney and Littman, 2005),
but the parallelogram method received more modern attention because of its suc-
cess with word2vec or GloVe vectors (Mikolov et al. 2013c, Levy and Goldberg
2014b, Pennington et al. 2014). For example, the result of the expression #     »king−#     »man+ #            »woman is a vector close to #         »queen. Similarly, #      »Paris− #           »France+ #     »Italy results
in a vector that is close to #         »Rome. The embedding model thus seems to be extract-
ing representations of relations likeMALE-FEMALE, orCAPITAL-CITY-OF, or even
COMPARATIVE/SUPERLATIVE, as shown in Fig. 5.9 from GloVe.
(a) (b)
Figure 5.9Relational properties of the GloVe vector space, shown by projecting vectors onto two dimensions.
(a) #     »king− #     »man+ #            »woman is close to #        »queen. (b) offsets seem to capture comparative and superlative morphology
(Pennington et al., 2014).
For ana:b::a ∗ :b ∗ problem, meaning the algorithm is given vectorsa,b, and
a∗ and must findb ∗, the parallelogram method is thus:
ˆb∗ =argmin
x
distance(x,b−a+a ∗)(5.28)
with some distance function, such as Euclidean distance.
There are some caveats. For example, the closest value returned by the paral-
lelogram algorithm in word2vec or GloVe embedding spaces is usually not in fact

---

### Page 153

5.8 • BIAS ANDEMBEDDINGS145
b* but one of the 3 input words or their morphological variants (i.e.,cherry:red ::
potato:xreturnspotatoorpotatoesinstead ofbrown), so these must be explicitly
excluded. Furthermore while embedding spaces perform well if the task involves
frequent words, small distances, and certain relations (like relating countries with
their capitals or verbs/nouns with their inflected forms), the parallelogram method
with embeddings doesn’t work as well for other relations (Linzen 2016, Gladkova
et al. 2016, Schluter 2018, Ethayarajh et al. 2019a), and indeed Peterson et al. (2020)
argue that the parallelogram method is in general too simple to model the human
cognitive process of forming analogies of this kind.
5.7.1 Embeddings and Historical Semantics
Embeddings can also be a useful tool for studying how meaning changes over time,
by computing multiple embedding spaces, each from texts written in a particular
time period. For example Fig. 5.10 shows a visualization of changes in meaning in
English words over the last two centuries, computed by building separate embed-
ding spaces for each decade from historical corpora like Google n-grams (Lin et al.,
2012b) and the Corpus of Historical American English (Davies, 2012).
CHAPTER 5. DYNAMIC SOCIAL REPRESENTATIONS OF WORD MEANING 79
Figure 5.1: Two-dimensional visualization of semantic change in English using SGNS
vectors (see Section 5.8 for the visualization algorithm). A,T h ew o r dgay shifted
from meaning “cheerful” or “frolicsome” to referring to homosexuality. A,I nt h ee a r l y
20th century broadcast referred to “casting out seeds”; with the rise of television and
radio its meaning shifted to “transmitting signals”. C, Awful underwent a process of
pejoration, as it shifted from meaning “full of awe” to meaning “terrible or appalling”
[212].
that adverbials (e.g., actually )h a v eag e n e r a lt e n d e n c yt ou n d e r g os u b j e c t i ﬁ c a t i o n
where they shift from objective statements about the world (e.g., “Sorry, the car is
actually broken”) to subjective statements (e.g., “I can’t believe he actually did that”,
indicating surprise/disbelief).
5.2.2 Computational linguistic studies
There are also a number of recent works analyzing semantic change using computational
methods. [ 200] use latent semantic analysis to analyze how word meanings broaden
and narrow over time. [ 113]u s er a wc o - o c c u r r e n c ev e c t o r st op e r f o r man u m b e ro f
historical case-studies on semantic change, and [ 252] perform a similar set of small-
scale case-studies using temporal topic models. [ 87]c o n s t r u c tp o i n t - w i s em u t u a l
information-based embeddings and found that semantic changes uncovered by their
method had reasonable agreement with human judgments. [ 129]a n d[ 119]u s e“ n e u r a l ”
word-embedding methods to detect linguistic change points. Finally, [ 257]a n a l y z e
historical co-occurrences to test whether synonyms tend to change in similar ways.
Figure 5.10A t-SNE visualization of the semantic change of 3 words in English using
word2vec vectors. The modern sense of each word, and the grey context words, are com-
puted from the most recent (modern) time-point embedding space. Earlier points are com-
puted from earlier historical embedding spaces. The visualizations show the changes in the
wordgayfrom meanings related to “cheerful” or “frolicsome” to referring to homosexuality,
the development of the modern “transmission” sense ofbroadcastfrom its original sense of
sowing seeds, and the pejoration of the wordawfulas it shifted from meaning “full of awe”
to meaning “terrible or appalling” (Hamilton et al., 2016b).
5.8 Bias and Embeddings
In addition to their ability to learn word meaning from text, embeddings, alas,
also reproduce the implicit biases and stereotypes that were latent in the text. As
the prior section just showed, embeddings can roughly model relational similar-
ity: ‘queen’ as the closest word to ‘king’ - ‘man’ + ‘woman’ implies the analogy
man:woman::king:queen. But these same embedding analogies also exhibit gender
stereotypes. For example Bolukbasi et al. (2016) find that the closest occupation
to ‘computer programmer’ - ‘man’ + ‘woman’ in word2vec embeddings trained on
news text is ‘homemaker’, and that the embeddings similarly suggest the analogy
‘father’ is to ‘doctor’ as ‘mother’ is to ‘nurse’. This could result in what Crawford
(2017) and Blodgett et al. (2020) call anallocational harm, when a system allo-allocationalharm

---

### Page 154

146CHAPTER5 • EMBEDDINGS
cates resources (jobs or credit) unfairly to different groups. For example algorithms
that use embeddings as part of a search for hiring potential programmers or doctors
might thus incorrectly downweight documents with women’s names.
It turns out that embeddings don’t just reflect the statistics of their input, but also
amplifybias; gendered terms becomemoregendered in embedding space than theybiasamplification
were in the input text statistics (Zhao et al. 2017, Ethayarajh et al. 2019b, Jia et al.
2020), and biases are more exaggerated than in actual labor employment statistics
(Garg et al., 2018).
Embeddings also encode the implicit associations that are a property of human
reasoning. The Implicit Association Test (Greenwald et al., 1998) measures peo-
ple’s associations between concepts (like ‘flowers’ or ‘insects’) and attributes (like
‘pleasantness’ and ‘unpleasantness’) by measuring differences in the latency with
which they label words in the various categories. 3 Using such methods, people
in the United States have been shown to associate African American names with
unpleasant words (more than European-American names), male names more with
mathematics and female names with the arts, and old people’s names with unpleas-
ant words (Greenwald et al. 1998, Nosek et al. 2002a, Nosek et al. 2002b). Caliskan
et al. (2017) replicated all these findings of implicit associations using GloVe vec-
tors and cosine similarity instead of human latencies. For example African American
names like ‘Leroy’ and ‘Shaniqua’ had a higher GloVe cosine with unpleasant words
while European-American names (‘Brad’, ‘Greg’, ‘Courtney’) had a higher cosine
with pleasant words. These problems with embeddings are an example of arepre-
sentational harm(Crawford 2017, Blodgett et al. 2020), which is a harm caused byrepresentationalharm
a system demeaning or even ignoring some social groups. Any embedding-aware al-
gorithm that made use of word sentiment could thus exacerbate bias against African
Americans.
Recent research focuses on ways to try to remove these kinds of biases, for
example by developing a transformation of the embedding space that removes gen-
der stereotypes but preserves definitional gender (Bolukbasi et al. 2016, Zhao et al.
2017) or changing the training procedure (Zhao et al., 2018b). However, although
these sorts ofdebiasingmay reduce bias in embeddings, they do not eliminate itdebiasing
(Gonen and Goldberg, 2019), and this remains an open problem.
Historical embeddings are also being used to measure biases in the past. Garg
et al. (2018) used embeddings from historical texts to measure the association be-
tween embeddings for occupations and embeddings for names of various ethnici-
ties or genders (for example the relative cosine similarity of women’s names versus
men’s to occupation words like ‘librarian’ or ‘carpenter’) across the 20th century.
They found that the cosines correlate with the empirical historical percentages of
women or ethnic groups in those occupations. Historical embeddings also repli-
cated old surveys of ethnic stereotypes; the tendency of experimental participants in
1933 to associate adjectives like ‘industrious’ or ‘superstitious’ with, e.g., Chinese
ethnicity, correlates with the cosine between Chinese last names and those adjectives
using embeddings trained on 1930s text. They also were able to document historical
gender biases, such as the fact that embeddings for adjectives related to competence
(‘smart’, ‘wise’, ‘thoughtful’, ‘resourceful’) had a higher cosine with male than fe-
male words, and showed that this bias has been slowly decreasing since 1960. We
3 Roughly speaking, if humans associate ‘flowers’ with ‘pleasantness’ and ‘insects’ with ‘unpleasant-
ness’, when they are instructed to push a green button for ‘flowers’ (daisy, iris, lilac) and ‘pleasant words’
(love, laughter, pleasure) and a red button for ‘insects’ (flea, spider, mosquito) and ‘unpleasant words’
(abuse, hatred, ugly) they are faster than in an incongruous condition where they push a red button for
‘flowers’ and ‘unpleasant words’ and a green button for ‘insects’ and ‘pleasant words’.

---

### Page 155

5.9 • EVALUATINGVECTORMODELS147
return in later chapters to this question about the role of bias in natural language
processing.
5.9 Evaluating Vector Models
The most important evaluation metric for vector models is extrinsic evaluation on
tasks, i.e., using vectors in an NLP task and seeing whether this improves perfor-
mance over some other model.
Nonetheless it is useful to have intrinsic evaluations. The most common metric
is to test their performance onsimilarity, computing the correlation between an
algorithm’s word similarity scores and word similarity ratings assigned by humans.
WordSim-353(Finkelstein et al., 2002) is a commonly used set of ratings from 0
to 10 for 353 noun pairs; for example (plane,car) had an average score of 5.77.
SimLex-999(Hill et al., 2015) is a more complex dataset that quantifies similarity
(cup, mug) rather than relatedness (cup, coffee), and includes concrete and abstract
adjective, noun and verb pairs. TheTOEFL datasetis a set of 80 questions, each
consisting of a target word with 4 additional word choices; the task is to choose
which is the correct synonym, as in the example:Levied is closest in meaning to:
imposed, believed, requested, correlated(Landauer and Dumais, 1997). All of these
datasets present words without context.
Slightly more realistic are intrinsic similarity tasks that include context. The
Stanford Contextual Word Similarity (SCWS) dataset (Huang et al., 2012) and the
Word-in-Context (WiC) dataset (Pilehvar and Camacho-Collados, 2019) offer richer
evaluation scenarios. SCWS gives human judgments on 2,003 pairs of words in their
sentential context, while WiC gives target words in two sentential contexts that are
either in the same or different senses; see Appendix I. Thesemantic textual similarity
task (Agirre et al. 2012, Agirre et al. 2015) evaluates the performance of sentence-
level similarity algorithms, consisting of a set of pairs of sentences, each pair with
human-labeled similarity scores.
Another task used for evaluation is the analogy task, discussed on page 143,
where the system has to solve problems of the forma is to b as a* is to b*, givena, b,
anda*and having to findb*(Turney and Littman, 2005). A number of sets of tuples
have been created for this task (Mikolov et al. 2013a, Mikolov et al. 2013c, Gladkova
et al. 2016), covering morphology (city:cities::child:children), lexicographic rela-
tions (leg:table::spout:teapot) and encyclopedia relations (Beijing:China::Dublin:Ireland),
some drawing from the SemEval-2012 Task 2 dataset of 79 different relations (Jur-
gens et al., 2012).
All embedding algorithms suffer from inherent variability. For example because
of randomness in the initialization and the random negative sampling, algorithms
like word2vec may produce different results even from the same dataset, and in-
dividual documents in a collection may strongly impact the resulting embeddings
(Tian et al. 2016, Hellrich and Hahn 2016, Antoniak and Mimno 2018). When em-
beddings are used to study word associations in particular corpora, therefore, it is
best practice to train multiple embeddings with bootstrap sampling over documents
and average the results (Antoniak and Mimno, 2018).

---

### Page 156

148CHAPTER5 • EMBEDDINGS
5.10 Summary
• In vector semantics, a word is modeled as a vector—a point in high-dimensional
space, also called anembedding. In this chapter we focus onstatic embed-
dings, where each word is mapped to a fixed embedding.
• Vector semantic models fall into two classes:sparseanddense. In sparse
models each dimension corresponds to a word in the vocabularyVand cells
are functions ofco-occurrence counts. Theword-contextorterm-termma-
trix has a row for each (target) word in the vocabulary and a column for each
context term in the vocabulary.
• Dense vector models typically have dimensionality 50–1000.Word2vecal-
gorithms likeskip-gramare a popular way to compute dense embeddings.
Skip-gram trains a logistic regression classifier to compute the probability that
two words are ‘likely to occur nearby in text’. This probability is computed
from the dot product between the embeddings for the two words.
• Skip-gram uses stochastic gradient descent to train the classifier, by learning
embeddings that have a high dot product with embeddings of words that occur
nearby and a low dot product with noise words.
• Other important embedding algorithms includeGloVe, a method based on
ratios of word co-occurrence probabilities.
• Whether using sparse or dense vectors, word and document similarities are
computed by some function of thedot productbetween vectors. The co-
sine of two vectors—a normalized dot product—is the most popular of such
metrics.
Historical Notes
The idea of vector semantics arose out of research in the 1950s in three distinct
fields: linguistics, psychology, and computer science, each of which contributed a
fundamental aspect of the model.
The idea that meaning is related to the distribution of words in context was
widespread in linguistic theory of the 1950s, among distributionalists like Zellig
Harris, Martin Joos, and J. R. Firth, and semioticians like Thomas Sebeok. As Joos
(1950) put it,
the linguist’s “meaning” of a morpheme. . . is by definition the set of conditional
probabilities of its occurrence in context with all other morphemes.
The idea that the meaning of a word might be modeled as a point in a multi-
dimensional semantic space came from psychologists like Charles E. Osgood, who
had been studying how people responded to the meaning of words by assigning val-
ues along scales likehappy/sadorhard/soft. Osgood et al. (1957) proposed that the
meaning of a word in general could be modeled as a point in a multidimensional
Euclidean space, and that the similarity of meaning between two words could be
modeled as the distance between these points in the space.
A final intellectual source in the 1950s and early 1960s was the field then called
mechanical indexing, now known asinformation retrieval. In what became knownmechanicalindexing
as thevector space modelfor information retrieval (Salton 1971, Sparck Jones

---

### Page 157

HISTORICALNOTES149
1986), researchers demonstrated new ways to define the meaning of words in terms
of vectors (Switzer, 1965), and refined methods for word similarity based on mea-
sures of statistical association between words like mutual information (Giuliano,
1965) and idf (Sparck Jones, 1972), and showed that the meaning of documents
could be represented in the same vector spaces used for words. Around the same
time, Cordier (1965) showed that factor analysis of word association probabilities
could be used to form dense vector representations of words.
Some of the philosophical underpinning of the distributional way of thinking
came from the late writings of the philosopher Wittgenstein, who was skeptical of
the possibility of building a completely formal theory of meaning definitions for
each word. Wittgenstein suggested instead that “the meaning of a word is its use in
the language” (Wittgenstein, 1953, PI 43). That is, instead of using some logical lan-
guage to define each word, or drawing on denotations or truth values, Wittgenstein’s
idea is that we should define a word by how it is used by people in speaking and un-
derstanding in their day-to-day interactions, thus prefiguring the movement toward
embodied and experiential models in linguistics and NLP (Glenberg and Robertson
2000, Lake and Murphy 2021, Bisk et al. 2020, Bender and Koller 2020).
More distantly related is the idea of defining words by a vector of discrete fea-
tures, which has roots at least as far back as Descartes and Leibniz (Wierzbicka 1992,
Wierzbicka 1996). By the middle of the 20th century, beginning with the work of
Hjelmslev (Hjelmslev, 1969) (originally 1943) and fleshed out in early models of
generative grammar (Katz and Fodor, 1963), the idea arose of representing mean-
ing withsemantic features, symbols that represent some sort of primitive meaning.semanticfeature
For example words likehen,rooster, orchick, have something in common (they all
describe chickens) and something different (their age and sex), representable as:
hen+female, +chicken, +adult
rooster-female, +chicken, +adult
chick+chicken, -adult
The dimensions used by vector models of meaning to define words, however, are
only abstractly related to this idea of a small fixed number of hand-built dimensions.
Nonetheless, there has been some attempt to show that certain dimensions of em-
bedding models do contribute some specific compositional aspect of meaning like
these early semantic features.
The use of dense vectors to model word meaning, and indeed the termembed-
ding, grew out of thelatent semantic indexing(LSI) model (Deerwester et al.,
1988) recast asLSA(latent semantic analysis) (Deerwester et al., 1990). In LSA
singular value decomposition—SVD— is applied to a term-document matrix (eachSVD
cell weighted by log frequency and normalized by entropy), and then the first 300
dimensions are used as the LSA embedding. Singular Value Decomposition (SVD)
is a method for finding the most important dimensions of a dataset, those dimen-
sions along which the data varies the most. LSA was then quickly widely applied:
as a cognitive model (Landauer and Dumais, 1997), and for tasks like spell checking
(Jones and Martin, 1997), language modeling (Bellegarda 1997, Coccaro and Ju-
rafsky 1998, Bellegarda 2000), morphology induction (Schone and Jurafsky 2000,
Schone and Jurafsky 2001b), multiword expressions (MWEs) (Schone and Juraf-
sky, 2001a), and essay grading (Rehder et al., 1998). Related models were simul-
taneously developed and applied to word sense disambiguation by Sch¨utze (1992b).
LSA also led to the earliest use of embeddings to represent words in a probabilis-
tic classifier, in the logistic regression document router of Sch ¨utze et al. (1995).
The idea of SVD on the term-term matrix (rather than the term-document matrix)