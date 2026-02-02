'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MissionControlAgentRun } from '@/types'

export function useAgentRuns(agentId?: string) {
  const [runs, setRuns] = useState<MissionControlAgentRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!agentId) {
      setRuns([])
      setIsLoading(false)
      return
    }

    let mounted = true

    const fetchRuns = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('agent_runs')
          .select('*')
          .eq('agent_id', agentId)
          .order('started_at', { ascending: false })
          .limit(50)

        if (error) throw error
        if (!mounted) return
        setRuns((data as any) || [])
        setError(null)
      } catch (err: any) {
        if (!mounted) return
        setError(err.message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchRuns()

    const channel = supabase
      .channel(`agent-runs-${agentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_runs', filter: `agent_id=eq.${agentId}` },
        () => {
          fetchRuns()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [agentId])

  const activeRun = runs.find(r => r.status === 'running')
  const lastRun = runs[0]

  return { runs, activeRun, lastRun, isLoading, error }
}
