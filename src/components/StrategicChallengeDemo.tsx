import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext.tsx';

interface StepChoice {
  id: string;
  label: string;
  rationale: string;
  quality: 'strong' | 'partial' | 'weak';
}

const CHALLENGE_SCENARIO = {
  title: 'The Stalled Regional Intake Office',
  brief:
    'A public licensing agency faces mounting criticism: application wait times rose from 18 days to 54 days over two quarters. A taskforce immediately proposes buying new intake software and mandating weekend overtime.',
  step1Prompt: '1. Before authorizing software or overtime, what is the strongest opening question?',
  step1Choices: [
    {
      id: 's1-a',
      label: 'Ask which software vendor can deploy fastest within existing IT procurement rules.',
      rationale:
        'Premature solutioning: this assumes intake software is the bottleneck without checking whether applications stall during intake, legal review, or external verification.',
      quality: 'weak',
    },
    {
      id: 's1-b',
      label: 'Measure where applications actually wait and whether arrivals now exceed processing capacity.',
      rationale:
        'Sound diagnosis: separating where the stock accumulates from the inflow and outflow rates prevents fixing a non-bottleneck step.',
      quality: 'strong',
    },
    {
      id: 's1-c',
      label: 'Survey applicants on their satisfaction with portal readability.',
      rationale:
        'Partial signal: useful for usability, yet unable to reveal whether a structural capacity deficit or downstream review lag drives the 54-day wait.',
      quality: 'partial',
    },
  ] as StepChoice[],
  step2Prompt:
    '2. Audit reveals intake clerks clear 180 files/week (at 190/week arrivals), while specialist compliance reviewers clear 110 files/week because 40% of files lack municipal tax clearance. What happens if weekend overtime doubles intake clerk output to 360/week?',
  step2Choices: [
    {
      id: 's2-a',
      label: 'Total applicant wait time drops proportionally by roughly half.',
      rationale:
        'Incorrect: speeding up an upstream step ahead of a constrained specialist stage merely shifts the queue in front of compliance reviewers.',
      quality: 'weak',
    },
    {
      id: 's2-b',
      label: 'The backlog shifts downstream to specialist reviewers while end-to-end wait time stays stubbornly high.',
      rationale:
        'Exact systems diagnosis: non-bottleneck acceleration adds labor cost without increasing system throughput until specialist review capacity or upstream missing tax clearances are addressed.',
      quality: 'strong',
    },
    {
      id: 's2-c',
      label: 'Missing tax clearances resolve themselves once intake speed improves.',
      rationale:
        'Incorrect: faster intake pushes incomplete files into specialist queues sooner, increasing rework and delay.',
      quality: 'weak',
    },
  ] as StepChoice[],
};

export default function StrategicChallengeDemo() {
  const { trackEvent, setActiveDraftSnapshot } = usePlatform();
  const [started, setStarted] = useState(false);
  const [step1, setStep1] = useState<string | null>(null);
  const [step2, setStep2] = useState<string | null>(null);

  const selected1 = CHALLENGE_SCENARIO.step1Choices.find((c) => c.id === step1);
  const selected2 = CHALLENGE_SCENARIO.step2Choices.find((c) => c.id === step2);

  const handleSelect1 = (id: string) => {
    if (!started) {
      setStarted(true);
      trackEvent('challenge_started', { step: 1 });
    }
    setStep1(id);
  };

  const handleSelect2 = (id: string) => {
    setStep2(id);
    trackEvent('challenge_completed', { step: 2 });
  };

  const handleReset = () => {
    setStep1(null);
    setStep2(null);
  };

  const handleTransferToLab = () => {
    setActiveDraftSnapshot({
      title: 'Regional Licensing Wait-Time Reduction',
      context: CHALLENGE_SCENARIO.brief,
      observations:
        'Wait times rose from 18 to 54 days. Arrivals: 190/week; intake clerks: 180/week; specialist review: 110/week; 40% arrive missing municipal tax clearance.',
      rivalExplanations:
        'Rival A: Intake clerk understaffing. Rival B: Upstream incomplete tax clearances starving specialist throughput.',
      systemMechanisms:
        'Stock = pending applications ahead of specialist review. Increasing intake speed without resolving tax-clearance completeness shifts backlog downstream.',
      linkedModuleNumber: 1,
    });
  };

  return (
    <div className="bg-[#FAF7F0] border border-[#D8CFBE] rounded-lg p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5 border-b border-[#E2DACB]">
        <div>
          <p className="text-xs font-medium tracking-wide uppercase text-[#244C3C]">
            Interactive Diagnostic Exercise · Hypothetical Case · 2 Minutes
          </p>
          <h3 className="font-serif text-2xl font-medium text-[#0D1B2A] mt-1">
            {CHALLENGE_SCENARIO.title}
          </h3>
        </div>
        {(step1 || step2) && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525866] hover:text-[#0D1B2A] whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset exercise
          </button>
        )}
      </div>

      <p className="text-base text-[#1B1E23] leading-relaxed mt-5">{CHALLENGE_SCENARIO.brief}</p>

      <div className="mt-6 space-y-6">
        <div>
          <p className="text-sm font-semibold text-[#0D1B2A] mb-3">{CHALLENGE_SCENARIO.step1Prompt}</p>
          <div className="space-y-2.5">
            {CHALLENGE_SCENARIO.step1Choices.map((choice) => {
              const active = step1 === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleSelect1(choice.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-md border text-sm transition-colors duration-150 ${
                    active
                      ? 'bg-[#0D1B2A] text-[#FAF7F0] border-[#0D1B2A]'
                      : 'bg-[#F3EEE3] text-[#1B1E23] border-[#E2DACB] hover:border-[#9A742B]'
                  }`}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
          {selected1 && (
            <div
              className={`mt-3 p-4 rounded-md border text-sm leading-relaxed ${
                selected1.quality === 'strong'
                  ? 'bg-[#EBF2EE] border-[#244C3C]/30 text-[#173328]'
                  : 'bg-[#F7F1E1] border-[#9A742B]/40 text-[#3F2E0D]'
              }`}
            >
              <span className="font-semibold">
                {selected1.quality === 'strong'
                  ? 'Strongest Framing: '
                  : selected1.quality === 'partial'
                    ? 'Incomplete Framing: '
                    : 'Framing Trap: '}
              </span>
              {selected1.rationale}
            </div>
          )}
        </div>

        {step1 && (
          <div className="pt-4 border-t border-[#E2DACB]">
            <p className="text-sm font-semibold text-[#0D1B2A] mb-3">
              {CHALLENGE_SCENARIO.step2Prompt}
            </p>
            <div className="space-y-2.5">
              {CHALLENGE_SCENARIO.step2Choices.map((choice) => {
                const active = step2 === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleSelect2(choice.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-md border text-sm transition-colors duration-150 ${
                      active
                        ? 'bg-[#0D1B2A] text-[#FAF7F0] border-[#0D1B2A]'
                        : 'bg-[#F3EEE3] text-[#1B1E23] border-[#E2DACB] hover:border-[#9A742B]'
                    }`}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
            {selected2 && (
              <div
                className={`mt-3 p-4 rounded-md border text-sm leading-relaxed ${
                  selected2.quality === 'strong'
                    ? 'bg-[#EBF2EE] border-[#244C3C]/30 text-[#173328]'
                    : 'bg-[#F7F1E1] border-[#9A742B]/40 text-[#3F2E0D]'
                }`}
              >
                <span className="font-semibold">
                  {selected2.quality === 'strong' ? 'Sound Systems Reasoning: ' : 'Structural Error: '}
                </span>
                {selected2.rationale}
              </div>
            )}
          </div>
        )}

        {step1 && step2 && (
          <div className="pt-4 border-t border-[#E2DACB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2 text-sm text-[#244C3C]">
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                You just practiced Module 01 (Framing) and Module 03 (Bottleneck Flows). Continue to
                apply these principles to your own decision.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/learn/problem-definition-and-framing"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border border-[#0D1B2A] text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap"
              >
                Read Module 01
              </Link>
              <Link
                to="/strategy-lab?tool=problem-framing"
                onClick={handleTransferToLab}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-[#0D1B2A] text-[#FAF7F0] hover:bg-[#162A40] whitespace-nowrap"
              >
                Open Workbench
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
