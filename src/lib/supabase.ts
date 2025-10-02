import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabaseConfig = !!(
  supabaseUrl && supabaseAnonKey && /^https?:\/\//.test(supabaseUrl)
)

if (!hasSupabaseConfig) {
  // Do not hard-crash the app if envs are missing/invalid; allow local fallback
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Missing or invalid VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY. Falling back to local mode.')
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null as unknown as ReturnType<typeof createClient>

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar?: string
          username?: string
          dob?: string
          avatar_url?: string
          hobbies?: string[]
          likes?: string[]
          dislikes?: string[]
          description?: string
          password_hash?: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar?: string
          username?: string
          dob?: string
          avatar_url?: string
          hobbies?: string[]
          likes?: string[]
          dislikes?: string[]
          description?: string
          password_hash?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar?: string
          username?: string
          dob?: string
          avatar_url?: string
          hobbies?: string[]
          likes?: string[]
          dislikes?: string[]
          description?: string
          password_hash?: string
          created_at?: string
        }
      }
      couples: {
        Row: {
          id: string
          name: string
          member_a_id: string
          member_b_id: string
          anniversary?: string
          created_at: string
          invite_code?: string
        }
        Insert: {
          id: string
          name: string
          member_a_id: string
          member_b_id: string
          anniversary?: string
          created_at?: string
          invite_code?: string
        }
        Update: {
          id?: string
          name?: string
          member_a_id?: string
          member_b_id?: string
          anniversary?: string
          created_at?: string
          invite_code?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          author_name: string
          title: string
          content: string
          mood?: string
          attachments: string[]
          is_private: boolean
          created_at: string
          updated_at: string
          deleted_at?: string
        }
        Insert: {
          id: string
          couple_id: string
          author_id: string
          author_name: string
          title: string
          content: string
          mood?: string
          attachments?: string[]
          is_private?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          author_id?: string
          author_name?: string
          title?: string
          content?: string
          mood?: string
          attachments?: string[]
          is_private?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          couple_id: string
          uploader_id: string
          uploader_name: string
          data: string
          caption: string
          created_at: string
        }
        Insert: {
          id: string
          couple_id: string
          uploader_id: string
          uploader_name: string
          data: string
          caption: string
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          uploader_id?: string
          uploader_name?: string
          data?: string
          caption?: string
          created_at?: string
        }
      }
      daily_questions: {
        Row: {
          id: string
          couple_id: string
          question_text: string
          answer_by_a?: string
          answer_by_b?: string
          date: string
          created_at: string
        }
        Insert: {
          id: string
          couple_id: string
          question_text: string
          answer_by_a?: string
          answer_by_b?: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          question_text?: string
          answer_by_a?: string
          answer_by_b?: string
          date?: string
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          couple_id: string
          creator_id: string
          title: string
          datetime: string
          repeat_rules?: string
          notification_channels: string[]
          completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          couple_id: string
          creator_id: string
          title: string
          datetime: string
          repeat_rules?: string
          notification_channels?: string[]
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          creator_id?: string
          title?: string
          datetime?: string
          repeat_rules?: string
          notification_channels?: string[]
          completed?: boolean
          created_at?: string
        }
      }
      insecurities: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          author_name: string
          title?: string
          content: string
          attachments: string[]
          urgency: 'low' | 'medium' | 'high'
          visibility: 'sealed' | 'immediate' | 'scheduled'
          unlock_at?: string
          allow_replies: boolean
          tags: string[]
          status: 'sealed' | 'opened' | 'responded' | 'archived'
          opened_by?: string
          opened_at?: string
          created_at: string
        }
        Insert: {
          id: string
          couple_id: string
          author_id: string
          author_name: string
          title?: string
          content: string
          attachments?: string[]
          urgency?: 'low' | 'medium' | 'high'
          visibility?: 'sealed' | 'immediate' | 'scheduled'
          unlock_at?: string
          allow_replies?: boolean
          tags?: string[]
          status?: 'sealed' | 'opened' | 'responded' | 'archived'
          opened_by?: string
          opened_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          author_id?: string
          author_name?: string
          title?: string
          content?: string
          attachments?: string[]
          urgency?: 'low' | 'medium' | 'high'
          visibility?: 'sealed' | 'immediate' | 'scheduled'
          unlock_at?: string
          allow_replies?: boolean
          tags?: string[]
          status?: 'sealed' | 'opened' | 'responded' | 'archived'
          opened_by?: string
          opened_at?: string
          created_at?: string
        }
      }
      insecurity_replies: {
        Row: {
          id: string
          insecurity_id: string
          author_id: string
          author_name: string
          message: string
          created_at: string
        }
        Insert: {
          id: string
          insecurity_id: string
          author_id: string
          author_name: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          insecurity_id?: string
          author_id?: string
          author_name?: string
          message?: string
          created_at?: string
        }
      }
      song_bucket: {
        Row: {
          id: string
          couple_id: string
          added_by_id: string
          added_by_name: string
          spotify_uri: string
          note: string
          created_at: string
        }
        Insert: {
          id: string
          couple_id: string
          added_by_id: string
          added_by_name: string
          spotify_uri: string
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          added_by_id?: string
          added_by_name?: string
          spotify_uri?: string
          note?: string
          created_at?: string
        }
      }
    }
  }
}