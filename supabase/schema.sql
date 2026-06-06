-- μάθημα Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  grade_id TEXT,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  grade_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  current_level INT DEFAULT 1,
  completed_exercises INT DEFAULT 0,
  mastered_concepts TEXT[] DEFAULT '{}',
  total_xp INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, grade_id, chapter_id)
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress" ON progress FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STREAKS
-- ============================================================
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_study_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own streak" ON streaks FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- XP / LEADERBOARD
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  grade_id TEXT NOT NULL,
  xp INT DEFAULT 0,
  rank INT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, grade_id)
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard is public" ON leaderboard FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own leaderboard" ON leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RPC to add XP atomically
CREATE OR REPLACE FUNCTION add_xp(user_id UUID, amount INT, reason TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO leaderboard (user_id, grade_id, xp)
  VALUES (user_id, 'global', amount)
  ON CONFLICT (user_id, grade_id)
  DO UPDATE SET xp = leaderboard.xp + amount, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- WRONG ANSWERS (for adaptive quiz)
-- ============================================================
CREATE TABLE IF NOT EXISTS wrong_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  grade_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  concept TEXT NOT NULL,
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wrong answers" ON wrong_answers FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- BATTLES
-- ============================================================
CREATE TABLE IF NOT EXISTS battles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenger_id UUID REFERENCES auth.users(id),
  opponent_id UUID REFERENCES auth.users(id),
  grade_id TEXT,
  chapter_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  challenger_score INT DEFAULT 0,
  opponent_score INT DEFAULT 0,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own battles" ON battles FOR SELECT USING (
  auth.uid() = challenger_id OR auth.uid() = opponent_id
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_user ON wrong_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_concept ON wrong_answers(concept);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(xp DESC);
