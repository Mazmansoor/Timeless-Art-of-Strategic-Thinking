export type PartNumber = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export type DecisionStatus =
  | 'Draft saved'
  | 'Analysis completed'
  | 'Reviewed by another person'
  | 'Revised following new evidence'
  | 'Outcome recorded';

export interface CurriculumPart {
  part: PartNumber;
  stageLabel: string;
  formalTitle: string;
  summary: string;
}

export interface WorkedStep {
  label: string;
  reasoning: string;
  evidenceNote: string;
}

export interface PracticeQuestion {
  prompt: string;
  options: {
    id: string;
    label: string;
    feedback: string;
    isStrongest: boolean;
  }[];
  reviewCriteria: string[];
}

export interface SourceCitation {
  author: string;
  year: string;
  title: string;
  note: string;
}

export interface LessonContent {
  moduleNumber: number;
  slug: string;
  part: PartNumber;
  stageLabel: string;
  partTitle?: string;
  academicSubject: string;
  headline: string;
  status: 'published' | 'unpublished';
  originLabel: 'Original Introductory Teaching' | 'Blueprint-Aligned Adaptation';
  estimatedReadingMinutes: number;
  linkedToolId: ToolId;
  linkedToolLabel: string;
  consequentialQuestion: string;
  learningOutcomes: string[];
  conceptualInstruction: {
    heading: string;
    paragraphs: string[];
    keyDistinction?: {
      leftTitle: string;
      leftDetail: string;
      rightTitle: string;
      rightDetail: string;
    };
  }[];
  academicOrigins: string[];
  workedDemonstration: {
    title: string;
    isHypothetical: boolean;
    context: string;
    steps: WorkedStep[];
    conclusion: string;
  };
  guidedPractice: PracticeQuestion;
  independentApplicationPrompt: string;
  reviewCriteria: string[];
  limitations: string[];
  bridgeToNext: {
    nextModuleNumber: number;
    text: string;
  };
  sources: SourceCitation[];
}

export interface CurriculumSubject {
  moduleNumber: number;
  slug: string;
  part: PartNumber;
  stageLabel: string;
  partTitle: string;
  academicSubject: string;
  headline: string;
  summary: string;
  published: boolean;
  hasFullLesson: boolean;
  linkedToolId?: ToolId;
  bookChapterStatus: string;
}

export type ToolId =
  | 'problem-framing'
  | 'systems-explorer'
  | 'decision-comparison'
  | 'scenario-stress-test'
  | 'stakeholder-map'
  | 'strategy-coherence';

export interface LibraryConcept {
  slug: string;
  title: string;
  linkedModuleNumbers: number[];
  linkedToolId: ToolId;
  definition: string;
  intellectualOrigin: string;
  questionAnswered: string;
  workedExample: string;
  evidenceNeeded: string[];
  typicalMisuse: string;
  limitations: string;
  relatedSlugs: string[];
  sources: SourceCitation[];
}

export interface CaseRecord {
  slug: string;
  title: string;
  kind: 'Hypothetical Exercise' | 'Documented Historical Case';
  linkedModuleNumbers: number[];
  participants: string;
  datesAndContext: string;
  decisionAtTime: string;
  evidenceAvailable: string[];
  alternativesConsidered: string[];
  consequences: string;
  competingInterpretations: string[];
  sourceLimitations: string;
}

export interface DecisionSnapshot {
  title: string;
  context: string;
  owner: string;
  deadline: string;
  stakes: string;
  affectedParties: string;
  initialJudgment: string;
  initialConfidence: number;
  observations: string;
  sourceEvidence: string;
  assumptions: string;
  rivalExplanations: string;
  systemMechanisms: string;
  alternativesAndTradeoffs: string;
  scenariosAndUncertainty: string;
  recommendation: string;
  implementationResponsibilities: string;
  revisionTriggers: string;
  outcomesAndLessons: string;
  status: DecisionStatus;
  linkedModuleNumber?: number;
}

export interface DecisionVersion {
  id: string;
  decisionId: string;
  versionNumber: number;
  createdAt: string;
  changeNote: string;
  snapshot: DecisionSnapshot;
}

export interface DecisionRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  reviewReminderDate: string | null;
  reminderFrequency: 'none' | 'once' | 'monthly';
  snapshot: DecisionSnapshot;
  versions: DecisionVersion[];
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'admin';
  entitlements: string[];
}

export interface ProgramOffering {
  id: string;
  slug: string;
  title: string;
  tier: 'Free' | 'Guided Program' | 'Organizational Engagement';
  status: 'Available' | 'Waitlist / Inquiry' | 'Planned';
  priceLabel: string;
  priceCents: number | null;
  scheduleNote: string;
  summary: string;
  includedItems: string[];
  excludedBoundaries: string[];
}

export interface ReadinessItem {
  id: string;
  item: string;
  category: 'Source Document' | 'Case Inventory' | 'External Integration';
  status: 'Missing' | 'Unconfigured' | 'Available';
  impact: string;
  nextAction: string;
}

export interface DraftAnalysisRecord {
  id: string;
  toolId: ToolId;
  toolLabel: string;
  title: string;
  summary: string;
  linkedModuleNumber: number;
  snapshotPatch: Partial<DecisionSnapshot>;
  updatedAt: string;
}

export interface LearningProgressRecord {
  moduleNumber: number;
  slug: string;
  academicSubject: string;
  stageLabel: string;
  status: 'Opened' | 'Guided practice completed';
  selectedPracticeOption?: string;
  lastVisitedAt: string;
  practiceCompletedAt?: string | null;
}
