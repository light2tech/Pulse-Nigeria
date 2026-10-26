import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AppView,
  UserProfile,
  StudyMaterial,
  PastQuestionPaper,
  CbtLaunchConfig,
} from '../types';
import { usePlatform } from '../lib/realtimeStore';
import { updateProfileOnServer, uploadProfileAvatarToSupabase } from '../lib/supabaseService';
import { getMaterialCoverImage } from '../data/mockData';
import { EXAM_BODIES } from '../lib/subjectCatalog';

interface StudentDashboardViewProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  setCurrentView: (view: AppView) => void;
  onOpenMaterial: (material: StudyMaterial) => void;
  onOpenPastQuestion: (paper: PastQuestionPaper) => void;
  onLaunchCbt: (config: CbtLaunchConfig) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  currentUser,
  setCurrentUser,
  onOpenMaterial,
  onOpenPastQuestion,
  onLaunchCbt,
}) => {
  const { snapshot, refreshSnapshot } = usePlatform();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'past_questions' | 'library' | 'history' | 'profile'
  >('overview');

  const [searchMaterial, setSearchMaterial] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const [pqSearch, setPqSearch] = useState('');
  const [pqSubjectFilter, setPqSubjectFilter] = useState('All');
  const [pqExamFilter, setPqExamFilter] = useState('All');

  // Editable Profile State
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editClass, setEditClass] = useState(currentUser.studentClass || 'SS 3 Science');
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser.avatarUrl);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone || '');
    setEditClass(currentUser.studentClass || 'SS 3 Science');
    setEditAvatarUrl(currentUser.avatarUrl);
  }, [currentUser]);

  // All distinct subjects across Supabase
  const allAvailableSubjects = useMemo(() => {
    const map = new Map<string, string>();
    snapshot.subjects.forEach((s) => {
      if (s.name) map.set(s.name.toLowerCase(), s.name);
    });
    snapshot.materials.forEach((m) => {
      if (m.subject && !map.has(m.subject.toLowerCase())) map.set(m.subject.toLowerCase(), m.subject);
    });
    snapshot.pastQuestions.forEach((pq) => {
      if (pq.subject && !map.has(pq.subject.toLowerCase())) map.set(pq.subject.toLowerCase(), pq.subject);
    });
    snapshot.questions.forEach((q) => {
      if (q.subject && !map.has(q.subject.toLowerCase())) map.set(q.subject.toLowerCase(), q.subject);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [snapshot.subjects, snapshot.materials, snapshot.pastQuestions, snapshot.questions]);

  // Real personal exam attempts from Supabase exam_results
  const myExamResults = useMemo(
    () => snapshot.examResults.filter((r) => r.userId === currentUser.id),
    [snapshot.examResults, currentUser.id]
  );

  // Real personal recent activities from Supabase recent_activity
  const myActivities = useMemo(
    () => snapshot.recentActivities.filter((a) => a.userId === currentUser.id),
    [snapshot.recentActivities, currentUser.id]
  );

  // Compute live performance analytics strictly from real Supabase attempts
  const analytics = useMemo(() => {
    const attempts = myExamResults.length;
    if (attempts === 0) {
      return {
        attempts: 0,
        avgScore: 0,
        projectedUtme: 0,
        totalAnswered: 0,
        subjectStats: {} as Record<string, { total: number; correct: number; pct: number }>,
        weakestSubject: null as string | null,
      };
    }

    const avgScore = Math.round(
      myExamResults.reduce((acc, r) => acc + r.scorePercentage, 0) / attempts
    );
    const projectedUtme = Math.round((avgScore / 100) * 400);
    const totalAnswered = myExamResults.reduce((acc, r) => acc + r.attemptedCount, 0);

    const subjectStats: Record<string, { total: number; correct: number; pct: number }> = {};
    for (const r of myExamResults) {
      for (const [subj, rawStat] of Object.entries(r.subjectBreakdown || {})) {
        const stat = rawStat as { total?: number; correct?: number };
        if (!subjectStats[subj]) subjectStats[subj] = { total: 0, correct: 0, pct: 0 };
        subjectStats[subj].total += Number(stat.total || 0);
        subjectStats[subj].correct += Number(stat.correct || 0);
      }
    }

    let weakestSubject: string | null = null;
    let lowestPct = 101;
    for (const [subj, stat] of Object.entries(subjectStats)) {
      stat.pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      if (stat.total > 0 && stat.pct < lowestPct) {
        lowestPct = stat.pct;
        weakestSubject = subj;
      }
    }

    return {
      attempts,
      avgScore,
      projectedUtme,
      totalAnswered,
      subjectStats,
      weakestSubject,
    };
  }, [myExamResults]);

  const filteredMaterials = useMemo(() => {
    return snapshot.materials.filter((m) => {
      const matchesSubj =
        subjectFilter === 'All' ||
        m.subject.toLowerCase() === subjectFilter.toLowerCase() ||
        subjectFilter.toLowerCase().includes(m.subject.toLowerCase());
      const q = searchMaterial.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q);
      return matchesSubj && matchesSearch;
    });
  }, [snapshot.materials, subjectFilter, searchMaterial]);

  const filteredPastQuestions = useMemo(() => {
    return snapshot.pastQuestions.filter((pq) => {
      const matchesSubj =
        pqSubjectFilter === 'All' ||
        pq.subject.toLowerCase() === pqSubjectFilter.toLowerCase() ||
        pqSubjectFilter.toLowerCase().includes(pq.subject.toLowerCase());
      const matchesExam =
        pqExamFilter === 'All' || pq.examBody.toLowerCase() === pqExamFilter.toLowerCase();
      const q = pqSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        pq.title.toLowerCase().includes(q) ||
        pq.subject.toLowerCase().includes(q) ||
        pq.examBody.toLowerCase().includes(q) ||
        pq.examYear.toLowerCase().includes(q) ||
        pq.summary.toLowerCase().includes(q);
      return matchesSubj && matchesExam && matchesSearch;
    });
  }, [snapshot.pastQuestions, pqSubjectFilter, pqExamFilter, pqSearch]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileNotice({ type: 'error', text: 'Please select a valid PNG, JPG, or WEBP image.' });
      return;
    }

    setIsUploadingAvatar(true);
    setProfileNotice(null);

    try {
      const signedUrl = await uploadProfileAvatarToSupabase(file, currentUser.id);
      setEditAvatarUrl(signedUrl);
      const updatedUser: UserProfile = {
        ...currentUser,
        avatarUrl: signedUrl,
      };
      setCurrentUser(updatedUser);
      await refreshSnapshot();
      setProfileNotice({
        type: 'success',
        text: 'Profile photo uploaded to Supabase Storage and saved permanently.',
      });
    } catch (err: any) {
      setProfileNotice({
        type: 'error',
        text: err?.message || 'Failed to upload image to Supabase Storage.',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileNotice(null);

    try {
      const saved = await updateProfileOnServer(currentUser.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        studentClass: editClass,
        avatarUrl: editAvatarUrl,
        role: currentUser.role,
      });
      setCurrentUser(saved);
      await refreshSnapshot();
      setProfileNotice({
        type: 'success',
        text: 'Profile saved to Supabase. Your details will remain unchanged across logouts.',
      });
    } catch (err: any) {
      setProfileNotice({
        type: 'error',
        text: err?.message || 'Unable to save profile updates.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 font-body min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Left Workspace Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900/70 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex md:flex-col justify-between gap-4 shrink-0">
        <div className="w-full">
          {/* User Identity Card */}
          <div className="hidden md:flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-zinc-400 truncate">
                {currentUser.studentClass || 'SS 3 Science'}
              </div>
            </div>
          </div>

          {/* Workspace Tabs */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto hide-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg text-emerald-400">analytics</span>
              <span>Readiness Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('past_questions')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'past_questions'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg text-emerald-400">history_edu</span>
              <span>Past Questions &amp; Q/A ({snapshot.pastQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg text-emerald-400">menu_book</span>
              <span>Reading Materials ({snapshot.materials.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg text-emerald-400">history</span>
              <span>CBT Records ({myExamResults.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg text-emerald-400">person</span>
              <span>Profile Settings</span>
            </button>
          </nav>
        </div>

        <button
          onClick={() => onLaunchCbt({ mode: 'standard' })}
          className="hidden md:flex w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">timer</span>
          <span>Start CBT Session</span>
        </button>
      </aside>

      {/* Main Workspace Viewport */}
      <main className="flex-1 p-4 md:p-8 max-w-[1120px] w-full mx-auto">
        {/* Contextual Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <span>Student Workspace</span>
              <span aria-hidden="true">/</span>
              <span className="text-zinc-200 capitalize">
                {activeTab === 'past_questions' ? 'Past Questions & Answers' : activeTab}
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-white">
              {activeTab === 'overview'
                ? `Welcome back, ${currentUser.name.split(' ')[0]}`
                : activeTab === 'past_questions'
                  ? 'Past Questions & Official Answers Archive'
                  : activeTab === 'library'
                    ? 'Curriculum Reading Materials'
                    : activeTab === 'history'
                      ? 'Personal Examination Log'
                      : 'Account & Profile Preferences'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {analytics.weakestSubject && (
              <button
                onClick={() =>
                  onLaunchCbt({ mode: 'smart_weakness', subject: analytics.weakestSubject! })
                }
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Target Weakest: {analytics.weakestSubject}
              </button>
            )}
            <button
              onClick={() => onLaunchCbt({ mode: 'standard' })}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Launch CBT Simulator
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Live Readiness Stat Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Completed CBT Sessions</div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1.5">
                  {analytics.attempts}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                  {analytics.totalAnswered} total items answered
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Mean Accuracy</div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1.5">
                  {analytics.attempts > 0 ? `${analytics.avgScore}%` : '—'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  {analytics.attempts > 0 ? 'Across recorded sessions' : 'No attempts recorded yet'}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Projected UTME Aggregate</div>
                <div className="font-headline text-2xl font-bold text-emerald-400 tabular-nums mt-1.5">
                  {analytics.attempts > 0 ? `${analytics.projectedUtme} / 400` : '—'}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Standardized 400-point scale</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs text-zinc-400">Past Q&amp;A &amp; Notes</div>
                <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1.5">
                  {snapshot.pastQuestions.length + snapshot.materials.length}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                  {snapshot.pastQuestions.length} past papers · {snapshot.materials.length} notes
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 Cols: Subject Mastery, Past Questions, & Reading Materials */}
              <div className="lg:col-span-8 space-y-6">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-headline text-base font-bold text-white">
                        Subject Mastery &amp; Enrolled Tracks
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Real-time accuracy calculated from your submitted Supabase CBT sessions.
                      </p>
                    </div>
                  </div>

                  {snapshot.subjects.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      No curriculum subjects available in Supabase yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-zinc-800/80">
                      {snapshot.subjects.map((sub) => {
                        const matchKey = Object.keys(analytics.subjectStats).find(
                          (k) =>
                            k.toLowerCase() === sub.name.toLowerCase() ||
                            sub.name.toLowerCase().includes(k.toLowerCase())
                        );
                        const stat = matchKey ? analytics.subjectStats[matchKey] : null;
                        const masteryPct = stat ? stat.pct : 0;

                        return (
                          <div
                            key={sub.id}
                            className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{sub.name}</span>
                                <span className="text-zinc-600">·</span>
                                <span className="text-xs text-zinc-400">{sub.tag}</span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-0.5 truncate">{sub.description}</p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="w-32">
                                <div className="flex justify-between text-[11px] mb-1 tabular-nums">
                                  <span className="text-zinc-400">
                                    {stat ? `${stat.correct}/${stat.total} correct` : 'No attempts'}
                                  </span>
                                  <span className="font-semibold text-zinc-200">
                                    {stat ? `${masteryPct}%` : '—'}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 transition-all"
                                    style={{ width: `${masteryPct}%` }}
                                  />
                                </div>
                              </div>

                              <button
                                onClick={() => onLaunchCbt({ mode: 'subject', subject: sub.name })}
                                className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 rounded-lg cursor-pointer whitespace-nowrap"
                              >
                                Drill
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Latest Past Questions & Official Answers */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-headline text-base font-bold text-white">
                      Latest Past Questions &amp; Answers
                    </h2>
                    <button
                      onClick={() => setActiveTab('past_questions')}
                      className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                    >
                      View Archive ({snapshot.pastQuestions.length})
                    </button>
                  </div>

                  {snapshot.pastQuestions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-500">
                      No past question papers uploaded yet. Past questions uploaded by Admins appear here live.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {snapshot.pastQuestions.slice(0, 4).map((paper) => (
                        <div
                          key={paper.id}
                          className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col justify-between transition-colors"
                        >
                          <div>
                            <div className="text-[11px] text-zinc-400 mb-1.5 tabular-nums">
                              <span className="text-emerald-400 font-medium">{paper.subject}</span>
                              <span>
                                {' '}
                                · {paper.examBody} {paper.examYear}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                              {paper.title}
                            </h3>
                            <p className="text-xs text-zinc-400 mb-3 tabular-nums">
                              {paper.items.length} Q&amp;A item(s)
                              {paper.attachment ? ` · Attached: ${paper.attachment.fileName}` : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => onOpenPastQuestion(paper)}
                            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 cursor-pointer"
                          >
                            Open Questions &amp; Answers
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Latest Published Reading Materials */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-headline text-base font-bold text-white">
                      Latest Reading Materials
                    </h2>
                    <button
                      onClick={() => setActiveTab('library')}
                      className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                    >
                      Browse All ({snapshot.materials.length})
                    </button>
                  </div>

                  {snapshot.materials.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No reading materials have been uploaded to Supabase yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {snapshot.materials.slice(0, 4).map((mat) => (
                        <div
                          key={mat.id}
                          className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col justify-between transition-colors"
                        >
                          <div>
                            <div className="text-[11px] text-zinc-400 mb-1.5">
                              <span className="text-emerald-400 font-medium">{mat.subject}</span>
                              <span> · {mat.level}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                              {mat.title}
                            </h3>
                            <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{mat.summary}</p>
                          </div>
                          <button
                            onClick={() => onOpenMaterial(mat)}
                            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 cursor-pointer"
                          >
                            Read Material
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right 4 Cols: Personal Activity Stream */}
              <div className="lg:col-span-4">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
                  <h2 className="font-headline text-base font-bold text-white mb-4">
                    Recent Personal Activity
                  </h2>

                  {myActivities.length === 0 && myExamResults.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                      <span className="material-symbols-outlined text-zinc-600 text-3xl mb-2">
                        assignment
                      </span>
                      <p className="text-xs font-medium text-zinc-300">No recorded activity yet</p>
                      <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px]">
                        Complete a CBT session or study a past paper to build your live timeline.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {myActivities.slice(0, 6).map((act) => (
                        <div
                          key={act.id}
                          className="pb-3.5 border-b border-zinc-800/70 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-200">{act.title}</span>
                            {act.score && (
                              <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                                {act.score}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{act.detail}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 tabular-nums">{act.timeAgo}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTab('history')}
                    className="mt-6 w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 cursor-pointer"
                  >
                    Open Full CBT Log
                  </button>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* === PAST QUESTIONS & ANSWERS ARCHIVE TAB === */}
        {activeTab === 'past_questions' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={pqSubjectFilter}
                  onChange={(e) => setPqSubjectFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Subjects</option>
                  {allAvailableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={pqExamFilter}
                  onChange={(e) => setPqExamFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Exam Bodies</option>
                  {EXAM_BODIES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={pqSearch}
                onChange={(e) => setPqSearch(e.target.value)}
                placeholder="Search past questions by subject, year, or exam..."
                className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 lg:w-72"
              />
            </div>

            {filteredPastQuestions.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <p className="text-sm font-semibold text-zinc-200">
                  No Past Questions &amp; Answers found
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Past papers and marking schemes uploaded by Administrators on any subject appear here automatically in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPastQuestions.map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 tabular-nums">
                        <span className="text-emerald-400 font-semibold">{paper.subject}</span>
                        <span>
                          {paper.examBody} · {paper.examYear}
                        </span>
                      </div>

                      <h3 className="font-headline text-base font-bold text-white mb-1.5">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{paper.summary}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 tabular-nums">
                        <span>{paper.items.length} Q&amp;A item(s)</span>
                        <span>{paper.attachment ? 'PDF / File Attached' : paper.paperType}</span>
                      </div>
                      <button
                        onClick={() => onOpenPastQuestion(paper)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        Study Questions &amp; Answers
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === READING MATERIALS TAB === */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {['All', ...allAvailableSubjects].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSubjectFilter(subj)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      subjectFilter === subj
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
                placeholder="Search reading materials..."
                className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 sm:w-64"
              />
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <p className="text-sm font-semibold text-zinc-200">No matching reading materials found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  New reading materials published in the Admin Console appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-36 bg-zinc-950 border-b border-zinc-800">
                        <img
                          src={getMaterialCoverImage(mat.subject, mat.imageUrl)}
                          alt={mat.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-85"
                        />
                      </div>
                      <div className="p-5">
                        <div className="text-[11px] text-zinc-400 mb-1.5">
                          <span className="text-emerald-400 font-medium">{mat.subject}</span> · {mat.level} ·{' '}
                          <span className="tabular-nums">{mat.dateAdded}</span>
                        </div>
                        <h3 className="font-headline text-base font-bold text-white mb-1.5">
                          {mat.title}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-2">{mat.summary}</p>
                        {mat.attachment && (
                          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">attach_file</span>
                            <span className="truncate">{mat.attachment.fileName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => onOpenMaterial(mat)}
                        className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 cursor-pointer"
                      >
                        Open Reading Material
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {myExamResults.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold text-zinc-200">No CBT submissions recorded yet</p>
                <p className="text-xs text-zinc-500 mt-1 mb-5">
                  Take a timed CBT session to log your real performance metrics in Supabase.
                </p>
                <button
                  onClick={() => onLaunchCbt({ mode: 'standard' })}
                  className="px-4 py-2 bg-emerald-500 text-zinc-950 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Start First CBT Session
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">Date</th>
                      <th className="py-3.5 px-4 font-medium text-right">Attempted</th>
                      <th className="py-3.5 px-4 font-medium text-right">Correct</th>
                      <th className="py-3.5 px-4 font-medium text-right">Accuracy</th>
                      <th className="py-3.5 px-4 font-medium text-right">UTME /400</th>
                      <th className="py-3.5 px-4 font-medium text-right">Time Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {myExamResults.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-800/40">
                        <td className="py-3 px-4 text-zinc-200 tabular-nums">
                          {new Date(r.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-300 tabular-nums">
                          {r.attemptedCount} / {r.totalQuestions}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-300 tabular-nums">
                          {r.correctCount}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-400 tabular-nums">
                          {r.scorePercentage}%
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-200 font-mono tabular-nums">
                          {Math.round((r.scorePercentage / 100) * 400)}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-400 tabular-nums">
                          {Math.max(1, Math.round(r.timeSpentSeconds / 60))}m {r.timeSpentSeconds % 60}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 max-w-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer w-16 h-16 rounded-full overflow-hidden border border-zinc-700 shrink-0"
                  title="Upload new profile photo"
                >
                  <img
                    src={editAvatarUrl}
                    alt={editName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                  </div>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold text-white">{currentUser.name}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {currentUser.email} · <span className="capitalize">{currentUser.role}</span>
                  </p>
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingAvatar ? 'Uploading Photo...' : 'Change Photo'}
                </button>
              </div>
            </div>

            {profileNotice && (
              <div
                className={`mb-6 p-3.5 rounded-lg border text-xs ${
                  profileNotice.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {profileNotice.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Registered Email (Supabase Auth)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800/70 rounded-lg text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0803 000 0000"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Academic Track</label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SS 3 Science">SS 3 Science</option>
                    <option value="SS 3 Arts">SS 3 Arts</option>
                    <option value="SS 3 Commercial">SS 3 Commercial</option>
                    <option value="SS 2">SS 2</option>
                    <option value="SS 1">SS 1</option>
                    <option value="UTME Candidate">UTME Candidate</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving to Supabase...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
