import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext.tsx';
import { usePageSeo } from '../lib/seo.ts';

export default function ProgramsPage() {
  usePageSeo({
    title: 'Guided Programs & Commercial Pathways',
    description:
      'Transparent sequence of offers from free introductory access and decision tools to guided programs and scoped organizational engagements.',
    canonicalPath: '/programs',
  });

  const { programs, user, configStatus } = usePlatform();
  const [searchParams] = useSearchParams();
  const checkoutParam = searchParams.get('checkout');

  const [interestProgram, setInterestProgram] = useState('guided-decision-intensive');
  const [interestEmail, setInterestEmail] = useState('');
  const [interestConsent, setInterestConsent] = useState(true);
  const [interestMsg, setInterestMsg] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInterestMsg(null);
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: interestEmail,
        consentUpdates: interestConsent,
        consentReminders: false,
        interestProgram,
      }),
    });
    const data = (await res.json()) as { message?: string; error?: string };
    if (!res.ok) {
      setInterestMsg(data.error ?? 'Could not record program interest.');
    } else {
      setInterestMsg(data.message ?? 'Program interest recorded.');
      setInterestEmail('');
    }
  };

  const handleCheckout = async (programId: string) => {
    setCheckoutMessage(null);
    if (!user) {
      setCheckoutMessage('Please sign in inside My Workspace before initiating program checkout.');
      return;
    }
    const res = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      setCheckoutMessage(data.error ?? 'Checkout unavailable.');
      return;
    }
    window.location.assign(data.url);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-14">
      <header className="max-w-3xl space-y-3 border-b border-[#E2DACB] pb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-[#525866]">
          Commercial Model &amp; Guided Programs
        </p>
        <h1 className="font-serif text-4xl font-medium text-[#0D1B2A]">
          Increasing Depth, Transparent Boundaries
        </h1>
        <p className="text-base text-[#525866] leading-relaxed">
          People pay for help making consequential decisions and return because the tools stay
          useful. We do not gate basic learning behind dark patterns, nor do we sell unavailable
          courses or publish invented tuition figures.
        </p>
      </header>

      {checkoutParam === 'success' && (
        <div className="p-4 rounded-md bg-[#EBF2EE] border border-[#244C3C]/30 text-sm text-[#173328]">
          Checkout completed. Server entitlement updates automatically once the verified Stripe
          webhook confirms payment.
        </div>
      )}

      {checkoutMessage && (
        <div className="p-4 rounded-md bg-[#F7F1E1] border border-[#9A742B]/40 text-sm text-[#3F2E0D]">
          {checkoutMessage}
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {programs.map((prog) => {
          const canPayDirectly =
            prog.status === 'Available' &&
            prog.priceCents !== null &&
            prog.priceCents > 0 &&
            configStatus.stripeConfigured;
          const owned = user?.entitlements.includes(prog.id);

          return (
            <article
              key={prog.id}
              className="bg-white border border-[#D8CFBE] rounded-lg p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#525866]">
                  <span className="font-mono text-[#9A742B]">{prog.tier}</span>
                  <span>{prog.status}</span>
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">{prog.title}</h2>
                  <p className="text-sm font-medium text-[#244C3C] mt-1">{prog.priceLabel}</p>
                  <p className="text-xs text-[#525866] mt-0.5">{prog.scheduleNote}</p>
                </div>
                <p className="text-sm text-[#3C424D] leading-relaxed">{prog.summary}</p>

                <div className="pt-3 border-t border-[#EFE9DC] space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0D1B2A]">
                    What Is Included
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#1B1E23] leading-relaxed">
                    {prog.includedItems.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#EFE9DC] space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#525866]">
                    Boundaries
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#525866] leading-relaxed">
                    {prog.excludedBoundaries.map((b, i) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFE9DC]">
                {prog.tier === 'Free' ? (
                  <Link
                    to="/learn"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40]"
                  >
                    Start Free Modules <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : prog.tier === 'Organizational Engagement' ? (
                  <Link
                    to="/for-teams"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#244C3C] text-[#FAF7F0] text-sm font-medium hover:bg-[#1D3E31]"
                  >
                    Submit Team Inquiry <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : owned ? (
                  <span className="block text-center text-xs font-medium text-[#244C3C] py-2">
                    Confirmed Enrollment Active
                  </span>
                ) : canPayDirectly ? (
                  <button
                    type="button"
                    onClick={() => handleCheckout(prog.id)}
                    className="w-full px-4 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40]"
                  >
                    Enroll via Hosted Checkout
                  </button>
                ) : (
                  <a
                    href="#interest-form"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-[#0D1B2A] text-[#0D1B2A] text-sm font-medium hover:bg-[#F3EEE3]"
                  >
                    Register Program Interest
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Program-Interest Registration */}
      <section
        id="interest-form"
        className="max-w-2xl bg-[#F3EEE3] border border-[#D8CFBE] rounded-lg p-7 space-y-4"
      >
        <h2 className="font-serif text-2xl font-medium text-[#0D1B2A]">
          Program-Interest Registration
        </h2>
        <p className="text-sm text-[#525866] leading-relaxed">
          Guided cohort dates and verified Stripe tuition checkout open only when a cohort schedule
          is finalized. Leave your email if you would like a single announcement when dates open.
        </p>
        <form onSubmit={handleInterestSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pi-prog" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Program of Interest
              </label>
              <select
                id="pi-prog"
                value={interestProgram}
                onChange={(e) => setInterestProgram(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#D8CFBE] bg-white text-sm"
              >
                <option value="guided-decision-intensive">Guided Strategic Decision Intensive</option>
                <option value="institutional-licensing">Future Institutional Licensing</option>
              </select>
            </div>
            <div>
              <label htmlFor="pi-email" className="block text-xs font-medium text-[#0D1B2A] mb-1">
                Email Address
              </label>
              <input
                id="pi-email"
                type="email"
                required
                value={interestEmail}
                onChange={(e) => setInterestEmail(e.target.value)}
                placeholder="you@organization.org"
                className="w-full px-3 py-2 rounded-md border border-[#D8CFBE] bg-white text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#3C424D] cursor-pointer">
            <input
              type="checkbox"
              checked={interestConsent}
              onChange={(e) => setInterestConsent(e.target.checked)}
              required
            />
            I consent to receive cohort date and availability announcements for this selection.
          </label>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-[#0D1B2A] text-[#FAF7F0] text-sm font-medium hover:bg-[#162A40]"
          >
            Register Interest
          </button>

          {interestMsg && <p className="text-xs text-[#244C3C]">{interestMsg}</p>}
        </form>
      </section>
    </div>
  );
}
