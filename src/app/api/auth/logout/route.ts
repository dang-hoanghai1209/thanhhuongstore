import { NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME, hashRefreshToken } from '@/lib/auth-session';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: {
        token: hashRefreshToken(refreshToken),
      },
    });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/api/auth',
    maxAge: 0,
  });

  return response;
}
