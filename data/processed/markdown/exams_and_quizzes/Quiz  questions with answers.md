# Quiz  questions with answers

- **Source File**: `Quiz  questions with answers.pdf`
- **Total Pages**: 6

---

## Slide / Page 1

Natural Language Processing
Quiz 1
30 minutes
1.     The quiz duration is 30 minutes.
2.     Some of the following questions are marked out of 1 point and the others out of 0.5.
3.     Each incorrect answer is penalised half assigned point (or 1/2 point). You may leave questions
unanswered.
4.     For any question, there is ONLY ONE CORRECT ANSWER. If in doubt and you want to answer
any question, select the most correct one.
5.     N.B.: The questions will probably appear to you in a different order than your classmates.
Question 1: Word normalization often includes processes like:   0.5 pts
(A) Lemmatization and stemming
(B) Tokenization and segmentation
(C) Frequency analysis
(D) Part-of-speech tagging
Answer: (A) Lemmatization and stemming
Question 2: What distinguishes lemmatization from stemming? 0.5 pts
(A) Lemmatization removes suffixes, while stemming does not
(B) Lemmatization returns the base form of a word, while stemming cuts off derivational affixes
(C) Stemming is more computationally expensive than lemmatization
(D) Lemmatization requires a dictionary, while stemming does not
Answer: (B) Lemmatization returns the base form of a word, while stemming cuts off derivational affixes
Question 3: Which of the following is NOT a technique used in word normalization?  0.5 pts
(A) Stemming
(B) Lowercasing
(C) Tokenization
(D) Lemmatization
Answer: (C) Tokenization
Question 4: Given a language model that predicts a sequence of words with a combined probability of
0.001, and the sequence consists of 5 words, what is the perplexity of this model? (Select the closest
integer to the actual perplexity.)    1  pt
(A) 2
(B) 4
(C) 8
(D) 12
Answer: B) 4
Explanation: For a probability P of a sequence of words consisting of N words, the perplexity is given
by: PP=P(w1,w2,...,wN)−1/N
So if   P = 0.001 and N = 5:
PP=0.001−1/5 = (10−3)−1/5 = 103/5 ≈3.98

---

## Slide / Page 2

Question 5: Which of the following strategies can help reduce overfitting in a language model?
(A) Increasing the size of the training dataset   0.5 pts
(B) Decreasing the model complexity
(C) Using regularization techniques
(D) All of the above
(E) None of the above
Answer: D) All of the above
Question 6: In interpolation for n-gram language models, what is combined to estimate the probability of
a word sequence?      0.5 pts
(A) Only the unigram probabilities
(B) N-gram probabilities with equal weights
(C) N-gram probabilities with different weights
(D) The training data only
Answer: C) N-gram probabilities with different weights
Question 7: Which statement best describes the backoff technique in n-gram language modeling?
(A) It combines probabilities of different n-grams to smooth the model  0.5 pts
(B) It skips longer n-grams if they are not found and falls back to shorter ones
(C) It creates a new model with larger n-grams
(D) It reduces the number of unique n-grams in the model
Answer: B) It skips longer n-grams if they are not found and falls back to shorter ones
Question 8: If a model predicts a sequence with a probability of 0.025, what would be the perplexity for
this sequence, assuming it consists of 7 words? Select the closest integer to the actual perplexity.)   1 pt
(A) 10
(B) 5
(C) 2
(D) 1
Answer: C) 2
Perplexity = (1/P(w))1/N;    here P(w) = 0.025   and N=7
So  PP(W) = (1/0.025)(1/7) = 1.69  ≈ 2
Question 9: During training of a Naive Bayes classifier, a specific word appears 5 times in the positive
class and 3 times in the negative class. There are a total of 50 occurrences of other words in the positive
class. Assuming Laplace smoothing with k=1 and a vocabulary size ∣V∣=1000, what is the probability of
encountering this word given the positive class? (Select the closest number to the actual result.)   1  pt
(A) 0.005
(B) 0.006
(C) 0.007
(D) 0.008
Answer: B) 0.006  (The closest option)
Calculation:
1. Occurrences of the word in the positive class: C(w, Cpositive) = 5
2. Total word occurrences in the positive class: C(Cpositive) = 50 + 5 = 55
3. Vocabulary size: ∣V∣ = 1000
Using Laplace smoothing:
P(w∣Cpositive) = (C(w, Cpositive)+1) / (C(Cpositive)+∣V∣) = (5+1)/(55+1000) = 6/1055 ≈ 0.00568

---

## Slide / Page 3

Question 10: Which of the following techniques is commonly used to optimize a Naive Bayes classifier
specifically for sentiment analysis?   0.5 pts
(A) Increasing the vocabulary size
(B) Feature selection to include only sentiment-bearing words
(C) Using complex feature engineering
(D) All of the above
(E) None of the above
Answer: D) All of the above
Question 11: Which of the following strategies is crucial for avoiding biases in classification models?
0.5 pts
(A) Using balanced datasets
(B) Including diverse feature sets
(C) Regularly updating the model
(D) All of the above
(E) None of the above
Answer: D) All of the above
Question 12: In a multi-class classification problem, the following confusion matrix is given:
Predicted A Predicted B Predicted C
Actual A 50 2 1
Actual B 5 45 5
Actual C 0 3 47
What is the micro-averaged precision for this model? (Select the closest number to the result.)   1  pt
(A) 0.857
(B) 0.899
(C) 0.912
(D) 0.940
Answer: B) 0.899
Explanation:
 True Positives (TP) = 50 + 45 + 47 = 142
 False Positives (FP) = 5 + 5 + 6 = 16
 Micro-averaged Precision = TP / (TP + FP) = 142 / (142 + 16) = 142 / 158 = 0.899.
Question 13: Using the same confusion matrix from MCQ 1, what is the micro-averaged recall for this
model?   1 pt
(A) 0.857
(B) 0.899
(C) 0.912
(D) 0.940
Answer: B) 0.899
Explanation:
 False Negatives (FN) = 3 + 10 + 3 = 16
 Micro-averaged Recall = TP / (TP + FN) = 142 / (142 + 16) = 0. 899.

---

## Slide / Page 4

Question 14: For the same confusion matrix, what is the macro-averaged precision for the model?  1 pt
(A) 0.797
(B) 0.852
(C) 0.899
(D) 0.940
Answer: C) 0.899
Explanation:
 Precision for A = 50 / (50 + 5 + 0) = 50 / 55 = 0.909
 Precision for B = 45 / (45 + 2 + 3) = 45 / 50 = 0.900
 Precision for C = 47 / (47 + 1 + 5) = 47 / 53 = 0.887
 Macro-averaged Precision = (0.909 + 0.900 + 0.887) / 3 = 0.8987.
Question 15: Given the following term frequency (TF) and document frequency (DF) information:
 Document 1 (D1): "cat cat dog"
 Document 2 (D2): "dog dog cat"
 Document 3 (D3): "dog cat cat"
For the term "cat", compute the TF-IDF for Document 1, given that the total number of documents is 3.
(recall that TF-IDF = TF x log (N / DF) )   1  pt
(A) 0
(B) 0.176
(C) 0.301
(D) 0.477
Answer: A) 0
Explanation:
In this case, the term "cat" appears in all 3 documents, so the document frequency (DF) for "cat" is 3. The
total number of documents N is 3. Thus, we can calculate the IDF (Inverse Document Frequency) as:
IDF=log(3/3)=log(1)=0
The TF (term frequency) of "cat" in Document 1 is:
TF=count of "cat" in D1 / total words in D1 = 2/3
So     TF-IDF=(2/3) × 0 = 0
Question 16: In the Continuous Bag-of-Words (CBOW) model of Word2Vec, given the context words
“cat” and “dog” with vector representations:
Context word “cat” has a vector  [0.1, 0.2, 0.3]
Context word “dog” has a vector [0.4, 0.5, 0.6]
The output vector corresponding to the target word is [0.3, 0.4, 0.5].
What is the cosine similarity using mean pooling, of the context vectors and the output vector? (select the
closest answer.)   1 pt
(A) 0.999
(B) 0.855
(C) 0.878
(D) 0.754
Answer: A) 0.999
Explanation:
1. Average Context Vector:
Average Context =  ([0.1, 0.2, 0.3] + [0.4, 0.5, 0.6]) / 2 = [0.25, 0.35, 0.45]
2. Cosine Similarity:
Cosine Similarity} = ([0.25, 0.35, 0.45] . [0.3, 0.4, 0.5]) / (||[0.25, 0.35, 0.45]|| x ||[0.3, 0.4, 0.5]||)
Dot product:
(0.25 x 0.3) + (0.35 x 0.4) + (0.45 x 0.5) = 0.075 + 0.14 + 0.225 = 0.44
Magnitudes:

---

## Slide / Page 5

∥[0.25,0.35,0.45]∥ = 0.252+0.352+0.452 = 0.6225
∥[0.3,0.4,0.5]∥=0.32+0.42+0.52=0.707
Now, compute cosine similarity:
Cosine Similarity= 0.44 / (0.6225 × 0.707) ≈ 0.9998
Question 17: What is the purpose of the forget gate in a Long Short-Term Memory (LSTM) cell?   0.5
pts
(A) To decide which information from the previous hidden state should be passed forward.
(B) To determine how much of the current input should be remembered.
(C) To decide which parts of the memory cell should be discarded.
(D) To update the weights of the memory cell based on the loss function.
Answer: C) To decide which parts of the memory cell should be discarded.
Explanation: The forget gate in an LSTM is responsible for deciding what information from the previous
memory state (cell state) should be discarded, allowing the network to focus on relevant information and
prevent the problem of vanishing gradients.
Question 18: What is the key benefit of using stacked RNNs over a single-layer RNN?   0.5 pts
(A) They improve the ability to capture long-range dependencies by introducing additional non-
linearity.
(B) They speed up training by adding extra layers to the model.
(C) They reduce the number of parameters, making the model more efficient.
(D) They increase the complexity of the model, helping to prevent overfitting.
Answer: A) They improve the ability to capture long-range dependencies by introducing additional
non-linearity.
Explanation: Stacked RNNs, or multi-layer RNNs, are used to capture more complex patterns and
dependencies. Adding extra layers increases the model’s capacity to capture higher-level features and
long-range dependencies.
Question 19: In an Encoder-Decoder model with RNNs (commonly used for tasks like machine
translation), what is the role of the decoder?   0.5 pts
(A) It processes the input sequence and generates the fixed-length representation used for
prediction.
(B) It generates the output sequence based on the encoded representation from the encoder.
(C) It generates the attention weights based on the encoder outputs.
(D) It provides feedback to the encoder to improve the representation.
Answer: B) It generates the output sequence based on the encoded representation from the encoder.
Explanation: In an encoder-decoder architecture, the encoder processes the input sequence and produces
a context vector (or hidden state), and the decoder uses this context vector to generate the output
sequence, such as in machine translation.
Question 20: Which of the following best describes the role of the attention mechanism in sequence-to-
sequence models?   0.5 pts
(A) It enables the model to focus on the most relevant parts of the input sequence when
generating the output.
(B) It allows the model to generate the output sequence in parallel, speeding up computation.
(C) It reduces the need for deep LSTMs by compressing the input sequence into a single context
vector.
(D) It allows the decoder to predict the next word without the need for any context from the
encoder.

---

## Slide / Page 6

Answer: A) It enables the model to focus on the most relevant parts of the input sequence when
generating the output.
Explanation: The attention mechanism allows the decoder to focus on different parts of the input
sequence at each time step, providing dynamic weighting of the encoder’s hidden states to produce more
accurate predictions.
Question 21: In a scaled dot-product attention mechanism, you are given the following:
Query vector Q = [0.5, 0.3]
Key vector    K = [0.4, 0.2]
What is the attention score between the query and key?   1 pt
(A) 0.169
(B) 0.183
(C) 0.352
(D) 0.487
Answer: B) 0.183
Explanation: The attention score is calculated as the scaled dot product between the query and key:
Attention Score = (Q⋅K) / sqrt(dk)
Q⋅K = (0.5×0.4) + (0.3×0.2) = 0.20 + 0.06 = 0.26
Attention_Score = 0.26 / sqrt(2) ≈ 0.183

---

