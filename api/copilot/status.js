export const config = {
  runtime: 'edge',
};

function cleanEnv(raw) {
  const trimmed = String(raw || '').trim().replace(/^["']+|["']+$/g, '').trim();
  if (!trimmed || trimmed.startsWith('your_')) return '';
  return trimmed;
}

function cleanApiKey(raw) {
  const val = cleanEnv(raw)
    .replace(/^Authorization\s*:\s*/i, '')
    .replace(/^Bearer\s+/i, '')
    .trim()
    .replace(/^["']+|["']+$/g, '');
  if (!val || val.startsWith('your_')) return '';
  return val;
}

export default async function handler() {
  const misplaced = cleanApiKey(process.env.GEMINI_API_KEY);
  const key =
    cleanApiKey(process.env.OPENROUTER_API_KEY) ||
    cleanApiKey(process.env.OPENROUTER_KEY) ||
    cleanApiKey(process.env.VITE_OPENROUTER_API_KEY) ||
    cleanApiKey(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) ||
    cleanApiKey(process.env.COPILOT_API_KEY) ||
    (misplaced.startsWith('sk-') ? misplaced : '');

  return new Response(
    JSON.stringify({
      ok: true,
      configured: Boolean(key),
      provider: key ? 'openrouter' : 'none',
      model:
        cleanEnv(process.env.OPENROUTER_MODEL) ||
        cleanEnv(process.env.COPILOT_MODEL) ||
        'openai/gpt-4o-mini',
      runtime: 'vercel-edge',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
