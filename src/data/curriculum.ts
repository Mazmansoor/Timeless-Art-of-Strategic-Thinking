import type { CurriculumPart, CurriculumSubject, LessonContent } from '../types.ts';

export const CURRICULUM_PARTS: CurriculumPart[] = [
  {
    part: 'I',
    stageLabel: 'AWAKEN',
    formalTitle: 'Strategic Diagnosis and Systems Thinking',
    summary:
      'Clarify the consequential problem before proposing remedies, examine hidden mental models, trace stocks and delays, and diagnose the true bottleneck.',
  },
  {
    part: 'II',
    stageLabel: 'SEE',
    formalTitle: 'Strategic Analysis',
    summary:
      'Examine macroenvironmental shifts, industry structure, internal capabilities, and the institutional power and legitimacy of stakeholders.',
  },
  {
    part: 'III',
    stageLabel: 'THINK',
    formalTitle: 'Decision-Making Under Uncertainty and Strategic Foresight',
    summary:
      'Reason rigorously under irreducible uncertainty, construct coherent scenarios, anticipate second-order effects, and guide strategic renewal.',
  },
  {
    part: 'IV',
    stageLabel: 'PLAY',
    formalTitle: 'Strategy Formulation',
    summary:
      'Synthesize diagnosis into guiding policy, establish competitive and institutional positioning, model interdependent actors, and price opportunity cost.',
  },
  {
    part: 'V',
    stageLabel: 'ACT',
    formalTitle: 'Strategy Implementation and Performance',
    summary:
      'Translate policy into accountable action, align organizational design and culture, measure without inducing gaming, and institutionalize learning.',
  },
  {
    part: 'VI',
    stageLabel: 'TRANSCEND',
    formalTitle: 'Strategic Judgment, Ethics, and Artificial Intelligence',
    summary:
      'Cultivate reflective judgment, uphold ethical responsibility for downstream harms, govern AI-assisted reasoning, and defend an integrated decision.',
  },
];

export const CANONICAL_CURRICULUM: CurriculumSubject[] = [
  {
    moduleNumber: 1,
    slug: 'problem-definition-and-framing',
    part: 'I',
    stageLabel: 'AWAKEN',
    partTitle: 'Strategic Diagnosis and Systems Thinking',
    academicSubject: 'Problem Definition and Framing',
    headline: 'Before you solve the wrong problem brilliantly',
    summary:
      'Separate observable symptoms from structural causes, state competing explanations, and anchor boundaries before choosing solutions.',
    published: true,
    hasFullLesson: true,
    linkedToolId: 'problem-framing',
    bookChapterStatus: 'Manuscript architecture aligned · Introductory teaching live',
  },
  {
    moduleNumber: 2,
    slug: 'mental-models-and-cognitive-biases',
    part: 'I',
    stageLabel: 'AWAKEN',
    partTitle: 'Strategic Diagnosis and Systems Thinking',
    academicSubject: 'Mental Models and Cognitive Biases',
    headline: 'How capable minds misread clear evidence',
    summary:
      'Inspect the tacit models governing your judgment, test disconfirming evidence, and distinguish bounded heuristics from institutional blind spots.',
    published: true,
    hasFullLesson: true,
    linkedToolId: 'problem-framing',
    bookChapterStatus: 'Manuscript architecture aligned · Introductory teaching live',
  },
  {
    moduleNumber: 3,
    slug: 'systems-thinking',
    part: 'I',
    stageLabel: 'AWAKEN',
    partTitle: 'Strategic Diagnosis and Systems Thinking',
    academicSubject: 'Systems Thinking',
    headline: 'Why well-intended interventions often worsen the queue',
    summary:
      'Model accumulation, flows, capacity limits, and information delays so you intervene at leverage points rather than chasing symptoms.',
    published: true,
    hasFullLesson: true,
    linkedToolId: 'systems-explorer',
    bookChapterStatus: 'Manuscript architecture aligned · Introductory teaching live',
  },
  {
    moduleNumber: 4,
    slug: 'strategic-diagnosis',
    part: 'I',
    stageLabel: 'AWAKEN',
    partTitle: 'Strategic Diagnosis and Systems Thinking',
    academicSubject: 'Strategic Diagnosis',
    headline: 'Naming the crux that actually governs the outcome',
    summary:
      'Synthesize evidence, stakeholder constraints, and system behavior into a sharp diagnosis that rules out decorative activity.',
    published: true,
    hasFullLesson: true,
    linkedToolId: 'strategy-coherence',
    bookChapterStatus: 'Manuscript architecture aligned · Introductory teaching live',
  },
  {
    moduleNumber: 5,
    slug: 'macroenvironmental-analysis-and-strategic-change',
    part: 'II',
    stageLabel: 'SEE',
    partTitle: 'Strategic Analysis',
    academicSubject: 'Macroenvironmental Analysis and Strategic Change',
    headline: 'Reading structural currents beyond the quarterly horizon',
    summary: 'Demographic, regulatory, technological, and macroeconomic shifts.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 6,
    slug: 'industry-analysis-and-competition',
    part: 'II',
    stageLabel: 'SEE',
    partTitle: 'Strategic Analysis',
    academicSubject: 'Industry Analysis and Competition',
    headline: 'Where economic value is created and who captures it',
    summary: 'Structural forces, substitutes, bargaining power, and public-sector analogs.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 7,
    slug: 'resources-capabilities-and-competitive-advantage',
    part: 'II',
    stageLabel: 'SEE',
    partTitle: 'Strategic Analysis',
    academicSubject: 'Resources, Capabilities, and Competitive Advantage',
    headline: 'What your organization can genuinely sustain under pressure',
    summary: 'Rare, costly-to-imitate capabilities versus generic operational hygiene.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 8,
    slug: 'stakeholder-institutional-and-power-analysis',
    part: 'II',
    stageLabel: 'SEE',
    partTitle: 'Strategic Analysis',
    academicSubject: 'Stakeholder, Institutional, and Power Analysis',
    headline: 'Authority, incentives, legitimacy, and the voices absent from the room',
    summary: 'Mapping institutional veto points, incentives, and moral legitimacy.',
    published: false,
    hasFullLesson: false,
    linkedToolId: 'stakeholder-map',
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 9,
    slug: 'decision-making-under-uncertainty',
    part: 'III',
    stageLabel: 'THINK',
    partTitle: 'Decision-Making Under Uncertainty and Strategic Foresight',
    academicSubject: 'Decision-Making Under Uncertainty',
    headline: 'Separating a sound choice from a fortunate outcome',
    summary: 'Expected value, sensitivity thresholds, irreversibility, and tail risk.',
    published: false,
    hasFullLesson: false,
    linkedToolId: 'decision-comparison',
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 10,
    slug: 'scenario-planning-and-strategic-foresight',
    part: 'III',
    stageLabel: 'THINK',
    partTitle: 'Decision-Making Under Uncertainty and Strategic Foresight',
    academicSubject: 'Scenario Planning and Strategic Foresight',
    headline: 'Preparing for plural futures without mistaking scenarios for forecasts',
    summary: 'Coherent futures, robust moves, contingent bets, and observable signposts.',
    published: false,
    hasFullLesson: false,
    linkedToolId: 'scenario-stress-test',
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 11,
    slug: 'second-order-effects-and-complex-dynamics',
    part: 'III',
    stageLabel: 'THINK',
    partTitle: 'Decision-Making Under Uncertainty and Strategic Foresight',
    academicSubject: 'Second-Order Effects and Complex Dynamics',
    headline: 'Tracing what happens after everyone else reacts',
    summary: 'Adaptive responses, policy resistance, and cascading consequences.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 12,
    slug: 'innovation-and-strategic-renewal',
    part: 'III',
    stageLabel: 'THINK',
    partTitle: 'Decision-Making Under Uncertainty and Strategic Foresight',
    academicSubject: 'Innovation and Strategic Renewal',
    headline: 'Renewing an institution before its core model hardens into fragility',
    summary: 'Exploration, exploitation, and institutional barriers to renewal.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 13,
    slug: 'strategy-formulation',
    part: 'IV',
    stageLabel: 'PLAY',
    partTitle: 'Strategy Formulation',
    academicSubject: 'Strategy Formulation',
    headline: 'Turning diagnosis into an explicit guiding policy',
    summary: 'Selecting what to concentrate on and what to refuse.',
    published: false,
    hasFullLesson: false,
    linkedToolId: 'strategy-coherence',
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 14,
    slug: 'competitive-and-institutional-positioning',
    part: 'IV',
    stageLabel: 'PLAY',
    partTitle: 'Strategy Formulation',
    academicSubject: 'Competitive and Institutional Positioning',
    headline: 'Choosing where to stand and which trade-offs to accept',
    summary: 'Coherent activity systems and incompatible strategic positions.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 15,
    slug: 'game-theory-and-strategic-interaction',
    part: 'IV',
    stageLabel: 'PLAY',
    partTitle: 'Strategy Formulation',
    academicSubject: 'Game Theory and Strategic Interaction',
    headline: 'Reasoning through interdependent choices and credible commitments',
    summary: 'Sequential games, incentives, signaling, and cooperation equilibria.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 16,
    slug: 'resource-allocation-and-opportunity-cost',
    part: 'IV',
    stageLabel: 'PLAY',
    partTitle: 'Strategy Formulation',
    academicSubject: 'Resource Allocation and Opportunity Cost',
    headline: 'A strategy is revealed in what you refuse to fund',
    summary: 'Capital, attention, talent allocation, and sunk-cost discipline.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 17,
    slug: 'translating-strategy-into-action',
    part: 'V',
    stageLabel: 'ACT',
    partTitle: 'Strategy Implementation and Performance',
    academicSubject: 'Translating Strategy into Action',
    headline: 'Bridging intent and execution without losing the logic',
    summary: 'Proximate objectives, sequencing, and clear decision rights.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 18,
    slug: 'organizational-design-culture-and-change',
    part: 'V',
    stageLabel: 'ACT',
    partTitle: 'Strategy Implementation and Performance',
    academicSubject: 'Organizational Design, Culture, and Change',
    headline: 'Why structure and informal norms quietly defeat unaligned plans',
    summary: 'Incentives, coordination mechanisms, and institutional change.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 19,
    slug: 'strategic-performance-measurement',
    part: 'V',
    stageLabel: 'ACT',
    partTitle: 'Strategy Implementation and Performance',
    academicSubject: 'Strategic Performance Measurement',
    headline: 'Measuring progress without inviting Goodhart’s Law',
    summary: 'Leading indicators, metric gaming, and institutional accountability.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 20,
    slug: 'execution-organizational-learning-and-adaptation',
    part: 'V',
    stageLabel: 'ACT',
    partTitle: 'Strategy Implementation and Performance',
    academicSubject: 'Execution, Organizational Learning, and Adaptation',
    headline: 'Revising strategy cleanly when reality contradicts the plan',
    summary: 'Review cadences, triggers, post-decision audits, and course correction.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 21,
    slug: 'strategic-judgment-and-reflective-practice',
    part: 'VI',
    stageLabel: 'TRANSCEND',
    partTitle: 'Strategic Judgment, Ethics, and Artificial Intelligence',
    academicSubject: 'Strategic Judgment and Reflective Practice',
    headline: 'Developing intellectual humility without surrendering decisiveness',
    summary: 'Calibration, decision journals, and reflective stewardship.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 22,
    slug: 'ethics-and-responsibility-in-strategy',
    part: 'VI',
    stageLabel: 'TRANSCEND',
    partTitle: 'Strategic Judgment, Ethics, and Artificial Intelligence',
    academicSubject: 'Ethics and Responsibility in Strategy',
    headline: 'Who bears the risk of your strategy—and did they consent?',
    summary: 'Externalities, institutional duty, and moral accountability.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 23,
    slug: 'ai-assisted-strategic-thinking-and-human-oversight',
    part: 'VI',
    stageLabel: 'TRANSCEND',
    partTitle: 'Strategic Judgment, Ethics, and Artificial Intelligence',
    academicSubject: 'AI-Assisted Strategic Thinking and Human Oversight',
    headline: 'Using machines to challenge reasoning without outsourcing judgment',
    summary: 'Verification, hallucination limits, and human decision ownership.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
  {
    moduleNumber: 24,
    slug: 'integrated-strategic-decision-defense',
    part: 'VI',
    stageLabel: 'TRANSCEND',
    partTitle: 'Strategic Judgment, Ethics, and Artificial Intelligence',
    academicSubject: 'Integrated Strategic Decision Defense',
    headline: 'Presenting a complete, falsifiable, ethically grounded recommendation',
    summary: 'Capstone decision defense synthesizing diagnosis, options, and review.',
    published: false,
    hasFullLesson: false,
    bookChapterStatus: 'Awaiting approved blueprint & lesson readings',
  },
];

export const PUBLISHED_LESSONS: Record<string, LessonContent> = {
  'problem-definition-and-framing': {
    moduleNumber: 1,
    slug: 'problem-definition-and-framing',
    part: 'I',
    stageLabel: 'AWAKEN',
    academicSubject: 'Problem Definition and Framing',
    headline: 'Before you solve the wrong problem brilliantly',
    status: 'published',
    originLabel: 'Original Introductory Teaching',
    estimatedReadingMinutes: 14,
    linkedToolId: 'problem-framing',
    linkedToolLabel: 'Open Problem-Framing Workbench',
    consequentialQuestion:
      'Why do capable teams spend months executing an ingenious solution only to discover that the underlying difficulty did not budge?',
    learningOutcomes: [
      'Distinguish an observable symptom, a proposed remedy disguised as a problem, and a testable structural problem statement.',
      'Specify explicit system boundaries, stakeholders, and success criteria before generating solutions.',
      'Construct at least two rival explanations for the same operational evidence and identify what evidence would disconfirm each.',
    ],
    conceptualInstruction: [
      {
        heading: '1. The Silent Error of Premature Solutioning',
        paragraphs: [
          'Most strategic failures do not begin with bad arithmetic. They begin with an unexamined sentence in the opening meeting: "Our problem is that we need a new portal," or "Our problem is low morale," or "Our problem is that field offices ignore headquarters." Notice the sleight of hand in each phrasing. The first smuggles a preferred procurement into the definition of the problem; the second names a vague mood rather than a mechanism; the third blames one group before inspecting the incentives acting upon them.',
          'When a consequential situation arrives already packaged as a familiar remedy, analytical energy goes entirely toward optimizing execution. A mediocre solution to the right problem creates space to learn; an immaculate solution to a misframed problem locks an institution into sunk cost and political defensiveness.',
        ],
        keyDistinction: {
          leftTitle: 'Solution-Disguised Framing',
          leftDetail:
            '"We need to hire three regional coordinators to fix missed reporting deadlines." Assumes the cause is headcount rather than reporting burden or misaligned incentives.',
          rightTitle: 'Mechanism-Focused Problem Statement',
          rightDetail:
            '"Quarterly compliance filings from 14 regional clinics arrive a median of 19 days late, delaying grant reconciliation. We do not yet know whether the bottleneck is clinic staff time, duplicative forms, or delayed central validation."',
        },
      },
      {
        heading: '2. Observations, Interpretations, and Boundaries',
        paragraphs: [
          'Rigorous framing separates what any careful observer could verify from what an advocate infers. An observation is dated, specific, and checkable ("Emergency readmissions within 30 days rose from 11% to 17% across two clinics over four quarters"). An interpretation proposes a causal story ("Patients are ignoring discharge instructions"). Treating the interpretation as settled fact closes off inquiry before it starts.',
          'Equally decisive is the boundary choice. Where do you draw the perimeter of responsibility? Frame a municipal transit delay strictly around bus driver punctuality, and you will write punitive schedules. Frame it to include traffic signal priority, boarding payment friction, and curb enforcement, and entirely different levers appear—though at the cost of crossing departmental boundaries. Every boundary clarifies some mechanisms while hiding others; good strategists state their boundary deliberately rather than inheriting it by habit.',
        ],
      },
      {
        heading: '3. Rival Explanations and Disconfirming Evidence',
        paragraphs: [
          'A single compelling narrative feels like clarity, yet in complex institutions a single narrative is usually confirmation bias wearing a suit. Before committing resources, ask: what else could produce these exact observations if our favored hypothesis were false? Forcing yourself to write two genuinely plausible rival explanations—and naming the specific observation that would refute your own favorite—turns framing from advocacy into inquiry.',
        ],
      },
    ],
    academicOrigins: [
      'John Dewey (1938), Logic: The Theory of Inquiry — the distinction between an indeterminate situation and a formulated problem.',
      'Donald Schön (1983), The Reflective Practitioner — "problem setting" as the interactive naming and framing of attention prior to technical problem solving.',
      'Thomas Wedell-Wedellsborg (2017) & Richard Rumelt (2011) — reframing challenges and separating symptoms from actionable cruxes.',
    ],
    workedDemonstration: {
      title: 'Regional Civic Grant Program — Addressing Late Final Reports',
      isHypothetical: true,
      context:
        'Hypothetical Exercise: A public foundation funds 22 community health clinics. Over the past year, 60% of clinics submitted final outcome reports after the statutory deadline, holding up next-cycle disbursements. Senior leadership initially proposes imposing a 10% late penalty.',
      steps: [
        {
          label: 'Step 1 · Separate Observation from Inference',
          reasoning:
            'Verified observation: 13 of 22 clinics filed 15–32 days late in Cycle 4, compared with 4 of 22 in Cycle 2. Inference rejected as premature: "Clinics are negligent or indifferent to accountability."',
          evidenceNote: 'Source check: Submission timestamps and Cycle 3 vs Cycle 4 form length.',
        },
        {
          label: 'Step 2 · Inspect Boundary & Rival Explanations',
          reasoning:
            'Rival A: Smaller clinics lack dedicated grant administrators after new 18-page outcome metrics were added in Cycle 4. Rival B: Clinics receive municipal patient data six weeks after the foundation’s reporting cutoff. Rival C: Clinics perceive no consequence for late submission.',
          evidenceNote: 'Notice that Rival B lies outside the clinic’s direct control.',
        },
        {
          label: 'Step 3 · Specify Disconfirming Tests',
          reasoning:
            'If Rival C were primary, late filings would cluster evenly across clinics regardless of municipal data dependency. Reviewing timestamps shows 11 of the 13 late clinics depend on the same municipal extract delayed by 28 days.',
          evidenceNote: 'A 10% penalty would punish clinics for an upstream municipal delay.',
        },
      ],
      conclusion:
        'Revised Problem Statement: "Foundation reporting deadlines precede municipal health-extract availability by four weeks while form complexity doubled, causing 13 dependent clinics to miss deadlines and stalling Cycle 5 funding." The remedy shifts from punitive fines to synchronizing reporting cutoffs and trimming redundant fields.',
    },
    guidedPractice: {
      prompt:
        'A hospital director states: "Our problem is that nurses are not adopting the new electronic triage checklist." Which critique identifies the primary framing flaw?',
      options: [
        {
          id: 'a',
          label: 'The statement should specify disciplinary targets for non-compliant wards.',
          feedback:
            'Weak choice. Moving straight to enforcement assumes willful non-compliance without testing whether workflow friction, duplicate data entry, or screen placement makes the checklist unusable during intake.',
          isStrongest: false,
        },
        {
          id: 'b',
          label:
            'It treats an observed symptom (low checklist completion) as a motivational failure without stating rival systemic causes or measurable consequences.',
          feedback:
            'Strongest diagnosis. Low completion is an observable behavior, not yet a mechanism. A sound frame states the operational gap, tests rival causes (time cost, redundancy, missing fields, training), and specifies what evidence would distinguish them.',
          isStrongest: true,
        },
        {
          id: 'c',
          label: 'It fails to propose a software vendor replacement.',
          feedback:
            'Weak choice. Proposing a vendor replacement commits the identical error in reverse: substituting a new remedy before diagnosing why the current workflow fails.',
          isStrongest: false,
        },
      ],
      reviewCriteria: [
        'Does your statement avoid embedding a predetermined solution?',
        'Are verifiable facts cleanly separated from causal guesses?',
        'Can a colleague look at your framing and test at least two rival explanations?',
      ],
    },
    independentApplicationPrompt:
      'Bring a real decision currently sitting on your desk. Open the Problem-Framing Workbench, state the observed gap without naming a solution, and write two rival explanations you would hate to see proven true.',
    reviewCriteria: [
      'A provisional problem statement is under 60 words and contains zero disguised remedies.',
      'At least three observations are tagged separately from assumptions.',
      'Each rival explanation specifies one piece of evidence that would weaken or refute it.',
    ],
    limitations: [
      'Reframing endlessly can become a refined form of procrastination when immediate harm is occurring; time-box diagnosis to match the stakes and reversibility of the decision.',
      'Framing alone cannot resolve genuine value conflicts where stakeholders agree on the facts yet legitimately want incompatible outcomes.',
    ],
    bridgeToNext: {
      nextModuleNumber: 2,
      text: 'Even when we try to frame objectively, our minds select which facts feel salient. Module 02 examines the mental models and cognitive habits that quietly filter our diagnosis.',
    },
    sources: [
      {
        author: 'John Dewey',
        year: '1938',
        title: 'Logic: The Theory of Inquiry',
        note: 'Chapter VI: The Pattern of Inquiry — transforming an indeterminate situation into a determinate problem.',
      },
      {
        author: 'Donald A. Schön',
        year: '1983',
        title: 'The Reflective Practitioner',
        note: 'Part I: Problem setting versus technical rationality in professional judgment.',
      },
    ],
  },
  'mental-models-and-cognitive-biases': {
    moduleNumber: 2,
    slug: 'mental-models-and-cognitive-biases',
    part: 'I',
    stageLabel: 'AWAKEN',
    partTitle: 'Strategic Diagnosis and Systems Thinking',
    academicSubject: 'Mental Models and Cognitive Biases',
    headline: 'How capable minds misread clear evidence',
    status: 'published',
    originLabel: 'Original Introductory Teaching',
    estimatedReadingMinutes: 15,
    linkedToolId: 'problem-framing',
    linkedToolLabel: 'Audit Assumptions in Workbench',
    consequentialQuestion:
      'If intelligence and seniority do not immunize leaders against predictable errors of judgment, what structural habits actually protect a decision?',
    learningOutcomes: [
      'Identify how implicit mental models shape which signals an organization notices or dismisses.',
      'Distinguish harmful cognitive distortions (confirmation bias, base-rate neglect, sunk-cost escalation) from fast heuristics that work well in stable environments.',
      'Construct an explicit assumptions audit that exposes fragile beliefs before irreversible commitments.',
    ],
    conceptualInstruction: [
      {
        heading: '1. You Never Observe Pure Data—Only Data Through a Model',
        paragraphs: [
          'Every executive, civil servant, and founder operates with a working map of how their domain behaves: what drives customer trust, why staff resist change, what regulators care about. Peter Senge popularized the term "mental models" for these deeply held internal pictures. They are indispensable—without compression, the world is too noisy to act—yet they become hazardous the moment we forget they are maps rather than terrain.',
          'Institutional mental models persist even longer than individual ones because they harden into meeting agendas, reporting templates, and promotion criteria. When an organization repeatedly attributes revenue drops to "sales execution" while ignoring product obsolescence, the blind spot is rarely personal stupidity; it is an unchallenged model embedded in how the organization defines competence.',
        ],
      },
      {
        heading: '2. Biases vs. Ecological Rationality',
        paragraphs: [
          'Popular business books often treat human cognition as a catalog of embarrassing bugs. That caricature misses an essential scholarly debate. Daniel Kahneman and Amos Tversky documented systematic deviations from formal probability and utility axioms—anchoring to irrelevant numbers, neglecting base rates, overweighting vivid recent anecdotes (availability), and seeking evidence that confirms prior beliefs.',
          'Gerd Gigerenzer and colleagues countered that many heuristics perform remarkably well when matched to the structure of real environments ("ecological rationality"), especially when probabilities are unknown and sample sizes are small. The strategist’s task is not to feel smugly superior to human intuition, nor to trust gut instinct blindly, but to recognize when a familiar environment has shifted enough that yesterday’s reliable shortcut now misfires.',
        ],
        keyDistinction: {
          leftTitle: 'Base-Rate Neglect & Availability',
          leftDetail:
            'Judging the likelihood of a major restructuring succeeding solely from two inspiring case stories while ignoring that 70% of comparable initiatives stalled.',
          rightTitle: 'Reference-Class & Assumptions Audit',
          rightDetail:
            'Asking what happened in an appropriate comparison class of past efforts, then listing which specific conditions would have to hold for this case to outperform.',
        },
      },
      {
        heading: '3. Debiasing Is Institutional, Not Solo Willpower',
        paragraphs: [
          'Simply reminding yourself "don’t be biased" changes almost nothing; confirmation bias is adept at recruiting your intelligence to defend your original intuition. Effective debiasing relies on procedural friction: writing down your initial judgment and confidence before hearing the group, assigning someone to argue the strongest counter-case, and auditing assumptions in writing before money or reputation is committed.',
        ],
      },
    ],
    academicOrigins: [
      'Daniel Kahneman & Amos Tversky (1974), "Judgment under Uncertainty: Heuristics and Biases", Science.',
      'Gerd Gigerenzer & Wolfgang Gaissmaier (2011), "Heuristic Decision Making", Annual Review of Psychology.',
      'Bent Flyvbjerg (2006), Reference Class Forecasting in major capital and public projects.',
    ],
    workedDemonstration: {
      title: 'Municipal Transit Electrification — Checking Optimism Bias',
      isHypothetical: true,
      context:
        'Hypothetical Exercise: A city transport board evaluates converting 40% of its bus fleet within 18 months. The project champion cites a peer city’s smooth pilot and estimates $14M total capital outlay with zero service disruption.',
      steps: [
        {
          label: 'Step 1 · Surface the Anchor and Inside View',
          reasoning:
            'The $14M figure and 18-month timeline are anchored to vendor brochure figures and a small 8-bus pilot in a milder climate—classic "inside view" planning.',
          evidenceNote: 'Assumption exposed: Depot substation upgrades are assumed to finish without utility queuing.',
        },
        {
          label: 'Step 2 · Apply Outside-View Reference Class',
          reasoning:
            'Inspecting 12 completed municipal depot conversions of similar size shows median grid interconnection delays of 9–14 months and cold-weather range drops of 18–25%.',
          evidenceNote: 'Base rate shifts schedule risk from "unlikely" to "expected unless pre-cleared."',
        },
        {
          label: 'Step 3 · Pre-Commit Disconfirming Conditions',
          reasoning:
            'Before approving full procurement, require binding utility interconnection dates for Depots A and B and reserve diesel backup for winter peak routes.',
          evidenceNote: 'Procedural safeguard replaces optimism without abandoning decarbonization.',
        },
      ],
      conclusion:
        'Examining mental models does not paralyze action; it converts hidden fragility into phased, inspectable commitments.',
    },
    guidedPractice: {
      prompt:
        'A product team has already invested 14 months and $900,000 into an internal workflow tool that pilot users bypass. A lead argues: "If we stop now, all $900,000 is wasted; one more quarter of features will turn adoption around." What reasoning trap is clearest here?',
      options: [
        {
          id: 'a',
          label: 'Sunk-cost fallacy combined with unstated adoption assumptions.',
          feedback:
            'Strongest identification. Past expenditure cannot be recovered by continuing; only future marginal costs versus expected future value should govern the next quarter, alongside testing why users bypass the tool today.',
          isStrongest: true,
        },
        {
          id: 'b',
          label: 'Insufficient loyalty to the engineering team’s initial vision.',
          feedback:
            'Weak choice. Loyalty to past effort is precisely what sustains failing commitments when evidence points elsewhere.',
          isStrongest: false,
        },
        {
          id: 'c',
          label: 'Over-reliance on reference-class forecasting.',
          feedback:
            'Weak choice. The argument relies exclusively on an optimistic inside view rather than external adoption baselines.',
          isStrongest: false,
        },
      ],
      reviewCriteria: [
        'Did you separate irrecoverable past cost from forward-looking marginal choices?',
        'Did you record your initial confidence percentage before inspecting counter-evidence?',
      ],
    },
    independentApplicationPrompt:
      'In your Decision Portfolio, record your initial judgment and numerical confidence (0–100%) on an active choice, then list three assumptions that must be true for your judgment to hold.',
    reviewCriteria: [
      'Initial judgment is explicitly dated and paired with a calibrated confidence percentage.',
      'At least three load-bearing assumptions are stated cleanly rather than buried in prose.',
      'An external reference class or baseline comparison is noted.',
    ],
    limitations: [
      'Awareness of bias labels does not automatically improve decisions and can invite cynical labeling of colleagues ("you’re just anchored") instead of examining evidence.',
      'In genuinely novel environments with no valid historical reference class, over-correcting toward conservatism can miss asymmetric opportunities.',
    ],
    bridgeToNext: {
      nextModuleNumber: 3,
      text: 'Individual minds are only half the story. Even unbiased people make puzzling choices when trapped inside poorly understood feedback structures. Module 03 introduces Systems Thinking.',
    },
    sources: [
      {
        author: 'Daniel Kahneman',
        year: '2011',
        title: 'Thinking, Fast and Slow',
        note: 'Part III & IV: Overconfidence, the inside view vs. outside view, and planning fallacy.',
      },
      {
        author: 'Gerd Gigerenzer & Wolfgang Gaissmaier',
        year: '2011',
        title: 'Heuristic Decision Making',
        note: 'Annual Review of Psychology 62:451–482 — ecological rationality and fast-and-frugal heuristics.',
      },
    ],
  },
  'systems-thinking': {
    moduleNumber: 3,
    slug: 'systems-thinking',
    part: 'I',
    stageLabel: 'AWAKEN',
    partTitle: 'Strategic Diagnosis and Systems Thinking',
    academicSubject: 'Systems Thinking',
    headline: 'Why well-intended interventions often worsen the queue',
    status: 'published',
    originLabel: 'Original Introductory Teaching',
    estimatedReadingMinutes: 16,
    linkedToolId: 'systems-explorer',
    linkedToolLabel: 'Open Systems Explorer Simulation',
    consequentialQuestion:
      'Why do organizations frequently watch a backlog spike, then collapse into idle slack, and then spike again—even when demand stays steady?',
    learningOutcomes: [
      'Distinguish a stock (accumulated level) from a flow (rate over time) with explicit units of measurement.',
      'Explain how information and action delays create overshoot and oscillation in capacity-adjustment loops.',
      'Use a bounded stock-and-flow simulation to test capacity and delay policies while stating what the model excludes.',
    ],
    conceptualInstruction: [
      {
        heading: '1. Stocks, Flows, and Bathtub Intuition',
        paragraphs: [
          'A surprising share of strategic confusion comes from mistaking a rate for a level. Imagine a regional licensing office receiving 120 applications per week while processing 100 per week. Even if processing rises from 100 to 115 per week—a celebratory "15% productivity gain"—the backlog stock is still growing by 5 applications every single week. Until outflow equals or exceeds inflow, the queue continues to lengthen.',
          'Stocks create institutional memory and inertia. Unresolved customer tickets, deferred infrastructure maintenance, technical debt, and staff burnout are all stocks. They do not vanish the day you announce a new policy; they drain only as fast as net outflow remains positive.',
        ],
        keyDistinction: {
          leftTitle: 'Flow (Rate per Unit Time)',
          leftDetail:
            'Measured per week, month, or year: arrivals/week, completions/week, hires/quarter, attrition/year.',
          rightTitle: 'Stock (Accumulation at a Point in Time)',
          rightDetail:
            'Measured as a count or quantity at a snapshot: pending cases, cash reserves, active trained staff, deferred maintenance hours.',
        },
      },
      {
        heading: '2. Feedback Loops and the Tyranny of Delays',
        paragraphs: [
          'Reinforcing loops amplify movement (e.g., backlog creates errors, errors create rework, rework enlarges backlog). Balancing loops attempt to stabilize a stock toward a target (e.g., hiring contractors when the backlog exceeds 100 cases).',
          'Here lies the classic systems trap: delays. Suppose it takes 4 weeks to observe a backlog accurately, approve overtime or contractors, and onboard them. During those 4 weeks, the backlog keeps rising, prompting managers to authorize even more capacity. When that capacity finally arrives, the backlog drains rapidly—yet because managers react to yesterday’s metrics, they keep the extra capacity running too long or cut too late, triggering boom-and-bust oscillation.',
        ],
      },
      {
        heading: '3. Boundaries and Epistemic Humility',
        paragraphs: [
          'Drawing boxes and arrows on a whiteboard does not establish causation. A causal loop diagram is a structured hypothesis about mechanisms, not empirical proof. Every useful model must state explicitly what is inside its boundary (such as arrivals, capacity, and reporting lag) and what it excludes (such as worker fatigue, political interference, or changing case complexity).',
        ],
      },
    ],
    academicOrigins: [
      'Jay W. Forrester (1961), Industrial Dynamics — foundational theory of stock-flow structure and time delays.',
      'Donella H. Meadows (2008), Thinking in Systems: A Primer — stocks, flows, feedback loops, and leverage points.',
      'John D. Sterman (2000), Business Dynamics — modeling policy resistance and bounded rationality in dynamic systems.',
    ],
    workedDemonstration: {
      title: 'Appeals Review Office — Explaining Capacity Overshoot',
      isHypothetical: true,
      context:
        'Hypothetical Exercise: An administrative tribunal starts Week 0 with 80 pending appeals, receives 40 new appeals/week, and processes 35/week at baseline while targeting a steady buffer of 40 cases. Management responds to excess backlog with a 3-week reporting and staffing delay.',
      steps: [
        {
          label: 'Step 1 · Identify the Net Inflow Imbalance',
          reasoning:
            'At Week 0, arrivals (40/week) exceed baseline capacity (35/week) by +5 cases/week. Wait time already exceeds 2 weeks and climbs steadily.',
          evidenceNote: 'Unit check: Stock = cases; Flows = cases/week.',
        },
        {
          label: 'Step 2 · Observe Delay-Induced Overshoot',
          reasoning:
            'With a 3-week delay and aggressive gain (0.45), staffing expands based on stale peak queues, driving backlog past 105 cases before surging capacity clears it below target.',
          evidenceNote: 'Visible in the Systems Explorer simulation table and trajectory chart.',
        },
        {
          label: 'Step 3 · Test Lever Sensitivity',
          reasoning:
            'Cutting the reporting/deployment delay from 3 weeks to 1 week and moderating adjustment gain (0.20) stabilizes the backlog smoothly without whiplash overtime cycles.',
          evidenceNote: 'Improving information timeliness outperforms erratic emergency surges.',
        },
      ],
      conclusion:
        'You can inspect and stress-test these exact numbers inside the Systems Explorer tool immediately.',
    },
    guidedPractice: {
      prompt:
        'A service desk experiences a rising backlog of 300 unresolved tickets. Arrivals are 150/week; current completions are 140/week. Leadership institutes an emergency sprint raising completions to 148/week for a month. What happens to the backlog stock at the end of that month?',
      options: [
        {
          id: 'a',
          label: 'It decreases slowly because completions improved by 8 tickets per week.',
          feedback:
            'Incorrect. Improving the outflow rate from 140 to 148 reduces the *rate of growth*, not the stock itself. Arrivals (150) still exceed completions (148), so the backlog grows by +2 tickets/week to ~308.',
          isStrongest: false,
        },
        {
          id: 'b',
          label: 'It continues to grow by roughly 2 tickets per week because inflow still exceeds outflow.',
          feedback:
            'Exact. A stock only falls when total outflow exceeds total inflow. Mistaking a narrowed deficit for a surplus is one of the commonest errors in operational reviews.',
          isStrongest: true,
        },
        {
          id: 'c',
          label: 'It returns to zero once the sprint stabilizes.',
          feedback:
            'Incorrect. Even if completions matched arrivals at 150/week, the backlog would merely freeze at 300 rather than draining.',
          isStrongest: false,
        },
      ],
      reviewCriteria: [
        'Are stocks and flows expressed in consistent units?',
        'Have you checked what happens when feedback delay increases by 2–4 weeks?',
        'Did you explicitly list at least two real-world factors excluded from the simplified model?',
      ],
    },
    independentApplicationPrompt:
      'Open the Systems Explorer tool. Set parameters matching a real queue, budget reserve, or hiring pipeline in your organization, compare Delay = 0 vs Delay = 4 weeks, and export the trajectory.',
    reviewCriteria: [
      'Model boundary clearly states included variables and excluded real-world forces.',
      'Units (e.g. cases vs. cases/week) are mathematically consistent.',
      'Intervention targets either net flow balance or feedback delay rather than cosmetic activity.',
    ],
    limitations: [
      'A quantitative simulation is only as credible as its boundary assumptions; if arrivals spike discontinuously or case complexity shifts when staff rush, a fixed-parameter model will understate crisis risk.',
      'Causal loop diagrams show hypothesized relationships, not statistical causality.',
    ],
    bridgeToNext: {
      nextModuleNumber: 4,
      text: 'With framing, mental models, and system dynamics in hand, Module 04 brings Part I to its decisive synthesis: formulating a sharp Strategic Diagnosis.',
    },
    sources: [
      {
        author: 'Donella H. Meadows',
        year: '2008',
        title: 'Thinking in Systems: A Primer',
        note: 'Chapters 1–2: Stocks, flows, dynamic equilibrium, and delays.',
      },
      {
        author: 'John D. Sterman',
        year: '2000',
        title: 'Business Dynamics: Systems Thinking and Modeling for a Complex World',
        note: 'Chapter 11: Delays and oscillation in institutional supply and staffing chains.',
      },
    ],
  },
  'strategic-diagnosis': {
    moduleNumber: 4,
    slug: 'strategic-diagnosis',
    part: 'I',
    stageLabel: 'AWAKEN',
    partTitle: 'Strategic Diagnosis and Systems Thinking',
    academicSubject: 'Strategic Diagnosis',
    headline: 'Naming the crux that actually governs the outcome',
    status: 'published',
    originLabel: 'Original Introductory Teaching',
    estimatedReadingMinutes: 15,
    linkedToolId: 'strategy-coherence',
    linkedToolLabel: 'Test Diagnosis in Coherence Review',
    consequentialQuestion:
      'Why do so many strategy documents list twelve admirable goals and twenty initiatives, yet leave everyone unable to explain what the organization is actually up against?',
    learningOutcomes: [
      'Apply the distinction between a wish-list of goals and a true strategic diagnosis that simplifies reality.',
      'Synthesize evidence from problem framing, assumption audits, and system dynamics into one primary bottleneck or crux.',
      'Evaluate whether proposed policies and actions genuinely address the diagnosed crux—and what must stop as a result.',
    ],
    conceptualInstruction: [
      {
        heading: '1. Diagnosis Is Compression, Not Exhaustive Inventory',
        paragraphs: [
          'Richard Rumelt argued that the kernel of good strategy has three parts: a diagnosis, a guiding policy, and coherent actions. The diagnosis is where most "strategic plans" collapse before page three. Instead of explaining the nature of the challenge, committees assemble long bullet lists of strengths, weaknesses, ambitions, and stakeholder requests. A forty-slide situational overview is not a diagnosis; it is raw luggage.',
          'A medical diagnosis does not list every cell in the patient’s body. It names the governing condition—say, bacterial pneumonia rather than seasonal allergy—so that dozens of irrelevant treatments are immediately ruled out and a coherent course of action becomes clear.',
        ],
        keyDistinction: {
          leftTitle: 'Laundry-List Strategic Plan',
          leftDetail:
            '"Grow digital engagement 20%, modernize culture, strengthen stakeholder trust, and launch three new pilot initiatives." Avoids choosing because nothing is diagnosed.',
          rightTitle: 'Sharp Strategic Diagnosis',
          rightDetail:
            '"Our core constraint is not outreach volume; 68% of referred partners abandon onboarding at the legal indemnity clause, turning acquisition spend into churn."',
        },
      },
      {
        heading: '2. Testing the Crux Against Competing Evidence',
        paragraphs: [
          'A diagnosis earns trust when three things are visible: (1) it accounts for the decisive observations you gathered in Module 01; (2) it incorporates the system constraint or delay uncovered in Module 03 rather than blaming individuals; and (3) it carries clear falsifiable implications—if you relieve this crux and nothing changes, your diagnosis was wrong.',
          'Equally important: a genuine diagnosis hurts slightly. Because it names one or two primary bottlenecks, it implies that several pet projects will lose funding or pause. When every existing department sees its favorite project endorsed by the "diagnosis," you have produced consensus prose, not strategy.',
        ],
      },
      {
        heading: '3. Bridging Awaken to See and Play',
        paragraphs: [
          'Completing Part I (Awaken) does not mean you have finished analyzing the external environment or formulating competitive positioning—that work belongs to Parts II through IV. It means you now possess an honest, evidence-backed definition of the problem, an explicit list of fragile assumptions, a grasp of system accumulation and delay, and a testable crux.',
        ],
      },
    ],
    academicOrigins: [
      'Richard P. Rumelt (2011), Good Strategy / Bad Strategy — the Kernel of Strategy (Diagnosis, Guiding Policy, Coherent Actions).',
      'Eliyahu M. Goldratt (1984), Theory of Constraints — why improving non-bottleneck steps adds cost without increasing system throughput.',
      'Karl Weick (1995), Sensemaking in Organizations — constructing plausible, revisable accounts of ambiguous situations.',
    ],
    workedDemonstration: {
      title: 'Independent Policy Research Institute — Diagnosing Declining Brief Influence',
      isHypothetical: true,
      context:
        'Hypothetical Exercise: A respected 35-person policy institute publishes 28 reports per year, yet legislative citations and practitioner downloads have fallen by half over three years. A board subcommittee proposes hiring a PR agency and doubling social media output.',
      steps: [
        {
          label: 'Step 1 · Reject the Symptom-Level Narrative',
          reasoning:
            'Output volume actually increased from 20 to 28 reports/year, while external citations fell. Lack of publication volume or PR distribution is unlikely to be the binding constraint.',
          evidenceNote: 'Observation vs. narrative mismatch.',
        },
        {
          label: 'Step 2 · Inspect System & Stakeholder Mechanics',
          reasoning:
            'Internal review cycles stretched from 4 weeks to 16 weeks due to multi-committee sign-offs; briefs now arrive three months after relevant legislative hearings close.',
          evidenceNote: 'Cycle-time delay causes institutional irrelevance regardless of marketing spend.',
        },
        {
          label: 'Step 3 · Formulate Diagnosis & Implied Trade-Off',
          reasoning:
            'Diagnosis: "Our governing bottleneck is an 11-week post-draft review lag that causes rigorously researched briefs to miss legislative windows." Guiding policy: trade report quantity (cut from 28 to 14/year) for rapid 3-week peer review on high-window inquiries.',
          evidenceNote: 'Explicitly stops 14 low-timing-sensitivity reports rather than adding PR headcount.',
        },
      ],
      conclusion:
        'Notice how the diagnosis immediately separates essential actions from expensive distractions.',
    },
    guidedPractice: {
      prompt:
        'Which statement qualifies as a true strategic diagnosis rather than a goal or symptom list?',
      options: [
        {
          id: 'a',
          label:
            '"We aim to become the premier regional partner for clean-energy permitting by improving cross-team collaboration and stakeholder alignment."',
          feedback:
            'Weak choice. This is an aspirational goal paired with vague virtues ("collaboration", "alignment"), naming neither a bottleneck nor a testable mechanism.',
          isStrongest: false,
        },
        {
          id: 'b',
          label:
            '"Permitting timelines exceed statutory targets by 140 days primarily because environmental and grid-impact reviews run sequentially rather than in parallel, locking 75% of applications in inter-agency handoff queues."',
          feedback:
            'Strongest diagnosis. It names a specific, measurable mechanism explaining why the problem persists and immediately points toward parallel review and handoff redesign.',
          isStrongest: true,
        },
        {
          id: 'c',
          label:
            '"Citizens are frustrated by delays and staff morale is stretched across all permitting divisions."',
          feedback:
            'Weak choice. Accurate symptoms, perhaps, but symptoms alone do not tell leadership where to intervene.',
          isStrongest: false,
        },
      ],
      reviewCriteria: [
        'Does your diagnosis explain *why* the problem persists rather than merely restating *that* it exists?',
        'Does it imply at least one existing activity that should stop or shrink?',
      ],
    },
    independentApplicationPrompt:
      'Open the Strategy Coherence Review tool, enter your diagnosis and guiding policy, list your organization’s active initiatives, and check how many actions remain orphaned from the crux.',
    reviewCriteria: [
      'Diagnosis names a primary mechanism or bottleneck supported by Module 01–03 evidence.',
      'Guiding policy rules out competing alternatives rather than endorsing everything.',
      'At least one explicit stop-doing commitment and one revision trigger are recorded.',
    ],
    limitations: [
      'Compressing a multifaceted institutional crisis into a single crux can oversimplify situations with genuinely independent parallel failures; test whether a second bottleneck emerges once the first clears.',
      'Diagnoses age rapidly when external actors adapt.',
    ],
    bridgeToNext: {
      nextModuleNumber: 5,
      text: 'Part I (AWAKEN) establishes internal clarity of framing, models, systems, and diagnosis. Part II (SEE: Modules 05–08) will turn outward to macroenvironmental change, industry structure, capabilities, and stakeholder power once those modules are approved and published.',
    },
    sources: [
      {
        author: 'Richard P. Rumelt',
        year: '2011',
        title: 'Good Strategy / Bad Strategy: The Difference and Why It Matters',
        note: 'Chapter 5: The Kernel of Good Strategy — Diagnosis, Guiding Policy, and Coherent Actions.',
      },
      {
        author: 'Eliyahu M. Goldratt',
        year: '1984',
        title: 'The Goal',
        note: 'Core constraint-identification principle: non-bottleneck local optimization fails to improve system throughput.',
      },
    ],
  },
};
