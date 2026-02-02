'use client'

import { cn } from '@/lib/utils'
import { ChevronRight, Activity, Clock, Cpu } from 'lucide-react'
import { MissionControlAgent } from '@/types'
import { useAgentRuns } from '@/hooks/useAgentRuns'

interface AgentCardProps {
  agent: MissionControlAgent
  onOpenInspector: (agent: MissionControlAgent) => void
}

const statusConfig = {
  idle: {
    label: 'Idle',
    dot: 'bg-gray-400',
    pillBg: 'bg-gray-500/10',
    pillText: 'text-gray-600',
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: 'Active',
    dot: 'bg-accent-amber',
    pillBg: 'bg-accent-amber/10',
    pillText: 'text-accent-amber',
    icon: <Activity className="h-3 w-3 animate-pulse" />,
  },
  thinking: {
    label: 'Thinking',
    dot: 'bg-accent-blue',
    pillBg: 'bg-accent-blue/10',
    pillText: 'text-accent-blue',
    icon: <Activity className="h-3 w-3 animate-pulse" />,
  },
  blocked: {
    label: 'Blocked',
    dot: 'bg-accent-red',
    pillBg: 'bg-accent-red/10',
    pillText: 'text-accent-red',
    icon: <Activity className="h-3 w-3" />,
  },
} as const

function formatBottomLine(params: {
  activeRunLine?: string | null
  lastRunLine?: string | null
  lastRunStatus?: string | null
  hasRuns: boolean
}) {
  const { activeRunLine, lastRunLine, lastRunStatus, hasRuns } = params

  if (activeRunLine) return `Working — ${activeRunLine}`
  if (hasRuns) {
    const suffix = lastRunStatus && lastRunStatus !== 'completed' ? ` (${lastRunStatus})` : ' (done)'
    return `Last — ${lastRunLine || 'completed run'}${suffix}`
  }
  return 'Archive'
}

export default function AgentCard({ agent, onOpenInspector }: AgentCardProps) {
  // drawer handles detail view; card only shows summary

  const { runs, activeRun, lastRun } = useAgentRuns(agent.id)

  const cfg = statusConfig[agent.status]

  const bottomLine = formatBottomLine({
    activeRunLine: activeRun?.last_line || activeRun?.title || null,
    lastRunLine: lastRun?.last_line || lastRun?.title || null,
    lastRunStatus: lastRun?.status || null,
    hasRuns: runs.length > 0,
  })

  const bottomIsArchive = bottomLine === 'Archive'

  return (
    <div className={cn('rounded-lg border border-border-subtle bg-bg-elevated shadow-sm')}> 
      {/* Top row */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-xl border', 'border-border-subtle')}>
              {agent.avatar}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text-primary truncate">{agent.name}</h3>
                <div className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px]', cfg.pillBg, cfg.pillText)}>
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary truncate">{agent.role}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-text-muted truncate">
                <Cpu className="h-3 w-3" />
                <span className="truncate">{agent.model}</span>
              </div>
            </div>
          </div>

          <div className={cn('h-2 w-2 rounded-full mt-1', cfg.dot)} />
        </div>
      </div>

      {/* Bottom cell (Working / Last / Archive) */}
      <button
        type="button"
        onClick={() => onOpenInspector(agent)}
        className={cn(
          'w-full border-t border-border-subtle px-2.5 py-2 text-left',
          'hover:bg-bg-secondary transition-colors'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className={cn('text-[11px] font-medium', bottomIsArchive ? 'text-text-secondary' : 'text-text-primary')}>
              <span className="truncate block">{bottomLine}</span>
            </div>
            {runs.length > 0 && !activeRun && (
              <div className="text-[10px] text-text-muted">
                {new Date(lastRun!.started_at).toLocaleString()}
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted" />
        </div>
      </button>
    </div>
  )
}
