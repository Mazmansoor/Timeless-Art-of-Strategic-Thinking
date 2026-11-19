import React, { useCallback, useEffect, useState } from 'react';
import { Download, Lock, RefreshCw } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext.tsx';
import { usePageSeo } from '../lib/seo.ts';

interface AdminOverview {
  inquiries: Array<{
    id: string;
    name: string;
    work_email: string;
    organization: string;
    challenge: string;
    audience_size: string;
    timing: string;
    desired_outcome: string;
    status: string;
    forwarded_externally: number;
    created_at: string;
  }>;
  subscribers: Array<{
    id: string;
    email: string;
    consent_updates: number;
    consent_reminders: number;
    interest_program: string | null;
    unsubscribed_at: string | null;
    created_at: string;
  }>;
  readiness: Array<{
    id: string;
    item: string;
    category: string;
    status: string;
    impact: string;
    next_action: string;
  }>;
  revisions: Array<{
    id: string;
    entity_type: string;
    entity_id: string;
    editor_email: string;
    summary: string;
    created_at: string;
  }>;
  overrides: Array<{
    module_number: number;
    published: number;
    headline: string;
    summary: string;
  }>;
  metrics: Array<{ event_name: string; count: number }>;
  userCount: number;
}

export default function AdminPage() {
  usePageSeo({
    title: 'Administration & Readiness',
    description: 'Protected content administration, source readiness, and program operations.',
    canonicalPath: '/admin',
  });

  const { user, login, logout, programs, subjects, refreshCatalog } = usePlatform();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoadError(null);
    const res = await fetch('/api/admin/overview');
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setLoadError(data.error ?? 'Access denied.');
      setOverview(null);
      return;
    }
    const data = (await res.json()) as AdminOverview;
    setOverview(data);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOverview();
    } else {
      setOverview(null);
    }
  }, [user, fetchOverview]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await login(email, password);
    if (!res.ok) {
      setAuthError(res.error ?? 'Sign-in failed.');
    } else {
      setPassword('');
    }
  };

  const toggleModulePublish = async (modNum: number, currentPublished: boolean) => {
    setActionMsg(null);
    const res = await fetch(`/api/admin/curriculum/${modNum}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !currentPublished }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setActionMsg(data.error ?? 'Update failed.');
      return;
    }
    setActionMsg(`Updated Module ${String(modNum).padStart(2, '0')}.`);
    await Promise.all([fetchOverview(), refreshCatalog()]);
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOverview();
    }
  };

  const updateProgram = async (
    id: string,
    status: string,
    priceLabel: string,
    priceCents: number | null,
  ) => {
    const res = await fetch(`/api/admin/programs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, priceLabel, priceCents }),
    });
    if (res.ok) {
      setActionMsg('Updated program availability & rate.');
      await Promise.all([fetchOverview(), refreshCatalog()]);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-5 sm:px-8 py-16 space-y-6">
        <div className="bg-white border border-[#D8CFBE] rounded-lg p-7 space-y-5">
          <div className="flex items-center gap-2.5 text-[#0D1B2A]">
            <Lock className="w-5 h-5 text-[#9A742B]" />
            <h1 className="font-serif text-2xl font-medium">Administrator Sign-In Required</h1>
          </div>
          <p className="text-xs text-[#525866] leading-relaxed">
            Administration endpoints enforce server-side session verification and role authorization
            (HTTP 401/403). Ordinary learner accounts cannot access readiness inventories,
            inquiries, or publication controls.
          </p>

          {user && user.role !== 'admin' && (
            <div className="p-3 rounded bg-[#F7F1E1] border border-[#9A742B]/40 text-xs text-[#3F2E0D] space-y-2">
              <p>
                Signed in as <strong>{user.email}</strong> (role: <code>{user.role}</code>).
                Administrator role required.
              </p>
              <button type="button" onClick={logout} className="underline font-medium">
                Sign out to switch accounts
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label htmlFor="adm-email" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Administrator Email
              </label>
              <input
                id="adm-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#D8CFBE] text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-pass" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Password
              </label>
              <input
                id="adm-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#D8CFBE] text-sm"
              />
            </div>
            {authError && <p className="text-xs text-[#7F1D1D]">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40]"
            >
              Authenticate Administrator
            </button>
          </form>

          <p className="text-[11px] text-[#525866] pt-2 border-t border-[#EFE9DC]">
            Environment setup: configure <code>ADMIN_EMAILS</code> and{' '}
            <code>ADMIN_BOOTSTRAP_PASSWORD</code> in server secrets to provision the administrator
            account on startup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2DACB]">
        <div>
          <p className="text-xs font-mono text-[#9A742B]">
            Server-Verified Administrator · {user.email}
          </p>
          <h1 className="font-serif text-3xl font-medium text-[#0D1B2A]">
            Content Readiness, Inquiries &amp; Commercial Operations
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOverview}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[#D8CFBE] bg-white text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <a
            href="/api/admin/export"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Export Admin JSON
          </a>
        </div>
      </header>

      {actionMsg && (
        <p className="p-3 rounded bg-[#EBF2EE] border border-[#244C3C]/30 text-xs text-[#173328]">
          {actionMsg}
        </p>
      )}
      {loadError && (
        <p className="p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#7F1D1D]">
          {loadError}
        </p>
      )}

      {overview && (
        <>
          {/* Privacy-Safe Learning & Commercial Metrics */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
              Aggregate Learning &amp; Commercial Metrics (Zero Private Prose Tracked)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-[#E2DACB] rounded p-3.5">
                <p className="text-[11px] text-[#525866]">Registered Accounts</p>
                <p className="font-mono text-xl font-semibold text-[#0D1B2A] tabular-nums mt-1">
                  {overview.userCount}
                </p>
              </div>
              <div className="bg-white border border-[#E2DACB] rounded p-3.5">
                <p className="text-[11px] text-[#525866]">Team Inquiries</p>
                <p className="font-mono text-xl font-semibold text-[#0D1B2A] tabular-nums mt-1">
                  {overview.inquiries.length}
                </p>
              </div>
              <div className="bg-white border border-[#E2DACB] rounded p-3.5">
                <p className="text-[11px] text-[#525866]">Consent Subscribers</p>
                <p className="font-mono text-xl font-semibold text-[#0D1B2A] tabular-nums mt-1">
                  {overview.subscribers.filter((s) => !s.unsubscribed_at).length}
                </p>
              </div>
              {overview.metrics.map((m) => (
                <div key={m.event_name} className="bg-white border border-[#E2DACB] rounded p-3.5">
                  <p className="text-[11px] text-[#525866] truncate">{m.event_name}</p>
                  <p className="font-mono text-xl font-semibold text-[#244C3C] tabular-nums mt-1">
                    {m.count}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Administrator-Only Missing Inputs & Readiness Inventory */}
          <section className="bg-white border border-[#D8CFBE] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F3EEE3] border-b border-[#E2DACB]">
              <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
                Missing Source &amp; Readiness Inventory (Admin Only)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F0] border-b border-[#E2DACB] text-[#525866]">
                  <tr>
                    <th className="p-3 font-medium">Dependency / Source</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Impact</th>
                    <th className="p-3 font-medium">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {overview.readiness.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-medium text-[#0D1B2A]">{r.item}</td>
                      <td className="p-3 text-[#525866]">{r.category}</td>
                      <td className="p-3 font-mono text-[#9A742B]">{r.status}</td>
                      <td className="p-3 text-[#3C424D]">{r.impact}</td>
                      <td className="p-3 text-[#244C3C]">{r.next_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Curriculum Publication Controls */}
          <section className="bg-white border border-[#E2DACB] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F3EEE3] border-b border-[#E2DACB]">
              <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
                Canonical 24-Subject Publication Controls
              </h2>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F0] border-b border-[#E2DACB] sticky top-0">
                  <tr>
                    <th className="p-3 font-medium">Mod</th>
                    <th className="p-3 font-medium">Academic Subject</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {subjects.map((s) => (
                    <tr key={s.moduleNumber}>
                      <td className="p-3 font-mono tabular-nums">
                        {String(s.moduleNumber).padStart(2, '0')} ({s.stageLabel})
                      </td>
                      <td className="p-3 font-medium text-[#0D1B2A]">{s.academicSubject}</td>
                      <td className="p-3">{s.published ? 'Published' : 'Unpublished'}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleModulePublish(s.moduleNumber, s.published)}
                          className="px-2.5 py-1 rounded border border-[#D8CFBE] hover:bg-[#F3EEE3]"
                        >
                          {s.published ? 'Unpublish' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Editable Commercial Programs */}
          <section className="bg-white border border-[#E2DACB] rounded-lg p-5 space-y-4">
            <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
              Program Availability &amp; Editable Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {programs.map((p) => (
                <ProgramEditorCard key={p.id} program={p} onSave={updateProgram} />
              ))}
            </div>
          </section>

          {/* Inquiries & Consent Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white border border-[#E2DACB] rounded-lg p-5 space-y-3">
              <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
                Organizational Inquiries
              </h2>
              {overview.inquiries.length === 0 ? (
                <p className="text-xs text-[#525866]">No inquiries recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {overview.inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 rounded bg-[#FAF7F0] border border-[#E2DACB] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-[#0D1B2A]">
                          {inq.organization} · {inq.name}
                        </strong>
                        <select
                          value={inq.status}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                          className="px-2 py-1 rounded border border-[#D8CFBE] bg-white"
                        >
                          <option value="new">new</option>
                          <option value="reviewing">reviewing</option>
                          <option value="scoped">scoped</option>
                          <option value="archived">archived</option>
                        </select>
                      </div>
                      <p className="text-[#525866]">
                        {inq.work_email} · {inq.audience_size} · {inq.timing}
                      </p>
                      <p className="text-[#1B1E23]">{inq.challenge}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white border border-[#E2DACB] rounded-lg p-5 space-y-3">
              <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
                Editorial Revision History
              </h2>
              {overview.revisions.length === 0 ? (
                <p className="text-xs text-[#525866]">No editorial revisions logged yet.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {overview.revisions.map((rev) => (
                    <li key={rev.id} className="pb-2 border-b border-[#EFE9DC] last:border-b-0">
                      <span className="font-mono text-[#525866]">
                        {new Date(rev.created_at).toLocaleString()}
                      </span>{' '}
                      — {rev.summary} ({rev.editor_email})
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function ProgramEditorCard({
  program,
  onSave,
}: {
  program: {
    id: string;
    title: string;
    status: string;
    priceLabel: string;
    priceCents: number | null;
  };
  onSave: (id: string, status: string, priceLabel: string, priceCents: number | null) => void;
}) {
  const [status, setStatus] = useState(program.status);
  const [priceLabel, setPriceLabel] = useState(program.priceLabel);
  const [centsText, setCentsText] = useState(
    program.priceCents !== null ? String(program.priceCents) : '',
  );

  return (
    <div className="p-4 rounded border border-[#E2DACB] bg-[#FAF7F0] space-y-2.5 text-xs">
      <p className="font-semibold text-[#0D1B2A]">{program.title}</p>
      <div>
        <label className="block text-[11px] text-[#525866] mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-[#D8CFBE] bg-white"
        >
          <option value="Available">Available</option>
          <option value="Waitlist / Inquiry">Waitlist / Inquiry</option>
          <option value="Planned">Planned</option>
        </select>
      </div>
      <div>
        <label className="block text-[11px] text-[#525866] mb-1">Display Rate Label</label>
        <input
          type="text"
          value={priceLabel}
          onChange={(e) => setPriceLabel(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-[#D8CFBE] bg-white"
        />
      </div>
      <div>
        <label className="block text-[11px] text-[#525866] mb-1">Checkout Cents (Optional)</label>
        <input
          type="number"
          value={centsText}
          onChange={(e) => setCentsText(e.target.value)}
          placeholder="e.g. 45000 for $450"
          className="w-full px-2 py-1.5 rounded border border-[#D8CFBE] bg-white font-mono"
        />
      </div>
      <button
        type="button"
        onClick={() =>
          onSave(program.id, status, priceLabel, centsText.trim() ? Number(centsText) : null)
        }
        className="w-full py-1.5 rounded bg-[#0D1B2A] text-[#FAF7F0] font-medium"
      >
        Save Offer Settings
      </button>
    </div>
  );
}
