import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CANONICAL_CURRICULUM } from '../data/curriculum.ts';
import { DEFAULT_PROGRAMS } from '../data/library.ts';
import {
  appendLocalDecisionVersion,
  createEmptySnapshot,
  createLocalDecision,
  loadLocalDrafts,
  loadLocalLearningProgress,
  loadLocalPortfolio,
  mergeLearningProgressRecord,
  saveLocalDrafts,
  saveLocalLearningProgress,
  saveLocalPortfolio,
} from '../lib/portfolioUtils.ts';
import type {
  CurriculumSubject,
  DecisionRecord,
  DecisionSnapshot,
  DraftAnalysisRecord,
  LearningProgressRecord,
  ProgramOffering,
  ToolId,
  UserSession,
} from '../types.ts';

interface ConfigStatus {
  geminiConfigured: boolean;
  stripeConfigured: boolean;
  inquiryWebhookConfigured: boolean;
}

export interface ActiveDraftMeta {
  draftId: string;
  toolId: ToolId;
  toolLabel: string;
  title: string;
  summary: string;
}

interface PlatformContextValue {
  user: UserSession | null;
  authLoading: boolean;
  configStatus: ConfigStatus;
  subjects: CurriculumSubject[];
  programs: ProgramOffering[];
  decisions: DecisionRecord[];
  draftAnalyses: DraftAnalysisRecord[];
  learningProgress: LearningProgressRecord[];
  storageMode: 'server-account' | 'browser-local';
  activeDraftSnapshot: Partial<DecisionSnapshot> | null;
  setActiveDraftSnapshot: (draft: Partial<DecisionSnapshot> | null) => void;
  activeDraftMeta: ActiveDraftMeta | null;
  setActiveDraftMeta: (meta: ActiveDraftMeta | null) => void;
  refreshSession: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  saveNewDecision: (
    snapshot: DecisionSnapshot,
    changeNote?: string,
    reviewReminderDate?: string | null,
    reminderFrequency?: 'none' | 'once' | 'monthly',
  ) => Promise<{ ok: boolean; decision?: DecisionRecord; error?: string }>;
  updateDecision: (
    id: string,
    snapshot: DecisionSnapshot,
    changeNote: string,
    reviewReminderDate?: string | null,
    reminderFrequency?: 'none' | 'once' | 'monthly',
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteDecision: (id: string) => Promise<void>;
  importDecisions: (items: DecisionRecord[]) => Promise<{ ok: boolean; count: number; error?: string }>;
  saveDraftAnalysis: (input: {
    id?: string;
    toolId: ToolId;
    toolLabel: string;
    title: string;
    summary: string;
    linkedModuleNumber: number;
    snapshotPatch: Partial<DecisionSnapshot>;
  }) => Promise<{ ok: boolean; draft?: DraftAnalysisRecord; error?: string }>;
  deleteDraftAnalysis: (id: string) => Promise<void>;
  promoteDraftToDecision: (
    draft: DraftAnalysisRecord,
  ) => Promise<{ ok: boolean; decision?: DecisionRecord; error?: string }>;
  recordLearningProgress: (input: {
    moduleNumber: number;
    slug: string;
    academicSubject: string;
    stageLabel: string;
    status: 'Opened' | 'Guided practice completed';
    selectedPracticeOption?: string;
  }) => Promise<void>;
  trackEvent: (eventName: string, meta?: Record<string, string | number | boolean>) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subjects, setSubjects] = useState<CurriculumSubject[]>(CANONICAL_CURRICULUM);
  const [programs, setPrograms] = useState<ProgramOffering[]>(DEFAULT_PROGRAMS);
  const [decisions, setDecisions] = useState<DecisionRecord[]>(() => loadLocalPortfolio());
  const [draftAnalyses, setDraftAnalyses] = useState<DraftAnalysisRecord[]>(() => loadLocalDrafts());
  const [learningProgress, setLearningProgress] = useState<LearningProgressRecord[]>(() =>
    loadLocalLearningProgress(),
  );
  const [activeDraftSnapshot, setActiveDraftSnapshot] = useState<Partial<DecisionSnapshot> | null>(
    null,
  );
  const [activeDraftMeta, setActiveDraftMeta] = useState<ActiveDraftMeta | null>(null);
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    geminiConfigured: false,
    stripeConfigured: false,
    inquiryWebhookConfigured: false,
  });

  const refreshCatalog = useCallback(async () => {
    try {
      const [currRes, progRes, cfgRes] = await Promise.all([
        fetch('/api/curriculum'),
        fetch('/api/programs'),
        fetch('/api/config/status'),
      ]);
      if (currRes.ok) {
        const data = (await currRes.json()) as { subjects: CurriculumSubject[] };
        setSubjects(data.subjects);
      }
      if (progRes.ok) {
        const data = (await progRes.json()) as { programs: ProgramOffering[] };
        setPrograms(data.programs);
      }
      if (cfgRes.ok) {
        const data = (await cfgRes.json()) as ConfigStatus;
        setConfigStatus(data);
      }
    } catch {
      // Retain local fallback definitions when offline
    }
  }, []);

  const loadWorkspaceForUser = useCallback(async (currentUser: UserSession | null) => {
    if (!currentUser) {
      setDecisions(loadLocalPortfolio());
      setDraftAnalyses(loadLocalDrafts());
      setLearningProgress(loadLocalLearningProgress());
      return;
    }
    try {
      const [decRes, sumRes] = await Promise.all([
        fetch('/api/decisions'),
        fetch('/api/workspace/summary'),
      ]);
      if (decRes.ok) {
        const data = (await decRes.json()) as { decisions: DecisionRecord[] };
        setDecisions(data.decisions);
      }
      if (sumRes.ok) {
        const data = (await sumRes.json()) as {
          drafts: DraftAnalysisRecord[];
          progress: LearningProgressRecord[];
        };
        setDraftAnalyses(data.drafts);
        setLearningProgress(data.progress);
      }
    } catch {
      // Ignore network hiccup
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = (await res.json()) as { user: UserSession | null };
        setUser(data.user);
        await loadWorkspaceForUser(data.user);
      } else {
        setUser(null);
        setDecisions(loadLocalPortfolio());
        setDraftAnalyses(loadLocalDrafts());
        setLearningProgress(loadLocalLearningProgress());
      }
    } catch {
      setUser(null);
      setDecisions(loadLocalPortfolio());
      setDraftAnalyses(loadLocalDrafts());
      setLearningProgress(loadLocalLearningProgress());
    } finally {
      setAuthLoading(false);
    }
  }, [loadWorkspaceForUser]);

  useEffect(() => {
    refreshSession();
    refreshCatalog();
  }, [refreshSession, refreshCatalog]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { user?: UserSession; error?: string };
    if (!res.ok || !data.user) {
      return { ok: false, error: data.error ?? 'Sign-in failed.' };
    }
    setUser(data.user);
    await loadWorkspaceForUser(data.user);
    return { ok: true };
  };

  const register = async (email: string, name: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    const data = (await res.json()) as { user?: UserSession; error?: string };
    if (!res.ok || !data.user) {
      return { ok: false, error: data.error ?? 'Registration failed.' };
    }
    setUser(data.user);
    await loadWorkspaceForUser(data.user);
    return { ok: true };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setDecisions(loadLocalPortfolio());
    setDraftAnalyses(loadLocalDrafts());
    setLearningProgress(loadLocalLearningProgress());
  };

  const trackEvent = useCallback((eventName: string, meta: Record<string, string | number | boolean> = {}) => {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, meta }),
    }).catch(() => {});
  }, []);

  const saveNewDecision = async (
    snapshot: DecisionSnapshot,
    changeNote = 'Initial decision record created',
    reviewReminderDate: string | null = null,
    reminderFrequency: 'none' | 'once' | 'monthly' = 'none',
  ) => {
    if (!snapshot.title.trim()) {
      return { ok: false, error: 'Please enter a decision title.' };
    }
    if (!user) {
      const created = createLocalDecision(snapshot, changeNote);
      created.reviewReminderDate = reviewReminderDate;
      created.reminderFrequency = reminderFrequency;
      const updated = [created, ...decisions];
      saveLocalPortfolio(updated);
      setDecisions(updated);
      trackEvent('portfolio_saved');
      return { ok: true, decision: created };
    }

    const res = await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot, changeNote, reviewReminderDate, reminderFrequency }),
    });
    const data = (await res.json()) as { decision?: DecisionRecord; error?: string };
    if (!res.ok || !data.decision) {
      return { ok: false, error: data.error ?? 'Failed to save decision.' };
    }
    setDecisions((prev) => [data.decision!, ...prev]);
    return { ok: true, decision: data.decision };
  };

  const updateDecision = async (
    id: string,
    snapshot: DecisionSnapshot,
    changeNote: string,
    reviewReminderDate: string | null = null,
    reminderFrequency: 'none' | 'once' | 'monthly' = 'none',
  ) => {
    if (!user) {
      const updated = decisions.map((d) =>
        d.id === id
          ? appendLocalDecisionVersion(d, snapshot, changeNote, reviewReminderDate, reminderFrequency)
          : d,
      );
      saveLocalPortfolio(updated);
      setDecisions(updated);
      trackEvent('portfolio_revisited');
      return { ok: true };
    }

    const res = await fetch(`/api/decisions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot, changeNote, reviewReminderDate, reminderFrequency }),
    });
    const data = (await res.json()) as {
      updatedAt?: string;
      newVersion?: DecisionRecord['versions'][number];
      error?: string;
    };
    if (!res.ok || !data.newVersion) {
      return { ok: false, error: data.error ?? 'Failed to save revision.' };
    }
    setDecisions((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              updatedAt: data.updatedAt!,
              reviewReminderDate,
              reminderFrequency,
              snapshot,
              versions: [...d.versions, data.newVersion!],
            }
          : d,
      ),
    );
    return { ok: true };
  };

  const deleteDecision = async (id: string) => {
    if (!user) {
      const updated = decisions.filter((d) => d.id !== id);
      saveLocalPortfolio(updated);
      setDecisions(updated);
      return;
    }
    const res = await fetch(`/api/decisions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDecisions((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const importDecisions = async (items: DecisionRecord[]) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { ok: false, count: 0, error: 'No valid decisions found in file.' };
    }
    if (!user) {
      const existingIds = new Set(decisions.map((d) => d.id));
      const fresh = items.filter((d) => d?.snapshot?.title && !existingIds.has(d.id));
      const merged = [...fresh, ...decisions];
      saveLocalPortfolio(merged);
      setDecisions(merged);
      return { ok: true, count: fresh.length };
    }

    const res = await fetch('/api/decisions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisions: items }),
    });
    const data = (await res.json()) as { importedCount?: number; error?: string };
    if (!res.ok) {
      return { ok: false, count: 0, error: data.error ?? 'Import failed.' };
    }
    await loadWorkspaceForUser(user);
    return { ok: true, count: data.importedCount ?? 0 };
  };

  const saveDraftAnalysis = async (input: {
    id?: string;
    toolId: ToolId;
    toolLabel: string;
    title: string;
    summary: string;
    linkedModuleNumber: number;
    snapshotPatch: Partial<DecisionSnapshot>;
  }) => {
    if (!user) {
      const now = new Date().toISOString();
      const draftId = input.id || crypto.randomUUID();
      const record: DraftAnalysisRecord = {
        id: draftId,
        toolId: input.toolId,
        toolLabel: input.toolLabel,
        title: input.title.trim() || `${input.toolLabel} Draft`,
        summary: input.summary.trim().slice(0, 600),
        linkedModuleNumber: input.linkedModuleNumber,
        snapshotPatch: input.snapshotPatch,
        updatedAt: now,
      };
      const updated = [record, ...draftAnalyses.filter((d) => d.id !== draftId)];
      saveLocalDrafts(updated);
      setDraftAnalyses(updated);
      return { ok: true, draft: record };
    }

    const res = await fetch('/api/workspace/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { draft?: DraftAnalysisRecord; error?: string };
    if (!res.ok || !data.draft) {
      return { ok: false, error: data.error ?? 'Failed to save draft analysis.' };
    }
    setDraftAnalyses((prev) => [data.draft!, ...prev.filter((d) => d.id !== data.draft!.id)]);
    return { ok: true, draft: data.draft };
  };

  const deleteDraftAnalysis = async (id: string) => {
    if (!user) {
      const updated = draftAnalyses.filter((d) => d.id !== id);
      saveLocalDrafts(updated);
      setDraftAnalyses(updated);
      return;
    }
    const res = await fetch(`/api/workspace/drafts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDraftAnalyses((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const promoteDraftToDecision = async (draft: DraftAnalysisRecord) => {
    const snapshot = createEmptySnapshot({
      title: draft.title || `${draft.toolLabel} Analysis`,
      linkedModuleNumber: draft.linkedModuleNumber,
      ...draft.snapshotPatch,
      status: 'Analysis completed',
    });
    const res = await saveNewDecision(snapshot, `Promoted from ${draft.toolLabel} draft`);
    if (res.ok) {
      await deleteDraftAnalysis(draft.id);
    }
    return res;
  };

  const recordLearningProgress = useCallback(
    async (input: {
      moduleNumber: number;
      slug: string;
      academicSubject: string;
      stageLabel: string;
      status: 'Opened' | 'Guided practice completed';
      selectedPracticeOption?: string;
    }) => {
      if (!user) {
        setLearningProgress((prev) => {
          const { updated } = mergeLearningProgressRecord(prev, input);
          saveLocalLearningProgress(updated);
          return updated;
        });
        return;
      }

      try {
        const res = await fetch('/api/workspace/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleNumber: input.moduleNumber,
            status: input.status,
            selectedPracticeOption: input.selectedPracticeOption,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { progress?: LearningProgressRecord };
          if (data.progress) {
            setLearningProgress((prev) => {
              const others = prev.filter((p) => p.moduleNumber !== data.progress!.moduleNumber);
              return [data.progress!, ...others].sort(
                (a, b) =>
                  new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime(),
              );
            });
          }
        }
      } catch {
        // Non-blocking background progress sync
      }
    },
    [user],
  );

  return (
    <PlatformContext.Provider
      value={{
        user,
        authLoading,
        configStatus,
        subjects,
        programs,
        decisions,
        draftAnalyses,
        learningProgress,
        storageMode: user ? 'server-account' : 'browser-local',
        activeDraftSnapshot,
        setActiveDraftSnapshot,
        activeDraftMeta,
        setActiveDraftMeta,
        refreshSession,
        refreshCatalog,
        login,
        register,
        logout,
        saveNewDecision,
        updateDecision,
        deleteDecision,
        importDecisions,
        saveDraftAnalysis,
        deleteDraftAnalysis,
        promoteDraftToDecision,
        recordLearningProgress,
        trackEvent,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}
