import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Download, FileText, Layers, Scale } from 'lucide-react';
import StrategicChallengeDemo from '../components/StrategicChallengeDemo.tsx';
import { CURRICULUM_PARTS } from '../data/curriculum.ts';
import { usePlatform } from '../context/PlatformContext.tsx';
import { usePageSeo } from '../lib/seo.ts';

export default function HomePage() {
  usePageSeo({
    title: 'The Timeless Art of Strategic Thinking — Mazhar Mansoor',
    description:
      'Understand the situation, make a defensible choice, and shape what comes next. Substantive strategic thinking lessons, Strategy Lab tools, and a continuing Decision Portfolio.',
    canonicalPath: '/',
  });

  const { subjects } = usePlatform();
  const publishedModules = subjects.filter((s) => s.published);

  // Consent-based subscription form state
  const [subEmail, setSubEmail] = useState('');
  const [consentUpdates, setConsentUpdates] = useState(true);
  const [consentReminders, setConsentReminders] = useState(false);
  const [subStatus, setSubStatus] = useState<{ ok: boolean; msg: string; token?: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubStatus(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: subEmail,
          consentUpdates,
          consentReminders,
        }),
      });
      const data = (await res.json()) as {
        subscribed?: boolean;
        message?: string;
        unsubscribeToken?: string;
        error?: string;
      };
      if (!res.ok) {
        setSubStatus({ ok: false, msg: data.error ?? 'Could not record subscription.' });
      } else {
        setSubStatus({
          ok: true,
          msg: data.message ?? 'Preferences saved.',
          token: data.unsubscribeToken,
        });
        setSubEmail('');
      }
    } catch {
      setSubStatus({ ok: false, msg: 'Network error recording consent.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Editorial Hero Section */}
      <section className="border-b border-[#E2DACB] bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
              By Mazhar Mansoor · Book, Curriculum &amp; Strategy Lab
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.35rem] font-medium leading-[1.1] tracking-tight text-[#0D1B2A]">
              Understand the situation. Make a defensible choice. Shape what comes next.
            </h1>
            <p className="text-lg text-[#3C424D] max-w-2xl leading-relaxed">
              A rigorous educational platform for professionals, public-service leaders, and
              founders navigating consequential decisions where evidence, incentives, and authority
              do not align neatly.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#challenge"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40] transition-colors whitespace-nowrap"
              >
                Try a strategic challenge
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#0D1B2A] text-[#0D1B2A] text-sm font-medium hover:bg-[#F3EEE3] transition-colors whitespace-nowrap"
              >
                Explore the learning journey
              </Link>
            </div>
            <p className="text-xs text-[#525866] pt-1">
              Open introductory access without sign-in · Part I (Modules 01–04) &amp; six decision
              tools live
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[280px] rounded-lg overflow-hidden border border-[#D8CFBE] bg-[#0D1B2A]">
              <img
                src="/src/assets/images/hero_strategic_study_1794972587669.jpg"
                alt="Editorial study desk with open notebooks, drafting plans, and natural north window light"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/85 via-[#0D1B2A]/20 to-transparent flex items-end p-6">
                <p className="font-serif italic text-sm text-[#FAF7F0] leading-relaxed">
                  &ldquo;Course completion and confidence are never proof of judgment. What matters
                  is whether your reasoning survives contact with evidence.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration */}
      <section id="challenge" className="py-16 lg:py-20 bg-[#F3EEE3] border-b border-[#E2DACB]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
              Begin With Practice
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#0D1B2A]">
              Test your diagnostic instinct before reading a single chapter
            </h2>
            <p className="text-sm text-[#525866] leading-relaxed">
              Most flawed decisions happen in the opening five minutes—when an organization mistakes
              an upstream queue or missing prerequisite for a staffing failure. Work through this
              two-step exercise with immediate structural feedback.
            </p>
          </div>
          <StrategicChallengeDemo />
        </div>
      </section>

      {/* Six-Part Canonical Map */}
      <section className="py-16 lg:py-20 bg-[#FAF7F0] border-b border-[#E2DACB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
                Shared Architecture · Book, Course &amp; Reference Library
              </p>
              <h2 className="font-serif text-3xl font-medium text-[#0D1B2A]">
                Six Parts. Twenty-Four Subjects.
              </h2>
              <p className="text-sm text-[#525866] leading-relaxed">
                Every chapter in the forthcoming monograph aligns directly with a course lesson and
                website module. Part I (Awaken, Modules 01–04) is open now; Parts II–VI publish
                sequentially as approved blueprints and readings are finalized.
              </p>
            </div>
            <Link
              to="/learn"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D1B2A] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Inspect full 24-subject map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CURRICULUM_PARTS.map((part) => {
              const partSubjects = subjects.filter((s) => s.part === part.part);
              const pubCount = partSubjects.filter((s) => s.published).length;
              return (
                <div
                  key={part.part}
                  className="bg-white border border-[#E2DACB] rounded-lg p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-baseline justify-between gap-2 text-xs text-[#525866]">
                      <span className="font-mono font-medium text-[#9A742B]">
                        Part {part.part} · {part.stageLabel}
                      </span>
                      <span>
                        {pubCount > 0 ? `${pubCount}/4 live` : 'Cataloged'}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-[#0D1B2A]">
                      {part.formalTitle}
                    </h3>
                    <p className="text-sm text-[#525866] leading-relaxed">{part.summary}</p>
                  </div>

                  <ul className="pt-3 border-t border-[#EFE9DC] space-y-1.5 text-xs">
                    {partSubjects.map((sub) => (
                      <li key={sub.moduleNumber} className="flex items-baseline gap-2">
                        <span className="font-mono text-[#525866] tabular-nums">
                          {String(sub.moduleNumber).padStart(2, '0')}
                        </span>
                        {sub.published ? (
                          <Link
                            to={`/learn/${sub.slug}`}
                            className="text-[#0D1B2A] font-medium hover:underline"
                          >
                            {sub.academicSubject}
                          </Link>
                        ) : (
                          <span className="text-[#6B7280]">{sub.academicSubject}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Substantive Lessons & Strategy Lab Tools */}
      <section className="py-16 lg:py-20 bg-[#F3EEE3] border-b border-[#E2DACB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
              Available Now · Learn &amp; Apply
            </p>
            <h2 className="font-serif text-3xl font-medium text-[#0D1B2A]">
              Part I Lessons &amp; Working Decision Tools
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#525866]">
                Published Introductory Modules
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publishedModules.map((mod) => (
                  <Link
                    key={mod.moduleNumber}
                    to={`/learn/${mod.slug}`}
                    className="group bg-[#FAF7F0] border border-[#D8CFBE] rounded-lg p-5 hover:border-[#0D1B2A] transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs font-mono text-[#244C3C]">
                        Module {String(mod.moduleNumber).padStart(2, '0')} · {mod.stageLabel}
                      </p>
                      <h3 className="font-serif text-lg font-medium text-[#0D1B2A] group-hover:underline underline-offset-4">
                        {mod.academicSubject}
                      </h3>
                      <p className="text-xs text-[#525866] leading-relaxed">{mod.summary}</p>
                    </div>
                    <span className="text-xs font-medium text-[#0D1B2A] inline-flex items-center gap-1">
                      Study module <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#525866]">
                Strategy Lab Workbench
              </p>
              <div className="bg-white border border-[#D8CFBE] rounded-lg divide-y divide-[#EFE9DC]">
                {[
                  {
                    id: 'problem-framing',
                    name: 'Problem-Framing Workbench',
                    desc: 'Separate facts from interpretations, compare rival causes, and test disconfirming evidence.',
                    icon: Compass,
                  },
                  {
                    id: 'systems-explorer',
                    name: 'Systems Explorer Simulator',
                    desc: 'Model stocks, flows, capacity limits, and feedback delays across charts and tables.',
                    icon: Layers,
                  },
                  {
                    id: 'decision-comparison',
                    name: 'Decision Comparison Matrix',
                    desc: 'Compare alternatives under uncertainty with sensitivity thresholds and downside limits.',
                    icon: Scale,
                  },
                  {
                    id: 'strategy-coherence',
                    name: 'Strategy Coherence Review',
                    desc: 'Audit whether initiatives address your diagnosed crux and specify what must stop.',
                    icon: FileText,
                  },
                ].map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      to={`/strategy-lab?tool=${tool.id}`}
                      className="flex items-start gap-3.5 p-4 hover:bg-[#FAF7F0] transition-colors"
                    >
                      <Icon className="w-5 h-5 text-[#9A742B] mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-[#0D1B2A]">{tool.name}</p>
                        <p className="text-xs text-[#525866] leading-relaxed">{tool.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link
                to="/strategy-lab"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D1B2A] hover:underline underline-offset-4"
              >
                Open all six Strategy Lab tools
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Portfolio + For Teams */}
      <section className="py-16 lg:py-20 bg-[#FAF7F0] border-b border-[#E2DACB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 bg-[#0D1B2A] text-[#FAF7F0] rounded-lg p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-widest uppercase text-[#C29D4E]">
                Continuing Decision Portfolio
              </p>
              <h2 className="font-serif text-3xl font-medium">
                Return to a decision months later—and see what changed
              </h2>
              <p className="text-sm text-[#D6DCE5] leading-relaxed">
                Real judgment improves when you preserve what you believed before the outcome was
                known. Record your initial confidence, assumptions, rival explanations, and
                revisions. Compare dated versions side-by-side and export clean decision memoranda.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#FAF7F0] text-[#0D1B2A] text-sm font-medium hover:bg-[#F3EEE3]"
              >
                Open My Workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-[#9FB0C4]">
                Works locally or synced to a private account
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-widest uppercase text-[#244C3C]">
                For Teams &amp; Public Institutions
              </p>
              <h2 className="font-serif text-3xl font-medium text-[#0D1B2A]">
                Scoped workshops around a real team decision
              </h2>
              <p className="text-sm text-[#525866] leading-relaxed">
                Designed for management teams, policy units, and cross-functional groups facing
                unaligned stakeholders and high-stakes trade-offs. Participants leave with a
                defensible decision memorandum and explicit revision triggers—never generic slide
                decks.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/for-teams"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#244C3C] text-[#FAF7F0] text-sm font-medium hover:bg-[#1D3E31]"
              >
                Explore team engagements
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/programs"
                className="text-sm font-medium text-[#0D1B2A] hover:underline underline-offset-4"
              >
                View guided programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Book & Optional Consent-Based Brief */}
      <section className="py-16 lg:py-20 bg-[#FAF7F0]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 items-center">
            <div className="w-48 shrink-0 rounded-md overflow-hidden border border-[#D8CFBE] bg-[#0D1B2A] shadow-sm">
              <img
                src="/src/assets/images/book_monograph_cover_1794972588178.jpg"
                alt="Minimalist midnight blue cloth hardcover monograph edition"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
                The Monograph · In Development
              </p>
              <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                The Timeless Art of Strategic Thinking
              </h2>
              <p className="text-sm text-[#525866] leading-relaxed">
                A 24-chapter sustained argument pairing scholarship, institutional mechanics, and
                reflective practice. Publication schedule and chapter releases follow approved
                manuscript completion.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D1B2A] hover:underline underline-offset-4"
              >
                <BookOpen className="w-4 h-4" />
                Inspect book architecture &amp; status
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2DACB]">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#0D1B2A]">
                  Download the Strategic Decision Brief &amp; Follow Releases
                </h3>
                <p className="text-xs text-[#525866] mt-1">
                  Download the one-page Markdown brief immediately without giving your email, or
                  opt in separately to receive module release notices.
                </p>
              </div>
              <a
                href="/api/brief/download"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#0D1B2A] bg-[#FAF7F0] text-xs font-medium text-[#0D1B2A] hover:bg-white whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download Free Brief (.md)
              </a>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="home-sub-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="home-sub-email"
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="you@organization.org"
                  className="flex-1 px-3.5 py-2.5 rounded-md border border-[#D8CFBE] bg-white text-sm"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40] disabled:opacity-60 whitespace-nowrap"
                >
                  {submitting ? 'Recording...' : 'Record Preferences'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 text-xs text-[#3C424D]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentUpdates}
                    onChange={(e) => setConsentUpdates(e.target.checked)}
                  />
                  Notify me when Modules 05–24 and book chapters publish
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentReminders}
                    onChange={(e) => setConsentReminders(e.target.checked)}
                  />
                  Send occasional decision-review &amp; case prompts
                </label>
              </div>

              {subStatus && (
                <p
                  className={`text-xs p-3 rounded border ${
                    subStatus.ok
                      ? 'bg-[#EBF2EE] border-[#244C3C]/30 text-[#173328]'
                      : 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]'
                  }`}
                >
                  {subStatus.msg}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
