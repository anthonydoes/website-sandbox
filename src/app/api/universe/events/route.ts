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
              description
              coverPhoto {
                url(width: 1200, height: 800)
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

        const events = (data.host?.events?.nodes || []).map((event: any) => ({
            ...event,
            coverImageUrl: event.coverPhoto?.url || null
        }));

        return NextResponse.json({ events, totalCount: data.host?.events?.totalCount || 0 });
    } catch (error: any) {
        console.error('API Route Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch events from Universe', details: error.message },
            { status: 500 }
        );
    }
}
