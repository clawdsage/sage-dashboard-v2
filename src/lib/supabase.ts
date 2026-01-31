import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          priority: number
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          priority?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      agent_runs: {
        Row: {
          id: string
          session_key: string | null
          label: string | null
          name: string
          model: string | null
          status: string
          progress: number
          project_id: string | null
          task_id: string | null
          task_description: string | null
          started_at: string
          completed_at: string | null
          tokens_input: number
          tokens_output: number
          tokens_total: number
          cost: number
          duration_ms: number | null
          review_status: string
          output_summary: string | null
          review_notes: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_key?: string | null
          label?: string | null
          name: string
          model?: string | null
          status?: string
          progress?: number
          project_id?: string | null
          task_id?: string | null
          task_description?: string | null
          started_at?: string
          completed_at?: string | null
          tokens_input?: number
          tokens_output?: number
          tokens_total?: number
          cost?: number
          duration_ms?: number | null
          review_status?: string
          output_summary?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_key?: string | null
          label?: string | null
          name?: string
          model?: string | null
          status?: string
          progress?: number
          project_id?: string | null
          task_id?: string | null
          task_description?: string | null
          started_at?: string
          completed_at?: string | null
          tokens_input?: number
          tokens_output?: number
          tokens_total?: number
          cost?: number
          duration_ms?: number | null
          review_status?: string
          output_summary?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          event_type: string
          entity_type: string | null
          entity_id: string | null
          title: string
          description: string | null
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          entity_type?: string | null
          entity_id?: string | null
          title: string
          description?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          entity_type?: string | null
          entity_id?: string | null
          title?: string
          description?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
      daily_stats: {
        Row: {
          date: string
          total_runs: number
          successful_runs: number
          failed_runs: number
          total_tokens: number
          total_cost: number
          avg_duration_ms: number
          models_used: Record<string, any> | null
          updated_at: string
        }
        Insert: {
          date: string
          total_runs?: number
          successful_runs?: number
          failed_runs?: number
          total_tokens?: number
          total_cost?: number
          avg_duration_ms?: number
          models_used?: Record<string, any> | null
          updated_at?: string
        }
        Update: {
          date?: string
          total_runs?: number
          successful_runs?: number
          failed_runs?: number
          total_tokens?: number
          total_cost?: number
          avg_duration_ms?: number
          models_used?: Record<string, any> | null
          updated_at?: string
        }
      }
    }
  }
}