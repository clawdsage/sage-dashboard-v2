'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox' // Assuming we have this, or use input
import { ChevronDown, ChevronRight, User, Calendar, AlertCircle, CheckCircle2, Clock, Ban, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/types/projects'

// Assuming we have Checkbox component, if not, can use input[type="checkbox"]
// For now, I'll use a simple checkbox

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: string) => void
  onUpdateTitle: (taskId: string, title: string) => void
  onOpenModal: (taskId: string) => void
  subtasks?: Task[]
  onToggleExpand?: () => void
  isExpanded?: boolean
  level?: number // For indentation
}

const statusConfig = {
  todo: { variant: 'secondary' as const, icon: AlertCircle, label: 'To Do' },
  in_progress: { variant: 'default' as const, icon: Clock, label: 'In Progress' },
  blocked: { variant: 'danger' as const, icon: Ban, label: 'Blocked' },
  review: { variant: 'warning' as const, icon: Eye, label: 'Review' },
  done: { variant: 'success' as const, icon: CheckCircle2, label: 'Done' },
}

const priorityConfig = {
  low: { variant: 'secondary' as const, label: 'Low' },
  medium: { variant: 'warning' as const, label: 'Medium' },
  high: { variant: 'danger' as const, label: 'High' },
  urgent: { variant: 'danger' as const, label: 'Urgent' },
}

export function TaskItem({
  task,
  onToggleComplete,
  onUpdateTitle,
  onOpenModal,
  subtasks,
  onToggleExpand,
  isExpanded,
  level = 0,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)

  const handleTitleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleTitleSubmit = () => {
    if (editValue.trim() && editValue !== task.title) {
      onUpdateTitle(task.id, editValue.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setEditValue(task.title)
      setIsEditing(false)
    }
  }

  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  const hasSubtasks = subtasks && subtasks.length > 0

  return (
    <motion.div
      layout
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg hover:bg-bg-tertiary/50 transition-colors cursor-pointer border border-transparent hover:border-border-subtle',
        level > 0 && 'ml-6 border-l-2 border-border-default',
        task.status === 'done' && 'opacity-60'
      )}
      onClick={() => onOpenModal(task.id)}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={() => onToggleComplete(task.id)}
          className="w-4 h-4 rounded border-border-default bg-bg-secondary text-accent-blue focus:ring-accent-blue"
        />
      </div>

      {/* Expand/Collapse */}
      {hasSubtasks && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 hover:bg-bg-tertiary"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Title */}
      <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-text-primary placeholder-text-muted"
            autoFocus
          />
        ) : (
          <div
            className={cn(
              'text-sm font-medium text-text-primary truncate',
              task.status === 'done' && 'line-through'
            )}
            onClick={handleTitleClick}
          >
            {task.title}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <Badge variant={status.variant} className="text-xs">
        <status.icon className="h-3 w-3 mr-1" />
        {status.label}
      </Badge>

      {/* Priority Indicator */}
      <Badge variant={priority.variant} className="text-xs">
        {priority.label}
      </Badge>

      {/* Assignee Avatar */}
      {task.assigned_to && (
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <div className="w-6 h-6 rounded-full bg-accent-blue flex items-center justify-center text-white text-xs font-medium">
            {task.assigned_to.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Due Date */}
      {task.due_date && (
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Calendar className="h-3 w-3" />
          {formatDate(task.due_date)}
        </div>
      )}
    </motion.div>
  )
}