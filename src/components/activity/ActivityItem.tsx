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
      return { icon: Play, color: 'text-blue-500' }
    case 'agent_completed':
      return { icon: Check, color: 'text-green-500' }
    case 'agent_failed':
      return { icon: X, color: 'text-red-500' }
    case 'project_created':
      return { icon: FolderPlus, color: 'text-purple-500' }
    case 'task_completed':
      return { icon: CheckSquare, color: 'text-green-500' }
    case 'review_approved':
      return { icon: ThumbsUp, color: 'text-green-500' }
    case 'review_rejected':
      return { icon: ThumbsDown, color: 'text-red-500' }
    default:
      return { icon: Play, color: 'text-gray-500' }
  }
}

export function ActivityItem({ activity, onClick }: ActivityItemProps) {
  const { icon: Icon, color } = getIcon(activity.event_type)
  const relativeTime = formatRelativeTime(new Date(activity.created_at))

  return (
    <div
      className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {activity.title}
        </p>
        {activity.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {activity.description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
        {relativeTime}
      </div>
    </div>
  )
}