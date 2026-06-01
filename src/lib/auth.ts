import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-access-token-secret-must-be-very-long-and-random-64-characters';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-token-secret-must-be-very-long-and-random-64-characters';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function generateAccessToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role } as AuthPayload,
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role } as AuthPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Validates the request auth header or cookies.
 * Returns the AuthPayload (user info) if valid, or a NextResponse (401) on failure.
 */
export async function requireAuth(req: NextRequest): Promise<AuthPayload | NextResponse> {
  const authHeader = req.headers.get('Authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Check fallback cookie
    const tokenCookie = req.cookies.get('access_token');
    if (tokenCookie) {
      token = tokenCookie.value;
    }
  }

  if (!token) {
    return NextResponse.json({ error: 'Không tìm thấy mã xác thực (Unauthorized)' }, { status: 401 });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Mã xác thực không hợp lệ hoặc đã hết hạn' }, { status: 401 });
  }

  // Double check if user is still active in DB
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isActive: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Tài khoản đã bị khóa hoặc không tồn tại' }, { status: 401 });
  }

  return payload;
}

/**
 * Validates request authorization and asserts the user role is ADMIN.
 * Returns AuthPayload if admin, or NextResponse (401/403) on failure.
 */
export async function requireAdmin(req: NextRequest): Promise<AuthPayload | NextResponse> {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Không có quyền truy cập (Forbidden)' }, { status: 403 });
  }

  return authResult;
}
