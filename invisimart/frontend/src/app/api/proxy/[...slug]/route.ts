import { NextRequest, NextResponse } from 'next/server';

// This API route proxies requests to the backend API
// Allows the browser to access the backend without needing direct port 8080 access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  
  // Forward query parameters from the original request
  const searchParams = request.nextUrl.searchParams.toString();
  const apiUrl = `http://api:8080/${path}${searchParams ? `?${searchParams}` : ''}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check content type to determine how to parse the response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      // Handle plain text responses
      const text = await response.text();
      return NextResponse.json(
        { error: text },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from API' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  const apiUrl = `http://api:8080/${path}`;
  const body = await request.json();
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Check content type to determine how to parse the response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      // Handle plain text responses
      const text = await response.text();
      return NextResponse.json(
        { error: text },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to post to API' },
      { status: 500 }
    );
  }
}
