'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Edge, Node } from 'reactflow'
import type { MissionControlAgentRun, MissionControlAgentRunEvent } from '@/types'

type CrabwalkNodeKind = 'agent' | 'run' | 'event'

type CrabwalkNodeData = {
  kind: CrabwalkNodeKind
  label: string
  meta?: Record<string, any>
}

const makeId = (kind: CrabwalkNodeKind, id: string) => `${kind}:${id}`

export function useCrabwalkGraph() {
  const [runs, setRuns] = useState<MissionControlAgentRun[]>([])
  const [events, setEvents] = useState<MissionControlAgentRunEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [{ data: runsData, error: runsErr }, { data: eventsData, error: eventsErr }] =
        await Promise.all([
          supabase.from('agent_runs').select('*').order('started_at', { ascending: false }).limit(50),
          supabase.from('agent_run_events').select('*').order('created_at', { ascending: false }).limit(250),
        ])

      if (runsErr) throw runsErr
      if (eventsErr) throw eventsErr

      setRuns((runsData as any) || [])
      setEvents((eventsData as any) || [])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load graph')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    const ch = supabase
      .channel('crabwalk')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_runs' }, () => {
        fetchAll()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_run_events' }, (payload) => {
        const ev = payload.new as any
        setEvents(prev => [ev, ...prev].slice(0, 500))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ch)
    }
  }, [fetchAll])

  const { nodes, edges } = useMemo(() => {
    const nodes: Node<CrabwalkNodeData>[] = []
    const edges: Edge[] = []

    // Group by agent
    const agentIds = new Set<string>()
    for (const r of runs) agentIds.add((r as any).agent_id)

    const agentList = Array.from(agentIds)

    const agentXStep = 260
    const runYStep = 110

    agentList.forEach((agentId, agentIdx) => {
      const agentNodeId = makeId('agent', agentId)
      nodes.push({
        id: agentNodeId,
        type: 'default',
        position: { x: agentIdx * agentXStep, y: 0 },
        data: { kind: 'agent', label: agentId },
        style: {
          borderRadius: 14,
          border: '1px solid rgba(0,0,0,0.10)',
          padding: 10,
          background: 'rgba(255,237,213,0.9)',
        },
      })

      const agentRuns = runs
        .filter(r => (r as any).agent_id === agentId)
        .slice(0, 8)

      agentRuns.forEach((run, runIdx) => {
        const runId = (run as any).id as string
        const runNodeId = makeId('run', runId)
        const status = (run as any).status

        nodes.push({
          id: runNodeId,
          type: 'default',
          position: { x: agentIdx * agentXStep, y: 90 + runIdx * runYStep },
          data: {
            kind: 'run',
            label: `${status ?? 'run'} • ${runId.slice(0, 8)}`,
            meta: run as any,
          },
          style: {
            borderRadius: 12,
            border: status === 'running' ? '1px solid rgba(249,115,22,0.55)' : '1px solid rgba(0,0,0,0.10)',
            padding: 10,
            background: status === 'running' ? 'rgba(255,247,237,0.95)' : 'rgba(255,255,255,0.92)',
            boxShadow: status === 'running' ? '0 0 0 3px rgba(249,115,22,0.10)' : undefined,
          },
        })

        edges.push({
          id: `e:${agentNodeId}->${runNodeId}`,
          source: agentNodeId,
          target: runNodeId,
          animated: status === 'running',
          style: {
            stroke: status === 'running' ? 'rgba(249,115,22,0.9)' : 'rgba(0,0,0,0.25)',
            strokeWidth: status === 'running' ? 2.5 : 1.5,
          },
        })

        const runEvents = events
          .filter(e => (e as any).run_id === runId)
          .slice(0, 6)
          .reverse()

        runEvents.forEach((ev, evIdx) => {
          const evId = (ev as any).id as string
          const evNodeId = makeId('event', evId)
          nodes.push({
            id: evNodeId,
            type: 'default',
            position: {
              x: agentIdx * agentXStep + 280,
              y: 90 + runIdx * runYStep + evIdx * 70,
            },
            data: {
              kind: 'event',
              label: `${(ev as any).type ?? 'event'} • ${(ev as any).created_at?.slice?.(11, 19) ?? ''}`.trim(),
              meta: ev as any,
            },
            style: {
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.10)',
              padding: 10,
              background: 'rgba(248,250,252,0.95)',
            },
          })

          edges.push({
            id: `e:${runNodeId}->${evNodeId}`,
            source: runNodeId,
            target: evNodeId,
            animated: status === 'running',
            style: {
              stroke: 'rgba(100,116,139,0.6)',
              strokeWidth: 1.5,
            },
          })
        })
      })
    })

    return { nodes, edges }
  }, [events, runs])

  return {
    nodes,
    edges,
    isLoading,
    error,
    refetch: fetchAll,
  }
}
