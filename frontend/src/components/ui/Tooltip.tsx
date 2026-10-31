import React from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/** Lightweight CSS tooltip; uses aria-label semantics on the wrapper for keyboard users. */
export const Tooltip: React.FC<TooltipProps> = ({ label, children, side = 'bottom', className }) => (
  <span className={cn('group/tooltip relative inline-flex', className)}>
    {children}
    <span
      role="tooltip"
      className={cn(
        'pointer-events-none absolute z-[100] w-max max-w-[240px] rounded-md border border-line-strong bg-[#16161c] px-2.5 py-1 text-[10px] font-medium leading-snug text-ink opacity-0 shadow-pop transition-opacity delay-150 duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
        side === 'bottom' && 'left-1/2 top-[calc(100%+6px)] -translate-x-1/2',
        side === 'top' && 'bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2',
        side === 'right' && 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
        side === 'left' && 'right-[calc(100%+8px)] top-1/2 -translate-y-1/2',
      )}
    >
      {label}
    </span>
  </span>
);
