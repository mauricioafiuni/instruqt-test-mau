import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  // Get the host header to determine the origin
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  
  // Return the API proxy URL
  // Frontend will make requests to /api/proxy/<endpoint>
  // which this route handler will forward to http://api:8080/<endpoint>
  const apiUrl = `${protocol}://${host}/api/proxy`;
  
  return NextResponse.json({
    apiUrl: apiUrl
  });
}
