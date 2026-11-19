import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ToolShell from './ToolShell.tsx';

interface StakeholderEntry {
  id: string;
  group: string;
  interests: string;
  formalAuthority: 'High' | 'Moderate' | 'Low';
  informalInfluence: 'High' | 'Moderate' | 'Low';
  legitimacyAndExposure: string;
  anticipatedResponse: string;
}

const EXAMPLE_STAKEHOLDERS: StakeholderEntry[] = [
  {
    id: 'st1',
    group: 'Municipal Transit Authority Board',
    interests: 'On-time metrics, capital discipline, avoiding public service backlash.',
    formalAuthority: 'High',
    informalInfluence: 'High',
    legitimacyAndExposure: 'Fiduciary accountability to taxpayers and statutory safety mandate.',
    anticipatedResponse: 'Will block procurement lacking proven winter-range contingency.',
  },
  {
    id: 'st2',
    group: 'Night-Shift Hospital & Logistics Commuters',
    interests: 'Reliable 23:00–05:00 route continuity without sudden cancellations.',
    formalAuthority: 'Low',
    informalInfluence: 'Low',
    legitimacyAndExposure: 'Highest direct harm exposure if depot outages disrupt night schedules; often unrepresented in boardrooms.',
    anticipatedResponse: 'Silent absorption of harm initially, followed by civic complaints or job attrition.',
  },
  {
    id: 'st3',
    group: 'Maintenance Union & Depot Electricians',
    interests: 'Safe high-voltage training, predictable overtime, clarity on staffing.',
    formalAuthority: 'Moderate',
    informalInfluence: 'High',
    legitimacyAndExposure: 'Direct occupational safety stake and operational execution bottleneck.',
    anticipatedResponse: 'Will slow rollout unless safety certification and staffing ratios are settled early.',
  },
];

export default function StakeholderMapTool() {
  const [title, setTitle] = useState('Municipal Fleet Transition — Stakeholder & Incentive Map');
  const [entries, setEntries] = useState<StakeholderEntry[]>(EXAMPLE_STAKEHOLDERS);

  const loadWorkedExample = () => {
    setTitle('Municipal Fleet Transition — Stakeholder & Incentive Map');
    setEntries(EXAMPLE_STAKEHOLDERS);
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        group: '',
        interests: '',
        formalAuthority: 'Low',
        informalInfluence: 'Moderate',
        legitimacyAndExposure: '',
        anticipatedResponse: '',
      },
    ]);
  };

  const updateEntry = (id: string, field: keyof StakeholderEntry, val: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const exportMarkdown = () =>
    [
      `# Stakeholder & Incentive Map: ${title}`,
      '',
      ...entries.map(
        (e) =>
          `## ${e.group || 'Unnamed Group'}\n- **Formal Authority:** ${e.formalAuthority} | **Informal Influence:** ${e.informalInfluence}\n- **Interests & Incentives:** ${e.interests}\n- **Legitimacy & Harm Exposure:** ${e.legitimacyAndExposure}\n- **Anticipated Response:** ${e.anticipatedResponse}`,
      ),
    ].join('\n\n');

  return (
    <ToolShell
      toolId="stakeholder-map"
      title="Stakeholder & Incentive Map"
      subtitle="Map formal authority, informal influence, concrete incentives, and moral legitimacy—ensuring low-power affected groups are never erased from ethical consideration."
      linkedModuleNumber={8}
      linkedModuleLabel="Module 08 · Stakeholder, Institutional, and Power Analysis (Preview Tool)"
      assumptionsNote="Power rankings tell you who can block an action; legitimacy and harm exposure tell you to whom the institution owes care and accountability."
      reviewCriteria={[
        'Have you listed at least one affected group with high exposure yet low formal authority?',
        'Are stated interests grounded in concrete incentives rather than caricature?',
        'Have you separated formal veto power from informal operational influence?',
      ]}
      limitations={[
        'Stakeholder coalitions shift once draft decisions become public; revisit after initial consultation.',
        'Do not reduce ethical responsibility to appeasing the highest-authority actors.',
      ]}
      onLoadWorkedExample={loadWorkedExample}
      buildPortfolioPatch={() => ({
        title,
        affectedParties: entries
          .map((e) => `${e.group} [Auth: ${e.formalAuthority}] — ${e.legitimacyAndExposure}`)
          .join('\n'),
      })}
      buildExportMarkdown={exportMarkdown}
      exportFilename="stakeholder-incentive-map.md"
      aiDraftSummary={`Stakeholders for ${title}: ${entries.map((e) => `${e.group} (Auth:${e.formalAuthority}, Inf:${e.informalInfluence}, Legitimacy:${e.legitimacyAndExposure})`).join(' | ')}`}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5">
          <div className="flex-1">
            <label htmlFor="sm-title" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Initiative or Policy Scope
            </label>
            <input
              id="sm-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md border border-[#0D1B2A] text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stakeholder Group
          </button>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-[#E2DACB] rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4"
            >
              <div className="md:col-span-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-medium text-[#0D1B2A]">Group / Actor</label>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      aria-label="Remove stakeholder"
                      className="text-[#525866] hover:text-[#7F1D1D]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={entry.group}
                  onChange={(e) => updateEntry(entry.id, 'group', e.target.value)}
                  placeholder="Who is affected or holds leverage?"
                  className="w-full px-3 py-2 rounded border border-[#D8CFBE] text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#525866] mb-1">Formal Authority</label>
                    <select
                      value={entry.formalAuthority}
                      onChange={(e) => updateEntry(entry.id, 'formalAuthority', e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-[#D8CFBE] text-xs bg-[#FAF7F0]"
                    >
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#525866] mb-1">Informal Influence</label>
                    <select
                      value={entry.informalInfluence}
                      onChange={(e) => updateEntry(entry.id, 'informalInfluence', e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-[#D8CFBE] text-xs bg-[#FAF7F0]"
                    >
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#0D1B2A] mb-1">
                    Interests &amp; Incentives
                  </label>
                  <textarea
                    rows={2}
                    value={entry.interests}
                    onChange={(e) => updateEntry(entry.id, 'interests', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#D8CFBE] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#244C3C] mb-1">
                    Legitimacy &amp; Harm Exposure (Separate from Power)
                  </label>
                  <textarea
                    rows={2}
                    value={entry.legitimacyAndExposure}
                    onChange={(e) =>
                      updateEntry(entry.id, 'legitimacyAndExposure', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded border border-[#D8CFBE] text-xs bg-[#EBF2EE]/40"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-[#0D1B2A] mb-1">
                  Anticipated Institutional Response
                </label>
                <textarea
                  rows={5}
                  value={entry.anticipatedResponse}
                  onChange={(e) => updateEntry(entry.id, 'anticipatedResponse', e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#D8CFBE] text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
