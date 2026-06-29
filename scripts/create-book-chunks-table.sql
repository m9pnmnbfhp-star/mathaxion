-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS book_chunks (
  id bigserial PRIMARY KEY,
  grade_id text NOT NULL,
  book_type text NOT NULL,  -- 'mathimatika', 'algebra', 'geometria', 'lyseis'
  page_number int,
  chunk_index int NOT NULL,
  content text NOT NULL,
  fts tsvector GENERATED ALWAYS AS (to_tsvector('greek', content)) STORED,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_chunks_fts_idx ON book_chunks USING gin(fts);
CREATE INDEX IF NOT EXISTS book_chunks_grade_idx ON book_chunks (grade_id);
