import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass } from 'lucide-react';
import { CURRICULUM_PARTS } from '../data/curriculum.ts';
import { usePlatform } from '../context/PlatformContext.tsx';
import { usePageSeo } from '../lib/seo.ts';

const DECISION_ONBOARDING_PATHS = [
  {
    id: 'all',
    label: 'Show all 24 subjects',
    recommendation: 'Browse the full six-part architecture alongside currently published Part I lessons.',
    recommendedRoute: '/learn/problem-definition-and-framing',
    recommendedCta: 'Begin at Module 01',
  },
  {
    id: 'unclear-problem',
    label: 'I need to define a messy problem cleanly',
    recommendation:
      'Start with Module 01 (Problem Definition and Framing) and apply the Problem-Framing Workbench to separate observations from disguised solutions.',
    recommendedRoute: '/learn/problem-definition-and-framing',
    recommendedCta: 'Open Module 01',
  },
  {
    id: 'queue-oscillation',
    label: 'Backlogs or delays keep worsening despite fixes',
    recommendation:
      'Study Module 03 (Systems Thinking) and run arrival/delay curves inside the Systems Explorer simulation.',
    recommendedRoute: '/learn/systems-thinking',
    recommendedCta: 'Open Module 03',
  },
  {
    id: 'strategy-crux',
    label: 'We have too many initiatives and no clear focus',
    recommendation:
      'Read Module 04 (Strategic Diagnosis) and test your initiatives in the Strategy Coherence Review.',
    recommendedRoute: '/learn/strategic-diagnosis',
    recommendedCta: 'Open Module 04',
  },
];

export default function LearnIndexPage() {
  usePageSeo({
    title: 'Curriculum & Lessons (Learn)',
    description:
      'Explore the six-part, 24-subject curriculum of The Timeless Art of Strategic Thinking. Complete Part I (Awaken) Modules 01–04 available now.',
    canonicalPath: '/learn',
  });

  const { subjects } = usePlatform();
  const [selectedPath, setSelectedPath] = useState<string>('all');
  const [catalogView, setCatalogView] = useState<'available' | 'full-map'>('available');

  const activeOnboarding =
    DECISION_ONBOARDING_PATHS.find((p) => p.id === selectedPath) ?? DECISION_ONBOARDING_PATHS[0];

  const publishedList = subjects.filter((s) => s.published);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-14">
      <header className="max-w-3xl space-y-4 border-b border-[#E2DACB] pb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
          Curriculum &amp; Guided Study
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#0D1B2A]">
          Twenty-Four Subjects Across Six Stages of Judgment
        </h1>
        <p className="text-base text-[#525866] leading-relaxed">
          The platform preserves one canonical sequence across the book, course, and reference
          library. Below, the catalog of completed teaching is kept distinct from the full
          twenty-four-subject curriculum map.
        </p>
        <p className="text-xs text-[#525866]">
          Pacing note: Curriculum modules are not bound to a fixed duration; they support
          self-paced study, facilitator-led intensives, and extended cohorts.
        </p>
      </header>

      {/* Decision-driven onboarding filter */}
      <section className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
              Where to start based on the decision in front of you
            </h2>
            <p className="text-sm text-[#525866]">{activeOnboarding.recommendation}</p>
          </div>
          <Link
            to={activeOnboarding.recommendedRoute}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium hover:bg-[#162A40] whitespace-nowrap shrink-0"
          >
            {activeOnboarding.recommendedCta}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {DECISION_ONBOARDING_PATHS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPath(p.id)}
              className={`px-3.5 py-2 rounded-md text-xs font-medium border transition-colors ${
                selectedPath === p.id
                  ? 'bg-[#0D1B2A] text-[#FAF7F0] border-[#0D1B2A]'
                  : 'bg-[#FAF7F0] text-[#1B1E23] border-[#D8CFBE] hover:border-[#9A742B]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* View Switcher: Available Catalog vs Full Canonical Map */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACB] pb-4">
          <div className="inline-flex p-1 rounded-md bg-[#F3EEE3] border border-[#E2DACB]">
            <button
              type="button"
              onClick={() => setCatalogView('available')}
              className={`px-4 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                catalogView === 'available'
                  ? 'bg-white text-[#0D1B2A] shadow-sm'
                  : 'text-[#525866] hover:text-[#0D1B2A]'
              }`}
            >
              Published Catalog ({publishedList.length} Modules Live)
            </button>
            <button
              type="button"
              onClick={() => setCatalogView('full-map')}
              className={`px-4 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                catalogView === 'full-map'
                  ? 'bg-white text-[#0D1B2A] shadow-sm'
                  : 'text-[#525866] hover:text-[#0D1B2A]'
              }`}
            >
              Full 24-Subject Curriculum Map
            </button>
          </div>

          <Link
            to="/strategy-lab"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#244C3C] hover:underline underline-offset-4"
          >
            <Compass className="w-4 h-4" />
            Go directly to Strategy Lab tools
          </Link>
        </div>

        {catalogView === 'available' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-[#9A742B]">Part I — AWAKEN</p>
                <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                  Strategic Diagnosis and Systems Thinking
                </h2>
              </div>
              <p className="text-xs text-[#525866]">
                Original introductory teaching · Substantive readings, worked examples &amp;
                practice
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedList.map((mod) => (
                <article
                  key={mod.moduleNumber}
                  className="bg-white border border-[#D8CFBE] rounded-lg p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#525866]">
                      <span className="font-mono text-[#244C3C] font-medium">
                        Module {String(mod.moduleNumber).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Part {mod.part} ({mod.stageLabel})</span>
                      <span aria-hidden="true">·</span>
                      <span>Published</span>
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                      <Link to={`/learn/${mod.slug}`} className="hover:underline underline-offset-4">
                        {mod.academicSubject}
                      </Link>
                    </h3>
                    <p className="text-sm italic text-[#525866]">{mod.headline}</p>
                    <p className="text-sm text-[#1B1E23] leading-relaxed">{mod.summary}</p>
                  </div>

                  <div className="pt-4 border-t border-[#EFE9DC] flex items-center justify-between gap-3">
                    <Link
                      to={`/learn/${mod.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D1B2A] hover:underline underline-offset-4"
                    >
                      <BookOpen className="w-4 h-4" />
                      Study lesson
                    </Link>
                    {mod.linkedToolId && (
                      <Link
                        to={`/strategy-lab?tool=${mod.linkedToolId}`}
                        className="text-xs font-medium text-[#244C3C] hover:underline underline-offset-4"
                      >
                        Apply in Strategy Lab
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {CURRICULUM_PARTS.map((part) => {
              const partMods = subjects.filter((s) => s.part === part.part);
              return (
                <section key={part.part} className="space-y-4">
                  <div className="border-b border-[#E2DACB] pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-[#9A742B]">
                        Part {part.part} — {part.stageLabel}
                      </p>
                      <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                        {part.formalTitle}
                      </h2>
                    </div>
                    <p className="text-xs text-[#525866] max-w-md">{part.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partMods.map((mod) => (
                      <div
                        key={mod.moduleNumber}
                        className={`rounded-lg border p-5 flex flex-col justify-between space-y-3 ${
                          mod.published
                            ? 'bg-white border-[#D8CFBE]'
                            : 'bg-[#F3EEE3]/70 border-[#E2DACB]'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-[#525866]">
                            <span className="font-mono tabular-nums">
                              Module {String(mod.moduleNumber).padStart(2, '0')}
                            </span>
                            <span>{mod.published ? 'Published' : 'Unpublished'}</span>
                          </div>
                          <h3 className="font-serif text-lg font-medium text-[#0D1B2A]">
                            {mod.academicSubject}
                          </h3>
                          <p className="text-xs text-[#525866] leading-relaxed">{mod.summary}</p>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs">
                          {mod.published ? (
                            <Link
                              to={`/learn/${mod.slug}`}
                              className="font-medium text-[#0D1B2A] hover:underline underline-offset-4 inline-flex items-center gap-1"
                            >
                              Open lesson <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-[#6B7280]">
                              Awaiting approved course blueprint &amp; readings
                            </span>
                          )}
                          {mod.linkedToolId && (
                            <Link
                              to={`/strategy-lab?tool=${mod.linkedToolId}`}
                              className="text-[#244C3C] hover:underline underline-offset-4"
                            >
                              Related tool
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
