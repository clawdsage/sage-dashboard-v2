export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  due_date?: string
  owner: 'sage' | 'tim' | 'both'
  tags?: string[]
  color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  order_index: number
  parent_task_id?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface Ticket {
  id: string
  project_id?: string
  task_id?: string
  title: string
  description?: string
  type: 'review' | 'decision' | 'approval' | 'info'
  status: 'pending' | 'approved' | 'rejected' | 'deferred'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_by: 'sage' | 'tim'
  created_at: string
  resolved_at?: string
  resolution_note?: string
}

export interface Comment {
  id: string
  entity_type: 'project' | 'task' | 'ticket'
  entity_id: string
  author: 'tim' | 'sage'
  content: string
  created_at: string
  edited_at?: string
  parent_id?: string
  replies?: Comment[]
}