import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/types'

export function useAgents(status?: 'active' | 'completed' | 'failed') {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['agents', status],
    queryFn: async () => {
      let query = supabase
        .from('subagent_runs')
        .select('*')
        .order('started_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data as AgentRun[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('subagent_runs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['agents'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return {
    agents: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}