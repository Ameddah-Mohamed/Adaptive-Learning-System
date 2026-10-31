import React from 'react';
import { ChevronRight, Cpu, PanelLeft, Search } from 'lucide-react';
import type { Route } from '../../lib/types';
import { ROUTE_META } from '../../lib/router';
import { usePreferences } from '../../lib/preferences';
import { cn } from '../../lib/utils';
import { Tooltip } from '../ui/Tooltip';

interface TopbarProps {
  route: Route;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  onOpenCommand: () => void;
  backendStatus: 'checking' | 'online' | 'offline';
  totalChunks: number | null;
}

export const Topbar: React.FC<TopbarProps> = ({
  route,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobile,
  onOpenCommand,
}) => {
  const preferences = usePreferences();
  const meta = ROUTE_META[route];

  return (
    <header className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <Tooltip label={sidebarCollapsed ? 'Expand sidebar (⌘B / Ctrl+B)' : 'Collapse sidebar (⌘B / Ctrl+B)'} side="bottom">
          <button
            type="button"
            onClick={() => {
              if (window.matchMedia('(min-width: 1024px)').matches) {
                onToggleSidebar();
              } else {
                onOpenMobile();
              }
            }}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink"
            aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-keyshortcuts="Meta+B Control+B"
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        </Tooltip>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[12px]">
          <span className="hidden text-subtle sm:inline">{meta.group}</span>
          <ChevronRight className="hidden h-3 w-3 text-subtle/60 sm:block" aria-hidden />
          <span className="truncate font-medium text-ink">{meta.label}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCommand}
          className="focus-ring group flex h-8 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[11px] text-subtle transition-colors hover:border-line-strong hover:bg-surface2 hover:text-muted sm:w-[210px]"
          aria-label="Search or jump to"
          aria-keyshortcuts="Meta+K Control+K"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden flex-1 text-left sm:inline">Search or jump to…</span>
          <kbd className="hidden rounded border border-line bg-surface2 px-1 py-0.5 font-mono text-[9px] text-subtle sm:inline">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={() => (window.location.hash = '#/settings')}
          className="focus-ring flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          aria-label="Change model in settings"
        >
          <Cpu className="h-3.5 w-3.5 text-accent-soft" />
          <span className="hidden max-w-[130px] truncate font-mono sm:inline">{preferences.model}</span>
        </button>
      </div>
    </header>
  );
};
