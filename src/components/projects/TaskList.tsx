import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Trash2, Check, Circle, Clock } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    onUpdateTask(task.id, { status: newStatus })
  }

  const handleEditStart = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
  }

  const handleEditSave = (taskId: string) => {
    if (editTitle.trim()) {
      onUpdateTask(taskId, { title: editTitle.trim() })
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <Check className="h-4 w-4 text-accent-green" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-accent-amber" />
      default:
        return <Circle className="h-4 w-4 text-text-muted" />
    }
  }

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return <Badge variant="danger">High</Badge>
    if (priority === 2) return <Badge variant="warning">Medium</Badge>
    return <Badge variant="secondary">Low</Badge>
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No tasks yet. Add your first task to get started!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center space-x-3 p-3 rounded-lg border border-border-subtle bg-bg-tertiary hover:bg-bg-elevated transition-colors"
        >
          {/* Checkbox */}
          <button
            onClick={() => handleStatusToggle(task)}
            className="flex-shrink-0"
          >
            {getStatusIcon(task.status)}
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {editingId === task.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleEditSave(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave(task.id)
                  if (e.key === 'Escape') handleEditCancel()
                }}
                className="w-full px-2 py-1 bg-bg-primary border border-border-default rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                autoFocus
              />
            ) : (
              <button
                onClick={() => handleEditStart(task)}
                className="text-left hover:text-accent-blue transition-colors"
              >
                <span className={`text-sm ${task.status === 'done' ? 'line-through text-text-muted' : ''}`}>
                  {task.title}
                </span>
              </button>
            )}
          </div>

          {/* Priority */}
          {getPriorityBadge(task.priority)}

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTask(task.id)}
            className="flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}