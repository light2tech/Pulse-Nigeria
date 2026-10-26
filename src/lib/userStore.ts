import { UserProfile } from '../types';

const PROFILES_KEY = 'edupulse_saved_profiles_v2';
const ACTIVE_USER_KEY = 'edupulse_active_session_v2';

export function buildAvatarDataUri(name: string, email?: string): string {
  const label =
    (name || email || 'Scholar')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'EP';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#18181b"/><circle cx="64" cy="64" r="62" fill="none" stroke="#10b981" stroke-opacity="0.35" stroke-width="2"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#34d399" font-family="Plus Jakarta Sans, sans-serif" font-size="44" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getSavedProfiles(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveUserProfile(profile: UserProfile): UserProfile {
  const cleanEmail = (profile.email || '').trim().toLowerCase();
  const normalized: UserProfile = {
    ...profile,
    email: cleanEmail,
    avatarUrl: profile.avatarUrl?.trim() || buildAvatarDataUri(profile.name, cleanEmail),
  };

  try {
    const profiles = getSavedProfiles();
    if (cleanEmail) {
      profiles[cleanEmail] = normalized;
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(normalized));
  } catch (err) {
    console.warn('Unable to cache profile locally:', err);
  }

  return normalized;
}

export function getActiveSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;
    const parsed: UserProfile = JSON.parse(raw);
    if (!parsed || !parsed.id || !parsed.email) return null;
    // Reject legacy mock IDs ('user-001' / 'admin-001') so only genuine Supabase accounts are active
    if (parsed.id === 'user-001' || parsed.id === 'admin-001') {
      localStorage.removeItem(ACTIVE_USER_KEY);
      return null;
    }
    const profiles = getSavedProfiles();
    const cleanEmail = parsed.email.trim().toLowerCase();
    return profiles[cleanEmail] || parsed;
  } catch {
    return null;
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } catch {
    // ignore storage errors
  }
}
