import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CbtQuestion, ExamResult, AppView, UserProfile, CbtLaunchConfig } from '../types';
import { usePlatform } from '../lib/realtimeStore';

interface CbtExamViewProps {
  setCurrentView: (view: AppView) => void;
  currentUser: UserProfile | null;
  launchConfig: CbtLaunchConfig;
  setLaunchConfig: (config: CbtLaunchConfig) => void;
}

const SUBJECT_DURATION_SECONDS = 40 * 60; // 40 minutes per subject

export const CbtExamView: React.FC<CbtExamViewProps> = ({
  setCurrentView,
  currentUser,
  launchConfig,
  setLaunchConfig,
}) => {
  const { snapshot, isLoading, reportPresence, recordExamSubmission } = usePlatform();

  // Available subjects derived strictly from published Supabase questions (English Language first)
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    snapshot.questions.forEach((q) => {
      if (q.subject) set.add(q.subject);
    });
    return Array.from(set).sort((a, b) => {
      if (a.toLowerCase().includes('english')) return -1;
      if (b.toLowerCase().includes('english')) return 1;
      return a.localeCompare(b);
    });
  }, [snapshot.questions]);

  const defaultSubject = useMemo(() => {
    if (launchConfig.subject && launchConfig.subject !== 'All') return launchConfig.subject;
    return availableSubjects[0] || 'English Language';
  }, [launchConfig.subject, availableSubjects]);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(defaultSubject);
  const [practiceMode, setPracticeMode] = useState<'standard' | 'subject' | 'smart_weakness'>(
    launchConfig.mode || 'subject'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<number, boolean>>({});
  const [initialDurationSeconds, setInitialDurationSeconds] = useState<number>(SUBJECT_DURATION_SECONDS);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(SUBJECT_DURATION_SECONDS);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Sync launchConfig or initial availableSubjects load so a valid subject is active with 40:00 timer
  useEffect(() => {
    const nextSubject =
      launchConfig.subject && launchConfig.subject !== 'All'
        ? launchConfig.subject
        : availableSubjects[0] || 'English Language';
    setPracticeMode(launchConfig.mode === 'smart_weakness' ? 'smart_weakness' : 'subject');
    setSelectedSubjectFilter(nextSubject);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedIds({});
    setInitialDurationSeconds(SUBJECT_DURATION_SECONDS);
    setTimeLeftSeconds(SUBJECT_DURATION_SECONDS);
    setExamSubmitted(false);
    setExamResult(null);
  }, [launchConfig, availableSubjects.length > 0 ? availableSubjects[0] : '']);

  // Identify student's weakest subject from real Supabase examResults
  const weakestSubject = useMemo(() => {
    if (!currentUser) return null;
    const myResults = snapshot.examResults.filter((r) => r.userId === currentUser.id);
    const agg: Record<string, { total: number; correct: number }> = {};
    for (const r of myResults) {
      for (const [subj, stat] of Object.entries(r.subjectBreakdown || {})) {
        if (!agg[subj]) agg[subj] = { total: 0, correct: 0 };
        agg[subj].total += Number(stat.total || 0);
        agg[subj].correct += Number(stat.correct || 0);
      }
    }
    let lowestSubj: string | null = null;
    let lowestPct = 101;
    for (const [subj, stat] of Object.entries(agg)) {
      if (stat.total > 0) {
        const pct = (stat.correct / stat.total) * 100;
        if (pct < lowestPct) {
          lowestPct = pct;
          lowestSubj = subj;
        }
      }
    }
    return lowestSubj;
  }, [currentUser, snapshot.examResults]);

  // Active filtered question set from real Supabase cbt_questions (50 for English, 40 per other subject)
  const activeQuestions: CbtQuestion[] = useMemo(() => {
    const all = snapshot.questions;
    if (all.length === 0) return [];

    if (practiceMode === 'smart_weakness' && weakestSubject) {
      const weakMatches = all.filter(
        (q) =>
          q.subject.toLowerCase() === weakestSubject.toLowerCase() ||
          weakestSubject.toLowerCase().includes(q.subject.toLowerCase())
      );
      if (weakMatches.length > 0) return weakMatches;
    }

    if (selectedSubjectFilter !== 'All') {
      const matches = all.filter(
        (q) =>
          q.subject.toLowerCase() === selectedSubjectFilter.toLowerCase() ||
          selectedSubjectFilter.toLowerCase().includes(q.subject.toLowerCase())
      );
      return matches;
    }

    return all;
  }, [snapshot.questions, practiceMode, selectedSubjectFilter, weakestSubject]);

  // Set exact 40-minute timer (2400s) for each subject (or 40 mins × subject count if All is chosen)
  useEffect(() => {
    if (activeQuestions.length > 0 && !examSubmitted) {
      const computed =
        selectedSubjectFilter === 'All' && practiceMode !== 'smart_weakness'
          ? Math.max(1, availableSubjects.length) * SUBJECT_DURATION_SECONDS
          : SUBJECT_DURATION_SECONDS;
      setInitialDurationSeconds(computed);
      setTimeLeftSeconds(computed);
      setCurrentQuestionIndex(0);
    }
  }, [selectedSubjectFilter, practiceMode, availableSubjects.length, examSubmitted]);

  // Countdown timer
  useEffect(() => {
    if (examSubmitted || activeQuestions.length === 0 || timeLeftSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setTimeLeftSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [examSubmitted, activeQuestions.length, timeLeftSeconds]);

  const attemptedCount = useMemo(
    () => activeQuestions.filter((q) => userAnswers[q.id] !== undefined).length,
    [activeQuestions, userAnswers]
  );

  // Stream genuine live CBT telemetry over WebSocket to Admin Console
  useEffect(() => {
    if (activeQuestions.length === 0 || examSubmitted) {
      reportPresence('cbt', currentUser, null);
      return;
    }
    reportPresence('cbt', currentUser, {
      mode: practiceMode,
      subjectFilter: selectedSubjectFilter,
      currentQuestion: currentQuestionIndex + 1,
      answeredCount: attemptedCount,
      totalQuestions: activeQuestions.length,
      timeLeftSeconds,
    });
  }, [
    currentQuestionIndex,
    attemptedCount,
    activeQuestions.length,
    practiceMode,
    selectedSubjectFilter,
    examSubmitted,
    currentUser,
    reportPresence,
    Math.floor(timeLeftSeconds / 10),
  ]);

  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  const handleSelectOption = useCallback(
    (questionId: number, optionIndex: number) => {
      if (examSubmitted) return;
      setUserAnswers((prev) => ({
        ...prev,
        [questionId]: optionIndex,
      }));
    },
    [examSubmitted]
  );

  const toggleFlagQuestion = useCallback((questionId: number) => {
    setFlaggedIds((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  // Official JAMB-style Keyboard Shortcuts: A/B/C/D, N/P, ArrowLeft/Right, F
  useEffect(() => {
    if (!currentQuestion || examSubmitted || confirmSubmitOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      const key = e.key.toUpperCase();
      if (key === 'A' && currentQuestion.options.length > 0) handleSelectOption(currentQuestion.id, 0);
      else if (key === 'B' && currentQuestion.options.length > 1) handleSelectOption(currentQuestion.id, 1);
      else if (key === 'C' && currentQuestion.options.length > 2) handleSelectOption(currentQuestion.id, 2);
      else if (key === 'D' && currentQuestion.options.length > 3) handleSelectOption(currentQuestion.id, 3);
      else if (key === 'N' || e.key === 'ArrowRight') {
        setCurrentQuestionIndex((i) => Math.min(activeQuestions.length - 1, i + 1));
      } else if (key === 'P' || e.key === 'ArrowLeft') {
        setCurrentQuestionIndex((i) => Math.max(0, i - 1));
      } else if (key === 'F') {
        toggleFlagQuestion(currentQuestion.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentQuestion, examSubmitted, confirmSubmitOpen, activeQuestions.length, handleSelectOption, toggleFlagQuestion]);

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 3600) {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSubmitExam = async () => {
    if (activeQuestions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    let correctCount = 0;
    let wrongCount = 0;
    const subjectBreakdown: Record<string, { total: number; correct: number }> = {};

    activeQuestions.forEach((q) => {
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, correct: 0 };
      }
      subjectBreakdown[q.subject].total += 1;

      const choice = userAnswers[q.id];
      if (choice !== undefined) {
        if (choice === q.correctOptionIndex) {
          correctCount += 1;
          subjectBreakdown[q.subject].correct += 1;
        } else {
          wrongCount += 1;
        }
      }
    });

    const scorePercentage = Math.round((correctCount / activeQuestions.length) * 100);
    const timeSpentSeconds = Math.max(1, initialDurationSeconds - timeLeftSeconds);

    const result: ExamResult = {
      totalQuestions: activeQuestions.length,
      attemptedCount,
      correctCount,
      wrongCount,
      scorePercentage,
      subjectBreakdown,
      timeSpentSeconds,
    };

    setExamResult(result);
    setExamSubmitted(true);
    setConfirmSubmitOpen(false);

    if (currentUser) {
      const sessionTitle =
        practiceMode === 'smart_weakness' && weakestSubject
          ? `Adaptive Weakness Drill: ${weakestSubject}`
          : selectedSubjectFilter !== 'All'
            ? `CBT Practice: ${selectedSubjectFilter}`
            : 'JAMB / WAEC Comprehensive CBT';

      try {
        await recordExamSubmission({
          userId: currentUser.id,
          userName: currentUser.name,
          title: sessionTitle,
          result,
        });
      } catch (err) {
        console.warn('Could not persist exam submission:', err);
      }
    }

    setIsSubmitting(false);
  };

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeftSeconds === 0 && activeQuestions.length > 0 && !examSubmitted) {
      handleSubmitExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftSeconds]);

  // Empty State when Supabase public.cbt_questions has 0 rows (Zero Dummy Data)
  if (!isLoading && snapshot.questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">quiz</span>
          </div>
          <h2 className="font-headline text-xl font-bold text-white mb-2">
            CBT Question Bank Is Empty in Supabase
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            There are currently <span className="text-zinc-200 font-semibold tabular-nums">0</span> published questions in your Supabase <code className="text-emerald-400">cbt_questions</code> table. Placeholder dummy questions have been disabled so your platform reflects live database records exclusively.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => setCurrentView('admin')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Add CBT Questions in Admin Console
              </button>
            ) : (
              <button
                onClick={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg cursor-pointer"
              >
                Return to Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Loading live CBT question bank from Supabase...</span>
        </div>
      </div>
    );
  }

  const flaggedCount = Object.values(flaggedIds).filter(Boolean).length;
  const projectedUtme400 = examResult
    ? Math.round((examResult.correctCount / Math.max(1, examResult.totalQuestions)) * 400)
    : 0;

  return (
    <div className="bg-zinc-950 text-zinc-100 font-body min-h-[calc(100vh-4rem)] pb-14">
      {/* Examination Control Strip */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-3.5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Subject Filter Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="cbt-subject-select" className="text-xs font-medium text-zinc-400">
                  Subject Paper:
                </label>
                <select
                  id="cbt-subject-select"
                  value={selectedSubjectFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPracticeMode(val === 'All' ? 'standard' : 'subject');
                    setSelectedSubjectFilter(val);
                    setUserAnswers({});
                    setFlaggedIds({});
                    setCurrentQuestionIndex(0);
                    setTimeLeftSeconds(
                      val === 'All'
                        ? Math.max(1, availableSubjects.length) * SUBJECT_DURATION_SECONDS
                        : SUBJECT_DURATION_SECONDS
                    );
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {availableSubjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj} ({snapshot.questions.filter((q) => q.subject === subj).length} Questions · 40 Mins)
                    </option>
                  ))}
                  <option value="All">
                    All Combined Subjects ({snapshot.questions.length} Questions)
                  </option>
                </select>
              </div>

              {weakestSubject && (
                <button
                  onClick={() => {
                    setPracticeMode('smart_weakness');
                    setSelectedSubjectFilter(weakestSubject);
                    setUserAnswers({});
                    setFlaggedIds({});
                    setCurrentQuestionIndex(0);
                    setTimeLeftSeconds(SUBJECT_DURATION_SECONDS);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    practiceMode === 'smart_weakness'
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-emerald-400 hover:border-emerald-500/40'
                  }`}
                >
                  Smart Drill: {weakestSubject}
                </button>
              )}
            </div>

            {/* Live Telemetry & 40-Minute Subject Countdown */}
            <div className="flex items-center gap-5 text-xs">
              <div className="text-zinc-400 tabular-nums">
                Answered:{' '}
                <span className="text-zinc-100 font-semibold">
                  {attemptedCount} / {activeQuestions.length}
                </span>
              </div>

              {flaggedCount > 0 && (
                <div className="text-amber-400 tabular-nums">
                  Flagged: <span className="font-semibold">{flaggedCount}</span>
                </div>
              )}

              <div
                className={`px-3.5 py-1.5 rounded-lg border font-mono font-semibold text-sm tabular-nums flex items-center gap-2 ${
                  timeLeftSeconds < 300
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                }`}
                title="40 minutes allocated per subject"
              >
                <span className="material-symbols-outlined text-base text-emerald-400">timer</span>
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Quick-Switch Subject Tabs (40 mins each; 50 Qs English, 40 Qs per other subject) */}
          {availableSubjects.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
              {availableSubjects.map((subj) => {
                const count = snapshot.questions.filter((q) => q.subject === subj).length;
                const isActive = selectedSubjectFilter === subj && practiceMode !== 'smart_weakness';
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => {
                      setPracticeMode('subject');
                      setSelectedSubjectFilter(subj);
                      setUserAnswers({});
                      setFlaggedIds({});
                      setCurrentQuestionIndex(0);
                      setTimeLeftSeconds(SUBJECT_DURATION_SECONDS);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer tabular-nums ${
                      isActive
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                    }`}
                  >
                    {subj} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {activeQuestions.length === 0 ? (
        <div className="max-w-xl mx-auto mt-16 p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
          <p className="text-sm font-semibold text-white mb-2">
            No CBT questions published for {selectedSubjectFilter}
          </p>
          <p className="text-xs text-zinc-400 mb-5">
            Select another subject or switch back to All Published Subjects.
          </p>
          <button
            onClick={() => {
              setPracticeMode('standard');
              setSelectedSubjectFilter('All');
            }}
            className="px-4 py-2 bg-emerald-500 text-zinc-950 font-semibold text-xs rounded-lg cursor-pointer"
          >
            Show All Questions
          </button>
        </div>
      ) : (
        <main className="max-w-[1280px] mx-auto px-4 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Zone: Interactive Question Stage */}
          <section className="lg:col-span-8 flex flex-col">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 flex-1 flex flex-col">
              {/* Question Header Metadata (Zero-Pill Unboxed Typography) */}
              <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <span className="text-emerald-400 font-medium">{currentQuestion.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentQuestion.topic}</span>
                  </div>
                  <h2 className="font-headline text-xl font-bold text-white tabular-nums">
                    Question {currentQuestionIndex + 1}{' '}
                    <span className="text-zinc-500 font-normal text-sm">of {activeQuestions.length}</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlagQuestion(currentQuestion.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    flaggedIds[currentQuestion.id]
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">flag</span>
                  <span>{flaggedIds[currentQuestion.id] ? 'Flagged' : 'Flag (F)'}</span>
                </button>
              </div>

              {/* Question Stem */}
              <p className="text-base md:text-lg text-zinc-100 leading-relaxed mb-8">
                {currentQuestion.text}
              </p>

              {/* Options List */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((optText, optIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-500 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm md:text-base leading-relaxed">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation & Keyboard Legend */}
              <div className="mt-auto pt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold disabled:opacity-35 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous (P)</span>
                </button>

                <span className="hidden sm:inline text-[11px] text-zinc-500">
                  Shortcuts: A–D select · P / N navigate · F flag
                </span>

                {currentQuestionIndex < activeQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((i) => Math.min(activeQuestions.length - 1, i + 1))
                    }
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next (N)</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSubmitOpen(true)}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Finish &amp; Submit</span>
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Right Zone: Question Palette & Submission */}
          <aside className="lg:col-span-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-sm font-bold text-white">Question Navigator</h3>
                <span className="text-xs text-zinc-400 tabular-nums">
                  {Math.round((attemptedCount / activeQuestions.length) * 100)}% complete
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-5 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Flagged
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-zinc-950 border border-zinc-700" /> Unread
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {activeQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = Boolean(flaggedIds[q.id]);
                  const isCurrent = idx === currentQuestionIndex;

                  let btnClass =
                    'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200';
                  if (isCurrent) {
                    btnClass = 'bg-zinc-800 border-2 border-emerald-400 text-white font-bold';
                  } else if (isFlagged) {
                    btnClass = 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold';
                  } else if (isAnswered) {
                    btnClass = 'bg-emerald-500 text-zinc-950 font-semibold border border-emerald-500';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg text-xs tabular-nums transition-colors cursor-pointer ${btnClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {!currentUser && (
                <p className="mt-5 text-[11px] text-amber-400/90 leading-relaxed">
                  Note: Sign in before submitting if you want your score saved to your personal Supabase academic record.
                </p>
              )}

              <div className="mt-6 pt-5 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitOpen(true)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Submit Examination
                </button>
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* Submit Confirmation Modal */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl max-w-md w-full p-6 border border-zinc-800 text-zinc-100">
            <h3 className="font-headline text-lg font-bold text-white mb-2">Submit Examination?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              You have answered{' '}
              <span className="text-white font-semibold tabular-nums">{attemptedCount}</span> of{' '}
              <span className="text-white font-semibold tabular-nums">{activeQuestions.length}</span>{' '}
              questions.
              {activeQuestions.length - attemptedCount > 0 && (
                <span className="block text-amber-400 mt-1.5 tabular-nums">
                  {activeQuestions.length - attemptedCount} question(s) remain unanswered.
                </span>
              )}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 cursor-pointer"
              >
                Continue Reviewing
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitExam}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Score'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Score & Solutions Report Modal */}
      {examSubmitted && examResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 rounded-xl max-w-3xl w-full p-6 md:p-8 border border-zinc-800 text-zinc-100 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start gap-4 pb-5 mb-6 border-b border-zinc-800">
              <div>
                <div className="text-xs text-emerald-400 font-medium mb-1">
                  Diagnostic Assessment Complete
                </div>
                <h2 className="font-headline text-2xl font-bold text-white">
                  Examination Performance Report
                </h2>
              </div>
              <button
                onClick={() => setExamSubmitted(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Key Score Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="text-[11px] text-zinc-400">Accuracy</div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
                  {examResult.scorePercentage}%
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="text-[11px] text-zinc-400">UTME Projection</div>
                <div className="font-headline text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                  {projectedUtme400} / 400
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="text-[11px] text-zinc-400">Correct Answers</div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
                  {examResult.correctCount} / {examResult.totalQuestions}
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="text-[11px] text-zinc-400">Avg Pacing</div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
                  {Math.max(
                    1,
                    Math.round(examResult.timeSpentSeconds / Math.max(1, examResult.attemptedCount))
                  )}
                  s / item
                </div>
              </div>
            </div>

            {/* Subject Breakdown */}
            <h3 className="font-headline text-sm font-bold text-white mb-3">Subject Mastery Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {Object.entries(examResult.subjectBreakdown).map(([subject, stats]) => {
                const typed = stats as { total: number; correct: number };
                const pct = typed.total > 0 ? Math.round((typed.correct / typed.total) * 100) : 0;
                return (
                  <div key={subject} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-semibold text-zinc-200">{subject}</span>
                      <span className="text-zinc-400 tabular-nums">
                        {typed.correct}/{typed.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step-by-Step Solution Review */}
            <h3 className="font-headline text-sm font-bold text-white mb-3">Item-by-Item Solution Review</h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {activeQuestions.map((q, idx) => {
                const choice = userAnswers[q.id];
                const isCorrect = choice === q.correctOptionIndex;
                return (
                  <div key={q.id} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <span className="text-zinc-400 tabular-nums">
                        Item {idx + 1} · {q.subject} · {q.topic}
                      </span>
                      <span
                        className={`font-semibold ${
                          choice === undefined
                            ? 'text-zinc-500'
                            : isCorrect
                              ? 'text-emerald-400'
                              : 'text-red-400'
                        }`}
                      >
                        {choice === undefined ? 'Skipped' : isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <p className="text-zinc-200 font-medium mb-2">{q.text}</p>
                    <p className="text-emerald-400 mb-1">
                      Correct Option: {q.options[q.correctOptionIndex]}
                    </p>
                    {q.explanation && (
                      <p className="text-zinc-400 leading-relaxed pt-1 border-t border-zinc-900">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setExamSubmitted(false);
                  setUserAnswers({});
                  setFlaggedIds({});
                  setTimeLeftSeconds(initialDurationSeconds);
                  setCurrentQuestionIndex(0);
                }}
                className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg font-medium text-xs cursor-pointer"
              >
                Retake Session
              </button>
              <button
                onClick={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs cursor-pointer"
              >
                {currentUser ? 'View Updated Analytics' : 'Return to Overview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
