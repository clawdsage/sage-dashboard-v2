'use client'

import Link from 'next/link'
import { Bell, Search, User, Brain, Code, PenTool, Moon, Rocket, Eye, Bot, BarChart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TicketBadge } from '@/components/tickets/TicketBadge'
import HamburgerMenu from './HamburgerMenu'

const statusIcons: Record<string, React.ReactNode> = {
  thinking: <Brain className="w-4 h-4" />,
  coding: <Code className="w-4 h-4" />,
  writing: <PenTool className="w-4 h-4" />,
  idle: <Moon className="w-4 h-4" />,
  spawning: <Rocket className="w-4 h-4" />,
  reviewing: <Eye className="w-4 h-4" />,
}

const statusColors: Record<string, string> = {
  thinking: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  coding: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  writing: 'bg-green-500/20 text-green-400 border-green-500/30',
  idle: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  spawning: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  reviewing: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

function parseStatusMessage(message: string) {
  const statusMatch = message.match(/^\S+\s*(\w+):/)
  const status = statusMatch ? statusMatch[1].toLowerCase() : 'idle'
  const descMatch = message.match(/:\s*([^|]+)/)
  const description = descMatch ? descMatch[1].trim() : 'Standing by'
  return { status, description }
}

interface HeaderProps {
  showHamburger?: boolean
  pendingReviewCount?: number
  activeAgentCount?: number
  todayCost?: number
}

export default function Header({
  showHamburger = false,
  pendingReviewCount = 0,
  activeAgentCount = 0,
  todayCost = 0
}: HeaderProps) {
  const [sageStatus, setSageStatus] = useState<{ status: string; description: string } | null>(null)
  const [pendingTickets] = useState(3) // Mock pending count - replace with actual hook

  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('subagent_runs')
        .select('task_description')
        .eq('name', 'sage-main-status')
        .single()
      
      if (data?.task_description) {
        setSageStatus(parseStatusMessage(data.task_description))
      }
    }
    fetchStatus()

    const channel = supabase
      .channel('sage-header-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'subagent_runs',
        filter: 'name=eq.sage-main-status'
      }, (payload) => {
        if ((payload.new as any)?.task_description) {
          setSageStatus(parseStatusMessage((payload.new as any).task_description))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <header className="bg-bg-secondary border-b border-border-subtle px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu (Mission Control only) */}
          {showHamburger && (
            <HamburgerMenu
              pendingReviewCount={pendingReviewCount}
              activeAgentCount={activeAgentCount}
              todayCost={todayCost}
            />
          )}
          {/* Main Agent Status - Always visible */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${sageStatus ? statusColors[sageStatus.status] || statusColors.idle : 'bg-bg-tertiary border-border-subtle'}`}>
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-50" />
            </div>
            <Bot className="w-4 h-4" />
            <span className="font-medium text-sm">Sage</span>
            {sageStatus && (
              <>
                <span className="text-text-muted">•</span>
                {statusIcons[sageStatus.status] || <Moon className="w-4 h-4" />}
                <span className="text-sm capitalize">{sageStatus.status}</span>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm rounded-md hover:bg-bg-tertiary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/agents"
              className="px-3 py-1.5 text-sm rounded-md hover:bg-bg-tertiary transition-colors"
            >
              Agents
            </Link>
            <Link
              href="/projects"
              className="px-3 py-1.5 text-sm rounded-md hover:bg-bg-tertiary transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/analytics"
              className="px-3 py-1.5 text-sm rounded-md hover:bg-bg-tertiary transition-colors flex items-center gap-1"
            >
              <BarChart className="h-3.5 w-3.5" />
              Analytics
            </Link>
            <Link
              href="/review"
              className="px-3 py-1.5 text-sm rounded-md hover:bg-bg-tertiary transition-colors"
            >
              Review
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-bg-tertiary border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          {/* Tickets */}
          <Link href="/review">
            <TicketBadge count={pendingTickets} />
          </Link>

          {/* Notifications */}
          <button className="p-2 rounded-md hover:bg-bg-tertiary transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent-red rounded-full text-xs flex items-center justify-center">
              2
            </span>
          </button>

          {/* User menu */}
          <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-bg-tertiary transition-colors">
            <div className="h-8 w-8 bg-accent-blue rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">Tim</span>
          </button>
        </div>
      </div>
    </header>
  )
}