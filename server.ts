import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  ALLOWED_ANALYTICS_EVENTS,
  db,
  hashPassword,
  recordAnalyticsEvent,
  seedDatabase,
  verifyPassword,
} from './server/db.ts';
import {
  attachSession,
  clearSessionCookie,
  requireAdmin,
  requireAuth,
  setSessionCookie,
  verifyStripeWebhookSignature,
  type AuthenticatedRequest,
} from './server/auth.ts';
import { CANONICAL_CURRICULUM, PUBLISHED_LESSONS } from './src/data/curriculum.ts';
import { LIBRARY_CASES, LIBRARY_CONCEPTS } from './src/data/library.ts';
import type {
  DecisionSnapshot,
  DraftAnalysisRecord,
  LearningProgressRecord,
  ToolId,
} from './src/types.ts';

seedDatabase();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Raw body route for Stripe webhook verification MUST precede express.json()
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    res.status(501).json({ error: 'Stripe webhook secret is not configured.' });
    return;
  }

  const sigHeader = req.headers['stripe-signature'];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  if (
    !verifyStripeWebhookSignature(
      rawBody,
      typeof sigHeader === 'string' ? sigHeader : undefined,
      webhookSecret,
    )
  ) {
    res.status(400).json({ error: 'Invalid Stripe webhook signature.' });
    return;
  }

  try {
    const event = JSON.parse(rawBody.toString('utf8')) as {
      id: string;
      type: string;
      data?: {
        object?: {
          metadata?: { userId?: string; programId?: string };
          amount_total?: number;
          payment_status?: string;
        };
      };
    };

    if (event.type === 'checkout.session.completed') {
      const obj = event.data?.object;
      const userId = obj?.metadata?.userId;
      const programId = obj?.metadata?.programId;
      const amountCents = Number(obj?.amount_total ?? 0);

      if (userId && programId && obj?.payment_status === 'paid') {
        const existingEvent = db
          .prepare('SELECT id FROM payment_events WHERE id = ?')
          .get(event.id) as { id: string } | undefined;

        if (!existingEvent) {
          db.prepare(
            `INSERT INTO payment_events (id, user_id, program_id, status, amount_cents, created_at)
             VALUES (?, ?, ?, 'paid', ?, ?)`,
          ).run(event.id, userId, programId, amountCents, new Date().toISOString());

          const userRow = db
            .prepare('SELECT entitlements_json FROM users WHERE id = ?')
            .get(userId) as { entitlements_json: string } | undefined;

          if (userRow) {
            const current = JSON.parse(userRow.entitlements_json) as string[];
            if (!current.includes(programId)) {
              current.push(programId);
              db.prepare('UPDATE users SET entitlements_json = ? WHERE id = ?').run(
                JSON.stringify(current),
                userId,
              );
            }
          }
          recordAnalyticsEvent('program_purchase', { programId });
        }
      }
    }

    res.json({ received: true });
  } catch {
    res.status(400).json({ error: 'Malformed webhook payload.' });
  }
});

app.use(express.json({ limit: '1mb' }));
app.use(attachSession);

// Simple sliding-window rate limiter for AI Thinking Partner cost control
const aiRateLimitMap = new Map<string, number[]>();
function checkAiRateLimit(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 15;
  const timestamps = (aiRateLimitMap.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    aiRateLimitMap.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  aiRateLimitMap.set(key, timestamps);
  return true;
}

function getBaseUrl(req: express.Request): string {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && envUrl !== 'MY_APP_URL' && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

// SEO: robots.txt and sitemap.xml
app.get('/robots.txt', (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api/',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n'),
  );
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = getBaseUrl(req);
  const overrides = db.prepare('SELECT module_number, published FROM curriculum_overrides').all() as {
    module_number: number;
    published: number;
  }[];
  const pubMap = new Map(overrides.map((o) => [o.module_number, o.published === 1]));

  const urls = [
    '/',
    '/learn',
    '/strategy-lab',
    '/library',
    '/for-teams',
    '/book',
    '/programs',
    '/about',
    '/sources',
    '/privacy',
  ];

  for (const mod of CANONICAL_CURRICULUM) {
    if (pubMap.get(mod.moduleNumber) && PUBLISHED_LESSONS[mod.slug]) {
      urls.push(`/learn/${mod.slug}`);
    }
  }
  for (const concept of LIBRARY_CONCEPTS) {
    urls.push(`/library/concept/${concept.slug}`);
  }
  for (const c of LIBRARY_CASES) {
    urls.push(`/library/case/${c.slug}`);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${baseUrl}${u}</loc></url>`),
    '</urlset>',
  ].join('\n');

  res.type('application/xml').send(xml);
});

// Integration readiness flags (booleans only, never secrets)
app.get('/api/config/status', (_req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const inquiryWebhook = process.env.INQUIRY_WEBHOOK_URL?.trim();

  res.json({
    geminiConfigured: Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY'),
    stripeConfigured: Boolean(stripeKey && stripeWebhook),
    inquiryWebhookConfigured: Boolean(inquiryWebhook),
  });
});

// Authentication routes
app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user ?? null });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body as {
    email?: string;
    name?: string;
    password?: string;
  };
  const cleanEmail = (email ?? '').trim().toLowerCase();
  const cleanName = (name ?? '').trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  if (!cleanName || cleanName.length < 2 || cleanName.length > 80) {
    res.status(400).json({ error: 'Please provide your name (2–80 characters).' });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail) as
    | { id: string }
    | undefined;
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, role, entitlements_json, created_at)
     VALUES (?, ?, ?, ?, 'learner', '["open-foundation"]', ?)`,
  ).run(userId, cleanEmail, cleanName, hashPassword(password), now);

  setSessionCookie(res, userId);
  res.status(201).json({
    user: {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      role: 'learner',
      entitlements: ['open-foundation'],
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const cleanEmail = (email ?? '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const row = db
    .prepare('SELECT id, email, name, password_hash, role, entitlements_json FROM users WHERE email = ?')
    .get(cleanEmail) as
    | {
        id: string;
        email: string;
        name: string;
        password_hash: string;
        role: 'learner' | 'admin';
        entitlements_json: string;
      }
    | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  setSessionCookie(res, row.id);
  res.json({
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      entitlements: JSON.parse(row.entitlements_json) as string[],
    },
  });
});

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/account/export', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const decisions = db
    .prepare('SELECT * FROM decisions WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId);
  const versions = db
    .prepare('SELECT * FROM decision_versions WHERE user_id = ? ORDER BY created_at ASC')
    .all(userId);
  const draftAnalyses = db
    .prepare('SELECT * FROM draft_analyses WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId);
  const learningProgress = db
    .prepare('SELECT * FROM learning_progress WHERE user_id = ? ORDER BY last_visited_at DESC')
    .all(userId);
  const subscription = db
    .prepare(
      'SELECT email, consent_updates, consent_reminders, interest_program, unsubscribed_at, created_at FROM subscribers WHERE email = ?',
    )
    .get(req.user!.email);

  res.json({
    exportedAt: new Date().toISOString(),
    account: req.user,
    decisions,
    versions,
    draftAnalyses,
    learningProgress,
    subscription: subscription ?? null,
  });
});

app.delete('/api/account', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  clearSessionCookie(res);
  res.json({ deleted: true });
});

// Public Curriculum & Program Catalogs
app.get('/api/curriculum', (_req, res) => {
  const overrides = db.prepare('SELECT * FROM curriculum_overrides').all() as {
    module_number: number;
    published: number;
    headline: string;
    summary: string;
  }[];
  const map = new Map(overrides.map((o) => [o.module_number, o]));

  const subjects = CANONICAL_CURRICULUM.map((m) => {
    const ov = map.get(m.moduleNumber);
    const isPublished = ov ? ov.published === 1 : m.published;
    return {
      ...m,
      published: isPublished && Boolean(PUBLISHED_LESSONS[m.slug]),
      headline: ov?.headline || m.headline,
      summary: ov?.summary || m.summary,
    };
  });

  res.json({ subjects });
});

app.get('/api/programs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM programs').all() as {
    id: string;
    slug: string;
    title: string;
    tier: string;
    status: string;
    price_label: string;
    price_cents: number | null;
    schedule_note: string;
    summary: string;
    included_json: string;
    excluded_json: string;
  }[];

  res.json({
    programs: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      tier: r.tier,
      status: r.status,
      priceLabel: r.price_label,
      priceCents: r.price_cents,
      scheduleNote: r.schedule_note,
      summary: r.summary,
      includedItems: JSON.parse(r.included_json) as string[],
      excludedBoundaries: JSON.parse(r.excluded_json) as string[],
    })),
  });
});

// Decision Portfolio API (Private, user-scoped on server)
function validateSnapshot(raw: unknown): DecisionSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const title = typeof s.title === 'string' ? s.title.trim().slice(0, 180) : '';
  if (!title) return null;
  const allowedStatuses = new Set([
    'Draft saved',
    'Analysis completed',
    'Reviewed by another person',
    'Revised following new evidence',
    'Outcome recorded',
  ]);
  const status =
    typeof s.status === 'string' && allowedStatuses.has(s.status)
      ? (s.status as DecisionSnapshot['status'])
      : 'Draft saved';

  const conf = Number(s.initialConfidence ?? 50);

  return {
    title,
    context: String(s.context ?? '').slice(0, 4000),
    owner: String(s.owner ?? '').slice(0, 140),
    deadline: String(s.deadline ?? '').slice(0, 60),
    stakes: String(s.stakes ?? '').slice(0, 2000),
    affectedParties: String(s.affectedParties ?? '').slice(0, 2000),
    initialJudgment: String(s.initialJudgment ?? '').slice(0, 2000),
    initialConfidence: Number.isFinite(conf) ? Math.max(0, Math.min(100, Math.round(conf))) : 50,
    observations: String(s.observations ?? '').slice(0, 4000),
    sourceEvidence: String(s.sourceEvidence ?? '').slice(0, 4000),
    assumptions: String(s.assumptions ?? '').slice(0, 4000),
    rivalExplanations: String(s.rivalExplanations ?? '').slice(0, 4000),
    systemMechanisms: String(s.systemMechanisms ?? '').slice(0, 4000),
    alternativesAndTradeoffs: String(s.alternativesAndTradeoffs ?? '').slice(0, 4000),
    scenariosAndUncertainty: String(s.scenariosAndUncertainty ?? '').slice(0, 4000),
    recommendation: String(s.recommendation ?? '').slice(0, 4000),
    implementationResponsibilities: String(s.implementationResponsibilities ?? '').slice(0, 4000),
    revisionTriggers: String(s.revisionTriggers ?? '').slice(0, 2000),
    outcomesAndLessons: String(s.outcomesAndLessons ?? '').slice(0, 4000),
    status,
    linkedModuleNumber:
      typeof s.linkedModuleNumber === 'number' ? s.linkedModuleNumber : undefined,
  };
}

app.get('/api/decisions', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const rows = db
    .prepare('SELECT * FROM decisions WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId) as {
    id: string;
    created_at: string;
    updated_at: string;
    review_reminder_date: string | null;
    reminder_frequency: 'none' | 'once' | 'monthly';
    snapshot_json: string;
  }[];

  const versionStmt = db.prepare(
    'SELECT * FROM decision_versions WHERE decision_id = ? AND user_id = ? ORDER BY version_number ASC',
  );

  const decisions = rows.map((row) => {
    const verRows = versionStmt.all(row.id, userId) as {
      id: string;
      decision_id: string;
      version_number: number;
      created_at: string;
      change_note: string;
      snapshot_json: string;
    }[];
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reviewReminderDate: row.review_reminder_date,
      reminderFrequency: row.reminder_frequency,
      snapshot: JSON.parse(row.snapshot_json) as DecisionSnapshot,
      versions: verRows.map((v) => ({
        id: v.id,
        decisionId: v.decision_id,
        versionNumber: v.version_number,
        createdAt: v.created_at,
        changeNote: v.change_note,
        snapshot: JSON.parse(v.snapshot_json) as DecisionSnapshot,
      })),
    };
  });

  res.json({ decisions });
});

app.post('/api/decisions', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { snapshot: rawSnapshot, changeNote, reviewReminderDate, reminderFrequency } = req.body as {
    snapshot?: unknown;
    changeNote?: string;
    reviewReminderDate?: string | null;
    reminderFrequency?: 'none' | 'once' | 'monthly';
  };
  const snapshot = validateSnapshot(rawSnapshot);
  if (!snapshot) {
    res.status(400).json({ error: 'A decision title is required.' });
    return;
  }

  const decisionId = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const freq =
    reminderFrequency === 'once' || reminderFrequency === 'monthly' ? reminderFrequency : 'none';
  const cleanNote = (changeNote ?? 'Initial decision record created').trim().slice(0, 300);

  db.prepare(
    `INSERT INTO decisions (id, user_id, title, status, review_reminder_date, reminder_frequency, snapshot_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    decisionId,
    userId,
    snapshot.title,
    snapshot.status,
    reviewReminderDate || null,
    freq,
    JSON.stringify(snapshot),
    now,
    now,
  );

  db.prepare(
    `INSERT INTO decision_versions (id, decision_id, user_id, version_number, change_note, snapshot_json, created_at)
     VALUES (?, ?, ?, 1, ?, ?, ?)`,
  ).run(versionId, decisionId, userId, cleanNote, JSON.stringify(snapshot), now);

  recordAnalyticsEvent('portfolio_saved');

  res.status(201).json({
    decision: {
      id: decisionId,
      createdAt: now,
      updatedAt: now,
      reviewReminderDate: reviewReminderDate || null,
      reminderFrequency: freq,
      snapshot,
      versions: [
        {
          id: versionId,
          decisionId,
          versionNumber: 1,
          createdAt: now,
          changeNote: cleanNote,
          snapshot,
        },
      ],
    },
  });
});

app.put('/api/decisions/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const decisionId = req.params.id;
  const existing = db
    .prepare('SELECT id FROM decisions WHERE id = ? AND user_id = ?')
    .get(decisionId, userId) as { id: string } | undefined;

  if (!existing) {
    res.status(404).json({ error: 'Decision not found in your portfolio.' });
    return;
  }

  const { snapshot: rawSnapshot, changeNote, reviewReminderDate, reminderFrequency } = req.body as {
    snapshot?: unknown;
    changeNote?: string;
    reviewReminderDate?: string | null;
    reminderFrequency?: 'none' | 'once' | 'monthly';
  };

  const snapshot = validateSnapshot(rawSnapshot);
  if (!snapshot) {
    res.status(400).json({ error: 'A decision title is required.' });
    return;
  }

  const latestVer = db
    .prepare(
      'SELECT MAX(version_number) as maxVer FROM decision_versions WHERE decision_id = ? AND user_id = ?',
    )
    .get(decisionId, userId) as { maxVer: number | null };

  const nextVer = (latestVer?.maxVer ?? 0) + 1;
  const now = new Date().toISOString();
  const cleanNote = (changeNote ?? `Revision v${nextVer}`).trim().slice(0, 300);
  const freq =
    reminderFrequency === 'once' || reminderFrequency === 'monthly' ? reminderFrequency : 'none';

  db.prepare(
    `UPDATE decisions
     SET title = ?, status = ?, review_reminder_date = ?, reminder_frequency = ?, snapshot_json = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    snapshot.title,
    snapshot.status,
    reviewReminderDate || null,
    freq,
    JSON.stringify(snapshot),
    now,
    decisionId,
    userId,
  );

  const versionId = crypto.randomUUID();
  db.prepare(
    `INSERT INTO decision_versions (id, decision_id, user_id, version_number, change_note, snapshot_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(versionId, decisionId, userId, nextVer, cleanNote, JSON.stringify(snapshot), now);

  recordAnalyticsEvent('portfolio_revisited');

  res.json({
    updatedAt: now,
    newVersion: {
      id: versionId,
      decisionId,
      versionNumber: nextVer,
      createdAt: now,
      changeNote: cleanNote,
      snapshot,
    },
  });
});

app.delete('/api/decisions/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const result = db
    .prepare('DELETE FROM decisions WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user!.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Decision not found.' });
    return;
  }
  res.json({ deleted: true });
});

app.post('/api/decisions/import', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { decisions } = req.body as {
    decisions?: Array<{ snapshot: unknown; versions?: Array<{ changeNote?: string; snapshot: unknown }> }>;
  };
  if (!Array.isArray(decisions) || decisions.length === 0) {
    res.status(400).json({ error: 'No valid decisions provided for import.' });
    return;
  }

  let importedCount = 0;
  const now = new Date().toISOString();

  for (const item of decisions.slice(0, 25)) {
    const snap = validateSnapshot(item.snapshot);
    if (!snap) continue;
    const decId = crypto.randomUUID();
    db.prepare(
      `INSERT INTO decisions (id, user_id, title, status, review_reminder_date, reminder_frequency, snapshot_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, 'none', ?, ?, ?)`,
    ).run(decId, userId, snap.title, snap.status, JSON.stringify(snap), now, now);

    const verList = Array.isArray(item.versions) && item.versions.length > 0 ? item.versions : [{ changeNote: 'Imported from local study archive', snapshot: snap }];
    let vNum = 1;
    for (const v of verList.slice(0, 20)) {
      const vSnap = validateSnapshot(v.snapshot) ?? snap;
      db.prepare(
        `INSERT INTO decision_versions (id, decision_id, user_id, version_number, change_note, snapshot_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        crypto.randomUUID(),
        decId,
        userId,
        vNum++,
        (v.changeNote ?? 'Imported snapshot').slice(0, 300),
        JSON.stringify(vSnap),
        now,
      );
    }
    importedCount += 1;
  }

  res.status(201).json({ importedCount });
});

// Workspace Summary, Draft Analyses & Learning Progress (Private, user-scoped on server)
const VALID_TOOL_IDS = new Set<ToolId>([
  'problem-framing',
  'systems-explorer',
  'decision-comparison',
  'scenario-stress-test',
  'stakeholder-map',
  'strategy-coherence',
]);

app.get('/api/workspace/summary', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const draftRows = db
    .prepare('SELECT * FROM draft_analyses WHERE user_id = ? ORDER BY updated_at DESC')
    .all(userId) as {
    id: string;
    tool_id: ToolId;
    tool_label: string;
    title: string;
    summary: string;
    linked_module_number: number;
    patch_json: string;
    updated_at: string;
  }[];

  const progressRows = db
    .prepare('SELECT * FROM learning_progress WHERE user_id = ? ORDER BY last_visited_at DESC')
    .all(userId) as {
    module_number: number;
    slug: string;
    academic_subject: string;
    stage_label: string;
    status: 'Opened' | 'Guided practice completed';
    selected_practice_option: string | null;
    last_visited_at: string;
    practice_completed_at: string | null;
  }[];

  const drafts: DraftAnalysisRecord[] = draftRows.map((r) => ({
    id: r.id,
    toolId: r.tool_id,
    toolLabel: r.tool_label,
    title: r.title,
    summary: r.summary,
    linkedModuleNumber: r.linked_module_number,
    snapshotPatch: JSON.parse(r.patch_json) as Partial<DecisionSnapshot>,
    updatedAt: r.updated_at,
  }));

  const progress: LearningProgressRecord[] = progressRows.map((p) => ({
    moduleNumber: p.module_number,
    slug: p.slug,
    academicSubject: p.academic_subject,
    stageLabel: p.stage_label,
    status: p.status,
    selectedPracticeOption: p.selected_practice_option ?? undefined,
    lastVisitedAt: p.last_visited_at,
    practiceCompletedAt: p.practice_completed_at,
  }));

  res.json({ drafts, progress });
});

app.post('/api/workspace/drafts', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { id, toolId, toolLabel, title, summary, linkedModuleNumber, snapshotPatch } = req.body as {
    id?: string;
    toolId?: ToolId;
    toolLabel?: string;
    title?: string;
    summary?: string;
    linkedModuleNumber?: number;
    snapshotPatch?: Partial<DecisionSnapshot>;
  };

  if (!toolId || !VALID_TOOL_IDS.has(toolId)) {
    res.status(400).json({ error: 'Valid Strategy Lab toolId is required.' });
    return;
  }

  const cleanTitle = (title ?? '').trim().slice(0, 180) || `${toolLabel ?? 'Strategy Lab'} Draft`;
  const cleanLabel = (toolLabel ?? toolId).trim().slice(0, 120);
  const cleanSummary = (summary ?? '').trim().slice(0, 600);
  const modNum = Number.isFinite(Number(linkedModuleNumber)) ? Number(linkedModuleNumber) : 1;
  const patchObj = snapshotPatch && typeof snapshotPatch === 'object' ? snapshotPatch : {};
  const now = new Date().toISOString();

  const existing = id
    ? (db.prepare('SELECT id FROM draft_analyses WHERE id = ? AND user_id = ?').get(id, userId) as
        | { id: string }
        | undefined)
    : undefined;

  const draftId = existing ? existing.id : crypto.randomUUID();
  if (existing) {
    db.prepare(
      `UPDATE draft_analyses
       SET tool_id = ?, tool_label = ?, title = ?, summary = ?, linked_module_number = ?, patch_json = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    ).run(
      toolId,
      cleanLabel,
      cleanTitle,
      cleanSummary,
      modNum,
      JSON.stringify(patchObj),
      now,
      draftId,
      userId,
    );
  } else {
    db.prepare(
      `INSERT INTO draft_analyses (id, user_id, tool_id, tool_label, title, summary, linked_module_number, patch_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      draftId,
      userId,
      toolId,
      cleanLabel,
      cleanTitle,
      cleanSummary,
      modNum,
      JSON.stringify(patchObj),
      now,
    );
  }

  const draft: DraftAnalysisRecord = {
    id: draftId,
    toolId,
    toolLabel: cleanLabel,
    title: cleanTitle,
    summary: cleanSummary,
    linkedModuleNumber: modNum,
    snapshotPatch: patchObj,
    updatedAt: now,
  };

  res.status(existing ? 200 : 201).json({ draft });
});

app.delete('/api/workspace/drafts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const result = db
    .prepare('DELETE FROM draft_analyses WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user!.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Draft analysis not found.' });
    return;
  }
  res.json({ deleted: true });
});

app.post('/api/workspace/progress', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { moduleNumber, status, selectedPracticeOption } = req.body as {
    moduleNumber?: number;
    status?: 'Opened' | 'Guided practice completed';
    selectedPracticeOption?: string;
  };

  const mod = CANONICAL_CURRICULUM.find((m) => m.moduleNumber === Number(moduleNumber));
  if (!mod) {
    res.status(400).json({ error: 'Unknown curriculum module.' });
    return;
  }

  const cleanStatus: 'Opened' | 'Guided practice completed' =
    status === 'Guided practice completed' ? 'Guided practice completed' : 'Opened';
  const cleanOption =
    typeof selectedPracticeOption === 'string' && selectedPracticeOption.trim()
      ? selectedPracticeOption.trim().slice(0, 300)
      : null;
  const now = new Date().toISOString();

  const existing = db
    .prepare(
      'SELECT status, selected_practice_option, practice_completed_at FROM learning_progress WHERE user_id = ? AND module_number = ?',
    )
    .get(userId, mod.moduleNumber) as
    | {
        status: 'Opened' | 'Guided practice completed';
        selected_practice_option: string | null;
        practice_completed_at: string | null;
      }
    | undefined;

  const finalStatus: 'Opened' | 'Guided practice completed' =
    existing?.status === 'Guided practice completed' || cleanStatus === 'Guided practice completed'
      ? 'Guided practice completed'
      : 'Opened';
  const finalOption =
    cleanStatus === 'Guided practice completed'
      ? cleanOption ?? existing?.selected_practice_option ?? null
      : existing?.selected_practice_option ?? null;
  const finalCompletedAt =
    cleanStatus === 'Guided practice completed'
      ? now
      : existing?.practice_completed_at ?? null;

  if (existing) {
    db.prepare(
      `UPDATE learning_progress
       SET slug = ?, academic_subject = ?, stage_label = ?, status = ?, selected_practice_option = ?, last_visited_at = ?, practice_completed_at = ?
       WHERE user_id = ? AND module_number = ?`,
    ).run(
      mod.slug,
      mod.academicSubject,
      mod.stageLabel,
      finalStatus,
      finalOption,
      now,
      finalCompletedAt,
      userId,
      mod.moduleNumber,
    );
  } else {
    db.prepare(
      `INSERT INTO learning_progress (user_id, module_number, slug, academic_subject, stage_label, status, selected_practice_option, last_visited_at, practice_completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      mod.moduleNumber,
      mod.slug,
      mod.academicSubject,
      mod.stageLabel,
      finalStatus,
      finalOption,
      now,
      finalCompletedAt,
    );
  }

  const progress: LearningProgressRecord = {
    moduleNumber: mod.moduleNumber,
    slug: mod.slug,
    academicSubject: mod.academicSubject,
    stageLabel: mod.stageLabel,
    status: finalStatus,
    selectedPracticeOption: finalOption ?? undefined,
    lastVisitedAt: now,
    practiceCompletedAt: finalCompletedAt,
  };

  res.json({ progress });
});

// Organizational Inquiry Route (Durable SQLite + optional INQUIRY_WEBHOOK_URL)
app.post('/api/inquiries', async (req, res) => {
  const { name, workEmail, organization, challenge, audienceSize, timing, desiredOutcome } = req.body as {
    name?: string;
    workEmail?: string;
    organization?: string;
    challenge?: string;
    audienceSize?: string;
    timing?: string;
    desiredOutcome?: string;
  };

  if (!name?.trim() || !workEmail?.trim() || !organization?.trim() || !challenge?.trim()) {
    res.status(400).json({ error: 'Name, work email, organization, and challenge summary are required.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim())) {
    res.status(400).json({ error: 'Please enter a valid work email address.' });
    return;
  }

  const inquiryId = crypto.randomUUID();
  const now = new Date().toISOString();
  let forwardedExternally = false;

  const webhookUrl = process.env.INQUIRY_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const hookResp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inquiryId,
          name: name.trim(),
          workEmail: workEmail.trim(),
          organization: organization.trim(),
          challenge: challenge.trim(),
          audienceSize: (audienceSize ?? 'Not specified').trim(),
          timing: (timing ?? 'Flexible').trim(),
          desiredOutcome: (desiredOutcome ?? '').trim(),
          createdAt: now,
        }),
      });
      forwardedExternally = hookResp.ok;
    } catch {
      forwardedExternally = false;
    }
  }

  db.prepare(
    `INSERT INTO inquiries (id, name, work_email, organization, challenge, audience_size, timing, desired_outcome, status, forwarded_externally, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
  ).run(
    inquiryId,
    name.trim().slice(0, 120),
    workEmail.trim().slice(0, 180),
    organization.trim().slice(0, 180),
    challenge.trim().slice(0, 3000),
    (audienceSize ?? 'Not specified').trim().slice(0, 60),
    (timing ?? 'Flexible').trim().slice(0, 120),
    (desiredOutcome ?? '').trim().slice(0, 2000),
    forwardedExternally ? 1 : 0,
    now,
  );

  recordAnalyticsEvent('qualified_inquiry');

  res.status(201).json({
    id: inquiryId,
    storedInDatabase: true,
    forwardedExternally,
    message: forwardedExternally
      ? 'Your inquiry has been recorded and forwarded to the program team.'
      : 'Your inquiry has been recorded in the platform database for review by the program team.',
  });
});

// Consent-based Email Subscription & Free Decision Brief Download
app.post('/api/subscribe', (req, res) => {
  const { email, consentUpdates, consentReminders, interestProgram } = req.body as {
    email?: string;
    consentUpdates?: boolean;
    consentReminders?: boolean;
    interestProgram?: string;
  };
  const cleanEmail = (email ?? '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (!consentUpdates && !consentReminders) {
    res.status(400).json({ error: 'Please explicitly select at least one communication preference.' });
    return;
  }

  const now = new Date().toISOString();
  const token = crypto.randomBytes(16).toString('hex');
  const existing = db.prepare('SELECT id, unsubscribe_token FROM subscribers WHERE email = ?').get(cleanEmail) as
    | { id: string; unsubscribe_token: string }
    | undefined;

  if (existing) {
    db.prepare(
      `UPDATE subscribers
       SET consent_updates = ?, consent_reminders = ?, interest_program = ?, unsubscribed_at = NULL
       WHERE id = ?`,
    ).run(consentUpdates ? 1 : 0, consentReminders ? 1 : 0, interestProgram ?? null, existing.id);
    recordAnalyticsEvent('subscriber_consent_recorded');
    res.json({
      subscribed: true,
      unsubscribeToken: existing.unsubscribe_token,
      message: 'Communication preferences updated.',
    });
    return;
  }

  db.prepare(
    `INSERT INTO subscribers (id, email, consent_updates, consent_reminders, interest_program, unsubscribe_token, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    cleanEmail,
    consentUpdates ? 1 : 0,
    consentReminders ? 1 : 0,
    interestProgram ?? null,
    token,
    now,
  );

  recordAnalyticsEvent('subscriber_consent_recorded');
  res.status(201).json({
    subscribed: true,
    unsubscribeToken: token,
    message: 'Consent recorded. You can update or withdraw preferences at any time.',
  });
});

app.post('/api/unsubscribe', (req, res) => {
  const { email, token } = req.body as { email?: string; token?: string };
  const now = new Date().toISOString();
  let result;
  if (token) {
    result = db
      .prepare('UPDATE subscribers SET unsubscribed_at = ?, consent_updates = 0, consent_reminders = 0 WHERE unsubscribe_token = ?')
      .run(now, token);
  } else if (email) {
    result = db
      .prepare('UPDATE subscribers SET unsubscribed_at = ?, consent_updates = 0, consent_reminders = 0 WHERE email = ?')
      .run(now, email.trim().toLowerCase());
  } else {
    res.status(400).json({ error: 'Email or unsubscribe token required.' });
    return;
  }
  res.json({ unsubscribed: result.changes > 0 });
});

app.get('/api/brief/download', (_req, res) => {
  const briefContent = `# THE STRATEGIC DECISION BRIEF
From *The Timeless Art of Strategic Thinking* by Mazhar Mansoor

> "Understand the situation. Make a defensible choice. Shape what comes next."

---

## 1. Decision Header & Stakes
- **Decision Title:**
- **Owner & Decision Rights:**
- **Decision Deadline:**
- **Who Bears the Risk (including parties absent from the room):**
- **Reversibility Assessment:** [ ] High  [ ] Moderate  [ ] Low / Irreversible

## 2. Initial Judgment Baseline (Record Before Group Debate)
- **Initial Judgment:**
- **Confidence (0–100%):**
- **What evidence would change my mind?**

## 3. Observations vs. Assumptions (Module 01 & Module 02)
- **Verified Observations (dated, checkable):**
  1.
  2.
- **Load-Bearing Assumptions:**
  1.
  2.
- **At Least Two Rival Explanations:**
  - *Rival A:*
  - *Rival B:*

## 4. System Structure & Bottleneck (Module 03 & Module 04)
- **Primary Stock(s) Accumulating or Draining:**
- **Key Inflow / Outflow Rates & Units:**
- **Information or Action Delays:**
- **Strategic Diagnosis (The Governing Crux):**

## 5. Alternatives, Trade-offs & Scenarios
- **Option A / Option B / Do-Nothing Baseline:**
- **Robust Moves (viable across plural futures):**
- **Contingent Bets & Early Signposts:**
- **What Will We Explicitly Stop Doing?**

## 6. Ethical Justification, Implementation & Revision Triggers
- **Ethical & Legitimacy Check:**
- **Accountable Owners & Next Milestones:**
- **Scheduled Review Date:**
- **Falsifiable Trigger for Revision:**
`;

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="Strategic-Decision-Brief-Template.md"');
  res.send(briefContent);
});

// Privacy-safe analytics beacon
app.post('/api/events', (req, res) => {
  const { eventName, meta } = req.body as {
    eventName?: string;
    meta?: Record<string, string | number | boolean>;
  };
  if (!eventName || !ALLOWED_ANALYTICS_EVENTS.has(eventName)) {
    res.status(400).json({ error: 'Unknown event name.' });
    return;
  }
  recordAnalyticsEvent(eventName, meta ?? {});
  res.json({ recorded: true });
});

// Optional Server-Side Gemini Strategic Thinking Partner
app.post('/api/thinking-partner', async (req: AuthenticatedRequest, res) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      configured: false,
      error:
        'The optional AI Thinking Partner is not configured in this environment. Use the non-AI Critical Review Checklist instead.',
    });
    return;
  }

  const rateKey = req.user?.id || req.ip || 'anon';
  if (!checkAiRateLimit(rateKey)) {
    res.status(429).json({
      configured: true,
      error: 'Rate limit reached (15 critiques per 15 minutes). Please pause to reflect or use the structured checklist.',
    });
    return;
  }

  const { moduleNumber, framingSummary, userConsentToSend } = req.body as {
    moduleNumber?: number;
    framingSummary?: string;
    userConsentToSend?: boolean;
  };

  if (!userConsentToSend) {
    res.status(400).json({
      error: 'Explicit user confirmation is required before sending decision notes to the model.',
    });
    return;
  }
  if (!framingSummary || framingSummary.trim().length < 20) {
    res.status(400).json({ error: 'Please provide at least 20 characters of your draft reasoning.' });
    return;
  }
  if (framingSummary.length > 2500) {
    res.status(400).json({ error: 'Draft summary must be 2,500 characters or fewer.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const mod = CANONICAL_CURRICULUM.find((m) => m.moduleNumber === Number(moduleNumber)) ?? CANONICAL_CURRICULUM[0];

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        `Curriculum Context: Module ${mod.moduleNumber} — ${mod.academicSubject} (${mod.stageLabel}: ${mod.partTitle}).`,
        `Learner's Draft Reasoning:\n${framingSummary.trim()}`,
      ].join('\n\n'),
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: [
          'You are a Socratic strategic thinking partner in the intellectual spirit of Mazhar Mansoor: lucid, exact, questioning, and honest about uncertainty.',
          'Your ONLY task is to help the learner strengthen their own reasoning by:',
          '1. Asking 2–3 sharp probing questions about hidden assumptions or system boundaries.',
          '2. Offering 2 plausible rival explanations they have not yet ruled out.',
          '3. Naming 1 disconfirming observation that would test their current framing.',
          'CRITICAL RULES:',
          '- Never issue a definitive strategic recommendation, grade, or score.',
          '- Never invent statistics, historical quotes, or external citations.',
          '- Keep total response under 240 words in clear prose.',
        ].join('\n'),
      },
    });

    res.json({
      aiGenerated: true,
      citedModule: `Module ${String(mod.moduleNumber).padStart(2, '0')} · ${mod.academicSubject}`,
      critique: response.text ?? 'No reflection returned.',
      ownershipReminder:
        'AI-generated questions for reflection only. You retain full responsibility for verifying facts and owning the final decision.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream model error';
    res.status(502).json({
      configured: true,
      error: `Model request failed (${message}). Continue with the non-AI Critical Review Checklist.`,
    });
  }
});

// Hosted Checkout Session (Isolated Stripe integration)
app.post('/api/checkout/session', requireAuth, async (req: AuthenticatedRequest, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripeKey || !stripeWebhook) {
    res.status(501).json({
      configured: false,
      error:
        'Hosted payment checkout is not yet configured in this environment. You may register program interest without payment.',
    });
    return;
  }

  const { programId } = req.body as { programId?: string };
  const prog = db.prepare('SELECT * FROM programs WHERE id = ?').get(programId ?? '') as
    | { id: string; title: string; status: string; price_cents: number | null }
    | undefined;

  if (!prog) {
    res.status(404).json({ error: 'Program not found.' });
    return;
  }
  if (prog.status !== 'Available' || !prog.price_cents || prog.price_cents <= 0) {
    res.status(400).json({ error: 'This program does not have an active priced checkout.' });
    return;
  }

  const baseUrl = getBaseUrl(req);
  const body = new URLSearchParams({
    mode: 'payment',
    success_url: `${baseUrl}/programs?checkout=success`,
    cancel_url: `${baseUrl}/programs?checkout=cancelled`,
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': prog.title,
    'line_items[0][price_data][unit_amount]': String(prog.price_cents),
    'line_items[0][quantity]': '1',
    'metadata[userId]': req.user!.id,
    'metadata[programId]': prog.id,
  });

  try {
    const stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const data = (await stripeResp.json()) as { url?: string; error?: { message?: string } };
    if (!stripeResp.ok || !data.url) {
      res.status(502).json({ error: data.error?.message ?? 'Unable to initialize Stripe checkout.' });
      return;
    }
    res.json({ url: data.url });
  } catch {
    res.status(502).json({ error: 'Payment gateway request failed.' });
  }
});

// Protected Administration API (Server-side RBAC enforced on every endpoint)
app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
  const subscribers = db
    .prepare(
      'SELECT id, email, consent_updates, consent_reminders, interest_program, unsubscribed_at, created_at FROM subscribers ORDER BY created_at DESC',
    )
    .all();
  const readiness = db.prepare('SELECT * FROM readiness_items').all();
  const revisions = db.prepare('SELECT * FROM editorial_revisions ORDER BY created_at DESC LIMIT 50').all();
  const overrides = db.prepare('SELECT * FROM curriculum_overrides ORDER BY module_number ASC').all();
  const metrics = db
    .prepare('SELECT event_name, COUNT(*) as count FROM analytics_events GROUP BY event_name')
    .all();
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;

  res.json({
    inquiries,
    subscribers,
    readiness,
    revisions,
    overrides,
    metrics,
    userCount,
  });
});

app.patch('/api/admin/curriculum/:moduleNumber', requireAdmin, (req: AuthenticatedRequest, res) => {
  const moduleNum = Number(req.params.moduleNumber);
  const { published, headline, summary } = req.body as {
    published?: boolean;
    headline?: string;
    summary?: string;
  };

  const canonical = CANONICAL_CURRICULUM.find((m) => m.moduleNumber === moduleNum);
  if (!canonical) {
    res.status(404).json({ error: 'Module not found.' });
    return;
  }
  if (published && !PUBLISHED_LESSONS[canonical.slug]) {
    res.status(400).json({
      error:
        'Cannot publish a module that lacks substantive lesson content in the repository. Add approved lesson teaching first.',
    });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE curriculum_overrides
     SET published = ?, headline = COALESCE(?, headline), summary = COALESCE(?, summary), updated_by = ?, updated_at = ?
     WHERE module_number = ?`,
  ).run(
    published ? 1 : 0,
    headline?.trim() || null,
    summary?.trim() || null,
    req.user!.email,
    now,
    moduleNum,
  );

  db.prepare(
    `INSERT INTO editorial_revisions (id, entity_type, entity_id, editor_email, summary, created_at)
     VALUES (?, 'curriculum_module', ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    String(moduleNum),
    req.user!.email,
    `Updated Module ${String(moduleNum).padStart(2, '0')} (published=${Boolean(published)})`,
    now,
  );

  res.json({ updated: true });
});

app.patch('/api/admin/programs/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { status, priceLabel, priceCents, scheduleNote } = req.body as {
    status?: string;
    priceLabel?: string;
    priceCents?: number | null;
    scheduleNote?: string;
  };
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `UPDATE programs
       SET status = COALESCE(?, status),
           price_label = COALESCE(?, price_label),
           price_cents = ?,
           schedule_note = COALESCE(?, schedule_note),
           updated_at = ?
       WHERE id = ?`,
    )
    .run(
      status ?? null,
      priceLabel ?? null,
      priceCents === undefined ? null : priceCents,
      scheduleNote ?? null,
      now,
      req.params.id,
    );

  if (result.changes === 0) {
    res.status(404).json({ error: 'Program not found.' });
    return;
  }

  db.prepare(
    `INSERT INTO editorial_revisions (id, entity_type, entity_id, editor_email, summary, created_at)
     VALUES (?, 'program', ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    req.params.id,
    req.user!.email,
    `Updated program pricing/availability (${status ?? 'unchanged'} · ${priceLabel ?? 'unchanged'})`,
    now,
  );

  res.json({ updated: true });
});

app.patch('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
  const { status } = req.body as { status?: string };
  if (!status || !['new', 'reviewing', 'scoped', 'archived'].includes(status)) {
    res.status(400).json({ error: 'Invalid inquiry status.' });
    return;
  }
  const result = db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Inquiry not found.' });
    return;
  }
  res.json({ updated: true });
});

app.patch('/api/admin/readiness/:id', requireAdmin, (req, res) => {
  const { status, nextAction } = req.body as { status?: string; nextAction?: string };
  if (status && !['Missing', 'Unconfigured', 'Available'].includes(status)) {
    res.status(400).json({ error: 'Invalid readiness status.' });
    return;
  }
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE readiness_items SET status = COALESCE(?, status), next_action = COALESCE(?, next_action), updated_at = ? WHERE id = ?`,
  ).run(status ?? null, nextAction ?? null, now, req.params.id);
  res.json({ updated: true });
});

app.get('/api/admin/export', requireAdmin, (_req, res) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    curriculumOverrides: db.prepare('SELECT * FROM curriculum_overrides').all(),
    programs: db.prepare('SELECT * FROM programs').all(),
    inquiries: db.prepare('SELECT * FROM inquiries').all(),
    subscribers: db
      .prepare('SELECT id, email, consent_updates, consent_reminders, interest_program, unsubscribed_at, created_at FROM subscribers')
      .all(),
    readiness: db.prepare('SELECT * FROM readiness_items').all(),
    editorialRevisions: db.prepare('SELECT * FROM editorial_revisions').all(),
    analyticsCounts: db
      .prepare('SELECT event_name, COUNT(*) as count FROM analytics_events GROUP BY event_name')
      .all(),
  };
  res.setHeader('Content-Disposition', 'attachment; filename="strategic-thinking-admin-export.json"');
  res.json(exportData);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
