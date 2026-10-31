import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Target,
  X,
  XCircle,
} from 'lucide-react';
import type { EvaluationResult, Route } from '../lib/types';
import { gradeSubmission } from '../lib/api';
import { learningStore, useLearning } from '../lib/learningStore';
import { cn, formatRelativeTime, pct } from '../lib/utils';
import { MathRenderer } from './MathRenderer';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { ProgressRing } from './ui/Progress';
import { Skeleton, SkeletonText } from './ui/Skeleton';
import { useToast } from './ui/Toast';

interface GraderViewProps {
  selectedModel: string;
  onNavigate: (route: Route) => void;
}

const PRESETS = [
  {
    id: 'p1',
    short: 'Attention variance',
    title: 'Exam Q1 · Scaled Dot-Product Attention Variance & Softmax',
    problem: 'Explain why we divide by sqrt(d_k) in the Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V.',
    rubric: `Total Points: 2.0
Criteria:
1. Explains that the variance of the dot product grows linearly with dimension d_k (Var = d_k), so standard deviation is sqrt(d_k). (1.0 pt)
2. Explains that large dot product values push softmax into saturated regions with vanishing gradients. (1.0 pt)`,
    sampleStudent:
      'Because without dividing, the dot product values get very high, causing the softmax function to saturate where gradients are near zero.',
  },
  {
    id: 'p2',
    short: 'Naive Bayes smoothing',
    title: 'Exam Q2 · Naive Bayes with Bigram LM Sentiment Classification',
    problem:
      'Explain why add-1 (Laplace) smoothing is required when incorporating bigram features into Naive Bayes, and write the formula.',
    rubric: `Total Points: 2.0
Criteria:
1. Explains the zero-frequency problem (unseen bigrams causing zero probability for the whole document). (1.0 pt)
2. States the Laplace smoothing equation: P(w_i | w_{i-1}, c) = (count(w_{i-1}, w_i, c) + 1) / (count(w_{i-1}, c) + |V|). (1.0 pt)`,
    sampleStudent:
      'We need Laplace smoothing because if a bigram was not seen during training, its probability is 0, which makes the whole product 0. The formula is P = (count + 1)/(total + V).',
  },
  {
    id: 'p3',
    short: 'CNF conversion',
    title: 'Exam Q3 · Chomsky Normal Form (CNF) Conversion Rules',
    problem: 'State the required format of production rules in Chomsky Normal Form (CNF) and list the conversion steps from CFG.',
    rubric: `Total Points: 2.0
Criteria:
1. States that CNF rules must strictly be A -> B C (two non-terminals) or A -> a (single terminal). (1.0 pt)
2. Lists key conversion steps: eliminate epsilon productions, eliminate unit productions, and binarize long rules (>2 symbols). (1.0 pt)`,
    sampleStudent: 'CNF rules must have 2 non terminals or 1 terminal symbol. Steps: remove epsilon rules and unit productions.',
  },
];

export const GraderView: React.FC<GraderViewProps> = ({ selectedModel, onNavigate }) => {
  const learning = useLearning();
  const toast = useToast();

  const [presetId, setPresetId] = useState('p1');
  const [problemStatement, setProblemStatement] = useState(PRESETS[0].problem);
  const [markingScheme, setMarkingScheme] = useState(PRESETS[0].rubric);
  const [studentSubmission, setStudentSubmission] = useState(PRESETS[0].sampleStudent);
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rubricOpen, setRubricOpen] = useState(true);

  const activePreset = PRESETS.find((preset) => preset.id === presetId);

  const loadPreset = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setProblemStatement(preset.problem);
    setMarkingScheme(preset.rubric);
    setStudentSubmission(preset.sampleStudent);
    setEvalResult(null);
    setError(null);
  };

  const reset = () => {
    if (activePreset) {
      loadPreset(activePreset.id);
      toast.info('Preset restored', activePreset.short);
    }
  };

  const handleEvaluate = async () => {
    if (!problemStatement.trim() || !markingScheme.trim() || !studentSubmission.trim()) {
      toast.error('Missing fields', 'Provide a problem, marking scheme, and student answer.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await gradeSubmission(problemStatement, markingScheme, studentSubmission, selectedModel);
      setEvalResult(result.evaluation);
      learningStore.recordGradeAttempt({
        title: activePreset?.short || 'Custom submission',
        earned: result.evaluation.earned_score,
        total: result.evaluation.total_score,
      });
      toast.success('Submission evaluated', `${result.evaluation.earned_score}/${result.evaluation.total_score} points awarded`);
    } catch (err: any) {
      setError(err?.message || 'The evaluation request failed.');
      toast.error('Evaluation failed', err?.message || 'Check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const earned = evalResult?.earned_score ?? 0;
  const total = evalResult?.total_score ?? 0;
  const percentage = total > 0 ? (earned / total) * 100 : 0;
  const submissionWords = studentSubmission.trim() ? studentSubmission.trim().split(/\s+/).length : 0;

  const statusCounts = useMemo(() => {
    const counts = { passed: 0, partial: 0, failed: 0 };
    for (const criterion of evalResult?.criteria_breakdown ?? []) {
      const status = criterion.status?.toLowerCase();
      if (status.includes('pass')) counts.passed += 1;
      else if (status.includes('part')) counts.partial += 1;
      else counts.failed += 1;
    }
    return counts;
  }, [evalResult]);

  const statusTone = percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger';

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-caps mb-2">Assessment & grading</p>
          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-ink">Make the grade legible.</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Evaluate a written answer against an explicit marking scheme. Every awarded point is tied to a named criterion and a rationale.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={presetId}
            onChange={(event) => loadPreset(event.target.value)}
            className="focus-ring h-8 max-w-[220px] rounded-lg border border-line bg-surface px-2.5 text-[10.5px] text-muted"
            aria-label="Load preset exam question"
          >
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.short}
              </option>
            ))}
          </select>
          <Button size="sm" variant="ghost" onClick={reset} leading={<RotateCcw className="h-3.5 w-3.5" />}>
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/[0.06] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="text-[12px] font-medium text-ink">Evaluation failed</p>
            <p className="mt-0.5 text-[11px] text-muted">{error}</p>
          </div>
          <Button size="xs" variant="ghost" onClick={() => setError(null)} leading={<X className="h-3 w-3" />}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Context / rubric */}
        <section className="space-y-3 xl:col-span-5">
          <div className="surface-card p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="problem-statement" className="label-caps">
                Problem statement
              </label>
              <span className="font-mono text-[9px] text-subtle">{problemStatement.length} chars</span>
            </div>
            <textarea
              id="problem-statement"
              rows={4}
              value={problemStatement}
              onChange={(event) => setProblemStatement(event.target.value)}
              className="focus-ring mt-2 w-full resize-y rounded-lg border border-line bg-surface2/40 p-3 text-[11.5px] leading-relaxed text-ink placeholder:text-subtle"
              placeholder="Paste the exam question or problem statement…"
            />
          </div>

          <div className="surface-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-3.5 w-3.5 text-warning" />
                <label htmlFor="marking-scheme" className="label-caps">
                  Instructor marking scheme
                </label>
              </div>
              <button
                type="button"
                onClick={() => setRubricOpen((open) => !open)}
                className="focus-ring flex items-center gap-1 text-[9.5px] text-subtle hover:text-muted"
                aria-expanded={rubricOpen}
              >
                {rubricOpen ? 'Collapse' : 'Expand'}
                <ChevronDown className={cn('h-3 w-3 transition-transform', rubricOpen && 'rotate-180')} />
              </button>
            </div>
            {rubricOpen && (
              <textarea
                id="marking-scheme"
                rows={9}
                value={markingScheme}
                onChange={(event) => setMarkingScheme(event.target.value)}
                className="focus-ring mt-2 w-full resize-y rounded-lg border border-line bg-surface2/40 p-3 font-mono text-[10.5px] leading-relaxed text-muted placeholder:text-subtle"
                placeholder="Define criteria, point allocations, and required elements…"
              />
            )}
            <div className="mt-2 flex items-start gap-2 rounded-md border border-line bg-surface2/30 px-2.5 py-2">
              <BookOpen className="mt-0.5 h-3 w-3 shrink-0 text-subtle" />
              <p className="text-[9.5px] leading-relaxed text-subtle">
                The marking scheme is the authoritative reference. A separate reference answer is not stored for these presets.
              </p>
            </div>
          </div>
        </section>

        {/* Submission */}
        <section className="xl:col-span-7">
          <div className="surface-card flex h-full flex-col p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-3.5 w-3.5 text-accent-soft" />
                <label htmlFor="student-submission" className="label-caps">
                  Student submission
                </label>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] text-subtle">
                <span>{submissionWords} words</span>
                <span aria-hidden>·</span>
                <span>theory or code</span>
              </div>
            </div>

            <textarea
              id="student-submission"
              rows={16}
              value={studentSubmission}
              onChange={(event) => setStudentSubmission(event.target.value)}
              className="focus-ring mt-2 min-h-[280px] w-full flex-1 resize-y rounded-lg border border-line bg-surface2/40 p-3.5 text-[12px] leading-[1.75] text-ink placeholder:text-subtle"
              placeholder="Paste the student's derivation, explanation, or code…"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <div className="flex items-center gap-2 text-[9.5px] text-subtle">
                <Target className="h-3 w-3" />
                Evaluated against {markingScheme.split('\n').filter((line) => /^\d+\./.test(line.trim())).length || 'the'} named criteria
              </div>
              <Button variant="primary" onClick={handleEvaluate} loading={loading} leading={!loading ? <Sparkles className="h-3.5 w-3.5" /> : undefined}>
                {loading ? 'Evaluating…' : 'Evaluate submission'}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {loading && (
        <div className="mt-4 grid gap-4 xl:grid-cols-12">
          <div className="surface-card p-5 xl:col-span-5">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              Reading the submission against the marking scheme
            </div>
            <SkeletonText lines={4} className="mt-4" />
            <div className="mt-5 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
          <div className="surface-card p-5 xl:col-span-7">
            <Skeleton className="mb-4 h-3 w-32" />
            <div className="space-y-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className="rounded-lg border border-line p-3">
                  <Skeleton className="mb-2 h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {evalResult && !loading && (
        <div className="mt-4 space-y-4 animate-fade-up">
          <div className="grid gap-4 xl:grid-cols-12">
            {/* Score */}
            <section className="surface-card p-5 xl:col-span-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="label-caps mb-2">Assessment scorecard</p>
                  <p className="text-[11px] text-subtle">{activePreset?.title || 'Custom problem'}</p>
                </div>
                <Badge variant={statusTone as any}>
                  {percentage >= 80 ? 'Exemplary' : percentage >= 50 ? 'Partial credit' : 'Needs revision'}
                </Badge>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <div className={cn(percentage >= 80 ? 'text-success' : percentage >= 50 ? 'text-warning' : 'text-danger')}>
                  <ProgressRing value={percentage} size={92} stroke={5}>
                    <span className="text-base font-semibold">{Math.round(percentage)}%</span>
                  </ProgressRing>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-medium tracking-tight text-ink">{earned}</span>
                    <span className="font-mono text-sm text-subtle">/ {total}</span>
                    <span className="ml-1 text-[10px] text-subtle">points</span>
                  </div>
                  <p className="mt-1 text-[10.5px] text-muted">
                    {statusCounts.passed} passed · {statusCounts.partial} partial · {statusCounts.failed} failed
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-line bg-surface2/40 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
                  <ClipboardCheck className="h-3 w-3 text-subtle" />
                  Actionable feedback
                </p>
                <div className="mt-1.5 text-[11px] leading-relaxed text-muted">
                  <MathRenderer content={evalResult.actionable_feedback} />
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-[9.5px] leading-relaxed text-subtle">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                Model-assisted evaluation. Final grades should be reviewed by the instructor.
              </div>
            </section>

            {/* Criteria */}
            <section className="surface-card p-5 xl:col-span-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-caps mb-1.5">Criterion-by-criterion</p>
                  <h2 className="text-[12px] font-semibold text-ink">Where the points went</h2>
                </div>
                <span className="font-mono text-[10px] text-subtle">{evalResult.criteria_breakdown?.length ?? 0} criteria</span>
              </div>

              <div className="mt-4 space-y-2">
                {evalResult.criteria_breakdown?.map((criterion, index) => {
                  const status = criterion.status?.toLowerCase() || '';
                  const isPass = status.includes('pass');
                  const isPartial = status.includes('part');
                  return (
                    <div
                      key={index}
                      className={cn(
                        'rounded-lg border p-3',
                        isPass ? 'border-success/15 bg-success/[0.025]' : isPartial ? 'border-warning/15 bg-warning/[0.02]' : 'border-danger/15 bg-danger/[0.025]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2">
                          {isPass ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                          ) : isPartial ? (
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                          ) : (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-medium leading-snug text-ink">
                              <MathRenderer content={criterion.criterion} />
                            </div>
                            <div className="mt-1 text-[10.5px] leading-relaxed text-subtle">
                              <MathRenderer content={criterion.comment} />
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px]',
                            isPass
                              ? 'border-success/25 text-success'
                              : isPartial
                                ? 'border-warning/25 text-warning'
                                : 'border-danger/25 text-danger',
                          )}
                        >
                          {criterion.points_awarded}/{criterion.max_points}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="surface-card p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-success">Demonstrated strengths</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {evalResult.strengths?.length ? (
                  evalResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-[11px] leading-relaxed text-muted">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-success/80" />
                      {strength}
                    </li>
                  ))
                ) : (
                  <li className="text-[10.5px] text-subtle">No strengths were listed in this evaluation.</li>
                )}
              </ul>
            </section>

            <section className="surface-card p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-warning">Points for improvement</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {evalResult.weaknesses?.length ? (
                  evalResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-[11px] leading-relaxed text-muted">
                      <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-warning/80" />
                      {weakness}
                    </li>
                  ))
                ) : (
                  <li className="text-[10.5px] text-subtle">No improvement points were listed in this evaluation.</li>
                )}
              </ul>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3">
            <p className="text-[10px] text-subtle">
              Evaluation stored in local history · {learning.gradeAttempts.length} total evaluations
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleEvaluate} leading={<RotateCcw className="h-3.5 w-3.5" />}>
                Re-evaluate
              </Button>
              <Button size="sm" variant="outline" onClick={() => onNavigate('analytics')} trailing={<ArrowRight className="h-3.5 w-3.5" />}>
                View progress
              </Button>
            </div>
          </div>
        </div>
      )}

      {!evalResult && !loading && learning.gradeAttempts.length > 0 && (
        <div className="mt-4 surface-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="label-caps">Recent evaluations</p>
            <span className="font-mono text-[9px] text-subtle">{learning.gradeAttempts.length} evaluations</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {learning.gradeAttempts.slice(0, 6).map((attempt) => {
              const ratio = attempt.total > 0 ? attempt.earned / attempt.total : 0;
              return (
                <div key={attempt.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface2/30 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-ink">{attempt.title}</p>
                    <p className="font-mono text-[9px] text-subtle">{formatRelativeTime(attempt.timestamp)}</p>
                  </div>
                  <Badge variant={ratio >= 0.8 ? 'success' : ratio >= 0.5 ? 'warning' : 'danger'}>
                    {attempt.earned}/{attempt.total}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
