-- Fix for: Could not find the table 'public.question_bucket'
-- Run this entire script in Supabase SQL Editor

-- Create question_bucket table
CREATE TABLE public.question_bucket (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL UNIQUE,
  category VARCHAR(50) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create question_usage table  
CREATE TABLE public.question_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.question_bucket(id) ON DELETE CASCADE,
  used_date DATE NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(couple_id, question_id, year)
);

-- Add year column to daily_questions (if not exists)
ALTER TABLE public.daily_questions 
ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_question_bucket_category ON public.question_bucket(category);
CREATE INDEX IF NOT EXISTS idx_question_bucket_active ON public.question_bucket(is_active);
CREATE INDEX IF NOT EXISTS idx_question_usage_couple_year ON public.question_usage(couple_id, year);
CREATE INDEX IF NOT EXISTS idx_question_usage_date ON public.question_usage(used_date);
CREATE INDEX IF NOT EXISTS idx_daily_questions_year ON public.daily_questions(couple_id, year, date);

-- Enable Row Level Security
ALTER TABLE public.question_bucket ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now)
CREATE POLICY "Allow all operations on question_bucket" ON public.question_bucket FOR ALL USING (true);
CREATE POLICY "Allow all operations on question_usage" ON public.question_usage FOR ALL USING (true);

-- Insert starter questions for testing
INSERT INTO public.question_bucket (question_text, category, is_active) VALUES
('What made you smile today?', 'connection', true),
('What''s one thing you''re grateful for about our relationship?', 'gratitude', true),
('If you could plan our perfect date night, what would it be?', 'romance', true),
('What''s your favorite memory of us from this week?', 'memories', true),
('What''s something new you''d like to try together?', 'future', true),
('How did you feel loved by me today?', 'romance', true),
('What''s one goal we should work on together?', 'growth', true),
('What''s your favorite thing about coming home to me?', 'connection', true),
('What''s something about me that always makes you laugh?', 'fun', true),
('What''s a dream you have for our future?', 'future', true),
('What''s something you''re grateful for today?', 'gratitude', true),
('How can I support you better?', 'growth', true),
('What''s your favorite way to spend time together?', 'connection', true),
('What adventure should we go on next?', 'future', true),
('What makes you feel most connected to me?', 'connection', true),
('What''s something new you learned this week?', 'growth', true),
('What''s a goal you''re working towards?', 'growth', true),
('What''s your love language?', 'romance', true),
('What tradition should we start together?', 'future', true),
('What''s your favorite thing about our relationship?', 'connection', true),
('What''s something that always makes you laugh?', 'fun', true),
('What''s a quality you admire in me?', 'gratitude', true),
('What''s your ideal date night?', 'romance', true),
('What''s a compliment you wish you heard more often?', 'romance', true),
('What''s something you want to learn together?', 'growth', true),
('What''s your favorite season and why?', 'connection', true),
('What''s a small gesture that means a lot to you?', 'romance', true),
('What''s your favorite way to celebrate together?', 'fun', true),
('How can we make our relationship even stronger?', 'growth', true),
('What''s your favorite memory from our first month together?', 'memories', true)
ON CONFLICT (question_text) DO NOTHING;

-- Verify setup worked
SELECT 
  'SUCCESS: Question bucket created with ' || COUNT(*) || ' questions!' as result
FROM public.question_bucket;
