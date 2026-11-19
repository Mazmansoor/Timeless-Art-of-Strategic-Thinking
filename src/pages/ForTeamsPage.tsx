import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { usePageSeo } from '../lib/seo.ts';

export default function ForTeamsPage() {
  usePageSeo({
    title: 'For Teams & Institutions — Scoped Decision Workshops',
    description:
      'Organizational workshops and guided programs centered on a consequential team challenge, leaving teams with a defended decision memorandum and revision triggers.',
    canonicalPath: '/for-teams',
  });

  const [name, setName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [audienceSize, setAudienceSize] = useState('8–15 participants');
  const [timing, setTiming] = useState('Next 1–3 months');
  const [challenge, setChallenge] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    storedInDatabase?: boolean;
    forwardedExternally?: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          workEmail,
          organization,
          audienceSize,
          timing,
          challenge,
          desiredOutcome,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        storedInDatabase?: boolean;
        forwardedExternally?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? 'Unable to record inquiry.' });
      } else {
        setResult({
          ok: true,
          message: data.message ?? 'Inquiry recorded.',
          storedInDatabase: data.storedInDatabase,
          forwardedExternally: data.forwardedExternally,
        });
        setName('');
        setWorkEmail('');
        setOrganization('');
        setChallenge('');
        setDesiredOutcome('');
      }
    } catch {
      setResult({ ok: false, message: 'Network error submitting inquiry.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-16">
      {/* Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch pb-12 border-b border-[#E2DACB]">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
          <p className="text-xs font-medium tracking-widest uppercase text-[#244C3C]">
            For Teams &amp; Public Institutions
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#0D1B2A] leading-tight">
            Scoped programs built around an actual decision your team must make
          </h1>
          <p className="text-base text-[#525866] leading-relaxed max-w-2xl">
            Designed for managers, policy leads, and cross-functional teams operating where
            evidence is incomplete, resources are constrained, and stakeholder incentives pull in
            conflicting directions.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full min-h-[240px] rounded-lg overflow-hidden border border-[#D8CFBE] bg-[#0D1B2A]">
            <img
              src="/src/assets/images/teams_seminar_room_1794972589060.jpg"
              alt="Architectural seminar table prepared with printed briefing folios and notebooks"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Program Specification Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Suitable Challenges',
            items: [
              'Service backlogs, permitting delays, or capacity allocation under budget ceilings',
              'Cross-departmental initiatives stalling at handoffs or conflicting KPIs',
              'High-irreversibility investment, restructuring, or policy-design choices',
            ],
          },
          {
            title: 'Intended Participants',
            items: [
              'Department directors, program leads, and emerging institutional leaders',
              'Cross-functional policy, product, operations, and finance groups (8–24 people)',
              'Teams willing to examine disconfirming evidence rather than validate a pre-decided slide deck',
            ],
          },
          {
            title: 'Workshop & Program Approach',
            items: [
              'Pre-session diagnostic review of baseline documents and rival hypotheses',
              'Facilitated work using the Problem-Framing, Systems, and Coherence instruments',
              'Structured challenge of assumptions and stakeholder legitimacy',
            ],
          },
          {
            title: 'Concrete Work Products',
            items: [
              'A shared, falsifiable Strategic Diagnosis naming the governing bottleneck',
              'A defended Decision Memorandum with explicit stop-doing trade-offs',
              'An assigned implementation plan and scheduled 60-day revision trigger',
            ],
          },
          {
            title: 'Preparation & Delivery Options',
            items: [
              'Participants bring 1–2 real decisions and existing evidence memos ahead of Session 1',
              'Available as a focused 1-day or 2-day intensive, or a 4-session extended cohort',
              'Delivered remotely or in-person depending on team distribution',
            ],
          },
          {
            title: 'Boundaries of the Engagement',
            items: [
              'We do not deliver generic motivational talks detached from real institutional stakes',
              'Your leadership retains full ownership and accountability for final choices',
              'Private organizational drafts are never shared externally or repurposed into public cases',
            ],
          },
        ].map((block) => (
          <div
            key={block.title}
            className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-3"
          >
            <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">{block.title}</h2>
            <ul className="space-y-2 text-sm text-[#3C424D] leading-relaxed">
              {block.items.map((item, idx) => (
                <li key={idx}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Durable Organizational Inquiry Form */}
      <section className="max-w-3xl bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-7 sm:p-9 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-widest uppercase text-[#244C3C]">
            Request a Scoped Proposal
          </p>
          <h2 className="font-serif text-3xl font-medium text-[#0D1B2A]">
            Organizational Inquiry
          </h2>
          <p className="text-sm text-[#525866] leading-relaxed">
            Share only what is necessary to understand your decision context, team size, and
            timing. Submissions persist directly to our server review queue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inq-name" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Your Name *
              </label>
              <input
                id="inq-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="inq-email" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Work Email *
              </label>
              <input
                id="inq-email"
                type="email"
                required
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="inq-org" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Organization *
              </label>
              <input
                id="inq-org"
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="inq-size" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Audience Size
              </label>
              <select
                id="inq-size"
                value={audienceSize}
                onChange={(e) => setAudienceSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
              >
                <option value="4–8 leaders">4–8 leaders</option>
                <option value="8–15 participants">8–15 participants</option>
                <option value="16–30 participants">16–30 participants</option>
                <option value="30+ cohort">30+ cohort</option>
              </select>
            </div>
            <div>
              <label htmlFor="inq-timing" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Desired Timing
              </label>
              <input
                id="inq-timing"
                type="text"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="inq-challenge" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Strategic Challenge or Decision Context *
            </label>
            <textarea
              id="inq-challenge"
              rows={3}
              required
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="Briefly describe the decision or operational difficulty your team is navigating."
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="inq-outcome" className="block text-xs font-medium text-[#0D1B2A] mb-1">
              Desired Concrete Outcome
            </label>
            <textarea
              id="inq-outcome"
              rows={2}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="What would make this engagement unmistakably useful 60 days afterward?"
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40] disabled:opacity-60"
          >
            {submitting ? 'Submitting inquiry...' : 'Submit Organizational Inquiry'}
          </button>

          {result && (
            <div
              className={`p-4 rounded-md border text-sm space-y-1 ${
                result.ok
                  ? 'bg-[#EBF2EE] border-[#244C3C]/30 text-[#173328]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]'
              }`}
            >
              <p className="font-medium flex items-center gap-2">
                {result.ok && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {result.message}
              </p>
              {result.ok && (
                <p className="text-xs opacity-90">
                  Durable Database Storage: Recorded · External Relay Webhook:{' '}
                  {result.forwardedExternally
                    ? 'Forwarded'
                    : 'Not configured (reviewable in Administration)'}
                </p>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
