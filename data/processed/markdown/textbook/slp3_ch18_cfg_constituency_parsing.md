# SLP3 Chapter 18: Context-Free Grammars and Constituency Parsing (CKY Algorithm)

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 432–455

---

### Page 432

424CHAPTER18 • SEQUENCELABELING FORPARTS OFSPEECH ANDNAMEDENTITIES
5. . . . I am sitting in Mindy’s restaurant putting on the gefillte fish, which is
a dish I am very fond of, . . .
6. When a guy and a doll get to taking peeks back and forth at each other,
why there you are indeed.
18.3Now compare your tags from the previous exercise with one or two friend’s
answers. On which words did you disagree the most? Why?
18.4Implement the “most likely tag” baseline. Find a POS-tagged training set,
and use it to compute for each word the tag that maximizesp(t|w). You will
need to implement a simple tokenizer to deal with sentence boundaries. Start
by assuming that all unknown words are NN and compute your error rate on
known and unknown words. Now write at least five rules to do a better job of
tagging unknown words, and show the difference in error rates.
18.5Build a bigram HMM tagger. You will need a part-of-speech-tagged corpus.
First split the corpus into a training set and test set. From the labeled training
set, train the transition and observation probabilities of the HMM tagger di-
rectly on the hand-tagged data. Then implement the Viterbi algorithm so you
can decode a test sentence. Now run your algorithm on the test set. Report its
error rate and compare its performance to the most frequent tag baseline.
18.6Do an error analysis of your tagger. Build a confusion matrix and investigate
the most frequent errors. Propose some features for improving the perfor-
mance of your tagger on these errors.
18.7Develop a set of regular expressions to recognize the character shape features
described on page 416.
18.8The BIO and other labeling schemes given in this chapter aren’t the only
possible one. For example, theBtag can be reserved only for those situations
where an ambiguity exists between adjacent entities. Propose a new set of
BIOtags for use with your NER system. Experiment with it and compare its
performance with the schemes presented in this chapter.
18.9Names of works of art (books, movies, video games, etc.) are quite different
from the kinds of named entities we’ve discussed in this chapter. Collect a
list of names of works of art from a particular category from a Web-based
source (e.g., gutenberg.org, amazon.com, imdb.com, etc.). Analyze your list
and give examples of ways that the names in it are likely to be problematic for
the techniques described in this chapter.
18.10Develop an NER system specific to the category of names that you collected
in the last exercise. Evaluate your system on a collection of text likely to
contain instances of these named entities.

---

### Page 433

CHAPTER
19
Context-Free Grammars and
Constituency Parsing
Because the Nightby Bruce Springsteen and Patti Smith
The Fire Next Timeby James Baldwin
If on a winter’s night a travelerby Italo Calvino
Love Actuallyby Richard Curtis
Suddenly Last Summerby Tennessee Williams
A Scanner Darklyby Philip K. Dick
Six titles that are not constituents, from Geoffrey K. Pullum on
Language Log (who was pointing out their incredible rarity).
One morning I shot an elephant in my pajamas.
How he got into my pajamas I don’t know.
Groucho Marx,Animal Crackers, 1930
The study of grammar has an ancient pedigree. The grammar of Sanskrit was
described by the Indian grammarian P ¯an. ini sometime between the 7th and 4th cen-
turies BCE, in his famous treatise the As.t.¯adhy¯ay¯ı (‘8 books’). And our wordsyntaxsyntax
comes from the Greeks ´yntaxis, meaning “setting out together or arrangement”, and
refers to the way words are arranged together. We have seen syntactic notions in pre-
vious chapters like the use of part-of-speech categories (Chapter 18). In this chapter
and the next one we introduce formal models for capturing more sophisticated no-
tions of grammatical structure and algorithms for parsing these structures.
Our focus in this chapter iscontext-free grammarsand theCKY algorithm
for parsing them. Context-free grammars are the backbone of many formal mod-
els of the syntax of natural language (and, for that matter, of computer languages).
Syntactic parsing is the task of assigning a syntactic structure to a sentence. Parse
trees (whether for context-free grammars or for the dependency or CCG formalisms
we introduce in following chapters) can be used in applications such asgrammar
checking: sentence that cannot be parsed may have grammatical errors (or at least
be hard to read). Parse trees can be an intermediate stage of representation forfor-
mal semantic analysis. And parsers and the grammatical structure they assign a
sentence are a useful text analysis tool for text data science applications that require
modeling the relationship of elements in sentences.
In this chapter we introduce context-free grammars, give a small sample gram-
mar of English, introduce more formal definitions of context-free grammars and
grammar normal form, and talk abouttreebanks: corpora that have been anno-
tated with syntactic structure. We then discuss parse ambiguity and the problems
it presents, and turn to parsing itself, giving the famous Cocke-Kasami-Younger
(CKY) algorithm (Kasami 1965, Younger 1967), the standard dynamic program-
ming approach to syntactic parsing. The CKY algorithm returns an efficient repre-
sentation of the set of parse trees for a sentence, but doesn’t tell uswhichparse tree
is the right one. For that, we need to augment CKY with scores for each possible
constituent. We’ll see how to do this with neural span-based parsers. Finally, we’ll
introduce the standard set of metrics for evaluating parser accuracy.

---

### Page 434

426CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
19.1 Constituency
Syntactic constituency is the idea that groups of words can behave as single units,
or constituents. Part of developing a grammar involves building an inventory of the
constituents in the language. How do words group together in English? Consider
thenoun phrase, a sequence of words surrounding at least one noun. Here are somenoun phrase
examples of noun phrases (thanks to Damon Runyon):
Harry the Horse a high-class spot such as Mindy’s
the Broadway coppers the reason he comes into the Hot Box
they three parties from Brooklyn
What evidence do we have that these words group together (or “form constituents”)?
One piece of evidence is that they can all appear in similar syntactic environments,
for example, before a verb.
three parties from Brooklynarrive. . .
a high-class spot such as Mindy’sattracts. . .
the Broadway copperslove. . .
theysit
But while the whole noun phrase can occur before a verb, this is not true of each
of the individual words that make up a noun phrase. The following are not grammat-
ical sentences of English (recall that we use an asterisk (*) to mark fragments that
are not grammatical English sentences):
*fromarrive. . . *asattracts. . .
*theis. . . *spotsat. . .
Thus, to correctly describe facts about the ordering of these words in English, we
must be able to say things like “Noun Phrases can occur before verbs”. Let’s now
see how to do this in a more formal way!
19.2 Context-Free Grammars
A widely used formal system for modeling constituent structure in natural lan-
guage is thecontext-free grammar, orCFG. Context-free grammars are also calledCFG
phrase-structure grammars, and the formalism is equivalent toBackus-Naur form,
orBNF. The idea of basing a grammar on constituent structure dates back to the psy-
chologist Wilhelm Wundt (1900) but was not formalized until Chomsky (1956) and,
independently, Backus (1959).
A context-free grammar consists of a set ofrulesorproductions, each of whichrules
expresses the ways that symbols of the language can be grouped and ordered to-
gether, and alexiconof words and symbols. For example, the following productionslexicon
express that anNP(ornoun phrase) can be composed of either aProperNounorNP
a determiner (Det) followed by aNominal; aNominalin turn can consist of one or

---

### Page 435

19.2 • CONTEXT-FREEGRAMMARS427
moreNouns. 1
NP→Det Nominal
NP→ProperNoun
Nominal→Noun|Nominal Noun
Context-free rules can be hierarchically embedded, so we can combine the previous
rules with others, like the following, that express facts about the lexicon:
Det→a
Det→the
Noun→flight
The symbols that are used in a CFG are divided into two classes. The symbols
that correspond to words in the language (“the”, “nightclub”) are calledterminalterminal
symbols; the lexicon is the set of rules that introduce these terminal symbols. The
symbols that express abstractions over these terminals are callednon-terminals. Innon-terminal
each context-free rule, the item to the right of the arrow (→) is an ordered list of one
or more terminals and non-terminals; to the left of the arrow is a single non-terminal
symbol expressing some cluster or generalization. The non-terminal associated with
each word in the lexicon is its lexical category, or part of speech.
A CFG can be thought of in two ways: as a device for generating sentences
and as a device for assigning a structure to a given sentence. Viewing a CFG as a
generator, we can read the→arrow as “rewrite the symbol on the left with the string
of symbols on the right”.
So starting from the symbol:NP
we can use our first rule to rewriteNPas:Det Nominal
and then rewriteNominalas:Noun
and finally rewrite these parts-of-speech as:a flight
We say the stringa flightcan be derived from the non-terminalNP. Thus, a CFG
can be used to generate a set of strings. This sequence of rule expansions is called a
derivationof the string of words. It is common to represent a derivation by aparsederivation
tree(commonly shown inverted with the root at the top). Figure 19.1 shows the treeparse tree
representation of this derivation.
NP
Nom
Noun
flight
Det
a
Figure 19.1A parse tree for “a flight”.
In the parse tree shown in Fig. 19.1, we can say that the nodeNPdominatesdominates
all the nodes in the tree (Det,Nom,Noun,a,flight). We can say further that it
immediately dominates the nodesDetandNom.
The formal language defined by a CFG is the set of strings that are derivable
from the designatedstart symbol. Each grammar must have one designated startstart symbol
1 When talking about these rules we can pronounce the rightarrow→as “goes to”, and so we might
read the first rule above as “NP goes to Det Nominal”.

---

### Page 436

428CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
symbol, which is often calledS. Since context-free grammars are often used to define
sentences,Sis usually interpreted as the “sentence” node, and the set of strings that
are derivable fromSis the set of sentences in some simplified version of English.
Let’s add a few additional rules to our inventory. The following rule expresses
the fact that a sentence can consist of a noun phrase followed by averb phrase:verb phrase
S→NP VPI prefer a morning flight
A verb phrase in English consists of a verb followed by assorted other things;
for example, one kind of verb phrase consists of a verb followed by a noun phrase:
VP→Verb NPprefer a morning flight
Or the verb may be followed by a noun phrase and a prepositional phrase:
VP→Verb NP PPleave Boston in the morning
Or the verb phrase may have a verb followed by a prepositional phrase alone:
VP→Verb PPleaving on Thursday
A prepositional phrase generally has a preposition followed by a noun phrase.
For example, a common type of prepositional phrase in the ATIS corpus is used to
indicate location or direction:
PP→Preposition NPfrom Los Angeles
TheNPinside aPPneed not be a location;PPsare often used with times and
dates, and with other nouns as well; they can be arbitrarily complex. Here are ten
examples from the ATIS corpus:
to Seattle on these flights
in Minneapolis about the ground transportation in Chicago
on Wednesday of the round trip flight on United Airlines
in the evening of the AP fifty seven flight
on the ninth of July with a stopover in Nashville
Figure 19.2 gives a sample lexicon, and Fig. 19.3 summarizes the grammar rules
we’ve seen so far, which we’ll callL 0. Note that we can use the or-symbol|to
indicate that a non-terminal has alternate possible expansions.
Noun→flights|flight|breeze|trip|morning
Verb→is|prefer|like|need|want|fly|do
Adjective→cheapest|non-stop|first|latest
|other|direct
Pronoun→me|I|you|it
Proper-Noun→Alaska|Baltimore|Los Angeles
|Chicago|United|American
Determiner→the|a|an|this|these|that
Preposition→from|to|on|near|in
Conjunction→and|or|but
Figure 19.2The lexicon forL 0.
We can use this grammar to generate sentences of this “ATIS-language”. We
start withS, expand it toNP VP, then choose a random expansion ofNP(let’s say, to

---

### Page 437

19.2 • CONTEXT-FREEGRAMMARS429
Grammar Rules Examples
S→NP VPI + want a morning flight
NP→PronounI
|Proper-NounLos Angeles
|Det Nominala + flight
Nominal→Nominal Nounmorning + flight
|Nounflights
VP→Verbdo
|Verb NPwant + a flight
|Verb NP PPleave + Boston + in the morning
|Verb PPleaving + on Thursday
PP→Preposition NPfrom + Los Angeles
Figure 19.3The grammar forL 0, with example phrases for each rule.
S
VP
NP
Nom
Noun
flight
Nom
Noun
morning
Det
a
Verb
prefer
NP
Pro
I
Figure 19.4The parse tree for “I prefer a morning flight” according to grammarL 0.
I), and a random expansion ofVP(let’s say, toVerb NP), and so on until we generate
the stringI prefer a morning flight. Figure 19.4 shows a parse tree that represents a
complete derivation ofI prefer a morning flight.
We can also represent a parse tree in a more compact format calledbracketed
notation; here is the bracketed representation of the parse tree of Fig. 19.4:bracketednotation
(19.1) [ S [NP [Pro I]] [VP [V prefer] [NP [Det a] [Nom [Nom [N morning]] [N flight]]]]]]
A CFG like that ofL 0 defines a formal language. Sentences (strings of words)
that can be derived by a grammar are in the formal language defined by that gram-
mar, and are calledgrammaticalsentences. Sentences that cannot be derived bygrammatical
a given formal grammar are not in the language defined by that grammar and are
referred to asungrammatical. This hard line between “in” and “out” characterizesungrammatical
all formal languages but is only a very simplified model of how natural languages
really work. This is because determining whether a given sentence is part of a given
natural language (say, English) often depends on the context. In linguistics, the use
of formal languages to model natural languages is calledgenerative grammarsincegenerativegrammar
the language is defined by the set of possible sentences “generated” by the grammar.
(Note that this is a different sense of the word ‘generate’ than when we talk about

---

### Page 438

430CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
language models generating text.)
19.2.1 Formal Definition of Context-Free Grammar
We conclude this section with a quick, formal description of a context-free gram-
mar and the language it generates. A context-free grammarGis defined by four
parameters:N,Σ,R,S(technically it is a “4-tuple”).
N a set ofnon-terminal symbols(orvariables)
Σ a set ofterminal symbols(disjoint fromN)
R a set ofrulesor productions, each of the formA→β,
whereAis a non-terminal,
βis a string of symbols from the infinite set of strings(Σ∪N) ∗
S a designatedstart symboland a member ofN
For the remainder of the book we adhere to the following conventions when dis-
cussing the formal properties of context-free grammars (as opposed to explaining
particular facts about English or other languages).
Capital letters likeA,B, andS Non-terminals
S The start symbol
Lower-case Greek letters likeα,β, andγ Strings drawn from(Σ∪N) ∗
Lower-case Roman letters likeu,v, andw Strings of terminals
A language is defined through the concept of derivation. One string derives an-
other one if it can be rewritten as the second one by some series of rule applications.
More formally, following Hopcroft and Ullman (1979),
ifA→βis a production ofRandαandγare any strings in the set
(Σ∪N) ∗, then we say thatαAγdirectly derivesαβ γ, orαAγ⇒αβ γ.directly derives
Derivation is then a generalization of direct derivation:
Letα 1,α 2, . . . ,αm be strings in(Σ∪N) ∗,m≥1, such that
α1 ⇒α 2,α 2 ⇒α 3, . . . ,αm−1 ⇒α m
We say thatα 1 derivesα m, orα 1 ∗⇒α m.derives
We can then formally define the languageL G generated by a grammarGas the
set of strings composed of terminal symbols that can be derived from the designated
start symbolS.
LG ={w|wis inΣ ∗ andS ∗⇒w}
The problem of mapping from a string of words to its parse tree is calledsyn-
tactic parsing, as we’ll see in Section 19.6.syntacticparsing
19.3 Treebanks
A corpus in which every sentence is annotated with a parse tree is called atreebank.treebank

---

### Page 439

19.3 • TREEBANKS431
Treebanks play an important role in parsing as well as in linguistic investigations of
syntactic phenomena.
Treebanks are generally made by running a parser over each sentence and then
having the resulting parse hand-corrected by human linguists. Figure 19.5 shows
sentences from thePenn Treebankproject, which includes various treebanks inPenn Treebank
English, Arabic, and Chinese. The Penn Treebank part-of-speech tagset was defined
in Chapter 18, but we’ll see minor formatting differences across treebanks. The use
of LISP-style parenthesized notation for trees is extremely common and resembles
the bracketed notation we saw earlier in (19.1). For those who are not familiar with
it we show a standard node-and-line tree representation in Fig. 19.6.
((S
(NP-SBJ (DT That)
(JJ cold) (, ,)
(JJ empty) (NN sky) )
(VP (VBD was)
(ADJP-PRD (JJ full)
(PP (IN of)
(NP (NN fire)
(CC and)
(NN light) ))))
(. .) ))
((S
(NP-SBJ The/DT flight/NN )
(VP should/MD
(VP arrive/VB
(PP-TMP at/IN
(NP eleven/CD a.m/RB ))
(NP-TMP tomorrow/NN )))))
(a) (b)
Figure 19.5Parses from the LDC Treebank3 for (a) Brown and (b) ATIS sentences.
S
.
.
VP
ADJP-PRD
PP
NP
NN
light
CC
and
NN
fire
IN
of
JJ
full
VBD
was
NP-SBJ
NN
sky
JJ
empty
,
,
JJ
cold
DT
That
Figure 19.6The tree corresponding to the Brown corpus sentence in the previous figure.
The sentences in a treebank implicitly constitute a grammar of the language. For
example, from the parsed sentences in Fig. 19.5 we can extract the CFG rules shown
in Fig. 19.7 (with rule suffixes (-SBJ) stripped for simplicity). The grammar used
to parse the Penn Treebank is very flat, resulting in very many rules. For example,

---

### Page 440

432CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
Grammar Lexicon
S→NP VP . DT→the|that
S→NP VP JJ→cold|empty|full
NP→CD RB NN→sky|fire|light|flight|tomorrow
NP→DT NN CC→and
NP→NN CC NN IN→of|at
NP→DT JJ , JJ NN CD→eleven
NP→NN RB→a.m.
VP→MD VP VB→arrive
VP→VBD ADJP VBD→was|said
VP→MD VP MD→should|would
VP→VB PP NP
ADJP→JJ PP
PP→IN NP
Figure 19.7CFG grammar rules and lexicon from the treebank sentences in Fig. 19.5.
among the approximately 4,500 different rules for expanding VPs are separate rules
for PP sequences of any length and every possible arrangement of verb arguments:
VP→VBD PP
VP→VBD PP PP
VP→VBD PP PP PP
VP→VBD PP PP PP PP
VP→VB ADVP PP
VP→VB PP ADVP
VP→ADVP VB PP
19.4 Grammar Equivalence and Normal Form
A formal language is defined as a (possibly infinite) set of strings of words. This sug-
gests that we could ask if two grammars are equivalent by asking if they generate the
same set of strings. In fact, it is possible to have two distinct context-free grammars
generate the same language. We say that two grammars arestrongly equivalentifstronglyequivalent
they generate the same set of stringsandif they assign the same phrase structure
to each sentence (allowing merely for renaming of the non-terminal symbols). Two
grammars areweakly equivalentif they generate the same set of strings but do notweaklyequivalent
assign the same phrase structure to each sentence.
It is sometimes useful to have anormal formfor grammars, in which each ofnormal form
the productions takes a particular form. For example, a context-free grammar is in
Chomsky normal form(CNF) (Chomsky, 1963) if it isϵ-free and if in additionChomskynormal form
each production is either of the formA→B CorA→a. That is, the right-hand side
of each rule either has two non-terminal symbols or one terminal symbol. Chomsky
normal form grammars arebinary branching, that is they have binary trees (downbinarybranching
to the prelexical nodes). We make use of this binary branching property in the CKY
parsing algorithm in Section 19.6.
Any context-free grammar can be converted into a weakly equivalent Chomsky
normal form grammar. For example, a rule of the form
A→B C D
can be converted into the following two CNF rules (Exercise 19.1 asks the reader to

---

### Page 441

19.5 • AMBIGUITY433
Grammar Lexicon
S→NP VP Det→that|this|the|a
S→Aux NP VP Noun→book|flight|meal|money
S→VP Verb→book|include|prefer
NP→Pronoun Pronoun→I|she|me
NP→Proper-Noun Proper-Noun→Houston|United
NP→Det Nominal Aux→does
Nominal→Noun Preposition→from|to|on|near|through
Nominal→Nominal Noun
Nominal→Nominal PP
VP→Verb
VP→Verb NP
VP→Verb NP PP
VP→Verb PP
VP→VP PP
PP→Preposition NP
Figure 19.8TheL 1 miniature English grammar and lexicon.
formulate the complete algorithm):
A→B X
X→C D
Sometimes using binary branching can actually produce smaller grammars. For
example, the sentences that might be characterized as
VP -> VBD NP PP*
are represented in the Penn Treebank by this series of rules:
VP→VBD NP PP
VP→VBD NP PP PP
VP→VBD NP PP PP PP
VP→VBD NP PP PP PP PP
...
but could also be generated by the following two-rule grammar:
VP→VBD NP PP
VP→VP PP
The generation of a symbol A with a potentially infinite sequence of symbols B with
a rule of the formA→A Bis known asChomsky-adjunction.Chomsky-adjunction
19.5 Ambiguity
Ambiguity is the most serious problem faced by syntactic parsers. Chapter 18 intro-
duced the notions ofpart-of-speech ambiguityandpart-of-speech disambigua-
tion. Here, we introduce a new kind of ambiguity, calledstructural ambiguity,structuralambiguity
illustrated with a new toy grammarL 1, shown in Figure 19.8, which adds a few
rules to theL 0 grammar.
Structural ambiguity occurs when the grammar can assign more than one parse
to a sentence. Groucho Marx’s well-known line as Captain Spaulding inAnimal

---

### Page 442

434CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
S
VP
NP
Nominal
PP
in my pajamas
Nominal
Noun
elephant
Det
an
Verb
shot
NP
Pronoun
I
S
VP
PP
in my pajamas
VP
NP
Nominal
Noun
elephant
Det
an
Verb
shot
NP
Pronoun
I
Figure 19.9Two parse trees for an ambiguous sentence. The parse on the left corresponds to the humorous
reading in which the elephant is in the pajamas, the parse on the right corresponds to the reading in which
Captain Spaulding did the shooting in his pajamas.
Crackersis ambiguous because the phrasein my pajamascan be part of theNP
headed byelephantor a part of the verb phrase headed byshot. Figure 19.9 illus-
trates these two analyses of Marx’s line using rules fromL 1.
Structural ambiguity, appropriately enough, comes in many forms. Two common
kinds of ambiguity areattachment ambiguityandcoordination ambiguity. A
sentence has anattachment ambiguityif a particular constituent can be attached toattachmentambiguity
the parse tree at more than one place. The Groucho Marx sentence is an example
ofPP-attachment ambiguity: the preposition phrase can be attached either as partPP-attachmentambiguity
of the NP or as part of the VP. Various kinds of adverbial phrases are also subject
to this kind of ambiguity. For instance, in the following example the gerundive-VP
flying to Pariscan be part of a gerundive sentence whose subject isthe Eiffel Tower
or it can be an adjunct modifying the VP headed bysaw:
(19.2) We saw the Eiffel Tower flying to Paris.
Incoordination ambiguityphrases can be conjoined by a conjunction likeand.coordinationambiguity
For example, the phraseold men and womencan be bracketed as[old [men and
women]], referring toold menandold women, or as[old men] and [women], in
which case it is only the men who are old. These ambiguities combine in complex
ways in real sentences, like the following news sentence from the Brown corpus:
(19.3) President Kennedy today pushed aside other White House business to
devote all his time and attention to working on the Berlin crisis address he
will deliver tomorrow night to the American people over nationwide
television and radio.
This sentence has a number of ambiguities, although since they are semantically
unreasonable, it requires a careful reading to see them. The last noun phrase could be
parsed[nationwide [television and radio]]or[[nationwide television] and radio].
The direct object ofpushed asideshould beother White House businessbut could
also be the bizarre phrase[other White House business to devote all his time and
attention to working](i.e., a structure likeKennedy affirmed [his intention to propose
a new budget to address the deficit]). Then the phraseon the Berlin crisis address he

---

### Page 443

19.6 • CKY PARSING: A DYNAMICPROGRAMMINGAPPROACH435
will deliver tomorrow night to the American peoplecould be an adjunct modifying
the verbpushed. APPlikeover nationwide television and radiocould be attached
to any of the higherVPs orNPs (e.g., it could modifypeopleornight).
The fact that there are many grammatically correct but semantically unreason-
able parses for naturally occurring sentences is an irksome problem that affects all
parsers. Fortunately, the CKY algorithm below is designed to efficiently handle
structural ambiguities. And as we’ll see in the following section, we can augment
CKY with neural methods to choose a single correct parse bysyntactic disambigua-
tion.syntacticdisambiguation
19.6 CKY Parsing: A Dynamic Programming Approach
Dynamic programmingprovides a powerful framework for addressing the prob-
lems caused by ambiguity in grammars. Recall that a dynamic programming ap-
proach systematically fills in a table of solutions to subproblems. The complete
table has the solution to all the subproblems needed to solve the problem as a whole.
In the case of syntactic parsing, these subproblems represent parse trees for all the
constituents detected in the input.
The dynamic programming advantage arises from the context-free nature of our
grammar rules—once a constituent has been discovered in a segment of the input we
can record its presence and make it available for use in any subsequent derivation
that might require it. This provides both time and storage efficiencies since subtrees
can be looked up in a table, not reanalyzed. This section presents the Cocke-Kasami-
Younger (CKY) algorithm, the most widely used dynamic-programming based ap-
proach to parsing.Chart parsing(Kaplan 1973, Kay 1982) is a related approach,
and dynamic programming methods are often referred to aschart parsingmethods.chart parsing
19.6.1 Conversion to Chomsky Normal Form
The CKY algorithm requires grammars to first be in Chomsky Normal Form (CNF).
Recall from Section 19.4 that grammars in CNF are restricted to rules of the form
A→B CorA→w. That is, the right-hand side of each rule must expand either to
two non-terminals or to a single terminal. Restricting a grammar to CNF does not
lead to any loss in expressiveness, since any context-free grammar can be converted
into a corresponding CNF grammar that accepts exactly the same set of strings as
the original grammar.
Let’s start with the process of converting a generic CFG into one represented in
CNF. Assuming we’re dealing with anϵ-free grammar, there are three situations we
need to address in any generic grammar: rules that mix terminals with non-terminals
on the right-hand side, rules that have a single non-terminal on the right-hand side,
and rules in which the length of the right-hand side is greater than 2.
The remedy for rules that mix terminals and non-terminals is to simply introduce
a new dummy non-terminal that covers only the original terminal. For example, a
rule for an infinitive verb phrase such asINF-VP→to VPwould be replaced by the
two rulesINF-VP→TO VPandTO→to.
Rules with a single non-terminal on the right are calledunit productions. WeUnitproductions
can eliminate unit productions by rewriting the right-hand side of the original rules
with the right-hand side of all the non-unit production rules that they ultimately lead
to. More formally, ifA ∗⇒Bby a chain of one or more unit productions andB→γ

---

### Page 444

436CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
is a non-unit production in our grammar, then we addA→γfor each such rule in
the grammar and discard all the intervening unit productions. As we demonstrate
with our toy grammar, this can lead to a substantialflatteningof the grammar and a
consequent promotion of terminals to fairly high levels in the resulting trees.
Rules with right-hand sides longer than 2 are normalized through the introduc-
tion of new non-terminals that spread the longer sequences over several new rules.
Formally, if we have a rule like
A→B Cγ
we replace the leftmost pair of non-terminals with a new non-terminal and introduce
a new production, resulting in the following new rules:
A→X1γ
X1→B C
In the case of longer right-hand sides, we simply iterate this process until the of-
fending rule has been replaced by rules of length 2. The choice of replacing the
leftmost pair of non-terminals is purely arbitrary; any systematic scheme that results
in binary rules would suffice.
In our current grammar, the ruleS→Aux NP VPwould be replaced by the two
rulesS→X1 VPandX1→Aux NP.
The entire conversion process can be summarized as follows:
1. Copy all conforming rules to the new grammar unchanged.
2. Convert terminals within rules to dummy non-terminals.
3. Convert unit productions.
4. Make all rules binary and add them to new grammar.
Figure 19.10 shows the results of applying this entire conversion procedure to
theL 1 grammar introduced earlier on page 433. Note that this figure doesn’t show
the original lexical rules; since these original lexical rules are already in CNF, they
all carry over unchanged to the new grammar. Figure 19.10 does, however, show
the various places where the process of eliminating unit productions has, in effect,
created new lexical rules. For example, all the original verbs have been promoted to
bothVPs and toSs in the converted grammar.
19.6.2 CKY Recognition
With our grammar now in CNF, each non-terminal node above the part-of-speech
level in a parse tree will have exactly two daughters. A two-dimensional matrix can
be used to encode the structure of an entire tree. For a sentence of lengthn, we will
work with the upper-triangular portion of an(n+1)×(n+1)matrix. Each cell[i,j]
in this matrix contains the set of non-terminals that represent all the constituents that
span positionsithroughjof the input. Since our indexing scheme begins with 0, it’s
natural to think of the indexes as pointing at the gaps between the input words (as in
0 Book 1 that 2 flight 3). These gaps are often calledfenceposts, on the metaphor offenceposts
the posts between segments of fencing. It follows then that the cell that represents
the entire input resides in position[0,n]in the matrix.
Since each non-terminal entry in our table has two daughters in the parse, it fol-
lows that for each constituent represented by an entry[i,j], there must be a position
in the input,k, where it can be split into two parts such thati<k<j. Given such

---

### Page 445

19.6 • CKY PARSING: A DYNAMICPROGRAMMINGAPPROACH437
L1 Grammar L1 in CNF
S→NP VP S→NP VP
S→Aux NP VP S→X1 VP
X1→Aux NP
S→VP S→book|include|prefer
S→Verb NP
S→X2 PP
S→Verb PP
S→VP PP
NP→Pronoun NP→I|she|me
NP→Proper-Noun NP→United|Houston
NP→Det Nominal NP→Det Nominal
Nominal→Noun Nominal→book|flight|meal|money
Nominal→Nominal Noun Nominal→Nominal Noun
Nominal→Nominal PP Nominal→Nominal PP
VP→Verb VP→book|include|prefer
VP→Verb NP VP→Verb NP
VP→Verb NP PP VP→X2 PP
X2→Verb NP
VP→Verb PP VP→Verb PP
VP→VP PP VP→VP PP
PP→Preposition NP PP→Preposition NP
Figure 19.10L 1 Grammar and its conversion to CNF. Note that although they aren’t shown
here, all the original lexical entries fromL 1 carry over unchanged as well.
a positionk, the first constituent[i,k]must lie to the left of entry[i,j]somewhere
along rowi, and the second entry[k,j]must lie beneath it, along columnj.
To make this more concrete, consider the following example with its completed
parse matrix, shown in Fig. 19.11.
(19.4) Book the flight through Houston.
The superdiagonal row in the matrix contains the parts of speech for each word in
the input. The subsequent diagonals above that superdiagonal contain constituents
that cover all the spans of increasing length in the input.
Given this setup, CKY recognition consists of filling the parse table in the right
way. To do this, we’ll proceed in a bottom-up fashion so that at the point where we
are filling any cell[i,j], the cells containing the parts that could contribute to this
entry (i.e., the cells to the left and the cells below) have already been filled. The
algorithm given in Fig. 19.12 fills the upper-triangular matrix a column at a time
working from left to right, with each column filled from bottom to top, as the right
side of Fig. 19.11 illustrates. This scheme guarantees that at each point in time we
have all the information we need (to the left, since all the columns to the left have
already been filled, and below since we’re filling bottom to top). It also mirrors on-
line processing, since filling the columns from left to right corresponds to processing
each word one at a time.
The outermost loop of the algorithm given in Fig. 19.12 iterates over the columns,
and the second loop iterates over the rows, from the bottom up. The purpose of the
innermost loop is to range over all the places where a substring spanningitojin
the input might be split in two. Askranges over the places where the string can be
split, the pairs of cells we consider move, in lockstep, to the right along rowiand
down along columnj. Figure 19.13 illustrates the general case of filling cell[i,j].

---

### Page 446

438CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
Book the flight throughHouston
S, VP, Verb,
Nominal,
Noun
S,VP,X2 S,VP,X2
Det NP NP
Nominal,
Noun
Nominal
Prep PP
NP,
Proper-
Noun
[0,1] [0,2] [0,3] [0,4] [0,5]
[1,2] [1,3]
[2,3]
[1,4]
[2,5][2,4]
[3,4]
[4,5]
[3,5]
[1,5]
Figure 19.11Completed parse table forBook the flight through Houston.
functionCKY-PARSE(words, grammar)returnstable
forj←from1toLENGTH(words)do
for all{A|A→words[j]∈grammar}
table[j−1,j]←table[j−1,j]∪A
fori←fromj−2down to0do
fork←i+1toj−1do
for all{A|A→BC∈grammarandB∈table[i,k]andC∈table[k,j]}
table[i,j]←table[i,j]∪A
Figure 19.12The CKY algorithm.
At each such split, the algorithm considers whether the contents of the two cells can
be combined in a way that is sanctioned by a rule in the grammar. If such a rule
exists, the non-terminal on its left-hand side is entered into the table.
Figure 19.14 shows how the five cells of column 5 of the table are filled after the
wordHoustonis read. The arrows point out the two spans that are being used to add
an entry to the table. Note that the action in cell[0,5]indicates the presence of three
alternative parses for this input, one where thePPmodifies theflight, one where
it modifies the booking, and one that captures the second argument in the original
VP→Verb NP PPrule, now captured indirectly with theVP→X2 PPrule.
19.6.3 CKY Parsing
The algorithm given in Fig. 19.12 is a recognizer, not a parser. That is, it can tell
us whether a valid parse exists for a given sentence based on whether or not if finds
anSin cell[0,n], but it can’t provide the derivation, which is the actual job for a
parser. To turn it into a parser capable of returning all possible parses for a given
input, we can make two simple changes to the algorithm: the first change is to
augment the entries in the table so that each non-terminal is paired with pointers to
the table entries from which it was derived (more or less as shown in Fig. 19.14), the
second change is to permit multiple versions of the same non-terminal to be entered
into the table (again as shown in Fig. 19.14). With these changes, the completed
table contains all the possible parses for a given input. Returning an arbitrary single

---

### Page 447

19.6 • CKY PARSING: A DYNAMICPROGRAMMINGAPPROACH439
...
...
[0,n]
[i,i+1][i,i+2] [i,j-2][i,j-1]
[i+1,j]
[i+2,j]
[j-1,j]
[j-2,j]
[i,j]
...
[0,1]
[n-1, n]
Figure 19.13All the ways to fill the [i,j]th cell in the CKY table.
parse consists of choosing anSfrom cell[0,n]and then recursively retrieving its
component constituents from the table. Of course, instead of returning every parse
for a sentence, we usually want just the best parse; we’ll see how to do that in the
next section.
19.6.4 CKY in Practice
Finally, we should note that while the restriction to CNF does not pose a problem
theoretically, it does pose some non-trivial problems in practice. The returned CNF
trees may not be consistent with the original grammar built by the grammar devel-
opers, and will complicate any syntax-driven approach to semantic analysis.
One approach to getting around these problems is to keep enough information
around to transform our trees back to the original grammar as a post-processing step
of the parse. This is trivial in the case of the transformation used for rules with length
greater than 2. Simply deleting the new dummy non-terminals and promoting their
daughters restores the original tree.
In the case of unit productions, it turns out to be more convenient to alter the ba-
sic CKY algorithm to handle them directly than it is to store the information needed
to recover the correct trees. Exercise 19.3 asks you to make this change. Many of
the probabilistic parsers presented in Appendix E use the CKY algorithm altered in

---

### Page 448

440CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
Book the flight throughHouston
S, VP, Verb,
Nominal,
Noun
S,VP,X2
Det NP
Nominal,
Noun
Nominal
Prep
NP,
Proper-
Noun
[0,1] [0,2] [0,3] [0,4] [0,5]
[1,2] [1,3]
[2,3]
[1,4]
[2,5][2,4]
[3,4]
[4,5]
[3,5]
[1,5]
Book the flight throughHouston
S, VP, Verb,
Nominal,
Noun
S,VP,X2
Det NP NP
Nominal,
Noun
Prep PP
NP,
Proper-
Noun
[0,1] [0,2] [0,3] [0,4] [0,5]
[1,2] [1,3]
[2,3]
[1,4]
[2,5][2,4]
[3,4]
[4,5]
[3,5]
[1,5]
Book the flight throughHouston
S, VP, Verb,
Nominal,
Noun
S,VP,X2
Det NP NP
Nominal,
Noun
Nominal
Prep PP
NP,
Proper-
Noun
[0,1] [0,2] [0,3] [0,4] [0,5]
[1,2] [1,3]
[2,3]
[1,4]
[2,5][2,4]
[3,4]
[4,5]
[3,5]
[1,5]
Book the flight throughHouston
S, VP, Verb,
Nominal,
Noun
S,VP,X2
Det NP NP
Nominal,
Noun
Nominal
Prep PP
NP,
Proper-
Noun
[0,1] [0,2] [0,3] [0,4] [0,5]
[1,2] [1,3]
[2,3]
[1,4]
[2,5][2,4]
[3,4]
[4,5]
[3,5]
[1,5]
Book the flight throughHouston
S, VP, Verb,
Nominal,
Noun
S,
VP,
X2
Det NP NP
Nominal,
Noun
Nominal
Prep PP
NP,
Proper-
Noun
[0,1] [0,2] [0,3] [0,4]
[1,2] [1,3]
[2,3]
[1,4]
[2,5][2,4]
[3,4]
[4,5]
[3,5]
[1,5]
S2, VPS3
S1,VP, X2
Figure 19.14Filling the cells of column 5 after reading the wordHouston.

---

### Page 449

19.7 • SPAN-BASEDNEURALCONSTITUENCYPARSING441
just this manner.
19.7 Span-Based Neural Constituency Parsing
While the CKY parsing algorithm we’ve seen so far does great at enumerating all
the possible parse trees for a sentence, it has a large problem: it doesn’t tell us which
parse is the correct one! That is, it doesn’tdisambiguateamong the possible parses.
To solve the disambiguation problem we’ll use a simple neural extension of the
CKY algorithm. The intuition of such parsing algorithms (often calledspan-based
constituency parsing, orneural CKY), is to train a neural classifier to assign a
score to each constituent, and then use a modified version of CKY to combine these
constituent scores to find the best-scoring parse tree.
Here we’ll describe a version of the algorithm from Kitaev et al. (2019). This
parser learns to map a span of words to a constituent, and, like CKY , hierarchically
combines larger and larger spans to build the parse-tree bottom-up. But unlike clas-
sic CKY , this parser doesn’t use the hand-written grammar to constrain what con-
stituents can be combined, instead just relying on the learned neural representations
of spans to encode likely combinations.
19.7.1 Computing Scores for a Span
Let’s begin by considering just the constituent (we’ll call it aspan) that lies betweenspan
fencepost positionsiandjwith non-terminal symbol labell. We’ll build a system
to assign a scores(i,j,l)to this constituent span.
ENCODER
[START]Book theflightthroughHouston[END]
map to subwords
map back to words
0 1 32 4 5
MLP
i=1
hj-hi
j=3
NP
Compute score for span
Represent span
CKY for computing best parse
postprocessing layers
Figure 19.15A simplified outline of computing the span score for the spanthe flightwith
the label NP.
Fig. 19.15 sketches the architecture. The input word tokens are embedded by

---

### Page 450

442CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
passing them through a pretrained language model like BERT. Because BERT oper-
ates on the level of subword (wordpiece) tokens rather than words, we’ll first need to
convert the BERT outputs to word representations. One standard way of doing this
is to simply use the first subword unit as the representation for the entire word; us-
ing the last subword unit, or the sum of all the subword units are also common. The
embeddings can then be passed through some postprocessing layers; Kitaev et al.
(2019), for example, use 8 Transformer layers.
The resulting word encoder outputsy t are then used to compute a span score.
First, we must map the word encodings (indexed by word positions) to span encod-
ings (indexed by fenceposts). We do this by representing each fencepost with two
separate values; the intuition is that a span endpoint to the right of a word represents
different information than a span endpoint to the left of a word. We convert each
word outputy t into a (leftward-pointing) value for spans ending at this fencepost,← −y t, and a (rightward-pointing) value − →y t for spans beginning at this fencepost, by
splittingy t into two halves. Each span then stretches from one double-vector fence-
post to another, as in the following representation ofthe flight, which is span(1,3):
START 0 Book the flight through
y0 − →y0 ← −y1 y1 − →y1 ← −y2 y2 − →y2 ← −y3 y3 − →y3 ← −y4 y4 − →y4 ← −y5 . . .
0⃝ 1⃝ 2⃝ 3⃝ 4⃝
span(1,3)
A traditional way to represent a span, developed originally for RNN-based models
(Wang and Chang, 2016), but extended also to Transformers, is to take the differ-
ence between the embeddings of its start and end, i.e., representing span(i,j)by
subtracting the embedding ofifrom the embedding ofj. Here we represent a span
by concatenating the difference of each of its fencepost components:
v(i,j) = [− →y j − − →yi ; ← − −y j+1 − ← − −yi+1](19.5)
The span vectorvis then passed through an MLP span classifier, with two fully-
connected layers and one ReLU activation function, whose output dimensionality is
the number of possible non-terminal labels:
s(i,j,·) =W 2 ReLU(LayerNorm(W1v(i,j)))(19.6)
The MLP then outputs a score for each possible non-terminal.
19.7.2 Integrating Span Scores into a Parse
Now we have a score for each labeled constituent spans(i,j,l). But we need a score
for an entire parse tree. Formally a treeTis represented as a set of|T|such labeled
spans, with thet th span starting at positioni t and ending at positionj t, with labell t:
T={(i t ,j t ,l t ):t=1, . . . ,|T|}(19.7)
Thus once we have a score for each span, the parser can compute a score for the
whole trees(T)simply by summing over the scores of its constituent spans:
s(T) =
X
(i,j,l)∈T
s(i,j,l)(19.8)

---

### Page 451

19.8 • EVALUATINGPARSERS443
And we can choose the final parse tree as the tree with the maximum score:
ˆT=argmax
T
s(T)(19.9)
The simplest method to produce the most likely parse is to greedily choose the
highest scoring label for each span. This greedy method is not guaranteed to produce
a tree, since the best label for a span might not fit into a complete tree. In practice,
however, the greedy method tends to find trees; in their experiments Gaddy et al.
(2018) finds that 95% of predicted bracketings form valid trees.
Nonetheless it is more common to use a variant of the CKY algorithm to find the
full parse. The variant defined in Gaddy et al. (2018) works as follows. Let’s define
sbest(i,j)as the score of the best subtree spanning(i,j). For spans of length one, we
choose the best label:
sbest(i,i+1) =maxl s(i,i+1,l)(19.10)
For other spans(i,j), the recursion is:
sbest(i,j) =maxl s(i,j,l)
+max
k
[sbest(i,k) +sbest(k,j)](19.11)
Note that the parser is using the max label for span(i,j)+ the max labels for spans
(i,k)and(k,j)without worrying about whether those decisions make sense given a
grammar. The role of the grammar in classical parsing is to help constrain possible
combinations of constituents (NPs like to be followed by VPs). By contrast, the
neural model seems to learn these kinds of contextual constraints during its mapping
from spans to non-terminals.
For more details on span-based parsing, including the margin-based training al-
gorithm, see Stern et al. (2017), Gaddy et al. (2018), Kitaev and Klein (2018), and
Kitaev et al. (2019).
19.8 Evaluating Parsers
The standard tool for evaluating parsers that assign a single parse tree to a sentence
is thePARSEV ALmetrics (Black et al., 1991). The PARSEV AL metric measuresPARSEV AL
how much theconstituentsin the hypothesis parse tree look like the constituents in a
hand-labeled,referenceparse. PARSEV AL thus requires a human-labeled reference
(or “gold standard”) parse tree for each sentence in the test set; we generally draw
these reference parses from a treebank like the Penn Treebank.
A constituent in a hypothesis parseC h of a sentencesis labeled correct if there
is a constituent in the reference parseC r with the same starting point, ending point,
and non-terminal symbol. We can then measure the precision and recall just as for
tasks we’ve seen already like named entity tagging:
labeled recall:= # of correct constituents in hypothesis parse ofs# of total constituents in reference parse ofs
labeled precision:= # of correct constituents in hypothesis parse ofs# of total constituents in hypothesis parse ofs

---

### Page 452

444CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
S(dumped)
VP(dumped)
PP(into)
NP(bin)
NN(bin)
bin
DT(a)
a
P
into
NP(sacks)
NNS(sacks)
sacks
VBD(dumped)
dumped
NP(workers)
NNS(workers)
workers
Figure 19.16A lexicalized tree from Collins (1999).
As usual, we often report a combination of the two, F1:
F1 = 2PRP+R (19.12)
We additionally use a new metric, crossing brackets, for each sentences:
cross-brackets:the number of constituents for which the reference parse has a
bracketing such as ((A B) C) but the hypothesis parse has a bracketing such
as (A (B C)).
For comparing parsers that use different grammars, the PARSEV AL metric in-
cludes a canonicalization algorithm for removing information likely to be grammar-
specific (auxiliaries, pre-infinitival “to”, etc.) and for computing a simplified score
(Black et al., 1991). The canonical implementation of the PARSEV AL metrics is
calledevalb(Sekine and Collins, 1997).evalb
19.9 Heads and Head-Finding
Syntactic constituents can be associated with a lexicalhead;Nis the head of anNP,
Vis the head of aVP. This idea of a head for each constituent dates back to Bloom-
field 1914, and is central to the dependency grammars and dependency parsing we’ll
introduce in Chapter 20. Indeed, heads can be used as a way to map between con-
stituency and dependency parses. Heads are also important in probabilistic pars-
ing (Appendix E) and in constituent-based grammar formalisms like Head-Driven
Phrase Structure Grammar (Pollard and Sag, 1994)..
In one simple model of lexical heads, each context-free rule is associated with
a head (Charniak 1997, Collins 1999). The head is the word in the phrase that is
grammatically the most important. Heads are passed up the parse tree; thus, each
non-terminal in a parse tree is annotated with a single word, which is its lexical head.
Figure 19.16 shows an example of such a tree from Collins (1999), in which each
non-terminal is annotated with its head.
For the generation of such a tree, each CFG rule must be augmented to identify
one right-side constituent to be the head child. The headword for a node is then set to
the headword of its head child. Choosing these head children is simple for textbook
examples (NNis the head ofNP) but is complicated and indeed controversial for

---

### Page 453

19.10 • SUMMARY445
most phrases. (Should the complementizertoor the verb be the head of an infinite
verb phrase?) Modern linguistic theories of syntax generally include a component
that defines heads (see, e.g., (Pollard and Sag, 1994)).
An alternative approach to finding a head is used in most practical computational
systems. Instead of specifying head rules in the grammar itself, heads are identified
dynamically in the context of trees for specific sentences. In other words, once
a sentence is parsed, the resulting tree is walked to decorate each node with the
appropriate head. Most current systems rely on a simple set of handwritten rules,
such as a practical one for Penn Treebank grammars given in Collins (1999) but
developed originally by Magerman (1995). For example, the rule for finding the
head of anNPis as follows (Collins, 1999, p. 238):
• If the last word is tagged POS, return last-word.
• Else search from right to left for the first child which is an NN, NNP, NNPS, NX, POS,
or JJR.
• Else search from left to right for the first child which is an NP.
• Else search from right to left for the first child which is a $, ADJP, or PRN.
• Else search from right to left for the first child which is a CD.
• Else search from right to left for the first child which is a JJ, JJS, RB or QP.
• Else return the last word
Selected other rules from this set are shown in Fig. 19.17. For example, forVP
rules of the formVP→Y 1 · · ·Yn, the algorithm would start from the left ofY 1 · · ·
Yn looking for the firstY i of type TO; if no TOs are found, it would search for the
firstY i of type VBD; if no VBDs are found, it would search for a VBN, and so on.
See Collins (1999) for more details.
Parent Direction Priority List
ADJP Left NNS QP NN $ ADVP JJ VBN VBG ADJP JJR NP JJS DT FW RBR RBS
SBAR RB
ADVP Right RB RBR RBS FW ADVP TO CD JJR JJ IN NP JJS NN
PRN Left
PRT Right RP
QP Left $ IN NNS NN JJ RB DT CD NCD QP JJR JJS
S Left TO IN VP S SBAR ADJP UCP NP
SBAR Left WHNP WHPP WHADVP WHADJP IN DT S SQ SINV SBAR FRAG
VP Left TO VBD VBN MD VBZ VB VBG VBP VP ADJP NN NNS NP
Figure 19.17Some head rules from Collins (1999). The head rules are also called ahead percolation table.
19.10 Summary
This chapter introduced constituency parsing. Here’s a summary of the main points:
• In many languages, groups of consecutive words act as a group or acon-
stituent, which can be modeled bycontext-free grammars(which are also
known asphrase-structure grammars).
• A context-free grammar consists of a set ofrulesorproductions, expressed
over a set ofnon-terminalsymbols and a set ofterminalsymbols. Formally,
a particularcontext-free languageis the set of strings that can bederived
from a particularcontext-free grammar.

---

### Page 454

446CHAPTER19 • CONTEXT-FREEGRAMMARS ANDCONSTITUENCYPARSING
•Structural ambiguityis a significant problem for parsers. Common sources
of structural ambiguity includePP-attachmentandcoordination ambiguity.
•Dynamic programmingparsing algorithms, such asCKY, use a table of
partial parses to efficiently parse ambiguous sentences.
•CKYrestricts the form of the grammar to Chomsky normal form (CNF).
• The basic CKY algorithm compactly represents all possible parses of the sen-
tence but doesn’t choose a single best parse.
• Choosing a single parse from all possible parses (disambiguation) can be
done byneural constituency parsers.
• Span-based neural constituency parses train a neural classifier to assign a score
to each constituent, and then use a modified version of CKY to combine these
constituent scores to find the best-scoring parse tree.
• Parsers are evaluated with three metrics:labeled recall,labeled precision,
andcross-brackets.
•Partial parsingandchunkingare methods for identifying shallow syntac-
tic constituents in a text. They are solved by sequence models trained on
syntactically-annotated data.
Historical Notes
According to Percival (1976), the idea of breaking up a sentence into a hierarchy of
constituents appeared in theV ¨olkerpsychologieof the groundbreaking psychologist
Wilhelm Wundt (Wundt, 1900):
...den sprachlichen Ausdruck f¨ur die willk¨urliche Gliederung einer Ge-
sammtvorstellung in ihre in logische Beziehung zueinander gesetzten
Bestandteile
[the linguistic expression for the arbitrary division of a total idea
into its constituent parts placed in logical relations to one another]
Wundt’s idea of constituency was taken up into linguistics by Leonard Bloom-
field in his early bookAn Introduction to the Study of Language(Bloomfield, 1914).
By the time of his later book,Language(Bloomfield, 1933), what was then called
“immediate-constituent analysis” was a well-established method of syntactic study
in the United States. By contrast, traditional European grammar, dating from the
Classical period, defined relations betweenwordsrather than constituents, and Eu-
ropean syntacticians retained this emphasis on suchdependencygrammars, the sub-
ject of Chapter 20. (And indeed, both dependency and constituency grammars have
been in vogue in computational linguistics at different times).
American Structuralism saw a number of specific definitions of the immediate
constituent, couched in terms of their search for a “discovery procedure”: a method-
ological algorithm for describing the syntax of a language. In general, these attempt
to capture the intuition that “The primary criterion of the immediate constituent
is the degree in which combinations behave as simple units” (Bazell, 1952/1966, p.
284). The most well known of the specific definitions is Harris’ idea of distributional
similarity to individual units, with thesubstitutabilitytest. Essentially, the method
proceeded by breaking up a construction into constituents by attempting to substitute
simple structures for possible constituents—if a substitution of a simple form, say,

---

### Page 455

EXERCISES447
man, was substitutable in a construction for a more complex set (likeintense young
man), then the formintense young manwas probably a constituent. Harris’s test was
the beginning of the intuition that a constituent is a kind of equivalence class.
Thecontext-free grammarwas a formalization of this idea of hierarchical
constituency defined in Chomsky (1956) and further expanded upon (and argued
against) in Chomsky (1957) and Chomsky (1956/1975). Shortly after Chomsky’s
initial work, the context-free grammar was reinvented by Backus (1959) and inde-
pendently by Naur et al. (1960) in their descriptions of the ALGOL programming
language; Backus (1996) noted that he was influenced by the productions of Emil
Post and that Naur’s work was independent of his (Backus’) own. After this early
work, a great number of computational models of natural language processing were
based on context-free grammars because of the early development of efficient pars-
ing algorithms.
Dynamic programming parsing has a history of independent discovery. Ac-
cording to the late Martin Kay (personal communication), a dynamic programming
parser containing the roots of the CKY algorithm was first implemented by John
Cocke in 1960. Later work extended and formalized the algorithm, as well as prov-
ing its time complexity (Kay 1967, Younger 1967, Kasami 1965). The relatedwell-
formed substring table(WFST) seems to have been independently proposed byWFST
Kuno (1965) as a data structure that stores the results of all previous computations
in the course of the parse. Based on a generalization of Cocke’s work, a similar
data structure had been independently described in Kay (1967) (and Kay 1973). The
top-down application of dynamic programming to parsing was described in Earley’s
Ph.D. dissertation (Earley 1968, Earley 1970). Sheil (1976) showed the equivalence
of the WFST and the Earley algorithm. Norvig (1991) shows that the efficiency of-
fered by dynamic programming can be captured in any language with amemoization
function (such as in LISP) simply by wrapping thememoizationoperation around a
simple top-down parser.
The earliest disambiguation algorithms for parsing were based onprobabilistic
context-free grammars, first worked out by Booth (1969) and Salomaa (1969); see
probabilistic
context-free
grammars
Appendix E for more history. Neural methods were first applied to parsing at around
the same time as statistical parsing methods were developed (Henderson, 1994). In
the earliest work neural networks were used to estimate some of the probabilities for
statistical constituency parsers (Henderson, 2003, 2004; Emami and Jelinek, 2005)
. The next decades saw a wide variety of neural parsing algorithms, including re-
cursive neural architectures (Socher et al., 2011, 2013), encoder-decoder models
(Vinyals et al., 2015; Choe and Charniak, 2016), and the idea of focusing on spans
(Cross and Huang, 2016). For more on the span-based self-attention approach we
describe in this chapter see Stern et al. (2017), Gaddy et al. (2018), Kitaev and Klein
(2018), and Kitaev et al. (2019). See Chapter 20 for the parallel history of neural
dependency parsing.
The classic reference for parsing algorithms is Aho and Ullman (1972); although
the focus of that book is on computer languages, most of the algorithms have been
applied to natural language.
Exercises
19.1Implement the algorithm to convert arbitrary context-free grammars to CNF.