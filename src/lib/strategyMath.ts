export interface SystemsSimulationInput {
  initialBacklog: number;
  arrivalRate: number;
  baseCapacity: number;
  targetBacklog: number;
  adjustmentGain: number;
  delayWeeks: number;
  horizonWeeks: number;
}

export interface SystemsWeekPoint {
  week: number;
  arrivals: number;
  observedBacklog: number;
  effectiveCapacity: number;
  completions: number;
  backlog: number;
  netFlow: number;
  impliedWaitWeeks: number | null;
}

export interface SystemsSimulationResult {
  points: SystemsWeekPoint[];
  peakBacklog: number;
  finalBacklog: number;
  maxImpliedWaitWeeks: number | null;
  oscillationCount: number;
  netImbalancePerWeek: number;
}

export function simulateBacklogSystem(input: SystemsSimulationInput): SystemsSimulationResult {
  const horizon = Math.max(4, Math.min(52, Math.round(input.horizonWeeks)));
  const delay = Math.max(0, Math.min(16, Math.round(input.delayWeeks)));
  const initialBacklog = Math.max(0, input.initialBacklog);
  const arrivalRate = Math.max(0, input.arrivalRate);
  const baseCapacity = Math.max(0, input.baseCapacity);
  const targetBacklog = Math.max(0, input.targetBacklog);
  const gain = Math.max(0, Math.min(1, input.adjustmentGain));

  const points: SystemsWeekPoint[] = [];
  let currentBacklog = initialBacklog;
  let peakBacklog = initialBacklog;
  let maxWait: number | null = baseCapacity > 0 ? initialBacklog / baseCapacity : null;
  let previousNetSign = 0;
  let oscillationCount = 0;

  for (let week = 0; week <= horizon; week++) {
    const observedBacklog =
      week === 0 || delay === 0
        ? currentBacklog
        : week - delay >= 0
          ? points[week - delay].backlog
          : initialBacklog;

    const effectiveCapacity = Math.max(
      0,
      Number((baseCapacity + gain * (observedBacklog - targetBacklog)).toFixed(2)),
    );

    if (week === 0) {
      const wait0 = effectiveCapacity > 0 ? Number((currentBacklog / effectiveCapacity).toFixed(2)) : null;
      points.push({
        week: 0,
        arrivals: 0,
        observedBacklog: Number(observedBacklog.toFixed(2)),
        effectiveCapacity,
        completions: 0,
        backlog: Number(currentBacklog.toFixed(2)),
        netFlow: 0,
        impliedWaitWeeks: wait0,
      });
      continue;
    }

    const available = currentBacklog + arrivalRate;
    const completions = Number(Math.min(available, effectiveCapacity).toFixed(2));
    const nextBacklog = Math.max(0, Number((currentBacklog + arrivalRate - completions).toFixed(2)));
    const netFlow = Number((arrivalRate - completions).toFixed(2));
    const impliedWaitWeeks =
      effectiveCapacity > 0 ? Number((nextBacklog / effectiveCapacity).toFixed(2)) : null;

    if (nextBacklog > peakBacklog) {
      peakBacklog = nextBacklog;
    }
    if (impliedWaitWeeks !== null && (maxWait === null || impliedWaitWeeks > maxWait)) {
      maxWait = impliedWaitWeeks;
    }

    const netSign = netFlow > 0.05 ? 1 : netFlow < -0.05 ? -1 : 0;
    if (previousNetSign !== 0 && netSign !== 0 && netSign !== previousNetSign) {
      oscillationCount += 1;
    }
    if (netSign !== 0) {
      previousNetSign = netSign;
    }

    points.push({
      week,
      arrivals: Number(arrivalRate.toFixed(2)),
      observedBacklog: Number(observedBacklog.toFixed(2)),
      effectiveCapacity,
      completions,
      backlog: nextBacklog,
      netFlow,
      impliedWaitWeeks,
    });

    currentBacklog = nextBacklog;
  }

  return {
    points,
    peakBacklog: Number(peakBacklog.toFixed(2)),
    finalBacklog: points[points.length - 1]?.backlog ?? 0,
    maxImpliedWaitWeeks: maxWait !== null ? Number(maxWait.toFixed(2)) : null,
    oscillationCount,
    netImbalancePerWeek: Number((arrivalRate - baseCapacity).toFixed(2)),
  };
}

export interface DecisionStateInput {
  id: string;
  label: string;
  probability: number;
}

export interface DecisionAlternativeInput {
  id: string;
  name: string;
  outcomes: Record<string, number>;
  worstCaseNonFinancial: string;
  irreversibility: 'Low' | 'Moderate' | 'High';
}

export interface EvaluatedAlternative {
  id: string;
  name: string;
  expectedValue: number;
  minOutcome: number;
  maxOutcome: number;
  maxRegret: number;
  irreversibility: 'Low' | 'Moderate' | 'High';
  worstCaseNonFinancial: string;
}

export interface SensitivityCrossover {
  focalStateId: string;
  focalStateLabel: string;
  challengerName: string;
  leaderName: string;
  thresholdProbability: number | null;
  explanation: string;
}

export interface DecisionComparisonResult {
  probabilitySum: number;
  probabilitiesValid: boolean;
  rankedByExpectedValue: EvaluatedAlternative[];
  minimaxRegretWinnerId: string | null;
  maximinWinnerId: string | null;
  sensitivityNote: SensitivityCrossover | null;
}

export function evaluateDecisionComparison(
  alternatives: DecisionAlternativeInput[],
  states: DecisionStateInput[],
  normalizeProbabilities = false,
): DecisionComparisonResult {
  const rawSum = states.reduce((acc, s) => acc + Math.max(0, s.probability), 0);
  const probabilitiesValid = Math.abs(rawSum - 1) <= 0.005;

  const effectiveStates = states.map((s) => ({
    ...s,
    effectiveProb:
      normalizeProbabilities && rawSum > 0 ? Math.max(0, s.probability) / rawSum : Math.max(0, s.probability),
  }));

  // Best outcome per state for regret calculation
  const bestByState: Record<string, number> = {};
  for (const state of effectiveStates) {
    let best = -Infinity;
    for (const alt of alternatives) {
      const val = alt.outcomes[state.id] ?? 0;
      if (val > best) best = val;
    }
    bestByState[state.id] = best === -Infinity ? 0 : best;
  }

  const evaluated: EvaluatedAlternative[] = alternatives.map((alt) => {
    let ev = 0;
    let minOutcome = Infinity;
    let maxOutcome = -Infinity;
    let maxRegret = 0;

    for (const state of effectiveStates) {
      const outcome = alt.outcomes[state.id] ?? 0;
      ev += outcome * state.effectiveProb;
      if (outcome < minOutcome) minOutcome = outcome;
      if (outcome > maxOutcome) maxOutcome = outcome;
      const regret = bestByState[state.id] - outcome;
      if (regret > maxRegret) maxRegret = regret;
    }

    return {
      id: alt.id,
      name: alt.name,
      expectedValue: Number(ev.toFixed(2)),
      minOutcome: minOutcome === Infinity ? 0 : Number(minOutcome.toFixed(2)),
      maxOutcome: maxOutcome === -Infinity ? 0 : Number(maxOutcome.toFixed(2)),
      maxRegret: Number(maxRegret.toFixed(2)),
      irreversibility: alt.irreversibility,
      worstCaseNonFinancial: alt.worstCaseNonFinancial,
    };
  });

  const rankedByExpectedValue = [...evaluated].sort((a, b) => b.expectedValue - a.expectedValue);

  const minimaxRegretWinner = [...evaluated].sort((a, b) => a.maxRegret - b.maxRegret)[0] ?? null;
  const maximinWinner = [...evaluated].sort((a, b) => b.minOutcome - a.minOutcome)[0] ?? null;

  let sensitivityNote: SensitivityCrossover | null = null;
  if (rankedByExpectedValue.length >= 2 && effectiveStates.length >= 2) {
    const leader = alternatives.find((a) => a.id === rankedByExpectedValue[0].id)!;
    const challenger = alternatives.find((a) => a.id === rankedByExpectedValue[1].id)!;
    const s0 = effectiveStates[0];
    const otherStates = effectiveStates.slice(1);
    const otherProbSum = otherStates.reduce((acc, s) => acc + s.effectiveProb, 0);

    // Express EV(leader) - EV(challenger) as a function of p0 (with remaining states scaled proportionally to 1 - p0)
    const leaderS0 = leader.outcomes[s0.id] ?? 0;
    const challengerS0 = challenger.outcomes[s0.id] ?? 0;

    const leaderRestAvg =
      otherProbSum > 0
        ? otherStates.reduce((acc, s) => acc + (leader.outcomes[s.id] ?? 0) * (s.effectiveProb / otherProbSum), 0)
        : otherStates.reduce((acc, s) => acc + (leader.outcomes[s.id] ?? 0), 0) / otherStates.length;

    const challengerRestAvg =
      otherProbSum > 0
        ? otherStates.reduce(
            (acc, s) => acc + (challenger.outcomes[s.id] ?? 0) * (s.effectiveProb / otherProbSum),
            0,
          )
        : otherStates.reduce((acc, s) => acc + (challenger.outcomes[s.id] ?? 0), 0) / otherStates.length;

    const diffS0 = leaderS0 - challengerS0;
    const diffRest = leaderRestAvg - challengerRestAvg;
    const denom = diffS0 - diffRest;

    if (Math.abs(denom) > 1e-6) {
      const pStar = -diffRest / denom;
      if (pStar >= 0 && pStar <= 1) {
        sensitivityNote = {
          focalStateId: s0.id,
          focalStateLabel: s0.label,
          leaderName: leader.name,
          challengerName: challenger.name,
          thresholdProbability: Number(pStar.toFixed(3)),
          explanation: `Holding relative weights of the other states fixed, "${challenger.name}" overtakes "${leader.name}" on expected value if the probability of "${s0.label}" crosses ${(pStar * 100).toFixed(1)}%.`,
        };
      } else {
        sensitivityNote = {
          focalStateId: s0.id,
          focalStateLabel: s0.label,
          leaderName: leader.name,
          challengerName: challenger.name,
          thresholdProbability: null,
          explanation: `"${leader.name}" dominates "${challenger.name}" on expected value across the entire 0%–100% probability range for "${s0.label}" under these payoff assumptions.`,
        };
      }
    }
  }

  return {
    probabilitySum: Number(rawSum.toFixed(3)),
    probabilitiesValid,
    rankedByExpectedValue,
    minimaxRegretWinnerId: minimaxRegretWinner?.id ?? null,
    maximinWinnerId: maximinWinner?.id ?? null,
    sensitivityNote,
  };
}

export type ScenarioVerdict = 'viable' | 'neutral' | 'fails';

export interface ScenarioMoveEvaluation {
  moveName: string;
  verdicts: Record<string, ScenarioVerdict>;
}

export interface ScenarioClassification {
  moveName: string;
  viableCount: number;
  failCount: number;
  classification: 'Robust Move' | 'Contingent Bet' | 'Vulnerable Option';
}

export function classifyScenarioMoves(
  scenarioIds: string[],
  moves: ScenarioMoveEvaluation[],
): ScenarioClassification[] {
  return moves.map((move) => {
    let viableCount = 0;
    let failCount = 0;
    for (const id of scenarioIds) {
      const v = move.verdicts[id] ?? 'neutral';
      if (v === 'viable') viableCount += 1;
      if (v === 'fails') failCount += 1;
    }

    let classification: ScenarioClassification['classification'] = 'Contingent Bet';
    if (failCount === 0 && viableCount >= Math.max(2, Math.ceil(scenarioIds.length * 0.75))) {
      classification = 'Robust Move';
    } else if (failCount > Math.floor(scenarioIds.length / 2)) {
      classification = 'Vulnerable Option';
    }

    return {
      moveName: move.moveName,
      viableCount,
      failCount,
      classification,
    };
  });
}

export interface CoherenceActionInput {
  id: string;
  action: string;
  addressesDiagnosis: boolean;
  owner: string;
  resourcesAllocated: string;
}

export interface CoherenceAuditResult {
  coherentCount: number;
  orphanedActions: string[];
  missingOwners: string[];
  missingStopRule: boolean;
  missingRevisionTrigger: boolean;
  scoreSummary: string;
}

export function auditStrategyCoherence(params: {
  diagnosis: string;
  guidingPolicy: string;
  whatWillStop: string;
  revisionTrigger: string;
  actions: CoherenceActionInput[];
}): CoherenceAuditResult {
  const orphanedActions = params.actions
    .filter((a) => a.action.trim().length > 0 && !a.addressesDiagnosis)
    .map((a) => a.action.trim());

  const missingOwners = params.actions
    .filter((a) => a.action.trim().length > 0 && a.owner.trim().length === 0)
    .map((a) => a.action.trim());

  const coherentCount = params.actions.filter(
    (a) => a.action.trim().length > 0 && a.addressesDiagnosis,
  ).length;

  const missingStopRule = params.whatWillStop.trim().length < 8;
  const missingRevisionTrigger = params.revisionTrigger.trim().length < 8;

  const gaps: string[] = [];
  if (params.diagnosis.trim().length < 15) gaps.push('Diagnosis is too thin to constrain action');
  if (params.guidingPolicy.trim().length < 15) gaps.push('Guiding policy is not stated');
  if (orphanedActions.length > 0) gaps.push(`${orphanedActions.length} orphaned action(s) not linked to diagnosis`);
  if (missingOwners.length > 0) gaps.push(`${missingOwners.length} action(s) without an explicit owner`);
  if (missingStopRule) gaps.push('No explicit trade-off specifying what will stop');
  if (missingRevisionTrigger) gaps.push('No falsifiable revision trigger');

  return {
    coherentCount,
    orphanedActions,
    missingOwners,
    missingStopRule,
    missingRevisionTrigger,
    scoreSummary:
      gaps.length === 0
        ? 'Structurally coherent: diagnosis, guiding policy, actions, trade-offs, and revision triggers are aligned.'
        : `Structural gaps identified: ${gaps.join('; ')}.`,
  };
}
