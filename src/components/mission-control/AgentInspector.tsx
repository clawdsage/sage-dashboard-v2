'use client'

import { useMemo, useState } from 'react'
import { X, Copy, Download } from 'lucide-react'
import { MissionControlAgent } from '@/types'
import { useAgentRuns } from '@/hooks/useAgentRuns'
import { useAgentRunEvents } from '@/hooks/useAgentRunEvents'
import { cn } from '@/lib/utils'

interface AgentInspectorProps {
  agent: MissionControlAgent
  onClose: () => void
}

export default function AgentInspector({ agent, onClose }: AgentInspectorProps) {
  const [tab, setTab] = useState<'live' | 'archive'>('live')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const { runs, activeRun, lastRun } = useAgentRuns(agent.id)

  const effectiveRunId = useMemo(() => {
    if (tab === 'live' && activeRun?.id) return activeRun.id
    if (selectedRunId) return selectedRunId
    return lastRun?.id
  }, [tab, activeRun?.id, selectedRunId, lastRun?.id])

  const { events } = useAgentRunEvents(effectiveRunId)

  const copyCleanLog = async () => {
    const text = events
      .map(e => {
        const t = new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return `${t}  ${e.verb}  ${e.message}`
      })
      .join('\n')
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  const exportCleanLog = () => {
    const text = events
      .map(e => `${new Date(e.created_at).toISOString()}\t${e.level}\t${e.verb}\t${e.message}`)
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
    <div className="absolute inset-0 z-30">
      {/* scrim over the board only */}
      <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="absolute inset-y-0 left-0 w-[70%] min-w-[320px] max-w-[720px] bg-bg-elevated border-r border-border-subtle shadow-lg animate-in slide-in-from-left duration-200">
        <div className="h-full flex flex-col">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-secondary">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">{agent.avatar} {agent.name}</div>
              <div className="text-[11px] text-text-secondary truncate">{agent.role}</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-bg-tertiary">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* tabs/actions */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab('live')}
                className={cn('text-[12px] px-2 py-1 rounded-md', tab === 'live' ? 'bg-bg-secondary border border-border-subtle' : 'text-text-secondary hover:text-text-primary')}
              >
                Live
              </button>
              <button
                onClick={() => setTab('archive')}
                className={cn('text-[12px] px-2 py-1 rounded-md', tab === 'archive' ? 'bg-bg-secondary border border-border-subtle' : 'text-text-secondary hover:text-text-primary')}
              >
                Archive
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={copyCleanLog} className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-muted" title="Copy log">
                <Copy className="h-4 w-4" />
              </button>
              <button onClick={exportCleanLog} className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-muted" title="Export log">
                <Download className="h-4 w-4" />
              </button>
              <button disabled className="px-2 py-1 rounded-md text-[12px] text-text-muted opacity-50 cursor-not-allowed" title="Raw (coming soon)">
                Raw
              </button>
            </div>
          </div>

          {/* body */}
          <div className="flex-1 overflow-hidden">
            {tab === 'archive' ? (
              <div className="h-full overflow-y-auto p-3 space-y-2">
                {runs.length === 0 ? (
                  <div className="text-sm text-text-muted">No archived runs yet.</div>
                ) : (
                  runs.slice(0, 30).map(r => (
                    <button
                      key={r.id}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border border-border-subtle hover:bg-bg-secondary',
                        selectedRunId === r.id && 'bg-bg-secondary'
                      )}
                      onClick={() => {
                        setSelectedRunId(r.id)
                        setTab('live')
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">{r.title || r.last_line || 'Run'}</div>
                          <div className="text-[11px] text-text-muted">{new Date(r.started_at).toLocaleString()}</div>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full border border-border-subtle text-text-secondary">
                          {r.status}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-3">
                {!effectiveRunId ? (
                  <div className="text-sm text-text-muted">No run selected.</div>
                ) : events.length === 0 ? (
                  <div className="text-sm text-text-muted">No events yet.</div>
                ) : (
                  <div className="space-y-1">
                    {events.slice(-200).map(e => (
                      <div key={e.id} className="flex gap-3 text-sm">
                        <span className="text-text-muted shrink-0 w-16">
                          {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-text-secondary shrink-0 w-24 truncate">{e.verb}</span>
                        <span className={cn('text-text-primary', e.level === 'error' && 'text-accent-red')}>{e.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
