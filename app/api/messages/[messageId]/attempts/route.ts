import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createUnauthorizedResponse } from '../../../../../lib/auth';

interface MessageAttemptsRouteContext {
  params: Promise<{
    messageId: string;
  }>;
}

export async function GET(request: NextRequest, context: MessageAttemptsRouteContext) {
  try {
    // Check authentication and get config
    const authResult = requireAuth(request);
    if (!authResult) {
      return createUnauthorizedResponse();
    }

    const { config } = authResult;
    
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
    const url = new URL(`/api/v1/app/${appId}/attempt/msg/${messageId}`, config.svixApiUrl);
    url.searchParams.append('limit', limit);
    
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