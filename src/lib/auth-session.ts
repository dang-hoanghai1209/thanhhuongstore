import { createHash } from 'crypto';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '@/lib/auth-cookies';

export { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME };

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const secure = process.env.NODE_ENV === 'production';

export const accessTokenCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: 'strict',
  secure,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
};

export const refreshTokenCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: 'strict',
  secure,
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
};

export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiration() {
  return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);
}
