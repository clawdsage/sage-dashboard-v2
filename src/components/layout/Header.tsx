import { Bell, Search, User } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-bg-secondary border-b border-border-subtle px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Page title will be handled by individual pages */}
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