import {
  Article,
  Opportunity,
  Resource,
  BloomChallenge,
  BloomOfTheWeek,
  SiteSettings,
  Writer,
  UserSubmission,
  ContentReport,
  AnalyticsEvent,
  AuthUser,
  NewsletterSubscriber
} from '../types';
import {
  INITIAL_ARTICLES,
  INITIAL_OPPORTUNITIES,
  INITIAL_RESOURCES,
  INITIAL_CHALLENGES,
  INITIAL_BLOOM_OF_THE_WEEK,
  INITIAL_SETTINGS,
  INITIAL_WRITERS,
  INITIAL_SUBMISSIONS,
  INITIAL_REPORTS
} from '../data/initialData';

// Storage keys version 2 (cleanses old unauthorized demo articles)
const STORAGE_KEYS = {
  ARTICLES: 'debloom_v2_articles',
  OPPORTUNITIES: 'debloom_v2_opportunities',
  RESOURCES: 'debloom_v2_resources',
  CHALLENGES: 'debloom_v2_challenges',
  BLOOM_OF_WEEK: 'debloom_v2_bloom_of_week',
  SETTINGS: 'debloom_v2_settings',
  WRITERS: 'debloom_v2_writers',
  SUBMISSIONS: 'debloom_v2_submissions',
  REPORTS: 'debloom_v2_reports',
  ANALYTICS: 'debloom_v2_analytics',
  AUTH: 'debloom_v2_auth_user',
  SUBSCRIBERS: 'debloom_v2_subscribers'
};

// Legacy keys to remove
const LEGACY_KEYS = [
  'debloom_articles_v1',
  'debloom_opportunities_v1',
  'debloom_resources_v1',
  'debloom_challenges_v1',
  'debloom_bloom_of_week_v1',
  'debloom_writers_v1',
  'debloom_submissions_v1',
  'debloom_reports_v1',
  'debloom_auth_user_v1'
];

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

function getAuthHeader(): Record<string, string> {
  const user = safeGet<AuthUser | null>(STORAGE_KEYS.AUTH, null);
  if (user && user.token) {
    return {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
}

// Initialize default storage data & purge legacy unapproved articles
export function initializeStorage(): void {
  // Purge legacy v1 storage keys that held unauthorized demo data
  LEGACY_KEYS.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch (_) {}
  });

  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    safeSet(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES)) {
    safeSet(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
    safeSet(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHALLENGES)) {
    safeSet(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOOM_OF_WEEK)) {
    safeSet(STORAGE_KEYS.BLOOM_OF_WEEK, INITIAL_BLOOM_OF_THE_WEEK);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WRITERS)) {
    safeSet(STORAGE_KEYS.WRITERS, INITIAL_WRITERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    safeSet(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    safeSet(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  // Attempt background sync from server database
  syncFromServer().catch(err => {
    console.warn('Initial server sync note:', err.message);
  });
}

// Synchronize with server persistent database
export async function syncFromServer(): Promise<void> {
  try {
    const user = safeGet<AuthUser | null>(STORAGE_KEYS.AUTH, null);
    if (user && user.token) {
      // Admin sync
      const res = await fetch('/api/admin/data', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.articles)) safeSet(STORAGE_KEYS.ARTICLES, data.articles);
        if (Array.isArray(data.opportunities)) safeSet(STORAGE_KEYS.OPPORTUNITIES, data.opportunities);
        if (Array.isArray(data.resources)) safeSet(STORAGE_KEYS.RESOURCES, data.resources);
        if (Array.isArray(data.challenges)) safeSet(STORAGE_KEYS.CHALLENGES, data.challenges);
        if (data.bloomOfTheWeek) safeSet(STORAGE_KEYS.BLOOM_OF_WEEK, data.bloomOfTheWeek);
        if (data.settings) safeSet(STORAGE_KEYS.SETTINGS, data.settings);
        if (Array.isArray(data.submissions)) safeSet(STORAGE_KEYS.SUBMISSIONS, data.submissions);
        if (Array.isArray(data.reports)) safeSet(STORAGE_KEYS.REPORTS, data.reports);
        if (Array.isArray(data.writers)) safeSet(STORAGE_KEYS.WRITERS, data.writers);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('debloom-data-synced'));
        }
        return;
      }
    }

    // Public bootstrap sync
    const pubRes = await fetch('/api/public/bootstrap');
    if (pubRes.ok) {
      const pubData = await pubRes.json();
      if (Array.isArray(pubData.articles)) safeSet(STORAGE_KEYS.ARTICLES, pubData.articles);
      if (Array.isArray(pubData.opportunities)) safeSet(STORAGE_KEYS.OPPORTUNITIES, pubData.opportunities);
      if (Array.isArray(pubData.resources)) safeSet(STORAGE_KEYS.RESOURCES, pubData.resources);
      if (Array.isArray(pubData.challenges)) safeSet(STORAGE_KEYS.CHALLENGES, pubData.challenges);
      if (pubData.bloomOfTheWeek) safeSet(STORAGE_KEYS.BLOOM_OF_WEEK, pubData.bloomOfTheWeek);
      if (pubData.settings) safeSet(STORAGE_KEYS.SETTINGS, pubData.settings);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('debloom-data-synced'));
      }
    }
  } catch (e) {
    // Graceful offline fallback
    console.debug('Server sync offline or unavailable, continuing with local store');
  }
}

// ================= ARTICLES =================
export const articleService = {
  getAll: (includeUnpublished = false): Article[] => {
    const all = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
    if (includeUnpublished) return all;
    return all.filter(a => a.status === 'Published');
  },
  getBySlug: (slug: string): Article | undefined => {
    const all = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
    const clean = (slug || '').trim().toLowerCase();
    return all.find(a => (a.slug || '').toLowerCase() === clean);
  },
  getById: (id: string): Article | undefined => {
    const all = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
    return all.find(a => a.id === id);
  },
  fetchBySlug: async (slug: string): Promise<Article | null> => {
    const clean = (slug || '').trim().toLowerCase();
    const cached = articleService.getBySlug(clean);
    if (cached) return cached;

    try {
      const res = await fetch(`/api/articles/slug/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const article: Article = await res.json();
        const all = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
        const idx = all.findIndex(a => a.id === article.id);
        if (idx >= 0) all[idx] = article;
        else all.unshift(article);
        safeSet(STORAGE_KEYS.ARTICLES, all);
        return article;
      }
    } catch (e) {
      console.warn('Network error loading article by slug:', e);
    }
    return null;
  },
  save: async (article: Article): Promise<Article> => {
    const all = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
    const index = all.findIndex(a => a.id === article.id);
    const now = new Date().toISOString().split('T')[0];
    const prepared: Article = {
      ...article,
      createdDate: article.createdDate || now,
      updatedDate: now,
      publishDate: article.status === 'Published' ? (article.publishDate || now) : (article.publishDate || now),
    };

    // Persist to server backend first to ensure permanent database consistency
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(prepared),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save article to server (${res.status})`);
    }

    const resJson = await res.json();
    const confirmed: Article = resJson.article || prepared;

    if (index >= 0) {
      all[index] = confirmed;
    } else {
      all.unshift(confirmed);
    }
    safeSet(STORAGE_KEYS.ARTICLES, all);

    return confirmed;
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to delete article (${res.status})`);
    }

    const all = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
    const filtered = all.filter(a => a.id !== id);
    safeSet(STORAGE_KEYS.ARTICLES, filtered);
  },
  incrementViews: (id: string): void => {
    const all = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
    const item = all.find(a => a.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      safeSet(STORAGE_KEYS.ARTICLES, all);
      fetch(`/api/articles/${id}/view`, { method: 'POST' }).catch(() => {});
    }
  }
};

// ================= OPPORTUNITIES =================
export const opportunityService = {
  getAll: (includeUnverified = false): Opportunity[] => {
    const all = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    if (includeUnverified) return all;
    return all.filter(o => o.status === 'Verified/Open' || o.status === 'Closing Soon');
  },
  getById: (id: string): Opportunity | undefined => {
    const all = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    return all.find(o => o.id === id);
  },
  getBySlug: (slug: string): Opportunity | undefined => {
    const all = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const clean = (slug || '').trim().toLowerCase();
    return all.find(o => {
      const oppSlug = (o.slug || o.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
      return oppSlug === clean || o.id === slug || oppSlug.startsWith(clean) || (clean.length > 15 && clean.startsWith(oppSlug));
    });
  },
  fetchBySlug: async (slug: string): Promise<Opportunity | null> => {
    const clean = (slug || '').trim().toLowerCase();
    const cached = opportunityService.getBySlug(clean);
    if (cached) return cached;
    try {
      const res = await fetch(`/api/opportunities/slug/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const opp: Opportunity = await res.json();
        const all = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
        const idx = all.findIndex(o => o.id === opp.id);
        if (idx >= 0) all[idx] = opp;
        else all.unshift(opp);
        safeSet(STORAGE_KEYS.OPPORTUNITIES, all);
        return opp;
      }
    } catch (e) {
      console.warn('Network error loading opportunity by slug:', e);
    }
    return null;
  },
  save: async (opp: Opportunity): Promise<Opportunity> => {
    const res = await fetch('/api/admin/opportunities', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(opp),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save opportunity (${res.status})`);
    }

    const resJson = await res.json();
    const confirmed: Opportunity = resJson.opportunity || opp;

    const all = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const index = all.findIndex(o => o.id === confirmed.id);
    if (index >= 0) {
      all[index] = confirmed;
    } else {
      all.unshift(confirmed);
    }
    safeSet(STORAGE_KEYS.OPPORTUNITIES, all);

    return confirmed;
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/opportunities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to delete opportunity (${res.status})`);
    }

    const all = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const filtered = all.filter(o => o.id !== id);
    safeSet(STORAGE_KEYS.OPPORTUNITIES, filtered);
  },
  incrementClicks: (id: string): void => {
    const all = safeGet<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
    const item = all.find(o => o.id === id);
    if (item) {
      item.clicks = (item.clicks || 0) + 1;
      safeSet(STORAGE_KEYS.OPPORTUNITIES, all);
      fetch(`/api/opportunities/${id}/click`, { method: 'POST' }).catch(() => {});
    }
  }
};

// ================= RESOURCES =================
export const resourceService = {
  getAll: (includeDrafts = false): Resource[] => {
    const all = safeGet<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    if (includeDrafts) return all;
    return all.filter(r => r.status === 'Published');
  },
  getById: (id: string): Resource | undefined => {
    const all = safeGet<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    return all.find(r => r.id === id);
  },
  save: async (resItem: Resource): Promise<Resource> => {
    const res = await fetch('/api/admin/resources', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(resItem),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save resource (${res.status})`);
    }

    const resJson = await res.json();
    const confirmed: Resource = resJson.resource || resItem;

    const all = safeGet<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const index = all.findIndex(r => r.id === confirmed.id);
    if (index >= 0) {
      all[index] = confirmed;
    } else {
      all.unshift(confirmed);
    }
    safeSet(STORAGE_KEYS.RESOURCES, all);

    return confirmed;
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/resources/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to delete resource (${res.status})`);
    }

    const all = safeGet<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const filtered = all.filter(r => r.id !== id);
    safeSet(STORAGE_KEYS.RESOURCES, filtered);
  },
  incrementClicks: (id: string): void => {
    const all = safeGet<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const item = all.find(r => r.id === id);
    if (item) {
      item.clicks = (item.clicks || 0) + 1;
      safeSet(STORAGE_KEYS.RESOURCES, all);
      fetch(`/api/resources/${id}/click`, { method: 'POST' }).catch(() => {});
    }
  }
};

// ================= CHALLENGES =================
export const challengeService = {
  getAll: (includeDrafts = false): BloomChallenge[] => {
    const all = safeGet<BloomChallenge[]>(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
    if (includeDrafts) return all;
    return all.filter(c => c.status === 'Active');
  },
  getById: (id: string): BloomChallenge | undefined => {
    const all = safeGet<BloomChallenge[]>(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
    return all.find(c => c.id === id);
  },
  save: async (chal: BloomChallenge): Promise<BloomChallenge> => {
    const res = await fetch('/api/admin/challenges', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(chal),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save challenge (${res.status})`);
    }

    const resJson = await res.json();
    const confirmed: BloomChallenge = resJson.challenge || chal;

    const all = safeGet<BloomChallenge[]>(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
    const index = all.findIndex(c => c.id === confirmed.id);
    if (index >= 0) {
      all[index] = confirmed;
    } else {
      all.unshift(confirmed);
    }
    safeSet(STORAGE_KEYS.CHALLENGES, all);

    return confirmed;
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/challenges/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to delete challenge (${res.status})`);
    }

    const all = safeGet<BloomChallenge[]>(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
    const filtered = all.filter(c => c.id !== id);
    safeSet(STORAGE_KEYS.CHALLENGES, filtered);
  }
};

// ================= BLOOM OF THE WEEK =================
export const bloomOfWeekService = {
  get: (): BloomOfTheWeek => {
    return safeGet<BloomOfTheWeek>(STORAGE_KEYS.BLOOM_OF_WEEK, INITIAL_BLOOM_OF_THE_WEEK);
  },
  save: async (data: BloomOfTheWeek): Promise<BloomOfTheWeek> => {
    const res = await fetch('/api/admin/bloom-of-week', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to update Bloom of the Week (${res.status})`);
    }

    const resJson = await res.json();
    const confirmed = resJson.bloomOfTheWeek || data;
    safeSet(STORAGE_KEYS.BLOOM_OF_WEEK, confirmed);
    return confirmed;
  }
};

// ================= SITE SETTINGS =================
export const settingsService = {
  get: (): SiteSettings => {
    return safeGet<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  save: async (settings: SiteSettings): Promise<SiteSettings> => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(settings),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save site settings (${res.status})`);
    }

    const resJson = await res.json();
    const confirmed = resJson.settings || settings;
    safeSet(STORAGE_KEYS.SETTINGS, confirmed);
    return confirmed;
  }
};

// ================= WRITERS =================
export const writerService = {
  getAll: (): Writer[] => {
    return safeGet<Writer[]>(STORAGE_KEYS.WRITERS, INITIAL_WRITERS);
  },
  save: (writer: Writer): Writer => {
    const all = safeGet<Writer[]>(STORAGE_KEYS.WRITERS, INITIAL_WRITERS);
    const index = all.findIndex(w => w.id === writer.id);
    if (index >= 0) {
      all[index] = writer;
    } else {
      all.push(writer);
    }
    safeSet(STORAGE_KEYS.WRITERS, all);
    fetch('/api/admin/writers', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(writer),
    }).catch(err => console.error('Failed to sync writer to server:', err));
    return writer;
  }
};

// ================= SUBMISSIONS =================
export const submissionService = {
  getAll: (): UserSubmission[] => {
    return safeGet<UserSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },
  submit: (submission: Omit<UserSubmission, 'id' | 'submittedAt' | 'status'>): UserSubmission => {
    const all = safeGet<UserSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const newEntry: UserSubmission = {
      ...submission,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
      status: 'Pending'
    };
    all.unshift(newEntry);
    safeSet(STORAGE_KEYS.SUBMISSIONS, all);

    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch(err => console.error('Failed to send submission to server:', err));

    return newEntry;
  },
  create: (submission: Omit<UserSubmission, 'id' | 'submittedAt' | 'status'>): UserSubmission => {
    return submissionService.submit(submission);
  },
  updateStatus: (id: string, status: UserSubmission['status'], adminNotes?: string): void => {
    const all = safeGet<UserSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const item = all.find(s => s.id === id);
    if (item) {
      item.status = status;
      if (adminNotes !== undefined) item.adminNotes = adminNotes;
      safeSet(STORAGE_KEYS.SUBMISSIONS, all);
      fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ status, adminNotes }),
      }).catch(err => console.error('Failed to sync submission update:', err));
    }
  },
  delete: (id: string): void => {
    const all = safeGet<UserSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const filtered = all.filter(s => s.id !== id);
    safeSet(STORAGE_KEYS.SUBMISSIONS, filtered);
    fetch(`/api/admin/submissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }).catch(err => console.error('Failed to delete submission on server:', err));
  }
};

// ================= REPORTS & CORRECTIONS =================
export const reportService = {
  getAll: (): ContentReport[] => {
    return safeGet<ContentReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },
  submit: (report: Omit<ContentReport, 'id' | 'reportedAt' | 'status'>): ContentReport => {
    const all = safeGet<ContentReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const newReport: ContentReport = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reportedAt: new Date().toISOString(),
      status: 'Open'
    };
    all.unshift(newReport);
    safeSet(STORAGE_KEYS.REPORTS, all);

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    }).catch(err => console.error('Failed to send report to server:', err));

    return newReport;
  },
  create: (report: Omit<ContentReport, 'id' | 'reportedAt' | 'status'>): ContentReport => {
    return reportService.submit(report);
  },
  updateStatus: (id: string, status: ContentReport['status'], adminNotes?: string): void => {
    const all = safeGet<ContentReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const item = all.find(r => r.id === id);
    if (item) {
      item.status = status;
      if (adminNotes !== undefined) item.adminNotes = adminNotes;
      safeSet(STORAGE_KEYS.REPORTS, all);
      fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ status, adminNotes }),
      }).catch(err => console.error('Failed to sync report update:', err));
    }
  },
  delete: (id: string): void => {
    const all = safeGet<ContentReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const filtered = all.filter(r => r.id !== id);
    safeSet(STORAGE_KEYS.REPORTS, filtered);
    fetch(`/api/admin/reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }).catch(err => console.error('Failed to delete report on server:', err));
  }
};

// ================= ANALYTICS =================
export const analyticsService = {
  logEvent: (type: AnalyticsEvent['type'], detail: string): void => {
    const events = safeGet<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
    const newEvt: AnalyticsEvent = {
      id: 'evt-' + Date.now(),
      type,
      detail,
      timestamp: new Date().toISOString()
    };
    events.unshift(newEvt);
    if (events.length > 200) events.length = 200;
    safeSet(STORAGE_KEYS.ANALYTICS, events);

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, detail }),
    }).catch(() => {});
  },
  getEvents: (): AnalyticsEvent[] => {
    return safeGet<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
  },
  getSummary: () => {
    const events = safeGet<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
    const counts = {
      articleViews: 0,
      opportunityClicks: 0,
      resourceClicks: 0,
      challengeSubmits: 0,
      telegramClicks: 0,
      searches: 0
    };
    events.forEach(e => {
      if (e.type === 'article_view') counts.articleViews++;
      if (e.type === 'opportunity_click') counts.opportunityClicks++;
      if (e.type === 'resource_click') counts.resourceClicks++;
      if (e.type === 'challenge_submit') counts.challengeSubmits++;
      if (e.type === 'telegram_click') counts.telegramClicks++;
      if (e.type === 'search_query') counts.searches++;
    });
    return counts;
  }
};

// ================= SECURE AUTHENTICATION =================
// Credentials are strictly checked on the backend server.
// No passwords exist in client code, HTML, storage, or bundle.
export const authService = {
  getCurrentUser: (): AuthUser | null => {
    return safeGet<AuthUser | null>(STORAGE_KEYS.AUTH, null);
  },
  getToken: (): string | null => {
    const user = safeGet<AuthUser | null>(STORAGE_KEYS.AUTH, null);
    return user?.token || null;
  },
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid admin credentials');
    }

    const authUser: AuthUser = {
      id: 'admin-' + Date.now(),
      name: data.user?.name || 'Debbie',
      email: data.user?.email || email || 'debbietalestime@gmail.com',
      role: data.user?.role || 'admin',
      token: data.token,
    };

    safeSet(STORAGE_KEYS.AUTH, authUser);
    // Background sync data now that we have credentials
    syncFromServer().catch(() => {});
    return authUser;
  },
  async checkSession(): Promise<AuthUser | null> {
    const user = safeGet<AuthUser | null>(STORAGE_KEYS.AUTH, null);
    if (!user || !user.token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        return null;
      }
      const data = await res.json();
      if (!data.authenticated) {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        return null;
      }
      return user;
    } catch {
      return user;
    }
  },
  async logout(): Promise<void> {
    const user = safeGet<AuthUser | null>(STORAGE_KEYS.AUTH, null);
    if (user && user.token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};

export const subscriberService = {
  subscribe: async (email: string, source: string = 'footer_newsletter'): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }
      return { 
        success: true, 
        message: data.message || "Thank you for subscribing to Debloom! 🌱" 
      };
    } catch (err: any) {
      console.warn('Network subscription fallback:', err);
      const subs = safeGet<NewsletterSubscriber[]>(STORAGE_KEYS.SUBSCRIBERS, []);
      const clean = email.trim().toLowerCase();
      if (!subs.some(s => s.email === clean)) {
        subs.unshift({
          id: `sub_${Date.now()}`,
          email: clean,
          subscribedAt: new Date().toISOString(),
          source,
          status: 'active'
        });
        safeSet(STORAGE_KEYS.SUBSCRIBERS, subs);
      }
      return { 
        success: true, 
        message: "Welcome to Debloom! You're on the list to receive updates. 🌱" 
      };
    }
  },
  getAll: async (): Promise<NewsletterSubscriber[]> => {
    try {
      const res = await fetch('/api/admin/subscribers');
      if (res.ok) {
        const data = await res.json();
        return data.subscribers || [];
      }
    } catch (e) {
      console.warn('Error fetching subscribers:', e);
    }
    return safeGet<NewsletterSubscriber[]>(STORAGE_KEYS.SUBSCRIBERS, []);
  }
};
