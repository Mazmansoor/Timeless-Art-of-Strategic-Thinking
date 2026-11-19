import React, { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { auditStrategyCoherence, type CoherenceActionInput } from '../../lib/strategyMath.ts';
import ToolShell from './ToolShell.tsx';

export default function StrategyCoherenceTool() {
  const [title, setTitle] = useState('Policy Institute Publication Turnaround');
  const [diagnosis, setDiagnosis] = useState(
    'Legislative citations fell 50% not because research volume dropped, but because an 11-week multi-committee review lag causes briefs to publish after relevant hearings close.',
  );
  const [guidingPolicy, setGuidingPolicy] = useState(
    'Trade publication volume for legislative window timeliness: cut annual reports in half and guarantee a 3-week single-panel review for high-window inquiries.',
  );
  const [whatWillStop, setWhatWillStop] = useState(
    'Stop publishing 14 low-urgency retrospective monographs per year and end sequential 4-committee sign-offs.',
  );
  const [revisionTrigger, setRevisionTrigger] = useState(
    'If average review lag exceeds 4 weeks for two consecutive quarters or citation share in active hearings does not rise after 9 months, re-evaluate panel structure.',
  );
  const [actions, setActions] = useState<CoherenceActionInput[]>([
    {
      id: 'act1',
      action: 'Institute single 3-person rapid editorial review panel with 10-day SLA',
      addressesDiagnosis: true,
      owner: 'Managing Editor',
      resourcesAllocated: 'Reallocate 6 senior fellow hours/week from long monographs',
    },
    {
      id: 'act2',
      action: 'Hire external PR agency to boost social media impressions',
      addressesDiagnosis: false,
      owner: 'Communications Lead',
      resourcesAllocated: '$85k annual retainer',
    },
  ]);

  const audit = useMemo(
    () =>
      auditStrategyCoherence({
        diagnosis,
        guidingPolicy,
        whatWillStop,
        revisionTrigger,
        actions,
      }),
    [diagnosis, guidingPolicy, whatWillStop, revisionTrigger, actions],
  );

  const loadWorkedExample = () => {
    setTitle('Policy Institute Publication Turnaround');
  };

  const addAction = () => {
    setActions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        action: '',
        addressesDiagnosis: true,
        owner: '',
        resourcesAllocated: '',
      },
    ]);
  };

  const updateAction = (id: string, field: keyof CoherenceActionInput, val: string | boolean) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };

  const removeAction = (id: string) => {
    if (actions.length <= 1) return;
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const exportMarkdown = () =>
    [
      `# Strategy Coherence Review: ${title}`,
      '',
      `## Diagnosis\n${diagnosis}`,
      `## Guiding Policy\n${guidingPolicy}`,
      `## Explicit Trade-Off (What Will Stop)\n${whatWillStop}`,
      `## Revision Trigger\n${revisionTrigger}`,
      '',
      '## Action Alignment Audit',
      ...actions.map(
        (a) =>
          `- [${a.addressesDiagnosis ? 'ALIGNED' : 'ORPHANED'}] ${a.action} (Owner: ${a.owner || 'Unassigned'} · Resources: ${a.resourcesAllocated || 'Unspecified'})`,
      ),
      '',
      `Audit Result: ${audit.scoreSummary}`,
    ].join('\n\n');

  return (
    <ToolShell
      toolId="strategy-coherence"
      title="Strategy Coherence Review"
      subtitle="Connect diagnosis, guiding policy, and coherent actions—exposing orphaned initiatives, missing resource reallocations, and unstated stop-doing commitments."
      linkedModuleNumber={4}
      linkedModuleSlug="strategic-diagnosis"
      linkedModuleLabel="Module 04 · Strategic Diagnosis"
      assumptionsNote="Inspired by Richard Rumelt’s Strategy Kernel: actions that do not directly relieve the diagnosed crux waste scarce institutional attention."
      reviewCriteria={[
        'Does your diagnosis explain why the obstacle persists rather than listing ambitions?',
        'Are any current initiatives marked as disconnected from the diagnosed bottleneck?',
        'Have you named explicitly what existing activity will stop to free resources?',
      ]}
      limitations={[
        'Coherence checks test internal logical alignment; they cannot guarantee your initial diagnosis itself was empirically true.',
      ]}
      onLoadWorkedExample={loadWorkedExample}
      buildPortfolioPatch={() => ({
        title,
        systemMechanisms: diagnosis,
        recommendation: `${guidingPolicy}\n\nStopping: ${whatWillStop}`,
        implementationResponsibilities: actions
          .filter((a) => a.addressesDiagnosis)
          .map((a) => `${a.action} (Owner: ${a.owner || 'TBD'}, Resources: ${a.resourcesAllocated || 'TBD'})`)
          .join('\n'),
        revisionTriggers: revisionTrigger,
      })}
      buildExportMarkdown={exportMarkdown}
      exportFilename="strategy-coherence-review.md"
      aiDraftSummary={`Diagnosis: ${diagnosis}. Policy: ${guidingPolicy}. Stop: ${whatWillStop}. Audit: ${audit.scoreSummary}`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-6">
          <div className="lg:col-span-2">
            <label htmlFor="coh-title" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Strategy or Initiative Title
            </label>
            <input
              id="coh-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="coh-diag" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              1. Strategic Diagnosis (The Governing Crux)
            </label>
            <textarea
              id="coh-diag"
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="coh-pol" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              2. Guiding Policy (Approach + Deliberate Trade-Off)
            </label>
            <textarea
              id="coh-pol"
              rows={3}
              value={guidingPolicy}
              onChange={(e) => setGuidingPolicy(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="coh-stop" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              3. What Will Stop? (Resource Reallocation)
            </label>
            <textarea
              id="coh-stop"
              rows={2}
              value={whatWillStop}
              onChange={(e) => setWhatWillStop(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="coh-trig" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              4. Falsifiable Revision Trigger
            </label>
            <textarea
              id="coh-trig"
              rows={2}
              value={revisionTrigger}
              onChange={(e) => setRevisionTrigger(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-[#0D1B2A]">
              Action Alignment Check
            </h3>
            <button
              type="button"
              onClick={addAction}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-[#D8CFBE] hover:bg-[#F3EEE3]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Action
            </button>
          </div>

          <div className="space-y-3">
            {actions.map((act) => (
              <div
                key={act.id}
                className={`p-4 rounded-md border grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
                  act.addressesDiagnosis
                    ? 'bg-[#FAF7F0] border-[#E2DACB]'
                    : 'bg-[#F7F1E1] border-[#9A742B]/50'
                }`}
              >
                <div className="md:col-span-5">
                  <label className="block text-[11px] text-[#525866] mb-1">Initiative / Action</label>
                  <input
                    type="text"
                    value={act.action}
                    onChange={(e) => updateAction(act.id, 'action', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[#D8CFBE] bg-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#525866] mb-1">Owner</label>
                  <input
                    type="text"
                    value={act.owner}
                    onChange={(e) => updateAction(act.id, 'owner', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] text-[#525866] mb-1">Resources</label>
                  <input
                    type="text"
                    value={act.resourcesAllocated}
                    onChange={(e) => updateAction(act.id, 'resourcesAllocated', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[#D8CFBE] bg-white text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#0D1B2A] cursor-pointer pt-4 md:pt-0">
                    <input
                      type="checkbox"
                      checked={act.addressesDiagnosis}
                      onChange={(e) =>
                        updateAction(act.id, 'addressesDiagnosis', e.target.checked)
                      }
                    />
                    Addresses Diagnosis
                  </label>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  {actions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAction(act.id)}
                      aria-label="Remove action"
                      className="text-[#525866] hover:text-[#7F1D1D]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            className={`p-4 rounded-md border text-sm ${
              audit.orphanedActions.length === 0 && !audit.missingStopRule && !audit.missingRevisionTrigger
                ? 'bg-[#EBF2EE] border-[#244C3C]/30 text-[#173328]'
                : 'bg-[#F7F1E1] border-[#9A742B]/40 text-[#3F2E0D]'
            }`}
          >
            <p className="font-semibold">Structural Audit:</p>
            <p className="mt-1">{audit.scoreSummary}</p>
            {audit.orphanedActions.length > 0 && (
              <p className="mt-1.5 text-xs">
                Orphaned initiative(s) flagged for review or suspension:{' '}
                <strong>{audit.orphanedActions.join('; ')}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
