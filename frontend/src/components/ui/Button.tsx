import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-white border border-transparent hover:bg-accent-deep shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-12px_rgba(95,91,255,0.8)] disabled:bg-accent/40',
  secondary:
    'bg-surface3 text-ink border border-line-strong hover:bg-[#202028] hover:border-[#3a3a46]',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-white/[0.045] hover:text-ink',
  outline: 'bg-transparent text-muted border border-line hover:bg-white/[0.03] hover:text-ink hover:border-line-strong',
  danger: 'bg-danger/10 text-danger border border-danger/25 hover:bg-danger/15',
  success: 'bg-success/10 text-success border border-success/25 hover:bg-success/15',
};

const SIZES: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-[13px] gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, leading, trailing, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-ring',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : leading}
      {children}
      {trailing}
    </button>
  ),
);
Button.displayName = 'Button';
