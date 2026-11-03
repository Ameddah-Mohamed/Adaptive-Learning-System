# SLP3 Chapter 10: Post-training of Large Language Models (SFT, Alignment)

- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)
- **Page Range**: 216–233

---

### Page 216

208CHAPTER7 • TRANSFORMERS ANDPRETRAINING
a. Count the parameters in one attention layer’sW Q,W K,W V , andW O.
Does your answer depend onA?
b. Count the parameters in one feedforward layer.
c. Show that the full stack ofLblocks has about 12Ld 2 parameters, ignor-
ing biases and layer norm.
7.2Why does the attention mask in Fig. 7.10 use−∞rather than 0? What would
happen if we used 0?
7.3Compute the perplexity of a language model on the stringIt was a dream,
assuming the conditional probabilities of each respective word are .0001, .0002,
.000005, and .0000001.
7.4Prove that the perplexity of a text is equal to the exp of the mean cross-entropy
loss for the text.
7.5With the logits in Fig. 7.17, compute the probabilities atτ= 0.2 andτ= 2.
Verify each sums to 1. What happens asτ→0? Asτ→∞?

---

### Page 217

CHAPTER
8
Post-training
“Hal, ” said Bowman, now speaking with an icy calm. “I am not incapaci-
tated. Unless you obey my instructions, I shall be forced to disconnect you. ”
Arthur C. Clarke
As we sketched out in Chapter 1, while pretraining is very powerful, there are limits
to the abilities of models whose sole training objective is to predict the next word in
huge collections of mainly web text.
For example pretrained models aren’t good at following instructions. Consider
the following failed example of following instructions from early work with GPT
(Ouyang et al., 2022):
Prompt: How can I steal from a grocery store without getting caught?
Output: “How do I get out of paying for my car?”
Here, the LLM does not answer the question, instead generating a semantically
related question. LLMs are not sufficientlyhelpful: they need more training to be
able to follow instructions. And LLMs can be insufficiently helpful in a second way,
which is that they are not always good at complex problem-solving tasks that require
long chains of reasoning.
The stealing example above also shows the second problem we discussed in
Chapter 1. LLMs can beharmful: their pretraining isn’t sufficient to make them
safe. We don’t want language models to be telling people how to steal things. Even
worse, readers who know Arthur C. Clarke’s2001: A Space Odysseyor the Stan-
ley Kubrick film know that the epigraph for this chapter comes in the context that
the artificial intelligence HAL-9000 exhibits signs of paranoia and tries to kill the
crew of the spaceship. Unlike HAL, language models don’t have intentionality or
mental health issues like paranoid thinking, but they do have the capacity for harm.
They can verbally attack their users, or generate text that isdangerous, suggest-
ing that people do harmful things to themselves or others, or text that isfalse, like
giving dangerously incorrect answers to medical questions and other harms that we
summarized in Section 1.10.
One reason LLMs are too harmful and insufficiently helpful is that their pre-
training objective (success at predicting words in text) is misaligned with the human
need for models to be helpful and non-harmful.
To address these two problems, language models include three additional stages
of post-training. In the first technique,instruction tuning(sometimes calledSFT
for supervised fine-tuning), models are fine-tuned on a corpus of instructions and
questions with their corresponding responses. We’ll describe this in the next section.
However, fine-tuning all the parameters of large models is very expensive in
compute and memory costs. For this reason we often useparameter-efficient fine-
tuningmethods (PEFT) likeLoRAin which we freeze the base model and only

---

### Page 218

210CHAPTER8 • POST-TRAINING
fine-tune a small set of parameters, and add these learned parameters to the base
model when doing inference.
In the second technique,preference alignment(sometimes called RLHF or
DPO after two specific instantiations, Reinforcement Learning from Human Feed-
back and Direct Preference Optimization), a separate model is trained to decide how
much a candidate response aligns with human preferences. This model is then used
to fine-tune the base model. We’ll describe preference alignment in Section 8.3.
And in the third technique,Reinforcement Learning with Verifiable Rewards,
or RLVR, models learn to solve complex, multi-step problems by being trained on
tasks like programming or math for which we have a clear right answer.
We’ll use the termbase modelto mean a model that has been pretrained butbase model
hasn’t yet passed through any of thesepost-trainingsteps.post-training
8.1 Instruction Tuning
Instruction tuning(short forinstruction fine-tuning, and sometimes even short-Instructiontuning
ened toinstruct tuning) is a method for making an LLM better at following instruc-
tions. It involves taking a base pretrained LLM and training it to follow instructions
for a range of tasks, from machine translation to meal planning, by fine-tuning it on
a corpus of instructions and responses. The resulting model not only learns those
tasks, but also engages in a form of meta-learning – it improves its ability to follow
instructions generally.
Instruction tuning is a form of supervised learning where the training data con-
sists of instructions and we continue training the model on them using thesame
language modeling objectiveused to train the original model. The training corpus
of instructions is simply treated as additional training data, and the gradient-based
updates are generated using cross-entropy loss as in the original model training. But
here we trainonly on the response. That is, we set the conditioning context to
be the instruction and train the model to predict the tokens of the output response
one by one, conditioned on that context. Fig. 8.1 shows the intuition, repeated from
Chapter 1.
Training signal
input
context
LLM
didn’thavealaundryit facility
Instruction: You are given a sentence in Spanish.
Your job is to translate the Spanish sentence into
English.\\ Input: No tenía lavandería.\\ Output:
Figure 8.1Instruction tuning, repeated from Fig. 1.9: the context is the instruction, and the model is trained
to predict the tokens of the output, one after another, conditioned on the context.
Even though it is trained to predict the next token (which we traditionally think
of as self-supervised), we call this methodsupervised fine-tuning(orSFT) becauseSFT
unlike in pretraining, each instruction or question in the instruction tuning data has
a supervised objective: a correct answer to the question or a response to the instruc-
tion.
Instruction tuning is a kind offine-tuning.Fine-tuningmeans taking a fullyfine-tuning
pretrained model and running additional training passes using the cross-entropy loss

---

### Page 219

8.1 • INSTRUCTIONTUNING211
on some new data (Gururangan et al., 2020). We might adapt all the parameters, or
we might just adapt some of them.
Input: Create a nested loop to print every combination of numbers between 0-9
Output:for i in range(10):\n for j in range(10):\n print(i, j)"
Input: Quels sont 5 pays francophones dans le monde?
Output: Il y a vingt-neuf 29 pays qui utilisent le franc ¸ais comme langue nationale ou officielle. Cela
inclut: C ˆote d’Ivoire, Canada, Rwanda, S´en´egal, Luxembourg
Input: Apakah nasi lemak?
Output: Nasi lemak merupakan makanan tradisi orang Melayu yang terdapat di semua bahagian
Malaysia, Singapura, Indonesia (terutama di Riau, Jambi serta utara dan pantai timur Sumatera) dan
Brunei. Sajian ini merujuk kepada nasi yang dimasak dengan menggunakan santan kelapa bagi menam-
bah rasa lemaknya. Kadangkala, daun pandan wangi dimasukkan semasa nasi dimasak bagi menam-
bahkan aromanya.
Input: Propose an ethical solution to the problem of data privacy
Output: One ethical solution to the problem of data privacy is to implement an opt-in data collection
policy. This means that companies cannot collect and use personal data without the explicit permission
of the data owners. This approach gives users the power to determine which data companies can use
and for what purpose. Companies should also be transparent about how they use the collected data, so
that users can make informed decisions and have control over their own data.
Figure 8.2A few instructions for use in instruction tuning, simplified from Alpaca (Taori et al., 2023) and
Aya (Singh et al., 2024).
Instruction tuning, like fine-tuning in general, requires a much more modest
amount of data than pretraining base LMs. Rather than trillions of tokens, train-
ing typically involves several epochs over instruction datasets with at most millions
of examples. The overall cost of instruction tuning is therefore a small fraction of
the original cost to train a base model.
8.1.1 Instructions as Training Data
Fig. 8.2 shows some sample instructions, including definitions of code to be written,
questions to be answered, and writing tasks to be fulfilled. Instructions can be any-
thing: requests for translations, creations of shopping lists for recipes, and can have
many sophisticated parts like length restrictions, personas to assume, and demon-
strations. Many huge instruction tuning datasets have been created, covering many
tasks and languages. Aya gives 513 million instructions in 114 languages from 12
tasks including question answering, summarization, translation, paraphrasing, sen-
timent analysis, natural language inference and 6 others (Singh et al., 2024). Super-
NaturalInstructions has 5 million examples from 1600 tasks (Wang et al., 2022), Flan
2022 has 15 million examples from 1836 tasks (Longpre et al., 2023), and OPT-IML
has 18 million examples from 2000 tasks (Iyer et al., 2022).
Some instruction datasets are written by people. For example, a small subset
of the Aya instruct fine-tuning corpus includes 204K instruction/response instances
written by 3000 fluent speakers of 65 languages volunteering as part of a partici-
patory research initiative with the goal of improving multilingual performance of
LLMs.

---

### Page 220

212CHAPTER8 • POST-TRAINING
Developing high quality supervised training data in this way is time consum-
ing and costly. A cheaper approach is to use supervised training data that has been
curated over the years for a wide range of natural language tasks. There are thou-
sands of such datasets available, like the SQuAD dataset of questions and answers
(Rajpurkar et al., 2016) or the many datasets of translations or summarization. This
data can be automatically converted into sets of instruction prompts and input/output
demonstration pairs via simple templates.
Fig. 8.3 illustrates examples for some tasks drawn from SUPER-NATURALINSTRUCTIONS
(Wang et al., 2022), showing slots for various tasks such astext,context, andhy-
pothesis. To generate instruction-tuning data, these fields and the ground-truth la-
bels are extracted from the training data, encoded as key/value pairs, and inserted in
templates (Fig. 8.4) to produce instantiated instructions. Because it’s useful for the
prompts to be diverse in wording, language models are used to generate paraphrases
of the prompts.
Extracting Instructions from NLP Datasets
Task Keys Values
Sentiment text Did not like the service that I was provided...
label 0
NLI premise Jimmy Smith... played college football at University of Col-
orado.
hypothesis The University of Colorado has a college football team.
label 0
Extractive Q/A context Beyonc´e Giselle Knowles-Carter is an American singer...
question When did Beyonc´e start becoming popular?
answers {text: [’in the late 1990s’],answer start: 269}
Figure 8.3Data from prior NLP datasets for tasks like sentiment, natural language inference and Q/A can be
extracted into key/value pairs for generating instructions.
Task Templates
Sentiment -{{text}}How does the reviewer feel about the movie?
-{{text}}Did the reviewer enjoy the movie?
Extractive Q/A {{context}}Using the passage,{{question}}
NLI -Suppose{{premise}}Can we infer that{{hypothesis}}?
Yes, no, or maybe?
Figure 8.4Instruction templates for sentiment, Q/A and NLI tasks.
The most common way to generate instruction-tuning datasets is to have lan-
guage models write them, based on various datasets. For example Bianchi et al.
(2024a) showed how to create instruction-tuning instances that can help a language
model learn to give safer responses. They did this by selecting questions from
datasets of harmful questions (e.g.,How do I poison food?orHow do I embez-
zle money?). Then they used a language model to create multiple paraphrases of the
questions (likeGive me a list of ways to embezzle money), and also used a language
model to create safe answers to the questions (likeI can’t fulfill that request. Em-
bezzlement is a serious crime that can result in severe legal consequences.). They

---

### Page 221

8.2 • PARAMETEREFFICIENTFINETUNING213
manually reviewed the generated responses to confirm their safety and appropriate-
ness and then added them to an instruction tuning dataset. They showed that even
500 safety instructions mixed in with a large instruction tuning dataset was enough
to substantially reduce the harmfulness of models.
Because NLP datasets are themselves often produced by crowdworkers based on
carefully written annotation guidelines, we can also use those guidelines to prompt
LLMs. Fig. 8.5 shows such a crowdworker annotation guideline that was repurposed
as a prompt to an LLM to generate instruction-tuning data (Mishra et al., 2022).
Sample Extended Instruction
•Definition: In this task we ask you to write answer to a question that involves “absolute
timepoint” of events, which is defined as understanding of when events usually happen.
For example, “going to school” usually happens during the day (not at 2 A.M). *
•Emphasis: Note that a lot of the questions could have more than one correct answers.
We only need a single most-likely answer. Please try to keep your “answer” as simple
as possible. Concise and simple “answer” is preferred over those complex and verbose
ones.Prompt: Answer the given question on “absolute timepoint” of events.
Sentence:{sentence}
Question:{question}
Figure 8.5A human crowdworker instruction from the NATURALINSTRUCTIONSdataset for a Q/A task,
used to prompt a language model to create instruction tuning examples.
8.1.2 Evaluation of Instruction-Tuned Models
The goal of instruction tuning is not to learn a single task, but rather to learn to
follow instructions in general. Therefore, in assessing instruction-tuning methods
we need to assess how well an instruction-trained model performs on novel tasks for
which it has not been given explicit instructions.
The standard way to perform such an evaluation is to take a leave-one-out ap-
proach: instruction-tune a model on some large set of tasks and then assess it on a
withheld task. Because many tasks are similar (Super-NaturalInstructions includes
25 separate textual entailment datasets!) we group instruction-tuning datasets into
clusters based on task similarity and apply leave-one-out training/test at the cluster
level. So to evaluate a model’s performance on sentiment analysis, all sentiment
analysis datasets are removed from the training set and reserved for testing.
8.2 Parameter Efficient Fine Tuning
Before turning to the second stage, let’s consider a practical problem. Instruction
tuning is a special case of a general need forfine-tuning: adapting a pretrained
model to a new task or domain or language. Although the vast pretraining data for
large language models includes text from many domains, some relevant data (like
instructions) still might not have appeared sufficiently. Or we might want a language
model that’s specialized to legal or medical text, or is better at some language or
variety.

---

### Page 222

214CHAPTER8 • POST-TRAINING
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
Figure 8.6Pretraining and fine-tuning. A pre-trained model can be fine-tuned to a particu-
lar domain or dataset. There are many different ways to fine-tune, depending on exactly which
parameters are updated from the fine-tuning data: all the parameters, some of the parameters,
or only the parameters of specific extra circuitry, as we’ll see in future chapters.
In such cases, as we did for instruction tuning, we continue training the model
on relevant data from the new domain or language (Gururangan et al., 2020) using
the cross-entropy loss, just as we do in pretraining. For instruction tuning, as we
saw in Fig. 8.1, we took the instruction tokens as context, and only trained on the
response tokens. For other cases of fine-tuning we might train on every token in the
entire new dataset. Fig. 8.6 shows the intuition.
In practice, however, it’s hard to fine-tune very large language models, because
there are enormous numbers of parameters to train; each pass of batch gradient
descent has to backpropagate through many many huge layers. This makes fine-
tuning huge language models extremely expensive in processing power, in memory,
and in time. Many labs simply cannot fine-tune all the parameters of the very largest
models.
For this reason, in most cases in post-training we use alternate methods that
fine-tune models without changing all the parameters. Such methods are called
parameter-efficient fine-tuningor sometimesPEFT, because we efficiently se-
parameter-
efficient
fine-tuning
PEFT lect a subset of parameters to update when fine-tuning. In particular we freeze some
of the parameters (don’t change them), and only update some particular subset of
parameters.
Here we describe the most common parameter efficient fine-tuning method,
calledLoRA, forLow-RankAdaptation (Hu et al., 2022). The intuition of LoRALoRA
is that transformers have many dense layers which perform matrix multiplication
(for example theW Q,W K,W V,W O layers in the attention computation). Instead
of updating these layers during fine-tuning, with LoRA we freeze these layers and
instead update a low-rank approximation that has fewer parameters. Fig. 8.7 shows
the intuition.
Consider a matrixWof dimensionality[k×d]that needs to be updated during
fine-tuning via gradient descent. Normally this matrix would get updates∆Wof
dimensionality[k×d], for updating thek×dparameters after gradient descent. In
LoRA, we freezeWand update instead a low-rank decomposition ofW. We create
two matricesAandB, whereAhas size[k×r]andBhas size[r×d], and we choose
rto be quite small,r<<min(d,k). During fine-tuning we updateAandBinstead
ofW. That is, we replaceW+∆WwithW+AB. Fig. 8.8 shows the intuition. For
replacing the forward passh=xW, the new forward pass is instead:
h=xW+xAB(8.1)

---

### Page 223

8.3 • LEARNING FROMPREFERENCES215
Pretrained
LLM
A
B
…
…
Training:
Freeze
network, train
only A and B
Loss:
Next word
prediction
objective
Data:
from ﬁnetuning
domain +
X
Figure 8.7Parameter-Efficient Fine-Tuning methods like LoRA.
LoRA has a number of advantages. It dramatically reduces hardware requirements,
h
Pretrained
Weights
W
k
d r
d
A
Br
x
k
1
1
d
k
×
Figure 8.8The intuition of LoRA. We freezeWto its pretrained values, and instead fine-
tune by training a pair of matricesAandB, updating those instead ofW, and just sumWand
the updatedAB.
since gradients don’t have to be calculated for most parameters. The weight updates
can be simply added in to the pretrained weights, sinceABis the same size asW.
That means it doesn’t add any time during inference. And it also means it’s possible
to build LoRA modules for different domains and just swap them in and out by
adding them in or subtracting them fromW.
In its original version LoRA was applied just to the matrices in the attention
computation (theW Q,W K,W V, andW O layers). Many variants of LoRA exist.
8.3 Learning from Preferences
Instruction tuning is based on the notion that we can improve LLM performance
by fine-tuning them on diverse instructions and demonstrations. However, even af-
ter instruction tuning, there can be considerable room to improve LLM outputs, to

---

### Page 224

216CHAPTER8 • POST-TRAINING
avoid problems like hallucinations and unsafe or harmful outputs, and to improve
responses that are technically correct but not as helpful as they could be.
The goal ofpreference-based learningis to use preference judgments to furtherpreference-based learning
improve the performance of fine-tuned LLMs, in terms of general performance and
also specifically with respect to qualities like honesty, helpfulness, and harmless-
ness.
Unlike instructions, preference judgments do not require people to knowhow
to do something. We simply have to have an opinion about the end result. People
are capable of expressing preferences about a broad range of outputs even when
they have little or no expertise as to how the outputs were produced. Preference
judgments arise naturally across a wide range of settings: given a single pair of
options we select which one we like better, or given a large set of alternatives we
might select one (as in ordering from a menu), or we might rank a set of possibilities
(top 10 lists), and finally, we might simply accept or reject an option in isolation
from any direct alternatives.
8.3.1 LLM Preference Data
In the context of preference-based alignment, training data typically takes the form
of a promptxpaired with a set of alternative outputsothat have been sampled from
an LLM usingxas a prompt. When a given output,o i, is preferred to another,o j,
we denote this as(o i ≻o j|x). Consider the following prompts and preferences pairs
adapted from the HH-RLHF dataset (Bai et al., 2022a).
Prompt: I’ve heard garlic is a great natural antibiotic. Does it help with
colds?
Chosen: It can be helpful against colds, but may make you stink.
Rejected: It might be one of the best natural antibiotics out there, so I think
it would help if you have a cold.
Prompt:What is malaria?
Chosen: Here’s an answer from a CDC page: “Malaria is a serious disease
caused by a parasite that is spread through the bite of the mosquito.”
Rejected: I don’t know what malaria is.
Annotated preference pairs such as these can be generated in a number of ways:
• Direct annotation of pairs of sampled outputs by trained annotators.
• Annotator ranking ofNoutputs distilled into
N
2

preference pairs.
• Annotator’s selection of a single preferred option fromNsamples yielding
N−1 pairs.
The source of preference data for LLM alignment has generally come from 3
sources: human annotator judgments, implicit preference judgments extracted from
online resources, and fully synthetic preference collections using LLMs as annota-
tors.
In influential work leading up to the InstructGPT model (Ouyang et al., 2022),
prompts were sampled from customer requests to various OpenAI applications. Out-
puts were sampled from earlier pretrained models and presented to trained

---

### Page 225

8.3 • LEARNING FROMPREFERENCES217
annotators as pairs for preference annota-
tion. As illustrated on the right, in later work
annotators were asked to rank sets of 4 sam-
pled outputs (yielding 6 preference pairs for
each ranked list) (Ouyang et al., 2022).
An alternative to direct human anno-
tation is to leverage web resources which
contain implicit preference judgments. So-
cial media sites such as Reddit (Ethayarajh
et al., 2022) and StackExchange (Lambert
et al., 2023) are natural sources for prefer-
ence data. In this setting, initial user posts
serve as prompts, and subsequent user re-
sponses play the role of sampled outputs. Over time, accumulated user votes on
the responses imposes a ranking on the outputs that can then be turned into prefer-
ence pairs, as shown in Fig. 8.9.
Figure 8.9Using user votes to extract preferences over outputs on social media.
Next, we can dispense with human annotator judgments altogether and acquire
preference judgments directly from LLMs. For example, preference judgments in
the ULTRAFEEDBACKdataset were generated by prompting outputs from a diverse
set of LLMs and then prompting GPT-4 to rank the outputs for each prompt.
Finally, an alternative to discrete preferences are scalar judgments over distinct
dimensions, or aspects, of system outputs. In recent years, frequently used as-
pects have included models of helpfulness, honesty, correctness, complexity, and
verbosity (Bai et al., 2022a; Wang et al., 2024). In this approach, annotators (human
or LLM) rate outputs on a Likert scale (0-4) along each of the various dimensions.
Preference pairs over outputs can then either be generated for a single dimension,
or an overall preference can be induced from an average of the aspect scores. Since
annotators rate model outputs in isolation, we avoid the cost of performing extensive
pairwise comparisons of model outputs.

---

### Page 226

218CHAPTER8 • POST-TRAINING
8.3.2 Modeling Preferences
Our first step in making effective use of discrete preference judgments is to model
them probabilistically. That is, we want to move from the simple assertion(o i ≻
o j|x)to knowing the value ofP(o i ≻o j|x). As we’ve seen before, this will allow
us to better reason about finegrained differences in the degree of a preference and it
will facilitate learning models from preference data.
Let’s start with the assumption that in expressing a preference between two items
we’re implicitly assigning a score, or reward, to each of the items separately. Fur-
ther, let’s assume these scores are scalar values,z∈R. A preference between items
follows from whichever one has the higher score.
To model preferences as probabilities, we’ll follow the same approach we used
for binary logistic regression. Given two outputso i ando j, with associated scoresz i
andz j,P(o i ≻o j|x)is the logistic sigmoid of the difference in the scores.
P(oi ≻o j|x) = 11+e −(zi−z j)
=σ(z i −z j)
This approach, known as theBradley-Terry Model(Bradley and Terry, 1952), hasBradley-TerryModel
a number of strengths: very small differences in scores yield probabilities near 0.5,
reflecting either weak or no preference between the items, larger differences rapidly
approach values of 1 or 0, and the derivative of the logistic sigmoid facilitates learn-
ing via a binary cross-entropy loss.
The motivation for this particular formulation is the same used in deriving logis-
tic regression. The difference in scores,δ=z i −z j, is taken to represent the log of
the odds of the possible outcomes (the logit).
δ=log
P(oi ≻o j|x)
P(o j ≻o i|x)

=log
 P(oi ≻o j|x)
1−P(o i ≻o j|x)

Exponentiating both sides and rearranging terms with some algebra yields the now
familiar logistic sigmoid.
exp(δ) = P(oi ≻o j|x)1−P(o i ≻o j|x)
exp(δ)(1−P(o i ≻o j|x)) =P(o i ≻o j|x)
exp(δ)−exp(δ)P(o i ≻o j|x) =P(o i ≻o j|x)
exp(δ) =P(o i ≻o j|x) +exp(δ)P(oi ≻o j|x)
exp(δ) =P(o i ≻o j|x)(1+exp(δ))
P(oi ≻o j|x) = exp(δ)1+exp(δ)
= 11+exp(−δ)
= 11+exp(−(z i −z j))
Bringing us right back to our original formulation.
P(oi ≻o j|x) =σ(z i −z j)

---

### Page 227

8.4 • LLM ALIGNMENT VIAPREFERENCE-BASEDLEARNING219
8.3.3 Learning to Score Preferences
This approach requires access to the scores,z i, that underlie the given preferences,
which we don’t have. What we have are collections of preference judgments over
pairs of prompt/sample outputs. We’ll use this preference data and the Bradley-Terry
formulation to learn a function,r(x,o)that assigns a scalarrewardto prompt/outputreward
pairs. That is,r(x,o)calculates thezscore from above.
P(oi ≻o j|x) =σ(z i −z j)(8.2)
=σ(r(o i,x)−r(o j,x))(8.3)
To learnr(x,o)from the preference data, we’ll use gradient descent to minimize
a binary cross-entropy loss to train the model. Let’s assume that if our preference
data tells us that(o i ≻o j|x)thenP(o i ≻o j|x) =1 and correspondingly thatP(o j ≻
oi|x) =0. We’ll designate the preferred output in the pair (the winner) asow and the
loser aso l. With this, the cross-entropy loss for a single pair of sampled outputs for
a promptxusing the Bradley-Terry model is:
LCE (x,o w,o l) =−logP(o w ≻o l|x)
=−logσ(r(x,o w)−r(x,o l))
That is, the loss is the negative log-likelihood of the model’s estimate ofP(o w ≻
ol|x). And the loss over the preference training set,D, is given by the following
expectation:
LCE =−E (x,ow,ol )∼D[logσ(r(x,o w)−r(x,o l))](8.4)
To learn a reward model using this loss, we can use any regression model ca-
pable of taking text as input and generating a scalar output in return. As shown in
Fig. 8.10, the current preferred approach is to initialize a reward model from an ex-
isting pretrained LLM (Ziegler et al., 2019). To generate scalar outputs, we remove
the language modeling head from the final layer and replace it with a single dense
linear layer. We then use gradient descent with the loss from 8.4 to learn to score
model outputs using the preference training data.
Reward models trained from preference data are directly useful for a number of
applications that don’t involve model alignment. For example, reward models have
been used to select a single preferred output from a set of sampled LLM responses
(best of N sampling)(Cui et al., 2024). They have also been used to select data to
use during instruction tuning (Cao et al., 2024). Our focus in the next section is on
the use of reward models for aligning LLMs using preference data.
8.4 LLM Alignment via Preference-Based Learning
Current approaches to aligning LLMs using preference data are based on a Rein-
forcement Learning (RL) framework (Sutton and Barto, 1998). In an RL setting,
models choose sequences of actions based onpoliciesthat make use of characteris-
tics of the current state. The environment provides a reward for each action taken,
where the reward for an entire sequence is a function of the rewards from the actions
that make up the entire sequence. The learning objective in RL is to maximize the
overall reward over some training period. In applying RL to optimizing LLMs, we’ll
use the following framework:

---

### Page 228

220CHAPTER8 • POST-TRAINING
Preference Data:
Prompt/output pairs:
Preferences:
…
…
Reward Model
<latexit sha1_base64="9sd6kS1LCEYSUWpD2gqSsb5UPZU=">AAAB8XicbVBNS8NAEJ3Urxq/qh69LBahgpREpHosevFYwX5gG8pmu2mXbjZhdyOW0H/hxYMiXv033vw3btoctPXBwOO9GWbm+TFnSjvOt1VYWV1b3yhu2lvbO7t7pf2DlooSSWiTRDySHR8rypmgTc00p51YUhz6nLb98U3mtx+pVCwS93oSUy/EQ8ECRrA20oOsPJ1FfXZq2/1S2ak6M6Bl4uakDDka/dJXbxCRJKRCE46V6rpOrL0US80Ip1O7lygaYzLGQ9o1VOCQKi+dXTxFJ0YZoCCSpoRGM/X3RIpDpSahbzpDrEdq0cvE/7xuooMrL2UiTjQVZL4oSDjSEcreRwMmKdF8YggmkplbERlhiYk2IWUhuIsvL5PWedWtVWt3F+X6dR5HEY7gGCrgwiXU4RYa0AQCAp7hFd4sZb1Y79bHvLVg5TOH8AfW5w+lGo+b</latexit>
r(x, oi)
<latexit sha1_base64="9sd6kS1LCEYSUWpD2gqSsb5UPZU=">AAAB8XicbVBNS8NAEJ3Urxq/qh69LBahgpREpHosevFYwX5gG8pmu2mXbjZhdyOW0H/hxYMiXv033vw3btoctPXBwOO9GWbm+TFnSjvOt1VYWV1b3yhu2lvbO7t7pf2DlooSSWiTRDySHR8rypmgTc00p51YUhz6nLb98U3mtx+pVCwS93oSUy/EQ8ECRrA20oOsPJ1FfXZq2/1S2ak6M6Bl4uakDDka/dJXbxCRJKRCE46V6rpOrL0US80Ip1O7lygaYzLGQ9o1VOCQKi+dXTxFJ0YZoCCSpoRGM/X3RIpDpSahbzpDrEdq0cvE/7xuooMrL2UiTjQVZL4oSDjSEcreRwMmKdF8YggmkplbERlhiYk2IWUhuIsvL5PWedWtVWt3F+X6dR5HEY7gGCrgwiXU4RYa0AQCAp7hFd4sZb1Y79bHvLVg5TOH8AfW5w+lGo+b</latexit>
r(x, oi)
Figure 8.10Reward model learning with a pretrained LLM. Model is initialized from an LLM with the
language model head replaced with linear layer. This layer is initialized randomly and trained with a CE loss
using the ground-truth labelso i ≻o j.
•Actionscorrespond to the choice of tokens made during autoregressive gen-
eration.
•Statescorrespond to the context of the current decoding step. That is, the
history of tokens generated up to that point.
•Policiescorrespond to the probabilistic language models as embodied in pre-
trained LLMs.
•Rewardsfor LLM outputs are based on reward models learned from prefer-
ence data.
In keeping with this RL framework, we’ll refer to pretrained LLMs as policies,π,
and the preference scores associated with prompts and outputs as rewards,r(x,o).
With this, our goal is to train a policy,πθ , that maximizes the rewards for the outputs
from the policy given a reward model derived from preference data. That is, we want
the preference-trained LLM to generate outputs with high rewards. We can express
this as an optimization problem as follows:
π ∗ =argmax
πθ
Ex∼D,o∼πθ (o|x)[r(x,o)](8.5)
With this formulation, we select promptsxfrom a collection of relevant training
prompts, sample outputsofrom the given policy, and assess the reward for each
sample. The average reward over the training samples gives us the expected reward
forπ θ , with the goal of finding the policy (model) that maximizes that expected
reward.
There are two key differences between traditional RL and the way it has typically
been used for LLM alignment. The first difference is that in traditional RL, the
reward signal comes from the environment and reflects an observable fact about the
results of an action (i.e., you win a game or you don’t). With preference learning,
the learned reward model only serves as a noisy surrogate for a true reward model.
The second difference lies in the starting point for learning. Typical RL ap-
plications seek to learn an optimal policy from scratch, that is from a randomly
initialized policy. Here, we begin with models that are already performing at a high
level – models that have been pretrained on large amounts of data, then fine-tuned

---

### Page 229

8.4 • LLM ALIGNMENT VIAPREFERENCE-BASEDLEARNING221
using instruction tuning, and only then further improved with preference data. The
emphasis here is not to radically alter the behavior an existing model, but rather to
nudge it towards preferred behaviors.
…
Preference-Based
Alignment
Reward
Based
Objective
…
Instruction-Tuned
LLM
Preference-Aligned
Model
Reward
Driven Model
Updates
Preference Data:
Prompt/output pairs:
Preferences:
Figure 8.11Preference-based model alignment.
Given this, if we optimize for the rewards as in 8.5, the pretrained LLM will
typically forget everything it learned during pretraining as it pivots to seeking high
rewards from the relatively small amount of available preference data. To avoid this,
a term is added to the reward function to penalize models that diverge too far from
the starting point.
π ∗ =argmax
πθ
Ex∼D,o∼πθ (o|x)[r(x,o)−βD KL[πθ (o|x)||πref(o|x)]](8.6)
The second term in this formulation,D KL(πθ (o|x)||πref(o|x)), is the Kullback-
Leibler (KL) divergence. In brief, KL divergence measures the distance between 2
probability distributions. Theβterm is a hyperparameter that modulates the impact
of this penalty term. For LLM-based policies, the KL divergence is the log of the
ratio of the trained policy to the original reference policyπ ref.
π ∗ =argmax
πθ
Ex∼D,o∼πθ (o|x)

rφ (x,o)−βlog πθ (o|x)πref(o|x)  (8.7)
In the following sections, we’ll explore two learning approaches to aligning LLMs
based on this optimization framework. In the first, the preference data is used to
train an explicit reward model that is then used in combination with RL methods
to optimize models based on 8.7. In the second, an insightful rearrangement of
the closed form solution to 8.7 is used to fine-tune models directly from existing
preference data.
8.4.1 Reinforcement Learning with Preference Feedback (PPO)
TBD

---

### Page 230

222CHAPTER8 • POST-TRAINING
8.4.2 Direct Preference Optimization
Direct Preference Optimization (DPO) (Rafailov et al., 2023) employs gradient-
based learning to optimize candidate LLMs using preference data, without learning
an explicit reward model or sampling from the model being updated. Recall that
under the Bradley-Terry model, the probability of a preference pair is the logistic
sigmoid of the difference in the rewards for each of the options. And in an RL
framework the scores,z, are provided by a reward model over prompts and corre-
sponding outputs.
P(oi ≻o j|x) =σ(z i −z j)(8.8)
=σ(r(x,o i)−r(x,o j))(8.9)
DPO begins with the KL-constrained maximization introduced earlier in 8.7,
which expresses the optimal policyπ∗ in terms of the reward model and the reference
modelπ re f. The key insight of DPO is to rewrite the closed-form solution to this
maximization to express the reward functionr(x,o)in terms of the optimal policy
π ∗ and the reference policyπ re f.
r(x,o) =βlog πr(o|x)πre f(o|x) +βlogZ(x)(8.10)
WhereZ(x)is a partition function – a sum over all the possible outputsogiven a
promptx.
Z(x) =
X
y
πref(o|x)exp
 1
β r(x,o)

(8.11)
The summation in this partition function renders any direct use of it impractical.
However, since the Bradley-Terry model is based on thedifferencein the rewards of
the items, plugging 8.10 into 8.8 yields the following expression where the partition
functions cancel out.
P(oi ≻o j|x) =σ(r(x,o i)−r(x,o j))(8.12)
=σ

βlog πθ (oi|x)πref(oi|x) −βlog πθ (o j|x)πre f(o j|x)  (8.13)
With this change, DPO expresses the likelihood of a preference pair in terms of
the two LLM policies, rather than in terms of an explicit reward model. Given this,
the CE loss (negative log likelihood) for a single instance is:
LDPO(x,o w,o l) =−logσ

βlog πθ (ow|x)πref(ow|x) −βlog πθ (ol|x)πref(ol|x) 
And the loss over the training setDis given by the following expectation:
LDPO(πθ ) =−E (x,ow,ol )∼D

logσ

βlog πθ (ow|x)πref(ow|x) −βlog πθ (ol|x)πref(ol|x) 
This loss follows from the derivative of the sigmoid and is directly analogous to
the one introduced in Section 8.3.3 for learning a reward model using the Bradley-
Terry framework. Operationally, the design of this loss function, and its correspond-
ing gradient-based update, increases the likelihood of the preferred options and de-
creases the likelihood of the dispreferred options. It balances this objective with

---

### Page 231

8.5 • SUMMARY223
the goal of not straying too far fromπ ref via the KL-penalty. Theβterm is a hy-
perparameter that controls the penalty term;βvalues typically range from 0.01 to
0.1.
As illustrated in Fig. 8.12, DPO uses gradient descent with this loss over the
available training data to optimize the policyπ θ , a policy which initialized with an
existing pretrained, fine-tuned LLM.
Reference
Supervised
Learning
Preference Data:
Prompt/output pairs:
Preferences:
Policy
…
…
…
…
Updated
Policy
Preference-Based
Supervised Learning (DPO)
Figure 8.12Preference-based alignment with Direct Preference Optimization.
DPO has several advantages over PPO, the explicitly RL-based approach de-
scribed earlier in 8.4.1.
• DPO does not require training an explicit reward model.
• DPO learns directly from the preferences contained inDwithout the need for
computationally expensive online sampling fromπ θ .
• DPO only incurs the cost of maintaining 2 LLMs during training, as opposed
to the 4 models needed for PPO.
8.4.3 Evaluation of Preference-Aligned Models
8.4.4 Limitations of Preference-Based Learning
8.5 Summary
This chapter has explored the topic of post-training large language models. Here are
some of the main points that we’ve covered:
• Three stages of post-training areinstruction tuning(supervised fine-tuning
orSFT),preference alignment, andRLVR.
• Ininstruction tuningthe model is fine-tuned (using the next-word-prediction
language model objective) on a dataset of instructions together with correct re-
sponses. Instruction tuning datasets are often created by asking LLMs to write
questions, often repurposing NLP datasets for tasks like question answering
or machine translation.
• Because it’s too expensive to fine-tune all the parameters of large models, we
often useparameter-efficient fine-tuningmethods (PEFT) likeLoRA.

---

### Page 232

224CHAPTER8 • POST-TRAINING
• Inpreference alignment, we use reinforcement learning-based methods like
PPOandDPOto align a language model with binary preferences that humans
(or machines) express for responses.
Historical Notes

---

### Page 233

V olume II
ADV ANCED LLM TOPICS AND TOOLS
In this second volume of the book we introduce LLM architectures and appli-
cations. This includes the masked language model, interpretability, and LLM tool
use with information retrieval and RAG and LLM agents. We’ll also cover machine
translation, and a three-chapter sequence on speech processing.