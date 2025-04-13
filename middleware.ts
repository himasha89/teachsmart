// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /dashboard/home)
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/signin';

  // Get the token from the cookies
  const token = request.cookies.get('user-token')?.value || '';

  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to signin page if trying to access protected route without token
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (token && isPublicPath) {
    // Redirect to home page if trying to access signin page with token
    return NextResponse.redirect(new URL('/dashboard/home', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/signin'
  ],
};