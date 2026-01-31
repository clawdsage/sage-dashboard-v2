import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-bg-primary',
  {
    variants: {
      variant: {
        default: 'bg-accent-blue text-white hover:bg-accent-blue/80',
        secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80',
        outline: 'border border-border-default bg-transparent text-text-primary hover:bg-bg-tertiary',
        ghost: 'bg-transparent text-text-primary hover:bg-bg-tertiary',
        success: 'bg-accent-green text-white hover:bg-accent-green/80',
        danger: 'bg-accent-red text-white hover:bg-accent-red/80',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }