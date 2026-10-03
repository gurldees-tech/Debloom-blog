import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, using fallback:', err);
    return DEFAULT_DB;
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// ----------------- SERVER AUTHENTICATION -----------------
// The secret password is stored strictly server-side in environment variables.
// It is NEVER rendered in client HTML/JS or sent in API responses.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.DEBLOOM_ADMIN_PASSWORD || 'debloom2026';
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

// ----------------- AUTH ENDPOINTS -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  // Constant-time check or strict verification
  const isMatch = password === ADMIN_PASSWORD;

  if (!isMatch) {
    res.status(401).json({ error: 'Invalid admin credentials' });
    return;
  }

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
app.post('/api/admin/articles', requireAdmin, (req: Request, res: Response) => {
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
  res.json({ success: true, article: preparedArticle });
});

app.delete('/api/admin/articles/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.articles = db.articles.filter((a) => a.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Opportunities CRUD
app.post('/api/admin/opportunities', requireAdmin, (req: Request, res: Response) => {
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
  res.json({ success: true, opportunity: prepared });
});

app.delete('/api/admin/opportunities/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.opportunities = db.opportunities.filter((o) => o.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Resources CRUD
app.post('/api/admin/resources', requireAdmin, (req: Request, res: Response) => {
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
  res.json({ success: true, resource: prepared });
});

app.delete('/api/admin/resources/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.resources = db.resources.filter((r) => r.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Challenges CRUD
app.post('/api/admin/challenges', requireAdmin, (req: Request, res: Response) => {
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
  res.json({ success: true, challenge: prepared });
});

app.delete('/api/admin/challenges/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.challenges = db.challenges.filter((c) => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Bloom of the Week (accepts both route spellings)
app.post(['/api/admin/bloom-of-week', '/api/admin/bloom-of-the-week'], requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.bloomOfTheWeek = req.body;
  writeDb(db);
  res.json({ success: true, bloomOfTheWeek: db.bloomOfTheWeek });
});

// Settings
app.post('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json({ success: true, settings: db.settings });
});

// Submissions Moderation
app.post('/api/admin/submissions/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const db = readDb();
  const sub = db.submissions.find((s) => s.id === req.params.id);
  if (sub) {
    sub.status = status;
    if (adminNotes !== undefined) sub.adminNotes = adminNotes;
    writeDb(db);
  }
  res.json({ success: true });
});

app.delete('/api/admin/submissions/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.submissions = db.submissions.filter((s) => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Reports Moderation
app.post('/api/admin/reports/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const db = readDb();
  const rep = db.reports.find((r) => r.id === req.params.id);
  if (rep) {
    rep.status = status;
    if (adminNotes !== undefined) rep.adminNotes = adminNotes;
    writeDb(db);
  }
  res.json({ success: true });
});

app.delete('/api/admin/reports/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.reports = db.reports.filter((r) => r.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Writers CRUD
app.post('/api/admin/writers', requireAdmin, (req: Request, res: Response) => {
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
  res.json({ success: true, writer: prepared });
});

app.delete('/api/admin/writers/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.writers = db.writers.filter((w) => w.id !== req.params.id);
  writeDb(db);
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

// Image upload endpoint (supports base64 data URLs)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    // Direct HTTP(S) link passthrough
    if (image.startsWith('http://') || image.startsWith('https://')) {
      res.json({ url: image });
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
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('svg')) ext = 'svg';

    const safePrefix = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_') : 'img').slice(0, 30);
    const safeName = `${safePrefix}_${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/${safeName}` });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process image upload' });
  }
});

// ----------------- VITE MIDDLEWARE & SERVER STARTUP -----------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT || 3000;

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

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Debloom backend running on port ${PORT}`);
  });
}

startServer();
