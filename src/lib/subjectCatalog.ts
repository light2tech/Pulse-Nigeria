import { PastQuestionItem } from '../types';

export const STANDARD_CURRICULUM_SUBJECTS: string[] = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Economics',
  'Government',
  'Literature-in-English',
  'Civic Education',
  'Christian Religious Studies (CRS)',
  'Islamic Religious Studies (IRS)',
  'Commerce',
  'Financial Accounting',
  'Agricultural Science',
  'Geography',
  'Computer Studies',
  'Data Processing',
  'Technical Drawing',
  'History',
  'Fine Arts',
  'French',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Home Economics',
  'Food & Nutrition',
  'Physical & Health Education',
  'Animal Husbandry',
  'Marketing',
  'Bookkeeping',
  'Office Practice',
  'Insurance',
];

export const EXAM_BODIES: string[] = [
  'JAMB UTME',
  'WAEC WASSCE',
  'NECO SSCE',
  'NABTEB',
  'POST-UTME',
  'WAEC GCE',
  'JUPEB / IJMB',
  'BECE / JSCE',
];

export interface ParsedBulkCbtItem {
  subject: string;
  topic: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function resolveOptionIndex(rawAnswer: string, options: string[]): number {
  const clean = rawAnswer.trim();
  if (!clean) return 0;
  const letterMatch = clean.match(/^(?:option\s*)?([A-Ea-e])(?:\b|[).:])/i);
  if (letterMatch) {
    const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
    if (idx >= 0 && idx < options.length) return idx;
  }
  if (/^[0-4]$/.test(clean)) {
    const num = Number(clean);
    if (num >= 0 && num < options.length) return num;
  }
  const exactIdx = options.findIndex((o) => o.toLowerCase() === clean.toLowerCase());
  if (exactIdx >= 0) return exactIdx;
  return 0;
}

export function parseBulkCbtQuestions(
  rawInput: string,
  defaultSubject: string,
  defaultTopic: string
): ParsedBulkCbtItem[] {
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // 1. JSON Array Support
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed.questions) ? parsed.questions : [parsed];
      return arr
        .map((item: any) => {
          const opts: string[] = Array.isArray(item.options)
            ? item.options.map(String).filter(Boolean)
            : [item.optionA, item.optionB, item.optionC, item.optionD].filter(Boolean).map(String);
          const ansIdx =
            typeof item.correctOptionIndex === 'number'
              ? item.correctOptionIndex
              : resolveOptionIndex(String(item.answer ?? item.correctAnswer ?? 'A'), opts);
          return {
            subject: String(item.subject || defaultSubject || 'Mathematics').trim(),
            topic: String(item.topic || defaultTopic || 'General').trim(),
            text: String(item.text || item.question || '').trim(),
            options: opts,
            correctOptionIndex: Math.max(0, Math.min(ansIdx, Math.max(0, opts.length - 1))),
            explanation: String(item.explanation || '').trim(),
          };
        })
        .filter((q: ParsedBulkCbtItem) => q.text && q.options.length >= 2);
    } catch {
      // Fall through to text/CSV parser
    }
  }

  // 2. CSV Support (detect header or multi-comma lines)
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const firstCols = lines.length > 0 ? splitCsvLine(lines[0]) : [];
  if (firstCols.length >= 6 && !/^[A-D][).:\s]/i.test(lines[1] || '')) {
    const hasHeader =
      firstCols.some((c) => /question|option|answer|subject/i.test(c));
    const dataLines = hasHeader ? lines.slice(1) : lines;
    const headerMap = hasHeader ? firstCols.map((h) => h.toLowerCase().trim()) : [];

    const parsedCsv: ParsedBulkCbtItem[] = [];
    for (const line of dataLines) {
      const cols = splitCsvLine(line);
      if (cols.length < 6) continue;

      if (hasHeader) {
        const getCol = (names: string[]) => {
          const idx = headerMap.findIndex((h) => names.some((n) => h.includes(n)));
          return idx >= 0 ? cols[idx] || '' : '';
        };
        const qText = getCol(['question', 'stem', 'text']);
        const optA = getCol(['optiona', 'option a', 'opt_a', 'a']);
        const optB = getCol(['optionb', 'option b', 'opt_b', 'b']);
        const optC = getCol(['optionc', 'option c', 'opt_c', 'c']);
        const optD = getCol(['optiond', 'option d', 'opt_d', 'd']);
        const options = [optA, optB, optC, optD].map((s) => s.trim()).filter(Boolean);
        const rawAns = getCol(['answer', 'correct']);
        if (qText && options.length >= 2) {
          parsedCsv.push({
            subject: getCol(['subject']) || defaultSubject || 'Mathematics',
            topic: getCol(['topic']) || defaultTopic || 'General',
            text: qText,
            options,
            correctOptionIndex: resolveOptionIndex(rawAns, options),
            explanation: getCol(['explanation', 'solution', 'rationale']),
          });
        }
      } else {
        // Positional CSV: question, optionA, optionB, optionC, optionD, answer, [explanation], [subject], [topic]
        const [qText, optA, optB, optC, optD, rawAns, expl, subj, top] = cols;
        const options = [optA, optB, optC, optD].map((s) => (s || '').trim()).filter(Boolean);
        if (qText && options.length >= 2) {
          parsedCsv.push({
            subject: subj || defaultSubject || 'Mathematics',
            topic: top || defaultTopic || 'General',
            text: qText,
            options,
            correctOptionIndex: resolveOptionIndex(rawAns || 'A', options),
            explanation: expl || '',
          });
        }
      }
    }
    if (parsedCsv.length > 0) return parsedCsv;
  }

  // 3. Structured Plain-Text Block Parser
  // Supports blocks separated by blank lines or numbered questions:
  // 1. Question text...
  // A) Option A
  // B) Option B
  // C) Option C
  // D) Option D
  // Answer: B
  // Explanation: ...
  const blocks = trimmed
    .split(/\n\s*\n+|\n(?=(?:Q(?:uestion)?\s*\d*[:.)]|\d+[.)]\s+))/i)
    .map((b) => b.trim())
    .filter(Boolean);

  const items: ParsedBulkCbtItem[] = [];
  for (const block of blocks) {
    const bLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (bLines.length < 3) continue;

    let questionStem = '';
    const options: string[] = [];
    let rawAnswer = 'A';
    let explanation = '';
    let blockSubject = defaultSubject || 'Mathematics';
    let blockTopic = defaultTopic || 'General';

    for (const line of bLines) {
      const subjMatch = line.match(/^Subject\s*[:=-]\s*(.+)$/i);
      if (subjMatch) {
        blockSubject = subjMatch[1].trim();
        continue;
      }
      const topicMatch = line.match(/^Topic\s*[:=-]\s*(.+)$/i);
      if (topicMatch) {
        blockTopic = topicMatch[1].trim();
        continue;
      }
      const optMatch = line.match(/^(?:\(?([A-E])\)?[).:\s-]+)\s*(.+)$/i);
      if (optMatch && questionStem) {
        options.push(optMatch[2].trim());
        continue;
      }
      const ansMatch = line.match(/^(?:Ans(?:wer)?|Correct(?:\s*Option)?)\s*[:=-]\s*(.+)$/i);
      if (ansMatch) {
        rawAnswer = ansMatch[1].trim();
        continue;
      }
      const expMatch = line.match(/^(?:Exp(?:lanation)?|Solution|Marking\s*Scheme)\s*[:=-]\s*(.+)$/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }

      if (!questionStem) {
        questionStem = line.replace(/^(?:Q(?:uestion)?\s*\d*[:.)]|\d+[.)])\s*/i, '').trim();
      } else if (options.length === 0) {
        questionStem += ` ${line}`;
      } else if (explanation) {
        explanation += ` ${line}`;
      }
    }

    if (questionStem && options.length >= 2) {
      items.push({
        subject: blockSubject,
        topic: blockTopic,
        text: questionStem,
        options,
        correctOptionIndex: resolveOptionIndex(rawAnswer, options),
        explanation,
      });
    }
  }

  return items;
}

export function parseBulkPastQuestionsAndAnswers(rawInput: string): PastQuestionItem[] {
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // JSON support
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed.items) ? parsed.items : [parsed];
      return arr
        .map((item: any, idx: number) => {
          const opts: string[] = Array.isArray(item.options)
            ? item.options.map(String).filter(Boolean)
            : [];
          const correctIdx =
            opts.length >= 2
              ? typeof item.correctOptionIndex === 'number'
                ? item.correctOptionIndex
                : resolveOptionIndex(String(item.answer || 'A'), opts)
              : undefined;
          const answerStr =
            String(item.answer || '').trim() ||
            (opts.length >= 2 && correctIdx !== undefined
              ? `${String.fromCharCode(65 + correctIdx)}. ${opts[correctIdx]}`
              : '');

          return {
            id: `pqi-${Date.now()}-${idx}`,
            questionNumber: idx + 1,
            question: String(item.question || item.text || '').trim(),
            options: opts.length >= 2 ? opts : undefined,
            correctOptionIndex: correctIdx,
            answer: answerStr,
            explanation: item.explanation ? String(item.explanation).trim() : undefined,
          };
        })
        .filter((it: PastQuestionItem) => Boolean(it.question));
    } catch {
      // fall through
    }
  }

  // Plain-text Q&A blocks (supports both Objective A-D and Theory/Essay Q&A!)
  const blocks = trimmed
    .split(/\n\s*\n+|\n(?=(?:Q(?:uestion)?\s*\d+[:.)]|\d+[.)]\s+))/i)
    .map((b) => b.trim())
    .filter(Boolean);

  const results: PastQuestionItem[] = [];

  blocks.forEach((block, idx) => {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    let question = '';
    const options: string[] = [];
    let answer = '';
    let explanation = '';
    let mode: 'question' | 'answer' | 'explanation' = 'question';

    for (const line of lines) {
      const optMatch = line.match(/^(?:\(?([A-E])\)?[).:\s-]+)\s*(.+)$/i);
      const ansMatch = line.match(/^(?:Ans(?:wer)?|Marking\s*Scheme|Solution)\s*[:=-]\s*(.*)$/i);
      const expMatch = line.match(/^(?:Exp(?:lanation)?|Note|Working)\s*[:=-]\s*(.*)$/i);

      if (ansMatch) {
        mode = 'answer';
        if (ansMatch[1]) answer = ansMatch[1].trim();
        continue;
      }
      if (expMatch) {
        mode = 'explanation';
        if (expMatch[1]) explanation = expMatch[1].trim();
        continue;
      }
      if (optMatch && question && mode === 'question') {
        options.push(optMatch[2].trim());
        continue;
      }

      if (mode === 'question') {
        const cleaned = !question
          ? line.replace(/^(?:Q(?:uestion)?\s*\d*[:.)]|\d+[.)])\s*/i, '').trim()
          : line;
        question = question ? `${question}\n${cleaned}` : cleaned;
      } else if (mode === 'answer') {
        answer = answer ? `${answer}\n${line}` : line;
      } else if (mode === 'explanation') {
        explanation = explanation ? `${explanation}\n${line}` : line;
      }
    }

    if (!question) return;

    let correctOptionIndex: number | undefined;
    let formattedAnswer = answer;
    if (options.length >= 2) {
      correctOptionIndex = resolveOptionIndex(answer || 'A', options);
      if (!formattedAnswer || /^[A-E]$/i.test(formattedAnswer.trim())) {
        const letter = String.fromCharCode(65 + correctOptionIndex);
        formattedAnswer = `${letter}. ${options[correctOptionIndex] || ''}`;
      }
    }

    results.push({
      id: `pqi-${Date.now()}-${idx}`,
      questionNumber: results.length + 1,
      question,
      options: options.length >= 2 ? options : undefined,
      correctOptionIndex,
      answer: formattedAnswer || 'Refer to attached marking scheme / explanation.',
      explanation: explanation || undefined,
    });
  });

  return results;
}
