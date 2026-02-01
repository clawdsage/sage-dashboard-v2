import { cn } from '@/lib/utils'
import { Activity, Cpu, Clock } from 'lucide-react'
import { MissionControlAgent } from '@/types'

interface AgentCardProps {
  agent: MissionControlAgent & {
    currentTask?: string | null
  }
}

const statusConfig = {
  idle: {
    label: 'Idle',
    color: 'bg-gray-500',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500',
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: 'Active',
    color: 'bg-accent-amber',
    textColor: 'text-accent-amber',
    borderColor: 'border-accent-amber',
    icon: <Activity className="h-3 w-3 animate-pulse" />,
    glow: 'shadow-glow',
  },
  thinking: {
    label: 'Thinking',
    color: 'bg-accent-blue',
    textColor: 'text-accent-blue',
    borderColor: 'border-accent-blue',
    icon: <Activity className="h-3 w-3 animate-pulse" />,
    pulse: true,
  },
  blocked: {
    label: 'Blocked',
    color: 'bg-accent-red',
    textColor: 'text-accent-red',
    borderColor: 'border-accent-red',
    icon: <Activity className="h-3 w-3" />,
  },
}

export default function AgentCard({ agent }: AgentCardProps) {
  const config = statusConfig[agent.status]

  return (
    <div className={cn(
      'bg-bg-secondary rounded-lg border border-border-subtle p-4 transition-all hover:bg-bg-tertiary',
      agent.status === 'active' && 'shadow-glow'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center text-2xl border-2',
            config.borderColor,
            agent.status === 'active' && 'animate-pulse'
          )}>
            {agent.avatar}
          </div>

          {/* Agent Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{agent.name}</h3>
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                config.textColor,
                'bg-opacity-10',
                agent.status === 'active' ? 'bg-accent-amber' :
                agent.status === 'thinking' ? 'bg-accent-blue' :
                agent.status === 'blocked' ? 'bg-accent-red' : 'bg-gray-500'
              )}>
                {config.icon}
                <span>{config.label}</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-1">{agent.role}</p>
            
            {/* Model Info */}
            <div className="flex items-center gap-2 mt-2">
              <Cpu className="h-3 w-3 text-text-muted" />
              <span className="text-xs text-text-muted">{agent.model}</span>
            </div>

            {/* Current Task */}
            {(agent.currentTask || agent.current_task_id) && (
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <p className="text-xs text-text-secondary">Current Task</p>
                <p className="text-sm mt-1 line-clamp-2">
                  {agent.currentTask || `Task #${agent.current_task_id?.slice(0, 8)}...`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className={cn(
          'h-3 w-3 rounded-full',
          config.color,
          agent.status === 'thinking' && 'animate-pulse'
        )} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button className={cn(
          'flex-1 text-sm py-1.5 rounded-md transition-colors',
          agent.status === 'idle'
            ? 'bg-accent-blue text-white hover:bg-accent-blue/80'
            : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
        )}>
          {agent.status === 'idle' ? 'Activate' : 'View Task'}
        </button>
        <button className="text-sm py-1.5 px-3 rounded-md bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors">
          Details
        </button>
      </div>
    </div>
  )
}