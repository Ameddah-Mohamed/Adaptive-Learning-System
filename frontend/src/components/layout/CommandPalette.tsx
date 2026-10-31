import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChartNoAxesCombined,
  ClipboardCheck,
  Code2,
  CornerDownLeft,
  Database,
  LayoutDashboard,
  LibraryBig,
  MessageSquareText,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import type { Route } from '../../lib/types';
import { CHAPTERS, chapterLabel } from '../../lib/curriculum';
import { ROUTE_META } from '../../lib/router';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: Route) => void;
  onStudyChapter: (chapter: number) => void;
}

const ROUTE_ICONS: Record<Route, React.ReactNode> = {
  tutor: <MessageSquareText className="h-3.5 w-3.5" />,
  library: <LibraryBig className="h-3.5 w-3.5" />,
  quiz: <Sparkles className="h-3.5 w-3.5" />,
  sandbox: <Code2 className="h-3.5 w-3.5" />,
  grader: <ClipboardCheck className="h-3.5 w-3.5" />,
  analytics: <ChartNoAxesCombined className="h-3.5 w-3.5" />,
  knowledge: <Database className="h-3.5 w-3.5" />,
  bookmarks: <Bookmark className="h-3.5 w-3.5" />,
  settings: <Settings className="h-3.5 w-3.5" />,
};

const ROUTE_HINTS: Partial<Record<Route, string>> = {
  tutor: 'Ask grounded questions with slide citations',
  library: 'Browse all 14 course modules',
  quiz: 'Generate a calibrated exercise',
  sandbox: 'Write and test PyTorch implementations',
  grader: 'Evaluate an answer against a rubric',
  analytics: 'Review local learning history',
  knowledge: 'Search 913 indexed slide chunks',
  bookmarks: 'Saved modules and slides',
  settings: 'Model, retrieval, appearance and data',
};

type Item =
  | { id: string; kind: 'route'; label: string; hint: string; route: Route }
  | { id: string; kind: 'chapter'; label: string; hint: string; chapter: number };

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, onNavigate, onStudyChapter }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<Item[]>(() => {
    const routes: Item[] = (Object.keys(ROUTE_META) as Route[]).map((route) => ({
      id: `route-${route}`,
      kind: 'route',
      label: ROUTE_META[route].label,
      hint: ROUTE_HINTS[route] || '',
      route,
    }));
    const chapters: Item[] = CHAPTERS.filter((chapter) => chapter.number != null).map((chapter) => ({
      id: `chapter-${chapter.number}`,
      kind: 'chapter',
      label: `${chapterLabel(chapter)} · ${chapter.shortTitle}`,
      hint: chapter.summary,
      chapter: chapter.number as number,
    }));
    return [...routes, ...chapters];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.filter((item) => item.kind === 'route');
    return items
      .filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(q))
      .slice(0, 14);
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => (filtered.length ? (index + 1) % filtered.length : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => (filtered.length ? (index - 1 + filtered.length) % filtered.length : 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const item = filtered[activeIndex];
        if (!item) return;
        onClose();
        if (item.kind === 'route') onNavigate(item.route);
        else onStudyChapter(item.chapter);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, activeIndex, onClose, onNavigate, onStudyChapter]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const choose = (item: Item) => {
    onClose();
    if (item.kind === 'route') onNavigate(item.route);
    else onStudyChapter(item.chapter);
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" className="max-w-xl border-line-strong">
      <div className="flex items-center gap-2.5 border-b border-line px-4">
        <Search className="h-4 w-4 shrink-0 text-subtle" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search views, chapters, or concepts…"
          className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
          aria-label="Command search"
          autoComplete="off"
        />
        <kbd className="shrink-0 rounded border border-line bg-surface2 px-1.5 py-0.5 font-mono text-[9px] text-subtle">ESC</kbd>
      </div>

      <div ref={listRef} className="max-h-[360px] overflow-y-auto p-1.5" role="listbox" aria-label="Command results">
        {!query && <p className="label-caps px-2.5 pb-1 pt-2">Jump to</p>}
        {query && filtered.length > 0 && <p className="label-caps px-2.5 pb-1 pt-2">Results</p>}
        {filtered.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            data-index={index}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => choose(item)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
              index === activeIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.035]',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                index === activeIndex ? 'border-accent/30 bg-accent/10 text-accent-soft' : 'border-line bg-surface2 text-subtle',
              )}
            >
              {item.kind === 'route' ? ROUTE_ICONS[item.route] : <BookOpen className="h-3.5 w-3.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-ink">{item.label}</span>
              <span className="mt-0.5 block truncate text-[10px] text-subtle">{item.hint}</span>
            </span>
            {index === activeIndex && <CornerDownLeft className="h-3 w-3 shrink-0 text-subtle" />}
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="px-3 py-10 text-center">
            <p className="text-xs font-medium text-muted">No matches</p>
            <p className="mt-1 text-[11px] text-subtle">Try a chapter number, concept, or view name.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line px-3.5 py-2 text-[10px] text-subtle">
        <span className="flex items-center gap-1.5">
          <ArrowRight className="h-3 w-3" /> Open module in tutor
        </span>
        <span className="flex items-center gap-3 font-mono">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
        </span>
      </div>
    </Modal>
  );
};
