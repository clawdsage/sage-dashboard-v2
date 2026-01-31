import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Comment } from '@/types/projects'

function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const roots: Comment[] = []

  // First pass: create map and initialize replies
  comments.forEach(comment => {
    comment.replies = []
    commentMap.set(comment.id, comment)
  })

  // Second pass: build tree
  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.replies!.push(comment)
      }
    } else {
      roots.push(comment)
    }
  })

  return roots
}

export function useComments(entityType: 'project' | 'task' | 'ticket', entityId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const comments = data as Comment[]
      return buildCommentTree(comments)
    },
    enabled: !!entityId,
  })

  useEffect(() => {
    if (!entityId) return

    const channel = supabase
      .channel(`comments_${entityType}_${entityId}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `entity_type=eq.${entityType},entity_id=eq.${entityId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['comments', entityType, entityId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, entityType, entityId])

  return {
    comments: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (comment: Omit<Comment, 'id' | 'created_at' | 'edited_at' | 'replies'>) => {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single()

      if (error) throw error
      return data as Comment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.entity_type, data.entity_id] })
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Pick<Comment, 'content'>> }) => {
      const updatesWithEdited: any = {
        ...updates,
        edited_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('comments')
        .update(updatesWithEdited)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Comment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.entity_type, data.entity_id] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('entity_type, entity_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)

      if (error) throw error
      return comment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.entity_type, data.entity_id] })
    },
  })
}