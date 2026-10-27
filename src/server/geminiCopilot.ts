import { GoogleGenAI, GenerateContentResponse, ThinkingLevel } from '@google/genai';
import type { Request, Response } from 'express';

const DEFAULT_GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
] as const;

const VERCEL_GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
] as const;

function getGeminiModelCandidates(): string[] {
  const customModel = getValidEnvValue(process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL);
  const defaults = process.env.VERCEL ? VERCEL_GEMINI_MODELS : DEFAULT_GEMINI_MODELS;
  if (customModel && !defaults.includes(customModel as any)) {
    return [customModel, ...defaults];
  }
  return [...defaults];
}

const failedOpenAiAuthCache = new Set<string>();

function getValidEnvValue(raw?: string): string {
  const trimmed = (raw || '').trim().replace(/^["']+|["']+$/g, '');
  if (
    !trimmed ||
    trimmed === 'your_gemini_api_key' ||
    trimmed === 'your_copilot_api_key' ||
    trimmed.startsWith('your_')
  ) {
    return '';
  }
  return trimmed;
}

function isGeminiFormattedKey(key: string): boolean {
  return Boolean(key && (key.startsWith('AIza') || key.startsWith('AQ.')));
}

function getGeminiApiKey(): string {
  const explicitGemini = getValidEnvValue(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.VITE_GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
  );
  if (explicitGemini) {
    return explicitGemini;
  }

  const candidateFallback = getValidEnvValue(
    process.env.COPILOT_API_KEY ||
      process.env.VITE_COPILOT_API_KEY ||
      process.env.API_KEY ||
      process.env.VITE_API_KEY
  );
  if (isGeminiFormattedKey(candidateFallback)) {
    return candidateFallback;
  }

  return '';
}

function getOpenAiCompatibleConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
  hasExplicitProvider: boolean;
} | null {
  const deepseekKey = getValidEnvValue(
    process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY
  );
  const openrouterKey = getValidEnvValue(
    process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY
  );
  const groqKey = getValidEnvValue(
    process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY
  );
  const genericKey = getValidEnvValue(
    process.env.COPILOT_API_KEY ||
      process.env.VITE_COPILOT_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.VITE_OPENAI_API_KEY ||
      process.env.API_KEY ||
      process.env.VITE_API_KEY
  );

  const apiKey = genericKey || deepseekKey || openrouterKey || groqKey;
  if (!apiKey || isGeminiFormattedKey(apiKey)) {
    return null;
  }

  const rawBase = getValidEnvValue(
    process.env.COPILOT_BASE_URL ||
      process.env.VITE_COPILOT_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      process.env.VITE_OPENAI_BASE_URL
  );

  const hasExplicitProvider = Boolean(
    rawBase ||
      openrouterKey ||
      groqKey ||
      deepseekKey ||
      apiKey.startsWith('sk-proj-') ||
      apiKey.startsWith('sk-svcacct-') ||
      apiKey.startsWith('sk-or-') ||
      apiKey.startsWith('gsk_')
  );

  const inferredBase = rawBase
    ? rawBase.replace(/\/+$/, '')
    : openrouterKey || apiKey.startsWith('sk-or-')
      ? 'https://openrouter.ai/api/v1'
      : groqKey || apiKey.startsWith('gsk_')
        ? 'https://api.groq.com/openai/v1'
        : deepseekKey
          ? 'https://api.deepseek.com/v1'
          : 'https://api.openai.com/v1';

  if (failedOpenAiAuthCache.has(`${inferredBase}::${apiKey}`) && getGeminiApiKey()) {
    return null;
  }

  const rawModel = getValidEnvValue(
    process.env.COPILOT_MODEL ||
      process.env.VITE_COPILOT_MODEL ||
      process.env.OPENAI_MODEL ||
      process.env.VITE_OPENAI_MODEL
  );
  const inferredModel = rawModel
    ? rawModel
    : inferredBase.includes('openrouter.ai')
      ? 'openai/gpt-4o-mini'
      : inferredBase.includes('groq.com')
        ? 'llama-3.3-70b-versatile'
        : inferredBase.includes('deepseek.com')
          ? 'deepseek-chat'
          : 'gpt-4o-mini';

  return {
    apiKey,
    baseUrl: inferredBase,
    model: inferredModel,
    hasExplicitProvider,
  };
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface IncomingCopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IncomingCopilotContext {
  type?: 'general' | 'material' | 'question';
  subject?: string;
  materialId?: string;
  materialTitle?: string;
  materialLevel?: string;
  materialSummary?: string;
  sectionIndex?: number;
  totalSections?: number;
  currentSectionContent?: string;
  fullNoteContent?: string[];
  questionSource?: string;
  questionText?: string;
  options?: string[];
  correctAnswer?: string;
  studentAnswer?: string;
  officialExplanation?: string;
}

export interface IncomingStudentMeta {
  name?: string;
  studentClass?: string;
  weakestSubject?: string | null;
}

function buildSystemInstruction(
  context?: IncomingCopilotContext,
  student?: IncomingStudentMeta
): string {
  const lines: string[] = [
    'You are EduPulse Study Copilot, an expert academic tutor for Nigerian secondary school and university-entrance students preparing for JAMB UTME, WAEC WASSCE, and NECO examinations.',
    '',
    'Teaching & Formatting Guidelines:',
    '- Explain concepts clearly, accurately, and step-by-step using syllabus-aligned terminology.',
    '- When explaining study notes: break down dense paragraphs into clear headings, core definitions, key formulas/rules, real-world relatable examples, and "JAMB/WAEC Exam Traps to Watch Out For".',
    '- When explaining past or CBT questions: walk through the reasoning step-by-step, clearly state why the correct option is right, briefly explain why common distractor options are wrong, and share a fast exam-hall solving tip.',
    '- For Mathematics, Physics, Chemistry, Accounting, or Economics calculations: write every step of the formula and substitution clearly on separate lines.',
    '- Use clean markdown formatting: **bold** key terms, bullet lists (`- `), numbered steps (`1. `), and short paragraphs so responses are easy to scan.',
    '- Keep responses focused, encouraging, and medium-length (concise enough to read comfortably while thorough enough to master the concept). End with 1 short follow-up prompt or quick check question when helpful.',
  ];

  if (student?.name || student?.studentClass || student?.weakestSubject) {
    lines.push('', 'Student Profile Context:');
    if (student.name) lines.push(`- Student Name: ${student.name}`);
    if (student.studentClass) lines.push(`- Class / Track: ${student.studentClass}`);
    if (student.weakestSubject) {
      lines.push(`- Focus / Weakest Recorded Subject: ${student.weakestSubject}`);
    }
  }

  if (context?.subject && context.subject !== 'All') {
    lines.push(`- Active Subject Focus: ${context.subject}`);
  }

  if (context?.type === 'material' && context.materialTitle) {
    lines.push(
      '',
      '=== ATTACHED STUDY NOTE CONTEXT ===',
      `Title: ${context.materialTitle}`,
      `Subject: ${context.subject || 'General'}`,
      `Level / Syllabus: ${context.materialLevel || 'JAMB / SSCE'}`
    );
    if (context.materialSummary) {
      lines.push(`Syllabus Scope: ${context.materialSummary}`);
    }
    if (typeof context.sectionIndex === 'number' && context.currentSectionContent) {
      lines.push(
        `Active Section (${context.sectionIndex + 1} of ${context.totalSections || 1}):`,
        context.currentSectionContent
      );
    }
    if (Array.isArray(context.fullNoteContent) && context.fullNoteContent.length > 0) {
      const joined = context.fullNoteContent
        .map((sec, idx) => `[Section ${idx + 1}]\n${sec}`)
        .join('\n\n')
        .slice(0, 14000);
      lines.push('Complete Study Note Reference:', joined);
    }
    lines.push('=== END STUDY NOTE CONTEXT ===');
  } else if (context?.type === 'question' && context.questionText) {
    lines.push(
      '',
      '=== ATTACHED EXAM QUESTION CONTEXT ===',
      `Source: ${context.questionSource || 'Practice Question'}`,
      `Subject: ${context.subject || 'General'}`,
      `Question: ${context.questionText}`
    );
    if (Array.isArray(context.options) && context.options.length > 0) {
      const formattedOpts = context.options
        .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
        .join('\n');
      lines.push('Options:\n' + formattedOpts);
    }
    if (context.correctAnswer) {
      lines.push(`Official Correct Answer: ${context.correctAnswer}`);
    }
    if (context.studentAnswer) {
      lines.push(`Student Selected Answer: ${context.studentAnswer}`);
    }
    if (context.officialExplanation) {
      lines.push(`Official Marking Scheme / Explanation: ${context.officialExplanation}`);
    }
    lines.push('=== END EXAM QUESTION CONTEXT ===');
  }

  return lines.join('\n');
}

function sanitizeMessages(messages: IncomingCopilotMessage[]): IncomingCopilotMessage[] {
  return messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .slice(-16)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.trim(),
    }));
}

function buildGeminiContents(messages: IncomingCopilotMessage[]) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

async function callOpenAiCompatibleUnary(
  cfg: { apiKey: string; baseUrl: string; model: string },
  systemInstruction: string,
  messages: IncomingCopilotMessage[]
): Promise<string> {
  const endpoint = cfg.baseUrl.endsWith('/chat/completions')
    ? cfg.baseUrl
    : `${cfg.baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      failedOpenAiAuthCache.add(`${cfg.baseUrl}::${cfg.apiKey}`);
    }
    const errBody = await response.text().catch(() => '');
    const err = new Error(
      `Copilot provider (${cfg.baseUrl}) returned ${response.status}: ${errBody.slice(0, 240)}`
    );
    (err as any).statusCode = response.status;
    throw err;
  }

  const data: any = await response.json();
  return String(data?.choices?.[0]?.message?.content || '').trim();
}

async function streamOpenAiCompatible(
  cfg: { apiKey: string; baseUrl: string; model: string },
  systemInstruction: string,
  messages: IncomingCopilotMessage[],
  onChunk: (delta: string) => void
): Promise<boolean> {
  const endpoint = cfg.baseUrl.endsWith('/chat/completions')
    ? cfg.baseUrl
    : `${cfg.baseUrl}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.4,
      stream: true,
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!response.ok || !response.body) {
    if (response.status === 401) {
      failedOpenAiAuthCache.add(`${cfg.baseUrl}::${cfg.apiKey}`);
    }
    const errBody = await response.text().catch(() => '');
    const err = new Error(
      `Copilot provider (${cfg.baseUrl}) returned ${response.status}: ${errBody.slice(0, 240)}`
    );
    (err as any).statusCode = response.status;
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamedAny = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed.startsWith('data:')) continue;
      const dataStr = trimmed.slice(5).trim();
      if (!dataStr || dataStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(dataStr);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) {
          streamedAny = true;
          onChunk(delta);
        }
      } catch {
        // ignore partial SSE line
      }
    }
  }

  return streamedAny;
}

function buildGeminiConfig(modelName: string, systemInstruction: string) {
  if (modelName === 'gemini-3.8-flash') {
    return {
      systemInstruction,
      temperature: 0.4,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    };
  }
  return {
    systemInstruction,
    temperature: 0.4,
  };
}

async function generateWithGeminiFallback(
  ai: GoogleGenAI,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemInstruction: string
): Promise<string> {
  let lastError: any;

  for (const modelName of getGeminiModelCandidates()) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents,
        config: buildGeminiConfig(modelName, systemInstruction),
      });
      const text = response.text?.trim();
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      const status = Number(err?.status || err?.statusCode || 0);
      // If API key itself is invalid/forbidden, fail immediately rather than trying other models
      if (status === 400 || status === 403) {
        if (/API_KEY_INVALID|PERMISSION_DENIED/i.test(String(err?.message || ''))) {
          throw err;
        }
      }
    }
  }

  throw lastError || new Error('All Study Copilot models are temporarily busy. Please try again.');
}

function formatCopilotError(err: any): { status: number; message: string; code?: string } {
  const rawMessage = String(
    err?.message || err || 'Failed to generate response from Study Copilot.'
  );
  const status = Number(err?.status || err?.statusCode || 500);

  if (err?.code === 'API_KEY_MISSING') {
    return {
      status: 400,
      code: 'API_KEY_MISSING',
      message: process.env.VERCEL
        ? 'Study Copilot has no AI key in this Vercel deployment yet. In Vercel → Settings → Environment Variables, add GEMINI_API_KEY (a free key starting with AIza... from aistudio.google.com/apikey), then go to Deployments → Redeploy.'
        : 'No active AI key configured. Set GEMINI_API_KEY in Settings > Secrets.',
    };
  }

  if (
    status === 401 &&
    rawMessage.includes('api.openai.com') &&
    !getValidEnvValue(
      process.env.COPILOT_BASE_URL ||
        process.env.VITE_COPILOT_BASE_URL ||
        process.env.OPENAI_BASE_URL
    )
  ) {
    return {
      status: 400,
      code: 'CUSTOM_SK_KEY_NEEDS_BASE_URL',
      message:
        'Your sk-... key was rejected by api.openai.com (401) because it comes from a third-party gateway rather than OpenAI directly. Either: (1) Replace it with GEMINI_API_KEY (a free AIza... key from aistudio.google.com/apikey) in Vercel Environment Variables, OR (2) Also add COPILOT_BASE_URL and COPILOT_MODEL from the provider where you generated that sk-... key, then Redeploy.',
    };
  }

  if (
    (status === 400 || status === 401 || status === 403) &&
    /API_KEY|Unauthorized|Incorrect API key|authentication|invalid_api_key/i.test(rawMessage)
  ) {
    return {
      status: status === 403 ? 403 : 400,
      code: 'API_KEY_ERROR',
      message: process.env.VERCEL
        ? 'Study Copilot could not authenticate with the configured API key on Vercel. Verify GEMINI_API_KEY (or COPILOT_API_KEY + COPILOT_BASE_URL) in Vercel → Settings → Environment Variables without extra spaces, then Redeploy.'
        : 'Study Copilot could not authenticate with the configured AI key. Check your key in Settings > Secrets.',
    };
  }

  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(rawMessage)) {
    return {
      status: 429,
      code: 'RESOURCE_EXHAUSTED',
      message:
        'Study Copilot reached its current request quota. Please wait a moment and try again.',
    };
  }

  if (status === 503 || /UNAVAILABLE|high demand/i.test(rawMessage)) {
    return {
      status: 503,
      code: 'MODEL_BUSY',
      message:
        'Study Copilot is experiencing temporary high demand. Please retry your question in a few seconds.',
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: rawMessage,
  };
}

export function handleCopilotStatus(_req: Request, res: Response) {
  const geminiKey = getGeminiApiKey();
  const openAiCfg = getOpenAiCompatibleConfig();
  const hasCustomBaseUrl = Boolean(
    getValidEnvValue(
      process.env.COPILOT_BASE_URL ||
        process.env.VITE_COPILOT_BASE_URL ||
        process.env.OPENAI_BASE_URL
    )
  );

  res.json({
    ok: true,
    configured: Boolean(geminiKey || openAiCfg),
    provider: geminiKey
      ? 'gemini'
      : openAiCfg
        ? 'openai-compatible'
        : 'none',
    hasCustomBaseUrl,
    runtime: process.env.VERCEL ? 'vercel' : 'node',
  });
}

export async function handleCopilotChat(req: Request, res: Response) {
  try {
    const { messages, context, student } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please enter a question or prompt for Study Copilot.' });
      return;
    }

    const sanitized = sanitizeMessages(messages);
    if (sanitized.length === 0) {
      res.status(400).json({ error: 'Message content cannot be empty.' });
      return;
    }

    const systemInstruction = buildSystemInstruction(context, student);
    const openAiCfg = getOpenAiCompatibleConfig();
    const geminiKey = getGeminiApiKey();
    const preferOpenAiFirst = Boolean(openAiCfg && (!geminiKey || openAiCfg.hasExplicitProvider));

    if (preferOpenAiFirst && openAiCfg) {
      try {
        const reply = await callOpenAiCompatibleUnary(openAiCfg, systemInstruction, sanitized);
        if (reply) {
          res.json({ reply });
          return;
        }
      } catch (openAiErr) {
        if (!geminiKey) {
          throw openAiErr;
        }
      }
    }

    if (geminiKey) {
      try {
        const ai = createGeminiClient(geminiKey);
        const reply = await generateWithGeminiFallback(
          ai,
          buildGeminiContents(sanitized),
          systemInstruction
        );
        res.json({ reply });
        return;
      } catch (geminiErr) {
        if (!preferOpenAiFirst && openAiCfg) {
          const reply = await callOpenAiCompatibleUnary(openAiCfg, systemInstruction, sanitized);
          if (reply) {
            res.json({ reply });
            return;
          }
        }
        throw geminiErr;
      }
    }

    const err = new Error('No active AI key configured.');
    (err as any).statusCode = 400;
    (err as any).code = 'API_KEY_MISSING';
    throw err;
  } catch (err: any) {
    const formatted = formatCopilotError(err);
    res.status(formatted.status).json({
      error: formatted.message,
      code: formatted.code,
    });
  }
}

export async function handleCopilotStream(req: Request, res: Response) {
  try {
    const { messages, context, student } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please enter a question or prompt for Study Copilot.' });
      return;
    }

    const sanitized = sanitizeMessages(messages);
    if (sanitized.length === 0) {
      res.status(400).json({ error: 'Message content cannot be empty.' });
      return;
    }

    const systemInstruction = buildSystemInstruction(context, student);
    const openAiCfg = getOpenAiCompatibleConfig();
    const geminiKey = getGeminiApiKey();
    const preferOpenAiFirst = Boolean(openAiCfg && (!geminiKey || openAiCfg.hasExplicitProvider));

    const startSseHeaders = () => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();
      }
    };

    if (preferOpenAiFirst && openAiCfg) {
      try {
        let headersOpened = false;
        const streamedAny = await streamOpenAiCompatible(
          openAiCfg,
          systemInstruction,
          sanitized,
          (delta) => {
            if (!headersOpened) {
              startSseHeaders();
              headersOpened = true;
            }
            res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
          }
        );

        if (streamedAny) {
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        }
      } catch (openAiErr) {
        if (!geminiKey || res.headersSent) {
          throw openAiErr;
        }
      }
    }

    if (!geminiKey) {
      const err = new Error('No active AI key configured.');
      (err as any).statusCode = 400;
      (err as any).code = 'API_KEY_MISSING';
      throw err;
    }

    const ai = createGeminiClient(geminiKey);
    const geminiContents = buildGeminiContents(sanitized);
    let lastError: any;

    for (const modelName of getGeminiModelCandidates()) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents: geminiContents,
          config: buildGeminiConfig(modelName, systemInstruction),
        });

        let streamedAny = false;
        for await (const chunk of responseStream) {
          const c = chunk as GenerateContentResponse;
          const text = c.text;
          if (text) {
            if (!streamedAny) {
              startSseHeaders();
              streamedAny = true;
            }
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }

        if (streamedAny) {
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        }
      } catch (err: any) {
        lastError = err;
        if (res.headersSent) {
          throw err;
        }
        const status = Number(err?.status || err?.statusCode || 0);
        if (
          (status === 400 || status === 403) &&
          /API_KEY_INVALID|PERMISSION_DENIED/i.test(String(err?.message || ''))
        ) {
          throw err;
        }
      }
    }

    throw lastError || new Error('All Study Copilot models are temporarily busy. Please try again.');
  } catch (err: any) {
    const formatted = formatCopilotError(err);
    if (!res.headersSent) {
      res.status(formatted.status).json({
        error: formatted.message,
        code: formatted.code,
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: formatted.message, code: formatted.code })}\n\n`);
      res.end();
    }
  }
}
