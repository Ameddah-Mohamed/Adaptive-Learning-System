"""
Reference Materials Semantic Chunker (Phase 3).
Parses extracted textbook chapters (Jurafsky & Martin SLP3) and research papers,
splitting them into clean, metadata-enriched chunks for the 'reference_kb' ChromaDB collection.
"""

import re
import json
from pathlib import Path
from typing import List, Dict, Any


def chunk_markdown_pages(md_file: Path, category: str) -> List[Dict[str, Any]]:
    content = md_file.read_text(encoding="utf-8")
    doc_stem = md_file.stem
    
    # Extract Title from first header if available
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    doc_title = title_match.group(1).strip() if title_match else doc_stem
    
    # Extract Chapter number if textbook
    ch_match = re.search(r"ch(\d+)", doc_stem, re.IGNORECASE)
    chapter_num = int(ch_match.group(1)) if ch_match else None
    
    # Split on ### Page (\d+)
    page_pattern = re.compile(r"^###\s+Page\s+(\d+)", re.MULTILINE)
    splits = page_pattern.split(content)
    
    chunks = []
    
    # Alternate: [page_num, page_text, page_num, page_text, ...]
    for i in range(1, len(splits), 2):
        page_num = int(splits[i])
        raw_text = splits[i+1].strip() if i+1 < len(splits) else ""
        
        # Clean horizontal rules
        text = re.sub(r"^-{3,}$", "", raw_text, flags=re.MULTILINE).strip()
        if not text or len(text) < 40:
            continue
            
        # If page is very large (> 2500 chars), split into sub-page sections
        MAX_CHUNK_CHARS = 2200
        if len(text) > MAX_CHUNK_CHARS:
            paragraphs = text.split("\n\n")
            current_sub = []
            current_len = 0
            part_idx = 1
            
            for para in paragraphs:
                p = para.strip()
                if not p:
                    continue
                if current_len + len(p) > MAX_CHUNK_CHARS and current_sub:
                    sub_text = "\n\n".join(current_sub)
                    chunk_id = f"{doc_stem}_p{page_num}_part{part_idx}"
                    enriched = (
                        f"Document: {doc_title}\n"
                        f"Page: {page_num} (Part {part_idx})\n"
                        f"Category: {category}\n\n"
                        f"{sub_text}"
                    )
                    chunks.append({
                        "id": chunk_id,
                        "document": doc_title,
                        "chapter": chapter_num,
                        "page_num": page_num,
                        "part": part_idx,
                        "category": category,
                        "text": sub_text,
                        "enriched_text": enriched
                    })
                    part_idx += 1
                    current_sub = [p]
                    current_len = len(p)
                else:
                    current_sub.append(p)
                    current_len += len(p)
                    
            if current_sub:
                sub_text = "\n\n".join(current_sub)
                chunk_id = f"{doc_stem}_p{page_num}_part{part_idx}"
                enriched = (
                    f"Document: {doc_title}\n"
                    f"Page: {page_num} (Part {part_idx})\n"
                    f"Category: {category}\n\n"
                    f"{sub_text}"
                )
                chunks.append({
                    "id": chunk_id,
                    "document": doc_title,
                    "chapter": chapter_num,
                    "page_num": page_num,
                    "part": part_idx,
                    "category": category,
                    "text": sub_text,
                    "enriched_text": enriched
                })
        else:
            chunk_id = f"{doc_stem}_p{page_num}"
            enriched = (
                f"Document: {doc_title}\n"
                f"Page: {page_num}\n"
                f"Category: {category}\n\n"
                f"{text}"
            )
            chunks.append({
                "id": chunk_id,
                "document": doc_title,
                "chapter": chapter_num,
                "page_num": page_num,
                "part": 1,
                "category": category,
                "text": text,
                "enriched_text": enriched
            })
            
    return chunks


def chunk_all_reference_materials(base_dir: Path, output_file: Path) -> List[Dict[str, Any]]:
    output_file.parent.mkdir(parents=True, exist_ok=True)
    all_chunks = []
    
    categories = [
        ("textbook", "Jurafsky & Martin SLP3 Chapters"),
        ("papers", "Landmark Research Papers")
    ]
    
    for cat_name, cat_desc in categories:
        cat_dir = base_dir / cat_name
        if not cat_dir.exists():
            continue
            
        md_files = sorted(cat_dir.glob("*.md"))
        print(f"\nChunking {cat_desc} ({len(md_files)} files in '{cat_name}')...")
        for md in md_files:
            file_chunks = chunk_markdown_pages(md, cat_name)
            all_chunks.extend(file_chunks)
            print(f"  [✓] {md.name}: {len(file_chunks)} chunks")
            
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)
        
    print(f"\nTotal Reference Chunks: {len(all_chunks)}")
    print(f"Saved to: {output_file}")
    return all_chunks


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[2]
    processed_md = project_root / "data" / "processed" / "markdown"
    out_json = project_root / "data" / "processed" / "chunks" / "reference_chunks.json"
    chunk_all_reference_materials(processed_md, out_json)
