import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ChartNoAxesCombined,
  Code2,
  Download,
  FlaskConical,
  Flame,
  MessageSquareText,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import type { CodeAttempt, GradeAttempt, LearningEvent, QuizAttempt, Route } from '../lib/types';
import { CHAPTERS, getChapterByPracticeTopic } from '../lib/curriculum';
import { useLearning } from '../lib/learningStore';
import { cn, dayKey, formatRelativeTime, pct, startOfDay } from '../lib/utils';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { ProgressBar } from './ui/Progress';
import { useToast } from './ui/Toast';

interface AnalyticsViewProps {
  onNavigate: (route: Route) => void;
  onPracticeTopic: (topic: string) => void;
}

interface SampleData {
  events: LearningEvent[];
  quizAttempts: QuizAttempt[];
  codeAttempts: CodeAttempt[];
  gradeAttempts: GradeAttempt[];
  exploredChapters: number[];
}

function buildSampleData(): SampleData {
  const now = Date.now();
  const days = [4, 2, 5, 1, 3, 0, 6, 3, 2, 4, 5, 2, 3, 4];
  const kinds: LearningEvent['kind'][] = ['tutor', 'quiz', 'code', 'search', 'grade'];
  const events: LearningEvent[] = [];
  days.forEach((count, index) => {
    for (let item = 0; item < count; item += 1) {
      const kind = kinds[(index + item) % kinds.length];
      events.push({
        id: `sample-${index}-${item}`,
        kind,
        title:
          kind === 'tutor'
            ? 'Derivation of attention scaling'
            : kind === 'quiz'
              ? 'Practice · transformer attention'
              : kind === 'code'
                ? 'Attention assignment test run'
                : kind === 'grade'
                  ? 'Rubric evaluation · attention variance'
                  : 'Search · CKY parse table',
        detail: kind === 'quiz' ? '3/4 correct' : kind === 'code' ? '4/4 tests' : undefined,
        timestamp: now - index * 86_400_000 - item * 5_400_000,
        chapter: kind === 'tutor' ? 9 : null,
      });
    }
  });

  const quizTopics = [
    'Self-Attention and Multi-Head Attention',
    'Language Modeling and Perplexity',
    'Chomsky Normal Form and CKY Parsing',
    'Naive Bayes with Laplace Smoothing',
    'Self-Attention and Multi-Head Attention',
    'Vector Semantics and Cosine Similarity',
    'Self-Attention and Multi-Head Attention',
    'Language Modeling and Perplexity',
    'Chomsky Normal Form and CKY Parsing',
    'Recurrent Neural Networks and LSTMs',
    'Byte-Pair Encoding (BPE) & Edit Distance',
  ];
  const scores = [1, 1, 0.5, 1, 1, 0, 1, 0.5, 1, 0.5, 1];
  const quizAttempts: QuizAttempt[] = quizTopics.map((topic, index) => ({
    id: `sample-quiz-${index}`,
    topic,
    difficulty: index % 3 === 0 ? 'advanced' : index % 2 === 0 ? 'beginner' : 'intermediate',
    format: index % 4 === 0 ? 'calculation' : 'mcq',
    correct: scores[index] === 1,
    score: scores[index],
    timestamp: now - index * 16 * 3_600_000,
  }));

  const codeAttempts: CodeAttempt[] = [
    { id: 'sample-code-1', taskId: 'task_02_attention', taskTitle: 'Scaled Dot-Product Attention (PyTorch)', passed: 4, total: 4, success: true, timestamp: now - 2 * 86_400_000 },
    { id: 'sample-code-2', taskId: 'task_03_perplexity', taskTitle: 'Language Model Perplexity Calculator', passed: 3, total: 3, success: true, timestamp: now - 4 * 86_400_000 },
    { id: 'sample-code-3', taskId: 'task_01_bpe', taskTitle: 'Byte-Pair Encoding (BPE) Tokenizer', passed: 3, total: 4, success: false, timestamp: now - 6 * 86_400_000 },
    { id: 'sample-code-4', taskId: 'task_01_bpe', taskTitle: 'Byte-Pair Encoding (BPE) Tokenizer', passed: 4, total: 4, success: true, timestamp: now - 5 * 86_400_000 },
  ];

  const gradeAttempts: GradeAttempt[] = [
    { id: 'sample-grade-1', title: 'Attention variance', earned: 1.5, total: 2, timestamp: now - 1 * 86_400_000 },
    { id: 'sample-grade-2', title: 'Naive Bayes smoothing', earned: 2, total: 2, timestamp: now - 3 * 86_400_000 },
    { id: 'sample-grade-3', title: 'CNF conversion', earned: 1, total: 2, timestamp: now - 7 * 86_400_000 },
  ];

  return { events, quizAttempts, codeAttempts, gradeAttempts, exploredChapters: [1, 2, 3, 6, 9, 18] };
}

const ACTIVITY_LABEL: Record<string, string> = {
  tutor: 'Tutor session',
  quiz: 'Practice attempt',
  code: 'Coding run',
  grade: 'Evaluation',
  search: 'Knowledge search',
  library: 'Library visit',
  bookmark: 'Bookmark',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate, onPracticeTopic }) => {
  const learning = useLearning();
  const toast = useToast();
  const [sampleMode, setSampleMode] = useState(false);
  const sample = useMemo(() => buildSampleData(), []);
  const data = sampleMode ? sample : learning;

  const totals = useMemo(() => {
    const attempts = data.quizAttempts;
    const score = attempts.reduce((sum, attempt) => sum + (attempt.score ?? (attempt.correct ? 1 : 0)), 0);
    const codeTotal = data.codeAttempts.reduce((sum, attempt) => sum + attempt.total, 0);
    const codePassed = data.codeAttempts.reduce((sum, attempt) => sum + attempt.passed, 0);
    const gradeRatio = data.gradeAttempts.length
      ? data.gradeAttempts.reduce((sum, attempt) => sum + (attempt.total ? attempt.earned / attempt.total : 0), 0) / data.gradeAttempts.length
      : null;
    return {
      accuracy: attempts.length ? (score / attempts.length) * 100 : null,
      attempts: attempts.length,
      codeTotal,
      codePassed,
      codeRate: codeTotal ? (codePassed / codeTotal) * 100 : null,
      gradeRatio: gradeRatio != null ? gradeRatio * 100 : null,
      evaluations: data.gradeAttempts.length,
    };
  }, [data]);

  const chart = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 14 }).map((_, index) => {
      const date = new Date(startOfDay(now) - (13 - index) * 86_400_000);
      const key = dayKey(date.getTime());
      const count = data.events.filter((event) => dayKey(event.timestamp) === key).length;
      return {
        key,
        count,
        label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1),
        dateLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        isToday: index === 13,
      };
    });
  }, [data.events]);

  const chartMax = Math.max(1, ...chart.map((day) => day.count));
  const chartTotal = chart.reduce((sum, day) => sum + day.count, 0);

  const mastery = useMemo(() => {
    const grouped = new Map<string, { attempts: number; score: number; correct: number }>();
    for (const attempt of data.quizAttempts) {
      const entry = grouped.get(attempt.topic) ?? { attempts: 0, score: 0, correct: 0 };
      entry.attempts += 1;
      entry.score += attempt.score ?? (attempt.correct ? 1 : 0);
      if (attempt.correct) entry.correct += 1;
      grouped.set(attempt.topic, entry);
    }
    return Array.from(grouped.entries())
      .map(([topic, value]) => ({ topic, ...value, percentage: (value.score / value.attempts) * 100 }))
      .sort((a, b) => b.attempts - a.attempts);
  }, [data.quizAttempts]);

  const difficulties = useMemo(() => {
    return (['beginner', 'intermediate', 'advanced'] as const).map((level) => {
      const attempts = data.quizAttempts.filter((attempt) => attempt.difficulty === level);
      const score = attempts.reduce((sum, attempt) => sum + (attempt.score ?? (attempt.correct ? 1 : 0)), 0);
      return { level, attempts: attempts.length, accuracy: attempts.length ? (score / attempts.length) * 100 : null };
    });
  }, [data.quizAttempts]);

  const codeProgress = useMemo(() => {
    const grouped = new Map<string, { title: string; latest: CodeAttempt; best: CodeAttempt }>();
    for (const attempt of data.codeAttempts) {
      const existing = grouped.get(attempt.taskId);
      if (!existing) {
        grouped.set(attempt.taskId, { title: attempt.taskTitle, latest: attempt, best: attempt });
      } else {
        if (attempt.passed > existing.best.passed) existing.best = attempt;
      }
    }
    return Array.from(grouped.values()).sort((a, b) => Number(a.latest.success) - Number(b.latest.success));
  }, [data.codeAttempts]);

  const improvement = useMemo(() => {
    const weakTopics = mastery.filter((item) => item.percentage < 70).slice(0, 3);
    const weakCode = codeProgress.filter((item) => !item.latest.success).slice(0, 2);
    return { weakTopics, weakCode };
  }, [mastery, codeProgress]);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'Local learning data from the ENSIA NLP Learning Studio. No server data is included.',
      learning,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nlp-learning-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Learning data exported', 'A JSON snapshot was downloaded.');
  };

  const hasAnyData = learning.quizAttempts.length + learning.codeAttempts.length + learning.gradeAttempts.length + learning.events.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-caps mb-2">Progress & analytics</p>
          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-ink">Evidence, not guesswork.</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Every number here comes from actions you take in this browser. Nothing is inferred from a profile, and no instructor grade is predicted.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5">
            <span className="text-[10px] text-muted">Sample preview</span>
            <button
              type="button"
              role="switch"
              aria-checked={sampleMode}
              onClick={() => setSampleMode((value) => !value)}
              className={cn(
                'focus-ring relative h-4 w-7 rounded-full border transition-colors',
                sampleMode ? 'border-accent/40 bg-accent/70' : 'border-line-strong bg-surface3',
              )}
              aria-label="Preview charts with sample data"
            >
              <span
                className={cn(
                  'absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform',
                  sampleMode ? 'translate-x-[13px]' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>
          <Button size="sm" variant="outline" onClick={exportData} leading={<Download className="h-3.5 w-3.5" />} disabled={!hasAnyData}>
            Export
          </Button>
        </div>
      </div>

      {sampleMode && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning/[0.05] px-3.5 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <p className="text-[11px] leading-relaxed text-muted">
            <span className="font-medium text-warning">Sample data preview.</span> These charts are illustrative, not your results. Turn the switch off to return to your local learning data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Practice accuracy</p>
            <Target className="h-3.5 w-3.5 text-subtle" />
          </div>
          <p className={cn('mt-2 font-mono text-xl font-medium', totals.accuracy == null ? 'text-subtle' : totals.accuracy >= 70 ? 'text-success' : totals.accuracy >= 50 ? 'text-warning' : 'text-danger')}>
            {totals.accuracy == null ? '—' : pct(totals.accuracy)}
          </p>
          <p className="mt-1 text-[9.5px] text-subtle">
            {totals.attempts ? `${totals.attempts} attempt${totals.attempts === 1 ? '' : 's'}${sampleMode ? ' · sample' : ''}` : 'No practice yet'}
          </p>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Questions</p>
            <FlaskConical className="h-3.5 w-3.5 text-subtle" />
          </div>
          <p className="mt-2 font-mono text-xl font-medium text-ink">{totals.attempts || '—'}</p>
          <p className="mt-1 text-[9.5px] text-subtle">
            {data.quizAttempts.filter((attempt) => attempt.selfReported).length > 0
              ? `${data.quizAttempts.filter((attempt) => attempt.selfReported).length} self-assessed`
              : 'MCQ and self-assessed'}
          </p>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Coding tests</p>
            <Code2 className="h-3.5 w-3.5 text-subtle" />
          </div>
          <p className={cn('mt-2 font-mono text-xl font-medium', totals.codeRate == null ? 'text-subtle' : totals.codeRate >= 75 ? 'text-success' : 'text-warning')}>
            {totals.codeRate == null ? '—' : pct(totals.codeRate)}
          </p>
          <p className="mt-1 text-[9.5px] text-subtle">
            {totals.codeTotal ? `${totals.codePassed}/${totals.codeTotal} assertions across ${data.codeAttempts.length} runs` : 'No code runs yet'}
          </p>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[9.5px] uppercase tracking-wider text-subtle">Evaluation average</p>
            <Award className="h-3.5 w-3.5 text-subtle" />
          </div>
          <p className={cn('mt-2 font-mono text-xl font-medium', totals.gradeRatio == null ? 'text-subtle' : totals.gradeRatio >= 70 ? 'text-success' : totals.gradeRatio >= 50 ? 'text-warning' : 'text-danger')}>
            {totals.gradeRatio == null ? '—' : pct(totals.gradeRatio)}
          </p>
          <p className="mt-1 text-[9.5px] text-subtle">
            {totals.evaluations ? `${totals.evaluations} evaluation${totals.evaluations === 1 ? '' : 's'}` : 'No evaluations yet'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        {/* Activity chart */}
        <section className="surface-card p-5 xl:col-span-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-caps mb-1.5">Learning activity</p>
              <h2 className="text-[13px] font-semibold text-ink">Last 14 days</h2>
            </div>
            <div className="flex items-center gap-3 text-[9.5px] text-subtle">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {chartTotal} actions
              </span>
              {sampleMode && <Badge variant="warning">sample</Badge>}
            </div>
          </div>

          <div className="mt-5 flex h-[150px] items-end gap-1.5">
            {chart.map((day) => (
              <div key={day.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="font-mono text-[8px] text-subtle opacity-0 transition-opacity group-hover:opacity-100">{day.count}</span>
                <div
                  className={cn(
                    'w-full rounded-[2px] transition-colors',
                    day.count === 0 ? 'bg-white/[0.045]' : day.isToday ? 'bg-accent' : 'bg-accent/30 group-hover:bg-accent/60',
                  )}
                  style={{ height: `${Math.max(3, (day.count / chartMax) * 112)}px` }}
                  title={`${day.dateLabel} · ${day.count} actions`}
                />
                <span className={cn('font-mono text-[8px]', day.isToday ? 'text-muted' : 'text-subtle')}>{day.label}</span>
              </div>
            ))}
          </div>
          {chartTotal === 0 && !sampleMode && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface2/30 px-3 py-2.5">
              <p className="text-[10.5px] text-subtle">No actions recorded in the last 14 days.</p>
              <Button size="xs" variant="ghost" onClick={() => onNavigate('tutor')} trailing={<ArrowRight className="h-3 w-3" />}>
                Ask the tutor
              </Button>
            </div>
          )}
        </section>

        {/* Difficulty */}
        <section className="surface-card p-5 xl:col-span-4">
          <div className="flex items-center justify-between">
            <p className="label-caps">By difficulty</p>
            <ChartNoAxesCombined className="h-4 w-4 text-subtle" />
          </div>
          <div className="mt-4 space-y-4">
            {difficulties.map((item) => (
              <div key={item.level}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] capitalize text-muted">{item.level}</span>
                  <span className="font-mono text-[9.5px] text-subtle">
                    {item.accuracy == null ? '—' : `${pct(item.accuracy)} · ${item.attempts}`}
                  </span>
                </div>
                <ProgressBar
                  value={item.accuracy ?? 0}
                  size="xs"
                  barClassName={item.accuracy == null ? 'bg-white/10' : item.accuracy >= 70 ? 'bg-success' : item.accuracy >= 50 ? 'bg-warning' : 'bg-danger'}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[9.5px] leading-relaxed text-subtle">
            Accuracy is the mean awarded score per attempt. Self-assessed partial answers count as 0.5.
          </p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        {/* Mastery */}
        <section className="surface-card p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-caps mb-1.5">Performance by topic</p>
              <h2 className="text-[13px] font-semibold text-ink">Where you're strong</h2>
            </div>
            <Badge variant="outline">{mastery.length} topics</Badge>
          </div>
          {mastery.length === 0 ? (
            <EmptyState
              bare
              compact
              icon={<TrendingUp className="h-4 w-4" />}
              title="No topic data yet"
              description="Answer a few practice questions and topic-level performance will appear here."
              action={
                <Button size="xs" variant="outline" onClick={() => onNavigate('quiz')}>
                  Start practice
                </Button>
              }
            />
          ) : (
            <div className="mt-4 space-y-3.5">
              {mastery.slice(0, 6).map((item) => {
                const chapter = getChapterByPracticeTopic(item.topic);
                return (
                  <div key={item.topic}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-[10.5px] text-muted">
                        {item.topic}
                        {chapter?.number != null && <span className="ml-1.5 font-mono text-[8.5px] text-subtle">Ch {String(chapter.number).padStart(2, '0')}</span>}
                      </span>
                      <span className={cn('shrink-0 font-mono text-[10px]', item.percentage >= 70 ? 'text-success' : item.percentage >= 50 ? 'text-warning' : 'text-danger')}>
                        {pct(item.percentage)}
                      </span>
                    </div>
                    <ProgressBar
                      value={item.percentage}
                      size="xs"
                      barClassName={item.percentage >= 70 ? 'bg-success' : item.percentage >= 50 ? 'bg-warning' : 'bg-danger'}
                    />
                    <p className="mt-1 text-[8.5px] text-subtle">{item.attempts} attempt{item.attempts === 1 ? '' : 's'} · {item.correct} fully correct</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Improvement */}
        <section className="surface-card p-5 xl:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-caps mb-1.5">Signal</p>
              <h2 className="text-[13px] font-semibold text-ink">Areas to revisit</h2>
            </div>
            <TrendingDown className="h-4 w-4 text-subtle" />
          </div>

          {mastery.length === 0 && codeProgress.length === 0 ? (
            <EmptyState
              bare
              compact
              icon={<Target className="h-4 w-4" />}
              title="Not enough evidence"
              description="Weak areas are only surfaced after you have attempted practice or submitted code."
            />
          ) : improvement.weakTopics.length === 0 && improvement.weakCode.length === 0 ? (
            <div className="mt-4 rounded-lg border border-success/15 bg-success/[0.03] p-3.5">
              <div className="flex items-center gap-2 text-[10.5px] font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                No areas below the 70% threshold
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-subtle">
                In your current local data, every attempted topic is at or above 70% and every coding task has a passing run.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {improvement.weakTopics.map((item) => (
                <button
                  key={item.topic}
                  type="button"
                  onClick={() => onPracticeTopic(item.topic)}
                  className="focus-ring flex w-full items-center gap-2.5 rounded-lg border border-line bg-surface2/30 px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface2/60"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-warning/20 bg-warning/[0.06] text-warning">
                    <Target className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10.5px] font-medium text-muted">{item.topic}</span>
                    <span className="mt-0.5 block text-[9px] text-subtle">{pct(item.percentage)} across {item.attempts} attempt{item.attempts === 1 ? '' : 's'}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[9px] text-subtle">practice</span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-subtle" />
                </button>
              ))}
              {improvement.weakCode.map((item) => (
                <button
                  key={item.latest.id}
                  type="button"
                  onClick={() => onNavigate('sandbox')}
                  className="focus-ring flex w-full items-center gap-2.5 rounded-lg border border-line bg-surface2/30 px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface2/60"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-danger/20 bg-danger/[0.05] text-danger">
                    <Code2 className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10.5px] font-medium text-muted">{item.title}</span>
                    <span className="mt-0.5 block text-[9px] text-subtle">last run {item.latest.passed}/{item.latest.total} · best {item.best.passed}/{item.best.total}</span>
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-subtle" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        {/* Code progress */}
        <section className="surface-card p-5 xl:col-span-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-caps mb-1.5">Coding lab</p>
              <h2 className="text-[13px] font-semibold text-ink">Assignment status</h2>
            </div>
            <Code2 className="h-4 w-4 text-subtle" />
          </div>
          {codeProgress.length === 0 ? (
            <EmptyState
              bare
              compact
              icon={<Code2 className="h-4 w-4" />}
              title="No coding runs yet"
              description="Open the coding lab and run an assignment to see test progress here."
              action={
                <Button size="xs" variant="outline" onClick={() => onNavigate('sandbox')}>
                  Open coding lab
                </Button>
              }
            />
          ) : (
            <div className="mt-3 space-y-2">
              {codeProgress.map((item) => (
                <div key={item.latest.id} className="rounded-lg border border-line bg-surface2/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[10.5px] font-medium text-muted">{item.title}</span>
                    <Badge variant={item.latest.success ? 'success' : 'danger'}>{item.latest.success ? 'passing' : 'failing'}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar
                      value={item.best.total ? (item.best.passed / item.best.total) * 100 : 0}
                      size="xs"
                      barClassName={item.best.success ? 'bg-success' : 'bg-warning'}
                      className="flex-1"
                    />
                    <span className="font-mono text-[9px] text-subtle">best {item.best.passed}/{item.best.total}</span>
                  </div>
                  <p className="mt-1 text-[8.5px] text-subtle">latest run {formatRelativeTime(item.latest.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Evaluations */}
        <section className="surface-card p-5 xl:col-span-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-caps mb-1.5">Grading</p>
              <h2 className="text-[13px] font-semibold text-ink">Evaluation history</h2>
            </div>
            <Award className="h-4 w-4 text-subtle" />
          </div>
          {data.gradeAttempts.length === 0 ? (
            <EmptyState
              bare
              compact
              icon={<Award className="h-4 w-4" />}
              title="No evaluations yet"
              description="Submit an answer in the grading workspace to record a score here."
              action={
                <Button size="xs" variant="outline" onClick={() => onNavigate('grader')}>
                  Open grading
                </Button>
              }
            />
          ) : (
            <div className="mt-3 space-y-1.5">
              {data.gradeAttempts.slice(0, 6).map((attempt) => {
                const ratio = attempt.total ? (attempt.earned / attempt.total) * 100 : 0;
                return (
                  <div key={attempt.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface2/30 px-3 py-2.5">
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[8.5px]',
                        ratio >= 80
                          ? 'border-success/20 bg-success/[0.05] text-success'
                          : ratio >= 50
                            ? 'border-warning/20 bg-warning/[0.05] text-warning'
                            : 'border-danger/20 bg-danger/[0.05] text-danger',
                      )}
                    >
                      {Math.round(ratio)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[10.5px] text-muted">{attempt.title}</span>
                    <span className="shrink-0 font-mono text-[9.5px] text-subtle">{attempt.earned}/{attempt.total}</span>
                    <span className="shrink-0 font-mono text-[8.5px] text-subtle">{formatRelativeTime(attempt.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* History */}
      <section className="surface-card mt-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="label-caps mb-1.5">Learning history</p>
            <h2 className="text-[13px] font-semibold text-ink">Recent actions</h2>
          </div>
          <span className="font-mono text-[9px] text-subtle">{data.events.length} recorded</span>
        </div>
        {data.events.length === 0 ? (
          <EmptyState
            bare
            compact
            icon={<Activity className="h-4 w-4" />}
            title="Your history is empty"
            description="Tutor questions, searches, practice attempts and code runs are recorded locally as you work."
            action={
              <Button size="xs" variant="outline" onClick={() => onNavigate('tutor')}>
                Ask the tutor
              </Button>
            }
          />
        ) : (
          <div className="mt-3 divide-y divide-line/70">
            {data.events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface2 text-subtle">
                  {event.kind === 'tutor' ? (
                    <MessageSquareText className="h-3 w-3" />
                  ) : event.kind === 'quiz' ? (
                    <Sparkles className="h-3 w-3" />
                  ) : event.kind === 'code' ? (
                    <Code2 className="h-3 w-3" />
                  ) : event.kind === 'grade' ? (
                    <Award className="h-3 w-3" />
                  ) : event.kind === 'search' ? (
                    <BookOpen className="h-3 w-3" />
                  ) : (
                    <Activity className="h-3 w-3" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-medium text-muted">{event.title}</p>
                  <p className="truncate text-[9px] text-subtle">
                    {ACTIVITY_LABEL[event.kind]}
                    {event.detail ? ` · ${event.detail}` : ''}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[8.5px] text-subtle">{formatRelativeTime(event.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[9.5px] text-subtle">
        <Target className="h-3 w-3" />
        All metrics derive from local browser storage. Clearing site data removes this history.
      </p>
    </div>
  );
};
