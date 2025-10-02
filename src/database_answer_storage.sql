-- Enhanced Daily Question Answer Storage
-- This creates a dedicated table for storing individual answers with proper tracking

-- Create daily_question_answers table for better answer management
CREATE TABLE IF NOT EXISTS public.daily_question_answers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    question_id TEXT NOT NULL,
    couple_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one answer per user per question
    UNIQUE(question_id, user_id),
    
    -- Foreign key constraints
    CONSTRAINT fk_question_answers_question 
        FOREIGN KEY (question_id) REFERENCES public.daily_questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_question_answers_couple 
        FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.daily_question_answers ENABLE ROW LEVEL SECURITY;

-- Create policy for answer access (users can only see answers from their couple)
CREATE POLICY "Users can manage their couple's question answers" 
ON public.daily_question_answers 
FOR ALL 
USING (
    couple_id IN (
        SELECT id FROM public.couples 
        WHERE member_a_id = auth.uid() OR member_b_id = auth.uid()
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_question_answers_question_id ON public.daily_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_daily_question_answers_couple_id ON public.daily_question_answers(couple_id);
CREATE INDEX IF NOT EXISTS idx_daily_question_answers_user_id ON public.daily_question_answers(user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_daily_question_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_question_answers_updated_at
    BEFORE UPDATE ON public.daily_question_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_question_answers_updated_at();

-- Migration: Move existing answers from daily_questions to new table
-- This handles existing answer_by_a and answer_by_b data
DO $$
DECLARE
    question_record RECORD;
    couple_record RECORD;
BEGIN
    -- Process each daily question that has answers
    FOR question_record IN 
        SELECT id, couple_id, answer_by_a, answer_by_b 
        FROM public.daily_questions 
        WHERE answer_by_a IS NOT NULL OR answer_by_b IS NOT NULL
    LOOP
        -- Get couple details to know which user is A and which is B
        SELECT member_a_id, member_b_id INTO couple_record
        FROM public.couples 
        WHERE id = question_record.couple_id;
        
        -- Migrate answer_by_a if it exists
        IF question_record.answer_by_a IS NOT NULL THEN
            INSERT INTO public.daily_question_answers (
                question_id, 
                couple_id, 
                user_id, 
                answer_text,
                answered_at,
                created_at
            ) VALUES (
                question_record.id,
                question_record.couple_id,
                couple_record.member_a_id,
                CASE 
                    WHEN jsonb_typeof(question_record.answer_by_a) = 'object' 
                    THEN question_record.answer_by_a->>'text'
                    ELSE question_record.answer_by_a::text
                END,
                CASE 
                    WHEN jsonb_typeof(question_record.answer_by_a) = 'object' AND question_record.answer_by_a ? 'timestamp'
                    THEN (question_record.answer_by_a->>'timestamp')::timestamptz
                    ELSE NOW()
                END,
                NOW()
            ) ON CONFLICT (question_id, user_id) DO UPDATE SET
                answer_text = EXCLUDED.answer_text,
                answered_at = EXCLUDED.answered_at,
                updated_at = NOW();
        END IF;
        
        -- Migrate answer_by_b if it exists
        IF question_record.answer_by_b IS NOT NULL THEN
            INSERT INTO public.daily_question_answers (
                question_id, 
                couple_id, 
                user_id, 
                answer_text,
                answered_at,
                created_at
            ) VALUES (
                question_record.id,
                question_record.couple_id,
                couple_record.member_b_id,
                CASE 
                    WHEN jsonb_typeof(question_record.answer_by_b) = 'object' 
                    THEN question_record.answer_by_b->>'text'
                    ELSE question_record.answer_by_b::text
                END,
                CASE 
                    WHEN jsonb_typeof(question_record.answer_by_b) = 'object' AND question_record.answer_by_b ? 'timestamp'
                    THEN (question_record.answer_by_b->>'timestamp')::timestamptz
                    ELSE NOW()
                END,
                NOW()
            ) ON CONFLICT (question_id, user_id) DO UPDATE SET
                answer_text = EXCLUDED.answer_text,
                answered_at = EXCLUDED.answered_at,
                updated_at = NOW();
        END IF;
    END LOOP;
END $$;

-- Optional: Add view for easy answer retrieval with user details
CREATE OR REPLACE VIEW public.daily_questions_with_answers AS
SELECT 
    dq.id,
    dq.couple_id,
    dq.question_text,
    dq.date,
    dq.year,
    dq.created_at,
    -- Aggregate answers into JSON format for compatibility
    COALESCE(
        json_object_agg(
            CASE WHEN u.id = c.member_a_id THEN 'answer_by_a' ELSE 'answer_by_b' END,
            json_build_object(
                'text', dqa.answer_text,
                'timestamp', dqa.answered_at,
                'userId', dqa.user_id
            )
        ) FILTER (WHERE dqa.id IS NOT NULL),
        '{}'::json
    ) as answers
FROM public.daily_questions dq
LEFT JOIN public.couples c ON dq.couple_id = c.id
LEFT JOIN public.daily_question_answers dqa ON dq.id = dqa.question_id
LEFT JOIN auth.users u ON dqa.user_id = u.id
GROUP BY dq.id, dq.couple_id, dq.question_text, dq.date, dq.year, dq.created_at;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_question_answers TO authenticated;
GRANT SELECT ON public.daily_questions_with_answers TO authenticated;
