import React, { useState, useMemo } from 'react';
import {
  StudyMaterial,
  UserProfile,
  CbtQuestion,
  PlatformUser,
  SubjectItem,
  PastQuestionPaper,
  PastQuestionItem,
  ResourceAttachment,
} from '../types';
import { usePlatform } from '../lib/realtimeStore';
import { uploadAcademicResourceToSupabase } from '../lib/supabaseService';
import { SubjectPickerField } from './SubjectPickerField';
import {
  EXAM_BODIES,
  parseBulkCbtQuestions,
  parseBulkPastQuestionsAndAnswers,
} from '../lib/subjectCatalog';

interface AdminPortalViewProps {
  currentUser: UserProfile;
  onPreviewPastQuestion?: (paper: PastQuestionPaper) => void;
  onPreviewMaterial?: (material: StudyMaterial) => void;
}

type AdminSection =
  | 'dashboard'
  | 'users'
  | 'past_questions'
  | 'questions'
  | 'content'
  | 'subjects'
  | 'settings';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentUser,
  onPreviewPastQuestion,
  onPreviewMaterial,
}) => {
  const {
    snapshot,
    isLoading,
    wsConnected,
    error,
    refreshSnapshot,
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
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<AdminSection>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'admin'>('all');

  const [materialSearch, setMaterialSearch] = useState('');
  const [materialSubjectFilter, setMaterialSubjectFilter] = useState('All');

  const [pqSearch, setPqSearch] = useState('');
  const [pqSubjectFilter, setPqSubjectFilter] = useState('All');
  const [pqExamFilter, setPqExamFilter] = useState('All');

  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('All');

  // --- 1. Reading Material Modal State ---
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState('Mathematics');
  const [matLevel, setMatLevel] = useState('SS 3');
  const [matSummary, setMatSummary] = useState('');
  const [matContentRaw, setMatContentRaw] = useState('');
  const [matAttachment, setMatAttachment] = useState<ResourceAttachment | null>(null);
  const [isUploadingMatFile, setIsUploadingMatFile] = useState(false);

  // --- 2. Past Questions & Answers Modal State ---
  const [pqModalOpen, setPqModalOpen] = useState(false);
  const [editingPq, setEditingPq] = useState<PastQuestionPaper | null>(null);
  const [pqTitle, setPqTitle] = useState('');
  const [pqSubject, setPqSubject] = useState('Mathematics');
  const [pqExamBody, setPqExamBody] = useState('WAEC WASSCE');
  const [pqExamYear, setPqExamYear] = useState(String(new Date().getFullYear()));
  const [pqPaperType, setPqPaperType] = useState('Objective & Theory');
  const [pqSummary, setPqSummary] = useState('');
  const [pqItems, setPqItems] = useState<PastQuestionItem[]>([]);
  const [pqBulkRaw, setPqBulkRaw] = useState('');
  const [pqShowBulkImporter, setPqShowBulkImporter] = useState(false);
  const [pqAttachment, setPqAttachment] = useState<ResourceAttachment | null>(null);
  const [isUploadingPqFile, setIsUploadingPqFile] = useState(false);
  const [pqPushToCbt, setPqPushToCbt] = useState(true);

  // --- 3. Single CBT Question Modal State ---
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CbtQuestion | null>(null);
  const [qSubject, setQSubject] = useState('Mathematics');
  const [qTopic, setQTopic] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qExplanation, setQExplanation] = useState('');

  // --- 4. Bulk CBT Question Upload Modal State ---
  const [bulkCbtModalOpen, setBulkCbtModalOpen] = useState(false);
  const [bulkCbtSubject, setBulkCbtSubject] = useState('Mathematics');
  const [bulkCbtTopic, setBulkCbtTopic] = useState('General');
  const [bulkCbtRaw, setBulkCbtRaw] = useState('');

  // --- 5. User Modal State ---
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uRole, setURole] = useState<'student' | 'admin'>('student');
  const [uClass, setUClass] = useState('SS 3 Science');

  // --- 6. Subject Modal State ---
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjDesc, setSubjDesc] = useState('');
  const [subjTag, setSubjTag] = useState('WAEC, NECO & JAMB');
  const [subjIcon, setSubjIcon] = useState('functions');

  const [isMutating, setIsMutating] = useState(false);

  const notifySuccess = (msg: string) => {
    setActionError(null);
    setActionSuccess(msg);
    window.setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setActionError(null);
    await refreshSnapshot();
    setIsSyncing(false);
    notifySuccess('Synchronized live counts and records directly with Supabase.');
  };

  // Exact real-time counts from Supabase (Zero Dummy Numbers)
  const totalUsersCount = snapshot.users.length;
  const studentUsersCount = snapshot.users.filter((u) => u.role === 'student').length;
  const adminUsersCount = snapshot.users.filter((u) => u.role === 'admin').length;
  const totalMaterialsCount = snapshot.materials.length;
  const totalPastPapersCount = snapshot.pastQuestions.length;
  const totalQuestionsCount = snapshot.questions.length;
  const totalSubjectsCount = snapshot.subjects.length;
  const totalExamsCount = snapshot.examResults.length;

  const meanPlatformAccuracy = useMemo(() => {
    if (snapshot.examResults.length === 0) return null;
    const sum = snapshot.examResults.reduce((acc, r) => acc + r.scorePercentage, 0);
    return Math.round(sum / snapshot.examResults.length);
  }, [snapshot.examResults]);

  // All distinct subjects across Supabase subjects, materials, pastQuestions, and questions
  const existingSubjectNames = useMemo(() => {
    const map = new Map<string, string>();
    snapshot.subjects.forEach((s) => {
      if (s.name) map.set(s.name.toLowerCase(), s.name);
    });
    snapshot.materials.forEach((m) => {
      if (m.subject && !map.has(m.subject.toLowerCase())) map.set(m.subject.toLowerCase(), m.subject);
    });
    snapshot.pastQuestions.forEach((pq) => {
      if (pq.subject && !map.has(pq.subject.toLowerCase())) map.set(pq.subject.toLowerCase(), pq.subject);
    });
    snapshot.questions.forEach((q) => {
      if (q.subject && !map.has(q.subject.toLowerCase())) map.set(q.subject.toLowerCase(), q.subject);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [snapshot.subjects, snapshot.materials, snapshot.pastQuestions, snapshot.questions]);

  const parsedBulkCbtPreview = useMemo(
    () => parseBulkCbtQuestions(bulkCbtRaw, bulkCbtSubject, bulkCbtTopic),
    [bulkCbtRaw, bulkCbtSubject, bulkCbtTopic]
  );

  // Filtered Collections
  const filteredUsers = useMemo(() => {
    return snapshot.users.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      const q = userSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentClass || '').toLowerCase().includes(q)
      );
    });
  }, [snapshot.users, userRoleFilter, userSearch]);

  const filteredMaterials = useMemo(() => {
    return snapshot.materials.filter((m) => {
      if (
        materialSubjectFilter !== 'All' &&
        m.subject.toLowerCase() !== materialSubjectFilter.toLowerCase()
      ) {
        return false;
      }
      const q = materialSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.level.toLowerCase().includes(q)
      );
    });
  }, [snapshot.materials, materialSubjectFilter, materialSearch]);

  const filteredPastQuestions = useMemo(() => {
    return snapshot.pastQuestions.filter((pq) => {
      if (pqSubjectFilter !== 'All' && pq.subject.toLowerCase() !== pqSubjectFilter.toLowerCase()) {
        return false;
      }
      if (pqExamFilter !== 'All' && pq.examBody.toLowerCase() !== pqExamFilter.toLowerCase()) {
        return false;
      }
      const q = pqSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        pq.title.toLowerCase().includes(q) ||
        pq.subject.toLowerCase().includes(q) ||
        pq.examBody.toLowerCase().includes(q) ||
        pq.examYear.toLowerCase().includes(q)
      );
    });
  }, [snapshot.pastQuestions, pqSubjectFilter, pqExamFilter, pqSearch]);

  const filteredQuestions = useMemo(() => {
    return snapshot.questions.filter((item) => {
      if (
        questionSubjectFilter !== 'All' &&
        item.subject.toLowerCase() !== questionSubjectFilter.toLowerCase()
      ) {
        return false;
      }
      const q = questionSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        item.text.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q)
      );
    });
  }, [snapshot.questions, questionSubjectFilter, questionSearch]);

  // --- Handlers: Reading Materials ---
  const openCreateMaterial = () => {
    setEditingMaterial(null);
    setMatTitle('');
    setMatSubject(existingSubjectNames[0] || 'Mathematics');
    setMatLevel('SS 3');
    setMatSummary('');
    setMatContentRaw('');
    setMatAttachment(null);
    setMaterialModalOpen(true);
  };

  const openEditMaterial = (mat: StudyMaterial) => {
    setEditingMaterial(mat);
    setMatTitle(mat.title);
    setMatSubject(mat.subject);
    setMatLevel(mat.level);
    setMatSummary(mat.summary);
    setMatContentRaw((mat.content || []).join('\n\n---\n\n'));
    setMatAttachment(mat.attachment || null);
    setMaterialModalOpen(true);
  };

  const handleImportMaterialTextFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '').trim();
      if (text) {
        setMatContentRaw((prev) => (prev.trim() ? `${prev}\n\n---\n\n${text}` : text));
        if (!matTitle.trim()) {
          setMatTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUploadMaterialAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMatFile(true);
    setActionError(null);
    try {
      const uploaded = await uploadAcademicResourceToSupabase(file);
      setMatAttachment(uploaded);
      if (!matTitle.trim()) {
        setMatTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to upload reading handout file.');
    } finally {
      setIsUploadingMatFile(false);
      e.target.value = '';
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matSubject.trim()) {
      setActionError('Please enter or select a subject.');
      return;
    }
    setIsMutating(true);
    setActionError(null);
    try {
      const sections = matContentRaw
        .split(/\n\s*---\s*\n/g)
        .map((s) => s.trim())
        .filter(Boolean);

      const contentPayload =
        sections.length > 0
          ? sections
          : [
              `### ${matTitle.trim()}\n\n${
                matSummary.trim() ||
                (matAttachment ? `Refer to the attached document: ${matAttachment.fileName}` : '')
              }`,
            ];

      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, {
          title: matTitle.trim(),
          subject: matSubject.trim(),
          level: matLevel.trim() || 'SS 3',
          summary: matSummary.trim(),
          content: contentPayload,
          attachment: matAttachment,
          actorName: currentUser.name,
        });
        notifySuccess(`Updated reading material "${matTitle.trim()}" (${matSubject.trim()}) in Supabase.`);
      } else {
        await createMaterial({
          title: matTitle.trim(),
          subject: matSubject.trim(),
          level: matLevel.trim() || 'SS 3',
          summary: matSummary.trim(),
          content: contentPayload,
          attachment: matAttachment,
          actorName: currentUser.name,
        });
        notifySuccess(`Published reading material "${matTitle.trim()}" (${matSubject.trim()}) to Supabase.`);
      }
      setMaterialModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save reading material.');
    } finally {
      setIsMutating(false);
    }
  };

  // --- Handlers: Past Questions & Answers ---
  const createBlankPqItem = (num: number): PastQuestionItem => ({
    id: `pqi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    questionNumber: num,
    question: '',
    options: undefined,
    correctOptionIndex: undefined,
    answer: '',
    explanation: '',
  });

  const openCreatePastQuestion = () => {
    setEditingPq(null);
    setPqTitle('');
    setPqSubject(existingSubjectNames[0] || 'Mathematics');
    setPqExamBody('WAEC WASSCE');
    setPqExamYear(String(new Date().getFullYear()));
    setPqPaperType('Objective & Theory');
    setPqSummary('');
    setPqItems([createBlankPqItem(1)]);
    setPqBulkRaw('');
    setPqShowBulkImporter(false);
    setPqAttachment(null);
    setPqPushToCbt(true);
    setPqModalOpen(true);
  };

  const openEditPastQuestion = (paper: PastQuestionPaper) => {
    setEditingPq(paper);
    setPqTitle(paper.title);
    setPqSubject(paper.subject);
    setPqExamBody(paper.examBody);
    setPqExamYear(paper.examYear);
    setPqPaperType(paper.paperType);
    setPqSummary(paper.summary);
    setPqItems(paper.items.length > 0 ? paper.items : [createBlankPqItem(1)]);
    setPqBulkRaw('');
    setPqShowBulkImporter(false);
    setPqAttachment(paper.attachment || null);
    setPqPushToCbt(false);
    setPqModalOpen(true);
  };

  const handleUploadPqAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPqFile(true);
    setActionError(null);
    try {
      const uploaded = await uploadAcademicResourceToSupabase(file);
      setPqAttachment(uploaded);
      if (!pqTitle.trim()) {
        setPqTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to upload past paper document.');
    } finally {
      setIsUploadingPqFile(false);
      e.target.value = '';
    }
  };

  const handleImportPqTextFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parsed = parseBulkPastQuestionsAndAnswers(text);
      if (parsed.length > 0) {
        setPqItems((prev) => {
          const nonEmpty = prev.filter((it) => it.question.trim().length > 0);
          const merged = [...nonEmpty, ...parsed].map((it, idx) => ({
            ...it,
            questionNumber: idx + 1,
          }));
          return merged;
        });
        notifySuccess(`Imported ${parsed.length} Past Question & Answer item(s) from ${file.name}.`);
      } else {
        setPqBulkRaw(text);
        setPqShowBulkImporter(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyPqBulkParse = () => {
    const parsed = parseBulkPastQuestionsAndAnswers(pqBulkRaw);
    if (parsed.length === 0) {
      setActionError(
        'Could not detect formatted questions. Ensure each question starts on a new line with "Answer: ..." below it.'
      );
      return;
    }
    setPqItems((prev) => {
      const nonEmpty = prev.filter((it) => it.question.trim().length > 0);
      return [...nonEmpty, ...parsed].map((it, idx) => ({
        ...it,
        questionNumber: idx + 1,
      }));
    });
    setPqBulkRaw('');
    setPqShowBulkImporter(false);
  };

  const handleSavePastQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pqSubject.trim()) {
      setActionError('Please enter or select a subject.');
      return;
    }

    const validItems = pqItems
      .map((it, idx) => ({
        ...it,
        questionNumber: idx + 1,
        question: it.question.trim(),
        answer:
          it.answer.trim() ||
          (it.options && it.options.length >= 2 && it.correctOptionIndex !== undefined
            ? `${String.fromCharCode(65 + it.correctOptionIndex)}. ${it.options[it.correctOptionIndex] || ''}`
            : ''),
      }))
      .filter((it) => Boolean(it.question));

    if (validItems.length === 0 && !pqAttachment) {
      setActionError('Add at least one Question & Answer OR attach a Past Question document/PDF.');
      return;
    }

    const resolvedTitle =
      pqTitle.trim() || `${pqExamBody.trim()} ${pqExamYear.trim()} ${pqSubject.trim()} Past Questions`;

    setIsMutating(true);
    setActionError(null);
    try {
      if (editingPq) {
        await updatePastQuestion(editingPq.id, {
          title: resolvedTitle,
          subject: pqSubject.trim(),
          examBody: pqExamBody.trim(),
          examYear: pqExamYear.trim(),
          paperType: pqPaperType.trim(),
          summary: pqSummary.trim(),
          items: validItems,
          attachment: pqAttachment,
          pushObjectivesToCbt: pqPushToCbt,
          actorName: currentUser.name,
        });
        notifySuccess(`Updated Past Questions "${resolvedTitle}" in Supabase.`);
      } else {
        const { pushedCbtCount } = await createPastQuestion({
          title: resolvedTitle,
          subject: pqSubject.trim(),
          examBody: pqExamBody.trim(),
          examYear: pqExamYear.trim(),
          paperType: pqPaperType.trim(),
          summary: pqSummary.trim(),
          items: validItems,
          attachment: pqAttachment,
          pushObjectivesToCbt: pqPushToCbt,
          actorName: currentUser.name,
        });
        notifySuccess(
          `Uploaded "${resolvedTitle}" (${validItems.length} Q&A)${
            pushedCbtCount > 0 ? ` and synced ${pushedCbtCount} objective item(s) to CBT Bank.` : '.'
          }`
        );
      }
      setPqModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save past questions & answers.');
    } finally {
      setIsMutating(false);
    }
  };

  // --- Handlers: CBT Questions (Single & Bulk) ---
  const openCreateQuestion = () => {
    setEditingQuestion(null);
    setQSubject(existingSubjectNames[0] || 'Mathematics');
    setQTopic('');
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrectIndex(0);
    setQExplanation('');
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (q: CbtQuestion) => {
    setEditingQuestion(q);
    setQSubject(q.subject);
    setQTopic(q.topic);
    setQText(q.text);
    const padded = [...(q.options || [])];
    while (padded.length < 4) padded.push('');
    setQOptions(padded.slice(0, 4));
    setQCorrectIndex(q.correctOptionIndex);
    setQExplanation(q.explanation || '');
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qSubject.trim()) {
      setActionError('Please enter or select a subject.');
      return;
    }
    setIsMutating(true);
    setActionError(null);
    try {
      const cleanedOptions = qOptions.map((o) => o.trim()).filter(Boolean);
      if (cleanedOptions.length < 2) {
        throw new Error('Please provide at least two non-empty answer options.');
      }

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, {
          subject: qSubject.trim(),
          topic: qTopic.trim() || 'General',
          text: qText.trim(),
          options: cleanedOptions,
          correctOptionIndex: Math.min(qCorrectIndex, cleanedOptions.length - 1),
          explanation: qExplanation.trim(),
          actorName: currentUser.name,
        });
        notifySuccess(`Updated CBT Question #${editingQuestion.id} (${qSubject.trim()}) in Supabase.`);
      } else {
        await createQuestion({
          subject: qSubject.trim(),
          topic: qTopic.trim() || 'General',
          text: qText.trim(),
          options: cleanedOptions,
          correctOptionIndex: Math.min(qCorrectIndex, cleanedOptions.length - 1),
          explanation: qExplanation.trim(),
          actorName: currentUser.name,
        });
        notifySuccess(`Added new ${qSubject.trim()} CBT question to Supabase.`);
      }
      setQuestionModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save CBT question.');
    } finally {
      setIsMutating(false);
    }
  };

  const openBulkCbtModal = () => {
    setBulkCbtSubject(existingSubjectNames[0] || 'Mathematics');
    setBulkCbtTopic('General');
    setBulkCbtRaw('');
    setBulkCbtModalOpen(true);
  };

  const handleBulkCbtFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBulkCbtRaw(String(reader.result || ''));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveBulkCbt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBulkCbtPreview.length === 0) {
      setActionError('No valid CBT questions detected. Check format instructions and try again.');
      return;
    }
    setIsMutating(true);
    setActionError(null);
    try {
      const { insertedCount } = await bulkCreateQuestions({
        questions: parsedBulkCbtPreview,
        actorName: currentUser.name,
      });
      notifySuccess(`Published ${insertedCount} CBT question(s) directly to Supabase.`);
      setBulkCbtModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Bulk CBT upload failed.');
    } finally {
      setIsMutating(false);
    }
  };

  // --- Handlers: Users ---
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUEmail('');
    setUPassword('');
    setUName('');
    setUPhone('');
    setURole('student');
    setUClass('SS 3 Science');
    setUserModalOpen(true);
  };

  const openEditUserModal = (user: PlatformUser) => {
    setEditingUser(user);
    setUEmail(user.email);
    setUPassword('');
    setUName(user.name);
    setUPhone(user.phone || '');
    setURole(user.role);
    setUClass(user.studentClass || 'SS 3 Science');
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    setActionError(null);
    try {
      if (editingUser) {
        await adminUpdateUser(editingUser.id, {
          name: uName.trim(),
          phone: uPhone.trim(),
          role: uRole,
          studentClass: uRole === 'admin' ? 'Administrator' : uClass,
          actorName: currentUser.name,
        });
        notifySuccess(`Updated ${editingUser.email} in Supabase Auth & Profiles.`);
      } else {
        await adminCreateUser({
          email: uEmail.trim().toLowerCase(),
          password: uPassword,
          name: uName.trim(),
          phone: uPhone.trim(),
          role: uRole,
          studentClass: uRole === 'admin' ? 'Administrator' : uClass,
          actorName: currentUser.name,
        });
        notifySuccess(`Created user ${uEmail.trim().toLowerCase()} in Supabase Auth.`);
      }
      setUserModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'User operation failed.');
    } finally {
      setIsMutating(false);
    }
  };

  // --- Handlers: Subjects ---
  const openSubjectModal = (subj?: SubjectItem) => {
    setSubjName(subj?.name || '');
    setSubjDesc(subj?.description || '');
    setSubjTag(subj?.tag || 'WAEC, NECO & JAMB');
    setSubjIcon(subj?.iconName || 'functions');
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    setActionError(null);
    try {
      await saveSubject({
        name: subjName.trim(),
        description: subjDesc.trim(),
        tag: subjTag.trim(),
        lessonsCount: 0,
        questionsCount: 0,
        iconName: subjIcon,
        actorName: currentUser.name,
      });
      notifySuccess(`Saved curriculum subject "${subjName.trim()}" in Supabase.`);
      setSubjectModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save subject.');
    } finally {
      setIsMutating(false);
    }
  };

  const navItems: { id: AdminSection; label: string; icon: string; count?: number }[] = [
    { id: 'dashboard', label: 'Console Overview', icon: 'space_dashboard' },
    { id: 'past_questions', label: 'Past Questions & Q/A', icon: 'history_edu', count: totalPastPapersCount },
    { id: 'questions', label: 'CBT Question Bank', icon: 'quiz', count: totalQuestionsCount },
    { id: 'content', label: 'Reading Materials', icon: 'library_books', count: totalMaterialsCount },
    { id: 'subjects', label: 'Curriculum Subjects', icon: 'category', count: totalSubjectsCount },
    { id: 'users', label: 'Supabase Users', icon: 'group', count: totalUsersCount },
    { id: 'settings', label: 'Database Audit', icon: 'database' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-zinc-950 font-body text-zinc-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900/75 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex md:flex-col justify-between gap-4 shrink-0">
        <div className="w-full">
          <div className="hidden md:block px-3 pb-4 mb-4 border-b border-zinc-800">
            <div className="text-xs font-semibold text-white">Administrative Console</div>
            <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  snapshot.supabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>
                {snapshot.supabaseConnected ? 'Supabase Live Connected' : 'Connecting to Supabase'}
              </span>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto hide-scrollbar text-xs">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setConfirmDeleteId(null);
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-emerald-400">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.count !== undefined && (
                  <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-emerald-400 truncate">{currentUser.email}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-[1200px] w-full mx-auto">
        {/* Top Bar Contract: Breadcrumb on Left, 1-2 Contextual Primary Actions on Right */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <span>Admin Console</span>
              <span aria-hidden="true">/</span>
              <span className="text-zinc-200">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-white">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">sync</span>
              <span>{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
            </button>

            {activeTab === 'past_questions' && (
              <button
                onClick={openCreatePastQuestion}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>Upload Past Questions &amp; Answers</span>
              </button>
            )}

            {activeTab === 'questions' && (
              <>
                <button
                  onClick={openBulkCbtModal}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Bulk Upload CBT</span>
                </button>
                <button
                  onClick={openCreateQuestion}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add CBT Question</span>
                </button>
              </>
            )}

            {activeTab === 'content' && (
              <button
                onClick={openCreateMaterial}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-sm">upload</span>
                <span>Upload Reading Material</span>
              </button>
            )}

            {activeTab === 'users' && (
              <button
                onClick={openCreateUserModal}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Add Supabase User</span>
              </button>
            )}

            {activeTab === 'subjects' && (
              <button
                onClick={() => openSubjectModal()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Subject</span>
              </button>
            )}
          </div>
        </header>

        {/* Status Alerts */}
        {(error || actionError) && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-3">
            <span>{actionError || error}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-red-300 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            {actionSuccess}
          </div>
        )}

        {/* Authoritative Supabase KPI Strip (Exact Database Counts, Zero Dummy Offsets) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] text-zinc-400">Total Users</div>
            <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
              {isLoading ? '—' : totalUsersCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 tabular-nums">
              {studentUsersCount} student · {adminUsersCount} admin
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] text-zinc-400">Past Q&amp;A Papers</div>
            <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
              {isLoading ? '—' : totalPastPapersCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Any subject</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] text-zinc-400">CBT Questions</div>
            <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
              {isLoading ? '—' : totalQuestionsCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">cbt_questions</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] text-zinc-400">Reading Materials</div>
            <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
              {isLoading ? '—' : totalMaterialsCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">Notes &amp; PDFs</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] text-zinc-400">Subjects</div>
            <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
              {isLoading ? '—' : totalSubjectsCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">subjects table</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] text-zinc-400">CBT Submissions</div>
            <div className="font-headline text-2xl font-bold text-white tabular-nums mt-1">
              {isLoading ? '—' : totalExamsCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 tabular-nums">
              {meanPlatformAccuracy !== null ? `Avg: ${meanPlatformAccuracy}%` : 'No exams yet'}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-[11px] text-zinc-400">Online Live</div>
            <div className="font-headline text-2xl font-bold text-emerald-400 tabular-nums mt-1">
              {snapshot.presence.length}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              {wsConnected ? 'WebSocket Live' : 'Reconnecting'}
            </div>
          </div>
        </div>

        {/* === TAB 1: CONSOLE OVERVIEW === */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Direct Upload Command Strip for Any Subject */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="font-headline text-sm font-bold text-white">
                    Academic Content Publishing (Supports Any Subject)
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Upload Past Questions &amp; Official Answers, CBT Questions (single or bulk CSV/TXT/JSON), and Reading Materials/PDFs on any secondary or UTME subject.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={openCreatePastQuestion}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm">history_edu</span>
                    <span>Upload Past Q&amp;A</span>
                  </button>
                  <button
                    onClick={openBulkCbtModal}
                    className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm text-emerald-400">quiz</span>
                    <span>Upload CBT Questions</span>
                  </button>
                  <button
                    onClick={openCreateMaterial}
                    className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm text-emerald-400">library_books</span>
                    <span>Upload Reading Material</span>
                  </button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Live Presence & Active CBT Monitor */}
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                      <h2 className="font-headline text-sm font-bold text-white">
                        Live Active Connections &amp; Examinee Telemetry
                      </h2>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Real-time WebSocket sessions currently connected to EduPulse.
                      </p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono tabular-nums">
                      {snapshot.presence.length} active
                    </span>
                  </div>

                  {snapshot.presence.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500">
                      No active WebSocket sessions connected right now.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800/70 text-xs">
                      {snapshot.presence.map((sess) => (
                        <div
                          key={sess.clientId}
                          className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span className="font-semibold text-zinc-100">{sess.userName}</span>
                              <span className="text-zinc-500">·</span>
                              <span className="text-zinc-400 capitalize">{sess.role}</span>
                            </div>
                            {sess.userEmail && (
                              <div className="text-[11px] text-zinc-500 ml-4">{sess.userEmail}</div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-zinc-300 font-medium capitalize">
                              Screen: {sess.view}
                            </div>
                            {sess.cbtProgress && (
                              <div className="text-[11px] text-emerald-400 tabular-nums">
                                CBT Q{sess.cbtProgress.currentQuestion}/{sess.cbtProgress.totalQuestions} ·{' '}
                                {sess.cbtProgress.answeredCount} answered
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent Exam Submissions from Supabase */}
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="font-headline text-sm font-bold text-white">
                      Recorded CBT Submissions (exam_results)
                    </h2>
                    <span className="text-xs text-zinc-400 tabular-nums">{totalExamsCount} total</span>
                  </div>

                  {snapshot.examResults.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500">
                      No exam submissions exist in Supabase yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                          <tr>
                            <th className="py-3 px-4 font-medium">Candidate</th>
                            <th className="py-3 px-4 font-medium text-right">Attempted</th>
                            <th className="py-3 px-4 font-medium text-right">Score</th>
                            <th className="py-3 px-4 font-medium text-right">Duration</th>
                            <th className="py-3 px-4 font-medium text-right">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/70">
                          {snapshot.examResults.slice(0, 8).map((r) => (
                            <tr key={r.id} className="hover:bg-zinc-800/40">
                              <td className="py-3 px-4">
                                <div className="font-medium text-zinc-200">{r.userName || r.userId}</div>
                                {r.userEmail && (
                                  <div className="text-[11px] text-zinc-500">{r.userEmail}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right text-zinc-300 tabular-nums">
                                {r.attemptedCount}/{r.totalQuestions}
                              </td>
                              <td className="py-3 px-4 text-right font-semibold text-emerald-400 tabular-nums">
                                {r.scorePercentage}%
                              </td>
                              <td className="py-3 px-4 text-right text-zinc-400 tabular-nums">
                                {Math.max(1, Math.round(r.timeSpentSeconds / 60))}m
                              </td>
                              <td className="py-3 px-4 text-right text-zinc-500 tabular-nums">
                                {new Date(r.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: '2-digit',
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>

              {/* Right 5 Cols: Registered Supabase Users Summary & Audit Stream */}
              <div className="lg:col-span-5 space-y-6">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-headline text-sm font-bold text-white">
                      Supabase Auth Users ({totalUsersCount})
                    </h2>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-xs text-emerald-400 hover:underline font-medium cursor-pointer"
                    >
                      Manage Users →
                    </button>
                  </div>

                  {snapshot.users.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-4 text-center">
                      0 users registered in Supabase Authentication.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {snapshot.users.slice(0, 6).map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-100 truncate">{u.name}</p>
                              <p className="text-[11px] text-zinc-400 truncate">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-zinc-300 capitalize shrink-0">
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h2 className="font-headline text-sm font-bold text-white mb-4">
                    Real-Time Audit Log (activity_logs)
                  </h2>

                  {snapshot.activityLogs.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      No administrative or user audit events logged yet.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                      {snapshot.activityLogs.slice(0, 12).map((log) => (
                        <div
                          key={log.id}
                          className="pb-3 border-b border-zinc-800/70 last:border-b-0 last:pb-0"
                        >
                          <div className="flex justify-between items-center text-[11px] text-zinc-400">
                            <span className="font-semibold text-zinc-200">{log.action}</span>
                            <span className="tabular-nums">
                              {new Date(log.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{log.details}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Actor: {log.actorName} · {log.module}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 2: PAST QUESTIONS & ANSWERS (ANY SUBJECT) === */}
        {activeTab === 'past_questions' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={pqSubjectFilter}
                  onChange={(e) => setPqSubjectFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Subjects ({totalPastPapersCount})</option>
                  {existingSubjectNames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={pqExamFilter}
                  onChange={(e) => setPqExamFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Exam Bodies</option>
                  {EXAM_BODIES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={pqSearch}
                onChange={(e) => setPqSearch(e.target.value)}
                placeholder="Search subject, exam body, year, or title..."
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-full lg:w-72"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-medium">Past Question Paper</th>
                    <th className="py-3.5 px-4 font-medium">Subject</th>
                    <th className="py-3.5 px-4 font-medium">Exam Body · Year</th>
                    <th className="py-3.5 px-4 font-medium text-right">Q&amp;A Count</th>
                    <th className="py-3.5 px-4 font-medium">Attachment</th>
                    <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredPastQuestions.map((paper) => (
                    <tr key={paper.id} className="hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-100 max-w-xs truncate">{paper.title}</div>
                        <div className="text-[11px] text-zinc-500">{paper.paperType}</div>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium whitespace-nowrap">
                        {paper.subject}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-200 whitespace-nowrap tabular-nums">
                        {paper.examBody} · {paper.examYear}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums">
                        {paper.items.length}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 max-w-[160px] truncate">
                        {paper.attachment ? paper.attachment.fileName : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {onPreviewPastQuestion && (
                          <button
                            onClick={() => onPreviewPastQuestion(paper)}
                            className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-emerald-400 mr-1.5 cursor-pointer"
                          >
                            View Q&amp;A
                          </button>
                        )}
                        <button
                          onClick={() => openEditPastQuestion(paper)}
                          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 mr-1.5 cursor-pointer"
                        >
                          Edit
                        </button>
                        {confirmDeleteId === paper.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={async () => {
                                try {
                                  await deletePastQuestion(paper.id, currentUser.name);
                                  setConfirmDeleteId(null);
                                  notifySuccess('Deleted Past Question paper from Supabase.');
                                } catch (err: any) {
                                  setActionError(err?.message || 'Delete failed.');
                                }
                              }}
                              className="px-2.5 py-1 bg-red-500 text-zinc-950 font-semibold rounded cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(paper.id)}
                            className="px-2.5 py-1 bg-zinc-950 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/30 rounded text-red-400 cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredPastQuestions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        {totalPastPapersCount === 0 ? (
                          <div className="space-y-3">
                            <p>
                              0 Past Questions &amp; Answers uploaded yet. Upload WAEC, JAMB, NECO, or school past questions on any subject.
                            </p>
                            <button
                              onClick={openCreatePastQuestion}
                              className="px-4 py-2 bg-emerald-500 text-zinc-950 font-semibold rounded-lg text-xs cursor-pointer"
                            >
                              Upload First Past Questions &amp; Answers
                            </button>
                          </div>
                        ) : (
                          'No Past Questions match the selected filter.'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-between items-center text-xs text-zinc-400 tabular-nums">
              <span>
                Showing {filteredPastQuestions.length} of {totalPastPapersCount} Past Question paper(s)
              </span>
              <span>Synced live with Supabase</span>
            </div>
          </div>
        )}

        {/* === TAB 3: CBT QUESTION BANK (ANY SUBJECT, SINGLE + BULK) === */}
        {activeTab === 'questions' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={questionSubjectFilter}
                  onChange={(e) => setQuestionSubjectFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Subjects ({totalQuestionsCount})</option>
                  {existingSubjectNames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search question stem, subject, or topic..."
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-medium w-16">ID</th>
                    <th className="py-3.5 px-4 font-medium">Question Stem</th>
                    <th className="py-3.5 px-4 font-medium">Subject · Topic</th>
                    <th className="py-3.5 px-4 font-medium">Answer Key</th>
                    <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4 font-mono text-zinc-400 tabular-nums">#{q.id}</td>
                      <td className="py-3.5 px-4 text-zinc-100 max-w-md">
                        <div className="line-clamp-2">{q.text}</div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 whitespace-nowrap">
                        <span className="text-emerald-400 font-medium">{q.subject}</span> · {q.topic}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 max-w-[200px] truncate">
                        {String.fromCharCode(65 + q.correctOptionIndex)}:{' '}
                        {q.options[q.correctOptionIndex]}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 mr-1.5 cursor-pointer"
                        >
                          Edit
                        </button>
                        {confirmDeleteId === `q-${q.id}` ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={async () => {
                                try {
                                  await deleteQuestion(q.id, currentUser.name);
                                  setConfirmDeleteId(null);
                                  notifySuccess(`Deleted Question #${q.id} from Supabase.`);
                                } catch (err: any) {
                                  setActionError(err?.message || 'Delete failed.');
                                }
                              }}
                              className="px-2.5 py-1 bg-red-500 text-zinc-950 font-semibold rounded cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(`q-${q.id}`)}
                            className="px-2.5 py-1 bg-zinc-950 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/30 rounded text-red-400 cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredQuestions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500">
                        {totalQuestionsCount === 0
                          ? '0 CBT questions in Supabase. Click "Add CBT Question" or "Bulk Upload CBT" above to publish live questions on any subject.'
                          : 'No CBT questions match the current filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-between items-center text-xs text-zinc-400 tabular-nums">
              <span>
                Showing {filteredQuestions.length} of {totalQuestionsCount} questions
              </span>
              <span>Synced with public.cbt_questions</span>
            </div>
          </div>
        )}

        {/* === TAB 4: READING MATERIALS (ANY SUBJECT + FILE ATTACHMENTS) === */}
        {activeTab === 'content' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={materialSubjectFilter}
                  onChange={(e) => setMaterialSubjectFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Subjects ({totalMaterialsCount})</option>
                  {existingSubjectNames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Search title, subject, or level..."
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-medium">Title</th>
                    <th className="py-3.5 px-4 font-medium">Subject · Level</th>
                    <th className="py-3.5 px-4 font-medium text-right">Sections</th>
                    <th className="py-3.5 px-4 font-medium">Attached File</th>
                    <th className="py-3.5 px-4 font-medium text-right">Date Added</th>
                    <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-100 max-w-xs truncate">{mat.title}</div>
                        <div className="text-[11px] text-zinc-500 max-w-xs truncate">{mat.summary}</div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 whitespace-nowrap">
                        <span className="text-emerald-400 font-medium">{mat.subject}</span> · {mat.level}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums">
                        {mat.content?.length || 1}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 max-w-[160px] truncate">
                        {mat.attachment ? mat.attachment.fileName : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-400 tabular-nums whitespace-nowrap">
                        {mat.dateAdded}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {onPreviewMaterial && (
                          <button
                            onClick={() => onPreviewMaterial(mat)}
                            className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-emerald-400 mr-1.5 cursor-pointer"
                          >
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() => openEditMaterial(mat)}
                          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 mr-1.5 cursor-pointer"
                        >
                          Edit
                        </button>
                        {confirmDeleteId === mat.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={async () => {
                                try {
                                  await deleteMaterial(mat.id, currentUser.name);
                                  setConfirmDeleteId(null);
                                  notifySuccess('Deleted reading material from Supabase.');
                                } catch (err: any) {
                                  setActionError(err?.message || 'Delete failed.');
                                }
                              }}
                              className="px-2.5 py-1 bg-red-500 text-zinc-950 font-semibold rounded cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(mat.id)}
                            className="px-2.5 py-1 bg-zinc-950 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/30 rounded text-red-400 cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        {totalMaterialsCount === 0
                          ? '0 reading materials in Supabase. Click "Upload Reading Material" above to publish notes or PDF handouts on any subject.'
                          : 'No reading materials match your search.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-between items-center text-xs text-zinc-400 tabular-nums">
              <span>
                Showing {filteredMaterials.length} of {totalMaterialsCount} reading material(s)
              </span>
              <span>Synced with public.study_materials</span>
            </div>
          </div>
        )}

        {/* === TAB 5: CURRICULUM SUBJECTS === */}
        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {snapshot.subjects.map((sub) => {
              const linkedQ = snapshot.questions.filter(
                (q) => q.subject.toLowerCase() === sub.name.toLowerCase()
              ).length;
              const linkedM = snapshot.materials.filter(
                (m) => m.subject.toLowerCase() === sub.name.toLowerCase()
              ).length;
              const linkedPQ = snapshot.pastQuestions.filter(
                (pq) => pq.subject.toLowerCase() === sub.name.toLowerCase()
              ).length;

              return (
                <div
                  key={sub.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">{sub.iconName}</span>
                        </div>
                        <div>
                          <h3 className="font-headline text-base font-bold text-white">{sub.name}</h3>
                          <p className="text-xs text-zinc-400">{sub.tag}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          onClick={() => openSubjectModal(sub)}
                          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 cursor-pointer"
                        >
                          Edit
                        </button>
                        {confirmDeleteId === `sub-${sub.id}` ? (
                          <button
                            onClick={async () => {
                              await deleteSubject(sub.id, currentUser.name);
                              setConfirmDeleteId(null);
                              notifySuccess(`Removed subject ${sub.name}.`);
                            }}
                            className="px-2.5 py-1 bg-red-500 text-zinc-950 font-semibold rounded cursor-pointer"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(`sub-${sub.id}`)}
                            className="px-2.5 py-1 bg-zinc-950 hover:bg-red-500/15 border border-zinc-800 text-red-400 rounded cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">{sub.description}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex flex-wrap justify-between gap-2 text-xs text-zinc-400 tabular-nums">
                    <span>{linkedM} reading note(s)</span>
                    <span>{linkedPQ} past paper(s)</span>
                    <span>{linkedQ} CBT question(s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* === TAB 6: SUPABASE USERS MANAGEMENT === */}
        {activeTab === 'users' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'student', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg font-medium capitalize cursor-pointer ${
                      userRoleFilter === r
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {r === 'all'
                      ? `All (${totalUsersCount})`
                      : r === 'student'
                        ? `Students (${studentUsersCount})`
                        : `Admins (${adminUsersCount})`}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-medium">User (Supabase Auth)</th>
                    <th className="py-3.5 px-4 font-medium">Role &amp; Track</th>
                    <th className="py-3.5 px-4 font-medium">Status</th>
                    <th className="py-3.5 px-4 font-medium text-right">CBT Attempts</th>
                    <th className="py-3.5 px-4 font-medium text-right">Created</th>
                    <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-zinc-100">{u.name}</div>
                            <div className="text-[11px] text-zinc-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300">
                        <span className="capitalize font-medium text-zinc-200">{u.role}</span>
                        <span className="text-zinc-500"> · {u.studentClass || '—'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-medium">
                          {u.emailVerified ? '● Verified' : '○ Unverified'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums">
                        {u.examAttemptsCount}
                        {u.averageScore !== null ? ` (${u.averageScore}%)` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-400 tabular-nums">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditUserModal(u)}
                          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 mr-1.5 cursor-pointer"
                        >
                          Edit
                        </button>
                        {u.id !== currentUser.id &&
                          (confirmDeleteId === u.id ? (
                            <span className="inline-flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  try {
                                    await adminDeleteUser(u.id, currentUser.name);
                                    setConfirmDeleteId(null);
                                    notifySuccess(`Deleted ${u.email} from Supabase Auth.`);
                                  } catch (err: any) {
                                    setActionError(err?.message || 'Delete failed.');
                                  }
                                }}
                                className="px-2.5 py-1 bg-red-500 text-zinc-950 font-semibold rounded cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(u.id)}
                              className="px-2.5 py-1 bg-zinc-950 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/30 rounded text-red-400 cursor-pointer"
                            >
                              Remove
                            </button>
                          ))}
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-500">
                        No Supabase Auth users match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-between items-center text-xs text-zinc-400 tabular-nums">
              <span>
                Showing {filteredUsers.length} of {totalUsersCount} exact Supabase Auth user(s)
              </span>
              <span>Source: supabase.auth.admin.listUsers()</span>
            </div>
          </div>
        )}

        {/* === TAB 7: DATABASE AUDIT & STATUS === */}
        {activeTab === 'settings' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-headline text-base font-bold text-white">
                  Live Supabase Schema &amp; Row Count Verification
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Direct server-side verification against Supabase Auth, PostgreSQL tables, and Storage. Zero mock or fallback datasets are loaded.
                </p>
              </div>
              <span className="text-xs text-zinc-400 tabular-nums">
                Last Synced:{' '}
                {snapshot.syncedAt ? new Date(snapshot.syncedAt).toLocaleTimeString() : 'Pending'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5 font-medium">Supabase Source</th>
                    <th className="py-3.5 px-5 font-medium">Purpose</th>
                    <th className="py-3.5 px-5 font-medium text-right">Exact Live Count</th>
                    <th className="py-3.5 px-5 font-medium text-right">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  <tr>
                    <td className="py-3.5 px-5 font-mono text-zinc-200">auth.users</td>
                    <td className="py-3.5 px-5 text-zinc-400">
                      Authenticated accounts (matches Supabase Dashboard → Authentication → Users)
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white tabular-nums">
                      {totalUsersCount}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400">● Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-mono text-zinc-200">
                      public.study_materials (Reading)
                    </td>
                    <td className="py-3.5 px-5 text-zinc-400">
                      Published reading materials &amp; attached study documents across any subject
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white tabular-nums">
                      {totalMaterialsCount}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400">● Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-mono text-zinc-200">
                      public.study_materials (Past Q&amp;A)
                    </td>
                    <td className="py-3.5 px-5 text-zinc-400">
                      Uploaded Past Questions &amp; Official Answers archives across any subject
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white tabular-nums">
                      {totalPastPapersCount}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400">● Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-mono text-zinc-200">public.cbt_questions</td>
                    <td className="py-3.5 px-5 text-zinc-400">
                      Computer-Based Testing item bank across all subjects
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white tabular-nums">
                      {totalQuestionsCount}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400">● Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-mono text-zinc-200">public.subjects</td>
                    <td className="py-3.5 px-5 text-zinc-400">
                      Enrolled &amp; auto-registered curriculum tracks
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white tabular-nums">
                      {totalSubjectsCount}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400">● Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-mono text-zinc-200">public.exam_results</td>
                    <td className="py-3.5 px-5 text-zinc-400">Submitted student CBT score reports</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white tabular-nums">
                      {totalExamsCount}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400">● Verified</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-mono text-zinc-200">storage.buckets</td>
                    <td className="py-3.5 px-5 text-zinc-400">
                      Private Supabase Storage for PDFs, scanned papers, and profile avatars
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white tabular-nums">
                      Active
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400">● Signed URLs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* === MODAL 1: UPLOAD / EDIT PAST QUESTIONS & ANSWERS (ON ANY SUBJECT) === */}
      {pqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl max-w-3xl w-full p-6 border border-zinc-800 text-zinc-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">
                  {editingPq ? 'Edit Past Questions & Answers' : 'Upload Past Questions & Answers'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Publish past exam questions, official answers/marking schemes, or PDF papers on any subject.
                </p>
              </div>
              <button
                onClick={() => setPqModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePastQuestion} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SubjectPickerField
                  label="Subject (Pick from list or type ANY custom subject)"
                  value={pqSubject}
                  onChange={setPqSubject}
                  existingSubjects={existingSubjectNames}
                />

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Paper Title</label>
                  <input
                    type="text"
                    value={pqTitle}
                    onChange={(e) => setPqTitle(e.target.value)}
                    placeholder="e.g. WAEC 2024 Economics Paper 1 & 2 Solutions"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Exam Body</label>
                  <input
                    type="text"
                    list="exam-bodies-list"
                    required
                    value={pqExamBody}
                    onChange={(e) => setPqExamBody(e.target.value)}
                    placeholder="e.g. WAEC WASSCE, JAMB UTME"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                  <datalist id="exam-bodies-list">
                    {EXAM_BODIES.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Exam Year / Session</label>
                  <input
                    type="text"
                    required
                    value={pqExamYear}
                    onChange={(e) => setPqExamYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Paper Format</label>
                  <select
                    value={pqPaperType}
                    onChange={(e) => setPqPaperType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Objective & Theory">Objective &amp; Theory</option>
                    <option value="Objective (Paper 1)">Objective (Paper 1)</option>
                    <option value="Theory / Essay (Paper 2)">Theory / Essay (Paper 2)</option>
                    <option value="Practical (Paper 3)">Practical (Paper 3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Instructions / Paper Summary
                </label>
                <input
                  type="text"
                  value={pqSummary}
                  onChange={(e) => setPqSummary(e.target.value)}
                  placeholder="Optional overview or grading instructions for candidates"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* File Upload Zone for Official PDF / Image / Doc Past Paper */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-zinc-200">
                    Attach Official Past Question Paper / Marking Scheme File (Optional)
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Upload PDF, scanned image (PNG/JPG), or Word/Text document directly to Supabase Storage.
                  </div>
                  {pqAttachment && (
                    <div className="mt-2 inline-flex items-center gap-2 text-emerald-400 font-medium">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>{pqAttachment.fileName}</span>
                      <button
                        type="button"
                        onClick={() => setPqAttachment(null)}
                        className="text-red-400 hover:underline ml-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <label className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 font-medium cursor-pointer whitespace-nowrap shrink-0 text-center">
                  {isUploadingPqFile ? 'Uploading to Supabase...' : 'Upload PDF / Image / Doc'}
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx,.txt"
                    disabled={isUploadingPqFile}
                    onChange={handleUploadPqAttachment}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Structured Questions & Answers Section */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-zinc-200">
                    Questions &amp; Official Answers ({pqItems.length})
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-emerald-400 font-medium cursor-pointer">
                      Import .TXT / .CSV / .JSON Q&amp;A File
                      <input
                        type="file"
                        accept=".txt,.csv,.json,.md"
                        onChange={handleImportPqTextFile}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setPqShowBulkImporter((prev) => !prev)}
                      className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 font-medium cursor-pointer"
                    >
                      {pqShowBulkImporter ? 'Close Bulk Paste' : 'Bulk Paste Q&A Text'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPqItems((prev) => [...prev, createBlankPqItem(prev.length + 1)])
                      }
                      className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg text-emerald-300 font-semibold cursor-pointer"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>

                {pqShowBulkImporter && (
                  <div className="p-4 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="text-[11px] text-zinc-400 leading-relaxed">
                      Paste multiple Objective or Theory Past Questions &amp; Answers separated by blank lines. Example:{' '}
                      <code className="text-zinc-300">
                        1. Define Opportunity Cost. Answer: The next best alternative foregone...
                      </code>{' '}
                      or include <code className="text-zinc-300">A) ... B) ... C) ... D) ... Answer: B</code>.
                    </div>
                    <textarea
                      rows={5}
                      value={pqBulkRaw}
                      onChange={(e) => setPqBulkRaw(e.target.value)}
                      placeholder={'1. State Ohm\'s Law.\nAnswer: Current through a metallic conductor is directly proportional to potential difference provided temperature remains constant.\n\n2. Which unit measures electric charge?\nA) Volt\nB) Ampere\nC) Coulomb\nD) Watt\nAnswer: C\nExplanation: Q = It, measured in Coulombs.'}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleApplyPqBulkParse}
                        className="px-4 py-1.5 bg-emerald-500 text-zinc-950 font-semibold rounded-lg cursor-pointer"
                      >
                        Parse &amp; Append to Q&amp;A List
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                  {pqItems.map((item, idx) => {
                    const hasObjOptions = Array.isArray(item.options);
                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-emerald-400">
                            Question #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPqItems((prev) =>
                                  prev.map((p, i) =>
                                    i === idx
                                      ? {
                                          ...p,
                                          options: hasObjOptions ? undefined : ['', '', '', ''],
                                          correctOptionIndex: hasObjOptions ? undefined : 0,
                                        }
                                      : p
                                  )
                                );
                              }}
                              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                            >
                              {hasObjOptions ? 'Switch to Theory Q&A' : 'Add Options A–D'}
                            </button>
                            {pqItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPqItems((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-red-400 hover:text-red-300 px-1.5 cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={item.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPqItems((prev) =>
                              prev.map((p, i) => (i === idx ? { ...p, question: val } : p))
                            );
                          }}
                          placeholder="Enter past question prompt..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                        />

                        {hasObjOptions && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(item.options || ['', '', '', '']).map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`pq-correct-${item.id}`}
                                  checked={(item.correctOptionIndex ?? 0) === oIdx}
                                  onChange={() => {
                                    setPqItems((prev) =>
                                      prev.map((p, i) =>
                                        i === idx
                                          ? {
                                              ...p,
                                              correctOptionIndex: oIdx,
                                              answer: `${String.fromCharCode(65 + oIdx)}. ${
                                                (p.options || [])[oIdx] || ''
                                              }`,
                                            }
                                          : p
                                      )
                                    );
                                  }}
                                  className="accent-emerald-500"
                                />
                                <span className="font-mono text-zinc-400">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPqItems((prev) =>
                                      prev.map((p, i) => {
                                        if (i !== idx) return p;
                                        const nextOpts = [...(p.options || ['', '', '', ''])];
                                        nextOpts[oIdx] = val;
                                        const cIdx = p.correctOptionIndex ?? 0;
                                        return {
                                          ...p,
                                          options: nextOpts,
                                          answer:
                                            cIdx === oIdx
                                              ? `${String.fromCharCode(65 + cIdx)}. ${val}`
                                              : p.answer,
                                        };
                                      })
                                    );
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                  className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] text-emerald-400 font-medium mb-1">
                              Official Answer / Marking Scheme
                            </label>
                            <textarea
                              rows={2}
                              value={item.answer}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPqItems((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, answer: val } : p))
                                );
                              }}
                              placeholder="Enter official answer or full theory marking scheme..."
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-zinc-400 font-medium mb-1">
                              Step-by-Step Explanation (Optional)
                            </label>
                            <textarea
                              rows={2}
                              value={item.explanation || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPqItems((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, explanation: val } : p))
                                );
                              }}
                              placeholder="Worked derivation or examiner notes..."
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={pqPushToCbt}
                  onChange={(e) => setPqPushToCbt(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="text-zinc-300">
                  Also publish any objective multiple-choice questions in this paper to the live{' '}
                  <strong className="text-white">CBT Question Bank</strong> for timed practice
                </span>
              </label>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPqModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating || isUploadingPqFile}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isMutating
                    ? 'Uploading to Supabase...'
                    : editingPq
                      ? 'Save Past Questions Changes'
                      : 'Publish Past Questions & Answers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL 2: UPLOAD / EDIT READING MATERIAL (ON ANY SUBJECT) === */}
      {materialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl max-w-xl w-full p-6 border border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">
                  {editingMaterial ? 'Edit Reading Material' : 'Upload Reading Material'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Publish study notes, textbooks, or PDF handouts on any subject.
                </p>
              </div>
              <button
                onClick={() => setMaterialModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Material Title</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. Macroeconomic Fiscal Policy & National Income"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SubjectPickerField
                  label="Subject (Any Subject)"
                  value={matSubject}
                  onChange={setMatSubject}
                  existingSubjects={existingSubjectNames}
                />

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Target Class / Level</label>
                  <input
                    type="text"
                    list="material-levels-list"
                    required
                    value={matLevel}
                    onChange={(e) => setMatLevel(e.target.value)}
                    placeholder="e.g. SS 3, JAMB Prep, JSS 3"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                  <datalist id="material-levels-list">
                    <option value="JSS 1" />
                    <option value="JSS 2" />
                    <option value="JSS 3" />
                    <option value="SS 1" />
                    <option value="SS 2" />
                    <option value="SS 3" />
                    <option value="JAMB Prep" />
                    <option value="WAEC & NECO Prep" />
                    <option value="Post-UTME" />
                    <option value="Undergraduate / 100L" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Syllabus Summary</label>
                <input
                  type="text"
                  required
                  value={matSummary}
                  onChange={(e) => setMatSummary(e.target.value)}
                  placeholder="Concise overview of topics covered in this reading material"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Attach PDF / Document / Image */}
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-zinc-200">
                    Attach PDF / Textbook Handout / Diagram (Optional)
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Students can read or download the attached document inside the Study Library.
                  </div>
                  {matAttachment && (
                    <div className="mt-1.5 inline-flex items-center gap-2 text-emerald-400 font-medium">
                      <span className="material-symbols-outlined text-sm">attach_file</span>
                      <span>{matAttachment.fileName}</span>
                      <button
                        type="button"
                        onClick={() => setMatAttachment(null)}
                        className="text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <label className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 font-medium cursor-pointer whitespace-nowrap shrink-0 text-center">
                  {isUploadingMatFile ? 'Uploading...' : 'Attach PDF / File'}
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx,.txt,.md"
                    disabled={isUploadingMatFile}
                    onChange={handleUploadMaterialAttachment}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-zinc-300 font-medium">
                    Reading Notes (Separate chapters/pages with <code className="text-emerald-400">---</code>)
                  </label>
                  <label className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer">
                    Import from .txt / .md
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleImportMaterialTextFile}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={6}
                  required={!matAttachment}
                  value={matContentRaw}
                  onChange={(e) => setMatContentRaw(e.target.value)}
                  placeholder="Write detailed lecture notes, worked examples, and key formulas..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMaterialModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating || isUploadingMatFile}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isMutating ? 'Saving...' : editingMaterial ? 'Update in Supabase' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL 3: ADD / EDIT SINGLE CBT QUESTION (ON ANY SUBJECT) === */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl max-w-lg w-full p-6 border border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-lg font-bold text-white">
                {editingQuestion ? `Edit Question #${editingQuestion.id}` : 'Add CBT Question (Any Subject)'}
              </h3>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SubjectPickerField
                  label="Subject (Any Subject)"
                  value={qSubject}
                  onChange={setQSubject}
                  existingSubjects={existingSubjectNames}
                />

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Topic</label>
                  <input
                    type="text"
                    required
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    placeholder="e.g. Organic Chemistry / Lexis"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Question Stem</label>
                <textarea
                  rows={3}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the complete examination question..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-300 font-medium">
                  Options (Select radio button next to the correct answer)
                </label>
                {qOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={qCorrectIndex === idx}
                      onChange={() => setQCorrectIndex(idx)}
                      className="accent-emerald-500"
                    />
                    <span className="font-mono text-zinc-400 w-4">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      required={idx < 2}
                      value={opt}
                      onChange={(e) => {
                        const next = [...qOptions];
                        next[idx] = e.target.value;
                        setQOptions(next);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Solution Explanation</label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Step-by-step derivation shown after submission..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isMutating ? 'Saving...' : 'Save CBT Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL 4: BULK UPLOAD CBT QUESTIONS (ANY SUBJECT) === */}
      {bulkCbtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl max-w-2xl w-full p-6 border border-zinc-800 text-zinc-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">
                  Bulk Upload CBT Questions (Any Subject)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Import multiple CBT questions at once via .TXT, .CSV, or .JSON file or paste directly below.
                </p>
              </div>
              <button
                onClick={() => setBulkCbtModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBulkCbt} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SubjectPickerField
                  label="Default Subject (Any Subject)"
                  value={bulkCbtSubject}
                  onChange={setBulkCbtSubject}
                  existingSubjects={existingSubjectNames}
                />

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Default Topic</label>
                  <input
                    type="text"
                    value={bulkCbtTopic}
                    onChange={(e) => setBulkCbtTopic(e.target.value)}
                    placeholder="e.g. UTME 2024 Drill"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-zinc-400">
                  Supported formats: <strong className="text-zinc-200">Plain Text</strong> (numbered questions with A–D &amp; Answer:),{' '}
                  <strong className="text-zinc-200">CSV</strong> (<code className="text-zinc-300">question,optionA,optionB,optionC,optionD,answer,explanation</code>), or{' '}
                  <strong className="text-zinc-200">JSON</strong>.
                </div>

                <label className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-emerald-400 font-semibold cursor-pointer whitespace-nowrap shrink-0 text-center">
                  Choose .TXT / .CSV / .JSON File
                  <input
                    type="file"
                    accept=".txt,.csv,.json,.md"
                    onChange={handleBulkCbtFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Paste Questions &amp; Answer Keys
                </label>
                <textarea
                  rows={7}
                  required
                  value={bulkCbtRaw}
                  onChange={(e) => setBulkCbtRaw(e.target.value)}
                  placeholder={'1. Who authored "Things Fall Apart"?\nA) Wole Soyinka\nB) Chinua Achebe\nC) Chimamanda Adichie\nD) Cyprian Ekwensi\nAnswer: B\nExplanation: Published in 1958 by Chinua Achebe.\n\n2. Solve 2x + 6 = 14\nA) 2\nB) 4\nC) 6\nD) 8\nAnswer: B'}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Live Detection Preview */}
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">Live Parser Preview</span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {parsedBulkCbtPreview.length} valid question(s) detected
                  </span>
                </div>

                {parsedBulkCbtPreview.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1 border-t border-zinc-800/80 custom-scrollbar">
                    {parsedBulkCbtPreview.slice(0, 8).map((item, i) => (
                      <div key={i} className="text-[11px] text-zinc-300 flex justify-between gap-3">
                        <span className="truncate">
                          <strong className="text-zinc-400">#{i + 1}</strong> [{item.subject}] {item.text}
                        </span>
                        <span className="text-emerald-400 font-mono shrink-0">
                          Ans: {String.fromCharCode(65 + item.correctOptionIndex)}
                        </span>
                      </div>
                    ))}
                    {parsedBulkCbtPreview.length > 8 && (
                      <div className="text-[11px] text-zinc-500">
                        + {parsedBulkCbtPreview.length - 8} more question(s) ready to import...
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setBulkCbtModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating || parsedBulkCbtPreview.length === 0}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isMutating
                    ? 'Uploading to Supabase...'
                    : `Publish ${parsedBulkCbtPreview.length} Question(s) to CBT Bank`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL 5: CREATE / EDIT SUPABASE USER === */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl max-w-md w-full p-6 border border-zinc-800 text-zinc-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-lg font-bold text-white">
                {editingUser ? 'Edit Supabase User' : 'Create Supabase Auth User'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingUser)}
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white disabled:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    Initial Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Role</label>
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as 'student' | 'admin')}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Academic Track</label>
                  <input
                    type="text"
                    value={uClass}
                    onChange={(e) => setUClass(e.target.value)}
                    placeholder="SS 3 Science"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={uPhone}
                  onChange={(e) => setUPhone(e.target.value)}
                  placeholder="0803 000 0000"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isMutating ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL 6: ADD / EDIT CURRICULUM SUBJECT === */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-xl max-w-md w-full p-6 border border-zinc-800 text-zinc-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-lg font-bold text-white">Configure Curriculum Subject</h3>
              <button
                onClick={() => setSubjectModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <SubjectPickerField
                label="Subject Name (Any Subject)"
                value={subjName}
                onChange={setSubjName}
                existingSubjects={existingSubjectNames}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Exam Tag</label>
                  <input
                    type="text"
                    required
                    value={subjTag}
                    onChange={(e) => setSubjTag(e.target.value)}
                    placeholder="WAEC, NECO & JAMB"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">Icon</label>
                  <select
                    value={subjIcon}
                    onChange={(e) => setSubjIcon(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="functions">Mathematics / Acct (functions)</option>
                    <option value="science">Physics / Chem (science)</option>
                    <option value="biotech">Biology / Agric (biotech)</option>
                    <option value="menu_book">Humanities / Languages (menu_book)</option>
                    <option value="account_balance">Gov / Econ / Commerce (account_balance)</option>
                    <option value="computer">Computer / Data (computer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Syllabus Description</label>
                <textarea
                  rows={3}
                  required
                  value={subjDesc}
                  onChange={(e) => setSubjDesc(e.target.value)}
                  placeholder="Describe core topics and syllabus focus..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isMutating ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
