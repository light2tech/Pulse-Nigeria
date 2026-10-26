import { supabase, isClientSupabaseConfigured } from './supabase';
import {
  PlatformSnapshot,
  PlatformUser,
  UserProfile,
  ExamResult,
  ResourceAttachment,
  SavedResourceItem,
  SavedResourceType,
  StudyMaterial,
  PastQuestionPaper,
  CbtQuestion,
  SubjectItem,
} from '../types';

class ApiHttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
  }
}

function buildClientInitialsAvatar(name: string, email: string): string {
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

function deriveClientNameFromEmail(email: string): string {
  const local = (email.split('@')[0] || 'Scholar').trim();
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function normalizeClientSavedResources(raw: unknown): SavedResourceItem[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const normalized: SavedResourceItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const resourceId = String((item as any).resourceId || '').trim();
    const rawType = (item as any).resourceType;
    const resourceType: SavedResourceType | null =
      rawType === 'past_question' ? 'past_question' : rawType === 'material' ? 'material' : null;
    if (!resourceId || !resourceType) continue;
    const key = `${resourceType}:${resourceId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({
      resourceId,
      resourceType,
      savedAt: String((item as any).savedAt || new Date().toISOString()),
    });
  }
  return normalized;
}

function isRouteUnavailableError(err: unknown): boolean {
  return err instanceof ApiHttpError && (err.status === 404 || err.status === 405 || err.status === 502);
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {};
    throw new ApiHttpError(
      payload?.error || `Request failed (${response.status})`,
      response.status
    );
  }

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiHttpError('API returned HTML instead of JSON.', 404);
    }
  }

  return (await response.json()) as T;
}

async function buildClientUserProfileFromAuth(
  authUser: any,
  requestedRole?: 'student' | 'admin'
): Promise<UserProfile> {
  const userId = String(authUser.id);
  const email = String(authUser.email || '').trim().toLowerCase();
  const meta = authUser.user_metadata || {};

  let existingProfile: any = null;
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    existingProfile = data;
  } catch {
    // Profiles table may have RLS or not be created yet
  }

  const resolvedRole: 'student' | 'admin' =
    requestedRole === 'admin' || existingProfile?.role === 'admin' || meta.role === 'admin'
      ? 'admin'
      : 'student';

  const resolvedName =
    existingProfile?.name ||
    meta.full_name ||
    meta.name ||
    deriveClientNameFromEmail(email || 'Scholar');
  const resolvedPhone = existingProfile?.phone ?? meta.phone ?? '';
  const resolvedClass =
    existingProfile?.student_class ||
    meta.student_class ||
    (resolvedRole === 'admin' ? 'Administrator' : 'SS 3 Science');
  const resolvedStreak = typeof existingProfile?.streak_days === 'number' ? existingProfile.streak_days : 1;
  const rawAvatar = existingProfile?.avatar_url || meta.avatar_url || '';
  const avatarUrl =
    rawAvatar && !rawAvatar.startsWith('storage://')
      ? rawAvatar
      : buildClientInitialsAvatar(resolvedName, email);

  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: resolvedName,
      email,
      phone: resolvedPhone,
      role: resolvedRole,
      student_class: resolvedClass,
      avatar_url: rawAvatar || null,
      streak_days: resolvedStreak,
    });
  } catch {
    // Ignore optional RLS write failure on client fallback
  }

  return {
    id: userId,
    name: resolvedName,
    email,
    phone: resolvedPhone,
    role: resolvedRole,
    studentClass: resolvedClass,
    avatarUrl,
    streakDays: resolvedStreak,
    savedResources: normalizeClientSavedResources(meta.saved_resources),
  };
}

async function fetchSnapshotDirectlyFromSupabase(): Promise<PlatformSnapshot> {
  if (!isClientSupabaseConfigured) {
    return {
      users: [],
      materials: [],
      pastQuestions: [],
      questions: [],
      subjects: [],
      examResults: [],
      activityLogs: [],
      recentActivities: [],
      presence: [],
      supabaseConnected: false,
      configMissing: true,
      syncedAt: new Date().toISOString(),
    };
  }

  const [
    authRes,
    profilesRes,
    materialsRes,
    questionsRes,
    subjectsRes,
    examResultsRes,
    activityLogsRes,
    recentActivitiesRes,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('*'),
    supabase.from('study_materials').select('*').order('created_at', { ascending: false }),
    supabase.from('cbt_questions').select('*').order('id', { ascending: true }),
    supabase.from('subjects').select('*').order('name', { ascending: true }),
    supabase.from('exam_results').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('recent_activity').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  const rawProfiles = profilesRes.data || [];
  const rawExamResults = examResultsRes.data || [];
  const currentAuthUser = authRes.data?.user;
  const usersMap = new Map<string, PlatformUser>();

  for (const p of rawProfiles) {
    const id = String(p.id || '');
    if (!id) continue;
    const email = String(p.email || '').trim().toLowerCase();
    const name = String(p.name || deriveClientNameFromEmail(email || 'Scholar'));
    const userAttempts = rawExamResults.filter((r: any) => String(r.user_id || '') === id);
    const examAttemptsCount = userAttempts.length;
    const averageScore =
      examAttemptsCount > 0
        ? Math.round(
            userAttempts.reduce(
              (acc: number, item: any) => acc + (Number(item.score_percentage) || 0),
              0
            ) / examAttemptsCount
          )
        : null;

    usersMap.set(id, {
      id,
      name,
      email,
      phone: String(p.phone || ''),
      role: p.role === 'admin' ? 'admin' : 'student',
      studentClass: String(p.student_class || 'SS 3 Science'),
      avatarUrl:
        p.avatar_url && !String(p.avatar_url).startsWith('storage://')
          ? String(p.avatar_url)
          : buildClientInitialsAvatar(name, email),
      streakDays: typeof p.streak_days === 'number' ? p.streak_days : 1,
      savedResources: [],
      examAttemptsCount,
      averageScore,
    });
  }

  if (currentAuthUser) {
    const selfProfile = await buildClientUserProfileFromAuth(currentAuthUser);
    const selfAttempts = rawExamResults.filter(
      (r: any) => String(r.user_id || '') === selfProfile.id
    );
    const examAttemptsCount = selfAttempts.length;
    const averageScore =
      examAttemptsCount > 0
        ? Math.round(
            selfAttempts.reduce(
              (acc: number, item: any) => acc + (Number(item.score_percentage) || 0),
              0
            ) / examAttemptsCount
          )
        : null;
    usersMap.set(selfProfile.id, {
      ...selfProfile,
      examAttemptsCount,
      averageScore,
    });
  }

  const materials: StudyMaterial[] = [];
  const pastQuestions: PastQuestionPaper[] = [];

  for (const item of materialsRes.data || []) {
    const idStr = String(item.id || '');
    let rawContent = item.content;
    if (typeof rawContent === 'string') {
      try {
        rawContent = JSON.parse(rawContent);
      } catch {
        // leave as string
      }
    }

    const isPastQuestion =
      idStr.startsWith('pq-') ||
      (rawContent &&
        typeof rawContent === 'object' &&
        !Array.isArray(rawContent) &&
        rawContent.kind === 'past_question');

    const formattedDate = String(
      item.date_added ||
        new Date(item.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
    );

    if (isPastQuestion) {
      const obj = rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent) ? rawContent : {};
      const qaItems = Array.isArray(obj.items)
        ? obj.items.map((qa: any, idx: number) => ({
            id: String(qa.id || `pqi-${idStr}-${idx}`),
            questionNumber: Number(qa.questionNumber || idx + 1),
            question: String(qa.question || ''),
            options: Array.isArray(qa.options) && qa.options.length >= 2 ? qa.options.map(String) : undefined,
            correctOptionIndex: typeof qa.correctOptionIndex === 'number' ? qa.correctOptionIndex : undefined,
            answer: String(qa.answer || ''),
            explanation: qa.explanation ? String(qa.explanation) : undefined,
          }))
        : [];

      pastQuestions.push({
        id: idStr,
        title: String(item.title || ''),
        subject: String(item.subject || 'General'),
        examBody: String(obj.examBody || item.level || 'JAMB UTME'),
        examYear: String(obj.examYear || new Date().getFullYear()),
        paperType: String(obj.paperType || 'Objective & Theory'),
        summary: String(item.summary || ''),
        dateAdded: formattedDate,
        items: qaItems,
        createdAt: item.created_at,
      });
    } else {
      let parsedSections: string[] = [];
      if (Array.isArray(rawContent)) {
        parsedSections = rawContent.map(String);
      } else if (rawContent && typeof rawContent === 'object') {
        parsedSections = Array.isArray(rawContent.sections) ? rawContent.sections.map(String) : [];
      } else if (typeof rawContent === 'string' && rawContent.trim()) {
        parsedSections = [rawContent];
      }

      materials.push({
        id: idStr,
        title: String(item.title || ''),
        subject: String(item.subject || 'General'),
        level: String(item.level || 'JAMB UTME'),
        dateAdded: formattedDate,
        summary: String(item.summary || ''),
        content: parsedSections,
        createdAt: item.created_at,
      });
    }
  }

  const questions: CbtQuestion[] = (questionsRes.data || []).map((q: any) => ({
    id: Number(q.id),
    subject: String(q.subject || 'General'),
    topic: String(q.topic || 'Syllabus'),
    text: String(q.text || ''),
    options: Array.isArray(q.options) ? q.options.map(String) : [],
    correctOptionIndex: Number(q.correct_option_index || 0),
    explanation: String(q.explanation || ''),
  }));

  const subjects: SubjectItem[] = (subjectsRes.data || []).map((s: any) => ({
    id: String(s.id),
    name: String(s.name),
    description: String(s.description || ''),
    tag: String(s.tag || 'JAMB UTME'),
    progress: Number(s.progress || 0),
    lessonsCount: Number(s.lessons_count || 0),
    questionsCount: Number(s.questions_count || 0),
    iconName: String(s.icon_name || 'menu_book'),
    colorTheme: String(s.color_theme || 'bg-emerald-500/10 text-emerald-400'),
  }));

  return {
    users: Array.from(usersMap.values()),
    materials,
    pastQuestions,
    questions,
    subjects,
    examResults: (examResultsRes.data || []).map((r: any) => ({
      id: String(r.id),
      userId: String(r.user_id || ''),
      userName: usersMap.get(String(r.user_id || ''))?.name || 'Scholar',
      userEmail: usersMap.get(String(r.user_id || ''))?.email || '',
      totalQuestions: Number(r.total_questions || 0),
      attemptedCount: Number(r.attempted_count || 0),
      correctCount: Number(r.correct_count || 0),
      wrongCount: Number(r.wrong_count || 0),
      scorePercentage: Number(r.score_percentage || 0),
      subjectBreakdown: r.subject_breakdown || {},
      timeSpentSeconds: Number(r.time_spent_seconds || 0),
      createdAt: String(r.created_at || new Date().toISOString()),
    })),
    activityLogs: (activityLogsRes.data || []).map((l: any) => ({
      id: String(l.id),
      actorName: String(l.actor_name || 'System'),
      action: String(l.action || ''),
      module: String(l.module || ''),
      details: String(l.details || ''),
      createdAt: String(l.created_at || new Date().toISOString()),
    })),
    recentActivities: (recentActivitiesRes.data || []).map((a: any) => ({
      id: String(a.id),
      userId: String(a.user_id || ''),
      title: String(a.title || ''),
      type: a.type === 'cbt' ? 'cbt' : 'reading',
      score: a.score || undefined,
      detail: String(a.detail || ''),
      timeAgo: String(a.time_ago || 'Just now'),
      icon: String(a.icon || 'menu_book'),
      badgeBg: String(a.badge_bg || 'bg-zinc-800'),
      badgeTextColor: String(a.badge_text_color || 'text-zinc-300'),
    })),
    presence: [],
    supabaseConnected: true,
    syncedAt: new Date().toISOString(),
  };
}

export async function fetchSnapshotFromServer(): Promise<PlatformSnapshot> {
  try {
    return await apiRequest<PlatformSnapshot>('/api/snapshot');
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      return fetchSnapshotDirectlyFromSupabase();
    }
    throw err;
  }
}

export async function registerSupabaseAccount(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'student' | 'admin';
  studentClass?: string;
}): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase();

  try {
    const { user } = await apiRequest<{ user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...params, email: cleanEmail }),
    });

    await supabase.auth
      .signInWithPassword({
        email: cleanEmail,
        password: params.password,
      })
      .catch(() => {});

    return user;
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      const resolvedClass =
        params.studentClass || (params.role === 'admin' ? 'Administrator' : 'SS 3 Science');
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            phone: params.phone.trim(),
            role: params.role,
            student_class: resolvedClass,
            saved_resources: [],
          },
        },
      });
      if (error || !data?.user) {
        throw new Error(error?.message || 'Unable to register account in Supabase Auth.');
      }
      return buildClientUserProfileFromAuth(data.user, params.role);
    }
    throw err;
  }
}

export async function signInSupabaseAccount(params: {
  email: string;
  password: string;
  requestedRole?: 'student' | 'admin';
}): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase();

  try {
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
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password,
      });
      if (error || !data?.user) {
        throw new Error(error?.message || 'Invalid email or password.');
      }
      if (params.requestedRole === 'admin' && data.user.user_metadata?.role !== 'admin') {
        await supabase.auth
          .updateUser({
            data: {
              ...(data.user.user_metadata || {}),
              role: 'admin',
            },
          })
          .catch(() => {});
      }
      return buildClientUserProfileFromAuth(data.user, params.requestedRole);
    }
    throw err;
  }
}

export async function syncAuthenticatedProfile(
  userId: string,
  email: string,
  requestedRole?: 'student' | 'admin'
): Promise<UserProfile> {
  try {
    const { user } = await apiRequest<{ user: UserProfile }>('/api/auth/sync-profile', {
      method: 'POST',
      body: JSON.stringify({ userId, email, requestedRole }),
    });
    return user;
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return buildClientUserProfileFromAuth(data.user, requestedRole);
      }
    }
    throw err;
  }
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
  try {
    const { user } = await apiRequest<{ user: UserProfile }>(
      `/api/profile/${encodeURIComponent(userId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return user;
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      const { data: userRes } = await supabase.auth.getUser();
      const currentMeta = userRes?.user?.user_metadata || {};
      const { data: updatedAuth, error } = await supabase.auth.updateUser({
        data: {
          ...currentMeta,
          full_name: updates.name,
          phone: updates.phone,
          student_class: updates.studentClass || currentMeta.student_class,
          role: updates.role || currentMeta.role,
          avatar_url: updates.avatarUrl || currentMeta.avatar_url,
        },
      });
      if (error || !updatedAuth?.user) {
        throw new Error(error?.message || 'Failed to update profile.');
      }
      return buildClientUserProfileFromAuth(updatedAuth.user, updates.role);
    }
    throw err;
  }
}

export async function toggleResourceBookmarkOnServer(params: {
  userId: string;
  resourceId: string;
  resourceType: SavedResourceType;
  action?: 'toggle' | 'add' | 'remove';
}): Promise<{ savedResources: SavedResourceItem[]; isSaved: boolean; snapshot?: PlatformSnapshot }> {
  try {
    return await apiRequest<{
      savedResources: SavedResourceItem[];
      isSaved: boolean;
      snapshot?: PlatformSnapshot;
    }>(`/api/profile/${encodeURIComponent(params.userId)}/bookmarks`, {
      method: 'POST',
      body: JSON.stringify({
        resourceId: params.resourceId,
        resourceType: params.resourceType,
        action: params.action || 'toggle',
      }),
    });
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      const { data: userRes } = await supabase.auth.getUser();
      const meta = userRes?.user?.user_metadata || {};
      const currentList = normalizeClientSavedResources(meta.saved_resources);
      const exists = currentList.some(
        (item) =>
          item.resourceId === params.resourceId && item.resourceType === params.resourceType
      );
      const action = params.action || 'toggle';
      const shouldSave = action === 'add' ? true : action === 'remove' ? false : !exists;
      const nextList = shouldSave
        ? exists
          ? currentList
          : [
              {
                resourceId: params.resourceId,
                resourceType: params.resourceType,
                savedAt: new Date().toISOString(),
              },
              ...currentList,
            ]
        : currentList.filter(
            (item) =>
              !(item.resourceId === params.resourceId && item.resourceType === params.resourceType)
          );

      await supabase.auth.updateUser({
        data: {
          ...meta,
          saved_resources: nextList,
        },
      });

      return { savedResources: nextList, isSaved: shouldSave };
    }
    throw err;
  }
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

  const { attachment } = await apiRequest<{ attachment: ResourceAttachment }>(
    '/api/upload/resource',
    {
      method: 'POST',
      body: JSON.stringify({
        dataUrl,
        fileName: file.name,
      }),
    }
  );

  return attachment;
}

export async function submitExamToServer(params: {
  userId: string;
  userName: string;
  title: string;
  result: ExamResult;
}): Promise<PlatformSnapshot> {
  try {
    const { snapshot } = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/exams/submit', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return snapshot;
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      await supabase.from('exam_results').insert({
        user_id: params.userId || 'guest',
        total_questions: params.result.totalQuestions,
        attempted_count: params.result.attemptedCount,
        correct_count: params.result.correctCount,
        wrong_count: params.result.wrongCount,
        score_percentage: params.result.scorePercentage,
        subject_breakdown: params.result.subjectBreakdown || {},
        time_spent_seconds: params.result.timeSpentSeconds,
      });
      return fetchSnapshotDirectlyFromSupabase();
    }
    throw err;
  }
}

export async function logMaterialReadingOnServer(params: {
  userId?: string;
  userName?: string;
  materialTitle: string;
  subject: string;
}): Promise<PlatformSnapshot> {
  try {
    const { snapshot } = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/activity/read', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return snapshot;
  } catch (err) {
    if (isRouteUnavailableError(err) && isClientSupabaseConfigured) {
      return fetchSnapshotDirectlyFromSupabase();
    }
    throw err;
  }
}

export { apiRequest };
