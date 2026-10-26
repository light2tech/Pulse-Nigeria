import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppView,
  UserProfile,
  StudyMaterial,
  PastQuestionPaper,
  CbtLaunchConfig,
  SavedResourceItem,
  SavedResourceType,
} from './types';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { CbtExamView } from './components/CbtExamView';
import { StudentDashboardView } from './components/StudentDashboardView';
import { AdminPortalView } from './components/AdminPortalView';
import { AuthView } from './components/AuthView';
import { MaterialReaderModal } from './components/MaterialReaderModal';
import { PastQuestionViewerModal } from './components/PastQuestionViewerModal';
import { getActiveSessionUser, saveUserProfile, clearActiveSession } from './lib/userStore';
import { supabase } from './lib/supabase';
import { syncAuthenticatedProfile, toggleResourceBookmarkOnServer } from './lib/supabaseService';
import { PlatformProvider, usePlatform } from './lib/realtimeStore';
import { SpeedInsights } from '@vercel/speed-insights/react';

function AppShell() {
  const { reportPresence, snapshot } = usePlatform();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() =>
    getActiveSessionUser()
  );
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [selectedPastQuestion, setSelectedPastQuestion] = useState<PastQuestionPaper | null>(null);
  const [cbtLaunchConfig, setCbtLaunchConfig] = useState<CbtLaunchConfig>({
    mode: 'standard',
  });
  const pendingBookmarkMutationsRef = useRef<number>(0);

  const setCurrentUser = useCallback((user: UserProfile | null) => {
    if (!user) {
      clearActiveSession();
      setCurrentUserState(null);
      return;
    }
    const saved = saveUserProfile(user);
    setCurrentUserState(saved);
  }, []);

  // Restore active session on mount (works via Supabase client session OR cached profile synced against /api/auth/sync-profile)
  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        const { data } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        const sessionUser = data?.session?.user;
        const cachedUser = getActiveSessionUser();
        const targetId = sessionUser?.id || cachedUser?.id;
        const targetEmail = sessionUser?.email || cachedUser?.email;
        if (!mounted || !targetId || !targetEmail) return;

        const synced = await syncAuthenticatedProfile(targetId, targetEmail);
        if (mounted) {
          setCurrentUser(synced);
        }
      } catch {
        // Keep cached local session if offline
      }
    };
    restore();
    return () => {
      mounted = false;
    };
  }, [setCurrentUser]);

  // Reconcile savedResources from real-time WebSocket snapshots across tabs/devices when idle
  useEffect(() => {
    if (!currentUser || pendingBookmarkMutationsRef.current > 0) return;
    const liveMatch = snapshot.users.find((u) => u.id === currentUser.id);
    if (!liveMatch || !Array.isArray(liveMatch.savedResources)) return;

    const localSerialized = JSON.stringify(currentUser.savedResources || []);
    const remoteSerialized = JSON.stringify(liveMatch.savedResources);
    if (localSerialized !== remoteSerialized) {
      setCurrentUser({
        ...currentUser,
        savedResources: liveMatch.savedResources,
      });
    }
  }, [snapshot.users, currentUser, setCurrentUser]);

  // Broadcast current screen presence over WebSocket
  useEffect(() => {
    if (currentView !== 'cbt') {
      reportPresence(currentView, currentUser, null);
    }
  }, [currentView, currentUser, reportPresence]);

  const handleLaunchCbt = (config: CbtLaunchConfig) => {
    setCbtLaunchConfig(config);
    setCurrentView('cbt');
  };

  const savedResources: SavedResourceItem[] = currentUser?.savedResources || [];

  const isResourceSaved = useCallback(
    (resourceId: string, resourceType: SavedResourceType): boolean => {
      return savedResources.some(
        (item) => item.resourceId === resourceId && item.resourceType === resourceType
      );
    },
    [savedResources]
  );

  const handleToggleBookmark = useCallback(
    async (resourceId: string, resourceType: SavedResourceType) => {
      if (!currentUser) {
        setSelectedMaterial(null);
        setSelectedPastQuestion(null);
        setCurrentView('login');
        return;
      }

      const previousList = currentUser.savedResources || [];
      const alreadySaved = previousList.some(
        (item) => item.resourceId === resourceId && item.resourceType === resourceType
      );
      const action: 'add' | 'remove' = alreadySaved ? 'remove' : 'add';

      const optimisticList: SavedResourceItem[] = alreadySaved
        ? previousList.filter(
            (item) => !(item.resourceId === resourceId && item.resourceType === resourceType)
          )
        : [
            {
              resourceId,
              resourceType,
              savedAt: new Date().toISOString(),
            },
            ...previousList,
          ];

      // Immediate optimistic update + localStorage cache
      const optimisticUser: UserProfile = {
        ...currentUser,
        savedResources: optimisticList,
      };
      setCurrentUser(optimisticUser);

      pendingBookmarkMutationsRef.current += 1;
      try {
        const res = await toggleResourceBookmarkOnServer({
          userId: currentUser.id,
          resourceId,
          resourceType,
          action,
        });
        if (Array.isArray(res.savedResources)) {
          setCurrentUserState((prev) => {
            if (!prev || prev.id !== currentUser.id) return prev;
            return saveUserProfile({
              ...prev,
              savedResources: res.savedResources,
            });
          });
        }
      } catch {
        // Rollback if server rejected mutation
        setCurrentUserState((prev) => {
          if (!prev || prev.id !== currentUser.id) return prev;
          return saveUserProfile({
            ...prev,
            savedResources: previousList,
          });
        });
      } finally {
        pendingBookmarkMutationsRef.current = Math.max(0, pendingBookmarkMutationsRef.current - 1);
      }
    },
    [currentUser, setCurrentUser]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-body selection:bg-emerald-500/30 selection:text-emerald-200">
      {currentView !== 'login' && currentView !== 'register' && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}

      {snapshot.configMissing && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-xs text-amber-200">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-amber-300">Supabase Environment Variables Missing: </span>
              Add <code className="font-mono text-amber-100">SUPABASE_URL</code>,{' '}
              <code className="font-mono text-amber-100">SUPABASE_PUBLISHABLE_KEY</code>, and{' '}
              <code className="font-mono text-amber-100">SUPABASE_SECRET_KEY</code> in your deployment&apos;s Environment Variables settings (e.g. Vercel → Settings → Environment Variables) and redeploy.
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            setCurrentView={setCurrentView}
            currentUser={currentUser}
            onOpenMaterial={(mat) => setSelectedMaterial(mat)}
            onOpenPastQuestion={(paper) => setSelectedPastQuestion(paper)}
            onLaunchCbt={handleLaunchCbt}
            isResourceSaved={isResourceSaved}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentView === 'cbt' && (
          <CbtExamView
            setCurrentView={setCurrentView}
            currentUser={currentUser}
            launchConfig={cbtLaunchConfig}
            setLaunchConfig={setCbtLaunchConfig}
          />
        )}

        {currentView === 'dashboard' &&
          (currentUser ? (
            <StudentDashboardView
              currentUser={currentUser}
              setCurrentUser={(u) => setCurrentUser(u)}
              setCurrentView={setCurrentView}
              onOpenMaterial={(mat) => setSelectedMaterial(mat)}
              onOpenPastQuestion={(paper) => setSelectedPastQuestion(paper)}
              onLaunchCbt={handleLaunchCbt}
              isResourceSaved={isResourceSaved}
              onToggleBookmark={handleToggleBookmark}
            />
          ) : (
            <AuthView
              mode="login"
              setCurrentView={setCurrentView}
              setCurrentUser={(u) => setCurrentUser(u)}
            />
          ))}

        {currentView === 'admin' &&
          (currentUser?.role === 'admin' ? (
            <AdminPortalView
              currentUser={currentUser}
              onPreviewPastQuestion={(paper) => setSelectedPastQuestion(paper)}
              onPreviewMaterial={(mat) => setSelectedMaterial(mat)}
            />
          ) : currentUser ? (
            <StudentDashboardView
              currentUser={currentUser}
              setCurrentUser={(u) => setCurrentUser(u)}
              setCurrentView={setCurrentView}
              onOpenMaterial={(mat) => setSelectedMaterial(mat)}
              onOpenPastQuestion={(paper) => setSelectedPastQuestion(paper)}
              onLaunchCbt={handleLaunchCbt}
              isResourceSaved={isResourceSaved}
              onToggleBookmark={handleToggleBookmark}
            />
          ) : (
            <AuthView
              mode="login"
              setCurrentView={setCurrentView}
              setCurrentUser={(u) => setCurrentUser(u)}
            />
          ))}

        {(currentView === 'login' || currentView === 'register') && (
          <AuthView
            mode={currentView}
            setCurrentView={setCurrentView}
            setCurrentUser={(u) => setCurrentUser(u)}
          />
        )}
      </div>

      {selectedMaterial && (
        <MaterialReaderModal
          material={selectedMaterial}
          currentUser={currentUser}
          onClose={() => setSelectedMaterial(null)}
          onLaunchSubjectCbt={handleLaunchCbt}
          setCurrentView={setCurrentView}
          isSaved={isResourceSaved(selectedMaterial.id, 'material')}
          onToggleBookmark={() => handleToggleBookmark(selectedMaterial.id, 'material')}
        />
      )}

      {selectedPastQuestion && (
        <PastQuestionViewerModal
          paper={selectedPastQuestion}
          currentUser={currentUser}
          onClose={() => setSelectedPastQuestion(null)}
          onLaunchSubjectCbt={handleLaunchCbt}
          isSaved={isResourceSaved(selectedPastQuestion.id, 'past_question')}
          onToggleBookmark={() => handleToggleBookmark(selectedPastQuestion.id, 'past_question')}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlatformProvider>
      <AppShell />
      <SpeedInsights />
    </PlatformProvider>
  );
}
