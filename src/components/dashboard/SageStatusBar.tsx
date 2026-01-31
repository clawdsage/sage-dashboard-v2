'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Brain, Code, PenTool, Search, Clock, Moon, Rocket, Eye, Bot } from 'lucide-react'

interface SageStatus {
  status: string
  emoji: string
  description: string
  model: string
  project: string
  updated_at: string
}

const statusIcons: Record<string, React.ReactNode> = {
  thinking: <Brain className="w-5 h-5" />,
  coding: <Code className="w-5 h-5" />,
  writing: <PenTool className="w-5 h-5" />,
  researching: <Search className="w-5 h-5" />,
  waiting: <Clock className="w-5 h-5" />,
  idle: <Moon className="w-5 h-5" />,
  spawning: <Rocket className="w-5 h-5" />,
  reviewing: <Eye className="w-5 h-5" />,
}

const statusColors: Record<string, string> = {
  thinking: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  coding: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  writing: 'from-green-500/20 to-green-600/10 border-green-500/30',
  researching: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  waiting: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  idle: 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
  spawning: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  reviewing: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
}

function parseStatusMessage(message: string): SageStatus {
  // Parse: "💻 coding: Building component | Model: claude-opus-4-5 | Project: Dashboard V2"
  const emojiMatch = message.match(/^([\p{Emoji}])\s*/u)
  const emoji = emojiMatch ? emojiMatch[1] : '🤖'
  
  const statusMatch = message.match(/^[\p{Emoji}]?\s*(\w+):/u)
  const status = statusMatch ? statusMatch[1].toLowerCase() : 'idle'
  
  const descMatch = message.match(/:\s*([^|]+)/)
  const description = descMatch ? descMatch[1].trim() : ''
  
  const modelMatch = message.match(/Model:\s*([^|]+)/)
  const model = modelMatch ? modelMatch[1].trim() : ''
  
  const projectMatch = message.match(/Project:\s*(.+)$/)
  const project = projectMatch ? projectMatch[1].trim() : ''
  
  return { status, emoji, description, model, project, updated_at: '' }
}

export function SageStatusBar() {
  const [status, setStatus] = useState<SageStatus | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    // Fetch initial status
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('subagent_runs')
        .select('task_description, started_at')
        .eq('name', 'sage-main-status')
        .single()

      if (data && !error) {
        const parsed = parseStatusMessage(data.task_description || '')
        parsed.updated_at = data.started_at
        setStatus(parsed)
        setIsLive(true)
      }
    }

    fetchStatus()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sage-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'subagent_runs',
          filter: 'name=eq.sage-main-status'
        },
        (payload) => {
          if (payload.new) {
            const parsed = parseStatusMessage((payload.new as any).task_description || '')
            parsed.updated_at = (payload.new as any).started_at
            setStatus(parsed)
            setIsLive(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!status) {
    return (
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 mb-6 animate-pulse">
        <div className="h-6 bg-bg-tertiary rounded w-1/3"></div>
      </div>
    )
  }

  const colorClass = statusColors[status.status] || statusColors.idle
  const icon = statusIcons[status.status] || <Bot className="w-5 h-5" />

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${colorClass} border rounded-lg p-4 mb-6`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="relative">
            <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-accent-green rounded-full animate-ping opacity-50" />
          </div>
          
          {/* Status icon & text */}
          <div className="flex items-center gap-2 text-text-primary">
            {icon}
            <span className="font-semibold capitalize">{status.status}</span>
          </div>
          
          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.span
              key={status.description}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-text-secondary"
            >
              {status.description}
            </motion.span>
          </AnimatePresence>
        </div>
        
        {/* Right side: Model & Project */}
        <div className="flex items-center gap-4 text-sm text-text-muted">
          {status.model && (
            <span className="flex items-center gap-1">
              <Bot className="w-4 h-4" />
              {status.model.split('/').pop()}
            </span>
          )}
          {status.project && (
            <span className="px-2 py-1 bg-bg-tertiary rounded text-text-secondary">
              {status.project}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
