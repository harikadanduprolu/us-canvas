-- Essential Question Bucket Setup (Minimal Version)
-- Run this in your Supabase SQL Editor to fix the 404 error

-- Create question_bucket table
CREATE TABLE IF NOT EXISTS question_bucket (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL UNIQUE,
  category VARCHAR(50) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create question_usage table
CREATE TABLE IF NOT EXISTS question_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bucket(id) ON DELETE CASCADE,
  used_date DATE NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(couple_id, question_id, year)
);

-- Add year column to existing daily_questions table
ALTER TABLE daily_questions 
ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_usage_couple_year ON question_usage(couple_id, year);
CREATE INDEX IF NOT EXISTS idx_question_usage_date ON question_usage(used_date);
CREATE INDEX IF NOT EXISTS idx_daily_questions_year ON daily_questions(couple_id, year, date);

-- Enable RLS
ALTER TABLE question_bucket ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_usage ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now)
CREATE POLICY "Allow all operations on question_bucket" ON question_bucket FOR ALL USING (true);
CREATE POLICY "Allow all operations on question_usage" ON question_usage FOR ALL USING (true);

-- Insert starter questions to test
INSERT INTO question_bucket (question_text, category) VALUES
('What made you smile today?', 'connection'),
('What''s one thing you''re grateful for about our relationship?', 'gratitude'),
('If you could plan our perfect date night, what would it be?', 'romance'),
('What''s your favorite memory of us from this week?', 'memories'),
('What''s something new you''d like to try together?', 'future'),
('How did you feel loved by me today?', 'romance'),
('What''s one goal we should work on together?', 'growth'),
('What''s your favorite thing about coming home to me?', 'connection'),
('What''s something about me that always makes you laugh?', 'fun'),
('What''s a dream you have for our future?', 'future'),
('What''s something you''re grateful for today?', 'gratitude'),
('How can I support you better?', 'growth'),
('What''s your favorite way to spend time together?', 'connection'),
('What adventure should we go on next?', 'future'),
('What makes you feel most connected to me?', 'connection'),
('What''s something new you learned this week?', 'growth'),
('What''s a goal you''re working towards?', 'growth'),
('What''s your love language?', 'romance'),
('What tradition should we start together?', 'future'),
('What''s your favorite thing about our relationship?', 'connection')
ON CONFLICT (question_text) DO NOTHING;

-- Verify setup
SELECT 'Setup completed successfully! Question bucket has ' || COUNT(*) || ' questions.' as status
FROM question_bucket;
