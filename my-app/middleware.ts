import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() || '0.0.0.0';
  const headers = new Headers(req.headers);
  headers.set('x-user-ip', ip);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/api/notes/:path*', '/admin'] };
