'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Code2, Copy, Database, Gauge, Layers, ShieldCheck, Sparkles, Ticket } from 'lucide-react';

type ExampleKey = 'authFlow' | 'listQuery' | 'detailQuery' | 'embedCheckout' | 'ctaLogic';

const examples: Record<ExampleKey, { title: string; description: string; code: string }> = {
  authFlow: {
    title: 'OAuth Token Lifecycle',
    description: 'Server-side token management using client credentials.',
    code: `let accessToken = null;
let tokenExpiration = null;

async function getAccessToken() {
  if (accessToken && tokenExpiration && tokenExpiration > Date.now()) {
    return accessToken; // Reuse in-memory token
  }

  const response = await axios.post('https://www.universe.com/oauth/token', {
    grant_type: 'client_credentials',
    client_id: process.env.UNIVERSE_CLIENT_ID,
    client_secret: process.env.UNIVERSE_CLIENT_SECRET,
  });

  accessToken = response.data.access_token;
  tokenExpiration = Date.now() + response.data.expires_in * 1000;
  return accessToken;
}`,
  },
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
  embedCheckout: {
    title: 'embed2 Checkout Lifecycle',
    description: 'How the checkout widget is loaded and how CTA loading is managed.',
    code: `// 1) Inject Universe embed script once client mounts
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://www.universe.com/embed2.js';
  script.async = true;
  document.body.appendChild(script);
  return () => document.body.removeChild(script);
}, []);

// 2) On CTA click, show loading state immediately
const handleTicketClick = (eventId) => {
  setCheckoutLoadingEventId(eventId);
  checkoutTimeoutRef.current = window.setTimeout(() => {
    setCheckoutLoadingEventId(null); // fallback
  }, 7000);
};

// 3) Clear loading when Universe iframe appears
useEffect(() => {
  const observer = new MutationObserver(() => {
    const iframe = document.querySelector('iframe[src*="universe.com"]');
    if (iframe) setCheckoutLoadingEventId(null);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}, []);`,
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
  const [activeExample, setActiveExample] = useState<ExampleKey>('authFlow');
  const [copied, setCopied] = useState<string | null>(null);
  const [hostIdInput, setHostIdInput] = useState('63ea8385a8d65900205da7a4');
  const [requestUrl, setRequestUrl] = useState('/api/universe/events?hostId=63ea8385a8d65900205da7a4');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestResult, setRequestResult] = useState<unknown>(null);

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  };

  const runHostRequest = async () => {
    const trimmedHostId = hostIdInput.trim();
    if (!trimmedHostId) {
      setRequestError('Host ID is required.');
      setRequestResult(null);
      return;
    }

    const url = `/api/universe/events?hostId=${encodeURIComponent(trimmedHostId)}`;
    setRequestUrl(url);
    setRequestError(null);
    setRequestLoading(true);

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch events');
      }
      setRequestResult(data);
    } catch (error) {
      setRequestResult(null);
      setRequestError(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setRequestLoading(false);
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
            Universe API - Events Integration Docs
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
            { title: '1) Authenticate', body: 'Server route requests and caches a Universe OAuth access token (client credentials).' },
            { title: '2) Fetch Events', body: 'Render fast with lightweight list data, then lazily fetch event details by eventId.' },
            { title: '3) Open Checkout', body: 'Load embed2.js once, trigger checkout via uni-embed links, and show loading until iframe appears.' },
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
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-xl font-bold">Start with Universe Developer Docs</h3>
            <p className="mt-1 text-sm text-[#666]">
              Before integrating, set up your OAuth app and validate queries in the Universe tooling.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-[#444] leading-relaxed">
                1. Visit the Universe developer documentation:
                {' '}
                <a
                  href="https://developers.universe.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--color-brand)] underline hover:text-[var(--color-brand-hover)]"
                >
                  https://developers.universe.com/
                </a>
              </p>
              <p className="mt-2 text-sm text-[#444] leading-relaxed">
                2. Create an OAuth application to begin working with the API. Universe supports both
                {' '}
                <span className="font-semibold">Authorization Code Grant</span>
                {' '}
                and
                {' '}
                <span className="font-semibold">Client Credentials Grant</span>
                {' '}
                flows.
              </p>
              <p className="mt-2 text-sm text-[#444] leading-relaxed">
                3. Use the
                {' '}
                <a
                  href="https://www.universe.com/graphiql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--color-brand)] underline hover:text-[var(--color-brand-hover)]"
                >
                  Universe GraphQL Explorer
                </a>
                {' '}
                to test queries and inspect schema docs in the built-in
                GraphQL documentation explorer.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-base font-bold">Get Your Viewer ID</h4>
                <button
                  onClick={() => copyText('viewer-id-query', `query {\n  viewer {\n      id\n      firstName\n      lastName\n    }\n}`)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  {copied === 'viewer-id-query' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied === 'viewer-id-query' ? 'Copied Query' : 'Copy Query'}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#111111] p-4 text-xs sm:text-sm text-gray-100">
                <code>{`query {
  viewer {
      id
      firstName
      lastName
    }
}`}</code>
              </pre>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-base font-bold">If you are not the account holder, but you have been set up as a team member of the account with appropriate permissions, you can use the following query to see which accounts you have access to:</h4>
                <button
                  onClick={() => copyText('memberships-query', `query {\n  viewer {\n    id\n    memberships {\n      nodes {\n        id\n        owner {\n          id\n          name\n        }\n      }\n    }\n  }\n}`)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  {copied === 'memberships-query' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied === 'memberships-query' ? 'Copied Query' : 'Copy Query'}
                </button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#111111] p-4 text-xs sm:text-sm text-gray-100">
                <code>{`query {
  viewer {
    id
    memberships {
      nodes {
        id
        owner {
          id
          name
        }
      }
    }
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold inline-flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--color-brand)]" />
              Authentication Deep Dive
            </h3>
            <p className="mt-3 text-sm text-[#555] leading-relaxed">
              All Universe auth happens server-side in <code>/api/universe/events</code>. The browser never receives your
              client secret. The route reuses the current token until it expires, then refreshes automatically.
            </p>
            <div className="mt-4 space-y-2 text-sm text-[#444]">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">1. Read <code>UNIVERSE_CLIENT_ID</code> and <code>UNIVERSE_CLIENT_SECRET</code> from env.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">2. Call <code>POST https://www.universe.com/oauth/token</code> with <code>grant_type=client_credentials</code>.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">3. Cache <code>access_token</code> in memory until <code>expires_in</code> elapses.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">4. Use <code>Authorization: Bearer ...</code> header for Universe GraphQL requests.</div>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold inline-flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[var(--color-brand)]" />
              embed2 Checkout Deep Dive
            </h3>
            <p className="mt-3 text-sm text-[#555] leading-relaxed">
              Checkout is opened by Universe <code>embed2.js</code> using anchor elements with <code>uni-embed</code> and the
              event URL. This demo adds a resilient loading state to bridge the delay between click and iframe mount.
            </p>
            <div className="mt-4 space-y-2 text-sm text-[#444]">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">1. On page mount, append <code>https://www.universe.com/embed2.js</code> to <code>document.body</code>.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">2. On CTA click, set <code>checkoutLoadingEventId</code> to show spinner and disabled repeat click behavior.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">3. A <code>MutationObserver</code> watches DOM for Universe iframe insertion and clears loading.</div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">4. A 7-second timeout fallback clears loading if iframe detection is delayed/missed.</div>
            </div>
          </article>
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

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-xl font-bold">Try This Request</h3>
            <p className="mt-1 text-sm text-[#666]">
              Enter a Universe host ID to fetch a live event list response from this demo API route.
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={hostIdInput}
                onChange={(e) => setHostIdInput(e.target.value)}
                placeholder="Universe host ID"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-mono focus:border-[var(--color-brand)] focus:outline-none"
              />
              <button
                onClick={runHostRequest}
                disabled={requestLoading}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {requestLoading ? 'Fetching...' : 'Run Request'}
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#777]">Request URL</p>
              <code className="mt-1 block text-sm text-[#222]">{requestUrl}</code>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => copyText('request-url', requestUrl)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                {copied === 'request-url' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied === 'request-url' ? 'Copied URL' : 'Copy URL'}
              </button>
              {requestResult && (
                <button
                  onClick={() => copyText('request-json', JSON.stringify(requestResult, null, 2))}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  {copied === 'request-json' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied === 'request-json' ? 'Copied JSON' : 'Copy JSON'}
                </button>
              )}
            </div>

            {requestError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {requestError}
              </div>
            )}

            {requestResult && (
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#111111] p-5 text-xs sm:text-sm text-gray-100">
                <code>{JSON.stringify(requestResult, null, 2)}</code>
              </pre>
            )}
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
              <li><span className="font-semibold text-[#222]">`GET /api/universe/events?hostId=...`</span>: list request for any host (used by the Try Request widget).</li>
              <li><span className="font-semibold text-[#222]">`GET /api/universe/events?eventId=...`</span>: returns full detail payload.</li>
              <li><span className="font-semibold text-[#222]">Server caching</span>: list cache (60s), detail cache per event (5m).</li>
              <li><span className="font-semibold text-[#222]">Client caching</span>: detail payload cache + in-flight request dedupe.</li>
              <li><span className="font-semibold text-[#222]">Checkout UX</span>: CTA loading state until checkout iframe appears.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold inline-flex items-center gap-2">
              <Ticket className="h-5 w-5 text-[var(--color-brand)]" />
              Sold-Out / Waitlist Behavior
            </h3>
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
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[
              {
                title: '1) Lightweight List + Lazy Detail',
                summary: 'Load fast by fetching only list fields first, then request full detail on modal open.',
                example: `// list
GET /api/universe/events

// detail on demand
GET /api/universe/events?eventId=<id>`,
              },
              {
                title: '2) Limit Nested GraphQL Nodes',
                summary: 'Avoid expensive deep/nested fields in broad list calls.',
                example: `# list query
timeSlots {
  nodes(limit: 5, offset: 0) { startAt endAt }
}

# detail query (still bounded)
nodes(limit: 50, offset: 0)`,
              },
              {
                title: '3) Server-Side Caching',
                summary: 'Reduce upstream latency and repeated API load.',
                example: `const CACHE_DURATION = 60 * 1000;
const DETAIL_CACHE_DURATION = 5 * 60 * 1000;
cachedEventsListsByHost.set(hostId, { data, timestamp: Date.now() });`,
              },
              {
                title: '4) Client Prefetch on Intent',
                summary: 'Prefetch event detail when users hover/focus the CTA.',
                example: `<button
  onMouseEnter={() => prefetchEventDetails(event)}
  onFocus={() => prefetchEventDetails(event)}
/>`,
              },
              {
                title: '5) In-Flight Request Deduping',
                summary: 'Prevent duplicate detail requests for the same event during rapid interactions.',
                example: `const pending = inFlightDetailRequestsRef.current.get(eventId);
if (pending) return pending;

inFlightDetailRequestsRef.current.set(eventId, requestPromise);`,
              },
              {
                title: '6) Explicit Loading UX',
                summary: 'Show progress immediately for modal fetches and checkout open delays.',
                example: `setIsDetailLoading(true);
setCheckoutLoadingEventId(event.id);

// clear when Universe iframe appears
querySelector('iframe[src*="universe.com"]')`,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-bold text-[#222222]">{item.title}</h4>
                <p className="mt-2 text-sm text-[#444]">{item.summary}</p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-[#111111] p-3 text-xs text-gray-100">
                  <code>{item.example}</code>
                </pre>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
