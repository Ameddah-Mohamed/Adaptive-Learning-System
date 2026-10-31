import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Circle,
  Code2,
  Database,
  FlaskConical,
  Layers,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import type { Route } from '../lib/types';
import { CHAPTERS, STAGES, chapterLabel, getChapterByPracticeTopic } from '../lib/curriculum';
import { learningStore, useLearning } from '../lib/learningStore';
import { cn } from '../lib/utils';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

interface LibraryViewProps {
  onNavigate: (route: Route) => void;
  onStudyChapter: (chapter: number) => void;
  onPracticeTopic: (topic: string) => void;
  onInspectChapter: (chapter: number) => void;
  onOpenLabTask?: (taskId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onNavigate,
  onStudyChapter,
  onPracticeTopic,
  onInspectChapter,
  onOpenLabTask,
}) => {
  const learning = useLearning();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<string>('All');
  const [activeChapterSlug, setActiveChapterSlug] = useState<string | null>(null);

  const totalPracticeByChapter = useMemo(() => {
    const map = new Map<number, { attempts: number; correct: number }>();
    for (const attempt of learning.quizAttempts) {
      const chapter = getChapterByPracticeTopic(attempt.topic);
      if (!chapter?.number) continue;
      const current = map.get(chapter.number) ?? { attempts: 0, correct: 0 };
      current.attempts += 1;
      if (attempt.correct) current.correct += 1;
      map.set(chapter.number, current);
    }
    return map;
  }, [learning.quizAttempts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHAPTERS.filter((chapter) => {
      const matchesStage = stage === 'All' || chapter.stage === stage;
      const haystack = `${chapter.title} ${chapter.shortTitle} ${chapter.summary} ${chapter.topics.join(' ')} ${chapter.number ?? ''}`.toLowerCase();
      return matchesStage && (!q || haystack.includes(q));
    });
  }, [query, stage]);

  const grouped = useMemo(() => {
    return STAGES.map((stageInfo) => ({
      ...stageInfo,
      chapters: filtered.filter((chapter) => chapter.stage === stageInfo.name),
    })).filter((group) => group.chapters.length > 0);
  }, [filtered]);

  const selectedChapter = activeChapterSlug != null ? CHAPTERS.find((chapter) => chapter.slug === activeChapterSlug) ?? null : null;
  const selectedPractice = selectedChapter?.number ? totalPracticeByChapter.get(selectedChapter.number) : undefined;
  const selectedBookmarkId = selectedChapter ? `chapter:${selectedChapter.slug}` : '';
  const selectedSaved = learning.bookmarks.some((bookmark) => bookmark.id === selectedBookmarkId);

  const toggleChapterBookmark = (chapter: (typeof CHAPTERS)[number]) => {
    const added = learningStore.toggleBookmark({
      id: `chapter:${chapter.slug}`,
      type: 'chapter',
      title: `${chapterLabel(chapter)} · ${chapter.shortTitle}`,
      subtitle: chapter.stage,
      chapter: chapter.number,
    });
    toast.push(added ? 'success' : 'info', added ? 'Module bookmarked' : 'Bookmark removed', chapter.shortTitle);
  };

  const moduleCount = CHAPTERS.filter((chapter) => chapter.number != null).length;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-caps mb-2">Course library</p>
          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-ink">The NLP curriculum, structured.</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Every module is grounded in the official ENSIA lecture decks. Open a module in the tutor, generate targeted practice, or inspect the source slides.
          </p>
        </div>
        <div className="flex items-center gap-5 rounded-xl border border-line bg-surface px-4 py-3">
          <div>
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Modules</p>
            <p className="mt-0.5 font-mono text-sm text-ink">{moduleCount}</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Explored</p>
            <p className="mt-0.5 font-mono text-sm text-ink">
              {learning.exploredChapters.length}<span className="text-subtle">/{moduleCount}</span>
            </p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Saved</p>
            <p className="mt-0.5 font-mono text-sm text-ink">{learning.bookmarks.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search modules, topics, or concepts…"
            className="focus-ring h-9 w-full rounded-lg border border-line bg-bg pl-8 pr-3 text-[12px] text-ink placeholder:text-subtle"
            aria-label="Search course modules"
          />
        </div>
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto">
          {['All', ...STAGES.filter((stageInfo) => stageInfo.name !== 'Appendix').map((stageInfo) => stageInfo.name)].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStage(item)}
              className={cn(
                'focus-ring shrink-0 rounded-md border px-2 py-1.5 text-[10.5px] font-medium transition-colors',
                stage === item
                  ? 'border-accent/25 bg-accent/[0.08] text-accent-soft'
                  : 'border-transparent text-subtle hover:bg-white/[0.035] hover:text-muted',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-4 w-4" />}
          title="No modules match that search"
          description="Try a broader term — for example “attention”, “parsing”, “Naive Bayes”, or a chapter number."
          action={
            <Button size="sm" variant="outline" onClick={() => { setQuery(''); setStage('All'); }}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.name}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2.5">
                  <h2 className="text-[13px] font-semibold text-ink">{group.name}</h2>
                  <span className="font-mono text-[10px] text-subtle">{group.chapters.length} modules</span>
                </div>
                <p className="text-[10.5px] text-subtle">{group.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.chapters.map((chapter) => {
                  const practice = chapter.number ? totalPracticeByChapter.get(chapter.number) : undefined;
                  const explored = chapter.number != null && learning.exploredChapters.includes(chapter.number);
                  const saved = learning.bookmarks.some((bookmark) => bookmark.id === `chapter:${chapter.slug}`);
                  return (
                    <article
                      key={chapter.slug}
                      className="surface-card surface-card-hover group relative flex flex-col p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-line bg-surface2 px-1.5 font-mono text-[10px] text-muted">
                            {chapter.number ? String(chapter.number).padStart(2, '0') : 'AP'}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">{chapter.stage}</span>
                          {explored && (
                            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-success">
                              <Circle className="h-1.5 w-1.5 fill-current" />
                              opened
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleChapterBookmark(chapter);
                          }}
                          className="focus-ring relative z-10 -mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink"
                          aria-label={saved ? 'Remove module bookmark' : 'Bookmark module'}
                        >
                          {saved ? <BookmarkCheck className="h-3.5 w-3.5 text-accent-soft" /> : <Bookmark className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      <h3 className="mt-3 text-[13.5px] font-semibold leading-snug text-ink">
                        <button
                          type="button"
                          onClick={() => setActiveChapterSlug(chapter.slug)}
                          className="focus-ring text-left after:absolute after:inset-0 after:rounded-xl after:content-['']"
                        >
                          {chapter.shortTitle}
                        </button>
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-subtle">{chapter.summary}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {chapter.topics.slice(0, 3).map((topic) => (
                          <span key={topic} className="rounded border border-line bg-surface2/60 px-1.5 py-0.5 text-[9.5px] text-muted">
                            {topic}
                          </span>
                        ))}
                        {chapter.topics.length > 3 && (
                          <span className="rounded border border-line bg-surface2/60 px-1.5 py-0.5 text-[9.5px] text-subtle">
                            +{chapter.topics.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                        <div className="flex items-center gap-3 text-[9.5px] text-subtle">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {chapter.slides} slides
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {chapter.chunks} chunks
                          </span>
                          {practice && (
                            <span className="flex items-center gap-1 text-muted">
                              <Target className="h-3 w-3" />
                              {Math.round((practice.correct / practice.attempts) * 100)}%
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-muted" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={selectedChapter != null}
        onClose={() => setActiveChapterSlug(null)}
        size="lg"
        title={
          selectedChapter ? (
            <span className="flex items-center gap-2">
              <span className="flex h-6 min-w-6 items-center justify-center rounded border border-line bg-surface2 px-1 font-mono text-[10px] text-muted">
                {selectedChapter.number ? String(selectedChapter.number).padStart(2, '0') : 'AP'}
              </span>
              {selectedChapter.title}
            </span>
          ) : ''
        }
        description={selectedChapter ? `${selectedChapter.stage} · ${selectedChapter.slides} slides · ${selectedChapter.chunks} indexed chunks` : undefined}
        footer={
          selectedChapter && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleChapterBookmark(selectedChapter)}
                leading={selectedSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              >
                {selectedSaved ? 'Saved' : 'Save module'}
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leading={<Database className="h-3.5 w-3.5" />}
                  disabled={selectedChapter.number == null}
                  onClick={() => {
                    if (selectedChapter.number) onInspectChapter(selectedChapter.number);
                    setActiveChapterSlug(null);
                  }}
                >
                  Source slides
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  leading={<FlaskConical className="h-3.5 w-3.5" />}
                  onClick={() => {
                    onPracticeTopic(selectedChapter.practiceTopic);
                    setActiveChapterSlug(null);
                  }}
                >
                  Practice
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  leading={<MessageSquareText className="h-3.5 w-3.5" />}
                  disabled={selectedChapter.number == null}
                  onClick={() => {
                    if (selectedChapter.number) onStudyChapter(selectedChapter.number);
                    setActiveChapterSlug(null);
                  }}
                >
                  Study with tutor
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedChapter && (
          <div className="space-y-6 p-5">
            <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">{selectedChapter.summary}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-surface2/50 p-3">
                <p className="text-[9.5px] uppercase tracking-wider text-subtle">Slides</p>
                <p className="mt-1 font-mono text-sm text-ink">{selectedChapter.slides}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface2/50 p-3">
                <p className="text-[9.5px] uppercase tracking-wider text-subtle">Indexed chunks</p>
                <p className="mt-1 font-mono text-sm text-ink">{selectedChapter.chunks}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface2/50 p-3">
                <p className="text-[9.5px] uppercase tracking-wider text-subtle">Your attempts</p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {selectedPractice ? `${selectedPractice.correct}/${selectedPractice.attempts} correct` : '—'}
                </p>
              </div>
            </div>

            <div>
              <p className="label-caps mb-2.5">Learning objectives</p>
              <ul className="space-y-2">
                {selectedChapter.objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted">
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-soft" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label-caps mb-2.5">Topics in this module</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedChapter.topics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      onPracticeTopic(topic);
                      setActiveChapterSlug(null);
                    }}
                    className="focus-ring rounded-md border border-line bg-surface2/60 px-2 py-1 text-[10.5px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[9.5px] text-subtle">Selecting a topic opens a practice session seeded with it.</p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface2/40 px-3 py-2.5">
              {selectedChapter.labTaskId ? (
                <>
                  <Code2 className="h-4 w-4 text-warning" />
                  <span className="text-[11px] text-muted">This module has a matching coding assignment in the Coding Lab.</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => {
                      if (onOpenLabTask && selectedChapter.labTaskId) {
                        onOpenLabTask(selectedChapter.labTaskId);
                      } else {
                        onNavigate('sandbox');
                      }
                      setActiveChapterSlug(null);
                    }}
                    trailing={<ArrowRight className="h-3 w-3" />}
                  >
                    Open lab
                  </Button>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 text-subtle" />
                  <span className="text-[11px] text-muted">No standalone coding assignment is attached to this module yet.</span>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
