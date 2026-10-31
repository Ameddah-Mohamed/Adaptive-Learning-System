"""
NLP Adaptive Learning System - Interactive Web Application
Built with Streamlit, KaTeX, ChromaDB, and Ollama.
"""

import sys
import json
from pathlib import Path

# Add project root to path for clean imports
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import streamlit as st
import ollama

from src.rag.retriever import CourseRetriever
from src.models.tutor_agent import NLPTutorAgent
from src.models.quiz_generator import QuizGenerator
from src.evaluator.grader import SubmissionEvaluator


# ==========================================
# PAGE CONFIGURATION & CUSTOM STYLES
# ==========================================
st.set_page_config(
    page_title="ENSIA NLP Tutor & Adaptive Learning",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

CUSTOM_CSS = """
<style>
/* Main typography and card aesthetics */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

code, pre {
    font-family: 'JetBrains Mono', monospace !important;
}

/* Header Banner */
.hero-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px 30px;
    margin-bottom: 25px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.hero-title {
    font-size: 26px;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.hero-subtitle {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.5;
}

/* Badges */
.badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.badge-green { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
.badge-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

/* Scorecards */
.scorecard {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.score-number {
    font-size: 38px;
    font-weight: 800;
    margin-top: 5px;
    margin-bottom: 5px;
}

/* Feedback Cards */
.card-strength {
    background: rgba(34, 197, 94, 0.08);
    border-left: 4px solid #22c55e;
    padding: 14px 18px;
    border-radius: 8px;
    margin-bottom: 12px;
}

.card-weakness {
    background: rgba(239, 68, 68, 0.08);
    border-left: 4px solid #ef4444;
    padding: 14px 18px;
    border-radius: 8px;
    margin-bottom: 12px;
}

/* Citations Pill */
.citation-pill {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #cbd5e1;
    margin-bottom: 8px;
}
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ==========================================
# CACHED SERVICE INITIALIZATION
# ==========================================
@st.cache_resource
def get_retriever():
    return CourseRetriever()

@st.cache_resource
def get_tutor(model_name: str, top_k: int):
    return NLPTutorAgent(model_name=model_name, top_k_retrieval=top_k)

@st.cache_resource
def get_quiz_generator(model_name: str):
    return QuizGenerator(model_name=model_name)

@st.cache_resource
def get_evaluator(model_name: str):
    return SubmissionEvaluator(model_name=model_name)


# ==========================================
# SIDEBAR CONTROLS
# ==========================================
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/artificial-intelligence.png", width=64)
    st.title("System Controls")
    
    st.markdown("### ⚙️ Engine Settings")
    selected_model = st.selectbox(
        "Active LLM",
        options=["qwen3.5:latest", "llama3:latest", "gemma3:latest"],
        index=0,
        help="Local Ollama model used for tutoring, grading, and quiz generation."
    )
    
    top_k_val = st.slider(
        "RAG Retrieval Depth (Top-K)",
        min_value=1,
        max_value=6,
        value=3,
        help="Number of lecture slides to retrieve per query."
    )
    
    chapter_options = {
        "All Chapters": None,
        "Ch 01: Introduction TALN": 1,
        "Ch 02: Tokenization & Edit Distance": 2,
        "Ch 03: Language Modeling": 3,
        "Ch 04: Naive Bayes Classification": 4,
        "Ch 05: Logistic Regression": 5,
        "Ch 06: Vector Semantics & Embeddings": 6,
        "Ch 07: Neural Networks": 7,
        "Ch 08: RNNs & LSTMs": 8,
        "Ch 09: The Transformer": 9,
        "Ch 10: Large Language Models": 10,
        "Ch 11: Masked Language Models": 11,
        "Ch 14: QA & RAG": 14,
        "Ch 18: CFG & Constituency Parsing": 18,
        "Ch 19: Dependency Parsing": 19
    }
    
    selected_chap_label = st.selectbox("Focus Chapter Filter", options=list(chapter_options.keys()))
    selected_chapter = chapter_options[selected_chap_label]

    st.markdown("---")
    st.markdown("### 📊 Knowledge Base Status")
    try:
        retriever_instance = get_retriever()
        total_chunks = retriever_instance.collection.count()
        st.success(f"**ChromaDB Connected**\n\nIndexed: `{total_chunks} slide chunks`\n\nEmbeddings: `qwen3-embedding:4b`")
    except Exception as e:
        st.error(f"Vector DB Status: {e}")

    st.markdown("---")
    st.caption("ENSIA 4th Year NLP Course • Adaptive AI Platform")


# ==========================================
# HERO BANNER
# ==========================================
st.markdown("""
<div class="hero-card">
    <div class="hero-title">
        <span>🧠</span> NLP Course Adaptive Learning & Tutoring System
        <span class="badge badge-blue">ENSIA Syllabus</span>
        <span class="badge badge-green">100% Local Ollama</span>
    </div>
    <div class="hero-subtitle">
        Specialized technical tutor, curriculum-calibrated quiz authoring, and rubric-aligned automated assignment grader grounded in 15 official lecture slide decks and exam answer keys.
    </div>
</div>
""", unsafe_allow_html=True)


# ==========================================
# MAIN TABS INTERFACE
# ==========================================
tab_tutor, tab_quiz, tab_evaluator, tab_explorer = st.tabs([
    "💬 AI Course Tutor",
    "📝 Quiz & Exam Generator",
    "⚖️ Submission Evaluator",
    "🔍 Knowledge Base Explorer"
])


# ==========================================
# TAB 1: AI COURSE TUTOR CHAT
# ==========================================
with tab_tutor:
    st.markdown("#### 💬 Ask the Specialized NLP Tutor")
    st.caption("Ask theoretical derivations, math formulations, or code implementation questions. Answers are grounded in course slides with LaTeX and citations.")

    # Initialize chat history
    if "tutor_messages" not in st.session_state:
        st.session_state.tutor_messages = [
            {
                "role": "assistant",
                "content": "Hello! I am your ENSIA NLP Course Tutor. You can ask me to explain lecture concepts, derive mathematical formulations step-by-step, or diagnose PyTorch code. What would you like to explore today?",
                "citations": []
            }
        ]

    # Quick prompt buttons
    st.markdown("**Quick Prompts:**")
    quick_cols = st.columns(3)
    quick_q = None
    if quick_cols[0].button("📐 Scaled Dot-Product Variance Proof"):
        quick_q = "Derive mathematically why we scale by 1/sqrt(d_k) in Scaled Dot-Product Attention."
    if quick_cols[1].button("📉 Perplexity vs Cross-Entropy"):
        quick_q = "Explain the mathematical relationship between cross-entropy loss and perplexity in language models."
    if quick_cols[2].button("🌲 CKY Parsing & Chomsky Normal Form"):
        quick_q = "Explain the steps to convert a Context-Free Grammar into Chomsky Normal Form (CNF) for CKY parsing."

    # Display conversation history
    for msg in st.session_state.tutor_messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if msg.get("citations"):
                with st.expander("📚 Cites Official Course Slides", expanded=False):
                    for cit in msg["citations"]:
                        st.markdown(f"- `{cit}`")

    # Chat input
    user_input = st.chat_input("Ask a question about the NLP curriculum...")
    question_to_ask = quick_q if quick_q else user_input

    if question_to_ask:
        # Append user message
        st.session_state.tutor_messages.append({"role": "user", "content": question_to_ask})
        with st.chat_message("user"):
            st.markdown(question_to_ask)

        with st.chat_message("assistant"):
            with st.spinner("Retrieving relevant lecture slides and generating grounded explanation..."):
                tutor = get_tutor(selected_model, top_k_val)
                result = tutor.ask(question_to_ask, chapter_filter=selected_chapter)
                
                st.markdown(result["answer"])
                if result["citations"]:
                    with st.expander("📚 Cites Official Course Slides", expanded=True):
                        for cit in result["citations"]:
                            st.markdown(f"- `{cit}`")

        # Save assistant message
        st.session_state.tutor_messages.append({
            "role": "assistant",
            "content": result["answer"],
            "citations": result["citations"]
        })

    if st.button("🧹 Clear Chat History", key="clear_chat"):
        st.session_state.tutor_messages = []
        st.rerun()


# ==========================================
# TAB 2: DYNAMIC QUIZ & EXAM GENERATOR
# ==========================================
with tab_quiz:
    st.markdown("#### 📝 Dynamic Quiz & Exercise Authoring Engine")
    st.caption("Generate customized problems across difficulty levels with ground-truth solutions and marking rubrics.")

    q_col1, q_col2, q_col3 = st.columns([2, 1, 1])
    with q_col1:
        quiz_topic = st.selectbox(
            "Select Course Topic",
            options=[
                "Self-Attention and Multi-Head Attention",
                "Language Modeling and Perplexity",
                "Naive Bayes Sentiment Classification with Laplace Smoothing",
                "Chomsky Normal Form and CKY Parsing",
                "Vector Semantics, Cosine Similarity, and Embeddings",
                "RNNs, LSTMs, and BPTT",
                "Tokenization, Byte-Pair Encoding (BPE), and Edit Distance",
                "Masked Language Modeling (BERT) vs Causal LM (GPT)"
            ]
        )
    with q_col2:
        quiz_diff = st.selectbox("Difficulty Level", ["beginner", "intermediate", "advanced"], index=1)
    with q_col3:
        quiz_type = st.selectbox("Question Format", ["mcq", "calculation", "derivation", "coding"], index=0)

    if st.button("⚡ Generate Customized Exercise", use_container_width=True, type="primary"):
        with st.spinner(f"Generating {quiz_diff} {quiz_type} question grounded in syllabus..."):
            generator = get_quiz_generator(selected_model)
            q_res = generator.generate_exercise(topic=quiz_topic, difficulty=quiz_diff, question_type=quiz_type)
            st.session_state["current_exercise"] = q_res

    if "current_exercise" in st.session_state:
        ex_data = st.session_state["current_exercise"]
        ex = ex_data.get("exercise", {})

        diff_badge_class = {
            "beginner": "badge-green",
            "intermediate": "badge-amber",
            "advanced": "badge-purple"
        }.get(ex_data["difficulty"], "badge-blue")

        st.markdown("---")
        st.markdown(f"""
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:15px;">
            <span class="badge {diff_badge_class}">{ex_data['difficulty']}</span>
            <span class="badge badge-blue">{ex_data['question_type']}</span>
            <span style="font-size: 14px; color: #94a3b8;">Topic: <strong>{ex_data['topic']}</strong></span>
        </div>
        """, unsafe_allow_html=True)

        # Question card
        st.info(f"### Problem Statement\n\n{ex.get('question', 'Error loading question.')}")

        # If MCQ, provide interactive answering
        options = ex.get("options")
        if options and isinstance(options, dict):
            st.markdown("##### Select your answer:")
            user_choice = st.radio(
                "Options:",
                options=[f"({k}) {v}" for k, v in options.items()],
                index=None,
                key="student_quiz_choice"
            )
            if user_choice:
                selected_letter = user_choice[1]
                correct_letter = str(ex.get("solution", "")).strip().upper()
                if correct_letter and selected_letter in correct_letter:
                    st.success(f"🎉 Correct! The answer is ({selected_letter}).")
                else:
                    st.error(f"❌ Not quite right. Review the official solution below.")

        # Expandable Official Solution & Rubric
        with st.expander("📖 View Official Solution & Detailed Explanation", expanded=False):
            st.markdown(f"**Expected Solution / Answer:** `{ex.get('solution')}`")
            st.markdown("##### Detailed Explanation:")
            st.markdown(ex.get("explanation", "N/A"))

        with st.expander("📋 View Instructor Marking Rubric", expanded=False):
            rubric = ex.get("marking_rubric", [])
            total_pts = ex.get("total_points", 2.0)
            st.markdown(f"**Total Points Available:** `{total_pts} pts`")
            if isinstance(rubric, list):
                for idx, item in enumerate(rubric, 1):
                    if isinstance(item, dict):
                        st.markdown(f"- **Criterion {idx}:** {item.get('criterion', '')} (`{item.get('points', 1.0)} pt`)")
                    else:
                        st.markdown(f"- {item}")

        if ex_data.get("grounding_sources"):
            with st.expander("🔍 Verified Grounding Sources", expanded=False):
                for src in ex_data["grounding_sources"]:
                    st.markdown(f"- `{src}`")


# ==========================================
# TAB 3: SUBMISSION EVALUATOR & RUBRIC GRADER
# ==========================================
with tab_evaluator:
    st.markdown("#### ⚖️ Automated Submission Evaluator & Rubric Grader")
    st.caption("Evaluates student theoretical answers or Python code against an instructor marking grid with granular scoring and feedback.")

    # Preset problem selector
    preset_choice = st.selectbox(
        "Load Preset Exam Problem & Rubric:",
        options=[
            "Custom Problem (Type your own)",
            "Exam Q1: Scaled Dot-Product Attention Variance & Softmax",
            "Exam Q2: Naive Bayes with Bigram LM Sentiment Classification",
            "Exam Q3: Chomsky Normal Form CNF Conversion Rules"
        ]
    )

    default_problem = ""
    default_rubric = ""
    default_submission = ""

    if preset_choice == "Exam Q1: Scaled Dot-Product Attention Variance & Softmax":
        default_problem = "Explain why we divide by sqrt(d_k) in the Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V."
        default_rubric = """Total Points: 2.0
Criteria:
1. Explains that the variance of the dot product grows linearly with dimension d_k, so standard deviation is sqrt(d_k). (1.0 pt)
2. Explains that large dot product values push softmax into saturated regions with vanishing gradients. (1.0 pt)"""
        default_submission = "Because without dividing, the dot product values get very high, causing the softmax function to saturate where gradients are near zero."

    elif preset_choice == "Exam Q2: Naive Bayes with Bigram LM Sentiment Classification":
        default_problem = "Explain why add-1 (Laplace) smoothing is required when incorporating bigram features into Naive Bayes, and write the formula."
        default_rubric = """Total Points: 2.0
Criteria:
1. Explains the zero-frequency problem (unseen bigrams causing zero probability for the whole document). (1.0 pt)
2. States the Laplace smoothing equation: P(w_i | w_{i-1}, c) = (count(w_{i-1}, w_i, c) + 1) / (count(w_{i-1}, c) + |V|). (1.0 pt)"""
        default_submission = "We need Laplace smoothing because if a bigram was not seen during training, its probability is 0, which makes the whole product 0. The formula is P = (count + 1)/(total + V)."

    elif preset_choice == "Exam Q3: Chomsky Normal Form CNF Conversion Rules":
        default_problem = "State the required format of production rules in Chomsky Normal Form (CNF) and list the conversion steps from CFG."
        default_rubric = """Total Points: 2.0
Criteria:
1. States that CNF rules must strictly be A -> B C (two non-terminals) or A -> a (single terminal). (1.0 pt)
2. Lists key conversion steps: eliminate epsilon productions, eliminate unit productions, and binarize long rules (>2 symbols). (1.0 pt)"""
        default_submission = "CNF rules must have 2 non terminals or 1 terminal symbol. Steps: remove epsilon rules and unit productions."

    col_prob, col_sub = st.columns(2)
    with col_prob:
        eval_problem = st.text_area("Problem Statement:", value=default_problem, height=140)
        eval_rubric = st.text_area("Instructor Marking Rubric:", value=default_rubric, height=140)
    with col_sub:
        eval_student_answer = st.text_area("Student Submission (Text or Code):", value=default_submission, height=325)

    if st.button("📊 Evaluate Submission Against Rubric", type="primary", use_container_width=True):
        if not eval_problem or not eval_rubric or not eval_student_answer:
            st.warning("Please provide Problem Statement, Rubric, and Student Submission.")
        else:
            with st.spinner("Evaluating submission with strict rubric alignment..."):
                evaluator = get_evaluator(selected_model)
                eval_res = evaluator.grade(
                    problem_statement=eval_problem,
                    marking_scheme=eval_rubric,
                    student_submission=eval_student_answer
                )
                st.session_state["eval_result"] = eval_res

    if "eval_result" in st.session_state:
        eval_out = st.session_state["eval_result"].get("evaluation", {})
        
        st.markdown("---")
        st.markdown("### 🏆 Evaluation Results & Scorecard")
        
        earned = eval_out.get("earned_score", 0.0)
        total = eval_out.get("total_score", 2.0)
        percentage = round((earned / total) * 100, 1) if total > 0 else 0.0
        
        score_color = "#22c55e" if percentage >= 80 else ("#f59e0b" if percentage >= 50 else "#ef4444")
        
        col_m1, col_m2, col_m3 = st.columns([1, 1, 2])
        with col_m1:
            st.markdown(f"""
            <div class="scorecard">
                <div style="color: #94a3b8; font-size: 13px;">EARNED SCORE</div>
                <div class="score-number" style="color: {score_color};">{earned} / {total}</div>
                <div style="font-size: 12px; color: #94a3b8;">Total Marks</div>
            </div>
            """, unsafe_allow_html=True)
            
        with col_m2:
            st.markdown(f"""
            <div class="scorecard">
                <div style="color: #94a3b8; font-size: 13px;">MASTERY LEVEL</div>
                <div class="score-number" style="color: {score_color};">{percentage}%</div>
                <div style="font-size: 12px; color: #94a3b8;">{'Excellent' if percentage >= 80 else ('Partial Credit' if percentage >= 50 else 'Needs Work')}</div>
            </div>
            """, unsafe_allow_html=True)
            
        with col_m3:
            st.markdown(f"**Instructor Summary:**")
            st.write(eval_out.get("actionable_feedback", "No feedback available."))

        # Criteria breakdown table
        st.markdown("##### 📋 Criteria-by-Criteria Breakdown")
        breakdown = eval_out.get("criteria_breakdown", [])
        if breakdown:
            for item in breakdown:
                status = item.get("status", "").lower()
                status_icon = "✅ Passed" if "pass" in status else ("⚠️ Partial" if "part" in status else "❌ Failed")
                status_badge = "badge-green" if "pass" in status else ("badge-amber" if "part" in status else "badge-purple")
                
                with st.container():
                    st.markdown(f"""
                    <div style="background: #1e293b; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <strong>{item.get('criterion', '')}</strong>
                            <div>
                                <span class="badge {status_badge}">{status_icon}</span>
                                <span style="font-weight: 700; margin-left: 8px;">{item.get('points_awarded', 0)} / {item.get('max_points', 0)} pts</span>
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #94a3b8;">{item.get('comment', '')}</div>
                    </div>
                    """, unsafe_allow_html=True)

        # Strengths & Weaknesses columns
        col_str, col_weak = st.columns(2)
        with col_str:
            st.markdown("##### 🌟 Demonstrated Strengths")
            strengths = eval_out.get("strengths", [])
            if strengths:
                for s in strengths:
                    st.markdown(f"""<div class="card-strength">{s}</div>""", unsafe_allow_html=True)
            else:
                st.caption("None recorded.")

        with col_weak:
            st.markdown("##### ⚠️ Key Points for Improvement")
            weaknesses = eval_out.get("weaknesses", [])
            if weaknesses:
                for w in weaknesses:
                    st.markdown(f"""<div class="card-weakness">{w}</div>""", unsafe_allow_html=True)
            else:
                st.caption("None recorded.")


# ==========================================
# TAB 4: COURSE KNOWLEDGE EXPLORER
# ==========================================
with tab_explorer:
    st.markdown("#### 🔍 Direct Course Vector Search")
    st.caption("Search across 913 slide chunks in ChromaDB to inspect raw course materials, definitions, and formulas.")

    search_query = st.text_input(
        "Search syllabus query:",
        value="Scaled dot product attention formula",
        placeholder="e.g., Levenshtein distance dynamic programming, BERT masked tokens, perplexity..."
    )
    
    col_k, col_cat = st.columns([1, 2])
    with col_k:
        exp_top_k = st.slider("Result Count", 2, 10, 4)
    with col_cat:
        cat_filter = st.selectbox("Document Category", ["All", "lectures", "exams_and_quizzes"])

    if st.button("🔎 Search Knowledge Base", type="primary"):
        with st.spinner("Searching ChromaDB with qwen3-embedding:4b..."):
            retriever = get_retriever()
            chosen_cat = None if cat_filter == "All" else cat_filter
            results = retriever.retrieve(search_query, top_k=exp_top_k, category=chosen_cat)
            
            st.markdown(f"**Found {len(results)} relevant slide chunks:**")
            for idx, r in enumerate(results, 1):
                sim_pct = round(r["similarity_score"] * 100, 1)
                st.markdown(f"""
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #60a5fa;">{r['citation']}</span>
                        <span class="badge badge-green">Relevance: {sim_pct}%</span>
                    </div>
                    <div style="font-size: 13px; color: #cbd5e1; white-space: pre-wrap; font-family: 'JetBrains Mono', monospace;">{r['text'][:500]}...</div>
                </div>
                """, unsafe_allow_html=True)
