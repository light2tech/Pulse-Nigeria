import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  PlatformSnapshot,
  AppView,
  UserProfile,
  ExamResult,
  ResourceAttachment,
  PastQuestionItem,
} from '../types';
import {
  apiRequest,
  fetchSnapshotFromServer,
  submitExamToServer,
  logMaterialReadingOnServer,
} from './supabaseService';
import { supabase } from './supabase';

interface CbtProgressPayload {
  mode: string;
  subjectFilter: string;
  currentQuestion: number;
  answeredCount: number;
  totalQuestions: number;
  timeLeftSeconds: number;
}

interface PlatformContextValue {
  snapshot: PlatformSnapshot;
  isLoading: boolean;
  wsConnected: boolean;
  error: string | null;
  refreshSnapshot: () => Promise<void>;
  reportPresence: (view: AppView, user: UserProfile | null, cbtProgress?: CbtProgressPayload | null) => void;
  createMaterial: (payload: {
    title: string;
    subject: string;
    level: string;
    summary: string;
    content: string[];
    attachment?: ResourceAttachment | null;
    imageUrl?: string;
    actorName?: string;
  }) => Promise<void>;
  updateMaterial: (
    id: string,
    payload: {
      title: string;
      subject: string;
      level: string;
      summary: string;
      content: string[];
      attachment?: ResourceAttachment | null;
      imageUrl?: string;
      actorName?: string;
    }
  ) => Promise<void>;
  deleteMaterial: (id: string, actorName?: string) => Promise<void>;
  createPastQuestion: (payload: {
    title: string;
    subject: string;
    examBody: string;
    examYear: string;
    paperType: string;
    summary: string;
    items: PastQuestionItem[];
    attachment?: ResourceAttachment | null;
    pushObjectivesToCbt?: boolean;
    actorName?: string;
  }) => Promise<{ pushedCbtCount: number }>;
  updatePastQuestion: (
    id: string,
    payload: {
      title: string;
      subject: string;
      examBody: string;
      examYear: string;
      paperType: string;
      summary: string;
      items: PastQuestionItem[];
      attachment?: ResourceAttachment | null;
      pushObjectivesToCbt?: boolean;
      actorName?: string;
    }
  ) => Promise<void>;
  deletePastQuestion: (id: string, actorName?: string) => Promise<void>;
  createQuestion: (payload: {
    subject: string;
    topic: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    actorName?: string;
  }) => Promise<void>;
  bulkCreateQuestions: (payload: {
    questions: {
      subject: string;
      topic: string;
      text: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string;
    }[];
    actorName?: string;
  }) => Promise<{ insertedCount: number }>;
  updateQuestion: (
    id: number,
    payload: {
      subject: string;
      topic: string;
      text: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string;
      actorName?: string;
    }
  ) => Promise<void>;
  deleteQuestion: (id: number, actorName?: string) => Promise<void>;
  saveSubject: (payload: {
    name: string;
    description: string;
    tag: string;
    lessonsCount: number;
    questionsCount: number;
    iconName: string;
    actorName?: string;
  }) => Promise<void>;
  deleteSubject: (id: string, actorName?: string) => Promise<void>;
  adminCreateUser: (payload: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: 'student' | 'admin';
    studentClass: string;
    actorName?: string;
  }) => Promise<void>;
  adminUpdateUser: (
    id: string,
    payload: {
      role?: 'student' | 'admin';
      name?: string;
      studentClass?: string;
      phone?: string;
      actorName?: string;
    }
  ) => Promise<void>;
  adminDeleteUser: (id: string, actorName?: string) => Promise<void>;
  recordExamSubmission: (params: {
    userId: string;
    userName: string;
    title: string;
    result: ExamResult;
  }) => Promise<void>;
  recordMaterialRead: (params: {
    userId?: string;
    userName?: string;
    materialTitle: string;
    subject: string;
  }) => Promise<void>;
}

const emptySnapshot: PlatformSnapshot = {
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
  syncedAt: '',
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<PlatformSnapshot>(emptySnapshot);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const clientIdRef = useRef<string>(
    `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
  const connectedAtRef = useRef<string>(new Date().toISOString());
  const latestPresenceRef = useRef<{
    view: AppView;
    user: UserProfile | null;
    cbtProgress: CbtProgressPayload | null;
  }>({
    view: 'landing',
    user: null,
    cbtProgress: null,
  });

  const refreshSnapshot = useCallback(async () => {
    try {
      const data = await fetchSnapshotFromServer();
      setSnapshot((prev) => ({
        ...emptySnapshot,
        ...data,
        pastQuestions: Array.isArray(data.pastQuestions) ? data.pastQuestions : [],
        presence:
          Array.isArray(data.presence) && data.presence.length > 0 ? data.presence : prev.presence,
      }));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to sync with Supabase');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPresenceUpdate = useCallback(() => {
    const { view, user, cbtProgress } = latestPresenceRef.current;
    const payload = {
      clientId: clientIdRef.current,
      userId: user?.id || null,
      userName: user?.name || 'Visitor',
      userEmail: user?.email || null,
      role: user?.role || 'guest',
      view,
      connectedAt: connectedAtRef.current,
      updatedAt: new Date().toISOString(),
      cbtProgress,
    };

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'presence:update',
          payload,
        })
      );
    }

    const pChannel = presenceChannelRef.current;
    if (pChannel) {
      pChannel.track(payload).catch(() => {});
    }
  }, []);

  const reportPresence = useCallback(
    (view: AppView, user: UserProfile | null, cbtProgress: CbtProgressPayload | null = null) => {
      latestPresenceRef.current = { view, user, cbtProgress };
      sendPresenceUpdate();
    },
    [sendPresenceUpdate]
  );

  useEffect(() => {
    let unmounted = false;
    let wsEverOpened = false;
    let wsFailureCount = 0;
    const isServerlessHost =
      typeof window !== 'undefined' && /\.vercel\.app$/i.test(window.location.hostname);

    refreshSnapshot();

    const connectWs = () => {
      if (unmounted || isServerlessHost) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) return;
          wsEverOpened = true;
          wsFailureCount = 0;
          setWsConnected(true);
          sendPresenceUpdate();
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'snapshot' && msg.payload) {
              setSnapshot({
                ...emptySnapshot,
                ...msg.payload,
                pastQuestions: Array.isArray(msg.payload.pastQuestions) ? msg.payload.pastQuestions : [],
              });
              setIsLoading(false);
              setError(null);
            } else if (msg.type === 'presence' && Array.isArray(msg.payload)) {
              setSnapshot((prev) => ({
                ...prev,
                presence: msg.payload,
              }));
            }
          } catch {
            // ignore malformed messages
          }
        };

        ws.onclose = () => {
          if (unmounted) return;
          setWsConnected(false);
          wsFailureCount += 1;
          // Stop retrying /ws on serverless platforms where /ws endpoint does not exist
          if (wsEverOpened || wsFailureCount < 2) {
            reconnectTimerRef.current = window.setTimeout(connectWs, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setWsConnected(false);
      }
    };

    connectWs();

    const handleFocus = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'snapshot:request' }));
      } else {
        refreshSnapshot();
      }
    };
    window.addEventListener('focus', handleFocus);

    // Periodic background refresh when running on serverless hosts (e.g. Vercel) without /ws
    const pollInterval = window.setInterval(() => {
      if (
        document.visibilityState === 'visible' &&
        (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      ) {
        refreshSnapshot();
      }
    }, 15000);

    const isClientSupabaseConfigured =
      !String((supabase as any)?.supabaseUrl || '').includes('placeholder.supabase.co');

    let dbChannel: ReturnType<typeof supabase.channel> | null = null;
    if (isClientSupabaseConfigured) {
      dbChannel = supabase
        .channel('edupulse-db-sync', {
          config: { presence: { key: clientIdRef.current } },
        })
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          refreshSnapshot();
        })
        .on('presence', { event: 'sync' }, () => {
          if (!dbChannel || wsRef.current?.readyState === WebSocket.OPEN) return;
          const state = dbChannel.presenceState();
          const list: any[] = [];
          for (const entries of Object.values(state)) {
            if (Array.isArray(entries) && entries[0]) {
              list.push(entries[0]);
            }
          }
          if (list.length > 0) {
            setSnapshot((prev) => ({ ...prev, presence: list }));
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            presenceChannelRef.current = dbChannel;
            sendPresenceUpdate();
          }
        });
    }

    return () => {
      unmounted = true;
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(pollInterval);
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
      presenceChannelRef.current = null;
      if (dbChannel) supabase.removeChannel(dbChannel);
    };
  }, [refreshSnapshot, sendPresenceUpdate]);

  const applyServerSnapshot = (res: { snapshot?: PlatformSnapshot }) => {
    if (res?.snapshot) {
      setSnapshot({
        ...emptySnapshot,
        ...res.snapshot,
        pastQuestions: Array.isArray(res.snapshot.pastQuestions) ? res.snapshot.pastQuestions : [],
      });
    } else {
      refreshSnapshot();
    }
  };

  const createMaterial: PlatformContextValue['createMaterial'] = async (payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    applyServerSnapshot(res);
  };

  const updateMaterial: PlatformContextValue['updateMaterial'] = async (id, payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(`/api/materials/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    applyServerSnapshot(res);
  };

  const deleteMaterial: PlatformContextValue['deleteMaterial'] = async (id, actorName) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(
      `/api/materials/${encodeURIComponent(id)}?actor=${encodeURIComponent(actorName || 'Admin')}`,
      { method: 'DELETE' }
    );
    applyServerSnapshot(res);
  };

  const createPastQuestion: PlatformContextValue['createPastQuestion'] = async (payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot; pushedCbtCount?: number }>(
      '/api/past-questions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    applyServerSnapshot(res);
    return { pushedCbtCount: Number(res.pushedCbtCount || 0) };
  };

  const updatePastQuestion: PlatformContextValue['updatePastQuestion'] = async (id, payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(
      `/api/past-questions/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    applyServerSnapshot(res);
  };

  const deletePastQuestion: PlatformContextValue['deletePastQuestion'] = async (id, actorName) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(
      `/api/past-questions/${encodeURIComponent(id)}?actor=${encodeURIComponent(actorName || 'Admin')}`,
      { method: 'DELETE' }
    );
    applyServerSnapshot(res);
  };

  const createQuestion: PlatformContextValue['createQuestion'] = async (payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    applyServerSnapshot(res);
  };

  const bulkCreateQuestions: PlatformContextValue['bulkCreateQuestions'] = async (payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot; insertedCount?: number }>(
      '/api/questions/bulk',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    applyServerSnapshot(res);
    return { insertedCount: Number(res.insertedCount || 0) };
  };

  const updateQuestion: PlatformContextValue['updateQuestion'] = async (id, payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(`/api/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    applyServerSnapshot(res);
  };

  const deleteQuestion: PlatformContextValue['deleteQuestion'] = async (id, actorName) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(
      `/api/questions/${id}?actor=${encodeURIComponent(actorName || 'Admin')}`,
      { method: 'DELETE' }
    );
    applyServerSnapshot(res);
  };

  const saveSubject: PlatformContextValue['saveSubject'] = async (payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    applyServerSnapshot(res);
  };

  const deleteSubject: PlatformContextValue['deleteSubject'] = async (id, actorName) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(
      `/api/subjects/${encodeURIComponent(id)}?actor=${encodeURIComponent(actorName || 'Admin')}`,
      { method: 'DELETE' }
    );
    applyServerSnapshot(res);
  };

  const adminCreateUser: PlatformContextValue['adminCreateUser'] = async (payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    applyServerSnapshot(res);
  };

  const adminUpdateUser: PlatformContextValue['adminUpdateUser'] = async (id, payload) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    applyServerSnapshot(res);
  };

  const adminDeleteUser: PlatformContextValue['adminDeleteUser'] = async (id, actorName) => {
    const res = await apiRequest<{ snapshot: PlatformSnapshot }>(
      `/api/admin/users/${encodeURIComponent(id)}?actor=${encodeURIComponent(actorName || 'Admin')}`,
      { method: 'DELETE' }
    );
    applyServerSnapshot(res);
  };

  const recordExamSubmission: PlatformContextValue['recordExamSubmission'] = async (params) => {
    const updated = await submitExamToServer(params);
    setSnapshot({
      ...emptySnapshot,
      ...updated,
      pastQuestions: Array.isArray(updated.pastQuestions) ? updated.pastQuestions : [],
    });
  };

  const recordMaterialRead: PlatformContextValue['recordMaterialRead'] = async (params) => {
    const updated = await logMaterialReadingOnServer(params);
    setSnapshot({
      ...emptySnapshot,
      ...updated,
      pastQuestions: Array.isArray(updated.pastQuestions) ? updated.pastQuestions : [],
    });
  };

  return (
    <PlatformContext.Provider
      value={{
        snapshot,
        isLoading,
        wsConnected,
        error,
        refreshSnapshot,
        reportPresence,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        createPastQuestion,
        updatePastQuestion,
        deletePastQuestion,
        createQuestion,
        bulkCreateQuestions,
        updateQuestion,
        deleteQuestion,
        saveSubject,
        deleteSubject,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        recordExamSubmission,
        recordMaterialRead,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used inside PlatformProvider');
  }
  return ctx;
}
