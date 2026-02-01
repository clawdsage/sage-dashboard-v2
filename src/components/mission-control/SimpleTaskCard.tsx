import { cn } from '@/lib/utils'
import { MessageSquare, Clock, User } from 'lucide-react'

interface SimpleTaskCardProps {
  task: {
    id: string
    title: string
    assigneeIds: string[]
    commentCount: number
    lastActivity: string
    priority: 'low' | 'medium' | 'high'
  }
  agents: Array<{
    id: string
    name: string
    avatar: string
  }>
}

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
  },
  medium: {
    label: 'Medium',
    color: 'text-accent-amber',
    bgColor: 'bg-accent-amber/10',
  },
  high: {
    label: 'High',
    color: 'text-accent-red',
    bgColor: 'bg-accent-red/10',
  },
}

export default function SimpleTaskCard({ task, agents }: SimpleTaskCardProps) {
  const priority = priorityConfig[task.priority]
  const assignees = agents.filter(agent => task.assigneeIds.includes(agent.id))

  return (
    <div className="bg-bg-secondary rounded-lg border border-border-subtle p-4 hover:bg-bg-tertiary transition-colors cursor-move group">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">{task.title}</h4>
        <div className={cn(
          'text-xs px-2 py-0.5 rounded ml-2',
          priority.color,
          priority.bgColor
        )}>
          {priority.label}
        </div>
      </div>

      {/* Assignees */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {assignees.length > 0 ? (
            <div className="flex items-center -space-x-2">
              {assignees.slice(0, 3).map((agent) => (
                <div
                  key={agent.id}
                  className="h-6 w-6 rounded-full border-2 border-bg-secondary bg-bg-tertiary flex items-center justify-center text-xs"
                  title={agent.name}
                >
                  {agent.avatar}
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="h-6 w-6 rounded-full border-2 border-bg-secondary bg-bg-tertiary flex items-center justify-center text-xs text-text-muted">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-text-muted">
              <User className="h-3 w-3" />
              <span className="text-xs">Unassigned</span>
            </div>
          )}
        </div>

        {/* Comment Count */}
        {task.commentCount > 0 && (
          <div className="flex items-center gap-1 text-text-muted">
            <MessageSquare className="h-3 w-3" />
            <span className="text-xs">{task.commentCount}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Clock className="h-3 w-3" />
          <span>{task.lastActivity}</span>
        </div>

        {/* Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-xs text-text-secondary hover:text-text-primary">
            ⋮
          </button>
        </div>
      </div>
    </div>
  )
}