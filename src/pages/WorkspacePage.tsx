import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Download,
  FileEdit,
  GitCompare,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
  UserCheck,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext.tsx';
import {
  createEmptySnapshot,
  DIFFABLE_FIELDS,
  downloadTextFile,
  formatDecisionMemorandumMarkdown,
} from '../lib/portfolioUtils.ts';
import { usePageSeo } from '../lib/seo.ts';
import type {
  DecisionRecord,
  DecisionSnapshot,
  DecisionStatus,
  DraftAnalysisRecord,
} from '../types.ts';

type WorkspaceTab = 'overview' | 'decisions' | 'drafts' | 'progress' | 'editor';

const STATUS_OPTIONS: DecisionStatus[] = [
  'Draft saved',
  'Analysis completed',
  'Reviewed by another person',
  'Revised following new evidence',
  'Outcome recorded',
];

const WORKSPACE_TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'decisions', label: 'Saved Decisions' },
  { id: 'drafts', label: 'Draft Analyses' },
  { id: 'progress', label: 'Learning Progress' },
  { id: 'editor', label: 'Decision Editor' },
];

export default function WorkspacePage() {
  usePageSeo({
    title: 'My Workspace — Saved Decisions, Draft Analyses & Learning Progress',
    description:
      'Review saved decisions, resume in-progress Strategy Lab draft analyses, track recent curriculum progress, and compare dated decision revisions.',
    canonicalPath: '/workspace',
  });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    user,
    storageMode,
    subjects,
    decisions,
    draftAnalyses,
    learningProgress,
    login,
    register,
    logout,
    saveNewDecision,
    updateDecision,
    deleteDecision,
    deleteDraftAnalysis,
    promoteDraftToDecision,
    setActiveDraftSnapshot,
    setActiveDraftMeta,
    importDecisions,
  } = usePlatform();

  const rawTab = searchParams.get('tab') as WorkspaceTab | null;
  const activeTab: WorkspaceTab = WORKSPACE_TABS.some((t) => t.id === rawTab)
    ? (rawTab as WorkspaceTab)
    : 'overview';

  const setTab = (tab: WorkspaceTab) => {
    if (tab === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  // Partition saved decisions vs draft decision records
  const savedDecisions = useMemo(
    () => decisions.filter((d) => d.snapshot.status !== 'Draft saved'),
    [decisions],
  );
  const portfolioDraftDecisions = useMemo(
    () => decisions.filter((d) => d.snapshot.status === 'Draft saved'),
    [decisions],
  );

  // Published Part I modules for progress tracking
  const publishedModules = useMemo(() => subjects.filter((s) => s.published), [subjects]);
  const progressByModule = useMemo(() => {
    const map = new Map(learningProgress.map((p) => [p.moduleNumber, p]));
    return map;
  }, [learningProgress]);

  const completedPracticeCount = useMemo(
    () => learningProgress.filter((p) => p.status === 'Guided practice completed').length,
    [learningProgress],
  );
  const scheduledReviewsCount = useMemo(
    () => savedDecisions.filter((d) => Boolean(d.reviewReminderDate)).length,
    [savedDecisions],
  );

  // Saved Decisions filter (when on Saved Decisions tab)
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [decisionSearch, setDecisionSearch] = useState('');

  // Editor state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [draft, setDraft] = useState<DecisionSnapshot>(createEmptySnapshot());
  const [changeNote, setChangeNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderFreq, setReminderFreq] = useState<'none' | 'once' | 'monthly'>('none');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [workspaceNotice, setWorkspaceNotice] = useState<string | null>(null);

  // Version comparison state
  const [showCompare, setShowCompare] = useState(false);
  const [verAId, setVerAId] = useState<string>('');
  const [verBId, setVerBId] = useState<string>('');

  // Auth panel state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthPanel, setShowAuthPanel] = useState(false);

  const selectedDecision = decisions.find((d) => d.id === selectedId) ?? null;

  useEffect(() => {
    if (!creatingNew && decisions.length > 0 && !selectedDecision) {
      const first = decisions[0];
      setSelectedId(first.id);
      setDraft({ ...first.snapshot });
      setReminderDate(first.reviewReminderDate ?? '');
      setReminderFreq(first.reminderFrequency ?? 'none');
      if (first.versions.length >= 2) {
        setVerAId(first.versions[0].id);
        setVerBId(first.versions[first.versions.length - 1].id);
      } else if (first.versions.length === 1) {
        setVerAId(first.versions[0].id);
        setVerBId(first.versions[0].id);
      }
    }
  }, [decisions, selectedDecision, creatingNew]);

  const handleSelectDecision = (dec: DecisionRecord, openInEditor = false, openCompare = false) => {
    setCreatingNew(false);
    setSelectedId(dec.id);
    setDraft({ ...dec.snapshot });
    setReminderDate(dec.reviewReminderDate ?? '');
    setReminderFreq(dec.reminderFrequency ?? 'none');
    setChangeNote('');
    setSaveFeedback(null);
    setShowCompare(openCompare && dec.versions.length >= 2);
    if (dec.versions.length >= 2) {
      setVerAId(dec.versions[0].id);
      setVerBId(dec.versions[dec.versions.length - 1].id);
    } else if (dec.versions[0]) {
      setVerAId(dec.versions[0].id);
      setVerBId(dec.versions[0].id);
    }
    if (openInEditor) {
      setTab('editor');
    }
  };

  const handleStartNew = () => {
    setCreatingNew(true);
    setSelectedId(null);
    setDraft(createEmptySnapshot());
    setReminderDate('');
    setReminderFreq('none');
    setChangeNote('Initial baseline recorded');
    setSaveFeedback(null);
    setShowCompare(false);
    setTab('editor');
  };

  const handleResumeDraftInLab = (item: DraftAnalysisRecord) => {
    setActiveDraftSnapshot(item.snapshotPatch);
    setActiveDraftMeta({
      draftId: item.id,
      toolId: item.toolId,
      toolLabel: item.toolLabel,
      title: item.title,
      summary: item.summary,
    });
    navigate(`/strategy-lab?tool=${item.toolId}`);
  };

  const handlePromoteDraft = async (item: DraftAnalysisRecord) => {
    setWorkspaceNotice(null);
    const res = await promoteDraftToDecision(item);
    if (res.ok && res.decision) {
      handleSelectDecision(res.decision, true, false);
      setSaveFeedback(`Promoted "${item.title}" to your Saved Decisions.`);
    } else {
      setWorkspaceNotice(res.error ?? 'Could not promote draft analysis.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback(null);
    if (creatingNew || !selectedDecision) {
      const res = await saveNewDecision(
        draft,
        changeNote || 'Initial decision record created',
        reminderDate || null,
        reminderFreq,
      );
      if (res.ok && res.decision) {
        setCreatingNew(false);
        setSelectedId(res.decision.id);
        setChangeNote('');
        setSaveFeedback('Decision saved with Version 1 snapshot.');
      } else {
        setSaveFeedback(res.error ?? 'Could not save decision.');
      }
    } else {
      const res = await updateDecision(
        selectedDecision.id,
        draft,
        changeNote || `Revision v${selectedDecision.versions.length + 1}`,
        reminderDate || null,
        reminderFreq,
      );
      if (res.ok) {
        setChangeNote('');
        setSaveFeedback('New dated version appended to decision history.');
      } else {
        setSaveFeedback(res.error ?? 'Could not save revision.');
      }
    }
  };

  const handleExportMemo = (targetDecision?: DecisionRecord) => {
    const rec = targetDecision ?? selectedDecision;
    if (!rec) return;
    const snap = targetDecision ? targetDecision.snapshot : draft;
    const md = formatDecisionMemorandumMarkdown({
      ...rec,
      snapshot: snap,
    });
    const safeSlug = (snap.title || 'decision')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 48);
    downloadTextFile(`${safeSlug}-memorandum.md`, md, 'text/markdown;charset=utf-8');
  };

  const handleExportArchiveJson = async () => {
    if (user) {
      const res = await fetch('/api/account/export');
      if (res.ok) {
        const text = await res.text();
        downloadTextFile('my-workspace-account-export.json', text, 'application/json');
        return;
      }
    }
    downloadTextFile(
      'my-workspace-local-export.json',
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          decisions,
          draftAnalyses,
          learningProgress,
        },
        null,
        2,
      ),
      'application/json',
    );
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { decisions?: DecisionRecord[] } | DecisionRecord[];
      const list = Array.isArray(parsed) ? parsed : parsed.decisions ?? [];
      const res = await importDecisions(list);
      setWorkspaceNotice(
        res.ok ? `Imported ${res.count} decision record(s).` : res.error ?? 'Import failed.',
      );
    } catch {
      setWorkspaceNotice('Invalid JSON study export file.');
    }
    e.target.value = '';
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res =
      authMode === 'login'
        ? await login(authEmail, authPassword)
        : await register(authEmail, authName, authPassword);
    if (!res.ok) {
      setAuthError(res.error ?? 'Authentication failed.');
    } else {
      setShowAuthPanel(false);
      setAuthPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const res = await fetch('/api/account', { method: 'DELETE' });
    if (res.ok) {
      await logout();
      setSaveFeedback('Account and server-stored workspace data permanently deleted.');
    }
  };

  const filteredSavedDecisions = useMemo(() => {
    return savedDecisions.filter((d) => {
      const matchesStatus = decisionFilter === 'ALL' || d.snapshot.status === decisionFilter;
      const q = decisionSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        d.snapshot.title.toLowerCase().includes(q) ||
        d.snapshot.context.toLowerCase().includes(q) ||
        d.snapshot.recommendation.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [savedDecisions, decisionFilter, decisionSearch]);

  const totalDraftsCount = portfolioDraftDecisions.length + draftAnalyses.length;
  const verA = selectedDecision?.versions.find((v) => v.id === verAId);
  const verB = selectedDecision?.versions.find((v) => v.id === verBId);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-8">
      {/* Workspace Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-[#E2DACB]">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
            My Workspace
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#0D1B2A]">
            Saved Decisions, Draft Analyses &amp; Learning Progress
          </h1>
          <p className="text-xs text-[#525866]">
            Storage Mode:{' '}
            <strong className="text-[#0D1B2A]">
              {storageMode === 'server-account'
                ? `Private Server Workspace (${user?.email})`
                : 'Browser-Local Study Storage (private to this browser)'}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#D8CFBE] bg-white text-[#0D1B2A] hover:bg-[#F3EEE3] cursor-pointer whitespace-nowrap shrink-0">
            <Upload className="w-3.5 h-3.5" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImportFile} className="sr-only" />
          </label>
          <button
            type="button"
            onClick={handleExportArchiveJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#D8CFBE] bg-white text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Workspace JSON
          </button>
          <button
            type="button"
            onClick={handleStartNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-[#244C3C] text-[#FAF7F0] hover:bg-[#1B3A2E] whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            New Decision
          </button>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-[#0D1B2A] text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthPanel((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[#0D1B2A] text-[#FAF7F0] hover:bg-[#162A40] whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Sign in / Save Privately
            </button>
          )}
        </div>
      </header>

      {/* Optional Account Panel */}
      {showAuthPanel && !user && (
        <section className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-6 max-w-xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
              {authMode === 'login' ? 'Sign In to Private Workspace' : 'Create Private Account'}
            </h2>
            <button
              type="button"
              onClick={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}
              className="text-xs font-medium text-[#244C3C] underline whitespace-nowrap"
            >
              {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}
            </button>
          </div>
          <p className="text-xs text-[#525866]">
            Private accounts store saved decisions, Strategy Lab draft analyses, and module study
            progress isolated strictly to your account. Registration never enrolls you in marketing
            communications.
          </p>
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {authMode === 'register' && (
              <div>
                <label htmlFor="ws-name" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                  Full Name
                </label>
                <input
                  id="ws-name"
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
                />
              </div>
            )}
            <div>
              <label htmlFor="ws-email" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Email
              </label>
              <input
                id="ws-email"
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="ws-pass" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Password (min. 8 characters)
              </label>
              <input
                id="ws-pass"
                type="password"
                required
                minLength={8}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
            {authError && <p className="text-xs text-[#7F1D1D]">{authError}</p>}
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </section>
      )}

      {workspaceNotice && (
        <div className="p-3.5 rounded-md bg-[#EBF2EE] border border-[#244C3C]/30 text-xs text-[#173328]">
          {workspaceNotice}
        </div>
      )}

      {/* Three-Column Workspace Ledger */}
      <section
        aria-label="Workspace summary counts"
        className="grid grid-cols-1 md:grid-cols-3 border border-[#E2DACB] rounded-lg bg-white divide-y md:divide-y-0 md:divide-x divide-[#E2DACB]"
      >
        <div className="p-5 space-y-1">
          <p className="text-xs font-medium text-[#525866]">Saved Decisions</p>
          <p className="font-serif text-3xl font-medium text-[#0D1B2A] tabular-nums">
            {savedDecisions.length}
          </p>
          <p className="text-xs text-[#525866] tabular-nums">
            {scheduledReviewsCount} with scheduled review dates
          </p>
        </div>

        <div className="p-5 space-y-1">
          <p className="text-xs font-medium text-[#525866]">Draft Analyses</p>
          <p className="font-serif text-3xl font-medium text-[#0D1B2A] tabular-nums">
            {totalDraftsCount}
          </p>
          <p className="text-xs text-[#525866] tabular-nums">
            {draftAnalyses.length} Strategy Lab · {portfolioDraftDecisions.length} Portfolio drafts
          </p>
        </div>

        <div className="p-5 space-y-1">
          <p className="text-xs font-medium text-[#525866]">Recent Learning Progress</p>
          <p className="font-serif text-3xl font-medium text-[#0D1B2A] tabular-nums">
            {learningProgress.length} of {publishedModules.length}
          </p>
          <p className="text-xs text-[#525866] tabular-nums">
            Part I modules opened · {completedPracticeCount} guided practice completed
          </p>
        </div>
      </section>

      {/* Workspace Navigation Tabs */}
      <nav
        aria-label="Workspace sections"
        className="flex flex-wrap gap-1.5 p-1.5 bg-[#F3EEE3] border border-[#E2DACB] rounded-lg"
      >
        {WORKSPACE_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-[#0D1B2A] text-[#FAF7F0] shadow-sm'
                  : 'text-[#3C424D] hover:bg-white hover:text-[#0D1B2A]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* TAB 1: OVERVIEW (Displays Saved Decisions, Draft Analyses, and Recent Learning Progress) */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* 1. Saved Decisions */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E2DACB]">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                  Saved Decisions
                </h2>
                <p className="text-xs text-[#525866]">
                  Completed analyses, peer-reviewed judgments, revised choices, and recorded outcomes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab('decisions')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#244C3C] hover:underline whitespace-nowrap shrink-0"
              >
                View all saved decisions ({savedDecisions.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {savedDecisions.length === 0 ? (
              <div className="bg-white border border-[#E2DACB] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <p className="text-sm font-medium text-[#0D1B2A]">
                    No finalized decision records yet
                  </p>
                  <p className="text-xs text-[#525866] leading-relaxed">
                    Start a decision memorandum in the Editor, save a completed run from any Strategy
                    Lab tool, or promote one of your Draft Analyses below.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="px-4 py-2 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium whitespace-nowrap"
                  >
                    Create Decision Record
                  </button>
                  <Link
                    to="/strategy-lab"
                    className="px-4 py-2 rounded-md border border-[#D8CFBE] bg-[#FAF7F0] text-[#0D1B2A] text-xs font-medium whitespace-nowrap"
                  >
                    Open Strategy Lab
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
                {savedDecisions.slice(0, 4).map((dec) => (
                  <div
                    key={dec.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-serif text-lg font-medium text-[#0D1B2A] truncate">
                        {dec.snapshot.title || 'Untitled Decision'}
                      </h3>
                      <p className="text-xs text-[#525866] flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-[#244C3C]">{dec.snapshot.status}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          v{dec.versions.length}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Updated {new Date(dec.updatedAt).toLocaleDateString()}
                        </span>
                        {dec.reviewReminderDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums text-[#9A742B]">
                              Review scheduled {dec.reviewReminderDate}
                            </span>
                          </>
                        )}
                      </p>
                      {(dec.snapshot.recommendation || dec.snapshot.context) && (
                        <p className="text-xs text-[#3C424D] line-clamp-2 max-w-3xl">
                          {dec.snapshot.recommendation || dec.snapshot.context}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectDecision(dec, true, false)}
                        className="px-3 py-1.5 rounded border border-[#0D1B2A] bg-[#FAF7F0] text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                      >
                        Open in Editor
                      </button>
                      {dec.versions.length >= 2 && (
                        <button
                          type="button"
                          onClick={() => handleSelectDecision(dec, true, true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          Compare
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleExportMemo(dec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Memo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. Draft Analyses */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E2DACB]">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                  Draft Analyses
                </h2>
                <p className="text-xs text-[#525866]">
                  In-progress Strategy Lab worksheets and portfolio records still marked Draft saved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab('drafts')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#244C3C] hover:underline whitespace-nowrap shrink-0"
              >
                Manage all drafts ({totalDraftsCount})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {totalDraftsCount === 0 ? (
              <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <p className="text-sm font-medium text-[#0D1B2A]">No draft analyses saved</p>
                  <p className="text-xs text-[#525866] leading-relaxed">
                    While testing hypotheses in Problem-Framing, Systems Explorer, Decision
                    Comparison, or Scenario Stress Test, choose &ldquo;Save Draft&rdquo; to pause
                    and resume here later.
                  </p>
                </div>
                <Link
                  to="/strategy-lab"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#0D1B2A] text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Launch Strategy Lab
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
                {draftAnalyses.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-serif text-lg font-medium text-[#0D1B2A] truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#525866] flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[#9A742B] font-medium">Strategy Lab Draft</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.toolLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Module {String(item.linkedModuleNumber).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Saved {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </p>
                      {item.summary && (
                        <p className="text-xs text-[#3C424D] line-clamp-2 max-w-3xl">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleResumeDraftInLab(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium hover:bg-[#162A40] whitespace-nowrap"
                      >
                        Resume in Lab
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePromoteDraft(item)}
                        className="px-3 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                      >
                        Promote to Decision
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDraftAnalysis(item.id)}
                        aria-label={`Delete draft ${item.title}`}
                        className="p-1.5 rounded border border-[#D8CFBE] bg-white text-[#7F1D1D] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {portfolioDraftDecisions.slice(0, 3).map((dec) => (
                  <div
                    key={dec.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-serif text-lg font-medium text-[#0D1B2A] truncate">
                        {dec.snapshot.title || 'Untitled Draft'}
                      </h3>
                      <p className="text-xs text-[#525866] flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[#9A742B] font-medium">Portfolio Draft</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">v{dec.versions.length}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Updated {new Date(dec.updatedAt).toLocaleDateString()}
                        </span>
                      </p>
                      {dec.snapshot.context && (
                        <p className="text-xs text-[#3C424D] line-clamp-2 max-w-3xl">
                          {dec.snapshot.context}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectDecision(dec, true, false)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium hover:bg-[#162A40] whitespace-nowrap"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        Continue in Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDecision(dec.id)}
                        aria-label={`Delete draft ${dec.snapshot.title}`}
                        className="p-1.5 rounded border border-[#D8CFBE] bg-white text-[#7F1D1D] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 3. Recent Learning Progress */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E2DACB]">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                  Recent Learning Progress
                </h2>
                <p className="text-xs text-[#525866]">
                  Modules opened and guided practice exercises completed. Study records reflect
                  engagement and practice—never mastery or validated judgment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab('progress')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#244C3C] hover:underline whitespace-nowrap shrink-0"
              >
                Full Part I study ledger
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
              {publishedModules.map((mod) => {
                const rec = progressByModule.get(mod.moduleNumber);
                return (
                  <div
                    key={mod.moduleNumber}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#525866]">
                        <span className="font-mono font-medium text-[#9A742B] tabular-nums">
                          Module {String(mod.moduleNumber).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Part {mod.part} ({mod.stageLabel})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            rec?.status === 'Guided practice completed'
                              ? 'font-medium text-[#244C3C]'
                              : rec
                                ? 'font-medium text-[#0D1B2A]'
                                : 'text-[#6B7280]'
                          }
                        >
                          {rec ? rec.status : 'Not yet opened'}
                        </span>
                        {rec && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              Last visited {new Date(rec.lastVisitedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-medium text-[#0D1B2A]">
                        {mod.academicSubject}
                      </h3>
                      {rec?.selectedPracticeOption ? (
                        <p className="text-xs text-[#3C424D]">
                          Recorded practice response: &ldquo;{rec.selectedPracticeOption}&rdquo;
                        </p>
                      ) : (
                        <p className="text-xs text-[#525866]">{mod.headline}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        to={`/learn/${mod.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#0D1B2A] bg-[#FAF7F0] text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {rec ? 'Continue Lesson' : 'Start Module'}
                      </Link>
                      {mod.linkedToolId && (
                        <Link
                          to={`/strategy-lab?tool=${mod.linkedToolId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                        >
                          Apply in Lab
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: SAVED DECISIONS */}
      {activeTab === 'decisions' && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EEE3] border border-[#E2DACB] rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', ...STATUS_OPTIONS.filter((s) => s !== 'Draft saved')].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDecisionFilter(st)}
                  className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap ${
                    decisionFilter === st
                      ? 'bg-[#0D1B2A] text-[#FAF7F0]'
                      : 'bg-white text-[#3C424D] border border-[#D8CFBE] hover:text-[#0D1B2A]'
                  }`}
                >
                  {st === 'ALL' ? 'All Saved' : st}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={decisionSearch}
              onChange={(e) => setDecisionSearch(e.target.value)}
              placeholder="Filter saved decisions..."
              aria-label="Filter saved decisions"
              className="px-3 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs w-full sm:w-64"
            />
          </div>

          {filteredSavedDecisions.length === 0 ? (
            <div className="bg-white border border-[#E2DACB] rounded-lg p-8 text-center space-y-3">
              <p className="text-sm font-medium text-[#0D1B2A]">
                No saved decisions match the current filter.
              </p>
              <p className="text-xs text-[#525866]">
                Records marked &ldquo;Draft saved&rdquo; appear under Draft Analyses until you
                update their status to Analysis completed or higher.
              </p>
              <button
                type="button"
                onClick={handleStartNew}
                className="px-4 py-2 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium"
              >
                Create New Decision Record
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
              {filteredSavedDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
                      {dec.snapshot.title}
                    </h2>
                    <p className="text-xs text-[#525866] flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-[#244C3C]">{dec.snapshot.status}</span>
                      <span aria-hidden="true">·</span>
                      <span>Owner: {dec.snapshot.owner || 'Unassigned'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {dec.versions.length} version(s)
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        Updated {new Date(dec.updatedAt).toLocaleDateString()}
                      </span>
                      {dec.reviewReminderDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums text-[#9A742B]">
                            Review date {dec.reviewReminderDate}
                          </span>
                        </>
                      )}
                    </p>
                    {(dec.snapshot.recommendation || dec.snapshot.context) && (
                      <p className="text-xs text-[#3C424D] max-w-3xl leading-relaxed">
                        {dec.snapshot.recommendation || dec.snapshot.context}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectDecision(dec, true, false)}
                      className="px-3.5 py-2 rounded border border-[#0D1B2A] bg-[#FAF7F0] text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                    >
                      Open in Editor
                    </button>
                    {dec.versions.length >= 2 && (
                      <button
                        type="button"
                        onClick={() => handleSelectDecision(dec, true, true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        Compare Versions
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleExportMemo(dec)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Memo
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDecision(dec.id)}
                      aria-label={`Delete decision ${dec.snapshot.title}`}
                      className="p-2 rounded border border-[#D8CFBE] bg-white text-[#7F1D1D] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: DRAFT ANALYSES */}
      {activeTab === 'drafts' && (
        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                Strategy Lab Draft Analyses ({draftAnalyses.length})
              </h2>
              <Link
                to="/strategy-lab"
                className="text-xs font-medium text-[#244C3C] hover:underline"
              >
                Open Strategy Lab Tools
              </Link>
            </div>
            {draftAnalyses.length === 0 ? (
              <div className="bg-white border border-[#E2DACB] rounded-lg p-6 text-xs text-[#525866]">
                No Strategy Lab tool drafts saved yet. Open any tool in the Strategy Lab and click
                &ldquo;Save Draft&rdquo; to keep unfinished analyses here.
              </div>
            ) : (
              <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
                {draftAnalyses.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-serif text-lg font-medium text-[#0D1B2A]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#525866] flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{item.toolLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Module {String(item.linkedModuleNumber).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Last saved {new Date(item.updatedAt).toLocaleString()}
                        </span>
                      </p>
                      {item.summary && (
                        <p className="text-xs text-[#3C424D] max-w-3xl leading-relaxed">
                          {item.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleResumeDraftInLab(item)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium hover:bg-[#162A40] whitespace-nowrap"
                      >
                        Resume in Strategy Lab
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePromoteDraft(item)}
                        className="px-3.5 py-2 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                      >
                        Promote to Saved Decision
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDraftAnalysis(item.id)}
                        aria-label={`Delete draft ${item.title}`}
                        className="p-2 rounded border border-[#D8CFBE] bg-white text-[#7F1D1D] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
              Portfolio Drafts Marked &ldquo;Draft saved&rdquo; ({portfolioDraftDecisions.length})
            </h2>
            {portfolioDraftDecisions.length === 0 ? (
              <div className="bg-white border border-[#E2DACB] rounded-lg p-6 text-xs text-[#525866]">
                No decision records currently carry the &ldquo;Draft saved&rdquo; status.
              </div>
            ) : (
              <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
                {portfolioDraftDecisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-serif text-lg font-medium text-[#0D1B2A]">
                        {dec.snapshot.title || 'Untitled Draft'}
                      </h3>
                      <p className="text-xs text-[#525866] flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{dec.snapshot.status}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {dec.versions.length} version(s)
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Updated {new Date(dec.updatedAt).toLocaleString()}
                        </span>
                      </p>
                      {dec.snapshot.context && (
                        <p className="text-xs text-[#3C424D] max-w-3xl leading-relaxed">
                          {dec.snapshot.context}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectDecision(dec, true, false)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium hover:bg-[#162A40] whitespace-nowrap"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        Continue in Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDecision(dec.id)}
                        aria-label={`Delete decision draft ${dec.snapshot.title}`}
                        className="p-2 rounded border border-[#D8CFBE] bg-white text-[#7F1D1D] hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: LEARNING PROGRESS */}
      {activeTab === 'progress' && (
        <section className="space-y-6">
          <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 space-y-1.5">
            <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
              Part I (Awaken) Study Ledger
            </h2>
            <p className="text-xs text-[#3C424D] leading-relaxed">
              This ledger tracks factual engagement—modules opened and guided practice exercises
              completed. Reading a module or completing an exercise does not imply mastery; durable
              judgment is tested by returning to decisions as new evidence arrives.
            </p>
          </div>

          <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
            {publishedModules.map((mod) => {
              const rec = progressByModule.get(mod.moduleNumber);
              return (
                <div
                  key={mod.moduleNumber}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#525866]">
                      <span className="font-mono font-medium text-[#9A742B] tabular-nums">
                        Module {String(mod.moduleNumber).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Part {mod.part} · {mod.stageLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          rec?.status === 'Guided practice completed'
                            ? 'font-medium text-[#244C3C]'
                            : rec
                              ? 'font-medium text-[#0D1B2A]'
                              : 'text-[#6B7280]'
                        }
                      >
                        {rec ? rec.status : 'Not yet opened'}
                      </span>
                      {rec && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            Last visited {new Date(rec.lastVisitedAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-serif text-xl font-medium text-[#0D1B2A]">
                      {mod.academicSubject}
                    </h3>
                    <p className="text-xs text-[#525866] max-w-3xl">{mod.summary}</p>
                    {rec?.selectedPracticeOption && (
                      <p className="text-xs text-[#244C3C] pt-1">
                        Selected guided practice option: &ldquo;{rec.selectedPracticeOption}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      to={`/learn/${mod.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#0D1B2A] bg-[#FAF7F0] text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {rec ? 'Revisit Lesson' : 'Open Lesson'}
                    </Link>
                    {mod.linkedToolId && (
                      <Link
                        to={`/strategy-lab?tool=${mod.linkedToolId}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
                      >
                        Open Tool
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#0D1B2A]">
                Parts II–VI (Modules 05–24) — Canonical Curriculum Scope
              </p>
              <p className="text-xs text-[#525866]">
                Twenty modules remain unpublished pending approved source texts. Corresponding
                Strategy Lab instruments (Decision Comparison, Scenario Stress Test, Stakeholder Map,
                Coherence Review) remain freely open for applied practice.
              </p>
            </div>
            <Link
              to="/learn"
              className="px-4 py-2 rounded-md border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap shrink-0"
            >
              Browse Full Curriculum
            </Link>
          </div>
        </section>
      )}

      {/* TAB 5: FULL DECISION EDITOR & VERSION COMPARISON */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar: Decision List */}
          <aside className="lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={handleStartNew}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40]"
            >
              <Plus className="w-4 h-4" />
              New Decision Record
            </button>

            <div className="bg-white border border-[#E2DACB] rounded-lg divide-y divide-[#EFE9DC]">
              {decisions.length === 0 ? (
                <div className="p-5 text-xs text-[#525866] leading-relaxed">
                  No decisions recorded yet. Start a new record here or save directly from any tool
                  in the Strategy Lab.
                </div>
              ) : (
                decisions.map((d) => {
                  const active = !creatingNew && d.id === selectedDecision?.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDecision(d, false, false)}
                      className={`w-full text-left p-4 transition-colors ${
                        active ? 'bg-[#F3EEE3]' : 'hover:bg-[#FAF7F0]'
                      }`}
                    >
                      <p className="font-medium text-sm text-[#0D1B2A] truncate">
                        {d.snapshot.title || 'Untitled Decision'}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#525866] mt-1 gap-2">
                        <span className="truncate">{d.snapshot.status}</span>
                        <span className="font-mono tabular-nums shrink-0">
                          {d.versions.length} ver · {new Date(d.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {user && (
              <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-[#0D1B2A]">Account Data Control</p>
                <p className="text-[11px] text-[#525866]">
                  Export your entire JSON workspace above or permanently delete your server account
                  and all decisions, drafts, and study records.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="text-xs text-[#7F1D1D] hover:underline"
                >
                  Delete My Account &amp; Data
                </button>
              </div>
            )}
          </aside>

          {/* Main Editor & Version Comparison */}
          <section className="lg:col-span-8 space-y-6">
            {selectedDecision && !creatingNew && (
              <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#3C424D]">
                  <span className="font-semibold text-[#0D1B2A] tabular-nums">
                    {selectedDecision.versions.length} Dated Version(s)
                  </span>{' '}
                  · Last saved {new Date(selectedDecision.updatedAt).toLocaleString()}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedDecision.versions.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setShowCompare((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#0D1B2A] bg-white text-xs font-medium text-[#0D1B2A]"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      {showCompare ? 'Hide Version Diff' : 'Compare Versions'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleExportMemo()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Memo (.md)
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDecision(selectedDecision.id)}
                    aria-label="Delete decision"
                    className="p-1.5 rounded border border-[#D8CFBE] bg-white text-[#7F1D1D] hover:bg-[#FEF2F2]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {showCompare && selectedDecision && selectedDecision.versions.length >= 2 && (
              <div className="bg-white border border-[#0D1B2A] rounded-lg p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2DACB]">
                  <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
                    Side-by-Side Version Comparison
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <select
                      value={verAId}
                      onChange={(e) => setVerAId(e.target.value)}
                      aria-label="Earlier version"
                      className="px-2.5 py-1.5 rounded border border-[#D8CFBE] bg-[#FAF7F0]"
                    >
                      {selectedDecision.versions.map((v) => (
                        <option key={v.id} value={v.id}>
                          v{v.versionNumber} ({new Date(v.createdAt).toLocaleDateString()}) —{' '}
                          {v.changeNote}
                        </option>
                      ))}
                    </select>
                    <span className="text-[#525866]">vs.</span>
                    <select
                      value={verBId}
                      onChange={(e) => setVerBId(e.target.value)}
                      aria-label="Later version"
                      className="px-2.5 py-1.5 rounded border border-[#D8CFBE] bg-[#FAF7F0]"
                    >
                      {selectedDecision.versions.map((v) => (
                        <option key={v.id} value={v.id}>
                          v{v.versionNumber} ({new Date(v.createdAt).toLocaleDateString()}) —{' '}
                          {v.changeNote}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {verA && verB && (
                  <div className="space-y-3">
                    {DIFFABLE_FIELDS.map(({ key, label }) => {
                      const aVal = String(verA.snapshot[key] ?? '');
                      const bVal = String(verB.snapshot[key] ?? '');
                      if (aVal === bVal) return null;
                      return (
                        <div
                          key={key}
                          className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded bg-[#FAF7F0] border border-[#E2DACB] text-xs"
                        >
                          <div>
                            <p className="font-semibold text-[#525866] mb-1">
                              {label} (v{verA.versionNumber})
                            </p>
                            <p className="whitespace-pre-wrap text-[#1B1E23]">{aVal || '—'}</p>
                          </div>
                          <div className="bg-[#EBF2EE] p-2.5 rounded">
                            <p className="font-semibold text-[#244C3C] mb-1">
                              {label} (v{verB.versionNumber})
                            </p>
                            <p className="whitespace-pre-wrap text-[#173328]">{bVal || '—'}</p>
                          </div>
                        </div>
                      );
                    })}
                    {DIFFABLE_FIELDS.every(
                      ({ key }) =>
                        String(verA.snapshot[key] ?? '') === String(verB.snapshot[key] ?? ''),
                    ) && (
                      <p className="text-xs text-[#525866]">
                        Selected versions have identical field values.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSave}
              className="bg-white border border-[#E2DACB] rounded-lg p-6 sm:p-7 space-y-6"
            >
              {saveFeedback && (
                <p className="p-3.5 rounded-md bg-[#EBF2EE] border border-[#244C3C]/30 text-xs text-[#173328]">
                  {saveFeedback}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="dp-title" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                    Decision Title *
                  </label>
                  <input
                    id="dp-title"
                    type="text"
                    required
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Regional Clinic Reporting Reform"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="dp-owner" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                    Decision Owner
                  </label>
                  <input
                    id="dp-owner"
                    type="text"
                    value={draft.owner}
                    onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-[#D8CFBE] text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dp-deadline"
                    className="block text-xs font-medium text-[#0D1B2A] mb-1"
                  >
                    Target Deadline
                  </label>
                  <input
                    id="dp-deadline"
                    type="text"
                    value={draft.deadline}
                    onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                    placeholder="e.g. 2027-02-15"
                    className="w-full px-3 py-2 rounded-md border border-[#D8CFBE] text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="dp-status" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                    Decision Lifecycle Status
                  </label>
                  <select
                    id="dp-status"
                    value={draft.status}
                    onChange={(e) =>
                      setDraft({ ...draft, status: e.target.value as DecisionStatus })
                    }
                    className="w-full px-3 py-2 rounded-md border border-[#D8CFBE] bg-[#FAF7F0] text-sm"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label htmlFor="dp-conf" className="font-medium text-[#0D1B2A]">
                      Initial Confidence
                    </label>
                    <span className="font-mono tabular-nums text-[#9A742B]">
                      {draft.initialConfidence}%
                    </span>
                  </div>
                  <input
                    id="dp-conf"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={draft.initialConfidence}
                    onChange={(e) =>
                      setDraft({ ...draft, initialConfidence: Number(e.target.value) })
                    }
                    className="w-full accent-[#0D1B2A]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-[#EFE9DC]">
                {[
                  { key: 'context', label: 'Context & Framing', rows: 2 },
                  { key: 'stakes', label: 'Stakes & Reversibility', rows: 2 },
                  {
                    key: 'affectedParties',
                    label: 'Affected Parties (including indirect voices)',
                    rows: 2,
                  },
                  {
                    key: 'initialJudgment',
                    label: 'Initial Judgment (recorded before debate)',
                    rows: 2,
                  },
                  { key: 'observations', label: 'Verified Observations', rows: 2 },
                  { key: 'sourceEvidence', label: 'Source Evidence & Citations', rows: 2 },
                  { key: 'assumptions', label: 'Load-Bearing Assumptions', rows: 2 },
                  { key: 'rivalExplanations', label: 'Rival Explanations Considered', rows: 2 },
                  { key: 'systemMechanisms', label: 'System Stocks, Flows & Delays', rows: 2 },
                  { key: 'alternativesAndTradeoffs', label: 'Alternatives & Trade-Offs', rows: 2 },
                  { key: 'scenariosAndUncertainty', label: 'Scenarios & Key Uncertainties', rows: 2 },
                  { key: 'recommendation', label: 'Defended Recommendation', rows: 2 },
                  {
                    key: 'implementationResponsibilities',
                    label: 'Implementation Responsibilities',
                    rows: 2,
                  },
                  { key: 'revisionTriggers', label: 'Falsifiable Revision Triggers', rows: 2 },
                  { key: 'outcomesAndLessons', label: 'Subsequent Outcomes & Lessons', rows: 2 },
                ].map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={`dp-${field.key}`}
                      className="block text-xs font-medium text-[#0D1B2A] mb-1"
                    >
                      {field.label}
                    </label>
                    <textarea
                      id={`dp-${field.key}`}
                      rows={field.rows}
                      value={String(draft[field.key as keyof DecisionSnapshot] ?? '')}
                      onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-[#D8CFBE] text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dp-rem-date"
                    className="block text-xs font-medium text-[#0D1B2A] mb-1"
                  >
                    Optional Review Date
                  </label>
                  <input
                    id="dp-rem-date"
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-xs"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dp-rem-freq"
                    className="block text-xs font-medium text-[#0D1B2A] mb-1"
                  >
                    Reminder Cadence
                  </label>
                  <select
                    id="dp-rem-freq"
                    value={reminderFreq}
                    onChange={(e) =>
                      setReminderFreq(e.target.value as 'none' | 'once' | 'monthly')
                    }
                    className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-xs"
                  >
                    <option value="none">No reminders (manual review)</option>
                    <option value="once">One-time on chosen review date</option>
                    <option value="monthly">Monthly assumption check</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2DACB] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1">
                  <label htmlFor="dp-note" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                    Revision Note (What changed and why?)
                  </label>
                  <input
                    id="dp-note"
                    type="text"
                    value={changeNote}
                    onChange={(e) => setChangeNote(e.target.value)}
                    placeholder="e.g. Added municipal extract timing evidence; downgraded Option A"
                    className="w-full px-3 py-2 rounded-md border border-[#D8CFBE] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40] whitespace-nowrap shrink-0"
                >
                  <Save className="w-4 h-4" />
                  {creatingNew || !selectedDecision ? 'Save Decision v1' : 'Save New Revision'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
