import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

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
import { registerSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const payload = registerSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid registration data.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password, phone, firstName, lastName } = payload.data;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        phone: phone || null,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashRefreshToken(refreshToken),
        expiresAt: getRefreshTokenExpiration(),
      },
    });

    const response = NextResponse.json({ accessToken, user }, { status: 201 });

    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);

    return response;
  } catch (error) {
    console.error('Registration failed:', error);

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to register.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
