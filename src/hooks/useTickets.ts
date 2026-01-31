import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Ticket } from '@/types/projects'

export function useTickets(filters?: { status?: string, project_id?: string, task_id?: string }) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id)
      }
      if (filters?.task_id) {
        query = query.eq('task_id', filters.task_id)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Ticket[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['tickets'] })
          queryClient.invalidateQueries({ queryKey: ['pendingTickets'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return {
    tickets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function usePendingTickets() {
  const query = useQuery({
    queryKey: ['pendingTickets'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (error) throw error
      return count || 0
    },
  })

  return {
    count: query.data || 0,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticket: Omit<Ticket, 'id' | 'created_at' | 'resolved_at' | 'resolution_note'>) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single()

      if (error) throw error
      return data as Ticket
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTickets'] })
    },
  })
}

export function useResolveTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, resolution_note }: { id: string, status: 'approved' | 'rejected' | 'deferred', resolution_note?: string }) => {
      const updates: Partial<Ticket> = {
        status,
        resolved_at: new Date().toISOString(),
        resolution_note,
      }

      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Ticket
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['pendingTickets'] })
    },
  })
}