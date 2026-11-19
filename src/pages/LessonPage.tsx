import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { CANONICAL_CURRICULUM, PUBLISHED_LESSONS } from '../data/curriculum.ts';
import { usePlatform } from '../context/PlatformContext.tsx';
import { usePageSeo } from '../lib/seo.ts';

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { subjects, learningProgress, recordLearningProgress, trackEvent } = usePlatform();

  const subjectMeta = subjects.find((s) => s.slug === slug);
  const lesson = slug ? PUBLISHED_LESSONS[slug] : undefined;
  const isPublished = Boolean(subjectMeta?.published && lesson);
  const existingProgress = lesson
    ? learningProgress.find((p) => p.moduleNumber === lesson.moduleNumber)
    : undefined;

  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [showAcademicDepth, setShowAcademicDepth] = useState(false);

  usePageSeo({
    title: subjectMeta
      ? `Module ${String(subjectMeta.moduleNumber).padStart(2, '0')}: ${subjectMeta.academicSubject}`
      : 'Module Not Found',
    description: subjectMeta?.summary ?? 'Curriculum module in The Timeless Art of Strategic Thinking.',
    canonicalPath: `/learn/${slug ?? ''}`,
  });

  useEffect(() => {
    setSelectedPracticeId(null);
    setShowAcademicDepth(false);
    if (isPublished && lesson) {
      trackEvent('lesson_started', { moduleNumber: lesson.moduleNumber });
      recordLearningProgress({
        moduleNumber: lesson.moduleNumber,
        slug: lesson.slug,
        academicSubject: lesson.academicSubject,
        stageLabel: lesson.stageLabel,
        status: 'Opened',
      });
    }
  }, [slug, isPublished, lesson, trackEvent, recordLearningProgress]);

  if (!subjectMeta) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 space-y-4">
        <h1 className="font-serif text-3xl text-[#0D1B2A]">Module Not Found</h1>
        <p className="text-sm text-[#525866]">
          No canonical curriculum subject matches that route.
        </p>
        <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D1B2A] underline">
          Return to Curriculum
        </Link>
      </div>
    );
  }

  if (!isPublished || !lesson) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-mono text-[#9A742B]">
            Module {String(subjectMeta.moduleNumber).padStart(2, '0')} · Part {subjectMeta.part} (
            {subjectMeta.stageLabel})
          </p>
          <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">
            {subjectMeta.academicSubject}
          </h1>
        </div>
        <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-6 space-y-3">
          <p className="text-sm text-[#1B1E23] leading-relaxed">
            This module is part of the canonical twenty-four-subject architecture and is currently
            unpublished pending final approved lesson readings and source inventories.
          </p>
          <p className="text-xs text-[#525866]">
            Part I (Awaken: Modules 01–04) and the Strategy Lab tools are fully available for
            immediate study.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore Published Modules
          </Link>
          {subjectMeta.linkedToolId && (
            <Link
              to={`/strategy-lab?tool=${subjectMeta.linkedToolId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#0D1B2A] text-[#0D1B2A] text-sm font-medium"
            >
              Try Related Preview Tool
            </Link>
          )}
        </div>
      </div>
    );
  }

  const nextSubject = CANONICAL_CURRICULUM.find(
    (s) => s.moduleNumber === lesson.bridgeToNext.nextModuleNumber,
  );
  const chosenPractice = lesson.guidedPractice.options.find((o) => o.id === selectedPracticeId);

  const handlePracticeSelect = (id: string) => {
    setSelectedPracticeId(id);
    const chosen = lesson.guidedPractice.options.find((o) => o.id === id);
    trackEvent('lesson_completed', { moduleNumber: lesson.moduleNumber });
    recordLearningProgress({
      moduleNumber: lesson.moduleNumber,
      slug: lesson.slug,
      academicSubject: lesson.academicSubject,
      stageLabel: lesson.stageLabel,
      status: 'Guided practice completed',
      selectedPracticeOption: chosen?.label,
    });
  };

  return (
    <article className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
      <div className="mb-8">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525866] hover:text-[#0D1B2A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Curriculum
        </Link>
      </div>

      {/* Editorial Header */}
      <header className="max-w-4xl space-y-4 pb-10 border-b border-[#E2DACB]">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#525866]">
          <span className="font-mono font-medium text-[#9A742B]">
            Module {String(lesson.moduleNumber).padStart(2, '0')} · Part {lesson.part} (
            {lesson.stageLabel})
          </span>
          <span aria-hidden="true">·</span>
          <span>{lesson.originLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.estimatedReadingMinutes} min read</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#0D1B2A] leading-tight">
          {lesson.academicSubject}
        </h1>
        <p className="font-serif italic text-xl text-[#3C424D]">{lesson.headline}</p>

        <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#244C3C] mb-1">
            Consequential Question
          </p>
          <p className="text-base font-medium text-[#0D1B2A] leading-relaxed">
            {lesson.consequentialQuestion}
          </p>
        </div>
      </header>

      {/* Asymmetric Reading Canvas: 68% Reading Column / 32% Margin Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10">
        <div className="lg:col-span-8 space-y-12 max-w-prose">
          {/* Learning Outcomes */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">Learning Outcomes</h2>
            <ul className="space-y-2 text-sm text-[#1B1E23]">
              {lesson.learningOutcomes.map((out, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="font-mono text-xs text-[#9A742B] mt-0.5 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Substantive Conceptual Instruction */}
          {lesson.conceptualInstruction.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">{sec.heading}</h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className={`text-base text-[#1B1E23] leading-[1.78] ${
                    idx === 0 && pIdx === 0 ? 'editorial-dropcap' : ''
                  }`}
                >
                  {p}
                </p>
              ))}

              {sec.keyDistinction && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-md p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-[#525866]">
                      {sec.keyDistinction.leftTitle}
                    </p>
                    <p className="text-sm text-[#1B1E23] leading-relaxed">
                      {sec.keyDistinction.leftDetail}
                    </p>
                  </div>
                  <div className="bg-[#EBF2EE] border border-[#244C3C]/30 rounded-md p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-[#244C3C]">
                      {sec.keyDistinction.rightTitle}
                    </p>
                    <p className="text-sm text-[#173328] leading-relaxed">
                      {sec.keyDistinction.rightDetail}
                    </p>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Expandable Academic Origins */}
          <section className="border-t border-b border-[#E2DACB] py-5">
            <button
              type="button"
              onClick={() => setShowAcademicDepth((prev) => !prev)}
              aria-expanded={showAcademicDepth}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-[#525866]">
                  Scholarly Lineage &amp; Citations
                </p>
                <p className="font-serif text-lg font-medium text-[#0D1B2A]">
                  Academic Origins &amp; Necessary Distinctions
                </p>
              </div>
              {showAcademicDepth ? (
                <ChevronUp className="w-5 h-5 text-[#525866]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#525866]" />
              )}
            </button>
            {showAcademicDepth && (
              <ul className="mt-4 space-y-2.5 text-sm text-[#3C424D] leading-relaxed">
                {lesson.academicOrigins.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Worked Demonstration */}
          <section className="bg-white border border-[#D8CFBE] rounded-lg p-6 sm:p-7 space-y-5">
            <div className="space-y-1 border-b border-[#EFE9DC] pb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#9A742B]">
                Worked Demonstration · {lesson.workedDemonstration.isHypothetical ? 'Hypothetical Teaching Exercise' : 'Documented Case'}
              </p>
              <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
                {lesson.workedDemonstration.title}
              </h2>
              <p className="text-sm text-[#525866] leading-relaxed pt-1">
                {lesson.workedDemonstration.context}
              </p>
            </div>

            <div className="space-y-4">
              {lesson.workedDemonstration.steps.map((st, idx) => (
                <div key={idx} className="space-y-1.5 pb-4 border-b border-[#EFE9DC] last:border-b-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#0D1B2A]">{st.label}</p>
                  <p className="text-sm text-[#1B1E23] leading-relaxed">{st.reasoning}</p>
                  <p className="text-xs text-[#244C3C]">{st.evidenceNote}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#FAF7F0] border border-[#E2DACB] rounded-md p-4 text-sm text-[#0D1B2A] leading-relaxed">
              <span className="font-semibold">Takeaway: </span>
              {lesson.workedDemonstration.conclusion}
            </div>
          </section>

          {/* Guided Practice */}
          <section className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-6 sm:p-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#244C3C]">
                Guided Practice &amp; Review Criteria
              </p>
              {existingProgress?.status === 'Guided practice completed' && (
                <p className="text-xs text-[#525866]">
                  Recorded in My Workspace · {new Date(existingProgress.practiceCompletedAt || existingProgress.lastVisitedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
              {lesson.guidedPractice.prompt}
            </h2>
            <div className="space-y-2.5">
              {lesson.guidedPractice.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePracticeSelect(opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-md border text-sm transition-colors ${
                    selectedPracticeId === opt.id
                      ? 'bg-[#0D1B2A] text-[#FAF7F0] border-[#0D1B2A]'
                      : 'bg-white text-[#1B1E23] border-[#D8CFBE] hover:border-[#9A742B]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {chosenPractice && (
              <div
                className={`p-4 rounded-md border text-sm leading-relaxed ${
                  chosenPractice.isStrongest
                    ? 'bg-[#EBF2EE] border-[#244C3C]/30 text-[#173328]'
                    : 'bg-[#F7F1E1] border-[#9A742B]/40 text-[#3F2E0D]'
                }`}
              >
                {chosenPractice.feedback}
              </div>
            )}
          </section>

          {/* Independent Application & Return to Practice */}
          <section className="bg-[#0D1B2A] text-[#FAF7F0] rounded-lg p-7 space-y-4">
            <p className="text-xs uppercase tracking-widest text-[#C29D4E]">
              Independent Application
            </p>
            <h2 className="font-serif text-2xl font-medium">
              Apply this module to an active decision
            </h2>
            <p className="text-sm text-[#D6DCE5] leading-relaxed">
              {lesson.independentApplicationPrompt}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to={`/strategy-lab?tool=${lesson.linkedToolId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#FAF7F0] text-[#0D1B2A] text-sm font-medium hover:bg-[#F3EEE3]"
              >
                <Compass className="w-4 h-4" />
                {lesson.linkedToolLabel}
              </Link>
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#475D75] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40]"
              >
                Open Decision Portfolio
              </Link>
            </div>
          </section>

          {/* Bridge to Next Subject */}
          <section className="border-t border-[#E2DACB] pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <p className="text-xs font-mono text-[#525866]">Bridge to Next Subject</p>
              <p className="text-sm text-[#1B1E23] leading-relaxed">{lesson.bridgeToNext.text}</p>
            </div>
            {nextSubject && nextSubject.published ? (
              <Link
                to={`/learn/${nextSubject.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40] whitespace-nowrap shrink-0"
              >
                Module {String(nextSubject.moduleNumber).padStart(2, '0')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/learn"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-[#D8CFBE] text-[#0D1B2A] text-sm font-medium whitespace-nowrap shrink-0"
              >
                View Curriculum Map
              </Link>
            )}
          </section>
        </div>

        {/* Margin Rail: Criteria, Limitations & Sources */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#FAF7F0] border border-[#D8CFBE] rounded-lg p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0D1B2A]">
                Review Criteria
              </p>
              <ul className="space-y-2 text-xs text-[#3C424D] leading-relaxed">
                {lesson.reviewCriteria.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9A742B]">
                Limitations &amp; Conditions of Use
              </p>
              <ul className="space-y-2 text-xs text-[#3C424D] leading-relaxed">
                {lesson.limitations.map((l, i) => (
                  <li key={i}>• {l}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E2DACB] rounded-lg p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#525866] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Accessible Source Notes
              </p>
              <ul className="space-y-3 text-xs">
                {lesson.sources.map((src, i) => (
                  <li key={i} className="space-y-0.5">
                    <p className="font-medium text-[#0D1B2A]">
                      {src.author} ({src.year})
                    </p>
                    <p className="italic text-[#3C424D]">{src.title}</p>
                    <p className="text-[#525866]">{src.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
