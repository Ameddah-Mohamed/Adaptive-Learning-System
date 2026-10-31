"""
PDF Extraction Script for NLP Course Materials.
Extracts slide-by-slide text from raw lecture and exam PDFs into structured Markdown files.
"""

import os
from pathlib import Path
from pypdf import PdfReader


def extract_pdf_to_markdown(pdf_path: Path, output_dir: Path) -> Path:
    reader = PdfReader(str(pdf_path))
    doc_title = pdf_path.stem
    output_file = output_dir / f"{doc_title}.md"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"# {doc_title}\n\n")
        f.write(f"- **Source File**: `{pdf_path.name}`\n")
        f.write(f"- **Total Pages**: {len(reader.pages)}\n\n---\n\n")
        
        for idx, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            cleaned_text = "\n".join(
                line.strip() for line in text.splitlines() if line.strip()
            )
            f.write(f"## Slide / Page {idx}\n\n")
            f.write(cleaned_text if cleaned_text else "*(No extractable text on this page)*")
            f.write("\n\n---\n\n")
            
    return output_file


def process_all_materials(raw_base: Path, processed_base: Path):
    processed_base.mkdir(parents=True, exist_ok=True)
    
    categories = ["lectures", "exams_and_quizzes"]
    total_processed = 0
    
    for category in categories:
        src_dir = raw_base / category
        out_dir = processed_base / category
        out_dir.mkdir(parents=True, exist_ok=True)
        
        if not src_dir.exists():
            continue
            
        pdf_files = sorted(src_dir.glob("*.pdf"))
        print(f"Found {len(pdf_files)} PDF(s) in {category}...")
        
        for pdf in pdf_files:
            md_path = extract_pdf_to_markdown(pdf, out_dir)
            print(f"  [✓] Extracted: {pdf.name} -> {md_path.name}")
            total_processed += 1
            
    print(f"\nDone! Extracted {total_processed} documents into {processed_base}")


if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    raw_dir = PROJECT_ROOT / "data" / "raw"
    processed_dir = PROJECT_ROOT / "data" / "processed" / "markdown"
    process_all_materials(raw_dir, processed_dir)
