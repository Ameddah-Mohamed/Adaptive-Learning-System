"""
Reference Materials Extraction Script (Phase 2).
Extracts selected syllabus chapters from Jurafsky & Martin (SLP3)
and landmark NLP research papers into structured Markdown files.
"""

from pathlib import Path
from pypdf import PdfReader


SYLLABUS_CHAPTERS = [
    {
        "filename": "slp3_ch02_words_and_tokens.md",
        "title": "SLP3 Chapter 02: Words and Tokens (Tokenization, BPE, Edit Distance)",
        "start_page": 40,
        "end_page": 74,
    },
    {
        "filename": "slp3_ch03_ngram_language_models.md",
        "title": "SLP3 Chapter 03: N-gram Language Models and Perplexity",
        "start_page": 75,
        "end_page": 98,
    },
    {
        "filename": "slp3_ch05_logistic_regression.md",
        "title": "SLP3 Chapter 05: Logistic Regression and Sentiment Classification",
        "start_page": 99,
        "end_page": 133,
    },
    {
        "filename": "slp3_ch06_vector_embeddings.md",
        "title": "SLP3 Chapter 06: Vector Semantics and Embeddings (Word2Vec, Skip-Gram)",
        "start_page": 134,
        "end_page": 157,
    },
    {
        "filename": "slp3_ch07_neural_networks.md",
        "title": "SLP3 Chapter 07: Neural Networks and Neural Language Models",
        "start_page": 158,
        "end_page": 183,
    },
    {
        "filename": "slp3_ch09_transformers.md",
        "title": "SLP3 Chapter 09: Transformers and Pretraining (Self-Attention)",
        "start_page": 184,
        "end_page": 215,
    },
    {
        "filename": "slp3_ch10_post_training_llms.md",
        "title": "SLP3 Chapter 10: Post-training of Large Language Models (SFT, Alignment)",
        "start_page": 216,
        "end_page": 233,
    },
    {
        "filename": "slp3_ch11_masked_language_models.md",
        "title": "SLP3 Chapter 11: Masked Language Models (BERT, RoBERTa)",
        "start_page": 234,
        "end_page": 249,
    },
    {
        "filename": "slp3_ch14_retrieval_and_rag.md",
        "title": "SLP3 Chapter 14: Retrieval-based Models and Question Answering (RAG)",
        "start_page": 259,
        "end_page": 281,
    },
    {
        "filename": "slp3_ch08_rnns_and_lstms.md",
        "title": "SLP3 Chapter 08: RNNs and LSTMs",
        "start_page": 309,
        "end_page": 334,
    },
    {
        "filename": "slp3_ch18_cfg_constituency_parsing.md",
        "title": "SLP3 Chapter 18: Context-Free Grammars and Constituency Parsing (CKY Algorithm)",
        "start_page": 432,
        "end_page": 455,
    },
    {
        "filename": "slp3_ch19_dependency_parsing.md",
        "title": "SLP3 Chapter 19: Dependency Parsing (Transition & Graph-based Parsing)",
        "start_page": 456,
        "end_page": 479,
    },
]


def extract_pages(reader: PdfReader, start_page: int, end_page: int) -> str:
    """Extract and clean text across a page range (1-indexed inclusive)."""
    extracted = []
    # Convert to 0-indexed
    start_idx = max(0, start_page - 1)
    end_idx = min(len(reader.pages), end_page)

    for idx in range(start_idx, end_idx):
        page_num = idx + 1
        page = reader.pages[idx]
        text = page.extract_text() or ""
        # Clean null bytes and weird unicode artifacts from font maps
        text = text.replace("\x00", "").replace("\ufeff", "")
        cleaned = "\n".join(line.strip() for line in text.splitlines() if line.strip())
        if cleaned:
            extracted.append(f"### Page {page_num}\n\n{cleaned}")
    return "\n\n---\n\n".join(extracted)


def extract_full_pdf(pdf_path: Path, output_file: Path, title: str):
    """Extract an entire PDF (such as a paper) into Markdown."""
    reader = PdfReader(str(pdf_path))
    content = extract_pages(reader, 1, len(reader.pages))

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"# {title}\n\n")
        f.write(f"- **Source File**: `{pdf_path.name}`\n")
        f.write(f"- **Total Pages**: {len(reader.pages)}\n\n---\n\n")
        f.write(content)


def run_phase_2_extraction():
    project_root = Path(__file__).resolve().parents[2]
    raw_textbook = project_root / "data" / "raw" / "textbooks" / "jurafsky_martin_slp3.pdf"
    raw_papers_dir = project_root / "data" / "raw" / "papers"

    out_textbook_dir = project_root / "data" / "processed" / "markdown" / "textbook"
    out_papers_dir = project_root / "data" / "processed" / "markdown" / "papers"

    out_textbook_dir.mkdir(parents=True, exist_ok=True)
    out_papers_dir.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("PHASE 2: Selective Reference Materials Extraction")
    print("==================================================")

    # 1. Process Textbook
    if raw_textbook.exists():
        print(f"\n[1/2] Processing Textbook: {raw_textbook.name}...")
        reader = PdfReader(str(raw_textbook))
        print(f"      Total Book Pages: {len(reader.pages)}")

        for ch in SYLLABUS_CHAPTERS:
            out_file = out_textbook_dir / ch["filename"]
            content = extract_pages(reader, ch["start_page"], ch["end_page"])
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(f"# {ch['title']}\n\n")
                f.write(f"- **Source Book**: Jurafsky & Martin (Speech and Language Processing, 3rd ed.)\n")
                f.write(f"- **Page Range**: {ch['start_page']}–{ch['end_page']}\n\n---\n\n")
                f.write(content)
            print(f"  [✓] Extracted: {ch['title']} -> {ch['filename']} ({ch['start_page']}–{ch['end_page']})")
    else:
        print(f"[!] Warning: Textbook not found at {raw_textbook}")

    # 2. Process Papers
    paper_configs = [
        ("vaswani2017_attention.pdf", "vaswani2017_attention.md", "Attention Is All You Need (Vaswani et al., 2017)"),
        ("devlin2018_bert.pdf", "devlin2018_bert.md", "BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al., 2018)"),
        ("hu2021_lora.pdf", "hu2021_lora.md", "LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)"),
        ("mikolov2013_word2vec.pdf", "mikolov2013_word2vec.md", "Efficient Estimation of Word Representations in Vector Space (Mikolov et al., 2013)"),
    ]

    print(f"\n[2/2] Processing Research Papers ({len(paper_configs)} papers)...")
    for pdf_name, md_name, paper_title in paper_configs:
        pdf_path = raw_papers_dir / pdf_name
        if pdf_path.exists():
            out_file = out_papers_dir / md_name
            extract_full_pdf(pdf_path, out_file, paper_title)
            print(f"  [✓] Extracted Paper: {paper_title} -> {md_name}")
        else:
            print(f"  [!] Missing paper: {pdf_name}")

    print("\nPhase 2 Extraction Complete!")
    print(f"  Textbook chapters: {out_textbook_dir}")
    print(f"  Research papers:   {out_papers_dir}")


if __name__ == "__main__":
    run_phase_2_extraction()
