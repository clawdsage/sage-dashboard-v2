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

  // Sort agents: Wilson first, then the rest
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.name === 'Wilson') return -1
    if (b.name === 'Wilson') return 1
    return 0
  })

  return (
    <div className="p-3">
      <h2 className="text-sm font-semibold text-text-primary mb-3">Agent Squad</h2>
      <div className="space-y-2">
        {sortedAgents.map((agent) => {
          const status = statusConfig[agent.status]
          const StatusIcon = status.icon
          
          return (
            <Card key={agent.id} className="p-2.5 hover:bg-bg-tertiary transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className="text-xl">{agent.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-medium text-text-primary">{agent.name}</h3>
                      <Badge 
                        variant={agent.status === 'active' ? 'warning' : 
                                agent.status === 'thinking' ? 'default' : 
                                agent.status === 'blocked' ? 'danger' : 'secondary'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{agent.role}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-bg-tertiary rounded text-text-muted">
                        {agent.model || 'No model'}
                      </span>
                      {agent.current_task_id && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-accent-blue/10 text-accent-blue rounded">
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
                    "transition-all text-xs px-2 py-1 h-7",
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
                      Stop
                    </>
                  )}
                </Button>
              </div>

              {/* Status indicator */}
              <div className="flex items-center mt-1.5 pt-1.5 border-t border-border-subtle">
                <div className="flex items-center">
                  <StatusIcon className={cn("h-3 w-3 mr-1.5", status.textColor)} />
                  <span className={cn("text-xs font-medium", status.textColor)}>
                    {status.label}
                  </span>
                </div>
                {agent.status === 'active' && (
                  <div className="ml-auto">
                    <div className="flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-amber animate-pulse mr-1.5"></div>
                      <span className="text-[10px] text-text-muted">Live</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stats summary */}
      <div className="mt-3 p-3 bg-bg-tertiary rounded-lg">
        <h3 className="text-xs font-medium text-text-primary mb-1.5">Squad Status</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-[10px] text-text-secondary">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-text-primary">
              {agents.filter(a => a.status === 'idle').length}
            </div>
            <div className="text-[10px] text-text-secondary">Idle</div>
          </div>
        </div>
      </div>
    </div>
  )
}