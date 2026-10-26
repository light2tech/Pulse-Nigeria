import { SupabaseClient } from '@supabase/supabase-js';
import { SubjectPack } from './jambPacks/types';
import { CHEMISTRY_PACK } from './jambPacks/chemistryPack';
import { PHYSICS_PACK } from './jambPacks/physicsPack';
import { GEOGRAPHY_PACK } from './jambPacks/geographyPack';
import { MATHEMATICS_PACK } from './jambPacks/mathematicsPack';
import { BIOLOGY_PACK } from './jambPacks/biologyPack';
import { ENGLISH_PACK } from './jambPacks/englishPack';
import { ECONOMICS_PACK } from './jambPacks/economicsPack';

export const JAMB_SYLLABUS_PACKS: SubjectPack[] = [
  ENGLISH_PACK, // 50 questions
  MATHEMATICS_PACK, // 40 questions
  CHEMISTRY_PACK, // 40 questions
  PHYSICS_PACK, // 40 questions
  BIOLOGY_PACK, // 40 questions
  ECONOMICS_PACK, // 40 questions
  GEOGRAPHY_PACK, // 40 questions
];

export async function seedJambSyllabusAndPastQuestions(supabaseAdmin: SupabaseClient) {
  const dateAdded = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const [{ data: existingSubjects }, { data: existingMaterials }, { data: existingQuestions }] =
    await Promise.all([
      supabaseAdmin.from('subjects').select('id, name'),
      supabaseAdmin.from('study_materials').select('id, content'),
      supabaseAdmin.from('cbt_questions').select('id, subject, text'),
    ]);

  const subjectIdByName = new Map<string, string>();
  for (const s of existingSubjects || []) {
    if (s.name && s.id) {
      subjectIdByName.set(String(s.name).trim().toLowerCase(), String(s.id));
    }
  }

  const existingMatById = new Map<string, any>();
  for (const m of existingMaterials || []) {
    if (m.id) {
      existingMatById.set(String(m.id), m);
    }
  }

  const existingQuestionTexts = new Set(
    (existingQuestions || []).map((q: any) => String(q.text || '').trim().toLowerCase())
  );

  // Also replace any earlier HTML-tagged Oral English questions if present so English stays strictly at 50
  const staleHtmlQuestionIds = (existingQuestions || [])
    .filter((q: any) => String(q.text || '').includes('<u>'))
    .map((q: any) => Number(q.id));
  if (staleHtmlQuestionIds.length > 0) {
    await supabaseAdmin.from('cbt_questions').delete().in('id', staleHtmlQuestionIds);
  }

  let nextQuestionId =
    (existingQuestions || []).reduce((max: number, q: any) => Math.max(max, Number(q.id) || 0), 0) + 1;

  const cbtRowsToInsert: any[] = [];

  for (const pack of JAMB_SYLLABUS_PACKS) {
    const resolvedSubjectId = subjectIdByName.get(pack.subjectName.toLowerCase()) || pack.subjectId;

    // 1. Upsert Subject metadata with accurate question count (50 for English, 40 for others)
    await supabaseAdmin.from('subjects').upsert({
      id: resolvedSubjectId,
      name: pack.subjectName,
      description: pack.description,
      tag: 'JAMB UTME Syllabus',
      progress: 0,
      lessons_count: 1,
      questions_count: pack.questions.length,
      icon_name: pack.iconName,
      color_theme: 'bg-emerald-500/10 text-emerald-400',
    });

    // 2. Upsert JAMB Syllabus Reading Material if not yet present
    if (!existingMatById.has(pack.materialId)) {
      await supabaseAdmin.from('study_materials').upsert({
        id: pack.materialId,
        title: pack.materialTitle,
        subject: pack.subjectName,
        level: 'JAMB UTME Syllabus',
        date_added: dateAdded,
        summary: pack.materialSummary,
        image_url: null,
        content: pack.materialSections,
      });
    }

    // 3. Upsert JAMB Past Questions & Official Answers Paper (upgrade if item count changed, e.g., 6 → 40/50)
    const existingPaper = existingMatById.get(pack.pastPaperId);
    let existingItemsCount = 0;
    if (existingPaper?.content) {
      const parsed =
        typeof existingPaper.content === 'string'
          ? (() => {
              try {
                return JSON.parse(existingPaper.content);
              } catch {
                return null;
              }
            })()
          : existingPaper.content;
      existingItemsCount = Array.isArray(parsed?.items) ? parsed.items.length : 0;
    }

    if (!existingPaper || existingItemsCount !== pack.questions.length) {
      const qaItems = pack.questions.map((q, idx) => ({
        id: `${pack.pastPaperId}-q${idx + 1}`,
        questionNumber: idx + 1,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        answer: `${String.fromCharCode(65 + q.correctOptionIndex)}. ${q.options[q.correctOptionIndex]}`,
        explanation: q.explanation,
      }));

      await supabaseAdmin.from('study_materials').upsert({
        id: pack.pastPaperId,
        title: pack.pastPaperTitle,
        subject: pack.subjectName,
        level: `JAMB UTME ${pack.pastPaperYear}`,
        date_added: dateAdded,
        summary: pack.pastPaperSummary,
        image_url: null,
        content: {
          kind: 'past_question',
          examBody: 'JAMB UTME',
          examYear: pack.pastPaperYear,
          paperType: `Objective (${pack.questions.length} Questions · 40 Mins)`,
          items: qaItems,
          attachment: null,
        },
      });
    }

    // 4. Queue missing CBT quiz questions so each subject has 40 (and English Language has 50)
    for (const q of pack.questions) {
      const normalized = q.question.trim().toLowerCase();
      if (!existingQuestionTexts.has(normalized)) {
        existingQuestionTexts.add(normalized);
        cbtRowsToInsert.push({
          id: nextQuestionId++,
          subject: pack.subjectName,
          topic: q.topic,
          text: q.question,
          options: q.options,
          correct_option_index: q.correctOptionIndex,
          explanation: q.explanation,
        });
      }
    }
  }

  // Insert in safe batches of 100
  for (let i = 0; i < cbtRowsToInsert.length; i += 100) {
    const batch = cbtRowsToInsert.slice(i, i + 100);
    const { error } = await supabaseAdmin.from('cbt_questions').insert(batch);
    if (error) {
      console.error('Error seeding JAMB CBT questions batch:', error.message);
    }
  }

  return {
    subjectsSeeded: JAMB_SYLLABUS_PACKS.length,
    cbtQuestionsInserted: cbtRowsToInsert.length,
  };
}
