import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  createApiApp,
  fetchPlatformSnapshot,
  isSupabaseConfigured,
  PresenceEntry,
  supabaseAdmin,
} from './src/server/apiApp';
import { seedJambSyllabusAndPastQuestions } from './src/server/jambSyllabusSeed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!isSupabaseConfigured) {
  console.warn(
    '[EduPulse] Supabase environment variables are not configured. Copy .env.example to .env and set SUPABASE_URL and SUPABASE_SECRET_KEY.'
  );
}

const presenceMap = new Map<WebSocket, PresenceEntry>();

function getPresenceList(): PresenceEntry[] {
  return Array.from(presenceMap.values());
}

async function startServer() {
  if (isSupabaseConfigured) {
    try {
      const seedStats = await seedJambSyllabusAndPastQuestions(supabaseAdmin);
      if (seedStats.cbtQuestionsInserted > 0) {
        console.log(
          `Seeded JAMB UTME Syllabus (${seedStats.subjectsSeeded} subjects, +${seedStats.cbtQuestionsInserted} CBT questions)`
        );
      }
    } catch (seedErr) {
      console.warn('JAMB syllabus startup seed check warning:', seedErr);
    }
  }

  let wss: WebSocketServer | null = null;

  const broadcast = (message: unknown) => {
    if (!wss) return;
    const encoded = JSON.stringify(message);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(encoded);
      }
    }
  };

  const broadcastPresence = () => {
    broadcast({ type: 'presence', payload: getPresenceList() });
  };

  const app = createApiApp({
    getPresence: getPresenceList,
    onSnapshotBroadcast: (snapshot) => {
      broadcast({ type: 'snapshot', payload: snapshot });
    },
  });

  const server = http.createServer(app);
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws) => {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    presenceMap.set(ws, {
      clientId,
      userId: null,
      userName: 'Visitor',
      userEmail: null,
      role: 'guest',
      view: 'landing',
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cbtProgress: null,
    });
    broadcastPresence();

    try {
      const snapshot = await fetchPlatformSnapshot(getPresenceList);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'snapshot', payload: snapshot }));
      }
    } catch (err) {
      console.error('Initial WS snapshot error:', err);
    }

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === 'presence:update') {
          const existing = presenceMap.get(ws);
          if (existing) {
            presenceMap.set(ws, {
              ...existing,
              userId: msg.payload?.userId ?? existing.userId,
              userName: msg.payload?.userName || existing.userName,
              userEmail: msg.payload?.userEmail ?? existing.userEmail,
              role: msg.payload?.role || existing.role,
              view: msg.payload?.view || existing.view,
              cbtProgress: msg.payload?.cbtProgress !== undefined ? msg.payload.cbtProgress : existing.cbtProgress,
              updatedAt: new Date().toISOString(),
            });
            broadcastPresence();
          }
        } else if (msg.type === 'snapshot:request') {
          fetchPlatformSnapshot(getPresenceList).then((snapshot) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'snapshot', payload: snapshot }));
            }
          });
        }
      } catch {
        // Ignore malformed WS payloads
      }
    });

    ws.on('close', () => {
      presenceMap.delete(ws);
      broadcastPresence();
    });
  });

  // Vite Middleware (Development) vs Static Build (Production)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPulse Nigeria real-time server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
