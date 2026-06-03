import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  getRefreshTokenExpiration,
  hashRefreshToken,
  refreshTokenCookieOptions,
} from '@/lib/auth-session';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const payload = loginSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const email = payload.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        name: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user?.passwordHash || !user.isActive) {
      return NextResponse.json({ message: 'Email or password is incorrect.' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(payload.data.password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ message: 'Email or password is incorrect.' }, { status: 401 });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashRefreshToken(refreshToken),
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    const response = NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);

    return response;
  } catch (error) {
    console.error('Login failed:', error);

    return NextResponse.json({ message: 'Unable to sign in.' }, { status: 500 });
  }
}
