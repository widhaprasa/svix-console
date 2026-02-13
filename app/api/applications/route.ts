import { NextResponse } from 'next/server';

const SVIX_API_URL = process.env.SVIX_API_URL;
const SVIX_API_TOKEN = process.env.SVIX_API_TOKEN;

export async function GET() {
  try {
    const allApplications: any[] = [];
    let iterator: string | undefined;
    let done = false;

    while (!done) {
      const url = new URL('/api/v1/app', SVIX_API_URL!);
      url.searchParams.append('limit', '250');
      
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
        throw new Error(`Svix error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add current page's data to our collection
      if (data.data && Array.isArray(data.data)) {
        allApplications.push(...data.data);
      }

      // Update pagination state
      done = data.done === true;
      iterator = data.iterator;
    }

    return NextResponse.json(allApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json([], { status: 500 });
  }
}