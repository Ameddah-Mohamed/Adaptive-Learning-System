# Chapter 10_Large Language Models

- **Source File**: `Chapter 10_Large Language Models.pdf`
- **Total Pages**: 68

---

## Slide / Page 1

Natural Language Processing
Chapter 10
Large Language Models
Prof. Ahmed Guessoum
The National Higher School of AI

---

## Slide / Page 2

Introduction to Large Language Models

---

## Slide / Page 3

LLMs
• In this chapter we formalize the idea of pretraining:
learning knowledge about language and the world from
vast amounts of text—and call the resulting pretrained
language models Large Language Models (LLMs).
• LLMs have been transformative, especially in tasks
where text generation is required (MT, summarization,
QAS, chatbots...)
• Text generation, code generation, and image generation
together constitute the important new area of
generative AI.
• Almost any NLP task can be modeled as word
prediction in a large language model,
3

---

## Slide / Page 4

Language models
• Remember the simple n-gram language model
• Assigns probabilities to sequences of words
• Generates text by sampling possible next words
• Is trained on counts computed from lots of text
• Large language models are similar and
different:
• Assign probabilities to sequences of words
• Generate text by sampling possible next words
• Are trained by learning to guess the next word
4

---

## Slide / Page 5

Large language models
• Even through pretrained only to predict words
• Learn a lot of useful language knowledge
• Since training on a lot of text
5

---

## Slide / Page 6

Large Language Models : What tasks can
they do?

---

## Slide / Page 7

Big idea
• Many tasks can be turned into tasks of predicting
words!
7

---

## Slide / Page 8

Conditional Generation
Preﬁx Text
Completion Text
Encoder
Transformer
Blocks
Softmax
long
all
and thanks for all
the
the
…
U UUnencoder layer
Language
Modeling
Head
logits
So
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
…
• Conditional generation: task of generating text conditioned on an
input piece of text.
• The LLM takes an input piece of text (a prompt), and then continues
generating text token by token, conditioned on the prompt.
• Transformers have long contexts (many thousands of tokens) which
makes them very powerful for conditional generation, because they
can look back very far into the prompting text.
8

---

## Slide / Page 9

Text Completion
• Example: simple task of text completion of “So long
and thanks for”
• Here a LM is given a text prefix and is asked to
generate a possible completion.
• During generation, the model has direct access to the
priming context as well as to all of its own
subsequently generated outputs (as fits in the large
context window).
• Key to the Power of LLMs built from transformers:
this ability to incorporate
 the entirety of the earlier context and
 generated outputs at each time step.
9

---

## Slide / Page 10

Practical NLP tasks as word prediction!
• Sentiment analysis: “I like Jackie Chan”
1. We give the language model this string
(prompt):
The sentiment of the sentence
"I like Jackie Chan" is:
1. And see what word it thinks comes next:
10.1 • LARGE LAN GUAGE MODELS WIT H TRAN SFORMERS 3
Preﬁx Text
Completion Text
Encoder
Transformer
Blocks
Softmax
long
all
and thanks for all
the
the
…
U UUnencoder layer
Language
Modeling
Head
logits
So
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
…
Figure10.1 Left-to-right(alsocalledautoregressive)text completionwith transformer-basedlargelanguage
models.As eachtokenis generated,it getsaddedontothecontext asapreﬁxfor generatingthenext token.
word“negative” to seewhichis higher:
P(positive|The sentimentof the sentence‘‘I like JackieChan" is:)
P(negative|The sentimentof the sentence‘‘I like JackieChan" is:)
If the word “positive” is moreprobable,we saythe sentimentof the sentenceis
positive,otherwisewesaythesentimentis negative.
We canalsocastmorecomplex tasksasword prediction. Considerquestion
answering,in which the systemis given a question(for examplea questionwith
a simplefactualanswer)andmustgive a textual answer;we introducethis taskin
detailin Chapter15. Wecancastthetaskof questionansweringaswordprediction
by givingalanguagemodelaquestionandatokenlike A:suggestingthatananswer
shouldcomenext:
Q: Who wrote the book ‘‘The Originof Species"? A:
If we aska languagemodelto computethe probabilitydistribution over possible
next wordsgiventhispreﬁx:
P(w|Q: Who wrote the book ‘‘The Originof Species"? A:)
andlook at which words w have high probabilities,we might expectto seethat
Charle sis verylikely, andthenif wechooseCharle sandcontinueandask
P(w|Q: Who wrote the book ‘‘The Originof Species"? A: Charles)
wemightnow seethatDarwin is themostprobabletoken,andselectit.
Conditionalgenerationcanevenbeusedto accomplishtasksthatmustgenerate
longerresponses.Considerthetaskof text summarization, whichis to takealongtextsummarization
text, suchasafull-lengtharticle,andproduceaneffectiveshortersummaryof it. We
cancastsummarization aslanguagemodelingby giving a largelanguagemodela
text, andfollow thetext by atokenlike tl;dr; thistokenis shortfor somethinglike
10

---

## Slide / Page 11

Framing tasks as conditional generation
QA: “Who wrote The Origin of Species” (Factual Q)
1. We give the language model this string:
Q: Who wrote the book “The Origin of
Species”? A:
(token “A:” suggests that an answer should come next.)
2. and see what word it thinks comes next (i.e. highest
probability):
3. … and iterate:
10.1 • LARGE LANGUAGE MODELS WITH TRANSFORMERS 3
Preﬁx Text
Completion Text
Encoder
Transformer
Blocks
Softmax
long
all
and thanks for all
the
the
…
U UUnencoder layer
Language
Modeling
Head
logits
So
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
…
Figure10.1 Left-to-right(alsocalledautoregressive)text completionwith transformer-basedlargelanguage
models.As eachtokenis generated,it getsaddedontothecontext asapreﬁxfor generatingthenext token.
word“nega tive” to se ewhichis highe r:
P(positive|The sentimentof the sentence‘‘I like JackieChan"is:)
P(nega tive|The sentimentof the sentence‘‘I like JackieChan"is:)
If theword “positive” is moreproba ble ,we sa ythe se ntime ntof the se nte nceis
positive,othe rwisewesa ythese ntime ntis nega tive.
We ca na lsoca stmorecomplex ta sksasword pre diction.Conside rque stion
a nswe ring,in which thesyste mis given a que stion(for exa mplea que stionwith
a simplefa ctua la nswe r)a ndmustgive a textua la nswe r;we introducethista skin
de ta ilin Cha pte r15.Weca nca sttheta skof que stiona nswe ringaswordpre diction
bygivingala ngua gemode laque stiona ndatokenlikeA:sugge stingtha tana nswe r
shouldcomenext:
Q: Who wrotethe book ‘‘TheOriginof Species"? A:
If we a ska la ngua gemode lto computetheproba bilitydistribution over possible
next wordsgiventhispre ﬁx:
P(w|Q: Who wrotethe book ‘‘TheOriginof Species"? A:)
a ndlook at which wordsw have high proba bilitie s,we might expe ctto se etha t
Charle sis ve rylike ly, a ndthe nif wechooseCharle sa ndcontinuea nda sk
P(w|Q: Who wrotethe book ‘‘TheOriginof Species"? A: Charles)
wemightnow se etha tDarwinis themostproba bletoke n,a ndse le ctit.
Conditiona lge ne ra tionca nevenbeuse dto a ccomplishta skstha tmustge ne ra te
longe rre sponse s.Conside rtheta skof te xtsummarization, whichis to ta kealongte xtsummarization
text, suchasafull-le ngtha rticle ,a ndproduceaneffe ctiveshorte rsumma ryof it. We
ca nca stsumma rization asla ngua gemode lingby giving a la rgela ngua gemode la
text, a ndfollow thetext byatokenliketl;dr; thistokenis shortfor some thinglike
10.1 • LARGE LANGUAGE MODELS WITH TRANSFORMERS 3
Preﬁx Text
Completion Text
Encoder
Transformer
Blocks
Softmax
long
all
and thanks for all
the
the
…
U UUnencoder layer
Language
Modeling
Head
logits
So
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
E
i+
…
Figure10.1 Left-to-right(alsocalledautoregressive)text completionwith transformer-basedlargelanguage
models.Aseachtokenis generated,it getsaddedontothecontext asapreﬁxfor generatingthenext token.
word“nega tive” to se ewhichis highe r:
P(positive|The sentimentof the sentence‘‘I like JackieChan"is:)
P(nega tive|The sentimentof the sentence‘‘I like JackieChan"is:)
If the word “positive” is moreproba ble ,we sa ythe se ntime ntof the se nte nceis
positive,othe rwisewesa ythese ntime ntis nega tive.
We ca na lsoca stmorecomplex ta sksasword pre diction.Conside rque stion
a nswe ring,in which thesyste mis givena que stion(for exa mplea que stionwith
a simplefa ctua la nswe r)a ndmustgive a textua la nswe r;we introducethista skin
de ta ilin Cha pte r15.Weca nca sttheta skof que stiona nswe ringaswordpre diction
bygivingala ngua gemode laque stiona ndatokenlikeA:sugge stingtha tana nswe r
shouldcomenext:
Q: Who wrotethe book ‘‘TheOriginof Species"? A:
If we a ska la ngua gemode lto computetheproba bilitydistribution over possible
next wordsgiventhispre ﬁx:
P(w|Q: Who wrotethe book ‘‘TheOriginof Species"? A:)
a ndlook at which wordsw have high proba bilitie s,we might expe ctto se etha t
Charle sis ve rylike ly, a ndthe nif wechooseCharle sa ndcontinuea nda sk
P(w|Q: Who wrotethe book ‘‘TheOriginof Species"? A: Charles)
wemightnow se etha tDarwinis themostproba bletoke n,a ndse le ctit.
Conditiona lge ne ra tionca nevenbeuse dto a ccomplishta skstha tmustge ne ra te
longe rre sponse s.Conside rtheta skof te xtsummarization, whichis to ta kealongte xtsummarization
text, suchasafull-le ngtha rticle ,a ndproduceaneffe ctiveshorte rsumma ryof it. We
ca nca stsumma rization asla ngua gemode lingby giving a la rgela ngua gemode la
text, a ndfollow thetext byatokenliketl;dr; thistokenis shortfor some thinglike
11

---

## Slide / Page 12

Text Summarization
Original
Summary
12

---

## Slide / Page 13

LLMs for summarization (using  tl;dr)
• Give a LLM a text, and follow it by a token like tl;dr;
• Token tl;dr; is short for “too long; didn’t read” often
used, especially in informal work emails, when they are
going to give a short summary.
• This token being sufficiently frequent in LM training
data, the LM has seen many texts in which the token
occurs before a summary, and hence will interpret it as
instructions to generate a summary.
• So conditional generation  give the LM the prefix, and
then have it generate the following words, one by one.
• Take the entire response as a summary.
13

---

## Slide / Page 14

LLMs for summarization (using  tl;dr)
Original Story
Generated Summary
… idea
Kyle
was born. Kyle
Waring
WaringonlyThe
…
will
Delimiter
will
U U U
tl;dr
LM Head
E
E
E
E
E
E
E
E
…
14

---

## Slide / Page 15

Left-to-Right Generation
• The prediction of the next word is done from left
to right for languages like English (right to left for
Arabic).
• This is also called:
• Causal generation
(alternatives like the masked LMs are non-causal
because they can predict words based on both past and
future words).
• Autoregressive generation
• Left-to-right generation
15

---

## Slide / Page 16

Sampling for LLM Generation

---

## Slide / Page 17

Greedy Decoding
• One simple way to generate words is to always generate the
most likely word given the context.
• This is called greedy decoding (GD).
• A greedy algorithm is one that makes a locally optimal choice.
ෝ𝑤𝑡 = 𝑎𝑟𝑔𝑚𝑎𝑥𝑤∈𝑉𝑃(𝑤|𝑤<𝑡)
• In practice, greedy decoding not used with LLMs.
• Major problem with GD: because the words it chooses are
extremely predictable, the resulting text is generic and often
quite repetitive.
• GD will always result in generating exactly the same string.
• Beam Search, extension to GD, works well in tasks like MT.
• Most other tasks, more sophisticated methods, called sampling
methods, introduce more diversity into the generations.
17

---

## Slide / Page 18

Decoding and Sampling
• Core of generation process for LLMs: task of choosing
the word to generate next based on the context and the
probabilities that the model assigns to possible words.
• This task is called decoding.
• Sampling: the most common method for decoding in
LLMs.
• Sampling from a model’s distribution over words:
choose random words according to their probability
assigned by the transformer model.
• After each token, sample words to generate according
to their probability conditioned on previous choices.
18

---

## Slide / Page 19

Random sampling
• Algorithm for generating a sequence of words
until the end-of-sequence token is met:
(x ~ p(x) means ‘choose x by sampling from the
distribution p(x))
19

---

## Slide / Page 20

Random sampling Shortcoming
+ Random sampling mostly generates sensible,
high-probable words,
- Problem: There are many odd, low-probability
words in the tail of the distribution
 Each one has low-probability but added up
they constitute a large portion of the
distribution.
 So they get picked enough to generate weird
sentences.
20

---

## Slide / Page 21

Factors in word sampling:
quality and diversity
• Emphasize high-probability words
 more quality: more  accurate, coherent, and
factual,
 less diversity: boring, repetitive.
• Emphasize middle-probability words
 more diversity: more creative, diverse,
 less quality: less factual, incoherent
21

---

## Slide / Page 22

Top-k sampling:
• Top-k sampling is a simple generalization of greedy
decoding.
1. Choose # of words k
2. For each word in the vocabulary V , use the LM to
compute the likelihood of this word given the context
p(wt |w<t )
3. Sort the words by likelihood and keep only the top k
most probable words.
4. Renormalize the scores of the k words to be a
legitimate probability distribution.
5. Randomly sample a word from within these remaining
k most-probable words according to its probability.
22

---

## Slide / Page 23

Top-p sampling (or nucleus sampling)
• Problem with top-k sampling:  k is fixed so may cover
very different amounts of probability mass in different
situations.
• Idea: Instead, keep the top p percent of the
probability mass.
• Given a distribution P(wt |w<t ), the top-p vocabulary
V (p) is the smallest set of words such that
23

---

## Slide / Page 24

Temperature sampling
• Reshape the distribution instead of truncating it.
•Intuition from thermodynamics,
• a system at high temperature is flexible and can
explore many possible states;
• a system at lower temperature is likely to explore
a subset of lower energy (better) states.
• In low-temperature sampling,  (τ ≤ 1) we smoothly
• increase the probability of the most probable
words
• decrease the probability of the rare words.
24

---

## Slide / Page 25

Temperature sampling
• Divide the logit by a temperature parameter τ
before passing it through the softmax.
• Instead of
• We do
25

---

## Slide / Page 26

Temperature sampling
Why does this work?
• When τ is close to 1 the distribution doesn’t change
much.
• The lower τ is, the larger the scores being passed to the
softmax function.
• Softmax pushes high values toward 1 and low values
toward 0.
• Large input pushes high-probability words higher and
low probability word lower,  making the distribution
more greedy.
• As τ approaches 0, the probability of most likely word
approaches 1 .
0 ≤ τ ≤ 1
26

---

## Slide / Page 27

Selection of  τ
• In practice,
 temperature τ is typically a single fixed
value
 applied uniformly across all logits for a
given sample, and
 its value is usually set via parameter
tuning based on the desired level of
diversity and creativity in the generated text.
27

---

## Slide / Page 28

Pretraining LLMs: Algorithm

---

## Slide / Page 29

Pretraining
• The big idea that underlies all the amazing
performance of language models
 First pretrain a transformer model on
enormous amounts of text
 Then apply it to new tasks.
29

---

## Slide / Page 30

Self-supervised training algorithm
• Model just trained to predict the next word!
1. Take a corpus of text
2. At each time step t
i. ask the model to predict the next word ;
ii. train the model using gradient descent to minimize
the error in this prediction.
• Model called self-supervised because no need to add
any special gold labels to the data; the natural sequence
of words is its own supervision!
• Model trained to minimize the error in predicting the
true next word in the training sequence, using cross-
entropy as the loss function. 30

---

## Slide / Page 31

Cross-entropy loss for language
modeling
• CE loss: difference between the correct
probability distribution and the predicted
distribution
• The correct distribution yt knows the next word, so it is 1 for the actual next word and 0 for the
others.
• Hence in this sum, all terms get multiplied by
zero except one: the log probability the model
assigns to the correct next word, so:
•
31

---

## Slide / Page 32

Training a transformer language model
long and thanks forNext token all
Loss
…
=− logyand
Stacked
Transformer
Blocks
So long and thanks for
…
…
…
U
Input tokens
x1 x2
Language
Modeling
Head
x3 x4 x5
Input
Encoding
E
1+
E
2+
E
3+
E
4+
E
5+
…
… ………
U
U
U
U
…
logits logits logits logits logits
…− logyth anks
32

---

## Slide / Page 33

Teacher forcing
• At each token position t, model sees correct tokens w1:t,
• Computes  loss (–log probability) for the next token wt+1
• At next token position t+1 we ignore what the  model
predicted for wt+1
• Instead we take the correct word wt+1, add it to context,
move on.
• For training, the probability assigned to the correct word is
used to calculate the CE loss for each item in the sequence.
• The loss for a training sequence is the average cross-entropy
loss over the entire sequence.
• Weights in the network are adjusted to minimize the average
CE loss over the training sequence via gradient descent.
33

---

## Slide / Page 34

On LLM Training
• Large models are generally trained by filling
the full context window with text.
 For example, 4096 tokens for GPT4 or 8192 for
Llama 3.
• If documents are shorter than this, multiple
documents are packed into the window with a
special end-of-text token between them.
• The batch size for gradient descent is usually
quite large:
 the largest GPT-3 model uses a batch size of 3.2
million tokens.
34

---

## Slide / Page 35

Parallelising & distributing the Computation
• Time-sharing is used so as multiple sequences are
processed simultaneously, with resources (like
GPUs/TPUs) taking turns processing different parts of
the batch in parallel.
• The parallelism exists both within sequences (intra-
sequence, e.g., attention heads) and across sequences
(inter-sequence, e.g., parallel batches of sequences
processed across GPUs/TPUs).
• Parallelism and distributed processing are what makes
training on such large datasets and models possible.
35

---

## Slide / Page 36

Pretraining data for LLMs

---

## Slide / Page 37

LLMs are mainly trained on the web
• LLMs are mainly trained on
 text scraped from the web,
 augmented by more carefully curated data.
• Web text is usually taken from corpora of automatically-
crawled web pages like
 Common crawl, snapshots of the entire web produced by
the non- profit Common Crawl with billions of pages.
• Various versions of Common crawl exist, e.g. Colossal Clean
Crawled Corpus (C4),
 156 billion tokens of English,  filtered. (deduplicated, removing
non-natural language like code, sentences with offensive words
from a blocklist).
• What's in it?
 Mostly patent text docs, Wikipedia, and news sites 37

---

## Slide / Page 38

The Pile: a pretraining corpus
Figure1: Treemapof Pile componentsby effectivesize.
troducea new ﬁltered subsetof CommonCrawl,
Pile-CC,with improvedextractionquality.
Throughour analyses,we conﬁrmthatthePile is
signiﬁcantly distinct from pure CommonCrawl
data.Additionally, our evaluationsshow thatthe
existingGPT-2 andGPT-3 modelsperformpoorly
onmany componentsof thePile,andthatmodels
trainedon the Pile signiﬁcantlyoutperformboth
raw andﬁlteredCommonCrawl models.To com-
plementtheperformanceevaluations,we alsoper-
form anexploratoryanalysisof thetext within the
Pile to provide a detailedpictureof thedata.We
hopethatour extensive documentationof thecon-
structionandcharacteristicsof thePile will help
researchersmake informeddecisionsaboutpoten-
tial downstreamapplications.
Finally, we make publicly availablethepreprocess-
ing codefor theconstituentdatasetsof thePile and
thecodefor constructingalternative versions2. In
theinterestof reproducibility, we alsodocument
all processingperformedon eachdataset(andthe
Pileasawhole)in asmuchdetail aspossible.For
furtherdetailsabouttheprocessingof eachdataset,
seeSection2 andAppendixC.
2ht t ps: / / gi t hub. com / El eut her AI /
t he- pi l e
1.1 Contrib utions
Thecorecontributionsof thispaperare:
1. The introduction of a 825.18 GiB english-
languagedatasetfor languagemodelingcom-
bining 22diversesources.
2. Theintroductionof 14new languagemodel-
ing datasets,which we expectto beof inde-
pendentinterestto researchers.
3. Evaluations demonstrating signiﬁcant im-
provementsacrossmany domainsby GPT-2-
sizedmodelstrainedonthis new dataset,com-
paredto trainingonCC-100andraw Common
Crawl.
4. Theinvestigationanddocumentation of this
dataset,which we hopewill betterinform re-
searchersabouthow to useit aswell asmoti-
vatethemto undertake similar investigations
of their own data.
2 The Pile Datasets
ThePileis composedof 22constituentsub-datasets,
asshown in Table1. Following Brown etal. (2020),
we increasetheweightsof higherquality compo-
nents,with certainhigh-qualitydatasetssuchas
Wikipediabeingseenup to 3 times(“epochs”)for
2
webacademics books
dialog
38
misc.
Dolma: a larger open corpus of English, created with public tools.
Three trillion tokens of web text, academic papers, code, books,
encyclopedic materials, and social media.

---

## Slide / Page 39

Filtering for Quality and Safety
• Quality is subjective!
• Quality filters are classifiers that assign scores to each doc.
• Need to remove unwanted material such as Personal
Identifiable Information (PII) and adult content.
• Deduplication at many levels (URLs, documents, even
lines)
• Quality filtering usually improve LM performance.
• Safety is also subjective.
• Toxicity detection is important, although that has mixed
results.
• Can mistakenly flag data written in dialects like African
American English
• LMs trained on toxicity-filtered content fail to detect toxicity.
39

---

## Slide / Page 40

Problems with scraping from the web
• Copyright: much of the text in these datasets is
copyrighted (e.g. fiction and non-fiction books)
 Not clear if fair use doctrine in US allows for this use.
(copyrighted content to be used for transformative uses.)
 Open legal question: LMs used to generate text competing
with the market for text they are trained on.
• Data consent
• Website owners can indicate they don't want their site
crawled. (Recently, increase in such websites.)
• Privacy:
• Websites can contain private IP addresses and phones.
• Filters usually try to filter sites with lots of private data.
40

---

## Slide / Page 41

Finetuning

---

## Slide / Page 42

Finetuning
• What happens if we need our LLM to work well
on a domain it didn't see in pretraining?
• Perhaps some specific medical or legal domain or
task?
• Or maybe a multilingual LM needs to see more
data on some language that was rare in
pretraining?
• We can simply continue training the model on
relevant data from the new domain or language.
• Finetuning: process of taking a fully pretrained
model and running additional training passes on
some new data. 42

---

## Slide / Page 43

Finetuning
Fine-
tuning
Data
Pretraining Data
Pretraining
…
…
…
Fine-tuning
…
…
…
Pretrained LM Fine-tuned LM
43
• We will cover 4 types of “Finetuning”, 2 in this chapter,
and 2 in the next two chapters.
• Often everything that happens after pretraining is lumped
together as post-training.

---

## Slide / Page 44

1. Finetuning as "continued
pretraining" on new data
• Further train all the parameters of the model on
new data
• using the same method (word prediction) and
loss function (cross-entropy loss) as for
pretraining,
• as if the new data were at the tail end of the
pretraining data.
• Hence sometimes called continued pretraining.
44

---

## Slide / Page 45

Accessing the parameters of pretrained LM
• To fine-tune a model like GPT-3 or BERT,
need to access the pre-trained model weights.
• Hugging Face Transformers Library: one of
the most common and convenient ways to
access pre-trained models like BERT, GPT-2, …
• Hugging Face provides APIs that allow one to
load pre-trained models directly and then fine-
tune them on new data.
• The library takes care of handling the model's
weights and the fine-tuning process.
45

---

## Slide / Page 46

e.g. for BERT
from transformers import BertForSequenceClassification,
BertTokenizer
model_name = "bert-base-uncased" # Pre-trained BERT model
model =
BertForSequenceClassification.from_pretrained(model_name)
Tokenizer = BertTokenizer.from_pretrained(model_name)
• This gives access to the model's parameters (weights) that can be
fine-tuned.
• The new data having been processed, loaded and split, one can have:
# Fine-tune the model
model.fit(train_dataset_tf, validation_data =
eval_dataset_tf, epochs=epochs)
# Save the fine-tuned model & the tokenizer’s configuration
model.save_pretrained("./fine_tuned_model")
tokenizer.save_pretrained("path_to_save_tokenizer") 46

---

## Slide / Page 47

Evaluating Large Language Models

---

## Slide / Page 48

Perplexity
• Just as for n-gram grammars, we use perplexity to
measure how well the LM predicts unseen text
• The perplexity of a model θ on an unseen test set
is the inverse probability that θ assigns to the
test set, normalized by the test set length.
• For a test set of n tokens w1:n the perplexity is :
48

---

## Slide / Page 49

Perplexity
• The higher the probability of the word
sequence, the lower the perplexity.
• Thus the lower the perplexity of a model on
the data, the better the model.
• Minimizing perplexity is the same as
maximizing probability
• Also: perplexity is sensitive to length /
tokenization so best used when comparing
LMs that use the same tokenizer.
49

---

## Slide / Page 50

Other factors for evaluation
• Perplexity, is a very useful metric, but other kinds of
accuracy metrics, for the downstream tasks (e.g. MT,
summarization, QA, speech recognition, and dialogue) we
apply our language model to will be presented.
• Other factors for evaluation:
 Size: Big models take lots of GPUs and time to train,
memory to store.
 Energy usage: Can measure kWh or kilograms of
CO2 emitted.
 Fairness: Benchmarks measure gendered and racial
stereotypes, or decreased performance for language
from or about some groups. 50

---

## Slide / Page 51

Dealing with Scale

---

## Slide / Page 52

Scaling Laws
• LLM performance depends mainly on 3 factors:
1. Model size: the number of parameters not
counting embeddings
• Llama 3.1 405B Instruct model from Meta: 405 billion
parameters (126 layers, embedding dimension of 16,384,
128 attention heads) and trained on over 15 trillion tokens
using a vocabulary of 128K tokens.
• GPT-4o: estimated by many at 1.76 trillion parameters,
context window 128K tokens, max output 16,384
tokens.
• GPT-3: 175 billion parameters; embedding dimension of
12,288.
52

---

## Slide / Page 53

Scaling Laws
2. Dataset size: the amount of training data
• Llama 3.1 405B trained on over 15 trillion tokens.
• GPT-4 trained on 13 trillion tokens.
3. Compute: amount of compute (e.g. in FLOPS):
typically in the order of exaflops during training
(1 exaflop = 1018 FLOPS).
• A model can be improved  by adding  parameters (more
layers, wider contexts), more data, or training for more
iterations.
• The performance of a large language model (the loss)
scales as a power-law with each of these three.
53

---

## Slide / Page 54

Scaling Laws
• Loss L as a function of the
number of non-embedding
parameters N, dataset size D,
compute budget C (if the
other two are held constant).
54
• The values of Nc, Dc, Cc, αN, αD and αC depend on the exact
transformer architecture, tokenization, and vocabulary size.
• For the initial experiment in Kaplan et al. (2020)  αN = 0.076,
Nc = 8.8 1013 (parameters), αD = 0.095, Dc = 5.4 1013 (tokens),
αC = 0.050, Cc = 3.1 108 (petaflop-days).
• A petaflop-day represents the total number of floating-point
operations performed by a system that can compute 1 petaflop
(1015 operations per second) over the course of one day (86,400
seconds).

---

## Slide / Page 55

Estimating Number of
Non-Embedding parameters N
• N can be roughly computed as follows (ignoring biases):
where d: input and output dimensionality of the model,
dattn : self-attention layer size,
dff :  size of the feedforward layer.
• Thus GPT-3, with n = 96 layers and dimensionality
d = 12288, has 12 × 96 × 122882 ≈ 175 billion parameters.
• Scaling laws can be used early in training to predict what the
loss would be if we were to add more data or increase model
size. 55

---

## Slide / Page 56

Parameter-Efficient Finetuning
• Adapting to a new domain by continued pretraining
(finetuning) is a problem with huge LLMs.
• Enormous numbers of parameters to train
• Each pass of batch gradient descent has to backpropagate
through many many huge layers.
• Expensive in processing power, in memory, and in time.
• Instead, parameter-efficient fine tuning (PEFT)
• Efficiently select a subset of parameters to update when
finetuning. E.g.
• freeze some of the parameters (don’t change them),
• and only update some particular subset of parameters.
56

---

## Slide / Page 57

LoRA (Low-Rank Adaptation)
• Intuition: Transformers have many dense matrix
layers that are used in multiplications
• Like WQ, WK, WV, WO layers in attention
• Instead of updating these layers during finetuning,
• Freeze these layers
• Update a low-rank approximation with fewer
parameters.
• So LoRA provides an approach to adapting large
models while significantly reducing the computational
cost and memory footprint.
57

---

## Slide / Page 58

LoRA
• Consider a matrix W (shape [d × dk])  that needs to be updated
during finetuning via gradient descent.
• Normally, after Gradient Descent, W gets updates ∆W  (of
shape [d × dk])
• In LoRA, W is frozen and, instead, a low-rank decomposition of
W is updated (through training):
• A of shape [d × r],
• B of shape [r × dk],    where r very small   (e.g. 1, 2, 4, 8, 16)
• So, during  finetuning, we update A and B instead of W.
• Replace W + ∆W with W + B A.
• In forward pass, instead of h = x W, we do   h = x W + x A B
• So LoRA introduces low-rank matrices that are trained, while the
original pre-trained weight matrices remain frozen.
58

---

## Slide / Page 59

LoRA
59

---

## Slide / Page 60

Example
• Suppose dmodel ​= 512, dk = 64, dv = 64, and Rank r = 8
• Original matrices:
 WQ​: (512,64)
 WK: (512,64)
 WV:( 512,64)
• For queries, the low-rank adaptation matrices would be:
 AQ​: (512 , 8)
 BQ​:  (8, 64)
• In LoRA, for the query, instead of learning the entire WQ (of size
512 x 64, i.e. 32,768 parameters), we only need to update the
smaller matrices AQ ​ and BQ ​, with a total of
512 × 8 + 8 × 64 = 4,096 + 512 = 4,608 parameters.
• The same goes for WK and WV
60

---

## Slide / Page 61

Harms of Large Language Models

---

## Slide / Page 62

Hallucination
62
• Back to this issue in Chapter 14 where we introduce
proposed mitigation methods like Retrieval
Augmented Generation.

---

## Slide / Page 63

Toxicity and Abuse
63
• Toxic language even with completely non-toxic
prompts.
• Generation of stereotypes and negative attitudes about
various demographic groups.
• LLM developers are much more careful about their
models.

---

## Slide / Page 64

Bias
• Training data disproportionately generated by
authors from the US and from developed
countries.
• Language models can amplify demographic
and other biases in training data.
• Gender bias (based on the available data sets).
• Bias against ethnic groups.
64

---

## Slide / Page 65

Privacy
65
• LLMs can leak information from their training data
 an adversary can extract training-data text from a
LM such as a person’s name, phone number, and
address
• Even more serious a problem when the LLM is
trained on extremely sensitive private datasets such
as electronic health records.

---

## Slide / Page 66

Copyright
66
Feb 13, 2024 (Reuters) – “A federal judge in California has dismissed parts
of a copyright lawsuit brought by comedian Sarah Silverman, Michael
Chabon, Ta-Nehisi Coates and other authors against OpenAI over its alleged
use of their books to train the large language model underlying its popular
chatbot ChatGPT… OpenAI, Microsoft and other companies have said that
their AI training is protected by the copyright doctrine of fair use and that
the lawsuits threaten the burgeoning AI industry.”

---

## Slide / Page 67

Misinformation
67
• LLMs can be used by malicious actors for
generating text for
• misinformation,
• phishing, or
• other socially harmful activities (extremist
propaganda, etc.)

---

## Slide / Page 68

Textbook
Jurafsky, D. and Martin, J.H. (2024) Speech and Language
Processing: An Introduction to Natural Language Processing,
Computational Linguistics, and Speech Recognition with
Language Models (3rd ed. draft), Prentice Hall.
https://web.stanford.edu/~jurafsky/slp3/ed3bookaug20_2024.pdf
68
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

