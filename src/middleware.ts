import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

function redirectToForbidden(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return redirectToLogin(request);
    }

    if (request.nextUrl.pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return redirectToForbidden(request);
    }
  } catch (error) {
    console.error('Admin middleware auth configuration error:', error);

    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
