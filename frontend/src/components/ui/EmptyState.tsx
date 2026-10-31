import React from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
  bare?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className, compact, bare }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center',
      compact ? 'px-4 py-7' : 'px-6 py-12',
      !bare && 'rounded-xl border border-line bg-surface/40',
      className,
    )}
  >
    {icon && (
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface2 text-subtle" aria-hidden>
        {icon}
      </div>
    )}
    <p className={cn('font-medium text-ink', compact ? 'text-xs' : 'text-sm')}>{title}</p>
    {description && <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-subtle">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
