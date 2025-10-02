-- Bulk Question Import Script
-- Copy and paste this into Supabase SQL Editor to add more questions

-- Additional Connection Questions
INSERT INTO question_bucket (question_text, category, is_active) VALUES
('What''s one way I can be more present with you?', 'connection', true),
('Tell me about a time you felt truly heard by me', 'connection', true),
('What''s your favorite way for us to start the morning together?', 'connection', true),
('How do you prefer to decompress together after a long day?', 'connection', true),
('What''s something you''ve learned about yourself through our relationship?', 'connection', true),
('What conversation topic could we explore for hours?', 'connection', true),
('How can we make our dinner conversations more meaningful?', 'connection', true),
('What''s your favorite way for us to solve problems together?', 'connection', true),
('Tell me about a moment when you felt most understood by me', 'connection', true),
('What''s one thing we do together that always energizes you?', 'connection', true),

-- Additional Romance Questions  
('What''s your favorite way to be surprised by me?', 'romance', true),
('Describe the perfect evening at home together', 'romance', true),
('What''s your love language and how can I speak it better?', 'romance', true),
('What''s the most thoughtful gift I''ve given you?', 'romance', true),
('How do you like to celebrate relationship milestones?', 'romance', true),
('What''s your favorite way to show affection in public?', 'romance', true),
('Tell me about a romantic gesture that would make your heart skip', 'romance', true),
('What''s your ideal way to reconnect after time apart?', 'romance', true),
('How can I make ordinary moments feel more romantic?', 'romance', true),
('What''s your favorite thing about our physical chemistry?', 'romance', true),

-- Additional Fun Questions
('What''s the silliest thing we should try together?', 'fun', true),
('If we had a theme song, what would it be?', 'fun', true),
('What game should we master as a couple?', 'fun', true),
('What''s your favorite way for us to be spontaneous?', 'fun', true),
('If we could have any pet together, what would it be?', 'fun', true),
('What''s the most ridiculous thing you''d do to make me laugh?', 'fun', true),
('What adventure sport should we try together?', 'fun', true),
('If we opened a restaurant, what would we serve?', 'fun', true),
('What''s your favorite inside joke between us?', 'fun', true),
('What movie should we act out together?', 'fun', true),

-- Additional Future Questions
('What skill should we both learn this year?', 'future', true),
('How do you want to celebrate our 10th anniversary?', 'future', true),
('What''s one big adventure we should save up for?', 'future', true),
('How do you see our relationship evolving over time?', 'future', true),
('What legacy do you want us to create together?', 'future', true),
('What cause should we support as a couple?', 'future', true),
('How can we stay connected as life gets busier?', 'future', true),
('What''s your dream vacation we should plan?', 'future', true),
('What tradition should we start now for our future family?', 'future', true),
('How do you want us to grow old together?', 'future', true),

-- Seasonal Questions
('What''s your favorite holiday tradition we should adopt?', 'seasonal', true),
('How should we make winter cozier together?', 'seasonal', true),
('What spring activity should we make our tradition?', 'seasonal', true),
('What''s your ideal summer evening with me?', 'seasonal', true),
('How should we celebrate the first snow together?', 'seasonal', true),
('What fall activity brings you the most joy with me?', 'seasonal', true),
('How can we make Sundays more special?', 'seasonal', true),
('What''s your favorite way to celebrate our monthly anniversary?', 'seasonal', true),
('How should we ring in each new season together?', 'seasonal', true),
('What''s your ideal way to spend a three-day weekend?', 'seasonal', true)

ON CONFLICT (question_text) DO NOTHING;
