# Universe Events API Sandbox

This repository is a working demo that shows how to build a dynamic events site powered by the Universe GraphQL API.

The demo focuses on:
- fetching and rendering event data
- supporting list + detail views efficiently
- handling sold out / waitlist CTA logic
- opening Universe checkout via `embed2.js`
- keeping UX responsive with caching and loading states

## Demo Highlights

- **Homepage event experiences**
  - Hero carousel
  - Grid / list / calendar views
  - Event details modal
- **Universe API integration**
  - OAuth token retrieval via client credentials (server-side)
  - GraphQL list and detail queries
- **Checkout integration**
  - Universe `embed2.js` script
  - `uni-embed` links for checkout handoff
  - visual loading state while checkout iframe mounts
- **Availability behavior**
  - `Get Tickets`
  - `Join Waitlist` when `soldOut && allowWaitlist`
  - disabled `Sold Out` when no waitlist

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- `graphql-request`
- `axios`
- `framer-motion`
- `lucide-react`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with Universe credentials:

```bash
UNIVERSE_CLIENT_ID=your_client_id
UNIVERSE_CLIENT_SECRET=your_client_secret
```

3. Run the app:

```bash
npm run dev
```

4. Open:
- Demo: `http://localhost:3000`

## Core Architecture

### 1. Server route: `/api/universe/events`

File: `src/app/api/universe/events/route.ts`

This route handles both list and detail requests:

- **List mode**: `GET /api/universe/events`
  - optional `hostId` query param
  - optional `timeslotLimit` query param (default `1000`)
  - returns event cards payload + timeslot boundaries
- **Detail mode**: `GET /api/universe/events?eventId=<id>`
  - returns expanded event detail payload for modal

### 2. OAuth handling

- OAuth token is fetched server-side from Universe
- Token is cached in memory until expiration
- Browser never receives client secret

### 3. Caching strategy

- List cache: in-memory, keyed by `hostId:timeslotLimit`, TTL `60s`
- Detail cache: in-memory per event, TTL `5m`
- Client cache:
  - detail response cache in `useRef(Map)`
  - in-flight request dedupe per `eventId`

### 4. UI data flow

1. Homepage fetches list payload (`/api/universe/events`)
2. User opens modal -> app fetches detail payload (`eventId`)
3. Hover/focus on "More Info" prefetches detail opportunistically
4. Ticket CTA opens Universe checkout via `embed2.js`

## Universe Query Shape (Current Demo)

### List query (optimized for view rendering)

Returns:
- identity: `id`, `title`, `url`
- pricing/availability: `minPrice`, `maxPrice`, `ticketsSold`, `soldOut`, `allowWaitlist`, `capacity`, `upcomingTotalCapacity`
- imagery: `coverPhoto`, `eventPhoto`
- timeslots (bounded by `timeslotLimit`): `startAt`, `endAt`

### Detail query (on demand)

Adds:
- rich content: `description`, `accessibilityDescription`
- venue: `address`, `venueName`
- additional media: `additionalImages`
- expanded timeslots for modal display

## Availability + CTA Logic

The demo determines CTA state with:

- `soldOut`
- `allowWaitlist`
- fallback capacity ratio when needed

Behavior:
- Not sold out -> `Get Tickets`
- Sold out + waitlist enabled -> `Join Waitlist`
- Sold out + waitlist disabled -> disabled `Sold Out`

## Checkout Integration

- `embed2.js` is injected client-side on mount:
  - `https://www.universe.com/embed2.js`
- Ticket links use `className="uni-embed"` and event URL
- UI shows CTA loading state immediately on click
- Loading clears when Universe iframe appears (with timeout fallback)

## Key Files

- `src/app/page.tsx` - demo UI, modal flow, availability + checkout UX
- `src/app/api/universe/events/route.ts` - OAuth + GraphQL + caching layer
- `src/app/globals.css` - global styles + brand tokens
- `src/app/layout.tsx` - metadata / favicon

## Notes for Developers

- This repo is intended to be easy to clone and run with valid Universe credentials.
- The demo intentionally separates list and detail fetches for performance.
- If you tune `timeslotLimit`, remember:
  - lower values reduce payload size
  - higher values improve calendar/range completeness for timed-entry events

## Troubleshooting

- **Long modal load times**
  - verify detail route latency and cache behavior
  - verify OAuth token reuse is happening
- **Calendar missing timed-entry dates**
  - increase list `timeslotLimit` if needed
- **Favicon not updating**
  - hard refresh (`Cmd+Shift+R`) due to browser icon caching
