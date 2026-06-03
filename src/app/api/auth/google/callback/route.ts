import { NextRequest, NextResponse } from 'next/server';

import {
  clearOAuthStateCookieOptions,
  createOAuthFailureRedirect,
  findOrCreateOAuthUser,
  getOAuthStateCookieName,
  getOAuthSuccessRedirectUrl,
  getRequiredOAuthEnv,
  setJwtAuthCookies,
  verifyOAuthState,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

type VerifiedGoogleUserInfo = GoogleUserInfo & {
  sub: string;
  email: string;
};

async function exchangeGoogleCode(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: getRequiredOAuthEnv('GOOGLE_CLIENT_ID'),
      client_secret: getRequiredOAuthEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: getRequiredOAuthEnv('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    }),
  });
  const payload = (await response.json()) as GoogleTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error || 'GOOGLE_TOKEN_EXCHANGE_FAILED');
  }

  return payload.access_token;
}

async function fetchGoogleUserInfo(accessToken: string): Promise<VerifiedGoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const profile = (await response.json()) as GoogleUserInfo;

  if (!response.ok || !profile.sub || !profile.email) {
    throw new Error('GOOGLE_USERINFO_FAILED');
  }

  if (profile.email_verified !== true) {
    throw new Error('GOOGLE_EMAIL_NOT_VERIFIED');
  }

  return {
    ...profile,
    sub: profile.sub,
    email: profile.email,
  };
}

export async function GET(request: NextRequest) {
  const responseWithClearedState = (response: NextResponse) => {
    response.cookies.set(getOAuthStateCookieName('google'), '', clearOAuthStateCookieOptions);
    return response;
  };

  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const providerError = request.nextUrl.searchParams.get('error');

    if (providerError) {
      return responseWithClearedState(createOAuthFailureRedirect(request, providerError));
    }

    if (!code || !verifyOAuthState(request, 'google', state)) {
      return responseWithClearedState(createOAuthFailureRedirect(request, 'invalid_oauth_state'));
    }

    const accessToken = await exchangeGoogleCode(code);
    const profile = await fetchGoogleUserInfo(accessToken);
    const user = await findOrCreateOAuthUser({
      provider: 'google',
      providerAccountId: profile.sub,
      email: profile.email,
      name: profile.name ?? null,
      firstName: profile.given_name ?? null,
      lastName: profile.family_name ?? null,
      image: profile.picture ?? null,
      emailVerified: new Date(),
    });
    const response = NextResponse.redirect(getOAuthSuccessRedirectUrl(request));

    await setJwtAuthCookies(response, user);

    return responseWithClearedState(response);
  } catch (error) {
    console.error('Google OAuth callback failed:', error instanceof Error ? error.message : error);

    return responseWithClearedState(createOAuthFailureRedirect(request, 'google_oauth_failed'));
  }
}
