'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Copy, Download, Activity, Clock, Cpu } from 'lucide-react'
import { MissionControlAgent } from '@/types'
import { useAgentRuns } from '@/hooks/useAgentRuns'
import { useAgentRunEvents } from '@/hooks/useAgentRunEvents'

interface AgentCardProps {
  agent: MissionControlAgent
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

export default function AgentCard({ agent }: AgentCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'live' | 'archive'>('live')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const { runs, activeRun, lastRun } = useAgentRuns(agent.id)

  const effectiveRunId = useMemo(() => {
    if (activeRun?.id) return activeRun.id
    if (selectedRunId) return selectedRunId
    return lastRun?.id
  }, [activeRun?.id, selectedRunId, lastRun?.id])

  const { events } = useAgentRunEvents(effectiveRunId)

  const cfg = statusConfig[agent.status]

  const bottomLine = formatBottomLine({
    activeRunLine: activeRun?.last_line || activeRun?.title || null,
    lastRunLine: lastRun?.last_line || lastRun?.title || null,
    lastRunStatus: lastRun?.status || null,
    hasRuns: runs.length > 0,
  })

  const bottomIsArchive = bottomLine === 'Archive'

  const onToggle = () => {
    setIsOpen(v => !v)
    // Default tab behavior
    if (activeRun) setTab('live')
    else setTab('archive')
  }

  const copyCleanLog = async () => {
    const text = events
      .map(e => {
        const t = new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return `${t}  ${e.verb}  ${e.message}`
      })
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore
    }
  }

  const exportCleanLog = () => {
    const text = events
      .map(e => {
        const t = new Date(e.created_at).toISOString()
        return `${t}\t${e.level}\t${e.verb}\t${e.message}`
      })
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agent.name}-log.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

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
        onClick={onToggle}
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
          {isOpen ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
        </div>
      </button>

      {/* Collapsible panel */}
      {isOpen && (
        <div className="border-t border-border-subtle">
          {/* Tabs + actions */}
          <div className="flex items-center justify-between px-2.5 py-2 bg-bg-secondary">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTab('live')}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-md',
                  tab === 'live' ? 'bg-bg-elevated border border-border-subtle text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                Live
              </button>
              <button
                onClick={() => setTab('archive')}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-md',
                  tab === 'archive' ? 'bg-bg-elevated border border-border-subtle text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                Archive
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={copyCleanLog}
                className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-muted"
                title="Copy log"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={exportCleanLog}
                className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-muted"
                title="Export log"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                disabled
                className="p-1.5 rounded-md text-text-muted opacity-50 cursor-not-allowed"
                title="View raw (coming soon)"
              >
                Raw
              </button>
            </div>
          </div>

          {tab === 'live' && (
            <div className="px-2.5 py-2">
              {!effectiveRunId ? (
                <div className="text-[11px] text-text-muted">No run selected.</div>
              ) : events.length === 0 ? (
                <div className="text-[11px] text-text-muted">No events yet.</div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {events.slice(-80).map((e) => (
                    <div key={e.id} className="flex gap-2 text-[11px]">
                      <span className="text-text-muted shrink-0 w-12">
                        {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-text-secondary shrink-0 w-20 truncate">{e.verb}</span>
                      <span className={cn('text-text-primary', e.level === 'error' && 'text-accent-red')}>
                        {e.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'archive' && (
            <div className="px-2.5 py-2">
              {runs.length === 0 ? (
                <div className="text-[11px] text-text-muted">No archived runs yet.</div>
              ) : (
                <div className="space-y-1">
                  {runs.slice(0, 10).map((r) => (
                    <button
                      key={r.id}
                      className={cn(
                        'w-full text-left p-2 rounded-md border border-border-subtle hover:bg-bg-secondary',
                        effectiveRunId === r.id && 'bg-bg-secondary'
                      )}
                      onClick={() => {
                        setSelectedRunId(r.id)
                        setTab('live')
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-text-primary truncate">
                            {r.title || r.last_line || 'Run'}
                          </div>
                          <div className="text-[10px] text-text-muted">
                            {new Date(r.started_at).toLocaleString()}
                          </div>
                        </div>
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full border',
                          r.status === 'completed' && 'border-accent-green/20 text-accent-green',
                          r.status === 'failed' && 'border-accent-red/30 text-accent-red',
                          r.status === 'running' && 'border-accent-amber/30 text-accent-amber',
                          (r.status === 'cancelled') && 'border-border-subtle text-text-muted'
                        )}>
                          {r.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
