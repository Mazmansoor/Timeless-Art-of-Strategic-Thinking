import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext.tsx';
import ToolShell from './ToolShell.tsx';

interface RivalExplanation {
  id: string;
  hypothesis: string;
  supportingEvidence: string;
  disconfirmingTest: string;
}

const WORKED_EXAMPLE = {
  title: 'Civic Grant Program: Late Cycle 4 Filings',
  observations:
    '13 of 22 community health clinics submitted Cycle 4 final reports 15–32 days after the deadline (up from 4 of 22 in Cycle 2). Form length increased from 7 to 18 pages.',
  objectives:
    'Ensure timely reconciliation of Cycle 4 outcomes before Cycle 5 disbursements without penalizing small clinics serving high-need districts.',
  boundaries:
    'Included: Clinic reporting workflow, foundation template length, municipal health extract schedule. Excluded: Internal clinic clinical staffing.',
  stakeholders:
    'Foundation Grants Team (authority over cutoffs), 22 Community Clinics (reporting burden), Municipal Health Data Office (upstream extract timing).',
  rivals: [
    {
      id: 'r1',
      hypothesis: 'Clinics ignore deadlines because there is no financial late penalty.',
      supportingEvidence: 'No late-fee clause existed in Cycle 4 grant agreements.',
      disconfirmingTest:
        'If true, lateness would appear equally across clinics regardless of whether they wait on municipal patient extracts.',
    },
    {
      id: 'r2',
      hypothesis: 'Municipal patient-data extracts arrive four weeks after the foundation cutoff.',
      supportingEvidence: '11 of the 13 late clinics depend on the identical municipal extract.',
      disconfirmingTest:
        'Check timestamps of municipal extract release; if extracts arrive prior to cutoff, this explanation fails.',
    },
  ],
  provisionalStatement:
    'Foundation reporting deadlines precede municipal health-extract availability by four weeks while form length doubled, causing 13 dependent clinics to file late and stalling Cycle 5 grants.',
};

export default function ProblemFramingTool() {
  const { activeDraftSnapshot, setActiveDraftSnapshot } = usePlatform();

  const [title, setTitle] = useState('');
  const [observations, setObservations] = useState('');
  const [objectives, setObjectives] = useState('');
  const [boundaries, setBoundaries] = useState('');
  const [stakeholders, setStakeholders] = useState('');
  const [rivals, setRivals] = useState<RivalExplanation[]>([
    { id: '1', hypothesis: '', supportingEvidence: '', disconfirmingTest: '' },
    { id: '2', hypothesis: '', supportingEvidence: '', disconfirmingTest: '' },
  ]);
  const [provisionalStatement, setProvisionalStatement] = useState('');

  useEffect(() => {
    if (activeDraftSnapshot) {
      if (activeDraftSnapshot.title) setTitle(activeDraftSnapshot.title);
      if (activeDraftSnapshot.observations) setObservations(activeDraftSnapshot.observations);
      if (activeDraftSnapshot.stakes) setObjectives(activeDraftSnapshot.stakes);
      if (activeDraftSnapshot.assumptions) setBoundaries(activeDraftSnapshot.assumptions);
      if (activeDraftSnapshot.affectedParties) setStakeholders(activeDraftSnapshot.affectedParties);
      if (activeDraftSnapshot.context && !provisionalStatement) {
        setProvisionalStatement(activeDraftSnapshot.context);
      }
      setActiveDraftSnapshot(null);
    }
  }, [activeDraftSnapshot, provisionalStatement, setActiveDraftSnapshot]);

  const loadWorkedExample = () => {
    setTitle(WORKED_EXAMPLE.title);
    setObservations(WORKED_EXAMPLE.observations);
    setObjectives(WORKED_EXAMPLE.objectives);
    setBoundaries(WORKED_EXAMPLE.boundaries);
    setStakeholders(WORKED_EXAMPLE.stakeholders);
    setRivals(WORKED_EXAMPLE.rivals);
    setProvisionalStatement(WORKED_EXAMPLE.provisionalStatement);
  };

  const addRival = () => {
    setRivals((prev) => [
      ...prev,
      { id: crypto.randomUUID(), hypothesis: '', supportingEvidence: '', disconfirmingTest: '' },
    ]);
  };

  const updateRival = (id: string, field: keyof RivalExplanation, val: string) => {
    setRivals((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const removeRival = (id: string) => {
    if (rivals.length <= 1) return;
    setRivals((prev) => prev.filter((r) => r.id !== id));
  };

  // Heuristic check for solution-disguised framing
  const lowerStmt = provisionalStatement.toLowerCase();
  const disguisedSolutionSignal =
    /\b(we need to buy|we need a new|must hire|implement software|launch a campaign)\b/.test(lowerStmt);

  const rivalsFormatted = rivals
    .filter((r) => r.hypothesis.trim())
    .map(
      (r, i) =>
        `${i + 1}. Hypothesis: ${r.hypothesis}\n   Evidence: ${r.supportingEvidence || 'None attached'}\n   Disconfirming Test: ${r.disconfirmingTest || 'Not specified'}`,
    )
    .join('\n\n');

  const exportMarkdown = () =>
    [
      `# Problem-Framing Brief: ${title || 'Untitled Challenge'}`,
      '',
      `## Verified Observations\n${observations || '_Pending_'}`,
      '',
      `## Objectives & Success Criteria\n${objectives || '_Pending_'}`,
      '',
      `## System Boundaries\n${boundaries || '_Pending_'}`,
      '',
      `## Key Stakeholders\n${stakeholders || '_Pending_'}`,
      '',
      `## Rival Explanations & Disconfirming Tests\n${rivalsFormatted || '_None entered_'}`,
      '',
      `## Provisional Problem Statement\n${provisionalStatement || '_Pending_'}`,
    ].join('\n');

  return (
    <ToolShell
      toolId="problem-framing"
      title="Problem-Framing Workbench"
      subtitle="Separate verifiable observations from inferred causes, state system boundaries, compare rival explanations with evidence, and identify what would disconfirm your favored view."
      linkedModuleNumber={1}
      linkedModuleSlug="problem-definition-and-framing"
      linkedModuleLabel="Module 01 · Problem Definition and Framing"
      assumptionsNote="Rigorous framing assumes that delaying solution selection briefly to verify mechanisms reduces costly downstream rework."
      reviewCriteria={[
        'Observations are dated and checkable without embedding blame or preferred tools.',
        'System boundaries state explicitly what is inside and outside current scope.',
        'At least two genuinely plausible rival explanations are compared against evidence.',
        'Each explanation names a concrete observation that would prove it false.',
      ]}
      limitations={[
        'Reframing cannot resolve genuine normative disagreements where stakeholders share facts yet hold incompatible values.',
        'During acute emergencies with immediate physical or financial harm, stabilize first and run a rapid framing review in parallel.',
      ]}
      onLoadWorkedExample={loadWorkedExample}
      buildPortfolioPatch={() => ({
        title: title || 'Framed Strategic Challenge',
        context: provisionalStatement || observations,
        observations,
        affectedParties: stakeholders,
        assumptions: boundaries,
        rivalExplanations: rivalsFormatted,
        stakes: objectives,
      })}
      buildExportMarkdown={exportMarkdown}
      exportFilename="problem-framing-brief.md"
      aiDraftSummary={`Title: ${title}\nObservations: ${observations}\nRivals: ${rivalsFormatted}\nProvisional Statement: ${provisionalStatement}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5 bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-6">
          <div>
            <label htmlFor="pf-title" className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
              Decision or Challenge Title
            </label>
            <input
              id="pf-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Regional Clinic Reporting Delays"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm text-[#1B1E23]"
            />
          </div>

          <div>
            <label htmlFor="pf-obs" className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
              Verified Observations (Facts separate from interpretations)
            </label>
            <textarea
              id="pf-obs"
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="What specific dated numbers, behaviors, or events can any observer verify?"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm text-[#1B1E23]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-obj" className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                Objectives &amp; Constraints
              </label>
              <textarea
                id="pf-obj"
                rows={3}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="What must improve, and what cannot be sacrificed?"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm text-[#1B1E23]"
              />
            </div>
            <div>
              <label htmlFor="pf-bound" className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                System Boundaries (Included vs. Excluded)
              </label>
              <textarea
                id="pf-bound"
                rows={3}
                value={boundaries}
                onChange={(e) => setBoundaries(e.target.value)}
                placeholder="What upstream/downstream processes are inside vs. outside scope?"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm text-[#1B1E23]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pf-stake" className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
              Stakeholders &amp; Affected Groups
            </label>
            <textarea
              id="pf-stake"
              rows={2}
              value={stakeholders}
              onChange={(e) => setStakeholders(e.target.value)}
              placeholder="Who decides, who executes, and who absorbs downstream consequences?"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm text-[#1B1E23]"
            />
          </div>

          <div>
            <label htmlFor="pf-stmt" className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
              Provisional Problem Statement (No Disguised Solutions)
            </label>
            <textarea
              id="pf-stmt"
              rows={3}
              value={provisionalStatement}
              onChange={(e) => setProvisionalStatement(e.target.value)}
              placeholder="State the structural gap, who is affected, and the unresolved causal mechanism."
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm text-[#1B1E23]"
            />
            {disguisedSolutionSignal && (
              <p className="mt-2 text-xs text-[#9A742B] bg-[#F7F1E1] border border-[#9A742B]/30 px-3 py-2 rounded">
                Check your phrasing: phrases like &ldquo;we need to buy&rdquo; or &ldquo;must hire&rdquo;
                often smuggle a preferred remedy into the problem definition.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-medium text-[#0D1B2A]">
              Rival Explanations &amp; Disconfirming Tests
            </h3>
            <button
              type="button"
              onClick={addRival}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0D1B2A] px-2.5 py-1.5 rounded border border-[#D8CFBE] hover:bg-[#F3EEE3]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rival
            </button>
          </div>

          {rivals.map((rival, idx) => (
            <div
              key={rival.id}
              className="bg-[#F3EEE3] border border-[#E2DACB] rounded-lg p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-[#525866]">
                  Explanation {String.fromCharCode(65 + idx)}
                </span>
                {rivals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRival(rival.id)}
                    aria-label={`Remove Explanation ${idx + 1}`}
                    className="text-[#525866] hover:text-[#7F1D1D]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D1B2A] mb-1">
                  Plausible Causal Explanation
                </label>
                <input
                  type="text"
                  value={rival.hypothesis}
                  onChange={(e) => updateRival(rival.id, 'hypothesis', e.target.value)}
                  placeholder="What mechanism could explain the observations?"
                  className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0D1B2A] mb-1">
                  Attached Evidence
                </label>
                <input
                  type="text"
                  value={rival.supportingEvidence}
                  onChange={(e) => updateRival(rival.id, 'supportingEvidence', e.target.value)}
                  placeholder="Specific records, counts, or dates supporting this view"
                  className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#244C3C] mb-1">
                  What Could Disconfirm This Explanation?
                </label>
                <input
                  type="text"
                  value={rival.disconfirmingTest}
                  onChange={(e) => updateRival(rival.id, 'disconfirmingTest', e.target.value)}
                  placeholder="If this explanation is false, what observable fact would show it?"
                  className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
