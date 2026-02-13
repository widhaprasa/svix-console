import { NextResponse } from 'next/server';

const SVIX_API_URL = process.env.SVIX_API_URL;
const SVIX_API_TOKEN = process.env.SVIX_API_TOKEN;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const iterator = searchParams.get('iterator');
    const limit = searchParams.get('limit') || '50';
    
    if (!appId) {
      return NextResponse.json({ error: 'Application Id is required' }, { status: 400 });
    }

    const url = new URL(`/api/v1/app/${appId}/msg`, SVIX_API_URL!);
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
        'Authorization': `Bearer ${SVIX_API_TOKEN}`,
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