import React, { useMemo, useState } from 'react';
import {
  evaluateDecisionComparison,
  type DecisionAlternativeInput,
  type DecisionStateInput,
} from '../../lib/strategyMath.ts';
import ToolShell from './ToolShell.tsx';

export default function DecisionComparisonTool() {
  const [decisionTitle, setDecisionTitle] = useState('Regional Service Expansion Decision');
  const [unitLabel, setUnitLabel] = useState('$k net impact');
  const [normalizeProbs, setNormalizeProbs] = useState(false);

  const [states, setStates] = useState<DecisionStateInput[]>([
    { id: 's1', label: 'Regulatory Approval On Time', probability: 0.55 },
    { id: 's2', label: '6-Month Interagency Delay', probability: 0.30 },
    { id: 's3', label: 'Local Mandate Revision', probability: 0.15 },
  ]);

  const [alternatives, setAlternatives] = useState<DecisionAlternativeInput[]>([
    {
      id: 'a1',
      name: 'Full Upfront Site Lease',
      outcomes: { s1: 900, s2: 180, s3: -650 },
      worstCaseNonFinancial: 'Irreversible 5-year lease liability; reputational loss if closure required.',
      irreversibility: 'High',
    },
    {
      id: 'a2',
      name: 'Phased Shared-Facility Pilot',
      outcomes: { s1: 580, s2: 410, s3: 90 },
      worstCaseNonFinancial: 'Slower initial brand visibility; zero long-term real-estate lock-in.',
      irreversibility: 'Low',
    },
    {
      id: 'a3',
      name: 'Defer Entry 12 Months',
      outcomes: { s1: 120, s2: 120, s3: 150 },
      worstCaseNonFinancial: 'Competitors or peer agencies occupy partner slots first.',
      irreversibility: 'Moderate',
    },
  ]);

  const evaluation = useMemo(
    () => evaluateDecisionComparison(alternatives, states, normalizeProbs),
    [alternatives, states, normalizeProbs],
  );

  const loadWorkedExample = () => {
    setDecisionTitle('Regional Service Expansion Decision');
    setUnitLabel('$k net impact');
    setStates([
      { id: 's1', label: 'Regulatory Approval On Time', probability: 0.55 },
      { id: 's2', label: '6-Month Interagency Delay', probability: 0.30 },
      { id: 's3', label: 'Local Mandate Revision', probability: 0.15 },
    ]);
    setAlternatives([
      {
        id: 'a1',
        name: 'Full Upfront Site Lease',
        outcomes: { s1: 900, s2: 180, s3: -650 },
        worstCaseNonFinancial: 'Irreversible 5-year lease liability; reputational loss if closure required.',
        irreversibility: 'High',
      },
      {
        id: 'a2',
        name: 'Phased Shared-Facility Pilot',
        outcomes: { s1: 580, s2: 410, s3: 90 },
        worstCaseNonFinancial: 'Slower initial brand visibility; zero long-term real-estate lock-in.',
        irreversibility: 'Low',
      },
      {
        id: 'a3',
        name: 'Defer Entry 12 Months',
        outcomes: { s1: 120, s2: 120, s3: 150 },
        worstCaseNonFinancial: 'Competitors or peer agencies occupy partner slots first.',
        irreversibility: 'Moderate',
      },
    ]);
  };

  const updateStateProb = (id: string, prob: number) => {
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, probability: prob } : s)));
  };

  const updateStateLabel = (id: string, label: string) => {
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));
  };

  const updateOutcome = (altId: string, stateId: string, val: number) => {
    setAlternatives((prev) =>
      prev.map((a) =>
        a.id === altId ? { ...a, outcomes: { ...a.outcomes, [stateId]: val } } : a,
      ),
    );
  };

  const updateAltMeta = (
    altId: string,
    field: 'name' | 'worstCaseNonFinancial' | 'irreversibility',
    val: string,
  ) => {
    setAlternatives((prev) =>
      prev.map((a) => (a.id === altId ? { ...a, [field]: val } : a)),
    );
  };

  const exportMarkdown = () =>
    [
      `# Decision Comparison Matrix: ${decisionTitle}`,
      `Outcome Unit: ${unitLabel} (Illustrative probabilities sum to ${(evaluation.probabilitySum * 100).toFixed(1)}%)`,
      '',
      '## Ranked by Expected Value (Not Sole Decision Criterion)',
      ...evaluation.rankedByExpectedValue.map(
        (r, i) =>
          `${i + 1}. **${r.name}** — EV: ${r.expectedValue} | Worst-case: ${r.minOutcome} | Max Regret: ${r.maxRegret} | Irreversibility: ${r.irreversibility}\n   Non-financial downside: ${r.worstCaseNonFinancial}`,
      ),
      '',
      evaluation.sensitivityNote ? `## Sensitivity Threshold\n${evaluation.sensitivityNote.explanation}` : '',
    ].join('\n');

  return (
    <ToolShell
      toolId="decision-comparison"
      title="Decision Comparison & Sensitivity Matrix"
      subtitle="Separate actions, uncertain states, and consequences using illustrative probabilities, sensitivity thresholds, worst-case downside, and non-financial irreversibility."
      linkedModuleNumber={9}
      linkedModuleLabel="Module 09 · Decision-Making Under Uncertainty (Preview Tool)"
      assumptionsNote="Probabilities entered here are illustrative subjective weights, not objective statistical laws. Expected value never overrides catastrophic irreversibility or ethical duty automatically."
      reviewCriteria={[
        'Do illustrative state probabilities sum cleanly to 100% (1.00)?',
        'Does the top expected-value choice survive reasonable shifts in the focal probability?',
        'Have you compared downside ruin, minimax regret, and irreversibility alongside expected value?',
      ]}
      limitations={[
        'Expected monetary value assumes risk neutrality and repeatable bets; a single irreversible loss invalidates pure EV maximization.',
        'Payoff cells reflect rough estimates that can disguise hidden correlations across uncertain states.',
      ]}
      onLoadWorkedExample={loadWorkedExample}
      buildPortfolioPatch={() => ({
        title: decisionTitle,
        alternativesAndTradeoffs: evaluation.rankedByExpectedValue
          .map(
            (r) =>
              `${r.name}: EV ${r.expectedValue} ${unitLabel}, Worst ${r.minOutcome}, Irreversibility ${r.irreversibility} (${r.worstCaseNonFinancial})`,
          )
          .join('\n'),
        scenariosAndUncertainty: evaluation.sensitivityNote?.explanation ?? '',
      })}
      buildExportMarkdown={exportMarkdown}
      exportFilename="decision-comparison-matrix.md"
      aiDraftSummary={`Decision: ${decisionTitle}. Ranked EV: ${evaluation.rankedByExpectedValue.map((r) => `${r.name}=${r.expectedValue} (min=${r.minOutcome}, irrev=${r.irreversibility})`).join('; ')}. Sensitivity: ${evaluation.sensitivityNote?.explanation ?? ''}`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5">
          <div className="md:col-span-2">
            <label htmlFor="dc-title" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Decision Under Comparison
            </label>
            <input
              id="dc-title"
              type="text"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="dc-unit" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Outcome Unit
            </label>
            <input
              id="dc-unit"
              type="text"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-[#E2DACB] rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 bg-[#F3EEE3] border-b border-[#E2DACB] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#0D1B2A]">
              Payoff &amp; Illustrative Probability Matrix ({unitLabel})
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span
                className={`font-mono tabular-nums ${
                  evaluation.probabilitiesValid ? 'text-[#244C3C]' : 'text-[#9A742B] font-semibold'
                }`}
              >
                Probability Sum: {(evaluation.probabilitySum * 100).toFixed(1)}%
              </span>
              {!evaluation.probabilitiesValid && (
                <label className="inline-flex items-center gap-1.5 text-[#0D1B2A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={normalizeProbs}
                    onChange={(e) => setNormalizeProbs(e.target.checked)}
                  />
                  Auto-normalize weights
                </label>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[#FAF7F0] border-b border-[#E2DACB]">
                <tr>
                  <th className="p-3.5 font-medium text-[#0D1B2A] min-w-[200px]">Alternative</th>
                  {states.map((st) => (
                    <th key={st.id} className="p-3.5 font-medium text-[#0D1B2A] min-w-[160px]">
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => updateStateLabel(st.id, e.target.value)}
                        aria-label="Uncertain state label"
                        className="w-full text-xs font-semibold bg-transparent border-b border-dashed border-[#D8CFBE] pb-1 mb-1.5"
                      />
                      <div className="flex items-center gap-1.5 text-xs text-[#525866]">
                        <span>Illust. p =</span>
                        <input
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          value={st.probability}
                          onChange={(e) => updateStateProb(st.id, Number(e.target.value))}
                          aria-label={`Probability for ${st.label}`}
                          className="w-16 px-1.5 py-0.5 font-mono tabular-nums border border-[#D8CFBE] rounded bg-white text-[#0D1B2A]"
                        />
                      </div>
                    </th>
                  ))}
                  <th className="p-3.5 font-medium text-[#0D1B2A] min-w-[120px]">Irreversibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DC]">
                {alternatives.map((alt) => (
                  <tr key={alt.id} className="align-top">
                    <td className="p-3.5 space-y-2">
                      <input
                        type="text"
                        value={alt.name}
                        onChange={(e) => updateAltMeta(alt.id, 'name', e.target.value)}
                        aria-label="Alternative name"
                        className="w-full font-medium text-[#0D1B2A] bg-transparent border-b border-[#E2DACB] pb-1"
                      />
                      <input
                        type="text"
                        value={alt.worstCaseNonFinancial}
                        onChange={(e) =>
                          updateAltMeta(alt.id, 'worstCaseNonFinancial', e.target.value)
                        }
                        aria-label="Non-financial downside"
                        placeholder="Non-financial & ethical stakes"
                        className="w-full text-xs text-[#525866] bg-[#FAF7F0] px-2 py-1 rounded border border-[#E2DACB]"
                      />
                    </td>
                    {states.map((st) => (
                      <td key={st.id} className="p-3.5">
                        <input
                          type="number"
                          value={alt.outcomes[st.id] ?? 0}
                          onChange={(e) => updateOutcome(alt.id, st.id, Number(e.target.value))}
                          aria-label={`${alt.name} outcome under ${st.label}`}
                          className="w-full px-2.5 py-1.5 font-mono tabular-nums rounded border border-[#D8CFBE] bg-white text-right"
                        />
                      </td>
                    ))}
                    <td className="p-3.5">
                      <select
                        value={alt.irreversibility}
                        onChange={(e) =>
                          updateAltMeta(alt.id, 'irreversibility', e.target.value)
                        }
                        aria-label={`Irreversibility for ${alt.name}`}
                        className="w-full px-2 py-1.5 text-xs rounded border border-[#D8CFBE] bg-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5">
            <h3 className="font-serif text-lg font-medium text-[#0D1B2A] mb-3">
              Computed Comparison (Expected Value vs. Downside &amp; Regret)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b border-[#E2DACB] text-[#525866]">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Alternative</th>
                    <th className="py-2 px-3 font-medium text-right">Expected Val.</th>
                    <th className="py-2 px-3 font-medium text-right">Worst Case</th>
                    <th className="py-2 px-3 font-medium text-right">Max Regret</th>
                    <th className="py-2 pl-3 font-medium">Irreversibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC] font-mono tabular-nums">
                  {evaluation.rankedByExpectedValue.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2.5 pr-3 font-sans font-medium text-[#0D1B2A]">
                        {row.name}
                        {row.id === evaluation.maximinWinnerId && (
                          <span className="block text-[11px] font-normal text-[#244C3C]">
                            Best worst-case protection (Maximin)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#0D1B2A]">
                        {row.expectedValue}
                      </td>
                      <td className="py-2.5 px-3 text-right">{row.minOutcome}</td>
                      <td className="py-2.5 px-3 text-right">{row.maxRegret}</td>
                      <td className="py-2.5 pl-3 font-sans">{row.irreversibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0D1B2A] text-[#FAF7F0] rounded-lg p-5 space-y-3">
            <p className="text-xs uppercase tracking-wider text-[#C29D4E]">
              Sensitivity &amp; Judgment Check
            </p>
            <p className="text-sm leading-relaxed">
              {evaluation.sensitivityNote?.explanation ??
                'Adjust state probabilities and payoff cells to inspect crossover thresholds.'}
            </p>
            <p className="text-xs text-[#C7D0DC] pt-2 border-t border-[#22364C] leading-relaxed">
              Highest expected monetary value is never automatically the right choice when an
              alternative carries high irreversibility or unacceptable non-financial harm.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
