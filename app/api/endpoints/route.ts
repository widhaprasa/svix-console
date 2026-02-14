import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createUnauthorizedResponse } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and get config
    const authResult = requireAuth(request);
    if (!authResult) {
      return createUnauthorizedResponse();
    }

    const { config } = authResult;
    
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    
    if (!appId) {
      return NextResponse.json({ error: 'Application Id is required' }, { status: 400 });
    }

    const allEndpoints: any[] = [];
    let iterator: string | undefined;
    let done = false;

    while (!done) {
      const url = new URL(`/api/v1/app/${appId}/endpoint`, config.svixApiUrl);
      url.searchParams.append('limit', '250');
      
      if (iterator) {
        url.searchParams.append('iterator', iterator);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.svixApiToken}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Svix error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        allEndpoints.push(...data.data);
      }

      done = data.done === true;
      iterator = data.iterator;
    }

    return NextResponse.json(allEndpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return NextResponse.json([], { status: 500 });
  }
}