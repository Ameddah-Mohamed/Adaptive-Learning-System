import React from 'react';
import { cn } from '../../lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, description, action, className }) => (
  <div className={cn('mb-4 flex flex-wrap items-end justify-between gap-3', className)}>
    <div>
      {eyebrow && <p className="label-caps mb-1.5">{eyebrow}</p>}
      <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      {description && <p className="mt-1 text-xs leading-relaxed text-subtle">{description}</p>}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);
