import { cn } from '@/lib/utils'
import { 
  Activity, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  Zap
} from 'lucide-react'

interface ActivityFeedItemProps {
  activity: {
    id: string
    type: string
    agentId: string | null
    message: string
    timestamp: string
  }
  agents: Array<{
    id: string
    name: string
    avatar: string
  }>
}

const activityConfig = {
  agent_activated: {
    icon: Zap,
    color: 'text-accent-amber',
    bgColor: 'bg-accent-amber/10',
    label: 'Activated',
  },
  task_created: {
    icon: AlertCircle,
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/10',
    label: 'Task Created',
  },
  comment_posted: {
    icon: MessageSquare,
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
    label: 'Comment',
  },
  task_completed: {
    icon: CheckCircle,
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
    label: 'Completed',
  },
  agent_blocked: {
    icon: AlertCircle,
    color: 'text-accent-red',
    bgColor: 'bg-accent-red/10',
    label: 'Blocked',
  },
  default: {
    icon: Activity,
    color: 'text-text-muted',
    bgColor: 'bg-bg-tertiary',
    label: 'Activity',
  },
}

export default function ActivityFeedItem({ activity, agents }: ActivityFeedItemProps) {
  const config = activityConfig[activity.type as keyof typeof activityConfig] || activityConfig.default
  const Icon = config.icon
  const agent = activity.agentId ? agents.find(a => a.id === activity.agentId) : null

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-bg-tertiary transition-colors">
      {/* Icon */}
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
        config.bgColor,
        config.color
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {agent && (
            <div className="flex items-center gap-1">
              <span className="text-xs bg-bg-tertiary px-2 py-0.5 rounded">
                {agent.avatar} {agent.name}
              </span>
              <span className="text-xs text-text-muted">•</span>
            </div>
          )}
          <span className={cn(
            'text-xs px-2 py-0.5 rounded',
            config.color,
            config.bgColor
          )}>
            {config.label}
          </span>
          <span className="text-xs text-text-muted ml-auto">
            {activity.timestamp}
          </span>
        </div>
        
        <p className="text-sm text-text-primary">
          {activity.message}
        </p>
      </div>
    </div>
  )
}