import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createUnauthorizedResponse } from '../../../../../lib/auth';

export async function POST(
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
    
    const body = await request.json();
    const { appId, since, until } = body;
    
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

    // Build the bulk resend URL
    const resendUrl = new URL(`/api/v1/app/${appId}/endpoint/${endpointId}/bulk-resend`, config.svixApiUrl);
    
    // Add date filters if provided
    if (since) {
      resendUrl.searchParams.append('since', since);
    }
    
    if (until) {
      resendUrl.searchParams.append('until', until);
    }

    const response = await fetch(resendUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.svixApiToken}`,
        'Content-Type': 'application/json',
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
    console.error('Error bulk resending failed attempts:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}