import { NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';
import axios from 'axios';

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

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

export async function GET() {
  try {
    const token = await getAccessToken();

    const client = new GraphQLClient('https://www.universe.com/graphql', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const query = gql`
      query GetEvents($hostId: ID!) {
        host(id: $hostId) {
          events(states: [POSTED]) {
            totalCount
              nodes(limit: 50, offset: 0) {
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
                capacity
                upcomingTotalCapacity
                timeSlots {
                  nodes(limit: 1000, offset: 0) {
                    startAt
                    endAt
                    capacity
                    attendees {
                      totalCount
                    }
                  }
                }
              }
          }
        }
      }
    `;

    // Using the host ID provided in the requirements
    const variables = { hostId: "63ea8385a8d65900205da7a4" };

    console.log('Fetching events from Universe...');
    const data: any = await client.request(query, variables);

    const events = (data.host?.events?.nodes || []).map((event: any) => {
      // Calculate capacity and tickets sold
      // Fallback logic for timed entry events where top-level capacity might be null
      let aggregatedCapacity = event.capacity || event.upcomingTotalCapacity || 0;
      let aggregatedSold = event.ticketsSold || 0;

      // If top-level capacity is 0/null but there are timeslots, try to aggregate
      if ((!aggregatedCapacity || aggregatedCapacity === 0) && event.timeSlots?.nodes?.length > 0) {
        aggregatedCapacity = event.timeSlots.nodes.reduce((sum: number, ts: any) => sum + (ts.capacity || 0), 0);
        aggregatedSold = event.timeSlots.nodes.reduce((sum: number, ts: any) => sum + (ts.attendees?.totalCount || 0), 0);
      }

      return {
        ...event,
        capacity: aggregatedCapacity,
        ticketsSold: aggregatedSold,
        coverImageUrl: event.coverPhoto?.url || null,
        eventPhotoUrl: event.eventPhoto?.url || null,
        additionalImages: (event.additionalImages || []).map((img: any) => img.url),
        timeSlots: event.timeSlots?.nodes || []
      };
    });

    // Sort events chronologically by their earliest timeslot start time
    events.sort((a: any, b: any) => {
      const getEarliestStart = (item: any) => {
        if (!item.timeSlots || item.timeSlots.length === 0) return Infinity;
        const starts = item.timeSlots.map((ts: any) => new Date(ts.startAt).getTime());
        return Math.min(...starts);
      };

      return getEarliestStart(a) - getEarliestStart(b);
    });

    return NextResponse.json({ events, totalCount: data.host?.events?.totalCount || 0 });
  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch events from Universe', details: error.message },
      { status: 500 }
    );
  }
}
