-- Database Setup for US Canvas
-- Run this script in your Supabase SQL Editor to create all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  username TEXT,
  dob TEXT,
  avatar_url TEXT,
  hobbies TEXT[],
  likes TEXT[],
  dislikes TEXT[],
  description TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  member_a_id UUID REFERENCES users(id) ON DELETE CASCADE,
  member_b_id UUID REFERENCES users(id) ON DELETE CASCADE,
  anniversary DATE,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create diary_entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  attachments TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  uploader_name TEXT NOT NULL,
  data TEXT NOT NULL, -- base64 encoded image data
  caption TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_questions table
CREATE TABLE IF NOT EXISTS daily_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_by_a JSONB, -- stores {text, timestamp, userId}
  answer_by_b JSONB, -- stores {text, timestamp, userId}
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  repeat_rules TEXT,
  notification_channels TEXT[] DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create insecurities table
CREATE TABLE IF NOT EXISTS insecurities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  visibility TEXT DEFAULT 'sealed' CHECK (visibility IN ('sealed', 'immediate', 'scheduled')),
  unlock_at TIMESTAMPTZ,
  allow_replies BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'sealed' CHECK (status IN ('sealed', 'opened', 'responded', 'archived')),
  opened_by UUID REFERENCES users(id),
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create insecurity_replies table
CREATE TABLE IF NOT EXISTS insecurity_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insecurity_id UUID REFERENCES insecurities(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create song_bucket table
CREATE TABLE IF NOT EXISTS song_bucket (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  added_by_id UUID REFERENCES users(id) ON DELETE CASCADE,
  added_by_name TEXT NOT NULL,
  spotify_uri TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diary_entries_couple_id ON diary_entries(couple_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_couple_id ON photos(couple_id);
CREATE INDEX IF NOT EXISTS idx_daily_questions_couple_date ON daily_questions(couple_id, date);
CREATE INDEX IF NOT EXISTS idx_insecurities_couple_id ON insecurities(couple_id);
CREATE INDEX IF NOT EXISTS idx_insecurities_status ON insecurities(status);

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE insecurities ENABLE ROW LEVEL SECURITY;
ALTER TABLE insecurity_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_bucket ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may want to customize these based on your auth setup)
-- For now, allow all operations (you can make these more restrictive later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on couples" ON couples FOR ALL USING (true);
CREATE POLICY "Allow all operations on diary_entries" ON diary_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on photos" ON photos FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_questions" ON daily_questions FOR ALL USING (true);
CREATE POLICY "Allow all operations on reminders" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow all operations on insecurities" ON insecurities FOR ALL USING (true);
CREATE POLICY "Allow all operations on insecurity_replies" ON insecurity_replies FOR ALL USING (true);
CREATE POLICY "Allow all operations on song_bucket" ON song_bucket FOR ALL USING (true);

-- Insert default test users (with actual bcrypt hashed passwords for "password123")
INSERT INTO users (id, email, name, password_hash, created_at) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'harika@luv.com', 'Harika', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8/jF.lqKExH6rBrfBBRfHEHvjmvfJG', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'yash@luv.com', 'Yash', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8/jF.lqKExH6rBrfBBRfHEHvjmvfJG', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create default couple relationship (optional)
INSERT INTO couples (id, name, member_a_id, member_b_id, anniversary, created_at) VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Harika & Yash', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2024-01-01', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify tables were created
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'couples', count(*) FROM couples
UNION ALL
SELECT 'diary_entries', count(*) FROM diary_entries
UNION ALL
SELECT 'photos', count(*) FROM photos
UNION ALL
SELECT 'daily_questions', count(*) FROM daily_questions
UNION ALL
SELECT 'reminders', count(*) FROM reminders
UNION ALL
SELECT 'insecurities', count(*) FROM insecurities
UNION ALL
SELECT 'insecurity_replies', count(*) FROM insecurity_replies
UNION ALL
SELECT 'song_bucket', count(*) FROM song_bucket;
