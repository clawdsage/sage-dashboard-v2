'use client'

import { MissionControlAgent } from '@/types'
import AgentCard from './AgentCard'

interface AgentColumnProps {
  agents: MissionControlAgent[]
  // keeping prop for now so callers don't break; AgentColumn is read-only
  onAgentStatusChange?: (agentId: string, status: MissionControlAgent['status'], currentTaskId?: string) => Promise<void>
}

export default function AgentColumn({ agents }: AgentColumnProps) {

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
        {sortedAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
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