import { supabase } from './supabase'

export interface ActivityEvent {
  event_type: string
  entity_type?: string
  entity_id?: string
  title: string
  description?: string
  metadata?: Record<string, any>
}

export async function logActivity(event: ActivityEvent) {
  const { error } = await supabase
    .from('activity_log')
    .insert({
      event_type: event.event_type,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      title: event.title,
      description: event.description,
      metadata: event.metadata,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to log activity:', error)
    throw error
  }
}