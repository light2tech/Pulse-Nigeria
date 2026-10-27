import { CopilotContextPayload, CopilotMessage } from '../types';

export interface SendCopilotRequestParams {
  messages: Array<Pick<CopilotMessage, 'role' | 'content'>>;
  context?: CopilotContextPayload;
  student?: {
    name?: string;
    studentClass?: string;
    weakestSubject?: string | null;
  };
  onToken?: (delta: string) => void;
  signal?: AbortSignal;
}

const NON_RETRYABLE_CODES = new Set([
  'API_KEY_MISSING',
  'API_KEY_ERROR',
  'CUSTOM_SK_KEY_NEEDS_BASE_URL',
  'RESOURCE_EXHAUSTED',
]);

export async function sendCopilotMessage({
  messages,
  context,
  student,
  onToken,
  signal,
}: SendCopilotRequestParams): Promise<string> {
  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    context,
    student,
  };

  if (onToken) {
    let streamedChars = 0;
    try {
      const res = await fetch('/api/copilot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok) {
        let errMsg =
          res.status === 504
            ? 'OpenRouter request timed out (504). Please try a shorter prompt or retry.'
            : `OpenRouter AI request failed (${res.status})`;
        let errCode = '';
        try {
          const errJson = await res.json();
          if (errJson?.error) errMsg = errJson.error;
          if (errJson?.code) errCode = String(errJson.code);
        } catch {
          // ignore JSON parse failure on non-JSON gateway responses
        }

        if (
          NON_RETRYABLE_CODES.has(errCode) ||
          res.status === 400 ||
          res.status === 401 ||
          res.status === 402 ||
          res.status === 403 ||
          res.status === 429 ||
          res.status === 504
        ) {
          const fatalErr = new Error(errMsg);
          (fatalErr as any).nonRetryable = true;
          throw fatalErr;
        }
        // Otherwise fall through to unary /api/copilot/chat fallback
      } else {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (json?.error) {
            const fatalErr = new Error(json.error);
            if (NON_RETRYABLE_CODES.has(String(json?.code || ''))) {
              (fatalErr as any).nonRetryable = true;
            }
            throw fatalErr;
          }
          const reply = String(json?.reply || '');
          if (reply) {
            onToken(reply);
            return reply;
          }
        } else if (!contentType.includes('text/html') && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullText = '';

          const processEventBlock = (evt: string) => {
            const lines = evt.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const dataStr = trimmed.slice(5).trim();
              if (!dataStr || dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  const sseErr = new Error(parsed.error);
                  if (NON_RETRYABLE_CODES.has(String(parsed.code || ''))) {
                    (sseErr as any).nonRetryable = true;
                  }
                  throw sseErr;
                }
                if (parsed.text) {
                  fullText += parsed.text;
                  streamedChars += parsed.text.length;
                  onToken(parsed.text);
                }
              } catch (parseErr: any) {
                if (parseErr?.message && !parseErr.message.includes('JSON')) {
                  throw parseErr;
                }
              }
            }
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const events = buffer.split('\n\n');
            buffer = events.pop() || '';

            for (const evt of events) {
              processEventBlock(evt);
            }
          }

          if (buffer.trim()) {
            processEventBlock(buffer);
          }

          if (fullText.trim()) {
            return fullText;
          }
        }
      }
    } catch (streamErr: any) {
      if (
        streamErr?.name === 'AbortError' ||
        streamErr?.nonRetryable ||
        streamedChars > 0
      ) {
        throw streamErr;
      }
      // Automatically fall back to unary /api/copilot/chat on transient routing issues
    }
  }

  // Unary JSON call (primary when no onToken, or fallback on non-streaming proxy)
  const fallbackRes = await fetch('/api/copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  const fallbackType = fallbackRes.headers.get('content-type') || '';
  if (fallbackType.includes('text/html')) {
    if (fallbackRes.status === 504) {
      throw new Error('OpenRouter request timed out on the server (504). Please try again.');
    }
    if (fallbackRes.status >= 500) {
      throw new Error(`OpenRouter gateway error (${fallbackRes.status}). Please retry in a moment.`);
    }
    throw new Error(
      `OpenRouter API route returned an unexpected HTML response (${fallbackRes.status}). Push your latest changes to GitHub so Vercel deploys the updated OpenRouter Edge routes.`
    );
  }

  const data = await fallbackRes.json().catch(() => ({}));
  if (!fallbackRes.ok || data?.error) {
    throw new Error(data?.error || `OpenRouter AI request failed (${fallbackRes.status})`);
  }

  const reply = String(data?.reply || '');
  if (onToken && reply) {
    onToken(reply);
  }
  return reply;
}
