import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  BookMarked,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Database,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import type { ActivityKind, Route } from '../../lib/types';
import { ROUTE_META } from '../../lib/router';
import { useLearning } from '../../lib/learningStore';
import { usePreferences } from '../../lib/preferences';
import { cn, formatRelativeTime } from '../../lib/utils';
import { Tooltip } from '../ui/Tooltip';

interface SidebarProps {
  route: Route;
  onNavigate: (route: Route) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  backendStatus: 'checking' | 'online' | 'offline';
  totalChunks: number | null;
}

const NAV_GROUPS: Array<{ label: string; items: Array<{ route: Route; icon: React.ReactNode }> }> = [
  {
    label: 'Learning',
    items: [
      { route: 'tutor', icon: <MessageSquareText className="h-[17px] w-[17px]" /> },
      { route: 'library', icon: <LibraryBig className="h-[17px] w-[17px]" /> },
      { route: 'quiz', icon: <Sparkles className="h-[17px] w-[17px]" /> },
      { route: 'sandbox', icon: <Code2 className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    label: 'Evaluation',
    items: [
      { route: 'grader', icon: <ClipboardCheck className="h-[17px] w-[17px]" /> },
      { route: 'analytics', icon: <ChartNoAxesCombined className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    label: 'Reference',
    items: [{ route: 'knowledge', icon: <Database className="h-[17px] w-[17px]" /> }],
  },
];

const ACTIVITY_ICON: Record<ActivityKind, React.ReactNode> = {
  tutor: <MessageSquareText className="h-3 w-3" />,
  quiz: <Sparkles className="h-3 w-3" />,
  code: <Code2 className="h-3 w-3" />,
  grade: <ClipboardCheck className="h-3 w-3" />,
  search: <Database className="h-3 w-3" />,
  library: <BookMarked className="h-3 w-3" />,
  bookmark: <Bookmark className="h-3 w-3" />,
};

const ACTIVITY_ROUTE: Record<ActivityKind, Route> = {
  tutor: 'tutor',
  quiz: 'quiz',
  code: 'sandbox',
  grade: 'grader',
  search: 'knowledge',
  library: 'library',
  bookmark: 'bookmarks',
};

export const Sidebar: React.FC<SidebarProps> = ({
  route,
  onNavigate,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  backendStatus,
  totalChunks,
}) => {
  const learning = useLearning();
  const preferences = usePreferences();
  const recent = useMemo(() => learning.events.slice(0, 3), [learning.events]);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, onCloseMobile]);

  const desktopCollapsed = collapsed && isDesktop;
  const brand = (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-accent/30 bg-accent/10">
        <span className="font-mono text-[13px] font-semibold tracking-tight text-accent-soft">N</span>
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full border border-surface bg-success" />
      </div>
      {!desktopCollapsed && (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold tracking-tight text-ink">NLP Learning Studio</p>
          <p className="truncate text-[10px] text-subtle">ENSIA · 4th Year AI</p>
        </div>
      )}
    </div>
  );

  const NavButton: React.FC<{ item: { route: Route; icon: React.ReactNode }; small?: boolean }> = ({ item, small }) => {
    const active = route === item.route;
    const content = (
      <button
        type="button"
        onClick={() => {
          onNavigate(item.route);
          onCloseMobile();
        }}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'focus-ring group relative flex w-full items-center rounded-lg text-left transition-colors duration-150',
          desktopCollapsed ? 'h-9 justify-center px-0' : 'h-9 gap-2.5 px-2.5',
          small ? 'text-[12px]' : 'text-[12.5px]',
          active ? 'bg-white/[0.055] font-medium text-ink' : 'text-muted hover:bg-white/[0.035] hover:text-ink',
        )}
      >
        {active && (
          <span
            className={cn(
              'absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent',
              desktopCollapsed && 'left-[-1px]',
            )}
            aria-hidden
          />
        )}
        <span className={cn('shrink-0 transition-colors', active ? 'text-accent-soft' : 'text-subtle group-hover:text-muted')}>{item.icon}</span>
        {!desktopCollapsed && <span className="truncate">{ROUTE_META[item.route].label}</span>}
        {!desktopCollapsed && item.route === 'bookmarks' && learning.bookmarks.length > 0 && (
          <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-subtle">{learning.bookmarks.length}</span>
        )}
      </button>
    );

    if (desktopCollapsed) {
      return (
        <Tooltip label={ROUTE_META[item.route].label} side="right" className="w-full">
          {content}
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] animate-fade-in lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          tabIndex={-1}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-[#0c0c10] transition-[width,transform] duration-200 ease-out',
          desktopCollapsed ? 'lg:w-[68px]' : 'lg:w-[248px]',
          'w-[272px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Primary navigation"
      >
        <div className={cn('flex h-[52px] shrink-0 items-center border-b border-line', desktopCollapsed ? 'justify-center px-2' : 'justify-between px-3.5')}>
          {brand}
          {!desktopCollapsed && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onCloseMobile}
                className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink lg:hidden"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="focus-ring hidden h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink lg:flex"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto px-2.5 py-3">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className={cn(groupIndex > 0 && 'mt-5')}>
              {!desktopCollapsed && <p className="label-caps mb-1.5 px-2">{group.label}</p>}
              {desktopCollapsed && groupIndex > 0 && <div className="mx-auto mb-4 h-px w-5 bg-line" />}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavButton key={item.route} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={cn('shrink-0 border-t border-line p-2.5', desktopCollapsed && 'flex flex-col items-center gap-1')}>
          <div className="space-y-0.5">
            <NavButton item={{ route: 'bookmarks', icon: <Bookmark className="h-[17px] w-[17px]" /> }} small />
            <NavButton item={{ route: 'settings', icon: <Settings className="h-[17px] w-[17px]" /> }} small />
          </div>
          {desktopCollapsed && (
            <Tooltip label="Expand sidebar" side="right" className="w-full">
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="focus-ring mt-1 flex h-8 w-full items-center justify-center rounded-lg text-subtle transition-colors hover:bg-white/5 hover:text-ink"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
};
