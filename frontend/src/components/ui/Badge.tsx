import React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'cyan' | 'outline';

const VARIANTS: Record<Variant, string> = {
  neutral: 'bg-white/[0.04] text-muted border-line',
  accent: 'bg-accent/10 text-accent-soft border-accent/25',
  success: 'bg-success/[0.08] text-success border-success/20',
  warning: 'bg-warning/[0.08] text-warning border-warning/20',
  danger: 'bg-danger/[0.08] text-danger border-danger/20',
  cyan: 'bg-cyan/[0.07] text-cyan border-cyan/20',
  outline: 'bg-transparent text-subtle border-line',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', dot, size = 'sm', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 border font-medium',
      size === 'sm' ? 'rounded-md px-1.5 py-0.5 text-[10px]' : 'rounded-lg px-2 py-1 text-[11px]',
      VARIANTS[variant],
      className,
    )}
    {...props}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
    {children}
  </span>
);
