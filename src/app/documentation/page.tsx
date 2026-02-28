'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Database, Gauge, Layers, Sparkles } from 'lucide-react';

type ExampleKey = 'listQuery' | 'detailQuery' | 'ctaLogic';

const examples: Record<ExampleKey, { title: string; description: string; code: string }> = {
  listQuery: {
    title: 'Event List Query',
    description: 'Lightweight host events query for fast page load.',
    code: `query GetEvents($hostId: ID!) {
  host(id: $hostId) {
    events(states: [POSTED]) {
      totalCount
      nodes(limit: 50, offset: 0) {
        id
        title
        url
        minPrice
        maxPrice
        ticketsSold
        soldOut
        allowWaitlist
        capacity
        upcomingTotalCapacity
        coverPhoto { url(width: 800, height: 400) }
        eventPhoto { url(width: 400, height: 400) }
        timeSlots { nodes(limit: 5, offset: 0) { startAt endAt } }
      }
    }
  }
}`,
  },
  detailQuery: {
    title: 'Event Detail Query',
    description: 'On-demand detail fetch when user opens the modal.',
    code: `query GetEventDetail($id: ID!) {
  event(id: $id) {
    id
    title
    url
    description(format: HTML)
    accessibilityDescription(format: HTML)
    minPrice
    maxPrice
    ticketsSold
    soldOut
    allowWaitlist
    capacity
    upcomingTotalCapacity
    address
    venueName
    coverPhoto { url(width: 1200, height: 800) }
    eventPhoto { url(width: 400, height: 400) }
    additionalImages { url(width: 1200, height: 800) }
    timeSlots { nodes(limit: 50, offset: 0) { startAt endAt } }
  }
}`,
  },
  ctaLogic: {
    title: 'Sold Out + Waitlist CTA Logic',
    description: 'Button labels and behavior based on availability flags.',
    code: `const isEventSoldOut = (event) => {
  if (event.soldOut) return true;
  if (!event.capacity) return false;
  return (event.ticketsSold || 0) >= event.capacity;
};

const shouldUseWaitlist = (event) =>
  isEventSoldOut(event) && Boolean(event.allowWaitlist);

const shouldDisableTicketsButton = (event) =>
  isEventSoldOut(event) && !event.allowWaitlist;

const getTicketButtonLabel = (event) => {
  if (shouldUseWaitlist(event)) return 'Join Waitlist';
  if (shouldDisableTicketsButton(event)) return 'Sold Out';
  return 'Get Tickets';
};`,
  },
};

export default function DocumentationPage() {
  const [activeExample, setActiveExample] = useState<ExampleKey>('listQuery');
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#222222]">
      <section className="relative overflow-hidden border-b border-gray-100 bg-linear-to-br from-white via-[#fff8f9] to-[#f7fbff]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#717171] hover:text-[#222222] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Demo
          </a>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight">
            Universe API Integration Docs
          </h1>
          <p className="mt-4 max-w-3xl text-base sm:text-lg text-[#5d5d5d] leading-relaxed">
            This demo site shows how Universe clients can fetch event data from the GraphQL API, render a dynamic event
            experience, and keep checkout behavior aligned with live availability and waitlist rules.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium">
              <Gauge className="h-4 w-4 text-[var(--color-brand)]" />
              Fast List + Lazy Detail
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium">
              <Database className="h-4 w-4 text-[var(--color-brand)]" />
              OAuth + GraphQL
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-[var(--color-brand)]" />
              Waitlist-aware CTA Logic
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: '1) Authenticate', body: 'Request an OAuth access token from Universe using client credentials.' },
            { title: '2) Fetch Events', body: 'Serve a lightweight events list first, then request details per event on demand.' },
            { title: '3) Drive UI', body: 'Use soldOut + allowWaitlist fields to render Get Tickets, Join Waitlist, or Sold Out.' },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-[#666] leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200 bg-gray-50">
            {(Object.keys(examples) as ExampleKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveExample(key)}
                className={`px-5 py-3 text-sm font-semibold transition-colors ${
                  activeExample === key
                    ? 'bg-white text-[#222222] border-r border-l border-gray-200 first:border-l-0'
                    : 'text-[#6b6b6b] hover:text-[#222222]'
                }`}
              >
                {examples[key].title}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{examples[activeExample].title}</h3>
                <p className="mt-1 text-sm text-[#666]">{examples[activeExample].description}</p>
              </div>
              <button
                onClick={() => copyText(activeExample, examples[activeExample].code)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                {copied === activeExample ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied === activeExample ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#111111] p-5 text-sm text-gray-100">
              <code>{examples[activeExample].code}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold inline-flex items-center gap-2">
              <Layers className="h-5 w-5 text-[var(--color-brand)]" />
              API Route Contract
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#555]">
              <li><span className="font-semibold text-[#222]">`GET /api/universe/events`</span>: returns lightweight events list.</li>
              <li><span className="font-semibold text-[#222]">`GET /api/universe/events?eventId=...`</span>: returns full detail payload.</li>
              <li><span className="font-semibold text-[#222]">Server caching</span>: list cache (60s), detail cache per event (5m).</li>
              <li><span className="font-semibold text-[#222]">Client caching</span>: detail payload cache + in-flight request dedupe.</li>
              <li><span className="font-semibold text-[#222]">Checkout UX</span>: CTA loading state until checkout iframe appears.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold">Sold-Out / Waitlist Behavior</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[#555]">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">soldOut</th>
                    <th className="px-3 py-2 text-left font-semibold">allowWaitlist</th>
                    <th className="px-3 py-2 text-left font-semibold">CTA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-mono text-xs">false</td>
                    <td className="px-3 py-2 font-mono text-xs">false/true</td>
                    <td className="px-3 py-2 font-semibold">Get Tickets</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono text-xs">true</td>
                    <td className="px-3 py-2 font-mono text-xs">true</td>
                    <td className="px-3 py-2 font-semibold text-[var(--color-brand)]">Join Waitlist</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono text-xs">true</td>
                    <td className="px-3 py-2 font-mono text-xs">false</td>
                    <td className="px-3 py-2 font-semibold text-gray-500">Sold Out (disabled)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <article className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-bold">Performance Patterns Used in This Demo</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              'Keep list payload narrow and request detail lazily.',
              'Avoid large nested GraphQL nodes in list queries.',
              'Cache list and detail results in server memory.',
              'Prefetch detail on hover/focus to reduce perceived latency.',
              'Deduplicate in-flight detail requests per event.',
              'Show explicit loading states for modal and checkout actions.',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#444]">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
