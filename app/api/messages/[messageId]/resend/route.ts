import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createUnauthorizedResponse } from '../../../../../lib/auth';

interface ResendRouteContext {
  params: Promise<{
    messageId: string;
  }>;
}

export async function POST(request: NextRequest, context: ResendRouteContext) {
  try {
    // Check authentication and get config
    const authResult = requireAuth(request);
    if (!authResult) {
      return createUnauthorizedResponse();
    }

    const { config } = authResult;
    
    const { messageId } = await context.params;
    const body = await request.json();
    const { appId, endpointId } = body;
    
    if (!appId) {
      return NextResponse.json({ error: 'Application Id is required' }, { status: 400 });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message Id is required' }, { status: 400 });
    }

    if (!endpointId) {
      return NextResponse.json({ error: 'Endpoint Id is required' }, { status: 400 });
    }

    // Call Svix API to resend the message to specific endpoint
    const resendUrl = `${config.svixApiUrl}/api/v1/app/${appId}/msg/${messageId}/endpoint/${endpointId}/resend`;
    const resendResponse = await fetch(resendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.svixApiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resendResponse.ok) {
      if (resendResponse.status === 404) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }
      if (resendResponse.status === 400) {
        const errorData = await resendResponse.json();
        return NextResponse.json({ error: errorData.detail || 'Bad request' }, { status: 400 });
      }
      throw new Error(`Svix API error: ${resendResponse.statusText}`);
    }
    
    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error('Error resending message:', error);
    return NextResponse.json(
      { error: 'Failed to resend message' }, 
      { status: 500 }
    );
  }
}