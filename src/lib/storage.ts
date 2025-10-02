// Storage utilities for Lovable (Supabase first, with localStorage fallback)
import { supabase, hasSupabaseConfig } from '@/lib/supabase';

export interface DiaryEntry {
  id: string;
  coupleId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  mood?: string;
  attachments: string[]; // base64 image strings
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Photo {
  id: string;
  coupleId: string;
  uploaderId: string;
  uploaderName: string;
  data: string; // Cloudinary URL or base64 for fallback
  caption: string;
  createdAt: string;
  cloudinaryPublicId?: string; // For managing Cloudinary images
}

export interface DailyQuestion {
  id: string;
  coupleId: string;
  questionText: string;
  answerByA?: { text: string; timestamp: string };
  answerByB?: { text: string; timestamp: string };
  date: string;
}

export interface Reminder {
  id: string;
  coupleId: string;
  creatorId: string;
  title: string;
  datetime: string;
  repeatRules?: string;
  notificationChannels: string[];
  completed: boolean;
}

export interface InsecurityEntry {
  id: string;
  coupleId: string;
  authorId: string;
  authorName: string;
  title?: string;
  content: string;
  attachments: string[]; // base64 for images/voice
  urgency: 'low' | 'medium' | 'high';
  visibility: 'sealed' | 'immediate' | 'scheduled';
  unlockAt?: string;
  allowReplies: boolean;
  tags: string[];
  status: 'sealed' | 'opened' | 'responded' | 'archived';
  openedBy?: string;
  openedAt?: string;
  createdAt: string;
  replies: InsecurityReply[];
}

export interface InsecurityReply {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface InsecurityAudit {
  id: string;
  insecurityId: string;
  action: 'created' | 'opened' | 'reminded' | 'deleted' | 'commented' | 'flagged';
  actorId: string;
  actorName: string;
  createdAt: string;
}

export interface SongBucketItem {
  id: string;
  coupleId: string;
  addedById: string;
  addedByName: string;
  spotifyUri: string;
  note: string;
  createdAt: string;
}

export interface GameSession {
  id: string;
  coupleId: string;
  title: string;
  url: string;
  roomLink?: string;
  playedAt: string;
  gameKey?: 'papergames' | 'tanggle' | 'skribbl' | 'other';
  winnerId?: string;
  participants: string[];
}

export interface ChatMessage {
  id: string;
  coupleId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

// Diary Storage
export const getDiaryEntries = async (coupleId: string): Promise<DiaryEntry[]> => {
  if (hasSupabaseConfig) {
    console.log('Fetching diary entries for couple:', coupleId);
    const { data, error } = await (supabase as any)
      .from('diary_entries')
      .select('*')
      .eq('couple_id', coupleId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase diary entries fetch error:', error);
      throw new Error(`Failed to fetch diary entries: ${error.message}`);
    }
    console.log('Diary entries fetched successfully:', data?.length || 0, 'entries');
    return (data || []).map((d: any) => ({
      id: d.id,
      coupleId: d.couple_id,
      authorId: d.author_id,
      authorName: d.author_name,
      title: d.title,
      content: d.content,
      mood: d.mood || undefined,
      attachments: d.attachments || [],
      isPrivate: !!d.is_private,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      deletedAt: d.deleted_at || undefined,
    }));
  }
  const entries = JSON.parse(localStorage.getItem('lovable_diary_entries') || '[]');
  return entries.filter((e: DiaryEntry) => e.coupleId === coupleId && !e.deletedAt);
};

export const saveDiaryEntry = async (entry: DiaryEntry) => {
  if (hasSupabaseConfig) {
    const payload = {
      id: entry.id,
      couple_id: entry.coupleId,
      author_id: entry.authorId,
      author_name: entry.authorName,
      title: entry.title,
      content: entry.content,
      mood: entry.mood || null,
      attachments: entry.attachments || [],
      is_private: entry.isPrivate,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
      deleted_at: entry.deletedAt || null,
    };
    console.log('Attempting to save diary entry:', payload);
    const { data, error } = await (supabase as any).from('diary_entries').upsert(payload);
    if (error) {
      console.error('Supabase diary entry save error:', error);
      throw new Error(`Failed to save diary entry: ${error.message}`);
    }
    console.log('Diary entry saved successfully:', data);
    return;
  }
  const entries = JSON.parse(localStorage.getItem('lovable_diary_entries') || '[]');
  const index = entries.findIndex((e: DiaryEntry) => e.id === entry.id);
  if (index !== -1) entries[index] = entry; else entries.push(entry);
  localStorage.setItem('lovable_diary_entries', JSON.stringify(entries));
};

export const deleteDiaryEntry = async (entryId: string) => {
  if (hasSupabaseConfig) {
    await (supabase as any)
      .from('diary_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entryId);
    return;
  }
  const entries = JSON.parse(localStorage.getItem('lovable_diary_entries') || '[]');
  const index = entries.findIndex((e: DiaryEntry) => e.id === entryId);
  
  if (index !== -1) {
    entries[index].deletedAt = new Date().toISOString();
    localStorage.setItem('lovable_diary_entries', JSON.stringify(entries));
  }
};

// Photo Storage
export const getPhotos = async (coupleId: string): Promise<Photo[]> => {
  if (hasSupabaseConfig) {
    console.log('Fetching photos for couple:', coupleId);
    const { data, error } = await (supabase as any)
      .from('photos')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase photos fetch error:', error);
      throw new Error(`Failed to fetch photos: ${error.message}`);
    }
    console.log('Photos fetched successfully:', data?.length || 0, 'photos');
    return (data || []).map((p: any) => ({
      id: p.id,
      coupleId: p.couple_id,
      uploaderId: p.uploader_id,
      uploaderName: p.uploader_name,
      data: p.data,
      caption: p.caption,
      createdAt: p.created_at,
    }));
  }
  const photos = JSON.parse(localStorage.getItem('lovable_photos') || '[]');
  return photos.filter((p: Photo) => p.coupleId === coupleId);
};

export const savePhoto = async (photo: Photo) => {
  if (hasSupabaseConfig) {
    const payload = {
      id: photo.id,
      couple_id: photo.coupleId,
      uploader_id: photo.uploaderId,
      uploader_name: photo.uploaderName,
      data: photo.data,
      caption: photo.caption,
      created_at: photo.createdAt,
    };
    console.log('Attempting to save photo:', { ...payload, data: 'base64_data_truncated' });
    const { data, error } = await (supabase as any).from('photos').upsert(payload);
    if (error) {
      console.error('Supabase photo save error:', error);
      throw new Error(`Failed to save photo: ${error.message}`);
    }
    console.log('Photo saved successfully:', data);
    return;
  }
  const photos = JSON.parse(localStorage.getItem('lovable_photos') || '[]');
  photos.push(photo);
  localStorage.setItem('lovable_photos', JSON.stringify(photos));
};

// Fallback questions for local storage (reduced set)
const FALLBACK_QUESTIONS = [
  "What made you smile today?",
  "One small thing I did that you appreciated?",
  "What can I do tomorrow to make your day easier?",
  "A childhood memory you love?",
  "Something new you'd like us to try this month?",
  "A fear I can support you with?",
  "Your favorite scent that reminds you of me?",
  "What song should we play tonight?",
  "A tiny habit of mine you secretly love?",
  "What's your favorite way to spend time together?",
  "Something I said recently that made you feel loved?",
  "What adventure should we go on next?",
  "A dream you have for our future?",
  "What's something you're grateful for today?",
  "How can I support you better?",
  "What's a random fact about me you find interesting?",
  "What's your favorite memory of us?",
  "What makes you feel most connected to me?",
  "What's something new you learned this week?",
  "What's a goal you're working towards?",
  "What's your love language?",
  "What tradition should we start together?",
  "What's your favorite thing about our relationship?",
  "What's something that always makes you laugh?",
  "What's a quality you admire in me?",
  "What's your ideal date night?",
  "What's a compliment you wish you heard more often?",
  "What's something you want to learn together?",
  "What's your favorite season and why?",
  "What's a small gesture that means a lot to you?"
];

// Question bucket interfaces
export interface QuestionBucketItem {
  id: string;
  questionText: string;
  category: string;
  isActive: boolean;
}

export interface QuestionUsage {
  id: string;
  coupleId: string;
  questionId: string;
  usedDate: string;
  year: number;
}

// Get unused question for the couple for current year
const getUnusedQuestion = async (coupleId: string): Promise<QuestionBucketItem | null> => {
  const currentYear = new Date().getFullYear();
  
  if (!hasSupabaseConfig) {
    // Fallback for localStorage
    const usedQuestions = JSON.parse(localStorage.getItem(`lovable_used_questions_${coupleId}_${currentYear}`) || '[]');
    const availableQuestions = FALLBACK_QUESTIONS.filter((_, index) => !usedQuestions.includes(index));
    
    if (availableQuestions.length === 0) {
      // Reset for new year if all questions used
      localStorage.removeItem(`lovable_used_questions_${coupleId}_${currentYear}`);
      return { id: '0', questionText: FALLBACK_QUESTIONS[0], category: 'general', isActive: true };
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const questionIndex = FALLBACK_QUESTIONS.indexOf(availableQuestions[randomIndex]);
    return { id: questionIndex.toString(), questionText: availableQuestions[randomIndex], category: 'general', isActive: true };
  }

  // Get all active questions from bucket
  const { data: allQuestions } = await (supabase as any)
    .from('question_bucket')
    .select('*')
    .eq('is_active', true);

  if (!allQuestions || allQuestions.length === 0) {
    console.warn('No questions in bucket, using fallback');
    return { id: crypto.randomUUID(), questionText: FALLBACK_QUESTIONS[0], category: 'general', isActive: true };
  }

  // Get used questions for this couple this year
  const { data: usedQuestions } = await (supabase as any)
    .from('question_usage')
    .select('question_id')
    .eq('couple_id', coupleId)
    .eq('year', currentYear);

  const usedQuestionIds = usedQuestions ? usedQuestions.map((u: any) => u.question_id) : [];
  
  // Filter out used questions
  const availableQuestions = allQuestions.filter((q: any) => !usedQuestionIds.includes(q.id));

  if (availableQuestions.length === 0) {
    // All questions used this year - start fresh (or use random)
    console.log('All questions used this year for couple, starting fresh rotation');
    const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    return {
      id: randomQuestion.id,
      questionText: randomQuestion.question_text,
      category: randomQuestion.category,
      isActive: randomQuestion.is_active
    };
  }

  // Select random unused question
  const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  return {
    id: selectedQuestion.id,
    questionText: selectedQuestion.question_text,
    category: selectedQuestion.category,
    isActive: selectedQuestion.is_active
  };
};

// Mark question as used
const markQuestionAsUsed = async (coupleId: string, questionId: string, date: string): Promise<void> => {
  const currentYear = new Date().getFullYear();
  
  if (!hasSupabaseConfig) {
    // Fallback for localStorage
    const usedQuestions = JSON.parse(localStorage.getItem(`lovable_used_questions_${coupleId}_${currentYear}`) || '[]');
    if (!usedQuestions.includes(questionId)) {
      usedQuestions.push(questionId);
      localStorage.setItem(`lovable_used_questions_${coupleId}_${currentYear}`, JSON.stringify(usedQuestions));
    }
    return;
  }

  const usage: Partial<QuestionUsage> = {
    id: crypto.randomUUID(),
    coupleId,
    questionId,
    usedDate: date,
    year: currentYear,
  };

  // Try to insert with year first, fallback without if column doesn't exist
  const baseUsage = {
    id: usage.id,
    couple_id: usage.coupleId,
    question_id: usage.questionId,
    used_date: usage.usedDate,
    created_at: new Date().toISOString(),
  };

  let error = null;
  
  // First try with year column
  try {
    const insertDataWithYear = { ...baseUsage, year: usage.year };
    const result = await (supabase as any)
      .from('question_usage')
      .upsert(insertDataWithYear);
    error = result.error;
  } catch (yearError: any) {
    error = yearError;
  }
  
  // If year column error, retry without year
  if (error && (error.code === '42703' || error.message?.includes('year'))) {
    console.warn('Year column not available in question_usage, retrying without year');
    const { error: retryError } = await (supabase as any)
      .from('question_usage')
      .upsert(baseUsage);
      
    if (retryError) {
      console.warn('Failed to mark question as used even without year:', retryError);
    }
  } else if (error) {
    console.warn('Failed to mark question as used:', error);
  }
};

export const getTodayQuestion = async (coupleId: string): Promise<DailyQuestion> => {
  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  
  console.log(`Getting today's question for couple ${coupleId} on ${today}`);
  
  if (hasSupabaseConfig) {
    // Check if question already exists for today (with fallback for missing year column)
    let found = null;
    let queryError = null;
    
    // First try with year filter
    try {
      const { data, error } = await (supabase as any)
        .from('daily_questions')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('date', today)
        .eq('year', currentYear)
        .limit(1);
      
      found = data;
      queryError = error;
    } catch (error) {
      queryError = error;
    }
    
    // If year column error, retry without year filter
    if (queryError && (queryError.code === '42703' || queryError.message?.includes('year'))) {
      console.warn('Year column not available, using date-only query');
      const { data: fallbackData, error: fallbackError } = await (supabase as any)
        .from('daily_questions')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('date', today)
        .limit(1);
      
      found = fallbackData;
      queryError = fallbackError;
    }
    
    if (queryError) {
      console.error('Error checking for existing question:', queryError);
      // If it's a schema error about missing year column, try without year filter
      if (queryError.message?.includes('year') || queryError.message?.includes('column')) {
        const { data: foundFallback } = await (supabase as any)
          .from('daily_questions')
          .select('*')
          .eq('couple_id', coupleId)
          .eq('date', today)
          .limit(1);
        
        if (foundFallback && foundFallback.length > 0) {
          return foundFallback[0];
        }
      }
    }
    
    let q = found && found[0];
    
    if (!q) {
      // Get an unused question from the bucket
      const selectedQuestion = await getUnusedQuestion(coupleId);
      
      if (!selectedQuestion) {
        throw new Error('No questions available');
      }

      // Create new daily question entry (with fallback for missing year column)
      const baseInsert = {
        id: crypto.randomUUID(),
        couple_id: coupleId,
        question_text: selectedQuestion.questionText,
        date: today,
        created_at: new Date().toISOString(),
      };

      console.log('Creating new daily question:', baseInsert);
      
      // Try inserting with year first, then fallback without year
      let inserted = null;
      let error = null;
      
      // First attempt with year column
      try {
        const insertWithYear = { ...baseInsert, year: currentYear };
        const { data, error: yearError } = await (supabase as any)
          .from('daily_questions')
          .insert(insertWithYear)
          .select('*')
          .limit(1);
        
        inserted = data;
        error = yearError;
      } catch (yearError: any) {
        error = yearError;
      }
      
      // If year column error, retry without year
      if (error && (error.code === '42703' || error.message?.includes('year'))) {
        console.warn('Year column not available, inserting without year');
        const { data: retryData, error: retryError } = await (supabase as any)
          .from('daily_questions')
          .insert(baseInsert)
          .select('*')
          .limit(1);
        
        inserted = retryData;
        error = retryError;
      }

      if (error) {
        console.error('Failed to insert daily question:', error);
        throw new Error(`Failed to create daily question: ${error.message}`);
      }

      q = inserted && inserted[0];

      q = inserted && inserted[0];

      // Mark question as used
      await markQuestionAsUsed(coupleId, selectedQuestion.id, today);
      
      console.log('Successfully created daily question:', q);
    }

    // Load answers from the new dedicated table first, fallback to old columns
    let answerByA = q.answer_by_a;
    let answerByB = q.answer_by_b;
    
    try {
      const { data: answers, error: answersError } = await (supabase as any)
        .from('daily_question_answers')
        .select(`
          user_id,
          answer_text,
          answered_at
        `)
        .eq('question_id', q.id);
      
      if (!answersError && answers && answers.length > 0) {
        console.log('Loaded answers from dedicated table:', answers);
        
        // Get couple info to determine which user is A and which is B
        const { data: coupleData } = await (supabase as any)
          .from('couples')
          .select('member_a_id, member_b_id')
          .eq('id', q.couple_id)
          .limit(1);
          
        if (coupleData && coupleData.length > 0) {
          const couple = coupleData[0];
          
          // Map answers to partner A/B based on user IDs
          answers.forEach((answer: any) => {
            const answerData = {
              text: answer.answer_text,
              timestamp: answer.answered_at,
              userId: answer.user_id
            };
            
            if (answer.user_id === couple.member_a_id) {
              answerByA = answerData;
            } else if (answer.user_id === couple.member_b_id) {
              answerByB = answerData;
            }
          });
        }
      } else {
        console.log('No answers found in dedicated table, using fallback columns');
      }
    } catch (error) {
      console.warn('Error loading answers from dedicated table, using fallback:', error);
    }

    return {
      id: q.id,
      coupleId: q.couple_id,
      questionText: q.question_text,
      answerByA: answerByA || undefined,
      answerByB: answerByB || undefined,
      date: q.date,
    };
  }

  // Fallback for localStorage
  const questions = JSON.parse(localStorage.getItem('lovable_daily_questions') || '[]');
  let todayQuestion = questions.find((q: DailyQuestion) => q.coupleId === coupleId && q.date === today);
  
  if (!todayQuestion) {
    const selectedQuestion = await getUnusedQuestion(coupleId);
    
    if (!selectedQuestion) {
      throw new Error('No questions available');
    }

    todayQuestion = { 
      id: crypto.randomUUID(), 
      coupleId, 
      questionText: selectedQuestion.questionText, 
      date: today 
    };
    
    questions.push(todayQuestion);
    localStorage.setItem('lovable_daily_questions', JSON.stringify(questions));
    
    // Mark as used in localStorage
    await markQuestionAsUsed(coupleId, selectedQuestion.id, today);
  }
  
  return todayQuestion;
};

export const answerDailyQuestion = async (questionId: string, userId: string, answer: string, isPartnerA: boolean) => {
  console.log(`Saving answer for question ${questionId} by user ${userId}`);
  
  if (hasSupabaseConfig) {
    try {
      // Get couple ID from the question
      const { data: questionData, error: questionError } = await (supabase as any)
        .from('daily_questions')
        .select('couple_id')
        .eq('id', questionId)
        .limit(1);
        
      if (questionError || !questionData || questionData.length === 0) {
        console.error('Error getting question data:', questionError);
        throw new Error('Question not found');
      }
      
      const coupleId = questionData[0].couple_id;
      
      // Try to use the new dedicated answers table first
      const answerPayload = {
        question_id: questionId,
        couple_id: coupleId,
        user_id: userId,
        answer_text: answer,
        answered_at: new Date().toISOString(),
      };
      
      console.log('Attempting to save to daily_question_answers table:', answerPayload);
      
      const { error: answerError } = await (supabase as any)
        .from('daily_question_answers')
        .upsert(answerPayload, { 
          onConflict: 'question_id,user_id',
          ignoreDuplicates: false 
        });
      
      if (answerError) {
        console.warn('New answer table not available, falling back to old method:', answerError);
        
        // Fallback to the old method using answer_by_a/answer_by_b columns
        const { data: rows } = await (supabase as any)
          .from('daily_questions')
          .select('answer_by_a,answer_by_b')
          .eq('id', questionId)
          .limit(1);
        
        const answerData = { text: answer, timestamp: new Date().toISOString(), userId };
        const update: any = isPartnerA ? { answer_by_a: answerData } : { answer_by_b: answerData };
        
        const { error: updateError } = await (supabase as any)
          .from('daily_questions')
          .update(update)
          .eq('id', questionId);
          
        if (updateError) {
          console.error('Error updating daily_questions:', updateError);
          throw new Error(`Failed to save answer: ${updateError.message}`);
        }
        
        console.log('Answer saved using fallback method');
      } else {
        console.log('Answer saved successfully to dedicated table');
      }
      
      return;
    } catch (error) {
      console.error('Error in answerDailyQuestion:', error);
      throw error;
    }
  }
  
  // localStorage fallback
  const questions = JSON.parse(localStorage.getItem('lovable_daily_questions') || '[]');
  const index = questions.findIndex((q: DailyQuestion) => q.id === questionId);
  if (index !== -1) {
    const answerData = { text: answer, timestamp: new Date().toISOString(), userId };
    if (isPartnerA) questions[index].answerByA = answerData; else questions[index].answerByB = answerData;
    localStorage.setItem('lovable_daily_questions', JSON.stringify(questions));
    console.log('Answer saved to localStorage');
  }
};

// Get all daily question answers for a couple
export const getDailyQuestionAnswers = async (coupleId: string, limit?: number): Promise<any[]> => {
  console.log(`Loading daily question answers for couple ${coupleId}`);
  
  if (hasSupabaseConfig) {
    try {
      let query = (supabase as any)
        .from('daily_questions')
        .select(`
          id,
          question_text,
          date,
          created_at,
          daily_question_answers (
            user_id,
            answer_text,
            answered_at
          )
        `)
        .eq('couple_id', coupleId)
        .order('date', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: questions, error } = await query;
      
      if (error) {
        console.warn('Error loading from joined query, trying fallback approach:', error);
        
        // Fallback: Load questions and answers separately
        const { data: questionsOnly, error: questionsError } = await (supabase as any)
          .from('daily_questions')
          .select('*')
          .eq('couple_id', coupleId)
          .order('date', { ascending: false })
          .limit(limit || 50);
          
        if (questionsError) {
          throw questionsError;
        }
        
        return questionsOnly || [];
      }
      
      return questions || [];
    } catch (error) {
      console.error('Error loading daily question answers:', error);
      return [];
    }
  }
  
  // localStorage fallback
  const questions = JSON.parse(localStorage.getItem('lovable_daily_questions') || '[]');
  return questions
    .filter((q: any) => q.coupleId === coupleId)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit || 50);
};

// Get answer statistics for a couple
export const getAnswerStats = async (coupleId: string): Promise<{
  totalQuestions: number;
  answeredByBoth: number;
  answeredByPartnerA: number;
  answeredByPartnerB: number;
  unanswered: number;
}> => {
  if (hasSupabaseConfig) {
    try {
      const { data: questions, error } = await (supabase as any)
        .from('daily_questions')
        .select(`
          id,
          answer_by_a,
          answer_by_b,
          daily_question_answers (
            user_id
          )
        `)
        .eq('couple_id', coupleId);
        
      if (error) {
        console.error('Error loading answer stats:', error);
        return { totalQuestions: 0, answeredByBoth: 0, answeredByPartnerA: 0, answeredByPartnerB: 0, unanswered: 0 };
      }
      
      const stats = {
        totalQuestions: questions?.length || 0,
        answeredByBoth: 0,
        answeredByPartnerA: 0,
        answeredByPartnerB: 0,
        unanswered: 0
      };
      
      questions?.forEach((q: any) => {
        const hasAnswerA = q.answer_by_a || q.daily_question_answers?.some((a: any) => a.user_id);
        const hasAnswerB = q.answer_by_b || q.daily_question_answers?.some((a: any) => a.user_id);
        
        if (hasAnswerA && hasAnswerB) {
          stats.answeredByBoth++;
        } else if (hasAnswerA) {
          stats.answeredByPartnerA++;
        } else if (hasAnswerB) {
          stats.answeredByPartnerB++;
        } else {
          stats.unanswered++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error calculating answer stats:', error);
      return { totalQuestions: 0, answeredByBoth: 0, answeredByPartnerA: 0, answeredByPartnerB: 0, unanswered: 0 };
    }
  }
  
  // localStorage fallback
  const questions = JSON.parse(localStorage.getItem('lovable_daily_questions') || '[]');
  const coupleQuestions = questions.filter((q: any) => q.coupleId === coupleId);
  
  const stats = {
    totalQuestions: coupleQuestions.length,
    answeredByBoth: 0,
    answeredByPartnerA: 0,
    answeredByPartnerB: 0,
    unanswered: 0
  };
  
  coupleQuestions.forEach((q: any) => {
    const hasAnswerA = !!q.answerByA;
    const hasAnswerB = !!q.answerByB;
    
    if (hasAnswerA && hasAnswerB) {
      stats.answeredByBoth++;
    } else if (hasAnswerA) {
      stats.answeredByPartnerA++;
    } else if (hasAnswerB) {
      stats.answeredByPartnerB++;
    } else {
      stats.unanswered++;
    }
  });
  
  return stats;
};

// Reminders
export const getReminders = async (coupleId: string): Promise<Reminder[]> => {
  if (hasSupabaseConfig) {
    const { data } = await (supabase as any)
      .from('reminders')
      .select('*')
      .eq('couple_id', coupleId)
      .order('datetime', { ascending: true });
    return (data || []).map((r: any) => ({
      id: r.id,
      coupleId: r.couple_id,
      creatorId: r.creator_id,
      title: r.title,
      datetime: r.datetime,
      repeatRules: r.repeat_rules || undefined,
      notificationChannels: r.notification_channels || [],
      completed: !!r.completed,
    }));
  }
  const reminders = JSON.parse(localStorage.getItem('lovable_reminders') || '[]');
  return reminders.filter((r: Reminder) => r.coupleId === coupleId);
};

export const saveReminder = async (reminder: Reminder) => {
  if (hasSupabaseConfig) {
    const payload = {
      id: reminder.id,
      couple_id: reminder.coupleId,
      creator_id: reminder.creatorId,
      title: reminder.title,
      datetime: reminder.datetime,
      repeat_rules: reminder.repeatRules || null,
      notification_channels: reminder.notificationChannels || [],
      completed: reminder.completed,
      created_at: new Date().toISOString(),
    };
    await (supabase as any).from('reminders').upsert(payload);
    return;
  }
  const reminders = JSON.parse(localStorage.getItem('lovable_reminders') || '[]');
  const index = reminders.findIndex((r: Reminder) => r.id === reminder.id);
  
  if (index !== -1) {
    reminders[index] = reminder;
  } else {
    reminders.push(reminder);
  }
  
  localStorage.setItem('lovable_reminders', JSON.stringify(reminders));
};

// Insecurity Vault
export const getInsecurities = async (coupleId: string): Promise<InsecurityEntry[]> => {
  if (hasSupabaseConfig) {
    const { data } = await (supabase as any)
      .from('insecurities')
      .select('*')
      .eq('couple_id', coupleId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });
    return (data || []).map((e: any) => ({
      id: e.id,
      coupleId: e.couple_id,
      authorId: e.author_id,
      authorName: e.author_name,
      title: e.title || undefined,
      content: e.content,
      attachments: e.attachments || [],
      urgency: e.urgency,
      visibility: e.visibility,
      unlockAt: e.unlock_at || undefined,
      allowReplies: e.allow_replies,
      tags: e.tags || [],
      status: e.status,
      openedBy: e.opened_by || undefined,
      openedAt: e.opened_at || undefined,
      createdAt: e.created_at,
      replies: [],
    }));
  }
  const entries = JSON.parse(localStorage.getItem('lovable_insecurities') || '[]');
  return entries.filter((e: InsecurityEntry) => e.coupleId === coupleId && e.status !== 'archived');
};

export const saveInsecurity = async (entry: InsecurityEntry) => {
  if (hasSupabaseConfig) {
    const payload = {
      id: entry.id,
      couple_id: entry.coupleId,
      author_id: entry.authorId,
      author_name: entry.authorName,
      title: entry.title || null,
      content: entry.content,
      attachments: entry.attachments || [],
      urgency: entry.urgency,
      visibility: entry.visibility,
      unlock_at: entry.unlockAt || null,
      allow_replies: entry.allowReplies,
      tags: entry.tags || [],
      status: entry.status,
      opened_by: entry.openedBy || null,
      opened_at: entry.openedAt || null,
      created_at: entry.createdAt,
    };
    await (supabase as any).from('insecurities').upsert(payload);
    return;
  }
  const entries = JSON.parse(localStorage.getItem('lovable_insecurities') || '[]');
  const index = entries.findIndex((e: InsecurityEntry) => e.id === entry.id);
  
  if (index !== -1) {
    entries[index] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem('lovable_insecurities', JSON.stringify(entries));
};

export const addInsecurityAudit = async (audit: InsecurityAudit) => {
  if (hasSupabaseConfig) {
    await (supabase as any).from('insecurity_replies').insert({
      id: audit.id,
      insecurity_id: audit.insecurityId,
      author_id: audit.actorId,
      author_name: audit.actorName,
      message: audit.action,
      created_at: audit.createdAt,
    });
    return;
  }
  const audits = JSON.parse(localStorage.getItem('lovable_insecurity_audits') || '[]');
  audits.push(audit);
  localStorage.setItem('lovable_insecurity_audits', JSON.stringify(audits));
};

export const getInsecurityAudits = async (insecurityId: string): Promise<InsecurityAudit[]> => {
  if (hasSupabaseConfig) {
    const { data } = await (supabase as any)
      .from('insecurity_replies')
      .select('*')
      .eq('insecurity_id', insecurityId)
      .order('created_at', { ascending: true });
    return (data || []).map((r: any) => ({
      id: r.id,
      insecurityId: r.insecurity_id,
      action: 'commented',
      actorId: r.author_id,
      actorName: r.author_name,
      createdAt: r.created_at,
    }));
  }
  const audits = JSON.parse(localStorage.getItem('lovable_insecurity_audits') || '[]');
  return audits.filter((a: InsecurityAudit) => a.insecurityId === insecurityId);
};

// Song Bucket
export const getSongBucket = async (coupleId: string): Promise<SongBucketItem[]> => {
  if (hasSupabaseConfig) {
    const { data } = await (supabase as any)
      .from('song_bucket')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });
    return (data || []).map((s: any) => ({
      id: s.id,
      coupleId: s.couple_id,
      addedById: s.added_by_id,
      addedByName: s.added_by_name,
      spotifyUri: s.spotify_uri,
      note: s.note,
      createdAt: s.created_at,
    }));
  }
  const songs = JSON.parse(localStorage.getItem('lovable_song_bucket') || '[]');
  return songs.filter((s: SongBucketItem) => s.coupleId === coupleId);
};

export const addSongToBucket = async (song: SongBucketItem) => {
  if (hasSupabaseConfig) {
    await (supabase as any).from('song_bucket').upsert({
      id: song.id,
      couple_id: song.coupleId,
      added_by_id: song.addedById,
      added_by_name: song.addedByName,
      spotify_uri: song.spotifyUri,
      note: song.note,
      created_at: song.createdAt,
    });
    return;
  }
  const songs = JSON.parse(localStorage.getItem('lovable_song_bucket') || '[]');
  songs.push(song);
  localStorage.setItem('lovable_song_bucket', JSON.stringify(songs));
};

// Partner mapping utilities
export const setPartnerMap = (coupleId: string, partnerIds: string[]) => {
  if (hasSupabaseConfig) {
    // For Supabase, we don't need to store partner mappings separately
    // as they're already in the couples table
    return;
  }
  
  // For localStorage, store the partner mapping for easy lookup
  const partnerMaps = JSON.parse(localStorage.getItem('lovable_partner_maps') || '{}');
  partnerMaps[coupleId] = partnerIds;
  localStorage.setItem('lovable_partner_maps', JSON.stringify(partnerMaps));
};

export const getPartnerMap = (coupleId: string): string[] => {
  if (hasSupabaseConfig) {
    // For Supabase, partner IDs should be retrieved from couples table
    return [];
  }
  
  const partnerMaps = JSON.parse(localStorage.getItem('lovable_partner_maps') || '{}');
  return partnerMaps[coupleId] || [];
};

// Game Sessions
export const getGameSessions = async (coupleId: string): Promise<GameSession[]> => {
  if (hasSupabaseConfig) {
    const { data, error } = await (supabase as any)
      .from('game_sessions')
      .select('*')
      .eq('couple_id', coupleId)
      .order('played_at', { ascending: false });
    if (error) return [];
    return (data || []).map((g: any) => ({
      id: g.id,
      coupleId: g.couple_id,
      title: g.title,
      url: g.url,
      roomLink: g.room_link || undefined,
      playedAt: g.played_at,
      gameKey: g.game_key || undefined,
      winnerId: g.winner_id || undefined,
      participants: g.participants || [],
    }));
  }
  const sessions = JSON.parse(localStorage.getItem('lovable_game_sessions') || '[]');
  return sessions.filter((s: GameSession) => s.coupleId === coupleId);
};

export const saveGameSession = async (session: GameSession) => {
  if (hasSupabaseConfig) {
    const payload = {
      id: session.id,
      couple_id: session.coupleId,
      title: session.title,
      url: session.url,
      room_link: session.roomLink || null,
      played_at: session.playedAt,
      game_key: session.gameKey || null,
      winner_id: session.winnerId || null,
      participants: session.participants || [],
      created_at: new Date().toISOString(),
    };
    await (supabase as any).from('game_sessions').upsert(payload);
    return;
  }
  const sessions = JSON.parse(localStorage.getItem('lovable_game_sessions') || '[]');
  const index = sessions.findIndex((s: GameSession) => s.id === session.id);
  if (index !== -1) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem('lovable_game_sessions', JSON.stringify(sessions));
};

export const deleteGameSession = async (sessionId: string) => {
  if (hasSupabaseConfig) {
    await (supabase as any)
      .from('game_sessions')
      .delete()
      .eq('id', sessionId);
    return;
  }
  const sessions = JSON.parse(localStorage.getItem('lovable_game_sessions') || '[]');
  const filtered = sessions.filter((s: GameSession) => s.id !== sessionId);
  localStorage.setItem('lovable_game_sessions', JSON.stringify(filtered));
};

// Chat Messages
export const getLocalMessages = async (coupleId: string): Promise<ChatMessage[]> => {
  console.log('getLocalMessages called for coupleId:', coupleId);
  
  // Always check localStorage for messages (even with Supabase for offline support)
  const messages = JSON.parse(localStorage.getItem('lovable_chat_messages') || '[]');
  const filteredMessages = messages.filter((m: ChatMessage) => m.coupleId === coupleId);
  
  console.log('Found messages in localStorage:', filteredMessages.length);
  return filteredMessages;
};

export const saveLocalMessage = async (message: ChatMessage) => {
  console.log('saveLocalMessage called with:', message);
  
  // Always save to localStorage for the chat widget to work
  // even if Supabase is configured (for offline support)
  const messages = JSON.parse(localStorage.getItem('lovable_chat_messages') || '[]');
  messages.push(message);
  localStorage.setItem('lovable_chat_messages', JSON.stringify(messages));
  
  console.log('Message saved to localStorage, total messages:', messages.length);
};
