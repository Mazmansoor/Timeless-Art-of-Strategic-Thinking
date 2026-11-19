import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageSeo } from '../lib/seo.ts';

export function AboutPage() {
  usePageSeo({
    title: 'About Mazhar Mansoor',
    description:
      'Editorial perspective and teaching philosophy behind The Timeless Art of Strategic Thinking.',
    canonicalPath: '/about',
  });

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 space-y-8">
      <header className="space-y-3 border-b border-[#E2DACB] pb-6">
        <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
          Editorial Perspective
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">About Mazhar Mansoor</h1>
      </header>

      <div className="space-y-5 text-base text-[#1B1E23] leading-[1.78]">
        <p>
          <em>The Timeless Art of Strategic Thinking</em> grows out of a practical dissatisfaction
          with how strategy is commonly taught. Too often, public and commercial leaders are handed
          either abstract academic models divorced from institutional politics, or brisk checklists
          that flatten consequential dilemmas into slogans.
        </p>
        <p>
          Across the forthcoming book, curriculum, and Strategy Lab, Mazhar Mansoor’s aim is
          straightforward: help thoughtful practitioners slow down at the right moments—defining the
          problem cleanly before purchasing solutions, testing mental models against outside base
          rates, tracing system delays, weighing downside irreversibility, and owning the ethical
          consequences of their choices.
        </p>
        <p>
          This platform deliberately avoids inflated biographical claims, fabricated institutional
          endorsements, or proprietary jargon. Every concept is anchored to verifiable scholarly
          lineage and tested through applied decision work.
        </p>
      </div>

      <div className="pt-4 flex flex-wrap gap-4">
        <Link
          to="/learn"
          className="px-5 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium"
        >
          Explore Curriculum
        </Link>
        <Link
          to="/sources"
          className="px-5 py-2.5 rounded-md border border-[#D8CFBE] text-[#0D1B2A] text-sm font-medium"
        >
          Sources &amp; Editorial Standards
        </Link>
      </div>
    </div>
  );
}

export function SourcesPage() {
  usePageSeo({
    title: 'Sources & Editorial Standards',
    description:
      'How The Timeless Art of Strategic Thinking separates verified sources, hypothetical exercises, and unpublished curriculum modules.',
    canonicalPath: '/sources',
  });

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 space-y-8">
      <header className="space-y-3 border-b border-[#E2DACB] pb-6">
        <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
          Epistemic Governance
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">
          Sources &amp; Editorial Standards
        </h1>
      </header>

      <div className="space-y-6 text-sm text-[#1B1E23] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
            1. Separation of Approved Materials &amp; Original Introductory Teaching
          </h2>
          <p>
            Only Part I (Modules 01–04) is currently published, clearly labeled as original
            introductory teaching aligned to the canonical 24-subject sequence. Modules 05–24 and
            chapters of the monograph remain unpublished in the learner catalog until the approved
            course blueprint, book architecture, and verified case inventories are supplied.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
            2. Hypothetical Exercises vs. Documented Cases
          </h2>
          <p>
            We never invent historical quotations, participant motives, financial statistics, or
            post-hoc outcomes. Constructed teaching scenarios (such as the Civic Grant Program and
            Appeals Tribunal examples) are explicitly labeled <strong>Hypothetical Exercise</strong>.
            Documented historical cases enter the Reference Library only with verifiable archival
            citations and explicit source limitations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
            3. Deterministic Math &amp; Bounded AI Assistance
          </h2>
          <p>
            All stock-flow simulations, expected values, and sensitivity crossover calculations run
            deterministically outside any language model. When an optional AI Thinking Partner is
            configured and explicitly consented to by a learner, it may only ask probing questions
            and propose rival explanations—never grade decisions, fabricate references, or override
            human judgment.
          </p>
        </section>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  usePageSeo({
    title: 'Privacy, Terms & Support',
    description:
      'Transparent explanation of browser-local vs. server-isolated storage, consent-based email controls, and account export or deletion.',
    canonicalPath: '/privacy',
  });

  const [unsubEmail, setUnsubEmail] = useState('');
  const [unsubStatus, setUnsubStatus] = useState<string | null>(null);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: unsubEmail }),
    });
    const data = (await res.json()) as { unsubscribed?: boolean };
    setUnsubStatus(
      data.unsubscribed
        ? 'Your email has been unsubscribed from all optional updates and reminders.'
        : 'No active subscription record matched that email.',
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 space-y-10">
      <header className="space-y-3 border-b border-[#E2DACB] pb-6">
        <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
          Trust, Storage &amp; Consent
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">
          Privacy, Terms &amp; Support
        </h1>
      </header>

      <div className="space-y-6 text-sm text-[#1B1E23] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
            How Your Decision Portfolio Is Stored
          </h2>
          <p>
            If you explore without registering, Strategy Lab drafts and Decision Portfolio records
            remain strictly in your own browser’s local storage. If you create a private account in
            My Workspace, records are stored in the server database isolated to your authenticated
            user ID via HTTP-only signed session cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
            Analytics &amp; AI Privacy Separation
          </h2>
          <p>
            Private decision prose, assumptions, and reflections are never sent to platform
            analytics. Analytics track only aggregate structural counts (such as module starts or
            tool saves). Similarly, the optional Thinking Partner never receives your portfolio text
            unless you explicitly check consent and trigger a critique.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
            Export, Deletion &amp; Refunds
          </h2>
          <p>
            You may export your complete portfolio at any time as Markdown or JSON, or delete your
            server account permanently inside My Workspace. For paid guided cohorts (when active),
            full refunds are honored up to 7 days prior to cohort opening; partial-credit policies
            for organizational engagements are stated in each scoped agreement.
          </p>
        </section>
      </div>

      <section className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-6 space-y-3">
        <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
          Withdraw Email Consent / Unsubscribe
        </h2>
        <form onSubmit={handleUnsubscribe} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="unsub-email" className="sr-only">
            Email to unsubscribe
          </label>
          <input
            id="unsub-email"
            type="email"
            required
            value={unsubEmail}
            onChange={(e) => setUnsubEmail(e.target.value)}
            placeholder="you@organization.org"
            className="flex-1 px-3 py-2 rounded border border-[#D8CFBE] bg-white text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium"
          >
            Unsubscribe
          </button>
        </form>
        {unsubStatus && <p className="text-xs text-[#244C3C]">{unsubStatus}</p>}
      </section>
    </div>
  );
}
