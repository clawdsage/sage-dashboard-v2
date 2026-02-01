'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  MissionControlAgent,
  MissionControlTask,
  MissionControlMessage,
  MissionControlActivity,
  CreateTaskForm,
  UpdateTaskForm,
  CreateCommentForm
} from '@/types'

export function useMissionControl() {
  const [agents, setAgents] = useState<MissionControlAgent[]>([])
  const [tasks, setTasks] = useState<MissionControlTask[]>([])
  const [activities, setActivities] = useState<MissionControlActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('mission_control_agents')
        .select('*')
        .order('name')

      if (agentsError) throw agentsError

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('mission_control_tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('mission_control_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (activitiesError) throw activitiesError

      setAgents(agentsData || [])
      setTasks(tasksData || [])
      setActivities(activitiesData || [])
    } catch (err) {
      console.error('Error fetching mission control data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load mission control data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set up real-time subscriptions
  useEffect(() => {
    fetchData()

    // Subscribe to agents changes
    const agentsSubscription = supabase
      .channel('mission-control-agents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_control_agents'
      }, () => {
        fetchData()
      })
      .subscribe()

    // Subscribe to tasks changes
    const tasksSubscription = supabase
      .channel('mission-control-tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_control_tasks'
      }, () => {
        fetchData()
      })
      .subscribe()

    // Subscribe to activities changes
    const activitiesSubscription = supabase
      .channel('mission-control-activities')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_control_activities'
      }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      agentsSubscription.unsubscribe()
      tasksSubscription.unsubscribe()
      activitiesSubscription.unsubscribe()
    }
  }, [fetchData])

  // Create a new task
  const createTask = useCallback(async (taskData: CreateTaskForm) => {
    try {
      const { data, error } = await supabase
        .from('mission_control_tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          assignee_ids: taskData.assignee_ids || [],
          priority: taskData.priority || 'medium',
          created_by: 'sage'
        }])
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase
        .from('mission_control_activities')
        .insert([{
          type: 'task_created',
          task_id: data.id,
          message: `Task "${data.title}" created`,
          metadata: { task_id: data.id }
        }])

      return data
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }, [])

  // Update a task
  const updateTask = useCallback(async (taskId: string, updates: UpdateTaskForm) => {
    try {
      const { data, error } = await supabase
        .from('mission_control_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      const activityType = updates.status === 'done' ? 'task_completed' : 'task_updated'
      await supabase
        .from('mission_control_activities')
        .insert([{
          type: activityType,
          task_id: taskId,
          message: `Task "${data.title}" ${updates.status === 'done' ? 'completed' : 'updated'}`,
          metadata: { task_id: taskId, updates }
        }])

      return data
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }, [])

  // Delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('mission_control_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      // Log activity
      await supabase
        .from('mission_control_activities')
        .insert([{
          type: 'task_deleted',
          message: `Task deleted`,
          metadata: { task_id: taskId }
        }])
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }, [])

  // Create a comment
  const createComment = useCallback(async (taskId: string, content: string, fromAgentId?: string) => {
    try {
      // Parse mentions from content
      const mentionRegex = /@(\w+)/g
      const mentions: string[] = []
      let match
      
      while ((match = mentionRegex.exec(content)) !== null) {
        const agentName = match[1]
        const agent = agents.find(a => a.name.toLowerCase() === agentName.toLowerCase())
        if (agent) {
          mentions.push(agent.id)
        }
      }

      const { data, error } = await supabase
        .from('mission_control_messages')
        .insert([{
          task_id: taskId,
          from_agent_id: fromAgentId,
          content,
          mentions
        }])
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase
        .from('mission_control_activities')
        .insert([{
          type: 'comment_posted',
          task_id: taskId,
          agent_id: fromAgentId,
          message: `Comment posted on task`,
          metadata: { task_id: taskId, comment_id: data.id }
        }])

      return data
    } catch (err) {
      console.error('Error creating comment:', err)
      throw err
    }
  }, [agents])

  // Update agent status
  const updateAgentStatus = useCallback(async (agentId: string, status: MissionControlAgent['status'], currentTaskId?: string) => {
    try {
      const { data, error } = await supabase
        .from('mission_control_agents')
        .update({
          status,
          current_task_id: currentTaskId
        })
        .eq('id', agentId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      const activityType = status === 'active' ? 'agent_activated' : 
                          status === 'idle' ? 'agent_idle' :
                          status === 'thinking' ? 'agent_thinking' : 'agent_blocked'
      
      await supabase
        .from('mission_control_activities')
        .insert([{
          type: activityType,
          agent_id: agentId,
          message: `${data.name} is now ${status}`,
          metadata: { agent_id: agentId, status, current_task_id: currentTaskId }
        }])

      return data
    } catch (err) {
      console.error('Error updating agent status:', err)
      throw err
    }
  }, [])

  return {
    agents,
    tasks,
    activities,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    createComment,
    updateAgentStatus,
    refetch: fetchData
  }
}