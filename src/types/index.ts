// Project types
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: number
  order_index: number
  created_at: string
  updated_at: string
}

// Agent types (matches subagent_runs table)
export interface AgentRun {
  id: string
  name: string
  status: 'idle' | 'active' | 'completed' | 'failed'
  progress: number
  project_id?: string | null
  task_id?: string | null
  task_description?: string | null
  started_at: string
  completed_at?: string | null
  estimated_completion?: string | null
  tokens_used: number
  api_calls: number
  cost: number
  review_status: 'pending' | 'approved' | 'rejected'
  output?: string | null
  review_comment?: string | null
  reviewed_at?: string | null
  reviewed_by?: string | null
}

// Activity types
export interface ActivityLog {
  id: string
  event_type: string
  entity_type?: string
  entity_id?: string
  title: string
  description?: string
  metadata?: Record<string, any>
  created_at: string
}

// Stats types
export interface DailyStats {
  date: string
  total_runs: number
  successful_runs: number
  failed_runs: number
  total_tokens: number
  total_cost: number
  avg_duration_ms: number
  models_used?: Record<string, any>
  updated_at: string
}

// UI types
export type StatusColor = 'blue' | 'green' | 'amber' | 'red' | 'purple'

export interface NavItem {
  name: string
  href: string
  icon: any // Lucide icon component
}

// Form types
export interface CreateProjectForm {
  name: string
  description?: string
  color?: string
}

export interface CreateTaskForm {
  project_id: string
  title: string
  description?: string
  priority?: number
}

export interface ReviewForm {
  agent_run_id: string
  review_status: 'approved' | 'rejected'
  review_notes?: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}