import React from 'react'
import { Play, Check, X, FolderPlus, CheckSquare, ThumbsUp, ThumbsDown } from 'lucide-react'
import { ActivityLog } from '@/types'
import { formatRelativeTime } from '@/lib/formatters'

interface ActivityItemProps {
  activity: ActivityLog
  onClick?: () => void
}

const getIcon = (eventType: string) => {
  switch (eventType) {
    case 'agent_started':
      return { icon: Play, color: 'text-accent-blue' }
    case 'agent_completed':
      return { icon: Check, color: 'text-accent-green' }
    case 'agent_failed':
      return { icon: X, color: 'text-accent-red' }
    case 'project_created':
      return { icon: FolderPlus, color: 'text-accent-purple' }
    case 'task_completed':
      return { icon: CheckSquare, color: 'text-accent-green' }
    case 'review_approved':
      return { icon: ThumbsUp, color: 'text-accent-green' }
    case 'review_rejected':
      return { icon: ThumbsDown, color: 'text-accent-red' }
    default:
      return { icon: Play, color: 'text-text-muted' }
  }
}

export function ActivityItem({ activity, onClick }: ActivityItemProps) {
  const { icon: Icon, color } = getIcon(activity.event_type)
  const relativeTime = formatRelativeTime(new Date(activity.created_at))

  return (
    <div
      className="flex items-center gap-3 p-3 border-b border-border-subtle hover:bg-bg-tertiary cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {activity.title}
        </p>
        {activity.description && (
          <p className="text-xs text-text-muted truncate">
            {activity.description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 text-xs text-text-muted">
        {relativeTime}
      </div>
    </div>
  )
}