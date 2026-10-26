import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { Router, type Request } from 'express';

const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
const MAX_ACTIVE_SESSIONS = 1000;
const SESSION_CREATION_LIMIT = 5;
const SESSION_CREATION_WINDOW_MS = 10 * 60 * 1000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

interface LiveSessionRow {
  id: string;
  share_token: string;
  update_token_hash: string;
  expires_at: number;
  ended_at: number | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  updated_at: number | null;
}

const dbPath = path.resolve(process.env.SOS_DB_PATH || '.sqlite-data/sos-locations.sqlite');
mkdirSync(path.dirname(dbPath), { recursive: true });

const database = new Database(dbPath);
database.pragma('journal_mode = WAL');
database.pragma('busy_timeout = 5000');
database.exec(`
  CREATE TABLE IF NOT EXISTS sos_live_sessions (
    id TEXT PRIMARY KEY,
    share_token TEXT NOT NULL UNIQUE,
    update_token_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    ended_at INTEGER,
    latitude REAL,
    longitude REAL,
    accuracy REAL,
    updated_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_sos_live_sessions_expiry
    ON sos_live_sessions(expires_at);
`);

const router = Router();
const creationAttempts = new Map<string, number[]>();

router.use((req, res, next) => {
  const origin = req.get('origin');
  const allowedOrigins = new Set([
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'https://localhost',
    ...(process.env.VOYAN_ALLOWED_ORIGINS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  ]);

  if (origin) {
    if (!allowedOrigins.has(origin)) {
      return res.status(403).json({ error: 'This app origin is not allowed to access live SOS sharing.' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

router.post('/sessions', (req, res) => {
  pruneExpiredSessions();

  const now = Date.now();
  const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
  const recentAttempts = (creationAttempts.get(clientKey) || [])
    .filter((timestamp) => now - timestamp < SESSION_CREATION_WINDOW_MS);

  if (recentAttempts.length >= SESSION_CREATION_LIMIT) {
    creationAttempts.set(clientKey, recentAttempts);
    return res.status(429).json({ error: 'Too many live SOS sessions were started. Try again later.' });
  }

  const activeCount = database.prepare(
    'SELECT COUNT(*) AS count FROM sos_live_sessions WHERE ended_at IS NULL AND expires_at > ?'
  ).get(now) as { count: number };
  if (activeCount.count >= MAX_ACTIVE_SESSIONS) {
    return res.status(503).json({ error: 'Live SOS sharing is temporarily at capacity.' });
  }

  creationAttempts.set(clientKey, [...recentAttempts, now]);
  const id = randomBytes(32).toString('base64url');
  const shareToken = randomBytes(32).toString('base64url');
  const updateToken = randomBytes(32).toString('base64url');
  const expiresAt = now + SESSION_LIFETIME_MS;

  database.prepare(`
    INSERT INTO sos_live_sessions (id, share_token, update_token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, shareToken, hashToken(updateToken), now, expiresAt);

  const configuredOrigin = (process.env.PUBLIC_APP_URL || process.env.APP_URL)?.replace(/\/+$/, '');
  if (!configuredOrigin) {
    return res.status(503).json({ error: 'Live SOS sharing requires PUBLIC_APP_URL to be configured with the public HTTPS Voyan address.' });
  }

  let appOrigin: string;
  try {
    const publicUrl = new URL(configuredOrigin);
    if (publicUrl.protocol !== 'https:' || publicUrl.pathname !== '/') {
      return res.status(503).json({ error: 'PUBLIC_APP_URL must be a public HTTPS origin without a path.' });
    }
    appOrigin = publicUrl.origin;
  } catch {
    return res.status(503).json({ error: 'PUBLIC_APP_URL is not a valid HTTPS address.' });
  }
  return res.status(201).json({
    id,
    updateToken,
    liveUrl: `${appOrigin}/sos/live/${shareToken}`,
    expiresAt: new Date(expiresAt).toISOString()
  });
});

router.patch('/sessions/:id', (req, res) => {
  const session = database.prepare('SELECT * FROM sos_live_sessions WHERE id = ?')
    .get(req.params.id) as LiveSessionRow | undefined;
  if (!session || !isAuthorized(req, session.update_token_hash)) {
    return res.status(404).json({ error: 'Live SOS session not found.' });
  }

  const now = Date.now();
  if (session.ended_at !== null || session.expires_at <= now) {
    return res.status(410).json({ error: 'Live SOS session has ended or expired.' });
  }

  const { latitude, longitude, accuracy } = req.body ?? {};
  if (
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    typeof accuracy !== 'number' ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > 100_000
  ) {
    return res.status(400).json({ error: 'A valid GPS location and accuracy are required.' });
  }

  database.prepare(`
    UPDATE sos_live_sessions
    SET latitude = ?, longitude = ?, accuracy = ?, updated_at = ?
    WHERE id = ?
  `).run(latitude, longitude, accuracy, now, session.id);
  return res.json({ ok: true, updatedAt: new Date(now).toISOString() });
});

router.delete('/sessions/:id', (req, res) => {
  const session = database.prepare('SELECT * FROM sos_live_sessions WHERE id = ?')
    .get(req.params.id) as LiveSessionRow | undefined;
  if (!session || !isAuthorized(req, session.update_token_hash)) {
    return res.status(404).json({ error: 'Live SOS session not found.' });
  }

  database.prepare(`
    UPDATE sos_live_sessions
    SET ended_at = ?, latitude = NULL, longitude = NULL, accuracy = NULL, updated_at = NULL
    WHERE id = ? AND ended_at IS NULL
  `).run(Date.now(), session.id);
  return res.json({ ok: true });
});

router.get('/live/:shareToken', (req, res) => {
  if (!TOKEN_PATTERN.test(req.params.shareToken)) {
    return res.status(404).json({ error: 'Live location link is invalid or expired.' });
  }

  const session = database.prepare('SELECT * FROM sos_live_sessions WHERE share_token = ?')
    .get(req.params.shareToken) as LiveSessionRow | undefined;
  if (!session) return res.status(404).json({ error: 'Live location link is invalid or expired.' });

  const now = Date.now();
  const active = session.ended_at === null && session.expires_at > now;
  if (!active && session.ended_at === null) {
    database.prepare(`
      UPDATE sos_live_sessions
      SET ended_at = ?, latitude = NULL, longitude = NULL, accuracy = NULL, updated_at = NULL
      WHERE id = ?
    `).run(now, session.id);
  }

  res.setHeader('Cache-Control', 'no-store, private');
  return res.json({
    active,
    expiresAt: new Date(session.expires_at).toISOString(),
    location: active && session.updated_at !== null
      ? {
          latitude: session.latitude,
          longitude: session.longitude,
          accuracy: session.accuracy,
          updatedAt: new Date(session.updated_at).toISOString()
        }
      : null
  });
});

function isAuthorized(req: Request, expectedHash: string): boolean {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return false;

  const candidateHash = Buffer.from(hashToken(authorization.slice(7)));
  const savedHash = Buffer.from(expectedHash);
  return candidateHash.length === savedHash.length && timingSafeEqual(candidateHash, savedHash);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function pruneExpiredSessions(): void {
  const cutoff = Date.now() - 10 * 60 * 1000;
  database.prepare('DELETE FROM sos_live_sessions WHERE expires_at <= ? OR ended_at <= ?')
    .run(Date.now(), cutoff);

  for (const [key, timestamps] of creationAttempts) {
    const recent = timestamps.filter((timestamp) => Date.now() - timestamp < SESSION_CREATION_WINDOW_MS);
    if (recent.length) creationAttempts.set(key, recent);
    else creationAttempts.delete(key);
  }
}

export default router;
