import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface AdminJwtPayload {
  userId?: unknown;
  role?: unknown;
  exp?: unknown;
  nbf?: unknown;
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(paddedBase64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function parsePayload(value: string): AdminJwtPayload | null {
  try {
    const bytes = decodeBase64Url(value);
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json) as AdminJwtPayload;
  } catch {
    return null;
  }
}

async function hasValidAdminToken(token: string, secret: string) {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return false;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedHeader)),
    ) as { alg?: unknown; typ?: unknown };

    if (header.alg !== 'HS256') {
      return false;
    }

    const payload = parsePayload(encodedPayload);

    if (
      !payload ||
      typeof payload.userId !== 'string' ||
      payload.role !== 'ADMIN' ||
      typeof payload.exp !== 'number'
    ) {
      return false;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (
      payload.exp <= currentTimestamp ||
      (typeof payload.nbf === 'number' && payload.nbf > currentTimestamp)
    ) {
      return false;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['verify'],
    );

    return crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );
  } catch {
    return false;
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const secret = process.env.JWT_SECRET;
  const token = request.cookies.get('access_token')?.value;

  if (!secret || !token || !(await hasValidAdminToken(token, secret))) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
