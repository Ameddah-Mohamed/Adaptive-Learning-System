"""
Slide-aware Semantic Chunker for NLP Course Materials.
Parses extracted markdown lecture files and breaks them into clean, 
metadata-enriched chunks based on slide/page boundaries and section headers.
"""

import re
import json
from pathlib import Path
from typing import List, Dict, Any


def parse_markdown_slides(md_file: Path, category: str) -> List[Dict[str, Any]]:
    content = md_file.read_text(encoding="utf-8")
    doc_title = md_file.stem
    
    # Extract Chapter info if available
    chapter_match = re.search(r"Chapter\s+(\d+)", doc_title, re.IGNORECASE)
    chapter_num = int(chapter_match.group(1)) if chapter_match else None
    
    # Split by slide header: ## Slide / Page X
    slide_pattern = re.compile(r"^##\s+Slide\s*/\s*Page\s+(\d+)", re.MULTILINE)
    splits = slide_pattern.split(content)
    
    chunks = []
    
    # splits[0] is preamble before first slide
    # After that, it alternates: [slide_num, slide_content, slide_num, slide_content, ...]
    for i in range(1, len(splits), 2):
        slide_num = int(splits[i])
        raw_slide_text = splits[i+1].strip() if i+1 < len(splits) else ""
        
        # Remove markdown horizontal rules
        slide_text = re.sub(r"^-{3,}$", "", raw_slide_text, flags=re.MULTILINE).strip()
        
        # Ignore empty slides or placeholder text
        if not slide_text or "*(No extractable text on this page)*" in slide_text:
            continue
            
        # Ignore extremely short slides (e.g. only title page or single page number)
        lines = [line.strip() for line in slide_text.splitlines() if line.strip()]
        if len(lines) <= 1 and len(slide_text) < 30:
            continue
            
        chunk_id = f"{doc_title}_p{slide_num}"
        
        # Build enriched text chunk with context header for better embedding representation
        enriched_content = (
            f"Document: {doc_title}\n"
            f"Page/Slide: {slide_num}\n"
            f"Category: {category}\n\n"
            f"{slide_text}"
        )
        
        chunk = {
            "id": chunk_id,
            "document": doc_title,
            "chapter": chapter_num,
            "slide_num": slide_num,
            "category": category,
            "text": slide_text,
            "enriched_text": enriched_content
        }
        chunks.append(chunk)
        
    return chunks


def chunk_all_materials(markdown_base: Path, output_file: Path) -> List[Dict[str, Any]]:
    output_file.parent.mkdir(parents=True, exist_ok=True)
    all_chunks = []
    
    for category in ["lectures", "exams_and_quizzes"]:
        cat_dir = markdown_base / category
        if not cat_dir.exists():
            continue
            
        md_files = sorted(cat_dir.glob("*.md"))
        print(f"Chunking {len(md_files)} file(s) in category: '{category}'...")
        
        for md in md_files:
            chunks = parse_markdown_slides(md, category)
            all_chunks.extend(chunks)
            print(f"  - {md.name}: {len(chunks)} slide chunks")
            
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)
        
    print(f"\nTotal chunks generated: {len(all_chunks)}")
    print(f"Saved to: {output_file}")
    return all_chunks


if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    md_dir = PROJECT_ROOT / "data" / "processed" / "markdown"
    out_json = PROJECT_ROOT / "data" / "processed" / "chunks" / "course_chunks.json"
    chunk_all_materials(md_dir, out_json)
