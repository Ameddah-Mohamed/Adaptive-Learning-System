import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleCheck,
  CircleDashed,
  Cpu,
  Database,
  Download,
  Gauge,
  HardDrive,
  Info,
  Laptop,
  MonitorSmartphone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import type { KnowledgeStats, Route } from '../lib/types';
import { CHAPTERS, TOTAL_CHUNKS, chapterLabel } from '../lib/curriculum';
import { chatStore } from '../lib/chatStore';
import { learningStore, useLearning } from '../lib/learningStore';
import { MODEL_OPTIONS, preferencesStore, usePreferences } from '../lib/preferences';
import { cn } from '../lib/utils';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

interface SettingsViewProps {
  knowledgeStats: KnowledgeStats | null;
  backendStatus: 'checking' | 'online' | 'offline';
  onRetryConnection: () => void | Promise<void>;
  onNavigate: (route: Route) => void;
}

const DRAFT_KEY = 'ensia-code-drafts-v1';

const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="focus-ring flex w-full items-start justify-between gap-4 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-white/[0.02]"
  >
    <span className="min-w-0">
      <span className="block text-[12px] font-medium text-ink">{label}</span>
      {description && <span className="mt-0.5 block text-[10.5px] leading-relaxed text-subtle">{description}</span>}
    </span>
    <span
      className={cn(
        'relative mt-0.5 flex h-[18px] w-[32px] shrink-0 items-center rounded-full border transition-colors',
        checked ? 'border-accent/60 bg-accent/80' : 'border-line-strong bg-surface3',
      )}
      aria-hidden
    >
      <span
        className={cn(
          'absolute h-3 w-3 rounded-full bg-white shadow-sm transition-[left] duration-150',
          checked ? 'left-[15px]' : 'left-[3px]',
        )}
      />
    </span>
  </button>
);

const FieldRow: React.FC<{
  icon?: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ icon, label, description, children }) => (
  <div className="flex flex-col gap-2 border-t border-line py-3.5 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <div className="flex min-w-0 items-start gap-2.5">
      {icon && <span className="mt-0.5 text-subtle">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-[10.5px] leading-relaxed text-subtle">{description}</p>}
      </div>
    </div>
    <div className="shrink-0 sm:min-w-[190px] sm:text-right">{children}</div>
  </div>
);

const selectClass =
  'focus-ring h-8 w-full appearance-none rounded-lg border border-line bg-surface pr-7 pl-2.5 text-[11.5px] text-ink outline-none transition-colors hover:border-line-strong sm:w-auto sm:min-w-[180px]';

export const SettingsView: React.FC<SettingsViewProps> = ({ knowledgeStats, backendStatus, onRetryConnection, onNavigate }) => {
  const preferences = usePreferences();
  const learning = useLearning();
  const toast = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const moduleCount = CHAPTERS.filter((chapter) => chapter.number != null).length;

  const storageBytes = useMemo(() => {
    try {
      return new Blob([JSON.stringify({ learning, preferences })]).size;
    } catch {
      return 0;
    }
  }, [learning, preferences]);

  const storageLabel = storageBytes < 1024 ? `${storageBytes} B` : `${(storageBytes / 1024).toFixed(1)} KB`;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetryConnection();
    } finally {
      setRetrying(false);
    }
  };

  const handleExport = () => {
    const payload = {
      app: 'ENSIA NLP Learning Studio',
      schema: 1,
      exportedAt: new Date().toISOString(),
      learning,
      preferences,
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `ensia-nlp-learning-${stamp}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Learning data exported', 'A JSON snapshot was downloaded to your device.');
    } catch {
      toast.error('Export failed', 'Your browser blocked the download.');
    }
  };

  const handleClear = () => {
    learningStore.clear();
    chatStore.clear();
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* drafts may already be unavailable */
    }
    setConfirmClear(false);
    toast.success('Learning data cleared', 'Activity, attempts, bookmarks, chat history, and code drafts were removed.');
  };

  const handleResetPreferences = () => {
    preferencesStore.reset();
    toast.info('Preferences reset', 'Model, retrieval, and appearance settings were restored to defaults.');
  };

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-caps mb-2">Workspace</p>
          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-ink">Settings</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Tune the tutor, control how the studio looks, and manage the learning data held in this browser.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 px-2 py-1 font-mono" size="md">
          <ShieldCheck className="h-3 w-3" /> Local-first
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="surface-card p-5 lg:col-span-2" aria-labelledby="settings-model">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="label-caps mb-1.5">Inference</p>
              <h2 id="settings-model" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
                <Cpu className="h-4 w-4 text-accent-soft" /> Model & retrieval
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-subtle">
                Applied to new tutor, practice, grading, and coding requests. Existing conversations are not rewritten.
              </p>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
            <div>
              <FieldRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Tutor model" description="Local Ollama model served by FastAPI.">
                <div className="relative">
                  <select
                    value={preferences.model}
                    onChange={(event) => preferencesStore.update({ model: event.target.value })}
                    className={selectClass}
                    aria-label="Tutor model"
                  >
                    {MODEL_OPTIONS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label} — {model.note}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
                </div>
              </FieldRow>

              <FieldRow
                icon={<Zap className="h-3.5 w-3.5" />}
                label="Stream responses"
                description="Use the SSE endpoint so answers appear token by token. Falls back to the non-streaming route."
              >
                <Toggle
                  checked={preferences.streaming}
                  onChange={(streaming) => preferencesStore.update({ streaming })}
                  label={preferences.streaming ? 'Streaming on' : 'Streaming off'}
                />
              </FieldRow>
            </div>

            <div>
              <FieldRow
                icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                label="Retrieval depth"
                description="Number of slide chunks passed to the tutor as context."
              >
                <div className="flex items-center gap-2 sm:justify-end">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={preferences.retrievalDepth}
                    onChange={(event) => preferencesStore.update({ retrievalDepth: Number(event.target.value) })}
                    className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
                    aria-label="Retrieval depth"
                  />
                  <span className="w-14 font-mono text-[10.5px] text-muted">{preferences.retrievalDepth} chunks</span>
                </div>
              </FieldRow>

              <FieldRow
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Default chapter"
                description="Preselect a chapter filter when opening the tutor."
              >
                <div className="relative">
                  <select
                    value={preferences.defaultChapter ?? ''}
                    onChange={(event) =>
                      preferencesStore.update({ defaultChapter: event.target.value ? Number(event.target.value) : null })
                    }
                    className={selectClass}
                    aria-label="Default chapter"
                  >
                    <option value="">All chapters</option>
                    {CHAPTERS.filter((chapter) => chapter.number != null).map((chapter) => (
                      <option key={chapter.slug} value={chapter.number as number}>
                        {chapterLabel(chapter)} · {chapter.shortTitle}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
                </div>
              </FieldRow>
            </div>
          </div>
        </section>

        <section className="surface-card p-5" aria-labelledby="settings-appearance">
          <p className="label-caps mb-1.5">Interface</p>
          <h2 id="settings-appearance" className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
            <MonitorSmartphone className="h-4 w-4 text-accent-soft" /> Appearance
          </h2>

          <FieldRow icon={<Gauge className="h-3.5 w-3.5" />} label="Density" description="Compact mode tightens the base type scale.">
            <div className="inline-flex rounded-lg border border-line bg-surface p-1" role="radiogroup" aria-label="Interface density">
              {(['comfortable', 'compact'] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  role="radio"
                  aria-checked={preferences.density === density}
                  onClick={() => preferencesStore.update({ density })}
                  className={cn(
                    'focus-ring h-6 rounded-md px-2.5 text-[10.5px] font-medium capitalize transition-colors',
                    preferences.density === density ? 'bg-white/[0.08] text-ink' : 'text-subtle hover:text-muted',
                  )}
                >
                  {density}
                </button>
              ))}
            </div>
          </FieldRow>

          <FieldRow
            icon={<Laptop className="h-3.5 w-3.5" />}
            label="Reduce motion"
            description="Disables transitions, confetti bursts, and smooth scrolling."
          >
            <Toggle
              checked={preferences.reduceMotion}
              onChange={(reduceMotion) => preferencesStore.update({ reduceMotion })}
              label={preferences.reduceMotion ? 'Motion reduced' : 'Motion allowed'}
            />
          </FieldRow>

          <p className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-surface2/40 px-2.5 py-2 text-[10px] leading-relaxed text-subtle">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            Your operating system's reduced-motion preference is also respected automatically by the stylesheet.
          </p>
        </section>

        <section className="surface-card p-5" aria-labelledby="settings-runtime">
          <p className="label-caps mb-1.5">Runtime</p>
          <h2 id="settings-runtime" className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
            <Database className="h-4 w-4 text-accent-soft" /> Knowledge & connection
          </h2>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-subtle">FastAPI status</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px]',
                  backendStatus === 'online'
                    ? 'border-success/20 bg-success/[0.07] text-success'
                    : backendStatus === 'checking'
                      ? 'border-warning/20 bg-warning/[0.07] text-warning'
                      : 'border-danger/20 bg-danger/[0.07] text-danger',
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {backendStatus === 'online' ? 'Online' : backendStatus === 'checking' ? 'Checking' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-subtle">Indexed chunks</span>
              <span className="font-mono text-[10.5px] text-muted">{knowledgeStats?.total_chunks ?? TOTAL_CHUNKS}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-subtle">Embedding model</span>
              <span className="max-w-[190px] truncate font-mono text-[10.5px] text-muted">
                {knowledgeStats?.embed_model ?? 'reported by API'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-subtle">Vector dimension</span>
              <span className="font-mono text-[10.5px] text-muted">{knowledgeStats?.vector_dimension ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-subtle">API base</span>
              <span className="font-mono text-[10.5px] text-muted">{import.meta.env.VITE_API_BASE || '/api'}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRetry}
              loading={retrying || backendStatus === 'checking'}
              leading={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Recheck connection
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('knowledge')} trailing={<ArrowRight className="h-3.5 w-3.5" />}>
              Open knowledge base
            </Button>
          </div>

          {backendStatus === 'offline' && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/[0.05] px-2.5 py-2 text-[10px] leading-relaxed text-warning/90">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              Start the FastAPI backend and ensure the ChromaDB index is built. The interface still renders, but tutor, quiz, grading, coding, and search requests will fail.
            </p>
          )}
        </section>

        <section className="surface-card p-5 lg:col-span-2" aria-labelledby="settings-data">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="label-caps mb-1.5">Privacy</p>
              <h2 id="settings-data" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
                <HardDrive className="h-4 w-4 text-accent-soft" /> Learning data
              </h2>
              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-subtle">
                Activity, attempts, bookmarks, and preferences are stored in this browser's local storage. There is no account, cloud sync, or instructor visibility yet.
              </p>
            </div>
            <Badge variant="neutral" className="font-mono">
              {storageLabel} used
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-surface2/40 px-3 py-2.5">
              <p className="text-[9.5px] uppercase tracking-wider text-subtle">Activity events</p>
              <p className="mt-1 font-mono text-sm text-ink">{learning.events.length}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface2/40 px-3 py-2.5">
              <p className="text-[9.5px] uppercase tracking-wider text-subtle">Saved items</p>
              <p className="mt-1 font-mono text-sm text-ink">{learning.bookmarks.length}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface2/40 px-3 py-2.5">
              <p className="text-[9.5px] uppercase tracking-wider text-subtle">Attempts recorded</p>
              <p className="mt-1 font-mono text-sm text-ink">
                {learning.quizAttempts.length + learning.codeAttempts.length + learning.gradeAttempts.length}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleExport} leading={<Download className="h-3.5 w-3.5" />}>
              Export JSON
            </Button>
            <Button size="sm" variant="ghost" onClick={handleResetPreferences} leading={<RotateCcw className="h-3.5 w-3.5" />}>
              Reset preferences
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setConfirmClear(true)}
              leading={<Trash2 className="h-3.5 w-3.5" />}
              className="sm:ml-auto"
            >
              Clear learning data
            </Button>
          </div>

          <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-[10px] leading-relaxed text-subtle">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
            Exporting downloads a JSON snapshot. Clearing removes activity, quiz/code/grade attempts, bookmarks, in-memory chat history, and saved code drafts from this browser. It cannot be undone.
          </p>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4 text-[10.5px] text-subtle">
        <span className="flex items-center gap-1.5">
          <CircleCheck className="h-3 w-3 text-success" />
          Preferences persist automatically
        </span>
        <button
          type="button"
          onClick={() => onNavigate('tutor')}
          className="focus-ring inline-flex items-center gap-1 transition-colors hover:text-muted"
        >
          Back to AI Tutor
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all local learning data?"
        description="This removes activity, attempts, bookmarks, chat history, and saved code drafts from this browser."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleClear} leading={<Trash2 className="h-3.5 w-3.5" />}>
              Clear everything
            </Button>
          </div>
        }
      >
        <div className="px-5 py-4">
          <div className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/[0.05] px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div className="text-[11px] leading-relaxed text-muted">
              <p className="font-medium text-ink">This action cannot be undone.</p>
              <p className="mt-1">
                Export a JSON snapshot first if you want to keep your practice history. Course content, preferences, and backend data are not affected.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
