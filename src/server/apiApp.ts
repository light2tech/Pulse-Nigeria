import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { seedJambSyllabusAndPastQuestions } from './jambSyllabusSeed';
import { handleCopilotChat, handleCopilotStream } from './geminiCopilot';

export const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co';
export const PLACEHOLDER_SECRET_KEY = 'placeholder-server-key-configure-env';

function resolveSupabaseUrl(raw?: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed.includes('your-project-ref')) return PLACEHOLDER_SUPABASE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, '');
  if (/^[a-z0-9]{15,30}$/i.test(trimmed)) return `https://${trimmed}.supabase.co`;
  return PLACEHOLDER_SUPABASE_URL;
}

function resolveKey(raw?: string, fallback = PLACEHOLDER_SECRET_KEY): string {
  const trimmed = (raw || '').trim();
  if (trimmed.length >= 20 && !trimmed.startsWith('your_')) return trimmed;
  return fallback;
}

export const SUPABASE_URL = resolveSupabaseUrl(
  process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
);

export const SUPABASE_SECRET_KEY = resolveKey(
  process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISH_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const SUPABASE_PUBLIC_AUTH_KEY = resolveKey(
  process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISH_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const isSupabaseConfigured =
  SUPABASE_URL !== PLACEHOLDER_SUPABASE_URL && SUPABASE_SECRET_KEY !== PLACEHOLDER_SECRET_KEY;

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface PresenceEntry {
  clientId: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  role: 'student' | 'admin' | 'guest';
  view: string;
  connectedAt: string;
  updatedAt: string;
  cbtProgress: {
    mode: string;
    subjectFilter: string;
    currentQuestion: number;
    answeredCount: number;
    totalQuestions: number;
    timeLeftSeconds: number;
  } | null;
}

interface NormalizedSavedResource {
  resourceId: string;
  resourceType: 'material' | 'past_question';
  savedAt: string;
}

function normalizeSavedResources(raw: unknown): NormalizedSavedResource[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const normalized: NormalizedSavedResource[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const resourceId = String((item as any).resourceId || '').trim();
    const rawType = (item as any).resourceType;
    const resourceType: 'material' | 'past_question' | null =
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

const ACADEMIC_BUCKET = 'academic-resources';
let resolvedAcademicBucket: string | null = null;
let autoSeedChecked = false;

async function getAcademicStorageBucket(): Promise<string> {
  if (resolvedAcademicBucket) return resolvedAcademicBucket;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === ACADEMIC_BUCKET || b.id === ACADEMIC_BUCKET);
    if (exists) {
      resolvedAcademicBucket = ACADEMIC_BUCKET;
      return ACADEMIC_BUCKET;
    }
    const { error: createErr } = await supabaseAdmin.storage.createBucket(ACADEMIC_BUCKET, {
      public: false,
    });
    if (!createErr) {
      resolvedAcademicBucket = ACADEMIC_BUCKET;
      return ACADEMIC_BUCKET;
    }
  } catch {
    // Fallback to existing private bucket
  }
  resolvedAcademicBucket = 'profile pic';
  return 'profile pic';
}

function inferSubjectIcon(subjectName: string): string {
  const lower = subjectName.toLowerCase();
  if (/math|calculus|algebra|accounting|bookkeep|further/.test(lower)) return 'functions';
  if (/physic|chemis|tech|drawing|science/.test(lower)) return 'science';
  if (/biolog|agric|health|animal|nutrition|food/.test(lower)) return 'biotech';
  if (/comput|data|ict|program|software/.test(lower)) return 'computer';
  if (/govern|econom|commerc|civic|history|insur|market|law/.test(lower)) return 'account_balance';
  return 'menu_book';
}

async function ensureSubjectExists(rawSubjectName: string, defaultTag = 'WAEC, NECO & JAMB'): Promise<string> {
  const cleanName = String(rawSubjectName || '').trim() || 'General Studies';
  try {
    const { data: existingList } = await supabaseAdmin.from('subjects').select('id, name');
    const matched = (existingList || []).find(
      (s: any) => String(s.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (matched) {
      return String(matched.name);
    }

    const id =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `subj-${Date.now()}`;

    await supabaseAdmin.from('subjects').upsert({
      id,
      name: cleanName,
      description: `Comprehensive reading notes, past questions & answers, and timed CBT drills for ${cleanName}.`,
      tag: defaultTag,
      progress: 0,
      lessons_count: 0,
      questions_count: 0,
      icon_name: inferSubjectIcon(cleanName),
      color_theme: 'bg-emerald-500/10 text-emerald-400',
    });
  } catch (err) {
    console.warn('Auto subject registration warning:', err);
  }
  return cleanName;
}

function buildInitialsAvatar(name: string, email: string): string {
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

function deriveNameFromEmail(email: string): string {
  const local = (email.split('@')[0] || 'Scholar').trim();
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

async function logSystemActivity(actorName: string, action: string, module: string, details: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabaseAdmin.from('activity_logs').insert({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actor_name: actorName || 'System',
      action,
      module,
      details,
    });
  } catch (err) {
    console.warn('Activity log write skipped:', err);
  }
}

async function resolveStoragePointer(pointer: string | null | undefined): Promise<string | undefined> {
  if (!pointer || !pointer.trim()) return undefined;
  if (pointer.startsWith('storage://')) {
    const withoutScheme = pointer.slice('storage://'.length);
    const slashIdx = withoutScheme.indexOf('/');
    if (slashIdx > 0) {
      const bucket = withoutScheme.slice(0, slashIdx);
      const objectPath = withoutScheme.slice(slashIdx + 1);
      const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(objectPath, 60 * 60 * 24 * 30);
      if (data?.signedUrl) return data.signedUrl;
    }
  }
  return pointer;
}

async function resolveAvatarUrl(rawAvatar: string | null | undefined, name: string, email: string): Promise<string> {
  if (!rawAvatar || !rawAvatar.trim()) {
    return buildInitialsAvatar(name, email);
  }
  const resolved = await resolveStoragePointer(rawAvatar);
  return resolved || buildInitialsAvatar(name, email);
}

async function resolveAttachmentObject(rawAtt: any): Promise<any | null> {
  if (!rawAtt || typeof rawAtt !== 'object' || !rawAtt.storagePointer) return null;
  const signedUrl = await resolveStoragePointer(String(rawAtt.storagePointer));
  return {
    fileName: String(rawAtt.fileName || 'Document'),
    mimeType: String(rawAtt.mimeType || 'application/octet-stream'),
    sizeBytes: typeof rawAtt.sizeBytes === 'number' ? rawAtt.sizeBytes : undefined,
    storagePointer: String(rawAtt.storagePointer),
    fileUrl: signedUrl,
  };
}

export async function fetchPlatformSnapshot(getPresence: () => PresenceEntry[] = () => []) {
  if (!isSupabaseConfigured) {
    return {
      users: [],
      materials: [],
      pastQuestions: [],
      questions: [],
      subjects: [],
      examResults: [],
      activityLogs: [],
      recentActivities: [],
      presence: getPresence(),
      supabaseConnected: false,
      configMissing: true,
      syncedAt: new Date().toISOString(),
    };
  }

  // One-time automatic syllabus seed check if connected to a fresh empty Supabase project
  if (!autoSeedChecked) {
    autoSeedChecked = true;
    try {
      const { count } = await supabaseAdmin
        .from('subjects')
        .select('id', { count: 'exact', head: true });
      if (count === 0) {
        await seedJambSyllabusAndPastQuestions(supabaseAdmin);
      }
    } catch {
      // Ignore if table check fails
    }
  }

  let supabaseConnected = true;

  const [
    authUsersRes,
    profilesRes,
    materialsRes,
    questionsRes,
    subjectsRes,
    examResultsRes,
    activityLogsRes,
    recentActivitiesRes,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabaseAdmin.from('profiles').select('*'),
    supabaseAdmin.from('study_materials').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('cbt_questions').select('*').order('id', { ascending: true }),
    supabaseAdmin.from('subjects').select('*').order('name', { ascending: true }),
    supabaseAdmin.from('exam_results').select('*').order('created_at', { ascending: false }).limit(200),
    supabaseAdmin.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseAdmin.from('recent_activity').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  if (authUsersRes.error && subjectsRes.error) {
    console.error('Supabase connection error:', authUsersRes.error.message);
    supabaseConnected = false;
  }

  const rawAuthUsers = authUsersRes.data?.users || [];
  const rawProfiles = profilesRes.data || [];

  const profileById = new Map<string, any>();
  const profileByEmail = new Map<string, any>();
  for (const p of rawProfiles) {
    if (p.id) profileById.set(String(p.id), p);
    if (p.email) profileByEmail.set(String(p.email).trim().toLowerCase(), p);
  }

  const rawExamResults = examResultsRes.data || [];

  const users = await Promise.all(
    rawAuthUsers.map(async (au) => {
      const email = (au.email || '').trim().toLowerCase();
      const matchedProfile = profileById.get(au.id) || (email ? profileByEmail.get(email) : undefined);
      const meta = au.user_metadata || {};

      const resolvedRole: 'student' | 'admin' =
        matchedProfile?.role === 'admin' || meta.role === 'admin' ? 'admin' : 'student';

      const resolvedName =
        matchedProfile?.name ||
        meta.full_name ||
        meta.name ||
        deriveNameFromEmail(email || 'Scholar');

      const resolvedPhone = matchedProfile?.phone || meta.phone || '';
      const resolvedClass =
        matchedProfile?.student_class ||
        meta.student_class ||
        (resolvedRole === 'admin' ? 'Administrator' : 'SS 3 Science');

      const resolvedStreak = typeof matchedProfile?.streak_days === 'number' ? matchedProfile.streak_days : 1;
      const rawAvatar = matchedProfile?.avatar_url || meta.avatar_url || '';
      const avatarUrl = await resolveAvatarUrl(rawAvatar, resolvedName, email);

      const userAttempts = rawExamResults.filter(
        (r: any) => r.user_id === au.id || (matchedProfile?.id && r.user_id === matchedProfile.id)
      );
      const examAttemptsCount = userAttempts.length;
      const averageScore =
        examAttemptsCount > 0
          ? Math.round(
              userAttempts.reduce((acc: number, item: any) => acc + (Number(item.score_percentage) || 0), 0) /
                examAttemptsCount
            )
          : null;

      return {
        id: au.id,
        name: resolvedName,
        email: email || au.id,
        phone: resolvedPhone,
        role: resolvedRole,
        studentClass: resolvedClass,
        avatarUrl,
        streakDays: resolvedStreak,
        savedResources: normalizeSavedResources(meta.saved_resources),
        createdAt: au.created_at,
        lastSignInAt: au.last_sign_in_at || null,
        emailVerified: Boolean(au.email_confirmed_at || meta.email_verified),
        examAttemptsCount,
        averageScore,
      };
    })
  );

  const userLookup = new Map<string, { name: string; email: string }>();
  for (const u of users) {
    userLookup.set(u.id, { name: u.name, email: u.email });
  }
  for (const p of rawProfiles) {
    if (p.id && !userLookup.has(p.id)) {
      userLookup.set(p.id, { name: p.name || 'Student', email: p.email || '' });
    }
  }

  const materials: any[] = [];
  const pastQuestions: any[] = [];

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
      (rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent) && rawContent.kind === 'past_question');

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
      const resolvedAttachment = await resolveAttachmentObject(obj.attachment);
      const qaItems = Array.isArray(obj.items)
        ? obj.items.map((qa: any, idx: number) => ({
            id: String(qa.id || `pqi-${idStr}-${idx}`),
            questionNumber: Number(qa.questionNumber || idx + 1),
            question: String(qa.question || ''),
            options: Array.isArray(qa.options) && qa.options.length >= 2 ? qa.options.map(String) : undefined,
            correctOptionIndex:
              typeof qa.correctOptionIndex === 'number' ? qa.correctOptionIndex : undefined,
            answer: String(qa.answer || ''),
            explanation: qa.explanation ? String(qa.explanation) : undefined,
          }))
        : [];

      pastQuestions.push({
        id: idStr,
        title: String(item.title || ''),
        subject: String(item.subject || 'General'),
        examBody: String(obj.examBody || item.level || 'WAEC WASSCE'),
        examYear: String(obj.examYear || new Date().getFullYear()),
        paperType: String(obj.paperType || 'Objective & Theory'),
        summary: String(item.summary || ''),
        dateAdded: formattedDate,
        items: qaItems,
        attachment: resolvedAttachment,
        createdAt: item.created_at,
      });
    } else {
      let parsedSections: string[] = [];
      let resolvedAttachment = null;

      if (Array.isArray(rawContent)) {
        parsedSections = rawContent.map(String);
      } else if (rawContent && typeof rawContent === 'object') {
        parsedSections = Array.isArray(rawContent.sections) ? rawContent.sections.map(String) : [];
        resolvedAttachment = await resolveAttachmentObject(rawContent.attachment);
      } else if (typeof rawContent === 'string' && rawContent.trim()) {
        parsedSections = [rawContent];
      }

      materials.push({
        id: idStr,
        title: String(item.title || ''),
        subject: String(item.subject || 'General'),
        level: String(item.level || 'SS 3'),
        dateAdded: formattedDate,
        summary: String(item.summary || ''),
        imageUrl: item.image_url || undefined,
        content: parsedSections,
        attachment: resolvedAttachment,
        createdAt: item.created_at,
      });
    }
  }

  const questions = (questionsRes.data || []).map((q: any) => {
    let parsedOptions: string[] = [];
    if (Array.isArray(q.options)) {
      parsedOptions = q.options.map(String);
    } else if (typeof q.options === 'string') {
      try {
        const parsed = JSON.parse(q.options);
        parsedOptions = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        parsedOptions = [];
      }
    }
    return {
      id: Number(q.id),
      subject: String(q.subject || 'General'),
      topic: String(q.topic || 'General'),
      text: String(q.text || ''),
      options: parsedOptions,
      correctOptionIndex: Number(q.correct_option_index ?? 0),
      explanation: String(q.explanation || ''),
      createdAt: q.created_at,
    };
  });

  const subjects = (subjectsRes.data || []).map((s: any) => {
    const sNameLower = String(s.name || '').toLowerCase();
    const liveSubjectQuestions = questions.filter(
      (q) => q.subject.toLowerCase() === sNameLower || sNameLower.includes(q.subject.toLowerCase())
    ).length;
    const liveSubjectMaterials = materials.filter(
      (m) => m.subject.toLowerCase() === sNameLower || sNameLower.includes(m.subject.toLowerCase())
    ).length;
    const liveSubjectPastPapers = pastQuestions.filter(
      (pq) => pq.subject.toLowerCase() === sNameLower || sNameLower.includes(pq.subject.toLowerCase())
    ).length;

    return {
      id: String(s.id),
      name: String(s.name || ''),
      description: String(s.description || ''),
      tag: String(s.tag || 'WAEC & JAMB'),
      progress: Number(s.progress ?? 0),
      lessonsCount: liveSubjectMaterials,
      questionsCount: liveSubjectQuestions,
      pastPapersCount: liveSubjectPastPapers,
      iconName: String(s.icon_name || inferSubjectIcon(String(s.name || ''))),
      colorTheme: String(s.color_theme || 'bg-emerald-500/10 text-emerald-400'),
    };
  });

  const examResults = rawExamResults.map((r: any) => {
    const owner = userLookup.get(String(r.user_id));
    return {
      id: String(r.id),
      userId: String(r.user_id),
      userName: owner?.name || String(r.user_id),
      userEmail: owner?.email || '',
      totalQuestions: Number(r.total_questions || 0),
      attemptedCount: Number(r.attempted_count || 0),
      correctCount: Number(r.correct_count || 0),
      wrongCount: Number(r.wrong_count || 0),
      scorePercentage: Number(r.score_percentage || 0),
      subjectBreakdown: r.subject_breakdown && typeof r.subject_breakdown === 'object' ? r.subject_breakdown : {},
      timeSpentSeconds: Number(r.time_spent_seconds || 0),
      createdAt: String(r.created_at || new Date().toISOString()),
    };
  });

  const activityLogs = (activityLogsRes.data || []).map((l: any) => ({
    id: String(l.id),
    actorName: String(l.actor_name || 'System'),
    action: String(l.action || ''),
    module: String(l.module || 'System'),
    details: String(l.details || ''),
    createdAt: String(l.created_at || new Date().toISOString()),
  }));

  const recentActivities = (recentActivitiesRes.data || []).map((a: any) => ({
    id: String(a.id),
    userId: String(a.user_id || ''),
    title: String(a.title || ''),
    type: (a.type === 'reading' || a.type === 'practice' ? a.type : 'cbt') as 'cbt' | 'reading' | 'practice',
    score: a.score ? String(a.score) : undefined,
    detail: String(a.detail || ''),
    timeAgo: String(a.time_ago || 'Recently'),
    icon: String(a.icon || 'assignment_turned_in'),
    createdAt: String(a.created_at || new Date().toISOString()),
  }));

  return {
    users,
    materials,
    pastQuestions,
    questions,
    subjects,
    examResults,
    activityLogs,
    recentActivities,
    presence: getPresence(),
    supabaseConnected,
    configMissing: false,
    syncedAt: new Date().toISOString(),
  };
}

async function syncUserProfileRecord(params: {
  userId?: string;
  email?: string;
  requestedRole?: string;
}) {
  const cleanEmail = String(params.email || '').trim().toLowerCase();
  const { data: authLookup } = params.userId
    ? await supabaseAdmin.auth.admin.getUserById(String(params.userId))
    : { data: null };

  const authUser = authLookup?.user;
  const targetId = authUser?.id || String(params.userId || '');
  const targetEmail = (authUser?.email || cleanEmail).trim().toLowerCase();
  const meta = authUser?.user_metadata || {};

  const { data: byId } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', targetId)
    .maybeSingle();

  let existingProfile = byId;
  if (!existingProfile && targetEmail) {
    const { data: byEmail } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', targetEmail)
      .maybeSingle();
    existingProfile = byEmail;
  }

  let resolvedRole: 'student' | 'admin' =
    existingProfile?.role === 'admin' || meta.role === 'admin' ? 'admin' : 'student';

  if (params.requestedRole === 'admin' && resolvedRole !== 'admin') {
    resolvedRole = 'admin';
  }

  const resolvedName =
    existingProfile?.name ||
    meta.full_name ||
    meta.name ||
    deriveNameFromEmail(targetEmail || 'Scholar');

  const resolvedPhone = existingProfile?.phone ?? meta.phone ?? '';
  const resolvedClass =
    existingProfile?.student_class ||
    meta.student_class ||
    (resolvedRole === 'admin' ? 'Administrator' : 'SS 3 Science');
  const resolvedStreak = typeof existingProfile?.streak_days === 'number' ? existingProfile.streak_days : 1;
  const rawAvatar = existingProfile?.avatar_url || meta.avatar_url || null;

  if (!existingProfile || existingProfile.id !== targetId || existingProfile.role !== resolvedRole) {
    await supabaseAdmin.from('profiles').upsert({
      id: targetId,
      name: resolvedName,
      email: targetEmail,
      phone: resolvedPhone,
      role: resolvedRole,
      student_class: resolvedClass,
      avatar_url: rawAvatar,
      streak_days: resolvedStreak,
    });
  }

  if (authUser && meta.role !== resolvedRole) {
    await supabaseAdmin.auth.admin.updateUserById(targetId, {
      user_metadata: {
        ...meta,
        full_name: resolvedName,
        phone: resolvedPhone,
        role: resolvedRole,
        student_class: resolvedClass,
      },
    });
  }

  const avatarUrl = await resolveAvatarUrl(rawAvatar, resolvedName, targetEmail);

  return {
    id: targetId,
    name: resolvedName,
    email: targetEmail,
    phone: resolvedPhone,
    role: resolvedRole,
    studentClass: resolvedClass,
    avatarUrl,
    streakDays: resolvedStreak,
    savedResources: normalizeSavedResources(meta.saved_resources),
  };
}

async function insertObjectiveItemsIntoCbtBank(
  subject: string,
  topicLabel: string,
  items: any[]
): Promise<number> {
  const validObjectives = (items || []).filter(
    (it) => it && it.question && Array.isArray(it.options) && it.options.length >= 2
  );
  if (validObjectives.length === 0) return 0;

  const { data: maxRow } = await supabaseAdmin
    .from('cbt_questions')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextId = (Number(maxRow?.id) || 0) + 1;
  const rowsToInsert = validObjectives.map((it) => {
    const cleanOpts = it.options.map((o: any) => String(o).trim()).filter(Boolean);
    const correctIdx =
      typeof it.correctOptionIndex === 'number'
        ? Math.max(0, Math.min(it.correctOptionIndex, cleanOpts.length - 1))
        : 0;
    return {
      id: nextId++,
      subject,
      topic: topicLabel,
      text: String(it.question).trim(),
      options: cleanOpts,
      correct_option_index: correctIdx,
      explanation: String(it.explanation || it.answer || '').trim(),
    };
  });

  const { error } = await supabaseAdmin.from('cbt_questions').insert(rowsToInsert);
  if (error) {
    console.warn('Skipping optional CBT sync:', error.message);
    return 0;
  }
  return rowsToInsert.length;
}

export interface ApiAppOptions {
  getPresence?: () => PresenceEntry[];
  onSnapshotBroadcast?: (snapshot: any) => void;
  mountAtRoot?: boolean;
}

export function createApiApp(options: ApiAppOptions = {}) {
  const getPresence = options.getPresence || (() => []);
  const onSnapshotBroadcast = options.onSnapshotBroadcast;

  const refreshAndNotifySnapshot = async () => {
    try {
      const snapshot = await fetchPlatformSnapshot(getPresence);
      if (onSnapshotBroadcast) {
        onSnapshotBroadcast(snapshot);
      }
      return snapshot;
    } catch (err) {
      console.error('Error building platform snapshot:', err);
      return null;
    }
  };

  const app = express();
  const jsonParser = express.json({ limit: '25mb' });

  // Serverless-safe JSON body parser (prevents hanging when @vercel/node pre-parses req.body)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      next();
      return;
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
        next();
        return;
      } catch {
        // fall through
      }
    }
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      try {
        req.body = JSON.parse(req.body.toString('utf8'));
        next();
        return;
      } catch {
        // fall through
      }
    }
    jsonParser(req, res, next);
  });

  const router = express.Router();

  const ensureConfigured = (res: Response): boolean => {
    if (!isSupabaseConfigured) {
      res.status(503).json({
        error:
          'Supabase environment variables (SUPABASE_URL and SUPABASE_SECRET_KEY) are missing on this deployment. Add them in Vercel Project Settings → Environment Variables and redeploy.',
      });
      return false;
    }
    return true;
  };

  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      supabaseConfigured: isSupabaseConfigured,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/snapshot', async (_req, res) => {
    try {
      const snapshot = await fetchPlatformSnapshot(getPresence);
      res.json(snapshot);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to load Supabase snapshot' });
    }
  });

  router.post('/admin/seed-jamb', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const actorName = String(req.body?.actorName || 'Admin');
      const result = await seedJambSyllabusAndPastQuestions(supabaseAdmin);
      await logSystemActivity(
        actorName,
        'Synced JAMB Syllabus Pack',
        'Curriculum',
        `Verified ${result.subjectsSeeded} JAMB UTME subjects (+${result.cbtQuestionsInserted} new CBT questions)`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ result, snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to seed JAMB syllabus pack.' });
    }
  });

  router.post('/upload/resource', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { dataUrl, fileName } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
        res.status(400).json({ error: 'Valid base64 file dataUrl is required.' });
        return;
      }

      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: 'Malformed base64 file payload.' });
        return;
      }

      const mimeType = matches[1] || 'application/octet-stream';
      const base64Body = matches[2];
      const buffer = Buffer.from(base64Body, 'base64');
      const safeName = String(fileName || 'resource-file')
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
        .slice(0, 90);
      const objectPath = `uploads/${Date.now()}-${safeName}`;
      const bucketName = await getAcademicStorageBucket();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(objectPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        res.status(500).json({ error: uploadError.message });
        return;
      }

      const storagePointer = `storage://${bucketName}/${objectPath}`;
      const { data: signed } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(objectPath, 60 * 60 * 24 * 30);

      res.json({
        attachment: {
          fileName: String(fileName || safeName),
          mimeType,
          sizeBytes: buffer.length,
          storagePointer,
          fileUrl: signed?.signedUrl,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Academic file upload failed.' });
    }
  });

  // Server-side Supabase Auth Sign-In (works on Vercel even without build-time VITE_ vars)
  router.post('/auth/login', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { email, password, requestedRole } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const statelessAuthClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC_AUTH_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data, error } = await statelessAuthClient.auth.signInWithPassword({
        email: cleanEmail,
        password: String(password),
      });

      if (error || !data?.user) {
        res.status(401).json({ error: error?.message || 'Invalid email or password.' });
        return;
      }

      const userProfile = await syncUserProfileRecord({
        userId: data.user.id,
        email: cleanEmail,
        requestedRole,
      });

      await refreshAndNotifySnapshot();

      res.json({
        user: userProfile,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }
          : null,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Authentication failed.' });
    }
  });

  router.post('/auth/register', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { email, password, fullName, phone, role, studentClass } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !password || String(password).length < 6) {
        res.status(400).json({ error: 'Valid email and password (minimum 6 characters) are required.' });
        return;
      }

      const resolvedRole: 'student' | 'admin' = role === 'admin' ? 'admin' : 'student';
      const resolvedName = String(fullName || '').trim() || deriveNameFromEmail(cleanEmail);
      const resolvedPhone = String(phone || '').trim();
      const resolvedClass =
        String(studentClass || '').trim() || (resolvedRole === 'admin' ? 'Administrator' : 'SS 3 Science');

      const { data: createdAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          full_name: resolvedName,
          phone: resolvedPhone,
          role: resolvedRole,
          student_class: resolvedClass,
          saved_resources: [],
        },
      });

      if (createError || !createdAuth?.user) {
        res.status(400).json({ error: createError?.message || 'Unable to register account in Supabase Auth.' });
        return;
      }

      const authUser = createdAuth.user;
      await supabaseAdmin.from('profiles').upsert({
        id: authUser.id,
        name: resolvedName,
        email: cleanEmail,
        phone: resolvedPhone,
        role: resolvedRole,
        student_class: resolvedClass,
        avatar_url: null,
        streak_days: 1,
      });

      await logSystemActivity(
        resolvedName,
        'Account Registered',
        'Authentication',
        `Registered ${resolvedRole} account (${cleanEmail})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      const profile = snapshot?.users.find((u: any) => u.id === authUser.id) || {
        id: authUser.id,
        name: resolvedName,
        email: cleanEmail,
        phone: resolvedPhone,
        role: resolvedRole,
        studentClass: resolvedClass,
        avatarUrl: buildInitialsAvatar(resolvedName, cleanEmail),
        streakDays: 1,
        savedResources: [],
      };

      res.json({ user: profile });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Registration failed.' });
    }
  });

  router.post('/auth/sync-profile', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { userId, email, requestedRole } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!userId && !cleanEmail) {
        res.status(400).json({ error: 'userId or email required' });
        return;
      }

      const userProfile = await syncUserProfileRecord({ userId, email: cleanEmail, requestedRole });
      await refreshAndNotifySnapshot();
      res.json({ user: userProfile });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Profile sync failed.' });
    }
  });

  router.put('/profile/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { name, phone, studentClass, avatarUrl, role } = req.body || {};

      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      const { data: authLookup } = await supabaseAdmin.auth.admin.getUserById(targetId);
      const authUser = authLookup?.user;
      const targetEmail = (authUser?.email || existing?.email || '').trim().toLowerCase();

      const updatedName = String(name ?? existing?.name ?? deriveNameFromEmail(targetEmail)).trim();
      const updatedPhone = String(phone ?? existing?.phone ?? '').trim();
      const updatedClass = String(studentClass ?? existing?.student_class ?? 'SS 3 Science').trim();
      const updatedRole: 'student' | 'admin' =
        role === 'admin' || existing?.role === 'admin' ? (role === 'student' ? 'student' : 'admin') : 'student';

      let storedAvatar = existing?.avatar_url || null;
      if (typeof avatarUrl === 'string' && avatarUrl.trim()) {
        if (avatarUrl.startsWith('storage://')) {
          storedAvatar = avatarUrl;
        } else if (!avatarUrl.startsWith('data:image/svg+xml') && !avatarUrl.includes('/storage/v1/object/sign/')) {
          storedAvatar = avatarUrl;
        }
      }

      await supabaseAdmin.from('profiles').upsert({
        id: targetId,
        name: updatedName,
        email: targetEmail,
        phone: updatedPhone,
        role: updatedRole,
        student_class: updatedClass,
        avatar_url: storedAvatar,
        streak_days: typeof existing?.streak_days === 'number' ? existing.streak_days : 1,
      });

      if (authUser) {
        await supabaseAdmin.auth.admin.updateUserById(targetId, {
          user_metadata: {
            ...(authUser.user_metadata || {}),
            full_name: updatedName,
            phone: updatedPhone,
            role: updatedRole,
            student_class: updatedClass,
          },
        });
      }

      await logSystemActivity(updatedName, 'Profile Updated', 'Users', `Updated profile details for ${targetEmail}`);
      await refreshAndNotifySnapshot();

      const resolvedAvatar = await resolveAvatarUrl(storedAvatar, updatedName, targetEmail);
      res.json({
        user: {
          id: targetId,
          name: updatedName,
          email: targetEmail,
          phone: updatedPhone,
          role: updatedRole,
          studentClass: updatedClass,
          avatarUrl: resolvedAvatar,
          streakDays: typeof existing?.streak_days === 'number' ? existing.streak_days : 1,
          savedResources: normalizeSavedResources(authUser?.user_metadata?.saved_resources),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update profile.' });
    }
  });

  router.post('/profile/:id/bookmarks', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { resourceId, resourceType, action } = req.body || {};
      const cleanId = String(resourceId || '').trim();
      const cleanType: 'material' | 'past_question' | null =
        resourceType === 'past_question' ? 'past_question' : resourceType === 'material' ? 'material' : null;

      if (!targetId || !cleanId || !cleanType) {
        res.status(400).json({ error: 'Valid userId, resourceId, and resourceType are required.' });
        return;
      }

      const { data: authLookup, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(targetId);
      if (lookupError || !authLookup?.user) {
        res.status(404).json({ error: lookupError?.message || 'Authenticated user not found.' });
        return;
      }

      const authUser = authLookup.user;
      const existingSaved = normalizeSavedResources(authUser.user_metadata?.saved_resources);
      const existsIndex = existingSaved.findIndex(
        (item) => item.resourceId === cleanId && item.resourceType === cleanType
      );

      let nextSaved: NormalizedSavedResource[];
      const resolvedAction =
        action === 'add' ? 'add' : action === 'remove' ? 'remove' : existsIndex >= 0 ? 'remove' : 'add';

      if (resolvedAction === 'remove') {
        nextSaved = existingSaved.filter(
          (item) => !(item.resourceId === cleanId && item.resourceType === cleanType)
        );
      } else if (existsIndex >= 0) {
        nextSaved = existingSaved;
      } else {
        nextSaved = [
          {
            resourceId: cleanId,
            resourceType: cleanType,
            savedAt: new Date().toISOString(),
          },
          ...existingSaved,
        ];
      }

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
        user_metadata: {
          ...(authUser.user_metadata || {}),
          saved_resources: nextSaved,
        },
      });

      if (updateErr) {
        res.status(500).json({ error: updateErr.message });
        return;
      }

      const snapshot = await refreshAndNotifySnapshot();
      res.json({
        savedResources: nextSaved,
        isSaved: resolvedAction === 'add',
        snapshot,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update saved resources.' });
    }
  });

  router.post('/profile/:id/avatar', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { dataUrl, fileName } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        res.status(400).json({ error: 'Valid image dataUrl is required.' });
        return;
      }

      const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: 'Malformed base64 image payload.' });
        return;
      }

      const mimeType = matches[1];
      const base64Body = matches[2];
      const buffer = Buffer.from(base64Body, 'base64');
      const ext = (fileName?.split('.').pop() || mimeType.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
      const objectPath = `avatars/${targetId}-${Date.now()}.${ext}`;
      const bucketName = 'profile pic';

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(objectPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        res.status(500).json({ error: uploadError.message });
        return;
      }

      const storagePointer = `storage://${bucketName}/${objectPath}`;
      const { data: signed } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(objectPath, 60 * 60 * 24 * 365);

      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from('profiles')
          .update({ avatar_url: storagePointer })
          .eq('id', targetId);
      }

      await refreshAndNotifySnapshot();
      res.json({
        avatarUrl: signed?.signedUrl || dataUrl,
        storagePointer,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Avatar upload failed.' });
    }
  });

  router.post('/admin/users', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { email, password, name, phone, role, studentClass, actorName } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!cleanEmail || !password || String(password).length < 6) {
        res.status(400).json({ error: 'Email and password (min 6 chars) are required.' });
        return;
      }

      const resolvedRole: 'student' | 'admin' = role === 'admin' ? 'admin' : 'student';
      const resolvedName = String(name || '').trim() || deriveNameFromEmail(cleanEmail);
      const resolvedPhone = String(phone || '').trim();
      const resolvedClass =
        String(studentClass || '').trim() || (resolvedRole === 'admin' ? 'Administrator' : 'SS 3 Science');

      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          full_name: resolvedName,
          phone: resolvedPhone,
          role: resolvedRole,
          student_class: resolvedClass,
          saved_resources: [],
        },
      });

      if (error || !created?.user) {
        res.status(400).json({ error: error?.message || 'Failed to create user in Supabase Auth.' });
        return;
      }

      await supabaseAdmin.from('profiles').upsert({
        id: created.user.id,
        name: resolvedName,
        email: cleanEmail,
        phone: resolvedPhone,
        role: resolvedRole,
        student_class: resolvedClass,
        streak_days: 1,
      });

      await logSystemActivity(
        actorName || 'Admin',
        'Created User',
        'User Management',
        `Added ${resolvedRole} ${resolvedName} (${cleanEmail})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to create user.' });
    }
  });

  router.patch('/admin/users/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const { role, name, studentClass, phone, actorName } = req.body || {};

      const { data: authLookup, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(targetId);
      if (lookupError || !authLookup?.user) {
        res.status(404).json({ error: 'User not found in Supabase Auth.' });
        return;
      }

      const authUser = authLookup.user;
      const cleanEmail = (authUser.email || '').trim().toLowerCase();
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      const nextRole: 'student' | 'admin' =
        role === 'admin'
          ? 'admin'
          : role === 'student'
            ? 'student'
            : existingProfile?.role === 'admin'
              ? 'admin'
              : 'student';
      const nextName = String(
        name ?? existingProfile?.name ?? authUser.user_metadata?.full_name ?? deriveNameFromEmail(cleanEmail)
      ).trim();
      const nextClass = String(studentClass ?? existingProfile?.student_class ?? 'SS 3 Science').trim();
      const nextPhone = String(phone ?? existingProfile?.phone ?? '').trim();

      await supabaseAdmin.auth.admin.updateUserById(targetId, {
        user_metadata: {
          ...(authUser.user_metadata || {}),
          full_name: nextName,
          role: nextRole,
          student_class: nextClass,
          phone: nextPhone,
        },
      });

      await supabaseAdmin.from('profiles').upsert({
        id: targetId,
        name: nextName,
        email: cleanEmail,
        phone: nextPhone,
        role: nextRole,
        student_class: nextClass,
        avatar_url: existingProfile?.avatar_url || null,
        streak_days: existingProfile?.streak_days ?? 1,
      });

      await logSystemActivity(
        actorName || 'Admin',
        'Updated User',
        'User Management',
        `Updated ${cleanEmail} (role: ${nextRole}, class: ${nextClass})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update user.' });
    }
  });

  router.delete('/admin/users/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const targetId = String(req.params.id);
      const actorName = String(req.query.actor || 'Admin');

      const { data: authLookup } = await supabaseAdmin.auth.admin.getUserById(targetId);
      const targetEmail = authLookup?.user?.email || targetId;

      const { error } = await supabaseAdmin.auth.admin.deleteUser(targetId);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await supabaseAdmin.from('profiles').delete().eq('id', targetId);
      await logSystemActivity(
        actorName,
        'Deleted User',
        'User Management',
        `Removed user ${targetEmail} from Supabase Auth`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete user.' });
    }
  });

  router.post('/materials', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { title, subject, level, summary, content, attachment, imageUrl, actorName } = req.body || {};
      if (!title || !String(title).trim()) {
        res.status(400).json({ error: 'Material title is required.' });
        return;
      }

      const canonicalSubject = await ensureSubjectExists(String(subject || 'General Studies'));
      const id = `mat-${Date.now()}`;
      const dateAdded = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      const normalizedSections =
        Array.isArray(content) && content.length > 0
          ? content.map(String)
          : [`### ${String(title).trim()}\n\n${String(summary || '').trim()}`];

      const storedContent = attachment?.storagePointer
        ? {
            kind: 'reading_material',
            sections: normalizedSections,
            attachment: {
              fileName: attachment.fileName,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              storagePointer: attachment.storagePointer,
            },
          }
        : normalizedSections;

      const { error } = await supabaseAdmin.from('study_materials').insert({
        id,
        title: String(title).trim(),
        subject: canonicalSubject,
        level: String(level || 'SS 3').trim(),
        date_added: dateAdded,
        summary: String(summary || '').trim(),
        image_url: imageUrl || null,
        content: storedContent,
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(
        actorName || 'Admin',
        'Published Reading Material',
        'Reading Materials',
        `Published "${String(title).trim()}" (${canonicalSubject} · ${level || 'SS 3'})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to create reading material.' });
    }
  });

  router.put('/materials/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const { title, subject, level, summary, content, attachment, imageUrl, actorName } = req.body || {};

      const canonicalSubject = await ensureSubjectExists(String(subject || 'General Studies'));
      const normalizedSections = Array.isArray(content) ? content.map(String) : [];

      const storedContent = attachment?.storagePointer
        ? {
            kind: 'reading_material',
            sections: normalizedSections,
            attachment: {
              fileName: attachment.fileName,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              storagePointer: attachment.storagePointer,
            },
          }
        : normalizedSections;

      const payload: Record<string, unknown> = {
        title: String(title || '').trim(),
        subject: canonicalSubject,
        level: String(level || 'SS 3').trim(),
        summary: String(summary || '').trim(),
        content: storedContent,
      };
      if (imageUrl !== undefined) payload.image_url = imageUrl;

      const { error } = await supabaseAdmin.from('study_materials').update(payload).eq('id', id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(
        actorName || 'Admin',
        'Updated Reading Material',
        'Reading Materials',
        `Updated "${String(title || id).trim()}" (${canonicalSubject})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update reading material.' });
    }
  });

  router.delete('/materials/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const actorName = String(req.query.actor || 'Admin');

      const { data: existing } = await supabaseAdmin.from('study_materials').select('title').eq('id', id).maybeSingle();
      const { error } = await supabaseAdmin.from('study_materials').delete().eq('id', id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(
        actorName,
        'Deleted Reading Material',
        'Reading Materials',
        `Deleted "${existing?.title || id}"`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete material.' });
    }
  });

  router.post('/past-questions', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const {
        title,
        subject,
        examBody,
        examYear,
        paperType,
        summary,
        items,
        attachment,
        pushObjectivesToCbt,
        actorName,
      } = req.body || {};

      if (!title || !String(title).trim()) {
        res.status(400).json({ error: 'Past question paper title is required.' });
        return;
      }

      const cleanExamBody = String(examBody || 'WAEC WASSCE').trim();
      const cleanExamYear = String(examYear || new Date().getFullYear()).trim();
      const cleanPaperType = String(paperType || 'Objective & Theory').trim();
      const canonicalSubject = await ensureSubjectExists(String(subject || 'General Studies'), cleanExamBody);

      const id = `pq-${Date.now()}`;
      const dateAdded = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      const normalizedItems = Array.isArray(items)
        ? items
            .map((it: any, idx: number) => ({
              id: String(it.id || `pqi-${Date.now()}-${idx}`),
              questionNumber: idx + 1,
              question: String(it.question || '').trim(),
              options:
                Array.isArray(it.options) && it.options.filter(Boolean).length >= 2
                  ? it.options.map((o: any) => String(o).trim()).filter(Boolean)
                  : undefined,
              correctOptionIndex:
                typeof it.correctOptionIndex === 'number' ? it.correctOptionIndex : undefined,
              answer: String(it.answer || '').trim(),
              explanation: it.explanation ? String(it.explanation).trim() : undefined,
            }))
            .filter((it: any) => Boolean(it.question))
        : [];

      const contentJson = {
        kind: 'past_question',
        examBody: cleanExamBody,
        examYear: cleanExamYear,
        paperType: cleanPaperType,
        items: normalizedItems,
        attachment: attachment?.storagePointer
          ? {
              fileName: attachment.fileName,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              storagePointer: attachment.storagePointer,
            }
          : null,
      };

      const { error } = await supabaseAdmin.from('study_materials').insert({
        id,
        title: String(title).trim(),
        subject: canonicalSubject,
        level: `${cleanExamBody} ${cleanExamYear}`,
        date_added: dateAdded,
        summary:
          String(summary || '').trim() ||
          `${cleanExamBody} ${cleanExamYear} ${canonicalSubject} (${cleanPaperType}) past questions & official answers.`,
        image_url: null,
        content: contentJson,
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      let pushedCbtCount = 0;
      if (pushObjectivesToCbt && normalizedItems.length > 0) {
        pushedCbtCount = await insertObjectiveItemsIntoCbtBank(
          canonicalSubject,
          `${cleanExamBody} ${cleanExamYear}`,
          normalizedItems
        );
      }

      await logSystemActivity(
        actorName || 'Admin',
        'Uploaded Past Questions & Answers',
        'Past Questions',
        `Published "${String(title).trim()}" (${canonicalSubject} · ${cleanExamBody} ${cleanExamYear}, ${normalizedItems.length} Q&A${pushedCbtCount > 0 ? `, +${pushedCbtCount} pushed to CBT` : ''})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot, pushedCbtCount });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to upload past questions & answers.' });
    }
  });

  router.put('/past-questions/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const {
        title,
        subject,
        examBody,
        examYear,
        paperType,
        summary,
        items,
        attachment,
        pushObjectivesToCbt,
        actorName,
      } = req.body || {};

      const cleanExamBody = String(examBody || 'WAEC WASSCE').trim();
      const cleanExamYear = String(examYear || new Date().getFullYear()).trim();
      const cleanPaperType = String(paperType || 'Objective & Theory').trim();
      const canonicalSubject = await ensureSubjectExists(String(subject || 'General Studies'), cleanExamBody);

      const normalizedItems = Array.isArray(items)
        ? items
            .map((it: any, idx: number) => ({
              id: String(it.id || `pqi-${Date.now()}-${idx}`),
              questionNumber: idx + 1,
              question: String(it.question || '').trim(),
              options:
                Array.isArray(it.options) && it.options.filter(Boolean).length >= 2
                  ? it.options.map((o: any) => String(o).trim()).filter(Boolean)
                  : undefined,
              correctOptionIndex:
                typeof it.correctOptionIndex === 'number' ? it.correctOptionIndex : undefined,
              answer: String(it.answer || '').trim(),
              explanation: it.explanation ? String(it.explanation).trim() : undefined,
            }))
            .filter((it: any) => Boolean(it.question))
        : [];

      const contentJson = {
        kind: 'past_question',
        examBody: cleanExamBody,
        examYear: cleanExamYear,
        paperType: cleanPaperType,
        items: normalizedItems,
        attachment: attachment?.storagePointer
          ? {
              fileName: attachment.fileName,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              storagePointer: attachment.storagePointer,
            }
          : null,
      };

      const { error } = await supabaseAdmin
        .from('study_materials')
        .update({
          title: String(title || '').trim(),
          subject: canonicalSubject,
          level: `${cleanExamBody} ${cleanExamYear}`,
          summary: String(summary || '').trim(),
          content: contentJson,
        })
        .eq('id', id);

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      if (pushObjectivesToCbt && normalizedItems.length > 0) {
        await insertObjectiveItemsIntoCbtBank(
          canonicalSubject,
          `${cleanExamBody} ${cleanExamYear}`,
          normalizedItems
        );
      }

      await logSystemActivity(
        actorName || 'Admin',
        'Updated Past Questions & Answers',
        'Past Questions',
        `Updated "${String(title || id).trim()}" (${canonicalSubject} · ${cleanExamBody} ${cleanExamYear})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update past questions & answers.' });
    }
  });

  router.delete('/past-questions/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const actorName = String(req.query.actor || 'Admin');

      const { data: existing } = await supabaseAdmin.from('study_materials').select('title').eq('id', id).maybeSingle();
      const { error } = await supabaseAdmin.from('study_materials').delete().eq('id', id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(
        actorName,
        'Deleted Past Questions Paper',
        'Past Questions',
        `Removed "${existing?.title || id}"`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete past question paper.' });
    }
  });

  router.post('/questions', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { subject, topic, text, options, correctOptionIndex, explanation, actorName } = req.body || {};
      if (!text || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({ error: 'Question text and at least 2 options are required.' });
        return;
      }

      const canonicalSubject = await ensureSubjectExists(String(subject || 'General Studies'));

      const { data: maxRow } = await supabaseAdmin
        .from('cbt_questions')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextId = (Number(maxRow?.id) || 0) + 1;

      const { error } = await supabaseAdmin.from('cbt_questions').insert({
        id: nextId,
        subject: canonicalSubject,
        topic: String(topic || 'General').trim(),
        text: String(text).trim(),
        options: options.map((o: any) => String(o).trim()),
        correct_option_index: Number(correctOptionIndex || 0),
        explanation: String(explanation || '').trim(),
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(
        actorName || 'Admin',
        'Added CBT Question',
        'Question Bank',
        `Added Q#${nextId} in ${canonicalSubject} (${topic || 'General'})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to add CBT question.' });
    }
  });

  router.post('/questions/bulk', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { questions, actorName } = req.body || {};
      if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ error: 'Provide at least 1 valid CBT question to bulk upload.' });
        return;
      }

      const validItems = questions.filter(
        (q: any) => q && q.text && Array.isArray(q.options) && q.options.filter(Boolean).length >= 2
      );
      if (validItems.length === 0) {
        res.status(400).json({ error: 'No valid questions with at least 2 options were found.' });
        return;
      }

      const distinctSubjects = Array.from(
        new Set(validItems.map((q: any) => String(q.subject || 'General Studies').trim()))
      );
      const subjectMap = new Map<string, string>();
      for (const s of distinctSubjects) {
        const canonical = await ensureSubjectExists(s);
        subjectMap.set(s, canonical);
      }

      const { data: maxRow } = await supabaseAdmin
        .from('cbt_questions')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      let nextId = (Number(maxRow?.id) || 0) + 1;

      const rowsToInsert = validItems.map((q: any) => {
        const rawSubj = String(q.subject || 'General Studies').trim();
        const canonicalSubj = subjectMap.get(rawSubj) || rawSubj;
        const cleanOpts = q.options.map((o: any) => String(o).trim()).filter(Boolean);
        const correctIdx = Math.max(0, Math.min(Number(q.correctOptionIndex || 0), cleanOpts.length - 1));
        return {
          id: nextId++,
          subject: canonicalSubj,
          topic: String(q.topic || 'General').trim(),
          text: String(q.text).trim(),
          options: cleanOpts,
          correct_option_index: correctIdx,
          explanation: String(q.explanation || '').trim(),
        };
      });

      const { error } = await supabaseAdmin.from('cbt_questions').insert(rowsToInsert);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(
        actorName || 'Admin',
        'Bulk Uploaded CBT Questions',
        'Question Bank',
        `Imported ${rowsToInsert.length} CBT question(s) across ${distinctSubjects.join(', ')}`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot, insertedCount: rowsToInsert.length });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to bulk upload CBT questions.' });
    }
  });

  router.put('/questions/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = Number(req.params.id);
      const { subject, topic, text, options, correctOptionIndex, explanation, actorName } = req.body || {};

      const canonicalSubject = await ensureSubjectExists(String(subject || 'General Studies'));

      const { error } = await supabaseAdmin
        .from('cbt_questions')
        .update({
          subject: canonicalSubject,
          topic: String(topic || '').trim(),
          text: String(text || '').trim(),
          options: Array.isArray(options) ? options.map((o: any) => String(o).trim()) : [],
          correct_option_index: Number(correctOptionIndex || 0),
          explanation: String(explanation || '').trim(),
        })
        .eq('id', id);

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(
        actorName || 'Admin',
        'Updated CBT Question',
        'Question Bank',
        `Edited Q#${id} (${canonicalSubject} · ${topic})`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update CBT question.' });
    }
  });

  router.delete('/questions/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = Number(req.params.id);
      const actorName = String(req.query.actor || 'Admin');

      const { error } = await supabaseAdmin.from('cbt_questions').delete().eq('id', id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(actorName, 'Deleted CBT Question', 'Question Bank', `Removed question #${id}`);
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete CBT question.' });
    }
  });

  router.post('/subjects', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { name, description, tag, lessonsCount, questionsCount, iconName, actorName } = req.body || {};
      if (!name || !String(name).trim()) {
        res.status(400).json({ error: 'Subject name is required.' });
        return;
      }

      const cleanName = String(name).trim();
      const id =
        cleanName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `subj-${Date.now()}`;

      const { error } = await supabaseAdmin.from('subjects').upsert({
        id,
        name: cleanName,
        description:
          String(description || '').trim() ||
          `Structured notes, past questions & answers, and CBT practice for ${cleanName}.`,
        tag: String(tag || 'WAEC & JAMB').trim(),
        progress: 0,
        lessons_count: Number(lessonsCount || 0),
        questions_count: Number(questionsCount || 0),
        icon_name: String(iconName || inferSubjectIcon(cleanName)),
        color_theme: 'bg-emerald-500/10 text-emerald-400',
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(actorName || 'Admin', 'Saved Subject', 'Curriculum', `Configured subject "${cleanName}"`);
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to save subject.' });
    }
  });

  router.delete('/subjects/:id', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const id = String(req.params.id);
      const actorName = String(req.query.actor || 'Admin');

      const { error } = await supabaseAdmin.from('subjects').delete().eq('id', id);
      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      await logSystemActivity(actorName, 'Removed Subject', 'Curriculum', `Deleted subject ${id}`);
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete subject.' });
    }
  });

  router.post('/exams/submit', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { userId, userName, title, result } = req.body || {};
      if (!result) {
        res.status(400).json({ error: 'Exam result payload required.' });
        return;
      }

      const resolvedUserId = String(userId || 'guest');
      const { error } = await supabaseAdmin.from('exam_results').insert({
        user_id: resolvedUserId,
        total_questions: Number(result.totalQuestions || 0),
        attempted_count: Number(result.attemptedCount || 0),
        correct_count: Number(result.correctCount || 0),
        wrong_count: Number(result.wrongCount || 0),
        score_percentage: Number(result.scorePercentage || 0),
        subject_breakdown: result.subjectBreakdown || {},
        time_spent_seconds: Number(result.timeSpentSeconds || 0),
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      const mins = Math.max(1, Math.round(Number(result.timeSpentSeconds || 0) / 60));
      await supabaseAdmin.from('recent_activity').insert({
        id: `act-${Date.now()}`,
        user_id: resolvedUserId,
        title: String(title || 'CBT Practice Session'),
        type: 'cbt',
        score: `${result.scorePercentage}%`,
        detail: `Answered ${result.attemptedCount}/${result.totalQuestions} (${result.correctCount} correct) in ${mins}m`,
        time_ago: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        icon: 'assignment_turned_in',
        badge_bg: 'bg-emerald-500/10',
        badge_text_color: 'text-emerald-400',
      });

      await logSystemActivity(
        userName || resolvedUserId,
        'Completed CBT Exam',
        'CBT Engine',
        `Scored ${result.scorePercentage}% (${result.correctCount}/${result.totalQuestions}) in ${mins}m`
      );

      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to record exam submission.' });
    }
  });

  router.post('/activity/read', async (req, res) => {
    if (!ensureConfigured(res)) return;
    try {
      const { userId, userName, materialTitle, subject } = req.body || {};
      if (userId) {
        await supabaseAdmin.from('recent_activity').insert({
          id: `act-${Date.now()}`,
          user_id: String(userId),
          title: `Studied: ${materialTitle}`,
          type: 'reading',
          score: null,
          detail: `${subject} academic resource`,
          time_ago: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
          icon: 'menu_book',
          badge_bg: 'bg-zinc-800',
          badge_text_color: 'text-zinc-300',
        });
      }
      await logSystemActivity(
        userName || 'Student',
        'Opened Resource',
        'Content Library',
        `Opened "${materialTitle}" (${subject})`
      );
      const snapshot = await refreshAndNotifySnapshot();
      res.json({ snapshot });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to log reading activity.' });
    }
  });

  // Server-side Gemini Study Copilot endpoints (answering student questions & explaining study notes)
  router.post('/copilot/chat', handleCopilotChat);
  router.post('/copilot/stream', handleCopilotStream);

  app.use('/api', router);
  app.use('/api', (req, res) => {
    res.status(404).json({
      error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
    });
  });

  if (options.mountAtRoot || process.env.VERCEL) {
    app.use('/', router);
    app.use((req, res) => {
      res.status(404).json({
        error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
      });
    });
  }

  return app;
}
