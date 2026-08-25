import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        success: 'bg-accent/10 text-accent-dark',
        warning: 'bg-gold/15 text-amber-700',
        danger: 'bg-danger/10 text-danger',
        info: 'bg-blue-100 text-blue-700',
        outline: 'border border-border text-text-muted bg-transparent',
        gold: 'bg-gold text-white',
        primary: 'bg-primary text-white',
        muted: 'bg-surface-alt text-text-muted',
        dark: 'bg-text text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { badgeVariants };
