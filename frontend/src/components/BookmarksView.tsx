import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookMarked,
  Bookmark,
  BookOpen,
  Clock3,
  Database,
  FileText,
  LibraryBig,
  MessageSquareText,
  Search,
  Trash2,
} from 'lucide-react';
import type { Route } from '../lib/types';
import { CHAPTERS, chapterLabel, getChapter } from '../lib/curriculum';
import { learningStore, useLearning } from '../lib/learningStore';
import { cn, formatRelativeTime } from '../lib/utils';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { useToast } from './ui/Toast';

interface BookmarksViewProps {
  onNavigate: (route: Route) => void;
  onStudyChapter: (chapter: number) => void;
  onInspectChapter: (chapter: number | null) => void;
}

type Filter = 'all' | 'chapter' | 'slide';

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All items' },
  { id: 'chapter', label: 'Modules' },
  { id: 'slide', label: 'Slides' },
];

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onNavigate, onStudyChapter, onInspectChapter }) => {
  const learning = useLearning();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const all = learning.bookmarks;
  const moduleCount = new Set(
    all.map((bookmark) => bookmark.chapter).filter((chapter): chapter is number => chapter != null),
  ).size;
  const chapterCount = all.filter((bookmark) => bookmark.type === 'chapter').length;
  const slideCount = all.filter((bookmark) => bookmark.type === 'slide').length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((bookmark) => (filter === 'all' ? true : bookmark.type === filter))
      .filter((bookmark) => {
        if (!q) return true;
        return `${bookmark.title} ${bookmark.subtitle ?? ''} ${bookmark.content ?? ''} ${bookmark.citation ?? ''}`
          .toLowerCase()
          .includes(q);
      })
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [all, filter, query]);

  const remove = (id: string, title: string) => {
    learningStore.removeBookmark(id);
    toast.info('Bookmark removed', title);
  };

  const openChapter = (chapter: number | null | undefined) => {
    if (chapter == null) {
      onNavigate('library');
      return;
    }
    onStudyChapter(chapter);
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-caps mb-2">Workspace</p>
          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-ink">Saved for later.</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Keep modules and slide excerpts within reach. Bookmarks are stored in this browser so they survive refreshes, but they are not synced to an account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('library')} leading={<LibraryBig className="h-3.5 w-3.5" />}>
            Browse library
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('knowledge')} leading={<Database className="h-3.5 w-3.5" />}>
            Search slides
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Saved modules', value: chapterCount },
          { label: 'Saved slides', value: slideCount },
          { label: 'Chapters covered', value: moduleCount },
        ].map((stat) => (
          <div key={stat.label} className="surface-card px-4 py-3">
            <p className="text-[10px] text-subtle">{stat.label}</p>
            <p className="mt-1 font-mono text-lg font-medium tracking-tight text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1" role="tablist" aria-label="Bookmark type">
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.id)}
                className={cn(
                  'focus-ring h-7 rounded-md px-2.5 text-[11px] font-medium transition-colors',
                  active ? 'bg-white/[0.07] text-ink' : 'text-subtle hover:text-muted',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-[260px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter saved items…"
            aria-label="Filter bookmarks"
            className="focus-ring h-8 w-full rounded-lg border border-line bg-surface pl-8 pr-2.5 text-[11.5px] text-ink outline-none placeholder:text-subtle focus:border-line-strong"
          />
        </div>
      </div>

      {all.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="h-5 w-5" />}
          title="Nothing saved yet"
          description="Bookmark a module from the course library, or save a slide excerpt while reading tutor citations or searching the knowledge base."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" variant="primary" onClick={() => onNavigate('library')} leading={<BookOpen className="h-3.5 w-3.5" />}>
                Open course library
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onNavigate('tutor')} leading={<MessageSquareText className="h-3.5 w-3.5" />}>
                Ask the tutor
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          compact
          icon={<Search className="h-4 w-4" />}
          title="No matching bookmarks"
          description="Try a different keyword or switch the item type."
          action={
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((bookmark) => {
            const chapter = getChapter(bookmark.chapter);
            return (
              <article key={bookmark.id} className="surface-card surface-card-hover flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                      bookmark.type === 'chapter'
                        ? 'border-accent/25 bg-accent/10 text-accent-soft'
                        : 'border-cyan/20 bg-cyan/[0.07] text-cyan',
                    )}
                    aria-hidden
                  >
                    {bookmark.type === 'chapter' ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={bookmark.type === 'chapter' ? 'accent' : 'cyan'}>
                        {bookmark.type === 'chapter' ? 'Module' : 'Slide'}
                      </Badge>
                      {chapter && (
                        <span className="font-mono text-[9.5px] uppercase tracking-wide text-subtle">
                          {chapterLabel(chapter)}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-ink">{bookmark.title}</h2>
                    {bookmark.subtitle && <p className="mt-1 line-clamp-1 text-[11px] text-subtle">{bookmark.subtitle}</p>}
                  </div>
                </div>

                {bookmark.content && (
                  <p className="mt-3 line-clamp-3 rounded-lg border border-line bg-surface2/40 px-3 py-2.5 text-[11px] leading-relaxed text-subtle">
                    {bookmark.content}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="flex items-center gap-1.5 font-mono text-[9.5px] text-subtle">
                    <Clock3 className="h-3 w-3" />
                    {formatRelativeTime(bookmark.timestamp)}
                  </span>
                  <div className="flex items-center gap-1">
                    {bookmark.chapter != null ? (
                      <>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => openChapter(bookmark.chapter)}
                          leading={<MessageSquareText className="h-3 w-3" />}
                        >
                          Study
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onInspectChapter(bookmark.chapter ?? null)}
                          leading={<Search className="h-3 w-3" />}
                        >
                          Sources
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onNavigate('knowledge')}
                        leading={<Database className="h-3 w-3" />}
                      >
                        Search
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => remove(bookmark.id, bookmark.title)}
                      aria-label={`Remove bookmark: ${bookmark.title}`}
                      className="text-subtle hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {all.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10.5px] text-subtle">
          <span>
            {all.length} {all.length === 1 ? 'item' : 'items'} stored locally · {CHAPTERS.filter((chapter) => chapter.number != null).length} modules available
          </span>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="focus-ring inline-flex items-center gap-1 text-subtle transition-colors hover:text-muted"
          >
            Manage learning data
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
