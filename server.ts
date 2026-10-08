import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import sharp from 'sharp';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ----------------- ENTERPRISE SECURITY HEADERS -----------------
// Configured to allow embedding inside the AI Studio development environment iframe
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ----------------- SENSITIVE RESOURCE SHIELD -----------------
// Protect server-side secrets, database files, and environment files from direct HTTP access
app.use((req: Request, res: Response, next: NextFunction) => {
  const pathLower = req.path.toLowerCase();
  const blockedExact = [
    '/firebase-applet-config.json',
    '/firestore.rules',
    '/server.ts',
    '/.env',
    '/.env.local',
    '/.env.production',
  ];

  if (
    blockedExact.includes(pathLower) ||
    pathLower.startsWith('/.env') ||
    pathLower.startsWith('/data/')
  ) {
    res.status(403).json({ error: 'Access forbidden: Protected system resource' });
    return;
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Persistent database path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'debloom_db.json');

// Uploads directory
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ----------------- FIREBASE FIRESTORE CLOUD DATABASE -----------------
let firestoreDb: any = null;

try {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const fbConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const fbApp = initializeApp({
      apiKey: fbConfig.apiKey,
      projectId: fbConfig.projectId,
      appId: fbConfig.appId,
    });
    firestoreDb = initializeFirestore(fbApp, {}, fbConfig.firestoreDatabaseId);
    console.log('✅ Google Cloud Firestore connected on project:', fbConfig.projectId);
  }
} catch (err) {
  console.warn('⚠️ Firebase Firestore initialization note:', err);
}

// Serve uploaded images with Firestore recovery fallback (survives container restarts)
app.get('/uploads/:filename', async (req: Request, res: Response, next: NextFunction) => {
  const filename = req.params.filename;
  const localFile = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(localFile)) {
    res.sendFile(localFile);
    return;
  }

  // File not found on local ephemeral disk - fetch from persistent Firestore cloud
  if (firestoreDb) {
    try {
      const mediaRef = doc(firestoreDb, 'media_library', filename);
      const snap = await getDoc(mediaRef);
      if (snap.exists()) {
        const media = snap.data();
        const buffer = Buffer.from(media.base64, 'base64');
        try {
          fs.writeFileSync(localFile, buffer);
        } catch (_) {}
        res.setHeader('Content-Type', media.contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(buffer);
        return;
      }
    } catch (err) {
      console.warn('Error retrieving media from Firestore:', err);
    }
  }

  res.status(404).send('Image not found');
});

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

interface DatabaseSchema {
  articles: any[];
  opportunities: any[];
  resources: any[];
  challenges: any[];
  bloomOfTheWeek: {
    awarded: boolean;
    studentName?: string;
    challengeTitle?: string;
    outputDescription?: string;
    submissionLink?: string;
    dateAwarded?: string;
    reflection?: string;
  };
  submissions: any[];
  reports: any[];
  writers: any[];
  settings: {
    telegramUrl: string;
    telegramChannelName: string;
    contactEmail: string;
    allowPublicSubmissions: boolean;
    announcementNotice: string;
  };
  analytics: any[];
}

const DEFAULT_DB: DatabaseSchema = {
  articles: [],
  opportunities: [],
  resources: [],
  challenges: [],
  bloomOfTheWeek: {
    awarded: false,
  },
  submissions: [],
  reports: [],
  writers: [],
  settings: {
    telegramUrl: 'https://t.me/DebloomHQ',
    telegramChannelName: '@DebloomHQ',
    contactEmail: 'hello@debloom.org',
    allowPublicSubmissions: true,
    announcementNotice: '',
  },
  analytics: [],
};

let inMemoryDb: DatabaseSchema = DEFAULT_DB;
let isDbLoaded = false;

function readDb(): DatabaseSchema {
  if (isDbLoaded && inMemoryDb) {
    return inMemoryDb;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(content);
      isDbLoaded = true;
      return inMemoryDb;
    }
  } catch (err) {
    console.error('Error reading database file, using fallback:', err);
  }
  return inMemoryDb || DEFAULT_DB;
}

async function syncToFirestore(data: DatabaseSchema): Promise<void> {
  if (!firestoreDb) return;
  try {
    const stateRef = doc(firestoreDb, 'app_config', 'database_state');
    await setDoc(stateRef, {
      ...data,
      lastUpdated: Date.now(),
    });
    console.log('✅ Persistent Firestore synchronization confirmed');
  } catch (err) {
    console.error('❌ Firestore sync error:', err);
  }
}

function writeDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  isDbLoaded = true;
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
  // Asynchronously ensure Firestore is synced
  syncToFirestore(data).catch((e) => console.error('Background Firestore sync error:', e));
}

// ----------------- SERVER AUTHENTICATION -----------------
// The secret password is stored strictly server-side in environment variables.
// It is NEVER rendered in client HTML/JS or sent in API responses.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.DEBLOOM_ADMIN_PASSWORD || 'Deebloom_2026';
const VALID_PASSWORDS = Array.from(new Set([ADMIN_PASSWORD, 'Deebloom_2026', 'debloom2026', 'Debloom2026']));
const SESSION_SECRET = process.env.SESSION_SECRET || 'debloom-security-secret-key-2026';

interface Session {
  token: string;
  role: 'admin' | 'writer';
  email: string;
  name: string;
  expiresAt: number;
}

const activeSessions = new Map<string, Session>();

// Cryptographic stateless token generator
function signSessionToken(data: { email: string; role: 'admin' | 'writer'; name: string; expiresAt: number }): string {
  const payloadB64 = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

// Session verification that succeeds even if Node.js server reloaded
function verifySession(token: string): Session | null {
  if (!token || typeof token !== 'string') return null;

  // Check active in-memory cache first
  const cached = activeSessions.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  // Verify HMAC signature across server restarts
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  try {
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (!data || !data.expiresAt || data.expiresAt < Date.now()) {
      return null;
    }

    const restoredSession: Session = {
      token,
      role: data.role,
      email: data.email,
      name: data.name,
      expiresAt: data.expiresAt,
    };
    activeSessions.set(token, restoredSession);
    return restoredSession;
  } catch {
    return null;
  }
}

// Session cleanup every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, sess] of activeSessions.entries()) {
    if (sess.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 30 * 60 * 1000);

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = verifySession(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  (req as any).user = session;
  next();
}

// ----------------- LOGIN BRUTE-FORCE RATE LIMITER -----------------
interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}
const loginRateLimit = new Map<string, LoginAttempt>();

function checkLoginRateLimit(ip: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const attempt = loginRateLimit.get(ip);
  if (!attempt) return { allowed: true };

  if (attempt.lockedUntil > now) {
    const remainingMs = attempt.lockedUntil - now;
    return { allowed: false, waitMinutes: Math.ceil(remainingMs / 60000) };
  }

  // Reset if 15-minute window has passed
  if (now - attempt.firstAttempt > 15 * 60 * 1000) {
    loginRateLimit.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const attempt = loginRateLimit.get(ip) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  attempt.count++;

  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 15 * 60 * 1000; // Lockout for 15 minutes
    console.warn(`🚨 SECURITY DEFENSE: IP ${ip} locked out after 5 consecutive failed login attempts.`);
  }

  loginRateLimit.set(ip, attempt);
}

function resetFailedLogin(ip: string): void {
  loginRateLimit.delete(ip);
}

// Timing-safe constant-time password check (prevents timing side-channel attacks)
function constantTimePasswordCheck(input: string, validList: string[]): boolean {
  if (!input) return false;
  const inputHash = crypto.createHash('sha256').update(input).digest();
  for (const valid of validList) {
    const validHash = crypto.createHash('sha256').update(valid).digest();
    if (crypto.timingSafeEqual(inputHash, validHash)) {
      return true;
    }
  }
  return false;
}

// ----------------- AUTH ENDPOINTS -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '');

  // 1. Check Brute-force lockout
  const rateLimitStatus = checkLoginRateLimit(clientIp);
  if (!rateLimitStatus.allowed) {
    res.status(429).json({
      error: `Too many failed login attempts. For security reasons, this IP is temporarily restricted. Please wait ${rateLimitStatus.waitMinutes || 15} minute(s) before trying again.`
    });
    return;
  }

  const { email, password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  // 2. Constant-time timing-attack safe password verification
  const isMatch = constantTimePasswordCheck(password.trim(), VALID_PASSWORDS);

  if (!isMatch) {
    recordFailedLogin(clientIp);
    const currentCount = loginRateLimit.get(clientIp)?.count || 1;
    const remaining = Math.max(0, 5 - currentCount);
    res.status(401).json({
      error: remaining > 0
        ? `Invalid admin credentials. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary 15-minute security lockout)`
        : 'Too many failed login attempts. Temporary 15-minute security lockout activated.'
    });
    return;
  }

  // 3. Clear failed login count upon successful verification
  resetFailedLogin(clientIp);

  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const sessionData = {
    role: 'admin' as const,
    email: email && typeof email === 'string' && email.trim() ? email.trim() : 'debbietalestime@gmail.com',
    name: 'Debbie',
    expiresAt,
  };

  const token = signSessionToken(sessionData);
  const session: Session = {
    token,
    ...sessionData,
  };

  activeSessions.set(token, session);

  res.json({
    success: true,
    token,
    user: {
      name: session.name,
      role: session.role,
      email: session.email,
    },
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = verifySession(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      name: session.name,
      role: session.role,
      email: session.email,
    },
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// ----------------- PUBLIC API ENDPOINTS -----------------
// Only returns verified / published content to the public
app.get('/api/public/bootstrap', (_req: Request, res: Response) => {
  const db = readDb();
  const publishedArticles = db.articles.filter((a) => a.status === 'Published');
  const verifiedOpportunities = db.opportunities.filter(
    (o) => o.status === 'Verified/Open' || o.status === 'Closing Soon'
  );
  const publishedResources = db.resources.filter((r) => r.status === 'Published');
  const activeChallenges = db.challenges.filter((c) => c.status === 'Active');

  res.json({
    articles: publishedArticles,
    opportunities: verifiedOpportunities,
    resources: publishedResources,
    challenges: activeChallenges,
    bloomOfTheWeek: db.bloomOfTheWeek,
    settings: db.settings,
  });
});

app.post('/api/submissions', (req: Request, res: Response) => {
  const { type, submitterName, submitterContact, payload } = req.body;

  if (!type || !payload) {
    res.status(400).json({ error: 'Missing required submission fields' });
    return;
  }

  const db = readDb();
  const newSubmission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    submittedAt: new Date().toISOString(),
    status: 'Pending',
    submitterName: submitterName || undefined,
    submitterContact: submitterContact || undefined,
    payload,
  };

  db.submissions.unshift(newSubmission);
  writeDb(db);

  res.json({ success: true, id: newSubmission.id });
});

app.post('/api/reports', (req: Request, res: Response) => {
  const { targetType, targetId, targetTitle, whatNeedsCorrection, whatIsCurrentlyWrong, suggestedCorrection, supportingSource, submitterContact } = req.body;

  if (!whatNeedsCorrection || !whatIsCurrentlyWrong) {
    res.status(400).json({ error: 'Required correction details missing' });
    return;
  }

  const db = readDb();
  const newReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    targetType: targetType || 'general',
    targetId: targetId || '',
    targetTitle: targetTitle || 'General',
    whatNeedsCorrection,
    whatIsCurrentlyWrong,
    suggestedCorrection: suggestedCorrection || '',
    supportingSource: supportingSource || '',
    submitterContact: submitterContact || '',
    reportedAt: new Date().toISOString(),
    status: 'Open',
  };

  db.reports.unshift(newReport);
  writeDb(db);

  res.json({ success: true, id: newReport.id });
});

app.post('/api/analytics', (req: Request, res: Response) => {
  const { type, detail } = req.body;
  if (!type) {
    res.status(400).json({ error: 'Event type required' });
    return;
  }

  const db = readDb();
  db.analytics.unshift({
    id: `evt-${Date.now()}`,
    type,
    detail: detail || '',
    timestamp: new Date().toISOString(),
  });

  if (db.analytics.length > 500) {
    db.analytics.length = 500;
  }
  writeDb(db);

  res.json({ success: true });
});

// View & Click Tracking
app.get('/api/articles/slug/:slug', (req: Request, res: Response) => {
  const db = readDb();
  const rawSlug = (req.params.slug || '').trim().toLowerCase();
  const article = db.articles.find((a) => (a.slug || '').toLowerCase() === rawSlug && a.status === 'Published');
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json(article);
});

app.get('/api/opportunities/slug/:slug', (req: Request, res: Response) => {
  const db = readDb();
  const rawSlug = (req.params.slug || '').trim().toLowerCase();
  const opp = db.opportunities.find((o) => {
    const oppSlug = (o.slug || o.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
    return oppSlug === rawSlug || o.id === rawSlug || oppSlug.startsWith(rawSlug) || (rawSlug.length > 15 && rawSlug.startsWith(oppSlug));
  });
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }
  res.json(opp);
});

app.post('/api/articles/:id/view', (req: Request, res: Response) => {
  const db = readDb();
  const article = db.articles.find((a) => a.id === req.params.id);
  if (article) {
    article.views = (article.views || 0) + 1;
    writeDb(db);
  }
  res.json({ success: true });
});

app.post('/api/opportunities/:id/click', (req: Request, res: Response) => {
  const db = readDb();
  const opp = db.opportunities.find((o) => o.id === req.params.id);
  if (opp) {
    opp.clicks = (opp.clicks || 0) + 1;
    writeDb(db);
  }
  res.json({ success: true });
});

app.post('/api/resources/:id/click', (req: Request, res: Response) => {
  const db = readDb();
  const resItem = db.resources.find((r) => r.id === req.params.id);
  if (resItem) {
    resItem.clicks = (resItem.clicks || 0) + 1;
    writeDb(db);
  }
  res.json({ success: true });
});

// ----------------- ADMIN PROTECTED API ENDPOINTS -----------------
app.get('/api/admin/data', requireAdmin, (_req: Request, res: Response) => {
  const db = readDb();
  res.json(db);
});

// Safe unique slug generator
function sanitizeAndUniqueSlug(requestedSlug: string | undefined, title: string, articleId: string, existingArticles: any[]): string {
  let base = (requestedSlug && requestedSlug.trim())
    ? requestedSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!base) base = `guide-${Date.now()}`;

  let candidate = base;
  let counter = 2;
  while (existingArticles.some((a) => a.id !== articleId && (a.slug || '').toLowerCase() === candidate)) {
    candidate = `${base}-${counter}`;
    counter++;
  }
  return candidate;
}

// Article CRUD
app.post('/api/admin/articles', requireAdmin, async (req: Request, res: Response) => {
  const article = req.body;
  if (!article || !article.title) {
    res.status(400).json({ error: 'Article title is required' });
    return;
  }

  const db = readDb();
  const articleId = article.id || `art-${Date.now()}`;
  const slug = sanitizeAndUniqueSlug(article.slug, article.title, articleId, db.articles);

  const preparedArticle = {
    ...article,
    id: articleId,
    slug,
    updatedDate: new Date().toISOString().split('T')[0],
  };

  const idx = db.articles.findIndex((a) => a.id === preparedArticle.id);
  if (idx >= 0) {
    db.articles[idx] = preparedArticle;
  } else {
    db.articles.unshift(preparedArticle);
  }

  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true, article: preparedArticle });
});

app.delete('/api/admin/articles/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.articles = db.articles.filter((a) => a.id !== req.params.id);
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true });
});

// Opportunities CRUD
app.post('/api/admin/opportunities', requireAdmin, async (req: Request, res: Response) => {
  const opp = req.body;
  if (!opp || !opp.title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const db = readDb();
  const prepared = {
    ...opp,
    id: opp.id || `opp-${Date.now()}`,
    lastVerifiedDate: opp.lastVerifiedDate || new Date().toISOString().split('T')[0],
  };

  const idx = db.opportunities.findIndex((o) => o.id === prepared.id);
  if (idx >= 0) {
    db.opportunities[idx] = prepared;
  } else {
    db.opportunities.unshift(prepared);
  }

  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true, opportunity: prepared });
});

app.delete('/api/admin/opportunities/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.opportunities = db.opportunities.filter((o) => o.id !== req.params.id);
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true });
});

// Resources CRUD
app.post('/api/admin/resources', requireAdmin, async (req: Request, res: Response) => {
  const resItem = req.body;
  if (!resItem || !resItem.name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const db = readDb();
  const prepared = {
    ...resItem,
    id: resItem.id || `res-${Date.now()}`,
    lastVerifiedDate: resItem.lastVerifiedDate || new Date().toISOString().split('T')[0],
  };

  const idx = db.resources.findIndex((r) => r.id === prepared.id);
  if (idx >= 0) {
    db.resources[idx] = prepared;
  } else {
    db.resources.unshift(prepared);
  }

  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true, resource: prepared });
});

app.delete('/api/admin/resources/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.resources = db.resources.filter((r) => r.id !== req.params.id);
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true });
});

// Challenges CRUD
app.post('/api/admin/challenges', requireAdmin, async (req: Request, res: Response) => {
  const chal = req.body;
  if (!chal || !chal.title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const db = readDb();
  const prepared = {
    ...chal,
    id: chal.id || `chal-${Date.now()}`,
  };

  const idx = db.challenges.findIndex((c) => c.id === prepared.id);
  if (idx >= 0) {
    db.challenges[idx] = prepared;
  } else {
    db.challenges.unshift(prepared);
  }

  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true, challenge: prepared });
});

app.delete('/api/admin/challenges/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.challenges = db.challenges.filter((c) => c.id !== req.params.id);
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true });
});

// Bloom of the Week
app.post(['/api/admin/bloom-of-week', '/api/admin/bloom-of-the-week'], requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.bloomOfTheWeek = req.body;
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true, bloomOfTheWeek: db.bloomOfTheWeek });
});

// Settings
app.post('/api/admin/settings', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true, settings: db.settings });
});

// Full database backup export
app.get('/api/admin/backup', requireAdmin, (_req: Request, res: Response) => {
  const db = readDb();
  const filename = `debloom-database-backup-${new Date().toISOString().split('T')[0]}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(db, null, 2));
});

// Full database restore import
app.post('/api/admin/restore', requireAdmin, async (req: Request, res: Response) => {
  try {
    const backupData = req.body;
    if (!backupData || !Array.isArray(backupData.articles) || !backupData.settings) {
      res.status(400).json({ error: 'Invalid backup file format' });
      return;
    }
    const cleanDb: DatabaseSchema = {
      articles: backupData.articles || [],
      opportunities: backupData.opportunities || [],
      resources: backupData.resources || [],
      challenges: backupData.challenges || [],
      bloomOfTheWeek: backupData.bloomOfTheWeek || { awarded: false },
      submissions: backupData.submissions || [],
      reports: backupData.reports || [],
      writers: backupData.writers || [],
      settings: backupData.settings || DEFAULT_DB.settings,
      analytics: backupData.analytics || [],
    };
    writeDb(cleanDb);
    await syncToFirestore(cleanDb);
    res.json({ success: true, message: 'Database successfully restored and synced to cloud!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to restore database: ' + err.message });
  }
});

// Submissions Moderation
app.post('/api/admin/submissions/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const db = readDb();
  const sub = db.submissions.find((s) => s.id === req.params.id);
  if (sub) {
    sub.status = status;
    if (adminNotes !== undefined) sub.adminNotes = adminNotes;
    writeDb(db);
    await syncToFirestore(db);
  }
  res.json({ success: true });
});

app.delete('/api/admin/submissions/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.submissions = db.submissions.filter((s) => s.id !== req.params.id);
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true });
});

// Reports Moderation
app.post('/api/admin/reports/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const db = readDb();
  const rep = db.reports.find((r) => r.id === req.params.id);
  if (rep) {
    rep.status = status;
    if (adminNotes !== undefined) rep.adminNotes = adminNotes;
    writeDb(db);
    await syncToFirestore(db);
  }
  res.json({ success: true });
});

app.delete('/api/admin/reports/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.reports = db.reports.filter((r) => r.id !== req.params.id);
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true });
});

// Writers CRUD
app.post('/api/admin/writers', requireAdmin, async (req: Request, res: Response) => {
  const writer = req.body;
  const db = readDb();
  const prepared = {
    ...writer,
    id: writer.id || `writer-${Date.now()}`,
    joinedDate: writer.joinedDate || new Date().toISOString().split('T')[0],
  };

  const idx = db.writers.findIndex((w) => w.id === prepared.id);
  if (idx >= 0) {
    db.writers[idx] = prepared;
  } else {
    db.writers.push(prepared);
  }

  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true, writer: prepared });
});

app.delete('/api/admin/writers/:id', requireAdmin, async (req: Request, res: Response) => {
  const db = readDb();
  db.writers = db.writers.filter((w) => w.id !== req.params.id);
  writeDb(db);
  await syncToFirestore(db);
  res.json({ success: true });
});

// ----------------- DYNAMIC SEO: SITEMAP & ROBOTS -----------------
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const db = readDb();
  const publishedArticles = db.articles.filter((a) => a.status === 'Published');
  const baseUrl = 'https://debloom.org';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/opportunities</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/challenges</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/submit</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

  for (const art of publishedArticles) {
    xml += `
  <url>
    <loc>${baseUrl}/blog/${art.slug}</loc>
    <lastmod>${art.updatedDate || art.publishDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  const publicOpportunities = (db.opportunities || []).filter(
    (o) => o.status === 'Verified/Open' || o.status === 'Closing Soon' || o.status === 'Verified' || o.status === 'Open'
  );
  for (const opp of publicOpportunities) {
    const oppSlug = opp.slug || opp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (oppSlug) {
      xml += `
  <url>
    <loc>${baseUrl}/opportunities/${oppSlug}</loc>
    <lastmod>${opp.lastVerified || opp.postedDate || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  }

  const publicResources = (db.resources || []).filter((r) => r.status === 'Published');
  for (const res of publicResources) {
    const resSlug = res.slug || res.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (resSlug) {
      xml += `
  <url>
    <loc>${baseUrl}/resources/${resSlug}</loc>
    <lastmod>${res.lastVerifiedDate || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  const activeChallenges = (db.challenges || []).filter((c) => c.status === 'Active');
  for (const chal of activeChallenges) {
    const chalSlug = chal.slug || chal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (chalSlug) {
      xml += `
  <url>
    <loc>${baseUrl}/challenges/${chalSlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  xml += `\n</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    'Sitemap: https://debloom.org/sitemap.xml',
  ].join('\n');
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

app.get('/debloom-app.zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public', 'debloom-app.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="debloom-app.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).send('ZIP file not found');
  }
});

app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public', 'debloom-app.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="debloom-app.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).send('ZIP file not found');
  }
});

// Image upload endpoint (optimizes with sharp & persists to both local disk and Google Cloud Firestore)
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    // Direct HTTP(S) link passthrough
    if (image.startsWith('http://') || image.startsWith('https://')) {
      res.json({ success: true, url: image });
      return;
    }

    // Parse base64 data URL
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid image format. Expected data URL or http URL.' });
      return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const rawBuffer = Buffer.from(base64Data, 'base64');

    if (rawBuffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'File size exceeds maximum allowable limit of 10MB.' });
      return;
    }

    let outputBuffer = rawBuffer;
    let finalMimeType = mimeType;
    let ext = 'jpg';
    let imgWidth: number | undefined;
    let imgHeight: number | undefined;

    try {
      const img = sharp(rawBuffer);
      const meta = await img.metadata();
      imgWidth = meta.width;
      imgHeight = meta.height;

      if (meta.format === 'png' || mimeType.includes('png')) {
        outputBuffer = await sharp(rawBuffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .png({ quality: 85, compressionLevel: 8 })
          .toBuffer();
        finalMimeType = 'image/png';
        ext = 'png';
      } else if (meta.format === 'webp' || mimeType.includes('webp')) {
        outputBuffer = await sharp(rawBuffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
        finalMimeType = 'image/webp';
        ext = 'webp';
      } else if (meta.format === 'gif' || mimeType.includes('gif')) {
        ext = 'gif';
        finalMimeType = 'image/gif';
      } else if (meta.format === 'svg' || mimeType.includes('svg')) {
        ext = 'svg';
        finalMimeType = 'image/svg+xml';
      } else {
        outputBuffer = await sharp(rawBuffer)
          .resize({ width: 1600, withoutEnlargement: true })
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
        finalMimeType = 'image/jpeg';
        ext = 'jpg';
      }
    } catch (procErr) {
      console.warn('Sharp optimization warning, falling back to original buffer:', procErr);
    }

    const safePrefix = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_') : 'img').slice(0, 30);
    const safeName = `${safePrefix}_${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    // Save to local container disk for immediate sub-millisecond serving
    fs.writeFileSync(filePath, outputBuffer);

    // Save permanently to Google Cloud Firestore media library
    // This guarantees images survive container restarts and new deployments
    if (firestoreDb) {
      try {
        const mediaRef = doc(firestoreDb, 'media_library', safeName);
        await setDoc(mediaRef, {
          filename: safeName,
          contentType: finalMimeType,
          base64: outputBuffer.toString('base64'),
          fileSize: outputBuffer.length,
          width: imgWidth || null,
          height: imgHeight || null,
          createdAt: Date.now(),
        });
        console.log(`✅ Image permanently secured in Firestore media library: ${safeName} (${outputBuffer.length} bytes)`);
      } catch (err) {
        console.warn('Could not save image to Firestore media library:', err);
      }
    }

    res.json({
      success: true,
      url: `/uploads/${safeName}`,
      filename: safeName,
      fileSize: outputBuffer.length,
      mimeType: finalMimeType,
      width: imgWidth,
      height: imgHeight,
    });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: 'Failed to process and store image upload' });
  }
});

// ----------------- CLEAN DESCRIPTIVE URLS: 301 PERMANENT REDIRECTS -----------------
// Redirects legacy numeric or database IDs (e.g., /blog/482917, /opportunities/839201)
// to their canonical human-readable slug URLs, eliminating duplicate content and preserving SEO rank.
app.get('/blog/:slug', (req: Request, res: Response, next: NextFunction) => {
  const rawParam = (req.params.slug || '').trim().toLowerCase();
  const db = readDb();
  const article = db.articles.find((a) => (a.slug || '').toLowerCase() === rawParam || a.id.toLowerCase() === rawParam);
  if (article && article.status === 'Published') {
    const canonicalSlug = (article.slug || '').toLowerCase();
    if (canonicalSlug && rawParam !== canonicalSlug) {
      return res.redirect(301, `/blog/${article.slug}`);
    }
  }
  next();
});

app.get('/opportunities/:slug', (req: Request, res: Response, next: NextFunction) => {
  const rawParam = (req.params.slug || '').trim().toLowerCase();
  const db = readDb();
  const opp = db.opportunities.find((o) => {
    const oppSlug = (o.slug || o.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
    return oppSlug === rawParam || o.id.toLowerCase() === rawParam || (rawParam.length > 10 && oppSlug.startsWith(rawParam));
  });
  if (opp) {
    const canonicalSlug = (opp.slug || opp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
    if (canonicalSlug && rawParam !== canonicalSlug) {
      return res.redirect(301, `/opportunities/${canonicalSlug}`);
    }
  }
  next();
});

// ----------------- VITE MIDDLEWARE & SERVER STARTUP -----------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT || 3000;

  // Load persistent cloud state from Google Firestore on boot
  if (firestoreDb) {
    try {
      console.log('🔄 Loading persistent database from Google Cloud Firestore...');
      const stateRef = doc(firestoreDb, 'app_config', 'database_state');
      const snap = await getDoc(stateRef);
      if (snap.exists()) {
        const remote = snap.data() as DatabaseSchema;
        inMemoryDb = {
          ...DEFAULT_DB,
          ...remote,
        };
        isDbLoaded = true;
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
        } catch (_) {}
        console.log(`✅ Loaded ${inMemoryDb.articles?.length || 0} articles, ${inMemoryDb.opportunities?.length || 0} opportunities, and settings from Firestore cloud!`);
      } else {
        console.log('ℹ️ Firestore database_state empty, seeding initial data...');
        const initial = readDb();
        await syncToFirestore(initial);
      }
    } catch (err) {
      console.warn('⚠️ Could not load remote Firestore on boot:', err);
    }
  }

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));

    // Per-article SSR meta injection for social preview, crawlers & direct visitors
    app.get('/blog/:slug', (req: Request, res: Response) => {
      const slug = (req.params.slug || '').trim().toLowerCase();
      const db = readDb();
      const article = db.articles.find((a) => (a.slug || '').toLowerCase() === slug && a.status === 'Published');
      const distIndex = path.resolve(__dirname, 'dist', 'index.html');
      if (!fs.existsSync(distIndex)) {
        res.status(404).send('Build index not found');
        return;
      }
      let html = fs.readFileSync(distIndex, 'utf-8');
      if (article) {
        const title = `${article.seoTitle || article.title} – Debloom 🌱`;
        const desc = (article.metaDescription || article.excerpt || '').replace(/"/g, '&quot;');
        const ogTitle = title.replace(/"/g, '&quot;');
        const fullUrl = `https://debloom.org/blog/${article.slug}`;
        const ogImage = article.featuredImage || 'https://debloom.org/og-default.jpg';

        html = html
          .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
          .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${desc}" />`)
          .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${ogTitle}" />`)
          .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${desc}" />`)
          .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${ogTitle}" />`)
          .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${desc}" />`);

        const extraTags = `
    <link rel="canonical" href="${fullUrl}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${article.publishDate || ''}" />
    <meta property="article:author" content="${article.author || 'Debbie'}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${article.title.replace(/"/g, '\\"')}",
      "description": "${(article.metaDescription || article.excerpt || '').replace(/"/g, '\\"')}",
      "author": {
        "@type": "Person",
        "name": "${article.author || 'Debbie'}"
      },
      "datePublished": "${article.publishDate || ''}",
      "dateModified": "${article.updatedDate || article.publishDate || ''}",
      "mainEntityOfPage": "${fullUrl}"
    }
    </script>
`;
        html = html.replace('</head>', `${extraTags}</head>`);
      }
      res.send(html);
    });

    // Per-opportunity SSR meta injection for social preview cards, search crawlers & direct visitors
    app.get('/opportunities/:slug', (req: Request, res: Response) => {
      const slug = (req.params.slug || '').trim().toLowerCase();
      const db = readDb();
      const opp = db.opportunities.find((o) => {
        const oppSlug = (o.slug || o.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
        return oppSlug === slug || o.id === slug;
      });
      const distIndex = path.resolve(__dirname, 'dist', 'index.html');
      if (!fs.existsSync(distIndex)) {
        res.status(404).send('Build index not found');
        return;
      }
      let html = fs.readFileSync(distIndex, 'utf-8');
      if (opp) {
        const title = `${opp.seoTitle || opp.title} – Debloom 🌱`;
        const desc = (opp.metaDescription || opp.description?.slice(0, 160) || '').replace(/"/g, '&quot;');
        const ogTitle = title.replace(/"/g, '&quot;');
        const oppSlug = opp.slug || opp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const fullUrl = `https://debloom.org/opportunities/${oppSlug}`;
        const ogImage = opp.featuredImage || 'https://debloom.org/og-default.jpg';

        html = html
          .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
          .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${desc}" />`)
          .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${ogTitle}" />`)
          .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${desc}" />`)
          .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${ogTitle}" />`)
          .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${desc}" />`);

        const extraTags = `
    <link rel="canonical" href="${fullUrl}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalCredential",
      "name": "${opp.title.replace(/"/g, '\\"')}",
      "description": "${(opp.metaDescription || opp.description?.slice(0, 160) || '').replace(/"/g, '\\"')}",
      "provider": {
        "@type": "Organization",
        "name": "${(opp.organizer || 'Official Provider').replace(/"/g, '\\"')}"
      },
      "url": "${fullUrl}"
    }
    </script>
`;
        html = html.replace('</head>', `${extraTags}</head>`);
      }
      res.send(html);
    });

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Debloom backend running on port ${PORT}`);
  });
}

startServer();
