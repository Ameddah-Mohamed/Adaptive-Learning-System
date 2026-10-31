import React, { useCallback, useEffect, useState } from 'react';
import type { KnowledgeStats, Route } from './lib/types';
import { getKnowledgeStats } from './lib/api';
import { ROUTE_META, useRoute } from './lib/router';
import { chapterLabel, getChapter } from './lib/curriculum';
import { learningStore } from './lib/learningStore';
import { preferencesStore, usePreferences } from './lib/preferences';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { TutorChatView } from './components/TutorChatView';
import { LibraryView } from './components/LibraryView';
import { QuizView } from './components/QuizView';
import { CodeSandboxView } from './components/CodeSandboxView';
import { GraderView } from './components/GraderView';
import { AnalyticsView } from './components/AnalyticsView';
import { KnowledgeView } from './components/KnowledgeView';
import { BookmarksView } from './components/BookmarksView';
import { SettingsView } from './components/SettingsView';

type BackendStatus = 'checking' | 'online' | 'offline';

export const App: React.FC = () => {
  const [route, navigate] = useRoute();
  const preferences = usePreferences();

  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [chapterFilter, setChapterFilter] = useState<number | null>(preferences.defaultChapter);
  const [knowledgeChapter, setKnowledgeChapter] = useState<number | null>(null);
  const [quizTopic, setQuizTopic] = useState<string | undefined>(undefined);
  const [quizKey, setQuizKey] = useState(0);
  const [codingTaskId, setCodingTaskId] = useState<string>('task_02_attention');

  const refreshBackend = useCallback(async () => {
    setBackendStatus('checking');
    try {
      const stats = await getKnowledgeStats();
      setKnowledgeStats(stats);
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  }, []);

  useEffect(() => {
    void refreshBackend();
  }, [refreshBackend]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = preferences.density === 'compact' ? 'compact' : 'comfortable';
    root.dataset.reducedMotion = preferences.reduceMotion ? 'true' : 'false';
  }, [preferences.density, preferences.reduceMotion]);

  useEffect(() => {
    document.title = `${ROUTE_META[route].label} · NLP Learning Studio`;
  }, [route]);

  useEffect(() => {
    setChapterFilter(preferences.defaultChapter);
  }, [preferences.defaultChapter]);

  const handleStudyChapter = useCallback(
    (chapter: number) => {
      const meta = getChapter(chapter);
      setChapterFilter(chapter);
      learningStore.visitChapter(chapter);
      if (meta) {
        learningStore.recordEvent({
          kind: 'library',
          title: `Opened ${chapterLabel(meta)}`,
          detail: meta.shortTitle,
          chapter,
        });
      }
      navigate('tutor');
    },
    [navigate],
  );

  const handlePracticeTopic = useCallback(
    (topic: string) => {
      setQuizTopic(topic);
      setQuizKey((key) => key + 1);
      navigate('quiz');
    },
    [navigate],
  );

  const handleInspectChapter = useCallback(
    (chapter: number | null) => {
      setKnowledgeChapter(chapter);
      navigate('knowledge');
    },
    [navigate],
  );

  const handleOpenLabTask = useCallback(
    (taskId: string) => {
      setCodingTaskId(taskId);
      navigate('sandbox');
    },
    [navigate],
  );

  const renderView = (current: Route) => {
    switch (current) {
      case 'tutor':
        return (
          <TutorChatView
            selectedModel={preferences.model}
            chapterFilter={chapterFilter}
            setChapterFilter={setChapterFilter}
            topK={preferences.retrievalDepth}
            setTopK={(depth) => preferencesStore.update({ retrievalDepth: depth })}
            onNavigate={navigate}
          />
        );
      case 'library':
        return (
          <LibraryView
            onNavigate={navigate}
            onStudyChapter={handleStudyChapter}
            onPracticeTopic={handlePracticeTopic}
            onInspectChapter={handleInspectChapter}
            onOpenLabTask={handleOpenLabTask}
          />
        );
      case 'quiz':
        return (
          <QuizView
            key={`quiz-${quizKey}`}
            selectedModel={preferences.model}
            initialTopic={quizTopic}
            onNavigate={navigate}
          />
        );
      case 'sandbox':
        return (
          <CodeSandboxView
            selectedModel={preferences.model}
            activeTaskId={codingTaskId}
            onSelectTaskId={setCodingTaskId}
            onNavigate={navigate}
          />
        );
      case 'grader':
        return <GraderView selectedModel={preferences.model} onNavigate={navigate} />;
      case 'analytics':
        return <AnalyticsView onNavigate={navigate} onPracticeTopic={handlePracticeTopic} />;
      case 'knowledge':
        return (
          <KnowledgeView
            key={`knowledge-${knowledgeChapter ?? 'all'}`}
            knowledgeStats={knowledgeStats}
            backendStatus={backendStatus}
            initialChapter={knowledgeChapter}
            onStudyChapter={handleStudyChapter}
            onNavigate={navigate}
          />
        );
      case 'bookmarks':
        return (
          <BookmarksView
            onNavigate={navigate}
            onStudyChapter={handleStudyChapter}
            onInspectChapter={handleInspectChapter}
          />
        );
      case 'settings':
        return (
          <SettingsView
            knowledgeStats={knowledgeStats}
            backendStatus={backendStatus}
            onRetryConnection={refreshBackend}
            onNavigate={navigate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ToastProvider>
      <AppShell
        route={route}
        onNavigate={navigate}
        onStudyChapter={handleStudyChapter}
        backendStatus={backendStatus}
        totalChunks={knowledgeStats?.total_chunks ?? null}
      >
        {renderView(route)}
      </AppShell>
    </ToastProvider>
  );
};

export default App;
