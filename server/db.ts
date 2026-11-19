import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { CANONICAL_CURRICULUM } from '../src/data/curriculum.ts';
import { DEFAULT_PROGRAMS, DEFAULT_READINESS_ITEMS } from '../src/data/library.ts';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'platform.db');
export const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'learner',
    entitlements_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    review_reminder_date TEXT,
    reminder_frequency TEXT NOT NULL DEFAULT 'none',
    snapshot_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS decision_versions (
    id TEXT PRIMARY KEY,
    decision_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    change_note TEXT NOT NULL,
    snapshot_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS curriculum_overrides (
    module_number INTEGER PRIMARY KEY,
    published INTEGER NOT NULL,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS editorial_revisions (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    editor_email TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    tier TEXT NOT NULL,
    status TEXT NOT NULL,
    price_label TEXT NOT NULL,
    price_cents INTEGER,
    schedule_note TEXT NOT NULL,
    summary TEXT NOT NULL,
    included_json TEXT NOT NULL,
    excluded_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    organization TEXT NOT NULL,
    challenge TEXT NOT NULL,
    audience_size TEXT NOT NULL,
    timing TEXT NOT NULL,
    desired_outcome TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    forwarded_externally INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    consent_updates INTEGER NOT NULL DEFAULT 0,
    consent_reminders INTEGER NOT NULL DEFAULT 0,
    interest_program TEXT,
    unsubscribe_token TEXT NOT NULL,
    unsubscribed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    meta_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    program_id TEXT NOT NULL,
    status TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS readiness_items (
    id TEXT PRIMARY KEY,
    item TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    impact TEXT NOT NULL,
    next_action TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS draft_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    tool_label TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    linked_module_number INTEGER NOT NULL,
    patch_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS learning_progress (
    user_id TEXT NOT NULL,
    module_number INTEGER NOT NULL,
    slug TEXT NOT NULL,
    academic_subject TEXT NOT NULL,
    stage_label TEXT NOT NULL,
    status TEXT NOT NULL,
    selected_practice_option TEXT,
    last_visited_at TEXT NOT NULL,
    practice_completed_at TEXT,
    PRIMARY KEY (user_id, module_number),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

export function seedDatabase(): void {
  const now = new Date().toISOString();

  const existingModules = db.prepare('SELECT COUNT(*) as count FROM curriculum_overrides').get() as {
    count: number;
  };
  if (existingModules.count === 0) {
    const insertMod = db.prepare(
      `INSERT INTO curriculum_overrides (module_number, published, headline, summary, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const mod of CANONICAL_CURRICULUM) {
      insertMod.run(mod.moduleNumber, mod.published ? 1 : 0, mod.headline, mod.summary, 'system-seed', now);
    }
  }

  const existingPrograms = db.prepare('SELECT COUNT(*) as count FROM programs').get() as { count: number };
  if (existingPrograms.count === 0) {
    const insertProg = db.prepare(
      `INSERT INTO programs (id, slug, title, tier, status, price_label, price_cents, schedule_note, summary, included_json, excluded_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const p of DEFAULT_PROGRAMS) {
      insertProg.run(
        p.id,
        p.slug,
        p.title,
        p.tier,
        p.status,
        p.priceLabel,
        p.priceCents,
        p.scheduleNote,
        p.summary,
        JSON.stringify(p.includedItems),
        JSON.stringify(p.excludedBoundaries),
        now,
      );
    }
  }

  const existingReadiness = db.prepare('SELECT COUNT(*) as count FROM readiness_items').get() as {
    count: number;
  };
  if (existingReadiness.count === 0) {
    const insertReady = db.prepare(
      `INSERT INTO readiness_items (id, item, category, status, impact, next_action, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const r of DEFAULT_READINESS_ITEMS) {
      insertReady.run(r.id, r.item, r.category, r.status, r.impact, r.nextAction, now);
    }
  }

  // Optional admin bootstrap strictly governed by environment secrets
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (adminEmails.length > 0 && bootstrapPassword && bootstrapPassword.length >= 10) {
    const primaryAdmin = adminEmails[0];
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(primaryAdmin) as
      | { id: string }
      | undefined;
    if (!existing) {
      db.prepare(
        `INSERT INTO users (id, email, name, password_hash, role, entitlements_json, created_at)
         VALUES (?, ?, ?, ?, 'admin', '["open-foundation"]', ?)`,
      ).run(crypto.randomUUID(), primaryAdmin, 'Platform Administrator', hashPassword(bootstrapPassword), now);
    }
  }
}

export const ALLOWED_ANALYTICS_EVENTS = new Set([
  'challenge_started',
  'challenge_completed',
  'lesson_started',
  'lesson_completed',
  'tool_applied',
  'portfolio_saved',
  'portfolio_revisited',
  'subscriber_consent_recorded',
  'qualified_inquiry',
  'program_purchase',
  'repeat_participation',
]);

export function recordAnalyticsEvent(eventName: string, meta: Record<string, string | number | boolean> = {}): void {
  if (!ALLOWED_ANALYTICS_EVENTS.has(eventName)) return;
  // Never store learner prose in analytics; whitelist primitive numeric/slug metadata only
  const safeMeta: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (['moduleNumber', 'toolId', 'programId', 'step', 'count'].includes(k)) {
      safeMeta[k] = v;
    }
  }
  db.prepare(
    `INSERT INTO analytics_events (id, event_name, meta_json, created_at) VALUES (?, ?, ?, ?)`,
  ).run(crypto.randomUUID(), eventName, JSON.stringify(safeMeta), new Date().toISOString());
}
