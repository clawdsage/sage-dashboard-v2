import { Search } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface DebouncedSearchProps {
  placeholder?: string
  delay?: number
  onSearch: (query: string) => void
  className?: string
  defaultValue?: string
}

export function DebouncedSearch({
  placeholder = 'Search...',
  delay = 300,
  onSearch,
  className,
  defaultValue = ''
}: DebouncedSearchProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isTyping, setIsTyping] = useState(false)

  // Debounce the search callback
  useEffect(() => {
    if (query === defaultValue) return

    setIsTyping(true)
    const timer = setTimeout(() => {
      onSearch(query)
      setIsTyping(false)
    }, delay)

    return () => {
      clearTimeout(timer)
      setIsTyping(false)
    }
  }, [query, delay, onSearch, defaultValue])

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('')
    onSearch('')
  }, [onSearch])

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 w-full bg-bg-tertiary border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
      />
      {isTyping && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="h-2 w-2 bg-accent-blue rounded-full animate-pulse" />
        </div>
      )}
      {query && !isTyping && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted hover:text-text-primary"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}