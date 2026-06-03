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

type FacebookTokenResponse = {
  access_token?: string;
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};

type FacebookUserInfo = {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type VerifiedFacebookUserInfo = FacebookUserInfo & {
  id: string;
  email: string;
};

async function exchangeFacebookCode(code: string) {
  const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');

  tokenUrl.searchParams.set('client_id', getRequiredOAuthEnv('FACEBOOK_CLIENT_ID'));
  tokenUrl.searchParams.set('client_secret', getRequiredOAuthEnv('FACEBOOK_CLIENT_SECRET'));
  tokenUrl.searchParams.set('redirect_uri', getRequiredOAuthEnv('FACEBOOK_REDIRECT_URI'));
  tokenUrl.searchParams.set('code', code);

  const response = await fetch(tokenUrl);
  const payload = (await response.json()) as FacebookTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error?.type || 'FACEBOOK_TOKEN_EXCHANGE_FAILED');
  }

  return payload.access_token;
}

async function fetchFacebookUserInfo(accessToken: string): Promise<VerifiedFacebookUserInfo> {
  const userUrl = new URL('https://graph.facebook.com/v19.0/me');

  userUrl.searchParams.set('fields', 'id,name,first_name,last_name,email');

  const response = await fetch(userUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const profile = (await response.json()) as FacebookUserInfo;

  if (!response.ok || !profile.id) {
    throw new Error('FACEBOOK_USERINFO_FAILED');
  }

  if (!profile.email) {
    throw new Error('FACEBOOK_EMAIL_REQUIRED');
  }

  return {
    ...profile,
    id: profile.id,
    email: profile.email,
  };
}

export async function GET(request: NextRequest) {
  const responseWithClearedState = (response: NextResponse) => {
    response.cookies.set(getOAuthStateCookieName('facebook'), '', clearOAuthStateCookieOptions);
    return response;
  };

  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const providerError = request.nextUrl.searchParams.get('error');

    if (providerError) {
      return responseWithClearedState(createOAuthFailureRedirect(request, providerError));
    }

    if (!code || !verifyOAuthState(request, 'facebook', state)) {
      return responseWithClearedState(createOAuthFailureRedirect(request, 'invalid_oauth_state'));
    }

    const accessToken = await exchangeFacebookCode(code);
    const profile = await fetchFacebookUserInfo(accessToken);
    const user = await findOrCreateOAuthUser({
      provider: 'facebook',
      providerAccountId: profile.id,
      email: profile.email,
      name: profile.name ?? null,
      firstName: profile.first_name ?? null,
      lastName: profile.last_name ?? null,
      emailVerified: null,
    });
    const response = NextResponse.redirect(getOAuthSuccessRedirectUrl(request));

    await setJwtAuthCookies(response, user);

    return responseWithClearedState(response);
  } catch (error) {
    const errorCode = error instanceof Error && error.message === 'FACEBOOK_EMAIL_REQUIRED'
      ? 'facebook_email_required'
      : 'facebook_oauth_failed';

    console.error('Facebook OAuth callback failed:', error instanceof Error ? error.message : error);

    return responseWithClearedState(createOAuthFailureRedirect(request, errorCode));
  }
}
