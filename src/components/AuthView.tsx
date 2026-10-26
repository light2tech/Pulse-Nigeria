import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { registerSupabaseAccount, signInSupabaseAccount } from '../lib/supabaseService';
import { VISUAL_ASSETS } from '../data/mockData';
import { usePlatform } from '../lib/realtimeStore';

interface AuthViewProps {
  mode: 'login' | 'register';
  setCurrentView: (view: AppView) => void;
  setCurrentUser: (user: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ mode, setCurrentView, setCurrentUser }) => {
  const { refreshSnapshot } = usePlatform();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentClass, setStudentClass] = useState('SS 3 Science');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const targetRole: 'student' | 'admin' = isAdminMode ? 'admin' : 'student';

      if (mode === 'register') {
        const createdUser = await registerSupabaseAccount({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          role: targetRole,
          studentClass: isAdminMode ? 'Administrator' : studentClass,
        });
        await refreshSnapshot();
        setCurrentUser(createdUser);
        setCurrentView(createdUser.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        const signedInUser = await signInSupabaseAccount({
          email: email.trim().toLowerCase(),
          password,
          requestedRole: isAdminMode ? 'admin' : undefined,
        });
        await refreshSnapshot();
        setCurrentUser(signedInUser);
        setCurrentView(signedInUser.role === 'admin' ? 'admin' : 'dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 font-body text-zinc-100">
      {/* Left Editorial Academic Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 p-12 flex-col justify-between overflow-hidden border-r border-zinc-800">
        <img
          src={VISUAL_ASSETS.heroScholar}
          alt="University-bound Nigerian student studying on laptop"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40" />

        <div className="relative z-10">
          <button
            onClick={() => setCurrentView('landing')}
            className="font-headline text-xl font-bold flex items-center gap-2.5 text-zinc-100 hover:text-white whitespace-nowrap cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-emerald-400 text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
            <span>EduPulse Nigeria</span>
          </button>
        </div>

        <div className="relative z-10 max-w-lg mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-4">
            <span>JAMB UTME</span>
            <span aria-hidden="true">·</span>
            <span>WASSCE</span>
            <span aria-hidden="true">·</span>
            <span>NECO SSCE</span>
          </div>
          <h1 className="font-headline text-3xl xl:text-4xl font-bold mb-4 leading-tight text-white">
            Structured Examination Readiness &amp; Real-Time Analytics.
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your account, study progress, profile customizations, and examination diagnostics synchronize directly with Supabase in real time.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs text-zinc-500">
          <span>EduPulse Nigeria Assessment Platform</span>
          <span aria-hidden="true">·</span>
          <span>Supabase Cloud Auth</span>
        </div>
      </div>

      {/* Right Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-zinc-950">
        <div className="max-w-md w-full bg-zinc-900 p-8 rounded-xl border border-zinc-800">
          <div className="mb-7">
            <button
              onClick={() => setCurrentView('landing')}
              className="lg:hidden font-headline text-lg font-bold text-white inline-flex items-center gap-2 mb-5 whitespace-nowrap cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-xl text-emerald-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
              <span>EduPulse Nigeria</span>
            </button>

            <h2 className="font-headline text-2xl font-bold text-white">
              {isAdminMode
                ? mode === 'login'
                  ? 'Administrator Sign In'
                  : 'Create Administrator Account'
                : mode === 'login'
                  ? 'Sign In to Workspace'
                  : 'Create Scholar Account'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5">
              {isAdminMode
                ? 'Authenticate with your Supabase administrator credentials to manage users, curriculum, and CBT bank.'
                : mode === 'login'
                  ? 'Enter your registered email and password to resume your personalized curriculum.'
                  : 'Register with Supabase Auth to track your CBT readiness and study mastery.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base text-red-400 shrink-0 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAdminMode ? 'Dr. Adewale Ogunleye' : 'Chiamaka Nwosu'}
                    className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg w-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0803 000 0000"
                      className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg w-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {!isAdminMode && (
                    <div>
                      <label className="block text-zinc-300 font-medium mb-1.5">Academic Track</label>
                      <select
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg w-full text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="SS 3 Science">SS 3 Science</option>
                        <option value="SS 3 Arts">SS 3 Arts</option>
                        <option value="SS 3 Commercial">SS 3 Commercial</option>
                        <option value="SS 2">SS 2</option>
                        <option value="SS 1">SS 1</option>
                        <option value="UTME Candidate">UTME Candidate</option>
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminMode ? 'admin@edupulse.ng' : 'scholar@example.com'}
                className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg w-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="pl-3.5 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg w-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              {isSubmitting
                ? 'Authenticating with Supabase...'
                : isAdminMode
                  ? mode === 'login'
                    ? 'Login as Admin'
                    : 'Sign Up as Admin'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
            </button>
          </form>

          {/* Account Mode Switcher + Hidden Straight Thick Line Admin Trigger */}
          <div className="mt-6 text-center text-xs text-zinc-400">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentView('register');
                  }}
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setCurrentView('login');
                  }}
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            )}

            {/* Hidden Admin Trigger: Straight Thick Line directly under "Don't have an account? Sign Up" */}
            <div className="mt-2 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setIsAdminMode((prev) => !prev);
                }}
                aria-label="Toggle administrator access"
                aria-expanded={isAdminMode}
                className="group py-3 px-6 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded"
              >
                <span
                  className={`block w-28 h-[4px] transition-colors duration-150 ${
                    isAdminMode ? 'bg-emerald-400' : 'bg-zinc-700 group-hover:bg-zinc-500'
                  }`}
                />
              </button>

              {isAdminMode && (
                <div className="w-full pt-3 mt-1 border-t border-zinc-800 flex flex-col items-center gap-2.5">
                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setIsAdminMode(true);
                        setCurrentView('login');
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        mode === 'login'
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      Login as Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setIsAdminMode(true);
                        setCurrentView('register');
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        mode === 'register'
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      Sign Up as Admin
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAdminMode(false)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Return to Student Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
