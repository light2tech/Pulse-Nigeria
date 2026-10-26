import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { clearActiveSession } from '../lib/userStore';
import { supabase } from '../lib/supabase';
import { usePlatform } from '../lib/realtimeStore';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  setCurrentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wsConnected, snapshot } = usePlatform();

  const handleLogout = async () => {
    clearActiveSession();
    await supabase.auth.signOut().catch(() => {});
    setCurrentUser(null);
    setCurrentView('login');
  };

  const isLive = snapshot.supabaseConnected || wsConnected;

  return (
    <nav className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/90 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setCurrentView('landing')}
          className="font-headline text-lg font-bold text-zinc-100 flex items-center gap-2.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span
            className="material-symbols-outlined text-emerald-400 text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            school
          </span>
          <span>EduPulse Nigeria</span>
        </button>

        {/* Zone 2: Primary Navigation Links (Single-line, max 4 links) */}
        <div className="hidden md:flex items-center gap-7">
          <button
            onClick={() => setCurrentView('landing')}
            className={`text-sm transition-colors whitespace-nowrap shrink-0 py-5 border-b-2 cursor-pointer ${
              currentView === 'landing'
                ? 'text-zinc-100 font-semibold border-emerald-400'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setCurrentView('cbt')}
            className={`text-sm transition-colors whitespace-nowrap shrink-0 py-5 border-b-2 cursor-pointer ${
              currentView === 'cbt'
                ? 'text-zinc-100 font-semibold border-emerald-400'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            CBT Simulator
          </button>

          <button
            onClick={() => setCurrentView(currentUser ? 'dashboard' : 'login')}
            className={`text-sm transition-colors whitespace-nowrap shrink-0 py-5 border-b-2 cursor-pointer ${
              currentView === 'dashboard'
                ? 'text-zinc-100 font-semibold border-emerald-400'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            Student Workspace
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`text-sm transition-colors whitespace-nowrap shrink-0 py-5 border-b-2 cursor-pointer ${
                currentView === 'admin'
                  ? 'text-zinc-100 font-semibold border-emerald-400'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              Admin Console
            </button>
          )}
        </div>

        {/* Zone 3: Real-Time Status & Account Action */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <div
            className="flex items-center gap-2 text-xs text-zinc-400 whitespace-nowrap"
            title={isLive ? 'Connected to Supabase & Real-Time Sync' : 'Reconnecting to Real-Time Server'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="tabular-nums">{isLive ? 'Live Sync' : 'Syncing'}</span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer text-left"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                />
                <span className="text-xs font-medium text-zinc-200 max-w-[130px] truncate whitespace-nowrap">
                  {currentUser.name}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-zinc-300 p-2 hover:bg-zinc-900 rounded-lg"
          aria-label="Toggle navigation"
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4 flex flex-col gap-2">
          <button
            onClick={() => {
              setCurrentView('landing');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2.5 px-3 text-sm text-zinc-200 font-medium hover:bg-zinc-900 rounded-lg"
          >
            Overview
          </button>
          <button
            onClick={() => {
              setCurrentView('cbt');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2.5 px-3 text-sm text-zinc-200 font-medium hover:bg-zinc-900 rounded-lg"
          >
            CBT Simulator
          </button>
          <button
            onClick={() => {
              setCurrentView(currentUser ? 'dashboard' : 'login');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2.5 px-3 text-sm text-zinc-200 font-medium hover:bg-zinc-900 rounded-lg"
          >
            Student Workspace
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 text-sm text-emerald-400 font-semibold hover:bg-zinc-900 rounded-lg"
            >
              Admin Console
            </button>
          )}
          <div className="pt-2 mt-1 border-t border-zinc-800">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 text-center bg-zinc-900 text-zinc-200 text-xs font-semibold border border-zinc-800 rounded-lg"
              >
                Sign Out ({currentUser.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentView('login');
                }}
                className="w-full py-2.5 text-center bg-emerald-500 text-zinc-950 text-xs font-semibold rounded-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
