import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Try to get country code from Vercel's edge headers
  const country = request.headers.get('x-vercel-ip-country') || request.geo?.country || 'US';

  // Clone headers and add our custom header so it can be read by server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-country', country);

  // You can also rewrite or redirect based on country here if needed

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
