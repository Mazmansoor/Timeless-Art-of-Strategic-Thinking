import type {
  DecisionRecord,
  DecisionSnapshot,
  DecisionVersion,
  DraftAnalysisRecord,
  LearningProgressRecord,
} from '../types.ts';

const LOCAL_STORAGE_KEY = 'ttast_local_portfolio_v1';
const LOCAL_DRAFTS_KEY = 'ttast_local_drafts_v1';
const LOCAL_PROGRESS_KEY = 'ttast_local_progress_v1';

export function createEmptySnapshot(partial?: Partial<DecisionSnapshot>): DecisionSnapshot {
  return {
    title: '',
    context: '',
    owner: '',
    deadline: '',
    stakes: '',
    affectedParties: '',
    initialJudgment: '',
    initialConfidence: 60,
    observations: '',
    sourceEvidence: '',
    assumptions: '',
    rivalExplanations: '',
    systemMechanisms: '',
    alternativesAndTradeoffs: '',
    scenariosAndUncertainty: '',
    recommendation: '',
    implementationResponsibilities: '',
    revisionTriggers: '',
    outcomesAndLessons: '',
    status: 'Draft saved',
    ...partial,
  };
}

export function loadLocalPortfolio(): DecisionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DecisionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPortfolio(decisions: DecisionRecord[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decisions));
}

export function loadLocalDrafts(): DraftAnalysisRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DraftAnalysisRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalDrafts(drafts: DraftAnalysisRecord[]): void {
  localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(drafts));
}

export function loadLocalLearningProgress(): LearningProgressRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LearningProgressRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalLearningProgress(records: LearningProgressRecord[]): void {
  localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(records));
}

export function mergeLearningProgressRecord(
  current: LearningProgressRecord[],
  incoming: {
    moduleNumber: number;
    slug: string;
    academicSubject: string;
    stageLabel: string;
    status: 'Opened' | 'Guided practice completed';
    selectedPracticeOption?: string;
  },
): { updated: LearningProgressRecord[]; record: LearningProgressRecord } {
  const now = new Date().toISOString();
  const existing = current.find((r) => r.moduleNumber === incoming.moduleNumber);
  const finalStatus: 'Opened' | 'Guided practice completed' =
    existing?.status === 'Guided practice completed' ||
    incoming.status === 'Guided practice completed'
      ? 'Guided practice completed'
      : 'Opened';
  const finalOption =
    incoming.status === 'Guided practice completed'
      ? incoming.selectedPracticeOption ?? existing?.selectedPracticeOption
      : existing?.selectedPracticeOption;
  const finalCompletedAt =
    incoming.status === 'Guided practice completed'
      ? now
      : existing?.practiceCompletedAt ?? null;

  const record: LearningProgressRecord = {
    moduleNumber: incoming.moduleNumber,
    slug: incoming.slug,
    academicSubject: incoming.academicSubject,
    stageLabel: incoming.stageLabel,
    status: finalStatus,
    selectedPracticeOption: finalOption,
    lastVisitedAt: now,
    practiceCompletedAt: finalCompletedAt,
  };

  const others = current.filter((r) => r.moduleNumber !== incoming.moduleNumber);
  const updated = [record, ...others].sort(
    (a, b) => new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime(),
  );
  return { updated, record };
}

export function createLocalDecision(
  snapshot: DecisionSnapshot,
  changeNote = 'Initial decision record created',
): DecisionRecord {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const ver: DecisionVersion = {
    id: crypto.randomUUID(),
    decisionId: id,
    versionNumber: 1,
    createdAt: now,
    changeNote,
    snapshot: { ...snapshot },
  };
  return {
    id,
    createdAt: now,
    updatedAt: now,
    reviewReminderDate: null,
    reminderFrequency: 'none',
    snapshot: { ...snapshot },
    versions: [ver],
  };
}

export function appendLocalDecisionVersion(
  existing: DecisionRecord,
  snapshot: DecisionSnapshot,
  changeNote: string,
  reviewReminderDate: string | null = existing.reviewReminderDate,
  reminderFrequency: 'none' | 'once' | 'monthly' = existing.reminderFrequency,
): DecisionRecord {
  const now = new Date().toISOString();
  const nextNum = (existing.versions[existing.versions.length - 1]?.versionNumber ?? 0) + 1;
  const ver: DecisionVersion = {
    id: crypto.randomUUID(),
    decisionId: existing.id,
    versionNumber: nextNum,
    createdAt: now,
    changeNote: changeNote.trim() || `Revision v${nextNum}`,
    snapshot: { ...snapshot },
  };
  return {
    ...existing,
    updatedAt: now,
    reviewReminderDate,
    reminderFrequency,
    snapshot: { ...snapshot },
    versions: [...existing.versions, ver],
  };
}

export function formatDecisionMemorandumMarkdown(decision: DecisionRecord): string {
  const s = decision.snapshot;
  const lines: string[] = [
    `# DECISION MEMORANDUM: ${s.title || 'Untitled Decision'}`,
    `Status: ${s.status}`,
    `Owner: ${s.owner || 'Unassigned'} | Target Deadline: ${s.deadline || 'Unspecified'}`,
    `Last Updated: ${new Date(decision.updatedAt).toLocaleString()}`,
    '',
    '---',
    '',
    '## 1. Situation & Stakes',
    s.context || '_No context recorded._',
    '',
    `**Stakes:** ${s.stakes || 'Not specified.'}`,
    `**Affected Parties (including indirect voices):** ${s.affectedParties || 'Not specified.'}`,
    '',
    '## 2. Initial Judgment Baseline',
    `- **Initial Judgment:** ${s.initialJudgment || 'Not recorded.'}`,
    `- **Initial Confidence:** ${s.initialConfidence}%`,
    '',
    '## 3. Evidence, Assumptions & Rival Explanations',
    `**Verified Observations:**\n${s.observations || '_None recorded._'}`,
    '',
    `**Source Evidence:**\n${s.sourceEvidence || '_None recorded._'}`,
    '',
    `**Load-Bearing Assumptions:**\n${s.assumptions || '_None recorded._'}`,
    '',
    `**Rival Explanations:**\n${s.rivalExplanations || '_None recorded._'}`,
    '',
    '## 4. System Mechanisms & Strategic Choices',
    `**System Stocks, Flows & Delays:**\n${s.systemMechanisms || '_None recorded._'}`,
    '',
    `**Alternatives & Trade-Offs:**\n${s.alternativesAndTradeoffs || '_None recorded._'}`,
    '',
    `**Scenarios & Uncertainty:**\n${s.scenariosAndUncertainty || '_None recorded._'}`,
    '',
    '## 5. Recommendation, Implementation & Review',
    `**Recommendation:**\n${s.recommendation || '_Pending._'}`,
    '',
    `**Implementation Responsibilities:**\n${s.implementationResponsibilities || '_Not assigned._'}`,
    '',
    `**Revision Triggers:**\n${s.revisionTriggers || '_Not defined._'}`,
    '',
    `**Subsequent Outcomes & Lessons:**\n${s.outcomesAndLessons || '_Pending outcome review._'}`,
    '',
    '---',
    '',
    '## Version History',
    ...decision.versions.map(
      (v) =>
        `- **v${v.versionNumber}** (${new Date(v.createdAt).toLocaleString()}) — ${v.changeNote} [Status: ${v.snapshot.status}]`,
    ),
  ];
  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const DIFFABLE_FIELDS: Array<{ key: keyof DecisionSnapshot; label: string }> = [
  { key: 'title', label: 'Decision Title' },
  { key: 'status', label: 'Workflow Status' },
  { key: 'context', label: 'Context & Framing' },
  { key: 'stakes', label: 'Stakes' },
  { key: 'affectedParties', label: 'Affected Parties' },
  { key: 'initialJudgment', label: 'Initial Judgment' },
  { key: 'initialConfidence', label: 'Initial Confidence (%)' },
  { key: 'observations', label: 'Observations' },
  { key: 'sourceEvidence', label: 'Source Evidence' },
  { key: 'assumptions', label: 'Load-Bearing Assumptions' },
  { key: 'rivalExplanations', label: 'Rival Explanations' },
  { key: 'systemMechanisms', label: 'System Mechanisms' },
  { key: 'alternativesAndTradeoffs', label: 'Alternatives & Trade-Offs' },
  { key: 'scenariosAndUncertainty', label: 'Scenarios & Uncertainty' },
  { key: 'recommendation', label: 'Recommendation' },
  { key: 'implementationResponsibilities', label: 'Implementation Responsibilities' },
  { key: 'revisionTriggers', label: 'Revision Triggers' },
  { key: 'outcomesAndLessons', label: 'Outcomes & Lessons' },
];
