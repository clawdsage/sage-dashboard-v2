import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent-blue text-white hover:bg-accent-blue/80',
        secondary: 'border-transparent bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80',
        outline: 'text-text-primary',
        success: 'border-transparent bg-accent-green text-white hover:bg-accent-green/80',
        warning: 'border-transparent bg-accent-amber text-white hover:bg-accent-amber/80',
        danger: 'border-transparent bg-accent-red text-white hover:bg-accent-red/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }