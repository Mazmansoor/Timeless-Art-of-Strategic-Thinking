import React, { useMemo, useState } from 'react';
import { classifyScenarioMoves, type ScenarioVerdict } from '../../lib/strategyMath.ts';
import ToolShell from './ToolShell.tsx';

interface ScenarioWorld {
  id: string;
  name: string;
  axisSummary: string;
  signpost: string;
}

interface MoveRow {
  id: string;
  name: string;
  verdicts: Record<string, ScenarioVerdict>;
}

export default function ScenarioStressTestTool() {
  const [focalDecision, setFocalDecision] = useState(
    'Multi-Year Delivery Model for Regional Professional Training',
  );
  const [uncertainty1, setUncertainty1] = useState('Public Agency Budget Tightening vs. Expansion');
  const [uncertainty2, setUncertainty2] = useState('Adoption of Remote Synchronous vs. In-Person Cohorts');

  const [worlds, setWorlds] = useState<ScenarioWorld[]>([
    {
      id: 'w1',
      name: 'World A: Lean Budgets · Remote Default',
      axisSummary: 'Procurement caps travel; buyers demand modular applied workshops.',
      signpost: 'Travel freezes in Q1 municipal circulars; RFP requests shift to 90-minute modules.',
    },
    {
      id: 'w2',
      name: 'World B: Expanding Budgets · Remote Default',
      axisSummary: 'Agencies fund upskilling broadly yet keep distributed hybrid teams.',
      signpost: 'Multi-region seat contracts with asynchronous portfolio review requirements.',
    },
    {
      id: 'w3',
      name: 'World C: Lean Budgets · In-Person Mandates',
      axisSummary: 'Leadership insists on physical retreats for fewer senior cohorts.',
      signpost: 'Training budgets consolidate around 1–2 flagship annual retreats.',
    },
    {
      id: 'w4',
      name: 'World D: Expanding Budgets · In-Person Mandates',
      axisSummary: 'Strong demand for multi-day executive seminars with live facilitation.',
      signpost: 'Rising venue bookings and request for full-team on-site diagnostics.',
    },
  ]);

  const [moves, setMoves] = useState<MoveRow[]>([
    {
      id: 'm1',
      name: 'Modular Core Curriculum + Decision Portfolio Workbook',
      verdicts: { w1: 'viable', w2: 'viable', w3: 'viable', w4: 'viable' },
    },
    {
      id: 'm2',
      name: 'Sign 3-Year Dedicated Seminar Facility Lease',
      verdicts: { w1: 'fails', w2: 'fails', w3: 'neutral', w4: 'viable' },
    },
    {
      id: 'm3',
      name: 'Train Associate Facilitators Across 3 Regions (Contract Basis)',
      verdicts: { w1: 'neutral', w2: 'viable', w3: 'viable', w4: 'viable' },
    },
  ]);

  const classified = useMemo(
    () =>
      classifyScenarioMoves(
        worlds.map((w) => w.id),
        moves.map((m) => ({ moveName: m.name, verdicts: m.verdicts })),
      ),
    [worlds, moves],
  );

  const loadWorkedExample = () => {
    setFocalDecision('Multi-Year Delivery Model for Regional Professional Training');
  };

  const setVerdict = (moveId: string, worldId: string, verdict: ScenarioVerdict) => {
    setMoves((prev) =>
      prev.map((m) =>
        m.id === moveId ? { ...m, verdicts: { ...m.verdicts, [worldId]: verdict } } : m,
      ),
    );
  };

  const exportMarkdown = () =>
    [
      `# Scenario Stress Test: ${focalDecision}`,
      `Uncertainties: (1) ${uncertainty1} | (2) ${uncertainty2}`,
      '',
      '## Coherent Futures (Non-Probabilistic)',
      ...worlds.map((w) => `- **${w.name}**: ${w.axisSummary} *(Signpost: ${w.signpost})*`),
      '',
      '## Strategic Moves Classification',
      ...classified.map(
        (c) => `- **${c.moveName}** → ${c.classification} (Viable in ${c.viableCount}/4, Fails in ${c.failCount}/4)`,
      ),
    ].join('\n');

  return (
    <ToolShell
      toolId="scenario-stress-test"
      title="Scenario Stress Test"
      subtitle="Construct internally coherent plural futures without treating scenarios as forecasts or assigning artificial probabilities, and distinguish robust moves from contingent bets."
      linkedModuleNumber={10}
      linkedModuleLabel="Module 10 · Scenario Planning and Strategic Foresight (Preview Tool)"
      assumptionsNote="Scenarios explore structural boundaries of what could plausibly happen, not predictions of what will happen."
      reviewCriteria={[
        'Do the four worlds represent genuinely distinct structural combinations rather than "good/average/bad" gradients?',
        'Are moves that fail in severe worlds held as contingent bets gated by observable signposts?',
        'Have you resisted slapping arbitrary probabilities onto narrative worlds?',
      ]}
      limitations={[
        'Two-axis scenario matrices omit discontinuities lying outside the selected axes.',
        'Signposts can appear ambiguously in real time; specify thresholds ahead of commitment.',
      ]}
      onLoadWorkedExample={loadWorkedExample}
      buildPortfolioPatch={() => ({
        title: focalDecision,
        scenariosAndUncertainty: classified
          .map((c) => `${c.moveName}: ${c.classification} (${c.viableCount}/4 viable)`)
          .join('\n'),
      })}
      buildExportMarkdown={exportMarkdown}
      exportFilename="scenario-stress-test.md"
      aiDraftSummary={`Focal Decision: ${focalDecision}. Uncertainties: ${uncertainty1}; ${uncertainty2}. Moves: ${classified.map((c) => `${c.moveName}=${c.classification}`).join('; ')}`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5">
          <div>
            <label htmlFor="sc-focal" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Focal Decision
            </label>
            <input
              id="sc-focal"
              type="text"
              value={focalDecision}
              onChange={(e) => setFocalDecision(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="sc-u1" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Critical Uncertainty Axis 1
            </label>
            <input
              id="sc-u1"
              type="text"
              value={uncertainty1}
              onChange={(e) => setUncertainty1(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="sc-u2" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Critical Uncertainty Axis 2
            </label>
            <input
              id="sc-u2"
              type="text"
              value={uncertainty2}
              onChange={(e) => setUncertainty2(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {worlds.map((w) => (
            <div key={w.id} className="bg-[#F3EEE3] border border-[#E2DACB] rounded-lg p-4 space-y-2">
              <input
                type="text"
                value={w.name}
                onChange={(e) =>
                  setWorlds((prev) =>
                    prev.map((x) => (x.id === w.id ? { ...x, name: e.target.value } : x)),
                  )
                }
                aria-label="Scenario world title"
                className="w-full font-serif text-base font-medium text-[#0D1B2A] bg-transparent border-b border-[#D8CFBE] pb-1"
              />
              <textarea
                rows={2}
                value={w.axisSummary}
                onChange={(e) =>
                  setWorlds((prev) =>
                    prev.map((x) => (x.id === w.id ? { ...x, axisSummary: e.target.value } : x)),
                  )
                }
                aria-label="Scenario mechanics"
                className="w-full text-xs bg-white rounded border border-[#D8CFBE] p-2"
              />
              <div>
                <span className="text-[11px] font-medium text-[#244C3C]">Early Signpost:</span>
                <input
                  type="text"
                  value={w.signpost}
                  onChange={(e) =>
                    setWorlds((prev) =>
                      prev.map((x) => (x.id === w.id ? { ...x, signpost: e.target.value } : x)),
                    )
                  }
                  className="w-full text-xs bg-white rounded border border-[#D8CFBE] px-2 py-1 mt-1"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E2DACB] rounded-lg overflow-hidden">
          <div className="px-5 py-3 bg-[#F3EEE3] border-b border-[#E2DACB] text-xs font-semibold text-[#0D1B2A]">
            Stress-Test Matrix · Classify Moves Across Futures (No Probabilities Assigned)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAF7F0] border-b border-[#E2DACB]">
                <tr>
                  <th className="p-3.5 font-medium text-[#0D1B2A] min-w-[220px]">Proposed Move</th>
                  {worlds.map((w) => (
                    <th key={w.id} className="p-3.5 font-medium text-[#0D1B2A] min-w-[130px]">
                      {w.name.split(':')[0]}
                    </th>
                  ))}
                  <th className="p-3.5 font-medium text-[#0D1B2A] min-w-[140px]">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DC]">
                {moves.map((m, idx) => {
                  const res = classified[idx];
                  return (
                    <tr key={m.id}>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) =>
                            setMoves((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)),
                            )
                          }
                          aria-label="Strategic move name"
                          className="w-full text-sm font-medium text-[#0D1B2A] bg-transparent border-b border-[#E2DACB] pb-1"
                        />
                      </td>
                      {worlds.map((w) => (
                        <td key={w.id} className="p-3.5">
                          <select
                            value={m.verdicts[w.id] ?? 'neutral'}
                            onChange={(e) =>
                              setVerdict(m.id, w.id, e.target.value as ScenarioVerdict)
                            }
                            aria-label={`${m.name} verdict in ${w.name}`}
                            className="w-full px-2 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs"
                          >
                            <option value="viable">Viable</option>
                            <option value="neutral">Neutral / Mixed</option>
                            <option value="fails">Fails</option>
                          </select>
                        </td>
                      ))}
                      <td className="p-3.5 font-medium">
                        <span
                          className={
                            res?.classification === 'Robust Move'
                              ? 'text-[#244C3C]'
                              : res?.classification === 'Vulnerable Option'
                                ? 'text-[#7F1D1D]'
                                : 'text-[#9A742B]'
                          }
                        >
                          {res?.classification}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
