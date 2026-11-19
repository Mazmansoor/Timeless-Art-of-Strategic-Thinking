import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProblemFramingTool from '../components/tools/ProblemFramingTool.tsx';
import SystemsExplorerTool from '../components/tools/SystemsExplorerTool.tsx';
import DecisionComparisonTool from '../components/tools/DecisionComparisonTool.tsx';
import ScenarioStressTestTool from '../components/tools/ScenarioStressTestTool.tsx';
import StakeholderMapTool from '../components/tools/StakeholderMapTool.tsx';
import StrategyCoherenceTool from '../components/tools/StrategyCoherenceTool.tsx';
import { usePageSeo } from '../lib/seo.ts';
import type { ToolId } from '../types.ts';

const TOOLS: Array<{ id: ToolId; label: string; badge: string }> = [
  { id: 'problem-framing', label: 'Problem-Framing Workbench', badge: 'Mod 01–02' },
  { id: 'systems-explorer', label: 'Systems Explorer', badge: 'Mod 03' },
  { id: 'strategy-coherence', label: 'Strategy Coherence Review', badge: 'Mod 04 & 13' },
  { id: 'decision-comparison', label: 'Decision Comparison', badge: 'Mod 09' },
  { id: 'scenario-stress-test', label: 'Scenario Stress Test', badge: 'Mod 10' },
  { id: 'stakeholder-map', label: 'Stakeholder & Incentive Map', badge: 'Mod 08' },
];

export default function StrategyLabPage() {
  usePageSeo({
    title: 'Strategy Lab — Interactive Decision Tools',
    description:
      'Apply Problem-Framing, Systems Explorer stock-flow simulations, Decision Comparison sensitivity matrices, Scenario Stress Tests, Stakeholder Maps, and Strategy Coherence Reviews.',
    canonicalPath: '/strategy-lab',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTool = searchParams.get('tool') as ToolId | null;
  const activeTool: ToolId = TOOLS.some((t) => t.id === rawTool)
    ? (rawTool as ToolId)
    : 'problem-framing';

  const selectTool = (id: ToolId) => {
    setSearchParams({ tool: id });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 space-y-8">
      <header className="space-y-2 max-w-3xl">
        <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
          Strategy Lab · Applied Decision Instruments
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">
          Structured Tools for Consequential Choices
        </h1>
        <p className="text-sm text-[#525866] leading-relaxed">
          Every tool includes a preloaded worked example, explicit assumptions and limitations, and
          saves directly into your Decision Portfolio or exports as a clean Markdown memorandum.
        </p>
      </header>

      <nav
        aria-label="Strategy Lab tools"
        className="flex flex-wrap gap-2 p-1.5 bg-[#F3EEE3] border border-[#E2DACB] rounded-lg"
      >
        {TOOLS.map((t) => {
          const active = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTool(t.id)}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                active
                  ? 'bg-[#0D1B2A] text-[#FAF7F0] shadow-sm'
                  : 'text-[#3C424D] hover:bg-white hover:text-[#0D1B2A]'
              }`}
            >
              <span>{t.label}</span>
              <span className={active ? 'text-[#C29D4E]' : 'text-[#6B7280]'}>{t.badge}</span>
            </button>
          );
        })}
      </nav>

      <section aria-live="polite">
        {activeTool === 'problem-framing' && <ProblemFramingTool />}
        {activeTool === 'systems-explorer' && <SystemsExplorerTool />}
        {activeTool === 'decision-comparison' && <DecisionComparisonTool />}
        {activeTool === 'scenario-stress-test' && <ScenarioStressTestTool />}
        {activeTool === 'stakeholder-map' && <StakeholderMapTool />}
        {activeTool === 'strategy-coherence' && <StrategyCoherenceTool />}
      </section>
    </div>
  );
}
