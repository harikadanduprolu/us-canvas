-- Step-by-Step Question Bucket Setup
-- Execute each section ONE AT A TIME to identify any issues

-- STEP 1: Check existing tables (run this first)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%question%' OR table_name LIKE '%bucket%');

-- STEP 2: Create question_bucket table (run this if step 1 shows no question_bucket)
CREATE TABLE IF NOT EXISTS public.question_bucket (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 3: Verify question_bucket was created
SELECT 'question_bucket table created successfully' as status;

-- STEP 4: Create question_usage table
CREATE TABLE IF NOT EXISTS public.question_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_id UUID NOT NULL,
    question_id UUID NOT NULL,
    used_date DATE NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 5: Verify question_usage was created  
SELECT 'question_usage table created successfully' as status;

-- STEP 6: Add some test questions
INSERT INTO public.question_bucket (question_text, category) VALUES
('What made you smile today?', 'connection'),
('What is your favorite memory of us?', 'memories'),
('What should we do this weekend?', 'fun'),
('How can I support you better?', 'growth'),
('What is your dream date night?', 'romance')
ON CONFLICT DO NOTHING;

-- STEP 7: Verify questions were inserted
SELECT COUNT(*) as question_count, 'questions inserted successfully' as status
FROM public.question_bucket;

-- STEP 8: Final verification - show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%question%' OR table_name LIKE '%bucket%' OR table_name LIKE '%usage%')
ORDER BY table_name;
