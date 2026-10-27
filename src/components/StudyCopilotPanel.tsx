import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CopilotContextPayload,
  CopilotLaunchRequest,
  CopilotMessage,
  StudyMaterial,
  UserProfile,
} from '../types';
import { usePlatform } from '../lib/realtimeStore';
import { sendCopilotMessage } from '../lib/copilotClient';

interface StudyCopilotPanelProps {
  currentUser: UserProfile | null;
  weakestSubject?: string | null;
  launchRequest?: CopilotLaunchRequest | null;
  onConsumeLaunchRequest?: () => void;
  compact?: boolean;
  onClose?: () => void;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

const FormattedAcademicContent: React.FC<{ content: string }> = ({ content }) => {
  const blocks = useMemo(() => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    lines.forEach((rawLine, index) => {
      const trimmed = rawLine.trim();

      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="my-2.5 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed"
            >
              {codeLines.join('\n')}
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(rawLine);
        return;
      }

      if (!trimmed) {
        elements.push(<div key={`sp-${index}`} className="h-2" />);
        return;
      }

      if (/^#{1,3}\s+/.test(trimmed)) {
        const headingText = trimmed.replace(/^#{1,3}\s+/, '');
        elements.push(
          <h4
            key={`h-${index}`}
            className="font-headline text-sm font-bold text-white pt-2 pb-0.5"
          >
            {renderInlineFormatting(headingText)}
          </h4>
        );
        return;
      }

      if (/^[-*•]\s+/.test(trimmed)) {
        const bulletText = trimmed.replace(/^[-*•]\s+/, '');
        elements.push(
          <div key={`ul-${index}`} className="flex items-start gap-2.5 pl-1 py-0.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 mt-2 shrink-0" />
            <div className="flex-1 text-zinc-200 leading-relaxed">
              {renderInlineFormatting(bulletText)}
            </div>
          </div>
        );
        return;
      }

      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={`ol-${index}`} className="flex items-start gap-2.5 pl-1 py-0.5">
            <span className="font-mono text-xs font-semibold text-emerald-400 mt-0.5 shrink-0 tabular-nums">
              {numMatch[1]}.
            </span>
            <div className="flex-1 text-zinc-200 leading-relaxed">
              {renderInlineFormatting(numMatch[2])}
            </div>
          </div>
        );
        return;
      }

      elements.push(
        <p key={`p-${index}`} className="text-zinc-200 leading-relaxed">
          {renderInlineFormatting(rawLine)}
        </p>
      );
    });

    if (inCodeBlock && codeLines.length > 0) {
      elements.push(
        <pre
          key="code-tail"
          className="my-2.5 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed"
        >
          {codeLines.join('\n')}
        </pre>
      );
    }

    return elements;
  }, [content]);

  return <div className="space-y-1 text-xs sm:text-[13px]">{blocks}</div>;
};

export const StudyCopilotPanel: React.FC<StudyCopilotPanelProps> = ({
  currentUser,
  weakestSubject,
  launchRequest,
  onConsumeLaunchRequest,
  compact = false,
  onClose,
}) => {
  const { snapshot } = usePlatform();
  const storageKey = `edupulse_copilot_v1_${currentUser?.id || 'guest'}`;

  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(-30);
      }
    } catch {
      // ignore storage read error
    }
    return [];
  });

  const [activeContext, setActiveContext] = useState<CopilotContextPayload>({
    type: 'general',
    subject: 'All',
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNoteSelector, setShowNoteSelector] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync saved conversation when user switches account
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMessages(parsed.slice(-30));
          return;
        }
      }
    } catch {
      // ignore
    }
    setMessages([]);
  }, [storageKey]);

  // Persist messages cleanly
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)));
    } catch {
      // ignore quota
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isStreaming]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    snapshot.subjects.forEach((s) => s.name && set.add(s.name));
    snapshot.materials.forEach((m) => m.subject && set.add(m.subject));
    snapshot.questions.forEach((q) => q.subject && set.add(q.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [snapshot.subjects, snapshot.materials, snapshot.questions]);

  const contextBadgeLabel = useMemo(() => {
    if (activeContext.type === 'material' && activeContext.materialTitle) {
      const secPart =
        typeof activeContext.sectionIndex === 'number'
          ? ` · Sec ${activeContext.sectionIndex + 1}/${activeContext.totalSections || 1}`
          : '';
      return `Note: ${activeContext.materialTitle}${secPart}`;
    }
    if (activeContext.type === 'question' && activeContext.questionText) {
      return `${activeContext.questionSource || 'Question'} · ${activeContext.subject || 'Exam Item'}`;
    }
    if (activeContext.subject && activeContext.subject !== 'All') {
      return `Subject Focus: ${activeContext.subject}`;
    }
    return undefined;
  }, [activeContext]);

  const triggerPrompt = useCallback(
    async (promptText: string, overrideContext?: CopilotContextPayload) => {
      const trimmed = promptText.trim();
      if (!trimmed || isStreaming) return;

      const ctxToUse = overrideContext || activeContext;
      setErrorBanner(null);

      const labelForMsg =
        ctxToUse.type === 'material' && ctxToUse.materialTitle
          ? `Note: ${ctxToUse.materialTitle}`
          : ctxToUse.type === 'question'
            ? `${ctxToUse.questionSource || 'Question'} (${ctxToUse.subject || 'CBT'})`
            : ctxToUse.subject && ctxToUse.subject !== 'All'
              ? ctxToUse.subject
              : undefined;

      const userMsg: CopilotMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
        contextLabel: labelForMsg,
      };

      const assistantMsgId = `a-${Date.now() + 1}`;
      const placeholderAssistant: CopilotMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      const historySnapshot = [...messages, userMsg];
      setMessages([...historySnapshot, placeholderAssistant]);
      setInput('');
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        let accumulated = '';
        await sendCopilotMessage({
          messages: historySnapshot.map((m) => ({ role: m.role, content: m.content })),
          context: ctxToUse,
          student: {
            name: currentUser?.name,
            studentClass: currentUser?.studentClass,
            weakestSubject: weakestSubject || null,
          },
          signal: controller.signal,
          onToken: (delta) => {
            accumulated += delta;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
            );
          },
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setMessages((prev) =>
            prev
              .map((m) =>
                m.id === assistantMsgId && !m.content.trim()
                  ? { ...m, content: 'Generation stopped.' }
                  : m
              )
              .filter(Boolean)
          );
        } else {
          const message = err?.message || 'Unable to reach Study Copilot right now.';
          setErrorBanner(message);
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [activeContext, currentUser?.name, currentUser?.studentClass, isStreaming, messages, weakestSubject]
  );

  // Consume external launch requests (e.g. clicking "Explain Note" or "Explain Question")
  useEffect(() => {
    if (!launchRequest) return;
    setActiveContext(launchRequest.context);
    const autoPrompt = launchRequest.autoPrompt;
    onConsumeLaunchRequest?.();
    if (autoPrompt) {
      triggerPrompt(autoPrompt, launchRequest.context);
    }
  }, [launchRequest, onConsumeLaunchRequest, triggerPrompt]);

  const handleAttachMaterial = (mat: StudyMaterial) => {
    const pages =
      mat.content && mat.content.length > 0 ? mat.content : [mat.summary || 'Study module notes.'];
    setActiveContext({
      type: 'material',
      subject: mat.subject,
      materialId: mat.id,
      materialTitle: mat.title,
      materialLevel: mat.level,
      materialSummary: mat.summary,
      sectionIndex: 0,
      totalSections: pages.length,
      currentSectionContent: pages[0],
      fullNoteContent: pages,
    });
    setShowNoteSelector(false);
  };

  const handleStopStreaming = () => {
    abortControllerRef.current?.abort();
  };

  const handleClearChat = () => {
    if (isStreaming) handleStopStreaming();
    setMessages([]);
    setErrorBanner(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const handleCopyMessage = async (msg: CopilotMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId((prev) => (prev === msg.id ? null : prev)), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const quickActions = useMemo(() => {
    if (activeContext.type === 'material') {
      return [
        {
          label: 'Explain this note simply',
          prompt: `Explain the study note "${activeContext.materialTitle}" clearly step-by-step with relatable examples and highlight what JAMB/WAEC examiners test most.`,
        },
        {
          label: 'Key formulas & definitions',
          prompt: `Extract and explain all key definitions, rules, or formulas from "${activeContext.materialTitle}" in a clean revision sheet.`,
        },
        {
          label: 'Summarize for quick revision',
          prompt: `Give me a concise high-yield revision summary of "${activeContext.materialTitle}" and list common exam traps to avoid.`,
        },
        {
          label: 'Quiz me (3 JAMB questions)',
          prompt: `Generate 3 realistic JAMB UTME multiple-choice questions (A–D) based on "${activeContext.materialTitle}". Wait for me to answer or put the answers at the very bottom.`,
        },
      ];
    }

    if (activeContext.type === 'question') {
      return [
        {
          label: 'Step-by-step solution',
          prompt:
            'Walk me through this question step-by-step and explain clearly why the official answer is correct.',
        },
        {
          label: 'Why are other options wrong?',
          prompt:
            'Explain why each of the other options is incorrect and what common mistake leads students to pick them.',
        },
        {
          label: 'Fast exam-hall shortcut',
          prompt:
            'Teach me the fastest shortcut or rule of thumb to solve questions like this under 45 seconds in JAMB CBT.',
        },
        {
          label: 'Give me a similar practice question',
          prompt:
            'Create 1 new practice question testing this exact concept so I can verify I understand it.',
        },
      ];
    }

    const focusSubj =
      activeContext.subject && activeContext.subject !== 'All'
        ? activeContext.subject
        : weakestSubject || 'English Language';

    return [
      {
        label: `High-yield ${focusSubj} topics`,
        prompt: `What are the highest-yield JAMB syllabus topics and exam rules I must master in ${focusSubj}?`,
      },
      {
        label: 'Explain a tough concept simply',
        prompt: `Pick a commonly misunderstood JAMB topic in ${focusSubj} and break it down step-by-step with examples.`,
      },
      {
        label: 'English concord & lexis rules',
        prompt:
          'Explain the essential JAMB Use of English concord rules with clear correct vs. wrong sentence examples.',
      },
      {
        label: 'Give me a quick drill question',
        prompt: `Give me 1 challenging JAMB standard question in ${focusSubj} with options A–D and walk me through how to approach it.`,
      },
    ];
  }, [activeContext, weakestSubject]);

  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden text-zinc-100 ${
        compact ? 'h-full' : 'h-[calc(100vh-12rem)] min-h-[580px]'
      }`}
    >
      {/* Top Copilot Header */}
      <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-emerald-400 text-lg">auto_awesome</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-sm font-bold text-white truncate">
                EduPulse Study Copilot
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 shrink-0">
                JAMB · WAEC · NECO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              Ask any academic question or attach a syllabus note for step-by-step explanations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowNoteSelector((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showNoteSelector || activeContext.type === 'material'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title="Attach a Study Note to explain"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            <span className="hidden sm:inline">Attach Note</span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Start a fresh conversation"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close Study Copilot"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Study Note Picker Drawer */}
      {showNoteSelector && (
        <div className="px-5 py-3.5 bg-zinc-950/95 border-b border-zinc-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-200">
              Select a Syllabus Note for Copilot to Explain
            </span>
            <button
              type="button"
              onClick={() => setShowNoteSelector(false)}
              className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
            >
              Close list
            </button>
          </div>

          {snapshot.materials.length === 0 ? (
            <p className="text-xs text-zinc-500 py-2">No study notes loaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
              {snapshot.materials.map((mat) => {
                const isSelected =
                  activeContext.type === 'material' && activeContext.materialId === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => handleAttachMaterial(mat)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                    }`}
                  >
                    <div className="text-[10px] font-semibold text-emerald-400">{mat.subject}</div>
                    <div className="text-xs font-medium text-white truncate mt-0.5">{mat.title}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Attached Context Bar OR Subject Focus Filter */}
      {activeContext.type !== 'general' ? (
        <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/25 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-sm text-emerald-400 shrink-0">
              {activeContext.type === 'material' ? 'description' : 'quiz'}
            </span>
            <div className="truncate">
              <span className="font-semibold text-emerald-300">
                {activeContext.type === 'material' ? 'Explaining Note: ' : 'Explaining Question: '}
              </span>
              <span className="text-zinc-200">
                {activeContext.type === 'material'
                  ? activeContext.materialTitle
                  : activeContext.questionText}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveContext({ type: 'general', subject: activeContext.subject || 'All' })}
            className="text-[11px] font-medium text-zinc-300 hover:text-white px-2 py-1 rounded bg-zinc-900/80 border border-zinc-800 shrink-0 cursor-pointer"
          >
            Detach
          </button>
        </div>
      ) : (
        <div className="px-5 py-2 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between gap-2 text-xs shrink-0">
          <span className="text-[11px] text-zinc-400">Subject Focus:</span>
          <select
            value={activeContext.subject || 'All'}
            onChange={(e) => setActiveContext({ type: 'general', subject: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All JAMB / SSCE Subjects</option>
            {availableSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Conversation Stream */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center max-w-xl mx-auto py-4 space-y-5">
            <div className="space-y-1.5 text-center">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 mb-1">
                <span className="material-symbols-outlined text-2xl">psychology</span>
              </div>
              <h3 className="font-headline text-base font-bold text-white">
                {activeContext.type === 'material'
                  ? `Ready to explain "${activeContext.materialTitle}"`
                  : activeContext.type === 'question'
                    ? 'Ready to break down this exam question'
                    : `Hi ${currentUser?.name?.split(' ')[0] || 'Scholar'}, what would you like to understand today?`}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {activeContext.type === 'material'
                  ? 'Pick a quick study action below or ask any specific question about this chapter note.'
                  : activeContext.type === 'question'
                    ? 'Ask why an option is right or wrong, or request step-by-step workings.'
                    : 'Paste a tough past question, attach a syllabus study note above, or ask for a step-by-step explanation on any topic.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {quickActions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => triggerPrompt(item.prompt)}
                  className="p-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-emerald-500/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                      {item.label}
                    </span>
                    <span className="material-symbols-outlined text-sm text-zinc-500 group-hover:text-emerald-400">
                      arrow_outward
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {msg.contextLabel && isUser && (
                  <span className="text-[10px] text-zinc-500 mb-1 px-1 max-w-[85%] truncate">
                    {msg.contextLabel}
                  </span>
                )}

                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-xl px-4 py-3.5 ${
                    isUser
                      ? 'bg-emerald-500 text-zinc-950 font-medium text-xs sm:text-[13px] leading-relaxed'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-100'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-line">{msg.content}</div>
                  ) : msg.content ? (
                    <div className="space-y-2.5">
                      <FormattedAcademicContent content={msg.content} />
                      <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <span>Study Copilot</span>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {copiedId === msg.id ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy note'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Working through explanation...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {errorBanner && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start justify-between gap-3">
            <div className="leading-relaxed">
              <span className="font-semibold text-red-300">Copilot Notice: </span>
              {errorBanner}
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-red-300 hover:text-white shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}
      </div>

      {/* Contextual Quick Follow-Up Row when conversation is active */}
      {messages.length > 0 && !isStreaming && (
        <div className="px-5 py-2 bg-zinc-950/50 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {quickActions.slice(0, 3).map((qa, i) => (
            <button
              key={i}
              type="button"
              onClick={() => triggerPrompt(qa.prompt)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-emerald-300 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {/* Composer Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          triggerPrompt(input);
        }}
        className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0"
      >
        {contextBadgeLabel && (
          <div className="text-[10px] text-emerald-400 font-medium mb-1.5 truncate">
            Active Context: {contextBadgeLabel}
          </div>
        )}
        <div className="flex items-end gap-2.5">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                triggerPrompt(input);
              }
            }}
            placeholder={
              activeContext.type === 'material'
                ? `Ask Copilot to explain a part of "${activeContext.materialTitle}"...`
                : activeContext.type === 'question'
                  ? 'Ask why an option is right/wrong or request another example...'
                  : 'Ask any JAMB/WAEC question or paste a note paragraph to explain...'
            }
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 resize-none focus:outline-none leading-relaxed"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopStreaming}
              className="px-4 py-2.5 h-[42px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">stop_circle</span>
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2.5 h-[42px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>Ask</span>
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
