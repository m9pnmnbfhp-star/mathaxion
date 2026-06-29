"""
Reads PDFs from books/ folder, chunks them, and inserts into Supabase.
Run once: python scripts/ingest-books.py
"""

import os
import re
import fitz
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

SUPABASE_URL = os.environ["VITE_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 150

BOOKS = [
    ("a-dimotikou",  "mathimatika",  "books/a-dimotikou/mathimatika-a.pdf"),
    ("a-dimotikou",  "mathimatika",  "books/a-dimotikou/mathimatika-b.pdf"),
    ("b-dimotikou",  "mathimatika",  "books/b-dimotikou/mathimatika-a.pdf"),
    ("b-dimotikou",  "mathimatika",  "books/b-dimotikou/mathimatika-b.pdf"),
    ("g-dimotikou",  "mathimatika",  "books/g-dimotikou/mathimatika.pdf"),
    ("d-dimotikou",  "mathimatika",  "books/d-dimotikou/mathimatika.pdf"),
    ("e-dimotikou",  "mathimatika",  "books/e-dimotikou/mathimatika-a.pdf"),
    ("e-dimotikou",  "mathimatika",  "books/e-dimotikou/mathimatika-b.pdf"),
    ("st-dimotikou", "mathimatika",  "books/st-dimotikou/mathimatika.pdf"),
    ("a-gymnasiou",  "mathimatika",  "books/a-gymnasiou/mathimatika.pdf"),
    ("b-gymnasiou",  "mathimatika",  "books/b-gymnasiou/mathimatika.pdf"),
    ("g-gymnasiou",  "mathimatika",  "books/g-gymnasiou/mathimatika.pdf"),
    ("a-lykeiou",    "algebra",      "books/a-lykeiou/algebra.pdf"),
    ("a-lykeiou",    "lyseis",       "books/a-lykeiou/algebra-lyseis.pdf"),
    ("a-lykeiou",    "geometria",    "books/a-lykeiou/geometria.pdf"),
    ("a-lykeiou",    "lyseis",       "books/a-lykeiou/geometria-lyseis.pdf"),
    ("b-lykeiou",    "algebra",      "books/b-lykeiou/algebra.pdf"),
    ("b-lykeiou",    "lyseis",       "books/b-lykeiou/algebra-lyseis.pdf"),
    ("b-lykeiou",    "geometria",    "books/b-lykeiou/geometria.pdf"),
    ("b-lykeiou",    "lyseis",       "books/b-lykeiou/geometria-lyseis.pdf"),
]

def clean_text(text):
    return re.sub(r'\x00', '', text)

def extract_text_from_pdf(path):
    doc = fitz.open(path)
    pages = []
    for i, page in enumerate(doc):
        text = clean_text(page.get_text("text").strip())
        if text:
            pages.append((i + 1, text))
    doc.close()
    return pages

def chunk_text(text, page_number, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    start = 0
    idx = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append({"page_number": page_number, "chunk_index": idx, "content": chunk})
            idx += 1
        start += chunk_size - overlap
    return chunks

def ingest_book(grade_id, book_type, rel_path):
    root = os.path.join(os.path.dirname(__file__), "..")
    path = os.path.join(root, rel_path)
    if not os.path.exists(path):
        print("  SKIP (not found): " + rel_path)
        return
    print("  Reading " + rel_path + "...")
    pages = extract_text_from_pdf(path)
    all_chunks = []
    for page_num, text in pages:
        all_chunks.extend(chunk_text(text, page_num))
    print("  " + str(len(pages)) + " pages -> " + str(len(all_chunks)) + " chunks -- inserting...")
    supabase.table("book_chunks").delete().eq("grade_id", grade_id).eq("book_type", book_type).execute()
    batch = []
    for chunk in all_chunks:
        batch.append({
            "grade_id": grade_id,
            "book_type": book_type,
            "page_number": chunk["page_number"],
            "chunk_index": chunk["chunk_index"],
            "content": chunk["content"],
        })
        if len(batch) == 100:
            supabase.table("book_chunks").insert(batch).execute()
            batch = []
    if batch:
        supabase.table("book_chunks").insert(batch).execute()
    print("  Done (" + str(len(all_chunks)) + " chunks)")

def main():
    print("MathAxion Book Ingestion")
    print("=" * 40)
    for grade_id, book_type, path in BOOKS:
        print("\n[" + grade_id + " / " + book_type + "]")
        ingest_book(grade_id, book_type, path)
    print("\nAll books ingested successfully!")

if __name__ == "__main__":
    main()