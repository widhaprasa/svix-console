import { NextResponse } from 'next/server';

const SVIX_API_URL = process.env.SVIX_API_URL;
const SVIX_API_TOKEN = process.env.SVIX_API_TOKEN;

interface ResendRouteContext {
  params: Promise<{
    messageId: string;
  }>;
}

export async function POST(request: Request, context: ResendRouteContext) {
  try {
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
    const resendUrl = `${SVIX_API_URL}/api/v1/app/${appId}/msg/${messageId}/endpoint/${endpointId}/resend`;
    const resendResponse = await fetch(resendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SVIX_API_TOKEN}`,
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