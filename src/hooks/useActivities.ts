import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { MissionControlActivity } from '@/types'

type Activity = MissionControlActivity

export function useActivities(options?: {
  limit?: number
  agentId?: string
  taskId?: string
  types?: string[]
}) {
  const queryClient = useQueryClient()
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Activity>>>({})

  // Build query filters
  const buildQuery = useCallback((query: any) => {
    if (options?.agentId) {
      query = query.eq('agent_id', options.agentId)
    }
    
    if (options?.taskId) {
      query = query.eq('task_id', options.taskId)
    }
    
    if (options?.types && options.types.length > 0) {
      query = query.in('type', options.types)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    return query
  }, [options])

  // Fetch initial activities data
  const {
    data: activities = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['activities', options],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      query = buildQuery(query)
      const { data, error } = await query

      if (error) throw error
      return data
    },
    staleTime: 1000 * 30, // 30 seconds - activities are time-sensitive
  })

  // Apply optimistic updates to the activities data
  const activitiesWithOptimisticUpdates = activities.map(activity => ({
    ...activity,
    ...(optimisticUpdates[activity.id] || {})
  }))

  // Subscribe to real-time updates for activities
  const { status: subscriptionStatus, error: subscriptionError } = useRealtimeSubscription<Activity>({
    table: 'activities',
    event: 'INSERT', // We only care about new activities
    onData: useCallback((payload) => {
      const { eventType, new: newRecord } = payload

      if (eventType === 'INSERT') {
        // Check if this activity matches our filters
        const matchesFilter = () => {
          if (!options) return true
          
          if (options.agentId && newRecord.agent_id !== options.agentId) {
            return false
          }
          
          if (options.taskId && newRecord.task_id !== options.taskId) {
            return false
          }
          
          if (options.types && options.types.length > 0 && !options.types.includes(newRecord.type)) {
            return false
          }
          
          return true
        }

        if (matchesFilter()) {
          queryClient.setQueryData(['activities', options], (old: Activity[] = []) => {
            const newActivities = [newRecord, ...old]
            
            // Apply limit if specified
            if (options?.limit) {
              return newActivities.slice(0, options.limit)
            }
            
            return newActivities
          })
        }
        
        // Clear optimistic update for this activity
        setOptimisticUpdates(prev => {
          const { [newRecord.id]: _, ...rest } = prev
          return rest
        })
      }
    }, [queryClient, options]),
    enabled: true
  })

  // Create a new activity (with optimistic update)
  const createActivity = useCallback(async (activityData: {
    type: string
    message: string
    agentId?: string
    taskId?: string
    metadata?: Record<string, any>
  }) => {
    const newActivity = {
      type: activityData.type,
      message: activityData.message,
      agent_id: activityData.agentId || null,
      task_id: activityData.taskId || null,
      metadata: activityData.metadata || {},
      created_at: new Date().toISOString()
    }

    // Apply optimistic update with temporary ID
    const tempId = `temp-${Date.now()}`
    setOptimisticUpdates(prev => ({
      ...prev,
      [tempId]: newActivity as any
    }))

    // Send to server
    const { data, error } = await supabase
      .from('activities')
      .insert(newActivity)
      .select()
      .single()

    if (error) {
      console.error('Failed to create activity:', error)
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const { [tempId]: _, ...rest } = prev
        return rest
      })
      throw error
    }

    // Clear temporary optimistic update
    setOptimisticUpdates(prev => {
      const { [tempId]: _, ...rest } = prev
      return rest
    })

    return data
  }, [])

  // Helper functions for common activity types
  const logTaskCreated = useCallback((taskId: string, taskTitle: string, agentId?: string) => {
    return createActivity({
      type: 'task_created',
      message: `Task created: "${taskTitle}"`,
      taskId,
      agentId,
      metadata: { task_title: taskTitle }
    })
  }, [createActivity])

  const logAgentActivated = useCallback((agentId: string, agentName: string, taskId?: string) => {
    return createActivity({
      type: 'agent_activated',
      message: `${agentName} activated${taskId ? ' for a task' : ''}`,
      agentId,
      taskId,
      metadata: { agent_name: agentName }
    })
  }, [createActivity])

  const logAgentCompleted = useCallback((agentId: string, agentName: string, taskId?: string) => {
    return createActivity({
      type: 'agent_completed',
      message: `${agentName} completed work${taskId ? ' on a task' : ''}`,
      agentId,
      taskId,
      metadata: { agent_name: agentName }
    })
  }, [createActivity])

  const logCommentPosted = useCallback((taskId: string, agentId?: string, agentName?: string) => {
    return createActivity({
      type: 'comment_posted',
      message: `${agentName || 'User'} posted a comment`,
      agentId,
      taskId,
      metadata: { agent_name: agentName }
    })
  }, [createActivity])

  const logTaskStatusChanged = useCallback((taskId: string, taskTitle: string, oldStatus: string, newStatus: string) => {
    return createActivity({
      type: 'task_status_changed',
      message: `Task "${taskTitle}" moved from ${oldStatus} to ${newStatus}`,
      taskId,
      metadata: { 
        task_title: taskTitle,
        old_status: oldStatus,
        new_status: newStatus 
      }
    })
  }, [createActivity])

  // Get activity by ID
  const getActivity = useCallback((activityId: string) => {
    return activitiesWithOptimisticUpdates.find(activity => activity.id === activityId)
  }, [activitiesWithOptimisticUpdates])

  // Get activities by type
  const getActivitiesByType = useCallback((type: string) => {
    return activitiesWithOptimisticUpdates.filter(activity => activity.type === type)
  }, [activitiesWithOptimisticUpdates])

  return {
    // Data
    activities: activitiesWithOptimisticUpdates,
    isLoading,
    
    // Errors
    error: fetchError || subscriptionError,
    
    // Status
    subscriptionStatus,
    isConnected: subscriptionStatus === 'connected',
    
    // Actions
    refetch,
    createActivity,
    
    // Helper actions for common activity types
    logTaskCreated,
    logAgentActivated,
    logAgentCompleted,
    logCommentPosted,
    logTaskStatusChanged,
    
    // Queries
    getActivity,
    getActivitiesByType,
    
    // Optimistic updates state (for debugging)
    optimisticUpdates
  }
}