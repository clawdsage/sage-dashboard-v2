'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { AlertCard } from './AlertCard'
import { useAlerts, useAlertRules, useAlertPreferences, subscribeToAlerts } from '@/hooks/useAlerts'
import { AlertTriangle, Bell, Settings, Filter, CheckCircle, XCircle } from 'lucide-react'
import type { Database } from '@/lib/supabase'

type Alert = Database['public']['Tables']['alerts']['Row']

interface AlertManagerProps {
  initialView?: 'active' | 'all' | 'resolved'
  showHeader?: boolean
  maxAlerts?: number
}

export function AlertManager({ 
  initialView = 'active', 
  showHeader = true,
  maxAlerts = 20 
}: AlertManagerProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'resolved'>(initialView)
  const [severityFilter, setSeverityFilter] = useState<('info' | 'warning' | 'critical')[]>([])
  const [typeFilter, setTypeFilter] = useState<('cost' | 'performance' | 'anomaly' | 'usage')[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [newAlert, setNewAlert] = useState<Alert | null>(null)
  
  const { 
    alerts, 
    isLoading, 
    error, 
    stats, 
    resolveAlert, 
    dismissAlert,
    createAlert 
  } = useAlerts({
    status: activeTab === 'all' ? undefined : activeTab,
    severity: severityFilter.length > 0 ? severityFilter : undefined,
    type: typeFilter.length > 0 ? typeFilter : undefined,
    limit: maxAlerts
  })
  
  const { rules, isLoading: rulesLoading } = useAlertRules()
  const { preferences, updatePreference } = useAlertPreferences()
  
  // Subscribe to real-time alerts
  useEffect(() => {
    const subscription = subscribeToAlerts((alert) => {
      setNewAlert(alert)
      // Clear the new alert notification after 5 seconds
      setTimeout(() => setNewAlert(null), 5000)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const handleResolveAlert = async (id: string, resolutionNote?: string) => {
    try {
      await resolveAlert.mutateAsync({ id, resolutionNote })
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }
  
  const handleDismissAlert = async (id: string) => {
    try {
      await dismissAlert.mutateAsync(id)
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
  }
  
  const handleTestAlert = async () => {
    try {
      await createAlert.mutateAsync({
        type: 'cost',
        severity: 'warning',
        title: 'Test Alert',
        description: 'This is a test alert to verify the alert system is working.',
        metric: 'test_metric',
        threshold: 10,
        current_value: 15,
        source_type: 'test'
      })
    } catch (error) {
      console.error('Failed to create test alert:', error)
    }
  }
  
  const toggleSeverityFilter = (severity: 'info' | 'warning' | 'critical') => {
    setSeverityFilter(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    )
  }
  
  const toggleTypeFilter = (type: 'cost' | 'performance' | 'anomaly' | 'usage') => {
    setTypeFilter(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }
  
  const clearFilters = () => {
    setSeverityFilter([])
    setTypeFilter([])
  }
  
  const getSeverityCount = (severity: 'info' | 'warning' | 'critical') => {
    if (!stats) return 0
    switch (severity) {
      case 'critical': return stats.critical
      case 'warning': return stats.warning
      case 'info': return stats.info
      default: return 0
    }
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-accent-red">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Alerts</h3>
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Alerts</h2>
            <p className="text-text-muted">Monitor and manage system alerts</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestAlert}
              disabled={createAlert.isPending}
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Alert
            </Button>
          </div>
        </div>
      )}
      
      {newAlert && (
        <div className="p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-accent-blue" />
              <div>
                <div className="font-medium">New Alert: {newAlert.title}</div>
                <div className="text-sm text-text-muted">{newAlert.description}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewAlert(null)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Filter by Severity</h4>
                <div className="flex flex-wrap gap-2">
                  {(['critical', 'warning', 'info'] as const).map((severity) => (
                    <Button
                      key={severity}
                      variant={severityFilter.includes(severity) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSeverityFilter(severity)}
                      className="capitalize"
                    >
                      {severity} ({getSeverityCount(severity)})
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Filter by Type</h4>
                <div className="flex flex-wrap gap-2">
                  {(['cost', 'performance', 'anomaly', 'usage'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={typeFilter.includes(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTypeFilter(type)}
                      className="capitalize"
                    >
                      {type} ({stats?.byType[type] || 0})
                    </Button>
                  ))}
                </div>
              </div>
              
              {(severityFilter.length > 0 || typeFilter.length > 0) && (
                <div className="pt-2 border-t border-border-subtle">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="active">
            Active ({stats?.active || 0})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({alerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-bg-tertiary rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-bg-tertiary rounded mb-2"></div>
                    <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolveAlert}
                  onDismiss={handleDismissAlert}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-accent-green mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                <p className="text-text-muted">
                  All systems are operating normally.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-bg-tertiary rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-bg-tertiary rounded mb-2"></div>
                    <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolveAlert}
                  onDismiss={handleDismissAlert}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Alerts Found</h3>
                <p className="text-text-muted">
                  No alerts have been generated yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-bg-tertiary rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-bg-tertiary rounded mb-2"></div>
                    <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Resolved Alerts</h3>
                <p className="text-text-muted">
                  No alerts have been resolved yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {rules && rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Alert Rules ({rules.filter(r => r.is_active).length} active)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Metric</th>
                    <th className="text-left py-2">Threshold</th>
                    <th className="text-left py-2">Severity</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-border-subtle">
                      <td className="py-2">{rule.name}</td>
                      <td className="py-2 capitalize">{rule.type}</td>
                      <td className="py-2">{rule.metric}</td>
                      <td className="py-2">
                        {rule.operator} {rule.threshold !== null ? rule.threshold : 'N/A'}
                      </td>
                      <td className="py-2 capitalize">{rule.severity}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rule.is_active 
                            ? 'bg-accent-green/20 text-accent-green' 
                            : 'bg-bg-tertiary text-text-muted'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {preferences && preferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {preferences.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between p-3 border border-border-subtle rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{pref.alert_type}</div>
                    <div className="text-sm text-text-muted">Min: {pref.min_severity}</div>
                  </div>
                  <Button
                    variant={pref.enabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePreference.mutate({ id: pref.id, enabled: !pref.enabled })}
                    disabled={updatePreference.isPending}
                  >
                    {pref.enabled ? 'On' : 'Off'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}