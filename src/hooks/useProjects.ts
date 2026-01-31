import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row'] & {
  task_count: number
  completed_tasks: number
  in_progress_tasks: number
}

export function useProjects() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // Fetch projects with task aggregates
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // Fetch task counts for each project
      const projectsWithCounts = await Promise.all(
        projects.map(async (project) => {
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('status')
            .eq('project_id', project.id)

          if (tasksError) throw tasksError

          const task_count = tasks.length
          const completed_tasks = tasks.filter(t => t.status === 'done').length
          const in_progress_tasks = tasks.filter(t => t.status === 'in_progress').length

          return {
            ...project,
            task_count,
            completed_tasks,
            in_progress_tasks,
          }
        })
      )

      return projectsWithCounts as Project[]
    },
  })

  // Real-time subscriptions
  useEffect(() => {
    const projectsChannel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }
      )
      .subscribe()

    const tasksChannel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(tasksChannel)
    }
  }, [queryClient])

  // Mutations
  const createProject = useMutation({
    mutationFn: async (project: Database['public']['Tables']['projects']['Insert']) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Database['public']['Tables']['projects']['Update'] }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const deleteProject = useMutation({
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

  return {
    projects: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createProject,
    updateProject,
    deleteProject,
  }
}