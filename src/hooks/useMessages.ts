import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { MissionControlMessage } from '@/types'

type Message = MissionControlMessage

export function useMessages(taskId: string) {
  const queryClient = useQueryClient()
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Message>>>({})

  // Fetch initial messages data for this task
  const {
    data: messages = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['messages', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!taskId,
    staleTime: 1000 * 60, // 1 minute
  })

  // Apply optimistic updates to the messages data
  const messagesWithOptimisticUpdates = messages.map(message => ({
    ...message,
    ...(optimisticUpdates[message.id] || {})
  }))

  // Subscribe to real-time updates for messages in this task
  const { status: subscriptionStatus, error: subscriptionError } = useRealtimeSubscription<Message>({
    table: 'messages',
    event: '*',
    filter: `task_id=eq.${taskId}`,
    onData: useCallback((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      // Invalidate and refetch queries based on event type
      if (eventType === 'INSERT') {
        queryClient.setQueryData(['messages', taskId], (old: Message[] = []) => {
          return [...old, newRecord]
        })
      } else if (eventType === 'UPDATE') {
        queryClient.setQueryData(['messages', taskId], (old: Message[] = []) => {
          return old.map(message => 
            message.id === newRecord.id ? { ...message, ...newRecord } : message
          )
        })
        // Clear optimistic update for this message
        setOptimisticUpdates(prev => {
          const { [newRecord.id]: _, ...rest } = prev
          return rest
        })
      } else if (eventType === 'DELETE') {
        queryClient.setQueryData(['messages', taskId], (old: Message[] = []) => {
          return old.filter(message => message.id !== oldRecord.id)
        })
      }
    }, [queryClient, taskId]),
    enabled: !!taskId
  })

  // Create a new message (with optimistic update)
  const createMessage = useCallback(async (messageData: {
    content: string
    fromAgentId?: string
    mentions?: string[]
  }) => {
    const newMessage = {
      task_id: taskId,
      content: messageData.content,
      from_agent_id: messageData.fromAgentId || null,
      mentions: messageData.mentions || [],
      created_at: new Date().toISOString()
    }

    // Apply optimistic update with temporary ID
    const tempId = `temp-${Date.now()}`
    setOptimisticUpdates(prev => ({
      ...prev,
      [tempId]: newMessage as any
    }))

    // Send to server
    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single()

    if (error) {
      console.error('Failed to create message:', error)
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
  }, [taskId])

  // Update a message
  const updateMessage = useCallback(async (messageId: string, updates: {
    content?: string
    mentions?: string[]
  }) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [messageId]: { 
        ...prev[messageId], 
        ...updates 
      }
    }))

    // Send update to server
    const { error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)

    if (error) {
      console.error('Failed to update message:', error)
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const { [messageId]: _, ...rest } = prev
        return rest
      })
      throw error
    }

    // Clear optimistic update (server will send real-time update)
    setOptimisticUpdates(prev => {
      const { [messageId]: _, ...rest } = prev
      return rest
    })
  }, [])

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    // Apply optimistic update (remove from local state)
    setOptimisticUpdates(prev => ({
      ...prev,
      [messageId]: { _deleted: true } as any
    }))

    // Send delete to server
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error('Failed to delete message:', error)
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const { [messageId]: _, ...rest } = prev
        return rest
      })
      throw error
    }

    // Clear optimistic update
    setOptimisticUpdates(prev => {
      const { [messageId]: _, ...rest } = prev
      return rest
    })
  }, [])

  // Get message by ID
  const getMessage = useCallback((messageId: string) => {
    return messagesWithOptimisticUpdates.find(message => message.id === messageId)
  }, [messagesWithOptimisticUpdates])

  // Get messages from a specific agent
  const getMessagesFromAgent = useCallback((agentId: string) => {
    return messagesWithOptimisticUpdates.filter(message => message.from_agent_id === agentId)
  }, [messagesWithOptimisticUpdates])

  // Get messages mentioning a specific agent
  const getMessagesMentioningAgent = useCallback((agentId: string) => {
    return messagesWithOptimisticUpdates.filter(message => 
      message.mentions.includes(agentId)
    )
  }, [messagesWithOptimisticUpdates])

  return {
    // Data
    messages: messagesWithOptimisticUpdates,
    isLoading,
    
    // Errors
    error: fetchError || subscriptionError,
    
    // Status
    subscriptionStatus,
    isConnected: subscriptionStatus === 'connected',
    
    // Actions
    refetch,
    createMessage,
    updateMessage,
    deleteMessage,
    
    // Queries
    getMessage,
    getMessagesFromAgent,
    getMessagesMentioningAgent,
    
    // Optimistic updates state (for debugging)
    optimisticUpdates
  }
}