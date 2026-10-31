import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Database,
  FileText,
  Filter,
  Layers,
  Loader2,
  MessageSquareText,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type { KnowledgeChunk, KnowledgeStats, Route } from '../lib/types';
import { searchKnowledge } from '../lib/api';
import { CHAPTERS, getChapter } from '../lib/curriculum';
import { learningStore, useLearning } from '../lib/learningStore';
import { cn, copyText } from '../lib/utils';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { Skeleton, SkeletonText } from './ui/Skeleton';
import { useToast } from './ui/Toast';

interface KnowledgeViewProps {
  knowledgeStats: KnowledgeStats | null;
  backendStatus: 'checking' | 'online' | 'offline';
  initialChapter: number | null;
  onStudyChapter: (chapter: number) => void;
  onNavigate: (route: Route) => void;
}

const EXAMPLES = [
  'scaled dot product attention',
  'Laplace smoothing zero frequency',
  'CKY parse table',
  'BPE merge operations',
];

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  knowledgeStats,
  backendStatus,
  initialChapter,
  onStudyChapter,
  onNavigate,
}) => {
  const learning = useLearning();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState<number | null>(initialChapter);
  const [topK, setTopK] = useState(6);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KnowledgeChunk[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasRunInitial, setHasRunInitial] = useState(false);
  const autoRunRef = useRef(false);

  const selected = results.find((result, index) => (result.id || String(index)) === selectedId) ?? results[0] ?? null;
  const selectedChapter = getChapter(selected?.chapter ?? chapterFilter);
  const selectedSaved = selected
    ? learning.bookmarks.some((bookmark) => bookmark.id === `slide:${selected.document}:${selected.slide_num}:${selected.citation}`)
    : false;

  const runSearch = async (searchQuery?: string, searchChapter?: number | null) => {
    const text = (searchQuery ?? query).trim();
    const chapter = searchChapter === undefined ? chapterFilter : searchChapter;
    if (!text) {
      setError('Enter a concept, formula, or question to search the course index.');
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchKnowledge(text, topK, chapter);
      const nextResults = data.results || [];
      setResults(nextResults);
      setSelectedId(nextResults[0]?.id || '0');
      learningStore.recordEvent({
        kind: 'search',
        title: text.length > 70 ? `${text.slice(0, 70)}…` : text,
        detail: `${nextResults.length} chunks · ${chapter ? `Chapter ${chapter}` : 'all chapters'}`,
        chapter,
      });
    } catch (err: any) {
      setError(err?.message || 'The knowledge search failed.');
      setResults([]);
      toast.error('Search failed', err?.message || 'Check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialChapter == null || autoRunRef.current) return;
    autoRunRef.current = true;
    const chapter = getChapter(initialChapter);
    const text = chapter?.shortTitle || `Chapter ${String(initialChapter).padStart(2, '0')}`;
    setChapterFilter(initialChapter);
    setQuery(text);
    setHasRunInitial(true);
    runSearch(text, initialChapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChapter]);

  useEffect(() => {
    if (!hasRunInitial) return;
    setHasRunInitial(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRunInitial]);

  const toggleBookmark = (result: KnowledgeChunk) => {
    const added = learningStore.toggleBookmark({
      id: `slide:${result.document}:${result.slide_num}:${result.citation}`,
      type: 'slide',
      title: result.citation,
      subtitle: result.document,
      chapter: result.chapter,
      content: result.text,
      citation: result.citation,
    });
    toast.push(added ? 'success' : 'info', added ? 'Slide bookmarked' : 'Bookmark removed', result.citation);
  };

  const totalChunks = knowledgeStats?.total_chunks ?? null;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-caps mb-2">Reference · knowledge base</p>
          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-ink">Search the course itself.</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Inspect the exact lecture chunks retrieved by semantic search. Every chunk carries its module, slide number, and cosine relevance score.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          <div>
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Indexed chunks</p>
            <p className="mt-0.5 font-mono text-sm text-ink">{totalChunks ?? '—'}</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Embedding</p>
            <p className="mt-0.5 max-w-[130px] truncate font-mono text-[10px] text-muted">{knowledgeStats?.embed_model ?? 'qwen3-embedding:4b'}</p>
          </div>
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              backendStatus === 'online' ? 'bg-success' : backendStatus === 'checking' ? 'bg-warning animate-pulse-soft' : 'bg-subtle',
            )}
          />
        </div>
      </div>

      {/* Search */}
      <div className="surface-card p-3 sm:p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            runSearch();
          }}
          className="flex flex-col gap-2 lg:flex-row lg:items-center"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search concepts, formulas, algorithms, or exam topics…"
              className="focus-ring h-10 w-full rounded-lg border border-line bg-bg pl-9 pr-3 text-[12px] text-ink placeholder:text-subtle"
              aria-label="Search the knowledge base"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={chapterFilter ?? ''}
                onChange={(event) => setChapterFilter(event.target.value ? Number(event.target.value) : null)}
                className="focus-ring h-10 appearance-none rounded-lg border border-line bg-surface px-2.5 pr-8 text-[10.5px] text-muted"
                aria-label="Filter by chapter"
              >
                <option value="">All chapters</option>
                {CHAPTERS.filter((chapter) => chapter.number != null).map((chapter) => (
                  <option key={chapter.slug} value={chapter.number ?? ''}>
                    Chapter {String(chapter.number).padStart(2, '0')} · {chapter.shortTitle}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-subtle" />
            </div>

            <div className="flex h-10 items-center gap-1 rounded-lg border border-line bg-surface px-1">
              <SlidersHorizontal className="ml-1 h-3 w-3 text-subtle" />
              {[3, 6, 10].map((depth) => (
                <button
                  key={depth}
                  type="button"
                  onClick={() => setTopK(depth)}
                  className={cn(
                    'focus-ring h-6 rounded px-1.5 font-mono text-[9.5px] transition-colors',
                    topK === depth ? 'bg-white/[0.07] text-ink' : 'text-subtle hover:text-muted',
                  )}
                  aria-pressed={topK === depth}
                >
                  {depth}
                </button>
              ))}
            </div>

            <Button type="submit" variant="primary" size="md" loading={loading} leading={!loading ? <Sparkles className="h-3.5 w-3.5" /> : undefined}>
              {loading ? 'Searching' : 'Search'}
            </Button>
          </div>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
          <span className="mr-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-subtle">
            <Filter className="h-2.5 w-2.5" />
            try
          </span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                runSearch(example);
              }}
              className="focus-ring rounded-md border border-line bg-surface2/50 px-2 py-0.5 text-[9.5px] text-subtle transition-colors hover:border-line-strong hover:text-muted"
            >
              {example}
            </button>
          ))}
          {(chapterFilter != null || query) && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setChapterFilter(null);
                setResults([]);
                setSearched(false);
                setError(null);
              }}
              className="focus-ring ml-auto flex items-center gap-1 text-[9px] text-subtle hover:text-muted"
            >
              <X className="h-2.5 w-2.5" />
              clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-danger/20 bg-danger/[0.05] px-3.5 py-2.5 text-[11px] text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-7">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="surface-card p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <SkeletonText lines={3} className="mt-3" />
              </div>
            ))}
          </div>
          <div className="surface-card p-4 lg:col-span-5">
            <Skeleton className="h-4 w-2/3" />
            <SkeletonText lines={8} className="mt-4" />
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* Results */}
          <div className="space-y-2 lg:col-span-7">
            <div className="mb-1 flex items-center justify-between px-1">
              <p className="text-[10px] text-subtle">
                <span className="font-mono text-muted">{results.length}</span> chunks for{' '}
                <span className="text-muted">“{query || 'chapter filter'}”</span>
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">ranked by relevance</p>
            </div>

            {results.map((result, index) => {
              const id = result.id || String(index);
              const active = selected ? (selected.id || '0') === id : false;
              const match = Math.round(result.similarity_score * 100);
              return (
                <div key={id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(id)}
                    className={cn(
                      'focus-ring w-full rounded-xl border p-3.5 text-left transition-colors',
                      active
                        ? 'border-accent/30 bg-accent/[0.04]'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-surface2/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2">
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono text-[9px]',
                            active ? 'border-accent/30 bg-accent/10 text-accent-soft' : 'border-line bg-surface2 text-subtle',
                          )}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-ink" title={result.document}>
                            {result.document.replace(/_/g, ' ')}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-subtle">
                            <span className="flex items-center gap-1">
                              <FileText className="h-2.5 w-2.5" />
                              Slide {result.slide_num ?? '—'}
                            </span>
                            {result.chapter != null && <Badge variant="outline">Ch {String(result.chapter).padStart(2, '0')}</Badge>}
                            <span className="rounded border border-line px-1 py-0.5 font-mono uppercase tracking-wider">{result.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-[10px] text-cyan">{match}%</p>
                        <div className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-cyan/70" style={{ width: `${match}%` }} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2.5 line-clamp-2 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-subtle">{result.text}</p>
                  </button>

                  {/* Mobile inline reader */}
                  {active && (
                    <div className="mt-1 rounded-xl border border-line bg-[#0b0b0f] p-3.5 lg:hidden">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">Full chunk</p>
                        <Button size="xs" variant="ghost" onClick={() => toggleBookmark(result)} leading={learning.bookmarks.some((b) => b.id === `slide:${result.document}:${result.slide_num}:${result.citation}`) ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}>
                          {learning.bookmarks.some((b) => b.id === `slide:${result.document}:${result.slide_num}:${result.citation}`) ? 'Saved' : 'Save'}
                        </Button>
                      </div>
                      <pre className="mt-2 max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono text-[10.5px] leading-relaxed text-muted">{result.text}</pre>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={async () => {
                            const ok = await copyText(`${result.citation}\n\n${result.text}`);
                            toast.push(ok ? 'success' : 'error', ok ? 'Chunk copied' : 'Could not copy');
                          }}
                          leading={<Copy className="h-3 w-3" />}
                        >
                          Copy
                        </Button>
                        {result.chapter != null && (
                          <Button size="xs" variant="secondary" onClick={() => onStudyChapter(result.chapter as number)} leading={<MessageSquareText className="h-3 w-3" />}>
                            Study chapter
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inspector */}
          <aside className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[68px]">
              {selected ? (
                <div className="surface-card overflow-hidden">
                  <div className="flex items-start justify-between gap-3 border-b border-line p-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">Source inspector</p>
                      <h2 className="mt-1.5 text-[12px] font-semibold leading-snug text-ink">{selected.document.replace(/_/g, ' ')}</h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] text-subtle">
                        <span>Slide {selected.slide_num ?? '—'}</span>
                        <span aria-hidden>·</span>
                        <span className="font-mono text-cyan">{Math.round(selected.similarity_score * 100)}% match</span>
                        {selected.chapter != null && (
                          <>
                            <span aria-hidden>·</span>
                            <span>Chapter {String(selected.chapter).padStart(2, '0')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(selected)}
                      className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface2 text-subtle transition-colors hover:text-ink"
                      aria-label={selectedSaved ? 'Remove slide bookmark' : 'Bookmark slide'}
                    >
                      {selectedSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-accent-soft" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="max-h-[calc(100vh-330px)] overflow-y-auto p-4">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-subtle">Raw slide text</p>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-[10.5px] leading-[1.8] text-muted">{selected.text}</pre>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={async () => {
                        const ok = await copyText(`${selected.citation}\n\n${selected.text}`);
                        toast.push(ok ? 'success' : 'error', ok ? 'Citation copied' : 'Could not copy');
                      }}
                      leading={<Copy className="h-3 w-3" />}
                    >
                      Copy citation
                    </Button>
                    {selected.chapter != null && (
                      <Button size="xs" variant="secondary" onClick={() => onStudyChapter(selected.chapter as number)} leading={<MessageSquareText className="h-3 w-3" />}>
                        Study chapter
                      </Button>
                    )}
                    <span className="ml-auto truncate font-mono text-[8.5px] text-subtle" title={selected.citation}>
                      {selected.citation}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="mt-3 rounded-xl border border-line bg-surface/40 p-3.5">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-subtle" />
                  <p className="text-[10px] font-medium text-muted">About this index</p>
                </div>
                <div className="mt-2 space-y-1.5 text-[9.5px]">
                  <div className="flex justify-between">
                    <span className="text-subtle">Chunks</span>
                    <span className="font-mono text-muted">{totalChunks ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtle">Dimension</span>
                    <span className="font-mono text-muted">{knowledgeStats?.vector_dimension ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtle">Metric</span>
                    <span className="font-mono text-muted">cosine</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : searched ? (
        <div className="mt-4">
          <EmptyState
            icon={<Search className="h-4 w-4" />}
            title="No chunks matched that search"
            description="Try a broader formulation, remove the chapter filter, or inspect the query wording. The index contains lecture slides and exam material."
            action={
              <Button size="sm" variant="outline" onClick={() => { setChapterFilter(null); setQuery(''); setSearched(false); setResults([]); }}>
                Reset search
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <div className="surface-card p-5 lg:col-span-7">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-accent-soft" />
              <p className="text-[12px] font-semibold text-ink">Explore the corpus</p>
            </div>
            <p className="mt-1.5 max-w-lg text-[11px] leading-relaxed text-subtle">
              The knowledge base contains every lecture slide and exam page, chunked and embedded locally. Search to see exactly what the tutor can retrieve.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Slide chunks', value: totalChunks ?? '—' },
                { label: 'Modules', value: '14' },
                { label: 'Dimensions', value: knowledgeStats?.vector_dimension ?? '2560' },
                { label: 'Metric', value: 'cosine' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-line bg-surface2/40 p-3">
                  <p className="text-[9px] uppercase tracking-wider text-subtle">{stat.label}</p>
                  <p className="mt-1 font-mono text-[12px] text-ink">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="label-caps mb-2">Example searches</p>
              <div className="space-y-1">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setQuery(example);
                      runSearch(example);
                    }}
                    className="focus-ring flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left text-[11px] text-muted transition-colors hover:border-line hover:bg-white/[0.025]"
                  >
                    <Search className="h-3 w-3 text-subtle" />
                    {example}
                    <ArrowRight className="ml-auto h-3 w-3 text-subtle" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card p-5 lg:col-span-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-subtle" />
              <p className="text-[12px] font-semibold text-ink">How grounding works</p>
            </div>
            <ol className="mt-4 space-y-3">
              {[
                { title: 'Chunk', detail: 'Slides are split along page boundaries with module and slide metadata attached.' },
                { title: 'Embed', detail: 'Each chunk is embedded locally with qwen3-embedding:4b at 2560 dimensions.' },
                { title: 'Retrieve', detail: 'Queries are embedded and ranked by calibrated cosine similarity.' },
                { title: 'Cite', detail: 'The tutor receives retrieved chunks and returns citations back to the exact slide.' },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line bg-surface2 font-mono text-[9px] text-subtle">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-[10.5px] font-medium text-muted">{step.title}</span>
                    <span className="mt-0.5 block text-[9.5px] leading-relaxed text-subtle">{step.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => onNavigate('tutor')}
              leading={<MessageSquareText className="h-3.5 w-3.5" />}
            >
              Ask the tutor a question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
