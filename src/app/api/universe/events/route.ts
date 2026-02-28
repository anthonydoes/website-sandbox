import { NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';
import axios from 'axios';

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

// Simple in-memory cache for events lists, keyed by host
const cachedEventsListsByHost = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 60 seconds
const DETAIL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cachedEventDetails = new Map<string, { data: any; timestamp: number }>();

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiration && tokenExpiration > Date.now()) {
    console.log('Reusing cached access token.');
    return accessToken;
  }

  console.log('Fetching new access token...');
  try {
    const response = await axios.post('https://www.universe.com/oauth/token', {
      grant_type: 'client_credentials',
      client_id: process.env.UNIVERSE_CLIENT_ID,
      client_secret: process.env.UNIVERSE_CLIENT_SECRET,
    });

    accessToken = response.data.access_token || '';
    tokenExpiration = Date.now() + response.data.expires_in * 1000;
    console.log('New access token obtained');
    return accessToken as string;
  } catch (error: any) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw new Error('Failed to fetch access token');
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hostId = searchParams.get('hostId') || "63ea8385a8d65900205da7a4";
  const eventId = searchParams.get('eventId');
  const requestedTimeslotLimit = Number(searchParams.get('timeslotLimit'));
  const listTimeslotLimit = Number.isFinite(requestedTimeslotLimit) && requestedTimeslotLimit > 0
    ? Math.min(Math.floor(requestedTimeslotLimit), 1000)
    : 1000;

  try {
    const token = await getAccessToken();

    const client = new GraphQLClient('https://www.universe.com/graphql', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // 1. Handle Detail View
    if (eventId) {
      const cachedDetail = cachedEventDetails.get(eventId);
      if (cachedDetail && (Date.now() - cachedDetail.timestamp < DETAIL_CACHE_DURATION)) {
        console.log(`Returning cached detail for event: ${eventId}`);
        return NextResponse.json(cachedDetail.data);
      }

      console.log(`Fetching detail for event: ${eventId}`);
      const detailQuery = gql`
        query GetEventDetail($id: ID!) {
          event(id: $id) {
            id
            title
            url
            description(format: HTML)
            ageLimit
            accessibilityDescription(format: HTML)
            eventPhoto {
              url(width: 400, height: 400)
            }
            additionalImages {
              url(width: 1200, height: 800)
            }
            coverPhoto {
              url(width: 1200, height: 800)
            }
            minPrice
            maxPrice
            ticketsSold
            soldOut
            allowWaitlist
            capacity
            upcomingTotalCapacity
            address
            venueName
            timeSlots {
              nodes(limit: 50, offset: 0) {
                startAt
                endAt
              }
            }
          }
        }
      `;

      const detailData: any = await client.request(detailQuery, { id: eventId });
      const event = detailData.event;

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      const detailResponse = {
        ...event,
        capacity: event.capacity || event.upcomingTotalCapacity || 0,
        ticketsSold: event.ticketsSold || 0,
        soldOut: Boolean(event.soldOut),
        allowWaitlist: Boolean(event.allowWaitlist),
        coverImageUrl: event.coverPhoto?.url || null,
        eventPhotoUrl: event.eventPhoto?.url || null,
        additionalImages: (event.additionalImages || []).map((img: any) => img.url),
        timeSlots: event.timeSlots?.nodes || []
      };

      cachedEventDetails.set(eventId, { data: detailResponse, timestamp: Date.now() });
      return NextResponse.json(detailResponse);
    }

    // 2. Handle List View (with caching)
    const listCacheKey = `${hostId}:${listTimeslotLimit}`;
    const cachedEventsList = cachedEventsListsByHost.get(listCacheKey);
    if (cachedEventsList && (Date.now() - cachedEventsList.timestamp < CACHE_DURATION)) {
      console.log('Returning cached events list');
      return NextResponse.json(cachedEventsList.data);
    }

    const listQuery = gql`
      query GetEvents($hostId: ID!) {
        host(id: $hostId) {
          events(states: [POSTED]) {
            totalCount
            nodes(limit: 50, offset: 0) {
              id
              title
              url
              ageLimit
              eventPhoto {
                url(width: 400, height: 400)
              }
              coverPhoto {
                url(width: 800, height: 400)
              }
              minPrice
              maxPrice
              ticketsSold
              soldOut
              allowWaitlist
              capacity
              upcomingTotalCapacity
              timeSlots {
                nodes(limit: ${listTimeslotLimit}, offset: 0) {
                  startAt
                  endAt
                }
              }
            }
          }
        }
      }
    `;

    console.log('Fetching lightweight events list from Universe...');
    const data: any = await client.request(listQuery, { hostId });

    const events = (data.host?.events?.nodes || []).map((event: any) => {
      const aggregatedCapacity = event.capacity || event.upcomingTotalCapacity || 0;
      const aggregatedSold = event.ticketsSold || 0;

      // We return all timeslot date boundaries (start/end only) so:
      // 1) timed-entry date ranges render correctly in cards
      // 2) calendar view can place events on all matching days
      // We intentionally avoid attendees/capacity-per-slot to keep this lightweight.

      return {
        ...event,
        capacity: aggregatedCapacity,
        ticketsSold: aggregatedSold,
        soldOut: Boolean(event.soldOut),
        allowWaitlist: Boolean(event.allowWaitlist),
        coverImageUrl: event.coverPhoto?.url || null,
        eventPhotoUrl: event.eventPhoto?.url || null,
        timeSlots: event.timeSlots?.nodes || []
      };
    });

    // Sort events chronologically
    events.sort((a: any, b: any) => {
      const getEarliestStart = (item: any) => {
        if (!item.timeSlots || item.timeSlots.length === 0) return Infinity;
        const starts = item.timeSlots.map((ts: any) => new Date(ts.startAt).getTime());
        return Math.min(...starts);
      };
      return getEarliestStart(a) - getEarliestStart(b);
    });

    const responseData = { events, totalCount: data.host?.events?.totalCount || 0 };
    cachedEventsListsByHost.set(listCacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch events from Universe', details: error.message },
      { status: 500 }
    );
  }
}
