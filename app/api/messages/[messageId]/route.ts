import { NextResponse } from 'next/server';

const SVIX_API_URL = process.env.SVIX_API_URL;
const SVIX_API_TOKEN = process.env.SVIX_API_TOKEN;

interface MessageDetailRouteContext {
  params: Promise<{
    messageId: string;
  }>;
}

export async function GET(request: Request, context: MessageDetailRouteContext) {
  try {
    const { messageId } = await context.params;
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    
    if (!appId) {
      return NextResponse.json({ error: 'Application Id is required' }, { status: 400 });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message Id is required' }, { status: 400 });
    }

    // Fetch message details
    const messageUrl = `${SVIX_API_URL}/api/v1/app/${appId}/msg/${messageId}`;
    const messageResponse = await fetch(messageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SVIX_API_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (!messageResponse.ok) {
      if (messageResponse.status === 404) {
        return NextResponse.json({ 
          data: null, 
          attempts: [], 
          notFound: true,
          message: 'Message not found' 
        }, { status: 200 });
      }
      throw new Error(`Svix API error: ${messageResponse.statusText}`);
    }

    const messageData = await messageResponse.json();

    // Fetch message attempts
    const attemptsUrl = `${SVIX_API_URL}/api/v1/app/${appId}/attempt/msg/${messageId}`;
    const attemptsResponse = await fetch(attemptsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SVIX_API_TOKEN}`,
      },
      cache: 'no-store',
    });

    let attemptsData = [];
    if (attemptsResponse.ok) {
      const attempts = await attemptsResponse.json();
      attemptsData = attempts.data || [];
    }

    return NextResponse.json({
      data: messageData,
      attempts: attemptsData,
    });

  } catch (error) {
    console.error('Error fetching message detail:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch message details' 
    }, { status: 500 });
  }
}