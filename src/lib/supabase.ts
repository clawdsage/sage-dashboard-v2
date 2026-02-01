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
          title: string
          description: string | null
          status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'
          assignee_ids: string[]
          created_by: string
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'
          assignee_ids?: string[]
          created_by?: string
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'
          assignee_ids?: string[]
          created_by?: string
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      subagent_runs: {
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
      alerts: {
        Row: {
          id: string
          type: 'cost' | 'performance' | 'anomaly' | 'usage'
          severity: 'info' | 'warning' | 'critical'
          title: string
          description: string | null
          metric: string
          threshold: number | null
          current_value: number | null
          triggered_at: string
          resolved_at: string | null
          status: 'active' | 'resolved' | 'dismissed'
          source_id: string | null
          source_type: string | null
          created_by: string
          created_at: string
          resolved_by: string | null
          resolution_note: string | null
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          type: 'cost' | 'performance' | 'anomaly' | 'usage'
          severity: 'info' | 'warning' | 'critical'
          title: string
          description?: string | null
          metric: string
          threshold?: number | null
          current_value?: number | null
          triggered_at?: string
          resolved_at?: string | null
          status?: 'active' | 'resolved' | 'dismissed'
          source_id?: string | null
          source_type?: string | null
          created_by?: string
          created_at?: string
          resolved_by?: string | null
          resolution_note?: string | null
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          type?: 'cost' | 'performance' | 'anomaly' | 'usage'
          severity?: 'info' | 'warning' | 'critical'
          title?: string
          description?: string | null
          metric?: string
          threshold?: number | null
          current_value?: number | null
          triggered_at?: string
          resolved_at?: string | null
          status?: 'active' | 'resolved' | 'dismissed'
          source_id?: string | null
          source_type?: string | null
          created_by?: string
          created_at?: string
          resolved_by?: string | null
          resolution_note?: string | null
          metadata?: Record<string, any> | null
        }
      }
      alert_rules: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'cost' | 'performance' | 'anomaly' | 'usage'
          metric: string
          operator: '>' | '>=' | '<' | '<=' | '=' | '!=' | 'change' | 'anomaly'
          threshold: number | null
          window_hours: number
          cooldown_minutes: number
          severity: 'info' | 'warning' | 'critical'
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: 'cost' | 'performance' | 'anomaly' | 'usage'
          metric: string
          operator: '>' | '>=' | '<' | '<=' | '=' | '!=' | 'change' | 'anomaly'
          threshold?: number | null
          window_hours?: number
          cooldown_minutes?: number
          severity?: 'info' | 'warning' | 'critical'
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'cost' | 'performance' | 'anomaly' | 'usage'
          metric?: string
          operator?: '>' | '>=' | '<' | '<=' | '=' | '!=' | 'change' | 'anomaly'
          threshold?: number | null
          window_hours?: number
          cooldown_minutes?: number
          severity?: 'info' | 'warning' | 'critical'
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any> | null
        }
      }
      insights: {
        Row: {
          id: string
          type: 'optimization' | 'pattern' | 'trend' | 'anomaly' | 'recommendation'
          title: string
          description: string
          confidence: number
          impact: 'low' | 'medium' | 'high' | null
          category: 'cost' | 'performance' | 'usage' | 'model' | 'efficiency'
          generated_at: string
          valid_until: string | null
          is_actionable: boolean
          action_text: string | null
          action_url: string | null
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'optimization' | 'pattern' | 'trend' | 'anomaly' | 'recommendation'
          title: string
          description: string
          confidence?: number
          impact?: 'low' | 'medium' | 'high' | null
          category: 'cost' | 'performance' | 'usage' | 'model' | 'efficiency'
          generated_at?: string
          valid_until?: string | null
          is_actionable?: boolean
          action_text?: string | null
          action_url?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'optimization' | 'pattern' | 'trend' | 'anomaly' | 'recommendation'
          title?: string
          description?: string
          confidence?: number
          impact?: 'low' | 'medium' | 'high' | null
          category?: 'cost' | 'performance' | 'usage' | 'model' | 'efficiency'
          generated_at?: string
          valid_until?: string | null
          is_actionable?: boolean
          action_text?: string | null
          action_url?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
      user_alert_preferences: {
        Row: {
          id: string
          user_id: string
          alert_type: string
          channel: 'dashboard' | 'email' | 'slack' | 'all'
          enabled: boolean
          min_severity: 'info' | 'warning' | 'critical'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          alert_type: string
          channel: 'dashboard' | 'email' | 'slack' | 'all'
          enabled?: boolean
          min_severity?: 'info' | 'warning' | 'critical'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_type?: string
          channel?: 'dashboard' | 'email' | 'slack' | 'all'
          enabled?: boolean
          min_severity?: 'info' | 'warning' | 'critical'
          created_at?: string
          updated_at?: string
        }
      }
      // Mission Control Tables
      agents: {
        Row: {
          id: string
          name: string
          role: string
          model: string
          session_key: string | null
          status: 'idle' | 'active' | 'thinking' | 'blocked'
          current_task_id: string | null
          avatar: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          model: string
          session_key?: string | null
          status?: 'idle' | 'active' | 'thinking' | 'blocked'
          current_task_id?: string | null
          avatar?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          model?: string
          session_key?: string | null
          status?: 'idle' | 'active' | 'thinking' | 'blocked'
          current_task_id?: string | null
          avatar?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          task_id: string
          from_agent_id: string | null
          content: string
          mentions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          from_agent_id?: string | null
          content: string
          mentions?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          from_agent_id?: string | null
          content?: string
          mentions?: string[]
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          type: string
          agent_id: string | null
          task_id: string | null
          message: string
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          agent_id?: string | null
          task_id?: string | null
          message: string
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          agent_id?: string | null
          task_id?: string | null
          message?: string
          metadata?: Record<string, any>
          created_at?: string
        }
      }
    }
  }
}