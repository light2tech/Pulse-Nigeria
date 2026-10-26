import { supabase } from './supabase';
import {
  PlatformSnapshot,
  UserProfile,
  ExamResult,
  ResourceAttachment,
  SavedResourceItem,
  SavedResourceType,
} from '../types';

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

export async function fetchSnapshotFromServer(): Promise<PlatformSnapshot> {
  return apiRequest<PlatformSnapshot>('/api/snapshot');
}

export async function registerSupabaseAccount(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'student' | 'admin';
  studentClass?: string;
}): Promise<UserProfile> {
  const { user } = await apiRequest<{ user: UserProfile }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  await supabase.auth
    .signInWithPassword({
      email: params.email.trim().toLowerCase(),
      password: params.password,
    })
    .catch(() => {});

  return user;
}

export async function signInSupabaseAccount(params: {
  email: string;
  password: string;
  requestedRole?: 'student' | 'admin';
}): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase();

  const { user, session } = await apiRequest<{
    user: UserProfile;
    session?: { access_token: string; refresh_token: string } | null;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: cleanEmail,
      password: params.password,
      requestedRole: params.requestedRole,
    }),
  });

  if (session?.access_token && session?.refresh_token) {
    await supabase.auth
      .setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })
      .catch(() => {});
  }

  return user;
}

export async function syncAuthenticatedProfile(
  userId: string,
  email: string,
  requestedRole?: 'student' | 'admin'
): Promise<UserProfile> {
  const { user } = await apiRequest<{ user: UserProfile }>('/api/auth/sync-profile', {
    method: 'POST',
    body: JSON.stringify({ userId, email, requestedRole }),
  });
  return user;
}

export async function updateProfileOnServer(
  userId: string,
  updates: {
    name: string;
    phone: string;
    studentClass?: string;
    avatarUrl?: string;
    role?: 'student' | 'admin';
  }
): Promise<UserProfile> {
  const { user } = await apiRequest<{ user: UserProfile }>(`/api/profile/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return user;
}

export async function toggleResourceBookmarkOnServer(params: {
  userId: string;
  resourceId: string;
  resourceType: SavedResourceType;
  action?: 'toggle' | 'add' | 'remove';
}): Promise<{ savedResources: SavedResourceItem[]; isSaved: boolean; snapshot?: PlatformSnapshot }> {
  return apiRequest<{ savedResources: SavedResourceItem[]; isSaved: boolean; snapshot?: PlatformSnapshot }>(
    `/api/profile/${encodeURIComponent(params.userId)}/bookmarks`,
    {
      method: 'POST',
      body: JSON.stringify({
        resourceId: params.resourceId,
        resourceType: params.resourceType,
        action: params.action || 'toggle',
      }),
    }
  );
}

export async function uploadProfileAvatarToSupabase(file: File, userId: string): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  const { avatarUrl } = await apiRequest<{ avatarUrl: string }>(
    `/api/profile/${encodeURIComponent(userId)}/avatar`,
    {
      method: 'POST',
      body: JSON.stringify({
        dataUrl,
        fileName: file.name,
      }),
    }
  );

  return avatarUrl;
}

export async function uploadAcademicResourceToSupabase(file: File): Promise<ResourceAttachment> {
  if (file.size > 18 * 1024 * 1024) {
    throw new Error('File exceeds 18 MB upload limit. Please select a smaller document or PDF.');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });

  const { attachment } = await apiRequest<{ attachment: ResourceAttachment }>('/api/upload/resource', {
    method: 'POST',
    body: JSON.stringify({
      dataUrl,
      fileName: file.name,
    }),
  });

  return attachment;
}

export async function submitExamToServer(params: {
  userId: string;
  userName: string;
  title: string;
  result: ExamResult;
}): Promise<PlatformSnapshot> {
  const { snapshot } = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/exams/submit', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return snapshot;
}

export async function logMaterialReadingOnServer(params: {
  userId?: string;
  userName?: string;
  materialTitle: string;
  subject: string;
}): Promise<PlatformSnapshot> {
  const { snapshot } = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/activity/read', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return snapshot;
}

export { apiRequest };
