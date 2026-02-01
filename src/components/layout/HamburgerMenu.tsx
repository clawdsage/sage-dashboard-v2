'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Home,
  Users,
  FolderOpen,
  BarChart3,
  CheckCircle,
  Activity,
  Satellite
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Mission Control', href: '/mission-control', icon: Satellite },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Review', href: '/review', icon: CheckCircle },
]

interface HamburgerMenuProps {
  pendingReviewCount?: number
  activeAgentCount?: number
  todayCost?: number
}

export default function HamburgerMenu({
  pendingReviewCount = 0,
  activeAgentCount = 0,
  todayCost = 0
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-bg-tertiary transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-bg-secondary border-r border-border-subtle z-50 transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-accent-blue">Wilson</h1>
            <p className="text-xs text-text-muted">Mission Control</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-bg-tertiary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const showBadge = item.name === 'Review' && pendingReviewCount > 0
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-accent-blue text-white'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
                {showBadge && (
                  <Badge
                    variant="danger"
                    className="ml-auto text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center"
                  >
                    {pendingReviewCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border-subtle space-y-2">
          <h3 className="text-xs font-medium text-text-secondary">Quick Stats</h3>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-text-secondary">
                <Activity className="mr-2 h-3 w-3 text-accent-green" />
                Active Agents
              </span>
              <span className="font-medium">{activeAgentCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-text-secondary">
                Today's Cost
              </span>
              <span className="font-medium">${todayCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
