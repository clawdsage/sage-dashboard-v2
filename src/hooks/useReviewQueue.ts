import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentRun } from '@/types'

export function useReviewQueue() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['reviewQueue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('*')
        .eq('review_status', 'pending')
        .order('completed_at', { ascending: false })

      if (error) throw error
      return data as AgentRun[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('review_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subagent_runs',
          filter: `review_status=eq.pending`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const approveMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { error } = await supabase
        .from('subagent_runs')
        .update({
          review_status: 'approved',
          review_comment: comment,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'user', // TODO: Add actual user ID
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { error } = await supabase
        .from('subagent_runs')
        .update({
          review_status: 'rejected',
          review_comment: comment,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'user', // TODO: Add actual user ID
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
    },
  })

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('subagent_runs')
        .update({
          review_status: 'approved',
          review_comment: 'Bulk approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'user',
        })
        .in('id', ids)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] })
    },
  })

  return {
    reviews: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    approveReview: approveMutation.mutate,
    rejectReview: rejectMutation.mutate,
    bulkApprove: bulkApproveMutation.mutate,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isBulkApproving: bulkApproveMutation.isPending,
  }
}