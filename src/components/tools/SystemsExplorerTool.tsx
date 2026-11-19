import React, { useMemo, useState } from 'react';
import { simulateBacklogSystem } from '../../lib/strategyMath.ts';
import ToolShell from './ToolShell.tsx';

export default function SystemsExplorerTool() {
  const [stockName, setStockName] = useState('Pending Appeals Backlog');
  const [unitName, setUnitName] = useState('cases');
  const [initialBacklog, setInitialBacklog] = useState(80);
  const [arrivalRate, setArrivalRate] = useState(40);
  const [baseCapacity, setBaseCapacity] = useState(35);
  const [targetBacklog, setTargetBacklog] = useState(40);
  const [adjustmentGain, setAdjustmentGain] = useState(0.45);
  const [delayWeeks, setDelayWeeks] = useState(3);
  const [horizonWeeks, setHorizonWeeks] = useState(24);
  const [includedBoundary, setIncludedBoundary] = useState(
    'Weekly intake arrival rate, baseline review capacity, target buffer, capacity adjustment gain, and reporting/onboarding delay.',
  );
  const [excludedBoundary, setExcludedBoundary] = useState(
    'Case complexity variance, staff fatigue under prolonged overtime, applicant withdrawals, and seasonal spikes.',
  );

  const sim = useMemo(
    () =>
      simulateBacklogSystem({
        initialBacklog,
        arrivalRate,
        baseCapacity,
        targetBacklog,
        adjustmentGain,
        delayWeeks,
        horizonWeeks,
      }),
    [initialBacklog, arrivalRate, baseCapacity, targetBacklog, adjustmentGain, delayWeeks, horizonWeeks],
  );

  const loadWorkedExample = () => {
    setStockName('Pending Appeals Backlog');
    setUnitName('cases');
    setInitialBacklog(80);
    setArrivalRate(40);
    setBaseCapacity(35);
    setTargetBacklog(40);
    setAdjustmentGain(0.45);
    setDelayWeeks(3);
    setHorizonWeeks(24);
  };

  // SVG chart dimensions
  const width = 680;
  const height = 260;
  const padLeft = 48;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const maxY = Math.max(
    10,
    targetBacklog * 1.2,
    sim.peakBacklog * 1.12,
    ...sim.points.map((p) => p.effectiveCapacity * 1.15),
  );

  const xForWeek = (w: number) => padLeft + (w / Math.max(1, horizonWeeks)) * innerW;
  const yForVal = (v: number) => padTop + innerH - (v / maxY) * innerH;

  const backlogPath = sim.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xForWeek(p.week).toFixed(1)} ${yForVal(p.backlog).toFixed(1)}`)
    .join(' ');

  const capacityPath = sim.points
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${xForWeek(p.week).toFixed(1)} ${yForVal(p.effectiveCapacity).toFixed(1)}`,
    )
    .join(' ');

  const exportMarkdown = () =>
    [
      `# Systems Explorer Model: ${stockName}`,
      `Stock Unit: ${unitName} | Flow Unit: ${unitName}/week`,
      `Parameters: Initial=${initialBacklog}, Arrivals=${arrivalRate}/wk, Base Capacity=${baseCapacity}/wk, Target=${targetBacklog}, Gain=${adjustmentGain}, Delay=${delayWeeks} wks`,
      '',
      `## Summary Metrics`,
      `- Peak Backlog: ${sim.peakBacklog} ${unitName}`,
      `- Final Backlog (Week ${horizonWeeks}): ${sim.finalBacklog} ${unitName}`,
      `- Max Implied Wait: ${sim.maxImpliedWaitWeeks ?? 'N/A'} weeks`,
      `- Flow Reversals (Oscillation Count): ${sim.oscillationCount}`,
      '',
      `## Explicit Model Boundary`,
      `- **Included:** ${includedBoundary}`,
      `- **Excluded:** ${excludedBoundary}`,
      '',
      `## Note on Causation`,
      'Causal assumptions and feedback links in this model represent structured hypotheses, not statistical proof of causation.',
    ].join('\n');

  return (
    <ToolShell
      toolId="systems-explorer"
      title="Systems Explorer: Stock, Flow & Delay Simulator"
      subtitle="Model how a stock accumulates or drains over time, inspect how reporting and onboarding delays cause capacity overshoot, and state exact model boundaries."
      linkedModuleNumber={3}
      linkedModuleSlug="systems-thinking"
      linkedModuleLabel="Module 03 · Systems Thinking"
      assumptionsNote="Deterministic discrete-time stock-flow simulation: effectiveCapacity(t) = max(0, baseCapacity + gain × (observedBacklog(t - delay) - targetBacklog))."
      reviewCriteria={[
        'Check whether baseline arrivals exceed baseline capacity before adjusting delay or gain.',
        'Compare Delay = 0 weeks vs. Delay = 4 weeks to observe how stale signals induce oscillation.',
        'Confirm that every stock and flow uses matching units and explicit boundary exclusions.',
      ]}
      limitations={[
        'Drawing causal arrows or running a simplified model does not establish empirical causation.',
        'Real staff experience fatigue, learning curves, and shifting case complexity excluded from fixed-gain equations.',
      ]}
      onLoadWorkedExample={loadWorkedExample}
      buildPortfolioPatch={() => ({
        title: `System Dynamics: ${stockName}`,
        systemMechanisms: `Stock: ${stockName} (${unitName}). Arrivals ${arrivalRate}/wk vs. Base Capacity ${baseCapacity}/wk with ${delayWeeks}-week feedback delay (gain ${adjustmentGain}). Peak backlog: ${sim.peakBacklog} ${unitName}; final backlog: ${sim.finalBacklog} ${unitName}.`,
        assumptions: `Included: ${includedBoundary}\nExcluded: ${excludedBoundary}`,
      })}
      buildExportMarkdown={exportMarkdown}
      exportFilename="systems-explorer-simulation.md"
      aiDraftSummary={`Stock: ${stockName} (${unitName}). Arrivals ${arrivalRate}/wk, Base Capacity ${baseCapacity}/wk, Delay ${delayWeeks} wks, Gain ${adjustmentGain}. Peak: ${sim.peakBacklog}, Final: ${sim.finalBacklog}, Oscillations: ${sim.oscillationCount}. Excluded: ${excludedBoundary}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sys-stock" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Stock Name
              </label>
              <input
                id="sys-stock"
                type="text"
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="sys-unit" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Stock Unit
              </label>
              <input
                id="sys-unit"
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sys-init" className="font-medium text-[#0D1B2A]">
                  Initial Backlog Stock
                </label>
                <span className="font-mono tabular-nums text-[#525866]">
                  {initialBacklog} {unitName}
                </span>
              </div>
              <input
                id="sys-init"
                type="range"
                min={0}
                max={250}
                step={5}
                value={initialBacklog}
                onChange={(e) => setInitialBacklog(Number(e.target.value))}
                className="w-full accent-[#0D1B2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sys-arr" className="font-medium text-[#0D1B2A]">
                  Inflow (Arrival Rate)
                </label>
                <span className="font-mono tabular-nums text-[#525866]">
                  {arrivalRate} {unitName}/week
                </span>
              </div>
              <input
                id="sys-arr"
                type="range"
                min={5}
                max={100}
                step={1}
                value={arrivalRate}
                onChange={(e) => setArrivalRate(Number(e.target.value))}
                className="w-full accent-[#0D1B2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sys-cap" className="font-medium text-[#0D1B2A]">
                  Baseline Capacity (Outflow)
                </label>
                <span className="font-mono tabular-nums text-[#525866]">
                  {baseCapacity} {unitName}/week
                </span>
              </div>
              <input
                id="sys-cap"
                type="range"
                min={5}
                max={100}
                step={1}
                value={baseCapacity}
                onChange={(e) => setBaseCapacity(Number(e.target.value))}
                className="w-full accent-[#0D1B2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sys-target" className="font-medium text-[#0D1B2A]">
                  Target Backlog Buffer
                </label>
                <span className="font-mono tabular-nums text-[#525866]">
                  {targetBacklog} {unitName}
                </span>
              </div>
              <input
                id="sys-target"
                type="range"
                min={0}
                max={120}
                step={5}
                value={targetBacklog}
                onChange={(e) => setTargetBacklog(Number(e.target.value))}
                className="w-full accent-[#0D1B2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sys-delay" className="font-medium text-[#0D1B2A]">
                  Information &amp; Onboarding Delay
                </label>
                <span className="font-mono tabular-nums text-[#9A742B] font-medium">
                  {delayWeeks} weeks
                </span>
              </div>
              <input
                id="sys-delay"
                type="range"
                min={0}
                max={10}
                step={1}
                value={delayWeeks}
                onChange={(e) => setDelayWeeks(Number(e.target.value))}
                className="w-full accent-[#9A742B]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sys-gain" className="font-medium text-[#0D1B2A]">
                  Adaptive Capacity Gain
                </label>
                <span className="font-mono tabular-nums text-[#525866]">
                  {adjustmentGain.toFixed(2)} ({Math.round(adjustmentGain * 100)}% per {unitName} gap)
                </span>
              </div>
              <input
                id="sys-gain"
                type="range"
                min={0}
                max={0.9}
                step={0.05}
                value={adjustmentGain}
                onChange={(e) => setAdjustmentGain(Number(e.target.value))}
                className="w-full accent-[#244C3C]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sys-horizon" className="font-medium text-[#0D1B2A]">
                  Simulation Horizon
                </label>
                <span className="font-mono tabular-nums text-[#525866]">{horizonWeeks} weeks</span>
              </div>
              <input
                id="sys-horizon"
                type="range"
                min={8}
                max={40}
                step={4}
                value={horizonWeeks}
                onChange={(e) => setHorizonWeeks(Number(e.target.value))}
                className="w-full accent-[#0D1B2A]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2DACB] space-y-2.5">
            <div>
              <label htmlFor="sys-inc" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Model Boundary — Included
              </label>
              <textarea
                id="sys-inc"
                rows={2}
                value={includedBoundary}
                onChange={(e) => setIncludedBoundary(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs"
              />
            </div>
            <div>
              <label htmlFor="sys-exc" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Model Boundary — Explicitly Excluded
              </label>
              <textarea
                id="sys-exc"
                rows={2}
                value={excludedBoundary}
                onChange={(e) => setExcludedBoundary(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F3EEE3] border border-[#E2DACB] rounded-md p-3.5">
              <p className="text-xs text-[#525866]">Peak Backlog</p>
              <p className="font-mono text-xl font-medium text-[#0D1B2A] tabular-nums mt-1">
                {sim.peakBacklog}
              </p>
              <p className="text-[11px] text-[#525866]">{unitName}</p>
            </div>
            <div className="bg-[#F3EEE3] border border-[#E2DACB] rounded-md p-3.5">
              <p className="text-xs text-[#525866]">Final (Wk {horizonWeeks})</p>
              <p className="font-mono text-xl font-medium text-[#0D1B2A] tabular-nums mt-1">
                {sim.finalBacklog}
              </p>
              <p className="text-[11px] text-[#525866]">{unitName}</p>
            </div>
            <div className="bg-[#F3EEE3] border border-[#E2DACB] rounded-md p-3.5">
              <p className="text-xs text-[#525866]">Peak Implied Wait</p>
              <p className="font-mono text-xl font-medium text-[#0D1B2A] tabular-nums mt-1">
                {sim.maxImpliedWaitWeeks !== null ? `${sim.maxImpliedWaitWeeks}` : '∞'}
              </p>
              <p className="text-[11px] text-[#525866]">weeks</p>
            </div>
            <div className="bg-[#F3EEE3] border border-[#E2DACB] rounded-md p-3.5">
              <p className="text-xs text-[#525866]">Oscillations</p>
              <p className="font-mono text-xl font-medium text-[#9A742B] tabular-nums mt-1">
                {sim.oscillationCount}
              </p>
              <p className="text-[11px] text-[#525866]">flow reversals</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2DACB] rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#0D1B2A]">
                  {stockName} Trajectory ({unitName} &amp; {unitName}/week)
                </h3>
                <p className="text-xs text-[#525866]">
                  Midnight blue: Backlog Stock ({unitName}) · Forest green: Effective Capacity (
                  {unitName}/wk) · Dashed gold: Target Buffer ({targetBacklog} {unitName})
                </p>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`Backlog trajectory chart over ${horizonWeeks} weeks`}
              className="w-full h-auto"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = padTop + innerH * (1 - frac);
                const labelVal = Math.round(maxY * frac);
                return (
                  <g key={frac}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="#EFE9DC"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-[#525866] text-[10px] font-mono"
                    >
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Target buffer line */}
              <line
                x1={padLeft}
                y1={yForVal(targetBacklog)}
                x2={width - padRight}
                y2={yForVal(targetBacklog)}
                stroke="#9A742B"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />

              {/* Capacity line */}
              <path d={capacityPath} fill="none" stroke="#244C3C" strokeWidth="2" />

              {/* Backlog stock line */}
              <path d={backlogPath} fill="none" stroke="#0D1B2A" strokeWidth="2.5" />

              {/* X axis labels */}
              {[0, Math.floor(horizonWeeks / 2), horizonWeeks].map((wk) => (
                <text
                  key={wk}
                  x={xForWeek(wk)}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-[#525866] text-[10px] font-mono"
                >
                  Wk {wk}
                </text>
              ))}
            </svg>
          </div>

          <div className="bg-white border border-[#E2DACB] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[#F3EEE3] border-b border-[#E2DACB] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0D1B2A]">
                Weekly Stock-Flow Table (Units: {unitName} &amp; {unitName}/week)
              </span>
              <span className="text-[11px] text-[#525866]">Showing every 2 weeks</span>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAF7F0] text-[#525866] sticky top-0 border-b border-[#E2DACB]">
                  <tr>
                    <th className="py-2 px-3 font-medium">Week</th>
                    <th className="py-2 px-3 font-medium text-right">Arrivals</th>
                    <th className="py-2 px-3 font-medium text-right">Eff. Cap.</th>
                    <th className="py-2 px-3 font-medium text-right">Completions</th>
                    <th className="py-2 px-3 font-medium text-right">Backlog</th>
                    <th className="py-2 px-3 font-medium text-right">Wait (wks)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC] font-mono tabular-nums">
                  {sim.points
                    .filter((p) => p.week % 2 === 0 || p.week === horizonWeeks)
                    .map((p) => (
                      <tr key={p.week} className="hover:bg-[#FAF7F0]">
                        <td className="py-2 px-3 text-[#0D1B2A]">Wk {p.week}</td>
                        <td className="py-2 px-3 text-right">{p.arrivals}</td>
                        <td className="py-2 px-3 text-right text-[#244C3C]">{p.effectiveCapacity}</td>
                        <td className="py-2 px-3 text-right">{p.completions}</td>
                        <td className="py-2 px-3 text-right font-semibold text-[#0D1B2A]">
                          {p.backlog}
                        </td>
                        <td className="py-2 px-3 text-right text-[#525866]">
                          {p.impliedWaitWeeks !== null ? p.impliedWaitWeeks.toFixed(1) : '∞'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
