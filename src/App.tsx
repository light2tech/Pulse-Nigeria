import React, { useState, useEffect } from 'react';
import {
  AppView,
  UserProfile,
  StudyMaterial,
  PastQuestionPaper,
  CbtLaunchConfig,
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
import { syncAuthenticatedProfile } from './lib/supabaseService';
import { PlatformProvider, usePlatform } from './lib/realtimeStore';

function AppShell() {
  const { reportPresence } = usePlatform();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() =>
    getActiveSessionUser()
  );
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [selectedPastQuestion, setSelectedPastQuestion] = useState<PastQuestionPaper | null>(null);
  const [cbtLaunchConfig, setCbtLaunchConfig] = useState<CbtLaunchConfig>({
    mode: 'standard',
  });

  const setCurrentUser = (user: UserProfile | null) => {
    if (!user) {
      clearActiveSession();
      setCurrentUserState(null);
      return;
    }
    const saved = saveUserProfile(user);
    setCurrentUserState(saved);
  };

  // Restore active Supabase Auth session on mount without overwriting saved profile customizations
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data?.session?.user;
      if (!mounted || !sessionUser?.email) return;
      try {
        const synced = await syncAuthenticatedProfile(sessionUser.id, sessionUser.email);
        if (mounted) {
          setCurrentUser(synced);
        }
      } catch {
        // Keep cached local session if offline
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

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

      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            setCurrentView={setCurrentView}
            currentUser={currentUser}
            onOpenMaterial={(mat) => setSelectedMaterial(mat)}
            onOpenPastQuestion={(paper) => setSelectedPastQuestion(paper)}
            onLaunchCbt={handleLaunchCbt}
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
        />
      )}

      {selectedPastQuestion && (
        <PastQuestionViewerModal
          paper={selectedPastQuestion}
          currentUser={currentUser}
          onClose={() => setSelectedPastQuestion(null)}
          onLaunchSubjectCbt={handleLaunchCbt}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlatformProvider>
      <AppShell />
    </PlatformProvider>
  );
}
