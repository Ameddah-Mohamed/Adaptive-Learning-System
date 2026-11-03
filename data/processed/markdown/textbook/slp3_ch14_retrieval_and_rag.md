# SLP3 Chapter 14: Retrieval-based Models and Question Answering (RAG)

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 259–281

---

### Page 259

10.6 • IN-CONTEXTLEARNING ANDINDUCTIONHEADS251
Figure 1: In the sequence “...vintage cars ... vintage”, an induction head identiﬁes the initial occurrence of “vintage”,
attends to the subsequent word “cars” for preﬁx matching, and predicts “cars” as the next word through the copying
mechanism.
determines each head’s independent output for the
current token.
Leveraging this decomposition, Elhage et al.
(2021) discovered a distinct behaviour in certain
attention heads, which they named induction heads.
This behaviour emerges when these heads process
sequences of the form "[A] [B] ... [A] → ". In
these heads, the QK circuit directs attention to-
wards [B], which appears directly after the previous
occurrence of the current token [A]. This behaviour
is termed preﬁx matching. The OV circuit subse-
quently increases the output logit of the [B] token,
termed copying. An overview of this mechanism is
shown in Figure 1.
4 Methods
4.1 Models
We utilise two recently developed open-source
models, namely Llama-3-8B 2 and InternLM2-20B
(Cai et al. , 2024), both of which are based on the
original Llama ( Touvron et al. , 2023a) architec-
ture. These models feature grouped-query atten-
tion mechanisms (Ainslie et al., 2023) to enhance
efﬁciency. Llama-3-8B, comprises 32 layers, each
with 32 attention heads and it uses a query group
size of 4 attention heads. It has shown superior
performance compared to its predecessors, even
the larger Llama-2 models.
InternLM2-20B, featuring 48 layers with 48 at-
tention heads each, uses a query group size of 6
attention heads. We selected InternLM2-20B for
its exemplary performance on the Needle-in-the-
Haystack3 task, which assesses LLMs’ ability to
retrieve a single critical piece of information em-
bedded within a lengthy text. This mirrors the
functionality of induction heads, which scan the
context for prior occurrences of a token to extract
relevant subsequent information.
2https://ai.meta.com/blog/meta-llama-3/
3https://github.com/gkamradt/LLMTest_
NeedleInAHaystack
4.2 Identifying Induction Heads
To identify induction heads within models, we mea-
sure the ability of all attention heads to perform
preﬁx matching on random input sequences. 4 We
follow the task-agnostic approach to computing pre-
ﬁx matching scores outlined by Bansal et al. (2023).
We argue that focusing solely on preﬁx matching
scores is sufﬁcient for our analysis, as high pre-
ﬁx matching cores speciﬁcally indicate induction
heads, while less relevant heads tend to show high
copying capabilities (Bansal et al. , 2023). We gen-
erate a sequence of 50 random tokens, excluding
the 4% most common and least common tokens.
This sequence is repeated four times to form the
input to the model. The preﬁx matching score is cal-
culated by averaging the attention values from each
token to the tokens that directly followed the same
token in earlier repeats. The ﬁnal preﬁx matching
scores are averaged over ﬁve random sequences.
The preﬁx matching scores for Llama-3-8B are
shown in Figure 2. For IntermLM2-20B, we refer
to Figure 8 in Appendix A.1. Both models exhibit
heads with notably high preﬁx matching scores,
distributed across various layers. In the Llama-3-
8B model, ~3% of the heads have a preﬁx matching
score of 0.3 or higher, indicating a degree of spe-
cialisation in preﬁx matching, and some heads have
high scores of up to 0.98.
4.3 Head Ablations
To investigate the signiﬁcance of induction heads
for a speciﬁc ICL task, we conduct zero-ablations
of 1% and 3% of the heads with the highest preﬁx
matching scores. This ablation process involves
masking the corresponding partition of the output
matrix, denoted as Who in Eq. 1, by setting it to
zero. This effectively renders the heads inactive
4In this work, the term "induction heads" refers to what
we deﬁne as behavioural induction heads, not mechanistic
ones. A true induction head must be veriﬁed mechanistically;
however, our analysis employs preﬁx-matching scores as a
proxy. We will continue to use the term "induction heads" for
simplicity throughout the rest of the paper.
4
Figure 10.7An induction head looking atvintageuses theprefix matchingmechanism to
find a prior instance ofvintage, and thecopyingmechanism to predict thatcarswill occur
again. Figure from Crosbie and Shutova (2022).
bie and Shutova (2022), who show thatablatinginduction heads causes in-contextablating
learning performance to decrease.Ablationis originally a medical term meaning
the removal of something. We use it in NLP interpretability studies as a tool for
testing causal effects; if we knock out a hypothesized cause, we would expect the
effect to disappear. Crosbie and Shutova (2022) ablate induction heads by first find-
ing attention heads that perform as induction heads on random input sequences, and
then zeroing out the output of these heads by setting certain terms of the output ma-
trixW O to zero. Indeed they find that ablated models are much worse at in-context
learning: they have much worse performance at learning from demonstrations in the
prompts.

---

### Page 260

252CHAPTER11 • RETRIEVAL-BASEDMODELS
CHAPTER
11
Information Retrieval and
Retrieval-Augmented Generation
On two occasions I have been asked,—“Pray, Mr. Babbage, if you put into
the machine wrong figures, will the right answers come out?” ... I am not able
rightly to apprehend the kind of confusion of ideas that could provoke such a
question. Babbage (1864)
People need to know things. So pretty much as soon as there were computers
we were asking them questions. By 1961 there was a system to answer questions
about American baseball statistics like “How many games did the Yankees play
in July?” (Green et al., 1961). Even fictional computers in the 1970s like Deep
Thought, invented by Douglas Adams inThe Hitchhiker’s Guide to the Galaxy,
answered “the Ultimate Question Of Life, The Universe, and Everything”. 1 And
because so much knowledge is encoded in text, systems were answering questions
at human-level performance even before LLMs: IBM’s Watson system won the TV
game-showJeopardy!in 2011, surpassing humans at answering questions like:
WILLIAM WILKINSON’S “AN ACCOUNT OF THE
PRINCIPALITIES OF WALLACHIA AND MOLDOVIA”
INSPIRED THIS AUTHOR’S MOST FAMOUS NOVEL
2
It follows naturally, then, that an important function of large language models is
to fillhuman information needs. And since a lot of information is online, finding
the information that fills our needs is closely related to web information retrieval,
the task performed by search engines. Indeed, the distinction is becoming ever more
fuzzy, as modern search engines are integrated with large language models.
Consider some simple information needs, for examplefactoid questionsthatfactoidquestions
can be met with facts expressed in short texts like the following:
(11.1) Where is the Louvre Museum located?
(11.2) Where does the energy in a nuclear explosion come from?
(11.3) How to get a script l in latex?
To get an LLM to answer these questions, we can just prompt it! For example a
pretrained LLM that has been instruction-tuned on answering questions (instruction-
tuning is in Chapter 8) could directly answer the following question
Where is the Louvre Museum located?
by performing conditional generation given this prefix, and take the response as the
answer. This works because large language models have processed a lot of facts in
their pretraining data, including the location of the Louvre, and have encoded this
information in their parameters. Factual knowledge of this type seems to be stored
in the connections in the very large feedforward layers of transformer models (Geva
et al., 2021; Meng et al., 2022).
1 The answer was 42, but unfortunately the question was never revealed.
2 The answer, of course, is ‘Who is Bram Stoker’, and the novel wasDracula.

---

### Page 261

253
Simply prompting an LLM is useful for many generation tasks, including those
involving facts. But the fact that knowledge is stored in the feedforward weights of
the LLM leads to a number of problems with prompting as a method for correctly
generating factual texts or answers.
The first and main problem is that LLMs are often incorrect when generating
answers or other texts about facts! Large language modelshallucinate. A hallu-hallucinate
cination is a response that is not faithful to the facts of the world. That is, when
asked questions, large language models sometimes make up answers that sound rea-
sonable. For example, Dahl et al. (2024) found that when asked questions about the
legal domain (like about particular legal cases), large language models hallucinated
from 69% to 88% of the time! LLMs sometimes give incorrect factual responses
even when the correct facts are stored in the parameters; this seems to be caused
by the feedforward layers failing to recall the knowledge stored in their parameters
(Jiang et al., 2024).
And it’s not always possible to tell when language models are hallucinating,
partly because LLMs aren’t well-calibrated. In acalibratedsystem, the confidencecalibrated
of a system in the correctness of its answer is highly correlated with the probability
of an answer being correct. So if a calibrated system is wrong, at least it might hedge
its answer or tell us to go check another source. But since language models are not
well-calibrated, they often give a very wrong answer with complete certainty (Zhou
et al., 2024a).
A second problem with meeting user information needs with simple prompting
methods is that prompting a large language model to answer from its pretrained pa-
rameters doesn’t allow us to ask questions about proprietary data. We would like to
use language models to help with user information needs about proprietary data like
personal email. Or for the healthcare application we might want to apply a language
model to medical records. Or a company may have internal documents that contain
answers for customer service or internal use. Or legal firms need to ask questions
about legal discovery from proprietary documents. None of this data (hopefully)
was in the large web-based corpora that large language models are pretrained on.
A final issue with using large language models to answer knowledge questions is
that they are static; they were pretrained once, at a particular time. This means that
LLMs cannot talk about about rapidly changing information (like something that
happened last week) since they won’t have up-to-date information from after their
release data.
One solution to all these problems with simple prompting for generating fac-
tual text is to give a language model external sources of knowledge, for example
proprietary texts like medical or legal records, personal emails, or corporate docu-
ments, and to use those documents in answering questions. This method is called
retrieval-augmented generationorRAG, and that is the method we will focus onRAG
in this chapter. In RAG we useinformation retrieval(IR) techniques to retrieveinformationretrieval
documents that are likely to have information that might help answer the question.
Then we use a large language model togeneratean answer given these documents.
Basing our answers on retrieved documents can solve some of the problems with
using simple prompting to answer questions. First, it helps ensure that the answer is
grounded in facts from some curated dataset. And the system can give the user the
answer accompanied by the context of the passage or document it came from. This
information can help users have confidence in the accuracy of the answer (or help
them spot when it is wrong!). And these retrieval techniques can be used on any
proprietary data we want, such as legal or medical data for those applications.

---

### Page 262

254CHAPTER11 • RETRIEVAL-BASEDMODELS
We’ll begin by introducing information retrieval, the task of choosing the most
relevant document from a document set given a user’s query expressing their infor-
mation need. We’ll see the classic method based on cosines of sparse tf-idf vec-
tors, modern neural ‘dense’ retrievers based on instead representing queries and
documents neurally with BERT or other language models. We then introduce the
retrieval-augmented generation paradigm.
Finally, we’ll discuss various datasets with questions and answers that can be
used for fine-tuning LLMs in instruction tuning and for use as benchmarks for eval-
uation.
11.1 Information Retrieval
Information retrievalorIRis the name of the field encompassing the retrieval ofinformationretrieval
IR all manner of media based on user information needs. The resulting IR system is
often called asearch engine. Our goal in this section is to give a sufficient overview
of IR to see its application to large language models meeting user information needs.
Readers with more interest specifically in information retrieval should see the His-
torical Notes section at the end of the chapter.
The IR task we consider is calledad hoc retrieval, in which a user poses aad hoc retrieval
queryto a retrieval system, which then returns an ordered set ofdocumentsfrom
somecollection. Adocumentrefers to whatever unit of text the system indexesdocument
and retrieves (web pages, scientific papers, news articles, or even shorter passages
like paragraphs). Acollectionrefers to a set of documents being used to satisfycollection
user requests. A collection can mean the entire web, in which case we are doing
web search. But a collection can also be a smaller corporate repo, or even a set ofweb search
documents used by one person.termrefers to a word in a collection, but it may alsoterm
include phrases. Finally, aqueryrepresents a user’s information need expressed asquery
a set of terms.
Document
Document
Document
Document
DocumentDocument
Query
Processing
Document
Processing
& Indexing
Search
Maximize:
Document
Relevance
Score
Document
Document
Document
Document
DocumentRanked
Documents
Document
query
Document
Index
Query
Vector
document collection
Figure 11.1The architecture of an ad hoc IR system. Document ranking is based on computing a score for
each candidate document given the query, expressing howrelevantit is likely to be to meet the users information
need. There are two classes of IR systems, based on the two classes of vectors that are used to represent queries
and documents: sparse vectors and dense vectors. These two kinds of retrieval differ in the details of the
indexing and scoring mechanisms.
The high-level architecture of an ad hoc retrieval engine is shown in Fig. 11.1.
This figure abstracts over the two classes of IR systems, which are based on the
two classes of vectors that are used to represent queries and documents: sparse
vectors and dense vectors. In sparse retrieval, we represent documents and queries
withcount vectors, weighted by tf-idf or BM25. In dense retrieval, we represent

---

### Page 263

11.1 • INFORMATIONRETRIEVAL255
documents and queries withembeddings, computed from language models (either
encoder or decoder models). We’ll discuss sparse retrieval in the rest of this section,
and turn to dense retrieval in Section 11.3.
11.1.1 Representing documents as vectors
In thevector space modelof information retrieval (Salton, 1971) a document isvector spacemodel
represented as a vector of counts of the words it contains.
We sometimes call this kind of model abag-of-wordsmodel. Fig. 11.2 shows
the intuition: we are representing a text document as if it were abag of words,bag of words
that is, an unordered set of words with their position ignored, keeping only their
frequency in the document. In the example in the figure, instead of representing the
word order in all the phrases like “It manages to be whimsical and romantic”, we
simply note that the worditoccurred 5 times in the entire excerpt, the wordslove,
recommend, andmovieonce, and so on.
it
it
it
it
it
it
I
I
I
I
I
love
recommend
movie
the
the
the
the
to
to
to
and
andand
seen
seen
yet
would
with
who
whimsical
whilewhenever
times
sweet
several
scenes
satirical
romantic
of
manages
humor
have
happy
fun
friend
fairy
dialogue
but
conventions
areanyone
adventure
always
again
about
I love this movie! It's sweet,
but with satirical humor. The
dialogue is great and the
adventure scenes are fun...
It manages to be whimsical
and romantic while laughing
at the conventions of the
fairy tale genre. I would
recommend it to just about
anyone. I've seen it several
times, and I'm always happy
to see it again whenever I
have a friend who hasn't
seen it yet!
adventure
and
fairy
genre
great
have
humor
I
it
satirical
seen
sweet
the
times
to
whimsical
would
yet
…
1
3
1
1
1
1
1
5
6
1
2
1
4
1
3
1
1
1
…
Figure 11.2Intuition of the classic vector space model applied to a single document. The position of the
words is ignored (thebag-of-wordsassumption) and we make use of the frequency of each word.
We could thus imagine representing the document in Fig. 11.2 as the vector [1 3
1 1 1 1 1 5 6 1 2 1 4 1 3 1 1 1] (if we limited ourselves to these 18 dimensions and
ignored all the other words in English).
More generally, we can represent a set of documents as aterm-document ma-
trixin which each row represents a word in the vocabulary and each column rep-term-documentmatrix
resents a document from some collection of documents. Fig. 11.3 shows a small
selection from a term-document matrix showing the occurrence of four words in
four plays by Shakespeare. Each cell in this matrix represents the number of times a
particular word (defined by the row) occurs in a particular document (defined by the
column). Thusfoolappeared 58 times inTwelfth Night.
A document is represented as a count vector, a column in Fig. 11.4. In the
example in Fig. 11.4, we’ve chosen to make the document vectors of dimension 4,
just so they fit on the page; in real term-document matrices, the document vectors
would have dimensionality|V|, the vocabulary size. The first dimension for both
these vectors corresponds to the number of times the wordbattleoccurs, and we can

---

### Page 264

256CHAPTER11 • RETRIEVAL-BASEDMODELS
As You Like It Twelfth Night Julius Caesar Henry V
battle1 0 7 13
good114 80 62 89
fool36 58 1 4
wit20 15 2 3
Figure 11.3The term-document matrix for four words in four Shakespeare plays. Each
cell contains the number of times the (row) word occurs in the (column) document.
compare each dimension, noting for example that the vectors forAs You Like Itand
Twelfth Nighthave similar values (1 and 0, respectively) for the first dimension.
As You Like It Twelfth Night Julius Caesar Henry V
battle1 0 7 13
good114 80 62 89
fool36 58 1 4
wit20 15 2 3
Figure 11.4The term-document matrix for four words in four Shakespeare plays. The red
boxes show that each document is represented as a column vector of length four.
Since 4-dimensional spaces are hard to visualize, Fig. 11.5 shows a visualiza-
tion of the four document vectors in two dimensions; we’ve arbitrarily chosen the
dimensions corresponding to the wordsbattleandfool.
5 1015202530
5
10
Henry V [4,13]
As You Like It [36,1]
Julius Caesar [1,7]
battle
fool
Twelfth Night [58,0]
15
40
354045505560
Figure 11.5A spatial visualization of the document vectors for the four Shakespeare play
documents, showing just two of the dimensions, corresponding to the wordsbattleandfool.
The comedies have high values for thefooldimension and low values for thebattledimension.
Two documents that are similar will tend to have similar words, and if two doc-
uments have similar words their column vectors will tend to be similar. The vectors
for the comediesAs You Like It[1,114,36,20] andTwelfth Night[0,80,58,15] look a
lot more like each other (more fools and wit than battles) than they look likeJulius
Caesar[7,62,1,2] orHenry V[13,89,4,3].
11.1.2 Term weighting: tf-idf and BM25
In fact, in IR, we don’t use raw word counts like [1 114 36 20] forAs You Like It,
or [1 3 1 1 1 1 1 5 6 1 2 1 4 1 3 1 1 1] for the document in Fig. 11.2. Instead we
compute aterm weightfor each document word. Two term weighting schemes areterm weight
common:tf-idfand a variant of tf-idf calledBM25.BM25
Tf-idf (the ‘-’ here is a hyphen, not a minus sign) is the product of two terms, the
term frequencytfand the inverse document frequencyidf.

---

### Page 265

11.1 • INFORMATIONRETRIEVAL257
Theterm frequencyterm tells us how frequent the word is; words that occur
more often in a document are likely to be informative about the document’s contents.
We usually use the log 10 of the word frequency, rather than the raw count. The
intuition is that a word appearing 100 times in a document doesn’t make that word
100 times more likely to be relevant to the meaning of the document. We also need
to do something special with counts of 0, since we can’t take the log of 0.3 So if we
define count(t,d) as the raw count of termtin documentd, then tf t,d , the tf of termt
in documentdis
tft,d =
(
1+log 10 count(t,d)if count(t,d)>0
0 otherwise
(11.4)
If we use log weighting, terms which occur 0 times in a document would have tf=0,
1 times in a document tf=1+log 10(1) =1+0=1, 10 times in a document tf=
1+log 10(10) =2, 100 times tf=1+log 10(100) =3, 1000 times tf=4, and so on.
Thedocument frequencydf t of a termtis the number of documents it oc-
curs in. Terms that occur in only a few documents are useful for discriminating
those documents from the rest of the collection; terms that occur across the entire
collection aren’t as helpful. Theinverse document frequencyoridfterm weight
(Sparck Jones, 1972) is defined as:
idft =log 10
N
dft
(11.5)
whereNis the total number of documents in the collection, and df t is the number
of documents in which termtoccurs. The fewer documents in which a term occurs,
the higher this weight; the lowest weight of 0 is assigned to terms that occur in every
document.
Here are some idf values for some words in the corpus of Shakespeare plays,
ranging from extremely informative words that occur in only one play likeRomeo,
to those that occur in a few likesaladorFalstaff, to those that are very common like
foolor so common as to be completely non-discriminative since they occur in all 37
plays likegoodorsweet. 4
Word df idf
Romeo 1 1.57
salad 2 1.27
Falstaff 4 0.967
forest 12 0.489
battle 21 0.246
wit 34 0.037
fool 36 0.012
good 37 0
sweet 37 0
Thetf-idfvalue for wordtin documentdis then the product of term frequency
tft,d and IDF:
tf-idf(t,d) =tft,d ·idf t (11.6)
3 We can also use this alternative formulation, which we have used in earlier editions: tf t,d =
log10(count(t,d) +1)
4 Sweetwas one of Shakespeare’s favorite adjectives, a fact probably related to the increased use of
sugar in European recipes around the turn of the 16th century (Jurafsky, 2014, p. 175).

---

### Page 266

258CHAPTER11 • RETRIEVAL-BASEDMODELS
11.1.3 Document Scoring
Once we have represented each document and query as a weighted vector, we need
to score each document. Our goal is to measure therelevanceof the document to the
user’s information need, as expressed in their query. In the classic tf-idf model we
estimate this relevance of a document by measuring its geometric similarity in vector
space to the query. That is, we make the simplifying assumption that documents that
havesimilar wordsto the query are more relevant to the user.
We use the cosine similarity function introduced in Chapter 5, scoring document
dby the cosine of its vectordwith the query vectorq:
score(q,d) =cos(q,d) = q·d|q||d| (11.7)
Another way to think of the cosine computation is as the dot product of unit vec-
tors; we can first normalize both the query and document vector to unit vectors, by
dividing by their lengths, and then take the dot product:
score(q,d) =cos(q,d) = q|q| · d|d| (11.8)
We can spell out Eq. 11.8, using the tf-idf values and spelling out the dot product
as a sum of products:
score(q,d) =
X
t∈q
tf-idf(t,q)qP
qi∈q tf-idf 2(qi,q) · tf-idf(t,d)qPdi∈d tf-idf 2(di,d) (11.9)
Now let’s use Eq. 11.9 to walk through an example of a tiny query against a
collection of 4 nano documents, computing tf-idf values and seeing the rank of the
documents. We’ll assume all words in the following query and documents are down-
cased and punctuation is removed:
Query: sweet love
Doc 1: Sweet sweet nurse! Love?
Doc 2: Sweet sorrow
Doc 3: How sweet is love?
Doc 4: Nurse!
Fig. 11.6 shows the computation of the tf-idf cosine between the query and Doc-
ument 1, and the query and Document 2. The cosine is the normalized dot product
of tf-idf values, so for the normalization we must need to compute the document
vector lengths|q|,|d 1|, and|d 2|for the query and the first two documents using
Eq. 11.4, Eq. 11.5, Eq. 11.6, and Eq. 11.9 (computations for Documents 3 and 4 are
also needed but are left as an exercise for the reader). The dot product between the
vectors is the sum over dimensions of the product, for each dimension, of the values
of the two tf-idf vectors for that dimension. This product is only non-zero where
both the query and document have non-zero values, so for this example, in which
onlysweetandlovehave non-zero values in the query, the dot product will be the
sum of the products of those elements of each vector.
Document 1 has a higher cosine with the query (0.747) than Document 2 has
with the query (0.0779), and so the tf-idf cosine model would rank Document 1
above Document 2. This ranking is intuitive given the vector space model, since
Document 1 has both terms including two instances ofsweet, while Document 2 is

---

### Page 267

11.1 • INFORMATIONRETRIEVAL259
Query
word cnt tf df idf tf-idf n’lized= tf-idf/|q|
sweet 1 1 3 0.125 0.125 0.383
nurse 0 0 2 0.301 0 0
love 1 1 2 0.301 0.301 0.924
how 0 0 1 0.602 0 0
sorrow 0 0 1 0.602 0 0
is 0 0 1 0.602 0 0
|q|=
√
.1252 +.301 2 =.326
Document 1 Document 2
word cnt tf tf-idf n’lized×q cnt tf tf-idf n’lized×q
sweet 2 1.301 0.163 0.3570.1371 1.000 0.125 0.2030.0779
nurse 1 1.000 0.301 0.661 0 0 0 0 0 0
love 1 1.000 0.301 0.6610.6100 0 0 00
how 0 0 0 0 0 0 0 0 0 0
sorrow 0 0 0 0 0 1 1.000 0.602 0.979 0
is 0 0 0 0 0 0 0 0 0 0
|d1|=
√
.1632 +.301 2 +.301 2 =.456|d 2|= √.1252 +.602 2 =.615
Cosine: P of column:0.747Cosine: P of column:0.0779
Figure 11.6Computation of tf-idf cosine score between the query and nano-documents 1 (0.747) and 2
(0.0779), using Eq. 11.4, Eq. 11.5, Eq. 11.6 and Eq. 11.9.
missing one of the terms. We leave the computation for Documents 3 and 4 as an
exercise for the reader.
In practice, there are many variants and approximations to Eq. 11.9. For exam-
ple, we might choose to simplify processing by removing some terms. To see this,
let’s start by expanding the formula for tf-idf in Eq. 11.9 to explicitly mention the tf
and idf terms from Eq. 11.6:
score(q,d) =
X
t∈q
tft,q ·idf tqP
qi∈q tf-idf 2(qi,q) · tft,d ·idf tqPdi∈d tf-idf 2(di,d) (11.10)
In one common variant of tf-idf cosine, for example, we drop the idf term for the
document. Eliminating the second copy of the idf term (since the identical term is
already computed for the query) turns out to sometimes result in better performance:
score(q,d) =
X
t∈q
tft,q ·idftqP
qi∈q tf-idf 2(qi,q) · tft,d ·idf tqPdi∈d tf-idf 2(di,d) (11.11)
Other variants of tf-idf eliminate various other terms.
A slightly more complex variant in the tf-idf family is theBM25weightingBM25
scheme (sometimes called Okapi BM25 after the Okapi IR system in which it was
introduced (Robertson et al., 1995)). BM25 adds two parameters:k, a knob that
adjusts the balance between term frequency and IDF, andb, which controls the im-
portance of document length normalization. The BM25 score of a documentdgiven

---

### Page 268

260CHAPTER11 • RETRIEVAL-BASEDMODELS
a queryqis:
X
t∈q
IDF
z }| {
log
 N
dft

weighted tf
z }| {
tft,d
k

1−b+b

|d|
|davg|

+tf t,d
(11.12)
where|d avg|is the length of the average document. Whenkis 0, BM25 reverts to
no use of term frequency, just a binary selection of terms in the query (plus idf).
A largekresults in raw term frequency (plus idf).branges from 1 (scaling by
document length) to 0 (no length scaling). Manning et al. (2008) suggest reasonable
values are k = [1.2,2] and b = 0.75. Kamphuis et al. (2020) is a useful summary of
the many minor variants of BM25.
Stop wordsIn the past it was common to remove high-frequency words from both
the query and document before representing them. The list of such high-frequency
words to be removed is called astop list. The intuition is that high-frequency termsstop list
(often function words likethe,a,to) carry little semantic weight and may not help
with retrieval, and can also help shrink the inverted index files we describe below.
The downside of using a stop list is that it makes it difficult to search for phrases
that contain words in the stop list. For example, common stop lists would reduce the
phraseto be or not to beto the phrasenot. In modern IR systems, the use of stop lists
is much less common, partly due to improved efficiency and partly because much
of their function is already handled by IDF weighting, which downweights function
words that occur in every document. Nonetheless, stop word removal is occasionally
useful in various NLP tasks so is worth keeping in mind.
11.1.4 Efficiently finding documents: the Inverted Index
In order to compute scores, we need to efficiently find documents that contain words
in the query. (Any document that contains none of the query terms will have a score
of 0 and can be ignored.) The basic search problem in IR is thus to find all documents
d∈Cthat contain a termq∈Q.
The data structure for this task is theinverted index, which we use for mak-inverted index
ing this search efficient, and also conveniently storing useful information like the
document frequency and the count of each term in each document.
An inverted index, given a query term, gives a list of documents that contain the
term. It consists of two parts, adictionaryand thepostings. The dictionary is a listpostings
of terms (designed to be efficiently accessed), each pointing to apostings listfor the
term. A postings list is the list of document IDs associated with each term, which
can also contain information like the term frequency or even the exact positions of
terms in the document. The dictionary can also store the document frequency for
each term. For example, a simple inverted index for our 4 sample documents above,
with each word containing its document frequency in{}, and a pointer to a postings
list that contains document IDs and term counts in [], might look like the following:
how{1} → 3 [1]
is{1} → 3 [1]
love{2} → 1 [1]→3 [1]
nurse{2} → 1 [1]→4 [1]
sorrow{1} → 2 [1]
sweet{3} → 1 [2]→2 [1]→3 [1]

---

### Page 269

11.2 • EVALUATION OFINFORMATION-RETRIEVALSYSTEMS261
Given a list of terms in query, we can very efficiently get lists of all candidate
documents, together with the information necessary to compute the tf-idf scores we
need.
11.1.5 Summary: Ranked Retrieval
All the pieces we’ve describe are integrated together to create a singleranked re-
trievalsystem. In the initialization phase, the system is given a document collectionrankedretrieval
and creates the inverted index for it.
Then during retrieval, given a user query, the retrieval system uses the inverted
index to find all candidate documents with keywords in the query. For each candidate
document, the system estimates its relevance to the user by assigning it a score
based on computing the tf-idf (or BM25) cosine with the user’s query vector. The
documents are sorted according to relevance scores, from most to least relevant, and
the list (or the firstNdocuments on it) are returned to the user.
11.2 Evaluation of Information-Retrieval Systems
We measure the performance of ranked retrieval systems using the sameprecision
andrecallmetrics we have been using. We make the assumption that each docu-
ment returned by the IR system is eitherrelevantto our purposes ornot relevant.
Precision is the fraction of the returned documents that are relevant, and recall is the
fraction of all relevant documents that are returned. More formally, let’s assume a
system returnsTranked documents in response to an information request, a subset
Rof these are relevant, a disjoint subset,N, are the remaining irrelevant documents,
andUdocuments in the collection as a whole are relevant to this request. Precision
and recall are then defined as:
Precision= |R||T | Recall= |R||U| (11.13)
Unfortunately, these metrics don’t adequately measure the performance of a system
thatranksthe documents it returns. If we are comparing the performance of two
ranked retrieval systems, we need a metric that prefers the one that ranks the relevant
documents higher. We need to adapt precision and recall to capture how well a
system does at putting relevant documents higher in the ranking.
Let’s turn to an example. Assume we have a user query and have retrieved a
set of documents from a collection of 25 documents, 9 of which are relevant to the
query in this collection. The table in Fig. 11.7 shows the 25 ranked documents with
the judgment column indicating if the document was relevant or not.
The next two columns give the rank-specific precision and recall values calcu-
lated as we proceed down through a set of ranked documents for a particular query.
The precisions are the fraction of relevant documents seen at a given rank, and re-
calls the fraction of relevant documents found at the same rank. More formally, at
rankk, we can define precision k and recallk as:
Precisionk = |relevant documents in topk|k
Recallk = |relevant documents in topk|9 (11.14)

---

### Page 270

262CHAPTER11 • RETRIEVAL-BASEDMODELS
Rank Judgment Precision Rank RecallRank
1 R 1.0 .11
2 N .50 .11
3 R .66 .22
4 N .50 .22
5 R .60 .33
6 R .66 .44
7 N .57 .44
8 R .63 .55
9 N .55 .55
10 N .50 .55
11 R .55 .66
12 N .50 .66
13 N .46 .66
14 N .43 .66
15 R .47 .77
16 N .44 .77
17 N .41 .77
18 R .44 .88
19 N .42 .88
20 N .40 .88
21 N .38 .88
22 N .36 .88
23 N .35 .88
24 N .33 .88
25 R .36 1.0
Figure 11.7Rank-specific precision and recall values calculated as we proceed down
through a set of ranked documents (assuming the collection has 9 relevant documents).
0.0 0.2 0.4 0.6 0.8 1.0
Recall
0.0
0.2
0.4
0.6
0.8
1.0Precision
Figure 11.8The precision recall curve for the data in table 11.7.
Note that recall is non-decreasing; when a relevant document is encountered,
recall increases, and when a non-relevant document is found it remains unchanged.
Precision, on the other hand, jumps up and down, increasing when relevant doc-
uments are found, and decreasing otherwise. The most common way to visualize
precision and recall is to plot precision against recall in aprecision-recall curve,precision-recallcurve
like the one shown in Fig. 11.8 for the data in table 11.7.
Fig. 11.8 shows the values for a single query. But we’ll need to combine values

---

### Page 271

11.2 • EVALUATION OFINFORMATION-RETRIEVALSYSTEMS263
for all the queries, and in a way that lets us compare one system to another. One way
of doing this is to plot averaged precision values at 11 fixed levels of recall (0 to 100,
in steps of 10). Since we’re not likely to have datapoints at these exact levels, we
useinterpolated precisionvalues for the 11 recall values from the data points we dointerpolatedprecision
have. We can accomplish this by choosing the maximum precision value achieved
at any level of recall at or above the one we’re calculating. In other words,
IntPrecision(r) =max
i>=r
Precision(i)(11.15)
This interpolation scheme not only lets us average performance over a set of queries,
but also helps smooth over the irregular precision values in the original data. It is
designed to give systems the benefit of the doubt by assigning the maximum preci-
sion value achieved at higher levels of recall from the one being measured. Fig. 11.9
and Fig. 11.10 show the resulting interpolated data points from our example.
Interpolated Precision Recall
1.0 0.0
1.0 .10
.66 .20
.66 .30
.66 .40
.63 .50
.55 .60
.47 .70
.44 .80
.36 .90
.36 1.0
Figure 11.9Interpolated data points from Fig. 11.7.
Given curves such as that in Fig. 11.10 we can compare two systems or ap-
proaches by comparing their curves. Clearly, curves that are higher in precision
across all recall values are preferred. However, these curves can also provide insight
into the overall behavior of a system. Systems that are higher in precision toward
the left may favor precision over recall, while systems that are more geared towards
recall will be higher at higher levels of recall (to the right).
A second way to evaluate ranked retrieval ismean average precision(MAP),mean averageprecision
which provides a single metric that can be used to compare competing systems or
approaches. In this approach, we again descend through the ranked list of items,
but now we note the precisiononlyat those points where a relevant item has been
encountered (for example at ranks 1, 3, 5, 6 but not 2 or 4 in Fig. 11.7). For a single
query, we average these individual precision measurements over the return set (up
to some fixed cutoff). More formally, if we assume thatR r is the set of relevant
documents at or abover, then theaverage precision(AP) for a single query is
AP= 1|Rr| Xd∈Rr Precisionr(d)(11.16)
wherePrecision r(d)is the precision measured at the rank at which documentdwas
found. For an ensemble of queriesQ, we then average over these averages, to get
our final MAP measure:
MAP= 1|Q| Xq∈Q AP(q)(11.17)
The MAP for the single query (hence = AP) in Fig. 11.7 is 0.6.

---

### Page 272

264CHAPTER11 • RETRIEVAL-BASEDMODELS
Interpolated Precision Recall Curve
0
0.1
0.2
0.3
0.4
0.5
0.6
0.7
0.8
0.9
1
0 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9 1
Recall
Precision
Figure 11.10An 11 point interpolated precision-recall curve. Precision at each of the 11
standard recall levels is interpolated for each query from the maximum at any higher level of
recall. The original measured precision recall points are also shown.
11.3 Information Retrieval with Dense Vectors
The classic tf-idf or BM25 algorithms for IR have long been known to have a con-
ceptual flaw: they work only if there is exact overlap of words between the query
and document. In other words, the user posing a query (or asking a question) needs
to guess exactly what words the writer of the answer might have used, an issue called
thevocabulary mismatch problem(Furnas et al., 1987).
The solution to this problem is to use an approach that can handle synonymy:
instead of (sparse) word-count vectors, using (dense) embeddings. This idea was
first proposed for retrieval in the last century under the name of Latent Semantic
Indexing approach (Deerwester et al., 1990), but is implemented in modern times
via encoders like BERT.
The most powerful approach is to present both the query and the document to a
single encoder, allowing the transformer self-attention to see all the tokens of both
the query and the document, and thus building a representation that is sensitive to
the meanings of both query and document. Then a linear layer can be put on top of
the [CLS] token to predict a similarity score for the query/document tuple:
z=BERT(q;[SEP];d)[CLS]
score(q,d) =softmax(U(z))(11.18)
This architecture is shown in Fig. 11.11a. Usually the retrieval step is not done on
an entire document. Instead documents are broken up into smaller passages, such
as non-overlapping fixed-length chunks of say 100 tokens, and the retriever encodes
and retrieves these passages rather than entire documents. The query and document
have to be made to fit in the BERT 512-token window, for example by truncating
the query to 64 tokens and truncating the document if necessary so that it, the query,
[CLS], and [SEP] fit in 512 tokens. The BERT system together with the linear layer
Ucan then be fine-tuned for the relevance task by gathering a tuning dataset of

---

### Page 273

11.3 • INFORMATIONRETRIEVAL WITHDENSEVECTORS265
relevant and non-relevant passages.
Query Document
…
…
…
…
…
…
[sep]
s(q,d)
zCLS
U
Query
zCLS_Q zCLS_D
Document
…
…
…
…
…
…
•
s(q,d)
(a) (b)
Figure 11.11Two ways to do dense retrieval, illustrated by using lines between layers to schematically rep-
resent self-attention: (a) Use a single encoder to jointly encode query and document and fine-tune to produce a
relevance score with a linear layer over the CLS token. This is too compute-expensive to use except in rescoring
(b) Use separate encoders for query and document, and use the dot product between CLS token outputs for the
query and document as the score. This is less compute-expensive, but not as accurate.
The problem with the full BERT architecture in Fig. 11.11a is the expense in
computation and time. With this architecture, every time we get a query, we have to
pass every single document in our entire collection through a BERT encoder jointly
with the new query! This enormous use of resources is impractical for real cases.
At the other end of the computational spectrum is a much more efficient archi-
tecture, thebi-encoder. In this architecture we can encode the documents in the
collection only one time by using two separate encoder models, one to encode the
query and one to encode the document. We encode each document, and store all
the encoded document vectors in advance. When a query comes in, we encode just
this query and then use the dot product between the query vector and the precom-
puted document vectors as the score for each candidate document (Fig. 11.11b). For
example, if we used BERT, we would have two encoders BERT Q and BERTD and
we could represent the query and document as the[CLS]token of the respective
encoders (Karpukhin et al., 2020):
zq =BERT Q(q)[CLS]
zd =BERT D(d)[CLS]
score(q,d) =zq ·z d (11.19)
The bi-encoder is much cheaper than a full query/document encoder, but is also
less accurate, since its relevance decision can’t take full advantage of all the possi-
ble meaning interactions between all the tokens in the query and the tokens in the
document.
There are numerous approaches that lie in between the full encoder and the bi-
encoder. One intermediate alternative is to use cheaper methods (like BM25) as the
first pass relevance ranking for each document, take the top N ranked documents,
and use expensive methods like the full BERT scoring to rerank only the top N
documents rather than the whole set.

---

### Page 274

266CHAPTER11 • RETRIEVAL-BASEDMODELS
Another intermediate approach is theColBERTapproach of Khattab and Za-ColBERT
haria (2020) and Khattab et al. (2021), shown in Fig. 11.12. This method separately
encodes the query and document, but rather than encoding the entire query or doc-
ument into one vector, it separately encodes each of them into contextual represen-
tations for each token. These BERT representations of each document word can be
pre-stored for efficiency. The relevance score between a queryqand a documentdis
a sum of maximum similarity (MaxSim) operators between tokens inqand tokens
ind. Essentially, for each token inq, ColBERT finds the most contextually simi-
lar token ind, and then sums up these similarities. A relevant document will have
tokens that are contextually very similar to the query.
Query Document
…
…
…
…
…
…
s(q,d)
MaxSim MaxSim MaxSim
∑
norm norm norm normnormnorm
Figure 11.12A sketch of the ColBERT algorithm at inference time. The query and doc-
ument are first passed through separate BERT encoders. Similarity between query and doc-
ument is computed by summing a soft alignment between the contextual representations of
tokens in the query and the document. Training is end-to-end. (Various details aren’t de-
picted; for example the query is prepended by a[CLS]and[Q:]tokens, and the document
by[CLS]and[D:]tokens). Figure adapted from Khattab and Zaharia (2020).
More formally, a questionqis tokenized as[q 1, . . . ,qn], prepended with a[CLS]
and a special[Q]token, truncated to N=32 tokens (or padded with[MASK]tokens if
it is shorter), and passed through BERT to get output vectorsq= [q 1, . . . ,qN]. The
passagedwith tokens[d 1, . . . ,dm], is processed similarly, including a[CLS]and
special[D]token. A linear layer is applied on top ofdandqto control the output
dimension, so as to keep the vectors small for storage efficiency, and vectors are
rescaled to unit length, producing the final vector sequencesE q (lengthN) andE d
(lengthm). The ColBERT scoring mechanism is:
score(q,d) =
NX
i=1
m
max
j=1
Eqi ·E d j (11.20)
While the interaction mechanism has no tunable parameters, the ColBERT ar-
chitecture still needs to be trained end-to-end to fine-tune the BERT encoders and
train the linear layers (and the special[Q]and[D]embeddings) from scratch. It is

---

### Page 275

11.4 • RETRIEVAL-AUGMENTEDGENERATION(RAG)267
trained on triples⟨q,d +,d −⟩of queryq, positive documentd + and negative docu-
mentd − to produce a score for each document using Eq. 11.20, optimizing model
parameters using a cross-entropy loss.
All the supervised algorithms (like ColBERT or the full-interaction version of
the BERT algorithm applied for reranking) need training data in the form of queries
together with relevant and irrelevant passages or documents (positive and negative
examples). There are various semi-supervised ways to get labels; some datasets
(like MS MARCO Ranking, Section 11.5) contain gold positive examples. Negative
examples can be sampled randomly from the top-1000 results from some existing
IR system. If datasets don’t have labeled positive examples, iterative methods like
relevance-guided supervisioncan be used (Khattab et al., 2021) which rely on the
fact that many datasets contain short answer strings. In this method, an existing IR
system is used to harvest examples that do contain short answer strings (the top few
are taken as positives) or don’t contain short answer strings (the top few are taken as
negatives), these are used to train a new retriever, and then the process is iterated.
Efficiency is an important issue, since every possible document must be ranked
for its similarity to the query. For sparse word-count vectors, the inverted index
allows this very efficiently. For dense vector algorithms finding the set of dense
document vectors that have the highest dot product with a dense query vector is
an instance of the problem ofnearest neighbor search. Modern systems there-
fore make use of approximate nearest neighbor vector search algorithms likeFaissFaiss
(Johnson et al., 2017).
11.4 Retrieval-Augmented Generation (RAG)
The information retrieval techniques we introduced in the prior section can be inte-
grated into language models via a method calledretrieval-augmented generation
orRAG. In the basic RAG scenario that we will describe in this section, we use IR
techniques to retrieve documents from some specified store of documents that are
likely to have useful information. Then we use a large language model togenerate
an answer conditioned on these documents in addition to the original query.
As we summarized in the introduction to the chapter, there are many goals of
retrieval-augmented generation. RAG can help mitigate hallucination, by giving
the model a set of trusted documents. RAG can also help language models gen-
erate factual text about proprietary data, like personal email, or health records, or
company-internal documents, or other legal documents. RAG can also help with
the problem that knowledge is dynamic and time-sensitive, for example if we know
the user’s information need references data from a time after a language model was
trained.
A RAG system is based on two major components: theretrieverand thegener-
ator, (the latter is sometimes called, for historical reasons, thereader(Chen et al.,
2017a)). Fig. 11.13 sketches out this standard model for answering questions.
In the first stage of theretrieval-augmented generation, orRAGmodel shown
retrieval-
augmented
generation
RAG in Fig. 11.13 weretrieverelevant passages from some prespecified text collection,
for example using the dense retrievers of the previous section. In the secondgen-
eratestage, we take the set of retrieved passages, integrate it with the user prompt,
and pass some version of these to a large language model to generate an answer
conditioned on these two things.
For example imagine the user asks the questionWhat year was the premiere

---

### Page 276

268CHAPTER11 • RETRIEVAL-BASEDMODELS
When was
the premiere of
The Magic Flute?
Relevant
Docs
1791, according
to this page
Retriever
Indexed Docs
LLM
Generator
Corpus of
Documents
User prompt:
Prompt
formulation
Knowledge
Citation
Figure 11.13Retrieval-augmented generation takes as input a user prompt (which may express an informa-
tion need like this question example), and a corpus of documents that may be useful in meeting the information
need. The method has two stages:retrieval, which returns relevant documents from the collection, andgenera-
tion, in which an LLMgeneratestext given the documents as a prompt. Some generations include aknowledge
citationthat can help the user decide whether to trust the generation, or follow up if they are interested.
ofThe Magic Flute?. We pass this question to a dense retriever and return a se-
ries of passages about The Magic Flute.
The idea of retrieval-augmented generation is to condition on the retrieved pas-
sages, jointly with some prompt text, for example like “Based on these texts, answer
this question:”. Thus given a document collectionDand a user queryq, the most
basic RAG algorithm is:
1. Call a retriever to returnR(q) =d 1 · · ·dk, the top-krelevant passages fromD
2. Create a prompt that includesqand the retrieved passages
3. Call an LLM with the prompt
The resulting prompts might look something like:
Schematic of a RAG Prompt
retrieved passage 1
retrieved passage 2
...
retrieved passage k
Based on these texts, answer this question: What year
was the premiere ofThe Magic Flute?
The task for the language model is then to generate text according to this proba-
bility model:
p(x1, . . . ,xn) =
nY
i=1
p(xi|R(q) ; Answer the following question... ;q;x <i)
There are many augmentations of this basic RAG paradigm. One addition is
the use ofagent-based RAG. In the RAG paradigm described so far, a search is
always run and then retrieved passages are combined with the user’s question in a
prompt. But in actual applications, we may not want to run retrieval for every user

---

### Page 277

11.5 • DATASETS269
turn. Or we may want to retrieve from different collections for different user needs
(sometimes the web, other times a private collection). Inagent-based RAG, the
system decides when to call a retrieval agent and for which collection.
Another research area has to do with the relationship between the retriever and
the generator. For example there may be noise in the retrieved passages; some of
them may be irrelevant or wrong, or in an unhelpful order. How can we encourage
the LLM to focus on the good passages? Some RAG architectures add a reranker
that reranks or reorders passages after they are retrieved. Or some complex questions
may require multi-hop architectures, in which a query is used to retrieve documents,
which are then appended to the original query for a second stage of retrieval.
Another class of solutions is to train the LLM for RAG. The basic version of
RAG described above involves no training; we take an off-the-shelf LLM, and give
it the passages and a prompt and hope that it will correctly figure out which pas-
sages are useful or relevant in generating the answer. One learning variant involves
instruction-tuning an LLM, by first creating a dataset of questions annotated with
retrieved passages and correct answers, and then instruction-tuning the LLM to cor-
rectly answer the questions from the passages. An alternative method is to do this via
test-time compute, prompting the LLM to answer the question and simultaneously to
generate reflections on which passages were useful. The process of generating these
reflections may lead the LLM to improve at identifying good passages. The result-
ing reflection text can also be used for in-context learning, for example by using the
text as part of a prompt for further questions.
In addition to training the LLM, we could train the IR engine. After all, the IR
engine itself has not been optimized for the RAG scenario. It might not have been
trained, or if it was, it was likely trained for simple IR or factoid question-answering
tasks, not for the RAG scenario where the retrieved passages are specifically to be
used by another LLM for generating texts. We can address this mismatch for train-
able IR algorithms by doing end-to-end training of the entire architecture on some
set of questions and answers, training the parameters of the IR model as well as the
LLM.
Finally, it is generally useful for LLMs to give the user evidence for any factual
statement. This can be in the form ofknowledge citations, such as URLs of aknowledgecitations
trusted source or citation references to particular literature. For example a question
answering system might generate numbered pointers to URLs as follows:
Q: Which films have Gong Li as a member of their cast?
A: The Story of Qiu Ju [1] , Farewell My Concubine [2] , The Monkey
King 2 [3], Mulan [3], Saturday Fiction [3] ...
The simplest way for generating knowledge citations is to specify it as part of
the prompt. For example Gao et al. (2023) employ a prompt with text like:
‘‘Write an answer for the given question using only the
provided search results (some of which might be irrelevant)
and cite them properly... Always cite for any factual claim".
11.5 Datasets
There are scores of datasets that contain information needs in the form of questions,
annotated with the answer. These can be used both for instruction tuning and for
evaluation of the question answering abilities of language models.

---

### Page 278

270CHAPTER11 • RETRIEVAL-BASEDMODELS
We can distinguish the datasets along many dimensions, summarized nicely in
Rogers et al. (2023). One is the original purpose of the questions in the data, whether
they were naturalinformation-seekingquestions, or whether they were questions
designed forprobing: evaluating or testing systems or humans.
On the natural side there are datasets likeNatural Questions(KwiatkowskiNaturalQuestions
et al., 2019), a set of anonymized English queries to the Google search engine and
their answers. The answers are created by annotators based on Wikipedia infor-
mation, and include a paragraph-length long answer and a short span answer. For
example the question “When are hops added to the brewing process?” has the short
answerthe boiling processand a long answer which is an entire paragraph from the
Wikipedia page onBrewing.
A similar natural question set is theMS MARCO(Microsoft Machine ReadingMS MARCO
Comprehension) collection of datasets, including 1 million real anonymized English
questions from Microsoft Bing query logs together with a human generated answer
and 9 million passages (Bajaj et al., 2016), that can be used both to test retrieval
ranking and question answering.
Although many datasets focus on English, natural information-seeking ques-
tion datasets exist in other languages. The DuReader dataset is a Chinese QA
resource based on search engine queries and community QA (He et al., 2018).
TyDi QAdataset contains 204K question-answer pairs from 11 typologically di-TyDi QA
verse languages, including Arabic, Bengali, Kiswahili, Russian, and Thai (Clark
et al., 2020a). In the TYDIQA task, a system is given a question and the passages
from a Wikipedia article and must (a) select the passage containing the answer (or
NULLif no passage contains the answer), and (b) mark the minimal answer span (or
NULL).
On the probing side are datasets likeMMLU(Massive Multitask Language Un-MMLU
derstanding), a commonly-used dataset of 15908 knowledge and reasoning ques-
tions in 57 areas including medicine, mathematics, computer science, law, and oth-
ers. MMLU questions are sourced from various exams for humans, such as the US
Graduate Record Exam, Medical Licensing Examination, and Advanced Placement
exams. So the questions don’t represent people’s information needs, but rather are
designed to test human knowledge for academic or licensing purposes. Fig. 11.14
shows some examples, with the correct answers in bold.
Some of the question datasets described above augment each question with pas-
sage(s) from which the answer can be extracted. These datasets were mainly created
for an earlier QA task calledreading comprehensionin which a model is givenreadingcomprehension
a question and a document and is required to extract the answer from the given
document. We sometimes call the task of question answering given one or more
documents (for example via RAG), theopen bookQA task, while the task of an-open book
swering directly from the LM with no retrieval component at all is theclosed bookclosed book
QA task.5 Thus datasets like Natural Questions can be treated as open book if the
solver uses each question’s attached document, or closed book if the documents are
not used, while datasets like MMLU are solely closed book.
Another dimension of variation is the format of the answer: multiple-choice
versus freeform. And of course there are variations in prompting, like whether the
model is just the question (zero-shot) or also given demonstrations of answers to
similar questions (few-shot). MMLU offers both zero-shot and few-shot prompt
options.
5 This repurposes the word for types of exams in which students are allowed to ‘open their books’ or
not.

---

### Page 279

11.6 • EVALUATINGQUESTIONANSWERING271
MMLU examples
College Computer Science
Any set of Boolean operators that is sufficient to represent all Boolean ex-
pressions is said to be complete. Which of the following is NOT complete?
(A) AND, NOT
(B) NOT, OR
(C) AND, OR
(D) NAND
College Physics
The primary source of the Sun’s energy is a series of thermonuclear
reactions in which the energy produced is c 2 times the mass difference
between
(A) two hydrogen atoms and one helium atom
(B)four hydrogen atoms and one helium atom
(C) six hydrogen atoms and two helium atoms
(D) three helium atoms and one carbon atom
International Law
Which of the following is a treaty-based human rights mechanism?
(A)The UN Human Rights Committee
(B) The UN Human Rights Council
(C) The UN Universal Periodic Review
(D) The UN special mandates
Prehistory
Unlike most other early civilizations, Minoan culture shows little evidence
of
(A) trade.
(B) warfare.
(C) the development of a common religion.
(D)conspicuous consumption by elites.
Figure 11.14Example problems from MMLU
11.6 Evaluating Question Answering
Two techniques are commonly employed to evaluate question-answering systems,
with the choice depending on the type of question and QA situation. Formultiple
choicequestions like in MMLU, we report exact match:
Exact match: The % of predicted answers that match the gold answer
exactly.
For questions withfree textanswers, like Natural Questions, we commonly evalu-
ated with tokenF 1 scoreto roughly measure the partial string overlap between the
answer and the reference answer:
F1 score: The average token overlap between predicted and gold an-
swers. Treat the prediction and gold as a bag of tokens, and compute F1
for each question, then return the average F1 over all questions.

---

### Page 280

272CHAPTER11 • RETRIEVAL-BASEDMODELS
11.7 Summary
This chapter introduced the tasks ofinformation retrievaland the use ofretrieval
augmented generation(RAG) to use retrieved passages to improvequestion an-
sweringand other factual generations from LLMs.
• We focus in this chapter on the use of information retrieval for question an-
swering and related factually-based tasks. The idea is to meet the user’s in-
formation needs by drawing on the material in some set of documents (which
might be the web).
•Information Retrieval(IR) is the task of returning documents to a user based
on their information need as expressed in aquery. In ranked retrieval, the
documents are returned in ranked order.
• Two paradigms for IR aresparse retrievalanddense retrieval. Both paradigms
use a document’s similarity to the query as an estimate of its relevance to the
user’s information need.
• In sparse retrieval techniques, we represent both the query and the document
as sparse vectors of the unigram counts of the words they contain, each count
weighted bytf-idforBM25. Then the query-document similarity can be mea-
sured by the cosine between these sparse vectors.
• Theinverted indexis a storage mechanism for sparse retrieval that makes it
very efficient to find documents that have a particular word.
• In dense retrieval techniques, documents or queries are instead represented as
embeddings (dense vectors) computed by a language model (whether encoder-
only models like the BERT family, or decoder-only). Document-query simi-
larity is computed as dot product or cosine in they embedding space.
• For dense retrieval, FAISS is an approximate nearest neighbor vector search
algorithm that makes it very efficient to find thekmost similar document
embeddings to a query embedding, making it quick to do ranking.
• Ranked retrieval is generally evaluated bymean average precisionorinter-
polated precision.
• Retrieval can be incorporated into language modeling viaretrieval-augmented
generation. In theretrievalstep, the user query is passed to the search engine
to retrieve a set of relevant documents or passages. In thegenerationstage,
a large language model is prompted with the query and a set of documents
retrieved from the collection, and then conditionally generates an answer.
• Factual tasks like question answering can be evaluated by exact match with a
known answer if only a single answer is given, with token F 1 score for free
text answers.
Historical Notes
Question answering was one of the earliest NLP tasks. By 1961 the BASEBALL
system (Green et al., 1961) answered questions about baseball games like “Where
did the Red Sox play on July 7” by querying a structured database of game infor-
mation. The database was stored as a kind of attribute-value matrix with values for
attributes of each game:

---

### Page 281

HISTORICALNOTES273
Month = July
Place = Boston
Day = 7
Game Serial No. = 96
(Team = Red Sox, Score = 5)
(Team = Yankees, Score = 3)
Each question was constituency-parsed using the algorithm of Zellig Harris’s
TDAP project at the University of Pennsylvania, essentially a cascade of finite-state
transducers (see the historical discussion in Joshi and Hopely 1999 and Karttunen
1999). Then in a content analysis phase each word or phrase was associated with a
program that computed parts of its meaning. Thus the phrase ‘Where’ had code to
assign the semanticsPlace = ?, with the result that the question “Where did the
Red Sox play on July 7” was assigned the meaning
Place = ?
Team = Red Sox
Month = July
Day = 7
The question is then matched against the database to return the answer.
The Protosynthex system of Simmons et al. (1964), given a question, formed a
query from the content words in the question, and then retrieved candidate answer
sentences in the document, ranked by their frequency-weighted term overlap with
the question. The query and each retrieved sentence were then parsed with depen-
dency parsers, and the sentence whose structure best matches the question structure
selected. Thus the questionWhat do worms eat?would matchworms eat grass:
both have the subjectwormsas a dependent ofeat, in the version of dependency
grammar used at the time, whilebirds eat wormshasbirdsas the subject:
What do worms eat Worms eat grass Birds eat worms
Simmons (1965) summarizes other early QA systems.
By the 1970s, systems used predicate calculus as the meaning representation
language. TheLUNARsystem (Woods et al. 1972, Woods 1978) was designed toLUNAR
be a natural language interface to a database of chemical facts about lunar geology. It
could answer questions likeDo any samples have greater than 13 percent aluminum
by parsing them into a logical form
(TEST (FOR SOME X16 / (SEQ SAMPLES) : T ; (CONTAIN’ X16
(NPR* X17 / (QUOTE AL203)) (GREATERTHAN 13 PCT))))
By the 1990s question answering shifted to machine learning. Zelle and Mooney
(1996) proposed to treat question answering as a semantic parsing task, by creat-
ing the Prolog-based GEOQUERY dataset of questions about US geography. This
model was extended by Zettlemoyer and Collins (2005) and 2007. By a decade
later, neural models were applied to semantic parsing (Dong and Lapata 2016, Jia
and Liang 2016), and then to knowledge-based question answering by mapping text
to SQL (Iyer et al., 2017).
[TBD: History of IR.]
Meanwhile, a paradigm for answering questions that drew more on information-
retrieval was influenced by the rise of the web in the 1990s. The U.S. government-