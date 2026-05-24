import { NextRequest, NextResponse } from 'next/server';

/**
 * API key auth middleware.
 *
 * When API_KEY env var is set, all /api/* requests (except public ones)
 * must include header: Authorization: Bearer <API_KEY>
 *
 * When API_KEY is empty or unset, auth is disabled (backward compatible).
 */

const PUBLIC_PATHS = ['/api/templates'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /api routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Public endpoints don't need auth
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // No key configured — auth disabled (dev mode)
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Unauthorized — missing Authorization header' },
      { status: 401 },
    );
  }

  // Support "Bearer <key>" and raw key
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (token !== apiKey) {
    return NextResponse.json(
      { error: 'Unauthorized — invalid API key' },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
