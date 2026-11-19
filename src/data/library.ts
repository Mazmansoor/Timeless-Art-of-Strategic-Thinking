import type { CaseRecord, LibraryConcept, ProgramOffering, ReadinessItem } from '../types.ts';

export const LIBRARY_CONCEPTS: LibraryConcept[] = [
  {
    slug: 'problem-framing',
    title: 'Problem Framing vs. Premature Solutioning',
    linkedModuleNumbers: [1],
    linkedToolId: 'problem-framing',
    definition:
      'Problem framing is the disciplined specification of an observable gap, system boundaries, affected stakeholders, and competing causal explanations before selecting or advocating a remedy.',
    intellectualOrigin:
      'Rooted in John Dewey’s Logic: The Theory of Inquiry (1938) on converting indeterminate situations into structured problems, and Donald Schön’s The Reflective Practitioner (1983) on problem setting.',
    questionAnswered:
      'Are we solving the actual structural cause of a difficulty, or merely optimizing a remedy that someone proposed prematurely?',
    workedExample:
      'Instead of framing a clinic network’s late filings as "grantee negligence requiring late fees," framing inspects submission timestamps against upstream municipal data releases—revealing a four-week calendar mismatch.',
    evidenceNeeded: [
      'Dated, verifiable baseline observations separated from interpretations.',
      'At least two plausible rival explanations for the same data.',
      'One disconfirming observation per explanation.',
    ],
    typicalMisuse:
      'Embedding a preferred procurement, hire, or reorganization inside the opening sentence ("Our problem is that we lack a dashboard").',
    limitations:
      'Extended reframing can stall urgent harm mitigation; when consequences are reversible and urgent, pair brief framing with bounded probes.',
    relatedSlugs: ['reference-class-and-assumptions', 'kernel-of-strategy-diagnosis'],
    sources: [
      {
        author: 'John Dewey',
        year: '1938',
        title: 'Logic: The Theory of Inquiry',
        note: 'Chapter VI: The Pattern of Inquiry.',
      },
      {
        author: 'Donald A. Schön',
        year: '1983',
        title: 'The Reflective Practitioner',
        note: 'Chapters 2–3: Problem setting in professional practice.',
      },
    ],
  },
  {
    slug: 'reference-class-and-assumptions',
    title: 'Mental Models, Reference Classes & Assumptions Audits',
    linkedModuleNumbers: [2],
    linkedToolId: 'problem-framing',
    definition:
      'An assumptions audit extracts the hidden beliefs required for a recommendation to succeed and checks them against external base rates ("outside view") rather than relying solely on internal plans ("inside view").',
    intellectualOrigin:
      'Kahneman & Tversky (1979/2011) on planning fallacy and base-rate neglect; Bent Flyvbjerg (2006) on reference-class forecasting; Gerd Gigerenzer (2011) on ecological rationality.',
    questionAnswered:
      'Which unexamined beliefs carry the weight of our recommendation, and how often do comparable initiatives succeed under similar conditions?',
    workedExample:
      'Checking a city’s 18-month bus electrification estimate against 12 completed municipal depot conversions reveals typical 9–14 month grid interconnection delays omitted from vendor brochures.',
    evidenceNeeded: [
      'Initial judgment and explicit confidence percentage recorded prior to advocacy.',
      'Three to five load-bearing assumptions with falsifying conditions.',
      'Comparison against an empirical reference class when available.',
    ],
    typicalMisuse:
      'Using bias terminology rhetorically to dismiss colleagues rather than documenting testable assumptions collaboratively.',
    limitations:
      'Truly unprecedented technological or institutional transitions may lack close historical reference classes; in those cases, combine assumption audits with small reversible probes.',
    relatedSlugs: ['problem-framing', 'expected-value-and-irreversibility'],
    sources: [
      {
        author: 'Daniel Kahneman',
        year: '2011',
        title: 'Thinking, Fast and Slow',
        note: 'Chapter 23: The Outside View.',
      },
      {
        author: 'Gerd Gigerenzer & Wolfgang Gaissmaier',
        year: '2011',
        title: 'Heuristic Decision Making',
        note: 'Annual Review of Psychology 62:451–482.',
      },
    ],
  },
  {
    slug: 'stock-flow-delay-dynamics',
    title: 'Stocks, Flows, and Feedback Delays',
    linkedModuleNumbers: [3, 11],
    linkedToolId: 'systems-explorer',
    definition:
      'A stock is an accumulation measurable at a snapshot in time (backlog, cash reserve, trained staff); flows are rates changing that stock over time (arrivals/week, completions/week). Feedback delays separate an observation from corrective capacity taking effect.',
    intellectualOrigin:
      'Jay W. Forrester (1961), Industrial Dynamics; Donella H. Meadows (2008), Thinking in Systems; John D. Sterman (2000), Business Dynamics.',
    questionAnswered:
      'Why does a queue continue growing after performance improves, and why do delayed reactions generate boom-and-bust oscillation?',
    workedExample:
      'An appeals office receiving 40 cases/week and processing 35/week continues accumulating backlog even if completions improve to 39/week. When staffing reacts after a 3-week lag, capacity overshoots.',
    evidenceNeeded: [
      'Consistent units for every stock (items) and flow (items per time unit).',
      'Measured reporting and onboarding lag durations.',
      'Explicit declaration of variables inside vs. outside the model boundary.',
    ],
    typicalMisuse:
      'Drawing causal loop arrows on a slide and claiming statistical proof of causation without checking units, time constants, or boundary omissions.',
    limitations:
      'Simplified stock-and-flow models hold behavioral complexity constant; under severe overload, workers cut corners or quit, altering effective capacity non-linearly.',
    relatedSlugs: ['kernel-of-strategy-diagnosis', 'problem-framing'],
    sources: [
      {
        author: 'Donella H. Meadows',
        year: '2008',
        title: 'Thinking in Systems: A Primer',
        note: 'Chapters 1–2: Stocks, flows, and dynamic equilibrium.',
      },
      {
        author: 'John D. Sterman',
        year: '2000',
        title: 'Business Dynamics',
        note: 'Chapters 6 & 11: Stock-flow accumulation and delays.',
      },
    ],
  },
  {
    slug: 'kernel-of-strategy-diagnosis',
    title: 'Strategic Diagnosis & Coherent Policy',
    linkedModuleNumbers: [4, 13],
    linkedToolId: 'strategy-coherence',
    definition:
      'A strategic diagnosis compresses messy symptoms into an explanation of the governing obstacle or bottleneck, enabling a guiding policy and mutually reinforcing actions while explicitly declaring what will stop.',
    intellectualOrigin:
      'Richard P. Rumelt (2011), Good Strategy / Bad Strategy ("The Kernel"); Eliyahu Goldratt (1984), Theory of Constraints.',
    questionAnswered:
      'What single structural constraint governs our outcome, and which ongoing activities are unrelated to addressing it?',
    workedExample:
      'A policy institute halving output from 28 to 14 reports per year to eliminate an 11-week post-draft review lag so surviving briefs arrive ahead of legislative hearings.',
    evidenceNeeded: [
      'A causal statement linking observations to a primary constraint.',
      'An inventory of current initiatives mapped against that constraint.',
      'Explicit resource reallocations, stopped work, and revision triggers.',
    ],
    typicalMisuse:
      'Relabeling a list of departmental targets ("grow 15%, innovate, empower staff") as a strategy without identifying an obstacle or making trade-offs.',
    limitations:
      'Diagnoses can induce tunnel vision if leadership refuses to revisit the crux after environmental conditions shift.',
    relatedSlugs: ['problem-framing', 'stock-flow-delay-dynamics'],
    sources: [
      {
        author: 'Richard P. Rumelt',
        year: '2011',
        title: 'Good Strategy / Bad Strategy',
        note: 'Chapter 5: The Kernel of Good Strategy.',
      },
    ],
  },
  {
    slug: 'expected-value-and-irreversibility',
    title: 'Expected Value, Sensitivity & Irreversible Downside',
    linkedModuleNumbers: [9],
    linkedToolId: 'decision-comparison',
    definition:
      'Expected value weights outcomes by illustrative probabilities across uncertain states, while sensitivity analysis locates the exact probability threshold where the leading alternative changes. Sound judgment also weighs worst-case ruin, irreversibility, and non-monetary obligations.',
    intellectualOrigin:
      'Classical decision theory (von Neumann & Morgenstern, Savage) paired with modern tail-risk and precautionary judgment.',
    questionAnswered:
      'How sensitive is our preferred option to contested probability estimates, and could an unlikely downside inflict irreversible harm?',
    workedExample:
      'Option A yields higher expected financial value ($420k vs. $360k), yet carries an irreversible regulatory revocation risk in a 15% adverse state—justifying Option B or phased staging.',
    evidenceNeeded: [
      'Mutually exclusive uncertain states with explicit (illustrative) probabilities summing to 100%.',
      'Payoff estimates across each action-state pair.',
      'Non-financial, ethical, and reversibility assessments.',
    ],
    typicalMisuse:
      'Treating the highest expected monetary value as automatically mandatory even when survival, institutional legitimacy, or public safety is at stake.',
    limitations:
      'Probabilities in novel strategic decisions are subjective judgments, not objective frequencies; sensitivity thresholds matter more than false decimal precision.',
    relatedSlugs: ['scenario-robustness', 'reference-class-and-assumptions'],
    sources: [
      {
        author: 'Howard Raiffa',
        year: '1968',
        title: 'Decision Analysis: Introductory Lectures on Choices under Uncertainty',
        note: 'Foundational decision trees and sensitivity bounds.',
      },
    ],
  },
  {
    slug: 'scenario-robustness',
    title: 'Scenario Stress Testing: Robust Moves vs. Contingent Bets',
    linkedModuleNumbers: [10],
    linkedToolId: 'scenario-stress-test',
    definition:
      'Scenario stress testing builds internally coherent, non-probabilistic descriptions of plural futures to separate Robust Moves (viable across futures) from Contingent Bets (viable only if specific signposts appear).',
    intellectualOrigin:
      'Pierre Wack (1985), "Scenarios: Uncharted Waters Ahead", Harvard Business Review; Kees van der Heijden (1996), Scenarios: The Art of Strategic Conversation.',
    questionAnswered:
      'Which commitments hold up across radically different futures, and which require early warning signposts before scaling?',
    workedExample:
      'Testing a university extension program across four budget-and-demand futures reveals modular micro-credentials are robust across all four, while a leased physical satellite campus is a fragile contingent bet.',
    evidenceNeeded: [
      'Two critical structural uncertainties independent of our control.',
      'Four coherent narrative worlds rather than "best/base/worst" linear scales.',
      'Observable signposts distinguishing which world is emerging.',
    ],
    typicalMisuse:
      'Assigning arbitrary probabilities to scenarios or building three variations of "business as usual" plus and minus 10%.',
    limitations:
      'Scenarios expand mental readiness but do not eliminate surprise from unimagined discontinuities outside the chosen axes.',
    relatedSlugs: ['expected-value-and-irreversibility', 'stakeholder-legitimacy-and-power'],
    sources: [
      {
        author: 'Pierre Wack',
        year: '1985',
        title: 'Scenarios: Uncharted Waters Ahead',
        note: 'Harvard Business Review, September–October 1985.',
      },
    ],
  },
  {
    slug: 'stakeholder-legitimacy-and-power',
    title: 'Stakeholder Authority, Incentives & Legitimacy',
    linkedModuleNumbers: [8, 22],
    linkedToolId: 'stakeholder-map',
    definition:
      'Institutional stakeholder analysis maps formal authority, informal influence, concrete incentives, and moral/public legitimacy—explicitly surfacing groups affected by a decision who lack formal veto power.',
    intellectualOrigin:
      'R. Edward Freeman (1984), Strategic Management: A Stakeholder Approach; Mitchell, Agle & Wood (1997) on power, legitimacy, and urgency.',
    questionAnswered:
      'Who can enable or block this decision, what incentives govern their response, and who bears the consequences without a seat at the table?',
    workedExample:
      'Mapping a municipal zoning shift highlights not only developers and city councilors (high authority) but also night-shift clinic workers reliant on existing bus routes (high stake, low formal voice).',
    evidenceNeeded: [
      'Distinction between formal veto authority and informal coalition influence.',
      'Explicit incentive alignment or conflict per group.',
      'Separate legitimacy and harm-exposure column never collapsed into power rankings.',
    ],
    typicalMisuse:
      'Sorting stakeholders onto a 2x2 grid and concluding that low-power affected communities can safely be ignored.',
    limitations:
      'Stakeholder preferences shift dynamically once proposals become concrete; static snapshots require periodic revision.',
    relatedSlugs: ['problem-framing', 'kernel-of-strategy-diagnosis'],
    sources: [
      {
        author: 'Ronald K. Mitchell, Bradley R. Agle & Donna J. Wood',
        year: '1997',
        title: 'Toward a Theory of Stakeholder Identification and Salience',
        note: 'Academy of Management Review 22(4):853–886.',
      },
    ],
  },
];

export const LIBRARY_CASES: CaseRecord[] = [
  {
    slug: 'civic-grant-cycle-delay-exercise',
    title: 'Regional Civic Grant Program: Late Reporting & Upstream Dependency',
    kind: 'Hypothetical Exercise',
    linkedModuleNumbers: [1, 3],
    participants: 'Foundation Grants Director, 22 Community Health Clinics, Municipal Health Data Office',
    datesAndContext: 'Constructed teaching exercise modeled on public-philanthropic reporting cycles.',
    decisionAtTime:
      'Whether to impose a 10% late-filing financial penalty after 13 of 22 clinics submitted Cycle 4 reports 15–32 days late.',
    evidenceAvailable: [
      'Submission timestamps showing lateness jumped from 4 clinics in Cycle 2 to 13 clinics in Cycle 4.',
      'Reporting template expanded from 7 pages to 18 pages in Cycle 4.',
      '11 of 13 late clinics relied on a municipal data extract released 28 days before deadline rather than 8 weeks prior.',
    ],
    alternativesConsidered: [
      'Impose a 10% late-filing penalty (initial proposal).',
      'Shift foundation cutoff 30 days after municipal release and prune redundant fields.',
      'Fund dedicated grant coordinators across all 22 clinics regardless of bottleneck.',
    ],
    consequences:
      'In this exercise, the penalty fails to accelerate submissions and destabilizes smaller clinics, whereas synchronizing cutoffs removes the upstream constraint.',
    competingInterpretations: [
      'Compliance-enforcement view: strict penalties deter procrastination.',
      'Systems-boundary view: punishing downstream actors for upstream data delays compounds structural friction.',
    ],
    sourceLimitations:
      'Hypothetical Exercise constructed strictly for Module 01 & Module 03 teaching. No empirical external archival claims are implied.',
  },
  {
    slug: 'tribunal-backlog-oscillation-exercise',
    title: 'Administrative Appeals Tribunal: Delayed Capacity & Queue Oscillation',
    kind: 'Hypothetical Exercise',
    linkedModuleNumbers: [3, 4],
    participants: 'Tribunal Chair, Case Intake Clerks, Temporary Adjudicators',
    datesAndContext: 'Constructed dynamic simulation exercise (paired with Systems Explorer).',
    decisionAtTime:
      'How to respond when pending appeals climb from 80 to over 105 cases while baseline intake exceeds processing capacity.',
    evidenceAvailable: [
      'Steady intake of 40 cases/week against baseline capacity of 35 cases/week.',
      'Observed 3-week lag between backlog spike, budget authorization, and adjudicator onboarding.',
    ],
    alternativesConsidered: [
      'Aggressive temporary contractor surges triggered solely when backlog crosses threshold.',
      'Shorten reporting lag to 1 week and raise permanent baseline capacity to match intake.',
    ],
    consequences:
      'Demonstrates mathematically in Systems Explorer how aggressive delayed surges generate recurring overtime booms and idle contractions.',
    competingInterpretations: [
      'Budget-flexibility view: rely on surge contractors to avoid permanent headcount.',
      'Stock-flow view: structural inflow-outflow deficits cannot be solved sustainably by delayed emergency sprints.',
    ],
    sourceLimitations:
      'Hypothetical Exercise governed by explicit deterministic equations in Systems Explorer. Real tribunals face variable case complexity and adjudicator burnout excluded from the base simulation.',
  },
];

export const DEFAULT_PROGRAMS: ProgramOffering[] = [
  {
    id: 'prog-open',
    slug: 'open-foundation',
    title: 'Open Foundation (Part I — Awaken)',
    tier: 'Free',
    status: 'Available',
    priceLabel: 'Free · No registration required',
    priceCents: 0,
    scheduleNote: 'Self-paced · Immediate access',
    summary:
      'Complete introductory access to Modules 01–04, all six interactive Strategy Lab tools, the Reference Library, and local or authenticated Decision Portfolio storage.',
    includedItems: [
      'Full reading and guided practice for Modules 01–04',
      'Interactive Problem-Framing, Systems Explorer, Decision Comparison, Scenario Stress Test, Stakeholder Map, and Coherence Review tools',
      'Downloadable Strategic Decision Brief template',
      'Continuing Decision Portfolio with dated version comparison and Markdown export',
    ],
    excludedBoundaries: [
      'Does not include live facilitator critique or peer cohort review',
      'Modules 05–24 remain unpublished until approved source blueprints are integrated',
    ],
  },
  {
    id: 'prog-guided-intensive',
    slug: 'guided-decision-intensive',
    title: 'Guided Strategic Decision Intensive',
    tier: 'Guided Program',
    status: 'Waitlist / Inquiry',
    priceLabel: 'Configurable rate (set in Admin)',
    priceCents: null,
    scheduleNote: 'Flexible format · Intensive or extended cohort',
    summary:
      'Structured program for professionals bringing an active consequential decision through diagnosis, options evaluation, scenario stress testing, and formal recommendation defense.',
    includedItems: [
      'Baseline decision framing intake and structured written diagnostic review',
      'Facilitated small-group seminar sessions adaptable to intensive or multi-week pacing',
      'Written instructor critique on one Decision Portfolio revision cycle',
      'Capstone decision defense session',
    ],
    excludedBoundaries: [
      'Not an automated certificate-for-completion track; feedback requires genuine submitted work',
      'Cohort dates and tuition are published in Administration once finalized',
    ],
  },
  {
    id: 'prog-org-workshop',
    slug: 'organizational-strategy-engagement',
    title: 'Organizational Decision & Strategy Engagement',
    tier: 'Organizational Engagement',
    status: 'Available',
    priceLabel: 'Scoped by team size & challenge',
    priceCents: null,
    scheduleNote: 'Scoped workshop or multi-session institutional program',
    summary:
      'Bespoke engagement for leadership teams, public agencies, and cross-functional groups working together on a live strategic challenge.',
    includedItems: [
      'Pre-workshop stakeholder & baseline document review',
      'Facilitated Problem Framing, Systems, and Strategy Coherence sessions around your actual challenge',
      'Shared Decision Memorandum and explicit revision-trigger register',
      'Post-engagement 60-day review check-in',
    ],
    excludedBoundaries: [
      'We do not deliver generic motivational keynotes or pre-packaged slide decks detached from your real decisions',
      'Confidential organizational materials are never reused as public case studies without explicit written consent',
    ],
  },
];

export const DEFAULT_READINESS_ITEMS: ReadinessItem[] = [
  {
    id: 'ready-charter',
    item: 'Master Project Charter',
    category: 'Source Document',
    status: 'Missing',
    impact: 'Governance and scope constraints rely on prompt brief rather than full charter file.',
    nextAction: 'Upload or import approved Master Project Charter markdown into source inventory.',
  },
  {
    id: 'ready-course-blueprint',
    item: 'Authoritative Course Blueprint v3 (Modules 05–24)',
    category: 'Source Document',
    status: 'Missing',
    impact: 'Modules 05–24 are held unpublished in catalog rather than inventing unapproved teaching.',
    nextAction: 'Attach Course Blueprint v3 and lesson readings to author and publish Part II–VI sequentially.',
  },
  {
    id: 'ready-book-arch',
    item: 'Book Master Architecture v3 & Chapter Manuscripts',
    category: 'Source Document',
    status: 'Missing',
    impact: 'Book page truthfully lists status as in-development without invented ISBN or chapter excerpts.',
    nextAction: 'Attach Book Master Architecture v3 to populate chapter synopses and publication schedule.',
  },
  {
    id: 'ready-cases',
    item: 'Verified Historical Case Research & Citation Inventory',
    category: 'Case Inventory',
    status: 'Missing',
    impact: 'Library publishes explicitly labeled Hypothetical Exercises only; historical cases withheld pending source verification.',
    nextAction: 'Provide primary-source dossiers with dates, participants, and verified numbers.',
  },
  {
    id: 'ready-stripe',
    item: 'Stripe Checkout & Webhook Verification Keys',
    category: 'External Integration',
    status: 'Unconfigured',
    impact: 'Paid guided program checkout is isolated behind STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET; program-interest registration works durably.',
    nextAction: 'Configure STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and live price cents in Admin.',
  },
  {
    id: 'ready-inquiry-relay',
    item: 'Organizational Inquiry Email / Webhook Forwarding',
    category: 'External Integration',
    status: 'Unconfigured',
    impact: 'Inquiries persist durably in server SQLite database and appear in Admin Inbox; external forwarding awaits INQUIRY_WEBHOOK_URL.',
    nextAction: 'Set INQUIRY_WEBHOOK_URL in environment secrets to forward new inquiries automatically.',
  },
];
