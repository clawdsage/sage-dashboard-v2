import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  FolderOpen,
  BarChart3,
  CheckCircle,
  Activity,
  DollarSign,
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

interface SidebarProps {
  pendingReviewCount?: number
  activeAgentCount?: number
  todayCost?: number
}

export default function Sidebar({
  pendingReviewCount = 0,
  activeAgentCount = 0,
  todayCost = 0
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-60 bg-bg-secondary border-r border-border-subtle flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border-subtle">
        <h1 className="text-xl font-bold text-accent-blue">Sage</h1>
        <p className="text-sm text-text-muted">Dashboard V2</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const showBadge = item.name === 'Review' && pendingReviewCount > 0
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
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
      <div className="p-4 border-t border-border-subtle space-y-3">
        <h3 className="text-sm font-medium text-text-secondary">Quick Stats</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <Activity className="mr-2 h-4 w-4 text-accent-green" />
              Active
            </span>
            <span className="font-medium">{activeAgentCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-accent-amber" />
              Today
            </span>
            <span className="font-medium">${todayCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}