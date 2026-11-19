import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CURRICULUM_PARTS } from '../data/curriculum.ts';
import { usePlatform } from '../context/PlatformContext.tsx';
import { usePageSeo } from '../lib/seo.ts';

export default function BookPage() {
  usePageSeo({
    title: 'The Book — The Timeless Art of Strategic Thinking',
    description:
      'Book overview, 24-chapter canonical correspondence, and truthful manuscript publication status by Mazhar Mansoor.',
    canonicalPath: '/book',
  });

  const { subjects } = usePlatform();

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-14">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-12 border-b border-[#E2DACB]">
        <div className="lg:col-span-4 flex justify-center">
          <div className="w-64 sm:w-72 rounded-lg overflow-hidden border border-[#D8CFBE] shadow-md bg-[#0D1B2A]">
            <img
              src="/src/assets/images/book_monograph_cover_1794972588178.jpg"
              alt="Hardcover monograph edition in deep midnight blue cloth"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <p className="text-xs font-medium tracking-widest uppercase text-[#9A742B]">
            The Monograph · Truthful Publication Status
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#0D1B2A]">
            The Timeless Art of Strategic Thinking
          </h1>
          <p className="text-base text-[#3C424D] leading-relaxed max-w-2xl">
            Written by Mazhar Mansoor, the book presents a sustained twenty-four-chapter argument
            connecting diagnostic philosophy, system dynamics, strategic analysis, choice under
            uncertainty, implementation, and ethical oversight.
          </p>

          <div className="bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-5 space-y-2 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0D1B2A]">
              Current Manuscript &amp; Release Status
            </p>
            <p className="text-sm text-[#1B1E23] leading-relaxed">
              The monograph is currently in active development. No pre-order price, release date, or
              unpublished manuscript excerpt is fabricated here. While the full book manuscript is
              finalized, Part I (Chapters/Modules 01–04) is open as interactive introductory
              teaching on this platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40]"
            >
              Study Published Part I Modules
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/api/brief/download"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#0D1B2A] text-[#0D1B2A] text-sm font-medium hover:bg-[#F3EEE3]"
            >
              Download Strategic Decision Brief
            </a>
          </div>
        </div>
      </section>

      {/* Distinction: Book vs Course vs Website */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-2">
          <p className="text-xs font-mono text-[#9A742B]">The Book</p>
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
            Sustained Argument &amp; Scholarship
          </h2>
          <p className="text-sm text-[#525866] leading-relaxed">
            Long-form prose, documented institutional narrative, historical context, and unified
            philosophical arc across Chapters 01–24.
          </p>
        </div>
        <div className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-2">
          <p className="text-xs font-mono text-[#244C3C]">The Course</p>
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
            Worked Practice &amp; Feedback
          </h2>
          <p className="text-sm text-[#525866] leading-relaxed">
            Conceptual instruction paired with worked demonstrations, guided critique, independent
            application, and explicit limitations across Lessons 01–24.
          </p>
        </div>
        <div className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-2">
          <p className="text-xs font-mono text-[#0D1B2A]">The Website &amp; Lab</p>
          <h2 className="font-serif text-xl font-medium text-[#0D1B2A]">
            Reference &amp; Continuing Portfolio
          </h2>
          <p className="text-sm text-[#525866] leading-relaxed">
            Searchable concepts, deterministic decision instruments, and a persistent workspace for
            comparing how your judgment evolves over time.
          </p>
        </div>
      </section>

      {/* Canonical Chapter Correspondence */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
          Canonical Chapter Correspondence (Chapters 01–24)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CURRICULUM_PARTS.map((part) => {
            const list = subjects.filter((s) => s.part === part.part);
            return (
              <div key={part.part} className="bg-white border border-[#E2DACB] rounded-lg p-6 space-y-3">
                <p className="text-xs font-mono text-[#9A742B]">
                  Part {part.part} — {part.stageLabel} · {part.formalTitle}
                </p>
                <ol className="space-y-2 text-sm">
                  {list.map((ch) => (
                    <li
                      key={ch.moduleNumber}
                      className="flex items-baseline justify-between gap-3 py-1.5 border-b border-[#EFE9DC] last:border-b-0"
                    >
                      <span>
                        <span className="font-mono text-xs text-[#525866] mr-2 tabular-nums">
                          Ch. {String(ch.moduleNumber).padStart(2, '0')}
                        </span>
                        <span className="text-[#0D1B2A] font-medium">{ch.academicSubject}</span>
                      </span>
                      <span className="text-[11px] text-[#525866] whitespace-nowrap">
                        {ch.published ? 'Intro Live' : 'In Preparation'}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
