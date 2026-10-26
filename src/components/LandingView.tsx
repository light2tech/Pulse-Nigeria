import React, { useState, useMemo } from 'react';
import {
  AppView,
  StudyMaterial,
  PastQuestionPaper,
  CbtLaunchConfig,
  UserProfile,
} from '../types';
import { usePlatform } from '../lib/realtimeStore';
import { VISUAL_ASSETS, getMaterialCoverImage } from '../data/mockData';

interface LandingViewProps {
  setCurrentView: (view: AppView) => void;
  currentUser: UserProfile | null;
  onOpenMaterial: (material: StudyMaterial) => void;
  onOpenPastQuestion: (paper: PastQuestionPaper) => void;
  onLaunchCbt: (config: CbtLaunchConfig) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  setCurrentView,
  currentUser,
  onOpenMaterial,
  onOpenPastQuestion,
  onLaunchCbt,
}) => {
  const { snapshot, isLoading } = usePlatform();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [catalogMode, setCatalogMode] = useState<'materials' | 'past_questions'>('materials');

  const subjects = snapshot.subjects;
  const materials = snapshot.materials;
  const pastQuestions = snapshot.pastQuestions;
  const questionsCount = snapshot.questions.length;

  const allSubjectTabs = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((s) => map.set(s.name.toLowerCase(), s.name));
    materials.forEach((m) => {
      if (!map.has(m.subject.toLowerCase())) map.set(m.subject.toLowerCase(), m.subject);
    });
    pastQuestions.forEach((pq) => {
      if (!map.has(pq.subject.toLowerCase())) map.set(pq.subject.toLowerCase(), pq.subject);
    });
    return Array.from(map.values());
  }, [subjects, materials, pastQuestions]);

  const filteredMaterials =
    selectedSubjectFilter === 'All'
      ? materials
      : materials.filter(
          (m) =>
            m.subject.toLowerCase() === selectedSubjectFilter.toLowerCase() ||
            selectedSubjectFilter.toLowerCase().includes(m.subject.toLowerCase())
        );

  const filteredPastQuestions =
    selectedSubjectFilter === 'All'
      ? pastQuestions
      : pastQuestions.filter(
          (pq) =>
            pq.subject.toLowerCase() === selectedSubjectFilter.toLowerCase() ||
            selectedSubjectFilter.toLowerCase().includes(pq.subject.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Editorial Hero Section */}
      <header className="border-b border-zinc-800/80 bg-zinc-950">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy & Live Platform Metrics */}
            <div className="lg:col-span-7 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-5">
                <span>JAMB UTME</span>
                <span aria-hidden="true">·</span>
                <span>WAEC WASSCE</span>
                <span aria-hidden="true">·</span>
                <span>NECO SSCE</span>
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl lg:text-[44px] font-bold text-white leading-[1.12] tracking-tight mb-6">
                Precision Computer-Based Testing, Past Questions &amp; Reading Library for Nigerian Scholars.
              </h1>

              <p className="font-body text-base text-zinc-400 leading-relaxed mb-8 max-w-xl">
                Practice under authentic timed examination conditions, study official WAEC/JAMB/NECO past questions and answers across any subject, and master structured reading notes synchronized live.
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => onLaunchCbt({ mode: 'standard' })}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-6 py-3.5 rounded-lg transition-colors btn-press flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Enter CBT Simulator</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>

                <button
                  onClick={() => setCurrentView(currentUser ? 'dashboard' : 'login')}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-sm px-6 py-3.5 rounded-lg border border-zinc-800 transition-colors btn-press cursor-pointer whitespace-nowrap"
                >
                  {currentUser ? 'Open Student Workspace' : 'Sign In to Track Progress'}
                </button>
              </div>

              {/* Live Authoritative Database Counters (Zero Dummy Numbers) */}
              <div className="mt-12 pt-8 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="font-headline text-2xl font-bold text-white tabular-nums">
                    {isLoading ? '—' : subjects.length}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">Active Subjects</div>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-white tabular-nums">
                    {isLoading ? '—' : questionsCount}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">Published CBT Items</div>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-white tabular-nums">
                    {isLoading ? '—' : pastQuestions.length}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">Past Q&amp;A Papers</div>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-white tabular-nums">
                    {isLoading ? '—' : materials.length}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">Reading Materials</div>
                </div>
              </div>
            </div>

            {/* Right Visual Anchor */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[4/3]">
                <img
                  src={VISUAL_ASSETS.heroScholar}
                  alt="Focused Nigerian student practicing CBT examination on a laptop"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">Keyboard-Driven CBT Engine</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Supports A/B/C/D selection · N/P navigation · Instant UTME /400 projection
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-emerald-400 text-xl shrink-0">
                    keyboard
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Live Curriculum Subjects Section */}
      <section className="py-16 border-b border-zinc-800/80" id="curriculum">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-headline text-2xl font-bold text-white">
                Enrolled Syllabus &amp; Subject Tracks
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Live subject catalog synchronized directly from your Supabase curriculum database.
              </p>
            </div>
            <button
              onClick={() => setCurrentView(currentUser ? 'dashboard' : 'login')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View Personal Mastery Matrix</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
              <p className="text-sm font-medium text-zinc-300">
                No curriculum subjects configured in Supabase yet.
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Administrators can upload resources on any subject from the Admin Console.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {subjects.map((sub) => {
                const liveQCount = snapshot.questions.filter(
                  (q) =>
                    q.subject.toLowerCase() === sub.name.toLowerCase() ||
                    sub.name.toLowerCase().includes(q.subject.toLowerCase())
                ).length;
                const liveMCount = snapshot.materials.filter(
                  (m) =>
                    m.subject.toLowerCase() === sub.name.toLowerCase() ||
                    sub.name.toLowerCase().includes(m.subject.toLowerCase())
                ).length;
                const livePQCount = snapshot.pastQuestions.filter(
                  (pq) =>
                    pq.subject.toLowerCase() === sub.name.toLowerCase() ||
                    sub.name.toLowerCase().includes(pq.subject.toLowerCase())
                ).length;

                return (
                  <div
                    key={sub.id}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">
                            {sub.iconName || 'menu_book'}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400">{sub.tag}</span>
                      </div>

                      <h3 className="font-headline text-lg font-bold text-white mb-2">{sub.name}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-6">{sub.description}</p>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 tabular-nums">
                        {liveMCount} notes · {livePQCount} past Q&amp;A · {liveQCount} CBT
                      </span>
                      <button
                        onClick={() => onLaunchCbt({ mode: 'subject', subject: sub.name })}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Practice →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Published Reading Materials & Past Questions Archive Section */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-headline text-2xl font-bold text-white">
                Academic Library &amp; Past Questions Archive
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Verified reading materials and official past question papers published across any subject.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setCatalogMode('materials')}
                className={`px-3.5 py-2 rounded-lg font-medium cursor-pointer ${
                  catalogMode === 'materials'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                Reading Materials ({materials.length})
              </button>
              <button
                onClick={() => setCatalogMode('past_questions')}
                className={`px-3.5 py-2 rounded-lg font-medium cursor-pointer ${
                  catalogMode === 'past_questions'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                Past Questions &amp; Answers ({pastQuestions.length})
              </button>
            </div>
          </div>

          {allSubjectTabs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {['All', ...allSubjectTabs].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedSubjectFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedSubjectFilter === tab
                      ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {catalogMode === 'materials' ? (
            filteredMaterials.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    No published reading materials in Supabase{' '}
                    {selectedSubjectFilter !== 'All' ? `for ${selectedSubjectFilter}` : 'yet'}.
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Materials uploaded in the Admin Console appear here instantaneously in real time.
                  </p>
                </div>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    Upload Reading Material
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.slice(0, 6).map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="h-40 bg-zinc-950 border-b border-zinc-800 overflow-hidden">
                        <img
                          src={getMaterialCoverImage(mat.subject, mat.imageUrl)}
                          alt={mat.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-85"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                          <span className="text-emerald-400 font-medium">{mat.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span>{mat.level}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{mat.dateAdded}</span>
                        </div>
                        <h3 className="font-headline text-base font-bold text-white mb-2 line-clamp-2">
                          {mat.title}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {mat.summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 tabular-nums">
                        {mat.attachment
                          ? 'PDF / File Attached'
                          : `${mat.content?.length || 1} section${(mat.content?.length || 1) > 1 ? 's' : ''}`}
                      </span>
                      <button
                        onClick={() => onOpenMaterial(mat)}
                        className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Read Material
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredPastQuestions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  No Past Questions &amp; Answers uploaded{' '}
                  {selectedSubjectFilter !== 'All' ? `for ${selectedSubjectFilter}` : 'yet'}.
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  WAEC, JAMB, and NECO past papers uploaded by Administrators appear here immediately.
                </p>
              </div>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer"
                >
                  Upload Past Questions
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPastQuestions.slice(0, 6).map((paper) => (
                <div
                  key={paper.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 tabular-nums">
                      <span className="text-emerald-400 font-semibold">{paper.subject}</span>
                      <span>
                        {paper.examBody} · {paper.examYear}
                      </span>
                    </div>
                    <h3 className="font-headline text-base font-bold text-white mb-2 line-clamp-2">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {paper.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 tabular-nums">
                      {paper.items.length} Q&amp;A{paper.attachment ? ' + File' : ''}
                    </span>
                    <button
                      onClick={() => onOpenPastQuestion(paper)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Open Q&amp;A Paper
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/80 py-10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2.5 text-zinc-300 font-headline font-semibold">
            <span className="material-symbols-outlined text-emerald-400 text-lg">school</span>
            <span>EduPulse Nigeria</span>
            <span className="text-zinc-600 font-body font-normal">
              · Real-Time CBT &amp; Past Questions Platform
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onLaunchCbt({ mode: 'standard' })}
              className="hover:text-zinc-300 cursor-pointer"
            >
              CBT Simulator
            </button>
            <button
              onClick={() => setCurrentView(currentUser ? 'dashboard' : 'login')}
              className="hover:text-zinc-300 cursor-pointer"
            >
              Student Workspace
            </button>
            {!currentUser && (
              <button
                onClick={() => setCurrentView('login')}
                className="hover:text-zinc-300 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
