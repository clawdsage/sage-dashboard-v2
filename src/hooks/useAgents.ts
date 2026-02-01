import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { MissionControlAgent } from '@/types'

type Agent = MissionControlAgent

export function useAgents() {
  const queryClient = useQueryClient()
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Agent>>>({})

  // Fetch initial agents data
  const {
    data: agents = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60, // 1 minute
  })

  // Apply optimistic updates to the agents data
  const agentsWithOptimisticUpdates = agents.map(agent => ({
    ...agent,
    ...(optimisticUpdates[agent.id] || {})
  }))

  // Subscribe to real-time updates for agents
  const { status: subscriptionStatus, error: subscriptionError } = useRealtimeSubscription<Agent>({
    table: 'agents',
    event: '*',
    onData: useCallback((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      // Invalidate and refetch queries based on event type
      if (eventType === 'INSERT') {
        queryClient.setQueryData(['agents'], (old: Agent[] = []) => {
          return [...old, newRecord]
        })
      } else if (eventType === 'UPDATE') {
        queryClient.setQueryData(['agents'], (old: Agent[] = []) => {
          return old.map(agent => 
            agent.id === newRecord.id ? { ...agent, ...newRecord } : agent
          )
        })
        // Clear optimistic update for this agent
        setOptimisticUpdates(prev => {
          const { [newRecord.id]: _, ...rest } = prev
          return rest
        })
      } else if (eventType === 'DELETE') {
        queryClient.setQueryData(['agents'], (old: Agent[] = []) => {
          return old.filter(agent => agent.id !== oldRecord.id)
        })
      }
    }, [queryClient]),
    enabled: true
  })

  // Optimistic update functions
  const updateAgentStatus = useCallback((agentId: string, status: Agent['status']) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], status, updated_at: new Date().toISOString() }
    }))

    // Send update to server
    supabase
      .from('agents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', agentId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to update agent status:', error)
          // Revert optimistic update on error
          setOptimisticUpdates(prev => {
            const { [agentId]: _, ...rest } = prev
            return rest
          })
        }
      })
  }, [])

  const updateAgentCurrentTask = useCallback((agentId: string, taskId: string | null) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [agentId]: { 
        ...prev[agentId], 
        current_task_id: taskId,
        updated_at: new Date().toISOString() 
      }
    }))

    // Send update to server
    supabase
      .from('agents')
      .update({ current_task_id: taskId, updated_at: new Date().toISOString() })
      .eq('id', agentId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to update agent current task:', error)
          // Revert optimistic update on error
          setOptimisticUpdates(prev => {
            const { [agentId]: _, ...rest } = prev
            return rest
          })
        }
      })
  }, [])

  // Get agent by ID
  const getAgent = useCallback((agentId: string) => {
    return agentsWithOptimisticUpdates.find(agent => agent.id === agentId)
  }, [agentsWithOptimisticUpdates])

  // Get agent by session key
  const getAgentBySessionKey = useCallback((sessionKey: string) => {
    return agentsWithOptimisticUpdates.find(agent => agent.session_key === sessionKey)
  }, [agentsWithOptimisticUpdates])

  // Get agents by status
  const getAgentsByStatus = useCallback((status: Agent['status']) => {
    return agentsWithOptimisticUpdates.filter(agent => agent.status === status)
  }, [agentsWithOptimisticUpdates])

  return {
    // Data
    agents: agentsWithOptimisticUpdates,
    isLoading,
    
    // Errors
    error: fetchError || subscriptionError,
    
    // Status
    subscriptionStatus,
    isConnected: subscriptionStatus === 'connected',
    
    // Actions
    refetch,
    updateAgentStatus,
    updateAgentCurrentTask,
    
    // Queries
    getAgent,
    getAgentBySessionKey,
    getAgentsByStatus,
    
    // Optimistic updates state (for debugging)
    optimisticUpdates
  }
}