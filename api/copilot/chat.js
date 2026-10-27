export const config = {
  runtime: 'edge',
};

function cleanEnv(raw) {
  const trimmed = String(raw || '').trim().replace(/^["']+|["']+$/g, '');
  if (!trimmed || trimmed.startsWith('your_')) return '';
  return trimmed;
}

function getOpenRouterKey() {
  const misplaced = cleanEnv(process.env.GEMINI_API_KEY);
  return (
    cleanEnv(process.env.OPENROUTER_API_KEY) ||
    cleanEnv(process.env.OPENROUTER_KEY) ||
    cleanEnv(process.env.VITE_OPENROUTER_API_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) ||
    cleanEnv(process.env.COPILOT_API_KEY) ||
    cleanEnv(process.env.VITE_COPILOT_API_KEY) ||
    cleanEnv(process.env.OPENAI_API_KEY) ||
    (misplaced.startsWith('sk-') ? misplaced : '')
  );
}

function getCandidateModels() {
  const custom =
    cleanEnv(process.env.OPENROUTER_MODEL) ||
    cleanEnv(process.env.COPILOT_MODEL);
  const defaults = ['openai/gpt-4o-mini', 'openai/gpt-4o'];
  return custom ? [custom, ...defaults.filter((m) => m !== custom)] : defaults;
}

function buildSystemInstruction(context, student) {
  const lines = [
    'You are EduPulse AI Study Tutor for Nigerian JAMB UTME, WAEC WASSCE, and NECO students.',
    'Explain clearly, accurately, and concisely step-by-step.',
    '- Use clean markdown: **bold** key terms, bullet lists (`- `), and numbered steps (`1. `).',
    '- For calculations, show each formula and substitution clearly.',
    '- Keep explanations focused, crisp, and easy to scan.',
  ];

  if (student?.name || student?.studentClass || student?.weakestSubject) {
    if (student.name) lines.push(`Student: ${student.name}`);
    if (student.studentClass) lines.push(`Class: ${student.studentClass}`);
    if (student.weakestSubject) lines.push(`Weakest Subject: ${student.weakestSubject}`);
  }

  if (context?.subject && context.subject !== 'All') {
    lines.push(`Subject Focus: ${context.subject}`);
  }

  if (context?.type === 'material' && context.materialTitle) {
    lines.push(
      '',
      `=== STUDY NOTE: ${context.materialTitle} (${context.subject || 'General'}) ===`
    );
    if (context.currentSectionContent) {
      lines.push(String(context.currentSectionContent).slice(0, 3500));
    } else if (Array.isArray(context.fullNoteContent) && context.fullNoteContent.length > 0) {
      lines.push(context.fullNoteContent.join('\n\n').slice(0, 4000));
    }
  } else if (context?.type === 'question' && context.questionText) {
    lines.push(
      '',
      `=== EXAM QUESTION (${context.subject || 'General'}) ===`,
      `Question: ${context.questionText}`
    );
    if (Array.isArray(context.options) && context.options.length > 0) {
      lines.push(
        'Options:\n' +
          context.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')
      );
    }
    if (context.correctAnswer) lines.push(`Official Answer: ${context.correctAnswer}`);
    if (context.studentAnswer) lines.push(`Student Picked: ${context.studentAnswer}`);
    if (context.officialExplanation) lines.push(`Explanation: ${context.officialExplanation}`);
  }

  return lines.join('\n');
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        code: 'API_KEY_MISSING',
        error:
          'OPENROUTER_API_KEY is not set in Vercel yet. Add OPENROUTER_API_KEY (your sk-or-v1-... key) in Vercel → Project Settings → Environment Variables, click Save, and Redeploy.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const sanitized = rawMessages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .slice(-8)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.trim(),
    }));

  if (sanitized.length === 0) {
    return new Response(JSON.stringify({ error: 'Please enter a question.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemInstruction = buildSystemInstruction(body?.context, body?.student);
  const origin = req.headers.get('origin') || 'https://edupulse.app';
  const baseUrl = (
    cleanEnv(process.env.OPENROUTER_BASE_URL) ||
    cleanEnv(process.env.COPILOT_BASE_URL) ||
    'https://openrouter.ai/api/v1'
  ).replace(/\/+$/, '');
  const endpoint = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl}/chat/completions`;

  let lastErrorText = 'OpenRouter request failed.';
  let lastStatus = 500;

  for (const modelName of getCandidateModels()) {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': origin,
        'X-Title': 'EduPulse',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 650,
        temperature: 0.35,
        messages: [{ role: 'system', content: systemInstruction }, ...sanitized],
      }),
    });

    if (!upstream.ok) {
      lastStatus = upstream.status;
      const errTxt = await upstream.text().catch(() => '');
      lastErrorText = `OpenRouter (${modelName}) returned ${upstream.status}: ${errTxt.slice(0, 220)}`;
      if (upstream.status === 401 || upstream.status === 403) {
        return new Response(
          JSON.stringify({
            code: 'API_KEY_ERROR',
            error:
              'OpenRouter rejected OPENROUTER_API_KEY (401/403). Verify your sk-or-v1-... key in Vercel Environment Variables and Redeploy.',
          }),
          { status: upstream.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
      continue;
    }

    const data = await upstream.json();
    const reply = String(data?.choices?.[0]?.message?.content || '').trim();
    if (reply) {
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: lastErrorText }), {
    status: lastStatus >= 400 && lastStatus < 600 ? lastStatus : 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
