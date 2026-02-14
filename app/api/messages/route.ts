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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const iterator = searchParams.get('iterator');
    const limit = searchParams.get('limit') || '50';
    
    if (!appId) {
      return NextResponse.json({ error: 'Application Id is required' }, { status: 400 });
    }

    const url = new URL(`/api/v1/app/${appId}/msg`, config.svixApiUrl);
    url.searchParams.append('limit', limit);
    
    if (iterator) {
      url.searchParams.append('iterator', iterator);
    }
    
    if (startDate) {
      url.searchParams.append('after', new Date(startDate).toISOString());
    }
    
    if (endDate) {
      url.searchParams.append('before', new Date(endDate).toISOString());
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

    return NextResponse.json({
      data: data.data || [],
      iterator: data.iterator,
      done: data.done,
      count: data.count || 0
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ 
      data: [], 
      iterator: null, 
      done: true, 
      count: 0,
      error: 'Failed to fetch messages' 
    }, { status: 500 });
  }
}