import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Compass, Search } from 'lucide-react';
import { CANONICAL_CURRICULUM } from '../data/curriculum.ts';
import { LIBRARY_CASES, LIBRARY_CONCEPTS } from '../data/library.ts';
import { usePageSeo } from '../lib/seo.ts';

export default function LibraryPage() {
  const { kind, slug } = useParams<{ kind?: string; slug?: string }>();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'concepts' | 'cases'>('concepts');

  const conceptDetail =
    kind === 'concept' && slug ? LIBRARY_CONCEPTS.find((c) => c.slug === slug) : undefined;
  const caseDetail =
    kind === 'case' && slug ? LIBRARY_CASES.find((c) => c.slug === slug) : undefined;

  usePageSeo({
    title: conceptDetail
      ? conceptDetail.title
      : caseDetail
        ? caseDetail.title
        : 'Reference Library & Cases',
    description:
      conceptDetail?.definition ??
      caseDetail?.decisionAtTime ??
      'Searchable reference concepts, intellectual origins, limitations, and separated hypothetical exercises.',
    canonicalPath: slug ? `/library/${kind}/${slug}` : '/library',
  });

  const filteredConcepts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LIBRARY_CONCEPTS;
    return LIBRARY_CONCEPTS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q) ||
        c.questionAnswered.toLowerCase().includes(q),
    );
  }, [query]);

  if (conceptDetail) {
    const linkedMods = CANONICAL_CURRICULUM.filter((m) =>
      conceptDetail.linkedModuleNumbers.includes(m.moduleNumber),
    );
    return (
      <article className="max-w-4xl mx-auto px-5 sm:px-8 py-12 space-y-8">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525866] hover:text-[#0D1B2A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Reference Library
        </Link>

        <header className="space-y-3 pb-6 border-b border-[#E2DACB]">
          <p className="text-xs font-mono text-[#244C3C]">
            Reference Concept · Linked Modules:{' '}
            {conceptDetail.linkedModuleNumbers.map((n) => String(n).padStart(2, '0')).join(', ')}
          </p>
          <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">
            {conceptDetail.title}
          </h1>
          <p className="text-lg text-[#3C424D] leading-relaxed">{conceptDetail.definition}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 space-y-2">
            <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
              Question It Helps Answer
            </h2>
            <p className="text-sm text-[#1B1E23] leading-relaxed">
              {conceptDetail.questionAnswered}
            </p>
          </div>
          <div className="bg-white border border-[#E2DACB] rounded-lg p-5 space-y-2">
            <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">Intellectual Origin</h2>
            <p className="text-sm text-[#1B1E23] leading-relaxed">
              {conceptDetail.intellectualOrigin}
            </p>
          </div>
        </div>

        <section className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-3">
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">Worked Example</h2>
          <p className="text-sm text-[#1B1E23] leading-relaxed">{conceptDetail.workedExample}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#0D1B2A]">Evidence Needed</h3>
            <ul className="space-y-1.5 text-xs text-[#3C424D] leading-relaxed">
              {conceptDetail.evidenceNeeded.map((ev, i) => (
                <li key={i}>• {ev}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[#F7F1E1] border border-[#9A742B]/30 rounded-lg p-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#3F2E0D]">Typical Misuse</h3>
            <p className="text-xs text-[#3F2E0D] leading-relaxed">{conceptDetail.typicalMisuse}</p>
          </div>
          <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#0D1B2A]">Limitations</h3>
            <p className="text-xs text-[#3C424D] leading-relaxed">{conceptDetail.limitations}</p>
          </div>
        </div>

        <section className="border-t border-[#E2DACB] pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#525866]">
              Linked Lesson &amp; Tool
            </h3>
            <div className="flex flex-wrap gap-3">
              {linkedMods.map((m) =>
                m.published ? (
                  <Link
                    key={m.moduleNumber}
                    to={`/learn/${m.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#D8CFBE] bg-white text-xs font-medium text-[#0D1B2A] hover:border-[#0D1B2A]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Module {String(m.moduleNumber).padStart(2, '0')}: {m.academicSubject}
                  </Link>
                ) : (
                  <span
                    key={m.moduleNumber}
                    className="px-3.5 py-2 rounded-md border border-[#E2DACB] bg-[#F3EEE3] text-xs text-[#525866]"
                  >
                    Module {String(m.moduleNumber).padStart(2, '0')} (Unpublished)
                  </span>
                ),
              )}
              <Link
                to={`/strategy-lab?tool=${conceptDetail.linkedToolId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-xs font-medium"
              >
                <Compass className="w-3.5 h-3.5" />
                Open Linked Tool
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#525866]">
              Sources
            </h3>
            <ul className="space-y-2 text-xs text-[#3C424D]">
              {conceptDetail.sources.map((s, i) => (
                <li key={i}>
                  <span className="font-medium text-[#0D1B2A]">
                    {s.author} ({s.year})
                  </span>
                  , <em>{s.title}</em> — {s.note}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    );
  }

  if (caseDetail) {
    return (
      <article className="max-w-4xl mx-auto px-5 sm:px-8 py-12 space-y-8">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525866] hover:text-[#0D1B2A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Reference Library
        </Link>

        <header className="space-y-3 pb-6 border-b border-[#E2DACB]">
          <p className="text-xs font-mono text-[#9A742B]">
            {caseDetail.kind} · Linked Modules:{' '}
            {caseDetail.linkedModuleNumbers.map((n) => String(n).padStart(2, '0')).join(', ')}
          </p>
          <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">{caseDetail.title}</h1>
          <p className="text-sm text-[#525866]">{caseDetail.datesAndContext}</p>
        </header>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#E2DACB] rounded-lg p-6">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[#525866]">
              Participants
            </dt>
            <dd className="text-sm text-[#1B1E23] mt-1">{caseDetail.participants}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[#525866]">
              Decision as It Appeared at the Time
            </dt>
            <dd className="text-sm text-[#1B1E23] mt-1">{caseDetail.decisionAtTime}</dd>
          </div>
        </dl>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5 space-y-2">
            <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
              Evidence Available at the Time
            </h2>
            <ul className="space-y-1.5 text-sm text-[#1B1E23]">
              {caseDetail.evidenceAvailable.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-lg p-5 space-y-2">
            <h2 className="font-serif text-lg font-medium text-[#0D1B2A]">
              Alternatives Considered
            </h2>
            <ul className="space-y-1.5 text-sm text-[#1B1E23]">
              {caseDetail.alternativesConsidered.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>

        <section className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-4">
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
            Consequences &amp; Competing Interpretations
          </h2>
          <p className="text-sm text-[#1B1E23] leading-relaxed">{caseDetail.consequences}</p>
          <ul className="space-y-2 text-sm text-[#3C424D] pt-2 border-t border-[#EFE9DC]">
            {caseDetail.competingInterpretations.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </section>

        <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 text-xs text-[#525866]">
          <strong className="text-[#0D1B2A]">Source Limitations: </strong>
          {caseDetail.sourceLimitations}
        </div>
      </article>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-10">
      <header className="max-w-3xl space-y-3 border-b border-[#E2DACB] pb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
          Reference Library &amp; Case Index
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">
          Concepts, Origins, Limitations &amp; Exercises
        </h1>
        <p className="text-base text-[#525866] leading-relaxed">
          Every entry states its intellectual lineage, what evidence is required to use it well, how
          it is commonly misused, and where its applicability stops. Hypothetical exercises are
          strictly separated from documented historical cases.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-md bg-[#F3EEE3] border border-[#E2DACB]">
          <button
            type="button"
            onClick={() => setActiveTab('concepts')}
            className={`px-4 py-2 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'concepts' ? 'bg-white text-[#0D1B2A] shadow-sm' : 'text-[#525866]'
            }`}
          >
            Reference Concepts ({LIBRARY_CONCEPTS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`px-4 py-2 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'cases' ? 'bg-white text-[#0D1B2A] shadow-sm' : 'text-[#525866]'
            }`}
          >
            Exercises &amp; Cases ({LIBRARY_CASES.length})
          </button>
        </div>

        {activeTab === 'concepts' && (
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#525866] absolute left-3 top-1/2 -translate-y-1/2" />
            <label htmlFor="lib-search" className="sr-only">
              Search concepts
            </label>
            <input
              id="lib-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts or questions..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-[#D8CFBE] bg-white text-sm"
            />
          </div>
        )}
      </div>

      {activeTab === 'concepts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredConcepts.map((c) => (
            <article
              key={c.slug}
              className="bg-white border border-[#E2DACB] rounded-lg p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-mono text-[#244C3C]">
                  Modules {c.linkedModuleNumbers.map((n) => String(n).padStart(2, '0')).join(', ')}
                </p>
                <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
                  <Link
                    to={`/library/concept/${c.slug}`}
                    className="hover:underline underline-offset-4"
                  >
                    {c.title}
                  </Link>
                </h2>
                <p className="text-sm text-[#3C424D] leading-relaxed">{c.definition}</p>
              </div>
              <div className="pt-3 border-t border-[#EFE9DC] flex items-center justify-between text-xs">
                <Link
                  to={`/library/concept/${c.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-[#0D1B2A] hover:underline"
                >
                  Read full entry <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/strategy-lab?tool=${c.linkedToolId}`}
                  className="text-[#9A742B] hover:underline"
                >
                  Apply in tool
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 text-sm text-[#3C424D]">
            <strong className="text-[#0D1B2A]">Epistemic Boundary: </strong>
            All scenarios listed below are explicitly labeled <strong>Hypothetical Exercises</strong>{' '}
            designed to teach analytical mechanics. Documented historical cases will only enter this
            index once verified archival source inventories are supplied and audited.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LIBRARY_CASES.map((cs) => (
              <article
                key={cs.slug}
                className="bg-white border border-[#E2DACB] rounded-lg p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-mono text-[#9A742B]">
                    {cs.kind} · Modules{' '}
                    {cs.linkedModuleNumbers.map((n) => String(n).padStart(2, '0')).join(', ')}
                  </p>
                  <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
                    <Link
                      to={`/library/case/${cs.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {cs.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-[#3C424D] leading-relaxed">{cs.decisionAtTime}</p>
                </div>
                <Link
                  to={`/library/case/${cs.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0D1B2A] hover:underline pt-2 border-t border-[#EFE9DC]"
                >
                  Inspect case structure &amp; competing interpretations{' '}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
