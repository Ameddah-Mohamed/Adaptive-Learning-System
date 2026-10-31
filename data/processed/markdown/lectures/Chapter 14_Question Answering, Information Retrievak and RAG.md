# Chapter 14_Question Answering, Information Retrievak and RAG

- **Source File**: `Chapter 14_Question Answering, Information Retrievak and RAG.pdf`
- **Total Pages**: 46

---

## Slide / Page 1

Natural Language Processing
Chapter 14
Question Answering,
Information Retrieval, and
Retrieval-Augmented Generation
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

Question Answering Systems (QAS)
• QASs are designed to fill human information needs.
• Since a lot of information is in text form (web, books, emails,
etc.), QA is closely related to the task behind search engines.
• QASs often focus on factoid questions (What, Where, When,
etc.) that can be answered with simple facts expressed in short
or medium-length texts. E.g.:
• What time does the Bardo Museum open?
• Where does the energy in a nuclear
explosion come from?
• When did Algeria get its independence?
2

---

## Slide / Page 3

QASs using LLMs
• Modern NLP systems answer these questions using LLMs, in
one of two ways.
• The first is to prompt a pretrained LLM that has been
finetuned on question/answer datasets with the question in
the prompt.
E.g. causal language model with a string like:
Q: Where is the Louvre Museum located? A:
have it do conditional generation given this prefix, and take
the response as the answer.
• Idea: LMs have read a lot of facts in their pretraining data,
(presumably including the location of the Louvre), and
have encoded this information in their parameters.
3

---

## Slide / Page 4

Problems with prompting an LLM
• Simply prompting an LLM can be a useful approach to answer
many factoid questions. But it is not yet a complete solution for QA.
• Problems:
 LLMs often hallucinate.
 When asked questions, LLMs can make up answers that sound
reasonable.
 E.g.: Dahl et al. (2024) found that when asked questions about
the legal domain (e.g. particular legal cases), LLMs hallucinated
69% to 88% of the time!
• Not always possible to tell when LMs are hallucinating, partly
because LLMs aren’t well-calibrated.
• In a calibrated system, the confidence of a system in the
correctness of its answer is highly correlated with the probability of
an answer being correct  if a calibrated system is wrong, at least it
might hedge its answer or tell us to go check another source. 4

---

## Slide / Page 5

Problems with prompting an LLM
• Other problems:
 Simply prompting a LLM doesn’t allow one to ask questions
about proprietary data (e.g. personal emails, medical records,
internal company documents, …).
 Static LLMs have problems with questions about rapidly
changing information (e.g. about an event that happened last
week) since LLMs won’t have up-to-date information from
after their release data.
• For this reason the most common way to do question-answering
with LLMs is retrieval-augmented generation or RAG.
• In RAG information retrieval (IR) techniques are used to retrieve
documents likely to have information that might help answer the
question. Then a LLM is used to generate an answer given these
documents.
5

---

## Slide / Page 6

RAG for the LLM IR problems
• Basing the answers on retrieved documents can solve some of
the problems with using simple prompting to answer
questions.
 It helps ensure that the answer is grounded in facts from
some curated dataset.
 The system can give the user the answer accompanied by
the context of the passage or document the answer came
from  This information can help users have confidence in
the accuracy of the answer (or help them spot when it is
wrong!).
 These retrieval techniques can be used on any proprietary
data we want, such as legal or medical data for those
applications.
6

---

## Slide / Page 7

Information Retrieval (IR)
• Information Retrieval: the field encompassing the retrieval of
all forms of media based on user information needs.
• The resulting IR system is often called a search engine.
• We consider ad hoc retrieval where a user poses a query to a
retrieval system, which then returns an ordered set of documents
from some collection.
• A document: refers to any unit of text the system indexes and
retrieves (web pages, scientific papers, news articles, or even
shorter passages like collection paragraphs).
• A collection: refers to a set of documents being used to satisfy
user term requests.
• A term: refers to a word in a collection, but it may also include
phrases.
• A query: a user’s information need expressed as a set of terms.
7

---

## Slide / Page 8

High-level architecture of an ad-hoc
retrieval engine
• The basic IR architecture uses the vector space model.
• Queries and documents are mapped to vectors based on unigram word
counts.
• Cosine similarity between the vectors used to rank potential documents.
• This is an example of the bag-of-words model (ref. Chap. 4), since
words are considered independently of their positions.
8

---

## Slide / Page 9

Term weighting and document scoring
• In IR raw word counts are not used.
• Instead, a term weight is computed for each document
word.
• Two term weighting schemes are common:
 The tf-idf weighting seen previously, and
 BM25, a slightly more powerful variant.
9

---

## Slide / Page 10

Reminder: TF-IDF
• Term Frequency: Usually the log10 of the word frequency is used,
rather than the raw count.
 Intuition: a word appearing 100 times in a document doesn’t make
that word 100 times more likely to be relevant to the meaning of the
document.
• Document frequency: dft of a term t is the number of documents it
occurs in.
 Terms that occur in only a few documents are useful for
discriminating those documents from the rest of the collection;
terms that occur across the entire collection aren’t as helpful.
 TF-IDF value for word t in document d:
tf-idf(t,d) = 𝑡𝑓𝑡,𝑑 x 𝐼𝐷𝐹𝑡 10
𝑡𝑓𝑡,𝑑 = ቊ1 + 𝑙𝑜𝑔10 𝑐𝑜𝑢𝑛𝑡 𝑡, 𝑑 𝑖𝑓 𝑐𝑜𝑢𝑛𝑡 𝑡, 𝑑 > 00 𝑜𝑡ℎ𝑒𝑟𝑤𝑖𝑠𝑒
𝐼𝐷𝐹𝑡 = 𝑙𝑜𝑔10
𝑁
𝑑𝑓𝑡

---

## Slide / Page 11

Document Scoring
• Given a query q, a document d is scored by the cosine of its
vector d with the query vector q:
𝑠𝑐𝑜𝑟𝑒 𝑞, 𝑑 = cos 𝑞, 𝑑 =
𝑞.𝑑
|𝑞||𝑑|
• This can be seen as dot product of unit vectors:
𝑠𝑐𝑜𝑟𝑒 𝑞, 𝑑 = cos 𝑞, 𝑑 = 𝑞|𝑞| . 𝑑|𝑑|
• This can be spelled out as:
11

---

## Slide / Page 12

Example
• Let us assume all words in the following query and documents are
downcased and punctuation is removed:
12
Computation of the tf-idf cosine between
query and Doc 1, and query and Doc 2.

---

## Slide / Page 13

Variants of Tf-Idf
• In practice, there are many variants and approximations to the
previous equation.
• E.g. dropping the idf term for the document (computed twice
in the equation):
• This sometimes results in better performance.
13

---

## Slide / Page 14

Another term weighting scheme: BM25
• BM25 (Best Matching 25) ranks documents based on their
relevance to a given query.
• BM25 is an extension of the TF-IDF model, designed to improve
performance by incorporating the idea that term frequency should
have diminishing returns as the TF increases.
• While TF-IDF assumes a linear relationship between TF and
relevance, BM25 introduces non-linear effects to better match
real-world information retrieval needs, especially when the TF
grows very high.
𝑠𝑐𝑜𝑟𝑒 𝑑, 𝑞 = ෍
𝑡∈𝑞
𝐼𝐷𝐹 𝑡 . 𝑡𝑓𝑡,𝑑. (𝑘 + 1)
𝑡𝑓𝑡,𝑑 + 𝑘 . (1 − 𝑏 + 𝑏 . 𝑑𝑎𝑣𝑔𝐷𝐿)
• |d|: length of document d (i.e., total number of terms in d).
• avgDL: average document length in the collection.
• k and b are the parameters we'll focus on.
14

---

## Slide / Page 15

Parameters k and b in BM25
k (Term Frequency Scaling):
• The k parameter controls the saturation effect of TF. It
determines how much TF affects the document score.
• When k is low (e.g., k = 1), TF has a stronger influence on the
score because of the numerator in the formula.
• When k is high (e.g., k = 2 or k = 3), TF has less impact on the
score. This means the relevance does not increase too
dramatically as TF increases.
• The purpose of k is to moderate the effect of TF.
• For example, if a term appears 100 times in a document, k
controls how much more significant that term becomes in
comparison to a term that appears only once.
15

---

## Slide / Page 16

Parameters k and b in BM25
b (Document Length Normalization):
• The b parameter adjusts the effect of document length on the
relevance score.
• b moderates the length bias in IR, since longer documents tend to
have more terms and thus more opportunities to match query terms.
 b = 1 means the document length has a strong effect on the
normalization. If a document is longer, it gets a lower score (because
longer documents tend to be less relevant, on average).
 b = 1: it fully accounts for the length of the document, giving shorter
documents (with the same number of term matches) a higher score.
 b = 0 means there is no length normalization.
 Every document is treated equally regardless of its length, which is more
similar to the classic TF-IDF model.
 BM25 essentially behaves like a basic TF-based model without adjusting
for document length.
16

---

## Slide / Page 17

How k and b Influence BM25 vs TF-IDF
• k adjusts the impact of TF. When k is small, TF increases quickly
with the number of occurrences. When it's large, it reduces the
contribution of multiple occurrences of a term in a document.
• b controls the length normalization. A value close to 1 means
longer documents are penalized more, while a value close to 0
means the length of the document doesn’t matter at all.
Together, k and b help refine BM25 by:
• Smoothing the TF: Avoiding situations where an excessively
high TF leads to an overinflated document score.
• Normalizing for document length: Preventing longer documents
from unfairly boosting their relevance scores just because they
contain more terms.
• Manning et al. (2008) suggest reasonable values are
k = [1.2, 2] and b = 0.75.
17

---

## Slide / Page 18

Practical Example:
• Consider the two documents:
 Doc A: "Information retrieval is important" (3 terms).
 Doc B: "Information retrieval is important for efficient data
retrieval" (6 terms).
• If both documents contain the same term "information", but
Doc B is longer, Doc A will likely be ranked higher,
depending on the value of b.
 With b = 1, Doc A will benefit from being shorter, as it matches the
query term without the penalty of being overly long.
• If k = 1, the TF is more sensitive, meaning that even a small
increase in frequency will have a relatively large impact.
• If k = 2, the effect is dampened, so adding extra occurrences of
the term has a smaller effect.
18

---

## Slide / Page 19

Stop words
• Intuition: High-frequency terms (often function words like the,
a, to):
 carry little semantic weight,
 may not help with retrieval, and
 can help shrink the inverted index files (described below).
• Downside of using a stop list: it makes it difficult to search for
phrases that contain words in the stop list.
 For example, common stop lists would reduce the phrase
to be or not to be to the phrase not!
• In modern IR systems, the use of stop lists is much less
common, partly due to improved efficiency and partly because
much of their function is already handled by IDF weighting.
• Stop word removal is occasionally useful in various NLP tasks.
19

---

## Slide / Page 20

Inverted Index
• Basic search problem in IR: find all documents d ∈ C that contain a
term q ∈ Q.
• The data structure for this task is the inverted index.
• Used for making the search efficient, and conveniently storing
useful information like the DF and the count of each term in each
document.
• The inverted index consists of two parts: (1) a dictionary and (2)
the postings.
 Dictionary: a list of terms (designed to be efficiently accessed),
each pointing to a postings list for the term.
 Postings list: the list of document IDs associated with each
term,
 can also contain information like the TF or even the exact
positions of terms in the document.
20

---

## Slide / Page 21

Example:
• For the 4 documents seen in slide 14:
• Given a list of terms in query, we can very efficiently get lists of
all candidate documents, together with the information necessary
to compute the tf-idf scores we need.
• For the question-answering domain of finding Wikipedia pages to
match a user query, Chen et al. (2017a) show that indexing based
on bigrams works better than unigrams, and use efficient hashing
algorithms rather than the inverted index to make the search
efficient.
21

---

## Slide / Page 22

Evaluation of IR Systems
• The performance of retrieval systems is measured using the same
precision and recall metrics.
• Assumption: each document returned by the IR system is either
relevant to our purposes or not relevant.
• Precision: fraction of the returned documents that are relevant.
• Recall: fraction of all relevant documents that are returned.
𝑃𝑟𝑒𝑐𝑖𝑠𝑖𝑜𝑛 = |𝑅||𝑇| 𝑅𝑒𝑐𝑎𝑙𝑙 = |𝑅||𝑈|
where
 T: ranked documents returned by the system in response to an
information request,
 R: subset of relevant documents, and
 U: documents in the collection as a whole relevant to the request.
22

---

## Slide / Page 23

Precision and Recall for IR Systems
• Precision and Recall don’t adequately measure the performance
of an IR system that ranks the documents it returns.
• If we are comparing the performance of two ranked retrieval
systems, we need a metric that prefers the one that ranks the
relevant documents higher.
• We need to adapt Precision and Recall to capture how well a
system does at putting relevant documents higher in the ranking.
23

---

## Slide / Page 24

Example
• Consider the following table which gives rank-specific
precision and recall values calculated as we proceed down
through a set of ranked documents for a particular query;
• There are 9 relevant documents in the collection to the query .
24

---

## Slide / Page 25

Precision-Recall Curve
Notes:
 Recall is non-decreasing; when a relevant document is encountered,
recall increases, and when a non-relevant document is found it
remains unchanged.
 Precision, jumps up and down, increasing when relevant documents
are found, and decreasing otherwise.
 The most common way to visualize precision and recall is to plot
precision against recall in a precision-recall curve,
25

---

## Slide / Page 26

Interpolated Precision
• The above precision-recall curve shows the values for a single
query. We’ll need
 to combine values for all the queries, and
 in a way that lets us compare one system to another.
• The main challenge with Precision-Recall curve is that precision
is often not monotonic with respect to recall
 This means that as we retrieve more items (increasing recall),
precision might fluctuate (sharp dips and sharp increases).
 Difficult to compare models or systems based on such curves.
• Interpolated precision provides a smoothed version of
precision that focuses on avoiding the sharp drops in precision.
• At any given recall level, we calculate the maximum precision
achieved at any recall level greater than or equal to the
current level.
26

---

## Slide / Page 27

Interpolated Precision
• One way of doing this is to plot averaged precision values at 11
fixed levels of recall (0 to 100, in steps of 10).
• Since we’re not likely to have data points at these exact levels, we
use interpolated precision values for the 11 recall values from the
data points we do have.
• This is done by choosing the maximum precision value achieved
at any level of recall at or above the current level.
27
𝐼𝑛𝑡𝑃𝑟𝑒𝑐𝑖𝑠𝑖𝑜𝑛(𝑟) = max
𝑖≥𝑟
)𝑃𝑟𝑒𝑐𝑖𝑠𝑖𝑜𝑛(𝑖
• Particularly useful for evaluating systems where precision tends to
vary with the volume of retrieved items (as recall increases), and it
gives a more robust measure of precision across different recall
levels.
• Prevents penalizing a model for sharp decreases in precision.

---

## Slide / Page 28

Interpolated Precision
• This interpolation scheme lets us average performance over a set
of queries, and helps smooth over the irregular precision values in
the original data.
28

---

## Slide / Page 29

Interpolated Precision
• Given curves such as the previous one, we can compare two
ranked systems or approaches by comparing their curves.
 Curves that are higher in precision across all recall values are
preferred.
 These curves can also provide insight into the overall
behavior of a system.
 Systems that are higher in precision toward the left may
favor precision over recall,
 Systems that are more geared towards recall will be higher at
higher levels of recall (to the right).
29

---

## Slide / Page 30

Mean Average Precision (MAP)
• Mean Average Precision (MAP) is another way to evaluate
ranked retrieval.
• MAP provides a single metric that can be used to compare
competing systems or approaches.
• As before, we descend through the ranked list of items, but
now we note the precision only at those points where a
relevant item has been encountered (for example at ranks 1,
3, 5, 6 but not 2 or 4 in previous Precision-Recall table).
30

---

## Slide / Page 31

Mean Average Precision (MAP)
• For a single query, we average these individual precision
measurements over the returned set (up to some fixed cutoff).
𝐴𝑃 = 1|𝑅𝑟| ෍𝑑∈𝑅𝑟 )𝑃𝑟𝑒𝑐𝑖𝑠𝑖𝑜𝑛𝑟(𝑑
where 𝑅𝑟 is the set of relevant documents at or above r, and
Precisionr(d) is the precision measured at the rank at which
document d was found.
• For an ensemble of queries Q, we average over these averages, to
get the final MAP measure:
𝑀𝐴𝑃 = 1|𝑄| ෍
𝑞∈𝑄
)𝐴𝑃(𝑄
• The MAP for the single query (hence = AP) in previous Precision-
Recall table is 0.6. 31

---

## Slide / Page 32

Information Retrieval with Dense Vectors
• Conceptual flaw with the classic tf-idf or BM25 algorithms for IR: they
work only if there is exact overlap of words between the query and
document.
• Vocabulary mismatch problem : the user posing a query (needs to
guess exactly what words are used in the answer).
• Solution: use an approach that can handle synonymy instead of
(sparse) word-count vectors  use (dense) embeddings.
• Implemented in modern times via encoders like BERT.
• Most powerful approach:
 present both q and d to a single encoder,
 the transformer self-attention will see all the tokens of both q and d,
 It builds a representation that is sensitive to the meanings of both q
and d.
 Then a linear layer can be put on top of the [CLS] token to predict a
similarity score for the query/document tuple:
z = BERT(q;[SEP];d)[CLS]
score(q,d) = softmax(U(z)) 32

---

## Slide / Page 33

Dense retrieval architecture
33
• Two ways to do dense retrieval, illustrated by using lines between layers to
schematically represent self-attention:
(a) Use a single encoder to jointly encode q and d and finetune to produce a
relevance score with a linear layer over the CLS token. This is too compute-
expensive to use except in rescoring.
(b) Use separate encoders for q and d , and use as the score the dot product
between CLS token outputs for the q and d. This is less compute-expensive, but
not as accurate.
• The model can create a meaningful, dense vector (CLS) that summarizes the
semantic content (i.e. similarity or not) of the entire text (query and/or document).
• This vector can be used directly for ranking and retrieval.

---

## Slide / Page 34

Note on Rescoring
• Rescoring refers to a step that happens after an initial
retrieval process.
• In a typical retrieval system, one might
 first use a less computationally expensive method (such as dot-product
or separate encoders) to retrieve a set of candidate documents that are
likely to be relevant.
 Then, one might use the more expensive method (joint encoding with a
single encoder) to "rescore" these candidates by re-evaluating their
relevance in more detail.
• Since the joint encoding with a single encoder is too expensive
to apply to all documents in a large dataset, it is more feasible
to use it only on a smaller set of top candidates that were
retrieved quickly using a cheaper method.
34

---

## Slide / Page 35

Retrieval Optimisation
• Usually the retrieval step is not done on an entire document.
• Instead,
 documents are broken up into smaller passages, such as non-
overlapping fixed-length chunks of say 100 tokens, and
 the retriever encodes and retrieves these passages rather than
entire documents.
• The q and d have to be made to fit in the BERT 512-token
window, for example by truncating the q to 64 tokens and
truncating the d if necessary so that it, the query, [CLS], and
[SEP] fit in 512 tokens.
• The BERT system together with the linear layer U can then be
fine-tuned for the relevance task by gathering a finetuning dataset
of relevant and non-relevant passages.
35

---

## Slide / Page 36

Dealing with computation constraints
• Problem with full BERT architecture in Fig. a is the expense in
computation and time.
 With this architecture, for each query, one has to pass every single
document in the entire collection through a BERT encoder jointly
with the new query!
  This enormous use of resources is impractical for real cases.
• A much more efficient architecture is the bi-encoder (Fig. b).
 The documents in the collection are encoded only one time using two
separate encoder models, one to encode the query and one to encode
the document.
 All the encoded document vectors are stored in advance.
 When a query comes in,
 just this query is encoded and
 then use the dot product between the query vector and the
precomputed document vectors as the score for each candidate
document.
36

---

## Slide / Page 37

Dealing with computation constraints
• For example, if we used BERT, we would have two encoders BERTQ and
BERTD and we could represent the q and d as the [CLS] token of the respective
encoders:
zq = BERTQ(q) [CLS]
zd = BERTD(d) [CLS]
score(q, d) = zq . zd
• The bi-encoder is
 much cheaper than a full query-document encoder, but
 is less accurate, since its relevance decision can’t take full advantage of all
the possible meaning interactions between all the tokens in q and the tokens
in d.
• There are numerous intermediate approaches that lie in between the full encoder
and the bi-encoder.
 One alternative: use cheaper methods (like BM25) as the first pass relevance
ranking for each document, take the top N ranked documents, and use
expensive methods like the full BERT scoring to re-rank only the top N
documents rather than the whole set. 37

---

## Slide / Page 38

Answering Questions with RAG
• Dominant paradigm for question answering: answer a user’s question by
 First finding supportive text segments from the web or another large
collection of documents, and
 then generating an answer based on the documents.
• Retrieval-Augmented Generation (RAG): method of generating based on
retrieved documents.
• The two components are sometimes called the retriever and the reader.
• In RAG, we take a large pretrained language model, give it the set of retrieved
passages and other text as its prompt, and autoregressively generate a new
answer token by token.
41

---

## Slide / Page 39

Retrieval-Augmented Generation
• Recall that in simple conditional generation, we can cast the task of
question answering as word prediction by giving a language model
a question and a token like A: suggesting that an answer should
come next:
Q: Who wrote the book “The Origin of Species"? A:
• Then we generate autoregressively conditioned on this text.
• More formally, recall that simple autoregressive language
modeling computes the probability of a string from the previous
tokens:  𝑝 𝑥1, … , 𝑥𝑛 = ς𝑖=1𝑛 𝑝(𝑥𝑖|𝑥<𝑖)
• Simple conditional generation for question answering adds a
prompt like Q: , followed by a query q , and A:, all concatenated:
𝑝 𝑥1, … , 𝑥𝑛 = ς𝑖=1𝑛 𝑝( 𝑄: ; 𝑞 ; 𝐴: ; 𝑥<𝑖)
42

---

## Slide / Page 40

Need for RAG
• Advantage of using a LLM: enormous amount of knowledge
encoded in its parameters from the text it was pretrained on.
• This kind of simple prompted generation can work fine for
many simple factoid questions,
• BUT it is not a general solution for QA, because
 it leads to hallucination,
 is unable to show users textual evidence to support the
answer, and
 is unable to answer questions from proprietary data.
• Idea of RAG: address these problems by conditioning on the
retrieved passages as part of the prefix, perhaps with some
prompt text like “Based on these texts, answer
this question:”.
43

---

## Slide / Page 41

RAG
• More formally,
𝑝 𝑥1, … , 𝑥𝑛 = ෑ
𝑖=1
𝑛
𝑝 𝑥𝑖 𝑅 𝑄 ; 𝑝𝑟𝑜𝑚𝑝𝑡 ; 𝑄: ; 𝑞 ; 𝐴: ; 𝑥<𝑖)
• Successfully applying the RAG algorithm for QA requires a
successful retriever, and often a two-stage retrieval algorithm is used
in which the retrieval is reranked.
• Some complex questions may require multi-hop architectures, in
which a query is used to retrieve documents, which are then
appended to the original query for a second stage of retrieval.
44

---

## Slide / Page 42

Evaluating Question Answering
• 3 techniques are commonly employed to evaluate QA systems,
with the choice depending on the type of question and QA
situation.
• For multiple choice questions, exact match is reported, i.e. the %
of predicted answers that match the gold answer exactly.
• Questions with free text answers, like Natural Questions, are
commonly evaluated with token F1 score to roughly measure the
partial string overlap between the answer and the reference
answer:
 F1 score: The average token overlap between predicted and
gold answers. Treat the prediction and gold as a bag of tokens,
and compute F1 for each question, then return the average F1
over all questions.
45

---

## Slide / Page 43

Example questions from MMLU dataset
46

---

## Slide / Page 44

Mean Reciprocal Rank (MRR)
• In some situations QA systems give multiple ranked
answers. In such cases Mean Reciprocal Rank (MRR) is
used.
• MRR is designed for systems that return a short ranked list
of answers or passages for each test set question, which we
can compare against the (human-labeled) correct answer.
• Each test set question is scored with the reciprocal of the
rank of the first correct answer.
 E.g.: if the system returned 5 answers to a question but
the first 3 are wrong (so the highest-ranked correct
answer is ranked 4th), the reciprocal rank for that
question is ¼.
47

---

## Slide / Page 45

Mean Reciprocal Rank (MRR)
• The MRR of a system is the average of the scores for
each question in the test set.
• In some versions of MRR, questions with a score of
zero are ignored in this calculation.
• More formally, for a system returning ranked answers
to each question in a test set Q, (or in the alternate
version, let Q be the subset of test set questions that
have non-zero scores). MRR is then defined as
𝑀𝑅𝑅 =
1
|𝑄| σ𝑖=1|𝑄| 1𝑟𝑎𝑛𝑘𝑖
48

---

## Slide / Page 46

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
49
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

