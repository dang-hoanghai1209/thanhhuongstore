import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth-cookies';
import {
  AuthPayload,
  AuthRole,
  getAccessTokenSecret,
  getRefreshTokenSecret,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/jwt';

export { verifyAccessToken, verifyRefreshToken };
export type { AuthPayload };

interface TokenUser {
  id: string;
  email: string | null;
  role: AuthRole;
}

function createPayload(user: TokenUser, tokenType: 'access' | 'refresh') {
  if (!user.email) {
    throw new Error('Cannot issue a JWT for a user without an email address.');
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenType,
  };
}

export function generateAccessToken(user: TokenUser): string {
  return jwt.sign(createPayload(user, 'access'), getAccessTokenSecret(), {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(user: TokenUser): string {
  return jwt.sign(createPayload(user, 'refresh'), getRefreshTokenSecret(), {
    expiresIn: '7d',
  });
}

function getRequestAccessToken(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return req.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
}

async function authenticateToken(token: string): Promise<AuthPayload | NextResponse> {
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Authentication token is invalid or expired.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isActive: true, role: true },
  });

  if (!user?.isActive) {
    return NextResponse.json({ error: 'User account is missing or inactive.' }, { status: 401 });
  }

  if (user.role !== payload.role) {
    return NextResponse.json({ error: 'Authentication token role is stale.' }, { status: 401 });
  }

  return payload;
}

export async function optionalAuth(req: NextRequest): Promise<AuthPayload | NextResponse | null> {
  const token = getRequestAccessToken(req);

  return token ? authenticateToken(token) : null;
}

export async function requireAuth(req: NextRequest): Promise<AuthPayload | NextResponse> {
  const authResult = await optionalAuth(req);

  if (!authResult) {
    return NextResponse.json({ error: 'Authentication token is required.' }, { status: 401 });
  }

  return authResult;
}

export async function requireAdmin(req: NextRequest): Promise<AuthPayload | NextResponse> {
  const authResult = await requireAuth(req);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 });
  }

  return authResult;
}
