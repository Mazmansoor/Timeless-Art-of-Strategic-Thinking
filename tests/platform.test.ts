import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  auditStrategyCoherence,
  classifyScenarioMoves,
  evaluateDecisionComparison,
  simulateBacklogSystem,
} from '../src/lib/strategyMath.ts';
import { hashPassword, verifyPassword } from '../server/db.ts';
import {
  signSessionToken,
  verifySessionToken,
  verifyStripeWebhookSignature,
} from '../server/auth.ts';
import { mergeLearningProgressRecord } from '../src/lib/portfolioUtils.ts';

describe('Systems Explorer Mathematical Engine', () => {
  it('computes rising backlog when arrival rate exceeds base capacity without adjustment gain', () => {
    const res = simulateBacklogSystem({
      initialBacklog: 50,
      arrivalRate: 40,
      baseCapacity: 30,
      targetBacklog: 40,
      adjustmentGain: 0,
      delayWeeks: 0,
      horizonWeeks: 10,
    });
    assert.equal(res.netImbalancePerWeek, 10);
    assert.equal(res.finalBacklog, 150);
    assert.equal(res.peakBacklog, 150);
  });

  it('produces delay-induced oscillation when adjustment gain reacts to delayed backlog', () => {
    const zeroDelay = simulateBacklogSystem({
      initialBacklog: 80,
      arrivalRate: 40,
      baseCapacity: 35,
      targetBacklog: 40,
      adjustmentGain: 0.45,
      delayWeeks: 0,
      horizonWeeks: 24,
    });
    const delayed = simulateBacklogSystem({
      initialBacklog: 80,
      arrivalRate: 40,
      baseCapacity: 35,
      targetBacklog: 40,
      adjustmentGain: 0.45,
      delayWeeks: 4,
      horizonWeeks: 24,
    });
    assert.ok(delayed.peakBacklog > zeroDelay.peakBacklog);
    assert.ok(delayed.oscillationCount >= 1);
  });
});

describe('Decision Comparison & Sensitivity Calculations', () => {
  it('calculates exact expected values, maximin, minimax regret, and sensitivity crossover', () => {
    const result = evaluateDecisionComparison(
      [
        {
          id: 'a1',
          name: 'Aggressive Lease',
          outcomes: { s1: 100, s2: -50 },
          worstCaseNonFinancial: 'Lock-in risk',
          irreversibility: 'High',
        },
        {
          id: 'a2',
          name: 'Phased Pilot',
          outcomes: { s1: 60, s2: 30 },
          worstCaseNonFinancial: 'Slower rollout',
          irreversibility: 'Low',
        },
      ],
      [
        { id: 's1', label: 'Favorable', probability: 0.7 },
        { id: 's2', label: 'Adverse', probability: 0.3 },
      ],
    );

    assert.equal(result.probabilitiesValid, true);
    // EV(a1) = 100*0.7 + (-50)*0.3 = 55; EV(a2) = 60*0.7 + 30*0.3 = 51
    assert.equal(result.rankedByExpectedValue[0].id, 'a1');
    assert.equal(result.rankedByExpectedValue[0].expectedValue, 55);
    assert.equal(result.rankedByExpectedValue[1].expectedValue, 51);
    assert.equal(result.maximinWinnerId, 'a2');
    // Crossover: 100p - 50(1-p) = 60p + 30(1-p) => 150p - 50 = 30p + 30 => 120p = 80 => p* = 0.667
    assert.ok(result.sensitivityNote);
    assert.equal(result.sensitivityNote.thresholdProbability, 0.667);
  });
});

describe('Scenario & Coherence Logic', () => {
  it('classifies robust moves versus contingent bets without probabilities', () => {
    const out = classifyScenarioMoves(
      ['w1', 'w2', 'w3', 'w4'],
      [
        { moveName: 'Modular Core', verdicts: { w1: 'viable', w2: 'viable', w3: 'viable', w4: 'viable' } },
        { moveName: 'Fixed Lease', verdicts: { w1: 'fails', w2: 'fails', w3: 'neutral', w4: 'viable' } },
      ],
    );
    assert.equal(out[0].classification, 'Robust Move');
    assert.equal(out[1].classification, 'Contingent Bet');
  });

  it('flags orphaned actions and missing stop-doing rules in Coherence Review', () => {
    const audit = auditStrategyCoherence({
      diagnosis: 'Review bottleneck delays briefs past legislative hearings.',
      guidingPolicy: 'Halve monograph output to double hearing-window turnaround.',
      whatWillStop: '',
      revisionTrigger: '',
      actions: [
        {
          id: '1',
          action: 'Single rapid review panel',
          addressesDiagnosis: true,
          owner: 'Editor',
          resourcesAllocated: '6h/wk',
        },
        {
          id: '2',
          action: 'Hire PR agency',
          addressesDiagnosis: false,
          owner: '',
          resourcesAllocated: '$80k',
        },
      ],
    });
    assert.equal(audit.coherentCount, 1);
    assert.deepEqual(audit.orphanedActions, ['Hire PR agency']);
    assert.equal(audit.missingStopRule, true);
    assert.equal(audit.missingRevisionTrigger, true);
  });
});

describe('Authentication, Session Integrity & Stripe Webhook Verification', () => {
  it('hashes and verifies scrypt passwords cleanly', () => {
    const hash = hashPassword('StrategicTest123!');
    assert.equal(verifyPassword('StrategicTest123!', hash), true);
    assert.equal(verifyPassword('WrongPassword!', hash), false);
  });

  it('signs and verifies session tokens while rejecting tampered payloads', () => {
    const token = signSessionToken('user-42');
    const verified = verifySessionToken(token);
    assert.equal(verified?.uid, 'user-42');

    const tampered = `${token.slice(0, -2)}xx`;
    assert.equal(verifySessionToken(tampered), null);
  });

  it('verifies valid Stripe webhook HMAC signatures and rejects forged ones', () => {
    const secret = 'whsec_test_secret_key';
    const ts = Math.floor(Date.now() / 1000);
    const body = Buffer.from(JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' }));
    const sig = crypto.createHmac('sha256', secret).update(`${ts}.${body.toString('utf8')}`).digest('hex');

    assert.equal(verifyStripeWebhookSignature(body, `t=${ts},v1=${sig}`, secret), true);
    assert.equal(verifyStripeWebhookSignature(body, `t=${ts},v1=deadbeef`, secret), false);
  });
});

describe('Workspace Learning Progress Ledger', () => {
  it('preserves Guided practice completed status when a module is later reopened', () => {
    const first = mergeLearningProgressRecord([], {
      moduleNumber: 1,
      slug: 'problem-definition-and-framing',
      academicSubject: 'Problem Definition and Framing',
      stageLabel: 'Awaken',
      status: 'Opened',
    });
    assert.equal(first.record.status, 'Opened');

    const second = mergeLearningProgressRecord(first.updated, {
      moduleNumber: 1,
      slug: 'problem-definition-and-framing',
      academicSubject: 'Problem Definition and Framing',
      stageLabel: 'Awaken',
      status: 'Guided practice completed',
      selectedPracticeOption: 'Check municipal extract timestamps before enforcing penalties',
    });
    assert.equal(second.record.status, 'Guided practice completed');
    assert.ok(second.record.practiceCompletedAt);

    const third = mergeLearningProgressRecord(second.updated, {
      moduleNumber: 1,
      slug: 'problem-definition-and-framing',
      academicSubject: 'Problem Definition and Framing',
      stageLabel: 'Awaken',
      status: 'Opened',
    });
    assert.equal(third.record.status, 'Guided practice completed');
    assert.equal(
      third.record.selectedPracticeOption,
      'Check municipal extract timestamps before enforcing penalties',
    );
  });
});
