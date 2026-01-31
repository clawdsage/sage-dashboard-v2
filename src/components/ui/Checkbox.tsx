import React from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  className,
  disabled = false,
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      className={cn(
        'h-4 w-4 rounded border border-border-default bg-bg-primary text-accent-blue focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
        className
      )}
    />
  )
}