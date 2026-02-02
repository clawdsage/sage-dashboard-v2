'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MissionControlAgentRunEvent } from '@/types'

export function useAgentRunEvents(runId?: string) {
  const [events, setEvents] = useState<MissionControlAgentRunEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!runId) {
      setEvents([])
      setIsLoading(false)
      return
    }

    let mounted = true

    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('agent_run_events')
          .select('*')
          .eq('run_id', runId)
          .order('created_at', { ascending: true })
          .limit(200)

        if (error) throw error
        if (!mounted) return
        setEvents((data as any) || [])
        setError(null)
      } catch (err: any) {
        if (!mounted) return
        setError(err.message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchEvents()

    const channel = supabase
      .channel(`agent-run-events-${runId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_run_events', filter: `run_id=eq.${runId}` },
        (payload) => {
          const newEvent = payload.new as any
          setEvents(prev => [...prev, newEvent])
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [runId])

  return { events, isLoading, error }
}
