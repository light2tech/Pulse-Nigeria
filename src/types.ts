export type AppView =
  | 'landing'
  | 'cbt'
  | 'dashboard'
  | 'admin'
  | 'login'
  | 'register';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  studentClass?: string;
  avatarUrl: string;
  streakDays: number;
  createdAt?: string;
  lastSignInAt?: string | null;
  emailVerified?: boolean;
}

export interface PlatformUser extends UserProfile {
  examAttemptsCount: number;
  averageScore: number | null;
}

export interface SubjectItem {
  id: string;
  name: string;
  description: string;
  tag: string;
  progress: number;
  lessonsCount: number;
  questionsCount: number;
  pastPapersCount?: number;
  iconName: string;
  colorTheme: string;
}

export interface ResourceAttachment {
  fileName: string;
  mimeType: string;
  sizeBytes?: number;
  storagePointer: string;
  fileUrl?: string;
}

export interface CbtQuestion {
  id: number;
  subject: string;
  topic: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  createdAt?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  level: string;
  dateAdded: string;
  summary: string;
  imageUrl?: string;
  content: string[];
  attachment?: ResourceAttachment | null;
  createdAt?: string;
}

export interface PastQuestionItem {
  id: string;
  questionNumber: number;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  answer: string;
  explanation?: string;
}

export interface PastQuestionPaper {
  id: string;
  title: string;
  subject: string;
  examBody: string;
  examYear: string;
  paperType: string;
  summary: string;
  dateAdded: string;
  items: PastQuestionItem[];
  attachment?: ResourceAttachment | null;
  createdAt?: string;
}

export interface RecentActivityItem {
  id: string;
  userId?: string;
  title: string;
  type: 'cbt' | 'reading' | 'practice';
  score?: string;
  detail: string;
  timeAgo: string;
  icon: string;
  badgeBg?: string;
  badgeTextColor?: string;
  createdAt?: string;
}

export interface ExamResult {
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  wrongCount: number;
  scorePercentage: number;
  subjectBreakdown: Record<string, { total: number; correct: number }>;
  timeSpentSeconds: number;
}

export interface ExamResultRecord extends ExamResult {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  actorName: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
}

export interface LivePresenceSession {
  clientId: string;
  userId: string | null;
  userName: string;
  userEmail: string | null;
  role: UserRole | 'guest';
  view: AppView;
  connectedAt: string;
  updatedAt: string;
  cbtProgress?: {
    mode: string;
    subjectFilter: string;
    currentQuestion: number;
    answeredCount: number;
    totalQuestions: number;
    timeLeftSeconds: number;
  } | null;
}

export interface PlatformSnapshot {
  users: PlatformUser[];
  materials: StudyMaterial[];
  pastQuestions: PastQuestionPaper[];
  questions: CbtQuestion[];
  subjects: SubjectItem[];
  examResults: ExamResultRecord[];
  activityLogs: ActivityLogItem[];
  recentActivities: RecentActivityItem[];
  presence: LivePresenceSession[];
  supabaseConnected: boolean;
  syncedAt: string;
}

export interface CbtLaunchConfig {
  mode: 'standard' | 'subject' | 'smart_weakness';
  subject?: string;
  durationMinutes?: number;
}
