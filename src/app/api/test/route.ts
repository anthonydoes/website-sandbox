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
            query IntrospectEventsOrder {
              __type(name: "Host") {
                fields {
                  name
                  args {
                    name
                    type {
                      name
                      kind
                      ofType {
                        name
                        kind
                      }
                    }
                  }
                }
              }
            }
        `;

    const data: any = await client.request(query);
    // Find the "events" field and its arguments
    const hostFields = data.__type.fields;
    const eventsField = hostFields.find((f: any) => f.name === 'events');

    return NextResponse.json({
      eventsArgs: eventsField?.args
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
