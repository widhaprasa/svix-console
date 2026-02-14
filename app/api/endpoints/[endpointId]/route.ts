import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createUnauthorizedResponse } from '../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ endpointId: string }> }) {
  try {
    // Check authentication and get config
    const authResult = requireAuth(request);
    if (!authResult) {
      return createUnauthorizedResponse();
    }

    const { config } = authResult;
    const { endpointId } = await params;
    
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    
    if (!appId) {
      return NextResponse.json({ error: 'Application Id is required' }, { status: 400 });
    }

    if (!endpointId) {
      return NextResponse.json({ error: 'Endpoint Id is required' }, { status: 400 });
    }

    // Fetch endpoint details
    const endpointUrl = new URL(`/api/v1/app/${appId}/endpoint/${endpointId}`, config.svixApiUrl);
    const endpointResponse = await fetch(endpointUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.svixApiToken}`,
      },
      cache: 'no-store',
    });

    if (!endpointResponse.ok) {
      if (endpointResponse.status === 404) {
        return NextResponse.json({ notFound: true }, { status: 404 });
      }
      throw new Error(`Svix error: ${endpointResponse.statusText}`);
    }

    const endpointData = await endpointResponse.json();

    // Fetch endpoint headers
    let headers = null;

    try {
      const headersUrl = new URL(`/api/v1/app/${appId}/endpoint/${endpointId}/headers`, config.svixApiUrl);
      
      const headersResponse = await fetch(headersUrl.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.svixApiToken}`,
        },
        cache: 'no-store',
      });

      if (headersResponse.ok) {
        headers = await headersResponse.json();
      }
    } catch (headersError) {
      // Headers are optional, don't fail if we can't fetch them
      console.warn('Could not fetch endpoint headers:', headersError);
    }

    return NextResponse.json({
      data: endpointData,
      headers: headers
    });

  } catch (error) {
    console.error('Error in endpoint detail API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch endpoint detail' },
      { status: 500 }
    );
  }
}