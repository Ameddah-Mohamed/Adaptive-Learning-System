import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Cpu,
  Database,
  FileText,
  Layers,
  MessageSquareText,
  PanelRight,
  PanelRightClose,
  Plus,
  Quote,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import type { ChatMessage, CitationItem, Route } from '../lib/types';
import { askTutor, streamTutor } from '../lib/api';
import { chatStore, useChat } from '../lib/chatStore';
import { CHAPTERS, getChapter } from '../lib/curriculum';
import { useLearning, learningStore } from '../lib/learningStore';
import { usePreferences } from '../lib/preferences';
import { cn, copyText, formatClock, uid } from '../lib/utils';
import { MathRenderer } from './MathRenderer';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';
import { Tooltip } from './ui/Tooltip';
import { useToast } from './ui/Toast';

interface TutorChatViewProps {
  selectedModel: string;
  chapterFilter: number | null;
  setChapterFilter: (chapter: number | null) => void;
  topK: number;
  setTopK: (depth: number) => void;
  onNavigate: (route: Route) => void;
}

const PROMPTS = [
  {
    category: 'Transformer',
    title: 'Derive the √dₖ scaling',
    query:
      'Derive why we divide by sqrt(d_k) in scaled dot-product attention. Show the variance calculation assuming independent query and key components with mean 0 and variance 1, and explain how this prevents softmax saturation.',
  },
  {
    category: 'Language modeling',
    title: 'Perplexity vs. cross-entropy',
    query:
      'Explain how perplexity is computed for an n-gram language model and how it relates mathematically to cross-entropy. What does a lower perplexity indicate?',
  },
  {
    category: 'Parsing',
    title: 'Why CKY needs CNF',
    query:
      'Explain the Chomsky Normal Form conversion rules required before running CKY. Why must production rules be binarized, and what breaks if they are not?',
  },
  {
    category: 'PyTorch',
    title: 'Debug attention shapes',
    query:
      'I wrote scores = torch.matmul(q, k) / math.sqrt(d_k) for attention. PyTorch raises a dimension mismatch. Explain the shape error and the correct implementation with masking.',
  },
];

function citationLabel(citation: CitationItem): string {
  const chapter = citation.citation.match(/Chapter\s+(\d+)/i)?.[1];
  if (chapter) return `Chapter ${chapter.padStart(2, '0')}`;
  return citation.document.replace(/_/g, ' ').slice(0, 22);
}

function sourceKey(citation: CitationItem): string {
  return `slide:${citation.document}:${citation.slide_num ?? 'na'}:${citation.citation}`;
}

const ContextPanel: React.FC<{
  messages: ChatMessage[];
  activeSource: CitationItem | null;
  onSelectSource: (source: CitationItem) => void;
  chapterFilter: number | null;
  setChapterFilter: (chapter: number | null) => void;
  topK: number;
  setTopK: (depth: number) => void;
  onNavigate: (route: Route) => void;
  onRequestClear: () => void;
  onClose?: () => void;
  onUseConcept: (concept: string) => void;
}> = ({
  messages,
  activeSource,
  onSelectSource,
  chapterFilter,
  setChapterFilter,
  topK,
  setTopK,
  onNavigate,
  onRequestClear,
  onClose,
  onUseConcept,
}) => {
  const [tab, setTab] = useState<'sources' | 'session'>('sources');
  const learning = useLearning();
  const preferences = usePreferences();
  const toast = useToast();

  const sources = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant' && message.citations?.length);
    return lastAssistant?.citations ?? [];
  }, [messages]);

  const selectedChapter = getChapter(chapterFilter);
  const isSaved = activeSource ? learning.bookmarks.some((bookmark) => bookmark.id === sourceKey(activeSource)) : false;

  useEffect(() => {
    if (activeSource) setTab('sources');
  }, [activeSource]);

  const toggleBookmark = () => {
    if (!activeSource) return;
    const added = learningStore.toggleBookmark({
      id: sourceKey(activeSource),
      type: 'slide',
      title: activeSource.citation,
      subtitle: activeSource.document,
      chapter: selectedChapter?.number ?? null,
      content: activeSource.excerpt,
      citation: activeSource.citation,
    });
    toast.push(added ? 'success' : 'info', added ? 'Slide bookmarked' : 'Bookmark removed', activeSource.citation);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface/40">
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-2">
          <PanelRight className="h-4 w-4 text-accent-soft" />
          <span className="text-[12px] font-semibold text-ink">Context</span>
          {sources.length > 0 && (
            <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[9px] text-accent-soft">
              {sources.length} sources
            </span>
          )}
        </div>
        {onClose && (
          <Tooltip label="Collapse context panel (⌘.)" side="bottom">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink"
              aria-label="Collapse context panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      <div className="flex shrink-0 gap-1 border-b border-line px-3 py-2">
        <button
          type="button"
          onClick={() => setTab('sources')}
          className={cn(
            'focus-ring flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[11px] font-medium transition-colors',
            tab === 'sources' ? 'bg-white/[0.06] text-ink' : 'text-subtle hover:text-muted',
          )}
        >
          Sources
          {sources.length > 0 && (
            <span className="rounded bg-white/[0.07] px-1 font-mono text-[9px] text-muted">{sources.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('session')}
          className={cn(
            'focus-ring flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[11px] font-medium transition-colors',
            tab === 'session' ? 'bg-white/[0.06] text-ink' : 'text-subtle hover:text-muted',
          )}
        >
          Session
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'sources' ? (
          <div className="p-3">
            {activeSource ? (
              <div className="mb-4 rounded-xl border border-line bg-surface p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-ink" title={activeSource.document}>
                      {activeSource.document.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-subtle">
                      <FileText className="h-3 w-3" />
                      Slide {activeSource.slide_num ?? '—'}
                      <span aria-hidden>·</span>
                      <span className="font-mono text-cyan">{Math.round(activeSource.relevance_score * 100)}% match</span>
                    </p>
                  </div>
                  <Badge variant="cyan">{Math.round(activeSource.relevance_score * 100)}</Badge>
                </div>
                <div className="mt-3 max-h-[220px] overflow-y-auto rounded-lg border border-line bg-[#0b0b0f] p-3 font-mono text-[10.5px] leading-relaxed text-muted whitespace-pre-wrap">
                  {activeSource.excerpt}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <Button size="xs" variant="outline" onClick={toggleBookmark} leading={isSaved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}>
                    {isSaved ? 'Saved' : 'Save slide'}
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={async () => {
                      const ok = await copyText(`${activeSource.citation}\n\n${activeSource.excerpt}`);
                      toast.push(ok ? 'success' : 'error', ok ? 'Citation copied' : 'Could not copy citation');
                    }}
                    leading={<Copy className="h-3 w-3" />}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                compact
                icon={<Quote className="h-4 w-4" />}
                title="Sources appear with answers"
                description="Ask a question to see the lecture slides retrieved from the course index."
              />
            )}

            {sources.length > 0 && (
              <div className="mt-1">
                <p className="label-caps mb-2 px-1">Retrieved in this answer</p>
                <div className="space-y-1">
                  {sources.map((source, index) => (
                    <button
                      key={`${sourceKey(source)}-${index}`}
                      type="button"
                      onClick={() => onSelectSource(source)}
                      className={cn(
                        'focus-ring flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors',
                        activeSource?.citation === source.citation
                          ? 'border-accent/25 bg-accent/[0.06]'
                          : 'border-transparent hover:border-line hover:bg-white/[0.025]',
                      )}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line bg-surface2 font-mono text-[9px] text-subtle">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[10.5px] font-medium text-muted">{citationLabel(source)} · Slide {source.slide_num ?? '—'}</span>
                        <span className="mt-0.5 block truncate text-[9.5px] text-subtle">{source.document.replace(/_/g, ' ')}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <p className="label-caps mb-2 px-1">Related concepts</p>
              {selectedChapter ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedChapter.topics.slice(0, 6).map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => onUseConcept(topic)}
                      className="focus-ring rounded-md border border-line bg-surface2/60 px-2 py-1 text-left text-[10px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-1 text-[10.5px] leading-relaxed text-subtle">
                  Focus the tutor on a chapter to surface related concepts and guide retrieval.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted" htmlFor="chapter-focus">
                Focus chapter
              </label>
              <div className="relative">
                <select
                  id="chapter-focus"
                  value={chapterFilter ?? ''}
                  onChange={(event) => setChapterFilter(event.target.value ? Number(event.target.value) : null)}
                  className="focus-ring h-9 w-full appearance-none rounded-lg border border-line bg-surface px-2.5 pr-8 text-[11px] text-ink"
                >
                  <option value="">All course chapters</option>
                  {CHAPTERS.filter((chapter) => chapter.number != null).map((chapter) => (
                    <option key={chapter.slug} value={chapter.number ?? ''}>
                      {chapter.number ? `Chapter ${String(chapter.number).padStart(2, '0')}` : 'Appendix'} · {chapter.shortTitle}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-subtle">Restricts retrieval and citations to one module.</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11px] font-medium text-muted" htmlFor="retrieval-depth">
                  Retrieval depth
                </label>
                <span className="font-mono text-[10px] text-cyan">{topK} slides</span>
              </div>
              <input
                id="retrieval-depth"
                type="range"
                min={1}
                max={6}
                step={1}
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="mt-1 flex justify-between font-mono text-[9px] text-subtle">
                <span>1</span>
                <span>6</span>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <Button size="sm" variant="outline" onClick={onRequestClear} leading={<Trash2 className="h-3.5 w-3.5" />} className="w-full">
                Clear conversation
              </Button>
              <p className="mt-2 text-center font-mono text-[9px] text-subtle">{messages.length} messages in this session</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TutorChatView: React.FC<TutorChatViewProps> = ({
  selectedModel,
  chapterFilter,
  setChapterFilter,
  topK,
  setTopK,
  onNavigate,
}) => {
  const messages = useChat();
  const preferences = usePreferences();
  const toast = useToast();
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [activeSource, setActiveSource] = useState<CitationItem | null>(null);
  const [contextOpen, setContextOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('ensia-tutor-context-open');
    return saved !== null ? saved === '1' : true;
  });
  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottom = useRef(true);
  const pendingText = useRef('');
  const flushTimer = useRef<number | null>(null);

  const selectedChapter = getChapter(chapterFilter);
  const lastAssistantSources = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.citations?.length)?.citations ?? [],
    [messages],
  );

  useEffect(() => {
    window.localStorage.setItem('ensia-tutor-context-open', contextOpen ? '1' : '0');
  }, [contextOpen]);

  useEffect(() => {
    const handleToggle = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setContextOpen((open) => !open);
      } else {
        setMobileContextOpen((open) => !open);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === '.' || event.key === '\\')) {
        event.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('ensia-toggle-tutor-context', handleToggle);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('ensia-toggle-tutor-context', handleToggle);
    };
  }, []);

  useEffect(() => {
    if (stickToBottom.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  useEffect(() => {
    return () => {
      if (flushTimer.current) window.clearTimeout(flushTimer.current);
      abortRef.current?.abort();
    };
  }, []);

  const openSource = (source: CitationItem) => {
    setActiveSource(source);
    if (window.matchMedia('(max-width: 1279px)').matches) setMobileContextOpen(true);
  };

  const flushPending = (id: string) => {
    if (flushTimer.current) {
      window.clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    if (pendingText.current) chatStore.update(id, { content: pendingText.current });
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleSend = useCallback(
    async (queryText?: string) => {
      const text = (queryText ?? input).trim();
      if (!text || streaming) return;

      const userMessage: ChatMessage = {
        id: uid('user'),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      const assistantId = uid('assistant');
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        citations: [],
        timestamp: new Date().toISOString(),
        status: 'streaming',
      };

      chatStore.add(userMessage);
      chatStore.add(assistantMessage);
      if (!queryText) setInput('');
      setStreaming(true);
      setActiveSource(null);
      pendingText.current = '';
      stickToBottom.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      const scheduleFlush = (fullText: string) => {
        pendingText.current = fullText;
        if (flushTimer.current) return;
        flushTimer.current = window.setTimeout(() => {
          flushTimer.current = null;
          chatStore.update(assistantId, { content: pendingText.current });
        }, 45);
      };

      try {
        if (!preferences.streaming) {
          const directRes = await askTutor(text, {
            model: preferences.model || selectedModel,
            chapter_filter: chapterFilter,
            top_k: topK,
          });
          chatStore.update(assistantId, {
            content: directRes.answer,
            citations: directRes.citations,
            status: 'done',
          });
          if (directRes.citations[0]) setActiveSource(directRes.citations[0]);
          learningStore.recordEvent({
            kind: 'tutor',
            title: text.length > 72 ? `${text.slice(0, 72)}…` : text,
            detail: `${directRes.citations.length} sources · standard response`,
            chapter: chapterFilter,
          });
          return;
        }

        const result = await streamTutor(
          text,
          { model: preferences.model || selectedModel, chapter_filter: chapterFilter, top_k: topK },
          {
            signal: controller.signal,
            onCitations: (citations) => {
              chatStore.update(assistantId, { citations });
              if (citations[0]) setActiveSource(citations[0]);
            },
            onToken: (_token, fullText) => scheduleFlush(fullText),
          },
        );
        flushPending(assistantId);
        const finalText = result.answer || pendingText.current;
        if (!finalText.trim()) throw new Error('The model returned an empty response.');
        chatStore.update(assistantId, { content: finalText, status: 'done' });
        learningStore.recordEvent({
          kind: 'tutor',
          title: text.length > 72 ? `${text.slice(0, 72)}…` : text,
          detail: `${result.citations.length} sources · ${selectedChapter ? `Chapter ${selectedChapter.number}` : 'All chapters'}`,
          chapter: chapterFilter,
        });
      } catch (error: any) {
        const aborted = error?.name === 'AbortError';
        flushPending(assistantId);

        if (aborted) {
          if (pendingText.current.trim()) {
            chatStore.update(assistantId, { content: pendingText.current, status: 'done' });
          } else {
            chatStore.remove(assistantId);
          }
          toast.info('Generation stopped');
        } else if (!pendingText.current.trim()) {
          // The streaming endpoint may be unavailable while REST still works.
          try {
            const fallback = await askTutor(text, {
              model: preferences.model || selectedModel,
              chapter_filter: chapterFilter,
              top_k: topK,
            });
            chatStore.update(assistantId, {
              content: fallback.answer,
              citations: fallback.citations,
              status: 'done',
            });
            if (fallback.citations[0]) setActiveSource(fallback.citations[0]);
            learningStore.recordEvent({
              kind: 'tutor',
              title: text.length > 72 ? `${text.slice(0, 72)}…` : text,
              detail: `${fallback.citations.length} sources · standard response`,
              chapter: chapterFilter,
            });
            toast.info('Streaming unavailable', 'The tutor answered using the standard endpoint.');
          } catch (fallbackError: any) {
            chatStore.update(assistantId, {
              content: `I couldn't reach the tutor backend. ${fallbackError?.message || 'Check that FastAPI and Ollama are running.'}`,
              status: 'error',
            });
            toast.error('Tutor request failed', fallbackError?.message || 'Check the backend connection.');
          }
        } else {
          chatStore.update(assistantId, { content: pendingText.current, status: 'done' });
          toast.error('Response interrupted', error?.message || 'The connection to the tutor was lost.');
        }
      } finally {
        abortRef.current = null;
        if (flushTimer.current) {
          window.clearTimeout(flushTimer.current);
          flushTimer.current = null;
        }
        setStreaming(false);
      }
    },
    [chapterFilter, input, preferences.model, selectedChapter, selectedModel, streaming, toast, topK],
  );

  const handleComposerSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSend();
  };

  const clearConversation = () => {
    chatStore.clear();
    setActiveSource(null);
    setClearOpen(false);
    toast.success('Conversation cleared');
  };

  const contextPanel = (
    <ContextPanel
      messages={messages}
      activeSource={activeSource}
      onSelectSource={openSource}
      chapterFilter={chapterFilter}
      setChapterFilter={setChapterFilter}
      topK={topK}
      setTopK={setTopK}
      onNavigate={onNavigate}
      onRequestClear={() => setClearOpen(true)}
      onUseConcept={(concept) => {
        setInput((current) => (current ? `${current} ${concept}` : `Explain ${concept} in the context of the course.`));
        textareaRef.current?.focus();
        if (window.matchMedia('(max-width: 1279px)').matches) setMobileContextOpen(false);
      }}
    />
  );

  return (
    <div className="flex h-[calc(100vh-52px)] min-h-[540px]">
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/25 bg-accent/10">
              <Sparkles className="h-3.5 w-3.5 text-accent-soft" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[13px] font-semibold tracking-tight text-ink">AI Tutor</h1>
                <span className="hidden rounded border border-line bg-surface2 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-subtle sm:inline">
                  Grounded
                </span>
              </div>
              <p className="truncate text-[10px] text-subtle">
                {selectedChapter ? `Chapter ${String(selectedChapter.number).padStart(2, '0')} · ${selectedChapter.shortTitle}` : 'All course chapters'} · {topK} retrieved slides
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Tooltip label={contextOpen ? 'Hide context panel (⌘.)' : 'Show context panel (⌘.)'} side="bottom">
              <button
                type="button"
                onClick={() => {
                  if (window.matchMedia('(min-width: 1024px)').matches) {
                    setContextOpen((open) => !open);
                  } else {
                    setMobileContextOpen((open) => !open);
                  }
                }}
                className={cn(
                  'focus-ring flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-colors',
                  (contextOpen || mobileContextOpen)
                    ? 'border-accent/40 bg-accent/10 text-accent-soft'
                    : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
                )}
                aria-label={contextOpen ? 'Hide context panel' : 'Show context panel'}
                aria-keyshortcuts="Meta+. Control+."
              >
                <PanelRight className="h-3.5 w-3.5" />
                <span>Context</span>
                {lastAssistantSources.length > 0 && (
                  <span className="rounded bg-white/[0.08] px-1 font-mono text-[9px]">{lastAssistantSources.length}</span>
                )}
              </button>
            </Tooltip>
            <Button size="sm" variant="ghost" onClick={() => setClearOpen(true)} leading={<Plus className="h-3.5 w-3.5" />}>
              <span className="hidden sm:inline">New chat</span>
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto"
          onScroll={() => {
            const element = scrollRef.current;
            if (!element) return;
            stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 120;
          }}
        >
          <div className={cn('mx-auto flex min-h-full w-full max-w-[780px] flex-col px-4 sm:px-6', messages.length === 0 ? 'py-8' : 'py-2')}>
            {messages.length === 0 ? (
              <div className="my-auto py-6">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-accent/25 bg-accent/[0.08]">
                  <Sparkles className="h-5 w-5 text-accent-soft" />
                </div>
                <h2 className="max-w-lg text-[25px] font-semibold leading-[1.2] tracking-[-0.035em] text-ink sm:text-[30px]">
                  What are we unpacking today?
                </h2>
                <p className="mt-2.5 max-w-lg text-[13px] leading-relaxed text-muted">
                  A research-minded tutor grounded in the ENSIA NLP corpus. Ask for derivations, implementation debugging, or a careful walkthrough — every answer can cite the exact lecture slide.
                </p>

                <div className="mt-7 flex items-center justify-between">
                  <p className="label-caps">Suggested inquiries</p>
                </div>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  {PROMPTS.map((prompt) => (
                    <button
                      key={prompt.title}
                      type="button"
                      onClick={() => handleSend(prompt.query)}
                      className="focus-ring group flex flex-col rounded-xl border border-line bg-surface p-3.5 text-left transition-colors hover:border-line-strong hover:bg-surface2/60"
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-subtle">{prompt.category}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent-soft" />
                      </span>
                      <span className="mt-1.5 text-[12px] font-medium text-ink">{prompt.title}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[10px] text-subtle">
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3 w-3" />
                    {selectedChapter ? `${selectedChapter.chunks} module slides in scope` : '913 indexed slide chunks'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3" />
                    {topK} sources per answer
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    Citation previews
                  </span>
                </div>
              </div>
            ) : (
              <div className="pb-4">
                {messages.map((message, index) => {
                  const isLast = index === messages.length - 1;
                  const isStreamingMessage = message.role === 'assistant' && message.status === 'streaming';
                  return (
                    <article key={message.id} className="group border-b border-line/60 py-5 last:border-0">
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                            message.role === 'assistant'
                              ? 'border-accent/25 bg-accent/[0.08] text-accent-soft'
                              : 'border-line bg-surface2 text-muted',
                          )}
                        >
                          {message.role === 'assistant' ? <Sparkles className="h-3.5 w-3.5" /> : <span className="font-mono text-[10px]">Y</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-ink">{message.role === 'assistant' ? 'NLP Tutor' : 'You'}</span>
                            {message.role === 'assistant' && (
                              <span className="font-mono text-[8.5px] uppercase tracking-wider text-subtle">
                                {message.status === 'streaming' ? 'generating' : message.status === 'error' ? 'error' : 'grounded'}
                              </span>
                            )}
                            <span className="font-mono text-[9px] text-subtle/80">
                              {formatClock(new Date(message.timestamp).getTime())}
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await copyText(message.content);
                                toast.push(ok ? 'success' : 'error', ok ? 'Copied to clipboard' : 'Could not copy');
                              }}
                              className="focus-ring ml-auto flex h-6 w-6 items-center justify-center rounded text-subtle opacity-0 transition-opacity hover:bg-white/5 hover:text-muted focus-visible:opacity-100 group-hover:opacity-100"
                              aria-label="Copy message"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>

                          {message.role === 'user' ? (
                            <div className="rounded-xl border border-line bg-surface2/80 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
                              {message.content}
                            </div>
                          ) : message.status === 'error' ? (
                            <div className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/[0.06] px-3.5 py-3 text-[12px] leading-relaxed text-danger">
                              <span className="mt-0.5 font-mono text-[10px]">ERR</span>
                              <span className="text-muted">{message.content}</span>
                            </div>
                          ) : isStreamingMessage && !message.content ? (
                            <div className="flex items-center gap-2.5 py-1 text-[12px] text-subtle">
                              <span className="flex gap-1" aria-hidden>
                                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" />
                                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent [animation-delay:180ms]" />
                                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent [animation-delay:360ms]" />
                              </span>
                              {message.citations?.length
                                ? `Reading ${message.citations.length} retrieved slide${message.citations.length === 1 ? '' : 's'}…`
                                : 'Retrieving course context…'}
                            </div>
                          ) : (
                            <MathRenderer content={message.content} streaming={isStreamingMessage} />
                          )}

                          {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                            <div className="mt-3">
                              <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-wider text-subtle">
                                <Layers className="h-3 w-3" />
                                Sources
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {message.citations.map((citation, citationIndex) => (
                                  <button
                                    key={`${citation.citation}-${citationIndex}`}
                                    type="button"
                                    onClick={() => openSource(citation)}
                                    className={cn(
                                      'focus-ring group flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] transition-colors',
                                      activeSource?.citation === citation.citation
                                        ? 'border-accent/30 bg-accent/[0.07] text-accent-soft'
                                        : 'border-line bg-surface2/60 text-muted hover:border-line-strong hover:text-ink',
                                    )}
                                    title={citation.document}
                                  >
                                    <BookOpen className="h-3 w-3 shrink-0 text-subtle" />
                                    <span className="truncate font-medium">{citationLabel(citation)}</span>
                                    <span className="shrink-0 font-mono text-[9px] text-subtle">· {citation.slide_num ? `Slide ${citation.slide_num}` : 'Source'}</span>
                                    <span className="hidden shrink-0 font-mono text-[9px] text-cyan sm:inline">{Math.round(citation.relevance_score * 100)}%</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {isLast && isStreamingMessage && message.content && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-subtle">
                              <span className="h-1 w-1 animate-pulse rounded-full bg-accent" />
                              generating · press stop to interrupt
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-line bg-bg/95 px-4 py-3 sm:px-6">
          <form onSubmit={handleComposerSubmit} className="mx-auto w-full max-w-[780px]">
            {chapterFilter && (
              <div className="mb-2 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-md border border-accent/20 bg-accent/[0.06] px-2 py-1 text-[10px] text-accent-soft">
                  <BookOpen className="h-3 w-3" />
                  {selectedChapter ? `Chapter ${String(selectedChapter.number).padStart(2, '0')} · ${selectedChapter.shortTitle}` : `Chapter ${chapterFilter}`}
                  <button
                    type="button"
                    onClick={() => setChapterFilter(null)}
                    className="focus-ring ml-1 rounded text-accent-soft/70 hover:text-accent-soft"
                    aria-label="Clear chapter focus"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
            <div className="rounded-xl border border-line bg-surface shadow-panel transition-colors focus-within:border-accent/40">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about a derivation, a tensor shape, a paper, or a course concept…"
                className="max-h-[180px] min-h-[48px] w-full resize-none bg-transparent px-3.5 py-3 text-[13px] leading-relaxed text-ink outline-none placeholder:text-subtle"
                aria-label="Message the AI tutor"
              />
              <div className="flex items-center justify-between gap-2 border-t border-line/70 px-2.5 py-2">
                <div className="flex items-center gap-2 text-[9.5px] text-subtle">
                  <span className="hidden items-center gap-1 sm:flex">
                    <kbd className="rounded border border-line bg-surface2 px-1 py-0.5 font-mono text-[9px]">↵</kbd>
                    send
                  </span>
                  <span className="hidden items-center gap-1 sm:flex">
                    <kbd className="rounded border border-line bg-surface2 px-1 py-0.5 font-mono text-[9px]">⇧↵</kbd>
                    newline
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {topK} sources
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {streaming ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleStop}
                      leading={<Square className="h-3 w-3 fill-current" />}
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={!input.trim()}
                      leading={<Send className="h-3.5 w-3.5" />}
                      aria-label="Send message"
                    >
                      Send
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-1.5 text-center text-[9.5px] text-subtle">
              Grounded in course materials · verify critical mathematical results · local model inference
            </p>
          </form>
        </div>
      </section>

      {contextOpen && (
        <aside className="hidden w-[310px] shrink-0 border-l border-line lg:block animate-fade-in">
          <ContextPanel
            messages={messages}
            activeSource={activeSource}
            onSelectSource={openSource}
            chapterFilter={chapterFilter}
            setChapterFilter={setChapterFilter}
            topK={topK}
            setTopK={setTopK}
            onNavigate={onNavigate}
            onRequestClear={() => setClearOpen(true)}
            onClose={() => setContextOpen(false)}
            onUseConcept={(concept) => {
              setInput((current) => (current ? `${current} ${concept}` : `Explain ${concept} in the context of the course.`));
              textareaRef.current?.focus();
            }}
          />
        </aside>
      )}

      {mobileContextOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setMobileContextOpen(false)}
            aria-label="Close context panel"
          />
          <div className="absolute inset-y-0 right-0 w-[min(92vw,340px)] border-l border-line bg-surface shadow-pop animate-fade-up">
            <ContextPanel
              messages={messages}
              activeSource={activeSource}
              onSelectSource={openSource}
              chapterFilter={chapterFilter}
              setChapterFilter={setChapterFilter}
              topK={topK}
              setTopK={setTopK}
              onNavigate={onNavigate}
              onRequestClear={() => setClearOpen(true)}
              onClose={() => setMobileContextOpen(false)}
              onUseConcept={(concept) => {
                setInput((current) => (current ? `${current} ${concept}` : `Explain ${concept} in the context of the course.`));
                setMobileContextOpen(false);
                textareaRef.current?.focus();
              }}
            />
          </div>
        </div>
      )}

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Start a new conversation?"
        description="This clears the current tutor session in this browser. Your learning activity remains in Progress."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={clearConversation} leading={<Trash2 className="h-3.5 w-3.5" />}>
              Clear conversation
            </Button>
          </div>
        }
      >
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <MessageSquareText className="h-3.5 w-3.5 text-subtle" />
            {messages.length} messages will be removed.
          </div>
        </div>
      </Modal>
    </div>
  );
};
