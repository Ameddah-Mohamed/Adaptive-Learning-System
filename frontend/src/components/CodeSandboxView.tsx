import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  FileCode2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  TestTube2,
  X,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CodingTask, Route, SandboxResponse } from '../lib/types';
import { getCodingTasks, runCodeSubmission } from '../lib/api';
import { DEFAULT_TASKS } from '../lib/defaultTasks';
import { learningStore, useLearning } from '../lib/learningStore';
import { cn, copyText, formatRelativeTime } from '../lib/utils';
import { MathRenderer } from './MathRenderer';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

interface CodeSandboxViewProps {
  selectedModel: string;
  activeTaskId?: string;
  onSelectTaskId?: (taskId: string) => void;
  onNavigate: (route: Route) => void;
}

const DRAFT_KEY = 'ensia-code-drafts-v1';

function readDrafts(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDraft(taskId: string, code: string) {
  try {
    const drafts = readDrafts();
    drafts[taskId] = code;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  } catch {
    /* drafts are a convenience, not a requirement */
  }
}

function shortTaskTitle(title: string): string {
  return title.replace(/^Assignment\s+\d+:\s*/i, '');
}

export const CodeSandboxView: React.FC<CodeSandboxViewProps> = ({
  selectedModel,
  activeTaskId,
  onSelectTaskId,
  onNavigate,
}) => {
  const learning = useLearning();
  const toast = useToast();

  const [tasks, setTasks] = useState<CodingTask[]>(DEFAULT_TASKS);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(activeTaskId || 'task_02_attention');
  const [code, setCode] = useState(() => {
    const initialId = activeTaskId || 'task_02_attention';
    const initialTask = DEFAULT_TASKS.find((t) => t.id === initialId) || DEFAULT_TASKS[0];
    return readDrafts()[initialId] ?? initialTask.starter_code;
  });
  const [running, setRunning] = useState(false);
  const [execResult, setExecResult] = useState<SandboxResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState<'console' | 'diagnosis' | 'history'>('console');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const handleRunRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (activeTaskId && activeTaskId !== selectedTaskId) {
      setSelectedTaskId(activeTaskId);
      const target = tasks.find((t) => t.id === activeTaskId);
      if (target) {
        setCode(readDrafts()[target.id] ?? target.starter_code);
        setExecResult(null);
        setRunError(null);
      }
    }
  }, [activeTaskId, selectedTaskId, tasks]);

  useEffect(() => {
    let cancelled = false;
    getCodingTasks()
      .then((data) => {
        if (cancelled || !data || data.length === 0) return;
        setTasks(data);
        const current = data.find((task) => task.id === selectedTaskId) || data[0];
        if (current) {
          setSelectedTaskId(current.id);
          setCode(readDrafts()[current.id] ?? current.starter_code);
        }
        setTasksError(null);
      })
      .catch((error: any) => {
        if (cancelled) return;
        // Non-blocking fallback: preloaded tasks are already in state.
        setTasksError(error?.message || 'Local backend offline. Using preloaded assignment specs.');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTaskId || !code) return;
    writeDraft(selectedTaskId, code);
  }, [selectedTaskId, code]);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
      return;
    }
    const started = Date.now();
    timerRef.current = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 100);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running]);

  const currentTask = tasks.find((task) => task.id === selectedTaskId) || tasks[0];

  const latestByTask = useMemo(() => {
    const map = new Map<string, { success: boolean; passed: number; total: number }>();
    for (const attempt of learning.codeAttempts) {
      if (!map.has(attempt.taskId)) map.set(attempt.taskId, attempt);
    }
    return map;
  }, [learning.codeAttempts]);

  const handleTaskChange = (task: CodingTask) => {
    setSelectedTaskId(task.id);
    onSelectTaskId?.(task.id);
    setExecResult(null);
    setRunError(null);
    setCode(readDrafts()[task.id] ?? task.starter_code);
    setConsoleTab('console');
  };

  const handleReset = () => {
    if (!currentTask) return;
    setCode(currentTask.starter_code);
    setExecResult(null);
    setRunError(null);
    setResetOpen(false);
    writeDraft(currentTask.id, currentTask.starter_code);
    toast.info('Starter code restored', shortTaskTitle(currentTask.title));
  };

  const handleRun = async () => {
    if (!currentTask || running) return;
    setRunning(true);
    setExecResult(null);
    setRunError(null);
    setConsoleTab('console');
    try {
      const result = await runCodeSubmission(currentTask.id, code, selectedModel);
      setExecResult(result);
      learningStore.recordCodeAttempt({
        taskId: currentTask.id,
        taskTitle: shortTaskTitle(currentTask.title),
        passed: result.execution.passed,
        total: result.execution.total,
        success: result.execution.success,
      });
      if (result.execution.success && result.execution.passed === result.execution.total) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 }, colors: ['#7b78ff', '#7dd3fc', '#4ade80'] });
        toast.success('All tests passed', `${result.execution.passed}/${result.execution.total} assertions · ${result.execution.elapsed_seconds}s`);
      } else {
        toast.info('Tests completed with failures', 'Review console output and AI diagnosis.');
        if (result.ai_diagnosis) {
          setConsoleTab('diagnosis');
        }
      }
    } catch (error: any) {
      setRunError(error?.message || 'Execution failed. Ensure the FastAPI backend is running.');
      toast.error('Execution failed', error?.message || 'Check the backend connection.');
    } finally {
      setRunning(false);
    }
  };

  handleRunRef.current = handleRun;

  const execution = execResult?.execution;
  const testPct = execution && execution.total > 0 ? (execution.passed / execution.total) * 100 : 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-52px)] w-full max-w-[1600px] flex-col p-3 sm:p-4 lg:p-5">
      {/* Top Header */}
      <div className="mb-3 flex shrink-0 flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="label-caps">Coding lab</span>
            <span className="h-1 w-1 rounded-full bg-subtle/60" />
            <span className="font-mono text-[10px] text-subtle">Python 3 · Isolated subprocess · 6s timeout</span>
          </div>
          <h1 className="text-[19px] font-semibold tracking-[-0.03em] text-ink sm:text-[21px]">
            {currentTask ? shortTaskTitle(currentTask.title) : 'Interactive Python Lab'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('library')} trailing={<ChevronRight className="h-3.5 w-3.5" />}>
            Course library
          </Button>
        </div>
      </div>

      {tasksError && (
        <div className="mb-3 flex shrink-0 items-start gap-2.5 rounded-lg border border-warning/20 bg-warning/[0.05] px-3.5 py-2 text-[11px] text-muted">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span>Local backend server is currently offline. Viewing preloaded course assignments. Start FastAPI to run test suites.</span>
        </div>
      )}

      {/* 2-Column Responsive Workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Left Column: Assignment Selection & Problem Specs (5 cols) */}
        <section className="flex min-h-0 flex-col gap-3 lg:col-span-5">
          {/* Assignment Switcher */}
          <div className="surface-card shrink-0 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="label-caps">Assignments</span>
              <span className="font-mono text-[9px] text-subtle">{tasks.length} available</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
              {tasks.map((task) => {
                const active = task.id === selectedTaskId;
                const latest = latestByTask.get(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleTaskChange(task)}
                    className={cn(
                      'focus-ring flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                      active
                        ? 'border-accent/40 bg-accent/[0.08]'
                        : 'border-line/70 bg-surface2/30 hover:border-line hover:bg-surface2/60',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px]',
                          latest?.success
                            ? 'border-success/30 bg-success/10 text-success'
                            : active
                              ? 'border-accent/30 bg-accent/15 text-accent-soft'
                              : 'border-line bg-surface text-subtle',
                        )}
                      >
                        {latest?.success ? <Check className="h-3 w-3" /> : <FileCode2 className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0">
                        <p className={cn('truncate text-[11px] font-medium leading-tight', active ? 'text-ink' : 'text-muted')}>
                          {shortTaskTitle(task.title)}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[9px] text-subtle">{task.chapter}</p>
                      </div>
                    </div>
                    <Badge variant={task.difficulty === 'Beginner' ? 'success' : task.difficulty === 'Advanced' ? 'accent' : 'warning'}>
                      {task.difficulty}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Specification & Instructions (Scrollable) */}
          {currentTask && (
            <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex h-10 shrink-0 items-center justify-between border-b border-line px-3.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-accent-soft" />
                  <span className="text-[11px] font-semibold text-ink">Specification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="cyan" dot>Python / PyTorch</Badge>
                  {latestByTask.get(currentTask.id) && (
                    <Badge variant={latestByTask.get(currentTask.id)?.success ? 'success' : 'danger'}>
                      {latestByTask.get(currentTask.id)?.passed}/{latestByTask.get(currentTask.id)?.total} passed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[12px] leading-relaxed text-muted">
                <MathRenderer content={currentTask.description} />
              </div>

              <div className="flex shrink-0 items-center justify-between border-t border-line bg-surface2/25 px-3.5 py-2.5">
                <span className="font-mono text-[9.5px] text-subtle">Restore assignment boilerplate</span>
                <Button size="xs" variant="outline" onClick={() => setResetOpen(true)} leading={<RotateCcw className="h-3 w-3" />}>
                  Reset code
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Code Editor + Workbench (7 cols) */}
        <section className="flex min-h-0 flex-col gap-3 lg:col-span-7">
          <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-line bg-[#101015] px-3.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34343d]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34343d]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34343d]" />
                </div>
                <span className="font-mono text-[11px] font-medium text-ink">solution.py</span>
                <span className="flex items-center gap-1 font-mono text-[9.5px] text-subtle">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                  draft saved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="ghost" onClick={() => setResetOpen(true)} leading={<RotateCcw className="h-3 w-3" />}>
                  Reset
                </Button>
                <Button size="xs" variant="primary" onClick={handleRun} loading={running} leading={!running ? <Play className="h-3 w-3" /> : undefined}>
                  {running ? `Running ${elapsed.toFixed(1)}s` : 'Run & test (⌘↵)'}
                </Button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="min-h-0 flex-1 bg-[#0b0b0f]">
              <Editor
                height="100%"
                language="python"
                theme="ensia-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme('ensia-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                      { token: 'comment', foreground: '5f6072', fontStyle: 'italic' },
                      { token: 'keyword', foreground: '9a97ff' },
                      { token: 'string', foreground: '9ecfa0' },
                      { token: 'number', foreground: 'e3b07a' },
                      { token: 'type', foreground: '7dd3fc' },
                      { token: 'function', foreground: '7dd3fc' },
                    ],
                    colors: {
                      'editor.background': '#0b0b0f',
                      'editor.foreground': '#c9c9d4',
                      'editorLineNumber.foreground': '#3f3f4b',
                      'editorLineNumber.activeForeground': '#8b8b99',
                      'editor.lineHighlightBackground': '#111117',
                      'editor.selectionBackground': '#2a2850',
                      'editorCursor.foreground': '#7b78ff',
                      'editorIndentGuide.background1': '#1b1b23',
                      'editorIndentGuide.activeBackground1': '#2d2d38',
                      'editorWidget.background': '#141419',
                      'editorSuggestWidget.background': '#141419',
                      'editorSuggestWidget.border': '#30303a',
                    },
                  });
                }}
                onMount={(editor, monaco) => {
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                    handleRunRef.current();
                  });
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
                    window.dispatchEvent(
                      new KeyboardEvent('keydown', {
                        key: 'b',
                        code: 'KeyB',
                        ctrlKey: true,
                        metaKey: true,
                        bubbles: true,
                      }),
                    );
                  });
                }}
                options={{
                  fontSize: 12.5,
                  lineHeight: 21,
                  fontFamily: 'Geist Mono, JetBrains Mono, monospace',
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  renderLineHighlight: 'all',
                  padding: { top: 12, bottom: 12 },
                  tabSize: 4,
                  wordWrap: 'on',
                  automaticLayout: true,
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                  guides: { bracketPairs: true, indentation: true },
                }}
              />
            </div>

            {/* Workbench Console Drawer with Tabs */}
            <div className="flex h-[230px] shrink-0 flex-col border-t border-line bg-[#0c0c10]">
              <div className="flex h-9 shrink-0 items-center justify-between border-b border-line bg-[#101015] px-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setConsoleTab('console')}
                    className={cn(
                      'focus-ring flex h-6 items-center gap-1.5 rounded-md px-2 text-[10.5px] font-medium transition-colors',
                      consoleTab === 'console' ? 'bg-white/[0.08] text-ink' : 'text-subtle hover:text-muted',
                    )}
                  >
                    <Terminal className="h-3 w-3" />
                    <span>Test console</span>
                    {execution && (
                      <span className={cn('rounded px-1 font-mono text-[8.5px]', execution.success ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger')}>
                        {execution.passed}/{execution.total}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleTab('diagnosis')}
                    className={cn(
                      'focus-ring flex h-6 items-center gap-1.5 rounded-md px-2 text-[10.5px] font-medium transition-colors',
                      consoleTab === 'diagnosis' ? 'bg-white/[0.08] text-ink' : 'text-subtle hover:text-muted',
                    )}
                  >
                    <Sparkles className="h-3 w-3 text-accent-soft" />
                    <span>AI diagnosis</span>
                    {execResult?.ai_diagnosis && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleTab('history')}
                    className={cn(
                      'focus-ring flex h-6 items-center gap-1.5 rounded-md px-2 text-[10.5px] font-medium transition-colors',
                      consoleTab === 'history' ? 'bg-white/[0.08] text-ink' : 'text-subtle hover:text-muted',
                    )}
                  >
                    <Clock3 className="h-3 w-3" />
                    <span>History</span>
                    {learning.codeAttempts.length > 0 && (
                      <span className="rounded bg-white/[0.06] px-1 font-mono text-[8.5px] text-subtle">
                        {learning.codeAttempts.length}
                      </span>
                    )}
                  </button>
                </div>

                {execution && consoleTab === 'console' && (
                  <div className="flex items-center gap-2 text-[9px] text-subtle">
                    <span className="font-mono">{execution.elapsed_seconds}s</span>
                    <span aria-hidden>·</span>
                    <span className="font-mono">exit {execution.returncode}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyText(execution.output || '');
                        toast.push(ok ? 'success' : 'error', ok ? 'Output copied' : 'Could not copy output');
                      }}
                      className="focus-ring flex h-5 w-5 items-center justify-center rounded text-subtle hover:text-ink"
                      aria-label="Copy output"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tab Content */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
                {consoleTab === 'console' && (
                  <>
                    {running ? (
                      <div className="space-y-2 py-2">
                        <div className="flex items-center gap-2 text-muted">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                          Running submission in isolated subprocess…
                        </div>
                        <p className="text-subtle">$ python3 -m unittest · timeout 6.0s</p>
                        <div className="flex items-center gap-1.5 text-subtle">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                          {elapsed.toFixed(1)}s elapsed
                        </div>
                      </div>
                    ) : runError ? (
                      <div className="flex items-start gap-2 text-danger">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="text-muted">{runError}</span>
                      </div>
                    ) : execution ? (
                      <div>
                        <div className={cn('mb-2 flex items-center gap-1.5 font-medium', execution.success ? 'text-success' : 'text-danger')}>
                          {execution.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {execution.success ? 'All assertions passed' : 'Assertions failed'}
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className={cn('h-full rounded-full', execution.success ? 'bg-success' : 'bg-danger')} style={{ width: `${testPct}%` }} />
                          </div>
                          <span className="text-[9px] text-subtle">{execution.passed} of {execution.total} tests</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-[#9a9aac]">{execution.output || 'No stdout/stderr was produced.'}</pre>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1.5 py-4 text-center">
                        <TestTube2 className="h-4 w-4 text-subtle/70" />
                        <p className="text-[10px] text-subtle">Click "Run & test" or press ⌘↵ to test your implementation.</p>
                        <p className="text-[9px] text-subtle/70">Subprocess evaluates against hidden test assertions with a 6-second timeout.</p>
                      </div>
                    )}
                  </>
                )}

                {consoleTab === 'diagnosis' && (
                  <div className="font-sans">
                    {execResult?.ai_diagnosis ? (
                      <MathRenderer content={execResult.ai_diagnosis} className="prose-ensia text-[12px]" />
                    ) : execResult?.execution.success ? (
                      <div className="rounded-lg border border-success/20 bg-success/[0.05] p-3 text-[11px] text-success">
                        <div className="flex items-center gap-2 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Implementation verified
                        </div>
                        <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                          All test assertions passed cleanly! The diagnostic engine only triggers when tests fail or throw a runtime error.
                        </p>
                      </div>
                    ) : execResult ? (
                      <p className="text-[11px] text-subtle">Tests failed, but no model diagnosis was generated. Review the console traceback.</p>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1.5 py-4 text-center">
                        <Sparkles className="h-4 w-4 text-accent-soft" />
                        <p className="text-[11px] text-muted">AI diagnosis will appear here automatically if a test fails.</p>
                        <p className="text-[10px] text-subtle">The local model analyzes your traceback and suggests targeted mathematical or code fixes.</p>
                      </div>
                    )}
                  </div>
                )}

                {consoleTab === 'history' && (
                  <div>
                    {learning.codeAttempts.length === 0 ? (
                      <p className="py-4 text-center text-[10.5px] text-subtle">No test runs recorded in this browser session yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {learning.codeAttempts.slice(0, 8).map((attempt) => (
                          <div key={attempt.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-white/[0.025]">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded', attempt.success ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>
                                {attempt.success ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                              </span>
                              <span className="truncate text-[10.5px] text-muted">{attempt.taskTitle}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 font-mono text-[9px] text-subtle">
                              <span>{attempt.passed}/{attempt.total} tests</span>
                              <span>·</span>
                              <span>{formatRelativeTime(attempt.timestamp)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset to starter code?"
        description="Your current edits for this assignment will be discarded. Other assignments are unaffected."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleReset} leading={<RotateCcw className="h-3.5 w-3.5" />}>
              Reset code
            </Button>
          </div>
        }
      >
        <div className="px-5 py-4 text-[11px] text-muted">
          {currentTask ? shortTaskTitle(currentTask.title) : 'No assignment selected'}
        </div>
      </Modal>
    </div>
  );
};
