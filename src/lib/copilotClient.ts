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
      let errMsg = `Study Copilot request failed (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson?.error) errMsg = errJson.error;
      } catch {
        // ignore JSON parse failure
      }
      throw new Error(errMsg);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (json?.error) throw new Error(json.error);
      const reply = String(json?.reply || '');
      if (reply) onToken(reply);
      return reply;
    }

    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evt of events) {
          const lines = evt.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                fullText += parsed.text;
                onToken(parsed.text);
              }
            } catch (parseErr: any) {
              if (parseErr?.message && !parseErr.message.includes('JSON')) {
                throw parseErr;
              }
            }
          }
        }
      }

      if (fullText.trim()) {
        return fullText;
      }
    }
  }

  // Fallback unary JSON call
  const fallbackRes = await fetch('/api/copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  const data = await fallbackRes.json().catch(() => ({}));
  if (!fallbackRes.ok || data?.error) {
    throw new Error(data?.error || `Study Copilot request failed (${fallbackRes.status})`);
  }

  const reply = String(data?.reply || '');
  if (onToken && reply) {
    onToken(reply);
  }
  return reply;
}
