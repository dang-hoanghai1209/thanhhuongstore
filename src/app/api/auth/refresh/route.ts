import { NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  getRefreshTokenExpiration,
  hashRefreshToken,
  refreshTokenCookieOptions,
} from '@/lib/auth-session';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: unknown };
    const tokenFromBody = typeof body.refreshToken === 'string' ? body.refreshToken : null;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? tokenFromBody;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token is required.' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json({ message: 'Refresh token is invalid or expired.' }, { status: 401 });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashRefreshToken(refreshToken) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.userId !== payload.userId ||
      storedToken.expiresAt <= new Date() ||
      !storedToken.user.isActive
    ) {
      return NextResponse.json({ message: 'Refresh token is invalid or expired.' }, { status: 401 });
    }

    const accessToken = generateAccessToken(storedToken.user);
    const nextRefreshToken = generateRefreshToken(storedToken.user);

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: storedToken.id },
      }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.userId,
          token: hashRefreshToken(nextRefreshToken),
          expiresAt: getRefreshTokenExpiration(),
        },
      }),
    ]);

    const response = NextResponse.json({ accessToken });

    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, nextRefreshToken, refreshTokenCookieOptions);

    return response;
  } catch (error) {
    console.error('Refresh token rotation failed:', error);

    return NextResponse.json({ message: 'Unable to refresh authentication.' }, { status: 500 });
  }
}
