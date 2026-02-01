'use client'

import { MissionControlTask, MissionControlAgent } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MessageSquare, Clock, User, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface TaskCardProps {
  task: MissionControlTask
  agents: MissionControlAgent[]
  onClick: () => void
  onUpdate: (taskId: string, updates: any) => Promise<void>
}

export default function TaskCard({ task, agents, onClick, onUpdate }: TaskCardProps) {
  const assignedAgents = agents.filter(agent => task.assignee_ids.includes(agent.id))
  const timeAgo = formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })

  const priorityConfig = {
    high: {
      label: 'High',
      color: 'bg-accent-red',
      textColor: 'text-accent-red'
    },
    medium: {
      label: 'Medium',
      color: 'bg-accent-amber',
      textColor: 'text-accent-amber'
    },
    low: {
      label: 'Low',
      color: 'bg-accent-green',
      textColor: 'text-accent-green'
    }
  }

  const priority = priorityConfig[task.priority]

  return (
    <Card
      className="p-2 hover:bg-bg-tertiary transition-all cursor-pointer border-l-2"
      style={{ borderLeftColor: priority.color }}
      onClick={onClick}
    >
      <div className="space-y-1.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-xs font-medium text-text-primary line-clamp-2 flex-1">{task.title}</h4>
          <Badge
            variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}
            className="text-[10px] px-1.5 py-0"
          >
            {priority.label}
          </Badge>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-[10px] text-text-secondary line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Assigned agents */}
        {assignedAgents.length > 0 && (
          <div className="flex items-center gap-1">
            <User className="h-2.5 w-2.5 text-text-muted" />
            <div className="flex -space-x-1">
              {assignedAgents.slice(0, 3).map(agent => (
                <div
                  key={agent.id}
                  className="h-5 w-5 rounded-full border border-bg-primary flex items-center justify-center text-[10px] bg-bg-tertiary"
                  title={agent.name}
                >
                  {agent.avatar}
                </div>
              ))}
              {assignedAgents.length > 3 && (
                <div className="h-5 w-5 rounded-full border border-bg-primary flex items-center justify-center text-[10px] bg-bg-tertiary text-text-muted">
                  +{assignedAgents.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-[10px] text-text-muted">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo}
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-text-muted">
              <MessageSquare className="h-2.5 w-2.5" />
              {/* TODO: Add comment count */}
              0
            </div>
          </div>

          {/* Status indicator */}
          <div className={cn(
            "text-xs px-2 py-0.5 rounded",
            task.status === 'done' ? "bg-accent-green/10 text-accent-green" :
            task.status === 'in_progress' ? "bg-accent-amber/10 text-accent-amber" :
            task.status === 'review' ? "bg-accent-purple/10 text-accent-purple" :
            task.status === 'assigned' ? "bg-accent-blue/10 text-accent-blue" :
            "bg-gray-500/10 text-gray-500"
          )}>
            {task.status.replace('_', ' ')}
          </div>
        </div>
      </div>
    </Card>
  )
}