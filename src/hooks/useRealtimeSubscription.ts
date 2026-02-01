import { useEffect, useRef, useState, useCallback } from 'react'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type SubscriptionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface UseRealtimeSubscriptionOptions<T> {
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onData?: (payload: RealtimePostgresChangesPayload<T>) => void
  onStatusChange?: (status: SubscriptionStatus) => void
  enabled?: boolean
}

export function useRealtimeSubscription<T = any>({
  table,
  event = '*',
  filter,
  onData,
  onStatusChange,
  enabled = true
}: UseRealtimeSubscriptionOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [status, setStatus] = useState<SubscriptionStatus>('disconnected')
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<RealtimePostgresChangesPayload<T>[]>([])

  const updateStatus = useCallback((newStatus: SubscriptionStatus) => {
    setStatus(newStatus)
    onStatusChange?.(newStatus)
  }, [onStatusChange])

  const handleData = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
    setData(prev => [...prev, payload])
    onData?.(payload)
  }, [onData])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enabled) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        updateStatus('disconnected')
      }
      return
    }

    let channel: RealtimeChannel
    
    try {
      updateStatus('connecting')
      
      // Create channel with filter if provided
      if (filter) {
        channel = supabase
          .channel(`public:${table}:${filter}`)
          .on(
            'postgres_changes',
            {
              event,
              schema: 'public',
              table,
              filter: filter
            },
            handleData
          )
      } else {
        channel = supabase
          .channel(`public:${table}`)
          .on(
            'postgres_changes',
            {
              event,
              schema: 'public',
              table
            },
            handleData
          )
      }

      // Subscribe to channel
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          updateStatus('connected')
          setError(null)
        } else if (status === 'CHANNEL_ERROR') {
          updateStatus('error')
          setError(new Error('Channel error'))
        } else if (status === 'TIMED_OUT') {
          updateStatus('error')
          setError(new Error('Connection timed out'))
        } else if (status === 'CLOSED') {
          updateStatus('disconnected')
        }
      })

      channelRef.current = channel

    } catch (err) {
      updateStatus('error')
      setError(err instanceof Error ? err : new Error('Unknown error'))
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        updateStatus('disconnected')
      }
    }
  }, [table, event, filter, enabled, handleData, updateStatus])

  // Handle reconnection on error
  useEffect(() => {
    if (status === 'error' && enabled) {
      const timer = setTimeout(() => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
          updateStatus('disconnected')
        }
      }, 5000) // Try to reconnect after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [status, enabled, updateStatus])

  return {
    status,
    error,
    data,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isError: status === 'error',
    reconnect: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        updateStatus('disconnected')
      }
    }
  }
}