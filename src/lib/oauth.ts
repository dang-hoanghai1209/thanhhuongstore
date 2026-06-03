import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  getRefreshTokenExpiration,
  hashRefreshToken,
  refreshTokenCookieOptions,
} from '@/lib/auth-session';
import prisma from '@/lib/prisma';

export type OAuthProvider = 'google' | 'facebook';

export type OAuthUserProfile = {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
};

const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;
const secure = process.env.NODE_ENV === 'production';

export const oauthStateCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: 'lax',
  secure,
  path: '/api/auth',
  maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
};

export const clearOAuthStateCookieOptions: Partial<ResponseCookie> = {
  ...oauthStateCookieOptions,
  maxAge: 0,
};

export function getOAuthStateCookieName(provider: OAuthProvider) {
  return `oauth_state_${provider}`;
}

export function createOAuthState() {
  return randomBytes(32).toString('base64url');
}

export function getRequiredOAuthEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

export function getOAuthSuccessRedirectUrl(request: NextRequest) {
  return process.env.OAUTH_SUCCESS_REDIRECT_URL?.trim() || new URL('/account', request.url).toString();
}

export function createOAuthFailureRedirect(request: NextRequest, error: string) {
  const fallbackUrl = new URL('/login', request.url).toString();
  const redirectUrl = new URL(process.env.OAUTH_FAILURE_REDIRECT_URL?.trim() || fallbackUrl);

  redirectUrl.searchParams.set('error', error);

  return NextResponse.redirect(redirectUrl);
}

export function verifyOAuthState(request: NextRequest, provider: OAuthProvider, state: string | null) {
  const cookieState = request.cookies.get(getOAuthStateCookieName(provider))?.value;

  return Boolean(state && cookieState && state === cookieState);
}

export async function findOrCreateOAuthUser(profile: OAuthUserProfile) {
  const email = profile.email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    const existingAccount = await tx.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
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

    if (existingAccount) {
      if (!existingAccount.user.isActive || !existingAccount.user.email) {
        throw new Error('OAUTH_USER_INACTIVE');
      }

      return existingAccount.user;
    }

    const existingUser = await tx.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (existingUser) {
      if (!existingUser.isActive || !existingUser.email) {
        throw new Error('OAUTH_USER_INACTIVE');
      }

      await tx.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
          email,
        },
      });

      return existingUser;
    }

    const createdUser = await tx.user.create({
      data: {
        email,
        name: profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || email,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        image: profile.image || null,
        emailVerified: profile.emailVerified ?? null,
        role: 'CUSTOMER',
        isActive: true,
        oauthAccounts: {
          create: {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
            email,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!createdUser.email) {
      throw new Error('OAUTH_EMAIL_REQUIRED');
    }

    return createdUser;
  });
}

export async function setJwtAuthCookies(response: NextResponse, user: { id: string; email: string | null; role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN' }) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashRefreshToken(refreshToken),
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);
}
