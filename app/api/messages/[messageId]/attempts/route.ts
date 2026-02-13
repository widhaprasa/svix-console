import { NextResponse } from 'next/server';

const SVIX_API_URL = process.env.SVIX_API_URL;
const SVIX_API_TOKEN = process.env.SVIX_API_TOKEN;

interface MessageAttemptsRouteContext {
  params: Promise<{
    messageId: string;
  }>;
}

export async function GET(request: Request, context: MessageAttemptsRouteContext) {
  try {
    const { messageId } = await context.params;
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const iterator = searchParams.get('iterator');
    const limit = searchParams.get('limit') || '10';
    
    if (!appId) {
      return NextResponse.json({ error: 'Application Id is required' }, { status: 400 });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message Id is required' }, { status: 400 });
    }

    // Fetch message attempts
    const url = new URL(`/api/v1/app/${appId}/attempt/msg/${messageId}`, SVIX_API_URL!);
    url.searchParams.append('limit', limit);
    
    if (iterator) {
      url.searchParams.append('iterator', iterator);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SVIX_API_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Message or attempts not found' }, { status: 404 });
      }
      throw new Error(`Svix API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      data: data.data || [],
      iterator: data.iterator,
      done: data.done,
      count: data.count || 0
    });

  } catch (error) {
    console.error('Error fetching message attempts:', error);
    return NextResponse.json({ 
      data: [],
      iterator: null,
      done: true,
      count: 0,
      error: 'Failed to fetch message attempts' 
    }, { status: 500 });
  }
}