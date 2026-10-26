import { createClient } from '@supabase/supabase-js';

const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_PUBLISHABLE_KEY = 'placeholder-anon-key-configure-env';

export function normalizeSupabaseUrl(raw?: string | null): string {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed.includes('your-project-ref')) return PLACEHOLDER_SUPABASE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, '');
  if (/^[a-z0-9]{15,30}$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  return PLACEHOLDER_SUPABASE_URL;
}

export function normalizePublishableKey(raw?: string | null): string {
  const trimmed = (raw || '').trim();
  if (trimmed.length >= 20 && !trimmed.startsWith('your_')) {
    return trimmed;
  }
  return PLACEHOLDER_PUBLISHABLE_KEY;
}

const rawEnvUrl =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined);

const rawEnvKey =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_PUBLISHABLE_KEY : undefined);

export const SUPABASE_URL = normalizeSupabaseUrl(rawEnvUrl);
export const SUPABASE_PUBLISHABLE_KEY = normalizePublishableKey(rawEnvKey);

export const isClientSupabaseConfigured =
  SUPABASE_URL !== PLACEHOLDER_SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY !== PLACEHOLDER_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
