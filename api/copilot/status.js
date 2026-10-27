export const config = {
  runtime: 'edge',
};

function cleanEnv(raw) {
  const trimmed = String(raw || '').trim().replace(/^["']+|["']+$/g, '');
  if (!trimmed || trimmed.startsWith('your_')) return '';
  return trimmed;
}

export default async function handler() {
  const misplaced = cleanEnv(process.env.GEMINI_API_KEY);
  const key =
    cleanEnv(process.env.OPENROUTER_API_KEY) ||
    cleanEnv(process.env.OPENROUTER_KEY) ||
    cleanEnv(process.env.VITE_OPENROUTER_API_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) ||
    cleanEnv(process.env.COPILOT_API_KEY) ||
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
