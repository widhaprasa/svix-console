import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createUnauthorizedResponse } from '../../../../../lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!appId) {
      return NextResponse.json(
        { error: 'Application Id is required' },
        { status: 400 }
      );
    }

    if (!endpointId) {
      return NextResponse.json(
        { error: 'Endpoint Id is required' },
        { status: 400 }
      );
    }

    // Make request to stats API using svix URL
    const statsUrl = new URL(`/api/v1/app/${appId}/endpoint/${endpointId}/stats`, config.svixApiUrl);
    
    // Add date filters if provided
    if (startDate) {
      statsUrl.searchParams.append('since', startDate);
    }
    
    if (endDate) {
      statsUrl.searchParams.append('until', endDate);
    }
    
    const response = await fetch(statsUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.svixApiToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ notFound: true }, { status: 404 });
      }
      throw new Error(`Svix error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error fetching endpoint stats:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}