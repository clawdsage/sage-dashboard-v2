import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/projects'

export function useTasks(projectId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data as Task[]
    },
    enabled: !!projectId,
  })

  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`tasks_${projectId}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, projectId])

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] })
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] })
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      return task.project_id
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

export function useReorderTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, tasks }: { projectId: string, tasks: { id: string, order_index: number }[] }) => {
      const updates = tasks.map(({ id, order_index }) => ({
        id,
        order_index,
      }))

      const { error } = await supabase
        .from('tasks')
        .upsert(updates, { onConflict: 'id' })

      if (error) throw error
      return projectId
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}