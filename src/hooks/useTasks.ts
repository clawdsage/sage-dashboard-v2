import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { MissionControlTask } from '@/types'

type Task = MissionControlTask
type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'

export function useTasks(options?: {
  projectId?: string
  status?: TaskStatus | TaskStatus[]
  assigneeId?: string
}) {
  const queryClient = useQueryClient()
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Task>>>({})

  // Build query filters
  const buildQuery = useCallback((query: any) => {
    if (options?.projectId) {
      query = query.eq('project_id', options.projectId)
    }
    
    if (options?.status) {
      if (Array.isArray(options.status)) {
        query = query.in('status', options.status)
      } else {
        query = query.eq('status', options.status)
      }
    }
    
    if (options?.assigneeId) {
      query = query.contains('assignee_ids', [options.assigneeId])
    }
    
    return query
  }, [options])

  // Fetch initial tasks data
  const {
    data: tasks = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['tasks', options],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })

      query = buildQuery(query)
      const { data, error } = await query

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60, // 1 minute
  })

  // Apply optimistic updates to the tasks data
  const tasksWithOptimisticUpdates = tasks.map(task => ({
    ...task,
    ...(optimisticUpdates[task.id] || {})
  }))

  // Subscribe to real-time updates for tasks
  const { status: subscriptionStatus, error: subscriptionError } = useRealtimeSubscription<Task>({
    table: 'tasks',
    event: '*',
    onData: useCallback((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      // Check if this task matches our filters
      const matchesFilter = () => {
        if (!options) return true
        
        if (options.projectId && newRecord.project_id !== options.projectId) {
          return false
        }
        
        if (options.status) {
          const statuses = Array.isArray(options.status) ? options.status : [options.status]
          if (!statuses.includes(newRecord.status as TaskStatus)) {
            return false
          }
        }
        
        if (options.assigneeId && !newRecord.assignee_ids.includes(options.assigneeId)) {
          return false
        }
        
        return true
      }

      // Invalidate and refetch queries based on event type
      if (eventType === 'INSERT') {
        if (matchesFilter()) {
          queryClient.setQueryData(['tasks', options], (old: Task[] = []) => {
            return [...old, newRecord]
          })
        }
      } else if (eventType === 'UPDATE') {
        queryClient.setQueryData(['tasks', options], (old: Task[] = []) => {
          const updatedTasks = old.map(task => 
            task.id === newRecord.id ? { ...task, ...newRecord } : task
          )
          
          // If task no longer matches filter after update, remove it
          if (!matchesFilter()) {
            return updatedTasks.filter(task => task.id !== newRecord.id)
          }
          
          return updatedTasks
        })
        
        // Clear optimistic update for this task
        setOptimisticUpdates(prev => {
          const { [newRecord.id]: _, ...rest } = prev
          return rest
        })
      } else if (eventType === 'DELETE') {
        queryClient.setQueryData(['tasks', options], (old: Task[] = []) => {
          return old.filter(task => task.id !== oldRecord.id)
        })
      }
    }, [queryClient, options]),
    enabled: true
  })

  // Optimistic update functions
  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [taskId]: { 
        ...prev[taskId], 
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'done' ? { completed_at: new Date().toISOString() } : {})
      }
    }))

    // Send update to server
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (status === 'done') {
      updateData.completed_at = new Date().toISOString()
    }

    supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to update task status:', error)
          // Revert optimistic update on error
          setOptimisticUpdates(prev => {
            const { [taskId]: _, ...rest } = prev
            return rest
          })
        }
      })
  }, [])

  const assignTask = useCallback((taskId: string, agentIds: string[]) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [taskId]: { 
        ...prev[taskId], 
        assignee_ids: agentIds,
        status: agentIds.length > 0 ? 'assigned' : 'inbox',
        updated_at: new Date().toISOString() 
      }
    }))

    // Send update to server
    supabase
      .from('tasks')
      .update({ 
        assignee_ids: agentIds,
        status: agentIds.length > 0 ? 'assigned' : 'inbox',
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to assign task:', error)
          // Revert optimistic update on error
          setOptimisticUpdates(prev => {
            const { [taskId]: _, ...rest } = prev
            return rest
          })
        }
      })
  }, [])

  const updateTaskOrder = useCallback((taskId: string, orderIndex: number) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [taskId]: { 
        ...prev[taskId], 
        order_index: orderIndex,
        updated_at: new Date().toISOString() 
      }
    }))

    // Send update to server
    supabase
      .from('tasks')
      .update({ 
        order_index: orderIndex,
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to update task order:', error)
          // Revert optimistic update on error
          setOptimisticUpdates(prev => {
            const { [taskId]: _, ...rest } = prev
            return rest
          })
        }
      })
  }, [])

  const createTask = useCallback(async (taskData: {
    title: string
    description?: string
    project_id: string
    priority?: 'low' | 'medium' | 'high'
    assignee_ids?: string[]
  }) => {
    const newTask = {
      ...taskData,
      status: 'inbox' as const,
      order_index: 0,
      created_by: 'sage',
      assignee_ids: taskData.assignee_ids || [],
      priority: taskData.priority || 'medium'
    }

    // Apply optimistic update with temporary ID
    const tempId = `temp-${Date.now()}`
    setOptimisticUpdates(prev => ({
      ...prev,
      [tempId]: newTask as any
    }))

    // Send to server
    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single()

    if (error) {
      console.error('Failed to create task:', error)
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

  // Get task by ID
  const getTask = useCallback((taskId: string) => {
    return tasksWithOptimisticUpdates.find(task => task.id === taskId)
  }, [tasksWithOptimisticUpdates])

  // Get tasks by status
  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasksWithOptimisticUpdates.filter(task => task.status === status)
  }, [tasksWithOptimisticUpdates])

  return {
    // Data
    tasks: tasksWithOptimisticUpdates,
    isLoading,
    
    // Errors
    error: fetchError || subscriptionError,
    
    // Status
    subscriptionStatus,
    isConnected: subscriptionStatus === 'connected',
    
    // Actions
    refetch,
    updateTaskStatus,
    assignTask,
    updateTaskOrder,
    createTask,
    
    // Queries
    getTask,
    getTasksByStatus,
    
    // Optimistic updates state (for debugging)
    optimisticUpdates
  }
}