import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CheckCircle2, Download, FileEdit, Save, Sparkles, X } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext.tsx';
import { createEmptySnapshot, downloadTextFile } from '../../lib/portfolioUtils.ts';
import type { DecisionSnapshot, ToolId } from '../../types.ts';

interface ToolShellProps {
  toolId: ToolId;
  title: string;
  subtitle: string;
  linkedModuleNumber: number;
  linkedModuleSlug?: string;
  linkedModuleLabel: string;
  assumptionsNote: string;
  limitations: string[];
  reviewCriteria: string[];
  onLoadWorkedExample: () => void;
  buildPortfolioPatch: () => Partial<DecisionSnapshot>;
  buildExportMarkdown: () => string;
  exportFilename: string;
  aiDraftSummary: string;
  children: React.ReactNode;
}

export default function ToolShell({
  toolId,
  title,
  subtitle,
  linkedModuleNumber,
  linkedModuleSlug,
  linkedModuleLabel,
  assumptionsNote,
  limitations,
  reviewCriteria,
  onLoadWorkedExample,
  buildPortfolioPatch,
  buildExportMarkdown,
  exportFilename,
  aiDraftSummary,
  children,
}: ToolShellProps) {
  const navigate = useNavigate();
  const {
    saveNewDecision,
    saveDraftAnalysis,
    activeDraftMeta,
    setActiveDraftMeta,
    configStatus,
    trackEvent,
    storageMode,
  } = usePlatform();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedDestination, setSavedDestination] = useState<'decisions' | 'drafts'>('decisions');
  const [saving, setSaving] = useState(false);

  // Optional AI Thinking Partner state
  const [aiConsent, setAiConsent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    critique: string;
    citedModule: string;
    ownershipReminder: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    setSaving(true);
    setSaveMessage(null);
    const patch = buildPortfolioPatch();
    const draftTitle = patch.title?.trim() || `${title} Draft`;
    const draftSummary =
      (
        patch.context ||
        patch.recommendation ||
        patch.systemMechanisms ||
        patch.observations ||
        aiDraftSummary
      )
        ?.trim()
        .replace(/\s+/g, ' ')
        .slice(0, 260) || `In-progress ${title} analysis`;

    const res = await saveDraftAnalysis({
      id: activeDraftMeta?.toolId === toolId ? activeDraftMeta.draftId : undefined,
      toolId,
      toolLabel: title,
      title: draftTitle,
      summary: draftSummary,
      linkedModuleNumber,
      snapshotPatch: patch,
    });
    setSaving(false);
    if (res.ok && res.draft) {
      setSavedDestination('drafts');
      setSaveMessage(
        storageMode === 'server-account'
          ? 'Draft analysis saved to My Workspace on your private server account.'
          : 'Draft analysis saved to My Workspace in this browser.',
      );
    } else {
      setSaveMessage(res.error ?? 'Could not save draft analysis.');
    }
  };

  const handleSaveToPortfolio = async () => {
    setSaving(true);
    setSaveMessage(null);
    const patch = buildPortfolioPatch();
    const snapshot = createEmptySnapshot({
      title: patch.title?.trim() || `${title} Working Note`,
      linkedModuleNumber,
      status: 'Analysis completed',
      ...patch,
    });
    const res = await saveNewDecision(snapshot, `Created from ${title}`);
    setSaving(false);
    if (res.ok) {
      trackEvent('tool_applied', { toolId, moduleNumber: linkedModuleNumber });
      setSavedDestination('decisions');
      setSaveMessage(
        storageMode === 'server-account'
          ? 'Saved as a decision record in your private server workspace.'
          : 'Saved as a decision record in your browser-local workspace (sign in anytime to sync across devices).',
      );
    } else {
      setSaveMessage(res.error ?? 'Could not save to portfolio.');
    }
  };

  const handleExport = () => {
    downloadTextFile(exportFilename, buildExportMarkdown(), 'text/markdown;charset=utf-8');
  };

  const handleAskThinkingPartner = async () => {
    setAiError(null);
    setAiResponse(null);
    setAiLoading(true);
    try {
      const res = await fetch('/api/thinking-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleNumber: linkedModuleNumber,
          framingSummary: aiDraftSummary.slice(0, 2400),
          userConsentToSend: aiConsent,
        }),
      });
      const data = (await res.json()) as {
        critique?: string;
        citedModule?: string;
        ownershipReminder?: string;
        error?: string;
      };
      if (!res.ok || !data.critique) {
        setAiError(data.error ?? 'Thinking partner unavailable.');
      } else {
        setAiResponse({
          critique: data.critique,
          citedModule: data.citedModule ?? '',
          ownershipReminder: data.ownershipReminder ?? '',
        });
      }
    } catch {
      setAiError('Network error reaching the Thinking Partner endpoint.');
    } finally {
      setAiLoading(false);
    }
  };

  const showResumedBanner = Boolean(activeDraftMeta && activeDraftMeta.toolId === toolId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#E2DACB]">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#525866]">
            <span>Strategy Lab Workbench</span>
            <span aria-hidden="true">·</span>
            {linkedModuleSlug ? (
              <Link
                to={`/learn/${linkedModuleSlug}`}
                className="inline-flex items-center gap-1 text-[#244C3C] font-medium hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {linkedModuleLabel}
              </Link>
            ) : (
              <span>{linkedModuleLabel}</span>
            )}
          </div>
          <h2 className="font-serif text-3xl font-medium text-[#0D1B2A]">{title}</h2>
          <p className="text-base text-[#525866] leading-relaxed">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onLoadWorkedExample}
            className="px-3.5 py-2 text-xs font-medium rounded-md border border-[#D8CFBE] bg-[#F3EEE3] text-[#0D1B2A] hover:border-[#9A742B] whitespace-nowrap shrink-0"
          >
            Load Worked Example
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-[#D8CFBE] bg-[#FAF7F0] text-[#0D1B2A] hover:bg-[#F3EEE3] whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Brief (.md)
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-[#0D1B2A] bg-white text-[#0D1B2A] hover:bg-[#F3EEE3] disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <FileEdit className="w-3.5 h-3.5" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSaveToPortfolio}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[#0D1B2A] text-[#FAF7F0] hover:bg-[#162A40] disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Decision'}
          </button>
        </div>
      </div>

      {showResumedBanner && activeDraftMeta && (
        <div className="p-4 rounded-md bg-[#F3EEE3] border border-[#D8CFBE] flex items-start justify-between gap-4 text-sm text-[#1B1E23]">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#9A742B]">
              Resumed Draft from My Workspace · {activeDraftMeta.toolLabel}
            </p>
            <p className="font-medium text-[#0D1B2A]">{activeDraftMeta.title}</p>
            {activeDraftMeta.summary && (
              <p className="text-xs text-[#525866] leading-relaxed">{activeDraftMeta.summary}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setActiveDraftMeta(null)}
            aria-label="Dismiss resumed draft banner"
            className="p-1 text-[#525866] hover:text-[#0D1B2A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveMessage && (
        <div className="p-4 rounded-md bg-[#EBF2EE] border border-[#244C3C]/30 flex flex-wrap items-center justify-between gap-3 text-sm text-[#173328]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveMessage}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(savedDestination === 'drafts' ? '/workspace?tab=drafts' : '/workspace?tab=decisions')
            }
            className="inline-flex items-center gap-1 font-medium underline underline-offset-4 whitespace-nowrap"
          >
            View in My Workspace
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {children}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-[#E2DACB]">
        <div className="bg-[#F3EEE3] border border-[#E2DACB] rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#0D1B2A]">
              Assumptions &amp; Non-AI Review Criteria
            </h3>
            <p className="text-sm text-[#525866] mt-1">{assumptionsNote}</p>
          </div>
          <ul className="space-y-2 text-sm text-[#1B1E23]">
            {reviewCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-[#9A742B] mt-0.5 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-[#E2DACB]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#525866] mb-1.5">
              Tool Limitations &amp; Conditions of Use
            </p>
            <ul className="space-y-1.5 text-xs text-[#525866] leading-relaxed">
              {limitations.map((lim, i) => (
                <li key={i}>• {lim}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-medium text-[#0D1B2A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9A742B]" />
                Optional Socratic Thinking Partner
              </h3>
              <p className="text-xs text-[#525866] mt-1">
                Asks probing questions and surfaces rival explanations. Never issues grades, scores,
                or final decisions. Completely optional—the checklist on the left stands on its own.
              </p>
            </div>
          </div>

          {!configStatus.geminiConfigured ? (
            <p className="text-xs text-[#525866] bg-[#F3EEE3] p-3.5 rounded-md border border-[#E2DACB]">
              Server-side AI integration is not configured in this environment. Use the structured
              non-AI review criteria on the left to test your reasoning rigorously.
            </p>
          ) : (
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 text-xs text-[#1B1E23] cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="mt-0.5 rounded border-[#D8CFBE]"
                />
                <span>
                  I choose to send the current tool summary above to the server-side model for
                  critical questioning (never stored in analytics).
                </span>
              </label>

              <button
                type="button"
                onClick={handleAskThinkingPartner}
                disabled={!aiConsent || aiLoading || aiDraftSummary.trim().length < 20}
                className="px-4 py-2 text-xs font-medium rounded-md border border-[#0D1B2A] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-[#FAF7F0] disabled:opacity-50 transition-colors"
              >
                {aiLoading ? 'Generating questions...' : 'Challenge My Reasoning'}
              </button>

              {aiError && (
                <p className="text-xs text-[#7F1D1D] bg-[#FEF2F2] border border-[#FECACA] p-3 rounded-md">
                  {aiError}
                </p>
              )}

              {aiResponse && (
                <div className="p-4 rounded-md bg-[#F3EEE3] border border-[#D8CFBE] space-y-2 text-sm">
                  <p className="text-xs font-medium text-[#9A742B]">
                    AI-Generated Questions for Reflection · Grounded in {aiResponse.citedModule}
                  </p>
                  <div className="text-[#1B1E23] whitespace-pre-wrap leading-relaxed text-sm">
                    {aiResponse.critique}
                  </div>
                  <p className="text-xs text-[#525866] pt-2 border-t border-[#E2DACB]">
                    {aiResponse.ownershipReminder}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
