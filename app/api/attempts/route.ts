import { NextRequest, NextResponse } from 'next/server';

const SVIX_API_URL = process.env.SVIX_API_URL;
const SVIX_API_TOKEN = process.env.SVIX_API_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const endpointId = searchParams.get('endpointId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '25';
    const iterator = searchParams.get('iterator');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!appId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    if (!endpointId) {
      return NextResponse.json(
        { error: 'Endpoint ID is required' },
        { status: 400 }
      );
    }

    // Build the API URL
    const apiUrl = new URL(`/api/v1/app/${appId}/attempt/endpoint/${endpointId}`, SVIX_API_URL!);

    // Build query parameters for the external API
    if (iterator) {
      apiUrl.searchParams.append('iterator', iterator);
    }

    apiUrl.searchParams.append('limit', limit);

    // Add status filtering if specified
    if (status === 'success') {
      apiUrl.searchParams.append('status', '0'); // Success status code
    } else if (status === 'failed') {
      apiUrl.searchParams.append('status', '2'); // Failed status code
    }
    
    // Add date filtering if specified
    if (startDate) {
      apiUrl.searchParams.append('after', new Date(startDate).toISOString());
    }
    
    if (endDate) {
      apiUrl.searchParams.append('before', new Date(endDate).toISOString());
    }

    // Make the actual API call
    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SVIX_API_TOKEN}`,
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    
    // Transform the response to match our expected format if needed
    const response = {
      data: data.data || data || [],
      iterator: data.iterator || null,
      done: data.done !== undefined ? data.done : true,
      count: data.count || (data.data ? data.data.length : Array.isArray(data) ? data.length : 0)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching attempts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}