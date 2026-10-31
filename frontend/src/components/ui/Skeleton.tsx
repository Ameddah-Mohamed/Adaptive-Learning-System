import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <span className={cn('skeleton block', className)} style={style} aria-hidden />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)} aria-hidden>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('surface-card p-5', className)} aria-hidden>
    <Skeleton className="mb-4 h-3 w-24" />
    <Skeleton className="mb-2 h-5 w-2/3" />
    <SkeletonText lines={3} className="mt-4" />
  </div>
);
