import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: 'xs' | 'sm' | 'md';
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, className, barClassName, size = 'sm', label }) => {
  const safe = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-white/[0.055]', size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : 'h-2', className)}
      role="progressbar"
      aria-valuenow={Math.round(safe)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
    >
      <div
        className={cn('h-full rounded-full bg-accent transition-[width] duration-500 ease-out', barClassName)}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
};

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<RingProps> = ({ value, size = 56, stroke = 4, className, children }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-ink">{children}</span>
    </div>
  );
};
