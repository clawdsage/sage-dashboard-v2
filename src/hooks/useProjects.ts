import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project, Task } from '@/types/projects'

export function useProjects() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Project[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return {
    projects: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useProject(id: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) throw projectError

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('order_index', { ascending: true })

      if (tasksError) throw tasksError

      return {
        ...project,
        tasks: tasks as Task[],
      } as Project & { tasks: Task[] }
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (!id) return

    const projectsChannel = supabase
      .channel(`project_${id}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['project', id] })
        }
      )
      .subscribe()

    const tasksChannel = supabase
      .channel(`project_${id}_tasks_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['project', id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(tasksChannel)
    }
  }, [queryClient, id])

  return {
    project: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', data.id] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}