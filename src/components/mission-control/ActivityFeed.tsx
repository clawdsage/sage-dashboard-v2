'use client'

import { MissionControlActivity } from '@/types'
import { Card } from '@/components/ui/Card'
import { 
  Plus, 
  MessageSquare, 
  User, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Brain,
  Pause,
  MoveRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  activities: MissionControlActivity[]
}

const activityIcons = {
  task_created: Plus,
  task_updated: MoveRight,
  task_completed: CheckCircle,
  task_deleted: AlertCircle,
  comment_posted: MessageSquare,
  agent_activated: Zap,
  agent_idle: Pause,
  agent_thinking: Brain,
  agent_blocked: AlertCircle,
  default: User
}

const activityColors = {
  task_created: 'text-accent-green',
  task_updated: 'text-accent-blue',
  task_completed: 'text-accent-green',
  task_deleted: 'text-accent-red',
  comment_posted: 'text-accent-purple',
  agent_activated: 'text-accent-amber',
  agent_idle: 'text-gray-500',
  agent_thinking: 'text-accent-blue',
  agent_blocked: 'text-accent-red',
  default: 'text-text-muted'
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    const Icon = activityIcons[type as keyof typeof activityIcons] || activityIcons.default
    const color = activityColors[type as keyof typeof activityColors] || activityColors.default
    
    return <Icon className={cn("h-4 w-4", color)} />
  }

  const formatActivityMessage = (activity: MissionControlActivity) => {
    return activity.message
  }

  return (
    <div className="h-full p-3">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-text-primary">Activity Feed</h2>
        <p className="text-xs text-text-secondary">Real-time squad updates</p>
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-sm font-medium text-text-primary mb-1">No activity yet</h3>
            <p className="text-xs text-text-secondary">
              Create tasks and activate agents
            </p>
          </Card>
        ) : (
          activities.map((activity) => {
            const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
            
            return (
              <Card key={activity.id} className="p-2 hover:bg-bg-tertiary transition-colors">
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary leading-relaxed">
                      {formatActivityMessage(activity)}
                    </p>
                    
                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="mt-1 flex gap-1">
                        {activity.metadata.task_id && (
                          <span className="text-[10px] text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded">
                            Task
                          </span>
                        )}
                        {activity.metadata.agent_id && (
                          <span className="text-[10px] text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded">
                            Agent
                          </span>
                        )}
                      </div>
                    )}

                    {/* Time */}
                    <p className="text-[10px] text-text-muted mt-1">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Stats */}
      {activities.length > 0 && (
        <div className="mt-3 p-3 bg-bg-tertiary rounded-lg">
          <h3 className="text-xs font-medium text-text-primary mb-1.5">Today's Activity</h3>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">
                {activities.filter(a => a.type.includes('task')).length}
              </div>
              <div className="text-[10px] text-text-secondary">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">
                {activities.filter(a => a.type.includes('agent')).length}
              </div>
              <div className="text-[10px] text-text-secondary">Agents</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">
                {activities.filter(a => a.type.includes('comment')).length}
              </div>
              <div className="text-[10px] text-text-secondary">Comments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}