'use client'

import { MissionControlAgent } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Play, Pause, Brain, AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentColumnProps {
  agents: MissionControlAgent[]
  onAgentStatusChange: (agentId: string, status: MissionControlAgent['status'], currentTaskId?: string) => Promise<void>
}

const statusConfig = {
  idle: {
    label: 'Idle',
    color: 'bg-gray-500',
    icon: Pause,
    textColor: 'text-gray-500'
  },
  active: {
    label: 'Active',
    color: 'bg-accent-amber',
    icon: Zap,
    textColor: 'text-accent-amber'
  },
  thinking: {
    label: 'Thinking',
    color: 'bg-accent-blue',
    icon: Brain,
    textColor: 'text-accent-blue'
  },
  blocked: {
    label: 'Blocked',
    color: 'bg-accent-red',
    icon: AlertCircle,
    textColor: 'text-accent-red'
  }
}

export default function AgentColumn({ agents, onAgentStatusChange }: AgentColumnProps) {
  const handleActivateAgent = async (agent: MissionControlAgent) => {
    if (agent.status === 'idle') {
      await onAgentStatusChange(agent.id, 'active')
    } else {
      await onAgentStatusChange(agent.id, 'idle')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Agent Squad</h2>
      <div className="space-y-3">
        {agents.map((agent) => {
          const status = statusConfig[agent.status]
          const StatusIcon = status.icon
          
          return (
            <Card key={agent.id} className="p-4 hover:bg-bg-tertiary transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{agent.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-text-primary">{agent.name}</h3>
                      <Badge 
                        variant={agent.status === 'active' ? 'warning' : 
                                agent.status === 'thinking' ? 'default' : 
                                agent.status === 'blocked' ? 'danger' : 'secondary'}
                        className="text-xs"
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{agent.role}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-bg-tertiary rounded text-text-muted">
                        {agent.model || 'No model'}
                      </span>
                      {agent.current_task_id && (
                        <span className="text-xs px-2 py-1 bg-accent-blue/10 text-accent-blue rounded">
                          On Task
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant={agent.status === 'idle' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => handleActivateAgent(agent)}
                  className={cn(
                    "transition-all",
                    agent.status === 'active' && "bg-accent-amber hover:bg-accent-amber/90"
                  )}
                >
                  {agent.status === 'idle' ? (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Activate
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Deactivate
                    </>
                  )}
                </Button>
              </div>

              {/* Status indicator */}
              <div className="flex items-center mt-3 pt-3 border-t border-border-subtle">
                <div className="flex items-center">
                  <StatusIcon className={cn("h-4 w-4 mr-2", status.textColor)} />
                  <span className={cn("text-sm font-medium", status.textColor)}>
                    {status.label}
                  </span>
                </div>
                {agent.status === 'active' && (
                  <div className="ml-auto">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-accent-amber animate-pulse mr-2"></div>
                      <span className="text-xs text-text-muted">Live</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stats summary */}
      <div className="mt-6 p-4 bg-bg-tertiary rounded-lg">
        <h3 className="text-sm font-medium text-text-primary mb-2">Squad Status</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-xs text-text-secondary">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">
              {agents.filter(a => a.status === 'idle').length}
            </div>
            <div className="text-xs text-text-secondary">Idle</div>
          </div>
        </div>
      </div>
    </div>
  )
}