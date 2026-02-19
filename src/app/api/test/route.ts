import { NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';
import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.post('https://www.universe.com/oauth/token', {
      grant_type: 'client_credentials',
      client_id: process.env.UNIVERSE_CLIENT_ID,
      client_secret: process.env.UNIVERSE_CLIENT_SECRET,
    });

    const token = response.data.access_token || '';

    const client = new GraphQLClient('https://www.universe.com/graphql', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const query = gql`
            query GetEvents($hostId: ID!) {
              host(id: $hostId) {
                events(states: [POSTED]) {
                  nodes(limit: 5) {
                    title
                    firstTimeSlot: timeSlots(first: 1) {
                      nodes {
                        startAt
                        endAt
                      }
                    }
                    lastTimeSlot: timeSlots(last: 1) {
                      nodes {
                        startAt
                        endAt
                      }
                    }
                    timeSlots {
                        totalCount
                    }
                  }
                }
              }
            }
        `;

    const variables = { hostId: "63ea8385a8d65900205da7a4" };
    const data: any = await client.request(query, variables);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, details: error.response?.errors || error.response?.data }, { status: 500 });
  }
}
