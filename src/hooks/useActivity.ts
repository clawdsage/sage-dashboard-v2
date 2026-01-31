import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ActivityLog } from '@/types'

const PAGE_SIZE = 20

export function useActivity(eventTypes?: string | string[]) {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: ['activity', eventTypes],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      if (eventTypes) {
        if (Array.isArray(eventTypes)) {
          query = query.in('event_type', eventTypes)
        } else if (eventTypes !== 'all') {
          // Use ilike for prefix matching (e.g., 'agent' matches 'agent_started', 'agent_completed')
          query = query.ilike('event_type', `${eventTypes}%`)
        }
      }

      const { data, error } = await query

      if (error) throw error
      return data as ActivityLog[]
    },
    getNextPageParam: (lastPage, allPages) => {
      // If last page has less than PAGE_SIZE, no more pages
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined
    },
    initialPageParam: 0,
  })

  useEffect(() => {
    const channel = supabase
      .channel('activity_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['activity'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const activities = query.data?.pages.flat() || []
  const isLoading = query.isLoading
  const error = query.error
  const hasMore = !!query.hasNextPage
  const loadMore = () => query.fetchNextPage()

  return {
    activities,
    isLoading,
    error,
    hasMore,
    loadMore,
  }
}