import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Alert = Database['public']['Tables']['alerts']['Row']
type AlertRule = Database['public']['Tables']['alert_rules']['Row']
type AlertPreference = Database['public']['Tables']['user_alert_preferences']['Row']

interface AlertStats {
  active: number
  critical: number
  warning: number
  info: number
  byType: Record<string, number>
}

export function useAlerts(options?: {
  status?: 'active' | 'resolved' | 'dismissed' | 'all'
  severity?: ('info' | 'warning' | 'critical')[]
  type?: ('cost' | 'performance' | 'anomaly' | 'usage')[]
  limit?: number
}) {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ['alerts', options],
    queryFn: async () => {
      let query = supabase
        .from('alerts')
        .select('*')
        .order('triggered_at', { ascending: false })

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status)
      }

      if (options?.severity && options.severity.length > 0) {
        query = query.in('severity', options.severity)
      }

      if (options?.type && options.type.length > 0) {
        query = query.in('type', options.type)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Alert[]
    },
  })

  const statsQuery = useQuery({
    queryKey: ['alert-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('status, severity, type')

      if (error) throw error

      const stats: AlertStats = {
        active: 0,
        critical: 0,
        warning: 0,
        info: 0,
        byType: {}
      }

      data.forEach(alert => {
        if (alert.status === 'active') {
          stats.active++
        }
        
        if (alert.severity === 'critical') stats.critical++
        if (alert.severity === 'warning') stats.warning++
        if (alert.severity === 'info') stats.info++
        
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1
      })

      return stats
    },
  })

  const resolveAlert = useMutation({
    mutationFn: async ({ id, resolutionNote }: { id: string; resolutionNote?: string }) => {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: 'sage',
          resolution_note: resolutionNote
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] })
    }
  })

  const dismissAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'dismissed',
          resolved_at: new Date().toISOString(),
          resolved_by: 'sage'
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] })
    }
  })

  const createAlert = useMutation({
    mutationFn: async (alert: Omit<Database['public']['Tables']['alerts']['Insert'], 'id'>) => {
      const { data, error } = await supabase
        .from('alerts')
        .insert(alert)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] })
    }
  })

  return {
    alerts: query.data,
    isLoading: query.isLoading,
    error: query.error,
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,
    resolveAlert,
    dismissAlert,
    createAlert
  }
}

export function useAlertRules() {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as AlertRule[]
    },
  })

  const updateRule = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AlertRule> }) => {
      const { error } = await supabase
        .from('alert_rules')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
    }
  })

  const createRule = useMutation({
    mutationFn: async (rule: Omit<Database['public']['Tables']['alert_rules']['Insert'], 'id'>) => {
      const { data, error } = await supabase
        .from('alert_rules')
        .insert(rule)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
    }
  })

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
    }
  })

  return {
    rules: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateRule,
    createRule,
    deleteRule
  }
}

export function useAlertPreferences() {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ['alert-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_alert_preferences')
        .select('*')
        .eq('user_id', 'sage')

      if (error) throw error
      return data as AlertPreference[]
    },
  })

  const updatePreference = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('user_alert_preferences')
        .update({ enabled })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-preferences'] })
    }
  })

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreference
  }
}

// Real-time subscription for alerts
export function subscribeToAlerts(callback: (alert: Alert) => void) {
  return supabase
    .channel('alerts-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: 'status=eq.active'
      },
      (payload) => {
        callback(payload.new as Alert)
      }
    )
    .subscribe()
}