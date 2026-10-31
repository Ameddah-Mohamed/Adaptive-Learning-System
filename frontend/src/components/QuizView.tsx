import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Eye,
  EyeOff,
  FlaskConical,
  Layers,
  Lightbulb,
  Loader2,
  MessageSquareText,
  PenLine,
  RotateCcw,
  Sigma,
  Sparkles,
  Target,
  X,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { QuizResponse, Route } from '../lib/types';
import { generateQuiz } from '../lib/api';
import { CHAPTERS } from '../lib/curriculum';
import { learningStore, useLearning } from '../lib/learningStore';
import { cn, formatRelativeTime, pct } from '../lib/utils';
import { MathRenderer } from './MathRenderer';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { ProgressBar, ProgressRing } from './ui/Progress';
import { Skeleton } from './ui/Skeleton';
import { useToast } from './ui/Toast';

interface QuizViewProps {
  selectedModel: string;
  initialTopic?: string;
  onNavigate: (route: Route) => void;
}

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', description: 'Definitions and single-step reasoning', tone: 'text-success' },
  { id: 'intermediate', label: 'Intermediate', description: 'Derivations and multi-step work', tone: 'text-warning' },
  { id: 'advanced', label: 'Advanced', description: 'Edge cases and exam-level rigour', tone: 'text-accent-soft' },
] as const;

const FORMATS = [
  { id: 'mcq', label: 'Multiple choice', description: 'Four options, instant feedback', icon: CircleHelp },
  { id: 'calculation', label: 'Calculation', description: 'Quantitative, worked answer', icon: Sigma },
  { id: 'derivation', label: 'Derivation', description: 'Formal proof and reasoning', icon: PenLine },
  { id: 'coding', label: 'Coding', description: 'Implementation and analysis', icon: Code2 },
] as const;

const LOADING_HINTS = [
  'Retrieving relevant lecture slides from the course index…',
  'Calibrating the exercise to the selected difficulty…',
  'Writing the instructor answer and marking rubric…',
];

function getCorrectOption(options: Record<string, string>, solution: string): string | null {
  const trimmed = solution.trim();

  // 1. Explicit pattern matches: "Correct answer: B", "Option C is correct", "Answer is (A)", "**B**", etc.
  const explicitPatterns = [
    /(?:correct\s+(?:answer|option)|answer\s*is|the\s+answer)\s*[:=]?\s*\(?([A-D])\)?\b/i,
    /\boption\s*([A-D])\s*(?:is\s+correct|\b)/i,
    /^\s*\(?([A-D])\)?(?:\.|\:|\s|$)/i,
    /\*\*([A-D])\*\*/i,
    /\b([A-D])\s*is\s+the\s+correct/i,
  ];

  for (const pattern of explicitPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const key = match[1].toUpperCase();
      if (options[key]) return key;
    }
  }

  // 2. Match option text content in solution (requires >=3 alphanumeric chars to avoid spurious matches)
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedSolution = normalize(trimmed);
  if (normalizedSolution) {
    let best: { key: string; length: number } | null = null;
    for (const [key, value] of Object.entries(options)) {
      const normalizedOption = normalize(value);
      if (!normalizedOption || normalizedOption.length < 3) continue;
      if (normalizedSolution.includes(normalizedOption)) {
        if (!best || normalizedOption.length > best.length) {
          best = { key, length: normalizedOption.length };
        }
      }
    }
    if (best) return best.key;
  }

  // 3. Fallback: look for isolated letter [A-D] with strict word boundaries
  const isolatedMatch = trimmed.match(/\b([A-D])\b/);
  if (isolatedMatch && isolatedMatch[1] && options[isolatedMatch[1].toUpperCase()]) {
    return isolatedMatch[1].toUpperCase();
  }

  return null;
}

export const QuizView: React.FC<QuizViewProps> = ({ selectedModel, initialTopic, onNavigate }) => {
  const learning = useLearning();
  const toast = useToast();

  const [topic, setTopic] = useState(initialTopic || 'Self-Attention and Multi-Head Attention');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [format, setFormat] = useState<'mcq' | 'calculation' | 'derivation' | 'coding'>('mcq');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showRubric, setShowRubric] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [selfAssessment, setSelfAssessment] = useState<'correct' | 'partial' | 'missed' | null>(null);
  const [draftAnswer, setDraftAnswer] = useState('');
  const [session, setSession] = useState({ answered: 0, score: 0, correct: 0 });
  const [loadingHint, setLoadingHint] = useState(0);

  useEffect(() => {
    if (initialTopic && initialTopic !== topic) {
      setTopic(initialTopic);
      setQuizData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic]);

  useEffect(() => {
    if (!loading) {
      setLoadingHint(0);
      return;
    }
    const timer = window.setInterval(() => setLoadingHint((hint) => (hint + 1) % LOADING_HINTS.length), 2600);
    return () => window.clearInterval(timer);
  }, [loading]);

  const exercise = quizData?.exercise;
  const options = exercise?.options ?? null;
  const correctKey = useMemo(
    () => (options && exercise ? getCorrectOption(options, exercise.solution) : null),
    [options, exercise],
  );
  const isMcq = Boolean(options && Object.keys(options).length > 0);
  const answered = isMcq ? selectedOption !== null : selfAssessment !== null;

  const overall = useMemo(() => {
    if (learning.quizAttempts.length === 0) return { attempts: 0, accuracy: 0 };
    const score = learning.quizAttempts.reduce((sum, attempt) => sum + (attempt.score ?? (attempt.correct ? 1 : 0)), 0);
    return { attempts: learning.quizAttempts.length, accuracy: (score / learning.quizAttempts.length) * 100 };
  }, [learning.quizAttempts]);

  const topicOptions = useMemo(() => {
    const fromCurriculum = CHAPTERS.filter((chapter) => chapter.number != null).map((chapter) => chapter.practiceTopic);
    return Array.from(new Set([topic, ...fromCurriculum]));
  }, [topic]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setSelfAssessment(null);
    setDraftAnswer('');
    setShowRubric(false);
    setShowSolution(false);
    setQuizData(null);
    try {
      const res = await generateQuiz(topic, difficulty, format, selectedModel);
      if (!res.exercise) throw new Error('The generator returned an empty exercise.');
      setQuizData(res);
      setShowSolution(false);
      if (res.exercise.options && Object.keys(res.exercise.options).length === 0) {
        setShowSolution(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to generate an exercise.');
      toast.error('Exercise generation failed', err?.message || 'Check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const recordAttempt = (correct: boolean, score: number, selfReported = false) => {
    learningStore.recordQuizAttempt({ topic, difficulty, format, correct, score, selfReported });
    setSession((current) => ({
      answered: current.answered + 1,
      score: current.score + score,
      correct: current.correct + (score === 1 ? 1 : 0),
    }));
  };

  const handleOptionSelect = (key: string) => {
    if (selectedOption !== null || !exercise) return;
    setSelectedOption(key);
    setShowSolution(true);
    const correct = correctKey === key;
    if (correct) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.72 }, colors: ['#7b78ff', '#7dd3fc', '#4ade80'] });
    }
    recordAttempt(correct, correct ? 1 : 0);
  };

  const handleSelfAssessment = (value: 'correct' | 'partial' | 'missed') => {
    if (selfAssessment) return;
    setSelfAssessment(value);
    recordAttempt(value === 'correct', value === 'correct' ? 1 : value === 'partial' ? 0.5 : 0, true);
    if (value === 'correct') {
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.72 }, colors: ['#7b78ff', '#7dd3fc', '#4ade80'] });
    }
  };

  const resetSession = () => {
    setQuizData(null);
    setSelectedOption(null);
    setSelfAssessment(null);
    setDraftAnswer('');
    setShowSolution(false);
    setShowRubric(false);
    setSession({ answered: 0, score: 0, correct: 0 });
  };

  const openSetup = () => {
    setQuizData(null);
    setSelectedOption(null);
    setSelfAssessment(null);
    setDraftAnswer('');
    setShowSolution(false);
    setShowRubric(false);
  };

  const sessionAccuracy = session.answered ? (session.score / session.answered) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label-caps mb-2">Practice lab</p>
          <h1 className="text-[25px] font-semibold tracking-[-0.03em] text-ink">Practice deliberately.</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Generate a syllabus-calibrated exercise with a reference answer and marking rubric. MCQ answers are graded instantly; open responses can be self-assessed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session.answered > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-subtle">Session</p>
                <p className="font-mono text-[11px] text-ink">
                  {session.correct}/{session.answered} · {pct(sessionAccuracy)}
                </p>
              </div>
              <button
                type="button"
                onClick={resetSession}
                className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink"
                aria-label="Reset practice session"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => onNavigate('analytics')} trailing={<ChevronRight className="h-3.5 w-3.5" />}>
            Progress
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/[0.06] px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-ink">Could not generate the exercise</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{error}</p>
              </div>
              <Button size="xs" variant="ghost" onClick={() => setError(null)} leading={<X className="h-3 w-3" />}>
                Dismiss
              </Button>
            </div>
          )}

          {loading ? (
            <div className="surface-card p-5 sm:p-6">
              <div className="flex items-center gap-2.5 border-b border-line pb-4">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <div>
                  <p className="text-[12px] font-medium text-ink">Authoring a {format} exercise</p>
                  <p className="mt-0.5 text-[10.5px] text-subtle">{LOADING_HINTS[loadingHint]}</p>
                </div>
              </div>
              <div className="mt-5 space-y-2.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-full" />
              </div>
              <div className="mt-6 space-y-2">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border border-line bg-surface2/40 px-3 py-3">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-subtle">Generation runs on the local model and can take several seconds.</p>
            </div>
          ) : quizData && exercise ? (
            <div className="space-y-4">
              <div className="surface-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={quizData.difficulty === 'beginner' ? 'success' : quizData.difficulty === 'advanced' ? 'accent' : 'warning'}>
                      {quizData.difficulty}
                    </Badge>
                    <Badge variant="neutral">{quizData.question_type}</Badge>
                    {session.answered > 0 && <Badge variant="outline">session {session.answered}</Badge>}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-subtle">
                    <FlaskConical className="h-3 w-3" />
                    <span className="max-w-[260px] truncate">{topic}</span>
                  </div>
                </div>

                <div className="pt-5">
                  <p className="label-caps mb-3">Exercise</p>
                  <MathRenderer content={exercise.question} className="prose-ensia text-[14px]" />
                </div>

                {isMcq && options ? (
                  <div className="mt-6 space-y-2">
                    <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wider text-subtle">Select one answer</p>
                    {Object.entries(options).map(([key, value]) => {
                      const isSelected = selectedOption === key;
                      const isCorrectOption = correctKey === key;
                      const reveal = selectedOption !== null;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleOptionSelect(key)}
                          disabled={reveal}
                          aria-pressed={isSelected}
                          className={cn(
                            'focus-ring flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150',
                            !reveal && 'border-line bg-surface2/40 hover:border-line-strong hover:bg-surface2/70',
                            reveal && isCorrectOption && 'border-success/40 bg-success/[0.07]',
                            reveal && isSelected && !isCorrectOption && 'border-danger/40 bg-danger/[0.06]',
                            reveal && !isSelected && !isCorrectOption && 'border-line bg-surface2/25 opacity-55',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-medium',
                              reveal && isCorrectOption
                                ? 'border-success/40 bg-success/10 text-success'
                                : reveal && isSelected
                                  ? 'border-danger/40 bg-danger/10 text-danger'
                                  : 'border-line bg-surface text-muted',
                            )}
                          >
                            {reveal && isCorrectOption ? <Check className="h-3.5 w-3.5" /> : reveal && isSelected ? <X className="h-3.5 w-3.5" /> : key}
                          </span>
                          <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-ink">
                            <MathRenderer content={value} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface2/40 p-3.5">
                      <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
                      <div>
                        <p className="text-[12px] font-medium text-ink">Open response</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-subtle">
                          Draft your reasoning or derivation below before revealing the instructor's reference solution and marking rubric.
                        </p>
                      </div>
                    </div>
                    {!showSolution ? (
                      <div className="space-y-3">
                        <textarea
                          value={draftAnswer}
                          onChange={(e) => setDraftAnswer(e.target.value)}
                          rows={4}
                          placeholder="Type your notes or worked derivation here before revealing the answer…"
                          className="focus-ring w-full rounded-xl border border-line bg-[#0b0b0f] p-3 text-[12px] font-mono leading-relaxed text-ink placeholder:text-subtle/50"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSolution(true)}
                          leading={<Eye className="h-3.5 w-3.5" />}
                        >
                          Reveal reference solution
                        </Button>
                      </div>
                    ) : draftAnswer.trim() ? (
                      <div className="rounded-xl border border-line bg-[#0b0b0f] p-3.5">
                        <p className="text-[9.5px] uppercase tracking-wider text-subtle">Your drafted response</p>
                        <p className="mt-1.5 whitespace-pre-wrap font-mono text-[11.5px] text-muted">{draftAnswer}</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {isMcq && selectedOption && (
                  <div
                    className={cn(
                      'mt-5 flex items-start gap-3 rounded-xl border px-4 py-3',
                      selectedOption === correctKey
                        ? 'border-success/25 bg-success/[0.06]'
                        : 'border-danger/25 bg-danger/[0.05]',
                    )}
                    role="status"
                  >
                    {selectedOption === correctKey ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                    )}
                    <div>
                      <p className={cn('text-[12px] font-medium', selectedOption === correctKey ? 'text-success' : 'text-danger')}>
                        {selectedOption === correctKey ? 'Correct' : 'Not quite'}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                        {selectedOption === correctKey
                          ? 'The reference explanation below confirms the reasoning.'
                          : `You selected ${selectedOption}. ${correctKey ? `The correct option is ${correctKey}.` : 'Review the reference explanation below.'}`}
                      </p>
                    </div>
                  </div>
                )}

                {!isMcq && showSolution && !selfAssessment && (
                  <div className="mt-4 rounded-xl border border-line bg-surface2/40 p-4">
                    <p className="text-[11px] font-medium text-ink">How did your answer compare?</p>
                    <p className="mt-1 text-[10.5px] text-subtle">This is a self-assessment, not an automated grade.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="success" onClick={() => handleSelfAssessment('correct')} leading={<Check className="h-3.5 w-3.5" />}>
                        Got it right
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSelfAssessment('partial')} leading={<AlertTriangle className="h-3.5 w-3.5" />}>
                        Partially
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleSelfAssessment('missed')} leading={<X className="h-3.5 w-3.5" />}>
                        Missed it
                      </Button>
                    </div>
                  </div>
                )}

                {!isMcq && selfAssessment && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-surface2/40 px-3 py-2 text-[10.5px] text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    Self-assessment recorded as {selfAssessment === 'correct' ? 'correct' : selfAssessment === 'partial' ? 'partial credit' : 'missed'}.
                  </div>
                )}
              </div>

              {(showSolution || answered) && exercise && (
                <div className="surface-card p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-warning" />
                      <h3 className="text-[12px] font-semibold text-ink">Reference solution & explanation</h3>
                    </div>
                    <Badge variant="neutral">model-generated</Badge>
                  </div>

                  <div className="mt-3 rounded-lg border border-line bg-surface2/40 px-3.5 py-3">
                    <p className="text-[9.5px] uppercase tracking-wider text-subtle">Reference answer</p>
                    {format === 'coding' ? (
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-muted">{exercise.solution}</pre>
                    ) : (
                      <div className="mt-1.5 text-[12px] leading-relaxed text-ink">
                        <MathRenderer content={exercise.solution} />
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <MathRenderer content={exercise.explanation} />
                  </div>

                  <div className="mt-4 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => setShowRubric((open) => !open)}
                      className="focus-ring flex items-center gap-1.5 text-[10.5px] text-subtle transition-colors hover:text-muted"
                      aria-expanded={showRubric}
                    >
                      <Award className="h-3 w-3" />
                      {showRubric ? 'Hide marking rubric' : 'View marking rubric'}
                      <ChevronDown className={cn('h-3 w-3 transition-transform', showRubric && 'rotate-180')} />
                    </button>
                    {showRubric && (
                      <div className="mt-3 space-y-1.5">
                        {exercise.marking_rubric && exercise.marking_rubric.length > 0 ? (
                          exercise.marking_rubric.map((item, index) => (
                            <div key={index} className="flex items-start justify-between gap-4 rounded-md border border-line bg-surface2/30 px-2.5 py-2">
                              <span className="text-[10.5px] leading-relaxed text-muted">{item.criterion}</span>
                              <span className="shrink-0 font-mono text-[10px] text-warning">+{item.points}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10.5px] text-subtle">No rubric criteria were returned with this exercise.</p>
                        )}
                        {exercise.total_points != null && (
                          <p className="text-right font-mono text-[9.5px] text-subtle">total {exercise.total_points} points</p>
                        )}
                      </div>
                    )}
                  </div>

                  {quizData.grounding_sources && quizData.grounding_sources.length > 0 && (
                    <div className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[10px] text-subtle">
                      <Layers className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>Grounded in {quizData.grounding_sources.slice(0, 2).join(' · ')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleGenerate} leading={<Sparkles className="h-3.5 w-3.5" />}>
                    Next exercise
                  </Button>
                  <Button variant="ghost" size="sm" onClick={openSetup} leading={<FlaskConical className="h-3.5 w-3.5" />}>
                    Change setup
                  </Button>
                </div>
                {session.answered > 0 && (
                  <span className="font-mono text-[10px] text-subtle">
                    session accuracy {pct(sessionAccuracy)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="surface-card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-ink">Build an exercise</p>
                    <p className="mt-0.5 text-[10.5px] text-subtle">Choose a topic, difficulty, and response format.</p>
                  </div>
                  <FlaskConical className="h-4 w-4 text-subtle" />
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <label htmlFor="practice-topic" className="mb-1.5 block text-[11px] font-medium text-muted">
                      Syllabus topic
                    </label>
                    <div className="relative">
                      <select
                        id="practice-topic"
                        value={topic}
                        onChange={(event) => setTopic(event.target.value)}
                        className="focus-ring h-10 w-full appearance-none rounded-lg border border-line bg-surface2/50 px-3 pr-9 text-[12px] text-ink"
                      >
                        {CHAPTERS.filter((chapter) => chapter.number != null).map((chapter) => (
                          <optgroup key={chapter.slug} label={`Chapter ${String(chapter.number).padStart(2, '0')} · ${chapter.shortTitle}`}>
                            <option value={chapter.practiceTopic}>{chapter.practiceTopic}</option>
                          </optgroup>
                        ))}
                        {!topicOptions.includes(topic) && <option value={topic}>{topic}</option>}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-[11px] font-medium text-muted">Difficulty</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {DIFFICULTIES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDifficulty(item.id)}
                          className={cn(
                            'focus-ring rounded-lg border px-3 py-2.5 text-left transition-colors',
                            difficulty === item.id
                              ? 'border-accent/30 bg-accent/[0.06]'
                              : 'border-line bg-surface2/30 hover:border-line-strong',
                          )}
                        >
                          <span className={cn('flex items-center gap-1.5 text-[11px] font-medium', difficulty === item.id ? 'text-ink' : 'text-muted')}>
                            <span className={cn('h-1.5 w-1.5 rounded-full bg-current', item.tone)} />
                            {item.label}
                          </span>
                          <span className="mt-1 block text-[9.5px] leading-snug text-subtle">{item.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-[11px] font-medium text-muted">Response format</p>
                    <div className="grid grid-cols-2 gap-2">
                      {FORMATS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormat(item.id)}
                            className={cn(
                              'focus-ring flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                              format === item.id
                                ? 'border-accent/30 bg-accent/[0.06]'
                                : 'border-line bg-surface2/30 hover:border-line-strong',
                            )}
                          >
                            <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', format === item.id ? 'text-accent-soft' : 'text-subtle')} />
                            <span>
                              <span className={cn('block text-[11px] font-medium', format === item.id ? 'text-ink' : 'text-muted')}>{item.label}</span>
                              <span className="mt-0.5 block text-[9.5px] leading-snug text-subtle">{item.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-[9.5px] text-subtle">Local generation · solution and rubric included</p>
                    <Button variant="primary" onClick={handleGenerate} leading={<Sparkles className="h-3.5 w-3.5" />}>
                      Generate exercise
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="label-caps">Your practice</p>
              <Target className="h-4 w-4 text-subtle" />
            </div>
            {overall.attempts === 0 ? (
              <EmptyState
                bare
                compact
                icon={<FlaskConical className="h-4 w-4" />}
                title="No attempts yet"
                description="Your accuracy and recent answers will appear here."
              />
            ) : (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <ProgressRing value={overall.accuracy} size={62} stroke={4}>
                    {pct(overall.accuracy)}
                  </ProgressRing>
                  <div>
                    <p className="font-mono text-lg font-medium text-ink">{overall.attempts}</p>
                    <p className="text-[10px] text-subtle">attempts in this browser</p>
                    <p className="mt-1 text-[9.5px] text-subtle">Includes self-assessed responses</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-line pt-3">
                  <p className="label-caps mb-2">Recent</p>
                  <div className="space-y-1.5">
                    {learning.quizAttempts.slice(0, 4).map((attempt) => {
                      const score = attempt.score ?? (attempt.correct ? 1 : 0);
                      return (
                        <div key={attempt.id} className="flex items-center gap-2">
                          <span
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                              score === 1
                                ? 'border-success/20 bg-success/[0.07] text-success'
                                : score > 0
                                  ? 'border-warning/20 bg-warning/[0.07] text-warning'
                                  : 'border-danger/20 bg-danger/[0.06] text-danger',
                            )}
                          >
                            {score === 1 ? <Check className="h-3 w-3" /> : score > 0 ? <AlertTriangle className="h-2.5 w-2.5" /> : <X className="h-3 w-3" />}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[10.5px] text-muted">{attempt.topic}</span>
                          <span className="shrink-0 font-mono text-[9px] text-subtle">{formatRelativeTime(attempt.timestamp)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('grader')}
            className="focus-ring flex w-full items-center gap-3 rounded-xl border border-line bg-surface/40 p-4 text-left transition-colors hover:border-line-strong hover:bg-surface"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface2 text-cyan">
              <Award className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-[11px] font-medium text-ink">Have a written answer?</span>
              <span className="mt-0.5 block text-[10px] text-subtle">Evaluate it against a marking rubric.</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-subtle" />
          </button>
        </aside>
      </div>
    </div>
  );
};
